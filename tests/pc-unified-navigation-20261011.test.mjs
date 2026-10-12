import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const script=read('src/pc-unified-navigation-20261011.js');
const styles=read('src/pc-unified-navigation-20261011.css');
const index=read('index.html');
const original=read('pc-exact-original-20261011.html');

test('shared PC header is loaded and previous route shells are suppressed',()=>{
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.match(index,/pc-unified-navigation-20261011\.js/);
 assert.match(index,/pc-unified-navigation-20261011\.css/);
 assert.match(styles,/html\.ljpc-unified-pc body #screen :is\(\.ds-nav,\.ds-scorebar,\.desk-nav,\.desk-fixtures\)/);
 assert.match(styles,/#ljpc-pc-top :is\(\.ljpc-pc-mini,\.ljpc-pc-navigation\)/);
 assert.match(script,/document\.getElementById\('ljpc-unified-pc-header'\)/);
 assert.match(script,/document\.getElementById\('ljpc-unified-pc-footer'\)/);
 assert.match(script,/getElementById\('ljpc-pc-top'\)/);
});
test('home original HTML retains its content while duplicate header, score and footer are hidden',()=>{
 for(const name of ['top bar wrapper','header navigation wrapper','fixtures strip container','sponsors band','footer']){
  assert.ok(original.includes('data-name="'+name+'"'),name);
  assert.ok(script.includes('[data-name="'+name+'"]'),name);
 }
 assert.match(script,/doc\.head\.appendChild\(style\)/);
 assert.match(script,/iframe\.addEventListener\('load'/);
 assert.doesNotMatch(script,/contentDocument\.body\.innerHTML\s*=/);
});
test('same nav labels and logo are used on all PC pages',()=>{
 for(const name of ['Partidos','Clasificación','Liga TV','Sorteos','Gaming','Datos','Equipos','Noticias','Historia','Sobre','Más']){
  assert.ok(script.includes("'"+name+"'"),name);
 }
 assert.match(script,/escudo-liga-azul-sin-fondo-v1007\.png/);
 assert.doesNotMatch(script,/\['Inicio','home'\]/, 'Inicio should be opened from the league brand, not a tab');
 assert.match(script,/class="ljpc-u-brand"[^\n]*data-ljpc-u-go="home"/, 'Badge and name should open home');
 assert.match(script,/function selectNav\(\)/);
 assert.match(script,/function fixturesHTML\(\)/);
 assert.match(script,/fixture_decisions/);
 assert.match(styles,/\.ljpc-u-team-logo/);
});
test('mobile and APK never mount the shared desktop chrome',()=>{
 for(const mode of ['mobile','apk']){
  const calls=[],listeners={};
  const document={
   readyState:'loading',
   documentElement:{classList:{toggle:(className,enabled)=>calls.push([className,enabled])}},
   getElementById:()=>null,
   addEventListener:(event,fn)=>{listeners[event]=fn}
  };
  const context={document,window:{addEventListener:()=>{}},
   location:{search:'?mode='+mode,hash:'#/standings'},
   innerWidth:1600,URLSearchParams,
   requestAnimationFrame:fn=>fn()};
  vm.runInNewContext(script,context);
  listeners.DOMContentLoaded();
  assert.deepEqual(calls,[['ljpc-unified-pc',false]]);
 }
});
test('desktop shared CSS is scoped and does not edit any mobile style files',()=>{
 assert.match(script,/!\['mobile','apk'\]\.includes\(mode\(\)\)/);
 assert.match(styles,/html\.ljpc-unified-pc body #ljpc-unified-pc-header/);
 assert.match(styles,/html\.ljpc-unified-pc body #ljpc-unified-pc-footer/);
 assert.doesNotMatch(styles,/html\.preview-mobile|html\.preview-apk/);
 assert.doesNotMatch(styles,/body:not\(\.lj-desktop\)/);
});
