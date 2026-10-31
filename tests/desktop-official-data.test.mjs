import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const db=JSON.parse(fs.readFileSync(new URL('../data/official-live.json',import.meta.url),'utf8'));
class FixedDate extends Date {
  constructor(...args){super(...(args.length?args:['2026-10-08T10:00:00-06:00']))}
  static now(){return new Date('2026-10-08T10:00:00-06:00').getTime()}
}
function setup(hash='#/home',width=1366){
  const screen={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[],appendChild(){}};
  const listeners={};
  const window={
    innerWidth:width,
    location:{hash,search:'?mode=desktop'},
    localStorage:{getItem:()=>null,setItem(){}},
    sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
    addEventListener:(k,fn)=>{(listeners[k]=listeners[k]||[]).push(fn)},
    fetch:async()=>({ok:true,json:async()=>structuredClone(db)}),
    Date:FixedDate,
    setTimeout:(fn)=>{fn();return 1},
    clearTimeout(){}
  };
  window.document={
    body:{classList:{contains:k=>k==='lj-desktop',add(){},remove(){},toggle(){}},dataset:{}},
    documentElement:{classList:{contains:()=>false}},
    getElementById:id=>id==='screen'?screen:null,
    querySelector:s=>s==='#screen'?screen:null,
    querySelectorAll:()=>[],
    addEventListener(){},
    createElement:()=>({className:'',dataset:{},style:{},setAttribute(){},appendChild(){},addEventListener(){},querySelector:()=>({textContent:''}),querySelectorAll:()=>[]})
  };
  window.MutationObserver=class{observe(){}};
  const code=fs.readFileSync(new URL('../src/desktop-official-data-v976.js',import.meta.url),'utf8');
  vm.runInNewContext(code,{...window,window,document:window.document,Date:FixedDate,fetch:window.fetch,MutationObserver:window.MutationObserver,URLSearchParams,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout});
  return {window,screen,listeners};
}

test('PC official data runtime replaces mock statistics and renders real five-category standings',()=>{
  const w=setup('#/pc-standings');
  assert.ok(w.window.LJR_PC_OFFICIAL_DATA);
  assert.match(w.screen.innerHTML,/Clasificación oficial · Primera Fuerza/);
  assert.match(w.screen.innerHTML,/SAN JOSE FC/);
  assert.match(w.screen.innerHTML,/GALACTICOS/);
  assert.match(w.screen.innerHTML,/-21/);
  assert.doesNotMatch(w.screen.innerHTML,/Relámpago|Juan Pérez|Carlos Ruiz/);
});

test('Registros view renders official rosters and real player profile fields without placeholders',()=>{
  const w=setup('#/pc-registrations');
  const sanJoseCount=db.categories['3'].rosters['SAN JOSE FC'].length;
  assert.match(w.screen.innerHTML,/SAN JOSE FC/);
  assert.match(w.screen.innerHTML,new RegExp(sanJoseCount+' jugadores'));
  assert.match(w.screen.innerHTML,new RegExp('Plantilla oficial publicada \\('+sanJoseCount+'\\)'));
  assert.match(w.screen.innerHTML,/Gibran Ulises/);
  assert.doesNotMatch(w.screen.innerHTML,/CURP|INE|carta firmada|18 jugadores demo/);
});

test('Matches view separates played scores from upcoming fixtures with official countdown',()=>{
  const w=setup('#/pc-fixtures');
  assert.match(w.screen.innerHTML,/Próximos partidos oficiales/);
  assert.match(w.screen.innerHTML,/Resultados oficiales registrados/);
  assert.match(w.screen.innerHTML,/Faltan 3d 00h/);
  assert.match(w.screen.innerHTML,/FRANCO FC/);
  assert.match(w.screen.innerHTML,/GALACTICOS/);
});
