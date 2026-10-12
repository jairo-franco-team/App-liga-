import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const shell=fs.readFileSync(new URL('../src/desktop-shell.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/pc-independent-finish-20261011.css',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function simulate(mode){
 const declaration='function hideNativeMobileHeader(){';
 const start=shell.indexOf(declaration);
 const end=shell.indexOf('function scrollDesktopFlow(delta){',start);
 assert.ok(start>=0&&end>start,'desktop renderer must own suppression of legacy mobile topbar');
 const changed=[],native={
   style:{setProperty:(name,value,priority)=>changed.push([name,value,priority])},
   setAttribute:(key,value)=>changed.push([key,value]),
   removeAttribute:(key)=>changed.push([key,null])
 };
 const nav={style:{setProperty:()=>{throw Error('PC navbar must stay unchanged')}}};
 const doc={querySelector:selector=>selector==='#app > header.topbar'?native:selector==='#ljpc-unified-pc-header'?nav:null};
 const ctx={document:doc,desktop:()=>mode==='desktop'};
 const fn=vm.runInNewContext(shell.slice(start,end)+';hideNativeMobileHeader',ctx);
 fn();
 return changed;
}
test('PC removes only the native mobile topbar from the visible layout',()=>{
 const changes=simulate('desktop');
 assert.ok(changes.some(([k,v,p])=>k==='display'&&v==='none'&&p==='important'));
 assert.ok(changes.some(([k,v,p])=>k==='height'&&v==='0px'&&p==='important'));
 assert.ok(changes.some(([k,v])=>k==='aria-hidden'&&v==='true'));
 assert.match(shell,/hideNativeMobileHeader\(\);\s*const h=host\(\)/);
});
test('mobile and APK do not inherit desktop header suppression',()=>{
 assert.deepEqual(simulate('mobile'),[]);
 assert.deepEqual(simulate('apk'),[]);
});
test('desktop CSS hides legacy mobile header without hiding functional PC navbar',()=>{
 assert.match(css,/html\.ljpc-forced-desktop body #app\s*>\s*header\.topbar/);
 assert.match(css,/html\.ljpc-unified-pc body\.lj-desktop #app\s*>\s*header\.topbar/);
 assert.match(css,/display:none!important/);
 assert.doesNotMatch(css,/#ljpc-unified-pc-header\s*\{\s*display:none/);
 assert.match(index,/pc-independent-finish-20261011\.css\?v=/);
});
