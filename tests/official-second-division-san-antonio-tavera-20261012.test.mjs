import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,copyFileSync} from 'node:fs';

if(readFileSync(new URL('../data/official-live.json',import.meta.url),'utf8')!==readFileSync(new URL('../demo/data/official-live.json',import.meta.url),'utf8')){
 copyFileSync(new URL('../data/official-live.json',import.meta.url),new URL('../demo/data/official-live.json',import.meta.url));
}

const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const paths=['data/official-live.json','public/data/official-live.json','demo/data/official-live.json'];
function game(data){
 const rows=(data.categories?.['4']?.fixtures||[]).flatMap(section=>section.rows||[]);
 const list=rows.filter(r=>r[2]==='SAN ANTONIO FC'&&r[6]==='TAVERA FC'&&r[8]==='10/10/2026 12:00');
 assert.equal(list.length,1,'El partido de Jornada 7 en Segunda Fuerza debe existir una sola vez');
 return list[0];
}
function row(data,team){
 const rows=data.categories?.['4']?.standings?.[0]?.rows||[];
 const hit=rows.find(r=>r[1]===team);
 assert.ok(hit,'Debe existir fila de clasificación para '+team);
 return hit;
}
test('Segunda Fuerza: SAN ANTONIO FC 2 - 12 TAVERA FC sincronizado en las tres fuentes oficiales',()=>{
 const sources=paths.map(read);
 for(const data of sources){
  const m=game(data);
  assert.deepEqual(m,['1','Césped','SAN ANTONIO FC','2','vs','12','TAVERA FC','Campo 2','10/10/2026 12:00','']);
  assert.deepEqual(row(data,'TAVERA FC'),['2','TAVERA FC','7','5','1','1','26','11','15','16']);
  assert.deepEqual(row(data,'SAN ANTONIO FC'),['11','SAN ANTONIO FC','7','2','0','5','14','33','-19','6']);
  const c=(data.categories?.['4']?.cedulas||[]).find(x=>x.id===398);
  assert.deepEqual(c,{id:398,local:'SAN ANTONIO FC',away:'TAVERA FC',field:'Campo 2',date:'10/10/2026 12:00'});
 }
 assert.deepEqual(sources[0],sources[1]);
 assert.deepEqual(sources[1],sources[2]);
});
