import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const index=read('index.html');
const profile=read('src/profile-first-screenshot-restore.css');
const oldLayout=read('src/v1411-profile-old-layout-restore.css');
const account=read('src/v1406-mi-cuenta-royal-medio.css');
const admin=read('src/v1402-account-admin-royal-blue.css');

test('Perfil V1423 recupera la paleta anterior azul noche',()=>{
 assert.match(index,/src\/profile-first-screenshot-restore\.css\?v=20261011-v1423-colores-anteriores/);
 assert.ok(profile.includes('background-color:#05075e!important'));
 assert.ok(profile.includes('linear-gradient(180deg,#070967 0%,#05075e 43%,#02044f 100%)'));
 assert.ok(profile.includes('background-color:#101778!important'));
 assert.ok(profile.includes('background-color:#2455af!important'));
 assert.ok(profile.includes('border:2px solid #38d9e8!important'));
 assert.doesNotMatch(profile,/#2055B7|#2760BC/i);
});

test('El diseño de perfil original prevalece sin pintar cuadros en cada opción',()=>{
 const rowsSection=profile.slice(profile.indexOf('/* Opciones: FILAS TRANSPARENTES'));
 assert.match(rowsSection,/background-color:transparent!important/);
 assert.match(rowsSection,/border-radius:0!important/);
 assert.match(rowsSection,/border-bottom:1px solid rgba\(120,139,207,\.18\)!important/);
 assert.match(oldLayout,/background-color:transparent!important/);
});

test('Mi cuenta, registro y Administración quedan en azul rey medio y sin alteraciones funcionales',()=>{
 assert.match(account,/--ljr-account-mid-canvas:#2055B7/i);
 assert.match(account,/--ljr-account-mid-card:#2760BC/i);
 assert.match(admin,/--ljr-royal-bg:#2055B7/i);
 for(const css of [profile,oldLayout,account,admin]){
  assert.doesNotMatch(css,/<script|javascript:|pointer-events\s*:\s*none/i);
 }
});

test('La prioridad CSS preserva Perfil al final, sin cambios en otras rutas',()=>{
 const last='src/profile-first-screenshot-restore.css?v=20261011-v1423-colores-anteriores';
 const initial='src/v1402-account-admin-royal-blue.css?v=20261010-v1413-azul-rey-barra-unificado';
 const mid='src/v1406-mi-cuenta-royal-medio.css?v=20261010-v1413-mi-cuenta-barra-azul-rey';
 const restore='src/v1411-profile-old-layout-restore.css?v=20261010-v1415-perfil-azul-rey-final';
 const order=[initial,mid,restore,last];
 const points=order.map(x=>index.indexOf(x));
 assert.ok(points.every(x=>x>0),'Missing stylesheet');
 assert.deepEqual(points,[...points].sort((a,b)=>a-b));
 const trailing=index.slice(index.indexOf(last)+last.length).replace(/<link[^>]*v1464-mobile-header-logo-performance\.css[^>]*>/gi,'');
 assert.doesNotMatch(trailing,/<link\s+rel="stylesheet"/i);
 assert.doesNotMatch(profile,/data-app-route\^="account"|data-app-route="home"|data-app-route="competition"/);
});
