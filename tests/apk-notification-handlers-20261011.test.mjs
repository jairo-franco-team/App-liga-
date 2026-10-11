import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as core from '../src/apk-first-install-state-20261011.js';
function environment({native=false,bridge={},values={},statusNodes=[] ,buttons=[]}={}){
 const source=fs.existsSync('src/apk-first-install-20261011.js')?fs.readFileSync('src/apk-first-install-20261011.js','utf8'):'';
 const events={},stored=new Map(Object.entries(values).map(([k,v])=>[k,JSON.stringify(v)]));
 const window={LJR_MAIN_ROUTE:{state:{user:{id:'me'},notifications:{enabled:false}}},addEventListener:(type,fn,capture)=>(events[type]??=[]).push(fn),dispatchEvent(){}};
 const screen={};let scrolled=false;
 const docEvents={};
 const document={readyState:'loading',body:{classList:{remove(){},add(){}}},querySelector:selector=>selector.includes('v46-ref-notifications-main')?{scrollIntoView(){scrolled=true},querySelector(){return {focus(){}}}}:null,querySelectorAll:selector=>selector.includes('device-copy')?statusNodes:buttons,addEventListener:(type,fn)=>(docEvents[type]??=[]).push(fn)};
 const localStorage={getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)};
 const context=vm.createContext({...core,window,document,localStorage,Capacitor:{isNativePlatform:()=>native},registerPlugin:()=>bridge,catalog:[],MutationObserver:class{observe(){}},setTimeout,clearTimeout,location:{hash:'#/notifications'},CustomEvent:class{},console});
 vm.runInContext(source.replace(/^import .*;\n/gm,''),context);
 return {window,events,docEvents,stored,scrolled:()=>scrolled};
}
test('current preferences card actually opens existing preferences while staying on route',()=>{
 const e=environment();assert.equal(typeof e.window.LJR_INSTALL_ONBOARDING?.openPreferences,'function');
 const card={matches:()=>true};let prevented=false;
 const event={target:{closest:selector=>selector.includes('v105-card')?card:null},preventDefault(){prevented=true},stopImmediatePropagation(){}};
 for(const fn of e.events.click||[])fn(event);
 assert.equal(prevented,true);assert.equal(e.scrolled(),true);
});
test('APK device button invokes native permission and records refusal without activating prefs',async()=>{
 let calls=0;
 const e=environment({native:true,bridge:{requestPermission:async()=>{calls++;return {granted:false}}},values:{'lj-store-v3':{user:{id:'me'},notifications:{enabled:false}},'lj-account-notifications-v46':{enabled:false}}});
 assert.equal(typeof e.window.LJR_INSTALL_ONBOARDING?.requestPermission,'function');
 const outcome=await e.window.LJR_INSTALL_ONBOARDING.requestPermission();
 assert.equal(calls,1);assert.equal(outcome.granted,false);
 assert.equal(JSON.parse(e.stored.get('ljr-native-notifications-v840')).granted,false);
 assert.equal(JSON.parse(e.stored.get('lj-account-notifications-v46')).enabled,false);
});
test('skipping notification permission persists completion and awaits Android bridge confirmation',async()=>{
 let complete=false;
 const e=environment({native:true,bridge:{completeOnboarding:async()=>{complete=true;return {completed:true}}}});
 assert.equal(typeof e.window.LJR_INSTALL_ONBOARDING?.finish,'function');
 await e.window.LJR_INSTALL_ONBOARDING.finish('skipped');
 assert.equal(complete,true);assert.equal(JSON.parse(e.stored.get(core.INSTALL_KEY)).completed,true);
 assert.equal(JSON.parse(e.stored.get(core.INSTALL_KEY)).permission,'skipped');
});
test('permission bridge errors never claim notifications activated',async()=>{
 const e=environment({native:true,bridge:{requestPermission:async()=>{throw Error('permission bridge failed')}}});
 assert.equal(typeof e.window.LJR_INSTALL_ONBOARDING?.requestPermission,'function');
 const outcome=await e.window.LJR_INSTALL_ONBOARDING.requestPermission();
 assert.equal(outcome.granted,false);assert.equal(outcome.state,'error');
 assert.equal(JSON.parse(e.stored.get('ljr-native-notifications-v840')).granted,false);
});
test('readonly permission checks coalesce and unchanged status writes no DOM or native feed',async()=>{
 let writes=0,checks=0,renders=0;
 function node(){let value='';return {dataset:{},get textContent(){return value},set textContent(next){writes++;value=next}}}
 const label=node(),button=node();
 const e=environment({native:true,bridge:{checkPermission:async()=>{checks++;return {granted:false,state:'denied'}}},statusNodes:[label],buttons:[button]});
 e.window.LJR_V840_NOTIFICATIONS={render(){renders++}};
 await Promise.all([e.window.LJR_INSTALL_ONBOARDING.checkPermission(),e.window.LJR_INSTALL_ONBOARDING.checkPermission()]);
 assert.equal(checks,1);assert.equal(writes,2);assert.equal(renders,1);
 await e.window.LJR_INSTALL_ONBOARDING.checkPermission();
 assert.equal(checks,2);assert.equal(writes,2);assert.equal(renders,1);
});
