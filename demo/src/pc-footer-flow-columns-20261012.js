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
let queued=false,watching=false,ro=null,observedBottom=null,toolsExpanded=false;

const MASTER_LOCK_CSS=`
/* ==========================================================================
   REA UEFA Champions League Master Desktop Scale & PC Tools Restoration
   Applies to ALL PC sections: Home, Fixtures, Standings, Draws, Liga TV,
   Moments, Gaming, Fantasy, Predictor Six, Stats/Data, History, More & Tools
   ========================================================================== */
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header{
  display:block!important;visibility:visible!important;opacity:1!important;
  width:100%!important;max-width:none!important;background:#0a1061!important;z-index:1800!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header::before{
  content:"UEFA.com  ▾"!important;display:flex!important;align-items:center!important;
  justify-content:flex-start!important;height:38px!important;min-height:38px!important;
  padding:0 max(24px,calc((100% - 1392px)/2))!important;background:#000000!important;
  color:#ffffff!important;font:700 13.5px/1 Inter,system-ui,sans-serif!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-nav{
  background:linear-gradient(90deg,#0438f0 0%,#03229c 55%,#010e54 100%)!important;
  border-bottom:1px solid rgba(255,255,255,.14)!important;min-height:82px!important;height:82px!important;
  display:flex!important;align-items:center!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-nav > .ljpc-u-wrap{
  display:flex!important;flex-direction:row!important;align-items:center!important;
  justify-content:flex-start!important;width:min(1392px,calc(100% - 48px))!important;
  max-width:1392px!important;height:82px!important;min-height:82px!important;
  padding:0!important;margin:0 auto!important;gap:36px!important;
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
  gap:24px!important;min-width:0!important;overflow-x:auto!important;overflow-y:visible!important;
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
  position:absolute!important;top:0!important;right:max(24px,calc((100% - 1392px)/2))!important;
  height:38px!important;min-height:38px!important;padding:0 8px!important;
  border:0!important;background:transparent!important;color:#ffffff!important;
  font:600 13.5px/1 Inter,system-ui,sans-serif!important;display:inline-flex!important;
  align-items:center!important;gap:6px!important;z-index:1810!important;
}
/* Re-enable ALL PC Tools inside the Más dropdown (overriding pc-history-hub display:none) */
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header details[data-ljpc-u-group="Más"] > .ljpc-u-dropdown > button{
  display:flex!important;align-items:center!important;justify-content:space-between!important;
  min-height:44px!important;padding:10px 18px!important;font:650 14.5px/1.25 Inter,sans-serif!important;
  color:#ffffff!important;visibility:visible!important;opacity:1!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-score-wrap{
  width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;
  min-height:118px!important;padding:14px 0!important;gap:16px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-match{
  flex:0 0 196px!important;width:196px!important;min-height:92px!important;height:auto!important;
  padding:12px 16px!important;gap:6px!important;border-radius:10px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-match small{
  font-size:12px!important;color:#a8b6df!important;font-weight:600!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-match > span > b{
  font-size:14px!important;font-weight:750!important;color:#ffffff!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-team-logo,
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-team-fallback{
  width:24px!important;height:24px!important;flex:0 0 24px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-unified-pc-header .ljpc-u-all{
  min-width:190px!important;min-height:46px!important;height:46px!important;
  padding:0 20px!important;font-size:14px!important;font-weight:750!important;
}
html.ljpc-unified-pc body.lj-desktop:not([data-app-route="home"]) #ljpc-unified-pc-header .ljpc-u-scorebar,
html.ljpc18-active body.lj-desktop #ljpc-unified-pc-header .ljpc-u-scorebar{
  display:none!important;
}
html.ljpc18-active[data-ljpc18-route="pc-fixtures"] body.lj-desktop #screen .u18fx-utility,
html.ljpc18-active[data-ljpc18-route="pc-fixtures"] body.lj-desktop #screen .u18fx-nav{
  display:none!important;
}

/* Barra Maestra de Herramientas PC y Modificación de Página (#ljpc-rea-tools-strip) */
html.ljpc-unified-pc body.lj-desktop #ljpc-rea-tools-strip{
  width:100%!important;background:linear-gradient(90deg,#050b38 0%,#091969 50%,#050b38 100%)!important;
  border-bottom:1px solid rgba(0,229,255,.28)!important;padding:10px 0!important;z-index:1750!important;
  font-family:Inter,system-ui,sans-serif!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-rea-tools-strip .ljpc-rea-tools-inner{
  width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;margin:0 auto!important;
  display:flex!important;align-items:center!important;justify-content:space-between!important;
  flex-wrap:wrap!important;gap:10px 14px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-rea-tools-strip .ljpc-rea-tools-label{
  display:inline-flex!important;align-items:center!important;gap:8px!important;
  color:#00e5ff!important;font:800 13px/1.2 Inter,sans-serif!important;letter-spacing:.06em!important;
  text-transform:uppercase!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-rea-tools-strip .ljpc-rea-tools-btns{
  display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:8px!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-rea-tools-strip button{
  appearance:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;
  gap:6px!important;min-height:38px!important;height:38px!important;padding:0 16px!important;
  border-radius:8px!important;border:1px solid rgba(0,229,255,.38)!important;
  background:rgba(4,56,240,.35)!important;color:#ffffff!important;
  font:700 13.5px/1.1 Inter,sans-serif!important;cursor:pointer!important;white-space:nowrap!important;
  transition:background .15s,border-color .15s,transform .15s!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-rea-tools-strip button:hover{
  background:#00e5ff!important;color:#040836!important;border-color:#00e5ff!important;transform:translateY(-1px)!important;
}
html.ljpc-unified-pc body.lj-desktop #ljpc-rea-tools-strip button.is-primary{
  background:#00e5ff!important;color:#040836!important;border-color:#00e5ff!important;font-weight:800!important;
}

/* Cuando el usuario activa "Modificar / Controles de esta sección", mostrar paneles nativos debajo con tamaño 1392px */
html.ljpc-unified-pc.ljpc-rea-show-native body.lj-desktop #screen > :not(.u18-root){
  display:block!important;visibility:visible!important;pointer-events:auto!important;
  max-height:none!important;overflow:visible!important;
  width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;margin:20px auto!important;
}

/* Escalado global UEFA Champions League (1392px) para eliminar cuadros y textos chiquitos en TODAS las secciones */
html.ljpc-unified-pc body.lj-desktop #screen > :is(.v114-upcoming-slot,#safeHomeExtra,#v100-home-extra,#v105-bottom),
html.ljpc-unified-pc body.lj-desktop #screen :is(.u18-bound,.ds-wrap,.ljpc-mas-uefa,#ljpc-fantasy-uefa,#ljpc-six-ui .p6-bound,.v60-tool-page,.v726-tools-page,.v562-page,.v28-match,.v26-moments-page){
  width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;margin-inline:auto!important;
}

/* Inicio: Goleadores, Vídeos, Tabla rápida, Favoritos y Gran Final en tamaño grande UEFA */
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen > #safeHomeExtra{
  padding:20px 24px!important;gap:16px!important;border-radius:14px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra > :is(.v6-section,.v73-home-interleaved){
  padding:18px 22px!important;border-radius:12px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-scorers{
  grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px 16px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-scorers > button{
  min-height:64px!important;padding:12px 16px!important;border-radius:10px!important;gap:12px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-scorers b{
  font-size:15.5px!important;line-height:1.25!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-scorers small{
  font-size:13.5px!important;line-height:1.3!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-video-list{
  grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-video-card{
  min-height:76px!important;padding:12px 16px!important;border-radius:10px!important;
  grid-template-columns:40px minmax(0,1fr)!important;gap:12px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-video-card .v6-play{
  width:40px!important;height:40px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-video-card b{
  font-size:15px!important;line-height:1.28!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-video-card small{
  font-size:13px!important;line-height:1.3!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-table-row{
  min-height:48px!important;padding:10px 14px!important;font-size:14.5px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-final{
  padding:16px 20px!important;gap:20px!important;border-radius:14px!important;margin:0 0 16px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-final > .v977-player,
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-final > video{
  max-height:340px!important;border-radius:10px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-final-copy b{
  font-size:clamp(20px,2.2vw,26px)!important;line-height:1.22!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-final-copy p{
  font-size:15px!important;line-height:1.5!important;margin:8px 0 0!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-grid{
  gap:14px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-grid .v105-card,
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-action-card{
  min-height:78px!important;padding:14px 18px!important;border-radius:12px!important;gap:12px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-grid .v105-copy b,
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-action-card b{
  font-size:15.5px!important;line-height:1.25!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #v105-bottom .v105-grid .v105-copy small,
html.ljpc-unified-pc body.lj-desktop[data-app-route="home"] #screen #safeHomeExtra .v6-action-card small{
  font-size:13px!important;line-height:1.35!important;margin-top:4px!important;
}

/* Herramientas PC, JR Control, Liga Control y Accesos CMS en tamaño grande UEFA */
html.ljpc-unified-pc body.lj-desktop #screen :is(.v60-tool-head,.v562-hero,.v726-tools-hero){
  padding:22px 26px!important;margin:0 0 20px!important;border-radius:14px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen :is(.v60-tool-head,.v562-hero,.v726-tools-hero) h1{
  font-size:clamp(26px,2.6vw,34px)!important;
}
html.ljpc-unified-pc body.lj-desktop #screen :is(.v60-tool-head,.v562-hero,.v726-tools-hero) p{
  font-size:15px!important;line-height:1.5!important;
}
html.ljpc-unified-pc body.lj-desktop #screen :is(.v60-tool-card,.v726-tool-card,.v726-quick-card,button.v562-card){
  min-height:78px!important;padding:14px 18px!important;border-radius:12px!important;gap:14px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen :is(.v60-tool-card,.v726-tool-card,.v726-quick-card,button.v562-card) b{
  font-size:15.5px!important;line-height:1.28!important;
}
html.ljpc-unified-pc body.lj-desktop #screen :is(.v60-tool-card,.v726-tool-card,.v726-quick-card,button.v562-card) small{
  font-size:13.5px!important;line-height:1.35!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ljr-cms-entry:has(>button[data-cms-open]){
  width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important;padding:12px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ljr-cms-entry:has(>button[data-cms-open]) > :is(button,a){
  min-height:62px!important;padding:12px 16px!important;border-radius:12px!important;font-size:14.5px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ljr-cms-entry:has(>button[data-cms-open]) :is(.ljr-cms-quick-title,.v1108-cms-title){
  font-size:14.5px!important;line-height:1.28!important;
}

/* Gaming, Fantasy y Pronostica Seis en escala UEFA 1392px */
html.ljpc-unified-pc body.lj-desktop #screen .ds-pagehead{
  background:linear-gradient(90deg,#0438f0 0%,#03229c 55%,#010e54 100%)!important;
  color:#ffffff!important;padding:26px 0 28px!important;border-bottom:1px solid rgba(0,229,255,.22)!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-pagehead .eyebrow{
  color:#00e5ff!important;font:800 12px/1.2 Inter,sans-serif!important;letter-spacing:.12em!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-pagehead h1{
  color:#ffffff!important;font:800 clamp(28px,3vw,38px)/1.12 Inter,sans-serif!important;margin:4px 0 8px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-pagehead p{
  color:rgba(255,255,255,.88)!important;font:500 15px/1.45 Inter,sans-serif!important;margin:0!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-game-panel,
html.ljpc-unified-pc body.lj-desktop #screen .ds-card{
  border-radius:14px!important;border:1px solid rgba(0,229,255,.24)!important;
  padding:22px 24px!important;box-shadow:0 10px 28px rgba(4,10,45,.18)!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-game-panel h3{
  font-size:20px!important;margin:0 0 8px!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-game-panel p{
  font-size:14.5px!important;line-height:1.5!important;
}
html.ljpc-unified-pc body.lj-desktop #screen .ds-game-actions button{
  background:#00e5ff!important;color:#040836!important;font-weight:800!important;
  border-radius:8px!important;min-height:42px!important;padding:0 22px!important;font-size:14.5px!important;border:0!important;
}
html.ljpc-fantasy-uefa-active body.lj-desktop #ljpc-fantasy-uefa .pcfy-heading h1,
html.ljpc-unified-pc body.lj-desktop[data-app-route="predictorSix"] #ljpc-six-ui h1{
  font-size:32px!important;
}
html.ljpc-fantasy-uefa-active body.lj-desktop #ljpc-fantasy-uefa .pcfy-heading p,
html.ljpc-fantasy-uefa-active body.lj-desktop #ljpc-fantasy-uefa .pcfy-team-toolbar p,
html.ljpc-unified-pc body.lj-desktop[data-app-route="predictorSix"] #ljpc-six-ui .p6-heading p{
  font-size:14px!important;
}
html.ljpc-fantasy-uefa-active body.lj-desktop #ljpc-fantasy-uefa .pcfy-tabs button,
html.ljpc-unified-pc body.lj-desktop[data-app-route="predictorSix"] #ljpc-six-ui .p6-navrow button{
  min-height:50px!important;font-size:15px!important;padding:0 18px!important;
}

/* Detalle de Partido (.v28-match) en escala UEFA 1392px */
html.ljpc-unified-pc body.lj-desktop[data-app-route="match"] #screen .v28-top{
  min-height:190px!important;padding:22px 32px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="match"] #screen .v28-meta,
html.ljpc-unified-pc body.lj-desktop[data-app-route="match"] #screen .v28-venue{
  font-size:14px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="match"] #screen .v28-side{
  font-size:18px!important;font-weight:800!important;gap:12px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="match"] #screen .v28-team-logo{
  width:46px!important;height:46px!important;max-width:46px!important;max-height:46px!important;flex:0 0 46px!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="match"] #screen .v28-time{
  font-size:22px!important;font-weight:800!important;
}
html.ljpc-unified-pc body.lj-desktop[data-app-route="match"] #screen .v28-tabs,
html.ljpc-unified-pc body.lj-desktop[data-app-route="match"] #screen .v28-tab{
  height:48px!important;min-height:48px!important;font-size:15px!important;font-weight:700!important;
}
`;

