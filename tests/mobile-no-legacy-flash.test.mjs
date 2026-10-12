import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = name => readFileSync(new URL('../src/'+name, import.meta.url),'utf8');
function renderRoute(route, mode='apk') {
 const main=source('main.js');
 const screen={innerHTML:''};let homeCalls=0;
 const context={state:{route},screen,views:{home:()=>{homeCalls++;return '<section class="stories">Inicio</section>';}},document:{body:{dataset:{},classList:{add(){}}}},window:{dispatchEvent(){}},location:{search:'?mode='+mode},URLSearchParams,Event,bind(){},bindV553Weekly(){},setTimeout(){}};
 vm.runInNewContext(main.slice(main.indexOf('function render(){'),main.indexOf('function go(route')),context);
 context.render();return {html:screen.innerHTML,homeCalls};
}
test('mobile delegated sections never construct Home before their own content',()=>{
 for(const route of ['accountPrivacy','accountPreferences','accountAdvisor','accountCloud','leagueData','safe-about','televisados']){
  const result=renderRoute(route);assert.equal(result.homeCalls,0,route+' must not build Home');assert.match(result.html,/data-(ljr-reference|v569-auth)-mount/);
 }
});
test('unknown routes keep their fallback and desktop account routing is unchanged',()=>{
 assert.equal(renderRoute('unknown-route').homeCalls,1);
 assert.equal(renderRoute('accountPrivacy','desktop').homeCalls,1);
 assert.equal(renderRoute('home','desktop').homeCalls,0);
});
test('captured design applies in the same rendering turn, before the next painted frame',async()=>{
 const microtasks=[],frames=[];let observer;let scans=0;
 const screen={dataset:{},querySelectorAll(){return[];},querySelector(){return null;},removeAttribute(name){if(name==='data-captured-design')delete this.dataset.capturedDesign;}};
 const body={dataset:{appRoute:'home'}};
 const context={URLSearchParams,location:{search:'?mode=apk'},window:{innerWidth:412,addEventListener(){}},document:{readyState:'complete',body,getElementById(){scans++;return screen;},querySelector(){return null;},querySelectorAll(){return[];}},MutationObserver:class{constructor(fn){observer=fn;}observe(){}},queueMicrotask:fn=>microtasks.push(fn),requestAnimationFrame:fn=>frames.push(fn)};
 vm.runInNewContext(source('v1441-captured-design.js'),context);
 body.dataset.appRoute='accountPrivacy';
 const element={nodeType:1,namespaceURI:'http://www.w3.org/1999/xhtml',matches:()=>false};
 observer([{addedNodes:[element],removedNodes:[]}]);observer([{addedNodes:[element],removedNodes:[]}]);
 while(microtasks.length)microtasks.shift()();
 assert.equal(screen.dataset.capturedDesign,'orbit','new controls must already have their approved design before RAF paint');
 assert.equal(scans,2,'several DOM changes in one turn coalesce into one scan');
 assert.equal(frames.length,0,'decoration must not leave an unstyled frame');
 observer([{addedNodes:[{nodeType:3}],removedNodes:[]}]);assert.equal(microtasks.length,0,'text clocks cannot trigger a surface scan');
});
test('returning to the app resumes only visible decorative videos; leaving pauses them',()=>{
 const code=source('v105-green-app-bottom.js');
 const begin=code.lastIndexOf("document.addEventListener('visibilitychange'");
 const end=code.indexOf('\nconst screen=',begin);
 const video=top=>({plays:0,pauses:0,getBoundingClientRect:()=>({top,bottom:top+150,left:0,right:412}),play(){this.plays++;return Promise.resolve();},pause(){this.pauses++;}});
 const visible=video(200),offscreen=video(1800);let handler;
 const document={hidden:false,documentElement:{clientHeight:915,clientWidth:412},addEventListener(_,fn){handler=fn;}};
 vm.runInNewContext(code.slice(begin,end),{document,window:{innerHeight:915,innerWidth:412},$$:()=>[visible,offscreen]});
 handler();assert.equal(visible.plays,1);assert.equal(offscreen.plays,0,'offscreen artwork must not restart on app return');assert.equal(offscreen.pauses,1);
 document.hidden=true;handler();assert.equal(visible.pauses,1);assert.equal(offscreen.pauses,2);assert.equal(visible.plays,1);
});
