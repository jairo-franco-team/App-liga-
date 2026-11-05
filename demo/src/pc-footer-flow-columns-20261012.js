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
 },
 {
  group:'COMPETICIÓN',
  title:'Competición y estadísticas',
  items:[
   ['📊','Posiciones','Clasificación oficial por categoría: PJ, PTS y DG','pc-standings','TABLA'],
   ['⚽','Goleo','Ranking de goleadores por jugador y categoría','pc-scorers','GOLEO'],
   ['📅','Jornadas y Partidos','Calendario, resultados y próximos encuentros','pc-fixtures','PARTIDOS'],
   ['🔴','Match Center','Marcador, cronología, alineaciones y contexto en vivo','v4-matchcenter','EN VIVO'],
   ['📥','Exportar tabla','Genera la tabla completa para descargar en PNG y CSV','tableExport','PNG / CSV'],
   ['🎯','Quiniela','Juego de pronósticos por partido y resultados','quiniela','JUEGO']
  ]
 },
 {
  group:'OPERACIÓN',
  title:'Partido y jornada',
  items:[
   ['📋','Match Day','Checklist para preparar y cerrar una jornada','matchday','JORNADA'],
   ['🗓️','Preparar mi jornada','Organiza cruces, agenda y datos antes de publicar','agendaBuilder','AGENDA'],
   ['📐','Tácticas (Pizarra 2D)','Pizarra 2D para preparar formaciones y alineaciones','tactics','CANCHA'],
   ['⛅','Clima y estado oficial','Pronóstico, terreno y condiciones de los campos','v38Weather','CLIMA'],
   ['📍','Dónde se juega (Sedes)','Directorio de campos y comunidades con ubicación','venues','SEDES'],
   ['🎬','Jornada animada','Vista dinámica con accesos rápidos para presentar la jornada','motionHub','VISUAL'],
   ['⚠️','Aviso de suspensión','Prepara un aviso claro de partido o jornada suspendida','suspensionTool','AVISO'],
   ['📆','Calendario Mensual PC','Vista mensual interactiva por categoría','pc-calendar','MES']
  ]
 },
 {
  group:'DOCUMENTOS',
  title:'Documentos y publicaciones',
  items:[
   ['📄','Generar cédula','Crea la cédula y plantilla del partido lista para impresión','cedulaBuilder','DOCUMENTO'],
   ['✅','Permisos y autorizaciones','Genera permisos para jugador o delegado en PDF, PNG o SVG','permissionBuilder','PDF / PNG'],
   ['🪪','Generar credencial','Crea la credencial del jugador con fotografía, equipo y categoría','credentialBuilder','CREDENCIAL'],
   ['📖','Reglamento','Consulta y descarga el reglamento oficial vigente en PDF','rulebook','OFICIAL'],
   ['🖼️','Centro de publicaciones','Diseños PNG HD, resultados, notificaciones y avisos','publicationCenter','DISEÑOS / PNG']
  ]
 },
 {
  group:'CONSULTA',
  title:'Información y archivo',
  items:[
   ['🏛️','Historia y Archivo','Temporadas, campeones, finales, récords y palmarés','history','ARCHIVO'],
   ['🔍','Buscador General','Encuentra rápidamente equipos, jugadores, partidos, campos y noticias','search','BUSCAR'],
   ['⚖️','Comparar clubes','Compara estadísticas frente a frente entre dos equipos','pc-team-compare','COMPARAR'],
   ['🔔','Notificaciones','Configura alertas de goles, inicio, medio tiempo y final','pc-notifications','ALERTAS'],
   ['🛍️','Tienda de clubes','Artículos y personalización de clubes de la Liga','club-store','TIENDA']
  ]
 },
 {
  group:'GESTIÓN Y ADMIN',
  title:'Administración de la Liga',
  items:[
   ['📈','Panel de Liga','Resumen operativo de tabla, equipos y actividad general','v38Stats','ADMIN'],
   ['🟨','Tarjetas y castigados','Consulta disciplina, amarillas, rojas, sanciones y castigados','discipline','DISCIPLINA'],
   ['➕','Registro (Altas)','Altas y control de equipos y jugadores desde administración','recruitment','ALTAS'],
   ['🎛️','JR Control','Centro operativo para administrar procesos internos y tareas','jrControl','CONTROL'],
   ['🏁','Modo árbitro offline','Trabaja con partidos, borradores y cola de cédulas sin conexión','refereeOffline','ÁRBITRO'],
   ['📑','Cédulas arbitrales','Consulta, captura y revisa las cédulas de los partidos','cedulas','CÉDULAS'],
   ['🗞️','Reportes semanales','Revisa juegos de la semana, avisos y reportes operativos','v38Weekly','REPORTE'],
   ['📲','Descargar / Instalar App','Abre el QR y opciones para instalar la app de la Liga','ligaQR','APP']
  ]
 }
];

