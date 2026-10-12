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
  const gameRoot=r==='quizArena'?(document.getElementById('v612-quiz-portal')||root):r.startsWith('moreLess')?(document.getElementById('v543-moreless-portal')||root):root;
  const originalBack=[...gameRoot.querySelectorAll('[data-v531-quiz-back],[data-v531-more-back],.v589-back,.v766-back,.v22-back,[data-v48-game-back]')].find(el=>el.getClientRects().length&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden');
  if(games.has(r)&&!originalBack){
   if(!back){back=document.createElement('button');back.id='ljr-game-back';back.type='button';back.className='ljr-game-back';back.setAttribute('aria-label','Regresar');back.textContent='←';back.onclick=()=>window.LJR_APP_BACK?window.LJR_APP_BACK():window.LJR_NAVIGATION?.back?.();document.body.append(back)}
  }else back?.remove();
 }
 function schedule(){if(queued)return;queued=true;queueMicrotask(patch)}
 function boot(){
  const root=document.getElementById('screen');
  if(root)new MutationObserver(records=>{
   const controls='[data-v531-view],[data-v531-quiz-back],[data-v531-more-back],[data-v48-game-back]';
   if(records.some(r=>r.target===root||Array.from(r.addedNodes).some(n=>n.nodeType===1&&(n.matches?.(controls)||n.querySelector?.(controls)))))schedule();
  }).observe(document.body,{childList:true,subtree:true});
  addEventListener('hashchange',schedule);addEventListener('online',schedule);addEventListener('offline',schedule);patch();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
