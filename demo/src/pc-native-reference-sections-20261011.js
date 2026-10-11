/* Liga Juventino Rosas: portal PC independiente para rutas con funciones nativas.
   No se ejecuta en mode=mobile ni mode=apk. Mantiene botones, formularios y
   estado de los módulos originales dentro de #screen. */
(function(){
'use strict';
if(window.__LJR_PC_REFERENCE_NATIVE_20261011__)return;
window.__LJR_PC_REFERENCE_NATIVE_20261011__=true;
const NAV=[
 ['Inicio','home'],['Partidos','pc-fixtures'],['Clasificación','pc-standings'],
 ['Liga TV','video'],['Sorteos','pc-draws'],['Gaming','predictorSix'],
 ['Datos','pc-data'],['Equipos','teams'],['Noticias','news'],['Más','pc-tools']
];
const DROPDOWNS={
 Gaming:[['Pronostica Seis','predictorSix'],['Fantasy','fantasy'],['Quiniela','quiniela'],['Quiz Arena','quizArena'],['Más o menos','moreLess']],
 Datos:[['Clasificación','pc-standings'],['Máximos goleadores','pc-scorers'],['Estadísticas oficiales','pc-data'],['Match Center','matchCenter'],['Performance Zone','safe-performance']],
 Más:[['Herramientas PC','pc-tools'],['Calendario','pc-calendar'],['Historia','history'],['Notificaciones','pc-notifications'],['Reglamento','rulebook']]
};
const TITLES={
 fantasy:'Fantasy de la liga',fantasyTeam:'Mi 7 Ideal',fantasyLeagues:'Ligas Fantasy',
 quiniela:'Quiniela',predictor:'Pronósticos',predictorSix:'Pronostica Seis',
 quizArena:'Quiz Arena',quiz:'Quiz Arena',moreLess:'Más o menos',
 moreLessHub:'Más o menos',moreLessGallery:'Más o menos',vote:'Jugador de la semana',
 moments:'Momentos',transfers:'Fichajes',following:'Equipos que sigo',
 teamDetail:'Detalles del equipo',playerDetail:'Detalles del jugador',
 playerCompare:'Comparar jugadores',compareTeams:'Comparar equipos',
 teamCompare:'Comparar equipos',match:'Partido',matchCenter:'Match Center',
 'match-center':'Match Center',matchday:'Match Day',
 news:'Noticias',video:'Liga TV',teams:'Equipos',history:'Historia',
 newsDetail:'Detalle de la noticia',rankings:'Rankings',scorers:'Goleadores',
 stats:'Estadísticas',v38Stats:'Estadísticas',v38Weekly:'Resumen semanal',
 positions:'Clasificación',cards:'Tarjetas',suspensions:'Sanciones',
 bracketBuilder:'Generador de cuadros',credentialBuilder:'Credenciales',
 cedulaBuilder:'Cédulas',weatherFields:'Clima y campos',
 accountLogin:'Iniciar sesión',accountRegister:'Registro',favorites:'Favoritos',
 search:'Buscar',jrControl:'JR Control',adminFut:'Administración',
 agendaBuilder:'Agenda',publications:'Publicaciones',rulebook:'Reglamento'
};
const GAME_ROUTES=new Set(['fantasy','fantasyTeam','fantasyLeagues','quiniela','predictor','predictorSix','quiz','quizArena','moreLess','moreLessHub','moreLessGallery']);
const VIDEO_ROUTES=new Set(['video','moments']);
const TEAM_ROUTES=new Set(['teams','following','teamDetail','compareTeams','teamCompare','playerCompare','playerDetail']);
const DESKTOP_ALIAS={'pc-fixtures':'pc-fixtures','pc-standings':'pc-standings','pc-tools':'pc-tools','pc-data':'pc-data','pc-draws':'pc-draws'};
const MODE=()=>new URLSearchParams(location.search).get('mode')||'';
const ROUTE=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
const DESKTOP=()=>!['mobile','apk'].includes(MODE())&&(MODE()==='desktop'||innerWidth>=1024);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function isNative(r){
 const registered=window.LJR_PC_NATIVE_ROUTES;
 return registered instanceof Set?registered.has(r):(
  GAME_ROUTES.has(r)||VIDEO_ROUTES.has(r)||TEAM_ROUTES.has(r)
 );
}
function activeGroup(r){
 if(GAME_ROUTES.has(r))return 'predictorSix';
 if(VIDEO_ROUTES.has(r))return 'video';
 if(TEAM_ROUTES.has(r))return 'teams';
 if(['stats','rankings','v38Stats','cards','suspensions','scorers'].includes(r))return 'pc-data';
 if(['match','matchday','matchCenter','match-center'].includes(r))return 'pc-fixtures';
 if(['news','newsDetail'].includes(r))return 'news';
 return r;
}
function submenu(r){
 if(GAME_ROUTES.has(r))return [
  ['Pronostica Seis','predictorSix'],['Fantasy','fantasy'],['Quiniela','quiniela'],
  ['Quiz Arena','quizArena'],['Más o menos','moreLess']
 ];
 if(TEAM_ROUTES.has(r))return [
  ['Equipos','teams'],['Siguiendo','following'],['Comparar equipos','compareTeams'],
  ['Comparar jugadores','playerCompare']
 ];
 if(VIDEO_ROUTES.has(r))return [['Liga TV','video'],['Momentos','moments'],['Noticias','news']];
 if(['match','matchday','matchCenter','match-center'].includes(r))return [
  ['Partidos','pc-fixtures'],['Match Center','matchCenter'],['Match Day','matchday']
 ];
 if(['stats','rankings','v38Stats','cards','suspensions','scorers'].includes(r))return [
  ['Clasificación','pc-standings'],['Goleadores','pc-scorers'],['Estadísticas','pc-data']
 ];
 return [];
}
const logo='./assets/branding/escudo-liga-azul-sin-fondo-v1007.png';
function shellMarkup(r){
 const title=TITLES[r]||r.replace(/([A-Z])/g,' $1').replace(/[-_]/g,' ');
 const sub=submenu(r);
 const selected=activeGroup(r);
 return '<div class="ljpc-pc-mini"><div class="ljpc-pc-wide">'+
   '<button type="button" data-ljpc-pc-go="home">LIGA JUVENTINO ROSAS <span aria-hidden="true">⌄</span></button>'+
   '<button type="button" data-ljpc-pc-go="accountLogin">Iniciar sesión <span aria-hidden="true">◉</span></button>'+
   '</div></div>'+
   '<div class="ljpc-pc-navigation"><div class="ljpc-pc-wide">'+
     '<button type="button" class="ljpc-pc-brand" data-ljpc-pc-go="home" aria-label="Ir a Inicio">'+
       '<img src="'+logo+'" alt="Escudo Liga Juventino Rosas">'+
       '<b>LIGA<br>JUVENTINO<br>ROSAS</b></button>'+
     '<nav aria-label="Menú principal de escritorio">'+NAV.map(([label,route])=>{
       if(DROPDOWNS[label])return '<div class="ljpc-pc-drop-wrap">'+
         '<button type="button" class="'+(selected===route?'active':'')+'" data-ljpc-pc-menu="'+label+'" aria-haspopup="true" aria-expanded="false">'+label+' <span aria-hidden="true">⌄</span></button>'+
         '<div class="ljpc-pc-popover" hidden>'+DROPDOWNS[label].map(([name,to])=>
           '<button type="button" data-ljpc-pc-go="'+to+'">'+escapeHTML(name)+'</button>').join('')+'</div></div>';
       return '<button type="button" class="'+(selected===route?'active':'')+'" data-ljpc-pc-go="'+route+'">'+label+'</button>';
     }).join('')+'</nav>'+
   '</div></div>'+
   '<div class="ljpc-pc-hero"><div class="ljpc-pc-wide">'+
    '<button type="button" class="ljpc-pc-breadcrumb" data-ljpc-pc-go="home">‹ &nbsp; Liga Juventino Rosas</button>'+
    '<h1>'+escapeHTML(title)+'</h1>'+
    '<p>Temporada 2026 · Liga Juventino Rosas, Guanajuato</p>'+
   '</div></div>'+
   (sub.length?'<nav class="ljpc-pc-subtabs" aria-label="Apartados de '+escapeHTML(title)+'"><div class="ljpc-pc-wide">'+
    sub.map(([label,route])=>'<button type="button" data-ljpc-pc-go="'+route+'" class="'+(route===r?'active':'')+'">'+label+'</button>').join('')+
   '</div></nav>':'');
}
function footerMarkup(){
 return '<div class="ljpc-pc-wide"><div class="ljpc-pc-foot-columns">'+
 '<div><img alt="Escudo Liga Juventino Rosas" src="'+logo+'"><strong>Liga Juventino Rosas</strong><p>Portal de fútbol local. Partidos, noticias y herramientas de competición.</p></div>'+
 '<div><b>DESCUBRE</b><button data-ljpc-pc-go="pc-fixtures">Partidos</button><button data-ljpc-pc-go="pc-standings">Clasificación</button><button data-ljpc-pc-go="video">Liga TV</button><button data-ljpc-pc-go="pc-draws">Sorteos</button></div>'+
 '<div><b>HERRAMIENTAS</b><button data-ljpc-pc-go="teams">Equipos</button><button data-ljpc-pc-go="predictorSix">Pronostica Seis</button><button data-ljpc-pc-go="fantasy">Fantasy</button><button data-ljpc-pc-go="pc-data">Datos oficiales</button></div>'+
 '<div><b>INFORMACIÓN</b><button data-ljpc-pc-go="history">Historia</button><button data-ljpc-pc-go="rulebook">Reglamento</button><button data-ljpc-pc-go="news">Noticias</button><button data-ljpc-pc-go="pc-tools">Más herramientas</button></div>'+
 '</div><div class="ljpc-pc-legal">© 2026 Liga Juventino Rosas · Contenido en español</div></div>';
}
function appendPredictorLabels(){
 if(ROUTE()!=='predictorSix')return;
 document.querySelectorAll('#screen .v53-p6-game[data-v29-pick]').forEach(button=>{
  if(button.dataset.ljpcPcLabeled)return;
  const match=String(button.getAttribute('aria-label')||'').match(/^(.+?) contra (.+?)\. Pronóstico /);
  if(!match)return;
  for(const [side,name] of [['home',match[1]],['away',match[2]]]){
   const span=document.createElement('span');span.className='ljpc-pc-p6name '+side;
   span.textContent=name;button.appendChild(span);
  }
  button.dataset.ljpcPcLabeled='1';
 });
}
let pending=false;
function sync(){
 const route=ROUTE(),native=DESKTOP()&&isNative(route);
 const html=document.documentElement;
 html.classList.toggle('ljpc-pc-native-mode',native);
 if(!native){
  document.getElementById('ljpc-pc-top')?.remove();
  document.getElementById('ljpc-pc-bottom')?.remove();
  return;
 }
 const screen=document.getElementById('screen');
 if(!screen?.parentElement)return;
 let top=document.getElementById('ljpc-pc-top');
 if(!top){top=document.createElement('div');top.id='ljpc-pc-top';screen.parentElement.insertBefore(top,screen)}
 if(top.dataset.route!==route){top.innerHTML=shellMarkup(route);top.dataset.route=route}
 let bottom=document.getElementById('ljpc-pc-bottom');
 if(!bottom){bottom=document.createElement('footer');bottom.id='ljpc-pc-bottom';bottom.innerHTML=footerMarkup();screen.parentElement.insertBefore(bottom,screen.nextSibling)}
 appendPredictorLabels();
}
function schedule(){
 if(pending)return;pending=true;
 requestAnimationFrame(()=>{pending=false;sync()});
}
function closeMenus(except){
 document.querySelectorAll('#ljpc-pc-top .ljpc-pc-drop-wrap').forEach(group=>{
  if(group===except)return;
  group.classList.remove('open');
  group.querySelector('[data-ljpc-pc-menu]')?.setAttribute('aria-expanded','false');
  const pop=group.querySelector('.ljpc-pc-popover');if(pop)pop.hidden=true;
 });
}
document.addEventListener('click',e=>{
 if(!DESKTOP()||!(e.target instanceof Element))return;
 const dropdown=e.target.closest('#ljpc-pc-top [data-ljpc-pc-menu]');
 if(dropdown){
  e.preventDefault();e.stopPropagation();
  const group=dropdown.closest('.ljpc-pc-drop-wrap'),willOpen=!group.classList.contains('open');
  closeMenus(group);
  group.classList.toggle('open',willOpen);
  dropdown.setAttribute('aria-expanded',String(willOpen));
  const pop=group.querySelector('.ljpc-pc-popover');if(pop)pop.hidden=!willOpen;
  return;
 }
 const el=e.target.closest('[data-ljpc-pc-go]');
 closeMenus();
 if(!el)return;
 const r=el.dataset.ljpcPcGo;
 if(!/^[A-Za-z][A-Za-z0-9-]*$/.test(r||''))return;
 e.preventDefault();e.stopPropagation();
 location.hash='#/'+(DESKTOP_ALIAS[r]||r);
},true);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&DESKTOP())closeMenus();
});
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',schedule);
function boot(){
 schedule();
 const screen=document.getElementById('screen');
 if(screen)new MutationObserver(schedule).observe(screen,{subtree:true,childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
