import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('src/pc-native-admin-geometric-lock-20261012.css');
const index=read('index.html');
const nav=read('src/pc-native-reference-sections-20261011.js');

test('Desktop-only admin geometry is installed with mobile profiles excluded',()=>{
 assert.match(index,/pc-native-admin-geometric-lock-20261012\.css/);
 assert.match(css,/:is\(html\.ljpc-pc-native-mode,html\.ljpc-forced-desktop\) body\.ljpc-native-route/);
 assert.match(nav,/!\['mobile','apk'\]\.includes\(MODE\(\)\)/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
 assert.ok(index.indexOf('pc-native-admin-geometric-lock-20261012.css')<index.indexOf('profile-first-screenshot-restore.css'));
});
test('JR Control and management panels use dense columns without replacing click controls',()=>{
 for(const token of ['.v60-tool-grid','.v726-tool-grid','.v562-page[data-v563-control] .v562-list','.ljpc-toolhub .ljpc-hub-grid'])
  assert.ok(css.includes(token),token);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/#screen \[hidden\]\{\s*display:none!important/);
 assert.doesNotMatch(css,/pointer-events:none|visibility:visible|display:block!important\s*;\s*\/\*.*admin/);
});

test('Mid-sized PC layouts retain compact three-column tools before tablet collapse',()=>{
 assert.match(css,/@media\(min-width:821px\) and \(max-width:1100px\)/);
 assert.match(css,/@media\(max-width:820px\)/);
 assert.match(css,/\.ljpc-toolhub \.ljpc-hub-grid\{\s*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
 assert.match(css,/@media\(max-width:610px\)/);
});
