import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const index=read('index.html');
const css=read('src/v1402-account-admin-royal-blue.css');
const restored=read('src/v1411-profile-old-layout-restore.css');
const patch=css.slice(css.indexOf('/* V1413 ·'));

test('V1413: Mi cuenta y Administracion comparten azul rey medio del Perfil restaurado',()=>{
 assert.ok(patch.startsWith('/* V1413 ·'), 'Falta la ultima capa real');
 for(const color of ['#2055B7','#2760BC','#1E50A7']){
  assert.ok(patch.includes(color),'Falta el color medio '+color);
 }
 assert.match(restored,/background:#2055B7!important/);
 assert.match(restored,/linear-gradient\(180deg,#2865BF 0%,#2259B5 48%,#1E50AC 100%\)/);
 assert.match(patch,/background-image:linear-gradient\(180deg,#2865BF 0%,#2259B5 46%,#1E50AC 100%\)!important/);
 assert.match(patch,/\.ljr-admin-manage/);
 assert.match(patch,/\.ljr-admin-cms/);
 assert.match(patch,/\.ljr-editor-dialog/);
 assert.match(patch,/\[aria-label="Ajustes de la aplicación"\]/);
 assert.match(patch,/\[aria-label="Mi avatar y mi camiseta"\]/);
 assert.match(patch,/data-app-route\^="account"/);
});

test('V1413: estilos finales y cache Android no sobrescriben el Perfil restaurado',()=>{
 const link='src/v1402-account-admin-royal-blue.css?v=20261010-v1413-azul-rey-barra-unificado';
 const restoredLink='src/v1411-profile-old-layout-restore.css?v=20261010-v1415-azul-rey-uniforme';
 assert.ok(index.includes(link));
 assert.ok(index.includes(restoredLink));
 assert.ok(index.indexOf(restoredLink)>index.indexOf(link));
 assert.equal(index.split('src/v1402-account-admin-royal-blue.css?v=').length,2);
 assert.doesNotMatch(patch,/<script|javascript:|pointer-events\s*:\s*none/i);
 assert.doesNotMatch(patch,/#05045F|#070B34|#4169E1/i);
 assert.match(patch,/button\.ljr-admin-tile-danger/);
});
