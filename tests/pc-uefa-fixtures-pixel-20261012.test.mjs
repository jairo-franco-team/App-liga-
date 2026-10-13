import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');
const script=read('src/pc-uefa-18-references-20261012.js');
const styles=read('src/pc-uefa-fixtures-pixel-20261012.css');
const html=read('index.html');
const official=JSON.parse(read('data/official-live.json'));

function source(search='?mode=desktop',width=390,knockout=null){
 const win={LJR_OFFICIAL_DATA:official,LJR_KNOCKOUT:knockout,addEventListener(){}};
 const doc={readyState:'loading',addEventListener(){}};
 const code=script.replace(/\}\)\(\);\s*$/, 'window.__test={active,fixtures,fixturesPage,eventCards,dateNav,bracket,isolateFixturesLegacy};\n})();');
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
 assert.ok(rules.every(x=>x.includes('html.ljpc18-active')&&x.includes('data-ljpc18-route="pc-fixtures"')),'unscoped CSS detected');
 let braces=0;for(const ch of styles){if(ch==='{')braces++;if(ch==='}')braces--;}
 assert.equal(braces,0);
});

test('screenshot header uses dark utility band, cobalt/navy gradient and accessible primary actions',()=>{
 const markup=source().fixturesPage();
 assert.match(markup,/u18fx-utility/);
 assert.match(markup,/u18fx-navlinks/);
 for(const text of ['Notificaciones','Añadir al calendario','Filtrar','Ver cuadro','Ver detalles'])assert.ok(markup.includes(text),text);
 for(const color of ['#111','#0a37f1','#050b53','#15e2e9'])assert.ok(styles.includes(color),color);
 assert.match(styles,/\.u18fx-result \.u18fx-detail-button\{/);
 assert.match(styles,/visibility:visible!important;opacity:1!important/);
});
test('Ver cuadro shows league-safe draw panel and functioning Ver detalles del sorteo route',()=>{
 const x=source();
 assert.match(script,/Sorteo de clasificación/);
 assert.match(script,/Ver detalles del sorteo/);
 assert.match(script,/data-u18-go=\"pc-draws\"/);
 assert.match(script,/data-u18-go=\"bracketBuilder\"/);
 assert.match(script,/No se inventan cruces, equipos ni fechas/);
 assert.match(styles,/\.u18fx-draw-pair-grid/);
});
test('index avoids cached previous page assets',()=>{
 assert.match(html,/pc-uefa-18-references-20261012\.js\?v=[a-z0-9-]+/);
 assert.match(html,/pc-uefa-fixtures-pixel-20261012\.css\?v=pc-fixtures-pale-gap-v8/);
});


test('exactly one PC fixtures design; legacy lower block removed, controls merged above',()=>{
 const page=source().fixturesPage();
 assert.equal((page.match(/<section class="u18-page u18fx-page"/g)||[]).length,1);
 assert.equal((page.match(/<h1>Partidos y resultados<\/h1>/g)||[]).length,1);
 assert.doesNotMatch(page,/Ver herramientas originales de esta sección/);
 for(const item of ['u18fx-unified-controls','u18fx-category-pills','u18fx-status-pills',
  'data-u18-cat-quick="3"','data-u18-cat-quick="2"','data-u18-filter="upcoming"',
  'data-u18-filter="results"','data-u18-filter="all"','data-u18-open-match']){
  assert.ok(page.includes(item),item);
 }
 assert.match(script,/if\(d\.u18CatQuick\)\{keepCat\(d\.u18CatQuick\)/);
 assert.match(styles,/#screen > :not\(\.u18-root\)/);
 assert.match(styles,/display:none!important;visibility:hidden!important;pointer-events:none!important/);
});
test('legacy desktop fixtures are truly hidden and restored when PC design is left',()=>{
 const api=source();
 function element(cls,display=''){
  let present=new Map(),priority='';
  return {
   classList:{contains(name){return cls===name}},
   dataset:{},
   style:{
    getPropertyValue(k){return k==='display'?display:''},
    getPropertyPriority(k){return k==='display'?priority:''},
    setProperty(k,v,p=''){if(k==='display'){display=v;priority=p}},
    removeProperty(k){if(k==='display'){display='';priority=''}}
   },
   setAttribute(k,v){present.set(k,v)},
   getAttribute(k){return present.has(k)?present.get(k):null},
   hasAttribute(k){return present.has(k)},
   removeAttribute(k){present.delete(k)}
  };
 }
 const active=element('u18-root'),legacy=element('ds-page','grid');
 const screen={children:[legacy,active]};
 api.isolateFixturesLegacy(screen,true);
 assert.equal(legacy.style.getPropertyValue('display'),'none');
 assert.equal(legacy.style.getPropertyPriority('display'),'important');
 assert.equal(legacy.hasAttribute('inert'),true);
 assert.equal(legacy.getAttribute('aria-hidden'),'true');
 api.isolateFixturesLegacy(screen,false);
 assert.equal(legacy.style.getPropertyValue('display'),'grid');
 assert.equal(legacy.hasAttribute('inert'),false);
 assert.equal(legacy.hasAttribute('aria-hidden'),false);
 assert.equal(active.style.getPropertyValue('display'),'');
});


test('PC Ver cuadro uses the exact mobile knockout renderer with trophy, real club crests and five stages',()=>{
 const sandbox={window:{}};
 vm.runInNewContext(read('src/knockout-reference.js'),sandbox,{timeout:5000});
 const knockout=sandbox.window.LJR_KNOCKOUT;
 const actual=source('?mode=desktop',690,knockout).bracket();
 for(const key of ['u18fx-mobile-knockout','ljr-knockout','ljr-ko-tabs','ljr-ko-board',
   'ljr-ko-trophy','data-ko-column="playoff"','data-ko-column="octavos"',
   'data-ko-column="cuartos"','data-ko-column="semifinal"','data-ko-column="final"',
   'data-u18-go="pc-draws"']){
  assert.ok(actual.includes(key),'Missing canonical mobile bracket part '+key);
 }
 assert.doesNotMatch(actual,/u18fx-draw-pair-grid/,'No provisional generic bracket should be present');
 assert.match(script,/window\.LJR_KNOCKOUT\.init\(ko\)/);
 assert.match(script,/if\(command\.closest\('\.ljr-ko-tabs'\)\)return/);
 assert.match(styles,/\.ljr-ko-trophy\{/);
});
test('PC full-height footer has pale canvas instead of huge dark blue after the footer',()=>{
 for(const key of ['body > #app','body > #ljpc-unified-pc-footer',
 'background:#f2f3f8!important','min-height:100svh!important',
 'flex-direction:column!important','margin-top:auto!important']){
  assert.ok(styles.includes(key),'Missing PC footer layout '+key);
 }
 assert.match(styles,/data-ljpc18-route="pc-fixtures"/);
 assert.doesNotMatch(styles,/html\.preview-mobile|html\.preview-apk/);
});

test('native bracket fallback remains complete before canonical mobile knockout initializes',()=>{
 const markup=source('?mode=desktop',690).bracket();
 assert.match(markup,/u18fx-draw-pair-grid/);
 assert.match(markup,/data-u18-go="pc-draws"/);
 assert.match(markup,/<\/section>/);
 assert.match(markup,/Ver detalles del sorteo/);
});

test('PC-only footer white gap overrides the stronger dark independent-finish backgrounds',()=>{
 const scope='html.ljpc18-active.ljpc-unified-pc[data-ljpc18-route="pc-fixtures"] body.lj-desktop.ljpc-independent-finish';
 for(const name of [
  scope+'{',
  scope+' #screen{',
  scope+' > #app{',
  scope+' > #ljpc-unified-pc-footer{'
 ])assert.ok(styles.includes(name),'missing stronger PC footer scope '+name);
 assert.match(styles,/\#screen\{\s*background:\#f2f3f8!important;background-image:none!important/);
 assert.match(styles,/min-height:calc\(100svh - 260px\)!important/);
 assert.match(styles,/background-attachment:scroll!important/);
 assert.doesNotMatch(styles,/html\.preview-(?:mobile|apk)/);
});


test('PC fixture root removes stale independent-finish min-height without calculating fake page height',()=>{
 const independent=read('src/pc-independent-finish-20261011.js');
 assert.doesNotThrow(()=>new vm.Script(independent));
 assert.match(independent,/if\(\(r==='pc-fixtures'\|\|r==='pc-standings'\)\&\&screen[.]querySelector\(':scope > [.]u18-root'\)\)/);
 assert.match(independent,/screen\.style\.removeProperty\('min-height'\)/);
 assert.match(independent,/delete screen\.dataset\.ljpcFinishMinHeight/);
 assert.match(html,/pc-independent-finish-20261011\.js\?v=pc-standings-height-guard-v8/);
});
test('only PC fixtures skip inflated footer clearance gap; other routes keep calculator',()=>{
 const footer=read('src/pc-footer-flow-columns-20261012.js');
 assert.doesNotThrow(()=>new vm.Script(footer));
 assert.match(footer,/document\.documentElement\.dataset\.ljpc18Route==='pc-fixtures'/);
 assert.match(footer,/screen\.querySelector\(':scope > \.u18-root'\)/);
 assert.match(footer,/footer\.style\.setProperty\('--ljpc-footer-clearance','0px'\)/);
 assert.match(footer,/const next=clearance\(bottom,natural\)/);
 assert.match(html,/pc-footer-flow-columns-20261012\.js\?v=pc-standings-footer-clearance-v8/);
});


test('PC bracket gets pale editorial gap outside native navy trophy and footer',()=>{
 const scope='html.ljpc18-active.ljpc-unified-pc[data-ljpc18-route="pc-fixtures"] body.lj-desktop.ljpc-independent-finish #screen > .u18-root > .u18-page.u18fx-page';
 assert.match(styles,/PC v8 · Fondo editorial claro/);
 assert.ok(styles.includes(scope+'{'));
 assert.ok(styles.includes(scope+' > main.u18-bound.u18fx-content{'));
 assert.ok(styles.includes('background-color:#f2f3f8!important'));
 assert.ok(styles.includes('background-image:none!important'));
 assert.ok(styles.includes(scope+' .u18fx-mobile-knockout > .ljr-knockout{'));
 assert.ok(styles.includes('background:#000040!important'));
 assert.match(html,/pc-uefa-fixtures-pixel-20261012\.css\?v=pc-fixtures-pale-gap-v8/);
});
