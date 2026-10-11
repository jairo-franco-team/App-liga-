import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/v1455-account-uefa-compact.js',import.meta.url),'utf8');
function run(mode,width){
 let layouts=0;
 const element=()=>({dataset:{},setAttribute(){},classList:{add(){},remove(){},contains(){return mode==='desktop'}},appendChild(){},querySelectorAll(){return[]}});
 const page={...element(),dataset:{v569Page:'accountEdit'},closest:()=>null,parentNode:{insertBefore(){layouts++;}}};
 const screen=element();
 const document={readyState:'complete',body:element(),getElementById:()=>screen,querySelector:s=>s.includes('.v569-page')?page:null,createElement:element};
 const window={innerWidth:width,addEventListener(){},LJR_V569_AUTH:{currentAccount:()=>({name:'Prueba'})}};
 vm.runInNewContext(source,{window,document,location:{hash:'#/accountEdit',search:'?mode='+mode},innerWidth:width,URLSearchParams,MutationObserver:class{observe(){}},requestAnimationFrame:f=>f(),setTimeout(){}});
 return layouts;
}
test('mobile profile does not acquire the PC Mi Liga sidebar',()=>assert.equal(run('apk',412),0));
test('explicit mobile mode also stays independent on a wide screen',()=>assert.equal(run('mobile',1366),0));
test('the original PC account navigation stays available in desktop mode',()=>assert.equal(run('desktop',1366),1));
