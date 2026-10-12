/* PC-only initial scroll guard. Avoid the gradual downward scroll/jump caused by
   loading desktop iframe images and browser history scroll restoration. Respect
   any user's pointer, wheel, keyboard or touch input. Mobile and APK untouched. */
(function(){
'use strict';
if(window.__LJPC_DESKTOP_COMPACT_SCROLL_20261011__)return;
window.__LJPC_DESKTOP_COMPACT_SCROLL_20261011__=true;
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const pc=()=>!['mobile','apk'].includes(mode())&&(mode()==='desktop'||innerWidth>=1024);
const home=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]==='home'||!location.hash;
let userInteracted=false;
let completed=false;
function noticeInput(){userInteracted=true}
for(const type of ['wheel','touchstart','pointerdown','keydown']){
 window.addEventListener(type,noticeInput,{passive:true,once:true});
}
function restoreTopOnce(){
 if(completed||!pc()||!home()||userInteracted)return;
 completed=true;
 // Don't animate or repeatedly fight the user's own scrolling.
 if(window.scrollY>0)window.scrollTo({top:0,behavior:'instant'});
}
function boot(){
 if(!pc()||!home())return;
 try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(_){}
 requestAnimationFrame(()=>requestAnimationFrame(restoreTopOnce));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.addEventListener('load',()=>{if(!completed&&pc()&&home())restoreTopOnce()},{once:true});
})();
