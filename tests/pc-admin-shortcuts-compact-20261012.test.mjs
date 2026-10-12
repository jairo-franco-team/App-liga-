import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const load=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=load('src/pc-admin-shortcuts-compact-20261012.css');
const legacy=load('src/v1441-captured-design.css');
const index=load('index.html');

test('Corrige sólo los accesos de administración del escritorio',()=>{
  assert.match(css,/html\.ljpc-unified-pc body\.liga-editor/);
  assert.match(css,/:has\(>button\[data-cms-open\]\)/);
  assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
  assert.doesNotMatch(css,/\{[^}]*display\s*:\s*none\s*!important/);
});
test('Tarjetas compactas prevalecen sobre el antiguo mínimo de 104 px',()=>{
  assert.match(legacy,/min-height:104px!important/);
  assert.match(css,/@layer ljr-captured-design/);
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
  assert.match(css,/min-height:46px!important/);
  assert.match(css,/min-height:42px!important/);
  assert.match(css,/width:17px!important;height:17px!important/);
});
test('La hoja es única y posterior a los estilos que agrandaban los cuadros',()=>{
  const file='src/pc-admin-shortcuts-compact-20261012.css';
  assert.equal(index.split(file).length-1,1);
  assert.ok(index.indexOf(file)>index.indexOf('src/v1441-captured-design.css'));
  assert.match(index,/pc-admin-shortcuts-compact-20261012.css\?v=pc-admin-mini-20261012-v2/);
});
