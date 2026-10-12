import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const desktop=fs.readFileSync(new URL('../src/desktop-shell.js',import.meta.url),'utf8');
const embedded=fs.readFileSync(new URL('../pc-exact-original-20261011.html',import.meta.url),'utf8');
const i=desktop.indexOf('function scrollDesktopFlow(delta){');
const j=desktop.indexOf("window.addEventListener('message'",i);
assert.ok(i>=0&&j>i,'the desktop scrolling bridge exists');
const code=desktop.slice(i,j);
const run=(root,app,screen,delta)=>{
 const fallback=[];
 const doc={scrollingElement:root,documentElement:root,
   getElementById:id=>id==='app'?app:id==='screen'?screen:null};
 const context={document:doc,window:{scrollBy:args=>fallback.push(args)},Math};
 const fn=vm.runInNewContext(code+';scrollDesktopFlow',context);
 fn(delta);
 return fallback;
};
// Browser scrollTop is clamped at the scroll boundary; a plain object is not.
const box=(scrollHeight,clientHeight,initial=0)=>{
 let top=initial;
 return {scrollHeight,clientHeight,
  get scrollTop(){return top},
  set scrollTop(value){top=Math.max(0,Math.min(Math.max(0,scrollHeight-clientHeight),value))}
 };
};
test('desktop scroll bridge advances document when available',()=>{
 const root=box(5000,700,100);
 const fallback=run(root,null,null,180);
 assert.equal(root.scrollTop,280);
 assert.equal(fallback.length,0);
});
test('desktop scroll bridge bypasses clipped root that reports overflow but cannot move',()=>{
 const root={scrollHeight:5000,clientHeight:700,get scrollTop(){return 0},set scrollTop(_){}};
 const app=box(4200,700,10);
 const fallback=run(root,app,null,120);
 assert.equal(app.scrollTop,130);
 assert.equal(fallback.length,0);
});
test('at document boundary, a scrollable PC content owner can finish the page',()=>{
 const root=box(2200,700,1500);
 const screen=box(1900,700,240);
 const fallback=run(root,null,screen,90);
 assert.equal(screen.scrollTop,330);
 assert.equal(fallback.length,0);
});
test('no scrollable owner forwards wheel or touch delta to Chrome viewport',()=>{
 const fallback=run(box(500,600,0),null,null,130);
 assert.equal(fallback.length,1);
 assert.equal(fallback[0].top,130);
});
test('embedding and desktop gating preserve mobile and APK page logic',()=>{
 assert.match(desktop,/e\.origin!==location\.origin\|\|!desktop\(\)/);
 assert.match(desktop,/e\.data\.kind==='pan'/);
 assert.match(desktop,/const nextWidth=innerWidth/);
 assert.match(desktop,/Math\.abs\(nextWidth-lastOuterWidth\)<3/);
 assert.match(embedded,/id="ljpc-embedded-tight-flow"/);
 assert.match(embedded,/id="ljpc-story-fixtures-interaction"/);
 assert.match(embedded,/notify\(\{kind:'height',height:h\}\)/);
});
