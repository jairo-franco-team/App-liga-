import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const royal=read('src/v1407-junta-calendario-royal-medium.css');
const compact=read('src/v1398-junta-calendario-warm-compact.css');
test('Junta y Calendario usan azul rey medio en una capa única y final',()=>{
 const key='v1407-junta-calendario-royal-medium.css?v=20261010-v1407-medium-royal';
 assert.equal(html.split(key).length-1,1);
 assert.ok(html.lastIndexOf(key)>html.lastIndexOf('v1398-junta-calendario-warm-compact.css'));
 assert.match(royal,/--v1398-panel:#2763BB/);
 assert.match(royal,/background-color:#225BB8!important/);
 assert.match(royal,/#2B68C0/);
});
test('sin colores solares ni cambios de funcionalidad',()=>{
 assert.match(royal,/\.v875-meeting-modal/);
 assert.match(royal,/\.v1130-calendar-pro/);
 assert.match(royal,/\.v1240-local/);
 assert.doesNotMatch(royal,/#(?:f2cd96|e1ae73|ffdfa6|ffd0ba|dcae7c|f4cf97)/i);
 assert.doesNotMatch(royal,/<script|javascript:|pointer-events\s*:\s*none|display\s*:\s*none/i);
 assert.match(compact,/flex-basis:auto!important/);
 assert.match(compact,/flex-flow:column nowrap!important/);
});
