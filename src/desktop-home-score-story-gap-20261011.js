/* Liga Juventino Rosas · Inicio PC only.
   Remove measured empty space between the official fixture bar and circles.
   No fixed-position carousel, no changes to matches, controls, mobile or APK. */
(function(){
 'use strict';
 if(window.__LJPC_SCORE_STORY_GAP_20261011__)return;
 window.__LJPC_SCORE_STORY_GAP_20261011__=true;
 const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
 const desktop=()=>{
   const mode=new URLSearchParams(location.search).get('mode');
   return mode!=='mobile'&&mode!=='apk'&&
    (mode==='desktop'||window.innerWidth>=1024)&&
    document.documentElement.classList.contains('ljpc-unified-pc')&&
    document.body.classList.contains('lj-desktop')&&route()==='home';
 };
 let frame=null,screen=null,stories=null;
 let queued=false;
 const limit=(v)=>Math.max(-240,Math.min(0,v));
 function restore(){
   if(screen?.dataset.ljpcTrimOuter){
     screen.style.removeProperty('margin-top');
     delete screen.dataset.ljpcTrimOuter;
   }
   if(stories?.dataset.ljpcTrimInner){
     stories.style.removeProperty('margin-top');
     delete stories.dataset.ljpcTrimInner;
   }
 }
 function measure(){
   queued=false;
   if(!desktop()){restore();return;}
   const main=document.getElementById('screen');
   const iframe=main?.querySelector('#ljpc-exact-html-home');
   const bar=document.querySelector('#ljpc-unified-pc-header .ljpc-u-scorebar');
   if(!main||!iframe||!bar)return;
   if(iframe!==frame){restore();frame=iframe;screen=main;stories=null;}
   const frameBox=iframe.getBoundingClientRect(),barBox=bar.getBoundingClientRect();
   if(!frameBox.width||!barBox.height)return;
   // A positive exterior gap is wasted layout, not padding needed for the games.
   const outerGap=Math.round(frameBox.top-barBox.bottom);
   if(outerGap>28&&outerGap<500){
     const prior=Number(main.dataset.ljpcTrimOuter||0);
     const next=limit(prior-(outerGap-10));
     if(next!==prior){
       main.style.setProperty('margin-top',next+'px','important');
       main.dataset.ljpcTrimOuter=String(next);
     }
   }
   let doc;
   try{doc=iframe.contentDocument}catch(_){return}
   const rail=doc?.querySelector('#root .ucl [data-name="stories list container"]');
   if(!rail)return;
   if(rail!==stories){stories=rail;}
   // If an old hidden iframe nav still reserves space, collapse just that
   // reserved area; move the rail and everything following in natural flow.
   const innerGap=Math.round(rail.getBoundingClientRect().top);
   if(innerGap>28&&innerGap<500){
     const prior=Number(rail.dataset.ljpcTrimInner||0);
     const next=limit(prior-(innerGap-10));
     if(next!==prior){
       rail.style.setProperty('margin-top',next+'px','important');
       rail.dataset.ljpcTrimInner=String(next);
       // Let the existing iframe ResizeObserver report the new actual height.
       iframe.contentWindow?.dispatchEvent(new Event('resize'));
     }
   }
 }
 function schedule(){
   if(queued)return;
   queued=true;
   requestAnimationFrame(measure);
 }
 function boot(){
   const main=document.getElementById('screen');
   if(main){
     new MutationObserver(schedule).observe(main,{childList:true,subtree:false});
     main.addEventListener('load',e=>{
       if(e.target?.id==='ljpc-exact-html-home')schedule();
     },true);
   }
   window.addEventListener('message',e=>{
     if(e.origin!==location.origin||!e.data?.ljpcExact)return;
     if(e.source!==document.getElementById('ljpc-exact-html-home')?.contentWindow)return;
     if(e.data.kind==='height'||e.data.kind==='ready')schedule();
   });
   window.addEventListener('hashchange',schedule);
   window.addEventListener('resize',schedule);
   schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();
