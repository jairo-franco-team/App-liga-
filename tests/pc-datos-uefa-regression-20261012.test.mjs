import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const load=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const js=load('src/pc-datos-uefa-reference-20261011.js');
const css=load('src/pc-datos-uefa-reference-20261011.css');
const index=load('index.html');

function boot(search,{width=390,globalData=null,apiData=null}={}){
 const toggles=[],calls=[];
 const location={search,hash:'#/pc-data'};
 const window={
  innerWidth:width,
  addEventListener(){},
  LJR_OFFICIAL_DATA:globalData,
  LJR_OFFICIAL_API:apiData?{getData:()=>apiData}:undefined
 };
 const document={
  readyState:'complete',
  documentElement:{classList:{toggle:(name,enabled)=>toggles.push({name,enabled})}},
  addEventListener(){},
  getElementById(){return null},
  querySelector(){return null}
 };
 const ctx={window,document,location,URLSearchParams,Element:class{},
  requestAnimationFrame:callback=>callback(),
  MutationObserver:class{observe(){}},
  fetch:url=>{calls.push(url);return Promise.reject(Error('Unexpected fetch'))}
 };
 vm.runInNewContext(js,ctx,{timeout:1000});
 return {toggles,calls};
}

test('Datos PC is parseable and loaded exactly once',()=>{
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const path of ['pc-datos-uefa-reference-20261011.js','pc-datos-uefa-reference-20261011.css']){
  const matches=index.match(new RegExp('src/'+path.replaceAll('.','\\.'),'g'))||[];
  assert.equal(matches.length,1,path+' must not be loaded twice');
 }
});

test('Datos PC never initializes or fetches on mobile or APK',()=>{
 for(const mode of ['mobile','apk']){
  const state=boot('?mode='+mode,{width:1440});
  assert.deepEqual(state.calls,[],mode+' must not fetch PC-only data');
  assert.ok(state.toggles.every(item=>item.enabled===false),mode+' must not set desktop CSS class');
 }
 const narrow=boot('',{width:390});
 assert.deepEqual(narrow.calls,[]);
 assert.ok(narrow.toggles.every(item=>item.enabled===false));
});

test('Datos PC uses a valid official API response when the injected global is empty',()=>{
 const official={categories:{'3':{name:'Primera Fuerza',standings:[{rows:[]}],scorers:[{rows:[]}]}},team_logos:{}};
 const state=boot('?mode=desktop',{globalData:{},apiData:official});
 assert.deepEqual(state.calls,[],'should not fetch again when official API data is already available');
 assert.ok(state.toggles.some(item=>item.name==='ljr-pc-datos-uefa'&&item.enabled===true));
});

test('The PC stylesheet and all interactive data controls remain scoped',()=>{
 assert.match(js,/!\['mobile','apk'\]\.includes\(mode\(\)\)/);
 assert.match(js,/route\(\)==='pc-data'/);
 assert.match(css,/html\.ljr-pc-datos-uefa body #screen/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
 for(const token of ['data-ljr-slide','data-ljr-filter','data-ljr-view','data-ljr-rank','data-ljr-download','scrollBy(','data-ljpc-csv']){
  assert.ok(js.includes(token),'Missing data control: '+token);
 }
 assert.match(js,/Esta estadística de jugadores no está publicada oficialmente/);
});
