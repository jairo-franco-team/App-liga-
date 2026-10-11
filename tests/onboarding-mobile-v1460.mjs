/* CI-only visual/interaction coverage of the actual compiled app.
   Only Android OS plugin boundaries are simulated; remote traffic is blocked. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'dist'),output=resolve(root,'artifacts/v1460-onboarding');
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const reports=[];
async function newApk(width,height,existingUser=false){
 const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
 if(existingUser)await page.addInitScript(()=>localStorage.setItem('lj-store-v3',JSON.stringify({user:{id:'existing-test-user',name:'Usuario existente',email:'existing@example.invalid'},favorites:['kept']})));
 await page.addInitScript(()=>{
  window.androidBridge={};
  const state=window.__ligaTestOS={firstInstall:sessionStorage.getItem('test-android-updated')!=='true',completed:sessionStorage.getItem('test-android-completed')==='true',granted:false,requested:sessionStorage.getItem('test-android-requested')==='true',calls:[]};
  window.Capacitor={PluginHeaders:[{name:'LigaNotifications',methods:['getInstallationState','completeOnboarding','checkPermission','requestPermission','openNotificationSettings','notifyMatch','notifyRich'].map(name=>({name,rtype:'promise'}))}],nativePromise:async(plugin,method)=>{
   state.calls.push(method);
   if(method==='getInstallationState')return {firstInstall:state.firstInstall,completed:state.completed};
   if(method==='completeOnboarding'){state.completed=true;sessionStorage.setItem('test-android-completed','true');return {completed:true}}
   if(method==='checkPermission')return {granted:state.granted,state:state.granted?'granted':state.requested?'denied':'default',blocked:false};
   if(method==='requestPermission'){state.requested=true;sessionStorage.setItem('test-android-requested','true');return {granted:state.granted,state:state.granted?'granted':'denied',blocked:false}}
   if(method==='openNotificationSettings')return {opened:true};
   return {shown:true};
  }};
 });
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.origin!=='http://liga.test')return route.abort();
  let pathname=url.pathname.replace(/^\/App-liga-\//,'/');if(pathname==='/')pathname='/index.html';
  try{await route.fulfill({body:readFileSync(resolve(dist,'.'+pathname)),contentType:({'.css':'text/css','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'})[extname(pathname)]||'text/html'})}
  catch{await route.fulfill({status:404,body:'Asset unavailable in isolated test'})}
 });
 await page.goto('http://liga.test/App-liga-/?mode=apk#/home',{waitUntil:'domcontentloaded'});
 return page;
}
async function step(page,name,width){
 await page.waitForSelector('#ljr-install-onboarding[data-step="'+name+'"]');
 await page.locator('#ljr-install-onboarding').evaluate(e=>e.scrollTop=0);
 await page.screenshot({path:resolve(output,width+'-'+name+'.png')});
 const dimensions=await page.locator('#ljr-install-onboarding').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));
 assert.ok(dimensions.scroll<=dimensions.width+1,name+' has no horizontal overflow');
 assert.equal(await page.evaluate(()=>window.__ligaTestOS.calls.includes('requestPermission')),false,'No permission prompt before user activates');
}
try{
 for(const [width,height] of [[360,800],[412,915]]){
  const page=await newApk(width,height);
  await step(page,'privacy',width);
  await page.locator('[data-install-action="start"]').click();await step(page,'consent',width);
  await page.locator('[data-install-action="consent-reject"]').click();await step(page,'teams',width);
  assert.equal(await page.locator('[data-install-team]').count(),51);
  const logos=await page.locator('[data-install-team] img').evaluateAll(es=>es.map(e=>e.getAttribute('src')));
  assert.ok(logos.every(src=>src.includes('/assets/season-2026/')),'Actual locally packaged Liga logos only');
  await page.locator('[data-install-search]').fill('Pozos');
  const club=page.locator('[data-install-team="POZOS FC"]');assert.equal(await club.count(),1);await club.click();
  await page.locator('[data-install-action="teams-next"]').click();await step(page,'notifications',width);
  await page.locator('[data-install-action="activate"]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('ljr-apk-first-install-20261011')||'{}').completed===true);
  assert.match(await page.locator('[data-install-status]').textContent(),/bloqueadas|no autorizadas/i);
  assert.equal(await page.evaluate(()=>window.__ligaTestOS.calls.filter(x=>x==='requestPermission').length),1);
  await page.locator('[data-install-action="finish"]').click();await page.waitForSelector('#ljr-install-onboarding',{state:'detached'});
  const stored=await page.evaluate(()=>({store:JSON.parse(localStorage.getItem('lj-store-v3')),perm:JSON.parse(localStorage.getItem('ljr-native-notifications-v840')),completed:window.__ligaTestOS.completed}));
  assert.equal(stored.completed,true);assert.equal(stored.perm.granted,false);assert.equal(stored.store.privacy.personalization,false);assert.ok(stored.store.followed.includes('OFF-POZOS-FC-V35'));
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.LJR_INSTALL_ONBOARDING);
  assert.equal(await page.locator('#ljr-install-onboarding').count(),0,'Refusal/completion survives relaunch');
  await page.evaluate(()=>{localStorage.removeItem('ljr-apk-first-install-20261011');sessionStorage.removeItem('test-android-completed');sessionStorage.setItem('test-android-updated','true')});
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.LJR_INSTALL_ONBOARDING);
  assert.equal(await page.locator('#ljr-install-onboarding').count(),0,'Existing APK upgrades do not restart onboarding');
  reports.push({width,height,steps:4,actualTeams:51,permission:'refused',completion:true});await page.close();
  const existing=await newApk(width,height,true);
  await existing.waitForFunction(()=>!!window.LJR_INSTALL_ONBOARDING&&window.__ligaTestOS.calls.includes('getInstallationState'));
  assert.equal(await existing.locator('#ljr-install-onboarding').count(),0,'Authenticated existing user is not forced through onboarding');
  assert.equal(await existing.evaluate(()=>JSON.parse(localStorage.getItem('lj-store-v3')).user.id),'existing-test-user','Existing profile stays intact');
  await existing.close();
 }
 writeFileSync(resolve(output,'report.json'),JSON.stringify({boundary:'Simulated Android OS bridge, real compiled app; no handset delivery claimed',reports},null,2)+'\n');
 console.log('Onboarding compiled app checks passed for 360px and 412px. Android OS boundary was simulated.');
}finally{await browser.close()}
