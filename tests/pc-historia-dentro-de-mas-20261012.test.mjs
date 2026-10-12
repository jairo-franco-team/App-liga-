import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const nav=read('src/pc-unified-navigation-20261011.js');
const hub=read('src/pc-history-hub-20261011.js');
const css=read('src/pc-history-hub-20261011.css');
const page=read('index.html');

test('History PC stays inside Mas without adding a top-level navigation item',()=>{
 assert.doesNotThrow(()=>new vm.Script(nav));
 assert.doesNotThrow(()=>new vm.Script(hub));
 const top=nav.match(/const NAV=\[([\s\S]*?)\];/)?.[1]||'';
 assert.match(top,/\['Más','pc-tools'\]/);
 assert.doesNotMatch(top,/\['Historia','history'\]/);
 assert.match(nav,/\['Historia','historia','history-toggle'\]/);
 assert.match(nav,/\['Temporadas','temporadas','history-child'\]/);
 assert.match(nav,/\['Estadísticas históricas','estadisticas','history-child'\]/);
 assert.match(nav,/\['Más títulos','titulos','history-child'\]/);
 assert.match(nav,/data-ljpc-u-history-toggle/);
 assert.match(nav,/aria-expanded="false"/);
 assert.match(nav,/data-ljpc-u-history-section/);
});

test('Mas dropdown is scrollable and does not clip Historia in narrow desktop layout',()=>{
 assert.match(css,/details\[data-ljpc-u-group="Más"\]\[open\]/);
 assert.match(css,/overflow:visible!important/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/overscroll-behavior:contain/);
 assert.match(css,/html\.ljpc-unified-pc body\.lj-desktop/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
});

function simulate(mode){
 const domWrites=[];
 const registered={};
 const screen={
  classList:{remove:()=>domWrites.push('remove-class')},
  querySelector:()=>null,
  insertAdjacentHTML:(position,markup)=>domWrites.push({position,hasMenu:markup.includes('ljpc-pc-history-hub')})
 };
 const document={
  readyState:'loading',
  addEventListener:(name,fn)=>{registered[name]=fn},
  getElementById:(id)=>id==='screen'?screen:null
 };
 const window={addEventListener:()=>{}};
 const context={
  window,document,location:{search:'?mode='+mode,hash:'#/history'},innerWidth:1366,
  URLSearchParams,requestAnimationFrame:fn=>fn(),
  MutationObserver:class{observe(){}}
 };
 vm.runInNewContext(hub,context);
 registered.DOMContentLoaded();
 return domWrites;
}
test('Mobile and APK never mutate Historia; PC mounts on its live native route',()=>{
 assert.deepEqual(simulate('mobile'),[]);
 assert.deepEqual(simulate('apk'),[]);
 assert.deepEqual(simulate('desktop'),[{position:'afterbegin',hasMenu:true}]);
 assert.match(hub,/if\(!screen\|\|!pc\(\)\)return/);
 assert.match(hub,/screen\.insertAdjacentHTML\('afterbegin',markup\(\)\)/);
 assert.match(hub,/data-ljpc-h-panel="equipos"/);
 assert.match(hub,/data-ljpc-h-panel="noticias"/);
 assert.match(hub,/data-ljpc-h-panel="historia"/);
 assert.match(hub,/data-ljpc-h-panel="sobre"/);
});

test('Cache-busted PC history assets are included in the site entry point',()=>{
 assert.match(page,/pc-history-hub-20261011\.css\?v=pc-history-hub-oct11-v2/);
 assert.match(page,/pc-history-hub-20261011\.js\?v=pc-history-hub-oct11-v2/);
});
