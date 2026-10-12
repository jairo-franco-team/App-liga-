import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/main.js');
const pc=read('src/desktop-official-data-v976.js');
const weekly=app.slice(app.indexOf('function v38WeeklyView(){'),app.indexOf('\nfunction bindV553Weekly()'));
const binding=app.slice(app.indexOf('function bindV553Weekly()'),app.indexOf('\nfunction ',app.indexOf('function bindV553Weekly()')+10));
test('El reporte de la semana oficial 12–18 octubre tiene exactamente 25 partidos',()=>{
 assert.match(weekly,/Semana del 12\/10\/2026 al 18\/10\/2026/);
 assert.equal((weekly.match(/\['(?:17|18)\/10\/2026','\d\d:\d\d'/g)||[]).length,25);
 for(const [category,n] of [['primera',5],['intermedia',6],['segunda',6],['veteranos35',5],['veteranos',3]]){
  const start=weekly.indexOf('    '+category+':[');
  assert.ok(start>0,category);
  const end=weekly.indexOf('    ],',start);
  const slice=weekly.slice(start,end);
  assert.equal((slice.match(/\['(?:17|18)\/10\/2026'/g)||[]).length,n,category);
 }
});
test('El calendario incluye cinco categorías, filtros de 35+, reset, fechas y descarga PDF',()=>{
 assert.match(weekly,/<option value="veteranos35">Veteranos 35\+<\/option>/);
 assert.match(weekly,/group\(titles\.veteranos35,rows\.veteranos35,'veteranos35'\)/);
 assert.match(weekly,/value="2026-10-12"/);
 assert.match(weekly,/value="2026-10-18"/);
 assert.match(binding,/veteranos35:'35'/);
 assert.match(binding,/start\.value='2026-10-12'/);
 assert.match(binding,/end\.value='2026-10-18'/);
 assert.match(binding,/data-v553-print/);
 assert.match(app,/veteranos35:base\+'assets\/categories\/veteranos-35-user\.png/);
});
test('Coinciden los encuentros destacados con el reporte oficial público y se conserva la jornada real',()=>{
 for(const line of [
  "['18/10/2026','08:00','TERRICOLAS','NAPOLI','Campo 3','Jornada 7']",
  "['18/10/2026','08:00','LA CUADRILLA','MAZACOTES FC','Fraccionamiento','Jornada 7']",
  "['18/10/2026','08:00','PACHANGAS FC','TAPATIO','Campo 2','Jornada 7']",
  "['17/10/2026','15:30','BOCA JRS','DYNAMO','Campo 4','Jornada 9']",
  "['17/10/2026','00:00','BOAVISTA','FRANCO-TAVERA-JR','Campo 1 (Empastado)','Jornada 1']"
 ])assert.ok(weekly.includes(line),line);
 assert.match(weekly,/programación únicamente; no equivale a un resultado/i);
});
test('La vista PC muestra los mismos 25 encuentros sin sustituir resultados históricos',()=>{
 const first=pc.indexOf(' const ITEMS=['),last=pc.indexOf("\n const url='https://www.juventinorosasliga.com/reporte-semanal/'",first);
 assert.ok(first>0&&last>first);
 const block=pc.slice(first,last);
 assert.equal((block.match(/\['(?:Veteranos 35\+|Veteranos 50\+|Primera Fuerza|Intermedia|Segunda Fuerza)'/g)||[]).length,25);
 assert.match(pc,/Calendario oficial · 12–18 octubre 2026/);
 assert.match(pc,/no actualiza marcadores, tabla de puntos, goles, tarjetas/);
 assert.doesNotMatch(pc,/Cambios comprobados del rol · 05–11 octubre/);
});
test('No toca el archivo de partidos oficiales ni registro ni historia en esta corrección',()=>{
 const oldSource=read('src/v62-official-league-data.js');
 assert.match(oldSource,/const LOCAL_DATA='.\/data\/official-live.json/);
 assert.match(app,/function bindV553Weekly\(\)/);
 assert.match(pc,/root\.appendChild\(section\);/);
});
