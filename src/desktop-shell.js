/* Liga Juventino — desktop/browser shell rebuilt from the supplied UEFA-style reference. */
(function(){
'use strict';
const MIN=1024;
const host=()=>document.querySelector('#screen');
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const desktop=()=>mode()==='desktop'||(!['mobile','apk'].includes(mode())&&innerWidth>=MIN);
const route=()=>location.hash.replace(/^#\/?/,'')||'home';
const go=r=>{location.hash='#/'+r};
function desktopOfficialData(){return window.LJR_OFFICIAL_DATA||window.LJR_OFFICIAL_API?.getData?.()||null}
function desktopOfficialGames(limit=6){
 const db=desktopOfficialData(),games=[];
 if(!db?.categories)return [];
 const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 for(const [id,c] of Object.entries(db.categories)){
  for(const g of c.fixtures||[])for(const r of g.rows||[]){
   if(!Array.isArray(r)||!r[2]||!r[6])continue;
   const d=String(r[8]||'').match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2})$/);
   if(!d||d[4]==='00:00')continue;
   const iso=d[3]+'-'+d[2]+'-'+d[1];
   if(iso<today||/^\d+$/.test(String(r[3]))&&/^\d+$/.test(String(r[5]))||c.fixture_decisions?.[String(r[0])])continue;
   const dow=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(Number(d[3]),Number(d[2])-1,Number(d[1])).getDay()];
   games.push({sort:iso+'T'+d[4],text:dow+' '+d[1]+'/'+d[2]+' · '+d[4]+' · J'+r[1],home:r[2],away:r[6],time:d[4],field:r[7]||'',category:c.name,id});
  }
 }
 games.sort((a,b)=>a.sort.localeCompare(b.sort)||a.id.localeCompare(b.id));
 return games.slice(0,limit);
}
function desktopOfficialTeams(){
 const db=desktopOfficialData(),seen=new Set(),arr=[];
 for(const c of Object.values(db?.categories||{})){
  for(const r of c.standings?.[0]?.rows||[]){const n=String(r[1]||'').trim();if(n&&!seen.has(n)){seen.add(n);arr.push(n)}}
  for(const g of c.fixtures||[])for(const r of g.rows||[])for(const n0 of [r[2],r[6]]){const n=String(n0||'').trim();if(n&&!seen.has(n)){seen.add(n);arr.push(n)}}
 }
 return arr;
}
function desktopOfficialTable(){
 return (desktopOfficialData()?.categories?.['3']?.standings?.[0]?.rows||[]).slice(0,11);
}

