import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/pc-footer-flow-columns-20261012.css');
const js=read('src/pc-footer-flow-columns-20261012.js');
const html=read('index.html');
test('footer has five columns on wide desktop including forced desktop on phone',()=>{
 assert.match(css,/@media\(min-width:900px\)/);
 assert.match(css,/grid-template-columns:minmax\(170px,1\.5fr\) repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/> section\{\s*grid-column:auto!important;grid-row:auto!important/s);
});
test('mid-size and narrow desktop flows never place five sections on top of each other',()=>{
 assert.match(css,/@media\(min-width:680px\) and \(max-width:899px\)/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/@media\(max-width:679px\)/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
 assert.match(css,/\.ljpc-u-footer-brand\{\s*grid-column:1\/-1!important/s);
});
test('footer remains in document flow without an artificial last-card spacer',()=>{
 assert.match(css,/> #ljpc-unified-pc-footer\{\s*display:block!important;position:relative!important/);
 assert.match(css,/margin:var\(--ljpc-footer-clearance,12px\) 0 0!important/);
 assert.match(js,/footer\.style\.setProperty\('--ljpc-footer-clearance','0px'\)/);
 assert.match(js,/document\.body\.appendChild\(footer\)/);
 assert.doesNotMatch(js,/getBoundingClientRect\(\)|footRect\.top-prev/);
 assert.doesNotThrow(()=>new vm.Script(js));
});
test('footer controls remain routed and mobile/apk are explicitly excluded',()=>{
 const nav=read('src/pc-unified-navigation-20261011.js');
 assert.match(nav,/group\('DESCUBRE'/);
 assert.match(nav,/group\('COMPETICIÓN'/);
 assert.match(nav,/group\('HERRAMIENTAS'/);
 assert.match(js,/!\['mobile','apk'\]\.includes\(mode\(\)\)/);
 assert.match(css,/html\.ljpc-unified-pc body\.lj-desktop/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
});
test('footer layout is loaded exactly once and Profile protection stays last',()=>{
 const cp='src/pc-footer-flow-columns-20261012.css';
 const sp='src/pc-footer-flow-columns-20261012.js';
 assert.equal(html.split(cp).length-1,1);
 assert.equal(html.split(sp).length-1,1);
 assert.ok(html.indexOf(cp)<html.indexOf('src/profile-first-screenshot-restore.css'));
 assert.doesNotMatch(html.slice(html.indexOf('src/profile-first-screenshot-restore.css')),/<link\s+rel="stylesheet"/);
});
