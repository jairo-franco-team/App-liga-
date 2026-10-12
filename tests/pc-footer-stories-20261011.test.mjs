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
test('Home PC footer is appended LAST inside screen after native modules',()=>{
 assert.match(nav,/const home=route\(\)==='home'&&!!screen\.querySelector\('#ljpc-exact-html-home'\)/);
 assert.match(nav,/if\(home\)\{[\s\S]*?footer!==screen\.lastElementChild\)[\s\S]*?screen\.appendChild\(footer\)/);
 assert.match(nav,/else if\(footer\.parentElement!==document\.body\)/);
 assert.doesNotMatch(nav,/if\(footer&&footer\.parentElement!==document\.body\)document\.body\.appendChild/);
 assert.match(css,/#screen > #ljpc-unified-pc-footer \{[\s\S]*?order:999!important;/);
 assert.match(css,/#screen > #ljpc-unified-pc-footer \{[\s\S]*?align-self:stretch!important;/);
});
test('Circles use their own vertical space below scoreboard',()=>{
 assert.match(home,/data-name="stories list container"/);
 assert.match(home,/data-name="stories wrapper"/);
 assert.match(nav,/\[data-name="stories list container"\]\{margin-top:40px!important;/);
 assert.match(nav,/padding-top:12px!important;padding-bottom:16px!important/);
 assert.match(nav,/\[data-name="stories wrapper"\]\{align-items:flex-start!important\}/);
});
test('Mobile and APK selectors are never modified by PC-only styles',()=>{
 assert.match(index,/src\/pc-unified-navigation-20261011\.css/);
 assert.match(nav,/const desktop=\(\)=>!\['mobile','apk'\]\.includes\(mode\(\)\)/);
 assert.match(css,/html\.ljpc-unified-pc body\.lj-desktop\[data-app-route="home"\] #screen > #ljpc-unified-pc-footer/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
});
