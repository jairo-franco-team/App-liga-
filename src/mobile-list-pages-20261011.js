/* Mobile lists page their source data before creating row markup. Full datasets remain
   available to filters, searches, exports and actions. PC keeps its existing layout. */
(function(){
 'use strict';
 if(window.LJR_MOBILE_LISTS)return;
 const mobile=()=>new URLSearchParams(location.search).get('mode')!=='desktop'&&matchMedia('(max-width: 760px)').matches;
 let pages={};const providers=new Map();
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function page(name,rows,signature='',desktopLimit){
  if(!mobile())return desktopLimit===undefined?rows:rows.slice(0,desktopLimit);
  signature=String(signature);
  if(!pages[name]||pages[name].signature!==signature)pages[name]={signature,limit:6};
  return rows.slice(0,pages[name].limit);
 }
 function more(name){if(pages[name])pages[name].limit+=6}
 function button(name,total){
  if(!mobile()||!pages[name]||pages[name].limit>=total)return '';
  return '<button type="button" class="ljr-mobile-list-more btn outline" data-ljr-list-more="'+esc(name)+'">Ver más <span aria-hidden="true">↓</span></button>';
 }
 function bind(root,name,render){
  const b=root?.querySelector('[data-ljr-list-more="'+name+'"]');
  if(b)b.onclick=()=>{
   const screen=document.getElementById('screen');
   const position={top:window.scrollY||0,left:window.scrollX||0,y:screen?.scrollTop||0,x:screen?.scrollLeft||0};
   const restorePosition=()=>requestAnimationFrame(()=>{
    if(screen){screen.scrollTop=position.y;screen.scrollLeft=position.x}
    window.scrollTo({top:position.top,left:position.left,behavior:'instant'});
   });
   more(name);const result=render();
   if(result?.then)result.then(restorePosition);else restorePosition();
  };
 }
 function snapshot(){return {pages:JSON.parse(JSON.stringify(pages)),views:Object.fromEntries([...providers].map(([name,p])=>[name,p.capture()]))}}
 function restore(state){
  if(!state)return;
  pages=JSON.parse(JSON.stringify(state.pages||{}));
  for(const [name,value] of Object.entries(state.views||{}))providers.get(name)?.restore(value);
 }
 window.LJR_MOBILE_LISTS={page,more,button,bind,snapshot,restore,register:(name,provider)=>providers.set(name,provider)};
})();
