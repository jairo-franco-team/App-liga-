import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/v1435-jrcontrol-tools-single-surface.css');
const html=read('index.html');
const home=read('src/v1434-home-competition-original-colors.css');
test('V1435 sólo afecta JR Control y Más herramientas',()=>{
  assert.match(css,/data-app-route="ligaControl"/);
  assert.match(css,/data-app-route="adminFut"/);
  assert.match(css,/data-app-route="leagueTools"/);
  assert.match(css,/\.v562-page\[data-v563-control\]/);
  assert.match(css,/\.v726-tool-card\.v734-tool-card/);
  assert.doesNotMatch(css,/data-app-route="(?:home|competition|profile|teams|fantasy|more)"/);
  assert.doesNotMatch(css,/pointer-events\s*:|display\s*:|position\s*:|visibility\s*:/);
});
test('V1435 elimina fondos interiores sin ocultar acciones',()=>{
  assert.match(css,/\.v734-tool-go/);
  assert.match(css,/\.v734-tool-details/);
  assert.match(css,/background:transparent!important/);
  assert.match(css,/linear-gradient\(180deg,#2452c2/);
  assert.match(css,/\.v563-tool-search > input/);
});
test('Inicio y Competición recuperados y Perfil queda al final',()=>{
  assert.match(home,/background-color:#000144!important/);
  assert.match(home,/background-color:#000040!important/);
  const a='src/v1434-home-competition-original-colors.css?v=20261011-v1434-restaurar-marino-original';
  const b='src/v1435-jrcontrol-tools-single-surface.css?v=20261011-v1435-jr-tools-only';
  const c='src/profile-first-screenshot-restore.css?v=20261011-v1423-colores-anteriores';
  assert.equal(html.split(b).length-1,1);
  assert.ok(html.indexOf(a)<html.indexOf(b));
  assert.ok(html.indexOf(b)<html.indexOf(c));
  assert.doesNotMatch(html.slice(html.indexOf(c)+c.length),/<link\s+rel="stylesheet"/);
  assert.doesNotMatch(html,/v1434-teams-gradient-global-background\.css/);
});
