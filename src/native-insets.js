/* Independent of optional feature bundles: native bridge is injected before page scripts. */
(()=>{
 'use strict';const cap=window.Capacitor;
 if(!cap?.isNativePlatform?.()&&!window.androidBridge)return;
 document.documentElement.classList.add('ljr-insets-loading');
 const sync=()=>{
  const request=cap?.nativePromise?cap.nativePromise('LigaInsets','getInsets',{}):cap?.registerPlugin?.('LigaInsets').getInsets();
  return Promise.resolve(request).then(insets=>{
   if(!insets)return;
   for(const side of ['top','bottom','left','right'])document.documentElement.style.setProperty('--ljr-native-'+side,Math.max(0,Number(insets[side])||0)+'px');
   document.body.classList.add('ljr-native-insets');window.LJR_SCROLL_CHROME?.refresh?.();
  }).catch(()=>{}).finally(()=>document.documentElement.classList.remove('ljr-insets-loading'));
 };
 sync();addEventListener('resize',sync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
})();
