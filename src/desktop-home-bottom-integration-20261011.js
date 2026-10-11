/* Inicio PC: sólo orden VISUAL del pie de página ante módulos nativos.
   Los cuadros/controles siguen montados en #screen y conservan handlers,
   favoritos, datos, reproductor y rutas de su módulo original. */
(function(){
 'use strict';
 if(window.__LJR_PC_HOME_BOTTOM_INTEGRATED_20261011__)return;
 window.__LJR_PC_HOME_BOTTOM_INTEGRATED_20261011__=true;
 const FOOTER_ID='ljpc-home-integrated-footer';
 const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
 const desktop=()=>{
   const mode=new URLSearchParams(location.search).get('mode')||'';
   return !['mobile','apk'].includes(mode)&&
    (mode==='desktop'||innerWidth>=1024)&&
    document.body.classList.contains('lj-desktop');
 };
 const links=[
   [['Inicio','home'],['Partidos','competition'],['Clasificación','standings'],['Goleadores','scorers']],
   [['Liga TV','video'],['Momentos','moments'],['Historia','history'],['Equipos','teams']],
   [['Calendario','v4-calendar'],['Fantasy','fantasy'],['Reglamento','rulebook'],['Más herramientas','more']]
 ];
 let timer=0;
 const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function footerMarkup(){
   return '<div class="ljpc-home-footer-inner">'+
     '<div class="ljpc-home-footer-title"><img src="./assets/branding/escudo-liga-azul-sin-fondo-v1007.png" alt="Escudo Liga Juventino Rosas">'+
     '<div><b>LIGA JUVENTINO ROSAS</b><small>Partidos, resultados, historia, vídeos y fútbol de nuestra comunidad.</small></div></div>'+
     links.map((group,index)=>'<nav aria-label="'+['Competición','Contenido','Herramientas'][index]+'">'+
       '<strong>'+['COMPETICIÓN','DESCUBRE','HERRAMIENTAS'][index]+'</strong>'+
       group.map(([label,to])=>'<button type="button" data-desk-route="'+esc(to)+'">'+esc(label)+'</button>').join('')+
     '</nav>').join('')+
     '</div><div class="ljpc-home-footer-legal">© 2026 Liga Juventino Rosas · Sitio oficial en modo PC</div>';
 }
 function sync(){
   const screen=document.getElementById('screen');
   const frame=document.getElementById('ljpc-exact-html-home');
   const footer=document.getElementById(FOOTER_ID);
   const nativeExtras=!!screen?.querySelector(':scope > #safeHomeExtra, :scope > #v105-bottom[data-v105-route="home"]');
   const active=desktop()&&route()==='home'&&!!frame&&nativeExtras;
   try{
     const doc=frame?.contentDocument;
     if(doc?.body)doc.body.classList.toggle('ljpc-supplements-active',active);
   }catch(_){}
   if(!active){
     if(footer)footer.remove();
     return;
   }
   if(!footer){
     const element=document.createElement('footer');
     element.id=FOOTER_ID;
     element.setAttribute('aria-label','Pie de página de Liga Juventino Rosas');
     element.innerHTML=footerMarkup();
     screen.insertAdjacentElement('afterend',element);
   }else if(footer.previousElementSibling!==screen){
     screen.insertAdjacentElement('afterend',footer);
   }
 }
 function schedule(){
   clearTimeout(timer);timer=setTimeout(sync,35);
 }
 function boot(){
   const screen=document.getElementById('screen');
   if(screen)new MutationObserver(schedule).observe(screen,{childList:true});
   window.addEventListener('hashchange',schedule);
   window.addEventListener('resize',schedule);
   window.addEventListener('ljr:desktop-home-request',schedule);
   document.addEventListener('load',e=>{
     if(e.target?.id==='ljpc-exact-html-home')schedule();
   },true);
   schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();
