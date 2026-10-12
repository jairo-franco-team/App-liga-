import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const script = read('src/desktop-home-score-story-gap-20261011.js');
const index = read('index.html');

function mount(mode='desktop'){
 let outer=0,inner=0,resizeCount=0;
 const events={};
 const style=(which)=>({
   setProperty:(name,value,priority)=>{
     assert.equal(name,'margin-top');
     assert.equal(priority,'important');
     if(which==='outer')outer=parseFloat(value);
     else inner=parseFloat(value);
   },
   removeProperty:name=>{
     assert.equal(name,'margin-top');
     if(which==='outer')outer=0;
     else inner=0;
   }
 });
 const rail={
   dataset:{},style:style('inner'),
   getBoundingClientRect:()=>({top:135+inner})
 };
 const frame={
   getBoundingClientRect:()=>({top:190+outer,width:1024}),
   contentDocument:{querySelector:selector=>selector.includes('stories list container')?rail:null},
   contentWindow:{
     Event:class{constructor(type){this.type=type}},
     dispatchEvent:event=>{assert.equal(event.type,'resize');resizeCount++}
   }
 };
 const screen={
   dataset:{},style:style('outer'),
   querySelector:selector=>selector==='#ljpc-exact-html-home'?frame:null,
   addEventListener:()=>{}
 };
 const bar={getBoundingClientRect:()=>({bottom:85,height:52})};
 const location={origin:'https://example.test',search:'?mode='+mode,hash:'#/home'};
 const document={
   readyState:'complete',
   getElementById:id=>id==='screen'?screen:id==='ljpc-exact-html-home'?frame:null,
   querySelector:selector=>selector.includes('ljpc-unified-pc-header')?bar:null,
   documentElement:{classList:{contains:name=>name==='ljpc-unified-pc'}},
   body:{classList:{contains:name=>name==='lj-desktop'}}
 };
 const window={
   innerWidth:1280,
   addEventListener:(name,handler)=>events[name]=handler,
   __LJPC_SCORE_STORY_GAP_20261011__:false
 };
 const context={
   window,document,location,URLSearchParams,
   MutationObserver:class{observe(){}},
   requestAnimationFrame:fn=>fn()
 };
 vm.runInNewContext(script,context);
 return {getOuter:()=>outer,getInner:()=>inner,getResizeCount:()=>resizeCount,events,location};
}

test('desktop PC removes only measured blank gap above stories and keeps layout in normal flow',()=>{
 const page=mount('desktop');
 assert.equal(page.getOuter(),-95);
 assert.equal(page.getInner(),-125);
 assert.equal(page.getResizeCount(),1);
 // In real DOM the next measurement reflects the previous adjustment;
 // the test's geometry mock also includes both negative margins.
 page.events.resize();
 assert.equal(page.getOuter(),-95);
 assert.equal(page.getInner(),-125);
 page.location.hash='#/competition';
 page.events.hashchange();
 assert.equal(page.getOuter(),0);
 assert.equal(page.getInner(),0);
});
test('mobile and APK keep both margins untouched',()=>{
 for(const mode of ['mobile','apk']){
  const page=mount(mode);
  assert.equal(page.getOuter(),0);
  assert.equal(page.getInner(),0);
  assert.equal(page.getResizeCount(),0);
 }
});
test('gap logic stays in an isolated desktop script and does not change controls',()=>{
 assert.match(index,/src\/desktop-home-score-story-gap-20261011\.js\?v=/);
 assert.match(script,/document\.documentElement\.classList\.contains\('ljpc-unified-pc'\)/);
 assert.match(script,/document\.body\.classList\.contains\('lj-desktop'\)/);
 assert.match(script,/mode!=='mobile'&&mode!=='apk'/);
 assert.doesNotMatch(script,/\.remove\(\)|innerHTML\s*=|pointer-events\s*:/);
});
