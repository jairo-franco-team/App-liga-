import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../pc-exact-original-20261011.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../src/desktop-shell.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/pc-independent-finish-20261011.css',import.meta.url),'utf8');
const footer=fs.readFileSync(new URL('../src/pc-independent-finish-20261011.js',import.meta.url),'utf8');

test('PC iframe measures natural content instead of its own viewport height',()=>{
 assert.match(html,/height:max-content!important/);
 assert.match(html,/min-height:0!important/);
 assert.match(html,/Math\.max\(content\.offsetHeight,content\.scrollHeight\)/);
 assert.doesNotMatch(html,/Math\.max\(body\.scrollHeight,doc\.scrollHeight,rootHeight\)/);
 assert.doesNotMatch(shell,/Math\.ceil\(height\+3\)/);
 assert.match(shell,/const target=Math\.ceil\(height\)/);
});

test('measurement stays constant when host height changes but content does not',()=>{
 const begin=html.indexOf('let pending=false,lastSentHeight=0;');
 const end=html.indexOf("window.addEventListener('message'",begin);
 assert.ok(begin>0&&end>begin);
 const frag=html.slice(begin,end);
 const sent=[],raf=[];
 const content={offsetHeight:2100,scrollHeight:2100};
 const context={
  document:{querySelector:s=>s.includes('page layout container')?content:null,
    body:{scrollHeight:3500},documentElement:{scrollHeight:3500}},
  window:{scrollY:0},Math,Number,
  requestAnimationFrame:fn=>raf.push(fn),
  notify:msg=>sent.push(msg)
 };
 const requestHeight=vm.runInNewContext(frag+';requestHeight',context);
 requestHeight();raf.shift()();
 assert.equal(sent.length,1);
 assert.equal(sent[0].height,2100);
 context.document.body.scrollHeight=9000;
 context.document.documentElement.scrollHeight=9000;
 requestHeight();raf.shift()();
 assert.equal(sent.length,1,'viewport changes must not re-send an unchanged height');
 content.offsetHeight=2180;content.scrollHeight=2180;
 requestHeight();raf.shift()();
 assert.equal(sent.length,2);
 assert.equal(sent[1].height,2180);
});

test('PC hides duplicate mobile neon bar without altering mobile styles',()=>{
 assert.match(css,/ljpc-independent-finish #app > \.topbar/);
 assert.match(css,/display:none!important;visibility:hidden!important/);
 assert.match(html,/background glows container"\]\{\s*display:none!important/);
 assert.match(footer,/Only monitor the route content/);
 assert.doesNotMatch(footer,/new MutationObserver\(schedule\)\.observe\(document\.body/);
});

test('vertical gestures are batched once per animation frame',()=>{
 assert.match(html,/let contact=null,pendingPan=0,panScheduled=false/);
 assert.match(html,/function queueVerticalPan\(value\)/);
 assert.match(html,/requestAnimationFrame\(\(\)=>\{/);
 assert.match(html,/queueVerticalPan\(-dy\)/);
 assert.match(html,/queueVerticalPan\(e\.deltaY\)/);
 assert.match(shell,/scrollDesktopFlow\(dy\)/);
});

test('forced PC mode on Android unlocks the mobile 100dvh overflow lock',()=>{
 const mobileScrollCss=fs.readFileSync(new URL('../src/v768-scroll-chrome.css',import.meta.url),'utf8');
 assert.match(mobileScrollCss,/@media\(max-width:1023px\)/);
 assert.match(mobileScrollCss,/height:100dvh!important/);
 assert.match(css,/@media\(max-width:1023px\)/);
 assert.match(css,/html\.ljpc-unified-pc:has\(body\.lj-desktop\.ljpc-independent-finish\)/);
 assert.match(css,/overflow-x:hidden!important;overflow-y:auto!important/);
 assert.match(css,/overflow-x:hidden!important;overflow-y:visible!important/);
});
