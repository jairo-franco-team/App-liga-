/* V1132 · Centro de Jornada interactivo. Datos oficiales de solo lectura. */
(()=>{
'use strict';
if(window.__LJR_MATCHDAY_PRO_1132__)return;
window.__LJR_MATCHDAY_PRO_1132__=true;
// V1167: demo pages are rebuilt automatically; load scoped layout styles
// if the demo generator did not retain their <link> tags.
(function ensureMatchdayStyles(){
 if(!document.head?.appendChild||!document.createElement)return;
 for(const file of ['v1153-matchday-fullwidth-safe-crests.css','v1167-matchday-centered-official-crests.css']){
  if(document.querySelector('link[href*="'+file+'"]'))continue;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='./src/'+file+'?v=20261010-v1180';
  link.dataset.md1167Style='';
  document.head.appendChild(link);
 }
})();
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const TZ='America/Mexico_City';
let all=[],category='all',current='',host=null,signature='',lastAdvanceCheck=0,manualUntil=0;
const sharedLiveStates=new Map();
let remoteClockChecked=0,remoteClockKey='',remoteClockLoading=false;
const icons={
bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
map:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
share:'<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/>',
cloud:'<path d="M8 18h11a4 4 0 0 0 0-8 6 6 0 0 0-11-2 5 5 0 0 0 0 10Z"/>',
news:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>'
};
function icon(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';}
function route(){return String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||document.body?.dataset?.appRoute||'';}
function go(name){if(window.LJR_MAIN_ROUTE?.go)window.LJR_MAIN_ROUTE.go(name);else location.hash='#/'+name;}
function stamp(raw){
const m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/.exec(String(raw||''));
if(!m)return NaN;
const [day,month,year,hour,min]=m.slice(1).map(Number);
const test=new Date(Date.UTC(year,month-1,day));
if(test.getUTCFullYear()!==year||test.getUTCMonth()!==month-1||test.getUTCDate()!==day||hour>23||min>59)return NaN;
const wall=Date.UTC(year,month-1,day,hour,min);
const format=new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
let value=wall;
for(let i=0;i<3;i++){const p=Object.fromEntries(format.formatToParts(value).map(x=>[x.type,x.value]));value+=wall-Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);}
return value;
}
function readGames(){
const db=window.LJR_OFFICIAL_API?.getData?.()||window.LJR_OFFICIAL_DATA||{};
const items=[],seen=new Set();
for(const [catId,cat] of Object.entries(db.categories||{})){
for(const group of cat.fixtures||[])for(const r of group.rows||[]){
const home=String(r?.[2]||'').trim(),away=String(r?.[6]||'').trim(),time=stamp(r?.[8]);
if(!home||!away||!Number.isFinite(time))continue;
const id=[catId,r?.[8],norm(home),norm(away)].join('|');
if(seen.has(id))continue;seen.add(id);
items.push({id,officialKey:catId+':'+String(r?.[0]||''),catId,category:String(cat.name||'Categoría'),round:String(r?.[1]||''),home,away,venue:String(r?.[7]||''),date:String(r?.[8]||''),time,status:String(r?.[10]||''),homeScore:String(r?.[3]??'').trim(),awayScore:String(r?.[5]??'').trim()});
}}
return items.sort((a,b)=>a.time-b.time||a.id.localeCompare(b.id));
}
// V1193: Jornada utiliza primero los mismos archivos del directorio visible
// de Equipos (V27), con categoría, antes de consultar los catálogos antiguos.
function logo(name,category){
 let src='';
 try{src=window.LJR_TEAMS_CURRENT_LOGO?.get?.(name,category)||'';}catch(_){}
 if(!src)try{src=window.LJR_SEASON_LOGOS?.get?.(name)||'';}catch(_){}
 if(!src)try{src=window.LJR_TEAM_LOGOS?.get?.(name)||'';}catch(_){}
 if(!src)try{src=window.LJR_OFFICIAL_API?.getLogo?.(name)||'';}catch(_){}
 if(!src)try{src=window.V66_OFFICIAL_DIRECTORY?.logoFor?.(name)||'';}catch(_){}
 src=String(src||'').trim();
 return /^(https?:\/\/|data:image\/|\.?\.?\/|assets\/)/i.test(src)?src:'';
}
// No recortar colores ni quitar fondos por canvas/filtros: el escudo
// transparente viene directamente de Equipos. Un archivo roto muestra siglas.
function prepareMatchdayCrests(root){
 root.querySelectorAll('.md1132-crest img').forEach(img=>{
  const broken=()=>{if(img.isConnected)img.remove();};
  img.addEventListener('error',broken,{once:true});
  if(img.complete&&!img.naturalWidth)broken();
 });
}

function crest(name,category){
 const initials=String(name).split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase();
 const src=logo(name,category);
 // Missing image -> initials only; never fall back to an outdated crest.
 return '<span class="md1132-crest" data-md1132-team="'+esc(name)+'"><span class="md1132-crest-fallback">'+esc(initials||'EQ')+'</span>'+
  (src?'<img src="'+esc(src)+'" alt="Escudo de '+esc(name)+'" loading="lazy" decoding="async">':'')+'</span>';
}
/* V1453: cronometraje por partido. Nunca convertir la hora del rol en un silbatazo oficial. */
function liveSignal(g,at=Date.now()){
  if(!g?.officialKey)return null;
  try{
    const s=sharedLiveStates.has(g.officialKey)?
      sharedLiveStates.get(g.officialKey):
      JSON.parse(localStorage.getItem('ljr-match-live-v144:'+g.officialKey)||'null');
    if(!s||!['first','halftime','second','final'].includes(s.phase))return null;
    const confirmed=Array.isArray(s.events)&&s.events.some(e=>e?.type==='phase-'+s.phase&&e.confirmed!==false);
    const sourceFresh=!!(s.source?.connected&&Number(s.source.lastSync)>0&&at-Number(s.source.lastSync)<30000&&at>=Number(s.source.lastSync));
    if(!confirmed&&!sourceFresh)return null;
    if(!Number.isFinite(g.time)||at<g.time-15*60000||at>g.time+180*60000)return null;
    return s;
  }catch(_){return null}
}
/* Leer el estado COMPARTIDO de Match Center también en Match Day (usuarios públicos). */
async function refreshLiveMatch(){
  if(route()!=='matchday'||!window.LJR_MEDIA?.api)return;
  const g=match();if(!g?.officialKey)return;
  const now=Date.now(),key=g.officialKey;
  if(remoteClockLoading||key===remoteClockKey&&now-remoteClockChecked<7000)return;
  remoteClockKey=key;remoteClockChecked=now;remoteClockLoading=true;
  try{
    const r=await window.LJR_MEDIA.api('match/'+encodeURIComponent(key));
    if(!r||typeof r!=='object')return;
    sharedLiveStates.set(key,r.state&&typeof r.state==='object'?r.state:null);
    if(match()?.officialKey===key)tick();
  }catch(_){
    // En caso de desconexión queda la programación, sin inventar una señal.
  }finally{remoteClockLoading=false}
}
function status(g){
  const at=arguments.length>1?arguments[1]:Date.now();
  if(!g)return {name:'Sin partidos',type:'pending'};
  const state=norm(g.status),scored=/^\d+$/.test(g.homeScore)&&/^\d+$/.test(g.awayScore);
  if(/suspend|cancel|aplaz|pospuest/.test(state))return {name:'Suspendido / aplazado',type:'pending'};
  if(scored)return {name:g.homeScore+' - '+g.awayScore+' · oficial',type:'final'};
  const signal=liveSignal(g,at);
  if(signal?.phase==='final'||/finaliz|terminad/.test(state))return {name:'Final · acta pendiente',type:'final'};
  if(signal&&['first','halftime','second'].includes(signal.phase))return {name:signal.phase==='halftime'?'Descanso · confirmado':'EN VIVO · confirmado',type:'live'};
  if(/en vivo|jugando|primer tiempo|segundo tiempo|medio tiempo/.test(state))return {name:'EN VIVO · oficial',type:'live'};
  if(at<g.time)return {name:'Próximo',type:'next'};
  return {name:'Inicio sin confirmar',type:'pending'};
}
function mmss(milliseconds){
  const n=Math.max(0,Math.floor(milliseconds/1000)),m=Math.floor(n/60),sec=n%60;
  return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}
function playClock(phase,firstStarted,secondStarted,at){
  const elapsed=Math.max(0,at-(phase==='second'?secondStarted:firstStarted));
  if(phase==='first'){
    if(elapsed>=45*60000)return '45+'+mmss(elapsed-45*60000);
    return mmss(elapsed);
  }
  if(elapsed>=45*60000)return '90+'+mmss(elapsed-45*60000);
  return mmss(elapsed+45*60000);
}
function clockFor(g,at=Date.now()){
  if(!g)return {text:'--:--',period:'SIN PARTIDO',note:'Sin programación disponible',step:'pre',progress:0};
  const st=status(g,at),raw=norm(g.status);
  if(/suspend|cancel|aplaz|pospuest/.test(raw))return {text:'SUSPENDIDO',period:'SIN CRONÓMETRO',note:'Partido suspendido o aplazado',step:'final',progress:0};
  if(st.type==='final'&&/^\d+$/.test(g.homeScore)&&/^\d+$/.test(g.awayScore))return {text:g.homeScore+' – '+g.awayScore,period:'RESULTADO FINAL',note:'Marcador oficial publicado',step:'final',progress:100};
  const signal=liveSignal(g,at);
  if(signal?.phase==='final')return {text:'FINAL',period:'PARTIDO TERMINADO',note:'Esperando resultado oficial',step:'final',progress:100};
  if(signal&&['first','halftime','second'].includes(signal.phase)){
    if(signal.phase==='halftime'){
      const start=(signal.events||[]).filter(e=>e?.type==='phase-halftime'&&e.confirmed!==false).sort((a,b)=>Number(b.ts||0)-Number(a.ts||0))[0]?.ts;
      const elapsed=start?at-Number(start):0;
      return {text:mmss(elapsed),period:'DESCANSO · 15 MIN',note:'Descanso confirmado por operador',step:'break',progress:50};
    }
    const begun=Number(signal.phase==='first'?signal.firstStartedAt:signal.secondStartedAt);
    const elapsed=begun>0?Math.max(0,at-begun):0;
    const secondsInPeriod=Math.min(elapsed/60000,45);
    return {text:begun?playClock(signal.phase,begun,begun,at):'—',
      period:signal.phase==='first'?'PRIMER TIEMPO · 1T':'SEGUNDO TIEMPO · 2T',
      note:begun?'Cronómetro iniciado por operador · tiempo de juego confirmado':'Período confirmado · esperando marca de inicio',
      step:signal.phase,progress:signal.phase==='first'?secondsInPeriod/45*50:50+secondsInPeriod/45*50};
  }
  if(/finaliz|terminad/.test(raw))return {text:'FINAL',period:'PARTIDO TERMINADO',note:'Esperando acta oficial',step:'final',progress:100};
  if(at<g.time){
    const sec=Math.max(0,Math.floor((g.time-at)/1000)),days=Math.floor(sec/86400);
    const secondsOfDay=sec%86400;
    return {text:(days?days+' d · ':'')+String(Math.floor(secondsOfDay/3600)).padStart(2,'0')+':'+String(Math.floor(secondsOfDay%3600/60)).padStart(2,'0')+':'+String(secondsOfDay%60).padStart(2,'0'),
      period:'CUENTA REGRESIVA',note:'Hasta la hora programada del partido',step:'pre',progress:0};
  }
  const elapsed=at-g.time;
  if(elapsed<45*60000)return {text:mmss(elapsed),period:'1T · HORARIO ESTIMADO',note:'Inicio sin confirmar · no es un directo verificado',step:'first',estimated:true,progress:elapsed/(45*60000)*50};
  if(elapsed<60*60000)return {text:mmss(elapsed-45*60000),period:'DESCANSO · ESTIMADO',note:'Descanso estimado · sin confirmación oficial',step:'break',estimated:true,progress:50};
  if(elapsed<105*60000)return {text:mmss(elapsed-60*60000+45*60000),period:'2T · HORARIO ESTIMADO',note:'Inicio sin confirmar · no es un directo verificado',step:'second',estimated:true,progress:50+(elapsed-60*60000)/(45*60000)*50};
  return {text:'—',period:'HORARIO TERMINADO',note:'Resultado oficial pendiente',step:'final',progress:100};
}
function match(){return all.find(g=>g.id===current)||null;}
const SLOT_MS=(45+15+45)*60*1000;
function chooseAutomaticGame(now=Date.now()){
  const choices=all.filter(g=>(category==='all'||g.catId===category)&&
    !/suspend|cancel|aplaz|pospuest/.test(norm(g.status))&&
    !(/^\d+$/.test(g.homeScore)&&/^\d+$/.test(g.awayScore))&&
    status(g,now).type!=='final');
  const order=(a,b)=>a.time-b.time||a.id.localeCompare(b.id);
  const confirmed=choices.filter(g=>/en vivo|jugando|primer tiempo|segundo tiempo/.test(norm(g.status))&&
    g.time<=now&&now<g.time+180*60000).sort(order);
  if(confirmed.length)return confirmed[0];
  const ongoing=choices.filter(g=>g.time<=now&&now<g.time+SLOT_MS).sort(order);
  if(ongoing.length)return ongoing[0];
  const next=choices.filter(g=>g.time>now).sort(order);
  if(next.length)return next[0];
  return all.filter(g=>category==='all'||g.catId===category).slice(-1)[0]||null;
}
function advanceGame(now=Date.now()){
  if(route()!=='matchday'||!host?.isConnected)return false;
  const previous=match(),candidate=chooseAutomaticGame(now);
  if(!candidate||candidate.id===current)return false;
  if(manualUntil>now&&previous&&!/suspend|cancel|aplaz|pospuest/.test(norm(previous.status)))return false;
  const ended=previous&&(now>=previous.time+SLOT_MS||
    status(previous).type==='final'||/suspend|cancel|aplaz|pospuest/.test(norm(previous.status)));
  const newActive=candidate.time<=now&&now<candidate.time+SLOT_MS;
  const oldFuture=previous?.time>now;
  if(!previous||ended||(oldFuture&&newActive)||(!oldFuture&&!newActive&&previous.time<now-SLOT_MS)){
    current=candidate.id;
    if(pickLink())history.replaceState(null,'',location.pathname+location.search+'#/matchday');
    render();return true;
  }
  return false;
}
function deepLink(g){return location.origin+location.pathname+location.search+'#/matchday?game='+encodeURIComponent(g.id);}
function pickLink(){try{return new URLSearchParams(location.hash.split('?').slice(1).join('?')).get('game')||'';}catch(_){return '';}}
function card(g){
if(!g)return '<div class="md1132-empty">Aún no hay partidos oficiales con fecha y hora disponibles.</div>';
const state=status(g);
return '<div class="md1132-cardtop"><span class="md1132-caption">PARTIDO DE LA JORNADA</span><span class="md1132-status '+state.type+'">'+esc(state.name)+'</span></div>'+
'<div class="md1132-versus"><button type="button" class="md1132-team" data-md-team="'+esc(g.home)+'" aria-label="Ver equipo '+esc(g.home)+'">'+crest(g.home,g.category)+'<b>'+esc(g.home)+'</b></button><div class="md1132-mid"><strong>VS</strong><small>'+esc(g.category)+'</small></div><button type="button" class="md1132-team" data-md-team="'+esc(g.away)+'" aria-label="Ver equipo '+esc(g.away)+'">'+crest(g.away,g.category)+'<b>'+esc(g.away)+'</b></button></div>'+
'<div class="md1132-chrono" data-md-chrono data-phase="pre">'+
    '<div class="md1132-period" data-md-period>CUENTA REGRESIVA</div>'+
    '<div class="md1132-clock" data-md-clock aria-live="off">--:--:--</div>'+
    '<div class="md1132-time-note" data-md-clock-note>Hora oficial programada</div>'+
    '<div class="md1132-time-track" aria-hidden="true"><span data-md-progress></span></div>'+
    '<div class="md1132-period-labels" aria-hidden="true"><span>1T · 45 min</span><span>Descanso · 15 min</span><span>2T · 45 min</span></div>'+
  '</div>'+
'<p class="md1132-meta">'+esc([g.round?'Jornada '+g.round:'',g.venue||'Campo por confirmar',g.date].filter(Boolean).join(' · '))+'</p>'+
'<div class="md1132-actions">'+
[['bell','Avisos','alerts'],['calendar','Agenda','calendar'],['map','Campo','map'],['share','Compartir','share']].map(x=>'<button type="button" data-md-action="'+x[2]+'">'+icon(x[0])+'<span>'+x[1]+'</span></button>').join('')+
'</div><div class="md1132-alerts" data-md-alerts hidden><p>Guarda un recordatorio en el calendario del teléfono o configura avisos de jornada. Los avisos automáticos requieren un servidor activo.</p><div><button type="button" data-md-action="ics">Google Calendar</button><button type="button" data-md-action="agenda">Configurar avisos</button></div></div>'+
'<div class="md1132-more"><button type="button" data-md-action="weather">'+icon('cloud')+'Clima</button><button type="button" data-md-action="venues">'+icon('map')+'Sedes</button><button type="button" data-md-action="post">'+icon('news')+'Publicaciones</button></div>';
}
function render(){
if(!host||!host.isConnected)return;
const g=match(),hero=$('.v160-matchday-hero',host),bar=$('.v160-matchday-bar',host);
if(!hero||!bar)return;
let shell=$('[data-md1132-hero]',hero);if(!shell){shell=document.createElement('div');shell.dataset.md1132Hero='';hero.prepend(shell);}
shell.innerHTML=card(g);
const categories=[...new Map(all.map(x=>[x.catId,x.category])).entries()];
let filter=$('[data-md1132-filters]',bar);
if(!filter){filter=document.createElement('div');filter.dataset.md1132Filters='';bar.querySelector('h3')?.after(filter);}
filter.innerHTML='<div class="md1132-chips" role="group" aria-label="Categorías">'+[['all','Todas'],...categories].map(([id,label])=>'<button type="button" data-md-filter="'+esc(id)+'" aria-pressed="'+String(category===id)+'">'+esc(label)+'</button>').join('')+'</div>';
let list=$('[data-md1132-list]',bar);
if(!list){list=document.createElement('div');list.dataset.md1132List='';bar.querySelector('button[data-v100-route]')?.before(list);if(!list.parentElement)bar.append(list);}
const shown=all.filter(x=>category==='all'||x.catId===category);
const future=shown.filter(x=>x.time>Date.now()-150*60000);
const rows=(future.length?future:shown.slice(-8)).slice(0,12);
list.innerHTML=rows.length?rows.map(x=>'<button type="button" class="md1132-game '+(x.id===current?'selected':'')+'" data-md-select="'+esc(x.id)+'" aria-pressed="'+String(x.id===current)+'"><span class="md1132-game-main">'+crest(x.home,x.category)+'<span class="md1132-game-copy"><b>'+esc(x.home)+' vs '+esc(x.away)+'</b><small>'+esc(x.date+' · '+(x.venue||'Campo pendiente'))+'</small><em class="'+status(x).type+'">'+esc(status(x).name)+'</em></span>'+crest(x.away,x.category)+'</span></button>').join(''):'<p class="md1132-empty">Sin encuentros oficiales para esta categoría.</p>';
host.classList.add('md1132-ready');
prepareMatchdayCrests(host);
tick();
}
function tick(){
if(route()!=='matchday'||!host?.isConnected)return;
const now=Date.now();
if(now-lastAdvanceCheck>=5000){lastAdvanceCheck=now;if(advanceGame(now))return;}
const clock=$('[data-md-clock]',host),g=match();if(!clock||!g)return;
const time=clockFor(g,now),state=status(g,now),wrapper=$('[data-md-chrono]',host);
clock.textContent=time.text;
const period=$('[data-md-period]',host),note=$('[data-md-clock-note]',host),progress=$('[data-md-progress]',host);
if(period)period.textContent=time.period;
if(note)note.textContent=time.note;
if(progress)progress.style.width=Math.max(0,Math.min(100,time.progress||0))+'%';
if(wrapper){wrapper.dataset.phase=time.step;wrapper.classList.toggle('is-estimated',!!time.estimated)}
const pill=$('.md1132-cardtop .md1132-status',host);
if(pill){pill.textContent=state.name;pill.className='md1132-status '+state.type;}
}
function toast(value){let el=$('[data-md1132-toast]');if(!el){el=document.createElement('div');el.dataset.md1132Toast='';document.body.append(el);}el.textContent=value;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,3600);}
function calendar(g){
 window.LJR_GOOGLE_CALENDAR_GLOBAL.open({
  title:g.home+' - '+g.away,startMs:g.time,duration:120,venue:g.venue||'',
  description:'Liga Juventino Rosas · '+g.category+' · Jornada '+g.round+' · Consulta el rol oficial antes de acudir.'
 });
}
function ics(g){calendar(g);}
async function share(g){
const text='⚽ '+g.home+' vs '+g.away+'\n'+g.category+' · Jornada '+g.round+'\n📅 '+g.date+'\n📍 '+(g.venue||'Campo por confirmar'),url=deepLink(g);
try{if(navigator.share){await navigator.share({title:'Liga Juventino Rosas · Partido',text,url});return;}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text+'\n'+url);toast('Partido copiado para compartir.');return;}window.open('https://wa.me/?text='+encodeURIComponent(text+'\n'+url),'_blank','noopener,noreferrer');}
catch(e){if(e?.name!=='AbortError')toast('No fue posible compartir desde este navegador.');}
}
function v1171MatchdayMaps(venue){
 const v=norm(venue);
 const exact=[
  ['san julian','https://maps.app.goo.gl/5yfZH7nGMtw2Cqqf7'],
  ['fraccionamiento','https://maps.app.goo.gl/Y1ZGLTpGJ7XmGCKT7'],
  ['comontuoso','https://maps.app.goo.gl/Y1ZGLTpGJ7XmGCKT7'],
  ['san juan de la cruz','https://maps.app.goo.gl/mcc7DpevkPW5mW4M9'],
  ['franco tavera','https://maps.app.goo.gl/yBhVkMrXzL3Npv3WA'],
  ['tavera','https://maps.app.goo.gl/yBhVkMrXzL3Npv3WA'],
  ['pozos','https://goo.gl/maps/BF9dnqf5SaBfu41PA']
 ];
 const match=exact.find(([key])=>v.includes(key));
 return match?.[1]||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((venue||'Campo')+', Juventino Rosas, Guanajuato');
}
function onClick(e){
if(route()!=='matchday'||!host?.contains(e.target))return;
const team=e.target.closest('[data-md-team]');if(team){const name=team.dataset.mdTeam;localStorage.setItem('v62-team-name',name);localStorage.setItem('v42-team-tab','summary');if(window.LJR_OFFICIAL_API?.openTeam)window.LJR_OFFICIAL_API.openTeam(name);else go('teamDetail');return;}
const filter=e.target.closest('[data-md-filter]');if(filter){category=filter.dataset.mdFilter;const a=all.filter(g=>category==='all'||g.catId===category);if(!a.some(g=>g.id===current))current=chooseAutomaticGame()?.id||'';manualUntil=0;render();return;}
const select=e.target.closest('[data-md-select]');if(select){current=select.dataset.mdSelect;manualUntil=Date.now()+30000;const g=match();if(g){history.replaceState(null,'',location.pathname+location.search+'#/matchday?game='+encodeURIComponent(g.id));}render();return;}
const action=e.target.closest('[data-md-action]');if(!action)return;
const g=match();if(!g)return;
switch(action.dataset.mdAction){
case 'alerts':{const panel=$('[data-md-alerts]',host);if(panel)panel.hidden=!panel.hidden;break;}
case 'calendar':calendar(g);break;
case 'ics':ics(g);break;
case 'agenda':go('agendaBuilder');break;
case 'map':window.open(v1171MatchdayMaps(g.venue),'_blank','noopener,noreferrer');break;
case 'share':share(g);break;
case 'weather':go('weatherFields');break;
case 'venues':go('venues');break;
case 'post':go('publications');break;
}
}
function activate(force=false){
if(route()!=='matchday')return;
const el=$('#v160-matchday-extra');
if(!el)return;
const next=readGames(),sig=next.map(x=>x.id+'|'+x.homeScore+'|'+x.awayScore+'|'+x.status).join(';');
if(host===el&&el.dataset.md1132==='1'&&!force&&sig===signature)return;
host=el;host.dataset.md1132='1';all=next;signature=sig;
const query=pickLink();if(query&&all.some(x=>x.id===query))current=query;
if(!all.some(x=>x.id===current))current=chooseAutomaticGame()?.id||'';
if(category!=='all'&&!all.some(x=>x.catId===category))category='all';
render();
}
document.addEventListener('click',onClick);
window.addEventListener('hashchange',()=>setTimeout(()=>activate(true),100));
window.addEventListener('ljr:official-data',()=>{activate(true);refreshLiveMatch()});
window.addEventListener('ljr:match-live-feed',()=>{if(route()==='matchday')tick()});
window.addEventListener('storage',e=>{if(route()==='matchday'&&e.key?.startsWith('ljr-match-live-v144:'))tick()});
function start(){
const screen=$('#screen');
if(screen)new MutationObserver(()=>activate()).observe(screen,{childList:true,subtree:true});
activate();setTimeout(()=>activate(true),400);setTimeout(()=>activate(true),1300);setTimeout(()=>activate(true),3000);
setInterval(()=>{tick();refreshLiveMatch()},1000);
refreshLiveMatch();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();