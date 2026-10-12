/* Mejorar.zip (52 capturas). Decoración de nodos originales: sin sustituir
   controles, listeners, datos, permisos, temporizadores ni documentos. */
(()=>{
 'use strict';
 const themes={ligaControl:'sport',adminFut:'sport',jrControl:'sport',leagueTools:'facets',discipline:'facets',recruitment:'sport',refereeOffline:'sport',cedulas:'orbit',players:'orbit',v38Weekly:'cyan',bracketBuilder:'facets',publicationCenter:'prism',profile:'prism',accountPassword:'orbit',accountDevices:'facets',accountSecurity:'prism',accountPrivacy:'orbit',accountPreferences:'cyan',accountAdvisor:'facets',notifications:'cyan',permissionBuilder:'orbit',matchCenter:'sport',matchday:'sport',quiniela:'prism',agendaBuilder:'cyan',weatherFields:'cyan',cedulaBuilder:'orbit',rulebook:'facets',ligaQR:'prism',televisados:'sport',v38Alerts:'cyan',suspensionTool:'facets',accountEdit:'orbit',news:'prism',search:'cyan',scheduleChanges:'facets',credentialBuilder:'orbit'};
 const paper='.v131-cedula-sheet,.v102-rulebook-paper,canvas,.v635-preview,.v640-preview,.v64-poster,.v64-preview,.v938-png-preview';
 const layouts='.v562-page,.v562-registry,.v60-tool-page,.v94-discipline-page,.v190-recruit-page,.v66-directory,.v12-profile-page,.v569-page,.v46-account-page,.v635-page,.v129-page,.v1300-page,.v412-shell,.v92-matchcenter,.v618-quiniela,.v440-page-route,.v561-league';
 const panels='.v1005-credential-intro,.v64-form-grid,.v1011-hub,#v124-player-registry,.v129-card,.v425-panel,.v425-summary,.v1062-writer,.v562-panel,.v562-info,.v562-selector,.v726-tools-hero,.v726-tool-section,.v638-filter-panel,.v638-cedula-top,.v1131-tools,.v562-filters,.v562-team,.v553-week-filter,.v553-week-group,.v553-pending,.v651-controls,.v656-generate-wrap,.v651-slots,.v653-results,.v642-publications-card,.v1004-pub-editor,.v642-preview-card,.v161-global-center,.v569-profile-hero,.v12-profile-menu,.v569-card,.v1300-panel,.v46-ref-category,.v840-match-feed,.v1222-assistant,.v1082-push,.v105-bottom,.v635-form,.v1062-tools,.v92-match-picker,.v92-score-card,.v196-stream-hub,.v92-section,.v618-q-rules,.v970-jornada-progress,.v618-q-card,.v1390-rank,.v160-matchday-extra,.v164-matchday-match,.v164-matchday-timeline,.v60-tool-section,.ag1073,.ag1074-twilio,.v1073-dashboard,.v921-field-card,.v64-qr-card,.v64-qr-how,.v440-telecast,.v713-auto-panel,.v190-recruit-card,.v1390-panel,.v190-publish-card,.v190-saved,.v1073-dashboard-card,.ljr-editor-hub,.ljr-bc-panel,.ljr-admin-area,.ljr-admin-guide,.ljr-simple-intro,.cms-design-intro,.ljr-admin-howto,.v1081-card,.v640-cedula-combined,.v938-png-category-card,.v102-rulebook-control-card,.v102-rulebook-toolbar,.v729-editor-card,.v729-schedule-card,.v729-output-card,.v1211-recurrence,.v1210-review';
 const tableCards='.v553-week-group,.v412-competition-card';
 const rows='.v414-player-row,.v412-news-card,.v105-card,.v1081-card,.v562-player,.v94-discipline-row,.v562-match,.v66-cedula-row,.v638-cedula-card,.v656-generate-card,.v12-profile-row,.v569-menu-row,.v440-tv-match,.v412-match-card,.v412-fixture,.v713-auto-card';
 const dialogs='.liga-media-modal>section:is([aria-label="Administración de la Liga"],[aria-label="Cambiar contraseña"],[aria-label="Mis dispositivos"],[aria-label="Invitaciones de hospitalidad"]),.ljr-content-studio,.ljr-admin-dialog,.ljr-editor-dialog,.ljr-bc-dialog,.v1081-dialog,.v105-dialog,[role="dialog"][aria-label="Ajustes de la aplicación"],[role="dialog"][aria-label="Mi avatar y mi camiseta"]';
 const iconSlots={'.ljr-editor-hub [data-editor-open="compose"]>b':'edit','.ljr-editor-hub [data-editor-open="review"]>b':'checkCircle','.ljr-editor-hub [data-editor-open="schedule"]>b':'clock','.ljr-editor-hub [data-editor-open="pages"]>b':'news','.ljr-editor-hub [data-editor-open="backup"]>b':'download'};
 const lowerPanels='.v668-field-ops,.v668-checker-panel,.ag1075,.ag1073-details,.v190-ai-assist,.v73-motion-banner,.v412-competition-card';
 function edge(el){
  if(el.querySelector(':scope>.ljr-design-edge'))return;
  const s=document.createElement('span');s.className='ljr-design-edge';s.setAttribute('aria-hidden','true');el.append(s);
 }
 function decorate(root){
  // Paint only controls and independent records, never their structural wrappers.
  const clear='.v1005-credential-intro,.v1011-hub,#v124-player-registry,.v1013-pdf-panel,form,fieldset,header,div:has(>label),section:has(>label),section:has(>form),div:has(>select),label:has(input,select,textarea),.v569-card,.v569-profile-account-menu,.v12-profile-menu,.v1300-panel,.v1300-detail,.v1300-page,.v1150-privacy-banner,.v1150-privacy-details,.v1150-privacy-details>div,.v105-bottom,.v105-head,.v105-grid,.v105-actions,.v105-form,.v105-list,.v1126-wrap,.v1126-directory,.v1126-editor,.v1126-form,.v1126-toolbar,.v1126-metrics,.v1125-wrap,.v1125-editor,.v1125-form,.v1125-stats,.v1130-view,.v1130-bar,.v1130-filters,.v1130-summary,.v1130-exports,.v875-meeting-options,.v1166-meeting-roles,.v1166-meeting-role,.v105-meeting-form,.ljr-meeting-hub,.mh-body,.mh-fields,.mh-team-picker,.mh-team-filters,.mh-stats,.v46-ref-notifications-main,.v46-ref-master,.v46-ref-settings,.v46-ref-setting,.v46-ref-match-alerts,.v46-ref-category,.v46-ref-categories,.v46-ref-category-panel,.v46-ref-hours,.v46-ref-dnd,.v1082-push,.v1082-filters,.v1082-types,.v1082-actions,.v1081,.v1081-two,.v1081-actions,.v1081-channel-options,.v196-stream-hub,.v161-global-center,.ljr-admin-area,.ljr-admin-guide,.ljr-admin-grid,.ljr-admin-dialog-body,.ljr-admin-howto,.ljr-editor-hub,.ljr-editor-hub-grid,.cms-design-intro,.cms-form,.v893-shirt-customize,.v893-color-control,.v800-shirt-fields,.v893-team-preview,.v906-category-preview,.ljr-photo-upload,.v713-auto-panel,.v713-auto-filters,.v129-editor,.v129-grid,.v129-current,.v129-actions,.v425-panel,.v425-status-grid,.v425-summary,.v64-form-grid,.v1062-writer,.v412-modebar,.v414-search-join,.v412-search-tools,.v414-player-cover,.v414-results';
  root.querySelectorAll(clear).forEach(el=>{
   if(el.closest(paper)||el.matches('[data-design-paper]'))return;
   if(!el.hasAttribute('data-design-surface'))el.setAttribute('data-design-surface','clear');
   el.querySelector(':scope>.ljr-design-edge')?.remove();
  });
  root.querySelectorAll(paper).forEach(el=>{if(!el.hasAttribute('data-design-paper'))el.setAttribute('data-design-paper','');});
  root.querySelectorAll(layouts).forEach(el=>{if(!el.closest('[data-design-paper]')&&!el.hasAttribute('data-design-layout'))el.setAttribute('data-design-layout','');});
  root.querySelectorAll(panels+','+lowerPanels).forEach((el,i)=>{
   if(el.closest('[data-design-paper]')||el.hasAttribute('data-design-card'))return;
   // A nested structural wrapper shares its parent face, avoiding double plates.
   const parent=el.parentElement?.closest('[data-design-card="panel"]');
   el.setAttribute('data-design-card',el.matches(tableCards)?'table':parent?'shared':'panel');
   if(!parent&&!el.matches(tableCards)&&!el.hasAttribute('data-design-surface')){el.setAttribute('data-design-variant',String(i%4));if(i%3!==1&&!el.closest('[data-design-paper]'))edge(el);}
  });
  root.querySelectorAll(rows).forEach((el,i)=>{
   if(el.closest('[data-design-paper]')||el.hasAttribute('data-design-card'))return;
   el.setAttribute('data-design-card','row');if(i%4===0)edge(el);
  });
  root.querySelectorAll('.ljr-cms-entry button,.ljr-editor-hub-grid>button,.v726-tool-card,.v656-generate-card').forEach((el,i)=>{if(i%3!==1&&!el.closest('[data-design-paper]'))edge(el);});
  for(const [selector,name] of Object.entries(iconSlots))root.querySelectorAll(selector).forEach(el=>{
   if(el.querySelector('svg[data-ljr-icon]'))return;
   const icon=window.LJR_ICONS?.node(name);if(icon)el.replaceChildren(icon);
  });
  root.querySelectorAll('.v12-profile-row,.v569-profile-menu-row,.v1300-menu-row,.v46-ref-category-head').forEach(el=>{el.dataset.designSurface='line';el.querySelector(':scope>.ljr-design-edge')?.remove();});
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
 let chromaticId=0;
 function chromaticIcon(svg){
  if(!svg||svg.dataset.chromaticIcon)return;
  svg.dataset.chromaticIcon='1';
  const ns='http://www.w3.org/2000/svg',id='ljr-chromatic-'+(++chromaticId),defs=document.createElementNS(ns,'defs'),g=document.createElementNS(ns,'linearGradient');
  g.id=id;g.setAttribute('x2','1');g.setAttribute('y2','1');
  ['#67edff','#a9b6ff','#fbb3e4','#ffe0a4','#9ef7df'].forEach((color,i)=>{const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',i/4);stop.setAttribute('stop-color',color);g.append(stop);});defs.append(g);
  // Preserve the Miapp silhouette and transparent holes; tint only its ink.
  [svg,...svg.querySelectorAll('path,circle,rect,line,polyline,polygon')].forEach(el=>{
   for(const prop of ['fill','stroke'])if(el.style.getPropertyValue(prop)==='currentColor'||el.getAttribute(prop)==='currentColor')el.style.setProperty(prop,'url(#'+id+')','important');
  });svg.prepend(defs);
 }
 function accents(root){
  const title=root.querySelector('h1:not([data-design-paper] *)');if(title)title.classList.add('ljr-chromatic-title');
  const summary=root.querySelector('.v562-panel:has(.v562-sync-grid) h2');if(summary)summary.classList.add('ljr-chromatic-title');
  root.querySelectorAll('.ljr-cms-entry :is([data-cms-story],[data-cms-design]) svg,.v726-quick-grid>:first-child svg,.v12-profile-row-icon svg[data-ljr-icon="shield"]').forEach(chromaticIcon);
 }
 let pending=false;
 function scan(){
  pending=false;
  const screen=document.getElementById('screen');
  const mode=new URLSearchParams(location.search).get('mode');
  if(mode==='desktop'||(!['mobile','apk'].includes(mode)&&window.innerWidth>=1024)){
   screen?.removeAttribute('data-captured-design');
   document.querySelectorAll('[data-captured-header]').forEach(el=>el.removeAttribute('data-captured-header'));
   return;
  }
  const route=document.body?.dataset.appRoute||'';
  const topbar=document.querySelector('#app>.topbar');
  if(topbar){
   if(['news','search','profile','accountEdit','accountPrivacy','accountPreferences','scheduleChanges','suspensionTool','notifications','weatherFields','credentialBuilder'].includes(route))topbar.dataset.capturedHeader='1';
   else topbar.removeAttribute('data-captured-header');
  }
  if(screen){
   if(themes[route]){if(screen.dataset.capturedDesign!==themes[route])screen.dataset.capturedDesign=themes[route];decorate(screen);accents(screen);}
   else {
    screen.removeAttribute('data-captured-design');
    // Only the captured match-day/fixture blocks in otherwise protected screens.
    if(['appInstall','scorers'].includes(route))screen.querySelectorAll('.ljr-cms-entry').forEach(el=>{el.dataset.capturedBlock='prism';decorate(el);accents(el);});
    if(['home','competition','results'].includes(route))screen.querySelectorAll('.v160-matchday-extra,.v412-shell').forEach(el=>{if(!el.hasAttribute('data-captured-block'))el.setAttribute('data-captured-block','sport');decorate(el);});
   }
  }
  document.querySelectorAll(dialogs).forEach(el=>{
   if(!el.hasAttribute('data-captured-dialog'))el.setAttribute('data-captured-dialog',el.matches('.ljr-bc-dialog')?'orbit':el.matches('.ljr-content-studio')?'prism':'cyan');decorate(el);accents(el);
  });
 }
 function queue(){if(!pending){pending=true;requestAnimationFrame(scan);}}
 function start(){
  // Text-only clocks, SVG effects and our own edges cannot add a new control.
  new MutationObserver(records=>{
   if(records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&n.namespaceURI!=='http://www.w3.org/2000/svg'&&!n.matches?.('.ljr-design-edge'))))queue();
  }).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',queue);window.addEventListener('resize',queue);scan();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
