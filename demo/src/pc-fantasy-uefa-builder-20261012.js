/* Fantasy UEFA-inspired desktop builder, isolated from mobile / Capacitor APK. */
(function(){
'use strict';
if(window.__LJPC_FANTASY_UEFA_V1__)return;
window.__LJPC_FANTASY_UEFA_V1__=true;
const ROOT='ljpc-fantasy-uefa',STORAGE='v576-fantasy-squad',BUDGET=100;
const POSITIONS=[['DEL',3],['CEN',5],['DEF',5],['POR',2]];
const SLOTS=POSITIONS.flatMap(([pos,count])=>Array.from({length:count},(_,i)=>({id:POSITIONS.slice(0,POSITIONS.findIndex(p=>p[0]===pos)).reduce((sum,x)=>sum+x[1],0)+i,pos})));
const state={tab:'create',position:'',team:'',price:'100',query:'',sort:'name',direction:1,selectedSlot:null,modal:'',notice:''};
let players=[],queued=false,watcher=null,screenObserved=null,loading=false,dbFallback=null;
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
const isPC=()=>{const m=new URLSearchParams(location.search).get('mode');return m!=='mobile'&&m!=='apk'&&(m==='desktop'||innerWidth>=1024)};
const active=()=>isPC()&&['fantasy','fantasyTeam'].includes(route());
const data=()=>{try{const api=window.LJR_OFFICIAL_API?.getData?.();if(api?.categories)return api;if(window.LJR_OFFICIAL_DATA?.categories)return window.LJR_OFFICIAL_DATA;return dbFallback||{};}catch(_){return window.LJR_OFFICIAL_DATA?.categories?window.LJR_OFFICIAL_DATA:dbFallback||{}}};
function loadFallback(){
 if(loading||data()?.categories)return;
 loading=true;
 fetch('./data/official-live.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('data');return r.json()})
 .then(d=>{if(d?.categories){dbFallback=d;players=catalog();rerender();schedule();}})
 .catch(()=>{}).finally(()=>{loading=false});
}
function pPosition(raw){
 const n=norm(raw);
 if(/portero|arquero|guardameta|goalkeeper/.test(n))return'POR';
 if(/defensa|defensor|lateral|central/.test(n))return'DEF';
 if(/medio|mediocamp|volante|centro/.test(n))return'CEN';
 if(/delantero|atacante|extremo|punta/.test(n))return'DEL';
 return'ANY';
}
const identity=p=>[p.cat,p.team,norm(p.name)].join('|');
function cost(p){
 let hash=0;for(const ch of identity(p))hash=(hash*31+ch.charCodeAt(0))>>>0;
 return +(4+(hash%9)*.5).toFixed(1);
}
function photo(o){
 for(const field of ['photo','photo_url','image','image_url','foto','foto_url']){
  if(typeof o?.[field]==='string'&&o[field].trim())return o[field].trim();
 }return'';
}
function catalog(){
 const rows=[],seen=new Set();
 for(const [cid,cat] of Object.entries(data()?.categories||{})){
  function include(raw,team){
   const o=typeof raw==='string'?{name:raw}:raw||{};
   const name=String(o.name||o.player||o.jugador||'').trim();if(!name)return;
   const p={cat:String(cid),category:String(cat?.name||''),team:String(team),name,position:String(o.position||o.posicion||''),photo:photo(o)};
   p.group=pPosition(p.position);p.cost=cost(p);
   const id=identity(p);if(!seen.has(id)){seen.add(id);rows.push(p)}
  }
  for(const [team,raw] of Object.entries(cat?.player_profiles||{})){
   if(Array.isArray(raw))raw.forEach(o=>include(o,team));
  }
  for(const [team,raw] of Object.entries(cat?.rosters||{})){
   const list=Array.isArray(raw)?raw:(raw?.rows||raw?.players||[]);
   if(Array.isArray(list))list.forEach(o=>include(o,team));
  }
 }
 return rows.sort((a,b)=>a.name.localeCompare(b.name,'es',{sensitivity:'base'}));
}
function read(){
 try{const list=JSON.parse(localStorage.getItem(STORAGE)||'[]');return Array.isArray(list)?list.filter(x=>x&&SLOTS.some(s=>s.id===Number(x.slot))).slice(0,15):[]}
 catch(_){return[]}
}
function save(list){
 const next=list.filter(Boolean).slice(0,15);
 try{
  localStorage.setItem(STORAGE,JSON.stringify(next));
  const account=window.LJR_V569_AUTH?.currentAccount?.();
  if(account?.id)localStorage.setItem('ljr-v1390-fantasy-owner',String(account.id));
  return true;
 }catch(_){state.notice='No fue posible guardar el equipo en este navegador.';return false}
}
const remaining=rows=>Math.max(0,BUDGET-rows.reduce((n,p)=>n+Number(p.cost||0),0));
const money=n=>'$'+Number(n||0).toFixed(1).replace('.0','')+' M';
function logo(team){
 let v='';try{v=window.LJR_V576_FANTASY?.teamLogo?.(team)||window.LJR_OFFICIAL_API?.getLogo?.(team)||''}catch(_){}
 if(typeof v!=='string')v=v?.app||v?.local||v?.source||v?.url||'';
 if(v.startsWith('assets/'))v='./'+v;
 return /^(https?:\/\/|\.\/|\/)/i.test(v)?v:'';
}
function legalAsset(v){return /^(https?:\/\/|\.\/|\/)/i.test(String(v||''))?String(v):''}
function avatar(p){const pic=legalAsset(p.photo)||legalAsset(logo(p.team));return pic?'<img loading="lazy" decoding="async" src="'+h(pic)+'" alt="">':'<span aria-hidden="true">⚽</span>'}
function stats(p){
 const cat=data()?.categories?.[String(p.cat||'')],goalBlocks=cat?.scorers||[],cardBlocks=cat?.cards||[];
 let goals=0,yellow=0,red=0,known=false;
 for(const block of goalBlocks)for(const r of block?.rows||[]){
  if(Array.isArray(r)&&norm(r[1])===norm(p.name)&&norm(r[2])===norm(p.team)&&/^\d+$/.test(String(r[3]??''))){
   goals=Number(r[3]);known=true;
  }
 }
 for(const block of cardBlocks)for(const r of block?.rows||[]){
  if(!Array.isArray(r)||norm(r[1])!==norm(p.name)||norm(r[2])!==norm(p.team))continue;
  const n=Number(r[3])||0,k=norm(r[0]);if(k.includes('amar'))yellow+=n;if(k.includes('roj'))red+=n;known=true;
 }
 return known?String(Math.max(0,goals*5-yellow-red*3)):'—';
}
function shirtsvg(){
 return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>';
}
function slotHTML(slot,bySlot){
 const p=bySlot.get(slot.id),chosen=state.selectedSlot===slot.id,crest=p?logo(p.team):'';
 return '<div class="pcfy-slot '+(chosen?'pcfy-selected ':'')+(p?'pcfy-filled':'pcfy-empty')+'">'+
 '<button type="button" data-pcfy-slot="'+slot.id+'" class="pcfy-slot-main" aria-label="'+h((p?'Cambiar ':'Elegir ')+slot.pos+(p?' '+p.name:''))+'" aria-pressed="'+chosen+'">'+
 '<span class="pcfy-shirt">'+shirtsvg()+(p&&crest?'<img src="'+h(crest)+'" alt="" loading="lazy">':'')+(!p?'<span class="pcfy-plus">+</span>':'')+'</span>'+
 '<span class="pcfy-slot-name">'+h(p?p.name:slot.pos)+'</span>'+
 (p?'<small>'+h(money(p.cost))+'</small>':'')+'</button>'+
 (p?'<button type="button" class="pcfy-remove" data-pcfy-remove="'+slot.id+'" aria-label="Quitar '+h(p.name)+'">×</button>':'')+'</div>';
}
function pitchHTML(list){
 const map=new Map(list.map(p=>[Number(p.slot),p]));
 return '<div class="pcfy-pitch"><div class="pcfy-pitch-lines" aria-hidden="true"><span class="pcfy-pitch-center"></span><span class="pcfy-pitch-penalty top"></span><span class="pcfy-pitch-penalty bottom"></span></div>'+
 POSITIONS.map(([pos])=>'<div class="pcfy-pitch-row pcfy-row-'+pos.toLowerCase()+'">'+SLOTS.filter(s=>s.pos===pos).map(s=>slotHTML(s,map)).join('')+'</div>').join('')+
 '</div>';
}
function playerOptions(){
 const teams=[...new Set(players.map(p=>p.team))].sort((a,b)=>a.localeCompare(b,'es'));
 return teams.map(t=>'<option value="'+h(t)+'"'+(state.team===t?' selected':'')+'>'+h(t)+'</option>').join('');
}
function filtersHTML(){
 const pos=[['','Todas'],['POR','Porteros'],['DEF','Defensas'],['CEN','Centrocampistas'],['DEL','Delanteros']];
 return '<div class="pcfy-filterbar">'+
 '<label>Posición<select data-pcfy-filter="position">'+pos.map(([v,t])=>'<option value="'+v+'"'+(state.position===v?' selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
 '<label>Equipo<select data-pcfy-filter="team"><option value="">Todos</option>'+playerOptions()+'</select></label>'+
 '<label>Precio<select data-pcfy-filter="price">'+[['100','Hasta $100 M'],['5','Hasta $5 M'],['6','Hasta $6 M'],['7','Hasta $7 M'],['8','Hasta $8 M']].map(([v,t])=>'<option value="'+v+'"'+(state.price===v?' selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
 '</div>'+
 '<label class="pcfy-search"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></span><input type="search" data-pcfy-query placeholder="Buscar jugador o equipo" value="'+h(state.query)+'" aria-label="Buscar jugador o equipo"></label>';
}
function filtered(){
 const q=norm(state.query),chosen=read(),available=new Set(chosen.filter(x=>Number(x.slot)!==state.selectedSlot).map(identity));
 const max=Number(state.price)||100;
 const out=players.filter(p=>!available.has(identity(p))&&(!state.position||p.group===state.position||p.group==='ANY')&&(!state.team||norm(p.team)===norm(state.team))&&p.cost<=max&&(!q||norm(p.name+' '+p.team+' '+p.position+' '+p.category).includes(q)));
 const dir=state.direction;out.sort((a,b)=>{let c=0;
  if(state.sort==='cost')c=a.cost-b.cost;else if(state.sort==='team')c=a.team.localeCompare(b.team,'es');else c=a.name.localeCompare(b.name,'es');return c*dir;
 });
 return out;
}
function playerTable(){
 const rows=filtered(),shown=rows.slice(0,120),chosen=read(),rem=remaining(chosen);
 return '<div class="pcfy-table-head"><button data-pcfy-sort="name">Jugadores '+(state.sort==='name'?(state.direction>0?'↑':'↓'):'')+'</button>'+
 '<button data-pcfy-sort="team">Equipo '+(state.sort==='team'?(state.direction>0?'↑':'↓'):'')+'</button>'+
 '<button data-pcfy-sort="cost">Precio '+(state.sort==='cost'?(state.direction>0?'↑':'↓'):'')+'</button><span>Puntos</span></div>'+
 '<div class="pcfy-player-list" role="list">'+(shown.length?shown.map(p=>{
 const encoded=encodeURIComponent(JSON.stringify(p)),eligible=p.cost<=rem+Number(chosen.find(x=>Number(x.slot)===state.selectedSlot)?.cost||0);
 return '<button type="button" role="listitem" class="pcfy-player-row" data-pcfy-pick="'+h(encoded)+'"'+(!eligible?' disabled title="Supera el presupuesto disponible"':'')+'>'+
 '<span class="pcfy-person"><span class="pcfy-avatar">'+avatar(p)+'</span><span><strong>'+h(p.name)+'</strong><small>'+h(p.position||p.group)+' · '+h(p.category)+'</small></span></span>'+
 '<span class="pcfy-team" title="'+h(p.team)+'">'+h(p.team)+'</span><b>'+h(money(p.cost))+'</b><span class="pcfy-points">'+stats(p)+'</span></button>';
 }).join(''):'<p class="pcfy-no-players">'+(players.length?'No se encontraron jugadores con esos filtros.':'Todavía no hay jugadores registrados disponibles para Fantasy.')+'</p>')+'</div>'+
 '<p class="pcfy-results">'+rows.length+' jugadores encontrados'+(rows.length>shown.length?' · mostrando los primeros '+shown.length:'')+' · Puntos calculados solo con estadísticas publicadas</p>';
}
function bottomHTML(list){
 const count=list.length;
 return '<div class="pcfy-bottom"><div class="pcfy-bottom-metrics"><span><small>Jugadores elegidos</small><strong>'+count+' / 15</strong></span><span><small>Presupuesto restante</small><strong>'+h(money(remaining(list)))+'</strong></span></div>'+
 '<div class="pcfy-budget-meter" role="progressbar" aria-label="Jugadores seleccionados" aria-valuenow="'+count+'" aria-valuemin="0" aria-valuemax="15"><i style="width:'+(count/15*100)+'%"></i></div>'+
 '<button type="button" data-pcfy-action="continue" class="pcfy-continue"'+(count!==15?' disabled':'')+'>'+(count===15?'Continuar':'Completa tu plantilla')+' →</button></div>';
}
function buildHTML(){
 const list=read(),count=list.length;
 if(state.selectedSlot===null)state.selectedSlot=SLOTS.find(s=>!list.some(p=>Number(p.slot)===s.id))?.id??0;
 return '<div class="pcfy-cols"><section class="pcfy-team-panel"><header class="pcfy-team-toolbar"><div><h2>Elige tu equipo</h2><p>Selecciona 15 jugadores de la Liga Juventino Rosas</p></div>'+
 '<div class="pcfy-team-buttons"><button type="button" data-pcfy-action="auto">✦ Auto-completar</button><button type="button" class="pcfy-undo" data-pcfy-action="reset" aria-label="Reiniciar equipo">↶</button></div></header>'+
 '<p class="pcfy-advice">CONSEJO: Puedes autocompletar tu plantilla y afinarla antes del primer partido</p>'+
 '<div class="pcfy-field-wrap"><div class="pcfy-partner">LIGA JUVENTINO ROSAS <span>FANTASY · 2026</span></div>'+pitchHTML(list)+'</div>'+
 '<div class="pcfy-field-foot">3 delanteros · 5 mediocampistas · 5 defensas · 2 porteros</div></section>'+
 '<section class="pcfy-players-panel"><div class="pcfy-players-toolbar">'+filtersHTML()+'</div>'+
 '<div class="pcfy-selected-position">Elegir para <b data-pcfy-current-slot>'+h(SLOTS.find(s=>s.id===state.selectedSlot)?.pos||'DEL')+'</b><span>Selecciona un lugar en la cancha o un jugador del listado</span></div>'+
 '<div data-pcfy-list>'+playerTable()+'</div></section></div>'+
 '<div data-pcfy-budget>'+bottomHTML(list)+'</div>'+
 (state.notice?'<p class="pcfy-notice" role="status">'+h(state.notice)+'</p>':'')+
 '<p class="pcfy-disclaimer">Jugadores y equipos procedentes de registros disponibles de Liga Juventino Rosas. El presupuesto Fantasy es virtual y los puntos no equivalen a resultados oficiales adicionales.</p>';
}
function otherTab(){
 if(state.tab==='advice')return '<section class="pcfy-info"><h2>Noticias y consejos</h2><p>Elige primero a los jugadores publicados y revisa su posición antes de completar tu plantilla. Los datos se actualizan cuando hay nuevos registros disponibles.</p><button data-pcfy-tab="create">Volver a crear equipo</button></section>';
 if(state.tab==='rules')return '<section class="pcfy-info"><h2>Reglas del Fantasy</h2><p>Arma tu equipo con 15 jugadores de la Liga, con un presupuesto virtual de $100 M MXN.</p><p>La plantilla incluye 3 delanteros, 5 mediocampistas, 5 defensas y 2 porteros. Los puntos visibles solo reflejan estadísticas registradas, sin inventar participaciones ni marcadores.</p><button data-pcfy-tab="create">Crear equipo</button></section>';
 return '<section class="pcfy-info"><h2>Premios</h2><p>No hay premios oficiales anunciados para este Fantasy. Revisa las publicaciones de la Liga para conocer novedades.</p><button data-pcfy-tab="create">Crear equipo</button></section>';
}
function modalHTML(){
 if(!state.modal)return'';
 return '<div class="pcfy-dialog-bg" data-pcfy-dialog-bg><div class="pcfy-dialog" role="dialog" aria-modal="true" aria-label="'+(state.modal==='reset'?'Confirmar reinicio':'Equipo Fantasy')+'">'+
 '<button class="pcfy-dialog-x" data-pcfy-action="close" aria-label="Cerrar">×</button>'+
 (state.modal==='reset'?'<h2>¿Reiniciar tu plantilla?</h2><p>Se eliminarán los 15 lugares seleccionados de este navegador.</p><div class="pcfy-dialog-actions"><button data-pcfy-action="close">Cancelar</button><button data-pcfy-action="confirm-reset">Reiniciar equipo</button></div>':
 '<h2>Tu equipo Fantasy</h2><p>Has elegido '+read().length+' de 15 jugadores y te quedan '+h(money(remaining(read())))+' de presupuesto.</p>'+
 '<div class="pcfy-dialog-actions"><button data-pcfy-action="close">Seguir editando</button><button data-pcfy-action="finish">Guardar equipo</button></div>')+
 '</div></div>';
}
function mainHTML(){
 const tabNames=[['create','Crear equipo'],['advice','Noticias y consejos'],['rules','Reglas'],['prizes','Premios']];
 return '<div class="pcfy-heading"><div class="pcfy-kicker">‹ <a href="#/gamingPortal">Todos los juegos</a></div><div class="pcfy-heading-row"><div><h1>Fantasy Football</h1><p>Liga Juventino Rosas · Guanajuato · Temporada 2026</p></div><span>FANTASY DE LA LIGA</span></div></div>'+
 '<nav class="pcfy-tabs" aria-label="Apartados Fantasy">'+tabNames.map(([value,label])=>'<button type="button" data-pcfy-tab="'+value+'" class="'+(state.tab===value?'active':'')+'" aria-current="'+(state.tab===value?'page':'false')+'">'+label+'</button>').join('')+'</nav>'+
 '<div class="pcfy-body">'+(state.tab==='create'?buildHTML():otherTab())+'</div>'+modalHTML();
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(paint)}
function paint(){
 queued=false;
 const screen=document.querySelector('#screen'),html=document.documentElement;
 if(!screen)return;
 const on=active();
 html.classList.toggle('ljpc-fantasy-uefa-active',on);
 let root=screen.querySelector(':scope > #'+ROOT);
 if(!on){root?.remove();return}
 loadFallback();
 if(!root){
  root=document.createElement('section');root.id=ROOT;root.setAttribute('aria-label','Fantasy Football PC');
  const cms=screen.querySelector(':scope > .ljr-cms-entry');
  if(cms)cms.after(root);else screen.prepend(root);
 }
 if(root.dataset.ready!=='1'){root.dataset.ready='1';players=catalog();root.innerHTML=mainHTML()}
 if(screenObserved!==screen){
  watcher?.disconnect();watcher=new MutationObserver(schedule);watcher.observe(screen,{childList:true});
  screenObserved=screen;
 }
}
function rerender(){
 const root=document.getElementById(ROOT);if(!root||!active())return;
 root.innerHTML=mainHTML();
}
function refreshTable(){
 const root=document.getElementById(ROOT);if(!root)return;
 const tbl=root.querySelector('[data-pcfy-list]');
 if(tbl)tbl.innerHTML=playerTable();
 const current=root.querySelector('[data-pcfy-current-slot]');
 if(current)current.textContent=SLOTS.find(s=>s.id===state.selectedSlot)?.pos||'DEL';
}
function apply(p){
 const rows=read(),occupied=new Set(rows.map(x=>Number(x.slot)));
 let slot=SLOTS.find(s=>s.id===state.selectedSlot);
 if(!slot||(p.group!=='ANY'&&slot.pos!==p.group)){
  slot=SLOTS.find(s=>!occupied.has(s.id)&&(p.group==='ANY'||s.pos===p.group))||
       SLOTS.find(s=>p.group==='ANY'||s.pos===p.group);
 }
 if(!slot){state.notice='No hay lugar disponible para esta posición.';rerender();return}
 const next=rows.filter(x=>Number(x.slot)!==slot.id&&identity(x)!==identity(p));
 if(remaining(next)<p.cost){state.notice='Ese jugador supera el presupuesto restante.';rerender();return}
 next.push({...p,slot:slot.id});
 if(save(next)){
  state.selectedSlot=SLOTS.find(s=>!next.some(x=>Number(x.slot)===s.id))?.id??slot.id;
  state.notice='';
  rerender();
 }
}
function auto(){
 if(!players.length){state.notice='No hay jugadores suficientes en los datos disponibles.';rerender();return}
 const old=read(),base=old.length===15?[]:old;
 for(let attempt=0;attempt<120;attempt++){
  const used=new Set(base.map(identity)),rows=base.slice(),missing=SLOTS.filter(s=>!rows.some(x=>Number(x.slot)===s.id));
  let ok=true;
  for(let i=0;i<missing.length;i++){
   const s=missing[i],max=remaining(rows)-4*(missing.length-i-1);
   const candidates=players.filter(p=>!used.has(identity(p))&&(p.group==='ANY'||p.group===s.pos)&&p.cost<=max);
   if(!candidates.length){ok=false;break}
   const item=candidates[Math.floor(Math.random()*candidates.length)];
   rows.push({...item,slot:s.id});used.add(identity(item));
  }
  if(ok&&rows.length===15){
   if(save(rows)){state.notice='Plantilla completada. Puedes cambiar cualquier jugador.';rerender();}return;
  }
 }
 state.notice='No hay suficientes jugadores compatibles dentro del presupuesto disponible.';rerender();
}
document.addEventListener('click',e=>{
 if(!active())return;
 const target=e.target instanceof Element?e.target.closest('#'+ROOT+' [data-pcfy-slot],#'+ROOT+' [data-pcfy-remove],#'+ROOT+' [data-pcfy-pick],#'+ROOT+' [data-pcfy-action],#'+ROOT+' [data-pcfy-tab],#'+ROOT+' [data-pcfy-sort]'):null;
 if(!target){
  if(e.target instanceof Element&&e.target.matches('#'+ROOT+' [data-pcfy-dialog-bg]')){state.modal='';rerender()}
  return;
 }
 e.preventDefault();e.stopPropagation();
 if(target.dataset.pcfyTab){state.tab=target.dataset.pcfyTab;state.notice='';rerender();return}
 if(target.dataset.pcfySort){const sort=target.dataset.pcfySort;state.direction=state.sort===sort?-state.direction:1;state.sort=sort;refreshTable();return}
 if(target.dataset.pcfySlot!==undefined){state.selectedSlot=Number(target.dataset.pcfySlot);const s=SLOTS.find(x=>x.id===state.selectedSlot);state.position=s?.pos||'';rerender();return}
 if(target.dataset.pcfyRemove!==undefined){const n=Number(target.dataset.pcfyRemove);save(read().filter(p=>Number(p.slot)!==n));state.selectedSlot=n;state.notice='';rerender();return}
 if(target.dataset.pcfyPick){try{apply(JSON.parse(decodeURIComponent(target.dataset.pcfyPick)))}catch(_){state.notice='No se pudo agregar al jugador.';rerender()}return}
 const action=target.dataset.pcfyAction;
 if(action==='auto')auto();
 if(action==='reset'){state.modal='reset';rerender()}
 if(action==='confirm-reset'){save([]);state.selectedSlot=0;state.position='';state.modal='';state.notice='Equipo reiniciado.';rerender()}
 if(action==='continue'&&read().length===15){state.modal='summary';rerender()}
 if(action==='finish'){state.modal='';state.notice='Equipo guardado en este navegador.';rerender()}
 if(action==='close'){state.modal='';rerender()}
},false);
document.addEventListener('change',e=>{
 if(!active()||!(e.target instanceof Element)||!e.target.closest('#'+ROOT))return;
 const field=e.target.dataset.pcfyFilter;if(field){state[field]=e.target.value;refreshTable()}
},false);
document.addEventListener('input',e=>{
 if(!active()||!(e.target instanceof Element)||!e.target.matches('#'+ROOT+' [data-pcfy-query]'))return;
 state.query=e.target.value;refreshTable();
},false);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.modal){state.modal='';rerender()}});
window.addEventListener('hashchange',()=>{state.modal='';schedule()});
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',()=>{players=catalog();const root=document.getElementById(ROOT);if(root&&active())rerender();schedule()});
window.addEventListener('liga:admin',schedule);
function begin(){
 const screen=document.querySelector('#screen');
 if(screen){watcher?.disconnect();watcher=new MutationObserver(schedule);watcher.observe(screen,{childList:true});screenObserved=screen}
 const html=document.documentElement;
 new MutationObserver(schedule).observe(html,{attributes:true,attributeFilter:['class']});
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
})();