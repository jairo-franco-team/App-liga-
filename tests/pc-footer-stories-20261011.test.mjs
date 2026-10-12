import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const load=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const nav=load('src/pc-unified-navigation-20261011.js');
const css=load('src/pc-unified-navigation-20261011.css');
const home=load('pc-exact-original-20261011.html');
const index=load('index.html');

test('Universal PC header and footer script remains parseable',()=>{
 assert.doesNotThrow(()=>new vm.Script(nav));
});
test('One PC footer stays at end of body, never bounced into screen',()=>{
 const finish=load('src/pc-independent-finish-20261011.js');
 assert.match(nav,/footer!==document\.body\.lastElementChild/);
 assert.match(nav,/document\.body\.appendChild\(footer\)/);
 assert.doesNotMatch(nav,/screen\.appendChild\(footer\)/);
 assert.match(finish,/if\(footer\.parentElement!==document\.body\|\|footer!==document\.body\.lastElementChild\)/);
 assert.match(css,/html\.ljpc-unified-pc body #ljpc-unified-pc-footer/);
});
test('PC circles do not leave an empty band after the fixtures; carousels stay interactive',()=>{
 assert.match(home,/data-name="stories list container"/);
 assert.match(home,/data-name="stories wrapper"/);
 assert.match(nav,/html\.ljpc-embedded-home #root \.ucl \[data-name="stories list container"\]\{/);
 assert.match(nav,/const desktop=\(\)=>!\['mobile','apk'\]\.includes\(mode\(\)\)/);
 assert.match(nav,/margin-top:0!important;margin-bottom:0!important/);
 assert.match(nav,/padding-top:2px!important;padding-bottom:4px!important/);
 assert.doesNotMatch(nav,/margin-top:40px!important/);
 assert.match(home,/id="ljpc-pc-story-rail-fix"/);
 assert.match(home,/overflow-x:auto!important/);
 assert.match(home,/scroll-snap-type:x proximity/);
 const script=home.match(/<script id="ljpc-story-fixtures-interaction">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script,'interactive carousel script present');
 assert.doesNotThrow(()=>new vm.Script(script));
 for(const label of ['previous story button','next story button','previous fixtures button','next fixtures button'])assert.ok(script.includes(label),label);
 assert.match(script,/list\.scrollBy\(/);
 assert.match(script,/addEventListener\('touchmove'/);
 assert.match(script,/kind:'pan'/);
 const shell=load('src/desktop-shell.js');
 assert.match(shell,/e\.data\.kind==='pan'/);
 assert.match(shell,/window\.scrollBy\(/);
});
test('Iframe selector beats the original embedded !important margin and preserves footer placement',()=>{
 const embedded=home.match(/html\.ljpc-embedded-home #root \.ucl \[data-name="stories list container"\]/);
 assert.ok(embedded,'original desktop iframe contains the tighter embedded selector');
 assert.ok(nav.includes('html.ljpc-embedded-home #root .ucl [data-name="stories list container"]'));
 assert.match(nav,/clear:none!important/);
 assert.doesNotMatch(nav,/clear:both!important/);
 assert.match(nav,/footer!==document\.body\.lastElementChild/);
 assert.doesNotMatch(nav,/screen\.appendChild\(footer\)/);
});
test('Mobile and APK selectors are never modified by PC-only styles',()=>{
 assert.match(index,/src\/pc-unified-navigation-20261011\.css/);
 assert.match(nav,/const desktop=\(\)=>!\['mobile','apk'\]\.includes\(mode\(\)\)/);
 assert.match(css,/html\.ljpc-unified-pc body\.lj-desktop\[data-app-route="home"\] > #ljpc-unified-pc-footer/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
});
