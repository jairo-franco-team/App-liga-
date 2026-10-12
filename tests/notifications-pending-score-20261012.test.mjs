import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
const source=readFileSync(new URL('../src/v840-apk-match-notifications.js',import.meta.url),'utf8');
function part(from,to){
 const first=source.indexOf(from),last=source.indexOf(to,first+from.length);
 assert.ok(first>=0&&last>first,'No se encontró el módulo '+from);
 return source.slice(first,last);
}
const reconcile=part('function reconcileInbox(matches){','function entryFor(');
function evaluate(e,m){
 let saved=null;
 runInNewContext(reconcile+'\nreconcileInbox(matches);',{
  matches:m?[m]:[],inbox:()=>[e],saveInbox:x=>{saved=x},
  logoFor:x=>x+'-logo'
 });
 assert.ok(saved&&saved.length===1);
 return saved[0];
}
const notice={key:'4|0|0|4|10/10/2026|SAN ANTONIO FC|TAVERA FC',type:'final',
 hs:2,as:12,status:'Finalizado',id:'older-id',
 home:'SAN ANTONIO FC',away:'TAVERA FC',date:'10/10/2026 12:00'};
const match={key:notice.key,home:notice.home,away:notice.away,category:'Segunda Fuerza',
 hs:2,as:12,date:notice.date,stamp:1781111111111,field:'Campo 1 (Empastado)'};
test('resultado confirmado 2-12 conserva Finalizado y los dos goles',()=>{
 const result=evaluate(notice,match);
 assert.equal(result.status,'Finalizado');
 assert.equal(result.hs,2);assert.equal(result.as,12);
 assert.match(result.id,/\|final\|2\|12$/);
});
test('un marcador retirado no conserva un Finalizado falso',()=>{
 const result=evaluate(notice,{...match,hs:null,as:null});
 assert.equal(result.status,'Marcador pendiente de confirmar');
 assert.equal(result.hs,null);assert.equal(result.as,null);
 assert.match(result.id,/\|final\|null\|null$/);
});
test('un aviso antiguo sin partido listado permanece histórico, no se cancela automáticamente',()=>{
 const result=evaluate(notice,null);
 assert.equal(result.status,'Finalizado');
 assert.equal(result.id,notice.id);
});
test('las alertas de gol mantienen su tipo, sin convertirse en Finalizado',()=>{
 const result=evaluate({...notice,type:'goal'},match);
 assert.equal(result.status,'Gol');
});
test('Resultados y Goles no muestran marcadores sin confirmar',()=>{
 assert.match(source,/view\.type==='final'&&e\.hs!==null&&e\.as!==null/);
 assert.match(source,/view\.type==='goal'&&e\.type==='goal'&&e\.hs!==null&&e\.as!==null/);
});
test('sistema no envía push de final ni de gol si la fuente dejó el marcador pendiente',async()=>{
 const method=part('async function systemNotify(e){','async function sendRichNotification(');
 assert.doesNotThrow(()=>new Script(method));
 for(const type of ['final','goal']){
  const result=await runInNewContext(method+'\nsystemNotify({type,hs:null,as:null});',{
   type,shouldAlert:()=>true
  });
  assert.equal(result,false);
 }
});
test('la fuente oficial conserva la prueba específica San Antonio 2 - 12 Tavera',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/official-live.json',import.meta.url),'utf8'));
 const rows=(d.categories?.['4']?.fixtures||[]).flatMap(x=>x.rows||[]);
 const r=rows.find(x=>x[2]==='SAN ANTONIO FC'&&x[6]==='TAVERA FC'&&x[8]==='10/10/2026 12:00');
 assert.ok(r);
 assert.equal(r[3],'2');assert.equal(r[5],'12');
});
