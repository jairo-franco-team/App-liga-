import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const script=read('src/pc-uefa-18-references-20261012.js');
const styles=read('src/pc-standings-uefa-geometry-20261012.css');
const official=JSON.parse(read('data/official-live.json'));

function desktopStandings(){
 const code=script.replace(/\}\)\(\);\s*$/, 'window.__standingsTest={state,standingsPage,tableRows,formForTeam,tiebreakerTable};\n})();');
 assert.notEqual(code,script,'test API was not injected');
 const win={LJR_OFFICIAL_DATA:official,addEventListener(){}};
 const doc={readyState:'loading',addEventListener(){}};
 const env={window:win,document:doc,location:{hash:'#/pc-standings',search:'?mode=desktop'},
  innerWidth:1280,URLSearchParams,Intl,Date,console,
  sessionStorage:{getItem(){return null},setItem(){}},localStorage:{getItem(){return null},setItem(){}}};
 vm.runInNewContext(code,env,{timeout:5000});
 assert.ok(win.__standingsTest);
 return win.__standingsTest;
}

test('simulator launcher is present once for every category and not duplicated in phase switch',()=>{
 const {state,standingsPage}=desktopStandings();
 for(const id of ['1','2','3','4','5']){
  state.cat=id;state.standTab='league';
  const page=standingsPage();
  assert.equal((page.match(/class="u18-sim-launch"/g)||[]).length,1,'missing launch for '+id);
  assert.match(page,/data-u18-stand-tab="simulator"/);
  assert.match(page,/data-u18-stand-tab="league"/);
  assert.match(page,/data-u18-stand-tab="knockout"/);
  const switchContents=page.match(/<div class="u18-switch"[^>]*>([\s\S]*?)<\/div>/)?.[1]||'';
  assert.ok(!switchContents.includes('simulator'),'simulator must be outside the phase switch');
 }
 state.standTab='knockout';
 assert.doesNotMatch(standingsPage(),/class="u18-sim-launch"/);
 state.standTab='simulator';
 assert.doesNotMatch(standingsPage(),/class="u18-sim-launch"/);
});

test('tiebreaker labels use official league data; administrative deductions are preserved',()=>{
 const {state,standingsPage,tableRows}=desktopStandings();
 state.cat='1';state.standTab='league';state.standMode='criteria';
 const markup=standingsPage();
 for(const label of ['Puntos','Diferencia de goles','Goles marcados','Goles a domicilio','Victorias','Victorias a domicilio']){
  assert.ok(markup.includes(label),'missing: '+label);
 }
 const publishedBoca=tableRows().find(row=>String(row[1]).toUpperCase()==='BOCA JRS');
 assert.ok(publishedBoca,'official BOCA JRS entry expected');
 assert.ok(markup.includes('>'+publishedBoca[9]+'</span>'),'preserve official points including possible deductions');
 assert.match(markup,/reglamento vigente de la Liga Juventino Rosas/);
 assert.doesNotMatch(markup,/class="u18-original"/);
});

test('desktop-only styles guarantee separate simulator button and light knockout',()=>{
 const prefix='html.ljpc18-active[data-ljpc18-route="pc-standings"] body #screen';
 assert.ok(styles.includes(prefix+' .u18-sim-launch'));
 assert.ok(styles.includes('position:fixed!important'));
 assert.ok(styles.includes('pc-standings-roundup-20261012-v5'));
 assert.ok(styles.includes('min-width:0!important;table-layout:fixed!important'));
 assert.ok(styles.includes(prefix+' .u18-standings-bracket .ljr-ko-board'));
 assert.ok(styles.includes('background:#f2f3f8!important;background-image:none!important'));
 assert.equal((styles.match(/\{/g)||[]).length,(styles.match(/\}/g)||[]).length);
 assert.doesNotMatch(styles,/body\[data-app-route="competition"\]/);
});


test('desktop theme class is restored if the PC host shell changes the document marker',()=>{
 assert.match(script,/classList\.contains\('ljpc18-active'\)/);
 assert.match(script,/attributeFilter:\['class','data-ljpc18-route'\]/);
 assert.match(script,/dataset\.ljpc18Route!==route\(\)/);
});
