import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/v1398-junta-calendario-warm-compact.css',import.meta.url),'utf8');

test('capa caliente de juntas/calendarios al final sin duplicarse',()=>{
  const sheet='v1398-junta-calendario-warm-compact.css?v=20261010-v1398-warm-no-gaps';
  assert.equal(html.split(sheet).length-1,1);
  assert.ok(html.lastIndexOf(sheet)>html.lastIndexOf('v1393-admin-luminous-warm.css'));
});

test('la correccion del hueco de Chrome Android evita flex-basis vertical fantasma',()=>{
  const source=css.slice(css.indexOf('.v1130-source {'),css.indexOf('.v1130-source-actions {'));
  assert.match(source,/flex-flow:column nowrap!important/);
  assert.match(source,/height:auto!important/);
  assert.match(source,/flex:0 0 auto!important/);
  assert.match(source,/flex-basis:auto!important/);
  assert.match(source,/min-height:0!important/);
});

test('paleta y alcance: sin codigo JS, respetando botones y secciones ocultas',()=>{
  assert.match(css,/v875-meeting-modal/);
  assert.match(css,/v1130-calendar-pro/);
  assert.match(css,/--v1398-gold:#ffdfa6/);
  assert.match(css,/\.v1240-local/);
  assert.match(css,/focus-visible/);
  assert.doesNotMatch(css,/display:none!important/);
  assert.doesNotMatch(css,/pointer-events:none/);
});
