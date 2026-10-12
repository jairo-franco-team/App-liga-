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
 await page.goto('https://mobile.test/?mode=apk#/home',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.LJR_MAIN_ROUTE?.go&&!document.documentElement.classList.contains('ljr-preboot'));
 const go=async r=>{await page.evaluate(r=>window.LJR_MAIN_ROUTE.go(r),r);await page.waitForTimeout(1000)};
 const visible=async selector=>page.locator(selector).evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length&&getComputedStyle(n).display!=='none'&&getComputedStyle(n).visibility!=='hidden').length);
 await go('teamDetail');assert.equal(await visible('#app>.topbar'),0,'team has just its original header');assert.equal(await page.locator('.v42-follow').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');assert.ok((await page.locator('.v42-share').boundingBox()).height<=40);
 await go('playerDetail');assert.equal(await visible('#app>.topbar'),0,'player has just its own header');assert.equal(await visible('.v379-back'),1,'original player back survives');assert.ok((await page.locator('.v386-compare').boundingBox()).height<=40);
 await go('video');const tv=await page.locator('.v17-tv-profile').boundingBox();assert.ok(tv.x+tv.width<=412&&tv.width>=36,'TV profile has a medium hit area inside the viewport');assert.ok(await page.locator('.v17-tv-profile-icon').evaluate(e=>e.getAttribute('src').endsWith('profile-tv-reference.svg')),'TV profile SVG padding no longer shrinks its visible glyph');
 await page.evaluate(()=>{const icon=document.querySelector('.v17-tv-profile-icon');icon.dataset.stability='keep';icon.decoding='async';const probe=document.createElement('span');document.querySelector('#screen').append(probe);probe.remove()});await page.waitForTimeout(600);assert.equal(await page.locator('.v17-tv-profile-icon').getAttribute('data-stability'),'keep','TV avatar survives other page mutations and native image attributes');
 await go('teams');assert.equal(await visible('#app>.topbar'),0);assert.equal(await page.locator('[data-ljr-list-more]').count(),0,'all teams render without pagination');assert.ok(await page.locator('.v27-grid button').count()>25,'directory includes all categories');
 await go('following');assert.equal(await visible('#app>.topbar'),0);await page.locator('[data-v28-picker]').last().click();await page.waitForTimeout(500);assert.equal(await visible('#app>.topbar'),0,'team picker has no extra header');assert.ok((await page.locator('#v28Search').boundingBox()).y<80);await page.locator('[data-v28-close-picker]').click();
 for(const route of ['following','moments','club-store']){await go(route);await page.evaluate(()=>{document.querySelector('#screen').scrollTop=280});await page.waitForTimeout(500);const collision=await page.evaluate(()=>{const head=document.querySelector('.ljr-scroll-header');if(!head)return false;const back=head.querySelector('.ljr-back-control'),title=head.querySelector('h1,.v561-moments-title');if(!back||!title)return false;const a=back.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(title);const b=range.getBoundingClientRect();return a.x+a.width>b.x&&a.x<b.x+b.width&&a.y+a.height>b.y&&a.y<b.y+b.height});assert.equal(collision,false,route+' compact title clears back arrow')}
 await go('more');const box=await page.locator('#app>.topbar').boundingBox();await page.evaluate(()=>document.querySelector('#screen').scrollTop=400);await page.waitForTimeout(500);assert.deepEqual(await page.locator('#app>.topbar').boundingBox(),box,'More is static');
 await go('quizArena');assert.equal(await page.locator('#ljr-game-back').count(),0);
 await go('fantasyTeam');assert.equal(await visible('#ljr-game-back'),1);assert.equal(await visible('[data-v576-back]'),0);
 assert.equal(await page.locator('.bottom-nav .nav-item').first().textContent().then(s=>s.includes('Inicio')),true);
 assert.equal(await page.locator('#ljr-route-loader span').isVisible(),false);
 // Exercise real CMS UI with a fake server boundary: do not publish test media.
 await go('moments');assert.equal(await page.locator('[data-cms-help]').count(),0,'guest does not receive admin controls');
 await page.evaluate(()=>{
 const previous=window.LJR_MEDIA;window.__saved=[];
 window.LJR_MEDIA={...previous,admin:{id:'test-admin'},api:async(p,o={})=>{
  if(p==='content')return {items:window.__saved};if(p==='media'&&o.method==='POST')return {id:'test-video'};if(p.startsWith('media/'))return {};
  if(p.startsWith('content/')&&o.method==='PUT'){window.__saved=[{id:'test-card',...o.body,published:1}];return {revision:1}}return {items:[]};
 }};
 const slot=document.createElement('article');slot.id='admin-test-slot';slot.style.height='140px';slot.innerHTML='<img src="./app-icon.png" alt="Test slot"><img src="./app-icon.png" alt="Keep second">';document.querySelector('#screen').prepend(slot);window.LJR_CMS.editor('page',null,{route:'moments',selector:'#admin-test-slot img:nth-of-type(1)'});
 });
 await page.locator('[data-cms-file]').last().setInputFiles({name:'sample.mp4',mimeType:'video/mp4',buffer:Buffer.from('test media boundary')});await page.locator('.liga-media-modal form button[type=submit]').last().click();await page.waitForTimeout(400);
 assert.equal(await page.locator('#admin-test-slot video').count(),1,'uploaded video replaces the picture in its exact slot');assert.equal(await page.locator('#admin-test-slot video').evaluate(e=>(e.controls||!!e.closest('.v977-player')?.querySelector('[data-v977-action=play]'))&&e.preload==='none'),true,'video loads on demand');await page.evaluate(()=>window.LJR_CMS.refresh());assert.equal(await page.locator('#admin-test-slot video').count(),1,'refresh does not duplicate video');assert.equal(await page.locator('#admin-test-slot img[alt="Keep second"]').count(),1,'video replacement never touches the adjacent photograph');
 // Paste a video link, then replace it with a photograph, without remounting.
 await page.evaluate(()=>window.LJR_CMS.editor('page',window.LJR_CMS.records[0]));await page.locator('.liga-media-modal [name=mediaType]').last().selectOption('video');await page.locator('.liga-media-modal [name=image]').last().fill('https://media.test/pasted.mp4');await page.locator('.liga-media-modal form button[type=submit]').last().click();await page.waitForTimeout(250);assert.equal(await page.locator('#admin-test-slot video').getAttribute('src'),'https://media.test/pasted.mp4');
 await page.evaluate(()=>window.LJR_CMS.editor('page',window.LJR_CMS.records[0]));await page.locator('.liga-media-modal [name=mediaType]').last().selectOption('image');await page.locator('.liga-media-modal [name=image]').last().fill('https://mobile.test/app-icon.png');await page.locator('.liga-media-modal form button[type=submit]').last().click();await page.waitForTimeout(250);assert.equal(await page.locator('#admin-test-slot video').count(),0,'photo replaces previous video immediately');assert.equal(await page.locator('#admin-test-slot img').count(),2,'adjacent photograph survives both replacements');
 await page.evaluate(()=>window.LJR_CMS.editor('page',null,{route:'moments',selector:'#admin-test-slot',mediaType:'video',image:'https://media.test/container.mp4'}));await page.locator('.liga-media-modal form button[type=submit]').last().click();await page.waitForTimeout(250);assert.equal(await page.locator('#admin-test-slot video').count(),1);
 await page.evaluate(()=>window.LJR_CMS.editor('page',window.LJR_CMS.records[0]));await page.locator('.liga-media-modal [name=mediaType]').last().selectOption('image');await page.locator('.liga-media-modal [name=image]').last().fill('https://mobile.test/app-icon.png');await page.locator('.liga-media-modal form button[type=submit]').last().click();await page.waitForTimeout(250);assert.equal(await page.locator('#admin-test-slot video').count(),0,'container removes previous player when switched to image');assert.equal(await page.locator('#admin-test-slot .v977-player').count(),0,'container removes stale controls');assert.equal(await page.evaluate(()=>window.LJR_CMS.records[0].payload.background),undefined,'file-only edits do not silently paint a white box');
 await page.evaluate(()=>window.LJR_CMS.help());assert.ok(await page.locator('.liga-media-modal').last().textContent().then(t=>t.includes('Performance Zone')&&t.includes('24 horas')&&t.includes('Mis publicaciones')));
 assert.deepEqual(errors,[],'no runtime exceptions');console.log('PASS corrections: original headers, compact spacing, static More, all teams, Fantasy arrow, loader, authorised CMS video and guide');
}finally{await browser.close()}
