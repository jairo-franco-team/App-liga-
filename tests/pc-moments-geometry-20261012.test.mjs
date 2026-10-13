import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../src/pc-native-media-match-density-20261012.css',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const marker='/* pc-moments-geometry-safe-20261012-v2';
const scoped=css.slice(css.indexOf(marker));

test('Momentos PC honors the desktop-forced class when route attributes are absent',()=>{
  assert.ok(css.includes(marker),'the isolated PC geometry fix is present');
  assert.match(scoped,/html\.ljpc-forced-desktop body\.ljpc-native-route #screen \.v26-moments-page/);
  assert.match(scoped,/html\.ljpc-unified-pc body\.lj-desktop #screen \.v26-moments-page/);
  assert.match(scoped,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
  assert.match(scoped,/@media\(max-width:950px\)/);
  assert.match(scoped,/@media\(max-width:620px\)/);
  assert.doesNotMatch(scoped,/html\.preview-mobile|html\.preview-apk/);
});

test('Desktop Momentos retains the original videos, sprite shapes and short-card ratio',()=>{
  assert.match(scoped,/aspect-ratio:368 \/ 538!important/);
  assert.match(scoped,/\.v26-moment-card\.v26-moment-short/);
  assert.match(scoped,/aspect-ratio:368 \/ 335!important/);
  assert.match(main,/class="v26-moments-grid"/);
  assert.match(main,/data-video=/);
  assert.doesNotMatch(scoped,/display:none!important|pointer-events:none!important/);
});
