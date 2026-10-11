import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('src/v164-history-log.js');
const directory=JSON.parse(read('src/v27-teams-drive-reference.js').match(/const V27_TEAMS=(\[[\s\S]*?\]);/)[1]);
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

test('Partidos anteriores usa los escudos transparentes de Equipos y su categoría antes de los logos antiguos',()=>{
 const calls=[];
 const {logoUrl}=runInNewContext(source.slice(source.indexOf('function logoUrl('),source.indexOf('function teamMark('))+';({logoUrl})',{
  norm,URL,document:{baseURI:'https://liga.test/App-liga-/'},
  window:{LJR_TEAMS_CURRENT_LOGO:{get(name,category){
   calls.push([name,category]);
   return directory.find(t=>norm(t.name)===norm(name)&&norm(t.category)===norm(category))?.logo||'';
  }},LJR_TEAM_LOGOS:{get(){throw Error('No debe usar el escudo antiguo cuando está en Equipos');}}}
 });
 for(const [name,category] of [['DYNAMO','Veteranos 50+'],['BOAVISTA','Veteranos 50+'],['LINCES','Primera Fuerza'],['SAN JOSE FC','Primera Fuerza'],['BOAVISTA','Veteranos 35+'],['JUVENTUS','Primera Fuerza']]){
  const team=directory.find(t=>norm(t.name)===norm(name)&&t.category===category);
  assert.ok(team,name+' en Equipos');
  assert.equal(logoUrl(name,category),new URL(team.logo,'https://liga.test/App-liga-/').href);
 }
 assert.deepEqual(calls[0],['DYNAMO','Veteranos 50+']);
 assert.ok(source.includes('teamMark(x.home,x.category)'));
 assert.ok(source.includes('teamMark(x.away,x.category)'));
});
