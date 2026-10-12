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
const clearance=(contentBottom,naturalFooterTop)=>Math.min(5000,Math.max(12,Math.ceil(contentBottom-naturalFooterTop+14)));
function adjust(){
 const footer=document.getElementById('ljpc-unified-pc-footer');
 if(!pc()){if(footer)footer.style.removeProperty('--ljpc-footer-clearance');return}
 const screen=document.getElementById('screen');
 if(!footer||!screen||footer.parentElement!==document.body)return;
 // The modern fixture page has its own natural-height knockout. The legacy
 // footer gap calculator must not insert 100s/1000s of pixels after it.
 if(document.documentElement.classList.contains('ljpc18-active')&&
    document.documentElement.dataset.ljpc18Route==='pc-fixtures'&&
    screen.querySelector(':scope > .u18-root')){
   footer.style.setProperty('--ljpc-footer-clearance','0px');
   return;
 }
 const currentBottom=screen.querySelector('#v105-bottom');
 if(ro&&currentBottom&&observedBottom!==currentBottom){
  if(observedBottom)ro.unobserve(observedBottom);
  ro.observe(currentBottom);observedBottom=currentBottom;
 }
 const footRect=footer.getBoundingClientRect();
 const screenRect=screen.getBoundingClientRect();
 if(!footRect.width||!screenRect.width)return;
 let bottom=screenRect.bottom;
 // Native panels may visually overflow #screen while absolute/legacy card heights
 // under-report; include only visible native cards and their actual geometry.
 const selectors=[':scope > *','#v105-bottom','#v105-bottom .v105-grid',
  '#v105-bottom .v105-grid > :last-child','#v100-home-extra',
  '#safeHomeExtra','#ljpc-exact-html-home'];
 const seen=new Set();
 for(const sel of selectors){
  let els;
  try{els=screen.querySelectorAll(sel)}catch(_){continue}
  for(const el of els){
   if(seen.has(el))continue;seen.add(el);
   const box=el.getBoundingClientRect();
   if(!box.width||!box.height||!Number.isFinite(box.bottom))continue;
   const style=getComputedStyle(el);
   if(style.display==='none'||style.visibility==='hidden')continue;
   bottom=Math.max(bottom,box.bottom);
  }
 }
 // Subtract the previously inserted gap; otherwise repeated resize/scroll
 // calculations would continually grow the footer margin.
 const prev=Number.parseFloat(footer.style.getPropertyValue('--ljpc-footer-clearance'))||12;
 const natural=footRect.top-prev;
 const next=clearance(bottom,natural);
 if(Math.abs(next-prev)>2)footer.style.setProperty('--ljpc-footer-clearance',next+'px');
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
 schedule();
 setTimeout(schedule,600);setTimeout(schedule,1800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
