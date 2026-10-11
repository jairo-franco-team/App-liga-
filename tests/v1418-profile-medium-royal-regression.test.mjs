import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const index=read('index.html');
const profile=read('src/profile-first-screenshot-restore.css');
const oldLayout=read('src/v1411-profile-old-layout-restore.css');
const account=read('src/v1402-account-admin-royal-blue.css');

test('Perfil V1418 usa azul rey MEDIO, no azul noche ni azul fosforescente',()=>{
 assert.match(profile,/V1418 \| Perfil original conservado/);
 assert.match(profile,/background-color:#2055B7!important/);
 assert.match(profile,/linear-gradient\(180deg,#2865BF 0%,#2055B7 43%,#1E50AC 100%\)/);
 assert.match(profile,/background-color:#2760BC!important/);
 assert.match(profile,/background-color:#2C68C6!important/);
 assert.doesNotMatch(profile,/#05075e|#02044f|#101778|#4169e1|#274fe6/i);
});

test('El diseño de perfil original prevalece sin pintar cuadros en cada opción',()=>{
 for(const selector of [
 '.v12-profile-card[data-v569-owned]',
 '.v569-profile-hero',
 '.v569-profile-buttons>button',
 '.v569-profile-account-menu>button',
 '.v12-profile-menu>.v12-profile-row',
 '.v12-profile-row-icon'
 ])assert.ok(profile.includes(selector),'Missing '+selector);
 const rows=profile.slice(profile.indexOf('/* Opciones: FILAS TRANSPARENTES'));
 assert.ok(rows.length>100);
 assert.match(rows,/background-color:transparent!important/);
 assert.match(rows,/border-radius:0!important/);
 assert.match(rows,/border-bottom:1px solid rgba\(120,139,207,.18\)!important/);
 assert.doesNotMatch(profile,/pointer-events\s*:\s*none|display\s*:\s*none/i);
 assert.doesNotMatch(profile,/\.topbar\s*\{|\.bottom-nav\s*\{/);
 assert.match(oldLayout,/#2055B7/);
});

test('Mi cuenta, registro y Administración quedan en azul rey medio y sin alteraciones funcionales',()=>{
 const tail=account.slice(account.indexOf('/* V1413 ·'));
 assert.ok(tail.length>1500);
 for(const color of ['#2055B7','#2760BC','#1E50A7','#2C68C6'])
 assert.ok(tail.includes(color),'Missing medium blue '+color);
 for(const selector of ['.ljr-admin-manage','.ljr-admin-cms','.ljr-editor-dialog','data-app-route^="account"'])
 assert.ok(tail.includes(selector),'Missing '+selector);
 assert.doesNotMatch(tail,/<script|javascript:|pointer-events\s*:\s*none/i);
});

test('La prioridad CSS preserva Perfil al final, sin cambios en otras rutas',()=>{
 const last='src/profile-first-screenshot-restore.css?v=20261011-v1418-azul-rey-barra';
 const initial='src/v1402-account-admin-royal-blue.css?v=20261010-v1413-azul-rey-barra-unificado';
 assert.ok(index.includes(last)&&index.includes(initial));
 const order=['src/v1406-account-balanced-royal.css',initial,'src/v1411-profile-old-layout-restore.css',last];
 const points=order.map(x=>index.indexOf(x));
 assert.ok(points.every(x=>x>0),'Missing stylesheet');
 assert.deepEqual(points,[...points].sort((a,b)=>a-b));
 const trailing=index.slice(index.indexOf(last)+last.length);
 assert.doesNotMatch(trailing,/<link\s+rel="stylesheet"/i);
 assert.doesNotMatch(profile,/data-app-route\^="account"|data-app-route="home"|data-app-route="competition"/);
});
