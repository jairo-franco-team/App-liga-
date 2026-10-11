/* App compilada real, sin conexiones ni escrituras a servicios externos.
   Comprueba los lienzos nuevos y que Perfil conserve su presentación. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..');
const output=resolve(process.env.VISUAL_OUTPUT||resolve(root,'artifacts/v1421-royal-pages'));
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const pages=[];
async function openApp(dist){
 const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 pages.push(page);
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!=='http://royal.test')return route.abort();
  let pathname=url.pathname.replace(/^\/App-liga-\//,'/');
  if(pathname==='/')pathname='/index.html';
  const path=resolve(dist,'.'+pathname);
  try{await route.fulfill({body:readFileSync(path),contentType:({'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'})[extname(path)]||'text/html'});}
  catch{await route.fulfill({status:404,body:'Offline test asset'});}
 });
 await page.goto('http://royal.test/App-liga-/?mode=apk#/home',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.LJR_MAIN_ROUTE?.go);
 return page;
}
async function go(page,route){
 await page.evaluate(r=>window.LJR_MAIN_ROUTE.go(r),route);
 await page.waitForFunction(r=>document.body.dataset.appRoute===r,route);
 await page.waitForTimeout(850); // Modules append the original controls after routing.
}
async function profileStyle(page){
 return page.evaluate(()=>{
  const s=selector=>{const e=document.querySelector(selector);assertElement(e,selector);const c=getComputedStyle(e);return {background:c.backgroundImage,color:c.color,border:c.border,width:e.getBoundingClientRect().width};};
  function assertElement(e,selector){if(!e)throw Error('Missing original Profile '+selector);}
  return {screen:s('#screen'),card:s('.v12-profile-card'),menu:s('.v12-profile-menu')};
 });
}
try{
 const page=await openApp(resolve(root,'dist'));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const routes=['accountLogin','accountRegister','recruitment','credentialBuilder','agendaBuilder','appInstall','notifications','publications','publicationCenter','historyLog','leagueTools','tableExport','bracketBuilder','weatherFields','following','scorers','history','stats','matchCenter','teams','home','competition','more','profile'];
 const artwork=new Set(['teams','home','competition','more','profile']);
 for(const route of routes){
  await go(page,route);
  const paint=await page.locator('#screen').evaluate(e=>({background:getComputedStyle(e).backgroundImage,color:getComputedStyle(e).backgroundColor}));
  if(route.startsWith('account')){
   assert.match(paint.background,/rgb\(5, 7, 94\)/,route+' restored account night blue');
  }else if(!artwork.has(route)){
   assert.equal(paint.color,'rgb(4, 17, 63)',route+' deep blue base');
   assert.match(paint.background,/rgb\(23, 59, 179\)/,route+' deep blue');
   assert.doesNotMatch(paint.background,/data:image\/svg\+xml/,route+' clean dark canvas');
  }
  if(route==='recruitment'){
   const picker=page.locator('.v190-community-select .ljr-picker-open');
   assert.equal(await picker.isVisible(),true,'Community picker remains visible');
   await picker.click();
   await page.locator('.liga-media-modal [data-ljr-choice]').nth(1).click();
   assert.ok(await page.locator('select[data-v190-team-community]').inputValue(),'Original community selection works');
  }
  await page.screenshot({path:resolve(output,route+'.png')});
 }
 const profilePage=await openApp(resolve(root,'dist'));
 await go(profilePage,'profile');
 const profile=await profileStyle(profilePage);
 assert.match(profile.screen.background,/rgb\(7, 9, 103\)/,'Existing Profile color preserved');
 assert.match(profile.card.background,/rgb\(11, 18, 109\)/,'Existing account card preserved');
 assert.equal(profile.menu.background,'none','Existing transparent menu preserved');
 if(process.env.REFERENCE_BASELINE_DIST){
  const baseline=await openApp(resolve(process.env.REFERENCE_BASELINE_DIST));
  await go(baseline,'profile');
  assert.deepEqual(profile,await profileStyle(baseline),'Profile matches the app before this correction');
 }
 await go(page,'accountLogin');
 await page.locator('[data-v569-route="accountRegister"]').click();
 await page.waitForFunction(()=>document.body.dataset.appRoute==='accountRegister');
 await page.locator('[data-v569-page="register"]').waitFor({state:'visible'});
 assert.ok(await page.locator('[data-v569-page="register"]').count(),'Original account navigation works');
 assert.deepEqual(errors,[],'No application runtime errors');
 console.log('PASS: 24 real mobile pages, deep blue canvases, Teams header, Profile preserved, community picker and account navigation.');
}finally{await browser.close();}
