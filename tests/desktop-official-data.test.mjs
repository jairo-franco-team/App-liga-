import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const db=JSON.parse(fs.readFileSync(new URL('../data/official-live.json',import.meta.url),'utf8'));
class FixedDate extends Date {
  constructor(...args){super(...(args.length?args:['2026-10-08T10:00:00-06:00']))}
  static now(){return new Date('2026-10-08T10:00:00-06:00').getTime()}
}
function loadDesktop(path,expose){
  const source=fs.readFileSync(new URL('../src/'+path,import.meta.url),'utf8');
  const injected=source.replace(/\}\)\(\);\s*$/, 'window.__test={'+expose+'};\n})();');
  assert.notEqual(injected,source,'El módulo PC debe exponer funciones para la prueba');
  const window={LJR_OFFICIAL_DATA:db,addEventListener(){}};
  const document={addEventListener(){},querySelector(){return null},body:{classList:{add(){},contains(){return false}}}};
  vm.runInNewContext(injected,{
    window,document,location:{hash:'#/home',search:'?mode=desktop'},innerWidth:1280,
    URLSearchParams,Date:FixedDate,setTimeout(){return 0},clearTimeout(){}
  },{filename:path,timeout:5000});
  return window.__test;
}
test('La franja PC usa encuentros oficiales sin clubes inventados',()=>{
  const pc=loadDesktop('desktop-shell.js','games:desktopOfficialGames,standings:desktopOfficialTable');
  const games=pc.games(25),rows=pc.standings();
  assert.ok(games.length>=20);
  assert.equal(rows[0][1],'SAN JOSE FC');
  // El primer encuentro cambia con resultados, suspensiones y nuevas jornadas.
  // Cada tarjeta debe conservar equipos, horario y sede de una fila oficial.
  for(const game of games){
    const category=db.categories[game.id];
    assert.equal(game.category,category.name);
    assert.ok(category.fixtures.some(group=>group.rows.some(row=>
      row[2]===game.home && row[6]===game.away && row[7]===game.field &&
      String(row[8]).endsWith(' '+game.time))), 'Tarjeta con procedencia oficial');
  }
  assert.ok(games.every((game,i)=>!i||games[i-1].sort<=game.sort),'Orden cronológico');
  assert.ok(games.every(g=>g.sort>='2026-10-08'));
  assert.ok(games.every(g=>!/(?:SAN PEDRO|MORALES)/i.test(g.home+' '+g.away)));
  assert.ok(games.every(g=>!g.sort.endsWith('00:00')));
});
test('La versión PC obtiene clasificación y categorías del registro oficial',()=>{
  const pc=loadDesktop('desktop-sections.js','hydrate:hydrateOfficialDesktop,fixtures:()=>fixtures,standings:()=>standings,clubs:teamsPage');
  assert.equal(pc.hydrate(),true);
  const rows=pc.standings(),fixtures=pc.fixtures();
  assert.equal(rows.length,11);
  assert.equal(rows[0][0],'SAN JOSE FC');
  assert.equal(rows[0][8],15);
  assert.ok(fixtures.length>=4);
  assert.ok(fixtures.every(f=>!/SAN PEDRO|MORALES/i.test(f[1]+' '+f[2])));
  const html=pc.clubs();
  assert.match(html,/Primera Fuerza/);
  assert.match(html,/Intermedia/);
  assert.match(html,/Veteranos 35\+/);
  assert.match(html,/Veteranos 50\+/);
  assert.doesNotMatch(html,/San Pedro|Morales|Juvenil/i);
});
