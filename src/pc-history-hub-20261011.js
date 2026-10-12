/* Desktop-only Historia hub: categories and archival subcategories.
   Never changes the original mobile Historia, routes or styles. */
(function(){
'use strict';
if(window.__LJPC_HISTORY_HUB_20261011__)return;
window.__LJPC_HISTORY_HUB_20261011__=true;
const KEY='ljpc-history-pc-tab';
const MODE=()=>new URLSearchParams(location.search).get('mode')||'';
const pc=()=>!['mobile','apk'].includes(MODE())&&(MODE()==='desktop'||innerWidth>=1024);
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sections=['equipos','noticias','historia','sobre'];
const subs=['temporadas','estadisticas','videos','historicos','titulos'];
const seasons=[
 ['2025/26','Linces'],['2024/25','Galácticos de Pozos'],['2023/24','Linces'],
 ['2022/23','Juventus'],['2021/22','Juventus'],['2020/21','La Esperanza'],
 ['2019/20','Juventus'],['2018/19','Juventus'],['2017/18','Tecos'],
 ['2016/17','Real DHP'],['2015/16','La Esperanza'],['2014/15','Boavista'],
 ['2013/14','La Esperanza'],['2012/13','Real Cerrito de Gasca']
];
/* Entries come from the documented v115 history archive, not standings. */
const trophies=[
 ['19 sep 2026','Deportivo CG','Liga y Campeón de Campeones · Veteranos 35+'],
 ['15 mar 2026','Linces','Campeón de Liga · Primera Fuerza'],
 ['10 may 2026','Franco FC','Campeón de Liga · Intermedia'],
 ['08 nov 2025','La Esperanza','Campeón · Veteranos 50+'],
 ['21 sep 2024','Juventus','Campeón de Campeones']
];
function link(text,r,desc){
 return '<button class="ljpc-h-link" type="button" data-ds-route="'+esc(r)+'"><strong>'+esc(text)+'</strong>'+
 (desc?'<small>'+esc(desc)+'</small>':'')+'<span aria-hidden="true">›</span></button>';
}
function tab(name,text,sub){
 return '<button type="button" class="ljpc-h-tab" data-ljpc-h-'+(sub?'sub':'section')+'="'+name+'" aria-selected="false">'+text+'</button>';
}
function teamRows(){
 const db=window.LJR_OFFICIAL_DATA||window.LJR_OFFICIAL_API?.getData?.();
 const names=new Set();
 Object.values(db?.categories||{}).forEach(c=>{
  (c?.standings?.[0]?.rows||[]).forEach(r=>{if(r?.[1])names.add(String(r[1]).trim())});
 });
 const clubs=Array.from(names).filter(Boolean).sort((a,b)=>a.localeCompare(b,'es')).slice(0,16);
 if(!clubs.length)return '<p class="ljpc-h-note">Consulta los equipos registrados y sus categorías en el directorio oficial.</p>';
 return '<div class="ljpc-h-teams">'+clubs.map(n=>'<div class="ljpc-h-club" title="'+esc(n)+'"><span aria-hidden="true">⚽</span><span>'+esc(n)+'</span></div>').join('')+'</div>';
}
function markup(){
 return '<section id="ljpc-pc-history-hub" class="ljpc-h-hub" aria-label="Historia de la liga en PC">'+
 '<div class="ljpc-h-heading"><div><small>ARCHIVO · LIGA JUVENTINO ROSAS</small><h2>Historia de nuestra liga</h2><p>Equipos, noticias, temporadas, campeones y toda la información de la competición.</p></div><span aria-hidden="true">🏆</span></div>'+
 '<nav class="ljpc-h-main-tabs" aria-label="Apartados de Historia">'+
 tab('equipos','Equipos',false)+tab('noticias','Noticias',false)+tab('historia','Historia',false)+tab('sobre','Sobre',false)+'</nav>'+
 '<section class="ljpc-h-section" data-ljpc-h-panel="equipos" hidden><div class="ljpc-h-row"><h3>Equipos</h3><p>Clubes de las categorías oficiales de la temporada actual.</p></div>'+teamRows()+
 link('Ver todos los equipos','teams','Perfiles, escudos y categorías')+
 link('Comparar equipos','compareTeams','Consultar información de clubes')+'</section>'+
 '<section class="ljpc-h-section" data-ljpc-h-panel="noticias" hidden><div class="ljpc-h-row"><h3>Noticias</h3><p>Publicaciones y avisos de la Liga Juventino Rosas.</p></div>'+
 '<div class="ljpc-h-links">'+link('Noticias de la liga','news','Actualidad y comunicados')+
 link('Avisos oficiales','notices','Cambios importantes de las jornadas')+
 link('Publicaciones','publications','Contenido publicado por la liga')+'</div></section>'+
 '<section class="ljpc-h-section" data-ljpc-h-panel="historia"><div class="ljpc-h-row"><h3>Historia</h3><p>Archivo documental desde 2012. Los registros sin respaldo no se completan con cifras inventadas.</p></div>'+
 '<nav class="ljpc-h-sub-tabs" aria-label="Secciones de historia">'+
 tab('temporadas','Temporadas',true)+tab('estadisticas','Estadísticas históricas',true)+
 tab('videos','Vídeos',true)+tab('historicos','Equipos',true)+tab('titulos','Más títulos',true)+'</nav>'+
 '<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="temporadas"><h4>Campeones por temporada</h4><div class="ljpc-h-seasons">'+
 seasons.map(x=>'<div class="ljpc-h-season"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong></div>').join('')+'</div>'+
 '<p class="ljpc-h-note">Temporadas registradas en el archivo histórico de la aplicación. Consulta las fichas y fotografías conservadas por la liga.</p></div>'+
 '<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="estadisticas" hidden><h4>Estadísticas históricas</h4>'+
 '<div class="ljpc-h-links">'+link('Historial de partidos','historyLog','Resultados históricos documentados')+
 link('Estadísticas oficiales','pc-data','Datos disponibles de las categorías actuales')+
 link('Clasificación','pc-standings','Tablas de la temporada')+'</div>'+
 '<p class="ljpc-h-note">Las estadísticas históricas se muestran únicamente cuando hay registros oficiales disponibles.</p></div>'+
 '<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="videos" hidden><h4>Vídeos del archivo</h4><div class="ljpc-h-links">'+
 link('Liga TV','video','Vídeos y transmisiones publicados')+
 link('Momentos','moments','Jugadas, goles y recuerdos')+'</div></div>'+
 '<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="historicos" hidden><h4>Equipos del archivo histórico</h4>'+
 '<p class="ljpc-h-note">Los clubes que aparecen en los archivos de 2012 a 2026 no deben confundirse con los inscritos de la temporada actual.</p>'+
 '<div class="ljpc-h-teams">'+['Juventus','Boavista','Linces','La Esperanza','Tecos','Real Cerrito de Gasca','Galácticos de Pozos','Franco FC'].map(x=>'<div class="ljpc-h-club"><span aria-hidden="true">⚽</span><span>'+esc(x)+'</span></div>').join('')+'</div>'+
 link('Consultar equipos activos','teams','Directorio de la temporada actual')+'</div>'+
 '<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="titulos" hidden><h4>Más títulos y campeones</h4><div class="ljpc-h-trophies">'+
 trophies.map(x=>'<div class="ljpc-h-trophy"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong><span>'+esc(x[2])+'</span></div>').join('')+'</div>'+
 '<p class="ljpc-h-note">Selección del archivo aportado a la liga; no es un listado exhaustivo de palmarés.</p></div>'+
 '</section>'+
 '<section class="ljpc-h-section" data-ljpc-h-panel="sobre" hidden><div class="ljpc-h-row"><h3>Sobre</h3><p>Información institucional, reglamentos y sedes.</p></div><div class="ljpc-h-links">'+
 link('Sobre la Liga Juventino Rosas','about','Historia, organización y categorías')+
 link('Reglamento','rulebook','Consulta las reglas de la competición')+
 link('Campos y sedes','venues','Ubicaciones de los partidos')+'</div></section>'+
 '</section>';
}
function saved(){try{return sessionStorage.getItem(KEY)||'historia'}catch(_){return 'historia'}}
function choose(name){
 if(!pc()||route()!=='history')return;
 const hub=document.getElementById('ljpc-pc-history-hub');if(!hub)return;
 const inSub=subs.includes(name),main=inSub?'historia':sections.includes(name)?name:'historia';
 const sub=inSub?name:'temporadas';
 hub.querySelectorAll('[data-ljpc-h-section]').forEach(el=>{
  const active=el.dataset.ljpcHSection===main;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));
 });
 hub.querySelectorAll('[data-ljpc-h-panel]').forEach(el=>{el.hidden=el.dataset.ljpcHPanel!==main});
 hub.querySelectorAll('[data-ljpc-h-sub]').forEach(el=>{
  const active=el.dataset.ljpcHSub===sub;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));
 });
 hub.querySelectorAll('[data-ljpc-h-subpanel]').forEach(el=>{el.hidden=el.dataset.ljpcHSubpanel!==sub});
 try{sessionStorage.setItem(KEY,name)}catch(_){}
}
function mount(){
 if(!pc()||route()!=='history')return;
 const wrap=document.querySelector('#screen .ds-page .ds-content .ds-wrap');
 if(!wrap)return;
 if(!wrap.querySelector('#ljpc-pc-history-hub'))wrap.innerHTML=markup();
 choose(saved());
}
let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;mount()})}
document.addEventListener('click',e=>{
 if(!pc()||route()!=='history'||!(e.target instanceof Element))return;
 const tab=e.target.closest('#ljpc-pc-history-hub [data-ljpc-h-section],#ljpc-pc-history-hub [data-ljpc-h-sub]');
 if(!tab)return;
 e.preventDefault();choose(tab.dataset.ljpcHSection||tab.dataset.ljpcHSub);
});
window.addEventListener('ljpc:history-select',e=>{if(pc())choose(e.detail?.section||'historia')});
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',()=>{if(pc()&&route()==='history'){const hub=document.getElementById('ljpc-pc-history-hub');if(hub){const group=hub.querySelector('[data-ljpc-h-panel="equipos"]');if(group){const list=group.querySelector('.ljpc-h-teams');if(list){const temp=document.createElement('div');temp.innerHTML=teamRows();const fresh=temp.querySelector('.ljpc-h-teams');if(fresh)list.replaceWith(fresh)}}}}});
function boot(){schedule();const screen=document.getElementById('screen');if(screen)new MutationObserver(schedule).observe(screen,{subtree:false,childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
