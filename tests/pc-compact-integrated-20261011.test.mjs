import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const styles=read('src/pc-compact-integrated-20261011.css');
const guard=read('src/pc-compact-scroll-guard-20261011.js');
const nav=read('src/pc-unified-navigation-20261011.js');
const iframe=read('src/desktop-shell.js');
const bottom=read('src/desktop-home-bottom-integration-20261011.js');
const index=read('index.html');
test('PC video and mobile extras use one compact green-navy surface and no disconnected mobile footer',()=>{
 assert.match(styles,/html\.ljpc-unified-pc body\.lj-desktop\[data-app-route="home"\] #screen/);
 assert.match(styles,/grid-template-columns:repeat\(12,minmax\(0,1fr\)\)!important/);
 assert.match(styles,/#screen > #ljpc-exact-html-home/);
 assert.match(styles,/#screen > #safeHomeExtra/);
 assert.match(styles,/#screen > #v105-bottom\[data-v105-route="home"\]/);
 assert.match(styles,/radial-gradient\(650px 600px at 0% 23%,rgba\(2,121,89,\.29\)/);
 assert.match(nav,/document\.body\.appendChild\(footer\)/);
 assert.match(bottom,/!document\.getElementById\('ljpc-unified-pc-footer'\)/);
 assert.doesNotMatch(styles,/html\.preview-mobile|html\.preview-apk/);
});
test('Proximos partidos and lower video/cards have PC row sizes but retain native controls',()=>{
 for(const selector of ['.v103-upcoming-card','.v103-upcoming-match','.v103-upcoming-team b',
  '.v103-upcoming-team .v103-cal-logo','.v6-action-card','.v105-card','.v105-grid'])
  assert.ok(styles.includes(selector),'missing '+selector);
 assert.match(styles,/\.v103-upcoming-card\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
 assert.match(styles,/\.v103-upcoming-match\{[\s\S]*?min-height:45px!important/);
 assert.match(styles,/\.v105-grid \{[\s\S]*?grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
 assert.doesNotMatch(styles,/pointer-events:none/);
});
test('Initial 3700 pixel iframe placeholder is removed and height updates ignore tiny fluctuations',()=>{
 assert.doesNotMatch(iframe,/height:3700px;min-height:1200px/);
 assert.match(iframe,/height:900px;min-height:0/);
 assert.match(iframe,/Math\.abs\(target-prior\)>4/);
 assert.match(iframe,/frame\.contentWindow\.postMessage/);
 assert.match(iframe,/e\.data\.kind==='height'/);
});
test('Compact stylesheet loads after desktop editorial and before mobile profile final layer',()=>{
 const idx=index.indexOf('pc-compact-integrated-20261011.css?v=20261011-compact-pc-inside-v1');
 assert.ok(idx>index.indexOf('desktop-browser-editorial-20261011.css'));
 assert.ok(idx<index.indexOf('</head>'));
 assert.ok(idx<index.indexOf('profile-first-screenshot-restore.css'));
 assert.ok(index.includes('pc-compact-scroll-guard-20261011.js?v=20261011-no-auto-scroll-v1'));
 assert.match(index,/pc-unified-navigation-20261011\.js\?v=20261011-unified-compact-footer-v1/);
 assert.match(index,/desktop-shell\.js\?v=20261011-compact-iframe-v1/);
});
function runGuard(mode,gesture){
 const handlers={};const scroll=[];
 const win={__LJPC_DESKTOP_COMPACT_SCROLL_20261011__:false,scrollY:420,
  addEventListener:(name,fn)=>{handlers[name]=fn},
  scrollTo:args=>scroll.push(args)};
 const doc={readyState:'complete',addEventListener:(name,fn)=>{handlers[name]=fn}};
 const hist={scrollRestoration:'auto'};
 const ctx={window:win,document:doc,location:{search:'?mode='+mode,hash:'#/home'},
  innerWidth:1366,URLSearchParams,history:hist,requestAnimationFrame:fn=>fn()};
 if(gesture)doc.readyState='loading';
 vm.runInNewContext(guard,ctx);
 if(gesture){handlers.touchstart();handlers.DOMContentLoaded()}
 return {scroll,history:hist};
}
test('PC initial scroll restoration is once-only; touch stops it; mobile/APK unaffected',()=>{
 assert.doesNotThrow(()=>new vm.Script(guard));
 const pc=runGuard('desktop',false);
 assert.equal(pc.scroll.length,1);
 assert.equal(pc.scroll[0].top,0);
 assert.equal(pc.history.scrollRestoration,'manual');
 assert.equal(runGuard('desktop',true).scroll.length,0);
 for(const m of ['mobile','apk']){
  const r=runGuard(m,false);
  assert.equal(r.scroll.length,0);
  assert.equal(r.history.scrollRestoration,'auto');
 }
});
