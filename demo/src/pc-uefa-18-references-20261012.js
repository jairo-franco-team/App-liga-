/* 18 referencias UEFA → Liga Juventino Rosas. Exclusivamente PC.
   Datos de la Liga; simulaciones nunca se publican como resultados oficiales. */
(function(){
'use strict';
if(window.__LJPC_UEFA_18_REFERENCE__)return;
window.__LJPC_UEFA_18_REFERENCE__=true;
const CAT={'3':'Primera Fuerza','5':'Intermedia','4':'Segunda Fuerza','2':'Veteranos 35+','1':'Veteranos 50+'};
const BASE='https://raw.githubusercontent.com/jairofrancog7-star/Liga_Futbol/main/';
const allowed=new Set(['pc-fixtures','pc-standings','pc-draws','video','teams','about']);
const state={cat:'3',fixturesTab:'matches',fixtureType:'all',filterOpen:false,calendarOpen:false,chosenDays:[],standTab:'league',standMode:'table',drawTab:'results',videoTab:'all',scoreOverrides:{},showClassic:false,teamsQuery:'',teamsCat:'all'};
let db=null,loading=false,pending=false,currentRoute='',lastRef=null;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const num=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&/^-?\d+(?:\.\d+)?$/.test(String(v).trim())?Number(v):null;
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
const desktop=()=>{const mode=new URLSearchParams(location.search).get('mode');return mode!=='mobile'&&mode!=='apk'&&(mode==='desktop'||innerWidth>=1024);};
const active=()=>desktop()&&allowed.has(route());
const go=r=>{location.hash='#/'+r;};
function source(){const local=window.LJR_OFFICIAL_DATA;if(local?.categories)return local;const api=window.LJR_OFFICIAL_API?.getData?.();if(api?.categories)return api;return db?.categories?db:null;}
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

function fixtureIcon(k){
 const d={bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',calendar:'M3 5h18v16H3z M7 3v4 M17 3v4 M3 10h18 M12 13v5 M9.5 15.5h5',filter:'M4 6h16 M7 12h10 M10 18h4',prev:'m15 18-6-6 6-6',next:'m9 18 6-6-6-6'};
 return '<svg class="u18fx-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d[k]+'"/></svg>';
}
function dateNav(list){
 const dates=[...new Set(list.filter(x=>x.day).map(x=>x.day))].sort();
 const active=state.chosenDays[0]||'';
 const label=d=>new Intl.DateTimeFormat('es-MX',{weekday:'short',day:'numeric',month:'short'}).format(new Date(d+'T12:00:00'));
 return '<nav class="u18fx-dates" aria-label="Fechas de partido"><button type="button" class="u18fx-arrow" data-u18-date-shift="-1" aria-label="Anterior">'+fixtureIcon('prev')+'</button>'+
 '<div class="u18fx-date-scroll"><button type="button" data-u18-day="" class="u18fx-date'+(!active?' selected':'')+'" aria-pressed="'+(!active)+'">Todas las fechas</button>'+
 dates.map(k=>'<button type="button" data-u18-day="'+k+'" class="u18fx-date'+(active===k?' selected':'')+'" aria-pressed="'+(active===k)+'">'+escape(label(k))+'</button>').join('')+'</div>'+
 '<button type="button" class="u18fx-arrow" data-u18-date-shift="1" aria-label="Siguiente">'+fixtureIcon('next')+'</button></nav>';
}
function eventCards(){
 let rows=fixtures();
 if(state.fixtureType==='upcoming')rows=rows.filter(m=>!m.played&&!m.decision?.winner);
 if(state.fixtureType==='results')rows=rows.filter(m=>m.played||m.decision?.winner);
 if(state.chosenDays.length)rows=rows.filter(m=>state.chosenDays.includes(m.day));
 else rows=rows.slice(-90);
 if(!rows.length)return '<div class="u18-empty-state">No hay partidos publicados con estos filtros. Selecciona otra categoría o fecha.</div>';
 const groups=new Map();
 rows.forEach(m=>{const k=m.day||'unknown';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(m);});
 return [...groups].map(([day,games])=>'<section class="u18fx-matchday">'+
 '<div class="u18fx-dayhead"><h2>'+escape(dateLabel(day))+'</h2><p>'+escape(CAT[state.cat])+
 (games[0]?.round?' · Jornada '+escape(games[0].round):'')+'</p></div>'+
 '<div class="u18fx-grid">'+games.map(m=>{
 const status=m.decision?.winner?'Resolución':m.played?'Final':'Programado';
 return '<article class="u18fx-card">'+
 '<div class="u18fx-card-caption">'+escape(m.venue||'Sede por confirmar')+' · '+escape(m.time||'Horario por confirmar')+'</div>'+
 '<div class="u18fx-card-main"><div class="u18fx-team-lines">'+
 '<div class="u18fx-team-line">'+crest(m.home)+'<span title="'+escape(m.home)+'">'+escape(m.home)+'</span></div>'+
 '<div class="u18fx-team-line">'+crest(m.away)+'<span title="'+escape(m.away)+'">'+escape(m.away)+'</span></div></div>'+
 '<div class="u18fx-scores"><strong>'+escape(m.played?m.hs:'–')+'</strong><strong>'+escape(m.played?m.as:'–')+'</strong></div>'+
 '<div class="u18fx-result"><span>'+status+'</span>'+
 '<button type="button" class="u18fx-detail-button" data-u18-open-match="'+escape(m.id)+'" aria-label="Ver detalles del partido '+escape(m.home)+' contra '+escape(m.away)+'">Ver detalles</button></div></div>'+
 (m.decision?.winner?'<div class="u18fx-footnote">Resolución administrativa · '+escape(m.decision.winner)+'</div>':
 !m.played?'<div class="u18fx-footnote">Pendiente de resultado</div>':'')+
 '</article>';
 }).join('')+'</div></section>').join('');
}
function bracket(){
 // The competition mobile bracket is the canonical League design (with trophy).
 // Reuse its rendering, official fixtures, club crests and 5 interactive stages;
 // PC only: do not fork, repaint or modify the original mobile route.
 const ko=window.LJR_KNOCKOUT;
 if(ko?.render){
  let view='';
  try{
   view=ko.render({
    category:category(),categoryId:state.cat,showEntrants:true,
    logoFor:name=>imgOf(name),stage:state.knockoutStage||'playoff',
    signature:String(source()?.captured_at_utc||'')+'|'+state.cat
   });
  }catch(e){view='';}
  if(view)return '<section class="u18fx-mobile-knockout" aria-label="Cuadro oficial y liguilla '+escape(CAT[state.cat])+'">'+
   '<header class="u18fx-ko-heading"><div><span>COMPETICIÓN · '+escape(CAT[state.cat])+'</span><h2>Cuadro y liguilla</h2>'+
   '<p>Mismo cuadro que Competición: etapas, rutas y trofeo. Los cruces se muestran según los datos disponibles.</p></div>'+
   '<button type="button" data-u18-go="pc-draws">Ver detalles del cuadro '+fixtureIcon('next')+'</button></header>'+
   view+'</section>';
 }
 return '<section class="u18fx-draw-section" aria-label="Cuadro y sorteos de la Liga">';+
 '<div class="u18fx-draw-date"><h2>Sorteo de la fase eliminatoria</h2><small>Información oficial de '+escape(CAT[state.cat])+'</small></div>'+
 '<article class="u18fx-draw-card"><header><h3>Sorteo de clasificación</h3><p>Aún no se publicaron enfrentamientos confirmados de esta fase.</p>'+
 '<strong>Resultados del sorteo</strong></header>'+
 '<div class="u18fx-draw-pair-grid">'+['Octavos','Cuartos','Semifinales','Final'].map((label,i)=>
 '<div class="u18fx-draw-pair"><span>'+escape(label)+'</span><span class="u18fx-draw-shield" aria-hidden="true">♢</span><b>Por confirmar</b></div>').join('')+'</div>'+
 '<div class="u18fx-draw-actions"><button type="button" data-u18-go="pc-draws">Ver detalles del sorteo</button></div></article>'+
 '<div class="u18fx-draw-tools"><p>El cuadro solo muestra fases generales. No se inventan cruces, equipos ni fechas.</p>'+
 '<button type="button" class="u18fx-draw-tool" data-u18-go="bracketBuilder">Abrir generador de cuadros '+fixtureIcon('next')+'</button></div>'+
 '</section>';
}
function fixturesPage(){
 const f=fixtures();
 const nav=[['pc-fixtures','Partidos'],['pc-standings','Clasificación'],['video','Liga TV'],['pc-draws','Sorteos'],['fantasy','Gaming'],['pc-data','Datos'],['more','Más']];
 const navigation='<div class="u18fx-utility"><span>Liga Juventino Rosas</span><span>Fútbol municipal · Guanajuato</span></div><nav class="u18fx-nav" aria-label="Navegación de PC"><div class="u18fx-nav-inner"><div class="u18fx-brand"><img src="./assets/branding/escudo-liga-azul-sin-fondo-v1007.png" loading="eager" alt="Escudo Liga Juventino Rosas"><span>LIGA<br>JUVENTINO ROSAS</span></div><div class="u18fx-navlinks">'+nav.map(([key,label])=>'<button type="button" data-u18-go="'+key+'"'+(key==='pc-fixtures'?' class="selected"':'')+'>'+label+'</button>').join('')+'</div></div></nav>';
 const tabs='<div class="u18fx-tabwrap"><div class="u18fx-switch">'+pills([['matches','Partidos y resultados'],['bracket','Ver cuadro']],state.fixturesTab,'data-u18-fixture-tab')+'</div><div class="u18fx-cat">'+catSelect()+'</div></div>';
 const actions='<div class="u18fx-titlebar"><h1>Partidos y resultados</h1><div class="u18fx-actions">'+
 '<button type="button" data-u18-go="pc-notifications">Notificaciones '+fixtureIcon('bell')+'</button>'+
 '<button type="button" data-u18-modal="calendar">Añadir al calendario '+fixtureIcon('calendar')+'</button>'+
 '<button type="button" data-u18-modal="filter">Filtrar '+fixtureIcon('filter')+'</button></div></div>';
 const quickFilters='<div class="u18fx-unified-controls" aria-label="Filtros de partidos"><div class="u18fx-category-pills" role="group" aria-label="Categorías de la Liga">'+
 Object.entries(CAT).map(([k,v])=>'<button type="button" data-u18-cat-quick="'+k+'" class="'+(state.cat===k?'selected':'')+'" aria-pressed="'+(state.cat===k)+'">'+escape(v)+'</button>').join('')+
 '</div><div class="u18fx-status-pills" role="group" aria-label="Tipo de partidos">'+
 pills([['upcoming','Próximos'],['results','Resultados'],['all','Todos']],state.fixtureType,'data-u18-filter')+'</div></div>';
 const modal=state.filterOpen||state.calendarOpen?'<div class="u18-modal-layer" data-u18-dismiss><div class="u18-modal" role="dialog" aria-modal="true" aria-label="'+(state.filterOpen?'Filtrar partidos':'Añadir al calendario')+'">'+
 '<div class="u18-modal-title"><h3>'+(state.filterOpen?'Filtrar':'Añadir al calendario')+'</h3><button type="button" data-u18-modal="close" aria-label="Cerrar">×</button></div>'+
 '<p>'+(state.filterOpen?'Elige los partidos que quieres ver.':'Selecciona un encuentro oficial para añadirlo a tu calendario.')+'</p>'+
 (state.filterOpen?'<div class="u18-radio">'+pills([['all','Todos'],['upcoming','Próximos'],['results','Resultados']],state.fixtureType,'data-u18-filter')+'</div><div class="u18fx-modal-cat">'+catSelect()+'</div>':
 '<div class="u18-modal-list">'+f.filter(x=>x.date&&!x.played).slice(0,24).map(x=>'<button data-u18-calendar="'+escape(x.id)+'">'+crest(x.home)+'<span>'+escape(x.home)+' - '+escape(x.away)+'<small>'+escape(dateLabel(x.day)+' · '+x.time)+'</small></span></button>').join('')+'</div>')+
 '<footer><button class="u18-button" data-u18-modal="close">Cerrar</button></footer></div></div>':'';
 return '<section class="u18-page u18fx-page" aria-label="Partidos y resultados"><header class="u18fx-hero">'+navigation+
 '<div class="u18-bound">'+tabs+actions+'</div>'+(state.fixturesTab==='matches'?dateNav(f):'')+'</header>'+
 '<main class="u18-bound u18fx-content">'+(state.fixturesTab==='matches'?quickFilters+eventCards():bracket())+'</main>'+modal+'</section>';
}
/* Recent-result circles use only actual played fixtures with numeric scores. */
function formForTeam(team, playedMatches){
 const key=norm(team);
 const latest=playedMatches.filter(m=>norm(m.home)===key||norm(m.away)===key)
  .sort((a,b)=>(b.date?.getTime()||0)-(a.date?.getTime()||0)).slice(0,5).reverse();
 const badges=latest.map(m=>{
  const home=norm(m.home)===key,our=home?m.hs:m.as,their=home?m.as:m.hs;
  const status=our>their?'win':our===their?'draw':'loss';
  const label=status==='win'?'Victoria':status==='draw'?'Empate':'Derrota';
  const opponent=home?m.away:m.home;
  return '<span class="u18-form-result u18-result-'+status+'" title="'+escape(label+' '+our+'-'+their+' contra '+opponent)+'" aria-label="'+escape(label+' contra '+opponent)+'">'+(status==='win'?'V':status==='draw'?'E':'D')+'</span>';
 });
 return '<div class="u18-form" role="group" aria-label="Últimos resultados de '+escape(team)+'">'+
  Array(Math.max(0,5-badges.length)).fill('<span class="u18-form-result u18-result-empty" aria-hidden="true"></span>').join('')+
  badges.join('')+'</div>';
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
 const playedMatches=fixtures().filter(m=>m.played&&m.hs!==null&&m.as!==null);
 return '<div class="u18-tablewrap"><table class="u18-table"><thead><tr>'+
 ['#','Equipo','PJ','PG','PE','PP','GF','GC','DG','PTS','Últimos resultados'].map(x=>'<th scope="col">'+x+'</th>').join('')+
 '</tr></thead><tbody>'+data.map((r,i)=>'<tr><td class="u18-place">'+(i+1)+'</td>'+
 '<td class="u18-team"><button type="button" class="u18-team-open" data-u18-team="'+escape(r[1])+'" title="Ver detalles de '+escape(r[1])+'">'+crest(r[1])+'<b>'+escape(r[1])+'</b></button></td>'+
 [2,3,4,5,6,7,8,9].map(j=>'<td'+(j===9?' class="u18-points"':'')+'>'+escape(r[j]===undefined||r[j]===''?'—':r[j])+'</td>').join('')+
 '<td class="u18-form-cell">'+formForTeam(r[1],playedMatches)+'</td></tr>').join('')+
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
 const rows=tableRows();
 const viewTabs='<div class="u18-viewtabs" role="group" aria-label="Vista de clasificación">'+
 '<button type="button" data-u18-stand-view="table" class="'+(state.standMode==='table'?'selected':'')+'" aria-pressed="'+(state.standMode==='table')+'">Completo</button>'+
 '<button type="button" data-u18-stand-view="criteria" class="'+(state.standMode==='criteria'?'selected':'')+'" aria-pressed="'+(state.standMode==='criteria')+'">Criterios de desempate</button></div>';
 const criteria='<div class="u18-criteria"><h3>Criterios de desempate</h3>'+
 '<p>Los criterios oficiales se consultan en el reglamento vigente de la Liga Juventino Rosas; no se presupone un orden de desempate a partir de la tabla pública.</p>'+
 '<a class="u18-criteria-action" href="#/rulebook" aria-label="Consultar reglamento oficial de la Liga">Consultar reglamento</a></div>';
 const content=state.standTab==='knockout'?bracket():state.standTab==='simulator'?simulation():
 '<div class="u18-panel"><div class="u18-blocktitle"><h2>Clasificación de la fase liga</h2><small>'+escape(CAT[state.cat])+'</small></div>'+
 viewTabs+(state.standMode==='criteria'?criteria:(rows.length?standingsTable(rows):'<p>La clasificación de esta categoría no está disponible.</p>'))+
 '<p class="u18-footnote">PJ · partidos; PG · ganados; PE · empates; PP · perdidos; GF/GC · goles; DG · diferencia; PTS · puntos.</p></div>';
 return shell('Clasificación',CAT[state.cat],tabbar+controls+content).replace(/<details class="u18-original"[\s\S]*?<\/details>/,'');
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

function teamsData(){
 const all=new Map();
 for(const [id,c] of Object.entries(source()?.categories||{})){
  if(state.teamsCat!=='all'&&id!==state.teamsCat)continue;
  const add=n=>{
   n=String(n||'').trim();if(!n)return;
   const key=norm(n);if(!all.has(key))all.set(key,n);
  };
  for(const g of c.standings||[])for(const r of g.rows||[])if(Array.isArray(r))add(r[1]);
  for(const g of c.fixtures||[])for(const r of g.rows||[])if(Array.isArray(r)){add(r[2]);add(r[6]);}
 }
 const arr=[...all.values()].filter(n=>norm(n).includes(norm(state.teamsQuery)));
 return arr.sort((a,b)=>a.localeCompare(b,'es-MX'));
}
function teamsPage(){
 const arr=teamsData(),groups=new Map();
 arr.forEach(n=>{const letter=n.normalize('NFD').replace(/[\u0300-\u036f]/g,'')[0]?.toUpperCase()||'#';if(!groups.has(letter))groups.set(letter,[]);groups.get(letter).push(n);});
 const body='<div class="u18-teamtools"><h2>Equipos</h2><div><input data-u18-team-query type="search" placeholder="Buscar" value="'+escape(state.teamsQuery)+'" aria-label="Buscar equipo">'+
 '<select data-u18-teams-cat aria-label="Categoría">'+
 '<option value="all"'+(state.teamsCat==='all'?' selected':'')+'>Todas las categorías</option>'+
 Object.entries(CAT).map(([id,name])=>'<option value="'+id+'"'+(state.teamsCat===id?' selected':'')+'>'+escape(name)+'</option>').join('')+
 '</select></div></div><p class="u18-teamcount">'+arr.length+' equipos encontrados · Fuente de equipos de la Liga Juventino Rosas.</p>'+
 ([...groups].length?[...groups].map(([letter,names])=>
 '<div class="u18-letter"><h3>'+escape(letter)+'</h3><div class="u18-clubgrid">'+names.map(n=>'<button type="button" data-u18-team="'+escape(n)+'">'+crest(n)+
 '<span>'+escape(n)+'</span></button>').join('')+'</div></div>').join(''):'<p class="u18-empty-state">No hay equipos oficiales que coincidan con la búsqueda.</p>');
 return shell('Equipos','Directorio de clubes',body,false);
}
function aboutPage(){
 const cards=[
 ['Guía de campos','Consulta las sedes y sus accesos.','venues','./public/deportiva-sur-partido.jpg'],
 ['Reglamento','Normas oficiales de la Liga Juventino Rosas.','rulebook','./public/home-feature-reference.webp'],
 ['Historia de la Liga','Temporadas, finales y campeones.','history','./assets/home-players-user.png'],
 ['Partidos importantes','Consulta el calendario oficial de encuentros.','pc-fixtures','./public/deportiva-sur-partido.jpg'],
 ['Estadísticas y clasificación','Datos verificados por categoría.','pc-data','./public/home-feature-reference.webp'],
 ['Vídeos de la Liga','Jugadas, momentos y recuerdos.','video','./public/video-hero-reference.webp'],
 ['Noticias y avisos','Comunicados oficiales de la competición.','news','./assets/moments/moments-original-a.png'],
 ['Más títulos','Consulta el archivo de reconocimientos.','history','./assets/moments/moments-original-b.png']
 ];
 return shell('Sobre','Liga Juventino Rosas, Guanajuato',
 '<div class="u18-aboutgrid">'+cards.map(([title,detail,r,img])=>'<button type="button" data-u18-go="'+r+'" class="u18-aboutcard">'+
 '<img loading="lazy" src="'+img+'" alt=""><span><b>'+escape(title)+'</b><small>'+escape(detail)+'</small></span><em aria-hidden="true">›</em></button>').join('')+'</div>',false);
}
function markup(){return route()==='pc-fixtures'?fixturesPage():route()==='pc-standings'?standingsPage():route()==='pc-draws'?drawsPage():route()==='teams'?teamsPage():route()==='about'?aboutPage():videoPage();}
function repaint(){
 const original=document.querySelector('#screen > .u18-root');
 if(!original||!active())return;
 const seen=document.activeElement?.matches?.('[data-u18-score]')?{id:document.activeElement.dataset.u18Score,side:document.activeElement.dataset.side}:null;
 const earlier=original.querySelector('.u18fx-mobile-knockout .ljr-knockout');
 if(earlier?.dataset.koStage)state.knockoutStage=earlier.dataset.koStage;
 original.innerHTML=markup();
 const ko=original.querySelector('.u18fx-mobile-knockout .ljr-knockout');
 if(ko&&window.LJR_KNOCKOUT?.init)window.LJR_KNOCKOUT.init(ko);
 if(seen)original.querySelector('[data-u18-score="'+seen.id+'"][data-side="'+seen.side+'"]')?.focus();
}
/* El contenido original de PC comparte #screen con el diseño UEFA. Nunca
   exponer dos listas completas ni tarjetas administrativas sueltas.
   Conservar DOM original para otras rutas, restaurando estilos al salir. */
function isolateFixturesLegacy(screen,enabled){
 if(!screen)return;
 for(const child of Array.from(screen.children)){
  if(child.classList?.contains('u18-root'))continue;
  if(enabled){
   if(child.dataset.u18PcLegacyHidden!=='1'){
    child.dataset.u18PcLegacyHidden='1';
    child.dataset.u18PcLegacyDisplay=child.style.getPropertyValue('display')||'';
    child.dataset.u18PcLegacyPriority=child.style.getPropertyPriority('display')||'';
    child.dataset.u18PcLegacyAria=child.getAttribute('aria-hidden')??'';
    child.dataset.u18PcLegacyInert=child.hasAttribute('inert')?'1':'0';
   }
   child.style.setProperty('display','none','important');
   child.setAttribute('aria-hidden','true');
   child.setAttribute('inert','');
  }else if(child.dataset.u18PcLegacyHidden==='1'){
   const display=child.dataset.u18PcLegacyDisplay,priority=child.dataset.u18PcLegacyPriority;
   if(display)child.style.setProperty('display',display,priority);
   else child.style.removeProperty('display');
   if(child.dataset.u18PcLegacyAria)child.setAttribute('aria-hidden',child.dataset.u18PcLegacyAria);
   else child.removeAttribute('aria-hidden');
   if(child.dataset.u18PcLegacyInert==='0')child.removeAttribute('inert');
   for(const key of ['u18PcLegacyHidden','u18PcLegacyDisplay','u18PcLegacyPriority','u18PcLegacyAria','u18PcLegacyInert'])
    delete child.dataset[key];
  }
 }
}
function sync(){
 const screen=document.getElementById('screen');
 if(!active()||!screen){
  isolateFixturesLegacy(screen,false);
  document.documentElement.classList.remove('ljpc18-active');
  delete document.documentElement.dataset.ljpc18Route;
  screen?.querySelector(':scope > .u18-root')?.remove();
  currentRoute='';return;
 }
 if(currentRoute!==route()){
  currentRoute=route();state.showClassic=false;state.chosenDays=[];chooseCat();
  if(currentRoute==='pc-fixtures')try{window.scrollTo({top:0,behavior:'instant'});}catch(_){}
  screen.querySelector(':scope > .u18-root')?.classList.remove('u18-show-classic');
 }
 document.documentElement.classList.add('ljpc18-active');
 document.documentElement.dataset.ljpc18Route=route();
 let root=screen.querySelector(':scope > .u18-root');
 if(!root){root=document.createElement('div');root.className='u18-root';screen.prepend(root);lastRef=null;}
 if(route()==='pc-fixtures'&&screen.firstElementChild!==root)screen.prepend(root);
 isolateFixturesLegacy(screen,route()==='pc-fixtures'||route()==='pc-standings');
 const signature=route()+'|'+state.cat+'|'+(source()?'loaded':'missing');
 if(lastRef!==root.dataset.loaded||root.children.length===0||root.dataset.signature!==signature){
  root.dataset.signature=signature;root.dataset.loaded=source()?'loaded':'missing';
  const needsOfficial=!['video','about'].includes(route());
  root.innerHTML=(!needsOfficial||source())?markup():'<div class="u18-loading">Cargando datos oficiales de la Liga…</div>';
  const ko=root.querySelector('.u18fx-mobile-knockout .ljr-knockout');
  if(ko&&window.LJR_KNOCKOUT?.init)window.LJR_KNOCKOUT.init(ko);
  lastRef=root.dataset.loaded;
 }
 if(!['video','about'].includes(route())&&!source())load();
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})}
function localClick(e){
 const button=e.target.closest?.('.u18-root button, .u18-root [data-u18-dismiss]');
 if(!button)return;
 const command=button.closest('button')||button;
 // Stage tabs are owned by the original mobile knockout; allow its native
 // event handler to handle scrolling and selection, without PC delegation.
 if(command.closest('.ljr-ko-tabs'))return;
 if(command.matches('[data-u18-dismiss]')){
  if(e.target!==command)return;
  state.filterOpen=false;state.calendarOpen=false;repaint();return;
 }
 e.preventDefault();
 e.stopPropagation();
 const d=command.dataset;
 if(d.u18Go){go(d.u18Go);return;}
 if(d.u18Team){const team=d.u18Team;try{if(typeof window.LJR_OFFICIAL_API?.openTeam==='function'){window.LJR_OFFICIAL_API.openTeam(team);return;}localStorage.setItem('v62-team-name',team);}catch(_){}go('teamDetail');return;}
 if(d.u18ShowOriginal!==undefined){
  state.showClassic=true;
  const root=document.querySelector('#screen > .u18-root');
  root?.classList.add('u18-show-classic');
  root?.scrollIntoView({behavior:'smooth',block:'start'});
  return;
 }
 if(d.u18FixtureTab){state.fixturesTab=d.u18FixtureTab;repaint();return;}
 if(d.u18DateShift!==undefined){
  const days=[...new Set(fixtures().filter(m=>m.day).map(m=>m.day))].sort();
  if(!days.length)return;
  const at=days.indexOf(state.chosenDays[0]);
  const step=Number(d.u18DateShift)<0?-1:1;
  const next=at<0?(step<0?days.length-1:0):Math.min(days.length-1,Math.max(0,at+step));
  state.chosenDays=[days[next]];repaint();return;
 }
 if(d.u18OpenMatch){
  const m=fixtures().find(x=>x.id===d.u18OpenMatch);if(!m)return;
  try{sessionStorage.setItem('lj-match-detail',JSON.stringify({
   id:m.id,from:'#/pc-fixtures',home:m.home,away:m.away,
   date:m.day?m.day.split('-').reverse().join('/'):'',time:m.time,
   venue:m.venue,category:CAT[state.cat],jornada:'Jornada '+m.round
  }));}catch(_){}
  go('match');return;
 }

 if(d.u18StandTab){state.standTab=d.u18StandTab;repaint();return;}
 if(d.u18StandView){state.standMode=d.u18StandView==='criteria'?'criteria':'table';repaint();return;}
 if(d.u18DrawTab){state.drawTab=d.u18DrawTab;repaint();return;}
 if(d.u18VideoTab){state.videoTab=d.u18VideoTab;repaint();return;}
 if(d.u18Modal){state.filterOpen=d.u18Modal==='filter';state.calendarOpen=d.u18Modal==='calendar';repaint();return;}
 if(d.u18CatQuick){keepCat(d.u18CatQuick);state.scoreOverrides={};repaint();return;}
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
 if(e.target.matches?.('[data-u18-teams-cat]')){state.teamsCat=e.target.value;repaint();return;}
 if(e.target.matches?.('[data-u18-team-query]')){
  const p=e.target.selectionStart;state.teamsQuery=e.target.value;repaint();
  const n=document.querySelector('#screen > .u18-root [data-u18-team-query]');
  n?.focus();try{n?.setSelectionRange(p,p)}catch(_){}return;
 }
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
document.addEventListener('input',e=>{if(active()&&e.target.matches?.('[data-u18-score],[data-u18-team-query]'))localInput(e)});
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',()=>{db=null;lastRef=null;schedule();});
function boot(){schedule();const screen=document.getElementById('screen');if(screen)new MutationObserver(schedule).observe(screen,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
