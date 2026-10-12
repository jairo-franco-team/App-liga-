/* Datos PC con distribución tipo UEFA, basada exclusivamente en estadísticas publicadas.
   Solo #/pc-data y exclusivamente escritorio. No escribe datos, estilos ni rutas móviles. */
(function(){
'use strict';
if(window.__LJR_PC_DATOS_UEFA_20261011__)return;
window.__LJR_PC_DATOS_UEFA_20261011__=true;
const CATS=['3','5','4','2','1'], BASE='https://raw.githubusercontent.com/jairofrancog7-star/Liga_Futbol/main/';
const TEAM_FIELDS=[['pj','Datos clave',2],['gf','Goles',6],['pg','Victorias',3],['pe','Empates',4],['pp','Derrotas',5],['gc','Defensa',7],['dg','Diferencia',8],['pts','Puntos',9]];
const PLAYER_FIELDS=[['goals','Goles'],['cedulas','Cédulas'],['yellow','Amarillas'],['red','Rojas'],['minutes','Minutos'],['assists','Asistencias'],['shots','Disparos']];
let live=null, fetching=false,queued=false, state={cat:'',view:'team',metric:'pj'};
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0];
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const desktop=()=>!['mobile','apk'].includes(mode())&&(mode()==='desktop'||window.innerWidth>=1024);
const active=()=>desktop()&&route()==='pc-data';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-MX').replace(/[^a-z0-9]+/g,' ').trim();
const numeric=v=>{if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(String(v).trim().replace(',','.'));return Number.isFinite(n)?n:null};
const textValue=v=>v===null||v===undefined||String(v).trim()===''?'—':esc(v);
function source(){const found=window.LJR_OFFICIAL_DATA||window.LJR_OFFICIAL_API?.getData?.()||live;return found?.categories?found:null}
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
function enhance(){
 const on=active(),html=document.documentElement;
 html.classList.toggle('ljr-pc-datos-uefa',on);
 if(!on)return;
 const data=source();if(!data){getData();return}
 const host=document.querySelector('#screen .ljpc-data[data-ljpc-v976="pc-data"]');
 if(!host||host.dataset.ljrUefaEnhanced)return;
 host.dataset.ljrUefaEnhanced='1';
 const cat=category();if(state.cat!==cat){state={cat,view:'team',metric:'pj'}}
 const d=records(cat);
 const dashboard=document.createElement('div');
 dashboard.className='ljr-uefa-root';
 dashboard.innerHTML=hero(d)+carousel('team',d)+carousel('player',d)+leaders(d)+explorer(d)+
 '<section class="ljr-uefa-book"><div><b>Libro de estadísticas de la Liga Juventino Rosas</b><p>Consulta tablas oficiales, estadísticas registradas y archivos exportables sin modificar los resultados.</p></div><button type="button" data-ljr-download>Descargar tabla CSV ↗</button></section>'+
 '<section class="ljr-uefa-book"><div><b>Performance Zone · Liga Juventino Rosas</b><p>Explora el análisis deportivo en la sección existente.</p></div><button type="button" data-ljr-go="safe-performance">Abrir Performance Zone ›</button></section>';
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