const MASTER_LOCK_CSS=`
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header{
  display:block!important;visibility:visible!important;opacity:1!important;
  width:100%!important;max-width:none!important;background:#0a1061!important;z-index:1800!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header::before{
  content:"UEFA.com  ▾"!important;display:flex!important;align-items:center!important;
  justify-content:flex-start!important;height:38px!important;min-height:38px!important;
  padding:0 max(20px,calc((100% - 1392px)/2))!important;background:#000000!important;
  color:#ffffff!important;font:700 13.5px/1 Inter,system-ui,sans-serif!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-nav{
  background:linear-gradient(90deg,#0438f0 0%,#03229c 55%,#010e54 100%)!important;
  border-bottom:1px solid rgba(255,255,255,.14)!important;min-height:82px!important;height:82px!important;
  display:flex!important;align-items:center!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-nav > .ljpc-u-wrap{
  display:flex!important;flex-direction:row!important;align-items:center!important;
  justify-content:flex-start!important;width:min(1392px,calc(100% - 40px))!important;
  max-width:1392px!important;height:82px!important;min-height:82px!important;
  padding:0!important;margin:0 auto!important;gap:32px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-brand{
  display:inline-flex!important;align-items:center!important;gap:12px!important;
  flex:0 0 auto!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-brand img{
  width:48px!important;height:48px!important;min-width:48px!important;object-fit:contain!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-brand span{
  font:900 12px/1.08 Inter,system-ui,sans-serif!important;letter-spacing:.05em!important;color:#ffffff!important;
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
  gap:7px!important;width:auto!important;height:40px!important;min-height:40px!important;
  padding:0 20px!important;border-radius:9999px!important;border:0!important;
  background:transparent!important;color:#ffffff!important;
  font:600 16px/1.1 Inter,system-ui,sans-serif!important;white-space:nowrap!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > button.active,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > details > summary.active{
  background:#00e5ff!important;color:#040836!important;font-weight:800!important;
  height:40px!important;min-height:40px!important;padding:0 22px!important;border-radius:9999px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-login{
  position:absolute!important;top:0!important;right:max(20px,calc((100% - 1392px)/2))!important;
  height:38px!important;min-height:38px!important;padding:0 8px!important;
  border:0!important;background:transparent!important;color:#ffffff!important;
  font:600 13.5px/1 Inter,system-ui,sans-serif!important;display:inline-flex!important;
  align-items:center!important;gap:6px!important;z-index:1810!important;
}
html.ljpc-unified-pc body.lj-desktop:not([data-app-route="home"]) #ljpc-unified-pc-header .ljpc-u-scorebar,
html.ljpc18-active body.lj-desktop #ljpc-unified-pc-header .ljpc-u-scorebar{
  display:none!important;
}
html.ljpc-unified-pc body.lj-desktop #screen > *{
  position:relative!important;inset:auto!important;float:none!important;clear:both!important;
  height:auto!important;max-height:none!important;
}
html.ljpc-unified-pc body.lj-desktop #screen > :is(.v114-upcoming-slot,#safeHomeExtra,#v100-home-extra,#v105-bottom),
html.ljpc-unified-pc body.lj-desktop #screen :is(.u18-bound,.ds-wrap,.ljpc-mas-uefa,.ljpc-toolhub,#ljpc-fantasy-uefa,#ljpc-six-ui .p6-bound,.v60-tool-page,.v726-tools-page,.v562-page,.v28-match,.v26-moments-page,.v412-search-page,.v66-directory,.v38-page,.v635-page){
  width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;margin-inline:auto!important;
  position:relative!important;clear:both!important;height:auto!important;max-height:none!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen > #v100-home-extra{
  display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-auto-rows:max-content!important;gap:16px!important;padding:22px 26px!important;
  margin:18px auto!important;height:auto!important;max-height:none!important;overflow:visible!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v100-home-extra > .v100-head{grid-column:1/-1!important;grid-row:1!important}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v100-home-extra > .v100-fav-card{grid-column:1!important;grid-row:2!important;height:auto!important;padding:18px!important}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v100-home-extra > .v100-quick-grid{grid-column:2!important;grid-row:2!important;height:auto!important;gap:12px!important}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v100-home-extra > .v100-pulse{grid-column:1/-1!important;grid-row:3!important;position:relative!important;height:auto!important;padding:16px 20px!important;margin:0!important}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v100-home-extra > .v100-status{grid-column:1/-1!important;grid-row:4!important;position:relative!important;height:auto!important;padding:14px 18px!important;margin:0!important}
html.ljpc-unified-pc body.lj-desktop #screen > #v105-bottom,
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen > #v105-bottom[data-v105-route="home"]{
  position:relative!important;inset:auto!important;transform:none!important;clear:both!important;
  display:block!important;height:auto!important;min-height:0!important;max-height:none!important;
  overflow:visible!important;padding:22px 26px!important;margin:20px auto 28px!important;border-radius:16px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen #v105-bottom .v105-motion,
html.ljpc-unified-pc body.lj-desktop #screen #v105-bottom .v105-motion-copy{
  position:relative!important;height:auto!important;min-height:132px!important;max-height:none!important;
}
`;

