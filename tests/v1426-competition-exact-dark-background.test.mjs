import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html');
const css=read('src/v1426-competition-exact-dark-background.css');
const previous=read('src/v1423-previous-colors-player.css');

test('V1426 conserva el lienzo de Clasificación/Cuadro en #000040 exacto de la captura',()=>{
 assert.match(css,/V1426 · Restauracion exacta/);
 assert.match(css,/body\[data-app-route="competition"\] #screen/);
 assert.match(css,/background:#000040!important/);
 assert.match(css,/\.v12-bracket-reference/);
 assert.match(css,/\.v12-standings-reference/);
 assert.match(css,/\.v40-standings/);
 assert.match(css,/\.v12-fixtures-reference/);
 assert.match(css,/background-image:none!important/);
});
test('V1426 deja azul rey en cabecera sin alterar pestanas y funciones',()=>{
 assert.match(css,/background-color:#14218c!important/);
 assert.match(css,/linear-gradient\(180deg,#14218c 0%,#18299b 100%\)/);
 assert.match(css,/\.topbar/);
 assert.doesNotMatch(css,/\.tab\.active(?:\s|\{|::)|\.v12-bracket-stage-tabs button\s*\{/);
 assert.doesNotMatch(css,/pointer-events:\s*none|display:\s*none|javascript:|<script/i);
 assert.match(previous,/\.v12-bracket-stage-tabs button.active/);
 assert.match(previous,/background:#10dce7!important/);
});
test('V1426 CSS cargado DESPUES de otros estilos y con version propia para Android',()=>{
 const link='src/v1426-competition-exact-dark-background.css?v=20261011-v1427-fondo-000040';
 assert.equal(html.split(link).length-1,1);
 assert.ok(html.indexOf(link)<html.indexOf('src/profile-first-screenshot-restore.css'));
 assert.ok(html.indexOf(link)>html.indexOf('src/v1423-previous-colors-player.css'));
 const tail=html.slice(html.indexOf(link)+link.length);
 assert.match(tail,/src\/profile-first-screenshot-restore\.css/);
 assert.doesNotMatch(tail,/src\/v1420-reference-blue-surfaces\.css/);
 assert.match(css,/@layer ljr-reference-surfaces/);
});

test('V1427 aplica #000040 a cada contenedor visible bajo Clasificación y Cuadro',()=>{
 const part=css.slice(css.indexOf('/* V1427 · Arreglo del fondo'));
 assert.ok(part.length>1000);
 for(const selector of [
  '#screen#screen#screen > .tabs',
  '#screen#screen#screen > .v40-standings-host',
  '#screen#screen#screen .v40-standings',
  '#screen#screen#screen .v40-content',
  '#screen#screen#screen .v12-bracket-reference',
  '#screen#screen#screen .v12-bracket-stage-tabs',
  '#screen#screen#screen .v12-bracket-board',
  '#screen#screen#screen .v12-bracket-scroll',
  '#screen#screen#screen .v12-bracket-route'
 ])assert.ok(part.includes(selector),'Background missing: '+selector);
 assert.match(part,/background-color:#000040!important;/);
 assert.match(part,/background-image:none!important;/);
 assert.doesNotMatch(part,/(?:\.topbar|\.back-button|\.tab\.active|\.v12-bracket-stage-tabs\s+button|\.v12-bracket-team)\s*\{/);
 assert.doesNotMatch(part,/<script|javascript:|pointer-events\s*:/);
});
