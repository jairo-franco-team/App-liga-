import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
const src=readFileSync(new URL('../src/v840-apk-match-notifications.js',import.meta.url),'utf8');
const first=src.indexOf('async function systemNotify(e){'),last=src.indexOf('async function sendRichNotification(',first);
assert.ok(first>0&&last>first,'La función de avisos debe seguir disponible');
const method=src.slice(first,last);
assert.doesNotThrow(()=>new Script(method));
async function send(e){
 let delivered=null;
 const result=await runInNewContext(method+'\nsystemNotify(event);',{
  event:e,shouldAlert:()=>true,Capacitor:{isNativePlatform:()=>false},
  webNotify:async (title,opts,route)=>{delivered={title,body:opts.body,route};return true},
  prefs:()=>({vibration:false})
 });
 return {result,delivered};
}
test('La notificación 2–12 muestra fecha del partido aunque Android indique ahora',async()=>{
 const d=await send({type:'final',category:'Segunda Fuerza',home:'SAN ANTONIO FC',
 away:'TAVERA FC',hs:2,as:12,status:'Finalizado',date:'10/10/2026 12:00',
 id:'official-second-division-final'});
 assert.equal(d.result,true);
 assert.equal(d.delivered.title,'Segunda Fuerza');
 assert.equal(d.delivered.body,'SAN ANTONIO FC 2 vs TAVERA FC 12 · Finalizado · Partido del 10/10/2026');
 assert.equal(d.delivered.route,'competition');
});
test('Un aviso de gol también diferencia la fecha del encuentro de la llegada',async()=>{
 const d=await send({type:'goal',category:'Primera Fuerza',home:'LINCES',away:'NAPOLI',
 hs:1,as:0,status:'Gol',date:'12/10/2026 09:00',id:'sample-goal'});
 assert.match(d.delivered.body,/Gol · Partido del 12\/10\/2026$/);
});
test('Aviso sin fecha conserva el formato anterior en vez de inventar una',async()=>{
 const d=await send({type:'final',category:'Segunda Fuerza',home:'A',away:'B',hs:1,as:0,
 status:'Finalizado',date:'',id:'undated'});
 assert.equal(d.delivered.body,'A 1 vs B 0 · Finalizado');
});
test('Marcadores incompletos no generan notificación de final ni de gol',async()=>{
 for(const type of ['final','goal']){
  const result=await send({type,home:'A',away:'B',hs:null,as:12,
   status:'Finalizado',date:'10/10/2026',id:'incomplete'});
  assert.equal(result.result,false);assert.equal(result.delivered,null);
 }
});
test('Los goles oficiales 2–12 permanecen intactos en el snapshot',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/official-live.json',import.meta.url),'utf8'));
 const rows=data.categories['4'].fixtures.flatMap(g=>g.rows||[]);
 const row=rows.find(r=>r[2]==='SAN ANTONIO FC'&&r[6]==='TAVERA FC'&&r[8]==='10/10/2026 12:00');
 assert.ok(row);assert.equal(row[3],'2');assert.equal(row[5],'12');
});
