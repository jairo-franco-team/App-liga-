/* Compiled app: inspect actual DOM insertions and every visible frame, not just
   the finished page. External services are blocked; production code is intact. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'artifacts/mobile-clean-boot');
const native=!!process.env.ANDROID_PUBLIC_DIR;
const dist=resolve(root,process.env.ANDROID_PUBLIC_DIR||'dist');
const aliases=native?JSON.parse(readFileSync(resolve(dist,'../liga-asset-aliases.json'),'utf8')):{};
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const missing=[];
const delegated=['accountPrivacy','accountPreferences','accountAdvisor','accountCloud','leagueData','safe-about','televisados'];
const themes={ligaControl:'sport',leagueTools:'facets',discipline:'facets',recruitment:'sport',refereeOffline:'sport',cedulas:'orbit',players:'orbit',v38Weekly:'cyan',bracketBuilder:'facets',publicationCenter:'prism',profile:'prism',accountPassword:'orbit',accountDevices:'facets',accountSecurity:'prism',accountPrivacy:'orbit',accountPreferences:'cyan',accountAdvisor:'facets',notifications:'cyan',permissionBuilder:'orbit',matchCenter:'sport',quiniela:'prism',matchday:'sport',agendaBuilder:'cyan',weatherFields:'cyan',cedulaBuilder:'orbit',rulebook:'facets',ligaQR:'prism',televisados:'sport',v38Alerts:'cyan',suspensionTool:'facets',accountEdit:'orbit',news:'prism',search:'cyan',scheduleChanges:'facets',credentialBuilder:'orbit'};
try{
 const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!=='https://royal.test')return route.abort();
  let name=decodeURIComponent(url.pathname.replace(/^\/App-liga-\//,''));if(!name||name==='/')name='index.html';
  name=name.replace(/^\//,'');const file=resolve(dist,aliases[name]||name);
  try{await route.fulfill({body:readFileSync(file),contentType:({'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.woff2':'font/woff2'})[extname(file)]||'text/html'});}
  catch{missing.push(name);await route.fulfill({status:404,body:'Missing packaged asset'});}
 });
 await page.addInitScript(({delegated,themes})=>{
  window.__cleanBoot={homeWrites:[],wrongFrames:[],frames:0};
  const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  Object.defineProperty(Element.prototype,'innerHTML',{...descriptor,set(value){
   const route=document.body?.dataset.appRoute;
   if(this.id==='screen'&&delegated.includes(route)&&String(value).includes('data-v15-home-feature'))window.__cleanBoot.homeWrites.push(route);
   return descriptor.set.call(this,value);
  }});
  function frame(){
   const screen=document.getElementById('screen'),route=location.hash.replace(/^#\/?/,'').split('?')[0]||document.body?.dataset.appRoute;
   const expected=themes[route];
   if(screen&&expected&&screen.children.length&&screen.firstElementChild?.attributes.length&&getComputedStyle(screen).visibility==='visible'&&!screen.firstElementChild.matches('[data-ljr-reference-mount],[data-v569-auth-mount]')){
    window.__cleanBoot.frames++;
    if(screen.dataset.capturedDesign!==expected&&window.__cleanBoot.wrongFrames.length<30)window.__cleanBoot.wrongFrames.push({route,expected,actual:screen.dataset.capturedDesign});
   }
   requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
 },{delegated,themes});
 // All initial delegated URLs must mount their actual module without Home.
 for(const route of delegated){
  await page.goto('https://royal.test/App-liga-/?mode=mobile#/'+route,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.LJR_MAIN_ROUTE?.go);
  await page.waitForTimeout(1300);
  const result=await page.evaluate(()=>({audit:window.__cleanBoot,text:document.getElementById('screen')?.textContent.trim(),placeholder:!!document.querySelector('#screen>:only-child:is([data-ljr-reference-mount],[data-v569-auth-mount])')}));
  assert.equal(result.placeholder,false,route+' must mount actual content');assert.ok(result.text?.length>15,route+' has real controls/content');
  assert.deepEqual(result.audit.homeWrites,[],route+' cold boot cannot construct Home');assert.deepEqual(result.audit.wrongFrames,[],route+' has no visible legacy frame');
 }
 for(const route of [...Object.keys(themes),...delegated]){
  await page.evaluate(r=>window.LJR_MAIN_ROUTE.go(r),route);await page.waitForTimeout(1100);
  const audit=await page.evaluate(()=>window.__cleanBoot);
  assert.deepEqual(audit.homeWrites,[],'No delegated page constructs Home during navigation');
  assert.deepEqual(audit.wrongFrames,[],'Every visible captured frame has the approved design');
 }
 const audit=await page.evaluate(()=>window.__cleanBoot);assert.ok(audit.frames>10,'Sampler observes actual painted mobile controls');
 if(native){
  // Request the actual removed URLs through the native manifest boundary,
  // including query strings. Production fetch/image code is not stubbed.
  const report=JSON.parse(readFileSync(resolve(root,'android-asset-report.json'),'utf8'));
  for(const name of Object.keys(aliases)){
   const result=await page.evaluate(async name=>{
    const response=await fetch('/App-liga-/'+name+'?native-asset-audit=1');
    const bytes=await response.arrayBuffer();const hash=await crypto.subtle.digest('SHA-256',bytes);
    return {status:response.status,sha256:Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('')};
   },name);
   assert.equal(result.status,200,name+' original URL remains reachable');assert.equal(result.sha256,report.inventory[name].sha256,name+' original bytes preserved');
  }
 }
 // Optional external data is aborted; local script/design assets may not be missing.
 const critical=missing.filter(name=>/\.(?:js|css|png|jpe?g|webp|svg|woff2)(?:$|\?)/i.test(name));
 assert.deepEqual([...new Set(critical)],[],'No missing packaged script, design, logo or font');
 await page.screenshot({path:resolve(out,native?'native-packaged.png':'compiled-mobile.png')});
 writeFileSync(resolve(out,native?'native-report.json':'web-report.json'),JSON.stringify({native,frames:audit.frames,delegatedRoutes:delegated,capturedRoutes:Object.keys(themes),homeWrites:audit.homeWrites,wrongFrames:audit.wrongFrames,aliasesVerified:Object.keys(aliases).length,missing},null,2));
 console.log(JSON.stringify({native,visibleFrames:audit.frames,initialRoutes:delegated.length,capturedRoutes:Object.keys(themes).length,aliasURLsVerified:Object.keys(aliases).length,legacyFrames:audit.wrongFrames.length}));
}finally{await browser.close();}
