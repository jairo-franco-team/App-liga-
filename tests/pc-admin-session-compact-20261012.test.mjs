import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../src/pc-admin-shortcuts-compact-20261012.css',import.meta.url),'utf8');
const gate=fs.readFileSync(new URL('../src/pc-admin-session-gate-20261012.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('PC administration shortcuts are four compact columns, not 104px cards',()=>{
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/height:40px!important/);
 assert.match(css,/@layer ljr-reference-surfaces/);
 assert.match(css,/@layer ljr-captured-design/);
 assert.match(css,/body\.lj-desktop/);
 assert.match(css,/ljpc-admin-auth/);
});
test('Admin session required; remembered token alone is insufficient',()=>{
 assert.match(gate,/result\?\.admin/);
 assert.match(gate,/classList\.toggle\('ljpc-admin-auth',Boolean\(allowed&&desktop\(\)\)\)/);
 assert.doesNotMatch(gate,/localStorage|sessionStorage/);
 assert.match(css,/display:none!important/);
 assert.match(html,/pc-admin-session-gate-20261012\.js/);
});
test('Mobile and APK modes excluded',()=>{
 assert.match(gate,/mode\(\)!=='mobile'&&mode\(\)!=='apk'/);
 assert.match(gate,/classList\.contains\('ljpc-unified-pc'\)/);
 assert.doesNotMatch(gate,/classList\.contains\('lj-desktop'\)/);
});