const IFRAME_HOME_UEFA_CSS=`
html.ljpc-embedded-home #root .ucl [data-name="stories list container"]{
  width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;margin:8px auto 12px!important;
}
html.ljpc-embedded-home #root .ucl [data-name="hero section container"]{
  display:grid!important;grid-template-columns:minmax(0,2fr) minmax(320px,1fr)!important;
  gap:22px!important;width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;
  height:auto!important;min-height:0!important;max-height:none!important;
  margin:12px auto!important;padding:8px 0 18px!important;position:relative!important;clear:both!important;
}
html.ljpc-embedded-home #root .ucl :is([data-name="moments section container"],[data-name="news section container"],[data-name="video section container"]){
  position:relative!important;clear:both!important;height:auto!important;min-height:0!important;max-height:none!important;
}
`;

function buildApkHubHtml(id){
 return '<section id="'+id+'" class="ljpc-rea-apk-hub" aria-label="Todas las secciones y herramientas de Móvil y APK en PC">'+
  '<header class="ljpc-rea-apk-hub-head"><div><small>CENTRO COMPLETO DE FUNCIONES MÓVIL / APK → WEB PC (1392PX)</small>'+
  '<h2>Todas las secciones y herramientas de la Liga en tamaño PC</h2>'+
  '<p>Accede directamente a cualquiera de las 35 secciones de competencia, operación de jornada, documentos oficiales, archivo y administración adaptadas al navegador de escritorio.</p></div></header>'+
  ALL_APK_SECTIONS.map(sec=>
   '<div class="ljpc-rea-apk-group"><div class="ljpc-rea-apk-group-title"><span>'+sec.group+'</span><h3>'+sec.title+'</h3></div>'+
   '<div class="ljpc-rea-apk-grid">'+sec.items.map(([icon,name,desc,to,badge])=>
    '<button type="button" class="ljpc-rea-apk-card" data-ljpc-u-go="'+to+'">'+
     '<span class="ljpc-rea-apk-icon" aria-hidden="true">'+icon+'</span>'+
     '<span class="ljpc-rea-apk-copy"><b>'+name+'</b><small>'+desc+'</small></span>'+
     '<span class="ljpc-rea-apk-badge">'+badge+'</span>'+
    '</button>'
   ).join('')+'</div></div>'
  ).join('')+
 '</section>';
}

function enrichMoreDropdown(){
 const drop=document.querySelector('#ljpc-unified-pc-header details[data-ljpc-u-group="Más"] > .ljpc-u-dropdown');
 if(!drop||drop.dataset.reaApkEnriched==='1')return;
 drop.dataset.reaApkEnriched='1';
}

function ensureToolsStrip(){
 if(!pc()||!document.body)return;
 const header=document.getElementById('ljpc-unified-pc-header');
 if(!header)return;
 enrichMoreDropdown();
 document.getElementById('ljpc-rea-apk-page-hub')?.remove();
}

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
 ensureToolsStrip();
 const frame=document.getElementById('ljpc-exact-html-home');
 try{
   const doc=frame?.contentDocument;
   if(doc?.head){
     doc.getElementById('ljpc-forced-handset-iframe-style')?.remove();
     doc.getElementById('ljpc-handset-iframe-styles')?.remove();
     if(!doc.getElementById('ljpc-rea-iframe-home-lock')){
       const s=doc.createElement('style');
       s.id='ljpc-rea-iframe-home-lock';
       s.textContent=IFRAME_HOME_UEFA_CSS;
       doc.head.appendChild(s);
       const inner=doc.defaultView;
       inner?.requestAnimationFrame?.(()=>inner.dispatchEvent(new inner.Event('resize')));
     }
   }
 }catch(_){}
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
 document.addEventListener('load',e=>{if(e.target?.id==='ljpc-exact-html-home')schedule()},true);
 schedule();
 setTimeout(schedule,600);setTimeout(schedule,1800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
