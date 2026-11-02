/* PC global feature parity: works with the already-installed desktop shell and real app views. */
(function(){
'use strict';
if(window.__LJR_PC_RUNTIME_V975__)return;
window.__LJR_PC_RUNTIME_V975__=true;
const route=()=>String(location.hash||'').replace('#/','').replace('#','').split('?')[0]||'home';
const mode=()=>new URLSearchParams(location.search).get('mode')||'';
const desktop=()=>!['mobile','apk'].includes(mode())&&(mode()==='desktop'||document.body.classList.contains('lj-desktop')||innerWidth>=1024);
const go=r=>{location.hash='#/'+r};
const toolGroups=[
  [
    "Partidos, jornadas y estadísticas",
    [
      ["⚽","Partidos y resultados","pc-fixtures","Jornadas de las cinco categorías"],
      ["🏆","Clasificación","pc-standings","Tablas oficiales por categoría"],
      ["🥅","Máximos goleadores","pc-scorers","Ranking de jugadores"],
      ["📅","Calendario PC","pc-calendar","Partidos, Google Calendar y compartir"],
      ["🌐","Reporte semanal","v38Weekly","Horarios, sedes y descarga"],
      ["🏟️","Centro de Jornada","matchday","Partidos destacados y sedes oficiales"],
      ["🎥","Match Center","v4-matchcenter","Ficha e información del partido"],
      ["🧩","Cuadro de liguilla","bracketBuilder","Crear y exportar cuadros"],
      ["📊","Descargar tablas","tableExport","Exportaciones de competición"],
      ["🗺️","Sedes y cómo llegar","venues","Campos reales y enlaces de Maps"]
    ]
  ],
  [
    "Equipos, jugadores y comunidad",
    [
      ["🛡️","Equipos de la liga","teams","Clubes y escudos"],
      ["⭐","Equipos seguidos","following","Favoritos de equipos"],
      ["👤","Jugadores","players","Plantillas y perfiles"],
      ["⚖️","Comparar jugadores","playerCompare","Estadísticas de dos jugadores"],
      ["↔️","Comparar equipos","pc-team-compare","Análisis entre clubes"],
      ["🔄","Fichajes","transfers","Altas y movimientos"],
      ["📋","Reclutamiento","recruitment","Registro y selección de equipos"],
      ["📈","Estadísticas oficiales","v38Stats","Datos de la temporada"],
      ["📰","Noticias y avisos","notices","Avisos disponibles públicamente"],
      ["📚","Historia de la liga","history","Campeones y temporadas"]
    ]
  ],
  [
    "Multimedia, predicciones y herramientas",
    [
      ["📺","Liga TV","video","Transmisiones y vídeos"],
      ["🎬","Momentos","moments","Galería de fútbol"],
      ["🎮","Fantasy","fantasy","Arma tu equipo"],
      ["🎯","Quiniela","quiniela","Pronostica partidos"],
      ["🔮","Pronostica seis","predictorSix","Predicciones de la jornada"],
      ["🧠","Quiz Arena","quizArena","Preguntas y competición"],
      ["⚖️","Más o Menos","moreLess","Juego de comparaciones"],
      ["⭐","Jugador de la semana","vote","Participación de la comunidad"],
      ["🌦️","Clima y canchas","weatherFields","Pronóstico y campos"],
      ["☁️","Avisos de clima","v38Weather","Información meteorológica"],
      ["🔔","Notificaciones","pc-notifications","Preferencias de avisos"],
      ["📖","Reglamento","rulebook","Consultar las reglas"],
      ["📲","Instalar la aplicación","appInstall","Acceso directo, Android e iPhone"],
      ["🛍️","Tienda de clubes","club-store","Productos y clubes"]
    ]
  ],
  [
    "Administración y documentos · acceso autorizado",
    [
      ["🛠️","JR Control","jrControl","Panel de administración"],
      ["📋","Administración de Liga","ligaControl","Controles de la liga"],
      ["📑","Cédulas oficiales","cedulas","Consultar documentos y partidos"],
      ["🪪","Constructor de credenciales","credentialBuilder","Vista previa y exportación"],
      ["🧾","Crear cédula","cedulaBuilder","Herramienta de cédulas"],
      ["📚","Archivo arbitral","refereeOffline","Cédulas sin conexión"],
      ["👥","Juntas y acuerdos","tool:meeting","Asistencia, votaciones y seguimiento"],
      ["🤝","Patrocinadores","tool:sponsors","Contratos y administración local"],
      ["🚩","Incidencias","tool:incidents","Bitácora por partido"],
      ["👨‍⚖️","Árbitros y oficiales","tool:officials","Designaciones y directorio"],
      ["🟥","Sanciones y expedientes","tool:new-sanction","Borradores disciplinarios"],
      ["🏅","Estudio de MVP","tool:motm","Jugador del partido"],
      ["🧑‍💼","Delegados","tool:delegates","Encargados de equipos"],
      ["🗓️","Cambios de jornada","scheduleChanges","Horarios y sedes"],
      ["🔔","Avisos oficiales","publicationCenter","Publicaciones con permisos"],
      ["📁","Permisos y archivos","permissionBuilder","Gestión documentaria"],
      ["📅","Agenda administrativa","agendaBuilder","Juntas y recordatorios"],
      ["🗳️","Encuestas","tool:poll","Participación y acuerdos"],
      ["💾","Respaldo de registros","tool:backup-export","Descarga manual autorizada"],
      ["🔎","Auditoría","tool:audit","Revisión de cambios"],
      ["👤","Mi cuenta","accountLogin","Acceso real a la cuenta"]
    ]
  ]
];
const parityAdditions=[
 ["Herramientas recientes de móvil · también en navegador",[
  ["🛠️","Centro de Herramientas APK","leagueTools","Todas las funciones de móvil y APK por categoría"],
  ["📐","Tácticas (Pizarra 2D)","tactics","Pizarra 2D para formaciones y alineaciones"],
  ["🎬","Jornada animada","motionHub","Vista dinámica para presentar la jornada"],
  ["⚠️","Aviso de suspensión","suspensionTool","Generador de avisos de jornada suspendida"],
  ["⏰","Avisos AUTO","v38Alerts","Programar avisos automáticos con fecha y hora"],
  ["🟨","Tarjetas y castigados","discipline","Disciplina, amarillas, rojas y sanciones"],
  ["🔍","Buscador general","search","Buscar equipos, jugadores, partidos y campos"],
  ["📲","Código QR de la App","ligaQR","QR y opciones de descarga de la aplicación"],
  ["📝","Estudio de contenido","publicationCenter","Plantillas, publicaciones y recursos"],
  ["🎨","Editor visual y CMS","jrControl","Herramientas autorizadas de edición y vista previa"],
  ["👥","Rankings comunitarios","rankings","Clasificaciones y participación de jugadores"],
  ["📺","Vídeo en ventana flotante","video","Reproductor y Picture in Picture"],
  ["📣","Avisos y encuestas","publicationCenter","Publicaciones y formularios"],
  ["🧩","Preparar mi jornada","matchday","Calendario, partidos y preparación"],
  ["📊","Auditoría y revisión","tool:audit","Herramientas de datos oficiales"],
  ["💼","Inscripciones y registros","recruitment","Registro y convocatorias"],
  ["🏟️","Campos y condiciones","weatherFields","Pronóstico y canchas"],
  ["🖼️","Descargas y publicaciones","publications","Imágenes y archivos"]
 ]]
];
toolGroups.push(...parityAdditions);
const ADMIN_PC_TOOLS=new Set(['meeting','sponsors','incidents','officials','new-sanction','motm','delegates','poll','backup-export','audit']);
function openPCAdminTool(name){
 if(!ADMIN_PC_TOOLS.has(name))return;
 const media=window.LJR_MEDIA;
 const open=()=>{
  if(!window.LJR_MEDIA?.admin)return;
  try{
   if(typeof window.LJR_V105_OPEN_TOOL==='function'&&window.LJR_V105_OPEN_TOOL(name))return;
   const fallback={incidents:()=>window.LJR_INCIDENTS_PRO?.open?.(),motm:()=>window.LJR_MOTM_STUDIO?.open?.(),'new-sanction':()=>window.LJR_V1130_SANCTIONS_OPEN?.()};
   if(typeof fallback[name]==='function' && (
    (name==='incidents'&&typeof window.LJR_INCIDENTS_PRO?.open==='function')||
    (name==='motm'&&typeof window.LJR_MOTM_STUDIO?.open==='function')||
    (name==='new-sanction'&&typeof window.LJR_V1130_SANCTIONS_OPEN==='function'))){fallback[name]();return}
  }catch(err){console.error('[PC tools] No se pudo abrir la herramienta',name,err)}
  go('ligaControl');
 };
 if(media?.admin){open();return}
 if(typeof media?.login==='function')media.login(()=>{if(window.LJR_MEDIA?.admin)open()});
 else go('ligaControl');
}

function renderTools(){
 const screen=document.getElementById('screen');if(!screen)return;
 if(screen.querySelector('[data-pc-tools-hub]'))return;
 let page=screen.querySelector(':scope > .ds-page');
 let host=page?.querySelector('.ds-content > .ds-wrap');
 if(!host){
  host=document.createElement('div');
  host.className='ds-wrap ljpc-direct-tools-host';
  screen.appendChild(host);
 }
 const h=page?.querySelector('.ds-pagehead h1');if(h)h.textContent='Herramientas PC';
 const p=page?.querySelector('.ds-pagehead p');if(p)p.textContent='Funciones actualizadas de móvil y PC, con permisos y datos oficiales compartidos.';
 const wrapper=document.createElement('div');
 wrapper.className='ljpc-toolhub';
 wrapper.setAttribute('data-pc-tools-hub','');
 wrapper.innerHTML='<div class="ljpc-hub-head"><span>🖥️ CENTRO COMPLETO DE HERRAMIENTAS DE ESCRITORIO Y APK</span><p>Accede a las 65+ funciones reales de la liga en computadora en formato horizontal UEFA (1392px). Las herramientas de administración requieren sesión; los borradores locales no se publican automáticamente.</p></div><div class="ljpc-hub-controls"><label for="ljpc-tools-find">Buscar funciones de la liga</label><input id="ljpc-tools-find" data-ljpc-tools-find type="search" autocomplete="off" placeholder="Buscar calendario, equipos, quiniela, credenciales, tácticas, cédulas…" aria-controls="ljpc-tool-list"><span data-ljpc-tools-counter></span></div><div id="ljpc-tool-list">'+
 toolGroups.map(([title,tools])=>'<section class="ljpc-hub-group"><h2>'+title+'</h2><div class="ljpc-hub-grid">'+
 tools.map(([symbol,label,r,desc])=>'<button class="ljpc-hub-btn" type="button" data-ljpc-hub-route="'+r+'" title="'+desc+'"><span aria-hidden="true">'+symbol+'</span><span class="ljpc-hub-copy"><b>'+label+'</b><small>'+desc+'</small></span><i aria-hidden="true">›</i></button>').join('')+'</div></section>').join('')+'</div><p class="ljpc-hub-empty" data-ljpc-tools-empty hidden>No hay herramientas con ese nombre. Prueba otro término.</p>';
 host.appendChild(wrapper);
 const field=wrapper.querySelector('[data-ljpc-tools-find]');
 const buttons=[...wrapper.querySelectorAll('[data-ljpc-hub-route]')];
 const counter=wrapper.querySelector('[data-ljpc-tools-counter]');
 const empty=wrapper.querySelector('[data-ljpc-tools-empty]');
 const normalize=t=>String(t||'').toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function filter(){
  const term=normalize(field?.value).trim();
  let matches=0;
  buttons.forEach(b=>{const visible=!term||normalize(b.textContent).includes(term);b.hidden=!visible;if(visible)matches++});
  wrapper.querySelectorAll('.ljpc-hub-group').forEach(g=>{g.hidden=![...g.querySelectorAll('.ljpc-hub-btn')].some(b=>!b.hidden)});
  if(counter)counter.textContent=matches+' funciones';
  if(empty)empty.hidden=matches!==0;
 }
 field?.addEventListener('input',filter);
 filter();
}
function restoreNative(){
 const name=route();if(!desktop()||!window.LJR_PC_NATIVE_ROUTES?.has(name))return;
 const screen=document.getElementById('screen'),api=window.LJR_MAIN_ROUTE;
 if(!screen||!api?.render)return;
 const overwritten=screen.querySelector(':scope > [data-desktop-shell],:scope > [data-ds-page],:scope > [data-lj-special]');
 if(!overwritten)return;
 api.state.route=name;
 api.render();
}
const css=`
body.ljpc-native-route #screen{box-sizing:border-box!important;width:min(1392px,calc(100% - 48px))!important;max-width:1392px!important;margin:0 auto!important;padding:20px 0 45px!important;overflow:visible!important;background:transparent!important}
body.ljpc-native-route{background:radial-gradient(circle at 55% -220px,#0c448b 0%,#081b47 450px,#06132e 100%) fixed!important;color:#eaf5ff!important}
body.ljpc-native-route #app>.topbar,body.ljpc-native-route #app>.bottom-nav{display:none!important}
body.ljpc-native-route #screen *{box-sizing:border-box}
.ljpc-toolhub{width:min(1392px,calc(100% - 48px));max-width:1392px;margin:18px auto 28px;padding:24px 28px;background:#ffffff;border:1px solid #dce3f0;border-radius:16px;box-shadow:0 12px 32px rgba(7,14,61,.08)}
.ljpc-hub-head{background:linear-gradient(110deg,#0438f0 0%,#03229c 55%,#010e54 100%);color:#fff;border:1px solid rgba(0,229,255,.28);padding:24px 28px;border-radius:14px;margin:0 0 22px}
.ljpc-hub-head>span{font-size:12px;letter-spacing:.12em;font-weight:900;color:#00e5ff}
.ljpc-hub-head p{font-size:14.5px;line-height:1.5;margin:8px 0 0;color:#e0ecff}
.ljpc-hub-group{margin:0 0 26px}
.ljpc-hub-group h2{font-size:20px!important;font-weight:850;color:#070e3d;margin:0 0 14px}
.ljpc-hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}
.ljpc-hub-btn{display:flex;gap:14px;align-items:center;min-height:76px;width:100%;padding:14px 18px!important;border:1px solid #d5dfef!important;border-radius:12px!important;background:#fff!important;color:#070e3d!important;text-align:left!important;cursor:pointer!important;box-shadow:0 4px 14px rgba(7,14,61,.05)}
.ljpc-hub-btn:hover{background:#f4f8ff!important;border-color:#0438f0!important;transform:translateY(-1px)}
.ljpc-hub-btn>span:first-child{font-size:26px;flex:0 0 36px;display:grid;place-items:center}.ljpc-hub-btn .ljpc-hub-copy{display:flex;flex-direction:column;min-width:0;flex:1;gap:4px}.ljpc-hub-btn b{font-size:15.5px;font-weight:800;line-height:1.25;color:#070e3d}.ljpc-hub-btn small{font-size:13px;line-height:1.35;color:#526080;font-style:normal;overflow-wrap:anywhere}.ljpc-hub-btn i{font-size:22px;font-style:normal;color:#0438f0;font-weight:800}
.ljpc-hub-controls{display:flex;align-items:center;flex-wrap:wrap;gap:14px;margin:0 0 22px;padding:16px 20px;border:1px solid #c9def0;border-radius:12px;background:#f4f7ff}
.ljpc-hub-controls label{font:800 14px Inter,system-ui;color:#070e3d}
.ljpc-hub-controls input{flex:1 1 280px;min-width:0;min-height:44px;padding:10px 16px;border:1px solid #b5cfe8;border-radius:10px;color:#070e3d;background:#fff;font:600 14.5px Inter,system-ui}
.ljpc-hub-controls [data-ljpc-tools-counter]{font:800 13.5px Inter,system-ui;color:#0438f0}
.ljpc-hub-empty{font:650 14.5px Inter,system-ui;color:#597597;padding:20px}
.ljpc-hub-group[hidden],.ljpc-hub-btn[hidden],.ljpc-hub-empty[hidden]{display:none!important}
`;
function injectCss(){
 if(document.getElementById('ljpc-runtime-css'))return;
 const style=document.createElement('style');style.id='ljpc-runtime-css';style.textContent=css;document.head.appendChild(style);
}
function sync(){if(!desktop())return;injectCss();if(['pc-tools','more'].includes(route()))renderTools();else restoreNative()}
document.addEventListener('click',e=>{
 const hit=e.target instanceof Element?e.target.closest('[data-ljpc-hub-route]'):null;
 if(!hit||!desktop())return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const destination=String(hit.dataset.ljpcHubRoute||'');
 if(destination.startsWith('tool:'))openPCAdminTool(destination.slice(5));
 else if(destination==='accountLogin')go('accountLogin');
 else go(destination);
},true);
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync()})}
function boot(){
 injectCss();sync();
 const app=document.getElementById('app')||document.body;
 new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
}
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
