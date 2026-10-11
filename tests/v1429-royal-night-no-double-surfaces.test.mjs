import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/v1428-more-royal-blue-reference.css',import.meta.url),'utf8');
const tail=css.slice(css.indexOf('/* V1429 · Azul rey a noche'));
test('V1429 se publica una sola vez con clave de caché renovada',()=>{
 assert.ok(tail.length>3000);
 const link='src/v1428-more-royal-blue-reference.css?v=20261011-v1439-solid-controls-drive-backgrounds';
 assert.equal(html.split(link).length-1,1);
 assert.ok(html.indexOf(link)>html.indexOf('src/v1426-competition-exact-dark-background.css'));
});
test('V1429 mantiene gradiente de azul rey hacia noche y sin morado',()=>{
 assert.doesNotMatch(tail,/linear-gradient\(/, "La paleta antigua no vuelve a pintar cuadros");
 assert.match(tail,/background:transparent!important/);
 assert.match(tail,/\.v734-tool-details-button/);
 assert.match(tail,/\.v46-ref-settings/);
 assert.match(tail,/\.ljr-admin-manage/);
});
test('V1429 respeta la navegación, Fantasy, Competición y los componentes',()=>{
 assert.doesNotMatch(tail,/pointer-events\s*:|display\s*:|visibility\s*:|javascript:|<script/i);
 assert.doesNotMatch(tail,/body\[data-app-route="competition"\]\s+#screen/);
 assert.doesNotMatch(tail,/body\[data-app-route="fantasy"\]/);
 assert.doesNotMatch(tail,/\.v977-controls\s+button/);
 assert.doesNotMatch(tail,/\.bottom-nav\s*\{/);
});
