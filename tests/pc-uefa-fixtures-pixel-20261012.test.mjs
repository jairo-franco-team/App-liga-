import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');
const script=read('src/pc-uefa-18-references-20261012.js');
const styles=read('src/pc-uefa-fixtures-pixel-20261012.css');
const html=read('index.html');
const official=JSON.parse(read('data/official-live.json'));

function source(search='?mode=desktop',width=390){
 const win={LJR_OFFICIAL_DATA:official,addEventListener(){}};
 const doc={readyState:'loading',addEventListener(){}};
 const code=script.replace(/\}\)\(\);\s*$/, 'window.__test={active,fixtures,fixturesPage,eventCards,dateNav};\n})();');
 assert.notEqual(code,script,'test exports not injected');
 const ctx={window:win,document:doc,location:{hash:'#/pc-fixtures',search},innerWidth:width,
   URLSearchParams,Intl,Date,console,sessionStorage:{getItem(){return null},setItem(){}}};
 vm.runInNewContext(code,ctx,{timeout:5000});
 return win.__test;
}
test('no JS syntax failures, styles and JS loaded exactly once',()=>{
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.equal(html.split('pc-uefa-fixtures-pixel-20261012.css').length-1,1);
 assert.equal(html.split('pc-uefa-18-references-20261012.js').length-1,1);
});
test('narrow browser in PC mode shows the reference, native mobile and APK never do',()=>{
 assert.equal(source('?mode=desktop',390).active(),true);
 assert.equal(source('?mode=mobile',1366).active(),false);
 assert.equal(source('?mode=apk',1366).active(),false);
 assert.equal(source('',390).active(),false);
});
test('real league match cards and score lines are drawn, no fabricated score',()=>{
 const {fixtures,fixturesPage}=source();
 const actual=fixtures();
 assert.ok(actual.length>0);
 const rendered=fixturesPage();
 for(const key of ['u18fx-hero','u18fx-navlinks','u18fx-titlebar','u18fx-dates','u18fx-grid','u18fx-card','u18fx-team-lines','u18fx-scores','u18fx-result']){
  assert.ok(rendered.includes(key),'missing '+key);
 }
 assert.match(rendered,/Partidos y resultados/);
 assert.match(rendered,/data-u18-open-match=/);
 const first=actual.find(x=>!x.played);
 if(first)assert.match(rendered,/Pendiente de resultado/);
 assert.match(rendered,/escudo-liga-azul-sin-fondo-v1007\.png/);
});
test('all reference toolbar actions and date arrows remain interactive',()=>{
 const markup=source().fixturesPage();
 for(const click of ['data-u18-fixture-tab','data-u18-go','data-u18-modal','data-u18-date-shift','data-u18-day','data-u18-open-match']){
  assert.match(markup,new RegExp(click));
 }
 assert.match(script,/if\(d\.u18OpenMatch\)/);
 assert.match(script,/sessionStorage\.setItem\('lj-match-detail'/);
 assert.match(script,/go\('match'\);return/);
 assert.match(script,/if\(d\.u18DateShift!==undefined\)/);
});
test('two compact columns and exact score/card hierarchy, all CSS route scoped',()=>{
 assert.match(styles,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
 assert.match(styles,/min-height:101px!important/);
 assert.match(styles,/grid-template-columns:minmax\(0,1fr\) 23px 85px!important/);
 assert.match(styles,/font-variant-numeric:tabular-nums!important/);
 assert.match(styles,/@media\(max-width:610px\)/);
 const rules=styles.split('\n').filter(x=>x.startsWith('html.'));
 assert.ok(rules.length>25);
 assert.ok(rules.every(x=>x.includes('html.ljpc18-active[data-ljpc18-route="pc-fixtures"] body')),'unscoped CSS detected');
 let braces=0;for(const ch of styles){if(ch==='{')braces++;if(ch==='}')braces--;}
 assert.equal(braces,0);
});
