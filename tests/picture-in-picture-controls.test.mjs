import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/v1442-picture-in-picture.js',import.meta.url),'utf8')
 .split('let pagePiP=null')[0].replace(/^import[^\n]*\n/gm,'').replace(/^const nativePiP[^\n]*\n/gm,'').replaceAll('export ','');
function fixture({native=false,enabled=true}={}){
 const calls=[],document={pictureInPictureEnabled:enabled,pictureInPictureElement:null,exitPictureInPicture:async()=>{calls.push('exit');document.pictureInPictureElement=null;}},context=vm.createContext({
  Capacitor:{isNativePlatform:()=>native,getPlatform:()=>native?'android':'web'},
  nativePiP:{enter:async()=>calls.push('native')},document,Event,
  window:{dispatchEvent:event=>calls.push(event.type)}
 });vm.runInContext(source,context);
 const video={readyState:4,paused:true,disablePictureInPicture:false,
  // An unresolved play promise must not prevent the PiP gesture from being used.
  play:()=>{calls.push('play');return new Promise(()=>{});},
  requestPictureInPicture:async()=>{calls.push('pip');document.pictureInPictureElement=video;}
 };return {context,video,calls,document};
}
test('video PiP uses the click before awaiting play and toggles back to the page',async()=>{
 const f=fixture();await f.context.toggleVideoPiP(f.video);assert.deepEqual(f.calls,['play','pip']);
 await f.context.toggleVideoPiP(f.video);assert.deepEqual(f.calls,['play','pip','exit']);
});
test('an unloaded camera, restrictive policy or opted-out video cannot start PiP',async()=>{
 const f=fixture();f.video.readyState=0;await assert.rejects(f.context.toggleVideoPiP(f.video),/inicia la cámara/);assert.deepEqual(f.calls,[]);
 f.video.readyState=4;f.document.pictureInPictureEnabled=false;await assert.rejects(f.context.toggleVideoPiP(f.video),/no permite PiP/);assert.deepEqual(f.calls,[]);
 f.document.pictureInPictureEnabled=true;f.video.disablePictureInPicture=true;await assert.rejects(f.context.toggleVideoPiP(f.video),/no permite PiP/);assert.deepEqual(f.calls,[]);
});
test('Safari presentation mode toggles and Android keeps its native bridge',async()=>{
 const safari=fixture({enabled:false});delete safari.video.requestPictureInPicture;safari.video.paused=false;
 safari.video.webkitSupportsPresentationMode=mode=>mode==='picture-in-picture';
 safari.video.webkitSetPresentationMode=mode=>{safari.calls.push(mode);safari.video.webkitPresentationMode=mode;};
 await safari.context.toggleVideoPiP(safari.video);await safari.context.toggleVideoPiP(safari.video);assert.deepEqual(safari.calls,['picture-in-picture','inline']);
 const android=fixture({native:true,enabled:false});await android.context.toggleVideoPiP(android.video);assert.deepEqual(android.calls,['play','liga:prepare-pip','native']);
});
test('provider rejection is observable instead of silently claiming PiP succeeded',async()=>{
 const f=fixture();f.video.requestPictureInPicture=async()=>{throw new Error('Provider denied PiP');};
 await assert.rejects(f.context.toggleVideoPiP(f.video),/Provider denied/);
});
