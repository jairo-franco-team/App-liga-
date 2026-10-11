/* V929 — Global paint stabilization for multi-module routes.
   Hide only the screen content during a real route swap. Never remove layers,
   reorder cards, change the approved artwork or interrupt form interaction. */
(function(){
 'use strict';
 if(window.__LJR_VISUAL_STABILITY_V929__)return;
 window.__LJR_VISUAL_STABILITY_V929__=true;

 const html=document.documentElement;
 const where=()=>String(location.hash||'#/home');
 let target=where(),token=0,started=0,lastChange=0,staging=false;
 let quietTimer=0,hardTimer=0,animation=null;
 const MIN_MS=120,QUIET_MS=115,MAX_MS=720;

 function reducedMotion(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.body?.dataset.v1300Reduced==='true')return true;
  // The account preference can already be stored before its page applies the body flag.
  try{
   const account=window.LJR_V569_AUTH?.currentAccount?.()||null;
   const prefs=window.LJR_PROFILE_V1300?.readPrefs?.(account)||JSON.parse(localStorage.getItem('ljr-profile-prefs-v1300-'+String(account?.id||'guest'))||'{}');
   return prefs.reduceMotion===true;
  }catch(_){return false}
 }
 function stop(){
  if(!staging)return;
  staging=false;
  clearTimeout(quietTimer);clearTimeout(hardTimer);
  html.classList.remove('ljr-route-staging');
  const screen=document.getElementById('screen');
  const mobile=new URLSearchParams(location.search).get('mode')!=='desktop'&&matchMedia('(max-width: 760px)').matches;
  if(mobile&&!reducedMotion()&&screen?.animate){
   animation?.cancel();
   const from=window.LJR_NAVIGATION?.direction?.()==='back'?'-100%':'100%';
   // Independent translate survives legacy #screen transform:none!important scroll rules.
   animation=screen.animate([{translate:from+' 0'},{translate:'0 0'}],{duration:280,easing:'cubic-bezier(.22,.61,.36,1)'});
  }
 }
 function check(id){
  if(!staging||token!==id)return;
  if(where()!==target){
   begin(where());return;
  }
  const elapsed=performance.now()-started;
  if(elapsed>=MAX_MS||(
   elapsed>=MIN_MS && performance.now()-lastChange>=QUIET_MS
  )){
   stop();return;
  }
  clearTimeout(quietTimer);
  quietTimer=setTimeout(()=>check(id),Math.min(65,Math.max(15,MIN_MS-elapsed)));
 }
 function begin(next){
  const url=String(next||where());
  if(staging&&target===url)return;
  if(!staging&&target===url)return;
  animation?.cancel();
  target=url;
  started=lastChange=performance.now();
  staging=true;
  const id=++token;
  html.classList.add('ljr-route-staging');
  clearTimeout(quietTimer);clearTimeout(hardTimer);
  quietTimer=setTimeout(()=>check(id),MIN_MS);
  hardTimer=setTimeout(()=>{if(token===id)stop()},MAX_MS+30);
 }
 function changed(){
  if(!staging)return;
  lastChange=performance.now();
  const id=token;
  clearTimeout(quietTimer);
  quietTimer=setTimeout(()=>check(id),QUIET_MS);
 }
 function setup(){
  const screen=document.getElementById('screen');
  if(!screen)return;
  // Root swaps reveal legacy templates. Nested counters, media and animations
  // are intentionally ignored so an active view cannot be stuck hidden.
  new MutationObserver(changed).observe(screen,{childList:true});
 }
 addEventListener('hashchange',()=>begin(where()));
 addEventListener('popstate',()=>begin(where()));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
 else setup();
 window.LJR_VISUAL_STABILITY={begin,finish:stop};
})();