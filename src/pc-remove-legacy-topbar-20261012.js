/* PC ONLY: detach the legacy mobile banner from DOM, rather than relying
   on CSS display rules overridden by v7-brand.css and later !important styles.
   Preserve the original header and restore it when desktop mode ends. */
(function(){
 'use strict';
 if(window.__LJPC_REMOVE_LEGACY_TOPBAR_OCT12__)return;
 window.__LJPC_REMOVE_LEGACY_TOPBAR_OCT12__=true;
 const MODE=()=>new URLSearchParams(location.search).get('mode')||'';
 const pc=()=>!['mobile','apk'].includes(MODE())&&(MODE()==='desktop'||innerWidth>=1024);
 let parked=null, queued=false;
 function sync(){
  const app=document.getElementById('app');
  if(!app)return;
  const enabled=pc();
  document.documentElement.classList.toggle('ljpc-no-legacy-topbar',enabled);
  if(!enabled){
   if(parked){
    const {node,next}=parked;
    if(!node.isConnected)app.insertBefore(node,next?.parentNode===app?next:app.querySelector(':scope > #screen'));
    parked=null;
   }
   return;
  }
  // Remove real markup so no CSS cascade, animated banner, or later style can
  // make it visible again. The desktop nav #ljpc-unified-pc-header is untouched.
  for(const node of app.querySelectorAll(':scope > header.topbar, :scope > .topbar')){
   if(!parked)parked={node,next:node.nextSibling};
   node.remove();
  }
 }
 function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;sync()});
 }
 function boot(){
  sync(); // Remove before the first visible frame where possible.
  const app=document.getElementById('app');
  if(app)new MutationObserver(records=>{
   if(records.some(r=>r.type==='childList'))schedule();
  }).observe(app,{childList:true});
 }
 window.addEventListener('hashchange',schedule);
 window.addEventListener('resize',schedule);
 window.addEventListener('pageshow',schedule);
 if(document.getElementById('app'))boot();
 else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();