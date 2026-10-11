import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const theme=read('src/v1402-account-admin-royal-blue.css');
const account=read('src/account-bright-blue-unified-20261010.css');

test('V1404: Mi cuenta y sus pantallas emplean azul rey vivo similar a la referencia, no azul grisáceo',()=>{
 assert.match(theme,/V1404 · AZUL REY COBALTO/);
 for(const hex of ['#214ADA','#274FE6','#1D44CF','#1C42C9','#1435B2']){
  assert.ok(theme.includes(hex),'Missing cobalt color '+hex);
 }
 assert.match(theme,/data-app-route="profile"/);
 assert.match(theme,/data-app-route\^="account"/);
 assert.match(theme,/\.v12-profile-card/);
 assert.match(theme,/\.v569-card/);
 assert.match(theme,/\.v1300-panel/);
 assert.match(theme,/\.v569-profile-account-menu/);
 const bg=theme.match(/#screen\{\s*background:#[0-9A-F]{6}!important;[\s\S]{0,200}linear-gradient\(180deg,([^\n]+)\)/)?.[1];
 assert.ok(bg && bg.includes('#274FE6') && bg.includes('#2149D8'), 'Luminous royal gradient missing');
 assert.doesNotMatch(theme,/#05045f|#070b34|#050b2b|#1c69d4/i);
});

test('V1404: incluye ajustes, registro y modales; mantiene contrastes y acciones peligrosas',()=>{
 for(const s of ['Ajustes de la aplicación','Tu idioma preferido','Accesibilidad y pantalla','Ajustes de privacidad','Mi avatar y mi camiseta'])
 assert.ok(theme.includes(s), 'Missing '+s);
 for(const s of ['.v168-account-card','.v105-dialog','.v569-danger'])
 assert.ok(account.includes(s)||theme.includes(s),'Missing '+s);
 assert.match(theme,/#A33F60|#963651|#B44966/);
 assert.match(account,/\.v569-profile-account-menu>button\.logout/);
 assert.doesNotMatch(theme,/<script|javascript:|on(click|change|submit)=/i);
 assert.ok(!/pointer-events:\s*none!important/i.test(theme));
});

test('V1413: hoja azul rey media adaptada a la barra superior y cache actualizada',()=>{
 const last='src/v1402-account-admin-royal-blue.css?v=20261010-v1413-azul-rey-barra-unificado';
 assert.ok(html.includes(last),'Missing V1413 link');
 assert.equal(html.split('src/v1402-account-admin-royal-blue.css?v=').length,2);
 for(const older of ['src/v1387-profile-account-night-polish.css','src/v1396-profile-visual-harmony.css','src/account-bright-blue-unified-20261010.css'])
 assert.ok(html.indexOf(older)>=0 && html.indexOf(older)<html.indexOf(last),'Style order '+older);
 const tail=html.slice(html.indexOf(last)+last.length);
 const laterSheets=[...tail.matchAll(/<link[^>]*href="([^"]+\.css[^"]*)"/g)].map(m=>m[1]);
 for(const href of laterSheets){
  const path=href.startsWith('./')?href.slice(2).split('?')[0]:href.split('?')[0];
  const content=read(path);
  if(path==='src/v1411-profile-old-layout-restore.css'){
   // Restore exactly the old #/profile view without changing other account screens.
   assert.match(content,/html body\[data-app-route="profile"\]/);
   assert.doesNotMatch(content,/data-app-route\^="account"|data-app-route="competition"|pointer-events\s*:\s*none/);
  }else{
   assert.doesNotMatch(content,/data-app-route="profile"|data-app-route\^="account"/,
    'Una hoja posterior no debe alterar paleta Cuenta: '+path);
  }
 }
 assert.match(theme,/--ljr-royal-mid-base:#2055B7/, 'Debe utilizar azul rey medio similar a la barra superior');
});

test('V1405: Mi cuenta usa azul rey real #4169E1 sin cambios funcionales',()=>{
 assert.ok(theme.includes('V1405 - AZUL REY PURO #4169E1'), 'Nueva paleta royal blue debe estar presente');
 for(const hex of ['#4169E1','#3474D4','#3073D5','#2B6BD4','#265EC6'])
   assert.ok(theme.includes(hex), 'Falta color de la nueva paleta '+hex);
 for(const token of ['[data-app-route="profile"]','[data-app-route^="account"]',
  '[aria-label="Ajustes de la aplicación"]','[aria-label="Mi avatar y mi camiseta"]',
  '.v569-field input','.v1300-panel'])
   assert.ok(theme.includes(token), 'No se cubrio '+token);
 const patch=theme.slice(theme.indexOf('V1405 - AZUL REY PURO'));
 assert.ok(!/pointer-events\s*:\s*none|javascript:|on(click|change|submit)\s*=/i.test(patch),'Paleta debe ser solo visual');
});
