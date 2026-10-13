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
  assert.match(page,/<div class="u18-sim-actions"><button type="button" class="u18-sim-launch"/);
  assert.ok(page.lastIndexOf('u18-sim-actions')>page.lastIndexOf('u18-panel'),'simulator follows complete table');

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
 assert.match(styles,/\.u18-sim-launch\{\s*position:relative!important/);
 assert.doesNotMatch(styles,/\.u18-sim-launch\{\s*position:fixed!important/);
 assert.ok(styles.includes('pc-standings-inline-simulator-20261012-v8'));
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

test('light knockout is applied with PC-only inline important styles after the native renderer',()=>{
 const from=script.indexOf('function paintPcStandingsBracket('),to=script.indexOf('function repaint(){',from);
 assert.ok(from>0&&to>from,'standings-only paint helper exists');
 const method=script.slice(from,to);
 const make=()=>({properties:new Map(),style:{},querySelectorAll(){return []}});
 const create=()=>{const e=make();e.style.setProperty=(key,val,priority)=>e.properties.set(key,[val,priority]);return e;};
 const bracket=create(),knockout=create(),card=create(),page=create(),root=create();
 root.querySelector=selector=>selector==='.u18-standings-bracket'?bracket:null;
 root.querySelectorAll=()=>[page];
 bracket.querySelectorAll=selector=>{
  if(selector==='.ljr-knockout')return [knockout];
  if(selector.includes('.ljr-ko-card,.ljr-ko-club'))return [card];
  return [knockout];
 };
 vm.runInNewContext(method+';paintPcStandingsBracket(root);',
  {route:()=> 'pc-standings',desktop:()=>true,root},{timeout:1500});
 assert.deepEqual(bracket.properties.get('background'),['#f2f3f8','important']);
 assert.deepEqual(knockout.properties.get('--ko-ground'),['#f2f3f8','important']);
 assert.deepEqual(card.properties.get('background'),['#fff','important']);
 assert.deepEqual(page.properties.get('background'),['#f2f3f8','important']);
 const mobile=create();mobile.querySelector=()=>{throw Error('native mobile DOM must not be inspected');};
 vm.runInNewContext(method+';paintPcStandingsBracket(root);',
  {route:()=> 'competition',desktop:()=>false,root:mobile},{timeout:1500});
 assert.equal(mobile.properties.size,0);
 assert.match(script,/paintPcStandingsBracket\(original\)/);
 assert.match(script,/paintPcStandingsBracket\(root\)/);
});

test('desktop classification has no artificially expanded screen and leaves native modes unchanged',()=>{
 const flow=read('src/pc-independent-finish-20261011.js');
 assert.match(flow,/if\(r==='pc-fixtures'&&screen\.querySelector/);
 assert.match(flow,/if\(r==='pc-standings'&&screen\.querySelector/);
 const footer=read('src/pc-footer-flow-columns-20261012.js');
 assert.match(footer,/dataset\.ljpc18Route==='pc-standings'/);
 assert.match(flow,/screen\.dataset\.ljpcFinishMinHeight==='1'/);
 assert.match(styles,/\[data-ljpc18-route="pc-standings"\]/);
 assert.match(styles,/\.u18-sim-actions\{/);
 assert.match(styles,/padding-bottom:12px!important/);
 assert.doesNotMatch(styles,/body\[data-app-route="competition"\]|\[mode="mobile"\]/);
});
