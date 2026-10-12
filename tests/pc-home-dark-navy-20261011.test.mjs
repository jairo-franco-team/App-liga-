import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const desktop=read('pc-exact-original-20261011.html');
const editorial=read('src/desktop-browser-editorial-20261011.css');
const shell=read('src/desktop-shell.js');
const nav=read('src/pc-unified-navigation-20261011.css');
const index=read('index.html');

test('PC original HOME restores navy background on Moments, Noticias and videos',()=>{
 assert.ok(desktop.includes('ljpc-original-dark-background-restore'));
 assert.match(desktop,/#root \.ucl\[data-name="page layout container"\]/);
 assert.match(desktop,/#040c1c/);
 for(const name of ['moments section container','news section container','video section container']){
  assert.ok(desktop.includes('data-name="'+name+'"'),name);
  assert.ok(editorial.includes('[data-name="'+name+'"]'),name);
 }
 assert.doesNotMatch(editorial,/background:#f1f4fa/);
 assert.doesNotMatch(editorial,/background:#eef2f8!important/);
 assert.ok(editorial.includes('background:#0b2562!important'));
 assert.ok(editorial.includes('background:#0c235e!important'));
});
test('white horizontal divider is disabled and no white sponsor band remains',()=>{
 assert.match(editorial,/\[data-name="top divider line"\]\{display:none!important\}/);
 assert.match(desktop,/\[data-name="top divider line"\]\{display:none!important\}/);
 assert.ok(nav.includes('background:#071b34'));
 assert.ok(nav.includes('background:linear-gradient(180deg,#08253e,#06172f)!important'));
 assert.doesNotMatch(nav,/background:#fff;color:#8a94a8/);
 assert.ok(nav.includes('#screen #ljpc-exact-html-home'));
});
test('PC HTML, JS and CSS all have fresh cache keys while mobile/APK remain untouched',()=>{
 assert.match(desktop,/pc-original-navy-20261011-restore-v1/);
 assert.match(shell,/pc-exact-original-20261011\.html\?v=20261011-circulos-scroll-v2/);
 assert.match(index,/desktop-shell\.js\?v=20261011-(?:navy-original-restore-v1|compact-iframe-v1|carousel-scroll-v2)/);
 assert.match(index,/pc-unified-navigation-20261011\.css\?v=(?:pc-header-unified-20261011-navy-v2|pc-footer-natural-scroll-20261011-v1)/);
 assert.doesNotThrow(()=>new vm.Script(shell));
 assert.match(nav,/html\.ljpc-unified-pc body/);
 assert.match(shell,/mode\(\)==='desktop'\|\|\(!\['mobile','apk'\]/);
});
test('Original desktop content geometry and routes remain intact',()=>{
 for(const marker of ['header navigation wrapper','fixtures strip container','stories list container','moments section container','news section container','video highlights section','footer content container'])
  assert.ok(desktop.includes('data-name="'+marker+'"'),marker);
 assert.equal((desktop.match(/<a\b[^>]*data-name="moment card \d+"/g)||[]).length,7);
 assert.ok(desktop.includes('data-pc-route="standings"'));
 assert.ok(desktop.includes('data-pc-route="moments"'));
});