const IFRAME_HOME_UEFA_CSS=`
/* REA Home Iframe Lock: Full UEFA Champions League Desktop Scale */
html.ljpc-embedded-home #root .ucl [data-name="stories list container"]{
  width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;margin:8px auto 12px!important;
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
  gap:22px!important;width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;
  margin:12px auto!important;padding:8px 0 18px!important;
}
html.ljpc-embedded-home #root .ucl [data-name="featured hero article card"]{
  height:440px!important;min-height:440px!important;max-height:440px!important;border-radius:14px!important;
}
html.ljpc-embedded-home #root .ucl [data-name="featured hero article card"] img{
  height:100%!important;max-height:440px!important;object-fit:cover!important;
}
`;

function ensureToolsStrip(){
 if(!pc()||!document.body)return;
 const header=document.getElementById('ljpc-unified-pc-header');
 if(!header)return;
 let strip=document.getElementById('ljpc-rea-tools-strip');
 if(!strip){
   strip=document.createElement('div');
   strip.id='ljpc-rea-tools-strip';
   strip.setAttribute('role','region');
   strip.setAttribute('aria-label','Herramientas PC y Modificación de la Liga');
   strip.innerHTML=
     '<div class="ljpc-rea-tools-inner">'+
       '<span class="ljpc-rea-tools-label">🛠️ Herramientas PC y Modificación</span>'+
       '<div class="ljpc-rea-tools-btns">'+
         '<button type="button" class="is-primary" data-rea-pc-action="toggle-native">✏️ Modificar / Controles de esta sección</button>'+
         '<button type="button" data-ljpc-u-go="jrControl">🎛️ JR Control / Admin</button>'+
         '<button type="button" data-ljpc-u-go="pc-tools">🛠️ Herramientas PC</button>'+
         '<button type="button" data-ljpc-u-go="bracketBuilder">🏆 Crear / Editar Cuadro</button>'+
         '<button type="button" data-ljpc-u-go="tableExport">📊 Exportar / Tabla</button>'+
         '<button type="button" data-ljpc-u-go="credentialBuilder">🪪 Credenciales</button>'+
         '<button type="button" data-ljpc-u-go="cedulas">📋 Cédulas</button>'+
         '<button type="button" data-ljpc-u-go="pc-calendar">📅 Calendario</button>'+
         '<button type="button" data-ljpc-u-go="venues">🏟️ Sedes</button>'+
       '</div>'+
     '</div>';
   header.insertAdjacentElement('afterend',strip);
   strip.addEventListener('click',e=>{
     const btn=e.target.closest?.('[data-rea-pc-action="toggle-native"]');
     if(!btn)return;
     e.preventDefault();
     toolsExpanded=!toolsExpanded;
     document.documentElement.classList.toggle('ljpc-rea-show-native',toolsExpanded);
     document.documentElement.classList.add('ljpc-admin-auth');
     document.body?.classList.add('liga-editor');
     const details=document.querySelector('#screen .u18-original');
     if(details)details.open=true;
     const openDrawBtn=document.querySelector('[data-u18-open-draw-original],[data-u18-show-original]');
     if(openDrawBtn&&toolsExpanded)openDrawBtn.click();
     btn.textContent=toolsExpanded?'✅ Ocultar controles nativos de edición':'✏️ Modificar / Controles de esta sección';
   });
 }
}

function ensureMasterLock(){
 if(!pc()){
   document.getElementById('ljpc-rea-uefa-master-lock')?.remove();
   document.getElementById('ljpc-rea-tools-strip')?.remove();
   return;
 }
 // Remove handset shrinking class and ensure full 1366px UEFA desktop viewport when in PC mode
 document.documentElement.classList.remove('ljpc-forced-handset');
 const vp=document.querySelector?.('meta[name="viewport"]');
 if(vp&&mode()==='desktop'){
   vp.setAttribute('content','width=1366,initial-scale=0.28,minimum-scale=0.15,maximum-scale=5,user-scalable=yes');
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
     if(!doc.getElementById('ljpc-rea-iframe-home-lock')){
       const s=doc.createElement('style');
       s.id='ljpc-rea-iframe-home-lock';
       s.textContent=IFRAME_HOME_UEFA_CSS;
       doc.head.appendChild(s);
     }
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
