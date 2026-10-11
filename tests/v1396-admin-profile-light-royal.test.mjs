import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const index=read('index.html');
const css=read('src/v1396-admin-profile-light-royal.css');
const href='src/v1396-admin-profile-light-royal.css?v=20261010-v1396-profile-blue-bright';

test('V1396: capa clara de cuenta cargada al final para prevalecer sobre estilos oscuros',()=>{
  assert.equal(index.split(href).length-1,1);
  assert.ok(index.indexOf(href)>index.indexOf('v1387-profile-account-night-polish.css'));
  assert.ok(index.indexOf(href)>index.indexOf('v1392-admin-warm-app-colors.css'));
  assert.ok(index.indexOf(href)>index.indexOf('v1395-admin-three-tools-night-polish.css'));
  const following=index.slice(index.indexOf(href)+href.length);
  assert.doesNotMatch(following, /<link[^>]+rel="stylesheet"/);
});

test('V1396: todas las pantallas de perfil y cuenta, no otras rutas',()=>{
  assert.match(css,/\[data-app-route="profile"\]/);
  assert.match(css,/\[data-app-route\^="account"\]/);
  for(const selector of ['.v569-card','.v569-devices article','.v1300-panel','.v1300-detail',
    '.v1300-cloud-state','.v1300-findings article','.v1300-choice',
    '.v12-profile-card','.v12-profile-menu','.v569-profile-account-menu']){
    assert.ok(css.includes(selector),selector);
  }
  assert.doesNotMatch(css,/\[data-app-route="competition"\]|\[data-app-route="fantasy"\]/);
});

test('V1396: cubre diálogos propios y avatar, con iconos azul claro',()=>{
  for(const dialog of ['Ajustes de la aplicación','Tu idioma preferido','Accesibilidad y pantalla',
     'Ajustes de privacidad','Ayúdanos a mejorar','Términos y condiciones','Mi avatar y mi camiseta']){
    assert.ok(css.includes('[aria-label="'+dialog+'"]'),dialog);
  }
  for(const i of ['lang','notify','access','help','privacy','terms','copy','browser']){
    assert.ok(css.includes('button[data-'+i+']::before'),i+' no recoloreado');
  }
  assert.match(css,/\.v920-registration-modal/);
});

test('V1396: solamente CSS visual, conserva interacción y advertencias',()=>{
  assert.doesNotMatch(css,/<script|javascript:|display\s*:\s*none|pointer-events\s*:\s*none/i);
  assert.match(css,/focus-visible/);
  assert.match(css,/\.v569-danger/);
  assert.match(css,/input\[type=checkbox\]:checked/);
  assert.match(css,/#347bd9/i);
  assert.doesNotMatch(css,/#070e32|#090e36|#050b2b/i);
});
