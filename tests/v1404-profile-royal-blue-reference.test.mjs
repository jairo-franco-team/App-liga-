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

test('V1404: nueva hoja final se publica después de los estilos antiguos, cache nueva para Android',()=>{
 const last='src/v1402-account-admin-royal-blue.css?v=20261010-v1404-cobalto-royal';
 assert.ok(html.includes(last),'Missing V1404 link');
 assert.equal(html.split('src/v1402-account-admin-royal-blue.css?v=').length,2);
 for(const older of ['src/v1387-profile-account-night-polish.css','src/v1396-profile-visual-harmony.css','src/account-bright-blue-unified-20261010.css'])
 assert.ok(html.indexOf(older)>=0 && html.indexOf(older)<html.indexOf(last),'Style order '+older);
});
