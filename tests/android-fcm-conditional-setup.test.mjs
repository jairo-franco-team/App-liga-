import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {configureOptionalFirebase} from '../native/android/configure-fcm.mjs';

function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ljr-fcm-'));
 const android=path.join(root,'android'),app=path.join(android,'app');
 fs.mkdirSync(path.join(app,'src/main'),{recursive:true});
 fs.mkdirSync(path.join(root,'native/android'),{recursive:true});
 fs.writeFileSync(path.join(android,'build.gradle'),
   "buildscript { repositories { google() } dependencies { classpath 'com.android.tools.build:gradle:8.7.2' } }");
 fs.writeFileSync(path.join(app,'build.gradle'),
   "apply plugin: 'com.android.application'\nandroid { namespace 'mx.ligajuventino.app' }\ndependencies { implementation 'androidx.core:core:1.13.1' }");
 fs.writeFileSync(path.join(app,'src/main/AndroidManifest.xml'),
   '<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application android:label="Liga"></application></manifest>');
 fs.writeFileSync(path.join(root,'native/android/LigaFirebaseMessagingService.java'),
   'package mx.ligajuventino.app; public class LigaFirebaseMessagingService {}');
 const files=[
  'android/build.gradle',
  'android/app/build.gradle',
  'android/app/src/main/AndroidManifest.xml'];
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 return {root,read,files,clean:()=>fs.rmSync(root,{recursive:true,force:true})};
}
const fake=()=>({
 project_info:{project_number:'123456789012',project_id:'liga-jr-pruebas'},
 client:[{client_info:{mobilesdk_app_id:'1:123456789012:android:abcdef0123456789',
  android_client_info:{package_name:'mx.ligajuventino.app'}},
  api_key:[{current_key:'synthetic-key-only-for-unit-tests'}]}]
});
const encode=v=>Buffer.from(JSON.stringify(v)).toString('base64');

test('Sin configuración Firebase: no se modifica el proyecto Android ni se registra token',()=>{
 const f=fixture();try{
  const before=f.files.map(f.read);
  assert.deepEqual(configureOptionalFirebase({root:f.root}),{configured:false,autoRegistration:false});
  assert.deepEqual(f.files.map(f.read),before);
  assert.equal(fs.existsSync(path.join(f.root,'android/app/google-services.json')),false);
 }finally{f.clean()}
});

test('Firebase de otro paquete o JSON corrupto falla sin escribir ficheros',()=>{
 const f=fixture();try{
  const before=f.files.map(f.read);
  const wrong=fake();wrong.client[0].client_info.android_client_info.package_name='mx.otra.app';
  assert.throws(()=>configureOptionalFirebase({root:f.root,encoded:encode(wrong)}),/mx\.ligajuventino\.app/);
  assert.throws(()=>configureOptionalFirebase({root:f.root,encoded:'broken?'}),/Base64/);
  assert.deepEqual(f.files.map(f.read),before);
  assert.equal(fs.existsSync(path.join(f.root,'android/app/google-services.json')),false);
 }finally{f.clean()}
});

test('Firebase válido configura SDK y receptor pero deshabilita auto-registro',()=>{
 const f=fixture();try{
  const secret=encode(fake());
  assert.deepEqual(configureOptionalFirebase({root:f.root,encoded:secret}),
   {configured:true,autoRegistration:false});
  assert.match(f.read('android/build.gradle'),/google-services:4\.4\.4/);
  assert.match(f.read('android/app/build.gradle'),/firebase-bom:34\.11\.0/);
  assert.match(f.read('android/app/build.gradle'),/firebase-messaging/);
  assert.match(f.read('android/app/build.gradle'),/apply plugin: 'com\.google\.gms\.google-services'/);
  const manifest=f.read('android/app/src/main/AndroidManifest.xml');
  assert.match(manifest,/firebase_messaging_auto_init_enabled" android:value="false"/);
  assert.match(manifest,/firebase_analytics_collection_enabled" android:value="false"/);
  assert.match(manifest,/android:exported="false"/);
  assert.match(manifest,/com\.google\.firebase\.MESSAGING_EVENT/);
  assert.ok(fs.existsSync(path.join(f.root,'android/app/google-services.json')));
  assert.ok(fs.existsSync(path.join(f.root,'android/app/src/main/java/mx/ligajuventino/app/LigaFirebaseMessagingService.java')));
  configureOptionalFirebase({root:f.root,encoded:secret});
  assert.equal(f.read('android/build.gradle').split('com.google.gms:google-services:').length,2);
  assert.equal(f.read('android/app/build.gradle').split('com.google.firebase:firebase-messaging').length,2);
  assert.equal(manifest.includes('firebase_messaging_auto_init_enabled'),true);
 }finally{f.clean()}
});

test('Receptor de origen solo recibe avisos oficiales, no emite tokens ni tráfico',()=>{
 const source=fs.readFileSync(new URL('../native/android/LigaFirebaseMessagingService.java',import.meta.url),'utf8');
 assert.match(source,/FirebaseMessagingService/);
 assert.match(source,/"official"\.equals\(data\.get\("type"\)\)/);
 assert.match(source,/"notifications"\.equals\(data\.get\("route"\)\)/);
 assert.match(source,/POST_NOTIFICATIONS/);
 assert.match(source,/putExtra\("ljr_route", "notifications"\)/);
 assert.doesNotMatch(source,/Log\.|getToken\(|https?:\/\/|\.send\(|FirebaseMessaging\.getInstance/);
});
