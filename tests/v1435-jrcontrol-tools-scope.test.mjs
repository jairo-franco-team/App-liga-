import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../src/v1435-jrcontrol-tools-single-surface.css',import.meta.url),'utf8');
const home=readFileSync(new URL('../src/v1434-home-competition-original-colors.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('V1435 sólo afecta JR Control y Más herramientas',()=>{
  assert.match(css,/data-app-route="leagueTools"/);
  assert.match(css,/data-v563-control/);
  assert.match(css,/\.v561-modal/);
  assert.doesNotMatch(css,/data-app-route="home"|data-app-route="competition"|data-app-route="teams"|data-app-route="matches"|data-app-route="standings"/);
});

test('V1435 elimina fondos interiores sin ocultar acciones',()=>{
  assert.match(css,/background:transparent!important/);
  assert.match(css,/border-bottom:1px solid rgba\(165,204,255,\.22\)!important/);
  assert.doesNotMatch(css,/display\s*:\s*none|visibility\s*:\s*hidden|pointer-events\s*:\s*none/);
});

test('Inicio y Competición recuperados y Perfil queda al final',()=>{
  assert.match(home,/body\[data-app-route="home"\]/);
  assert.match(home,/body\[data-app-route="competition"\]/);
  assert.match(home,/background-color:#000040!important/);
  const a='src/v1434-home-competition-original-colors.css?v=20261011-v1434-restaurar-marino-original';
  const b='src/v1435-jrcontrol-tools-single-surface.css?v=';
  const c='src/profile-first-screenshot-restore.css?v=20261011-v1423-colores-anteriores';
  assert.equal(html.split(b).length-1,1);
  assert.ok(html.indexOf(a)<html.indexOf(b));
  assert.ok(html.indexOf(b)<html.indexOf(c));
  const tail=html.slice(html.indexOf(c)+c.length).replace(/<link[^>]*v1464-mobile-header-logo-performance\.css[^>]*>/gi,'');
  assert.doesNotMatch(tail,/<link\s+rel="stylesheet"/);
  assert.doesNotMatch(html,/v1434-teams-gradient-global-background\.css/);
});
