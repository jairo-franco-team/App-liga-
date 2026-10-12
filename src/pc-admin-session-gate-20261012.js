/* Desktop browser only. Show CMS shortcuts exclusively for a restored, active
   LJR_MEDIA administrator object; never infer access from a stored token or CSS class.
   Does not affect the mobile site, PWA mobile view, or Capacitor APK. */
(()=>{
 'use strict';
 if(window.__LJPC_ADMIN_SHORTCUT_SESSION_20261012__)return;
 window.__LJPC_ADMIN_SHORTCUT_SESSION_20261012__=true;
 const root=document.documentElement;
 let scheduled=false;
 function desktop(){
   const mode=new URLSearchParams(location.search).get('mode')?.toLowerCase();
   return mode!=='mobile'&&mode!=='apk'&&root.classList.contains('ljpc-unified-pc')&&document.body?.classList.contains('lj-desktop');
 }
 function sync(){
   scheduled=false;
   const signedIn=desktop()&&Boolean(window.LJR_MEDIA?.admin);
   root.classList.toggle('ljpc-admin-auth',signedIn);
 }
 function schedule(){
   if(scheduled)return;
   scheduled=true;
   requestAnimationFrame(sync);
 }
 document.addEventListener('DOMContentLoaded',schedule,{once:true});
 window.addEventListener('liga:admin',schedule);
 document.addEventListener('liga:admin',schedule);
 window.addEventListener('hashchange',schedule);
 window.addEventListener('pageshow',schedule);
 window.addEventListener('focus',schedule);
 new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['class']});
 if(document.body)new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
 const screen=document.querySelector('#screen');
 if(screen)new MutationObserver(schedule).observe(screen,{childList:true});
 schedule();
})();
