import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/pc-reference-geometry-20261011.css');
const index=read('index.html');
const shell=read('src/desktop-shell.js');
const main=read('src/main.js');

test('reference geometry only applies to explicitly requested PC; does not affect mobile or APK',()=>{
 assert.ok(index.includes('src/pc-reference-geometry-20261011.css'));
 assert.match(css,/html\.preview-desktop body\.lj-desktop/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk|body\.preview-mobile/);
 assert.doesNotMatch(css,/(^|\n)\s*(body|html|:root|\.topbar|\.screen|\.app-shell)\s*\{/);
 assert.match(index,/html\.classList\.add\('preview-desktop'\)/);
 assert.match(main,/get\('mode'\)==='desktop' && state\.route==='home'/);
});

test('desktop shell emits mounted event and preserves native feature routes',()=>{
 assert.doesNotThrow(()=>new vm.Script(shell));
 assert.match(shell,/ljr:desktop-shell-ready/);
 assert.match(shell,/window\.LJR_PC_NATIVE_ROUTES\?\.has\(r\)/);
 assert.match(shell,/h\.innerHTML=r==='home'\?home\(\):generic\(r\)/);
});

test('Spanish Liga branding is used and UEFA assets or statistics are never copied',()=>{
 assert.match(shell,/LIGA JUVENTINO/);
 assert.doesNotMatch(css,/UEFA|CHAMPIONS|crypto\.com/i);
 assert.doesNotMatch(css,/https?:\/\//);
});
