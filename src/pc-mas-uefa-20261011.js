/* Más en PC: estructura inspirada en las capturas UEFA compartidas por el usuario.
   Complementa las herramientas existentes; nunca modifica vista móvil o APK. */
(function(){
'use strict';
if(window.__LJR_PC_MAS_UEFA_OCT11__)return;
window.__LJR_PC_MAS_UEFA_OCT11__=true;
const CAT_NAMES={'3':'Primera Fuerza','5':'Intermedia','4':'Segunda Fuerza','2':'Veteranos 35+','1':'Veteranos 50+'};
const TABS=[
 ['inicio','Resumen'],['herramientas','🛠️ Herramientas y Secciones'],['estadisticas','Estadísticas'],['rankings','Rankings'],
 ['equipos','Equipos'],['videos','Vídeos'],['titulos','Palmarés'],
 ['sobre','Sobre'],['tienda','Tienda']
];
const LINKS=[
 ['🛠️','Herramientas y Secciones APK','Las 35+ herramientas de competencia, jornada, documentos y admin','leagueTools','herramientas'],
 ['▥','Estadísticas históricas','Datos, goleadores y temporadas','pc-data','estadisticas'],
 ['▤','Rankings y récords','Clasificaciones oficiales de jugadores y equipos','pc-scorers','rankings'],
 ['♜','Equipos','Escudos y clubes de la Liga Juventino Rosas','teams','equipos'],
 ['▶','Vídeos','Clásicos, recuerdos y transmisiones','video','videos'],
 ['🏆','Más títulos','Campeones, copas y finales','history','titulos'],
 ['◉','Sobre la liga','Reglamento, historia e información','about','sobre'],
 ['◈','Comparar clubes','Estadísticas y comparación de equipos','pc-team-compare','estadisticas'],
 ['♢','Tienda de clubes','Artículos y personalización de clubes','club-store','tienda']
];
const APK_SECTIONS_GROUPS=[
 ['ACCESOS RÁPIDOS Y COMPETICIÓN',[
  ['⚽','Partidos y Jornadas','Calendario, resultados y próximos encuentros','pc-fixtures'],
  ['📊','Tabla de Posiciones','Clasificación oficial por categoría','pc-standings'],
  ['🥅','Goleadores','Ranking de goleo individual por categoría','pc-scorers'],
  ['🔴','Match Center en Vivo','Marcador, alineaciones y cronología','v4-matchcenter'],
  ['🛡️','Equipos Oficiales','Directorio de clubes y escudos','teams'],
  ['🏃','Jugadores y Plantillas','Registros y perfiles de jugadores','players'],
  ['🏆','Cuadro y Liguilla','Generador y vista de eliminatorias','bracketBuilder'],
  ['📥','Exportar Tabla PNG/CSV','Descargar tabla de posiciones','tableExport'],
  ['🎯','Quiniela y Pronósticos','Juego oficial de pronósticos','quiniela']
 ]],
 ['OPERACIÓN DE JORNADA Y CAMPO',[
  ['📋','Match Day','Checklist de preparación de jornada','matchday'],
  ['🗓️','Preparar mi Jornada (Agenda)','Organizar cruces, horarios y programación','agendaBuilder'],
  ['📐','Tácticas (Pizarra 2D)','Pizarra táctica para formaciones y alineaciones','tactics'],
  ['⛅','Clima y Estado de Campos','Pronóstico meteorológico y estado de canchas','v38Weather'],
  ['📍','Dónde se Juega (Sedes)','Directorio de campos y ubicación en mapa','venues'],
  ['🎬','Jornada Animada','Presentación visual dinámica de la jornada','motionHub'],
  ['⚠️','Aviso de Suspensión','Generador de avisos de jornada o partido suspendido','suspensionTool'],
  ['📆','Calendario Mensual PC','Vista mensual por categoría y Google Calendar','pc-calendar'],
  ['⚖️','Comparar Equipos','Comparativa frente a frente entre dos clubes','pc-team-compare']
 ]],
 ['DOCUMENTOS, PUBLICACIONES Y ARCHIVO',[
  ['📄','Generar Cédula','Crear cédula arbitral y plantilla para imprimir','cedulaBuilder'],
  ['✅','Permisos y Autorizaciones','Generar permisos en PDF, PNG, JPG o SVG','permissionBuilder'],
  ['🪪','Constructor de Credenciales','Crear credencial con foto, equipo y categoría','credentialBuilder'],
  ['📖','Reglamento Oficial PDF','Consultar y descargar el reglamento vigente','rulebook'],
  ['🎨','Centro de Publicaciones PNG','Diseños PNG HD, resultados y avisos','publicationCenter'],
  ['⏰','Avisos AUTO','Programar avisos automáticos con fecha y hora','v38Alerts'],
  ['🏛️','Historia y Palmarés','Temporadas, campeones, finales y récords','history'],
  ['🔍','Buscador General','Buscar equipos, jugadores, partidos y sedes','search'],
  ['🔔','Notificaciones','Configurar alertas del navegador','pc-notifications']
 ]],
 ['ADMINISTRACIÓN Y CONTROL DE LA LIGA',[
  ['🎛️','JR Control (Panel Admin)','Centro operativo y administración de la Liga','jrControl'],
  ['🛠️','Centro de Herramientas APK','Vista completa de todas las herramientas','leagueTools'],
  ['📈','Panel de Liga','Resumen operativo de tabla y actividad','v38Stats'],
  ['🟨','Tarjetas y Castigados','Disciplina, amarillas, rojas y sanciones','discipline'],
  ['➕','Registro (Altas)','Inscripción y altas de equipos y jugadores','recruitment'],
  ['🏁','Modo Árbitro Offline','Captura de partidos y cédulas sin conexión','refereeOffline'],
  ['📑','Cédulas Arbitrales','Consulta y revisión de actas y cédulas','cedulas'],
  ['🗞️','Reportes Semanales','Reporte oficial semanal de la Liga','v38Weekly'],
  ['📲','Descargar / Instalar App QR','Código QR e instalación de la aplicación','ligaQR']
 ]]
];
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0];
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const desktop=()=>!['mobile','apk'].includes(mode())&&(mode()==='desktop'||window.innerWidth>=1024);
const active=()=>desktop()&&['pc-tools','more'].includes(route());
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const asNum=x=>{if(x===null||x===undefined||String(x).trim()==='')return null;const n=Number(String(x).replace(',','.'));return Number.isFinite(n)?n:null};
const go=r=>{if(/^[A-Za-z][A-Za-z0-9-]*$/.test(r))location.hash='#/'+r};
let state={tab:'inicio',cat:'3'},scheduled=false,previousData=null,fetching=false,remote=null;
function source(){
 const d=window.LJR_OFFICIAL_DATA||window.LJR_OFFICIAL_API?.getData?.()||remote;
 return d?.categories?d:null;
}
function loadData(){
 if(source()||fetching)return;
 fetching=true;
 fetch('./data/official-live.json?v=pc-more-uefa',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('Datos no disponibles');return r.json()})
 .then(d=>{if(d?.categories){remote=d;refresh();}})
 .catch(()=>{}).finally(()=>{fetching=false});
}
function catData(){
 const c=source()?.categories?.[state.cat]||{};
 return {category:c,
  teams:(c.standings?.[0]?.rows||[]).filter(r=>Array.isArray(r)&&r[1]),
  scorers:(c.scorers?.[0]?.rows||[]).filter(r=>Array.isArray(r)&&r[1]&&r[2]&&asNum(r[3])!==null)};
}
function crest(name){
 let asset='';
 try {
  asset=window.LJR_OFFICIAL_API?.getLogo?.(name)||window.V66_OFFICIAL_DIRECTORY?.logoFor?.(name)||'';
  if(asset&&typeof asset==='object')asset=asset.app||asset.local||asset.url||'';
  if(!asset){
   const logos=source()?.team_logos||{};
   const entry=Object.entries(logos).find(([team])=>norm(team)===norm(name));
   const v=entry?.[1];asset=typeof v==='string'?v:v?.app||v?.local||v?.source||v?.url||'';
  }
  asset=String(asset||'').trim();
  if(/^(?:\.\/)?assets\//i.test(asset))
   asset='https://raw.githubusercontent.com/jairofrancog7-star/Liga_Futbol/main/'+asset.replace(/^\.\//,'');
  if(!/^https:\/\//i.test(asset))asset='';
 }catch(_){asset=''}
 return asset?'<img loading="lazy" decoding="async" alt="" src="'+esc(asset)+'">':
  '<span class="ljpc-mas-crest-fallback" aria-hidden="true">'+esc(String(name||'?').slice(0,1))+'</span>';
}
function heading(kicker,title,detail){
 return '<div class="ljpc-mas-heading"><span>'+esc(kicker)+'</span><h2>'+esc(title)+'</h2>'+(detail?'<p>'+esc(detail)+'</p>':'')+'</div>';
}
function link(label,destination,cls){
 return '<button class="'+(cls||'ljpc-mas-button')+'" type="button" data-ljpc-mas-go="'+esc(destination)+'">'+esc(label)+' <span aria-hidden="true">›</span></button>';
}
function toolsCatalogHTML(){
 return APK_SECTIONS_GROUPS.map(([groupTitle,items])=>
  '<h3 class="ljpc-mas-subheading">'+esc(groupTitle)+'</h3>'+
  '<div class="ljpc-mas-about-grid">'+items.map(([i,t,d,r])=>
   '<button type="button" class="ljpc-mas-about" data-ljpc-mas-go="'+esc(r)+'"><span>'+i+'</span><b>'+esc(t)+'</b><small>'+esc(d)+'</small><em>›</em></button>'
  ).join('')+'</div>'
 ).join('');
}
function toolsPanel(){
 return heading('CENTRO COMPLETO DE HERRAMIENTAS MÓVIL / APK Y PC','Todas las secciones y herramientas de la Liga','Selecciona cualquier herramienta de competencia, operación de jornada, documentos oficiales, archivo o administración adaptada a pantalla horizontal de PC.')+
 toolsCatalogHTML();
}
function intro(){
 return heading('DESCUBRE · LIGA JUVENTINO ROSAS','Explora la liga y todas sus herramientas','Toda la información, secciones del APK, herramientas de modificación y recuerdos del fútbol de Juventino Rosas en formato horizontal UEFA PC.')+
 '<div class="ljpc-mas-feature"><div><small>PALMARÉS E HISTORIA</small><h3>La historia y herramientas de nuestra Liga</h3><p>Campeonatos, equipos, finales, temporadas y las 36 herramientas operativas del fútbol de Juventino Rosas.</p>'+
 '<div style="display:flex;gap:12px;flex-wrap:wrap">'+link('Explorar historia','history')+link('Abrir Centro de Herramientas APK','leagueTools')+'</div></div><div class="ljpc-mas-feature-art" aria-hidden="true"><span>🏆</span><b>LIGA<br>JUVENTINO ROSAS</b></div></div>'+
 '<div class="ljpc-mas-tiles">'+LINKS.map(([icon,title,detail,destination,tab])=>
 '<button type="button" class="ljpc-mas-tile" data-ljpc-mas-tab="'+tab+'" aria-label="'+esc(title)+'"><span class="ljpc-mas-tile-icon" aria-hidden="true">'+icon+'</span><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small><span class="ljpc-mas-tile-arrow" aria-hidden="true">↗</span></button>').join('')+'</div>'+
 toolsCatalogHTML();
}
function filters(){
 return '<label class="ljpc-mas-category-label" for="ljpc-mas-category">Categoría</label>'+
 '<select id="ljpc-mas-category" data-ljpc-mas-cat aria-label="Seleccionar categoría">'+
 Object.entries(CAT_NAMES).map(([key,name])=>'<option value="'+key+'"'+(key===state.cat?' selected':'')+'>'+esc(name)+'</option>').join('')+'</select>';
}
function ranking(metric,title,d,kind){
 const index=metric==='points'?9:metric==='goals'?6:3;
 const entries=kind==='players'?
  d.scorers.slice().sort((a,b)=>(asNum(b[3])||0)-(asNum(a[3])||0)).slice(0,5).map(r=>({name:r[1],team:r[2],num:r[3]})):
  d.teams.filter(r=>asNum(r[index])!==null).slice().sort((a,b)=>(asNum(b[index])||0)-(asNum(a[index])||0)).slice(0,5).map(r=>({name:r[1],team:'Club',num:r[index]}));
 return '<article class="ljpc-mas-ranking"><div class="ljpc-mas-ranking-head"><strong>'+esc(title)+'</strong><span>'+esc(CAT_NAMES[state.cat])+'</span></div>'+
 (entries.length?entries.map((r,i)=>'<div class="ljpc-mas-rank-row"><small>'+String(i+1).padStart(2,'0')+'</small>'+
 '<div class="ljpc-mas-crest">'+crest(r.team==='Club'?r.name:r.team)+'</div>'+
 '<span><b>'+esc(r.name)+'</b><em>'+esc(r.team)+'</em></span><strong>'+esc(r.num)+'</strong></div>').join(''):
 '<p class="ljpc-mas-empty">No hay registros oficiales disponibles para este apartado.</p>')+
 link('Ver clasificación completa',kind==='players'?'pc-scorers':'pc-standings','ljpc-mas-plain')+'</article>';
}
function statistics(){
 const d=catData();
 return heading('DATOS OFICIALES','Estadísticas históricas y de temporada','Los números visibles corresponden a los datos oficiales disponibles. El archivo histórico se consulta en Historia.')+
 '<div class="ljpc-mas-filterbar">'+filters()+link('Ver estadísticas detalladas','pc-data')+'</div>'+
 '<div class="ljpc-mas-rankgrid">'+ranking('points','Más puntos',d,'teams')+ranking('goals','Más goles anotados',d,'teams')+ranking('wins','Más victorias',d,'teams')+'</div>'+
 '<div class="ljpc-mas-duo"><article><h3>Estadísticas de equipos</h3><p>Clasificación, resultados, goles a favor y en contra.</p>'+link('Abrir datos de equipos','pc-data')+'</article>'+
 '<article><h3>Estadísticas de jugadores</h3><p>Goleadores y estadísticas individuales publicadas oficialmente.</p>'+link('Abrir datos de jugadores','pc-scorers')+'</article></div>';
}
function rankings(){
 const d=catData();
 return heading('RANKINGS','Rankings y estadísticas','Récords de equipos y jugadores en la categoría seleccionada.')+
 '<div class="ljpc-mas-filterbar">'+filters()+link('Consultar datos','pc-data')+'</div>'+
 '<h3 class="ljpc-mas-subheading">Estadísticas de equipo</h3>'+
 '<div class="ljpc-mas-rankgrid">'+ranking('points','Más puntos',d,'teams')+ranking('goals','Más goles',d,'teams')+ranking('wins','Más partidos ganados',d,'teams')+'</div>'+
 '<h3 class="ljpc-mas-subheading">Estadísticas de jugador</h3>'+
 '<div class="ljpc-mas-rankgrid">'+ranking('scorers','Máximos goleadores',d,'players')+
 '<article class="ljpc-mas-ranking ljpc-mas-help"><h3>Tabla de goleadores</h3><p>Revisa el ranking completo por persona, equipo y categoría con sus datos reales.</p>'+link('Ver tabla de goleadores','pc-scorers')+'</article>'+
 '<article class="ljpc-mas-ranking ljpc-mas-help"><h3>Archivo histórico</h3><p>Consulta los campeones y reconocimientos de las temporadas anteriores.</p>'+link('Ver historia','history')+'</article></div>';
}
function clubs(){
 const d=catData();
 const set=new Set(d.teams.map(r=>String(r[1]).trim()).filter(Boolean));
 const c=d.category;
 for(const group of c.fixtures||[])for(const row of group.rows||[]){
  if(Array.isArray(row)){if(row[2])set.add(String(row[2]).trim());if(row[6])set.add(String(row[6]).trim())}
 }
 const arr=[...set].sort((a,b)=>a.localeCompare(b,'es'));
 return heading('DIRECTORIO','Equipos','Consulta los clubes inscritos en la categoría seleccionada, ordenados alfabéticamente.')+
 '<div class="ljpc-mas-filterbar">'+filters()+link('Abrir directorio completo','teams')+'</div>'+
 (arr.length?'<div class="ljpc-mas-clubs">'+arr.map(team=>
 '<button type="button" data-ljpc-mas-go="teams" class="ljpc-mas-club"><span class="ljpc-mas-crest">'+crest(team)+'</span><strong>'+esc(team)+'</strong></button>').join('')+'</div>':
 '<p class="ljpc-mas-empty">La lista de equipos se mostrará cuando estén disponibles los registros oficiales de esta categoría.</p>')+
 '<div class="ljpc-mas-bottom-action">'+link('Ver todos los equipos','teams')+'</div>';
}
function videos(){
 const items=[
 ['▶','Vídeos destacados','video','Partidos y transmisiones de Liga TV'],
 ['◉','Clásicos de la Liga','history','Archivo de partidos y recuerdos históricos'],
 ['▷','Momentos de la Liga','moments','Goles, celebraciones y momentos destacados'],
 ['▹','Transmisiones','video','Contenido audiovisual disponible']
 ];
 return heading('MULTIMEDIA','Vídeos','Los vídeos se abren en las secciones originales de la Liga; no se muestran partidos inventados.')+
 '<div class="ljpc-mas-video-feature"><span aria-hidden="true">▶</span><div><small>LIGA TV</small><h3>Vive los partidos y los mejores momentos</h3>'+
 link('Abrir Liga TV','video')+'</div></div>'+
 '<div class="ljpc-mas-video-grid">'+items.map(([symbol,title,r,desc])=>
 '<button class="ljpc-mas-video" type="button" data-ljpc-mas-go="'+r+'"><span class="ljpc-mas-video-thumb" aria-hidden="true">'+symbol+'</span><b>'+esc(title)+'</b><small>'+esc(desc)+'</small></button>').join('')+'</div>';
}
function titles(){
 return heading('HISTORIA','Palmarés y títulos','Viaja por las temporadas, campeonatos y finales de la Liga Juventino Rosas.')+
 '<div class="ljpc-mas-feature ljpc-mas-titles"><div><small>EL ARCHIVO DE LA LIGA</small><h3>Campeones, finales y más títulos</h3><p>Consulta el historial oficial y los equipos que marcaron cada temporada.</p>'+
 link('Ver todos los títulos','history')+'</div><div class="ljpc-mas-feature-art" aria-hidden="true"><span>🏆</span></div></div>'+
 '<div class="ljpc-mas-titles-grid">'+[
  ['🏅','Más títulos','history','Palmarés por club'],
  ['📆','Temporadas','history','Historial de temporadas'],
  ['🏆','Finales','history','Campeones y subcampeones'],
  ['📊','Estadísticas históricas','pc-data','Datos y estadísticas disponibles']
 ].map(([i,n,r,d])=>'<button type="button" data-ljpc-mas-go="'+r+'"><span>'+i+'</span><strong>'+n+'</strong><small>'+d+'</small></button>').join('')+'</div>';
}
function about(){
 return heading('INFORMACIÓN','Sobre la Liga','Conoce la historia, la organización y las herramientas de la Liga Juventino Rosas.')+
 toolsCatalogHTML();
}
function shop(){
 return heading('TIENDA','Tienda de clubes','Explora la sección existente de artículos de clubes de la Liga Juventino Rosas.')+
 '<div class="ljpc-mas-shop"><div><span>TIENDA DE LA LIGA</span><h3>Tu equipo. Tu pasión.</h3><p>Explora camisetas, productos y clubes disponibles en el apartado de tienda.</p>'+
 link('Entrar a la tienda','club-store')+'</div><span class="ljpc-mas-shop-icon" aria-hidden="true">⚽</span></div>';
}
const panels={inicio:intro,herramientas:toolsPanel,estadisticas:statistics,rankings,equipos:clubs,videos,titulos:titles,sobre:about,tienda:shop};
function baseHTML(){
 return '<section class="ljpc-mas-uefa" data-ljpc-more-uefa aria-label="Más apartados para PC">'+
 '<div class="ljpc-mas-top"><span>MÁS · PORTAL PC Y HERRAMIENTAS DE LA LIGA</span><h1>Descubre más de la Liga y sus Herramientas</h1><p>Todas las secciones de móvil, APK y escritorio adaptadas a formato horizontal UEFA Champions League (1392px).</p></div>'+
 '<div class="ljpc-mas-menu" role="tablist" aria-label="Secciones de Más">'+
 TABS.map(([id,label])=>'<button role="tab" type="button" data-ljpc-mas-tab="'+id+'" aria-selected="'+(state.tab===id)+'" class="'+(state.tab===id?'active':'')+'">'+label+'</button>').join('')+'</div>'+
 '<div class="ljpc-mas-main" role="tabpanel" data-ljpc-mas-panel></div>'+
 '<div class="ljpc-mas-original"><b>Catálogo completo de funciones y buscador de herramientas</b><p>Debajo tienes el buscador interactivo con los 65+ accesos directos de la Liga para PC.</p></div>'+
 '</section>';
}
function paint(root){
 if(!root)return;
 root.querySelectorAll('.ljpc-mas-menu [data-ljpc-mas-tab]').forEach(b=>{
  const on=b.dataset.ljpcMasTab===state.tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));
 });
 const panel=root.querySelector('[data-ljpc-mas-panel]');if(panel)panel.innerHTML=(panels[state.tab]||intro)();
}
function refresh(){
 if(!active()){
  document.documentElement.classList.remove('ljpc-more-uefa-pc');
  document.querySelectorAll('[data-ljpc-more-uefa]').forEach(el=>el.remove());
  return;
 }
 document.documentElement.classList.add('ljpc-more-uefa-pc');
 const screen=document.getElementById('screen');
 if(!screen)return;
 const hub=screen.querySelector('[data-pc-tools-hub]');
 const host=hub?.parentElement||screen.querySelector('.ds-content > .ds-wrap')||screen;
 if(!host)return;
 let root=host.querySelector(':scope > [data-ljpc-more-uefa]');
 if(!root){
  root=document.createElement('div');root.innerHTML=baseHTML();
  root=root.firstElementChild;
  if(hub)host.insertBefore(root,hub);else host.prepend(root);
  paint(root);
 }else if(previousData!==source()){paint(root)}
 previousData=source();
 if(!previousData)loadData();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh()})}
document.addEventListener('click',e=>{
 if(!active()||!(e.target instanceof Element))return;
 const b=e.target.closest('[data-ljpc-more-uefa] [data-ljpc-mas-tab],[data-ljpc-more-uefa] [data-ljpc-mas-go]');
 if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(b.hasAttribute('data-ljpc-mas-tab')){state.tab=b.dataset.ljpcMasTab;paint(b.closest('[data-ljpc-more-uefa]'))}
 else go(b.dataset.ljpcMasGo);
},true);
document.addEventListener('change',e=>{
 if(!active()||!e.target?.matches?.('[data-ljpc-more-uefa] [data-ljpc-mas-cat]'))return;
 state.cat=e.target.value in CAT_NAMES?e.target.value:'3';
 paint(e.target.closest('[data-ljpc-more-uefa]'));
});
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',()=>{previousData=null;schedule()});
function boot(){
 schedule();
 const screen=document.getElementById('screen');
 if(screen)new MutationObserver(schedule).observe(screen,{childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
