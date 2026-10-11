/* Mejorar.zip (52 capturas). Decoración de nodos originales: sin sustituir
   controles, listeners, datos, permisos, temporizadores ni documentos. */
(()=>{
 'use strict';
 const themes={ligaControl:'sport',adminFut:'sport',jrControl:'sport',leagueTools:'facets',discipline:'facets',recruitment:'sport',refereeOffline:'sport',cedulas:'orbit',players:'orbit',v38Weekly:'cyan',bracketBuilder:'facets',publicationCenter:'prism',profile:'prism',accountPassword:'orbit',accountDevices:'facets',accountSecurity:'prism',accountPrivacy:'orbit',accountPreferences:'cyan',accountAdvisor:'facets',notifications:'cyan',permissionBuilder:'orbit',matchCenter:'sport',matchday:'sport',quiniela:'prism',agendaBuilder:'cyan',weatherFields:'cyan',cedulaBuilder:'orbit',rulebook:'facets',ligaQR:'prism',televisados:'sport',v38Alerts:'cyan'};
 const paper='.v131-cedula-sheet,.v102-rulebook-paper,canvas,.v635-preview,.v640-preview,.v64-poster,.v64-preview,.v938-png-preview';
 const layouts='.v562-page,.v562-registry,.v60-tool-page,.v94-discipline-page,.v190-recruit-page,.v66-directory,.v12-profile-page,.v569-page,.v46-account-page,.v635-page,.v92-matchcenter,.v618-quiniela,.v440-page-route,.v561-league';
 const panels='.v562-panel,.v562-info,.v562-selector,.v726-tools-hero,.v726-tool-section,.v638-filter-panel,.v638-cedula-top,.v1131-tools,.v562-filters,.v562-team,.v553-week-filter,.v553-week-group,.v553-pending,.v651-controls,.v656-generate-wrap,.v651-slots,.v653-results,.v642-publications-card,.v1004-pub-editor,.v642-preview-card,.v161-global-center,.v569-profile-hero,.v12-profile-menu,.v569-card,.v1300-panel,.v46-ref-category,.v840-match-feed,.v1222-assistant,.v1082-push,.v105-bottom,.v635-form,.v1062-tools,.v92-match-picker,.v92-score-card,.v196-stream-hub,.v92-section,.v618-q-rules,.v970-jornada-progress,.v618-q-card,.v1390-rank,.v160-matchday-extra,.v164-matchday-match,.v164-matchday-timeline,.v60-tool-section,.ag1073,.ag1074-twilio,.v1073-dashboard,.v921-field-card,.v64-qr-card,.v64-qr-how,.v440-telecast,.v713-auto-panel,.v190-recruit-card,.v1390-panel,.v190-publish-card,.v190-saved,.v1073-dashboard-card,.ljr-editor-hub,.ljr-bc-panel,.ljr-admin-area,.ljr-admin-guide,.ljr-simple-intro,.cms-design-intro,.ljr-admin-howto,.v1081-card,.v640-cedula-combined,.v938-png-category-card,.v102-rulebook-control-card,.v102-rulebook-toolbar,.v729-editor-card,.v729-schedule-card,.v729-output-card,.v1211-recurrence,.v1210-review';
 const rows='.v562-player,.v94-discipline-row,.v562-match,.v66-cedula-row,.v638-cedula-card,.v656-generate-card,.v12-profile-row,.v569-menu-row,.v440-tv-match,.v412-match-card,.v412-fixture,.v713-auto-card';
 const dialogs='.ljr-content-studio,.ljr-admin-dialog,.ljr-editor-dialog,.ljr-bc-dialog,.v1081-dialog,.v105-dialog,[role="dialog"][aria-label="Ajustes de la aplicación"],[role="dialog"][aria-label="Mi avatar y mi camiseta"]';
 const iconSlots={'.ljr-editor-hub [data-editor-open="compose"]>b':'edit','.ljr-editor-hub [data-editor-open="review"]>b':'checkCircle','.ljr-editor-hub [data-editor-open="schedule"]>b':'clock','.ljr-editor-hub [data-editor-open="pages"]>b':'news','.ljr-editor-hub [data-editor-open="backup"]>b':'download'};
 const lowerPanels='.v668-field-ops,.v668-checker-panel,.ag1075,.ag1073-details,.v190-ai-assist,.v73-motion-banner,.v412-competition-card';
 function edge(el){
  if(el.querySelector(':scope>.ljr-design-edge'))return;
  const s=document.createElement('span');s.className='ljr-design-edge';s.setAttribute('aria-hidden','true');el.append(s);
 }
 function decorate(root){
  root.querySelectorAll(paper).forEach(el=>{if(!el.hasAttribute('data-design-paper'))el.setAttribute('data-design-paper','');});
  root.querySelectorAll(layouts).forEach(el=>{if(!el.closest('[data-design-paper]')&&!el.hasAttribute('data-design-layout'))el.setAttribute('data-design-layout','');});
  root.querySelectorAll(panels+','+lowerPanels).forEach((el,i)=>{
   if(el.closest('[data-design-paper]')||el.hasAttribute('data-design-card'))return;
   // A nested structural wrapper shares its parent face, avoiding double plates.
   const parent=el.parentElement?.closest('[data-design-card="panel"]');
   el.setAttribute('data-design-card',parent?'shared':'panel');
   if(!parent){el.setAttribute('data-design-variant',String(i%4));if(i%3!==1)edge(el);}
  });
  root.querySelectorAll(rows).forEach((el,i)=>{
   if(el.closest('[data-design-paper]')||el.hasAttribute('data-design-card'))return;
   el.setAttribute('data-design-card','row');if(i%4===0)edge(el);
  });
  root.querySelectorAll('.ljr-cms-entry button,.ljr-editor-hub-grid>button,.v726-tool-card,.v656-generate-card').forEach((el,i)=>{if(i%3!==1)edge(el);});
  for(const [selector,name] of Object.entries(iconSlots))root.querySelectorAll(selector).forEach(el=>{
   if(el.querySelector('svg[data-ljr-icon]'))return;
   const icon=window.LJR_ICONS?.node(name);if(icon)el.replaceChildren(icon);
  });
  root.querySelectorAll('.v12-profile-row-icon,.v569-profile-menu-row>span:first-child').forEach(el=>{
   if(el.querySelector('[data-ljr-icon]'))return;
   const text=el.parentElement.textContent.toLowerCase();
   const names=[[/contraseñ/,'shield'],[/dispositivo/,'settings'],[/biometr|seguridad/,'shield'],[/privacidad/,'shield'],[/preferencia/,'settings'],[/asistente/,'stats'],[/nube/,'download'],[/siguiendo/,'heart'],[/notificacion/,'notification'],[/idioma/,'news'],[/salir|cerrar sesión/,'user']];
   const name=names.find(([pattern])=>pattern.test(text))?.[1];const icon=name&&window.LJR_ICONS?.node(name);if(icon)el.replaceChildren(icon);
  });
  root.querySelectorAll('[data-design-card="panel"]>h2,[data-design-card="panel"]>h3,[data-design-card="panel"]>header h2,[data-design-card="panel"]>header h3').forEach(el=>{
   if(el.querySelector('svg,img')||el.closest('[data-design-paper]'))return;
   const text=el.textContent.toLowerCase();const names=[[/partido|jornada|semana/,'calendar'],[/jugador/,'player'],[/equipo/,'team'],[/aviso|notific/,'notification'],[/public|archivo|document|cédula/,'news'],[/clima|cancha|campo/,'competition'],[/revisión|configur|preferencia/,'settings'],[/permiso|seguridad|privacidad/,'shield']];
   const name=names.find(([pattern])=>pattern.test(text))?.[1];const icon=name&&window.LJR_ICONS?.node(name);
   if(icon){icon.classList.add('ljr-captured-heading-icon');el.prepend(icon);}
  });
 }
 let pending=false;
 function scan(){
  pending=false;
  const screen=document.getElementById('screen');const route=document.body?.dataset.appRoute||'';
  if(screen){
   if(themes[route]){if(screen.dataset.capturedDesign!==themes[route])screen.dataset.capturedDesign=themes[route];decorate(screen);}
   else {
    screen.removeAttribute('data-captured-design');
    // Only the captured match-day/fixture blocks in otherwise protected screens.
    if(['home','competition','results'].includes(route))screen.querySelectorAll('.v160-matchday-extra,.v412-shell').forEach(el=>{if(!el.hasAttribute('data-captured-block'))el.setAttribute('data-captured-block','sport');decorate(el);});
   }
  }
  document.querySelectorAll(dialogs).forEach(el=>{
   if(!el.hasAttribute('data-captured-dialog'))el.setAttribute('data-captured-dialog',el.matches('.ljr-bc-dialog')?'orbit':el.matches('.ljr-content-studio')?'prism':'cyan');decorate(el);
  });
 }
 function queue(){if(!pending){pending=true;requestAnimationFrame(scan);}}
 function start(){new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});window.addEventListener('hashchange',queue);scan();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
