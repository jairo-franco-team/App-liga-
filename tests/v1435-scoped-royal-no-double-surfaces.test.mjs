import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL('../'+path, import.meta.url), 'utf8');
const html = read('index.html');
const css = read('src/v1435-scoped-jr-control-tools-editor-surfaces.css');

test('V1435 está cargada para móvil sin reintroducir fondo universal',()=>{
  assert.equal((html.match(/v1435-scoped-jr-control-tools-editor-surfaces\.css/g)||[]).length,1);
  assert.ok(html.indexOf('v1435-scoped-jr-control-tools-editor-surfaces.css') <
    html.indexOf('profile-first-screenshot-restore.css'));
  assert.ok(!html.includes('v1434-teams-gradient-global-background.css'));
  assert.ok(!html.includes('v1428-more-reference-gradient-fix.css'));
});

test('V1435 afecta solo JR Control, Más herramientas y el modal del editor',()=>{
  for(const route of ['ligaControl','adminFut','leagueTools'])
    assert.ok(css.includes('[data-app-route="'+route+'"]'));
  for(const scope of ['.v562-page[data-v563-control]', '.v562-sync-grid>article',
    '.v562-panel','.v726-tool-section','.v726-quick-card',
    '.v734-tool-detail-panel','section.ljr-editor-dialog','.ljr-editor-note'])
    assert.ok(css.includes(scope), scope);
  for(const route of ['home','competition','profile','teams','fantasy','video','more'])
    assert.ok(!css.includes('[data-app-route="'+route+'"]'),'cambiaba '+route);
  assert.doesNotMatch(css,/\b(?:pointer-events|display|visibility|position|width|height|z-index)\s*:/);
});

test('V1435 respeta texto y botones sin capas adicionales',()=>{
  assert.match(css,/background:transparent!important/);
  assert.match(css,/background-image:none!important/);
  assert.match(css,/linear-gradient\(180deg,#1941b6/);
  assert.match(css,/linear-gradient\(180deg,#1d4aba/);
  assert.match(css,/\.ljr-editor-note/);
  assert.match(css,/\.v562-card-copy/);
  assert.match(css,/\.v726-tool-copy/);
});
