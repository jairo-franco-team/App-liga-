import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const css=read('src/v1396-account-royal-blue.css');
test('V1396: Perfil y TODAS las rutas Cuenta comparten azul rey luminoso',()=>{
 assert.ok(html.includes('v1396-account-royal-blue.css?v=20261010-v1396-bright-royal-blue'));
 assert.ok(html.indexOf('v1396-account-royal-blue.css')>html.indexOf('profile-restore-original-palette-20261010.css'));
 assert.ok(html.indexOf('v1396-account-royal-blue.css')>html.indexOf('v1393-admin-luminous-warm.css'));
 assert.match(css,/data-app-route="profile"/);
 assert.match(css,/data-app-route\^="account"/);
 for(const color of ['#3978d4','#3777d1','#326fca','#2459b4','#4384e0']){
   assert.ok(css.includes(color),'Falta azul rey '+color);
 }
 assert.doesNotMatch(css,/#070b34|#060c23|#090879|#05045f/i);
 assert.doesNotMatch(css,/#ff(?:db|b3|d1|c5|df)\w\w/i);
});
test('V1396: se conservan controles reales, semántica y alertas',()=>{
 assert.ok(css.includes('.v569-profile-account-menu>button.logout'));
 assert.ok(css.includes('.v569-danger'));
 assert.ok(css.includes('input[type=file]::file-selector-button'));
 assert.ok(css.includes('[hidden]'));
 assert.ok(css.includes('focus-visible'));
 assert.doesNotMatch(css,/<script|javascript:|pointer-events\s*:\s*none|display\s*:\s*none\s*!important\s*;?\s*\/\*.*button/i);
});
