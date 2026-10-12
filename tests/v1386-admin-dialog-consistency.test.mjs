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
  './src/v1387-notification-buttons-consistent.css?v=20261012-v1461-r4-clean-mobile-boot',
  'V1387 debe seguir inmediatamente después de V1386');
 // Validar cada hoja que se añade después de V1386, sin bloquear
 // futuras paletas reales por su nombre o fecha de publicación.
 for(const href of laterStyles){
  assert.match(href,/^\.\/src\/[a-z0-9._-]+\.css\?v=[a-z0-9._-]+(?:&[a-z0-9._-]+=[a-z0-9._-]+)*$/i,
   'Cada hoja visual final debe ser CSS local con versión anticaché');
  const filename=href.slice(2).split('?')[0];
  const layer=read(filename);
  assert.ok(layer.trim().length>0,'Hoja CSS inexistente o vacía: '+filename);
  assert.doesNotMatch(layer,/<script|url\(\s*['"]?javascript:/i,
   'El CSS no debe ejecutar código');
 }
 assert.ok(laterStyles.some(href=>href.includes('v1396-account-royal-blue.css')),
  'La capa final azul rey para Mi cuenta debe permanecer después de los estilos antiguos');
 // Solo la ULTIMA hoja que realmente cambia Perfil/Cuenta debe tener azul rey.
 // Otros modulos pueden añadir CSS después sin bloquear Pages por su nombre.
 const scopedAccountLayers=laterStyles.map(href=>{
  const path=(href.startsWith('./')?href.slice(2):href).split('?')[0];
  return {href, content:read(path)};
 }).filter(layer=>layer.content.includes('data-app-route="profile"') || layer.content.includes('data-app-route^="account"'));
 assert.ok(scopedAccountLayers.length>0,'Debe existir al menos una capa visual de Perfil');
 const lastAccountLayer=scopedAccountLayers.at(-1);
 assert.match(lastAccountLayer.content,/azul rey|royal|luminos|bright/i,
  'La ultima capa para Perfil debe conservar la paleta azul rey luminosa');
 assert.match(lastAccountLayer.content,/#[234][0-9a-f]{5}/i,
  'La ultima capa de Perfil debe incluir valores de azul medio luminoso');
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
