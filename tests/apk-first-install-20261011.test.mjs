import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const core=await import('../src/apk-first-install-state-20261011.js').catch(()=>({}));
function memory(values={}){const map=new Map(Object.entries(values).map(([k,v])=>[k,JSON.stringify(v)]));return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}}

test('first-install: APK only, completion and Android updates never restart onboarding',()=>{
 assert.equal(typeof core.shouldStart,'function');
 assert.equal(core.shouldStart({native:false,install:{firstInstall:true}}),false);
 assert.equal(core.shouldStart({native:true,install:{firstInstall:true},saved:{}}),true);
 assert.equal(core.shouldStart({native:true,install:{firstInstall:false},saved:{}}),false);
 assert.equal(core.shouldStart({native:true,install:{firstInstall:true,completed:true},saved:{}}),false);
 assert.equal(core.shouldStart({native:true,install:{firstInstall:true},saved:{completed:true}}),false);
 assert.equal(core.shouldStart({native:true,install:{firstInstall:true},saved:{},existingUser:true}),false);
});
test('onboarding: reference step order and pending step survive relaunch',()=>{
 assert.deepEqual(core.STEPS,['privacy','consent','teams','notifications']);
 assert.equal(core.resumeStep({step:'teams'}),'teams');
 assert.equal(core.resumeStep({step:'unknown'}),'privacy');
});
test('consent: rejection preserves profile and disables optional personalisation in both existing stores',()=>{
 assert.equal(typeof core.saveConsent,'function');
 const storage=memory({'lj-store-v3':{user:{id:'existing'},favorites:['kept'],privacy:{analytics:true}},'lj-store-v5':{language:'Español'}});
 const state={user:{id:'existing'}};
 core.saveConsent(storage,state,{personalization:false});
 const s=JSON.parse(storage.getItem('lj-store-v3'));
 assert.deepEqual(s.user,{id:'existing'});assert.deepEqual(s.favorites,['kept']);
 assert.deepEqual(s.privacy,{essential:true,analytics:false,personalization:false,accepted:true});
 assert.equal(JSON.parse(storage.getItem('lj-store-v5')).consent.personalization,false);
 assert.equal(state.privacy.personalization,false);
});
test('notification changes reconcile legacy account and runtime preferences without replacing user',()=>{
 assert.equal(typeof core.saveNotificationPrefs,'function');
 const storage=memory({'lj-account-notifications-v46':{goal:false},'lj-store-v3':{user:{id:'me'},notifications:{enabled:false,goal:false}}});
 const state={user:{id:'me'},notifications:{enabled:false,goal:false}};
 const saved=core.saveNotificationPrefs(storage,state,{enabled:true,goal:true,final:false});
 assert.equal(saved.goal,true);assert.equal(JSON.parse(storage.getItem('lj-store-v3')).notifications.enabled,true);
 assert.equal(state.notifications.final,false);assert.deepEqual(state.user,{id:'me'});
});
test('followed selection keeps official IDs including multiple registrations without overwriting profile',()=>{
 assert.equal(typeof core.saveFollowed,'function');
 const storage=memory({'lj-store-v3':{user:{id:'me'},favorites:['a'],followed:['OFF-BOAVISTA']}});
 const state={};core.saveFollowed(storage,state,['OFF-JUVENTUS','OFF-JUVENTUS-V35']);
 assert.deepEqual(state.followed,['OFF-BOAVISTA','OFF-JUVENTUS','OFF-JUVENTUS-V35']);
 assert.deepEqual(JSON.parse(storage.getItem('lj-store-v3')).user,{id:'me'});
});
test('native permission result honours actual block/error and permission API is never automatic',async()=>{
 assert.equal(typeof core.devicePermission,'function');
 let requests=0;
 const bridge={checkPermission:async()=>({granted:false,blocked:true}),requestPermission:async()=>{requests++;return {granted:true}}};
 const status=await core.devicePermission({native:true,bridge,request:false});assert.equal(status.granted,false);assert.equal(requests,0);
 const denied=await core.devicePermission({native:true,bridge:{requestPermission:async()=>({granted:false})},request:true});
 assert.equal(denied.state,'denied');
 const broken=await core.devicePermission({native:true,bridge:{requestPermission:async()=>{throw Error('bridge unavailable')}},request:true});
 assert.equal(broken.state,'error');assert.equal(broken.granted,false);assert.match(broken.message,/bridge unavailable/);
});
test('web permission does not assert background subscription, and denied never reprompts',async()=>{
 assert.equal(typeof core.devicePermission,'function');let calls=0;
 const permission={permission:'denied',requestPermission:async()=>{calls++;return 'granted'}};
 const value=await core.devicePermission({native:false,notification:permission,request:true});
 assert.equal(value.state,'denied');assert.equal(calls,0);
 assert.equal((await core.devicePermission({native:false,notification:null,request:true})).state,'unsupported');
});
test('onboarding catalog contains all 51 actual clubs with follow IDs supported by existing page',()=>{
 const s=readFileSync(new URL('../src/v25-following-reference.js',import.meta.url),'utf8');
 const ids=JSON.parse(s.match(/const TEAMS=(\[[\s\S]*?\]);/)[1]).map(t=>t.id);
 const catalog=JSON.parse(readFileSync(new URL('../src/onboarding-team-catalog-20261011.json',import.meta.url),'utf8'));
 assert.equal(catalog.length,51);
 for(const t of catalog){assert.ok(t.ids.length,t.name);assert.ok(t.ids.every(id=>ids.includes(id)),t.name)}
});
test('native status restore retains explicit Android refusal after returning from Settings',async()=>{
 const result=await core.devicePermission({native:true,bridge:{checkPermission:async()=>({granted:false,state:'denied'})},request:false});
 assert.equal(result.state,'denied');assert.equal(result.granted,false);
});
