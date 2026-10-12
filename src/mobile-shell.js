/* Small route-specific additions; no polling and no layout scan on scroll. */
(()=>{
 'use strict';
 const mobile=()=>new URLSearchParams(location.search).get('mode')!=='desktop'&&(['mobile','apk'].includes(new URLSearchParams(location.search).get('mode'))||innerWidth<1024);
 const native=()=>window.Capacitor?.isNativePlatform?.()||new URLSearchParams(location.search).get('mode')==='apk';
 const route=()=>location.hash.replace(/^#\/?/,'').split('?')[0]||'home';
 let queued=false;
 function patch(){
  queued=false;if(!mobile())return;
  const root=document.getElementById('screen');if(!root)return;
  const r=route();
  if(native()&&['more','appInstall','quiniela','leagueTools'].includes(r)&&!root.querySelector('[data-ljr-offline-link]')){
   const link=document.createElement('button');link.type='button';link.className='ljr-offline-link';link.dataset.ljrOfflineLink='';link.dataset.route='offlineHub';link.textContent='◉ Sin internet · datos y herramientas guardadas';root.append(link);
  }
  const games=new Set(['quizArena','moreLess','moreLessHub','fantasy','fantasyTeam','predictor','quiniela']);
  let back=document.getElementById('ljr-game-back');
  if(games.has(r)){
   if(!back){back=document.createElement('button');back.id='ljr-game-back';back.type='button';back.className='ljr-game-back';back.setAttribute('aria-label','Regresar');back.textContent='←';back.onclick=()=>window.LJR_APP_BACK?.();document.body.append(back)}
  }else back?.remove();
 }
 function schedule(){if(queued)return;queued=true;queueMicrotask(patch)}
 function boot(){
  const root=document.getElementById('screen');
  if(root)new MutationObserver(records=>{if(records.some(r=>r.target===root))schedule()}).observe(root,{childList:true});
  addEventListener('hashchange',schedule);addEventListener('online',schedule);addEventListener('offline',schedule);patch();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
