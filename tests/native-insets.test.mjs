import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
test('native insets reserve controls before optional bundles load and release only after the bridge responds',async()=>{
 const classes=new Set(),values={},listeners={};let resolve;
 const document={documentElement:{classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)},style:{setProperty:(k,v)=>values[k]=v}},body:{classList:{add:v=>classes.add(v)}},addEventListener:(k,fn)=>listeners[k]=fn};
 const window={Capacitor:{isNativePlatform:()=>true,nativePromise:(p,m)=>{assert.equal(p,'LigaInsets');assert.equal(m,'getInsets');return new Promise(r=>resolve=r)}}};
 vm.runInNewContext(fs.readFileSync(new URL('../src/native-insets.js',import.meta.url),'utf8'),{window,document,Promise,addEventListener:(k,fn)=>listeners[k]=fn});assert.ok(classes.has('ljr-insets-loading'));
 resolve({top:36,bottom:24,left:0,right:0});await new Promise(r=>setImmediate(r));assert.equal(values['--ljr-native-top'],'36px');assert.equal(values['--ljr-native-bottom'],'24px');assert.ok(!classes.has('ljr-insets-loading'));assert.ok(classes.has('ljr-native-insets'));
 listeners.resize();resolve({top:24,bottom:0,left:20,right:0});await new Promise(r=>setImmediate(r));assert.equal(values['--ljr-native-left'],'20px');assert.equal(values['--ljr-native-top'],'24px');
});
