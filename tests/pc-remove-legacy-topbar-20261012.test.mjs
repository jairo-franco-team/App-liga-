import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const script=read('src/pc-remove-legacy-topbar-20261012.js');
const css=read('src/pc-remove-legacy-topbar-20261012.css');
const index=read('index.html');

function run(mode,width){
 const events=new Map(),calls=[],values=new Map();
 const style={
  getPropertyValue:key=>values.get(key)?.value||'',
  getPropertyPriority:key=>values.get(key)?.priority||'',
  setProperty:(key,value,priority)=>{calls.push(['set',key,value,priority]);values.set(key,{value,priority})},
  removeProperty:key=>{calls.push(['remove',key]);values.delete(key)}
 };
 const bar={style};
 const document={
  readyState:'loading',
  documentElement:{classList:{toggle:(name,value)=>calls.push(['class',name,value])}},
  querySelector:selector=>selector.startsWith('#app >')?bar:null,
  getElementById:id=>id==='app'?{}:null,
  addEventListener:(event,callback)=>events.set(event,callback)
 };
 const window={addEventListener:()=>{}};
 const context={window,document,location:{search:'?mode='+mode},
  URLSearchParams,innerWidth:width,WeakMap,MutationObserver:class{observe(){} disconnect(){}},
  requestAnimationFrame:callback=>callback()};
 vm.runInNewContext(script,context);
 events.get('DOMContentLoaded')();
 return {calls,values};
}

test('Only desktop hides the old mobile header while the desktop menu stays',()=>{
 assert.doesNotThrow(()=>new vm.Script(script));
 for(const mode of ['mobile','apk']){
  const {calls}=run(mode,1440);
  assert.ok(!calls.some(x=>x[0]==='set'),mode+' must not mask mobile topbar');
 }
 assert.ok(!run('',390).calls.some(x=>x[0]==='set'));
 const {calls}=run('desktop',390);
 assert.ok(calls.some(x=>x.join('|')==='set|display|none|important'));
 assert.match(css,/html\.ljpc-unified-pc body #app\.app-shell > header\.topbar/);
 assert.match(css,/html\.ljpc-no-legacy-topbar body #app\.app-shell > header\.topbar/);
 assert.match(css,/#ljpc-unified-pc-header/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
});
test('Both isolated topbar assets are linked before the last protected profile CSS',()=>{
 assert.match(index,/pc-remove-legacy-topbar-20261012\.css\?v=pc-topbar-removed-20261012-v1/);
 assert.match(index,/pc-remove-legacy-topbar-20261012\.js\?v=pc-topbar-removed-20261012-v1/);
 assert.ok(index.indexOf('pc-remove-legacy-topbar-20261012.css')<index.indexOf('profile-first-screenshot-restore.css'));
});
