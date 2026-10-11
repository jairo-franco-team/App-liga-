/* Configuración Firebase Android opcional. Ejecutar solo en el runner de CI,
 * nunca en GitHub Pages. Sin secreto válido no toca el proyecto Android.
 * El SDK se instala sin auto-init: no se generan tokens sin consentimiento.
 */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateAndroidFirebaseConfig} from '../../scripts/android-fcm-preflight.mjs';

const plugin="classpath 'com.google.gms:google-services:4.4.4'";
const bom="implementation platform('com.google.firebase:firebase-bom:34.11.0')";
const messaging="implementation 'com.google.firebase:firebase-messaging'";

export function configureOptionalFirebase({encoded='',root='.'}={}){
 const source=String(encoded||'').trim();
 if(!source)return {configured:false,autoRegistration:false};
 if(source.length>655360||!/^[A-Za-z0-9+/=\s]+$/.test(source))
  throw Error('Configuración Firebase Base64 inválida');
 let config;
 try{config=JSON.parse(Buffer.from(source,'base64').toString('utf8'))}
 catch{throw Error('Configuración Firebase JSON inválida')}
 validateAndroidFirebaseConfig(config);

 const android=path.join(root,'android');
 const app=path.join(android,'app');
 const rootGradle=path.join(android,'build.gradle');
 const appGradle=path.join(app,'build.gradle');
 const manifest=path.join(app,'src/main/AndroidManifest.xml');
 const gradleSource=fs.readFileSync(rootGradle,'utf8');
 const appSource=fs.readFileSync(appGradle,'utf8');
 const xmlSource=fs.readFileSync(manifest,'utf8');

 if(!/buildscript\s*\{/.test(gradleSource)||!/dependencies\s*\{/.test(gradleSource)||
    !/dependencies\s*\{/.test(appSource)||!/<\/application>/.test(xmlSource))
  throw Error('Estructura Android incompatible con Firebase: no modificar la compilación');

 let gradle=gradleSource;
 if(!gradle.includes('com.google.gms:google-services:')){
  gradle=gradle.replace(/(buildscript\s*\{[\s\S]*?dependencies\s*\{)/,
   '$1\n        '+plugin);
 }
 let appBuild=appSource;
 if(!appBuild.includes('com.google.firebase:firebase-bom:'))
  appBuild=appBuild.replace(/dependencies\s*\{/,'dependencies {\n    '+bom);
 if(!appBuild.includes('com.google.firebase:firebase-messaging'))
  appBuild=appBuild.replace(/dependencies\s*\{/,'dependencies {\n    '+messaging);
 if(!appBuild.includes("apply plugin: 'com.google.gms.google-services'"))
  appBuild+='\napply plugin: \'com.google.gms.google-services\'\n';

 let xml=xmlSource;
 if(!xml.includes('firebase_messaging_auto_init_enabled')){
  xml=xml.replace('</application>',`
    <!-- El alta de FCM requiere consentimiento explícito y API autenticada. -->
    <meta-data android:name="firebase_messaging_auto_init_enabled" android:value="false" />
    <meta-data android:name="firebase_analytics_collection_enabled" android:value="false" />
    <service android:name=".LigaFirebaseMessagingService" android:exported="false">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>
</application>`);
 }
 // Validar todas las transformaciones antes de escribir cualquier archivo.
 if(!gradle.includes(plugin)||!appBuild.includes(bom)||!appBuild.includes(messaging)||
    !appBuild.includes("apply plugin: 'com.google.gms.google-services'")||
    !xml.includes('android:value="false"')||!xml.includes('LigaFirebaseMessagingService'))
  throw Error('No se pudo preparar Firebase sin riesgos');
 const java=path.join(root,'native/android/LigaFirebaseMessagingService.java');
 const service=fs.readFileSync(java,'utf8');
 const javaDest=path.join(app,'src/main/java/mx/ligajuventino/app/LigaFirebaseMessagingService.java');
 fs.mkdirSync(path.dirname(javaDest),{recursive:true});
 fs.writeFileSync(rootGradle,gradle);
 fs.writeFileSync(appGradle,appBuild);
 fs.writeFileSync(manifest,xml);
 fs.writeFileSync(javaDest,service);
 fs.writeFileSync(path.join(app,'google-services.json'),JSON.stringify(config));
 return {configured:true,autoRegistration:false};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=configureOptionalFirebase({
  encoded:process.env.FIREBASE_ANDROID_CONFIG_B64||'',
  root:process.cwd()
 });
 console.log(result.configured
  ? 'SDK y receptor Firebase preparados sin alta automática de tokens; aún falta consentimiento, servidor y prueba real.'
  : 'Firebase no configurado: APK local sin dependencias FCM y sin cambios.');
}
