import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const script=read('src/pc-drive-eight-references-20261011.js');
const css=read('src/pc-drive-eight-references-20261011.css');
const index=read('index.html');
const official=JSON.parse(read('data/official-live.json'));

function boot(search,{width=1366,native=false,hash='#/pc-data'}={}){
 let looks=0,requests=0;
 const ctx={
  location:{hash,search},
  window:{
   innerWidth:width,
   Capacitor:{isNativePlatform:()=>native},
   addEventListener(){},
   LJR_OFFICIAL_DATA:null
  },
  document:{
   readyState:'complete',
   body:{classList:{contains:()=>true}},
   documentElement:{classList:{contains:k=>k==='ljr-pc-datos-uefa'}},
   addEventListener(){},
   getElementById(){return null},
   querySelector(){looks++;return null}
  },
  URLSearchParams,Element:class{},
  requestAnimationFrame(fn){fn()},
  MutationObserver:class{observe(){}},
  fetch(){requests++;return Promise.reject(Error('Unexpected fetch'))}
 };
 vm.runInNewContext(script,ctx,{timeout:1000});
 return {looks,requests};
}

test('The eight-reference PC module loads once and is valid JavaScript',()=>{
 assert.doesNotThrow(()=>new vm.Script(script));
 for(const extension of ['js','css']){
  assert.equal(index.split('pc-drive-eight-references-20261011.'+extension).length-1,1,'Duplicate link '+extension);
 }
});

test('The PC-only module does not activate on mobile, APK, native Capacitor or ordinary narrow viewport',()=>{
 for(const [mode,width,native] of [['?mode=mobile',1366,false],['?mode=apk',1366,false],['?mode=desktop',1366,true],['',390,false]]){
  const x=boot(mode,{width,native});
  assert.equal(x.looks,0,'Must not query PC components: '+mode+' '+width+' '+native);
  assert.equal(x.requests,0,'Must not fetch desktop-only data: '+mode+' '+width+' '+native);
 }
 assert.ok(boot('?mode=desktop',{native:false}).looks>0,'Should inspect PC dashboard on desktop route');
 assert.equal(boot('?mode=desktop',{hash:'#/home'}).looks,0,'Must not render outside PC Data');
});

test('Reference assets and layout are isolated under desktop selectors',()=>{
 assert.match(css,/html\.ljr-pc-datos-uefa body\.lj-desktop #screen/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk|body\s*\{\s*background/i);
 assert.ok(script.includes("!window.Capacitor?.isNativePlatform?.()"));
 assert.ok(script.includes("route()==='pc-data'"));
});

test('All reference screens, official categories and connected routes are present',()=>{
 for(const item of ['Estadísticas de equipo','Estadísticas de jugadores','Máximo goleador','Fase de clasificación','Libro de estadísticas','Performance Zone']){
  assert.ok(script.includes(item),item);
 }
 for(const id of ['1','2','3','4','5'])assert.ok(official.categories[id],id);
 for(const metric of ['clave','goles','disparos','distribucion','ataque','defensa','porteria']){
  assert.ok(script.includes("'"+metric+"'"),metric);
 }
 for(const path of ['pc-scorers','pc-standings','pc-fixtures','teams','safe-performance','history']){
  assert.ok(script.includes(path),path);
 }
 assert.ok(script.includes("ljpc:pc-data-view"),'Desktop Data menu bridge missing');
 assert.ok(script.includes('player_profiles'),'Published player photos should be preferred');
 assert.ok(script.includes('cachedData=d;state.revision++'),'Official data fallback missing');
});
