import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(name)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('Divisiones abiertas: Primera Intermedia y Segunda; veteranos por edad',()=>{
  const season=JSON.parse(read('public/data/temporada-actual-2026.json'));
  const s=JSON.stringify(season);
  for(const division of ['Primera Fuerza','Intermedia','Segunda Fuerza']){
    assert.ok(s.includes('"'+division+'"'),'La temporada debe incluir '+division);
  }
  const doc=read('src/desktop-nav-enhancements.js');
  for(const label of ["'Categoría libre'","'Primera Fuerza'","'Intermedia'","'Segunda Fuerza'"]){
    assert.ok(doc.includes(label),'Debe mantener el grupo de categorías abiertas: '+label);
  }
  assert.match(s,/Veteranos 35\+/);
  assert.match(s,/Veteranos 50\+/);
});
test('Ningún chip de la tienda anuncia división juvenil inexistente',()=>{
  const shop=read('src/v66-official-directory.js');
  assert.match(shop,/<button data-v436-chip>ABIERTA<\/button>/);
  assert.doesNotMatch(shop,/<button data-v436-chip>JUVENIL<\/button>/i);
});
test('Reporte semanal conserva cinco categorías oficiales, no juvenil',()=>{
  const js=read('src/main.js');
  const weekly=js.slice(js.indexOf('function v38WeeklyView(){'),js.indexOf('\nfunction bindV553Weekly()'));
  for(const key of ['primera','intermedia','segunda','veteranos35','veteranos']){
    assert.ok(weekly.includes('    '+key+':['),'No debe faltar la categoría '+key);
  }
  assert.doesNotMatch(weekly,/JUVENIL|INFANTIL|PONY/i);
});
