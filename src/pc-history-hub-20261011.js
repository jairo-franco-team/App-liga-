/* Desktop-only Historia & Más hub + statistics/clubs (1392px).
   Never changes the original mobile Historia, routes or styles. */
(function(){
'use strict';
if(window.__LJPC_HISTORY_HUB_20261011__)return;
window.__LJPC_HISTORY_HUB_20261011__=true;
const KEY='ljpc-history-pc-tab';
const BASE='https://raw.githubusercontent.com/jairofrancog7-star/Liga_Futbol/main/';
const CAT={'3':'Primera Fuerza','5':'Intermedia','4':'Segunda Fuerza','2':'Veteranos 35+','1':'Veteranos 50+'};
const MODE=()=>new URLSearchParams(location.search).get('mode')||'';
const pc=()=>!['mobile','apk'].includes(MODE())&&(MODE()==='desktop'||innerWidth>=1024);
const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const sections=['equipos','noticias','historia','sobre'];
const subs=['temporadas','clubes','estadisticas','videos','historicos','titulos'];
const state={teamsQuery:'',activeVideo:0,clubCat:'3',clubMetric:'clave'};

const CLUB_METRICS=[
 ['clave','Estadísticas clave'],
 ['goles','Goles'],
 ['ataque','Ataque'],
 ['defensa','Defensa'],
 ['porteria','Portería'],
 ['disciplina','Disciplina']
];

const FALLBACK_STANDINGS={
 '3':[
  [1,'Linces',8,6,0,2,19,8,11,18],
  [2,'San José FC',8,5,1,2,17,10,7,16],
  [3,'Juventus',8,5,1,2,26,14,12,16],
  [4,'Herreras FC',8,4,2,2,15,11,4,14],
  [5,'Hermanos',8,4,1,3,16,12,4,13],
  [6,'Lobos CDG',9,4,1,4,14,15,-1,13],
  [7,'Galácticos de Pozos',8,3,2,3,13,13,0,11],
  [8,'Real DHP',8,3,1,4,11,14,-3,10]
 ],
 '5':[
  [1,'La Canchita Deportes',8,6,1,1,22,9,13,19],
  [2,'La Cuadrilla',8,5,2,1,24,11,13,17],
  [3,'Franco FC',8,5,1,2,18,10,8,16],
  [4,'Promesas FC',8,4,2,2,15,12,3,14],
  [5,'San Antonio Jrs',8,4,1,3,14,13,1,13],
  [6,'Atl. Galeana',8,3,2,3,12,13,-1,11]
 ],
 '4':[
  [1,'Tavera FC',8,6,1,1,35,10,25,19],
  [2,'Célticos',8,5,1,2,25,12,13,16],
  [3,'San Antonio FC',8,5,0,3,21,14,7,15],
  [4,'San Julián',8,4,2,2,16,12,4,14],
  [5,'San Juan FC',8,4,1,3,15,14,1,13]
 ],
 '2':[
  [1,'Deportivo CG',8,6,1,1,20,8,12,19],
  [2,'Dep. Nopalero',8,5,2,1,18,9,9,17],
  [3,'Pozos FC',8,4,2,2,15,11,4,14],
  [4,'América',8,4,1,3,14,13,1,13]
 ],
 '1':[
  [1,'La Esperanza',9,7,0,2,21,8,13,21],
  [2,'Dynamo',10,6,2,2,20,10,10,20],
  [3,'Manchester',10,5,3,2,18,11,7,18],
  [4,'Boavista',10,5,2,3,17,12,5,17],
  [5,'Toros de Cuenda',10,4,3,3,15,13,2,15],
  [6,'PSV',9,4,2,3,16,14,2,14],
  [7,'Huracán',9,3,2,4,13,15,-2,11]
 ]
};

const seasons=[
 ['2025/26','Linces','Primera Fuerza · Torneo actual'],
 ['2024/25','Galácticos de Pozos','Campeón de Campeones · 09 feb 2025'],
 ['2023/24','Linces','Campeón de Liga · Primera Fuerza'],
 ['2022/23','Juventus','Bicampeón · Primera Fuerza'],
 ['2021/22','Juventus','Campeón de Liga · Primera Fuerza'],
 ['2020/21','La Esperanza','Campeón · Veteranos 50+'],
 ['2019/20','Juventus','Campeón de Liga y Copa'],
 ['2018/19','Juventus','Campeón · Primera Fuerza'],
 ['2017/18','Tecos','Campeón Histórico'],
 ['2016/17','Real DHP','Campeón de Liga'],
 ['2015/16','La Esperanza','Campeón de Temporada'],
 ['2014/15','Boavista','Campeón de Campeones · 18 ene 2015'],
 ['2013/14','La Esperanza','Campeón de Liga'],
 ['2012/13','Real Cerrito de Gasca','Campeón Fundacional']
];

const honoursList=[
 {club:'Juventus',titles:6,years:'2018/19, 2019/20, 2021/22, 2022/23, Copa 2024, Campeón de Campeones 2024'},
 {club:'La Esperanza',titles:4,years:'2013/14, 2015/16, 2020/21, Campeón Copa Veteranos 50+ (08 nov 2025)'},
 {club:'Linces',titles:3,years:'2023/24, 2025/26, Líder General Apertura 2026'},
 {club:'Boavista',titles:3,years:'2014/15 Campeón de Campeones, Copa Veteranos, Torneo Invierno'},
 {club:'Galácticos de Pozos',titles:2,years:'2024/25 Campeón de Campeones (09 feb 2025), Torneo Regular'},
 {club:'Deportivo CG',titles:2,years:'Liga y Campeón de Campeones · Veteranos 35+ (19 sep 2026)'},
 {club:'Franco FC',titles:2,years:'Campeón de Liga · Intermedia (10 may 2026), Torneo Copa'},
 {club:'Tavera FC',titles:2,years:'Campeón Segunda Fuerza, Líder Goleador Histórico'},
 {club:'San José FC',titles:1,years:'Campeón Torneo de Copa · Primera Fuerza'},
 {club:'Tecos',titles:1,years:'Campeón Temporada 2017/18'},
 {club:'Real DHP',titles:1,years:'Campeón Temporada 2016/17'},
 {club:'Real Cerrito de Gasca',titles:1,years:'Campeón Temporada 2012/13'}
];

function db(){return window.LJR_OFFICIAL_DATA||window.LJR_OFFICIAL_API?.getData?.()||null;}
function logoUrl(team){
 let v='';
 try{
  v=window.LJR_OFFICIAL_API?.getLogo?.(team)||'';
  if(!v){const e=Object.entries(db()?.team_logos||{}).find(([t])=>norm(t)===norm(team));v=e?.[1]||'';}
  if(typeof v==='object')v=v.app||v.local||v.source||v.url||'';
  v=String(v||'').trim();
  if(/^(?:\.\/)?assets\//.test(v))v=BASE+v.replace(/^\.\//,'');
 }catch(_){v='';}
 const fallbackMap={
  'juventus':'./assets/official-logos/juventus.png',
  'linces':'./assets/official-logos/linces.png',
  'la esperanza':'./assets/official-logos/la-esperanza.png',
  'boavista':'./assets/official-logos/boavista.png',
  'galacticos de pozos':'./assets/teams/galacticos-pozos.webp',
  'galacticos':'./assets/teams/galacticos-pozos.webp',
  'deportivo cg':'./assets/teams/deportivo-cg.webp',
  'lobos cdg':'./assets/official-logos/lobos-cdg.png',
  'real cerrito de gasca':'./assets/teams/deportivo-cg.webp',
  'franco fc':'./assets/official-logos/franco-fc.png',
  'tavera fc':'./assets/official-logos/tavera-fc.png',
  'san jose fc':'./assets/official-logos/san-jose-fc.png',
  'hermanos':'./assets/official-logos/hermanos.png',
  'herreras fc':'./assets/official-logos/herreras-fc.png',
  'napoli':'./assets/official-logos/napoli.png',
  'dynamo':'./assets/official-logos/dynamo.png',
  'manchester':'./assets/official-logos/manchester.png',
  'toros de cuenda':'./assets/official-logos/toros-de-cuenda.png',
  'cuenda':'./assets/official-logos/cuenda.png',
  'psv':'./assets/official-logos/psv.png',
  'pozos fc':'./assets/official-logos/pozos-fc.png',
  'america':'./assets/official-logos/america.png',
  'huracan':'./assets/official-logos/huracan.png',
  'aguilares':'./assets/official-logos/aguilares.png',
  'leyendas fc':'./assets/official-logos/leyendas-fc.png',
  'celticos':'./assets/official-logos/celticos.png',
  'san antonio fc':'./assets/official-logos/san-antonio-fc.png',
  'dep. nopalero':'./assets/official-logos/dep-nopalero.png',
  'san juan fc':'./assets/official-logos/san-juan-fc.png',
  'san jose jrs':'./assets/official-logos/san-jose-jrs.png',
  'san julian':'./assets/official-logos/san-julian.png',
  'la canchita deportes':'./assets/official-logos/la-canchita-deportes.png',
  'la cuadrilla':'./assets/official-logos/la-cuadrilla.png',
  'mazacotes fc':'./assets/official-logos/mazacotes-fc.png'
 };
 return v||fallbackMap[norm(team)]||'./assets/liga-logo.webp';
}
function crest(name,cls='ljpc-uh-crest'){
 return '<img class="'+cls+'" loading="lazy" decoding="async" src="'+esc(logoUrl(teamName(name)))+'" alt="'+esc(teamName(name))+'">';
}
function teamName(s){return String(s||'Club').trim();}
function abbr(name){
 const words=String(name||'').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]/g,' ').trim().split(/\s+/).filter(Boolean);
 if(!words.length)return 'LJR';
 if(words.length===1)return words[0].slice(0,3).toUpperCase();
 return words.slice(0,3).map(w=>w[0]).join('').toUpperCase();
}

function renderSubnavBar(){
 const items=[
  ['temporadas','Temporadas','sub'],
  ['clubes','Estadísticas de clubes','sub'],
  ['estadisticas','Rankings históricos','sub'],
  ['videos','Vídeos','sub'],
  ['historicos','Equipos','sub'],
  ['titulos','Más títulos','sub'],
  ['noticias','Noticias','sec'],
  ['sobre','Sobre','sec']
 ];
 return '<nav class="ljpc-uh-subnav-bar" aria-label="Navegación de Historia y Estadísticas de Clubes">'
  +'<div class="ljpc-uh-bound ljpc-uh-subnav-inner">'
   +items.map(([id,label,kind])=>'<button type="button" class="ljpc-uh-subnav-tab" '+(kind==='sub'?'data-ljpc-h-sub="'+id+'"':'data-ljpc-h-section="'+id+'"')+'>'+esc(label)+'</button>').join('')
  +'</div>'
 +'</nav>';
}

function getClubRowsForCategory(catId){
 const d=db();
 if(catId==='all'){
  const all=[];
  for(const [cid,cname] of Object.entries(CAT)){
   const live=d?.categories?.[cid]?.standings?.[0]?.rows;
   const src=(Array.isArray(live)&&live.length?live:FALLBACK_STANDINGS[cid]||[]);
   src.forEach(r=>{if(Array.isArray(r)&&r[1])all.push({row:r,catName:cname});});
  }
  return all;
 }
 const live=d?.categories?.[catId]?.standings?.[0]?.rows;
 const src=(Array.isArray(live)&&live.length?live:FALLBACK_STANDINGS[catId]||FALLBACK_STANDINGS['3']);
 const cname=CAT[catId]||'Primera Fuerza';
 return src.filter(r=>Array.isArray(r)&&r[1]).map(r=>({row:r,catName:cname}));
}

function renderClubesStats(){
 const colsByMetric={
  clave:[['Partidos jugados',2],['Ganados',3],['Empatados',4],['Perdidos',5],['Goles a favor',6],['Goles en contra',7],['Diferencia de goles',8],['Puntos',9]],
  goles:[['Goles a favor',6],['Goles en contra',7],['Diferencia de goles',8],['Partidos jugados',2],['Puntos',9]],
  ataque:[['Goles anotados',6],['Victorias',3],['Partidos jugados',2],['Diferencia de goles',8],['Puntos',9]],
  defensa:[['Goles recibidos',7],['Partidos jugados',2],['Empates',4],['Derrotas',5],['Puntos',9]],
  porteria:[['Goles recibidos',7],['Partidos jugados',2],['Victorias',3],['Empates',4]],
  disciplina:[['Partidos jugados',2],['Ganados',3],['Empatados',4],['Perdidos',5],['Puntos',9]]
 };
 const cols=colsByMetric[state.clubMetric]||colsByMetric.clave;
 const sortIdx=state.clubMetric==='clave'?9:cols[0][1];
 const asc=state.clubMetric==='defensa'||state.clubMetric==='porteria';
 const items=getClubRowsForCategory(state.clubCat).slice().sort((a,b)=>{
  const va=Number(a.row[sortIdx])||0,vb=Number(b.row[sortIdx])||0;
  if(vb!==va)return (vb-va)*(asc?-1:1);
  return (Number(b.row[8])||0)-(Number(a.row[8])||0);
 });
 const catTabs=[['all','Todas las categorías'],...Object.entries(CAT)];
 return '<div class="ljpc-uh-bound ljpc-uh-pad-page ljpc-uh-club-stats">'
  +'<div class="ljpc-uh-club-head">'
   +'<div>'
    +'<h2 class="ljpc-uh-page-title">Estadísticas de clubes</h2>'
    +'<p class="ljpc-uh-subnote">Rendimiento oficial por club · Liga Juventino Rosas · Guanajuato</p>'
   +'</div>'
   +'<div class="ljpc-uh-club-cats" role="tablist" aria-label="Categorías oficiales">'
    +catTabs.map(([cid,cname])=>'<button type="button" class="ljpc-uh-cat-pill'+(state.clubCat===cid?' is-active':'')+'" data-ljpc-club-cat="'+cid+'">'+esc(cname)+'</button>').join('')
   +'</div>'
  +'</div>'
  +'<div class="ljpc-uh-metric-bar">'
   +'<div class="ljpc-uh-metric-pills" role="tablist" aria-label="Métricas de clubes">'
    +CLUB_METRICS.map(([mid,mlabel])=>'<button type="button" class="ljpc-uh-metric-pill'+(state.clubMetric===mid?' is-active':'')+'" data-ljpc-club-metric="'+mid+'">'+esc(mlabel)+'</button>').join('')
   +'</div>'
  +'</div>'
  +'<div class="ljpc-uh-club-tablebox">'
   +'<table class="ljpc-uh-club-table">'
    +'<thead><tr>'
     +'<th class="is-rank">#</th>'
     +'<th class="is-club">Club</th>'
     +cols.map(([label,idx],i)=>'<th class="'+(idx===sortIdx||i===0?'is-primary':'')+'">'+esc(label)+'</th>').join('')
    +'</tr></thead>'
    +'<tbody>'
     +items.map(({row,catName},idx)=>'<tr data-ljpc-open-team="'+esc(row[1])+'">'
      +'<td class="is-rank">'+String(idx+1).padStart(2,'0')+'</td>'
      +'<td class="is-club">'
       +'<div class="ljpc-uh-club-cell">'
        +crest(row[1],'ljpc-uh-club-crest34')
        +'<div><b>'+esc(row[1])+'</b><small>'+esc(catName)+' · ('+esc(abbr(row[1]))+')</small></div>'
       +'</div>'
      +'</td>'
      +cols.map(([,cidx],i)=>'<td class="'+(cidx===sortIdx||i===0?'is-primary':'')+'">'+esc(row[cidx]??'0')+'</td>').join('')
     +'</tr>').join('')
    +'</tbody>'
   +'</table>'
  +'</div>'
 +'</div>';
}

function renderTemporadas(){
 const topSeasons=seasons.slice(0,7);
 const h2hPairs=[
  ['Juventus','Boavista'],['Linces','San José FC'],['La Esperanza','Dynamo'],['Tavera FC','Célticos']
 ];
 const classicVids=[
  ['19 sep 2026','02:13','Gran Final Veteranos 35+: Deportivo CG campeón','./deportiva-sur-partido.jpg','video'],
  ['09 feb 2025','01:48','Galácticos de Pozos conquista el Campeón de Campeones','./assets/moments/moments-original-a.png','video'],
  ['08 nov 2025','03:05','La Esperanza levanta la Copa en Veteranos 50+','./assets/moments/moments-original-b.png','video']
 ];
 return '<div class="ljpc-uh-seasons-bar" role="region" aria-label="Temporadas históricas">'
  +'<div class="ljpc-uh-bound ljpc-uh-seasons-inner">'
   +'<button type="button" class="ljpc-uh-featured-pill is-active" data-ljpc-h-sub="temporadas"><span class="ljpc-uh-star">★</span><b>Destacados</b></button>'
   +'<div class="ljpc-uh-season-rail">'
    +topSeasons.map(([yr,club])=>'<button type="button" class="ljpc-uh-season-chip" data-ljpc-h-sub="titulos" title="Campeón '+esc(yr)+': '+esc(club)+'">'+crest(club,'ljpc-uh-chip-crest')+'<small>Ganador</small><strong>'+esc(yr)+'</strong></button>').join('')
   +'</div>'
   +'<button type="button" class="ljpc-uh-all-seasons-btn" data-ljpc-h-sub="titulos">Todas las temporadas</button>'
  +'</div>'
 +'</div>'
 +'<div class="ljpc-uh-bound ljpc-uh-two-col">'
  +'<div class="ljpc-uh-main-col">'
   +'<article class="ljpc-uh-hero-card" data-ds-route="video">'
    +'<img src="./assets/home-players-user.png" alt="Historia de la Liga Juventino Rosas" loading="eager">'
    +'<div class="ljpc-uh-hero-overlay">'
     +'<span class="ljpc-uh-badge">En portada</span>'
     +'<h2>Historia, campeones y grandes finales de la Liga Juventino Rosas</h2>'
     +'<div class="ljpc-uh-hero-sub"><span>⚽ Archivo oficial desde 2012 · Las 5 categorías municipales</span></div>'
    +'</div>'
   +'</article>'
   +'<section class="ljpc-uh-white-card">'
    +'<div class="ljpc-uh-card-head"><h3>Comparar estadísticas de club</h3><button type="button" class="ljpc-uh-text-link" data-ljpc-h-sub="clubes">Tabla completa de clubes ›</button></div>'
    +'<div class="ljpc-uh-h2h-grid">'
     +h2hPairs.map(([a,b])=>'<button type="button" class="ljpc-uh-h2h-item" data-ds-route="compareTeams">'
      +'<span class="ljpc-uh-h2h-tag">Enfrentamiento directo</span>'
      +'<div class="ljpc-uh-h2h-clubs">'
       +'<div>'+crest(a)+'<b>'+esc(a)+'</b></div>'
       +'<em>vs</em>'
       +'<div>'+crest(b)+'<b>'+esc(b)+'</b></div>'
      +'</div>'
     +'</button>').join('')
    +'</div>'
   +'</section>'
   +'<section class="ljpc-uh-white-card">'
    +'<div class="ljpc-uh-card-head"><h3>Clásicos en vídeo</h3><button type="button" class="ljpc-uh-text-link" data-ljpc-h-sub="videos">Ver más ›</button></div>'
    +'<div class="ljpc-uh-vid3-grid">'
     +classicVids.map(([dt,dur,title,img,rt])=>'<article class="ljpc-uh-vid-card" data-ds-route="'+rt+'">'
      +'<div class="ljpc-uh-vid-thumb"><img src="'+img+'" alt="" loading="lazy"><span>'+dur+' ▶</span></div>'
      +'<div class="ljpc-uh-vid-body"><small>'+esc(dt)+'</small><h4>'+esc(title)+'</h4></div>'
     +'</article>').join('')
    +'</div>'
   +'</section>'
  +'</div>'
  +'<aside class="ljpc-uh-side-col">'
   +'<section class="ljpc-uh-white-card">'
    +'<div class="ljpc-uh-card-head"><h3>Estadísticas históricas</h3></div>'
    +'<p class="ljpc-uh-side-sub">Más títulos</p>'
    +'<div class="ljpc-uh-side-list">'
     +honoursList.slice(0,5).map((item,idx)=>'<div class="ljpc-uh-side-row">'
      +'<span class="ljpc-uh-rank">'+(idx+1)+'</span>'
      +crest(item.club,'ljpc-uh-mini-crest')
      +'<div class="ljpc-uh-side-name"><b>'+esc(item.club)+'</b><small>Liga Juventino Rosas</small></div>'
      +'<strong class="ljpc-uh-side-val">'+item.titles+'</strong>'
     +'</div>').join('')
    +'</div>'
    +'<button type="button" class="ljpc-uh-outline-btn" data-ljpc-h-sub="clubes">Ver estadísticas de clubes</button>'
   +'</section>'
   +'<section class="ljpc-uh-white-card">'
    +'<div class="ljpc-uh-card-head"><h3>Libro de estadísticas</h3></div>'
    +'<div class="ljpc-uh-book-banner"><img src="./deportiva-sur-partido.jpg" alt="" loading="lazy"><span>ARCHIVO OFICIAL<br>LIGA JUVENTINO ROSAS</span></div>'
    +'<div class="ljpc-uh-book-links">'
     +'<button type="button" data-ljpc-h-sub="clubes">Estadísticas de clubes oficiales ↗</button>'
     +'<button type="button" data-ljpc-h-sub="titulos">Campeones y finales históricas ↗</button>'
     +'<button type="button" data-ds-route="pc-data">Récords y centro de datos ↗</button>'
    +'</div>'
   +'</section>'
  +'</aside>'
 +'</div>';
}

function renderEstadisticas(){
 const teamCards=[
  {title:'Más títulos',unit:'Títulos',rows:[
   ['Juventus','Primera Fuerza',6],['La Esperanza','Veteranos 50+',4],['Linces','Primera Fuerza',3],
   ['Boavista','Veteranos 50+',3],['Galácticos de Pozos','Primera Fuerza',2],['Deportivo CG','Veteranos 35+',2]
  ]},
  {title:'Más goles (Temporada)',unit:'Goles',rows:[
   ['Tavera FC','Segunda Fuerza',35],['Juventus','Primera Fuerza',26],['Célticos','Segunda Fuerza',25],
   ['La Cuadrilla','Intermedia',24],['San Antonio FC','Segunda Fuerza',21],['Dynamo','Veteranos 50+',20]
  ]},
  {title:'Más puntos (Temporada)',unit:'Puntos',rows:[
   ['La Esperanza','Veteranos 50+',21],['Dynamo','Veteranos 50+',20],['Tavera FC','Segunda Fuerza',19],
   ['La Canchita Deportes','Intermedia',19],['Linces','Primera Fuerza',18],['San José FC','Primera Fuerza',16]
  ]},
  {title:'Más partidos jugados',unit:'Partidos',rows:[
   ['Dynamo','Veteranos 50+',10],['Manchester','Veteranos 50+',10],['Toros de Cuenda','Veteranos 50+',10],
   ['Boavista','Veteranos 50+',10],['La Esperanza','Veteranos 50+',9],['Lobos CDG','Primera Fuerza',9]
  ]}
 ];
 const playerCards=[
  {title:'Máximos goleadores',unit:'Goles',rows:[
   ['Alan Manuel Noria Tovar','Dep. Nopalero',5],['J. Carmen Subías Miranda','Manchester',4],
   ['Julio César Ruvalcaba','Dynamo',4],['Edgar Manuel Landín','PSV',4],
   ['Honorio Ochoa Aguilar','Tavera FC',4],['Ernesto Baltazar Sosa','Linces',3]
  ]},
  {title:'Goleadores Primera Fuerza',unit:'Goles',rows:[
   ['Ernesto Baltazar Sosa','Linces',3],['Edgar Omar Reyes','Herreras FC',3],
   ['Alejandro Moreno Banda','Hermanos',3],['Israel Solórzano','Linces',2],
   ['Jesús Gerardo Rodríguez','Hermanos',2],['Mario Razo Miranda','Hermanos',2]
  ]},
  {title:'Goleadores Veteranos',unit:'Goles',rows:[
   ['J. Carmen Subías Miranda','Manchester',4],['Julio César Ruvalcaba','Dynamo',4],
   ['Edgar Manuel Landín','PSV',4],['Arturo Contreras','Huracán',3],
   ['Mario Razo Miranda','Juventus',3],['José Mendoza Pescador','La Esperanza',3]
  ]},
  {title:'Plantillas más amplias',unit:'Jugadores',rows:[
   ['San Antonio Jrs','Intermedia',30],['Atl. Galeana','Intermedia',30],
   ['Populares','Intermedia',30],['San José FC','Primera Fuerza',29],
   ['La Canchita Deportes','Intermedia',28],['Promesas FC','Intermedia',28]
  ]}
 ];
 const renderCard=(card)=>'<article class="ljpc-uh-rank-card">'
  +'<header class="ljpc-uh-rank-head">'
   +'<small>'+esc(card.title)+'</small>'
   +'<div class="ljpc-uh-rank-top1">'
    +'<div class="ljpc-uh-rank-top1-info"><b>1 &nbsp; '+esc(card.rows[0][0])+'</b><span>'+esc(card.rows[0][1])+'</span></div>'
    +crest(card.rows[0][1]||card.rows[0][0],'ljpc-uh-rank-top1-crest')
    +'<strong>'+esc(card.rows[0][2])+'</strong>'
   +'</div>'
  +'</header>'
  +'<div class="ljpc-uh-rank-body">'
   +'<div class="ljpc-uh-rank-colhead"><span>Club / Jugador</span><span>'+esc(card.unit)+'</span></div>'
   +card.rows.slice(1,6).map((r,i)=>'<div class="ljpc-uh-rank-row">'
    +'<span class="ljpc-uh-rank-num">'+(i+2)+'</span>'
    +crest(r[1]||r[0],'ljpc-uh-rank-mini')
    +'<div class="ljpc-uh-rank-txt"><b>'+esc(r[0])+'</b><small>'+esc(r[1])+'</small></div>'
    +'<strong>'+esc(r[2])+'</strong>'
   +'</div>').join('')
   +'<button type="button" class="ljpc-uh-rank-more" data-ljpc-h-sub="clubes">Mostrar más ›</button>'
  +'</div>'
 +'</article>';
 return '<div class="ljpc-uh-bound ljpc-uh-pad-page">'
  +'<h2 class="ljpc-uh-page-title">Rankings y estadísticas históricas</h2>'
  +'<section class="ljpc-uh-stat-block">'
   +'<h3 class="ljpc-uh-sec-title">Estadísticas de equipo</h3>'
   +'<div class="ljpc-uh-rank-grid4">'+teamCards.map(renderCard).join('')+'</div>'
  +'</section>'
  +'<section class="ljpc-uh-stat-block">'
   +'<h3 class="ljpc-uh-sec-title">Estadísticas de jugador</h3>'
   +'<div class="ljpc-uh-rank-grid4">'+playerCards.map(renderCard).join('')+'</div>'
  +'</section>'
 +'</div>'
 +renderClubesStats();
}

function renderVideos(){
 const playlist=[
  {title:'Resumen y mejores jugadas de la jornada · Liga Juventino Rosas',time:'hace 4 horas',desc:'Revive las mejores acciones, goles y atajadas en los campos de Juventino Rosas.',img:'./deportiva-sur-partido.jpg',dur:'03:42'},
  {title:'Gran Final Veteranos 35+: Ambiente y coronación en el empastado',time:'hace 2 días',desc:'Cobertura especial de la gran final con las aficiones de Juventino Rosas.',img:'./assets/home-players-user.png',dur:'04:15'},
  {title:'Goles destacados de Primera Fuerza e Intermedia',time:'hace 5 días',desc:'Selección de goles verificados en las cédulas arbitrales de la jornada.',img:'./assets/moments/moments-original-a.png',dur:'02:50'}
 ];
 const cur=playlist[state.activeVideo]||playlist[0];
 const rails=[
  {title:'Clásicos',items:[
   ['18 ene 2025','03:55','Boavista Campeón de Campeones · Archivo histórico','./assets/moments/moments-original-a.png'],
   ['09 feb 2025','02:40','Galácticos de Pozos levanta el título en definición histórica','./assets/moments/moments-original-b.png'],
   ['08 nov 2025','03:18','La Esperanza conquista el campeonato de Veteranos 50+','./deportiva-sur-partido.jpg']
  ]},
  {title:'Finales',items:[
   ['19 sep 2026','04:12','Final Veteranos 35+: Deportivo CG se proclama campeón','./assets/home-players-user.png'],
   ['15 mar 2026','03:30','Final Primera Fuerza: Linces levanta el trofeo municipal','./deportiva-sur-partido.jpg'],
   ['10 may 2026','02:58','Final Intermedia: Franco FC campeón de temporada','./assets/moments/moments-original-a.png']
  ]},
  {title:'Protagonistas de la Liga',items:[
   ['25 oct 2026','02:22','Líderes de goleo y figuras de la Jornada 8','./assets/moments/moments-original-b.png'],
   ['24 oct 2026','01:55','Atajadas y momentos defensivos de la semana','./deportiva-sur-partido.jpg'],
   ['18 oct 2026','03:04','La afición y el ambiente familiar en Juventino Rosas','./assets/home-players-user.png']
  ]}
 ];
 return '<div class="ljpc-uh-bound ljpc-uh-pad-page">'
  +'<h3 class="ljpc-uh-sec-title">Destacados</h3>'
  +'<div class="ljpc-uh-video-stage">'
   +'<div class="ljpc-uh-video-main" data-ds-route="video">'
    +'<div class="ljpc-uh-video-screen">'
     +'<img src="'+cur.img+'" alt="">'
     +'<span class="ljpc-uh-play-circle">▶</span>'
    +'</div>'
    +'<div class="ljpc-uh-video-meta">'
     +'<h2>'+esc(cur.title)+'</h2>'
     +'<small>'+esc(cur.time)+'</small>'
     +'<p>'+esc(cur.desc)+'</p>'
    +'</div>'
   +'</div>'
   +'<div class="ljpc-uh-video-playlist">'
    +playlist.map((v,idx)=>'<button type="button" class="ljpc-uh-plist-item'+(idx===state.activeVideo?' is-active':'')+'" data-ljpc-vid-idx="'+idx+'">'
     +'<div class="ljpc-uh-plist-thumb"><img src="'+v.img+'" alt=""><span>'+(idx===state.activeVideo?'▶ REPRODUCIENDO':v.dur)+'</span></div>'
     +'<div class="ljpc-uh-plist-txt"><b>'+esc(v.title)+'</b><small>'+esc(v.time)+'</small></div>'
    +'</button>').join('')
   +'</div>'
  +'</div>'
  +rails.map(r=>'<section class="ljpc-uh-vrail-sec">'
   +'<h3 class="ljpc-uh-sec-title">'+esc(r.title)+'</h3>'
   +'<div class="ljpc-uh-vid3-grid">'
    +r.items.map(([dt,dur,t,img])=>'<article class="ljpc-uh-vid-card" data-ds-route="video">'
     +'<div class="ljpc-uh-vid-thumb"><img src="'+img+'" alt="" loading="lazy"><span>'+dur+' ▶</span></div>'
     +'<div class="ljpc-uh-vid-body"><small>'+esc(dt)+'</small><h4>'+esc(t)+'</h4></div>'
    +'</article>').join('')
   +'</div>'
  +'</section>').join('')
 +'</div>';
}

function collectTeamsByCategory(){
 const d=db(),byCat=new Map(),all=new Map();
 for(const [cid,cname] of Object.entries(CAT)){
  const c=d?.categories?.[cid];
  const list=[];
  const seen=new Set();
  const add=n=>{
   n=String(n||'').trim();if(!n)return;
   const k=norm(n);
   if(!seen.has(k)){seen.add(k);list.push(n);}
   if(!all.has(k))all.set(k,{name:n,cat:cname});
  };
  for(const g of c?.standings||[])for(const r of g.rows||[])if(Array.isArray(r))add(r[1]);
  for(const g of c?.fixtures||[])for(const r of g.rows||[])if(Array.isArray(r)){add(r[2]);add(r[6]);}
  for(const t of Object.keys(c?.rosters||{}))add(t);
  (FALLBACK_STANDINGS[cid]||[]).forEach(r=>add(r[1]));
  byCat.set(cname,list.sort((a,b)=>a.localeCompare(b,'es')));
 }
 return {byCat,all:[...all.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'))};
}
function renderEquipos(){
 const {byCat,all}=collectTeamsByCategory();
 const q=norm(state.teamsQuery);
 const filtered=q?all.filter(x=>norm(x.name).includes(q)||norm(x.cat).includes(q)):all;
 const byLetter=new Map();
 filtered.forEach(item=>{
  const ch=item.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'')[0]?.toUpperCase()||'#';
  if(!byLetter.has(ch))byLetter.set(ch,[]);
  byLetter.get(ch).push(item);
 });
 return '<div class="ljpc-uh-bound ljpc-uh-pad-page">'
  +'<div class="ljpc-uh-teams-header">'
   +'<div><h2 class="ljpc-uh-page-title">Equipos</h2><p class="ljpc-uh-subnote">Clubes oficiales registrados en las 5 categorías de la Liga Juventino Rosas.</p></div>'
   +'<div class="ljpc-uh-search-box"><input type="search" data-ljpc-h-team-search placeholder="Buscar" value="'+esc(state.teamsQuery)+'" aria-label="Buscar equipo"></div>'
  +'</div>'
  +(!q?[...byCat.entries()].map(([cname,clubs])=>clubs.length?'<section class="ljpc-uh-cat-group">'
   +'<h3 class="ljpc-uh-cat-heading">'+esc(cname)+'</h3>'
   +'<div class="ljpc-uh-grid10">'
    +clubs.map(n=>'<button type="button" class="ljpc-uh-club10" data-ljpc-open-team="'+esc(n)+'">'
     +crest(n,'ljpc-uh-crest56')
     +'<b>'+esc(n)+'</b>'
     +'<small>('+esc(abbr(n))+')</small>'
    +'</button>').join('')
   +'</div>'
  +'</section>':'').join(''):'')
  +'<section class="ljpc-uh-az-section">'
   +'<h3 class="ljpc-uh-cat-heading">Directorio Alfabético A–Z ('+filtered.length+' clubes)</h3>'
   +([...byLetter.entries()].map(([letter,items])=>'<div class="ljpc-uh-letter-block">'
    +'<h4>'+esc(letter)+'</h4>'
    +'<div class="ljpc-uh-grid10">'
     +items.map(x=>'<button type="button" class="ljpc-uh-club10" data-ljpc-open-team="'+esc(x.name)+'">'
      +crest(x.name,'ljpc-uh-crest56')
      +'<b>'+esc(x.name)+'</b>'
      +'<small>('+esc(abbr(x.name))+')</small>'
     +'</button>').join('')
    +'</div>'
   +'</div>').join('')||'<p class="ljpc-h-note">No se encontraron clubes con ese nombre.</p>')
  +'</section>'
 +'</div>';
}

function renderTitulos(){
 return '<div class="ljpc-uh-bound ljpc-uh-pad-page">'
  +'<h2 class="ljpc-uh-page-title">Más títulos</h2>'
  +'<div class="ljpc-uh-honours-card">'
   +honoursList.map((item,i)=>'<details class="ljpc-uh-honour-row"'+(i===0?' open':'')+'>'
    +'<summary>'
     +'<span class="ljpc-uh-chevron" aria-hidden="true">⌄</span>'
     +crest(item.club,'ljpc-uh-honour-crest')
     +'<b class="ljpc-uh-honour-name">'+esc(item.club)+'</b>'
     +'<span class="ljpc-uh-honour-count"><strong>'+item.titles+'</strong><i aria-hidden="true">🏆</i></span>'
    +'</summary>'
    +'<div class="ljpc-uh-honour-detail"><strong>Palmarés registrado:</strong> '+esc(item.years)+'</div>'
   +'</details>').join('')
  +'</div>'
 +'</div>';
}

function renderNoticias(){
 const rows=[
  {leadLeft:true,
   lead:['Jornada vibrante en la Liga Juventino Rosas: Linces y La Esperanza lideran sus categorías','./deportiva-sur-partido.jpg','competition'],
   cards:[
    ['Tabla de goleo al día: Alan Manuel Noria y J. Carmen Subías encabezan las redes','./assets/home-players-user.png','pc-scorers'],
    ['Reporte de cédulas arbitrales: consulta los resultados verificados de las 5 categorías','./assets/moments/moments-original-a.png','cedulas']
   ]},
  {leadLeft:false,
   lead:['Veteranos 35+ y 50+: resultados oficiales, goleadores y próximos encuentros programados','./assets/home-players-user.png','pc-fixtures'],
   cards:[
    ['Plantillas y registros: más de 1,360 jugadores activos con credencial digital en la liga','./assets/moments/moments-original-b.png','teams'],
    ['Guía de campos y clima en tiempo real para la próxima jornada dominical','./deportiva-sur-partido.jpg','weatherFields']
   ]},
  {leadLeft:true,
   lead:['Simulador interactivo de clasificación y cuadro de liguilla disponible en versión PC','./assets/moments/moments-original-a.png','pc-standings'],
   cards:[
    ['Gaming Liga Juventino: participa en Fantasy, Quiniela, Quiz Arena y Pronostica Seis','./assets/moments/moments-original-b.png','predictorSix'],
    ['Reglamento oficial 2026-2027 y comunicados del tribunal disciplinario','./deportiva-sur-partido.jpg','rulebook']
   ]}
 ];
 return '<div class="ljpc-uh-bound ljpc-uh-pad-page">'
  +'<h2 class="ljpc-uh-page-title">Noticias</h2>'
  +'<div class="ljpc-uh-bento-stack">'
   +rows.map(r=>{
    const leadHtml='<article class="ljpc-uh-bento-lead" data-ds-route="'+r.lead[2]+'">'
     +'<img src="'+r.lead[1]+'" alt="" loading="lazy">'
     +'<div class="ljpc-uh-bento-lead-txt"><h3>'+esc(r.lead[0])+'</h3></div>'
    +'</article>';
    const sideHtml=r.cards.map(c=>'<article class="ljpc-uh-bento-card" data-ds-route="'+c[2]+'">'
     +'<div class="ljpc-uh-bento-img"><img src="'+c[1]+'" alt="" loading="lazy"></div>'
     +'<div class="ljpc-uh-bento-body"><h4>'+esc(c[0])+'</h4></div>'
    +'</article>').join('');
    return '<div class="ljpc-uh-bento-row">'+(r.leadLeft?leadHtml+sideHtml:sideHtml+leadHtml)+'</div>';
   }).join('')
  +'</div>'
 +'</div>';
}

function renderSobre(){
 const cards=[
  ['Guía de campos y sedes oficiales','./deportiva-sur-partido.jpg','venues'],
  ['Reglamento oficial 2026-2027','./assets/moments/moments-original-a.png','rulebook'],
  ['Historia y archivo de campeones','./assets/home-players-user.png','history'],
  ['Calendario y rol de juegos','./assets/moments/moments-original-b.png','pc-fixtures'],
  ['Centro de datos y estadísticas','./deportiva-sur-partido.jpg','pc-data'],
  ['Cédulas arbitrales verificadas','./assets/home-players-user.png','cedulas'],
  ['Liga TV y momentos destacados','./assets/moments/moments-original-a.png','video'],
  ['Noticias y avisos oficiales','./assets/moments/moments-original-b.png','news']
 ];
 return '<div class="ljpc-uh-bound ljpc-uh-pad-page">'
  +'<h2 class="ljpc-uh-page-title">Sobre</h2>'
  +'<div class="ljpc-uh-about-grid2">'
   +cards.map(([title,img,rt])=>'<button type="button" class="ljpc-uh-about-card" data-ds-route="'+rt+'">'
    +'<img src="'+img+'" alt="" loading="lazy">'
    +'<span><b>'+esc(title)+'</b></span>'
   +'</button>').join('')
  +'</div>'
 +'</div>';
}

function markup(){
 return '<section id="ljpc-pc-history-hub" class="ljpc-h-hub" aria-label="Historia y secciones de la liga en PC">'
  +renderSubnavBar()
  +'<section class="ljpc-h-section" data-ljpc-h-panel="equipos" hidden>'+renderEquipos()+'</section>'
  +'<section class="ljpc-h-section" data-ljpc-h-panel="noticias" hidden>'+renderNoticias()+'</section>'
  +'<section class="ljpc-h-section" data-ljpc-h-panel="historia">'
   +'<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="temporadas">'+renderTemporadas()+'</div>'
   +'<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="clubes" hidden>'+renderClubesStats()+'</div>'
   +'<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="estadisticas" hidden>'+renderEstadisticas()+'</div>'
   +'<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="videos" hidden>'+renderVideos()+'</div>'
   +'<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="historicos" hidden>'+renderEquipos()+'</div>'
   +'<div class="ljpc-h-subpanel" data-ljpc-h-subpanel="titulos" hidden>'+renderTitulos()+'</div>'
  +'</section>'
  +'<section class="ljpc-h-section" data-ljpc-h-panel="sobre" hidden>'+renderSobre()+'</section>'
 +'</section>';
}

function saved(){try{return sessionStorage.getItem(KEY)||'temporadas'}catch(_){return 'temporadas'}}
function choose(name){
 if(!pc()||!['history','teams','news','about'].includes(route()))return;
 const hub=document.getElementById('ljpc-pc-history-hub');if(!hub)return;
 const inSub=subs.includes(name),main=inSub?'historia':sections.includes(name)?name:'historia';
 const sub=inSub?name:'temporadas';
 document.getElementById('screen')?.classList?.toggle?.('ljpc-h-show-other',true);
 hub.querySelectorAll('[data-ljpc-h-section]').forEach(el=>{
  const active=el.dataset.ljpcHSection===main&&!inSub;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));
 });
 hub.querySelectorAll('[data-ljpc-h-panel]').forEach(el=>{el.hidden=el.dataset.ljpcHPanel!==main});
 hub.querySelectorAll('[data-ljpc-h-sub]').forEach(el=>{
  const active=main==='historia'&&el.dataset.ljpcHSub===sub;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));
 });
 hub.querySelectorAll('[data-ljpc-h-subpanel]').forEach(el=>{el.hidden=el.dataset.ljpcHSubpanel!==sub});
 if(route()==='history'){try{sessionStorage.setItem(KEY,name)}catch(_){}}
}

