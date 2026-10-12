/* V1390: reclutamiento arbitral, solidaridad y rankings personales de juegos.
   Los datos son LOCALES hasta contar con un backend que verifique cuentas y resultados.
   No modifica marcadores, cedulas, sanciones ni estadisticas oficiales. */
(function(){
'use strict';
if(window.__LJR_V1390_COMMUNITY_GAMES__)return;
window.__LJR_V1390_COMMUNITY_GAMES__=true;
const RK='ljr-v1390-game-results',REF='ljr-v1390-referee-applicants',SOL='ljr-v1390-injury-pledges';
const GAMES={all:'Todos los juegos',fantasy:'Fantasy',quiniela:'Quiniela',quizArena:'Quiz Arena',moreLess:'Más o Menos',predictorSix:'Pronostica Seis'};
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(k,def){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v===null?def:v}catch(_){return def}}
function write(k,obj){try{localStorage.setItem(k,JSON.stringify(obj));return true}catch(_){return false}}
function route(){return String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home'}
function account(){
 try{const live=window.LJR_V569_AUTH?.currentAccount?.();if(live?.id)return {id:String(live.id),alias:String(live.alias||live.name||'Jugador').slice(0,48)};
  const s=read('ljr-auth-v569',{}),a=(s.accounts||[]).find(x=>x.id===s.currentId);
  return a?.id?{id:String(a.id),alias:String(a.alias||a.name||'Jugador').slice(0,48)}:null;
 }catch(_){return null}
}
function uid(){return (window.crypto?.randomUUID?.()||'l-'+Date.now()+'-'+Math.random().toString(36).slice(2))}
function cleanPoints(x){const n=Number(x);return Number.isFinite(n)?Math.min(100000,Math.max(0,Math.round(n))):0}
function entries(){const a=read(RK,[]);return Array.isArray(a)?a.filter(x=>x&&GAMES[x.game]&&x.game!=='all'&&x.id&&x.accountId).slice(-5000):[]}
function record(game,input){
 const a=account();
 if(!a||!GAMES[game]||game==='all'||!input||!input.id)return false;
 const id=String(input.id).slice(0,180),points=cleanPoints(input.points);
 const rows=entries(),idx=rows.findIndex(x=>x.accountId===a.id&&x.game===game&&x.id===id);
 const val={accountId:a.id,alias:a.alias,game,id,points,won:!!input.won,at:new Date().toISOString()};
 if(idx>=0){
  if(rows[idx].points===val.points&&rows[idx].won===val.won&&rows[idx].alias===val.alias)return true;
  rows[idx]=val;
 }else rows.push(val);
 if(!write(RK,rows.slice(-5000)))return false;
 const panel=$('#screen > [data-v1390-ranking]');if(panel)panel.dataset.v1390Version='';
 schedule();return true;
}
function rankings(game){
 const by=new Map();
 entries().filter(x=>!game||game==='all'||x.game===game).forEach(x=>{
  const k=x.accountId,old=by.get(k)||{id:k,name:x.alias,points:0,wins:0,games:0};
  old.name=x.alias;old.points+=cleanPoints(x.points);old.wins+=x.won?1:0;old.games++;by.set(k,old);
 });
 return [...by.values()].sort((a,b)=>b.wins-a.wins||b.points-a.points||a.name.localeCompare(b.name,'es'));
}
function scorerPred(p,a,b){
 const h=Number(p.home),v=Number(p.away),rh=Number(a),rv=Number(b);
 if(![h,v,rh,rv].every(x=>Number.isInteger(x)&&x>=0))return null;
 const sign=x=>Math.sign(x);
 const outcome=sign(h-v)===sign(rh-rv);
 return {points:(outcome?3:0)+(h===rh?2:0)+(v===rv?2:0)+(h-v===rh-rv?3:0),won:outcome};
}
function reconcilePronostica(){
 const a=account();if(!a)return;
 const db=window.LJR_OFFICIAL_API?.getData?.()||window.LJR_OFFICIAL_DATA;
 if(!db?.categories)return;
 const p=read('ljr-v589-pronostica-six',{}).predictions||{};
 for(const [id,v] of Object.entries(p)){
  const m=/^p6-(\d+)-(\d+)-(\d+)$/.exec(id);if(!m||!v)continue;
  if(String(v.accountId||'')!==a.id)continue;
  const row=db.categories[m[1]]?.fixtures?.[Number(m[2])]?.rows?.[Number(m[3])];
  if(!row||!/^\d+$/.test(String(row[3]??''))||!/^\d+$/.test(String(row[5]??'')))continue;
  if(String(v.homeTeam||'')!==String(row[2]||'')||String(v.awayTeam||'')!==String(row[6]||''))continue;
  if(/^(LIVE|SUSPENDED|POSTPONED)$/i.test(String(row.status||'')))continue;
  const date=String(row[8]||'').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  // Sin hora de cierre comprobable, no adjudicar puntos por una prediccion retrospectiva.
  if(!date||!date[4]||!date[5]||!Number.isFinite(Number(v.updatedAt)))continue;
  const kickoff=Date.parse(date[3]+'-'+date[2].padStart(2,'0')+'-'+date[1].padStart(2,'0')+'T'+date[4].padStart(2,'0')+':'+date[5]+':00-06:00');
  if(!Number.isFinite(kickoff)||Number(v.updatedAt)>=kickoff)continue;
  const result=scorerPred(v,row[3],row[5]);
  if(result)record('predictorSix',{id:'fixture:'+id,points:result.points,won:result.won});
 }
}
function teamsFromRegister(root){
 const sel=$('[data-v190-player-team]',root);
 const opts=sel?[...sel.options].filter(o=>o.value&&o.value.trim()).map(o=>({value:o.value,name:o.textContent.trim()})):[];
 const seen=new Set();
 return opts.filter(t=>{const k=t.value.toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).slice(0,160);
}
function categoryOptions(root){
 const original=$('[data-v190-player-category]',root);
 if(!original)return '<option value="">Categoría por definir</option>';
 return original.innerHTML;
}
function teamOptions(root){
 const rows=teamsFromRegister(root);
 return '<option value="">Selecciona equipo registrado</option>'+rows.map(t=>'<option value="'+esc(t.value)+'">'+esc(t.name)+'</option>').join('');
}
function recruitMarkup(root){
 const referees=read(REF,[]),pledges=read(SOL,[]);
 const rr=Array.isArray(referees)?referees:[],pp=Array.isArray(pledges)?pledges:[];
 return '<section class="v1390-community" data-v1390-recruit>'+
  '<header class="v1390-community-title"><small>COMUNIDAD DE LA LIGA</small><h3>Árbitros y apoyo a jugadores</h3><p>Convocatorias y seguimiento local. Los datos de contacto no se publican.</p></header>'+
  '<article class="v1390-panel"><div class="v1390-panel-heading"><span class="v1390-emoji" aria-hidden="true">🟨</span><div><h4>Reclutamiento de árbitros</h4><p>Buscamos personas para dirigir partidos, recibir capacitación y cubrir jornadas de sábado o domingo.</p></div></div>'+
  '<form data-v1390-ref-form class="v1390-fields">'+
  '<label>Nombre de la persona<input required name="name" maxlength="100" autocomplete="name" placeholder="Nombre completo"></label>'+
  '<label>Comunidad<input name="zone" maxlength="90" placeholder="Juventino Rosas o comunidad"></label>'+
  '<label>Experiencia<select name="experience"><option>Quiero aprender a arbitrar</option><option>He arbitrado partidos</option><option>Árbitro con experiencia</option></select></label>'+
  '<label>Disponibilidad<select name="available"><option value="Sábados y domingos">Sábados y domingos</option><option value="Sábados">Sábados</option><option value="Domingos">Domingos</option></select></label>'+
  '<label>Contacto privado (opcional)<input name="contact" maxlength="100" autocomplete="off" placeholder="Teléfono o referencia"></label>'+
  '<button class="v1390-main" type="submit">Guardar aspirante</button></form>'+
  '<div class="v1390-actions"><button type="button" data-v1390-share-ref>Compartir convocatoria</button><span>'+rr.length+' aspirantes guardados aquí</span></div>'+
  '<div class="v1390-list">'+rr.slice().reverse().slice(0,15).map(x=>'<p><b>'+esc(x.name)+'</b><small>'+esc(x.zone||'Comunidad pendiente')+' · '+esc(x.available||'')+' · Por contactar</small><button type="button" data-v1390-del-ref="'+esc(x.id)+'" aria-label="Quitar aspirante">Quitar</button></p>').join('')+'</div>'+
  '</article>'+
  '<article class="v1390-panel"><div class="v1390-panel-heading"><span class="v1390-emoji" aria-hidden="true">💛</span><div><h4>Aportaciones solidarias por lesiones</h4><p>Los equipos registrados pueden anotar compromisos voluntarios de apoyo. Registrar un monto NO cobra dinero ni confirma pagos.</p></div></div>'+
  '<form data-v1390-solid-form class="v1390-fields">'+
  '<label>Equipo que aporta<select required name="team">'+teamOptions(root)+'</select></label>'+
  '<label>Jugador o folio autorizado<input required name="reference" maxlength="100" placeholder="Referencia sin datos médicos"></label>'+
  '<label>Monto comprometido (MXN)<input required type="number" name="amount" min="1" max="1000000" step="1" placeholder="Ej. 200"></label>'+
  '<label>Observación (opcional)<input name="note" maxlength="160" placeholder="Apoyo solidario voluntario"></label>'+
  '<button class="v1390-main" type="submit">Registrar compromiso</button></form>'+
  '<p class="v1390-notice">Estado: pendiente de confirmar por la Liga. No se almacenan diagnósticos ni datos bancarios.</p>'+
  '<div class="v1390-list">'+pp.slice().reverse().slice(0,15).map(x=>'<p><b>'+esc(x.team)+' · $'+Number(x.amount).toLocaleString('es-MX')+' MXN</b><small>'+esc(x.reference)+' · Compromiso pendiente</small><button type="button" data-v1390-del-sol="'+esc(x.id)+'" aria-label="Quitar compromiso">Quitar</button></p>').join('')+'</div>'+
  '</article><p class="v1390-scope">Información privada local de este dispositivo. La Secretaría de la Liga debe validar solicitudes y aportaciones antes de publicarlas.</p></section>';
}
function injectRecruit(){
 const root=$('#v190-recruitment-page');if(!root||route()!=='recruitment'||$('[data-v1390-recruit]',root))return;
 const forms=$('.v190-recruit-forms',root),next=$('.v190-publish-card',root);
 if(forms)forms.insertAdjacentHTML('afterend',recruitMarkup(root));else if(next)next.insertAdjacentHTML('beforebegin',recruitMarkup(root));else root.insertAdjacentHTML('beforeend',recruitMarkup(root));
}
function formData(form){return Object.fromEntries(new FormData(form).entries())}
function saveRef(form){
 const v=formData(form);if(!String(v.name||'').trim())return false;
 const arr=read(REF,[]);if(!Array.isArray(arr))return false;
 arr.push({id:uid(),name:String(v.name).trim().slice(0,100),zone:String(v.zone||'').trim().slice(0,90),experience:v.experience,available:v.available,contact:String(v.contact||'').trim().slice(0,100),at:new Date().toISOString()});
 return write(REF,arr.slice(-200));
}
function saveSolid(form){
 const v=formData(form),root=$('#v190-recruitment-page'),teams=teamsFromRegister(root);
 if(!teams.some(t=>t.value===v.team)||!String(v.reference||'').trim())return false;
 const amount=Number(v.amount);if(!Number.isSafeInteger(amount)||amount<1||amount>1000000)return false;
 const arr=read(SOL,[]);if(!Array.isArray(arr))return false;
 arr.push({id:uid(),team:v.team,reference:String(v.reference).trim().slice(0,100),amount,note:String(v.note||'').trim().slice(0,160),at:new Date().toISOString(),status:'pending'});
 return write(SOL,arr.slice(-200));
}
function shareRef(){
 const title='Convocatoria de árbitros · Liga Juventino Rosas';
 const message='¿Te gustaría arbitrar fútbol? La Liga Juventino Rosas invita a nuevos aspirantes a árbitros, con o sin experiencia, para jornadas de sábado y domingo. Consulta requisitos y disponibilidad directamente con la Liga. '+location.origin+location.pathname+'#/recruitment';
 if(navigator.share)navigator.share({title,text:message}).catch(()=>{});
 else if(navigator.clipboard?.writeText)navigator.clipboard.writeText(message).then(()=>alert('Convocatoria copiada para compartir.')).catch(()=>alert(message));
 else alert(message);
}
function rankMarkup(game='all'){
 const a=account(),selected=GAMES[game]?game:'all',rows=rankings(selected);
 return '<section class="v1390-rank"><div class="v1390-rank-head"><div><small>MARCADOR DE LOS JUEGOS</small><h3>Ranking de mejores jugadores</h3><p>Victorias y puntos de cuentas registradas en este dispositivo.</p></div><span class="v1390-trophy" aria-hidden="true">🏆</span></div>'+
  '<div class="v1390-rank-tabs" role="group" aria-label="Filtrar juego">'+Object.entries(GAMES).map(([k,label])=>'<button type="button" data-v1390-game="'+k+'" class="'+(k===selected?'active':'')+'">'+esc(label)+'</button>').join('')+'</div>'+
  (!a?'<p class="v1390-empty">Inicia sesión con tu cuenta para guardar resultados y aparecer en las clasificaciones. <a href="#/accountLogin">Iniciar sesión</a></p>':'<p class="v1390-you">Tu cuenta: <strong>'+esc(a.alias)+'</strong></p>')+
  (rows.length?'<div class="v1390-rank-rows">'+rows.slice(0,30).map((x,i)=>'<div class="v1390-rank-row '+(x.id===a?.id?'mine':'')+'"><span class="v1390-place">'+(i+1)+'</span><span class="v1390-player"><b>'+esc(x.name)+'</b><small>'+x.games+' registros</small></span><strong>'+x.wins+' triunfos <small>'+x.points+' pts</small></strong></div>').join('')+'</div>':'<p class="v1390-empty">Todavía no hay partidas terminadas o pronósticos evaluados de este juego.</p>')+
  '<p class="v1390-scope">Clasificación LOCAL · los resultados no se sincronizan entre teléfonos. Las predicciones sólo puntúan cuando hay resultado y fecha oficial; no se conceden victorias ficticias.</p></section>';
}
let selectedGame='all',timer=0,mutating=false;
function injectRanks(){
 const r=route(),map={fantasy:'fantasy',fantasyTeam:'fantasy',quiniela:'quiniela',quizArena:'quizArena',moreLess:'moreLess',moreLessHub:'moreLess',moreLessGallery:'moreLess',predictor:'quiniela',predictorSix:'predictorSix',rankings:'all'};
 if(!map[r])return;
 const screen=$('#screen');if(!screen)return;
 const visible=node=>node.getClientRects().length&&getComputedStyle(node).display!=='none'&&getComputedStyle(node).visibility!=='hidden';
 const mobile=new URLSearchParams(location.search).get('mode')!=='desktop'&&innerWidth<1024;
 const prestart=mobile&&[...document.querySelectorAll('[data-v531-view="splash"],[data-v531-view="hub"],.v589-page.intro,.v766-quiz-start,.v22-fantasy-master')].find(visible);
 const active=[...document.querySelectorAll('[data-v531-view="game"],[data-v531-view="countdown"]')].find(visible);
 const host=prestart||screen;
 let p=$('[data-v1390-ranking]');
 if(!p){p=document.createElement('div');p.dataset.v1390Ranking=''}
 if(p.parentNode!==host)host.append(p);
 p.hidden=!!active&&!prestart;
 p.classList.toggle('v1390-before-start',!!prestart);
 const game=r==='rankings'?selectedGame:map[r];
 const signature=game+':'+entries().length+':'+(account()?.id||'')+':'+!!prestart;
 if(p.dataset.v1390Version!==signature){
  p.innerHTML=prestart?'<details class="v1390-prestart"><summary>🏆 Ranking de mejores jugadores ⌄</summary><div>'+rankMarkup(game)+'</div></details>':rankMarkup(game);p.dataset.v1390Version=signature;
 }
}
function schedule(){if(timer)return;timer=requestAnimationFrame(()=>{timer=0;if(mutating)return;mutating=true;try{injectRecruit();injectRanks()}finally{mutating=false}})}
document.addEventListener('submit',e=>{
 const form=e.target instanceof Element?e.target.closest('[data-v1390-ref-form],[data-v1390-solid-form]'):null;if(!form)return;
 e.preventDefault();
 const ok=form.matches('[data-v1390-ref-form]')?saveRef(form):saveSolid(form);
 if(ok){const old=$('[data-v1390-recruit]');if(old)old.remove();schedule()}else alert('No se pudo guardar. Revisa la selección y los campos.');
},true);
document.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest('[data-v1390-game],[data-v1390-share-ref],[data-v1390-del-ref],[data-v1390-del-sol]'):null;
 if(!el)return;
 if(el.hasAttribute('data-v1390-game')){
  selectedGame=el.dataset.v1390Game||'all';
  const panel=el.closest('[data-v1390-ranking]');if(panel){panel.innerHTML=rankMarkup(selectedGame);const wrapper=panel.closest('[data-v1390-ranking]');if(wrapper)wrapper.dataset.v1390Version=selectedGame+':'+entries().length+':'+(account()?.id||'')}
  return;
 }
 if(el.hasAttribute('data-v1390-share-ref')){shareRef();return}
 for(const [attr,key] of [['data-v1390-del-ref',REF],['data-v1390-del-sol',SOL]]){
  if(!el.hasAttribute(attr))continue;
  const id=el.getAttribute(attr),arr=read(key,[]);
  if(Array.isArray(arr)&&confirm('¿Quitar este registro local?')){
   write(key,arr.filter(x=>x.id!==id));$('[data-v1390-recruit]')?.remove();schedule()
  }
  return;
 }
});
function init(){
 const host=$('#screen')||document.body;
 new MutationObserver(records=>{
  const selector='[data-v531-view],.v589-page,.v766-quiz-start,.v22-fantasy-master';
  if(records.some(r=>r.target===host||Array.from(r.addedNodes).some(n=>n.nodeType===1&&(n.matches?.(selector)||n.querySelector?.(selector)))))schedule();
 }).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('hashchange',()=>{selectedGame='all';schedule()});
 window.addEventListener('ljr:official-data',()=>{reconcilePronostica();schedule()});
 window.addEventListener('ljr:profile-updated',schedule);
 window.addEventListener('storage',schedule);
 // La puntuacion remota aun requiere autenticacion y validacion del servidor.
 reconcilePronostica();schedule();
}
window.LJR_GAME_RANKING={record,rankings,reconcilePronostica,scorePrediction:scorerPred,scope:'local'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
