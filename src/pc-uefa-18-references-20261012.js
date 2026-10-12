/* 18 referencias UEFA → Liga Juventino Rosas. Exclusivamente PC.
   Datos de la Liga; simulaciones nunca se publican como resultados oficiales. */
(function(){
'use strict';
if(window.__LJPC_UEFA_18_REFERENCE__)return;
window.__LJPC_UEFA_18_REFERENCE__=true;
const CAT={'3':'Primera Fuerza','5':'Intermedia','4':'Segunda Fuerza','2':'Veteranos 35+','1':'Veteranos 50+'};
const BASE='https://raw.githubusercontent.com/jairofrancog7-star/Liga_Futbol/main/';
const allowed=new Set(['pc-fixtures','pc-standings','pc-draws','video']);
const state={cat:'3',fixturesTab:'matches',fixtureType:'all',filterOpen:false,calendarOpen:false,chosenDays:[],standTab:'league',standMode:'table',drawTab:'results',videoTab:'all',scoreOverrides:{},showClassic:false};
let db=null,loading=false,pending=false,currentRoute='',lastRef=null;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const num=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&/^-?\d+(?:\.\d+)?$/.test(String(v).trim())?Number(v):null;
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
const desktop=()=>{const mode=new URLSearchParams(location.search).get('mode');return mode!=='mobile'&&mode!=='apk'&&(mode==='desktop'||innerWidth>=1024);};
const active=()=>desktop()&&allowed.has(route());
const go=r=>{location.hash='#/'+r;};
function source(){const d=window.LJR_OFFICIAL_DATA||window.LJR_OFFICIAL_API?.getData?.()||db;return d?.categories?d:null;}
function load(){
 if(source()||loading)return;
 loading=true;
 fetch('./data/official-live.json?v=pc-uefa-18-20261012',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('No se pudo cargar la fuente');return r.json()})
 .then(v=>{if(v?.categories)db=v;repaint()})
 .catch(()=>{}).finally(()=>{loading=false});
}
function chooseCat(){
 try{const v=sessionStorage.getItem('ljpc-selected-category');if(CAT[v])state.cat=v;}catch(_){}
}
function keepCat(v){
 if(!CAT[v])return;
 state.cat=v;state.chosenDays=[];
 try{sessionStorage.setItem('ljpc-selected-category',v);}catch(_){}
}
function category(){return source()?.categories?.[state.cat]||{};}
function imgOf(team){
 let v='';
 try{v=window.LJR_OFFICIAL_API?.getLogo?.(team)||'';
 if(!v){const e=Object.entries(source()?.team_logos||{}).find(([t])=>norm(t)===norm(team));v=e?.[1]||'';}
 if(typeof v==='object')v=v.app||v.local||v.source||v.url||'';
 v=String(v).trim();
 if(/^(?:\.\/)?assets\//.test(v))v=BASE+v.replace(/^\.\//,'');
 if(!/^https:\/\//.test(v)&&!v.startsWith('./'))v='';
 }catch(_){v='';}
 return v;
}
function crest(name){
 const v=imgOf(name);
 return v?'<img class="u18-crest" loading="lazy" decoding="async" src="'+escape(v)+'" alt="">':'<span class="u18-crest u18-empty" aria-hidden="true">'+escape(String(name||'?').slice(0,1))+'</span>';
}
function fixtures(){
 const cat=category(),out=[];
 for(const group of cat.fixtures||[])for(const row of group.rows||[]){
  if(!Array.isArray(row)||!row[2]||!row[6])continue;
  const raw=String(row[8]||'').trim(),m=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  const dt=m?new Date(+m[3],+m[2]-1,+m[1],+m[4],+m[5]):null;
  const hs=num(row[3]),as=num(row[5]),played=hs!==null&&as!==null;
  const decision=cat.fixture_decisions?.[String(row[0])];
  out.push({id:String(row[0]||out.length),date:dt,day:m?m[3]+'-'+m[2]+'-'+m[1]:'',time:m?m[4]+':'+m[5]:'',
    home:String(row[2]),away:String(row[6]),hs,as,played,decision,round:String(row[1]||''),venue:String(row[7]||'')});
 }
 return out.sort((a,b)=>(a.date?.getTime()||0)-(b.date?.getTime()||0));
}
function tableRows(){
 return (category().standings?.[0]?.rows||[]).filter(r=>Array.isArray(r)&&r[1]);
}
function catSelect(){
 return '<label class="u18-cat-label">Categoría <select data-u18-cat aria-label="Seleccionar categoría">'+
 Object.entries(CAT).map(([k,v])=>'<option value="'+k+'"'+(state.cat===k?' selected':'')+'>'+escape(v)+'</option>').join('')+'</select></label>';
}
function pills(items,activeValue,attr){
 return items.map(([key,label])=>'<button type="button" '+attr+'="'+key+'" class="u18-pill'+(key===activeValue?' selected':'')+'" aria-pressed="'+(key===activeValue)+'">'+escape(label)+'</button>').join('');
}
function shell(title,sub,body,blue=true){
 return '<section class="u18-page">'+(blue?'<header class="u18-bluehead"><div class="u18-bound"><h1>'+escape(title)+'</h1>'+
 (sub?'<p>'+escape(sub)+'</p>':'')+'</div></header>':'')+
 '<div class="u18-bound u18-body">'+body+
 '<details class="u18-original"'+(state.showClassic?' open':'')+'><summary>Ver herramientas originales de esta sección</summary>'+
 '<p>Los controles originales siguen disponibles debajo de la nueva presentación.</p></details></div></section>';
}
function dateLabel(k){
 if(!k)return 'Fecha por confirmar';
 const d=new Date(k+'T12:00:00');
 return new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);
}
function dateNav(list){
 const keys=[...new Set(list.filter(m=>m.day).map(m=>m.day))].sort().slice(-18);
 return '<div class="u18-datebar" aria-label="Fechas de partido"><button type="button" data-u18-day="" class="'+(!state.chosenDays.length?'selected':'')+'">Todas</button>'+
 keys.map(k=>'<button type="button" data-u18-day="'+k+'" class="'+(state.chosenDays.includes(k)?'selected':'')+'">'+
 escape(new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short'}).format(new Date(k+'T12:00:00')))+'</button>').join('')+'</div>';
}
function eventCards(){
 let rows=fixtures();
 if(state.fixtureType==='upcoming')rows=rows.filter(m=>!m.played&&!m.decision?.winner);
 if(state.fixtureType==='results')rows=rows.filter(m=>m.played||m.decision?.winner);
 if(state.chosenDays.length)rows=rows.filter(m=>state.chosenDays.includes(m.day));
 if(!state.chosenDays.length)rows=state.fixtureType==='upcoming'?rows.slice(0,50):rows.slice(-80).reverse();
 const groups=new Map();
 rows.forEach(m=>{const key=m.day||'unknown';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(m);});
 if(!rows.length)return '<div class="u18-empty-state">No hay partidos publicados con estos filtros. Selecciona otra categoría o fecha.</div>';
 return [...groups].map(([day,games])=>'<section class="u18-matchday"><div class="u18-daycopy"><small>'+escape(dateLabel(day))+'</small><h3>'+escape(games[0]?.round?'Jornada '+games[0].round:'Partidos')+'</h3><span>'+escape(CAT[state.cat])+' · '+games.length+' encuentros</span></div>'+
 '<div class="u18-fixturegrid">'+games.map(m=>'<article class="u18-matchcard"><div class="u18-matchmeta">'+escape(m.venue||'Sede por confirmar')+
 ' · '+escape(m.time||'Horario por confirmar')+'</div><div class="u18-matchteams">'+crest(m.home)+'<span>'+escape(m.home)+'</span>'+
 '<b>'+escape(m.played?m.hs+' : '+m.as:'— : —')+'</b><span>'+escape(m.away)+'</span>'+crest(m.away)+'</div>'+
 (m.decision?.winner?'<small class="u18-decision">Resolución administrativa: '+escape(m.decision.winner)+'</small>':
 '<small class="u18-decision">'+(m.played?'Resultado registrado':'Programado · pendiente de resultado')+'</small>')+
 '</article>').join('')+'</div></section>').join('');
}
function bracket(){
 return '<div class="u18-bracket"><div class="u18-brackethead"><h2>Fase eliminatoria</h2><p>La visualización del cuadro utiliza únicamente cruces oficiales publicados; no completa equipos ni marcadores faltantes.</p></div>'+
 '<div class="u18-bracketdiagram"><div><b>Octavos</b><span>Por confirmar</span></div><div><b>Cuartos</b><span>Por confirmar</span></div>'+
 '<div><b>Semifinales</b><span>Por confirmar</span></div><div><b>Final</b><span>🏆</span></div></div>'+
 '<div class="u18-panel"><strong>Cuadro de la Liga</strong><p>Abre la herramienta de cuadros para consultar o crear un sorteo de prueba, sin modificar los resultados oficiales.</p>'+
 '<button class="u18-button" data-u18-go="bracketBuilder">Abrir generador de cuadros ›</button></div></div>';
}
function fixturesPage(){
 const f=fixtures();
 const actions='<div class="u18-controls"><div class="u18-controls-left">'+catSelect()+'</div>'+
 '<div class="u18-controls-right"><button data-u18-go="pc-notifications">Notificaciones ◉</button>'+
 '<button data-u18-modal="calendar">Añadir al calendario ▦</button><button class="u18-accent" data-u18-modal="filter">Filtrar ▾</button></div></div>';
 const filter=state.filterOpen||state.calendarOpen?'<div class="u18-modal-layer" data-u18-dismiss><div class="u18-modal" role="dialog" aria-modal="true" aria-label="'+(state.filterOpen?'Filtrar partidos':'Añadir al calendario')+'">'+
 '<div class="u18-modal-title"><h3>'+(state.filterOpen?'Filtrar':'Añadir al calendario')+'</h3><button type="button" data-u18-modal="close" aria-label="Cerrar">×</button></div>'+
 '<p>'+(state.filterOpen?'Ordenar encuentros y elegir el tipo de partidos que quieres ver.':'Selecciona un encuentro de la fuente oficial para añadirlo a tu calendario.')+'</p>'+
 (state.filterOpen?'<div class="u18-radio">'+pills([['all','Todos'],['upcoming','Próximos'],['results','Resultados']],state.fixtureType,'data-u18-filter')+'</div>':
 '<div class="u18-modal-list">'+f.filter(x=>x.date&&!x.played).slice(0,24).map(x=>'<button data-u18-calendar="'+escape(x.id)+'">'+crest(x.home)+'<span>'+escape(x.home)+' - '+escape(x.away)+'<small>'+escape(dateLabel(x.day)+' · '+x.time)+'</small></span></button>').join('')+'</div>')+
 '<footer><button class="u18-button" data-u18-modal="close">Cerrar</button></footer></div></div>':'';
 const tabs='<div class="u18-switch">'+pills([['matches','Partidos y resultados'],['bracket','Ver cuadro']],state.fixturesTab,'data-u18-fixture-tab')+'</div>';
 return shell('Partidos y resultados',CAT[state.cat],tabs+actions+
 (state.fixturesTab==='matches'?dateNav(f)+eventCards():bracket())+filter);
}
function standingsTable(rows,simulated=false){
 let data=rows.slice();
 if(simulated){
  const delta=new Map();
  for(const m of fixtures()){
   const pair=state.scoreOverrides[m.id];
   if(!pair||pair[0]===''||pair[1]==='')continue;
   const a=num(pair[0]),b=num(pair[1]);
   if(a===null||b===null||a<0||b<0||m.played)continue;
   function inc(team,pts,gf,gc){const x=delta.get(norm(team))||{pts:0,gf:0,gc:0,pj:0,win:0,draw:0,loss:0};x.pts+=pts;x.gf+=gf;x.gc+=gc;x.pj++;x.win+=gf>gc?1:0;x.draw+=gf===gc?1:0;x.loss+=gf<gc?1:0;delta.set(norm(team),x);}
   inc(m.home,a>b?3:a===b?1:0,a,b);
   inc(m.away,b>a?3:a===b?1:0,b,a);
  }
  data=data.map(r=>{const d=delta.get(norm(r[1]));if(!d)return r;const c=r.slice();for(const [j,v] of [[2,d.pj],[3,d.win],[4,d.draw],[5,d.loss],[6,d.gf],[7,d.gc],[8,d.gf-d.gc],[9,d.pts]])c[j]=(num(c[j])||0)+v;return c;});
  data.sort((a,b)=>(num(b[9])||0)-(num(a[9])||0)||(num(b[8])||0)-(num(a[8])||0)||(num(b[6])||0)-(num(a[6])||0));
 }
 return '<div class="u18-tablewrap"><table class="u18-table"><thead><tr>'+
 ['#','Equipo','PJ','PG','PE','PP','GF','GC','DG','PTS'].map(x=>'<th>'+x+'</th>').join('')+
 '</tr></thead><tbody>'+data.map((r,i)=>'<tr><td class="u18-place">'+(i+1)+'</td><td class="u18-team">'+crest(r[1])+'<b>'+escape(r[1])+'</b></td>'+
 [2,3,4,5,6,7,8,9].map(j=>'<td>'+escape(r[j]===undefined||r[j]===''?'—':r[j])+'</td>').join('')+'</tr>').join('')+
 '</tbody></table></div>';
}
function simulation(){
 const matches=fixtures().filter(m=>!m.played&&!m.decision?.winner).slice(0,24);
 const matchInputs=matches.map(m=>{
 const val=state.scoreOverrides[m.id]||['',''];
 return '<div class="u18-simrow"><span>'+crest(m.home)+escape(m.home)+'</span>'+
 '<input type="number" min="0" max="99" inputmode="numeric" aria-label="Goles '+escape(m.home)+' contra '+escape(m.away)+'" data-u18-score="'+escape(m.id)+'" data-side="0" value="'+escape(val[0])+'">'+
 '<i>:</i><input type="number" min="0" max="99" inputmode="numeric" aria-label="Goles '+escape(m.away)+' contra '+escape(m.home)+'" data-u18-score="'+escape(m.id)+'" data-side="1" value="'+escape(val[1])+'">'+
 '<span class="u18-simaway">'+escape(m.away)+crest(m.away)+'</span></div>';
 }).join('');
 return '<div class="u18-simlayout"><div class="u18-simleft"><div class="u18-simhead"><h3>Simulador de resultados</h3>'+
 '<button data-u18-reset>Restablecer</button></div><p>Introduce marcadores hipotéticos. No se guardan como oficiales.</p>'+
 (matchInputs||'<p>No hay partidos pendientes publicados para simular.</p>')+'</div>'+
 '<div class="u18-simright"><h3>Clasificación simulada</h3><p>Los puntos provisionales cambian al introducir un marcador.</p>'+
 '<div data-u18-sim-table>'+standingsTable(tableRows(),true)+'</div></div></div>';
}
function standingsPage(){
 const categoryOptions=catSelect();
 const tabbar='<div class="u18-switch">'+pills([['league','Fase liga'],['knockout','Fase eliminatoria'],['simulator','Simulador de resultados']],state.standTab,'data-u18-stand-tab')+'</div>';
 const controls='<div class="u18-controls">'+categoryOptions+
 '<div class="u18-controls-right"><button data-u18-go="pc-fixtures">Ver partidos</button><button data-u18-go="tableExport">Descargar tabla ↓</button></div></div>';
 const rows=tableRows(),content=state.standTab==='knockout'?bracket():state.standTab==='simulator'?simulation():
 '<div class="u18-panel"><div class="u18-blocktitle"><h2>Clasificación de la fase liga</h2><small>'+escape(CAT[state.cat])+'</small></div>'+
 (rows.length?standingsTable(rows):'<p>La clasificación de esta categoría no está disponible.</p>')+
 '<p class="u18-footnote">PJ · partidos; PG · ganados; PE · empates; PP · perdidos; GF/GC · goles; DG · diferencia; PTS · puntos.</p></div>';
 return shell('Clasificación',CAT[state.cat],tabbar+controls+content);
}
function drawsPage(){
 const rows=tableRows(),squads=rows.filter(r=>r[1]).map(r=>r[1]);
 const tabs='<div class="u18-drawtabs">'+pills([['results','Resultados'],['updates','Actualizaciones'],['pots','Bombos'],['procedure','Procedimiento']],state.drawTab,'data-u18-draw-tab')+'</div>';
 let detail='';
 if(state.drawTab==='results')detail='<h3>Participantes de la categoría</h3><p>La liga no ha publicado un sorteo oficial completo en los datos disponibles. Estos clubes proceden de la tabla oficial, sin asignarles enfrentamientos.</p>'+
 '<div class="u18-entrants">'+squads.map(n=>'<div>'+crest(n)+'<span>'+escape(n)+'</span></div>').join('')+'</div>';
 if(state.drawTab==='updates')detail='<h3>Actualizaciones oficiales</h3><p>Consulta los reportes de la Liga Juventino Rosas para conocer los próximos sorteos y enfrentamientos aprobados.</p>'+
 '<a href="https://www.juventinorosasliga.com/reporte-semanal/" rel="noopener noreferrer" target="_blank">Abrir reporte semanal ↗</a>';
 if(state.drawTab==='pots')detail='<h3>Bombos del sorteo</h3><p>La fuente oficial todavía no identifica bombos confirmados. Puedes preparar una distribución de prueba en el generador.</p><button class="u18-button" data-u18-go="bracketBuilder">Crear sorteo de prueba</button>';
 if(state.drawTab==='procedure')detail='<h3>Procedimiento del sorteo</h3><p>Los criterios y las fechas oficiales deben ser confirmados por la liga. El generador sirve únicamente para crear cuadros editables y exportarlos.</p><button class="u18-button" data-u18-go="bracketBuilder">Abrir generador</button>';
 return shell('Sorteo de la fase liga','Liga Juventino Rosas · '+CAT[state.cat],
 '<div class="u18-controls">'+catSelect()+'<div class="u18-controls-right"><button data-u18-go="bracketBuilder">Crear cuadro</button></div></div>'+
 '<div class="u18-drawstage"><div class="u18-videotile"><div class="u18-film"><span aria-hidden="true">▶</span></div><b>Transmisiones de sorteos y partidos</b><button data-u18-go="video">Ir a Liga TV ↗</button></div>'+
 '<div class="u18-drawright">'+tabs+'<div class="u18-drawdetail">'+detail+'</div></div></div>');
}
const vids=[
 ['Destacados','./public/video-hero-reference.webp','video','Clips y transmisiones de la Liga'],
 ['Momentos de la Liga','./assets/moments/moments-original-a.png','moments','Recuerdos y celebraciones'],
 ['Partidos clásicos','./public/home-feature-reference.webp','history','Archivo histórico de encuentros'],
 ['Finales','./assets/home-players-user.png','history','Campeones y partidos decisivos'],
 ['Goles destacados','./assets/moments/moments-original-b.png','moments','Momentos de fútbol local'],
 ['Noticias en vídeo','./public/video-hero-reference.webp','news','Publicaciones y avisos de la Liga']
];
function videoPage(){
 const filters=[['all','Destacados'],['classics','Clásicos'],['finals','Finales'],['moments','Momentos']];
 const chosen=state.videoTab==='all'?vids:state.videoTab==='classics'?vids.filter(x=>x[0].includes('clásicos')):state.videoTab==='finals'?vids.filter(x=>x[0]==='Finales'):vids.filter(x=>/Momentos|Goles/.test(x[0]));
 return '<section class="u18-video"><div class="u18-videohero"><img loading="lazy" src="./public/video-hero-reference.webp" alt=""><div><small>LIGA TV</small><h1>Los mejores momentos de la Liga</h1><p>Partidos, noticias, historias y vídeos de Juventino Rosas</p><button data-u18-show-original>Ver vídeos de la Liga ▶</button></div></div>'+
 '<div class="u18-bound"><div class="u18-videopills">'+pills(filters,state.videoTab,'data-u18-video-tab')+'</div>'+
 '<div class="u18-video-title"><h2>Selección del editor</h2><button data-u18-go="moments">Ver todos ›</button></div>'+
 '<div class="u18-video-grid">'+chosen.map(v=>'<button class="u18-videocard" type="button" '+(v[2]==='video'?'data-u18-show-original':'data-u18-go="'+v[2]+'"')+'><div class="u18-poster"><img loading="lazy" src="'+v[1]+'" alt=""><span>▶</span></div><b>'+escape(v[0])+'</b><small>'+escape(v[3])+'</small></button>').join('')+'</div>'+
 '<div class="u18-video-title"><h2>Partidos y finales</h2><button data-u18-go="history">Historia ›</button></div>'+
 '<div class="u18-video-grid">'+vids.slice(2,6).map(v=>'<button class="u18-videocard" '+(v[2]==='video'?'data-u18-show-original':'data-u18-go="'+v[2]+'"')+'><div class="u18-poster"><img loading="lazy" src="'+v[1]+'" alt=""><span>▶</span></div><b>'+escape(v[0])+'</b><small>'+escape(v[3])+'</small></button>').join('')+'</div>'+
 '<button type="button" class="u18-video-archive" data-u18-show-original>Abrir reproductor y archivo original de Liga TV ↗</button></div></section>';
}
function markup(){return route()==='pc-fixtures'?fixturesPage():route()==='pc-standings'?standingsPage():route()==='pc-draws'?drawsPage():videoPage();}
function repaint(){
 const original=document.querySelector('#screen > .u18-root');
 if(!original||!active())return;
 const seen=document.activeElement?.matches?.('[data-u18-score]')?{id:document.activeElement.dataset.u18Score,side:document.activeElement.dataset.side}:null;
 original.innerHTML=markup();
 if(seen)original.querySelector('[data-u18-score="'+seen.id+'"][data-side="'+seen.side+'"]')?.focus();
}
function sync(){
 const screen=document.getElementById('screen');
 if(!active()||!screen){
  document.documentElement.classList.remove('ljpc18-active');
  screen?.querySelector(':scope > .u18-root')?.remove();
  currentRoute='';return;
 }
 if(currentRoute!==route()){
  currentRoute=route();state.showClassic=false;state.chosenDays=[];chooseCat();
  screen.querySelector(':scope > .u18-root')?.classList.remove('u18-show-classic');
 }
 document.documentElement.classList.add('ljpc18-active');
 let root=screen.querySelector(':scope > .u18-root');
 if(!root){root=document.createElement('div');root.className='u18-root';screen.prepend(root);lastRef=null;}
 const signature=route()+'|'+state.cat+'|'+(source()?'loaded':'missing');
 if(lastRef!==root.dataset.loaded||root.children.length===0||root.dataset.signature!==signature){
  root.dataset.signature=signature;root.dataset.loaded=source()?'loaded':'missing';
  root.innerHTML=source()?markup():'<div class="u18-loading">Cargando datos oficiales de la Liga…</div>';
  lastRef=root.dataset.loaded;
 }
 if(!source())load();
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})}
function localClick(e){
 const button=e.target.closest?.('.u18-root button, .u18-root [data-u18-dismiss]');
 if(!button)return;
 const command=button.closest('button')||button;
 if(command.matches('[data-u18-dismiss]')){
  if(e.target!==command)return;
  state.filterOpen=false;state.calendarOpen=false;repaint();return;
 }
 e.preventDefault();
 e.stopPropagation();
 const d=command.dataset;
 if(d.u18Go){go(d.u18Go);return;}
 if(d.u18ShowOriginal!==undefined){
  state.showClassic=true;
  const root=document.querySelector('#screen > .u18-root');
  root?.classList.add('u18-show-classic');
  root?.scrollIntoView({behavior:'smooth',block:'start'});
  return;
 }
 if(d.u18FixtureTab){state.fixturesTab=d.u18FixtureTab;repaint();return;}
 if(d.u18StandTab){state.standTab=d.u18StandTab;repaint();return;}
 if(d.u18DrawTab){state.drawTab=d.u18DrawTab;repaint();return;}
 if(d.u18VideoTab){state.videoTab=d.u18VideoTab;repaint();return;}
 if(d.u18Modal){state.filterOpen=d.u18Modal==='filter';state.calendarOpen=d.u18Modal==='calendar';repaint();return;}
 if(d.u18Filter){state.fixtureType=d.u18Filter;state.filterOpen=false;repaint();return;}
 if(d.u18Day!==undefined){state.chosenDays=d.u18Day?[d.u18Day]:[];repaint();return;}
 if(d.u18Reset!==undefined){state.scoreOverrides={};repaint();return;}
 if(d.u18Calendar){
  const m=fixtures().find(x=>x.id===d.u18Calendar);
  if(!m?.date)return;
  const end=new Date(m.date.getTime()+120*60*1000),iso=t=>t.toISOString().replace(/[-:]|\.\d{3}/g,'');
  const t=x=>String(x||'').replace(/[\\,;]/g,'\\$&').replace(/\n/g,'\\n');
  const calendar='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LJR//PC//ES\r\nBEGIN:VEVENT\r\nUID:ljr-'+t(m.id)+'@juventinorosasliga.com\r\nDTSTAMP:'+iso(new Date())+'\r\nDTSTART:'+iso(m.date)+'\r\nDTEND:'+iso(end)+'\r\nSUMMARY:'+t(m.home+' vs '+m.away)+'\r\nLOCATION:'+t(m.venue)+'\r\nDESCRIPTION:'+t('Liga Juventino Rosas · '+CAT[state.cat]+' · Jornada '+m.round)+'\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
  const url=URL.createObjectURL(new Blob([calendar],{type:'text/calendar;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='liga-partido-'+m.id+'.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
  state.calendarOpen=false;repaint();
 }
}
function localInput(e){
 if(e.target.matches?.('[data-u18-cat]')){keepCat(e.target.value);state.scoreOverrides={};repaint();return;}
 if(e.target.matches?.('[data-u18-score]')){
  const id=e.target.dataset.u18Score,s=+e.target.dataset.side;
  const pair=state.scoreOverrides[id]||['',''];pair[s]=e.target.value;state.scoreOverrides[id]=pair;
  const box=document.querySelector('#screen > .u18-root [data-u18-sim-table]');
  if(box)box.innerHTML=standingsTable(tableRows(),true);
 }
}
document.addEventListener('click',e=>{if(!active()||!e.target.closest?.('.u18-root'))return;localClick(e);});
document.addEventListener('change',e=>{if(active())localInput(e)});
document.addEventListener('input',e=>{if(active()&&e.target.matches?.('[data-u18-score]'))localInput(e)});
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',()=>{db=null;lastRef=null;schedule();});
function boot(){schedule();const screen=document.getElementById('screen');if(screen)new MutationObserver(schedule).observe(screen,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
