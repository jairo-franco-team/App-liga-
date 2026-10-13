import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const code=readFileSync(new URL('../src/pc-fantasy-uefa-builder-20261012.js',import.meta.url),'utf8');
const style=readFileSync(new URL('../src/pc-fantasy-uefa-builder-20261012.css',import.meta.url),'utf8');

function boot(mode='desktop',width=1200){
 const store=new Map(),listeners=new Map();
 let mounted=null;
 const fakeScreen={
  querySelector(q){if(q.includes('#ljpc-fantasy-uefa'))return mounted;return null;},
  prepend(el){mounted=el;}
 };
 const html={classList:{toggle(){}},};
 const fakeDocument={
  readyState:'loading',documentElement:html,
  addEventListener(name,cb){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(cb);},
  querySelector(s){return s==='#screen'?fakeScreen:null;},
  getElementById(id){return id==='ljpc-fantasy-uefa'?mounted:null;},
  createElement(tag){
   const el={tagName:tag.toUpperCase(),dataset:{},innerHTML:'',setAttribute(){},remove(){mounted=null},querySelector(){return null}};
   return el;
  }
 };
 class ElementFake{
  constructor(dataset){this.dataset=dataset}
  closest(){return this}
 }
 const category={
  name:'Primera Fuerza',
  player_profiles:{'Example FC':[
   {name:'Juan Pérez',position:'delantero'},
   {name:'Luis Ramírez',position:'mediocampista'},
   {name:'Carlos Medina',position:'defensa'},
   {name:'Roberto García',position:'portero'}
  ]}
 };
 const windowListeners=new Map();
 const api={LJR_OFFICIAL_DATA:{categories:{'3':category}},addEventListener(name,cb){windowListeners.set(name,cb)}};
 const ctx=vm.createContext({
  window:api,document:fakeDocument,location:{hash:'#/fantasy',search:'?mode='+mode},
  innerWidth:width,Element:ElementFake,
  localStorage:{getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,String(v))}},
  MutationObserver:class{observe(){}disconnect(){}},
  requestAnimationFrame(cb){cb()},fetch(){throw Error('Network fetch unnecessary in smoke test')},
  URLSearchParams,Set,Map,Number,Array,Object,Math,JSON,Date,String,decodeURIComponent,encodeURIComponent
 });
 vm.runInContext(code,ctx,{timeout:4000});
 for(const fn of listeners.get('DOMContentLoaded')||[])fn();
 return {store,listeners,windowListeners,mounted:()=>mounted,ElementFake};
}

test('Fantasy desktop renders complete 15-slot pitch and player filters',()=>{
 const app=boot('desktop');
 const html=app.mounted()?.innerHTML||'';
 assert.match(html,/Fantasy Football/);
 assert.match(html,/Elige tu equipo/);
 assert.equal((html.match(/class="pcfy-slot /g)||[]).length,15);
 assert.match(html,/Juan Pérez/);
 assert.match(html,/data-pcfy-filter="position"/);
 assert.match(html,/data-pcfy-filter="team"/);
 assert.match(html,/data-pcfy-filter="price"/);
 assert.match(html,/Presupuesto restante/);
 assert.match(html,/data-pcfy-action="auto"/);
 assert.match(html,/data-pcfy-action="reset"/);
});
test('Fantasy desktop can add a real roster player and updates saved lineup',()=>{
 const app=boot('desktop');
 const html=app.mounted().innerHTML;
 const encoded=html.match(/data-pcfy-pick="([^"]+)"/)?.[1];
 assert.ok(encoded,'Roster selection must be available');
 const target=new app.ElementFake({pcfyPick:encoded});
 for(const fn of app.listeners.get('click')||[]){
  fn({target,preventDefault(){},stopPropagation(){}});
 }
 const saved=JSON.parse(app.store.get('v576-fantasy-squad')||'[]');
 assert.equal(saved.length,1);
 assert.equal(saved[0].name,'Juan Pérez');
 assert.equal(saved[0].slot,0);
 assert.match(app.mounted().innerHTML,/1 \/ 15/);
});
test('Desktop fantasy does not mount in mobile or APK',()=>{
 for(const mode of ['mobile','apk']){
  const app=boot(mode,390);
  assert.equal(app.mounted(),null,mode+' must retain original design');
 }
});
test('PC fantasy stylesheet is isolated from native mobile components',()=>{
 assert.match(style,/html\.ljpc-fantasy-uefa-active body #ljpc-fantasy-uefa/);
 assert.doesNotMatch(style,/^body\[data-app-route="fantasy"\]/m);
 assert.doesNotMatch(style,/#app\s*\{/m);
});
