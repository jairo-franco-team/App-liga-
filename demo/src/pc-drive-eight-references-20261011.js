/* LJR Desktop · ocho referencias Drive / 11 oct 2026.
 * Vista PC aislada: no modifica el router móvil, Android, APK ni sus estilos. */
(function () {
  'use strict';
  if (window.__LJPC_DRIVE_EIGHT_EXACT_20261011__) return;
  window.__LJPC_DRIVE_EIGHT_EXACT_20261011__ = true;

  const PAGES = [
    ['resumen','Resumen'], ['equipos','Estadísticas de equipo'],
    ['jugadores','Estadísticas de jugadores'], ['goleador','Máximo goleador'],
    ['libro','Libro de estadísticas'], ['rendimiento','Performance Zone']
  ];
  const TEAM_METRICS = [
    ['clave','Estadísticas clave'],['goles','Goles'],['disparos','Disparos'],
    ['distribucion','Distribución'],['ataque','Ataque'],['defensa','Defensa'],
    ['porteria','Portería']
  ];
  const PLAYER_METRICS = [
    ['clave','Estadísticas clave'],['goles','Goles'],['disparos','Disparos'],
    ['distribucion','Distribución'],['ataque','Ataque'],['defensa','Defensa'],
    ['porteria','Portería'],['disciplina','Disciplina']
  ];
  const CATEGORIES = {'3':'Primera Fuerza','5':'Intermedia','4':'Segunda Fuerza','2':'Veteranos 35+','1':'Veteranos 50+'};
  const BASE = 'https://raw.githubusercontent.com/jairofrancog7-star/Liga_Futbol/main/';
  let state = {page:'resumen',teamMetric:'clave',playerMetric:'clave',category:'3',revision:0};
  let queued=false, currentRoot=null, currentSignature='';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalized=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const number=x=>{
    if(x===undefined||x===null||String(x).trim()==='')return null;
    const n=Number(String(x).trim().replace(',','.'));
    return Number.isFinite(n)?n:null;
  };
  const value=x=>number(x)===null?'—':esc(x);
  const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0];
  const mode=()=>new URLSearchParams(location.search).get('mode')||'';
  function desktop(){return !['mobile','apk'].includes(mode())&&(mode()==='desktop'||window.innerWidth>=1024)&&document.body?.classList.contains('lj-desktop');}
  function active(){return desktop()&&route()==='pc-data'&&document.documentElement.classList.contains('ljr-pc-datos-uefa');}
  function category(){try{const x=sessionStorage.getItem('ljpc-selected-category');return x in CATEGORIES?x:'3';}catch(_){return '3';}}
  function official(){const x=window.LJR_OFFICIAL_DATA||window.LJR_OFFICIAL_API?.getData?.();return x?.categories?x:null;}
  const dFor=()=>official()?.categories?.[state.category]||{};
  const stand=()=>Array.isArray(dFor().standings?.[0]?.rows)?dFor().standings[0].rows.filter(r=>Array.isArray(r)&&r[1]):[];
  const scorers=()=>Array.isArray(dFor().scorers?.[0]?.rows)?dFor().scorers[0].rows.filter(r=>Array.isArray(r)&&r[1]&&r[2]&&number(r[3])!==null):[];
  const icon=(name)=>{
    const paths={
      stats:'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
      player:'<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
      book:'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
      trophy:'<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978M18 9h1.5a1 1 0 0 0 0-5H18M4 22h16M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zM6 9H4.5a1 1 0 0 1 0-5H6"/>',
      right:'<circle cx="12" cy="12" r="10"/><path d="m10 8 4 4-4 4"/>',
      left:'<circle cx="12" cy="12" r="10"/><path d="m14 8-4 4 4 4"/>',
      video:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>'
    };
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.stats)+'</svg>';
  };
  function imageUrl(team){
    const api=window.LJR_OFFICIAL_API?.getLogo?.(team);
    let found=api;
    if(!found){const e=Object.entries(official()?.team_logos||{}).find(([t])=>normalized(t)===normalized(team));found=e?.[1];}
    const raw=String(typeof found==='string'?found:found?.app||found?.local||found?.source||found?.url||'').trim();
    if(/^https:\/\//i.test(raw))return raw;
    if(/^(?:\.\/)?assets\//i.test(raw))return BASE+raw.replace(/^\.\//,'');
    return '';
  }
  function logo(name){
    const src=imageUrl(name);
    return src?'<img class="ljpc8-crest" src="'+esc(src)+'" alt="" loading="lazy" decoding="async">':
      '<span class="ljpc8-crest ljpc8-fallback" aria-hidden="true">'+esc(String(name||'?').charAt(0))+'</span>';
  }
  const categoryCaption=()=>esc(dFor().name||CATEGORIES[state.category]||'Liga Juventino Rosas');
  const note=(text)=>'<div class="ljpc8-no-data">'+esc(text||'Esta estadística no está publicada oficialmente para la categoría seleccionada. No se muestran cifras inventadas.')+'</div>';

  function teamColumns(metric){
    switch(metric){
      case 'clave':return [['Partidos disputados',2],['Ganados',3],['Empatados',4],['Perdidos',5]];
      case 'goles':return [['Goles a favor',6],['Goles en contra',7],['Diferencia de goles',8]];
      case 'ataque':return [['Partidos disputados',2],['Goles anotados',6],['Victorias',3]];
      case 'defensa':return [['Goles recibidos',7],['Empates',4],['Derrotas',5]];
      case 'porteria':return [['Goles recibidos',7]];
      default:return null;
    }
  }
  function tableHead(cols,person){
    return '<thead><tr><th class="ljpc8-place">#</th><th class="ljpc8-name">'+(person?'Jugador':'Equipo')+'</th>'+cols.map(c=>'<th>'+esc(c[0])+'</th>').join('')+'</tr></thead>';
  }
  function renderTeam(){
    const cols=teamColumns(state.teamMetric);
    if(!cols)return note(state.teamMetric==='disparos'?'La liga no publica estadísticas verificadas de disparos para esta categoría.':'Los datos de distribución y pases todavía no forman parte del registro oficial de la liga.');
    const index=cols[0][1],asc=state.teamMetric==='defensa'||state.teamMetric==='porteria';
    const rows=stand().filter(r=>number(r[index])!==null).slice().sort((a,b)=>(number(b[index])-number(a[index]))*(asc?-1:1));
    if(!rows.length)return note('Aún no hay registros de equipos publicados para esta categoría.');
    return '<div class="ljpc8-tablebox"><table class="ljpc8-table">'+tableHead(cols,false)+
      '<tbody>'+rows.map((r,i)=>'<tr><td class="ljpc8-place">'+String(i+1).padStart(2,'0')+'</td><td class="ljpc8-name"><span class="ljpc8-person">'+logo(r[1])+'<span><b>'+esc(r[1])+'</b><small>'+categoryCaption()+'</small></span></span></td>'+
        cols.map(([,n],j)=>'<td class="'+(j===0?'ljpc8-leading':'')+'">'+value(r[n])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  }
  function players(){
    const map=new Map(); const key=(n,t)=>normalized(n)+'|'+normalized(t);
    function get(n,t){if(!n||!t)return null;const k=key(n,t);if(!map.has(k))map.set(k,{name:String(n),team:String(t),goals:null,yellow:null,red:null,cedulas:null});return map.get(k);}
    scorers().forEach(r=>{const p=get(r[1],r[2]);if(p)p.goals=number(r[3]);});
    Object.values(dFor().player_usage||{}).forEach(p=>{if(!p?.name||!p?.team)return;const x=get(p.name,p.team);if(x)x.cedulas=number(p.cedulas);});
    (dFor().cards||[]).forEach(g=>(g?.rows||[]).forEach(r=>{
      if(!Array.isArray(r))return;
      const type=normalized(r[0]),field=type.includes('amar')?'yellow':type.includes('roj')?'red':null;
      if(!field)return;
      const p=get(r[1],r[2]);if(p)p[field]=number(r[3]);
    }));
    return [...map.values()];
  }
  function playerColumns(metric){
    switch(metric){
      case 'clave':return [['Goles', 'goals'],['Cédulas','cedulas'],['Amarillas','yellow'],['Rojas','red']];
      case 'goles':case 'ataque':return [['Goles','goals']];
      case 'disciplina':return [['Amarillas','yellow'],['Rojas','red']];
      default:return null;
    }
  }
  function renderPlayers(){
    const cols=playerColumns(state.playerMetric);
    if(!cols)return note(state.playerMetric==='porteria'?'Las atajadas y porterías a cero no se registran oficialmente por jugador.':state.playerMetric==='defensa'?'Los registros de recuperaciones y acciones defensivas por jugador no están publicados oficialmente.':'No se publican registros verificables para este filtro de jugadores.');
    const rows=players().filter(p=>cols.some(([,k])=>number(p[k])!==null)).sort((a,b)=>{
      for(const [,k] of cols){const d=(number(b[k])??-1)-(number(a[k])??-1);if(d)return d;}
      return a.name.localeCompare(b.name,'es-MX');
    });
    if(!rows.length)return note('No hay jugadores con datos oficialmente registrados en esta categoría.');
    return '<div class="ljpc8-tablebox"><table class="ljpc8-table">'+tableHead(cols,true)+
    '<tbody>'+rows.map((p,i)=>'<tr><td class="ljpc8-place">'+String(i+1).padStart(2,'0')+'</td><td class="ljpc8-name"><span class="ljpc8-person">'+logo(p.team)+'<span><b>'+esc(p.name)+'</b><small>'+esc(p.team)+'</small></span></span></td>'+
      cols.map(([,k],j)=>'<td class="'+(j===0?'ljpc8-leading':'')+'">'+value(p[k])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  }
  function filters(page){
    const arr=page==='equipos'?TEAM_METRICS:PLAYER_METRICS,selected=page==='equipos'?state.teamMetric:state.playerMetric;
    return '<div class="ljpc8-metric-line"><button type="button" class="ljpc8-scroll-arrow" data-ljpc8-scroll="-1" aria-label="Más filtros a la izquierda">'+icon('left')+'</button>'+
    '<div class="ljpc8-filters" data-ljpc8-filter-rail>'+arr.map(([id,t])=>'<button type="button" class="ljpc8-pill '+(selected===id?'active':'')+'" data-ljpc8-metric="'+id+'" aria-pressed="'+(selected===id)+'">'+esc(t)+'</button>').join('')+'</div>'+
    '<button type="button" class="ljpc8-scroll-arrow" data-ljpc8-scroll="1" aria-label="Más filtros a la derecha">'+icon('right')+'</button></div>';
  }
  function statistics(page){
    const isTeam=page==='equipos';
    return '<section class="ljpc8-stats"><h2>Estadísticas de '+(isTeam?'equipo':'jugadores')+'</h2><p class="ljpc8-category-note">'+categoryCaption()+' · Información registrada por la Liga Juventino Rosas</p>'+
      filters(page)+(isTeam?renderTeam():renderPlayers())+
      '<p class="ljpc8-footnote">Sólo registros disponibles en la fuente oficial de la liga. «—» indica información no publicada.</p></section>';
  }
  function featureScorer(){
    const arr=scorers().slice().sort((a,b)=>(number(b[3])??0)-(number(a[3])??0));
    const leaders=arr.slice(0,2);
    return '<section class="ljpc8-scorer"><h2>Máximo goleador</h2>'+
    '<div class="ljpc8-scorer-feature">'+(leaders.length?leaders.map((r,i)=>
      '<article class="ljpc8-scorer-hero"><div class="ljpc8-scorer-art">'+logo(r[2])+'</div><div class="ljpc8-scorer-info"><small>'+(i===0?'1.º GOLEADOR':'2.º GOLEADOR')+' · '+categoryCaption()+'</small><b>'+esc(r[1])+'</b><span>'+esc(r[2])+'</span></div><strong>'+value(r[3])+'<small>GOLES</small></strong></article>'
    ).join(''):note('Aún no se ha publicado una tabla de goleo para esta categoría.'))+'</div>'+
    '<div class="ljpc8-scorer-grid">'+arr.slice(2,18).map((r,i)=>'<div class="ljpc8-scorer-tile">'+logo(r[2])+'<span><b>'+esc(r[1])+'</b><small>'+esc(r[2])+'</small></span><strong>'+value(r[3])+'<small>goles</small></strong></div>').join('')+'</div>'+
    '<button type="button" class="ljpc8-primary" data-ljpc8-go="pc-scorers">Ver tabla de goleadores '+icon('right')+'</button></section>';
  }
  function book(){
    return '<section class="ljpc8-book"><div class="ljpc8-book-copy"><span class="ljpc8-kicker">LIGA JUVENTINO ROSAS · DATOS OFICIALES</span>'+
      '<h2>Libro de estadísticas de la Liga Juventino Rosas</h2><p>Consulta las estadísticas de esta temporada, las tablas de todas las categorías, los máximos goleadores y los registros deportivos disponibles.</p></div>'+
      '<div class="ljpc8-book-layout"><div class="ljpc8-book-photo"><img alt="Fútbol de la Liga Juventino Rosas" loading="lazy" src="./assets/home-players-user.png"></div>'+
      '<div class="ljpc8-book-info"><h3>Un archivo de nuestra historia deportiva</h3><p>La información de los equipos, jugadores y campeonatos se presenta con datos publicados por la liga. Las cifras ausentes se mantienen sin inventar.</p>'+
      '<p>Explora los resultados, el rendimiento y las historias de las cinco categorías oficiales.</p>'+
      '<div class="ljpc8-book-links"><button type="button" data-ljpc8-go="pc-standings">'+icon('stats')+' Clasificación</button><button type="button" data-ljpc8-go="history">'+icon('book')+' Historia</button></div></div></div>'+
      '<div class="ljpc8-book-footer"><button type="button" class="ljpc8-primary" data-ljpc8-go="pc-data">Consultar estadísticas '+icon('right')+'</button>'+
      '<button type="button" class="ljpc8-quiet" data-ljpc8-go="pc-fixtures">Ver partidos ›</button></div></section>';
  }
  function performance(){
    const teams=stand().filter(r=>r[1]).slice(0,11).map(r=>r[1]);
    return '<section class="ljpc8-performance"><div class="ljpc8-performance-hero"><img alt="Jugadores de la Liga Juventino Rosas" src="./assets/home-players-user.png" loading="lazy">'+
      '<div class="ljpc8-performance-overlay"><span>ZONA DE RENDIMIENTO</span><h2>Performance Zone</h2><p>Rendimiento y pasión por la Liga Juventino Rosas</p></div></div>'+
      '<div class="ljpc8-performance-rail" aria-label="Equipos destacados">'+teams.map(t=>'<button type="button" data-ljpc8-go="teams">'+logo(t)+'<span>'+esc(t)+'</span></button>').join('')+'</div>'+
      '<div class="ljpc8-performance-stories">'+[
        ['Estadísticas de los clubes','Análisis oficial por categoría','pc-data','stats'],
        ['Resultados y próximos juegos','Jornadas y partidos de la liga','pc-fixtures','trophy'],
        ['Los mejores goleadores','Jugadores y goles anotados','pc-scorers','player'],
        ['Vídeos y momentos','Noticias deportivas y transmisiones','video','video'],
        ['Historia de los equipos','Campeones y temporadas','history','book'],
        ['Comparar equipos','Rendimiento de los clubes','pc-team-compare','stats']
      ].map(([t,d,route,symbol])=>'<button type="button" class="ljpc8-performance-story" data-ljpc8-go="'+route+'"><span class="ljpc8-story-art">'+icon(symbol)+'</span><b>'+esc(t)+'</b><small>'+esc(d)+'</small><span class="ljpc8-story-open">'+icon('right')+'</span></button>').join('')+'</div>'+
      '<button type="button" class="ljpc8-primary" data-ljpc8-go="safe-performance">Abrir Performance Zone '+icon('right')+'</button></section>';
  }
  const pages={equipos:()=>statistics('equipos'),jugadores:()=>statistics('jugadores'),goleador:featureScorer,libro:book,rendimiento:performance};
  function paint(root,force=false){
    const bar=root.querySelector('.ljpc8-tabs'),space=root.querySelector('.ljpc8-workspace');
    if(!bar||!space)return;
    const sig=[state.page,state.teamMetric,state.playerMetric,state.category,state.revision].join('|');
    if(!force&&currentRoot===root&&sig===currentSignature)return;
    currentSignature=sig;currentRoot=root;
    bar.querySelectorAll('[data-ljpc8-page]').forEach(b=>{
      const yes=b.dataset.ljpc8Page===state.page;
      b.classList.toggle('active',yes);b.setAttribute('aria-selected',String(yes));
    });
    const original=root.querySelector('.ljpc8-original');
    if(original)original.hidden=state.page!=='resumen';
    space.hidden=state.page==='resumen';
    if(state.page!=='resumen')space.innerHTML=(pages[state.page]||pages.equipos)();
    else space.innerHTML='';
  }
  function mount(){
    if(!active())return;
    const root=document.querySelector('#screen .ljr-uefa-root');
    if(!root||!official())return;
    const cat=category();if(state.category!==cat){state.category=cat;state.revision++;}
    if(!root.querySelector(':scope > .ljpc8-tabs')){
      const original=document.createElement('div');original.className='ljpc8-original';
      while(root.firstChild)original.append(root.firstChild);
      const bar=document.createElement('div');bar.className='ljpc8-tabs';bar.setAttribute('role','tablist');
      bar.setAttribute('aria-label','Secciones de estadísticas para PC');
      bar.innerHTML=PAGES.map(([key,title])=>'<button role="tab" type="button" data-ljpc8-page="'+key+'" aria-selected="'+(key==='resumen')+'">'+esc(title)+'</button>').join('');
      const space=document.createElement('div');space.className='ljpc8-workspace';space.hidden=true;
      root.append(bar,original,space);
    }
    paint(root);
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount();});}
  document.addEventListener('click',e=>{
    if(!active()||!(e.target instanceof Element))return;
    const hit=e.target.closest('.ljr-uefa-root [data-ljpc8-page],.ljr-uefa-root [data-ljpc8-metric],.ljr-uefa-root [data-ljpc8-scroll],.ljr-uefa-root [data-ljpc8-go]');
    if(!hit)return;
    if(hit.hasAttribute('data-ljpc8-page')){state.page=hit.dataset.ljpc8Page;paint(hit.closest('.ljr-uefa-root'));return;}
    if(hit.hasAttribute('data-ljpc8-metric')){const k=state.page==='equipos'?'teamMetric':'playerMetric';state[k]=hit.dataset.ljpc8Metric;paint(hit.closest('.ljr-uefa-root'));return;}
    if(hit.hasAttribute('data-ljpc8-scroll')){hit.parentElement?.querySelector('[data-ljpc8-filter-rail]')?.scrollBy({left:Number(hit.dataset.ljpc8Scroll)*240,behavior:'smooth'});return;}
    const next=hit.dataset.ljpc8Go;
    if(/^[a-z][A-Za-z0-9-]*$/.test(next||''))location.hash='#/'+next;
  });
  document.addEventListener('click',e=>{
    if(!active()||!e.target?.closest?.('.ljpc-categories'))return;
    setTimeout(schedule,90);
  },false);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('resize',schedule);
  window.addEventListener('ljr:official-data',()=>{state.revision++;schedule();});
  function boot(){
    const screen=document.getElementById('screen');
    if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:true});
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();