import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(import.meta.dirname,'..');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let blockOptionalBundle=false;
 await page.route('**/*',async r=>{
  const u=new URL(r.request().url());if(u.origin!=='https://mobile.test')return r.abort();
  const name=u.pathname==='/'?'index.html':u.pathname.slice(1),file=path.resolve(root,'dist',name);
  if(blockOptionalBundle&&/^assets\/index-.*\.js$/.test(name))return r.abort();
  try{await r.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream'})}catch{await r.fulfill({status:404,body:'missing'})}
 });
 blockOptionalBundle=true;
 await page.goto('https://mobile.test/?mode=apk&boot-isolation=1#/home',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.LJR_MAIN_ROUTE?.go,null,{timeout:5000});
 assert.equal(await page.locator('#screen').evaluate(e=>e.children.length>0),true,'core navigation and Home work before optional feature bundles finish');
 blockOptionalBundle=false;
 await page.goto('https://mobile.test/?mode=apk#/home',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.LJR_MAIN_ROUTE?.go&&!document.documentElement.classList.contains('ljr-preboot'));
 const go=async r=>{await page.evaluate(r=>window.LJR_MAIN_ROUTE.go(r),r);await page.waitForTimeout(950)};
 await go('history');
 await page.evaluate(()=>{window.__chromeCalls=0;const sync=window.LJR_CHROME.sync;window.LJR_CHROME.sync=function(...args){window.__chromeCalls++;return sync.apply(this,args)}});
 await page.waitForTimeout(1200);
 assert.ok(await page.evaluate(()=>window.__chromeCalls)<10,'idle history must not keep measuring/rebuilding its header');
 const back=await page.locator('.v620-history-top .ljr-chrome-actions .ljr-back-control').boundingBox();
 assert.ok(back.y>=24,'history controls must be lowered inside their header: '+back.y);
 const height=await page.locator('.v620-history-top').evaluate(e=>e.getBoundingClientRect().height);
 await page.evaluate(()=>{document.querySelector('#screen').scrollTop=240});await page.waitForTimeout(400);
 assert.ok(await page.locator('.v620-history-top').evaluate(e=>e.getBoundingClientRect().height)<height,'history collapses on scroll');
 await go('competition');const layouts=[];
 for(const tab of ['fixtures','standings','bracket']){
  await page.evaluate(tab=>{const state=window.LJR_MAIN_ROUTE.state;state.competitionTab=tab;localStorage.setItem('competitionTab',tab);window.LJR_MAIN_ROUTE.render()},tab);await page.waitForTimeout(850);
  layouts.push(await page.evaluate(()=>{const e=document.querySelector('#screen>.tabs');const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));
 }
 assert.deepEqual(layouts[1],layouts[0],'classification tabs keep their geometry');assert.deepEqual(layouts[2],layouts[0],'bracket tabs keep their geometry');
 await go('more');await page.evaluate(()=>window.LJR_MAIN_ROUTE.go('teams'));
 assert.equal(await page.locator('#ljr-route-loader').isVisible(),true,'navigation has a loading indicator');
 await page.waitForTimeout(1100);assert.equal(await page.locator('#ljr-route-loader').isVisible(),false,'loading indicator releases the new view');
 await page.evaluate(()=>{
  function event(type,x){const e=new Event(type,{bubbles:true});Object.defineProperty(e,type==='touchend'?'changedTouches':'touches',{value:[{clientX:x,clientY:350}]});document.querySelector('#screen').dispatchEvent(e)}
  event('touchstart',8);event('touchend',140);
 });await page.waitForTimeout(1100);assert.equal(await page.evaluate(()=>location.hash),'#/more','edge swipe returns to the previous section');
 await go('ligaQR');
 const qr=await page.locator('.v64-qr-frame').boundingBox(),title=await page.locator('.v64-qr-intro').boundingBox();
 assert.ok(title.y+title.height<=qr.y,'QR introduction stays above the code');
 assert.equal(await page.locator('.v64-qr-frame img').evaluate(e=>e.complete&&e.naturalWidth>0),true,'bundled QR loads with every external request blocked');
 await go('quizArena');
 assert.equal(await page.locator('#ljr-game-back').isVisible(),true,'quiz splash has a back arrow');
 assert.equal(await page.locator('.v1390-before-start summary').isVisible(),true,'quiz ranking is in the visible game portal');
 assert.equal(await page.locator('#ljr-game-back').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}),true,'quiz portal does not cover the back arrow');
 await page.locator('[data-v531-quiz-start]').first().click();await page.waitForTimeout(500);
 const originalBack=page.locator('#v612-quiz-portal [data-v531-view="hub"] [data-v531-quiz-back]');
 assert.equal(await originalBack.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),true,'the game fallback arrow never covers its original hub arrow');
 await go('quiniela');
 const rank=page.locator('[data-v1390-ranking]');assert.equal(await rank.count(),1,'game ranking is unique');
 assert.equal(await page.locator('[data-ljr-offline-link]').count()>0,true,'offline section is available');
 assert.deepEqual(errors,[],'no JavaScript errors');
 fs.mkdirSync(path.resolve(root,'artifacts/mobile-shell'),{recursive:true});await page.screenshot({path:path.resolve(root,'artifacts/mobile-shell/quiniela.png')});
 console.log('PASS: lowered/collapsible headers, stable competition tabs, loader, edge back, QR, game ranking and offline access');
}finally{await browser.close()}
