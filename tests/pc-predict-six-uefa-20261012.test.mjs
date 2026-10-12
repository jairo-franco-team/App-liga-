import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=read('src/pc-predict-six-uefa-20261012.js');
const css=read('src/pc-predict-six-uefa-20261012.css');
test('New desktop module has valid JavaScript syntax',()=>{assert.doesNotThrow(()=>new Function(js));});
test('Only the active PC route enables this module, not mobile or APK',()=>{
 assert.match(js,/mode!=='apk'&&mode!=='mobile'/);
 assert.match(js,/classList\.contains\('ljpc-unified-pc'\)/);
 assert.match(js,/route==='predictorSix'/);
 assert.match(css,/html\.ljpc-unified-pc body\[data-app-route="predictorSix"\]/);
 assert.doesNotMatch(css,/html\.preview-apk body|html\.preview-mobile body/);
});
test('Five UEFA-inspired sections retain the native V589 prediction controls',()=>{
 for(const tab of ['predictions','leagues','prizes','rules','achievements'])assert.match(js,new RegExp("['\"]"+tab+"['\"]"));
 assert.match(js,/data-v589-guest/);
 assert.match(js,/data-v589-view="predictions"/);
 assert.match(js,/ljr-v589-pronostica-six/);
 assert.match(css,/\.v589-match-card/);
 assert.match(css,/\.v589-score-pair/);
});
test('No false public leagues, prize claims, or admin shortcuts for guests',()=>{
 assert.match(js,/sin sincronizaci[oó]n/);
 assert.match(js,/no hay premios f[ií]sicos ni viajes/i);
 assert.match(css,/not\(\.ljpc-admin-auth\)/);
 assert.match(css,/\.ljr-cms-entry\{display:none!important\}/);
});
test('HTML references both scoped CSS and deferred script',()=>{
 const html=read('index.html');
 const demo=read('demo/index.html');
 for(const h of [html,demo]){
  assert.match(h,/pc-predict-six-uefa-20261012\.js/);
  assert.match(h,/pc-predict-six-uefa-20261012\.css/);
 }
});