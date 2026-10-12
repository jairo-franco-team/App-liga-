import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const nav=read('src/pc-unified-navigation-20261011.js');
const finish=read('src/pc-independent-finish-20261011.js');
test('cabecera PC tiene landmark banner compatible con aria-label',()=>{
 assert.match(nav,/id="ljpc-unified-pc-header" role="banner" aria-label="Cabecera universal de escritorio"/);
 assert.match(nav,/<nav class="ljpc-u-links" aria-label="Navegación PC">/);
});
test('pie PC usa contenedor role group, y el footer real conserva el landmark',()=>{
 assert.match(nav,/id="ljpc-unified-pc-footer" role="group"/);
 assert.match(nav,/<footer class="ljpc-u-footer">/);
 assert.match(finish,/footer\.setAttribute\('aria-label','Información y colaboradores de la Liga'\)/);
});
test('no altera el modo móvil/APK ni enlaces ni colores',()=>{
 assert.match(nav,/const desktop=\(\)=>!\['mobile','apk'\]\.includes\(mode\(\)\)/);
 assert.match(nav,/group\('DESCUBRE'/);
 assert.match(nav,/group\('COMPETICIÓN'/);
 assert.match(nav,/group\('HERRAMIENTAS'/);
 assert.doesNotThrow(()=>new vm.Script(nav));
});
