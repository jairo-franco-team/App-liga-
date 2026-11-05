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
let queued=false,watching=false,ro=null,observedBottom=null,toolsExpanded=false,megaOpen=false;

const ALL_APK_SECTIONS=[
 {
  group:'ACCESOS RÁPIDOS',
  title:'Lo que más se consulta',
  items:[
   ['🛠️','Centro de Herramientas APK/PC','Todas las funciones ordenadas por categoría','leagueTools','COMPLETO'],
   ['🛡️','Equipos','Directorio oficial de clubes registrados','teams','CLUBES'],
   ['🏃','Jugadores','Plantillas y registros de jugadores','players','PLANTILLAS'],
   ['🏆','Liguilla / Cuadro','Cuadro eliminatorio y sorteos','bracketBuilder','LIGUILLA'],
   ['📰','Avisos y Noticias','Noticias y comunicados oficiales','news','AVISOS'],
   ['⏰','Avisos AUTO','Programar avisos con fecha y hora','v38Alerts','AUTO'],
   ['🎨','Publicar Diseños PNG','Diseños PNG HD y comunicados','publicationCenter','PNG HD']
  ]
 }
];

const CORE_RULES=`
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header{
  display:block!important;visibility:visible!important;opacity:1!important;
  width:100%!important;max-width:none!important;background:#0a1061!important;z-index:1800!important;
}
html.ljpc-unified-pc body.lj-desktop:is([data-app-route^="account"],[data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen{
  --ljr1420-page:#f4f6fb!important;--ljr1420-panel:#ffffff!important;--ljr1420-card:#ffffff!important;
  --ljr1420-field:#ffffff!important;--ljr1420-line:#dce3f0!important;--ljr1420-ink:#070e3d!important;
  --ljr1420-muted:#475467!important;--ljr1420-cyan:#0438f0!important;--ljr1420-canvas:none!important;
  background:#f4f6fb!important;background-color:#f4f6fb!important;background-image:none!important;
  color:#070e3d!important;-webkit-text-fill-color:#070e3d!important;color-scheme:light!important;
  padding:28px 0 48px!important;min-height:calc(100vh - 180px)!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen > *{
  position:relative!important;inset:auto!important;float:none!important;clear:both!important;
  height:auto!important;max-height:none!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen > :is(.v114-upcoming-slot,#safeHomeExtra,#v100-home-extra,#v105-bottom),
html.ljpc-unified-pc body.lj-desktop #screen#screen :is(.u18-bound,.ds-wrap,.ljpc-mas-uefa,.ljpc-toolhub,#ljpc-fantasy-uefa,#ljpc-six-ui .p6-bound,.v60-tool-page,.v726-tools-page,.v562-page,.v562-page[data-v563-control],.v28-match,.v26-moments-page,.v412-search-page,.v66-directory,.v38-page,.v635-page){
  width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;margin-inline:auto!important;
  position:relative!important;clear:both!important;height:auto!important;max-height:none!important;
}
`;

const MASTER_LOCK_CSS=`@layer ljr-mobile-shell { ${CORE_RULES} }\n${CORE_RULES}`;

function ensureMasterLock(){
 if(!pc()){
   document.getElementById('ljpc-rea-uefa-master-lock')?.remove();
   document.getElementById('ljpc-rea-tools-strip')?.remove();
   document.getElementById('ljpc-rea-apk-page-hub')?.remove();
   return;
 }
 document.documentElement.classList.remove('ljpc-forced-handset');
 const vp=document.querySelector?.('meta[name="viewport"]');
 if(vp&&mode()==='desktop'){
   vp.setAttribute('content','width=1280');
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
}

function adjust(){
 ensureMasterLock();
 const footer=document.getElementById('ljpc-unified-pc-footer');
 if(!pc()){if(footer)footer.style.removeProperty('--ljpc-footer-clearance');return}
 const screen=document.getElementById('screen');
 if(!footer||!screen)return;
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
