import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const late=read('src/v1381-admin-colores-oficiales.css');
const final=read('src/v1384-admin-visual-dark-harmony.css');
const studio=read('src/v1246-content-studio.css');
const assistant=read('src/v1232-suspension-official-blue.css');
test('V1385: V1381 ya no reintroduce la paleta brillante anterior',()=>{
 assert.match(late,/--ljr1310-bg:#070b34/);
 assert.match(late,/--ljr1310-surface:#0b1643/);
 assert.match(late,/--ljr1310-card:#111f54/);
 assert.match(late,/--ljr1310-input:#0a1643/);
 assert.match(late,/--ljr1310-edge:#526eaf/);
 assert.doesNotMatch(late,/#06065f|#0d47a1|#1c69d4|#10377b|#0d3688|#174b98/i);
 for(const target of ['.ljr-admin-manage','.ljr-admin-cms','.ljr-admin-child','.ljr-admin-friendly',
 '.ljr-admin-studio','.ljr-editor-dialog','.v1081-dialog','.ljr-notice-1212','.ljr-review-smart']){
  assert.ok(late.includes(target),target+' needs common palette');
 }
 for(const color of ['#070b34','#0b1643','#111f54','#0a1643']){
   assert.ok(final.includes(color),'V1384 must agree with V1381 on '+color);
 }
});
test('V1385: estudio, aviso de suspensión y cache del navegador actualizados',()=>{
 assert.match(studio,/V1385 · Estudio de publicaciones/);
 assert.match(studio,/background:#070b34!important/);
 assert.match(studio,/background:#0a1643!important/);
 assert.match(assistant,/V1311 \/ V1385 · aviso de suspensión/);
 assert.match(assistant,/background:#0b1643!important/);
 for(const entry of [
 'v1381-admin-colores-oficiales.css?v=20261010-v1385-navy-consistent',
 'v1246-content-studio.css?v=20261010-v1385-midnight-palette',
 'v1232-suspension-official-blue.css?v=20261010-v1385-local-review-night']){
  assert.ok(html.includes(entry),entry+' not cache-busted');
 }
 assert.ok(html.indexOf('v1381-admin-colores-oficiales.css')>
           html.indexOf('v1340-admin-mobile-visual-unified.css'));
 assert.ok(html.indexOf('v1384-admin-visual-dark-harmony.css')>
           html.indexOf('v1381-admin-colores-oficiales.css'));
});
test('V1385: se conservan eventos, permisos, tipos de controles y comportamiento',()=>{
 for(const selector of ['[hidden]','[data-revoke]','[data-logout]'])
 assert.ok(late.includes(selector)||final.includes(selector));
 assert.doesNotMatch(late+studio+assistant,/<script|javascript:/i);
 const visual=read('tests/admin-palette-android-v1353.mjs');
 assert.ok(visual.includes("'src/v1381-admin-colores-oficiales.css'"));
 assert.ok(visual.includes("'src/v1384-admin-visual-dark-harmony.css'"));
 assert.match(visual,/selectOption\(\{label:'Segunda'\}\)/);
});
