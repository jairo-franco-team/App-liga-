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
 assert.deepEqual(laterStyles,
  ['./src/v1387-notification-buttons-consistent.css?v=20261010-v1387-notice-uniform'],
  'Solo la capa exclusiva de Avisos puede cargarse después de V1386');
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
