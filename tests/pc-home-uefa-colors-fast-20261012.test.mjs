import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(new URL('../'+p, import.meta.url),'utf8');
const pc=read('pc-exact-original-20261011.html');
const css=read('src/pc-home-uefa-colors-scroll-fast-20261012.css');
const handset=read('src/pc-forced-handset-layout-20261012.js');
const nav=read('src/pc-unified-navigation-20261011.js');

test('Paleta UEFA sólo en iframe de Inicio PC',()=>{
  assert.match(pc,/pc-home-uefa-colors-scroll-fast-20261012\.css\?v=pc-home-uefa-fast-20261012-v1/);
  assert.doesNotMatch(read('index.html'),/href="\.\/src\/pc-home-uefa-colors-scroll-fast-20261012\.css/);
  assert.match(css,/data-name="moments section container"/);
  assert.match(css,/data-name="news section container"/);
  assert.match(css,/data-name="video section container"/);
  assert.match(css,/data-name="spotlight videos section"/);
  assert.match(css,/#f2f3f7|--pc-paper:#f2f3f7/);
  assert.match(css,/#123cff/);
});
test('Imágenes autorizadas, tarjetas accesibles y carruseles intactos',()=>{
  assert.match(pc,/data-name="news card image"[^>]+src="\.\/deportiva-sur-partido\.jpg"/);
  assert.match(css,/scroll-snap-type:x proximity/);
  assert.match(css,/calc\(\(100% - 22px\)\/3\)/);
  assert.doesNotMatch(css,/pointer-events:none!important/);
  assert.doesNotMatch(css,/display:none!important;[^}]*data-pc-route/);
});
test('Menos repintados y menos observadores profundos sólo en modo PC',()=>{
  assert.match(css,/backdrop-filter:none!important/);
  assert.match(css,/background glow wrapper/);
  assert.match(nav,/new MutationObserver\(schedule\)\.observe\(app,\{childList:true\}\)/);
  assert.match(nav,/new MutationObserver\(schedule\)\.observe\(screen,\{childList:true\}\)/);
  assert.doesNotMatch(nav,/observe\(app,\{subtree:true,childList:true\}\)/);
  assert.match(handset,/clamp\(69px,19vw,108px\)/);
});
