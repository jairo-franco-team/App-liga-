import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/v33-data-statistics-reference.js',import.meta.url),'utf8');
const official=JSON.parse(fs.readFileSync(new URL('../data/official-live.json',import.meta.url)));
function app(data=official,stored='3'){
 const values=new Map([['v62-category',stored]]);
 const screen={innerHTML:'',querySelector:()=>null,addEventListener(){}};
 const window={LJR_OFFICIAL_DATA:data,addEventListener(){},scrollTo(){}};
 const document={readyState:'loading',body:{classList:{toggle(){},contains(){return false}}},querySelector:s=>s==='#screen'?screen:null,querySelectorAll:()=>[],addEventListener(){}};
 vm.runInNewContext(source,{window,document,location:{hash:'#/leagueData'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},requestAnimationFrame:()=>1,MutationObserver:class{observe(){}},setTimeout});
 return {api:window.LJR_V33_STATS,screen,values};
}
const card=(html,metric)=>html.split('data-v33-metric="'+metric+'"')[1]?.split('</article>')[0]||'';
test('all five categories use their own official teams, players and goalkeeper profiles',async()=>{
 const {api,screen,values}=app();
 for(const id of ['3','5','4','2','1']){
  await api.setCategory(id);
  assert.equal(api.getCategory(),id);
  assert.equal(values.get('v62-category'),id);
  await api.setTab('player');
  assert.equal([...screen.innerHTML.matchAll(/data-v33-category="/g)].length,5);
  assert.ok(screen.innerHTML.lastIndexOf('data-v33-category-selector')>screen.innerHTML.lastIndexOf('data-v33-player-section'));
  assert.ok([...screen.innerHTML.matchAll(/data-v33-player-cat="([^"]+)"/g)].every(m=>m[1]===id));
  const first=(official.categories[id].scorers?.[0]?.rows||[]).find(r=>r[1]&&r[2]&&!/goles en temporada/i.test(r[2])&&/^\d+$/.test(r[3]));
  if(first)assert.ok(card(screen.innerHTML,'goals').includes('data-v33-player="'+first[1]+'"'));
  const keeperCard=card(screen.innerHTML,'saves');
  const keepers=Object.values(official.categories[id].player_profiles).flat().filter(p=>p.position==='Portero');
  assert.equal([...keeperCard.matchAll(/data-v33-player="/g)].length,Math.min(5,keepers.length));
  assert.ok(keepers.slice(0,5).every(p=>keeperCard.includes(p.name)));
  assert.ok(keeperCard.includes('--v33-card-rows:'+Math.min(5,keepers.length)));
  await api.setTab('team');
  const teams=official.categories[id].standings?.[0]?.rows||[];
  assert.ok(screen.innerHTML.includes('data-v33-team="'+(teams[0]?.[1]||official.categories[id].fixtures[0].rows[0][2])+'"'));
 }
});
test('selection survives reload and invalid category requests preserve the current data',async()=>{
 const {api,screen}=app(official,'4');
 await api.setTab('general');
 assert.equal(api.getCategory(),'4');
 const before=screen.innerHTML;
 await api.setCategory('999');
 assert.equal(screen.innerHTML,before);
});
test('goalkeeper substitutes appear even when absent from roster, without duplicate records',async()=>{
 const data=structuredClone(official);
 data.categories['3'].player_profiles.NAPOLI.push({name:'Portero suplente de prueba',position:'Portero',photo:'https://example.test/keeper.jpg'});
 const {api,screen}=app(data);
 await api.setTab('player');
 const keepers=card(screen.innerHTML,'saves');
 assert.match(keepers,/Portero suplente de prueba/);
 assert.match(keepers,/--v33-card-rows:4/);
 assert.equal([...keepers.matchAll(/data-v33-player="Portero suplente de prueba"/g)].length,1);
 assert.ok([...keepers.matchAll(/<strong[^>]*>([^<]+)<\/strong>/g)].every(m=>m[1]==='—'));
});
test('opening a club shared by two categories preserves the selected category',()=>{
 const league=fs.readFileSync(new URL('../src/v62-official-league-data.js',import.meta.url),'utf8');
 const functions=league.slice(league.indexOf('function categoryTeams('),league.indexOf('function selectedOfficialTeam('));
 const context=vm.createContext({categoryId:'2',CAT_ORDER:['3','5','4','2','1'],cat:id=>official.categories[id],same:(a,b)=>String(a).toLowerCase()===String(b).toLowerCase()});
 vm.runInContext(functions,context);
 assert.equal(vm.runInContext("teamContext('BOAVISTA').id",context),'2');
 context.categoryId='1';
 assert.equal(vm.runInContext("teamContext('BOAVISTA').id",context),'1');
});
