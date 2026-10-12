import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/pc-fixtures-compact-layout-20261012.css');
const bridge=read('src/desktop-mobile-function-bridge.js');
const html=read('index.html');

test('carga estilo compacto de partidos PC y renueva el JS en el navegador',()=>{
  assert.match(html,/pc-fixtures-compact-layout-20261012\.css\?v=pc-fixtures-no-holes-oct12-v2/);
  assert.match(html,/desktop-mobile-function-bridge\.js\?v=pc-fixtures-compact-rows-oct12-v1/);
  assert.doesNotThrow(()=>new vm.Script(bridge));
});
test('los equipos y el horario están en tres columnas y los metadatos debajo a la izquierda',()=>{
  const start=bridge.indexOf('function renderFixtures(');
  const end=bridge.indexOf('function enhanceMore()',start);
  const body=bridge.slice(start,end);
  assert.match(body,/ljpc-team ljpc-team-home/);
  assert.match(body,/ljpc-team ljpc-team-away/);
  assert.match(body,/ljpc-match-details/);
  assert.match(body,/ljpc-match-date/);
  assert.match(body,/ljpc-match-status/);
  assert.match(body,/ljpc-match-venue/);
  assert.match(body,/class="ljpc-match-details"/);
  assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\) max-content!important/);
  assert.match(css,/grid-column:1\/-1!important/);
  assert.match(css,/text-align:left!important/);
});
test('elimina franjas vacías sólo en la ruta Partidos PC',()=>{
  assert.match(css,/#screen:has\(> \.ds-page \.ljpc-function-root\[data-ljpc-function-route="pc-fixtures"\]\)/);
  assert.match(css,/\.ds-page:has\(\.ljpc-function-root\[data-ljpc-function-route="pc-fixtures"\]\)/);
  assert.match(css,/min-height:0!important/);
  assert.match(css,/\.ds-pagehead/);
  assert.match(css,/\.ds-content/);
});
test('sin cambios al modo móvil ni al APK y sin otras rutas PC',()=>{
  assert.match(bridge,/\['mobile','apk'\]\.includes\(qs\(\)\.get\('mode'\)\)/);
  for(const sel of css.match(/(^|\n)(?:html[^\n]*\{)/g)||[]){
    assert.ok(sel.includes('html.ljpc-unified-pc:not(.ljpc18-active) body.lj-desktop') || sel.includes('html.ljpc18-active[data-ljpc18-route="pc-fixtures"] body.lj-desktop'),sel);
  }
  assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
  assert.doesNotMatch(css,/\[data-ljpc-function-route="pc-calendar"\]/);
});
test('CSS compacto mantiene llaves emparejadas y puntos de corte',()=>{
  let balance=0;
  for(const c of css){if(c==='{')balance++;else if(c==='}')balance--;}
  assert.equal(balance,0);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/\.u18-matchcard/);
  assert.match(css,/\.u18-matchteams/);
});
