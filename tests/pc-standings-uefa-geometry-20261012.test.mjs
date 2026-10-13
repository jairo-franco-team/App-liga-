import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/pc-standings-uefa-geometry-20261012.css');
const scrollCss=read('src/pc-home-scroll-lightweight-20261012.css');
const script=read('src/pc-uefa-18-references-20261012.js');
const html=read('index.html');
const prefix='html.ljpc18-active[data-ljpc18-route="pc-standings"] body';
test('UEFA reference geometry is limited to desktop PC classification with no fixed blank height',()=>{
 assert.ok(css.includes(prefix));
 const rules=css.split('\n').filter(x=>x.startsWith('html.'));
 assert.ok(rules.length>=35);
 assert.ok(rules.every(x=>x.includes('[data-ljpc18-route="pc-standings"]')),'only pc-standings route may be styled');
 assert.match(css,/\.u18-page\{min-height:0!important/);
 assert.match(css,/\.u18-switch/);
 assert.match(css,/\.u18-table/);
 assert.match(css,/\.u18-viewtabs/);
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
});
test('standings preserve every category, official columns, simulator, and real controls',()=>{
 assert.doesNotThrow(()=>new vm.Script(script));
 for(const feature of ['Primera Fuerza','Intermedia','Segunda Fuerza','Veteranos 35+','Veteranos 50+',
 'data-u18-stand-tab','data-u18-stand-view="table"','data-u18-stand-view="criteria"',
 'href="#/rulebook"','data-u18-go="pc-fixtures"','data-u18-go="tableExport"',
 'standingsTable(rows)','state.standMode=d.u18StandView']){
   assert.ok(script.includes(feature),'missing real route/handler: '+feature);
 }
 assert.match(script,/if\(d\.u18StandView\)/);
});
test('large-screen home scrolling optimizes painting without changing any mobile or APK screen',()=>{
 assert.match(scrollCss,/body\.lj-desktop\[data-app-route="home"\]/);
 assert.doesNotMatch(scrollCss,/html\.preview-mobile|html\.preview-apk|display:none|pointer-events:none/);
 assert.match(scrollCss,/backdrop-filter:none!important/);
 assert.match(scrollCss,/\.v73-reveal/);
 assert.equal((scrollCss.match(/\{/g)||[]).length,(scrollCss.match(/\}/g)||[]).length);
 const pc=html.indexOf('pc-standings-uefa-geometry-20261012.css');
 const perf=html.indexOf('pc-home-scroll-lightweight-20261012.css');
 const profile=html.indexOf('profile-first-screenshot-restore.css');
 assert.ok(pc>0&&perf>pc&&profile>perf,'both PC styles precede legacy mobile profile restoration');
});
