import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const index=read('index.html');
const css=read('src/v1396-admin-profile-light-royal.css');
const stylesheetLinks=[...index.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map(m=>m[1]);
const profileHref=stylesheetLinks.filter(href=>href.includes('v1396-admin-profile-light-royal.css?'));
const balancedHref='./src/v1406-account-balanced-royal.css?v=20261010-v1406-medium-royal';
const finalHref='./src/v1402-account-admin-royal-blue.css?v=20261010-v1413-azul-rey-barra-unificado';

test('V1396: la capa azul rey medio predomina sobre capas anteriores en Perfil',()=>{
 assert.equal(profileHref.length,1,'V1396 no debe duplicarse');
 assert.ok(index.includes(balancedHref),'Debe incluirse la base V1406');
 assert.ok(index.includes(finalHref),'Debe incluirse el acabado medio V1413');
 for(const old of ['v1387-profile-account-night-polish.css','v1392-admin-warm-app-colors.css','v1395-admin-three-tools-night-polish.css']){
  assert.ok(index.indexOf(profileHref[0])>index.indexOf(old),'V1396 debe ir despues de '+old);
 }
 assert.ok(index.indexOf(balancedHref)>index.indexOf(profileHref[0]));
 assert.ok(index.indexOf(finalHref)>index.indexOf(balancedHref));
 const following=stylesheetLinks.slice(stylesheetLinks.indexOf(finalHref)+1);
 const permittedRestore='v1411-profile-old-layout-restore.css';
 assert.ok(following.every(h=>(!h.includes('account')&&!h.includes('profile'))||h.includes(permittedRestore)),
  'Solo la restauracion visual exclusiva de Perfil puede seguir a los estilos de Cuenta');
 const restored=read('src/'+permittedRestore);
 assert.ok(index.indexOf(permittedRestore)>index.indexOf(finalHref));
 assert.match(restored,/html body\[data-app-route="profile"\]/);
 assert.doesNotMatch(restored,/data-app-route\^="account"|data-app-route="competition"/);
 assert.doesNotMatch(restored,/<script|javascript:|pointer-events\s*:\s*none/i);
 const medium=read('src/v1406-account-balanced-royal.css');
 const last=read('src/v1402-account-admin-royal-blue.css').split('/* V1413 ·').at(-1);
 assert.match(medium,/--v1406-royal:#225BB8/);
 for(const hex of ['#2055B7','#2760BC','#1E50A7']) assert.ok(last.includes(hex),'Falta '+hex);
 assert.match(last,/data-app-route="profile"/);
 assert.match(last,/data-app-route\^="account"/);
 assert.doesNotMatch(last,/<script|javascript:|pointer-events\s*:\s*none/i);
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
