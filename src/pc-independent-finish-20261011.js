/* PC / Liga Juventino Rosas · only desktop context. Never edits mobile routes,
 * authentication, official fixtures, or persisted data. */
(function(){
 'use strict';
 if(window.__LJPC_INDEPENDENT_FINISH_20261011__)return;
 window.__LJPC_INDEPENDENT_FINISH_20261011__=true;
 const mode=()=>new URLSearchParams(location.search).get('mode')||'';
 const desktop=()=>!['mobile','apk'].includes(mode())&&
   (mode()==='desktop'||innerWidth>=1024)&&
   document.documentElement.classList.contains('ljpc-unified-pc')&&
   document.body?.classList.contains('lj-desktop');
 const route=()=>String(location.hash||'').replace(/^#\/?/,'').split('?')[0]||'home';
 const icons={
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  trophy:'<path d="M8 21h8m-4-4v4M7 4h10v6a5 5 0 0 1-10 0V4ZM7 6H4v3a4 4 0 0 0 4 4M17 6h3v3a4 4 0 0 1-4 4"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  phone:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/>',
  award:'<circle cx="12" cy="8" r="5"/><path d="m8.5 13-2 9L12 19l5.5 3-2-9"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15"/>',
  layers:'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',
  star:'<path d="m12 2 3.1 6.5 7.1 1-5.1 5 .9 7-6-3.2-6 3.2.9-7-5.1-5 7.1-1L12 2Z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/>'
 };
 const about=[
  ['book','about'],['trophy','pc-fixtures'],['shield','rulebook'],
  ['phone','home'],['award','history'],['map','weatherFields'],
  ['layers','pc-standings'],['star','history'],['target','pc-scorers'],
  ['music','history'],['clock','history'],['mail','jrControl']
 ];
 function iconSVG(key){
  return '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[key]||icons.star)+'</svg>';
 }
 function enhanceAbout(){
  if(route()!=='about')return;
  document.querySelectorAll('#screen .ds-about-grid .ds-about-card').forEach((article,i)=>{
   const [symbol,destination]=about[i]||['star','about'];
   const art=article.querySelector('.ds-about-art');
   if(art&&art.dataset.ljpcArt!=='1'){
     if(!art.children.length)art.innerHTML='<span class="ljpc-about-icon">'+iconSVG(symbol)+'</span>';
     art.dataset.ljpcArt='1';
   }
   if(!article.querySelector('.ljpc-about-open')){
     const detail=article.querySelector('.ds-about-copy');
     const btn=document.createElement('button');
     btn.type='button';btn.className='ljpc-about-open';
     btn.dataset.ljpcUGo=destination;
     btn.textContent='Ver sección ›';
     detail?.append(btn);
   }
  });
 }
 function normalizeFooter(){
  const footer=document.getElementById('ljpc-unified-pc-footer');
  if(!footer)return;
  // The old shell and an embedded iframe also have footers: only this one remains.
  footer.setAttribute('aria-label','Información y colaboradores de la Liga');
  if(footer.parentElement!==document.body||footer!==document.body.lastElementChild){
    document.body.appendChild(footer);
  }
 }
 let cachedRoute='';
 let pending=false;
 let sizing=false;
 function patch(){
  if(!desktop()){
    const body=document.body;
    body?.classList.remove('ljpc-independent-finish');
    const screen=document.getElementById('screen');
    if(screen&&screen.dataset.ljpcFinishMinHeight==='1'){
      screen.style.removeProperty('min-height');
      delete screen.dataset.ljpcFinishMinHeight;
    }
    return;
  }
  document.body.classList.add('ljpc-independent-finish');
  const r=route();
  const screen=document.getElementById('screen');
  if(!screen)return;
  if(r!==cachedRoute){
    cachedRoute=r;
    if(screen.dataset.ljpcFinishMinHeight==='1'){
      screen.style.removeProperty('min-height');
      delete screen.dataset.ljpcFinishMinHeight;
    }
  }
  enhanceAbout();
  normalizeFooter();
  // UEFA-style PC fixtures and standings have flow-sized layouts. Do not
  // expand their screen from old shell bounds: doing so leaves a huge empty
  // navy area after the compact table/footer in forced desktop browser mode.
  // These guards never match the native competition route, mobile or APK.
  if(r==='pc-fixtures'&&screen.querySelector(':scope > .u18-root')){
    if(screen.dataset.ljpcFinishMinHeight==='1'){
      screen.style.removeProperty('min-height');
      delete screen.dataset.ljpcFinishMinHeight;
    }
    return;
  }
  if(r==='pc-standings'&&screen.querySelector(':scope > .u18-root')){
    if(screen.dataset.ljpcFinishMinHeight==='1'){
      screen.style.removeProperty('min-height');
      delete screen.dataset.ljpcFinishMinHeight;
    }
    return;
  }
  // Only grow the document flow when a component has escaped its parent's
  // bounding box. This prevents the footer from cutting across native cards.
  if(sizing)return;
  sizing=true;
  const rect=screen.getBoundingClientRect();
  if(rect.width>0 && rect.height>0){
    let overflow=0;
    const blocks=Array.from(screen.children).filter(el=>el.offsetParent!==null);
    for(const child of blocks){
      const bottom=child.getBoundingClientRect().bottom;
      if(Number.isFinite(bottom))overflow=Math.max(overflow,bottom-rect.top);
    }
    const desired=Math.ceil(overflow);
    if(desired>rect.height+8&&desired<50000){
      const current=parseFloat(screen.style.minHeight)||0;
      if(desired>current+8){screen.style.setProperty('min-height',desired+'px','important');screen.dataset.ljpcFinishMinHeight='1'}
    }else if(screen.dataset.ljpcFinishMinHeight==='1'&&rect.height>desired+60){
      screen.style.removeProperty('min-height');delete screen.dataset.ljpcFinishMinHeight;
    }
  }
  sizing=false;
 }
 function schedule(){
  if(pending)return;pending=true;
  requestAnimationFrame(()=>{pending=false;patch()});
 }
 function boot(){
  const screen=document.getElementById('screen');
  // Only monitor the route content: observing body while moving the footer
  // used to schedule repeated layout writes on every generated navigation update.
  if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:false});
  window.addEventListener('hashchange',schedule);
  window.addEventListener('resize',schedule);
  window.addEventListener('ljr:official-data',schedule);
  document.addEventListener('load',e=>{if(e.target?.id==='ljpc-exact-html-home')schedule()},true);
  schedule();setTimeout(schedule,700);setTimeout(schedule,2100);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();