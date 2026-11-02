/* PC footer-only gap: keep footer below the real last card in every route.
   No visual or behavioral change in ?mode=mobile / ?mode=apk. */
(function(){
'use strict';
if(window.__LJPC_FOOTER_FLOW_20261012__)return;
window.__LJPC_FOOTER_FLOW_20261012__=true;
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const pc=()=>!['mobile','apk'].includes(mode())&&
  document.documentElement.classList.contains('ljpc-unified-pc')&&
  document.body?.classList.contains('lj-desktop');
let queued=false,watching=false,ro=null,observedBottom=null;

const MASTER_LOCK_CSS=`
/* REA Master Lock: 100% identical UEFA Champions League header & geometry across ALL PC sections */
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header{
  display:block!important;visibility:visible!important;opacity:1!important;
  width:100%!important;max-width:none!important;background:#0a1061!important;z-index:1800!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header::before{
  content:"UEFA.com  ▾"!important;display:flex!important;align-items:center!important;
  justify-content:flex-start!important;height:36px!important;min-height:36px!important;
  padding:0 max(24px,calc((100% - 1392px)/2))!important;background:#000000!important;
  color:#ffffff!important;font:700 13px/1 Inter,system-ui,sans-serif!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-nav{
  background:linear-gradient(90deg,#0438f0 0%,#03229c 55%,#010e54 100%)!important;
  border-bottom:1px solid rgba(255,255,255,.12)!important;min-height:80px!important;height:80px!important;
  display:flex!important;align-items:center!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-nav > .ljpc-u-wrap{
  display:flex!important;flex-direction:row!important;align-items:center!important;
  justify-content:flex-start!important;width:min(1392px,calc(100% - 48px))!important;
  max-width:1392px!important;height:80px!important;min-height:80px!important;
  padding:0!important;margin:0 auto!important;gap:36px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-brand{
  display:inline-flex!important;align-items:center!important;gap:10px!important;
  flex:0 0 auto!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-brand img{
  width:46px!important;height:46px!important;min-width:46px!important;object-fit:contain!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-brand span{
  font:900 11px/1.06 Inter,system-ui,sans-serif!important;letter-spacing:.05em!important;color:#ffffff!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links{
  display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;
  align-items:center!important;justify-content:flex-start!important;flex:1 1 auto!important;
  gap:22px!important;min-width:0!important;overflow-x:auto!important;overflow-y:visible!important;
  scrollbar-width:none!important;padding:0 12px 0 0!important;margin:0!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links::-webkit-scrollbar{display:none!important}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > button,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > details{
  flex:0 0 auto!important;width:auto!important;max-width:none!important;margin:0!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > button,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > details > summary{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  gap:6px!important;width:auto!important;height:36px!important;min-height:36px!important;
  padding:0 18px!important;border-radius:9999px!important;border:0!important;
  background:transparent!important;color:#ffffff!important;
  font:600 15px/1.1 Inter,system-ui,sans-serif!important;white-space:nowrap!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > button:hover,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > details > summary:hover{
  background:rgba(255,255,255,.14)!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > button.active,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > details > summary.active{
  background:#00e5ff!important;color:#040836!important;font-weight:750!important;
  height:36px!important;min-height:36px!important;padding:0 20px!important;border-radius:9999px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-login{
  position:absolute!important;top:0!important;right:max(24px,calc((100% - 1392px)/2))!important;
  height:36px!important;min-height:36px!important;padding:0 6px!important;
  border:0!important;background:transparent!important;color:#ffffff!important;
  font:600 13px/1 Inter,system-ui,sans-serif!important;display:inline-flex!important;
  align-items:center!important;gap:6px!important;z-index:1810!important;
}
html.ljpc-unified-pc body.lj-desktop:not([data-app-route="home"]) #ljpc-unified-pc-header .ljpc-u-scorebar,
html.ljpc18-active body.lj-desktop #ljpc-unified-pc-header .ljpc-u-scorebar{
  display:none!important;
}
html.ljpc18-active[data-ljpc18-route="pc-fixtures"] body.lj-desktop #screen .u18fx-utility,
html.ljpc18-active[data-ljpc18-route="pc-fixtures"] body.lj-desktop #screen .u18fx-nav{
  display:none!important;
}
/* All sections unified UEFA 1392px geometry: Gaming, Datos, Más, Historia, Equipos, Noticias, TV, Momentos */
html.ljpc-unified-pc body.lj-desktop #screen :is(.u18-bound,.ds-wrap,.ljpc-mas-uefa){
  width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;margin-inline:auto!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-pagehead{
  background:linear-gradient(90deg,#0438f0 0%,#03229c 55%,#010e54 100%)!important;
  color:#ffffff!important;padding:24px 0 26px!important;border-bottom:1px solid rgba(0,229,255,.22)!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-pagehead .eyebrow{
  color:#00e5ff!important;font:800 11px/1.2 Inter,sans-serif!important;letter-spacing:.12em!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-pagehead h1{
  color:#ffffff!important;font:800 clamp(26px,2.8vw,36px)/1.12 Inter,sans-serif!important;margin:4px 0 6px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-pagehead p{
  color:rgba(255,255,255,.84)!important;font:500 13.5px/1.4 Inter,sans-serif!important;margin:0!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-game-panel,
html.ljpc-unified-pc body.lj-desktop #screen .ds-card{
  border-radius:14px!important;border:1px solid rgba(0,229,255,.22)!important;
  box-shadow:0 10px 28px rgba(4,10,45,.18)!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-game-actions button{
  background:#00e5ff!important;color:#040836!important;font-weight:800!important;
  border-radius:8px!important;min-height:38px!important;padding:0 18px!important;border:0!important;
}
`;

const IFRAME_HOME_UEFA_CSS=`
/* REA Home Iframe Lock: preserve 2-column UEFA Hero, 84px Story rings, and 4-column Bento on desktop mode */
@media(min-width:700px){
  html.ljpc-embedded-home #root .ucl [data-name="stories wrapper"] > a{
    flex:0 0 88px!important;width:88px!important;min-width:88px!important;max-width:88px!important;
  }
  html.ljpc-embedded-home #root .ucl [data-name="story ring"]{
    width:78px!important;height:78px!important;min-width:78px!important;min-height:78px!important;
    max-width:78px!important;max-height:78px!important;
  }
  html.ljpc-embedded-home #root .ucl [data-name="hero section container"]{
    display:grid!important;grid-template-columns:minmax(0,2fr) minmax(280px,1fr)!important;
    gap:20px!important;width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;
    margin:10px auto!important;padding:8px 0 16px!important;
  }
  html.ljpc-embedded-home #root .ucl [data-name="featured hero article card"]{
    height:420px!important;min-height:420px!important;max-height:420px!important;border-radius:14px!important;
  }
  html.ljpc-embedded-home #root .ucl [data-name="featured hero article card"] img{
    height:100%!important;max-height:420px!important;object-fit:cover!important;
  }
}
`;

function ensureMasterLock(){
 if(!pc()){
   document.getElementById('ljpc-rea-uefa-master-lock')?.remove();
   return;
 }
 let style=document.getElementById('ljpc-rea-uefa-master-lock');
 if(!style){
   style=document.createElement('style');
   style.id='ljpc-rea-uefa-master-lock';
   style.textContent=MASTER_LOCK_CSS;
   document.head?.appendChild(style);
 }else if(style!==document.head?.lastElementChild){
   document.head?.appendChild(style);
 }
 const frame=document.getElementById('ljpc-exact-html-home');
 try{
   const doc=frame?.contentDocument;
   if(doc?.head&&!doc.getElementById('ljpc-rea-iframe-home-lock')){
     const s=doc.createElement('style');
     s.id='ljpc-rea-iframe-home-lock';
     s.textContent=IFRAME_HOME_UEFA_CSS;
     doc.head.appendChild(s);
   }
 }catch(_){}
}

/* Footer is a sibling AFTER all content, not a height spacer. The previous
   clearance calculation read absolute-positioned panels and created 5000px gaps. */
function adjust(){
 ensureMasterLock();
 const footer=document.getElementById('ljpc-unified-pc-footer');
 if(!pc()){if(footer)footer.style.removeProperty('--ljpc-footer-clearance');return}
 const screen=document.getElementById('screen');
 if(!footer||!screen)return;
 // Do not increase the footer margin for detached/hidden cards. Always keep
 // a small natural separation after the final visible page section.
 footer.style.setProperty('--ljpc-footer-clearance','0px');
 if(footer.parentElement!==document.body||footer!==document.body.lastElementChild){
   document.body.appendChild(footer);
 }
}

function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;adjust()});
}
function start(){
 if(watching)return;watching=true;
 const screen=document.getElementById('screen');
 if(!screen)return;
 const observer=new MutationObserver(schedule);
 observer.observe(screen,{childList:true,subtree:false});
 if(typeof ResizeObserver!=='undefined'){
  ro=new ResizeObserver(schedule);
  ro.observe(screen);
  const app=document.getElementById('app');
  if(app)ro.observe(app);
  // A newly mounted last panel is re-observed by adjust() after the childList event.
 }
 window.addEventListener('resize',schedule);
 window.addEventListener('load',schedule);
 window.addEventListener('hashchange',schedule);
 document.addEventListener('load',e=>{if(e.target?.id==='ljpc-exact-html-home')schedule()},true);
 schedule();
 setTimeout(schedule,600);setTimeout(schedule,1800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
