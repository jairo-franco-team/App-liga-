/* PC footer-only gap + Contextual APK-to-PC Section Subnavigation (sin amontonar todo en Más
   y sin mostrar herramientas de modificación en vistas públicas).
   No visual or behavioral change in ?mode=mobile / ?mode=apk. */
(function(){
'use strict';
if(window.__LJPC_FOOTER_FLOW_20261012__)return;
window.__LJPC_FOOTER_FLOW_20261012__=true;
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
const pc=()=>!['mobile','apk'].includes(mode())&&
  document.documentElement.classList.contains('ljpc-unified-pc')&&
  document.body?.classList.contains('lj-desktop');
let queued=false,watching=false,ro=null;

/* Sub-navegación contextual por sección (igual que el orden de APK / navegador móvil,
   sin herramientas de modificación/administración): cada sección tiene únicamente
   las sub-secciones que le corresponden. */
const SECTION_SUBNAVS={
 partidos:{
  label:'PARTIDOS Y JORNADA',
  routes:['pc-fixtures','competition','match','matchCenter','v4-matchcenter','matchday','pc-calendar','venues','weatherFields','v38Weather','motionHub','v38Weekly'],
  items:[
   ['⚽','Partidos y resultados','pc-fixtures'],
   ['🔴','Match Center en vivo','v4-matchcenter'],
   ['📋','Match Day','matchday'],
   ['📆','Calendario mensual','pc-calendar'],
   ['📍','Dónde se juega (Sedes)','venues'],
   ['⛅','Clima y canchas','weatherFields'],
   ['🎬','Jornada animada','motionHub'],
   ['🗞️','Reporte semanal','v38Weekly']
  ]
 },
 clasificacion:{
  label:'CLASIFICACIÓN Y TABLAS',
  routes:['pc-standings','standings','positions','tableExport','discipline'],
  items:[
   ['📊','Tabla de posiciones','pc-standings'],
   ['🥅','Tabla de goleo','pc-scorers'],
   ['⚖️','Comparar clubes','pc-team-compare'],
   ['📥','Exportar tabla PNG/CSV','tableExport'],
   ['🟨','Disciplina y tarjetas','discipline'],
   ['🏆','Cuadro de liguilla','bracketBuilder']
  ]
 },
 sorteos:{
  label:'SORTEOS Y LIGUILLA',
  routes:['pc-draws','draws','pc-bracket','bracket','bracketBuilder','tactics'],
  items:[
   ['🏆','Sorteos oficiales','pc-draws'],
   ['🧩','Cuadro de liguilla','bracketBuilder'],
   ['📐','Pizarra táctica 2D','tactics'],
   ['📊','Clasificación','pc-standings']
  ]
 },
 ligatv:{
  label:'LIGA TV Y MULTIMEDIA',
  routes:['video','moments'],
  items:[
   ['📺','Liga TV','video'],
   ['🎬','Momentos y galería','moments'],
   ['🎥','Jornada animada','motionHub'],
   ['🏛️','Vídeos históricos','history']
  ]
 },
 gaming:{
  label:'GAMING Y PRONÓSTICOS',
  routes:['fantasy','fantasyTeam','fantasyLeagues','quiniela','predictor','predictorSix','gaming','quizArena','quiz','moreLess','moreLessHub','moreLessGallery','vote'],
  items:[
   ['🔮','Pronostica Seis','predictorSix'],
   ['🎮','Fantasy Football','fantasy'],
   ['🎯','Quiniela','quiniela'],
   ['🧩','Bracket Liguilla','bracketBuilder'],
   ['🧠','Quiz Arena','quizArena'],
   ['⚖️','Más o menos','moreLess'],
   ['⭐','Jugador de la semana','vote']
  ]
 },
 datos:{
  label:'DATOS, PLANTILLAS Y ESTADÍSTICAS',
  routes:['safe-data','pc-data','pc-scorers','scorers','stats','v38Stats','rankings','players','pc-team-compare','playerCompare','safe-performance'],
  items:[
   ['📈','Estadísticas de clubes','pc-data'],
   ['🏃','Jugadores y plantillas','players'],
   ['🥅','Máximos goleadores','pc-scorers'],
   ['⚖️','Comparar clubes','pc-team-compare'],
   ['👥','Comparar jugadores','playerCompare'],
   ['⚡','Performance Zone','safe-performance'],
   ['🏛️','Récords históricos','history']
  ]
 },
 mas:{
  label:'MÁS · COMUNIDAD E INFORMACIÓN',
  routes:['pc-tools','more','rulebook','pc-notifications','search','club-store','ligaQR','appInstall'],
  items:[
   ['✨','Resumen Más','pc-tools'],
   ['🏛️','Historia y palmarés','history'],
   ['🛡️','Equipos','teams'],
   ['📰','Noticias','news'],
   ['📖','Reglamento oficial','rulebook'],
   ['📍','Sedes y campos','venues'],
   ['⛅','Clima en canchas','weatherFields'],
   ['🔍','Buscador general','search'],
   ['🔔','Notificaciones','pc-notifications'],
   ['🛍️','Tienda de clubes','club-store'],
   ['📲','Descargar App / QR','ligaQR']
  ]
 }
};

const CORE_RULES=`
/* ==========================================================================
   Liga Juventino Rosas Master Desktop Scale, White Login & Anti-Overlap
   ========================================================================== */
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header{
  display:block!important;visibility:visible!important;opacity:1!important;
  width:100%!important;max-width:none!important;background:#0a1061!important;z-index:1800!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header::before{
  content:"Liga Juventino Rosas  ▾"!important;display:flex!important;align-items:center!important;
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
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > button:hover,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-links > details > summary:hover{
  background:rgba(255,255,255,.15)!important;
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
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header details[data-ljpc-u-group="Más"] > .ljpc-u-dropdown,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header details[data-ljpc-u-group="Datos"] > .ljpc-u-dropdown,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header details[data-ljpc-u-group="Gaming"] > .ljpc-u-dropdown{
  width:270px!important;max-height:78vh!important;overflow-y:auto!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header details > .ljpc-u-dropdown > button{
  display:flex!important;align-items:center!important;justify-content:space-between!important;
  min-height:42px!important;padding:9px 16px!important;font:650 14px/1.25 Inter,sans-serif!important;
  color:#ffffff!important;visibility:visible!important;opacity:1!important;
}
html.ljpc-unified-pc body.lj-desktop:not([data-app-route="home"]) #ljpc-unified-pc-header .ljpc-u-scorebar,
html.ljpc18-active body.lj-desktop #ljpc-unified-pc-header .ljpc-u-scorebar{
  display:none!important;
}
html.ljpc18-active[data-ljpc18-route="pc-fixtures"] body.lj-desktop #screen .u18fx-utility,
html.ljpc18-active[data-ljpc18-route="pc-fixtures"] body.lj-desktop #screen .u18fx-nav{
  display:none!important;
}

/* Sub-barra contextual por sección (#ljpc-contextual-sec-bar): cada apartado muestra solo sus sub-secciones */
html.ljpc-unified-pc body.lj-desktop #ljpc-contextual-sec-bar{
  width:100%!important;background:#060e42!important;
  border-bottom:1px solid rgba(255,255,255,.14)!important;padding:10px 0!important;z-index:1720!important;
  font-family:Inter,system-ui,sans-serif!important;position:relative!important;clear:both!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-contextual-sec-bar .ljpc-ctx-inner{
  width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;margin:0 auto!important;
  display:flex!important;align-items:center!important;justify-content:flex-start!important;
  flex-wrap:wrap!important;gap:8px 10px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-contextual-sec-bar .ljpc-ctx-kicker{
  color:#00e5ff!important;font:800 11.5px/1.1 Inter,sans-serif!important;letter-spacing:.08em!important;
  text-transform:uppercase!important;margin-right:6px!important;white-space:nowrap!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-contextual-sec-bar button{
  appearance:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;
  gap:6px!important;min-height:36px!important;height:36px!important;padding:0 15px!important;
  border-radius:999px!important;border:1px solid rgba(255,255,255,.18)!important;
  background:rgba(255,255,255,.06)!important;color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;
  font:650 13.5px/1.1 Inter,sans-serif!important;cursor:pointer!important;white-space:nowrap!important;
  transition:background .15s,border-color .15s,color .15s!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-contextual-sec-bar button:hover{
  background:rgba(255,255,255,.16)!important;border-color:#00e5ff!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-contextual-sec-bar button.is-active{
  background:#00e5ff!important;color:#040836!important;-webkit-text-fill-color:#040836!important;
  border-color:#00e5ff!important;font-weight:800!important;
}

/* En #/pc-tools y #/more (Más), ocultar los bloques duplicados que se apilaban debajo (.ds-tools-grid, .ljpc-toolhub, #v105-bottom) */
html.ljpc-unified-pc.ljpc-more-uefa-pc body.lj-desktop:is([data-app-route="pc-tools"],[data-app-route="more"]) #screen#screen :is(.ds-pagehead,.ds-tools-grid,.ljpc-toolhub[data-pc-tools-hub],.ljpc-mas-original,#v105-bottom){
  display:none!important;
}
html.ljpc-unified-pc.ljpc-more-uefa-pc body.lj-desktop:is([data-app-route="pc-tools"],[data-app-route="more"]) #screen#screen :is(.ds-page,.ds-content,.ds-wrap){
  background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;margin:0 auto!important;
  width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;
}

/* ==========================================================================
   INICIAR SESIÓN Y MI CUENTA EN MODO PC — DISEÑO BLANCO OFICIAL (CAPTURA 2)
   ========================================================================== */
html.ljpc-unified-pc body.lj-desktop:is([data-app-route^="account"],[data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen{
  --ljr1420-page:#f4f6fb!important;
  --ljr1420-panel:#ffffff!important;
  --ljr1420-card:#ffffff!important;
  --ljr1420-field:#ffffff!important;
  --ljr1420-line:#dce3f0!important;
  --ljr1420-ink:#070e3d!important;
  --ljr1420-muted:#475467!important;
  --ljr1420-cyan:#0438f0!important;
  --ljr1420-canvas:none!important;
  background:#f4f6fb!important;background-color:#f4f6fb!important;background-image:none!important;
  color:#070e3d!important;-webkit-text-fill-color:#070e3d!important;color-scheme:light!important;
  padding:28px 0 48px!important;min-height:calc(100vh - 180px)!important;
}
html.ljpc-unified-pc body.lj-desktop:is([data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-page,
html.ljpc-unified-pc body.lj-desktop:is([data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-page.ljr-uefa-guest{
  width:min(calc(100% - 40px),760px)!important;max-width:760px!important;
  margin:20px auto 36px!important;padding:32px 38px!important;
  background:#ffffff!important;background-color:#ffffff!important;background-image:none!important;
  color:#070e3d!important;-webkit-text-fill-color:#070e3d!important;
  border:1px solid #dce3f0!important;border-radius:18px!important;
  box-shadow:0 16px 40px rgba(7,14,61,.08)!important;
}
html.ljpc-unified-pc body.lj-desktop:is([data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-page :is(h1,h2,h3,h4,b,strong,label,span){
  color:#070e3d!important;-webkit-text-fill-color:#070e3d!important;
}
html.ljpc-unified-pc body.lj-desktop:is([data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-page :is(p,small){
  color:#475467!important;-webkit-text-fill-color:#475467!important;
}
html.ljpc-unified-pc body.lj-desktop:is([data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-card{
  background:#f8faff!important;background-color:#f8faff!important;background-image:none!important;
  border:1px solid #dce3f0!important;border-radius:14px!important;padding:26px 30px!important;
  color:#070e3d!important;-webkit-text-fill-color:#070e3d!important;box-shadow:0 4px 14px rgba(7,14,61,.04)!important;
}
html.ljpc-unified-pc body.lj-desktop:is([data-app-route^="account"],[data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen :is(input:not([type=checkbox]):not([type=radio]),select,textarea){
  background:#ffffff!important;background-color:#ffffff!important;background-image:none!important;
  color:#070e3d!important;-webkit-text-fill-color:#070e3d!important;color-scheme:light!important;
  border:1.5px solid #cbd5e1!important;border-radius:10px!important;min-height:48px!important;padding:12px 16px!important;font-size:15.5px!important;
}
html.ljpc-unified-pc body.lj-desktop:is([data-app-route^="account"],[data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-primary,
html.ljpc-unified-pc body.lj-desktop:is([data-app-route^="account"],[data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-primary *{
  background:#0438f0!important;background-color:#0438f0!important;background-image:none!important;
  color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;border:1px solid #0438f0!important;
  border-radius:10px!important;min-height:48px!important;font-size:15.5px!important;font-weight:800!important;
}
html.ljpc-unified-pc body.lj-desktop:is([data-app-route^="account"],[data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-secondary,
html.ljpc-unified-pc body.lj-desktop:is([data-app-route^="account"],[data-app-route="accountLogin"],[data-app-route="accountRegister"]) #screen#screen .v569-secondary *{
  background:#ffffff!important;background-color:#ffffff!important;background-image:none!important;
  color:#0438f0!important;-webkit-text-fill-color:#0438f0!important;border:1.5px solid #0438f0!important;
  border-radius:10px!important;min-height:46px!important;font-size:14.5px!important;font-weight:750!important;
}

/* ==========================================================================
   CORRECCIÓN GLOBAL ANTI-SOLAPAMIENTO Y ESCALA PC 1392PX EN TODAS LAS SECCIONES
   ========================================================================== */
html.ljpc-unified-pc body.lj-desktop #screen#screen{
  display:flex!important;flex-direction:column!important;align-items:stretch!important;
  justify-content:flex-start!important;gap:20px!important;height:auto!important;
  min-height:0!important;max-height:none!important;overflow:visible!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen > *{
  position:relative!important;inset:auto!important;transform:none!important;
  float:none!important;clear:both!important;flex:0 0 auto!important;
  grid-column:auto!important;grid-row:auto!important;
  height:auto!important;min-height:0!important;max-height:none!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen > :is(.v114-upcoming-slot,#safeHomeExtra,#v100-home-extra,#v105-bottom),
html.ljpc-unified-pc body.lj-desktop #screen#screen :is(.u18-bound,.ds-wrap,.ljpc-mas-uefa,.ljpc-toolhub,#ljpc-fantasy-uefa,#ljpc-six-ui .p6-bound,.v60-tool-page,.v726-tools-page,.v562-page,.v562-page[data-v563-control],.v28-match,.v26-moments-page,.v412-search-page,.v66-directory,.v38-page,.v635-page){
  width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;margin-inline:auto!important;
  position:relative!important;clear:both!important;height:auto!important;max-height:none!important;
}

/* Tarjetas en Más (.ljpc-mas-tile, .ljpc-mas-about) y tarjetas de herramientas sin encimarse */
html.ljpc-unified-pc body.lj-desktop #screen#screen .ljpc-mas-tiles,
html.ljpc-unified-pc body.lj-desktop #screen#screen .ljpc-mas-about-grid{
  display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:16px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen :is(.ljpc-mas-tile,.ljpc-mas-about){
  position:relative!important;inset:auto!important;transform:none!important;
  display:flex!important;flex-direction:column!important;justify-content:flex-start!important;
  align-items:flex-start!important;gap:8px!important;min-height:112px!important;height:auto!important;
  padding:20px 44px 20px 22px!important;border-radius:14px!important;overflow:visible!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen :is(.ljpc-mas-tile strong,.ljpc-mas-about b){
  font-size:16.5px!important;font-weight:800!important;line-height:1.28!important;position:static!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen :is(.ljpc-mas-tile small,.ljpc-mas-about small){
  font-size:13.8px!important;line-height:1.42!important;position:static!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen .v726-tool-card{
  position:relative!important;inset:auto!important;transform:none!important;
  display:flex!important;flex-direction:column!important;justify-content:space-between!important;
  width:100%!important;height:auto!important;min-height:112px!important;max-height:none!important;
  padding:0!important;margin:0!important;border-radius:14px!important;overflow:hidden!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen .v726-tool-card .v734-tool-open{
  position:relative!important;inset:auto!important;transform:none!important;
  display:grid!important;grid-template-columns:44px minmax(0,1fr) 18px!important;
  align-items:center!important;gap:14px!important;width:100%!important;
  min-height:76px!important;height:auto!important;padding:16px 18px!important;margin:0!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen .v726-tool-card .v726-tool-copy{
  position:relative!important;inset:auto!important;transform:none!important;
  display:flex!important;flex-direction:column!important;align-items:flex-start!important;
  gap:4px!important;min-width:0!important;max-width:100%!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen .v726-tool-card .v726-tool-tag{
  position:static!important;inset:auto!important;transform:none!important;
  display:inline-flex!important;align-self:flex-start!important;width:auto!important;
  padding:3px 9px!important;border-radius:999px!important;font-size:11px!important;font-weight:800!important;
  margin:0 0 2px!important;line-height:1.2!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen .v726-tool-card .v734-tool-details{
  position:relative!important;inset:auto!important;transform:none!important;
  display:flex!important;align-items:center!important;justify-content:space-between!important;
  width:100%!important;min-height:38px!important;height:auto!important;
  padding:8px 18px!important;margin:0!important;font-size:13px!important;font-weight:700!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen :is(.v562-card,.ljpc-hub-btn,.v60-tool-card,.v726-quick-card){
  position:relative!important;inset:auto!important;transform:none!important;
  height:auto!important;min-height:84px!important;max-height:none!important;
  padding:16px 20px!important;border-radius:14px!important;overflow:visible!important;
}

html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen#screen > #v100-home-extra{
  display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-auto-rows:max-content!important;gap:16px!important;padding:22px 26px!important;
  margin:18px auto!important;height:auto!important;max-height:none!important;overflow:visible!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen#screen #v100-home-extra > .v100-head{grid-column:1/-1!important;grid-row:1!important}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen#screen #v100-home-extra > .v100-fav-card{grid-column:1!important;grid-row:2!important;height:auto!important;padding:18px!important}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen#screen #v100-home-extra > .v100-quick-grid{grid-column:2!important;grid-row:2!important;height:auto!important;gap:12px!important}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen#screen #v100-home-extra > .v100-pulse{grid-column:1/-1!important;grid-row:3!important;position:relative!important;height:auto!important;padding:16px 20px!important;margin:0!important}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen#screen #v100-home-extra > .v100-status{grid-column:1/-1!important;grid-row:4!important;position:relative!important;height:auto!important;padding:14px 18px!important;margin:0!important}
html.ljpc-unified-pc body.lj-desktop #screen#screen > #v105-bottom,
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen#screen > #v105-bottom[data-v105-route="home"]{
  position:relative!important;inset:auto!important;transform:none!important;clear:both!important;
  display:block!important;height:auto!important;min-height:0!important;max-height:none!important;
  overflow:visible!important;padding:22px 26px!important;margin:20px auto 28px!important;border-radius:16px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen#screen #v105-bottom .v105-motion,
html.ljpc-unified-pc body.lj-desktop #screen#screen #v105-bottom .v105-motion-copy{
  position:relative!important;height:auto!important;min-height:132px!important;max-height:none!important;
}
`;

const MASTER_LOCK_CSS=`@layer ljr-mobile-shell { ${CORE_RULES} }\n${CORE_RULES}`;

const IFRAME_HOME_UEFA_CSS=`
html.ljpc-embedded-home #root .ucl [data-name="stories list container"]{
  width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;margin:8px auto 12px!important;
}
html.ljpc-embedded-home #root .ucl [data-name="stories wrapper"]{
  gap:16px!important;justify-content:space-between!important;
}
html.ljpc-embedded-home #root .ucl [data-name="stories wrapper"] > a{
  flex:0 0 92px!important;width:92px!important;min-width:92px!important;max-width:92px!important;font-size:12.5px!important;
}
html.ljpc-embedded-home #root .ucl [data-name="story ring"]{
  width:84px!important;height:84px!important;min-width:84px!important;min-height:84px!important;
  max-width:84px!important;max-height:84px!important;
}
html.ljpc-embedded-home #root .ucl [data-name="hero section container"]{
  display:grid!important;grid-template-columns:minmax(0,2fr) minmax(320px,1fr)!important;
  gap:22px!important;width:min(1392px,calc(100% - 40px))!important;max-width:1392px!important;
  height:auto!important;min-height:0!important;max-height:none!important;
  margin:12px auto!important;padding:8px 0 18px!important;position:relative!important;clear:both!important;
}
html.ljpc-embedded-home #root .ucl [data-name="featured hero article card"]{
  height:420px!important;min-height:420px!important;max-height:420px!important;border-radius:14px!important;
}
html.ljpc-embedded-home #root .ucl [data-name="featured hero article card"] img{
  height:100%!important;max-height:420px!important;object-fit:cover!important;
}
html.ljpc-embedded-home #root .ucl :is([data-name="moments section container"],[data-name="news section container"],[data-name="video section container"]){
  position:relative!important;clear:both!important;height:auto!important;min-height:0!important;max-height:none!important;
}
`;

function ensureContextualSubnav(){
 document.getElementById('ljpc-rea-tools-strip')?.remove();
 document.getElementById('ljpc-rea-apk-page-hub')?.remove();
 if(!pc()||!document.body){
  document.getElementById('ljpc-contextual-sec-bar')?.remove();
  return;
 }
 const header=document.getElementById('ljpc-unified-pc-header');
 if(!header)return;
 const r=route();
 /* En Inicio (home), Cuenta (account*) o Historia (que ya tiene su propia barra #ljpc-pc-history-hub), no mostrar sub-barra extra */
 if(r==='home'||r.startsWith('account')||['history','teams','news','about'].includes(r)){
  document.getElementById('ljpc-contextual-sec-bar')?.remove();
  return;
 }
 const group=Object.values(SECTION_SUBNAVS).find(g=>g.routes.includes(r));
 if(!group){
  document.getElementById('ljpc-contextual-sec-bar')?.remove();
  return;
 }
 let bar=document.getElementById('ljpc-contextual-sec-bar');
 if(!bar){
  bar=document.createElement('nav');
  bar.id='ljpc-contextual-sec-bar';
  bar.setAttribute('aria-label','Sub-secciones del apartado actual');
  header.insertAdjacentElement('afterend',bar);
 }
 bar.innerHTML='<div class="ljpc-ctx-inner">'+
  '<span class="ljpc-ctx-kicker">'+group.label+':</span>'+
  group.items.map(([icon,label,to])=>
   '<button type="button" class="'+(r===to?'is-active':'')+'" data-ljpc-u-go="'+to+'">'+
    '<span aria-hidden="true">'+icon+'</span><span>'+label+'</span>'+
   '</button>'
  ).join('')+
 '</div>';
}

function ensureMasterLock(){
 if(!pc()){
   document.getElementById('ljpc-rea-uefa-master-lock')?.remove();
   document.getElementById('ljpc-rea-tools-strip')?.remove();
   document.getElementById('ljpc-contextual-sec-bar')?.remove();
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
 ensureContextualSubnav();
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
