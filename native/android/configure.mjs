import fs from 'node:fs';
import path from 'node:path';
const destination='android/app/src/main/java/mx/ligajuventino/app';
fs.mkdirSync(destination,{recursive:true});
for(const name of ['MainActivity.java','LigaPiPPlugin.java','LigaBiometricPlugin.java','LigaSpeechPlugin.java','LigaNotificationsPlugin.java','LigaCalendarPlugin.java','LigaInsetsPlugin.java']) fs.copyFileSync(path.join('native/android',name),path.join(destination,name));
// Preserve the original icon's artwork and color. A drawable backplate darkens
// only the unwanted white raster seam along its bottom edge, in every density.
const resources='android/app/src/main/res';
for(const folder of (fs.existsSync(resources)?fs.readdirSync(resources):[]).filter(name=>/^mipmap-/.test(name))){
  for(const name of ['ic_launcher','ic_launcher_round','ic_launcher_foreground']){
    const png=path.join(resources,folder,name+'.png');if(!fs.existsSync(png))continue;
    const drawable=path.join(resources,folder.replace('mipmap-','drawable-'));
    fs.mkdirSync(drawable,{recursive:true});
    fs.copyFileSync(png,path.join(drawable,'ljr_original_'+name+'.png'));
    fs.unlinkSync(png);
    fs.writeFileSync(path.join(resources,folder,name+'.xml'),
      '<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android"><item><bitmap android:src="@drawable/ljr_original_'+name+'" android:gravity="fill" /></item><item android:height="1dp" android:gravity="bottom"><shape><solid android:color="#02065F" /></shape></item></layer-list>\n');
  }
}
const manifest='android/app/src/main/AndroidManifest.xml';
let xml=fs.readFileSync(manifest,'utf8');
xml=xml.replace(/<activity\b[^>]*android:name="\.MainActivity"[^>]*>/,tag=>tag.includes('android:supportsPictureInPicture')?tag:tag.replace('<activity','<activity android:supportsPictureInPicture="true" android:resizeableActivity="true"'));
for(const permission of ['CAMERA','RECORD_AUDIO','MODIFY_AUDIO_SETTINGS','USE_BIOMETRIC','USE_FINGERPRINT','POST_NOTIFICATIONS','READ_CALENDAR','WRITE_CALENDAR']){
 if(!xml.includes('android.permission.'+permission))xml=xml.replace('</manifest>','    <uses-permission android:name="android.permission.'+permission+'" />\n</manifest>');
}
if(!xml.includes('android.speech.RecognitionService'))xml=xml.replace('</manifest>','<queries><intent><action android:name="android.speech.RecognitionService" /></intent></queries></manifest>');
if(!xml.includes('android.intent.action.TTS_SERVICE'))xml=xml.replace('</queries>','<intent><action android:name="android.intent.action.TTS_SERVICE" /></intent></queries>');
// Capacitor checks resolveActivity before launching the capture intent. Android
// package visibility must allow those checks as well as the camera permission.
for(const action of ['android.media.action.VIDEO_CAPTURE','android.media.action.IMAGE_CAPTURE']){
  if(!xml.includes(action))xml=xml.replace('</queries>','<intent><action android:name="'+action+'" /></intent></queries>');
}
if(!xml.includes('vnd.android.cursor.item/event'))xml=xml.replace('</queries>','<intent><action android:name="android.intent.action.INSERT" /><data android:mimeType="vnd.android.cursor.item/event" /></intent></queries>');
if(!xml.includes('<package android:name="com.google.android.calendar"'))xml=xml.replace('</queries>','<package android:name="com.google.android.calendar" /></queries>');
fs.writeFileSync(manifest,xml);

const gradle='android/app/build.gradle';
let gradleText=fs.readFileSync(gradle,'utf8');
if(!gradleText.includes('androidx.biometric:biometric')){
  gradleText=gradleText.replace(/dependencies\s*\{/,match=>match+'\n    implementation "androidx.biometric:biometric:1.1.0"');
  fs.writeFileSync(gradle,gradleText);
}


/* Keep every generated APK installable as an update and expose the current web build
   as the Android version name. GitHub Actions supplies a monotonically increasing
   run number; local builds fall back to a date-based value. */
const indexPath='index.html';
let appBuild='liga-juventino';
try{
  const html=fs.readFileSync(indexPath,'utf8');
  const match=html.match(/<meta\s+name=["']app-build["']\s+content=["']([^"']+)["']/i);
  if(match?.[1])appBuild=match[1].trim();
}catch(_){}
const fallbackCode=Number(new Date().toISOString().slice(2,10).replace(/-/g,''))||1;
const requestedCode=Number(process.env.LJR_VERSION_CODE||fallbackCode);
const versionCode=Number.isInteger(requestedCode)&&requestedCode>0?Math.min(requestedCode,2147483647):fallbackCode;
const versionName=String(process.env.LJR_VERSION_NAME||appBuild||'liga-juventino')
  .replace(/["\\\r\n]/g,'-')
  .slice(0,100);
gradleText=gradleText
  .replace(/\bversionCode\s+\d+/, 'versionCode '+versionCode)
  .replace(/\bversionName\s+["'][^"']*["']/, 'versionName "'+versionName+'"');
fs.writeFileSync(gradle,gradleText);
