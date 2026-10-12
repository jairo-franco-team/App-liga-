/* V1230 — imágenes móviles optimizadas para todas las rutas.
 * Respeta escudos, imágenes prioritarias, modales, capturas y controles.
 * Nunca cambia src, srcset, tamaños, posiciones, eventos ni estilos visuales.
 */
(function(){
'use strict';
if(window.__LJR_GLOBAL_MOBILE_PERF_V1230__)return;
window.__LJR_GLOBAL_MOBILE_PERF_V1230__=true;

let pending=new Set(),scheduled=false,observer=null;
const LIMIT=50;
const skipped='[data-no-lazy],[data-export],[data-capture],[data-html2canvas],'+
  '.html2canvas-container,.modal,[role="dialog"],.liga-media-modal,'+
  '.topbar,.bottom-nav,.v164-history-head,.v20-performance-hero';
function canTouch(image){
  if(!image||image.tagName!=='IMG'||!image.isConnected)return false;
  if(image.hasAttribute('loading')||image.hasAttribute('fetchpriority'))return false;
  if(image.closest(skipped))return false;
  return true;
}
function enhance(image){
  if(!canTouch(image))return;
  // Native lazy loading already knows the viewport, and starts visible images
  // immediately. Measuring each newly inserted image forced style/layout while
  // dozens of legacy renderers were still mounting the same route.
  image.decoding='async';
  if(!image.complete||!image.naturalWidth)image.loading='lazy';
}
function drain(){
  scheduled=false;
  if(document.hidden)return;
  let count=0;
  for(const element of pending){
    pending.delete(element);
    if(element.isConnected)enhance(element);
    if(++count>=LIMIT)break;
  }
  if(pending.size)schedule();
}
function schedule(){
  if(scheduled||document.hidden||!pending.size)return;
  scheduled=true;
  requestAnimationFrame(drain);
}
function addElement(element){
  if(element.nodeType!==1)return;
  if(element.tagName==='IMG')pending.add(element);
  // Procesa únicamente el subárbol nuevo, nunca recorre toda la página
  // tras cada cambio de un contador o etiqueta.
  if(typeof element.querySelectorAll==='function'){
    element.querySelectorAll('img').forEach(el=>pending.add(el));
  }
}
function start(){
  if(observer||!document.body)return;
  addElement(document.getElementById('screen')||document.body);
  observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes)addElement(node);
    }
    if(pending.size)schedule();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  schedule();
}
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)schedule();
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
