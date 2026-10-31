/* Desktop-only persistent header and footer. One navigation identity across the
   original home iframe, desktop-sections pages and native desktop screens.
   NEVER touches app mobile or APK. */
(function(){
'use strict';
if(window.__LJPC_SHARED_SHELL_OCT11__)return;
window.__LJPC_SHARED_SHELL_OCT11__=true;
const NAV=[
 ['Partidos','pc-fixtures'],['Clasificación','pc-standings'],
 ['Liga TV','video'],['Sorteos','pc-draws'],['Gaming','gamingPortal'],
 ['Datos','pc-data'],['Más','pc-tools']
];
const MENUS={
 Gaming:[
  ['Todos los juegos','gamingPortal'],
  ['Fantasy Football','fantasy'],
  ['Pronostica Seis','predictorSix'],
  ['Bracket','bracketBuilder'],
  ['Gol del Día','moments'],
  ['Quiniela','quiniela'],
  ['Quiz Arena','quizArena'],
  ['Más o menos','moreLess'],
  ['Mi perfil de juegos','accountLogin']
 ],
 Datos:[
  ['Estadísticas de equipo','pc-data','data-team'],
  ['Estadísticas de jugador','pc-data','data-player'],
  ['Máximo goleador','pc-scorers'],
  ['Fase de clasificación','pc-standings'],
  ['Estadísticas históricas','history','history-link'],
  ['Performance Zone','safe-performance']
 ],
 Más:[['Historia','historia','history-toggle'],
 ['Equipos','equipos','history-child'],['Noticias','noticias','history-child'],
 ['Historia de la liga','historia','history-child'],
 ['Temporadas','temporadas','history-child'],['Estadísticas históricas','estadisticas','history-child'],
 ['Vídeos','videos','history-child'],['Equipos históricos','historicos','history-child'],
 ['Más títulos','titulos','history-child'],['Sobre','sobre','history-child'],
 ['Tienda (clubes)','club-store'],
 ['Herramientas PC','pc-tools'],['Match Day','matchday'],['Calendario','pc-calendar'],
 ['Credenciales','credentialBuilder'],['Reglamento','rulebook']]
};
const logo='./assets/branding/escudo-liga-azul-sin-fondo-v1007.png';
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const desktop=()=>!['mobile','apk'].includes(mode())&&(mode()==='desktop'||innerWidth>=1024);
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
const go=r=>{location.hash='#/'+r;};
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const active=r=>{
 if(['pc-fixtures','competition','match','matchCenter','matchday'].includes(r))return 'pc-fixtures';
 if(['pc-standings','standings','positions'].includes(r))return 'pc-standings';
 if(['video','moments'].includes(r))return 'video';
 if(['pc-draws','draws','pc-bracket','bracket'].includes(r))return 'pc-draws';
 if(['gamingPortal','fantasy','fantasyTeam','fantasyLeagues','quiniela','predictor','predictorSix','gaming','quizArena','quiz','moreLess','moreLessHub','moreLessGallery'].includes(r))return 'predictorSix';
 if(['safe-data','pc-data','pc-scorers','pc-notifications','scorers','stats','v38Stats','rankings'].includes(r))return 'pc-data';
 if(['teams','following','teamDetail','compareTeams','teamCompare','playerCompare','news','newsDetail','about','history','club-store'].includes(r))return 'pc-tools';
 if(r==='home')return 'home';
 return 'pc-tools';
};
function logoUrl(name){
 const n=String(name||'').trim();if(!n)return '';
 try{
  let v=window.LJR_OFFICIAL_API?.getLogo?.(n)||window.V66_OFFICIAL_DIRECTORY?.logoFor?.(n)||window.LJR_TEAM_LOGOS?.get?.(n);
  if(!v){
   const all=window.LJR_OFFICIAL_DATA?.team_logos||{};
   const key=Object.keys(all).find(k=>k.trim().toLowerCase()===n.toLowerCase());
   if(key)v=all[key];
  }
  v=typeof v==='string'?v:v?.local||v?.app||v?.source||v?.url||'';
  const u=String(v||'').trim();
  if(u.startsWith('assets/'))return './'+u;
  if(u.startsWith('public/'))return './'+u.substring(7);
  return /^(https:\/\/|\.\/|\/)/i.test(u)?u:'';
 }catch(_){return ''}
}
function upcoming(){
 const db=window.LJR_OFFICIAL_DATA||window.LJR_OFFICIAL_API?.getData?.();
 const matches=[];
 for(const [id,c] of Object.entries(db?.categories||{})){
  for(const g of c.fixtures||[])for(const r of g.rows||[]){
   if(!Array.isArray(r)||!r[2]||!r[6]||c.fixture_decisions?.[String(r[0])])continue;
   const m=String(r[8]||'').match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2})$/);
   if(!m||m[4]==='00:00')continue;
   if(/^\d+$/.test(String(r[3]))&&/^\d+$/.test(String(r[5])))continue;
   const iso=m[3]+'-'+m[2]+'-'+m[1]+'T'+m[4]+':00';
   if(new Date(iso).getTime()<Date.now())continue;
   matches.push({key:iso,cat:id,round:r[1],home:r[2],away:r[6],time:m[4],day:m[1]+'/'+m[2]+'/'+m[3]});
  }
 }
 return matches.sort((a,b)=>a.key.localeCompare(b.key)).slice(0,8);
}
function crest(n){
 const u=logoUrl(n);
 if(u)return '<img class="ljpc-u-team-logo" src="'+escapeHtml(u)+'" alt="" loading="lazy">';
 return '<span class="ljpc-u-team-fallback" aria-hidden="true">⚽</span>';
}
function fixturesHTML(){
 const matches=upcoming();
 return matches.length?matches.map(m=>
  '<button class="ljpc-u-match" type="button" data-ljpc-u-go="pc-fixtures" aria-label="'+escapeHtml(m.home+' contra '+m.away)+'">'+
  '<small>Jornada '+escapeHtml(m.round)+' · '+escapeHtml(m.day)+' · '+escapeHtml(m.time)+'</small>'+
  '<span>'+crest(m.home)+'<b>'+escapeHtml(m.home)+'</b></span>'+
  '<span>'+crest(m.away)+'<b>'+escapeHtml(m.away)+'</b></span></button>'
 ).join(''):'<button class="ljpc-u-match ljpc-u-empty" type="button" data-ljpc-u-go="pc-fixtures">'+
 '<small>Calendario oficial</small><span>Consultar próximos partidos</span></button>';
}
function navMarkup(){
 const items=NAV.map(([label,r])=>{
  const group=MENUS[label];
  return group?'<details class="ljpc-u-group" data-ljpc-u-group="'+label+'"><summary data-ljpc-u-highlight="'+r+'">'+
   label+' <span aria-hidden="true">⌄</span></summary><div class="ljpc-u-dropdown" role="group" aria-label="'+label+'">'+
   group.map(([name,to,kind])=>{
     if(kind==='history-child')return '';
     if(kind==='data-team'||kind==='data-player')
       return '<button type="button" data-ljpc-u-go="pc-data" data-ljpc-u-data-view="'+(kind==='data-team'?'team':'player')+'">'+escapeHtml(name)+'</button>';
     if(kind==='history-link')
       return '<button type="button" data-ljpc-u-history-section="estadisticas">'+escapeHtml(name)+'</button>';
     if(kind==='history-toggle')return '<button type="button" class="ljpc-u-history-main" data-ljpc-u-history-toggle aria-controls="ljpc-u-history-submenu" aria-expanded="false">'+escapeHtml(name)+' <span aria-hidden="true">⌄</span></button>'+
      '<div class="ljpc-u-history-submenu" id="ljpc-u-history-submenu" hidden>'+
      group.filter(([,r,k])=>k==='history-child').map(([text,section])=>
       '<button type="button" class="ljpc-u-history-child'+
        (['temporadas','estadisticas','videos','historicos','titulos'].includes(section)?' ljpc-u-history-inner':'')+
        '" data-ljpc-u-history-section="'+section+'">'+escapeHtml(text)+'</button>').join('')+'</div>';
     return '<button type="button" data-ljpc-u-go="'+to+'">'+escapeHtml(name)+'</button>';
   }).join('')+
   '</div></details>':'<button type="button" data-ljpc-u-go="'+r+'" data-ljpc-u-highlight="'+r+'">'+label+'</button>';
 }).join('');
 return '<div id="ljpc-unified-pc-header" role="banner" aria-label="Cabecera universal de escritorio">'+
 '<div class="ljpc-u-nav"><div class="ljpc-u-wrap">'+
 '<button class="ljpc-u-brand" type="button" data-ljpc-u-go="home" aria-label="Liga Juventino Rosas: ir al Inicio"><img alt="" src="'+logo+'"><span>LIGA<br>JUVENTINO</span></button>'+
 '<nav class="ljpc-u-links" aria-label="Navegación PC">'+items+'</nav>'+
 '<button class="ljpc-u-login" type="button" data-ljpc-u-go="accountLogin">Iniciar sesión <span aria-hidden="true">◉</span></button>'+
 '</div></div><div class="ljpc-u-scorebar"><div class="ljpc-u-wrap ljpc-u-score-wrap">'+
 '<div id="ljpc-unified-pc-matches" class="ljpc-u-matchlist">'+fixturesHTML()+'</div>'+
 '<button class="ljpc-u-all" type="button" data-ljpc-u-go="pc-fixtures">▣ Ver todos los partidos</button>'+
 '</div></div></div>';
}
function footerMarkup(){
 const group=(title,items)=>'<section><h3>'+title+'</h3>'+items.map(([name,r])=>
  '<button data-ljpc-u-go="'+r+'" type="button">'+escapeHtml(name)+'</button>').join('')+'</section>';
 return '<div id="ljpc-unified-pc-footer" role="group">'+
 '<div class="ljpc-u-sponsor">INFORMACIÓN Y COLABORADORES DE LA LIGA<br><span>LIGA JUVENTINO ROSAS · EQUIPOS PARTICIPANTES · AFICIÓN</span></div>'+
 '<footer class="ljpc-u-footer"><div class="ljpc-u-wrap ljpc-u-footer-columns">'+
 '<section class="ljpc-u-footer-brand"><img src="'+logo+'" alt="Escudo Liga Juventino Rosas"><strong>LIGA JUVENTINO ROSAS</strong><p>Resultados, clasificación, equipos, noticias y juegos de la liga.</p></section>'+
 group('DESCUBRE',[['Partidos','pc-fixtures'],['Clasificación','pc-standings'],['Liga TV','video'],['Sorteos','pc-draws']])+
 group('COMPETICIÓN',[['Equipos','teams'],['Datos','pc-data'],['Fantasy','fantasy'],['Historia','history']])+
 group('INFORMACIÓN',[['Noticias','news'],['Reglamento','rulebook'],['Más','more'],['Sobre la liga','about']])+
 group('HERRAMIENTAS',[['Calendario','pc-calendar'],['Credenciales','credentialBuilder'],['Match Day','matchday'],['Herramientas PC','pc-tools']])+
 '</div><div class="ljpc-u-wrap ljpc-u-footnote">© 2026 Liga Juventino Rosas · Sitio en español</div></footer></div>';
}
let previousRoute=null;
function selectNav(){
 const root=document.getElementById('ljpc-unified-pc-header');if(!root)return;
 const r=route(),selected=active(r);
 root.querySelectorAll('[data-ljpc-u-highlight]').forEach(b=>{
  if(b.tagName==='SUMMARY')b.setAttribute('aria-expanded',String(!!b.parentElement?.open));
  const on=b.dataset.ljpcUHighlight===selected;
  b.classList.toggle('active',on);
  if(b.tagName==='BUTTON'){if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
 });
 if(previousRoute!==r){
  root.querySelectorAll('details[open]').forEach(closeNavGroup);
  root.querySelectorAll('.ljpc-u-history-submenu').forEach(x=>{x.hidden=true});
  root.querySelectorAll('[data-ljpc-u-history-toggle]').forEach(x=>x.setAttribute('aria-expanded','false'));
  previousRoute=r;
 }
}
function closeNavGroup(details){
 if(!details)return;
 const panel=details.querySelector('.ljpc-u-dropdown');
 try{if(panel?.matches?.(':popover-open'))panel.hidePopover()}catch(_){}
 panel?.classList.remove('ljpc-u-popup-fallback');
 details.open=false;
 details.querySelector('summary')?.setAttribute('aria-expanded','false');
 details.querySelector('.ljpc-u-history-submenu')?.setAttribute('hidden','');
 details.querySelector('[data-ljpc-u-history-toggle]')?.setAttribute('aria-expanded','false');
}
function placeNavPanel(details){
 if(!desktop()||!details?.open)return;
 const nav=details.closest('.ljpc-u-links'),panel=details.querySelector('.ljpc-u-dropdown');
 const summary=details.querySelector('summary');
 if(!panel||!summary||!nav)return;
 const overflow=getComputedStyle(nav);
 const clipped=/(auto|scroll|hidden|clip)/.test(overflow.overflowX+' '+overflow.overflowY);
 if(!clipped)return;
 const rect=summary.getBoundingClientRect();
 const width=Math.min(details.dataset.ljpcUGroup==='Datos'?252:details.dataset.ljpcUGroup==='Más'?236:260,Math.max(200,window.innerWidth-24));
 const x=details.dataset.ljpcUGroup==='Más'?rect.right-width:
   details.dataset.ljpcUGroup==='Datos'?rect.left+(rect.width-width)/2:rect.left;
 const left=Math.max(12,Math.min(Math.max(12,window.innerWidth-width-12),x));
 const top=Math.max(0,Math.min(window.innerHeight-110,rect.bottom+13));
 panel.style.setProperty('--ljpc-u-popup-left',left+'px');
 panel.style.setProperty('--ljpc-u-popup-top',top+'px');
 panel.style.setProperty('--ljpc-u-popup-width',width+'px');
 panel.style.setProperty('--ljpc-u-popup-max-height',Math.max(96,window.innerHeight-top-12)+'px');
 if(typeof panel.showPopover==='function'){
  try{
   panel.setAttribute('popover','manual');
   if(!panel.matches(':popover-open'))panel.showPopover();
   panel.classList.remove('ljpc-u-popup-fallback');
   return;
  }catch(_){}
 }
 panel.classList.add('ljpc-u-popup-fallback');
}
function positionOpenNavPanels(){
 document.querySelectorAll('#ljpc-unified-pc-header .ljpc-u-links>details[open]').forEach(placeNavPanel);
}
function hideIframeHeader(frame){
 if(!frame?.contentDocument)return;
 try{
  const doc=frame.contentDocument;
  if(!doc.getElementById('ljpc-u-iframe-hide')){
   const style=doc.createElement('style');style.id='ljpc-u-iframe-hide';
   style.textContent='[data-name="top bar wrapper"],[data-name="header navigation wrapper"],'+
    '[data-name="fixtures strip container"],[data-name="sponsors band"],[data-name="footer"]{display:none!important}'+
    'html.ljpc-embedded-home #root .ucl [data-name="hero and content section"]{'+
    'margin-top:0!important;padding-top:10px!important;min-height:0!important;'+
    'background:linear-gradient(180deg,#0a1061 0%,#05187d 54%,#041e91 100%)!important}'+
    'html.ljpc-embedded-home #root .ucl [data-name="stories list container"]{'+
    'width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;'+
    'margin:0 auto!important;margin-top:0!important;margin-bottom:0!important;padding-top:2px!important;padding-bottom:4px!important;padding:6px 0 8px!important;gap:12px!important;'+
    'position:relative!important;transform:none!important;clear:none!important;justify-content:space-between!important}'+
    'html.ljpc-embedded-home #root .ucl [data-name="stories wrapper"]{'+
    'max-width:1296px!important;width:100%!important;gap:14px!important;'+
    'justify-content:space-between!important;align-items:flex-start!important}'+
    'html.ljpc-embedded-home #root .ucl [data-name="stories wrapper"] > a{'+
    'flex:0 0 94px!important;width:94px!important;min-width:94px!important;max-width:94px!important}'+
    'html.ljpc-embedded-home #root .ucl [data-name="story ring"]{'+
    'width:88px!important;height:88px!important;min-width:88px!important;min-height:88px!important}'+
    'html.ljpc-embedded-home #root .ucl [data-name="hero section container"]{'+
    'width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;'+
    'grid-template-columns:minmax(0,1fr) 488px!important;gap:24px!important}'+
    'html.ljpc-embedded-home #root .ucl :is([data-name="moments section container"],[data-name="news section container"],[data-name="video highlights section"]){'+
    'width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important}';
   doc.head.appendChild(style);
   const inner=doc.defaultView;
   inner?.requestAnimationFrame?.(()=>{
    inner.dispatchEvent(new inner.Event('resize'));
   });
  }
 }catch(_){}
}
function updateFrame(){
 const iframe=document.querySelector('#screen #ljpc-exact-html-home');
 if(!iframe)return;
 if(iframe.dataset.ljpcUObserved!=='1'){
  iframe.dataset.ljpcUObserved='1';
  iframe.addEventListener('load',()=>hideIframeHeader(iframe));
 }
 hideIframeHeader(iframe);
}
let pending=false;
function sync(){
 const enabled=desktop();
 document.documentElement.classList.toggle('ljpc-unified-pc',enabled);
 if(!enabled){
  document.getElementById('ljpc-unified-pc-header')?.remove();
  document.getElementById('ljpc-unified-pc-footer')?.remove();return;
 }
 const screen=document.getElementById('screen');
 if(!screen?.parentNode)return;
 if(!document.getElementById('ljpc-unified-pc-header')){
  const nativeTop=document.getElementById('ljpc-pc-top')||document.getElementById('ljpc-native-toolbar');
  const anchor=nativeTop?.parentNode===screen.parentNode?nativeTop:screen;
  anchor.insertAdjacentHTML('beforebegin',navMarkup());
 }
 if(!document.getElementById('ljpc-unified-pc-footer'))
  screen.insertAdjacentHTML('afterend',footerMarkup());
 const footer=document.getElementById('ljpc-unified-pc-footer');
 if(footer&&(footer.parentElement!==document.body||footer!==document.body.lastElementChild)){
   document.body.appendChild(footer);
 }
 selectNav();
 updateFrame();
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()});}
function refreshFixtures(){
 const el=document.getElementById('ljpc-unified-pc-matches');
 if(!el||!desktop())return;
 el.innerHTML=fixturesHTML();
}
document.addEventListener('click',e=>{
 if(!desktop()||!(e.target instanceof Element))return;
 const summary=e.target.closest('#ljpc-unified-pc-header .ljpc-u-links > details > summary');
 if(!summary)return;
 const details=summary.parentElement;
 if(!details||details.tagName!=='DETAILS')return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const shouldOpen=!details.open;
 const header=document.getElementById('ljpc-unified-pc-header');
 header?.querySelectorAll('.ljpc-u-links > details[open]').forEach(other=>{
  if(other!==details)closeNavGroup(other);
 });
 if(!shouldOpen){closeNavGroup(details);return;}
 details.open=true;
 summary.setAttribute('aria-expanded','true');
 placeNavPanel(details);
},true);
document.addEventListener('click',e=>{
 if(!desktop()||!(e.target instanceof Element))return;
 const b=e.target.closest('[data-ljpc-u-go],[data-ljpc-u-history-section],[data-ljpc-u-history-toggle]');
 if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(b.hasAttribute('data-ljpc-u-history-toggle')){
  const submenu=b.parentElement?.querySelector('[data-ljpc-u-history-submenu]')||
   b.parentElement?.querySelector('#ljpc-u-history-submenu');
  if(submenu){
   const open=submenu.hidden;
   submenu.hidden=!open;
   b.setAttribute('aria-expanded',String(open));
  }
  return;
 }
 const section=b.dataset.ljpcUHistorySection;
 if(section){
  try{sessionStorage.setItem('ljpc-history-pc-tab',section)}catch(_){}
  const wrap=b.closest('details');
  closeNavGroup(wrap);
  const submenu=wrap?.querySelector('#ljpc-u-history-submenu');
  if(submenu)submenu.hidden=true;
  wrap?.querySelector('[data-ljpc-u-history-toggle]')?.setAttribute('aria-expanded','false');
  if(route()==='history')window.dispatchEvent(new CustomEvent('ljpc:history-select',{detail:{section}}));
  else go('history');
  return;
 }
 const dataView=b.dataset.ljpcUDataView;
  if(dataView==='team'||dataView==='player'){
   window.dispatchEvent(new CustomEvent('ljpc:pc-data-view',{detail:{view:dataView}}));
   closeNavGroup(b.closest('details'));
   if(route()!=='pc-data')go('pc-data');
   return;
  }
  const r=b.dataset.ljpcUGo;
 closeNavGroup(b.closest('details'));
 if(r==='gamingPortal'){location.assign('./gaming/index.html');return;}
 if(/^[a-z][a-zA-Z0-9_-]*$/.test(r||''))go(r);
},true);
document.addEventListener('toggle',e=>{
 if(e.target?.matches?.('#ljpc-unified-pc-header details[open]'))
  document.querySelectorAll('#ljpc-unified-pc-header details[open]').forEach(x=>{if(x!==e.target)closeNavGroup(x);});
},true);
document.addEventListener('pointerdown',e=>{
 if(!desktop()||!(e.target instanceof Element))return;
 if(e.target.closest('#ljpc-unified-pc-header .ljpc-u-links>details'))return;
 document.querySelectorAll('#ljpc-unified-pc-header .ljpc-u-links>details[open]').forEach(closeNavGroup);
},true);
document.addEventListener('keydown',e=>{
 if(!desktop()||e.key!=='Escape')return;
 document.querySelectorAll('#ljpc-unified-pc-header .ljpc-u-links>details[open]').forEach(closeNavGroup);
},true);
window.addEventListener('scroll',positionOpenNavPanels,{passive:true});
document.addEventListener('scroll',e=>{
 if(e.target?.matches?.('#ljpc-unified-pc-header .ljpc-u-links'))positionOpenNavPanels();
},true);
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',()=>{schedule();positionOpenNavPanels()});
window.addEventListener('ljr:official-data',()=>{refreshFixtures();schedule();});
function boot(){
 schedule();
 const app=document.getElementById('app');
 if(app)new MutationObserver(schedule).observe(app,{childList:true});
 const screen=document.getElementById('screen');
 if(screen)new MutationObserver(schedule).observe(screen,{childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
