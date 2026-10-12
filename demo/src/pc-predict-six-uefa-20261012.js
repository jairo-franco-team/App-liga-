/* Pronostica Seis — only the independent desktop-browser experience.
   Original V589 markup, scoring, saved predictions and mobile/APK remain untouched. */
(()=>{'use strict';
if(window.__LJPC_SIX_UEFA_20261012__)return;
window.__LJPC_SIX_UEFA_20261012__=true;
const logo='./assets/branding/escudo-liga-azul-sin-fondo-v1007.png';
const tabs=['predictions','leagues','prizes','rules','achievements'];
const labels={predictions:'Pronósticos',leagues:'Ligas',prizes:'Premios',rules:'Reglas',achievements:'Logros'};
const storeKey='ljpc-six-private-leagues-local-v1';
const predictionKey='ljr-v589-pronostica-six';
let tab='predictions',notice='',overlay=false,queued=false,watching=false,lastPage=null;
try{const stored=sessionStorage.getItem('ljpc-six-tab-v1');if(tabs.includes(stored))tab=stored}catch(_){}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function isPC(){
 const mode=new URLSearchParams(location.search).get('mode')?.toLowerCase();
 const route=(location.hash||'').replace(/^#\/?/,'').split('?')[0];
 return mode!=='apk'&&mode!=='mobile'&&document.documentElement.classList.contains('ljpc-unified-pc')&&route==='predictorSix';
}
function savedPredictions(){
 try{const s=JSON.parse(localStorage.getItem(predictionKey)||'{}');return Object.values(s.predictions||{}).filter(v=>v&&Number.isFinite(Number(v.home))&&Number.isFinite(Number(v.away))).length}catch(_){return 0}
}
function localLeagues(){
 try{const x=JSON.parse(localStorage.getItem(storeKey)||'[]');return Array.isArray(x)?x.slice(0,25):[]}catch(_){return []}
}
function persist(leagues){try{localStorage.setItem(storeKey,JSON.stringify(leagues.slice(0,25)))}catch(_){notice='No se pudo guardar en este navegador.'}}
function tiles(){return '<div class="p6-six" aria-hidden="true">'+Array.from({length:6},(_,i)=>'<span><i>◇</i><i>⬡</i></span>').join('')+'</div>'}
function header(){
 return '<div class="p6-head"><div class="p6-bound"><span class="p6-back">‹ &nbsp;Todos los juegos</span><div class="p6-heading"><div><h1>Pronostica Seis</h1><p>La Liga Juventino Rosas · Pronósticos de fútbol</p></div><span class="p6-sponsor">Liga Juventino <img src="'+logo+'" alt=""></span></div></div></div>';
}
function navigation(){
 return '<nav class="p6-nav" aria-label="Secciones de Pronostica Seis"><div class="p6-bound p6-navrow">'+tabs.map(t=>'<button type="button" data-p6-tab="'+t+'" class="'+(tab===t?'active':'')+'" aria-current="'+(tab===t?'page':'false')+'">'+labels[t]+'</button>').join('')+'</div></nav>';
}
function button(text,action,extra=''){return '<button type="button" class="p6-btn '+extra+'" data-p6-action="'+action+'">'+text+'</button>'}
function intro(){
 return '<section class="p6-hero p6-hero-play"><div class="p6-bound p6-hero-inner">'+tiles()+
  '<h2>Pronostica seis resultados y consigue puntos</h2><p>Elige el marcador de seis partidos publicados por la Liga, sigue tus aciertos y pon a prueba tus habilidades.</p>'+
  button('Ver partidos y jugar','play','cyan')+'</div></section>'+
  '<section class="p6-light"><div class="p6-bound"><h2>Cómo participar</h2><div class="p6-features">'+
  '<article>'+tiles()+'<h3>Seis pronósticos</h3><p>Escoge el marcador de cada encuentro de la jornada.</p></article>'+
  '<article><div class="p6-art-boost" aria-hidden="true">ϟ</div><h3>Consigue puntos</h3><p>El resultado, los goles y la diferencia aportan puntos.</p></article>'+
  '<article><div class="p6-art-score" aria-hidden="true"><b>1</b><b>0</b><small>+3</small></div><h3>Consulta tus aciertos</h3><p>Los pronósticos se guardan en este dispositivo.</p></article></div>'+
  '<div class="p6-bottom-actions">'+button('Empezar a jugar','play','solid')+button('Leer reglas','rules','outline')+'</div></div></section>';
}
function predictionContent(native){
 if(native?.classList.contains('predictions'))return '<div class="p6-predict-intro p6-bound"><p>Selecciona una jornada y toca los marcadores para pronosticar. Los partidos proceden de los datos publicados por la Liga.</p></div>';
 return intro();
}
function prizes(){
 return '<section class="p6-hero"><div class="p6-bound p6-hero-inner"><div class="p6-prize-art" aria-hidden="true"><span class="p6-prize-cup">🏆</span><span class="p6-prize-ticket">LIGA<br>JUVENTINO<br><b>PREMIOS</b></span></div>'+
  '<h2>Reconoce a quienes más aciertan</h2><p>El apartado de premios de Pronostica Seis está en preparación. No hay premios físicos ni viajes anunciados oficialmente.</p>'+button('Ver mis pronósticos','predictions','cyan')+'</div></section>'+
  '<section class="p6-light"><div class="p6-bound"><h2>¿Qué hay en juego?</h2><div class="p6-prize-grid">'+
  '<article><div class="p6-prize-graphic" aria-hidden="true">🏆</div><h3>Resultados de la temporada</h3><p>Sigue tus pronósticos y aciertos cuando se publiquen los resultados.</p></article>'+
  '<article><div class="p6-prize-graphic" aria-hidden="true">⚽</div><h3>Participación en el juego</h3><p>Pronostica los encuentros disponibles de cada jornada.</p></article>'+
  '<article><div class="p6-prize-graphic" aria-hidden="true">🎖</div><h3>Premios por confirmar</h3><p>Este espacio se actualizará únicamente cuando la Liga anuncie premios.</p></article></div>'+
  '<div class="p6-bottom-actions">'+button('Jugar ahora','predictions','solid')+button('Consultar las reglas','rules','outline')+'</div></div></section>';
}
function rules(){
 return '<section class="p6-hero"><div class="p6-bound p6-hero-inner">'+
  '<div class="p6-rules-art" aria-hidden="true"><span>⚽</span><div>3 &nbsp; +<small>PRONOSTICA</small></div><span>⚽</span></div>'+
  '<h2>Pronostica seis resultados y consigue puntos</h2><p>¿Quién ganará? ¿Cuántos goles marcará? Comprueba cómo funciona el juego de la Liga.</p>'+button('Cómo conseguir puntos','scoring','cyan')+'</div></section>'+
  '<section class="p6-light"><div class="p6-bound"><h2>Cómo jugar</h2><div class="p6-features">'+
  '<article>'+tiles()+'<h3>Pronostica seis resultados</h3><p>Elige el marcador antes del comienzo del partido. Puedes cambiarlo mientras el encuentro esté abierto.</p></article>'+
  '<article><div class="p6-art-boost" aria-hidden="true">ϟ</div><h3>Aumenta tu puntuación</h3><p>El comodín puede duplicar los puntos de un partido de la jornada.</p></article>'+
  '<article><div class="p6-art-score" aria-hidden="true"><b>2</b><b>1</b><small>+3</small></div><h3>Ve más allá del resultado</h3><p>Se consideran resultado, goles locales y visitantes y diferencia de goles.</p></article></div>'+
  '<div class="p6-score-rules"><h3>Puntuación indicada en el juego</h3><div><span>Resultado acertado</span><b>3 puntos</b></div><div><span>Goles locales acertados</span><b>2 puntos</b></div><div><span>Goles visitantes acertados</span><b>2 puntos</b></div><div><span>Diferencia de goles</span><b>3 puntos</b></div><div><span>Bonus por sorpresa (según condiciones)</span><b>5 puntos</b></div><div><span>Comodín seleccionado</span><b>×2 puntos</b></div></div>'+
  '<div class="p6-bottom-actions">'+button('Ir a pronósticos','predictions','solid')+button('Ver logros','achievements','outline')+'</div></div></section>';
}
function leagues(){
 const leagues=localLeagues();
 return '<section class="p6-leagues"><div class="p6-bound"><h2>Ligas</h2><hr><div class="p6-league-width"><h3>Ligas privadas</h3>'+
 '<div class="p6-league-feature"><h4>Compite con tus amigos</h4><p>Esta versión permite organizar ligas guardadas solo en tu navegador, sin sincronización entre personas o dispositivos.</p><div class="p6-actions"><label>Nombre de la liga<input data-p6-new-name maxlength="60" placeholder="Mi liga" aria-label="Nombre de la liga"></label>'+button('Crear liga local','create','cyan')+'</div><div class="p6-actions"><label>Código local<input data-p6-code maxlength="16" placeholder="JR-XXXXXX" aria-label="Código local"></label>'+button('Unirse con código local','join','cyan')+'</div></div>'+
 (notice?'<p class="p6-notice" role="status">'+esc(notice)+'</p>':'')+
 (leagues.length?'<h3>Mis ligas locales</h3><div class="p6-league-list">'+leagues.map(l=>'<article><b>'+esc(l.name)+'</b><code>'+esc(l.code)+'</code><small>Guardada en este navegador</small></article>').join('')+'</div>':'')+
 '<h3>Ligas públicas</h3><div class="p6-public-league"><span>🌐</span><div><b>Clasificación general</b><small>Disponible cuando exista una clasificación publicada y sincronizada</small></div><span>—</span></div></div></div></section>';
}
function achievements(){
 const n=savedPredictions();
 const goals=[{name:'Comenzando…',threshold:1,description:'Guarda tu primer pronóstico'},{name:'Genio de la táctica',threshold:3,description:'Guarda tres pronósticos'},{name:'Puntos de la jornada',threshold:6,description:'Completa seis pronósticos'},{name:'Constancia',threshold:12,description:'Guarda doce pronósticos'},{name:'Expertos del marcador',threshold:18,description:'Guarda dieciocho pronósticos'}];
 const done=goals.filter(g=>n>=g.threshold).length;
 return '<section class="p6-hero"><div class="p6-bound p6-hero-inner"><div class="p6-achieve-art" aria-hidden="true">🏅</div><h2>Tus logros de Pronostica Seis</h2><p>Avanza completando pronósticos. El progreso que se muestra pertenece exclusivamente a este navegador.</p>'+button('Ver mis logros','achievementsModal','cyan')+'</div></section>'+
 '<section class="p6-leagues p6-achievements"><div class="p6-bound"><h2>Progreso personal</h2><p>'+n+' pronóstico(s) guardado(s) · '+done+' de '+goals.length+' metas locales alcanzadas</p>'+
 '<div class="p6-progress">'+goals.map(g=>'<article><span class="p6-medal">'+(n>=g.threshold?'✓':'☆')+'</span><div><h3>'+g.name+'</h3><p>'+g.description+'</p></div><b>'+Math.min(n,g.threshold)+' / '+g.threshold+'</b></article>').join('')+'</div></div></section>';
}
function modal(){
 const n=savedPredictions(),levels=[1,3,6,12,18];
 return '<div class="p6-overlay" data-p6-modal role="presentation"><section role="dialog" aria-modal="true" aria-label="Logros de Pronostica Seis" class="p6-modal"><button class="p6-close" data-p6-action="close" aria-label="Cerrar">×</button><h2>Pronostica Seis</h2><div class="p6-modal-summary"><b>'+levels.filter(v=>n>=v).length+' <small>de '+levels.length+'</small></b><span>Tus logros<br><small>'+n+' pronóstico(s) guardado(s)</small></span></div>'+
 levels.map((v,i)=>'<details><summary>'+['Comenzando…','Genio de la táctica','Puntos de la jornada','Constancia','Experto del marcador'][i]+'<span>'+Math.min(n,v)+' de '+v+'⌄</span></summary><p>Guarda '+v+' pronóstico(s) para completar este logro local.</p></details>').join('')+'</section></div>';
}
function markup(native){
 return header()+navigation()+
 '<div class="p6-content" data-p6-content="'+tab+'">'+
 (tab==='predictions'?predictionContent(native):tab==='leagues'?leagues():tab==='prizes'?prizes():tab==='rules'?rules():achievements())+
 '</div>'+(overlay?modal():'');
}
function paint(){
 queued=false;
 const screen=document.querySelector('#screen');
 if(!screen)return;
 const exists=screen.querySelector(':scope > #ljpc-six-ui');
 if(!isPC()){exists?.remove();document.documentElement.classList.remove('ljpc-six-active');return}
 const native=screen.querySelector(':scope > [data-v589-root]')||screen.querySelector('[data-v589-root]');
 document.documentElement.classList.add('ljpc-six-active');
 if(!exists){
  const node=document.createElement('section');
  node.id='ljpc-six-ui';node.setAttribute('aria-label','Pronostica Seis PC');
  const admin=screen.querySelector(':scope > .ljr-cms-entry');
  if(admin)admin.after(node);else screen.prepend(node);
 }
 const shell=screen.querySelector(':scope > #ljpc-six-ui');
 const signature=tab+'|'+(native?.className||'')+'|'+savedPredictions()+'|'+localLeagues().length+'|'+notice+'|'+overlay;
 if(shell.dataset.signature!==signature){shell.dataset.signature=signature;shell.innerHTML=markup(native)}
 screen.dataset.pc6Tab=tab;
 lastPage=native;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(paint)}
function switchTab(t){
 if(!tabs.includes(t))return;
 tab=t;notice='';overlay=false;
 try{sessionStorage.setItem('ljpc-six-tab-v1',t)}catch(_){}
 paint();document.querySelector('#ljpc-six-ui')?.scrollIntoView({block:'start',behavior:'instant'});
}
function action(name){
 if(tabs.includes(name)){switchTab(name);return}
 if(name==='close'){overlay=false;paint();return}
 if(name==='achievementsModal'){overlay=true;paint();return}
 if(name==='play'){
  const btn=document.querySelector('.v589-page.intro [data-v589-guest]')||document.querySelector('.v589-page.leagues [data-v589-view="predictions"]');
  if(btn){btn.click();setTimeout(schedule,60)} else {
   if(document.querySelector('.v589-page.predictions')){tab='predictions';paint()}
   else {notice='Abre Pronostica Seis desde Gaming para seleccionar los partidos.';paint()}
  }
  return;
 }
 if(name==='scoring'){
  const info=document.querySelector('.v589-page.predictions [data-v589-info]');
  if(info){switchTab('predictions');info.click()}else{notice='Puntuación disponible en el resumen inferior.';switchTab('rules')}
  return;
 }
 if(name==='create'){
  const f=document.querySelector('[data-p6-new-name]');
  if(!f){notice='Escribe un nombre para la liga.';paint();return}
  const name=f.value.trim().slice(0,60);if(!name){notice='Escribe un nombre para la liga.';paint();return}
  const code='JR-'+Array.from({length:6},()=>Math.floor(Math.random()*36).toString(36)).join('').toUpperCase();
  persist([...localLeagues(),{name,code}]);notice='Liga local creada. El código solo funciona en este navegador.';paint();return;
 }
 if(name==='join'){
  const f=document.querySelector('[data-p6-code]');const code=(f?.value||'').trim().toUpperCase();
  const found=localLeagues().find(l=>l.code===code);
  notice=found?'Liga local encontrada: '+found.name:'No se encontró ese código en este navegador. Las ligas aún no se sincronizan entre dispositivos.';
  paint();return;
 }
}
document.addEventListener('click',e=>{
 if(!isPC())return;
 const btn=e.target.closest('#ljpc-six-ui button');
 if(!btn)return;
 const next=btn.dataset.p6Tab,act=btn.dataset.p6Action;
 if(next||act){e.preventDefault();action(next||act)}
},false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay){overlay=false;paint()}});
document.addEventListener('click',e=>{if(e.target.matches?.('#ljpc-six-ui .p6-overlay')){overlay=false;paint()}});
document.addEventListener('input',e=>{
 if(e.target.matches?.('[data-p6-new-name],[data-p6-code]'))return;
});
document.addEventListener('click',e=>{
 if(!isPC())return;
 const b=e.target.closest('#ljpc-six-ui [data-p6-open-form]');
 if(!b)return;
});
function setupForms(){
 const screen=document.querySelector('#screen');
 if(!screen)return;
 if(!screen.querySelector('[data-p6-new-name]')){
  // Inputs are supplied by a permanent unobtrusive form under the local league card.
 }
}
window.addEventListener('hashchange',()=>{tab='predictions';overlay=false;notice='';schedule()});
window.addEventListener('liga:admin',schedule);
window.addEventListener('ljr:official-data',schedule);
window.addEventListener('resize',schedule);
function start(){
 const screen=document.querySelector('#screen');
 if(screen&&!watching){new MutationObserver(schedule).observe(screen,{childList:true});watching=true}
 const html=document.documentElement;
 new MutationObserver(schedule).observe(html,{attributes:true,attributeFilter:['class']});
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();