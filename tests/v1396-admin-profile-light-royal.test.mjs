import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const index=read('index.html');
const css=read('src/v1396-admin-profile-light-royal.css');
const profileHref=[...index.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]*v1396-admin-profile-light-royal\.css\?[^"]+)"/g)]
  .map(m=>m[1]);
const balancedHref='./src/v1406-account-balanced-royal.css?v=20261010-v1406-medium-royal';

test('V1396: perfil enlazado y paleta azul rey media con prioridad sobre estilos anteriores',()=>{
  assert.equal(profileHref.length,1,'La capa V1396 no debe duplicarse');
  const href=profileHref[0];
  assert.ok(index.indexOf(href)>index.indexOf('v1387-profile-account-night-polish.css'));
  assert.ok(index.indexOf(href)>index.indexOf('v1392-admin-warm-app-colors.css'));
  assert.ok(index.indexOf(href)>index.indexOf('v1395-admin-three-tools-night-polish.css'));
  assert.ok(index.includes(balancedHref),'Debe incluirse la paleta azul rey V1406');
  assert.ok(index.indexOf(balancedHref)>index.indexOf(href),'V1406 debe prevalecer sobre V1396');
  const royal=read('src/v1406-account-balanced-royal.css');
  assert.match(royal,/--v1406-royal:#225BB8/);
  assert.match(royal,/\[data-app-route="profile"\]/);
  assert.match(royal,/\[data-app-route\^="account"\]/);
  assert.doesNotMatch(royal,/<script|javascript:|pointer-events\s*:\s*none/i);
  const sheets=[...index.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(m=>m[1]);
  const last=sheets.at(-1)||'';
  assert.match(last,/v1406-account-balanced-royal\.css|v1402-account-admin-royal-blue\.css/,
    'La última hoja debe seguir siendo azul rey intermedio de Perfil/Cuenta');
  if(last.includes('v1402-account-admin-royal-blue.css')){
    assert.ok(index.indexOf(last)>index.indexOf(balancedHref));
    const finalRoyal=read('src/v1402-account-admin-royal-blue.css');
    assert.match(finalRoyal,/--ljr-royal-mid-base:#235EBE/);
  }
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
