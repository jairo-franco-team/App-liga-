// Run after npm run build. Install Playwright or set PLAYWRIGHT_MODULE.
// Optional CHROMIUM_EXECUTABLE_PATH selects a preinstalled Chromium.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
let page;
try {
 page=await b.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 // Install before boot so asynchronously replaced screen nodes are also observed.
 await page.addInitScript(()=>{
  const original=Element.prototype.animate;
  window.__entryFrames=[];window.__entryMotion=[];
  Element.prototype.animate=function(frames,options){
   const animation=original.apply(this,arguments),screen=this;
   if(screen.id==='screen'&&document.getElementById('screen')===screen){
    window.__entryFrames.push(frames);
    const record={url:location.hash,from:frames?.[0]?.translate,samples:[],finished:false};
    window.__entryMotion.push(record);
    animation.finished.then(()=>{record.finished=true}).catch(()=>{record.cancelled=true});
    animation.ready.then(()=>{
     const sample=()=>{
      if(!screen.isConnected||document.getElementById('screen')!==screen)return;
      const style=getComputedStyle(screen);
      record.samples.push({x:parseFloat(style.translate)||0,visible:style.visibility==='visible'&&Number(style.opacity)>0});
      if(!record.finished&&!record.cancelled)requestAnimationFrame(sample);
     };
     sample();
    }).catch(()=>{});
   }
   return animation;
  };
 });
 const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.stack));
 page.on('response',r=>{if(r.status()>=400)failed.push([r.status(),r.url()])});
 await page.route('**/*',async route=>{
   if(new URL(route.request().url()).origin!=='http://app.test')return route.abort();
   let urlPath=new URL(route.request().url()).pathname.replace(/^\/App-liga-\//,'/');
   if(urlPath==='/')urlPath='/index.html';
   const file=path.join(root,'dist',urlPath);
   try{
     const body=fs.readFileSync(file),ext=path.extname(file).slice(1);
     await route.fulfill({body,contentType:({html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',webp:'image/webp',png:'image/png',jpg:'image/jpeg'})[ext]||'application/octet-stream'});
   }catch{await route.fulfill({status:404,body:'Not found'})}
 });


 await page.goto('http://app.test/?mode=apk#/competition',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.getElementById('screen')?.scrollHeight>0&&!document.documentElement.classList.contains('ljr-preboot')&&!document.documentElement.classList.contains('ljr-route-staging'));
 await page.evaluate(()=>{scrollTo(0,650);document.getElementById('screen').scrollTop=650});
 const previous=await page.evaluate(()=>({windowY:scrollY,screenY:document.getElementById('screen').scrollTop}));
 assert.ok(previous.windowY>0||previous.screenY>0,'competition has a real prior scroll position');
 await page.evaluate(()=>{window.__entryFrames=[];window.__entryMotion=[];location.hash='#/leagueData'});
 await page.waitForFunction(()=>window.__entryMotion.some(r=>r.url==='#/leagueData'&&r.from==='100% 0'&&r.samples.some(s=>s.visible&&s.x>1)),{},{timeout:5000});
 assert.ok(await page.evaluate(()=>window.__entryMotion.some(r=>r.url==='#/leagueData'&&r.from==='100% 0'&&r.samples.some(s=>s.visible&&s.x>1))),'visible page actually slides in from the right');
 await page.waitForFunction(()=>window.__entryMotion.some(r=>r.url==='#/leagueData'&&r.finished));
 await page.locator('[data-v33-back]').click();
 await page.waitForFunction(()=>location.hash==='#/competition');
 await page.waitForFunction(()=>window.__entryMotion.some(r=>r.url==='#/competition'&&r.from==='-100% 0'&&r.samples.some(s=>s.visible&&s.x < -1)),{},{timeout:5000});
 await page.waitForFunction(()=>window.__entryMotion.some(r=>r.url==='#/competition'&&r.finished));
 await page.waitForFunction(({windowY,screenY})=>Math.abs(scrollY-windowY)<5&&Math.abs(document.getElementById('screen').scrollTop-screenY)<5,previous,{timeout:5000});
 assert.equal(await page.evaluate(()=>location.hash),'#/competition');
 const restored=await page.evaluate(()=>({windowY:scrollY,screenY:document.getElementById('screen').scrollTop}));
 assert.ok(Math.abs(restored.windowY-previous.windowY)<5&&Math.abs(restored.screenY-previous.screenY)<5,'previous window and screen scroll restored');
 await page.evaluate(()=>location.hash='#/history');await page.waitForTimeout(450);await page.evaluate(()=>location.hash='#/more');await page.waitForTimeout(750);
 assert.equal(await page.evaluate(()=>location.hash),'#/more');assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>{const api=window.LJR_OFFICIAL_API;return api.getData().categories===api.getData().categories}),true,'official reads reuse unchanged data');
 console.log('PASS: visible forward/reverse page slides, leagueData back alias and exact previous scroll; rapid navigation stable');
}catch(error){
 console.error('Navigation motion diagnostic:',JSON.stringify(await page?.evaluate(()=>({
  route:location.hash,direction:window.LJR_NAVIGATION?.direction?.(),
  staging:document.documentElement.classList.contains('ljr-route-staging'),
  reduced:document.body.dataset.v1300Reduced,
  records:window.__entryMotion?.map(r=>({...r,samples:r.samples.slice(0,8)})),
  screen:document.getElementById('screen')?{visibility:getComputedStyle(document.getElementById('screen')).visibility,translate:getComputedStyle(document.getElementById('screen')).translate,scrollTop:document.getElementById('screen').scrollTop}:null
 }))));
 throw error;
}finally{await b.close()}
