/* Visible PiP access for playback, local live video and embedded broadcasts.
   Keep the original video, source, listeners and specialized player controls. */
import {Capacitor,registerPlugin} from '@capacitor/core';
import {trackNativePiP} from './v560-stream-player-controls.js';
const nativePiP=registerPlugin('LigaPiP');
const unsupported='Este navegador no permite PiP. Prueba en Chrome o Safari con un video compatible.';
export function supportsVideoPiP(video){
 return !video.disablePictureInPicture&&(
  (Capacitor.isNativePlatform()&&Capacitor.getPlatform()==='android')||
  (document.pictureInPictureEnabled&&typeof video.requestPictureInPicture==='function')||
  (typeof video.webkitSetPresentationMode==='function'&&video.webkitSupportsPresentationMode?.('picture-in-picture')));
}
export async function toggleVideoPiP(video){
 if(document.pictureInPictureElement===video){await document.exitPictureInPicture();return;}
 if(video.webkitPresentationMode==='picture-in-picture'){video.webkitSetPresentationMode('inline');return;}
 if(!supportsVideoPiP(video))throw Error(unsupported);
 if(video.readyState===0)throw Error('Primero carga el video o inicia la cámara y transmisión.');
 // Request PiP in this click, before any awaited playback promise.
 if(video.paused)video.play().catch(()=>{});
 if(Capacitor.isNativePlatform()&&Capacitor.getPlatform()==='android'){
  window.dispatchEvent(new Event('liga:prepare-pip'));await nativePiP.enter();
 }else if(document.pictureInPictureEnabled&&video.requestPictureInPicture)await video.requestPictureInPicture();
 else video.webkitSetPresentationMode('picture-in-picture');
}
let pagePiP=null,opening=false;
export async function togglePagePiP(player){
 if(pagePiP){pagePiP.close();return;}
 if(opening)return;
 if(!window.documentPictureInPicture?.requestWindow)throw Error('PiP de página no está disponible en este navegador.');
 if(!player?.isConnected)throw Error('Abre un reproductor antes de activar PiP.');
 opening=true;
 try{
  const pip=await window.documentPictureInPicture.requestWindow({width:420,height:280});
  // The route may have closed while the browser was opening the window.
  if(!player.isConnected){pip.close();return;}
  pagePiP=pip;
  const marker=document.createComment('Original PiP position');player.before(marker);
  for(const source of document.querySelectorAll('link[rel="stylesheet"],style')){
   const copy=source.cloneNode(true);if(source.tagName==='LINK')copy.href=source.href;pip.document.head.append(copy);
  }
  const style=pip.document.createElement('style');style.textContent='html,body{margin:0!important;padding:0!important;background:#000040!important;color:#fff!important;width:100%;height:100%;overflow:hidden}.ljr-page-pip-player{width:100%!important;height:100%!important;max-height:none!important;margin:0!important;border:0!important;border-radius:0!important;aspect-ratio:auto!important}.ljr-page-pip-player>video,.ljr-page-pip-player>iframe{width:100%!important;height:100%!important;max-height:none!important;object-fit:contain!important;border:0}';pip.document.head.append(style);
  player.classList.add('ljr-page-pip-player');pip.document.body.append(player);
  const observer=new MutationObserver(()=>{if(!marker.isConnected)pip.close();});observer.observe(document.body,{childList:true,subtree:true});
  pip.addEventListener('pagehide',()=>{
   observer.disconnect();player.classList.remove('ljr-page-pip-player');
   if(marker.isConnected)marker.replaceWith(player);else player.remove();
   if(pagePiP===pip)pagePiP=null;
  },{once:true});
 }finally{opening=false;}
}
window.LJR_PIP={toggleVideo:toggleVideoPiP,togglePage:togglePagePiP};
const bound=new WeakMap();
function icon(){return window.LJR_ICONS?.svg('pip')||'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 4h20v16H2V4Zm2 2v12h16V6H4Zm8 5h7v6h-7z"/></svg>';}
function enhance(video){
 if(video.closest('[data-ljr-decorative],.v105-motion,.v15-decor,.v73-home-motion,.v806-camera,.v156-camera-frame'))return;
 if(video.matches('[aria-hidden="true"],[data-ljr-decorative]'))return;
 const player=video.closest('.ljr-video-player,.v196-frame,.v144-stream-frame')||video.parentElement;
 if(!player||(!video.controls&&!video.dataset.v777Controls&&!video.dataset.v977Controls&&!video.closest('.v196-frame,.liga-media-watch,.liga-stories')))return;
 const previous=bound.get(video);if(previous?.player===player)return;
 previous?.controller.abort();previous?.status.remove();previous?.fallback?.remove();
 const controller=new AbortController(),record={player,controller};bound.set(video,record);trackNativePiP(video);
 let button=player.querySelector('[data-v777-action="pip"],[data-v977-action="pip"],[data-action="pip"]');
 if(!button){button=document.createElement('button');button.type='button';button.className='ljr-pip-access';button.innerHTML=icon()+'<span>Modo PiP</span>';video.after(button);record.fallback=button;}
 button.classList.add('ljr-pip-button');button.title='Modo PiP · video en ventana flotante';button.setAttribute('aria-label','Modo PiP · video en ventana flotante');
 const status=document.createElement('small');status.className='ljr-pip-status';status.setAttribute('role','status');status.hidden=true;player.append(status);record.status=status;
 const update=()=>{button.disabled=video.readyState===0||!supportsVideoPiP(video);button.title=video.readyState===0?'Primero carga el video o inicia la transmisión':supportsVideoPiP(video)?'Modo PiP · video en ventana flotante':unsupported;button.setAttribute('aria-pressed',String(document.pictureInPictureElement===video||video.webkitPresentationMode==='picture-in-picture'));};
 button.addEventListener('click',async event=>{
  event.preventDefault();event.stopImmediatePropagation();status.hidden=true;
  try{await toggleVideoPiP(video);}catch(error){status.textContent=error.message||'No se pudo abrir PiP. Revisa los permisos del reproductor.';status.hidden=false;}update();
 },{capture:true,signal:controller.signal});
 for(const event of ['loadedmetadata','emptied','enterpictureinpicture','leavepictureinpicture','webkitpresentationmodechanged'])video.addEventListener(event,update,{signal:controller.signal});
 if(window.documentPictureInPicture?.requestWindow)addPageButton(player,button);
 update();
}
function addPageButton(player,near){
 if(player.querySelector('[data-ljr-page-pip]'))return;
 const button=document.createElement('button');button.type='button';button.dataset.ljrPagePip='';button.className='ljr-pip-button ljr-page-pip-button';button.title='PiP de página · conservar los controles';button.setAttribute('aria-label',button.title);button.innerHTML=icon();near.after(button);
 button.addEventListener('click',async event=>{event.preventDefault();event.stopPropagation();try{await togglePagePiP(player);}catch(error){window.LJR_CMS?.toast?.(error.message);button.title=error.message;} });
}
let queued=false;
function scan(){queued=false;document.querySelectorAll('video').forEach(enhance);
 if(window.documentPictureInPicture?.requestWindow)document.querySelectorAll('.v196-frame:has(iframe)').forEach(frame=>{const button=frame.querySelector('[data-action="pip"]');if(button)addPageButton(frame,button);});
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(scan);}}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});scan();
