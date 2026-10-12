/* Desktop-only persistent header and footer. One navigation identity across the
   original home iframe, desktop-sections pages and native desktop screens.
   NEVER touches app mobile or APK. */
(function(){
'use strict';
if(window.__LJPC_SHARED_SHELL_OCT11__)return;
window.__LJPC_SHARED_SHELL_OCT11__=true;
const NAV=[
 ['Inicio','home'],['Partidos','pc-fixtures'],['Clasificación','pc-standings'],
 ['Liga TV','video'],['Sorteos','pc-draws'],['Gaming','predictorSix'],
 ['Datos','pc-data'],['Equipos','teams'],['Noticias','news'],
 ['Historia','history'],['Sobre','about'],['Más','pc-tools']
];
const MENUS={
 Gaming:[['Pronostica Seis','predictorSix'],['Fantasy','fantasy'],['Quiniela','quiniela'],['Quiz Arena','quizArena'],['Más o menos','moreLess']],
 Datos:[['Clasificación','pc-standings'],['Goleadores','pc-scorers'],['Estadísticas oficiales','pc-data'],['Estadísticas de equipo','v38Stats'],['Performance Zone','safe-performance']],
 Más:[['Herramientas PC','pc-tools'],['Match Day','matchday'],['Calendario','pc-calendar'],['Credenciales','credentialBuilder'],['Reglamento','rulebook']]
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
 if(['fantasy','fantasyTeam','fantasyLeagues','quiniela','predictor','predictorSix','gaming','quizArena','quiz','moreLess','moreLessHub','moreLessGallery'].includes(r))return 'predictorSix';
 if(['safe-data','pc-data','pc-scorers','pc-notifications','scorers','stats','v38Stats','rankings'].includes(r))return 'pc-data';
 if(['teams','following','teamDetail','compareTeams','teamCompare','playerCompare'].includes(r))return 'teams';
 if(['news','newsDetail'].includes(r))return 'news';
 if(['about','history'].includes(r))return r;
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
 return matches.sort((a,b)=>a.key.localeCompare(b.key)).slice(0,6);
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
   group.map(([name,to])=>'<button type="button" data-ljpc-u-go="'+to+'">'+escapeHtml(name)+'</button>').join('')+
   '</div></details>':'<button type="button" data-ljpc-u-go="'+r+'" data-ljpc-u-highlight="'+r+'">'+label+'</button>';
 }).join('');
 return '<div id="ljpc-unified-pc-header" aria-label="Cabecera universal de escritorio">'+
 '<div class="ljpc-u-nav"><div class="ljpc-u-wrap">'+
 '<button class="ljpc-u-brand" type="button" data-ljpc-u-go="home"><img alt="" src="'+logo+'"><span>LIGA<br>JUVENTINO</span></button>'+
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
 return '<div id="ljpc-unified-pc-footer">'+
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
  const on=b.dataset.ljpcUHighlight===selected;
  b.classList.toggle('active',on);
  if(b.tagName==='BUTTON'){if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
 });
 if(previousRoute!==r){
  root.querySelectorAll('details[open]').forEach(x=>x.removeAttribute('open'));
  previousRoute=r;
 }
}
function hideIframeHeader(frame){
 if(!frame?.contentDocument)return;
 try{
  const doc=frame.contentDocument;
  if(!doc.getElementById('ljpc-u-iframe-hide')){
   const style=doc.createElement('style');style.id='ljpc-u-iframe-hide';
   style.textContent='[data-name="top bar wrapper"],[data-name="header navigation wrapper"],'+
    '[data-name="fixtures strip container"],[data-name="sponsors band"],[data-name="footer"]{display:none!important}';
   doc.head.appendChild(style);
  }
 }catch(_){/* An isolated document must keep working if access is unavailable. */}
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
 // Todos los módulos originales se montan de forma asíncrona. El pie único
 // pertenece al documento DESPUÉS de #app, nunca entre la portada y sus
 // funciones nativas: conservar el nodo preserva listeners y enlaces.
 const footer=document.getElementById('ljpc-unified-pc-footer');
 if(footer&&footer.parentElement!==document.body)document.body.appendChild(footer);
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
 const b=e.target.closest('[data-ljpc-u-go]');
 if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const r=b.dataset.ljpcUGo;
 if(/^[a-z][a-zA-Z0-9_-]*$/.test(r||''))go(r);
},true);
document.addEventListener('toggle',e=>{
 if(e.target?.matches?.('#ljpc-unified-pc-header details[open]'))
 document.querySelectorAll('#ljpc-unified-pc-header details[open]').forEach(x=>{if(x!==e.target)x.removeAttribute('open');});
},true);
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',()=>{refreshFixtures();schedule();});
function boot(){
 schedule();
 const app=document.getElementById('app');
 if(app)new MutationObserver(schedule).observe(app,{subtree:true,childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
