import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const script=read('src/pc-native-reference-sections-20261011.js');
const css=read('src/pc-native-reference-sections-20261011.css');
const index=read('index.html');
const sections=read('src/desktop-sections.js');

test('Native PC layout and source scripts parse without altering mobile modules',()=>{
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.doesNotThrow(()=>new vm.Script(sections));
 assert.match(index,/pc-native-reference-sections-20261011\.js/);
 assert.match(index,/pc-native-reference-sections-20261011\.css/);
 assert.match(script,/!\['mobile','apk'\]\.includes\(MODE\(\)\)/);
 assert.match(script,/window\.LJR_PC_NATIVE_ROUTES/);
 assert.match(css,/html\.ljpc-pc-native-mode body\.ljpc-native-route/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
});

test('Pronostica Seis uses original six native data-v29-pick actions and new widescreen rows',()=>{
 assert.match(script,/\.v53-p6-game\[data-v29-pick\]/);
 assert.match(script,/button\.appendChild\(span\)/);
 assert.doesNotMatch(script,/button\.replaceChildren\(/);
 assert.match(css,/grid-template-columns:1fr!important/);
 assert.match(css,/\.v53-p6-game>/);
 assert.match(css,/nth-of-type\(3\)/);
 assert.match(css,/ljpc-pc-p6name\.home/);
 assert.match(css,/ljpc-pc-p6name\.away/);
 for(const route of ['predictorSix','fantasy','quiniela','quizArena','moreLess'])
  assert.ok(script.includes("'"+route+"'"));
});
test('PC navigation maps only to functional league routes and uses official logo',()=>{
 for(const route of ['home','pc-fixtures','pc-standings','video','pc-draws','predictorSix','pc-data','teams','news','pc-tools'])
  assert.ok(script.includes("'"+route+"'"),route);
 assert.match(script,/escudo-liga-azul-sin-fondo-v1007\.png/);
 assert.match(sections,/function logoFor\(name\)/);
 assert.match(sections,/LJR_OFFICIAL_API\?\.getLogo/);
 assert.match(sections,/class="ds-crest"/);
});
test('mode=mobile and mode=apk do not mount native PC header',()=>{
 for(const mode of ['mobile','apk']){
  const called=[];
  const listeners={};
  const document={
   readyState:'loading',
   documentElement:{classList:{toggle:(name,value)=>called.push([name,value])}},
   addEventListener:(name,cb)=>{listeners[name]=cb},
   getElementById:()=>null
  };
  const context={window:{addEventListener:()=>{}},document,
   location:{search:'?mode='+mode,hash:'#/predictorSix'},
   innerWidth:1366,URLSearchParams,requestAnimationFrame:cb=>cb()};
  vm.runInNewContext(script,context);
  assert.ok(typeof listeners.DOMContentLoaded==='function');
  listeners.DOMContentLoaded();
  assert.deepEqual(called,[['ljpc-pc-native-mode',false]]);
 }
});

test('Gaming, Datos and Más menus open accessibly and route to existing modules',()=>{
 for(const menu of ['Gaming','Datos','Más'])assert.match(script,new RegExp(menu.replace('á','.')+':\\['));
 assert.match(script,/aria-haspopup="true" aria-expanded="false"/);
 assert.match(script,/data-ljpc-pc-menu/);
 assert.match(script,/function closeMenus\(except\)/);
 assert.match(script,/e.key==='Escape'/);
 assert.match(css,/\.ljpc-pc-popover\[hidden\]/);
 assert.match(css,/z-index:1000/);
 assert.match(script,/\['Pronostica Seis','predictorSix'\]/);
 assert.match(script,/\['Estadísticas oficiales','pc-data'\]/);
 assert.match(script,/\['Herramientas PC','pc-tools'\]/);
});
