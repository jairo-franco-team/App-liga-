/* PC-only legacy header mask: mobile and APK always retain their own bar. */
(function(){
 'use strict';
 if(window.__LJPC_REMOVE_LEGACY_TOPBAR_OCT12__)return;
 window.__LJPC_REMOVE_LEGACY_TOPBAR_OCT12__=true;
 const MODE=()=>new URLSearchParams(location.search).get('mode')||'';
 const pc=()=>!['mobile','apk'].includes(MODE())&&(MODE()==='desktop'||innerWidth>=1024);
 const original=new WeakMap();
 const find=()=>document.querySelector('#app > header.topbar, #app > .topbar');
 let observer=null,queued=false;
 function mask(){
  const el=find(),enabled=pc();
  document.documentElement.classList.toggle('ljpc-no-legacy-topbar',enabled);
  if(!el)return;
  if(!enabled){
   if(original.has(el)){
    const old=original.get(el);
    if(old.value)el.style.setProperty('display',old.value,old.priority);
    else el.style.removeProperty('display');
    original.delete(el);
   }
   return;
  }
  if(!original.has(el))original.set(el,{
   value:el.style.getPropertyValue('display'),
   priority:el.style.getPropertyPriority('display')
  });
  if(el.style.getPropertyValue('display')!=='none'||el.style.getPropertyPriority('display')!=='important')
   el.style.setProperty('display','none','important');
 }
 function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;mask();observeHeader()});
 }
 function observeHeader(){
  const el=find();
  if(!el)return;
  if(observer)observer.disconnect();
  observer=new MutationObserver(records=>{
   if(records.some(record=>record.attributeName==='style'||record.attributeName==='class'))schedule();
  });
  observer.observe(el,{attributes:true,attributeFilter:['style','class']});
 }
 function boot(){
  schedule();
  const app=document.getElementById('app');
  if(app)new MutationObserver(records=>{
   if(records.some(record=>record.type==='childList'))schedule();
  }).observe(app,{childList:true});
 }
 window.addEventListener('hashchange',schedule);
 window.addEventListener('resize',schedule);
 window.addEventListener('pageshow',schedule);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();
