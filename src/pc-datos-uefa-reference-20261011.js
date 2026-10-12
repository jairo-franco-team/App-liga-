/* Datos PC con distribución tipo UEFA, basada exclusivamente en estadísticas publicadas.
   Solo #/pc-data y exclusivamente escritorio. No escribe datos, estilos ni rutas móviles. */
(function(){
'use strict';
if(window.__LJR_PC_DATOS_UEFA_20261011__)return;
window.__LJR_PC_DATOS_UEFA_20261011__=true;
const CATS=['3','5','4','2','1'], BASE='https://raw.githubusercontent.com/jairofrancog7-star/Liga_Futbol/main/';
const TEAM_FIELDS=[['pj','Datos clave',2],['gf','Goles',6],['pg','Victorias',3],['pe','Empates',4],['pp','Derrotas',5],['gc','Defensa',7],['dg','Diferencia',8],['pts','Puntos',9]];
const PLAYER_FIELDS=[['goals','Goles'],['cedulas','Cédulas'],['yellow','Amarillas'],['red','Rojas'],['minutes','Minutos'],['assists','Asistencias'],['shots','Disparos']];
let live=null, fetching=false,queued=false, pendingMenuView=null, state={cat:'',view:'team',metric:'pj'};
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0];
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const desktop=()=>!['mobile','apk'].includes(mode())&&(mode()==='desktop'||window.innerWidth>=1024);
const active=()=>desktop()&&route()==='pc-data';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-MX').replace(/[^a-z0-9]+/g,' ').trim();
const numeric=v=>{if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(String(v).trim().replace(',','.'));return Number.isFinite(n)?n:null};
const textValue=v=>v===null||v===undefined||String(v).trim()===''?'—':esc(v);
function source(){
 const injected=window.LJR_OFFICIAL_DATA;
 if(injected?.categories)return injected;
 const official=window.LJR_OFFICIAL_API?.getData?.();
 if(official?.categories)return official;
 return live?.categories?live:null;
}
function getData(){
 if(source()||fetching)return;
 fetching=true;
 fetch('./data/official-live.json?v=pc-uefa-reference-20261011',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('Datos oficiales no disponibles');return r.json()})
 .then(data=>{if(data?.categories){live=data;schedule()}})
 .catch(()=>{}).finally(()=>fetching=false);
}
function category(){try{const id=sessionStorage.getItem('ljpc-selected-category');return CATS.includes(id)?id:'3'}catch(_){return '3'}}
function records(cat){const c=source()?.categories?.[cat]||{};return {
 c,
 teams:(c.standings?.[0]?.rows||[]).filter(r=>Array.isArray(r)&&r[1]),
 scorers:(c.scorers?.[0]?.rows||[]).filter(r=>Array.isArray(r)&&r[1]&&r[2]&&numeric(r[3])!==null&&!/goles en temporada/i.test(String(r[2]))),
 cards:(c.cards?.[0]?.rows||[]).filter(Array.isArray),
 usage:Object.values(c.player_usage||{}).filter(p=>p&&p.name&&p.team)
}}
function logo(team){
 const entries=Object.entries(source()?.team_logos||{});
 const item=entries.find(([name])=>norm(name)===norm(team))?.[1];
 const raw=String(typeof item==='string'?item:item?.app||item?.local||item?.source||item?.url||'').trim();
 if(/^https:\/\//i.test(raw))return raw;
 if(raw&&/^(?:\.\/)?assets\//i.test(raw))return BASE+raw.replace(/^\.\//,'');
 return '';
}
function avatar(name,team,c){
 const entries=Object.entries(c?.player_profiles||{});
 const list=entries.find(([x])=>norm(x)===norm(team))?.[1]||[];
 const p=Array.isArray(list)?list.find(x=>norm(x?.name)===norm(name)):null;
 const raw=String(p?.photo||'').trim();
 return /^https:\/\//i.test(raw)?raw:/^(?:\.\/)?assets\//i.test(raw)?BASE+raw.replace(/^\.\//,''):'';
}
function crest(team,name,player,c){
 const img=player?avatar(name,team,c)||logo(team):logo(team);
 if(img)return '<img class="ljr-uefa-crest" loading="lazy" decoding="async" src="'+esc(img)+'" alt="">';
 return '<span class="ljr-uefa-crest ljr-uefa-crest-fallback" aria-hidden="true">'+esc(String(player?name:team||'?').slice(0,1))+'</span>';
}
function playerRows(c){
 const map=new Map();
 function take(name,team){const key=norm(name)+'|'+norm(team);if(!name||!team)return null;if(!map.has(key))map.set(key,{name:String(name),team:String(team),goals:null,cedulas:null,yellow:null,red:null});return map.get(key)}
 for(const r of c.scorers){const item=take(r[1],r[2]);if(item)item.goals=numeric(r[3])}
 for(const p of c.usage){const item=take(p.name,p.team);if(item)item.cedulas=numeric(p.cedulas)}
 for(const r of c.cards){
  const type=norm(r[0]);const column=type.includes('amar')?'yellow':type.includes('roja')||type.includes('roja directa')?'red':null;
  if(!column)continue;
  const item=take(r[1],r[2]);if(item)item[column]=numeric(r[3]);
 }
 return [...map.values()];
}
function sortedTeam(data,index,asc=false){
 return data.teams.filter(r=>numeric(r[index])!==null).slice().sort((a,b)=>asc?numeric(a[index])-numeric(b[index]):numeric(b[index])-numeric(a[index]));
}
function sortedPlayer(data,metric){
 return playerRows(data).filter(p=>numeric(p[metric])!==null).sort((a,b)=>numeric(b[metric])-numeric(a[metric]));
}
function rowHtml(rank,title,subtitle,value,img){
 return '<div class="ljr-uefa-row"><span class="ljr-uefa-rank">'+rank+'</span>'+img+'<span class="ljr-uefa-row-copy"><b title="'+esc(title)+'">'+esc(title)+'</b><small>'+esc(subtitle)+'</small></span><strong>'+textValue(value)+'</strong></div>';
}
function rankCard(type,key,label,data){
 const conf=TEAM_FIELDS.find(f=>f[0]===key);
 const arr=type==='team'?sortedTeam(data,conf[2],key==='gc'||key==='pp'):sortedPlayer(data,key);
 const top=arr.slice(0,5);
 const list=top.length?top.map((item,i)=>{
  const team=type==='team'?item[1]:item.team,title=type==='team'?team:item.name,value=type==='team'?item[conf[2]]:item[key];
  return rowHtml(i+1,title,type==='team'?data.c.name||'Equipo':team,value,crest(team,title,type!=='team',data.c))
 }).join(''):'<p class="ljr-uefa-note">Sin registros publicados para esta métrica.</p>';
 return '<article class="ljr-uefa-card"><div class="ljr-uefa-cardhead"><b>'+esc(label)+'</b><span>RANKING OFICIAL</span></div><div class="ljr-uefa-rows">'+list+'</div><button type="button" class="ljr-uefa-cardfoot" data-ljr-rank="'+esc(type+'|'+key)+'">Ranking completo ›</button></article>';
}
function carousel(type,data){
 const items=type==='team'?[['gf','Goles'],['pj','Partidos disputados'],['pts','Puntos'],['pg','Partidos ganados'],['gc','Goles recibidos'],['dg','Diferencia de goles']]:[['goals','Goles'],['cedulas','Cédulas registradas'],['yellow','Tarjetas amarillas'],['red','Tarjetas rojas']];
 return '<section class="ljr-uefa-block"><div class="ljr-uefa-heading"><h2>Estadísticas de '+(type==='team'?'equipo':'jugador')+'</h2><div class="ljr-uefa-actions"><button type="button" class="ljr-uefa-arrow" data-ljr-slide="'+type+'|-1" aria-label="Desplazar a la izquierda">‹</button><button type="button" class="ljr-uefa-arrow" data-ljr-slide="'+type+'|1" aria-label="Desplazar a la derecha">›</button></div></div><div class="ljr-uefa-carousel" data-ljr-carousel="'+type+'">'+items.map(([key,label])=>rankCard(type,key,label,data)).join('')+'</div></section>';
}
function hero(data){
 const goals=data.teams.reduce((v,r)=>v+(numeric(r[6])||0),0);
 const goalsLabel=data.teams.length?goals:'—';
 const played=data.teams.reduce((v,r)=>v+(numeric(r[2])||0),0);
 const games=data.teams.length&&played%2===0?played/2:'—';
 return '<section class="ljr-uefa-hero" aria-label="Estadísticas de la fase de clasificación"><div><span class="ljr-uefa-kicker">DATOS · '+esc(data.c.name||'Liga Juventino Rosas')+'</span><h2>Estadísticas de la fase de clasificación</h2><p>Información de las cinco categorías desde los registros oficiales de la liga.</p></div><div class="ljr-uefa-hero-metrics"><div class="ljr-uefa-stat"><small>Goles registrados</small><strong>'+goalsLabel+'</strong><span>Según la tabla oficial actual</span></div><div class="ljr-uefa-stat"><small>Partidos disputados</small><strong>'+games+'</strong><span>Según los partidos contabilizados de los equipos</span></div></div></section>';
}
function leaders(data){
 const rows=sortedPlayer(data,'goals').slice(0,2);
 if(!rows.length)return '';
 return '<section class="ljr-uefa-block"><div class="ljr-uefa-heading"><h2>Máximo goleador</h2></div><div class="ljr-uefa-leaders">'+rows.map((p,i)=>'<div class="ljr-uefa-feature">'+crest(p.team,p.name,true,data.c)+'<div class="ljr-uefa-feature-copy"><small>#'+(i+1)+' · '+esc(p.team)+'</small><b>'+esc(p.name)+'</b></div><strong>'+textValue(p.goals)+'<small>Goles</small></strong></div>').join('')+'</div></section>';
}
function tableTeam(data,metric){
 const conf=TEAM_FIELDS.find(([key])=>key===metric)||TEAM_FIELDS[0];
 const rows=sortedTeam(data,conf[2],metric==='gc'||metric==='pp');
 const titles=['#','Equipo','PJ','PG','PE','PP','GF','GC','DG','PTS'];
 const selected=({pj:2,pg:3,pe:4,pp:5,gf:6,gc:7,dg:8,pts:9})[metric]||2;
 return '<table class="ljr-uefa-table"><thead><tr>'+titles.map((x,i)=>'<th'+(i===selected?' class="ljr-uefa-important"':'')+'>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map((r,i)=>'<tr><td>'+String(i+1).padStart(2,'0')+'</td><td><span class="ljr-uefa-name">'+crest(r[1],r[1],false,data.c)+'<span>'+esc(r[1])+'</span></span></td>'+[2,3,4,5,6,7,8,9].map(index=>'<td>'+textValue(r[index])+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
}
function tablePlayer(data,metric){
 const rows=metric==='minutes'||metric==='shots'||metric==='assists'?[]:sortedPlayer(data,metric);
 const titles=['#','Jugador','Equipo',metric==='goals'?'Goles':metric==='cedulas'?'Cédulas':metric==='yellow'?'Amarillas':metric==='red'?'Rojas':'Registro'];
 return rows.length?'<table class="ljr-uefa-table"><thead><tr>'+titles.map((x,i)=>'<th'+(i===3?' class="ljr-uefa-important"':'')+'>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map((p,i)=>'<tr><td>'+String(i+1).padStart(2,'0')+'</td><td><span class="ljr-uefa-name">'+crest(p.team,p.name,true,data.c)+'<span>'+esc(p.name)+'</span></span></td><td>'+esc(p.team)+'</td><td>'+textValue(p[metric])+'</td></tr>').join('')+'</tbody></table>':'<div class="ljr-uefa-empty">Esta estadística de jugadores no está publicada oficialmente para la categoría seleccionada. No se muestran cifras inventadas.</div>';
}
function explorer(data){
 const fields=state.view==='team'?TEAM_FIELDS:PLAYER_FIELDS;
 if(!fields.some(([id])=>id===state.metric))state.metric=fields[0][0];
 return '<section class="ljr-uefa-block ljr-uefa-explorer" id="ljr-uefa-explorer"><div class="ljr-uefa-heading"><h2>Estadísticas de '+(state.view==='team'?'equipo':'jugadores')+'</h2></div><div class="ljr-uefa-switch"><button type="button" class="'+(state.view==='team'?'active':'')+'" data-ljr-view="team" aria-pressed="'+(state.view==='team')+'">Equipos</button><button type="button" class="'+(state.view==='player'?'active':'')+'" data-ljr-view="player" aria-pressed="'+(state.view==='player')+'">Jugadores</button></div><div class="ljr-uefa-filterline"><button type="button" class="ljr-uefa-arrow" data-ljr-filter-arrow="-1" aria-label="Anterior filtro">‹</button><div class="ljr-uefa-filters" data-ljr-filters>'+fields.map(([id,label])=>'<button type="button" class="ljr-uefa-filter '+(id===state.metric?'active':'')+'" data-ljr-filter="'+id+'" aria-pressed="'+(id===state.metric)+'">'+esc(label)+'</button>').join('')+'</div><button type="button" class="ljr-uefa-arrow" data-ljr-filter-arrow="1" aria-label="Siguiente filtro">›</button></div><div class="ljr-uefa-table-scroll">'+(state.view==='team'?tableTeam(data,state.metric):tablePlayer(data,state.metric))+'</div><p class="ljr-uefa-note">Datos disponibles: '+esc(data.c.name||'categoría')+'. Se preservan los valores publicados; «—» significa no disponible.</p></section>';
}
function renderExplorer(){
 const main=document.querySelector('#screen .ljr-uefa-root');if(!main||!active())return;
 const data=records(state.cat);const current=main.querySelector('#ljr-uefa-explorer');
 if(current)current.outerHTML=explorer(data);
}

/* Ocho referencias PC: gráficas, guía y zona deportiva.
   Exclusivo del módulo #/pc-data; reutiliza únicamente datos oficiales. */
function enrichEightReferences(dashboard,d){
 const chartIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>';
 const bookIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>';
 const roots=dashboard.querySelectorAll('.ljr-uefa-block');
 if(roots[0])roots[0].id='ljpc-eight-teams';
 if(roots[1])roots[1].id='ljpc-eight-players';
 if(roots[2])roots[2].id='ljpc-eight-goals';
 const mainHero=dashboard.querySelector('.ljr-uefa-hero');
 if(mainHero)mainHero.id='ljpc-eight-overview';
 const nav=document.createElement('nav');
 nav.className='ljpc-eight-tabs';
 nav.setAttribute('aria-label','Estadísticas y contenidos del portal PC');
 const tabs=[
  ['ljpc-eight-teams','Estadísticas de equipo'],
  ['ljpc-eight-players','Estadísticas de jugadores'],
  ['ljpc-eight-goals','Máximo goleador'],
  ['ljpc-eight-phase','Fase de clasificación'],
  ['ljr-uefa-explorer','Tablas completas'],
  ['ljpc-eight-book','Libro de estadísticas'],
  ['ljpc-eight-performance','Performance Zone']
 ];
 nav.innerHTML=tabs.map(([target,label])=>
  '<button type="button" data-ljpc-eight-target="'+target+'" class="ljpc-eight-pill">'+esc(label)+'</button>'
 ).join('');
 dashboard.prepend(nav);
 const teams=d.teams.filter(r=>numeric(r[6])!==null).slice().sort((a,b)=>numeric(b[6])-numeric(a[6])).slice(0,9);
 const maxGoals=Math.max(1,...teams.map(r=>numeric(r[6])||0));
 const totalGoals=d.teams.reduce((sum,r)=>sum+(numeric(r[6])||0),0);
 const totalPlayed=d.teams.reduce((sum,r)=>sum+(numeric(r[2])||0),0);
 const matchCount=d.teams.length&&totalPlayed%2===0?String(totalPlayed/2):'—';
 const bars=teams.length?teams.map(r=>{
  const goal=numeric(r[6])||0,height=Math.max(5,Math.round(goal/maxGoals*100));
  return '<button type="button" data-ljpc-eight-go="pc-standings" class="ljpc-eight-bar" title="'+esc(r[1])+' · '+goal+' goles"><span><i style="height:'+height+'%"></i></span><b>'+goal+'</b><small>'+esc(String(r[1]).slice(0,13))+'</small></button>';
 }).join(''):'<p class="ljpc-eight-muted">Sin goles publicados para esta categoría.</p>';
 const phase=document.createElement('section');
 phase.className='ljpc-eight-phase';phase.id='ljpc-eight-phase';
 phase.innerHTML='<div class="ljpc-eight-phase-top"><div class="ljpc-eight-phase-intro"><small>ESTADÍSTICAS DE LA FASE DE CLASIFICACIÓN</small><h2>Estadísticas de la fase de clasificación</h2><div class="ljpc-eight-big-data"><div><strong>'+(d.teams.length?totalGoals:'—')+'</strong><span>Goles registrados</span></div><div><strong>'+matchCount+'</strong><span>Partidos contabilizados</span></div></div></div><div class="ljpc-eight-bars-wrap"><h3>Clubes con más goles</h3><div class="ljpc-eight-bars">'+bars+'</div></div></div><div class="ljpc-eight-phase-bottom"><span>Datos reales de '+esc(d.c.name||'la categoría seleccionada')+' · Sin estimaciones</span><button type="button" data-ljpc-eight-go="pc-standings">Ver clasificación completa <span aria-hidden="true">›</span></button></div>';
 const book=document.createElement('section');
 book.className='ljpc-eight-book';book.id='ljpc-eight-book';
 book.innerHTML='<div class="ljpc-eight-book-copy"><span>GUÍA OFICIAL · LIGA JUVENTINO ROSAS</span><h2>Libro de estadísticas de la Liga Juventino Rosas</h2><p>Consulta las tablas, las estadísticas de equipo y jugador, las jornadas y los registros disponibles de cada categoría en un solo lugar.</p><p>Los resultados provienen de los datos oficiales publicados. Las métricas que no estén registradas se señalan como no disponibles.</p><button type="button" data-ljpc-eight-csv>'+bookIcon+' Descargar estadísticas CSV</button></div><div class="ljpc-eight-book-cover"><img src="./deportiva-sur-partido.jpg" alt="Partido de fútbol de la liga" loading="lazy" decoding="async"></div>';
 const clubs=d.teams.slice(0,10).filter(r=>r[1]).map(r=>'<button type="button" data-ljpc-eight-go="teams" title="'+esc(r[1])+'"><span>'+crest(r[1],r[1],false,d.c)+'</span><small>'+esc(r[1])+'</small></button>').join('');
 const media=[
  ['pc-scorers','Máximos goleadores','Clasificación individual de la temporada','./deportiva-sur-partido.jpg'],
  ['pc-standings','Clasificación actual','Todos los clubes por categoría','./home-feature-reference.webp'],
  ['pc-fixtures','Partidos y jornadas','Consulta el calendario oficial','./deportiva-sur-partido.jpg'],
  ['history','Historia de la liga','Campeones y finales históricas','./home-feature-reference.webp'],
  ['pc-data','Estadísticas de clubes','Goles, puntos y encuentros','./deportiva-sur-partido.jpg'],
  ['video','Liga TV','Vídeos y transmisiones disponibles','./video-hero-reference.webp']
 ];
 const performance=document.createElement('section');
 performance.className='ljpc-eight-performance';performance.id='ljpc-eight-performance';
 performance.innerHTML='<div class="ljpc-eight-performance-hero"><img src="./deportiva-sur-partido.jpg" alt="" loading="lazy" decoding="async"><div><small>LIGA JUVENTINO ROSAS</small><h2>Performance Zone</h2><p>Datos, equipos, jugadores y mejores momentos de nuestra liga.</p></div></div><div class="ljpc-eight-clubs" aria-label="Accesos a clubes">'+(clubs||'<span class="ljpc-eight-muted">Los clubes se mostrarán cuando exista clasificación oficial.</span>')+'</div><div class="ljpc-eight-media">'+media.map(([go,title,caption,img])=>'<button type="button" data-ljpc-eight-go="'+go+'" class="ljpc-eight-media-card"><span class="ljpc-eight-media-art"><img alt="" src="'+img+'" loading="lazy" decoding="async"><i>'+chartIcon+'</i></span><b>'+esc(title)+'</b><small>'+esc(caption)+'</small></button>').join('')+'</div><div class="ljpc-eight-performance-end"><button type="button" data-ljpc-eight-go="safe-performance">Abrir zona de rendimiento <span aria-hidden="true">›</span></button><button type="button" data-ljpc-eight-go="video">Ver Liga TV <span aria-hidden="true">›</span></button></div>';
 const explorer=dashboard.querySelector('#ljr-uefa-explorer');
 if(explorer)explorer.before(phase);
 dashboard.querySelectorAll('.ljr-uefa-book').forEach(x=>x.remove());
 dashboard.append(book,performance);
}

function enhance(){
 const on=active(),html=document.documentElement;
 html.classList.toggle('ljr-pc-datos-uefa',on);
 if(!on)return;
 const data=source();if(!data){getData();return}
 const host=document.querySelector('#screen .ljpc-data[data-ljpc-v976="pc-data"]');
 if(!host||host.dataset.ljrUefaEnhanced)return;
 host.dataset.ljrUefaEnhanced='1';
 const cat=category();if(state.cat!==cat){state={cat,view:'team',metric:'pj'}}
  if(pendingMenuView){
   state.view=pendingMenuView;
   state.metric=state.view==='team'?'pj':'goals';
   pendingMenuView=null;
  }
 const d=records(cat);
 const dashboard=document.createElement('div');
 dashboard.className='ljr-uefa-root';
 dashboard.innerHTML=hero(d)+carousel('team',d)+carousel('player',d)+leaders(d)+explorer(d)+
 '<section class="ljr-uefa-book"><div><b>Libro de estadísticas de la Liga Juventino Rosas</b><p>Consulta tablas oficiales, estadísticas registradas y archivos exportables sin modificar los resultados.</p></div><button type="button" data-ljr-download>Descargar tabla CSV ↗</button></section>'+
 '<section class="ljr-uefa-book"><div><b>Performance Zone · Liga Juventino Rosas</b><p>Explora el análisis deportivo en la sección existente.</p></div><button type="button" data-ljr-go="safe-performance">Abrir Performance Zone ›</button></section>';
 enrichEightReferences(dashboard,d);
 const cats=host.querySelector('.ljpc-categories');
 if(cats)cats.after(dashboard);else host.prepend(dashboard);
 const details=document.createElement('details');details.className='ljr-uefa-official-details';
 details.innerHTML='<summary>Consultar las tablas oficiales completas, filtros y exportaciones</summary>';
 ['.ljpc-data-head','.ljpc-tabs','.ljpc-data-tablebox','.ljpc-empty','.ljpc-data-footer'].forEach(sel=>{const el=host.querySelector(':scope > '+sel);if(el)details.append(el)});
 host.append(details);
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}
document.addEventListener('click',e=>{
 if(!active()||!(e.target instanceof Element))return;
 const hit=e.target.closest('[data-ljr-slide],[data-ljr-view],[data-ljr-filter],[data-ljr-filter-arrow],[data-ljr-rank],[data-ljr-download],[data-ljr-go]');
 if(!hit)return;
 if(hit.hasAttribute('data-ljr-slide')){
  const [kind,dir]=hit.dataset.ljrSlide.split('|');const el=document.querySelector('[data-ljr-carousel="'+kind+'"]');
  if(el)el.scrollBy({left:Number(dir)*(el.querySelector('.ljr-uefa-card')?.getBoundingClientRect().width||300)+Number(dir)*14,behavior:'smooth'});
 }else if(hit.hasAttribute('data-ljr-filter-arrow')){
  document.querySelector('[data-ljr-filters]')?.scrollBy({left:Number(hit.dataset.ljrFilterArrow)*240,behavior:'smooth'});
 }else if(hit.hasAttribute('data-ljr-view')){
  state.view=hit.dataset.ljrView;state.metric=state.view==='team'?'pj':'goals';renderExplorer();
 }else if(hit.hasAttribute('data-ljr-filter')){
  state.metric=hit.dataset.ljrFilter;renderExplorer();
 }else if(hit.hasAttribute('data-ljr-rank')){
  const [view,metric]=hit.dataset.ljrRank.split('|');state.view=view;state.metric=metric;renderExplorer();
  document.getElementById('ljr-uefa-explorer')?.scrollIntoView({behavior:'smooth',block:'start'});
 }else if(hit.hasAttribute('data-ljr-download')){
  const details=document.querySelector('.ljr-uefa-official-details');if(details)details.open=true;
  document.querySelector('#screen .ljpc-data [data-ljpc-csv]')?.click();
 }else if(hit.hasAttribute('data-ljr-go')){
  location.hash='#/'+hit.dataset.ljrGo;
 }
});

document.addEventListener('click',function(e){
 if(!active()||!(e.target instanceof Element))return;
 const hit=e.target.closest('[data-ljpc-eight-target],[data-ljpc-eight-go],[data-ljpc-eight-csv]');
 if(!hit)return;
 if(hit.hasAttribute('data-ljpc-eight-target')){
  const id=hit.dataset.ljpcEightTarget;
  document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
 }else if(hit.hasAttribute('data-ljpc-eight-go')){
  const destination=hit.dataset.ljpcEightGo;
  if(/^[a-zA-Z][a-zA-Z0-9-]*$/.test(destination))location.hash='#/'+destination;
 }else if(hit.hasAttribute('data-ljpc-eight-csv')){
  const original=document.querySelector('#screen .ljpc-data [data-ljpc-csv]');
  if(original){
   document.querySelector('.ljr-uefa-official-details')?.setAttribute('open','');
   original.click();
  }
 }
},true);

window.addEventListener('ljpc:pc-data-view',e=>{
  const view=e.detail?.view;
  if(view!=='team'&&view!=='player')return;
  pendingMenuView=view;
  if(active()&&document.querySelector('#screen .ljr-uefa-root')){
   state.view=view;state.metric=view==='team'?'pj':'goals';
   pendingMenuView=null;renderExplorer();
   document.getElementById('ljr-uefa-explorer')?.scrollIntoView({block:'start',behavior:'smooth'});
  }
 });
 window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',schedule);
document.addEventListener('DOMContentLoaded',()=>{
 const screen=document.getElementById('screen');
 if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:true});
 schedule();
},{once:true});
if(document.readyState!=='loading'){
 const screen=document.getElementById('screen');
 if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:true});
 schedule();
}
})();