function mount(){
 const screen=document.getElementById('screen');
 if(!screen||!pc())return;
 const r=route();
 if(!['history','teams','news','about'].includes(r)){
  screen.classList.remove('ljpc-h-show-other');
  screen.querySelector(':scope > #ljpc-pc-history-hub')?.remove();
  return;
 }
 if(!screen.querySelector(':scope > #ljpc-pc-history-hub')){
  screen.insertAdjacentHTML('afterbegin',markup());
 }
 if(r==='teams')choose('equipos');
 else if(r==='news')choose('noticias');
 else if(r==='about')choose('sobre');
 else choose(saved());
}

function repaintHub(){
 const hub=document.getElementById('ljpc-pc-history-hub');
 if(!hub||!pc()||!['history','teams','news','about'].includes(route()))return;
 const r=route();
 const cur=r==='teams'?'equipos':r==='news'?'noticias':r==='about'?'sobre':saved();
 hub.outerHTML=markup();
 choose(cur);
}

let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;mount()})}
document.addEventListener('click',e=>{
 if(!pc()||!['history','teams','news','about'].includes(route())||!(e.target instanceof Element))return;
 const clubCatBtn=e.target.closest('#ljpc-pc-history-hub [data-ljpc-club-cat]');
 if(clubCatBtn){
  e.preventDefault();
  state.clubCat=clubCatBtn.dataset.ljpcClubCat||'3';
  repaintHub();
  return;
 }
 const clubMetricBtn=e.target.closest('#ljpc-pc-history-hub [data-ljpc-club-metric]');
 if(clubMetricBtn){
  e.preventDefault();
  state.clubMetric=clubMetricBtn.dataset.ljpcClubMetric||'clave';
  repaintHub();
  return;
 }
 const vidBtn=e.target.closest('#ljpc-pc-history-hub [data-ljpc-vid-idx]');
 if(vidBtn){
  e.preventDefault();
  state.activeVideo=Number(vidBtn.dataset.ljpcVidIdx)||0;
  repaintHub();
  return;
 }
 const teamBtn=e.target.closest('#ljpc-pc-history-hub [data-ljpc-open-team]');
 if(teamBtn){
  e.preventDefault();
  const t=teamBtn.dataset.ljpcOpenTeam;
  try{if(typeof window.LJR_OFFICIAL_API?.openTeam==='function'){window.LJR_OFFICIAL_API.openTeam(t);return;}localStorage.setItem('v62-team-name',t);}catch(_){}
  location.hash='#/teamDetail';
  return;
 }
 const routeBtn=e.target.closest('#ljpc-pc-history-hub [data-ds-route]');
 if(routeBtn){
  e.preventDefault();
  location.hash='#/'+routeBtn.dataset.dsRoute;
  return;
 }
 const tab=e.target.closest('#ljpc-pc-history-hub [data-ljpc-h-section],#ljpc-pc-history-hub [data-ljpc-h-sub]');
 if(!tab)return;
 e.preventDefault();choose(tab.dataset.ljpcHSection||tab.dataset.ljpcHSub);
});
document.addEventListener('input',e=>{
 if(!pc()||!['history','teams','news','about'].includes(route()))return;
 if(e.target?.matches?.('[data-ljpc-h-team-search]')){
  const pos=e.target.selectionStart;
  state.teamsQuery=e.target.value;
  const r=route();
  const cur=r==='teams'?'equipos':saved();
  const hub=document.getElementById('ljpc-pc-history-hub');
  if(hub){
   hub.querySelectorAll('[data-ljpc-h-panel="equipos"],[data-ljpc-h-subpanel="historicos"]').forEach(p=>{p.innerHTML=renderEquipos();});
   const input=hub.querySelector('[data-ljpc-h-team-search]');
   if(input&&!input.closest('[hidden]')){input.focus();try{input.setSelectionRange(pos,pos);}catch(_){}}
  }
  choose(cur);
 }
});
window.addEventListener('ljpc:history-select',e=>{if(pc())choose(e.detail?.section||'temporadas')});
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('ljr:official-data',()=>{if(pc()&&['history','teams','news','about'].includes(route()))repaintHub()});
function boot(){schedule();const screen=document.getElementById('screen');if(screen)new MutationObserver(schedule).observe(screen,{subtree:false,childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
