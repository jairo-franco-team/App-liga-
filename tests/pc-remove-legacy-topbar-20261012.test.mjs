import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const script=read('src/pc-remove-legacy-topbar-20261012.js');
const css=read('src/pc-remove-legacy-topbar-20261012.css');
const html=read('index.html');

function run(mode,width){
 const operations=[],listeners={},screen={};
 const app={
  querySelectorAll:()=>bar.isConnected?[bar]:[],
  querySelector:()=>screen,
  insertBefore(node,target){node.isConnected=true;operations.push(['restore',target===screen||target===screen.nextSibling])}
 };
 screen.parentNode=app;
 const bar={
  isConnected:true,nextSibling:screen,
  remove(){this.isConnected=false;operations.push(['detach'])}
 };
 const document={
  readyState:'complete',
  getElementById:key=>key==='app'?app:null,
  documentElement:{classList:{toggle:(key,flag)=>operations.push(['class',key,flag])}},
  addEventListener:(event,fn)=>{listeners[event]=fn}
 };
 const window={addEventListener:(event,fn)=>{listeners[event]=fn}};
 const location={search:'?mode='+mode};
 const context={window,document,location,URLSearchParams,innerWidth:width,
  MutationObserver:class{observe(){}},
  requestAnimationFrame:cb=>cb()
 };
 vm.runInNewContext(script,context);
 return {operations,bar,location,listeners,context};
}

test('Legacy banner is actually removed from desktop DOM and cannot reappear from CSS',()=>{
 assert.doesNotThrow(()=>new vm.Script(script));
 const desktop=run('desktop',390);
 assert.equal(desktop.bar.isConnected,false);
 assert.ok(desktop.operations.some(row=>row[0]==='detach'));
 assert.match(script,/node\.remove\(\)/);
 assert.match(script,/querySelectorAll\(':scope > header\.topbar, :scope > \.topbar'\)/);
 assert.doesNotMatch(script,/document\.querySelectorAll\('\.topbar'\)/);
});

test('Mobile/APK retain the banner and a return from desktop restores it',()=>{
 for(const mode of ['mobile','apk']){
  const result=run(mode,1440);
  assert.equal(result.bar.isConnected,true,mode+' must retain original header');
  assert.ok(!result.operations.some(row=>row[0]==='detach'));
 }
 const small=run('',390);
 assert.equal(small.bar.isConnected,true);
 const desktop=run('desktop',390);
 desktop.location.search='?mode=mobile';
 desktop.listeners.resize();
 assert.equal(desktop.bar.isConnected,true);
 assert.ok(desktop.operations.some(row=>row[0]==='restore'));
});

test('Fallback CSS and cache keys are PC-scoped, and protected Perfil stays last',()=>{
 assert.match(css,/html\.ljpc-no-legacy-topbar body\[data-app-route\] #app > header\.topbar/);
 assert.match(css,/html\.ljpc-unified-pc body\[data-app-route\] #app > header\.topbar/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
 assert.match(html,/pc-remove-legacy-topbar-20261012\.css\?v=pc-topbar-removed-20261012-dom-detach-v2/);
 assert.match(html,/pc-remove-legacy-topbar-20261012\.js\?v=pc-topbar-removed-20261012-dom-detach-v2/);
 assert.ok(html.indexOf('pc-remove-legacy-topbar-20261012.css')<html.indexOf('profile-first-screenshot-restore.css'));
});