import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const registration=readFileSync(new URL('../src/v124-player-registration.js',import.meta.url),'utf8');
const picker=readFileSync(new URL('../src/v132-credential-team-picker.js',import.meta.url),'utf8');
test('Reglamento 2026-2027: categorías libres sin límite superior y vet 35/50 con edad mínima',()=>{
  for(const text of [registration,picker]){
    assert.match(text,/if\(age>=35\).*'Veteranos 35\+'/);
    assert.match(text,/if\(age>=50\).*'Veteranos 50\+'/);
    assert.match(text,/Primera Fuerza/);
    assert.match(text,/Intermedia/);
    assert.match(text,/Segunda Fuerza/);
  }
});
test('Artículos 72, 91 y 97: edad no equivale a inscripción autorizada',()=>{
  assert.match(registration,/Art\. 97: puede participar en Veteranos 35\+ y 50\+ a la vez/);
  assert.match(registration,/Art\. 91: la edad por sí sola no autoriza cambiar de equipo/);
  assert.match(registration,/Art\. 97: consultar a la directiva la simultaneidad a los 50 exactos/);
  assert.match(picker,/Art\. 97: permitido en Veteranos 35\+ y 50\+ al mismo tiempo/);
  assert.match(picker,/Art\. 91: revisar equipo y torneo/);
});
