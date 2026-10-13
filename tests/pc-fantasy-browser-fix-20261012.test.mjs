import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/pc-fantasy-browser-fix-20261012.css');
const gate=read('src/pc-admin-session-gate-20261012.js');
test('Fantasy PC in document flow instead of fixed portrait at left',()=>{
 assert.match(css,/html\.ljpc-unified-pc body\[data-app-route="fantasy"\]/);
 assert.match(css,/position:relative!important;inset:auto!important/);
 assert.match(css,/transform:none!important/);
 assert.match(css,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
});
test('Mobile and APK code not modified and platform blocked in gate',()=>{
 assert.match(gate,/mode\(\)!=='mobile'&&mode\(\)!=='apk'/);
 assert.match(gate,/isNativePlatform/);
});
test('Administrator shortcuts require verified server account',()=>{
 assert.match(gate,/media\.api\('me'\)/);
 assert.match(gate,/result\?\.admin/);
 assert.match(css,/@layer ljr-captured-design/);
 assert.match(css,/not\(\.ljpc-admin-auth\)/);
});
test('Native Fantasy buttons remain clickable and anchored in PC grid',()=>{
 const source=read('src/v14-fantasy-reference.js');
 assert.match(source,/querySelectorAll\('\.v22-shirt-hit'\)/);
 assert.match(css,/\.v22-shirt-hit-center/);
});
test('New CSS is included before protected Profile final style',()=>{
 const html=read('index.html');
 const a=html.indexOf('pc-fantasy-browser-fix-20261012.css');
 const b=html.indexOf('profile-first-screenshot-restore.css');
 assert.ok(a>=0&&b>a);
});