import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const css=read('src/v1386-admin-dialog-consistency.css');
test('V1386: paleta de los cuadros administrativos antes de la capa exclusiva V1387',()=>{
 const href='src/v1386-admin-dialog-consistency.css?v=20261010-v1386-night-dialogs';
 assert.ok(html.includes(href),'Debe estar enlazada con versión anticaché');
 assert.ok(html.indexOf(href)>html.indexOf('src/v1384-admin-visual-dark-harmony.css'));
 for(const klass of ['.ljr-admin-manage','.ljr-admin-cms','.ljr-admin-child','.ljr-admin-friendly',
 '.ljr-admin-studio','.ljr-editor-dialog','.v1081-dialog','.ljr-admin-v1081']){
  assert.ok(css.includes(klass),klass+' sin estilos nocturnos');
 }
 for(const color of ['#070b34','#0b1643','#111f54','#0a1643','#526eaf']){
  assert.ok(css.includes(color),'Falta '+color);
 }
 const following=html.slice(html.indexOf(href)+href.length);
 const laterStyles=[...following.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(laterStyles[0],
  './src/v1387-notification-buttons-consistent.css?v=20261010-v1387-notice-uniform',
  'V1387 debe seguir inmediatamente después de V1386');
 assert.ok(laterStyles.slice(1).every(href=>href.endsWith('.css')||/\.css\?/.test(href)),
  'Las capas posteriores deben ser únicamente hojas CSS, sin scripts');
 assert.ok(laterStyles.slice(1).every(href=>/admin|visual-harmony|v1391|v1392|v1398-junta-calendario-warm-compact/.test(href)),
  'Las capas posteriores solo pueden armonizar las ventanas de Administración, Junta y Calendarios');
 // V1398 no cambia acciones: es CSS exclusivo de las dos ventanas afectadas.
 if(laterStyles.some(href=>href.includes('v1398-junta-calendario-warm-compact.css'))){
  const compact=read('src/v1398-junta-calendario-warm-compact.css');
  assert.match(compact,/\.v875-meeting-modal/);
  assert.match(compact,/\.v1130-calendar-pro/);
  assert.doesNotMatch(compact,/<script|javascript:|pointer-events\s*:\s*none/i);
 }
 // V1392 solo uniforma superficies e iconos. No debe deshabilitar botones.
 if(laterStyles.some(href=>href.includes('v1392-admin-warm-app-colors.css'))){
  const warm=read('src/v1392-admin-warm-app-colors.css');
  assert.match(warm,/\.ljr-admin-manage/);
  assert.match(warm,/--ljr1392-night:#090e36/);
  assert.doesNotMatch(warm,/<script|javascript:|pointer-events\\s*:\\s*none/i);
 }
 const visual1391=read('src/v1391-android-admin-visual-harmony.css');
 assert.ok(visual1391.includes('.v1212-csv-modal')&&visual1391.includes('.v875-meeting-modal'),
  'La capa visual final debe cubrir CSV y Juntas');
 assert.doesNotMatch(visual1391,/<script|javascript:|pointer-events\s*:\s*none/i);
 const notice=read('src/v1387-notification-buttons-consistent.css');
 for(const token of ['.v920-registration-modal','.v920-register-actions .v105-btn',
  '.v1210-alert-tools-row > button','.v1210-official-link','min-height:52px',
  'grid-template-columns:minmax(0,1fr)']){
  assert.ok(notice.includes(token),'La hoja exclusiva de avisos debe conservar '+token);
 }
 assert.doesNotMatch(notice,/<script|javascript:|pointer-events\s*:\s*none/i);
});
test('V1386: iconos, archivos y botones uniformes sin cambiar acciones ni ocultación',()=>{
 for(const token of ['.ljr-admin-tile-icon svg','grid-template-columns:repeat(2,minmax(0,1fr))',
 'input[type=file]::file-selector-button','.ljr-editor-page-panel',
 '[hidden]{display:none!important}','button:disabled','focus-visible']){
   assert.ok(css.includes(token),token+' debe mantenerse');
 }
 assert.doesNotMatch(css,/<script|javascript:|pointer-events\s*:\s*none/i);
 const visual=read('tests/admin-palette-android-v1353.mjs');
 assert.ok(visual.includes("'src/v1386-admin-dialog-consistency.css'"),'La captura Android debe cargar estilos finales');
});
