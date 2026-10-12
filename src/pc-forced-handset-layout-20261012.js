/* Vista PC en telefono fisico. NO cambia ?mode=mobile, ?mode=apk ni PC real. */
(function(){
'use strict';
if(window.__LJPC_FORCED_HANDSET_FIX_20261012__)return;
window.__LJPC_FORCED_HANDSET_FIX_20261012__=true;
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const handset=()=>{
 const w=Math.min(Number(screen?.width)||9999,Number(screen?.height)||9999);
 return mode()==='desktop'&&w<=820&&((navigator.maxTouchPoints||0)>0);
};
const embeddedCSS=`
/* Se inyecta solo dentro del iframe PC, nunca en la aplicacion movil. */
html,body{min-width:0!important;max-width:100%!important;overflow-x:hidden!important}
#root,#root .ucl[data-name="page layout container"]{
 width:100%!important;min-width:0!important;max-width:100%!important;
 box-sizing:border-box!important;overflow-x:clip!important;
}
#root .ucl [data-name="hero and content section"]{
 width:100%!important;max-width:100%!important;min-width:0!important;
}
#root .ucl [data-name="stories list container"]{
 display:flex!important;align-items:center!important;gap:6px!important;
 width:100%!important;min-width:0!important;max-width:100%!important;
 margin:4px auto 7px!important;padding:5px 8px 8px!important;
 position:relative!important;inset:auto!important;transform:none!important;
 clear:both!important;overflow:hidden!important;z-index:2!important;
}
#root .ucl [data-name="stories wrapper"]{
 display:flex!important;min-width:0!important;max-width:100%!important;
 flex:1 1 auto!important;gap:9px!important;justify-content:flex-start!important;
 overflow-x:auto!important;overflow-y:hidden!important;
 scroll-snap-type:x proximity;touch-action:pan-x pan-y!important;
}
#root .ucl [data-name="stories wrapper"] > a{
 flex:0 0 74px!important;width:74px!important;min-width:74px!important;
 max-width:74px!important;margin:0!important;scroll-snap-align:start!important;
}
#root .ucl [data-name="story ring"]{
 width:54px!important;height:54px!important;max-width:54px!important;
 max-height:54px!important;overflow:hidden!important;border-radius:50%!important;
}
#root .ucl [data-name="stories list container"] > button{
 flex:0 0 25px!important;width:25px!important;min-width:25px!important;
 height:25px!important;min-height:25px!important;
}
#root .ucl [data-name="responsible gambling banner wrapper"]{
 margin:6px auto!important;width:100%!important;
}
#root .ucl [data-name="banner container"]{
 box-sizing:border-box!important;width:100%!important;max-width:100%!important;
 flex-wrap:wrap!important;gap:5px!important;
}
#root .ucl [data-name="hero section container"]{
 display:grid!important;grid-template-columns:minmax(0,1fr)!important;
 gap:8px!important;margin:8px auto!important;padding:5px 9px 12px!important;
 width:100%!important;min-width:0!important;max-width:100%!important;
}
#root .ucl [data-name="featured hero article card"]{
 display:block!important;min-width:0!important;width:100%!important;
 height:210px!important;min-height:210px!important;max-height:210px!important;
 overflow:hidden!important;
}
#root .ucl [data-name="featured hero article card"] img{
 display:block!important;width:100%!important;height:100%!important;
 max-height:210px!important;object-fit:cover!important;
}
#root .ucl [data-name="highlighted articles sidebar"]{
 min-width:0!important;width:100%!important;height:auto!important;
 min-height:0!important;max-height:260px!important;overflow:auto!important;
}
#root .ucl :is([data-name="featured news card"],[data-name^="moment card "]) img{
 max-width:100%!important;max-height:220px!important;object-fit:cover!important;
}
`;
function fixFrame(frame){
 if(!handset()||!frame?.contentDocument)return;
 try{
  const doc=frame.contentDocument;
  if(!doc.head||doc.getElementById('ljpc-handset-iframe-styles'))return;
  const view=doc.querySelector('meta[name="viewport"]')||doc.createElement('meta');
  view.setAttribute('name','viewport');
  view.setAttribute('content','width=device-width,initial-scale=1');
  if(!view.parentNode)doc.head.appendChild(view);
  const style=doc.createElement('style');
  style.id='ljpc-handset-iframe-styles';style.textContent=embeddedCSS;
  doc.head.appendChild(style);
  const inner=doc.defaultView;
  inner?.requestAnimationFrame?.(()=>inner.dispatchEvent(new inner.Event('resize')));
 }catch(_){/* La portada debe seguir operativa aun si iframe no permite acceso. */}
}
function sync(){
 const enabled=handset();
 document.documentElement.classList.toggle('ljpc-forced-handset',enabled);
 if(!enabled)return;
 // El modo PC del celular debe usar ancho real y evitar escala de 1024 px.
 const view=document.querySelector('meta[name="viewport"]');
 if(view)view.setAttribute('content','width=device-width,initial-scale=1');
 const frame=document.querySelector('#screen #ljpc-exact-html-home');
 if(frame){
  if(frame.dataset.ljpcHandsetObserved!=='1'){
   frame.dataset.ljpcHandsetObserved='1';
   frame.addEventListener('load',()=>fixFrame(frame));
  }
  fixFrame(frame);
 }
}
let queued=false;
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;sync()});
}
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
function start(){
 sync();
 const root=document.getElementById('screen');
 if(root&&handset()&&typeof MutationObserver!=='undefined')
  new MutationObserver(schedule).observe(root,{childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