const stories=[['⚽','Momentos','moments'],['🏆','Jornada','competition'],['📊','Clasificación','standings'],['⭐','Jugador semana','vote'],['🥅','Gol del día','scorers'],['🎥','Vídeos','video'],['👕','Equipos','teams'],['📰','Noticias','news'],['🗓️','Calendario','v4-calendar'],['↔','Fichajes','transfers'],['🎮','Fantasy','fantasy'],['＋','Más','more']];
const menu=[['Partidos','competition'],['Clasificación','standings'],['Liga TV','video'],['Sorteos','predictor'],['Gaming','fantasy'],['Datos','safe-data'],['Equipos','teams'],['Noticias','news'],['Sobre','more'],['Más','more']];
const rb=(label,r)=>`<button type="button" data-desk-route="${r}">${label}</button>`;
function top(){return `<header class="desk-nav"><div class="desk-wrap"><button class="desk-logo" data-desk-route="home"><span class="desk-logo-mark">★</span><span class="desk-logo-text">LIGA<br>JUVENTINO</span></button><nav class="desk-menu">${menu.map(x=>rb(x[0],x[1])).join('')}</nav><button type="button" class="ljpc-header-login" data-desk-route="accountLogin" aria-label="Iniciar sesión">Iniciar sesión <span aria-hidden="true">◉</span></button></div></header>`}
function footer(){return `<footer class="desk-footer"><div class="desk-wrap"><div class="desk-footer-top"><div><div class="desk-logo-text" style="font-size:12px">LIGA JUVENTINO ROSAS</div><p style="font-size:9px;color:var(--lj-muted);max-width:260px">Portal oficial de la liga municipal: partidos, resultados, equipos, noticias, estadísticas, vídeos y herramientas.</p></div><div><h4>DESCUBRE</h4>${rb('Partidos','competition')}${rb('Clasificación','standings')}${rb('Liga TV','video')}${rb('Fantasy','fantasy')}</div><div><h4>INFORMACIÓN</h4>${rb('Equipos','teams')}${rb('Noticias','news')}${rb('Historia','history')}${rb('Datos','safe-data')}</div><div><h4>HERRAMIENTAS</h4>${rb('Calendario','v4-calendar')}${rb('Fichajes','transfers')}${rb('Notificaciones','safe-notifications')}${rb('Más','more')}</div></div><div class="desk-footer-bottom"><span>Modo navegador PC · Liga Juventino Rosas</span><span>La versión móvil y APK mantienen su navegación propia.</span></div></div></footer>`}
function desktopSecondRound(){
 const c=desktopOfficialData()?.categories?.['4'];
 if(!c)return null;
 const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const rows=(c.fixtures||[]).flatMap(x=>x.rows||[]);
 // Excluir resultados confirmados y partidos resueltos administrativamente.
 const upcoming=rows.filter(r=>{
  const d=String(r?.[8]||'').match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2})$/);
  if(!r?.[1]||!d||c.fixture_decisions?.[String(r[0])])return false;
  return d[3]+'-'+d[2]+'-'+d[1]>=today&&!/^\d+$/.test(String(r[3]))&&!/^\d+$/.test(String(r[5]));
 }).sort((a,b)=>{
  const dateKey=r=>String(r[8]||'').replace(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2})$/,(_,day,month,year,time)=>year+month+day+time);
  return dateKey(a).localeCompare(dateKey(b));
 });
 const row=upcoming[0];
 return row?{round:row[1],date:String(row[8]).split(' ')[0]}:null;
}
function fixtureStrip(){const matches=desktopOfficialGames(),second=desktopSecondRound();return `<section class="desk-fixtures"><div class="desk-wrap"><div class="desk-fixtures-row">${matches.map(f=>`<button class="desk-match" data-desk-route="competition"><small>${f.text}</small><b><i class="desk-dot"></i>${f.home}</b><b><i class="desk-dot"></i>${f.away}</b></button>`).join('')}${second?`<button type="button" class="desk-match" data-ljpc-week-second aria-label="Ver partidos de Segunda Fuerza, jornada ${second.round}"><small>SEGUNDA FUERZA · J${second.round}</small><b><i class="desk-dot"></i>${second.date}</b><b>Ver partidos oficiales ›</b></button>`:''}<button class="desk-all" data-desk-route="competition">▣ Ver todos los partidos</button></div></div></section>`}
function home(){if(window.LJR_PC_HOME_V2?.render)return window.LJR_PC_HOME_V2.render({top,footer,desktopOfficialGames,desktopOfficialTeams});return `<div class="desktop-liga" data-desktop-shell="1"><div class="desk-home-top">${top()}${fixtureStrip()}<section><div class="desk-wrap"><div class="desk-stories">${stories.map(s=>`<button class="desk-story" data-desk-route="${s[2]}"><div class="desk-story-media"><span>${s[0]}</span></div><small>${s[1]}</small></button>`).join('')}</div><div class="desk-responsible"><i>5</i><b>CATEGORÍAS DE LA LIGA</b><span>Primera, Intermedia, Segunda, Veteranos 35+ y Veteranos 50+.</span></div><div class="desk-hero-grid"><button class="desk-hero" data-desk-route="news"><div class="desk-hero-copy"><small>PORTADA · LIGA JUVENTINO</small><h1>Consulta las jornadas, resultados y sedes oficiales</h1></div></button><aside class="desk-highlight"><h3>Lo más destacado</h3>${[['⚽','Mira todos los goles de la jornada','video'],['⭐','Elige al Jugador de la Semana','vote'],['🏆','Resultados y clasificación','standings'],['📰','Momentos principales de la liga','news'],['📈','Performance Zone y estadísticas','safe-performance']].map(x=>`<button data-desk-route="${x[2]}"><span class="desk-thumb">${x[0]}</span><b>${x[1]}</b></button>`).join('')}</aside></div></div></section></div><main class="desk-main-dark"><section class="desk-section"><div class="desk-wrap"><div class="desk-section-title"><h2>Momentos</h2><button data-desk-route="moments">Ver todos los momentos ›</button></div><div class="desk-moments">${desktopOfficialTeams().slice(0,7).map((n,i)=>`<button class="desk-moment" data-desk-route="${i%2?'scorers':'vote'}"><em>NEW</em><b>${n}</b></button>`).join('')}</div></div></section><section class="desk-section"><div class="desk-wrap"><div class="desk-section-title"><h2>Noticias y herramientas</h2><button data-desk-route="news">Abrir noticias ›</button></div><div class="desk-news-grid"><button class="desk-news-card feature" data-desk-route="news"><div class="copy"><small>JORNADA</small><b>Consulta avisos oficiales y programación de la liga</b></div></button><button class="desk-news-card" data-desk-route="vote"><div class="copy"><small>ENCUESTA</small><b>¿Quién es tu Jugador de la Semana?</b></div></button><button class="desk-news-card promo" data-desk-route="safe-performance"><div><strong>DATOS</strong><br><span>Ver ahora</span></div></button><button class="desk-news-card wide" data-desk-route="teams"><div class="copy"><small>EQUIPOS</small><b>Planteles, perfiles y estadísticas de clubes</b></div></button></div></div></section><section class="desk-video-band"><div class="desk-wrap"><div class="desk-section"><div class="desk-section-title"><h2>Resúmenes en vídeo</h2><button data-desk-route="video">Ver todos ›</button></div><div class="desk-video-grid">${['Archivo audiovisual de la liga','Vídeos y momentos','Mejores atajadas','Jugadas y asistencias'].map(t=>`<button class="desk-video-card" data-desk-route="video"><div class="desk-video-art">▶</div><div class="meta"><small>Vídeo</small><b>${t}</b></div></button>`).join('')}</div></div><div class="desk-section"><div class="desk-section-title"><h2>Funciones de la liga</h2><button data-desk-route="more">Abrir todas ›</button></div><div class="desk-tools">${[['📅','Calendario','Fechas, resultados y sedes','v4-calendar'],['📊','Datos','Equipos, jugadores y KPIs','safe-data'],['⚡','Performance Zone','Análisis y rendimiento','safe-performance'],['🎯','Predictor','Pronósticos y jornada','predictor'],['🏆','Torneo','Competición y llaves','competition'],['★','Zenith','TV y destacados','video'],['↔','Fichajes','Altas y movimientos','transfers'],['🔔','Notificaciones','Alertas de liga','safe-notifications']].map(x=>`<button class="desk-tool" data-desk-route="${x[3]}"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div></div></div></section></main>${footer()}</div>`}
const pageMeta={
 competition:['PARTIDOS','Partidos y resultados','Consulta jornadas, horarios, sedes y marcadores.'],standings:['CLASIFICACIÓN','Clasificación','Tabla general, puntos, diferencia de goles y posiciones.'],video:['LIGA TV','Vídeos','Resúmenes, goles, entrevistas y contenido destacado.'],predictor:['SORTEOS','Predictor','Pronósticos y participación de la jornada.'],fantasy:['GAMING','Fantasy','Arma tu equipo, consulta puntajes y compite.'],'safe-data':['DATOS','Centro de datos','Estadísticas de equipos, jugadores y competición.'],teams:['EQUIPOS','Equipos','Planteles, perfiles, escudos y rendimiento.'],news:['NOTICIAS','Noticias','Últimas novedades, comunicados y cobertura de la liga.'],history:['HISTORIA','Historia','Campeones, temporadas y archivo histórico.'],more:['MÁS','Más de la liga','Herramientas, credenciales, reglamento y servicios.'],'v4-calendar':['CALENDARIO','Calendario','Fechas, sedes y programación de partidos.'],transfers:['FICHAJES','Fichajes','Altas, bajas y movimientos registrados.'],'safe-performance':['PERFORMANCE','Performance Zone','Análisis de rendimiento y métricas avanzadas.'],'safe-notifications':['NOTIFICACIONES','Notificaciones','Alertas y avisos importantes de la liga.'],moments:['MOMENTOS','Momentos','Goles, jugadas y acciones destacadas.'],vote:['VOTACIÓN','Jugador de la Semana','Participa y consulta candidatos.'],scorers:['GOLEADORES','Goleadores','Ranking de anotadores y estadísticas ofensivas.'],profile:['CUENTA','Perfil','Tu cuenta y preferencias.']};
function pageCards(r){const common=[['📅','Calendario','Consulta la programación completa','v4-calendar'],['📊','Estadísticas','Datos y rendimiento','safe-data'],['👕','Equipos','Planteles y perfiles','teams'],['📰','Noticias','Cobertura y avisos','news'],['🎥','Vídeos','Resúmenes y goles','video'],['🔔','Alertas','Notificaciones importantes','safe-notifications']]; if(r==='competition')return [['⚽','Jornada actual','Partidos y resultados','competition'],['📍','Sedes','Campos y horarios','v4-calendar'],['🏆','Tabla','Clasificación general','standings'],...common.slice(2)]; if(r==='teams')return [['👕','Clubes','Todos los equipos','teams'],['🪪','Credenciales','Jugadores registrados','more'],['📈','Rendimiento','Datos por club','safe-performance'],...common.slice(0,3)]; return common}
function tableFor(r){if(r==='standings')return `<table class="desk-table"><thead><tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>PTS</th><th>DG</th></tr></thead><tbody>${desktopOfficialTable().map(x=>`<tr><td><span class="desk-chip">${x[0]}</span></td><td>${x[1]}</td><td>${x[2]}</td><td>${x[9]}</td><td>${x[8]}</td></tr>`).join('')}</tbody></table>`;if(r==='competition'||r==='v4-calendar')return `<table class="desk-table"><thead><tr><th>Fecha</th><th>Local</th><th>Hora</th><th>Visitante</th><th>Sede</th></tr></thead><tbody>${desktopOfficialGames(5).map(x=>`<tr><td>${x.text}</td><td>${x.home}</td><td>${x.time}</td><td>${x.away}</td><td>${x.field}</td></tr>`).join('')}</tbody></table>`;return ''}
function generic(r){const m=pageMeta[r]||pageMeta.more;return `<div class="desktop-page-shell" data-desktop-shell="1">${top()}${fixtureStrip()}<main><section class="desk-page-hero"><div class="desk-wrap"><div class="desk-page-kicker">${m[0]}</div><h1>${m[1]}</h1><p>${m[2]}</p></div></section><section><div class="desk-wrap"><div class="desk-page-grid">${pageCards(r).map(x=>`<button class="desk-page-card" data-desk-route="${x[3]}"><span>${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></button>`).join('')}</div>${tableFor(r)}</div></section></main>${footer()}</div>`}
function pcExactFixtures(){
 const getLogo=(name)=>{
  try{
   let src=window.LJR_OFFICIAL_API?.getLogo?.(name)||window.V66_OFFICIAL_DIRECTORY?.logoFor?.(name)||window.LJR_TEAM_LOGOS?.get?.(name)||'';
   if(!src){const logos=window.LJR_OFFICIAL_DATA?.team_logos||{};src=logos[name]||''}
   src=String(src||'').trim();
   if(src.startsWith('assets/')||src.startsWith('public/'))src='./'+src;
   return (src.startsWith('https://')||src.startsWith('http://')||src.startsWith('./')||src.startsWith('/'))?src:'';
  }catch(_){return ''}
 };
 return desktopOfficialGames(6).map(g=>({...g,homeLogo:getLogo(g.home),awayLogo:getLogo(g.away)}));
}
function pcExactFrame(){return host()?.querySelector('#ljpc-exact-html-home')}
function syncPCExactFixtures(){
 const frame=pcExactFrame();
 if(!frame?.contentWindow)return;
 frame.contentWindow.postMessage({ljpcExact:true,kind:'fixtures',fixtures:pcExactFixtures()},location.origin);
}
/* El encabezado neón pertenece al móvil. En PC sólo se conserva la cabecera
 * #ljpc-unified-pc-header y su barra funcional de navegación/partidos. */
function hideNativeMobileHeader(){
 if(!desktop())return;
 const topbar=document.querySelector('#app > header.topbar');
 if(!topbar)return;
 topbar.style.setProperty('display','none','important');
 topbar.style.setProperty('height','0px','important');
 topbar.style.setProperty('min-height','0px','important');
 topbar.style.setProperty('max-height','0px','important');
 topbar.style.setProperty('visibility','hidden','important');
 topbar.setAttribute('aria-hidden','true');
 topbar.inert=true;
 // Retirarlo del DOM del escritorio: el estilo V7 vuelve a forzar
 // display:block!important durante los cambios de ruta/altura.
 topbar.remove?.();
}
let nativeHeaderObserver=null;
function watchNativeMobileHeader(){
 if(!desktop()||nativeHeaderObserver||typeof MutationObserver==='undefined')return;
 const app=document.getElementById('app');
 if(!app)return;
 // Sólo hijos directos; observar todo #screen provocaría lag al hacer scroll.
 nativeHeaderObserver=new MutationObserver(()=>{
  if(app.querySelector(':scope > header.topbar'))hideNativeMobileHeader();
 });
 nativeHeaderObserver.observe(app,{childList:true});
}
function render(){
 if(!desktop())return;
 document.body.classList.add('lj-desktop');
 document.documentElement.classList.toggle('ljpc-forced-desktop',mode()==='desktop');
 hideNativeMobileHeader();
 const h=host();if(!h)return;
 watchNativeMobileHeader();
 const r=route();
 if(window.LJR_PC_NATIVE_ROUTES?.has(r))return;
 if(r==='home'){
  if(!pcExactFrame()){
   h.innerHTML='<iframe id="ljpc-exact-html-home" title="Inicio PC de Liga Juventino Rosas" loading="eager" scrolling="no" src="./pc-exact-original-20261011.html?v=20261012-tight-layout-v3&stableheight=v5" style="display:block;width:100%;height:900px;min-height:0;border:0;outline:0;background:#040c1c;overflow-anchor:none" referrerpolicy="same-origin"></iframe>';
   const frame=pcExactFrame();
   if(frame)frame.addEventListener('load',syncPCExactFixtures,{once:true});
  }else syncPCExactFixtures();
  return;
 }
 h.innerHTML=generic(r);
}
/* Chrome Android desktop mode: scroll the active vertical container. */
function scrollDesktopFlow(delta){
 const root=document.scrollingElement||document.documentElement;
 const candidates=[root,document.getElementById('app'),document.getElementById('screen')];
 const direction=Math.sign(delta);
 for(const box of candidates){
  if(!box)continue;
  const limit=Math.max(0,box.scrollHeight-box.clientHeight);
  if(limit<2)continue;
  const before=box.scrollTop;
  const target=Math.max(0,Math.min(limit,before+delta));
  // Do not treat an overflow-clipped ancestor as a successful scroll owner.
  if(direction>0&&target<=before+0.5 || direction<0&&target>=before-0.5)continue;
  box.scrollTop=target;
  if(Math.abs(box.scrollTop-before)>0.5)return;
 }
 window.scrollBy({left:0,top:delta,behavior:'instant'});
}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||!desktop()||route()!=='home'||!e.data?.ljpcExact)return;
 const frame=pcExactFrame();
 if(!frame||e.source!==frame.contentWindow)return;
 if(e.data.kind==='height'){
  const height=Number(e.data.height);
  if(Number.isFinite(height)&&height>=300&&height<30000){
   // Iframe reports ONLY the natural height of its PC content. Never add
   // extra pixels on each resize or create an unbounded feedback loop.
   const target=Math.ceil(height);
   const prior=parseFloat(frame.style.height)||0;
   if(Math.abs(target-prior)>4)frame.style.height=target+'px';
  }
 }else if(e.data.kind==='ready')syncPCExactFixtures();
 else if(e.data.kind==='pan'){
  // El iframe de portada utiliza altura dinámica y no tiene scroll propio.
  // Transferir sólo sus gestos verticales; las listas horizontales se deslizan
  // dentro del propio iframe, sin alterar el móvil ni el APK.
  const dy=Number(e.data.dy);
  if(Number.isFinite(dy)&&Math.abs(dy)<=300){
   scrollDesktopFlow(dy);
  }
 }
 else if(e.data.kind==='route'&&/^[a-zA-Z0-9_-]+$/.test(String(e.data.route||'')))go(e.data.route);
});
function click(e){const b=e.target.closest('[data-desk-route]');if(!b)return;e.preventDefault();go(b.dataset.deskRoute)}
document.addEventListener('click',click);window.addEventListener('hashchange',()=>setTimeout(render,0));let t;let lastOuterWidth=innerWidth;
window.addEventListener('resize',()=>{
 const nextWidth=innerWidth;
 // Chrome Android may change viewport HEIGHT while scrolling. Do not rerender.
 if(Math.abs(nextWidth-lastOuterWidth)<3)return;
 lastOuterWidth=nextWidth;
 clearTimeout(t);
 t=setTimeout(()=>{if(desktop())render();else if(document.body.classList.contains('lj-desktop'))location.reload()},160);
});setTimeout(render,0);
window.addEventListener('ljr:desktop-home-request',()=>{if(desktop()&&route()==='home')render()});
window.addEventListener('ljr:official-data',()=>{if(desktop()&&route()==='home')syncPCExactFixtures()});
})();
