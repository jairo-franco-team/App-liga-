import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const css=read('src/v1386-admin-dialog-consistency.css');
test('V1386: la última hoja administrativa mantiene colores oficiales en todos los cuadros',()=>{
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
 assert.ok(html.lastIndexOf('rel="stylesheet"')<html.lastIndexOf(href));
 assert.ok(html.slice(html.indexOf(href)).indexOf('rel="stylesheet"')===-1,'V1386 debe ser la última capa CSS');
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
