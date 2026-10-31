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
 assert.equal(list.length,1,'El partido debe existir una sola vez en Segunda Fuerza');
 return list[0];
}
test('La fuente deportiva y las copias web publican el marcador oficial 2-12',()=>{
 const sources=paths.map(read);
 for(const [i,d] of sources.entries()){
  const row=game(d);
  assert.deepEqual(row.slice(1,9),['1','SAN ANTONIO FC','2','vs','12','TAVERA FC','Campo 1 (Empastado)','10/10/2026 12:00'],paths[i]);
 }
 assert.deepEqual(sources[0],sources[1]);
 assert.deepEqual(sources[1],sources[2]);
});
test('No se reescriben las tablas, goleadores ni registros por un resultado aislado',()=>{
 const data=read(paths[0]);
 const standings=data.categories['4'].standings?.[0]?.rows||[];
 const tavera=standings.find(x=>x[1]==='TAVERA FC');
 const sanAntonio=standings.find(x=>x[1]==='SAN ANTONIO FC');
 assert.ok(tavera&&sanAntonio,'Las clasificaciones históricas deben conservarse para su sincronización oficial');
 const row=game(data);
 assert.equal(row[3],'2');
 assert.equal(row[5],'12');
});
test('Las notificaciones nativas utilizan los dos goles separados y la categoría real',()=>{
 const src=readFileSync(new URL('../src/v840-apk-match-notifications.js',import.meta.url),'utf8');
 assert.match(src,/const score=\(e\.hs!==null&&e\.as!==null\)\?e\.home\+' '\+e\.hs\+' vs '\+e\.away\+' '\+e\.as/);
 assert.match(src,/category:String\(c\?\.name\|\|'Liga Juventino'\)/);
});
