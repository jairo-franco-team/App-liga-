/* PC browser CMS entry authorization. Server API "me" must confirm active admin.
 No remembered client-side session flags grant shortcut visibility. Mobile/APK untouched. */
(()=>{'use strict';
if(window.__LJPC_ADMIN_SHORTCUT_SESSION_20261012__)return;
window.__LJPC_ADMIN_SHORTCUT_SESSION_20261012__=true;
const root=document.documentElement;
let scheduled=false,pending=false,verifiedUntil=0,retryAfter=0,generation=0;
const mode=()=>new URLSearchParams(location.search).get('mode')?.toLowerCase();
const desktop=()=>mode()!=='mobile'&&mode()!=='apk'&&root.classList.contains('ljpc-unified-pc')&&!window.Capacitor?.isNativePlatform?.();
const show=allowed=>root.classList.toggle('ljpc-admin-auth',Boolean(allowed&&desktop()));
async function check(){
 scheduled=false;
 if(!desktop()){generation++;verifiedUntil=0;show(false);return}
 const media=window.LJR_MEDIA;
 if(!media?.admin||typeof media?.api!=='function'){generation++;verifiedUntil=0;show(false);return}
 if(verifiedUntil>Date.now()){show(true);return}
 show(false);
 if(pending||retryAfter>Date.now())return;
 pending=true;const token=++generation;
 try{
  const result=await Promise.race([
   Promise.resolve().then(()=>media.api('me')),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),6000))
  ]);
  if(token===generation&&desktop()&&window.LJR_MEDIA?.admin&&result?.admin){
   verifiedUntil=Date.now()+18000;show(true);
  }else if(token===generation){verifiedUntil=0;show(false)}
 }catch(_){if(token===generation){verifiedUntil=0;show(false)}}
 finally{pending=false;retryAfter=Date.now()+4000}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(check)}
function reset(){verifiedUntil=0;retryAfter=0;schedule()}
document.addEventListener('DOMContentLoaded',schedule,{once:true});
window.addEventListener('liga:admin',reset);
document.addEventListener('liga:admin',reset);
window.addEventListener('hashchange',schedule);
window.addEventListener('pageshow',schedule);
window.addEventListener('focus',schedule);
new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['class']});
if(document.body)new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
schedule();
})();