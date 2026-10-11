/* App compilada real, sin conexiones ni escrituras a servicios externos.
   Comprueba los lienzos nuevos y que Perfil conserve su presentación. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..');
const output=resolve(process.env.VISUAL_OUTPUT||resolve(root,'artifacts/v1422-complete-sections'));
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
// Cuenta ficticia sólo en la página aislada. Todas las peticiones externas se bloquean.
async function fixtureAccount(page){
 await page.evaluate(()=>{
  const a={id:'visual-test',name:'Prueba visual',alias:'prueba',email:'test@example.invalid',devices:[]};
  localStorage.setItem('ljr-auth-v569',JSON.stringify({version:1,currentId:a.id,accounts:[a]}));
  localStorage.setItem('lj-store-v3',JSON.stringify({user:a}));
  Object.defineProperty(window.LJR_MEDIA,'admin',{configurable:true,get:()=>({id:'visual-admin',name:'Prueba',owner:true})});
  window.LJR_MEDIA.api=async(path,options={})=>{
   if(options.method&&options.method!=='GET')throw Error('External writes prohibited by visual test');
   return {admin:{id:'visual-admin',name:'Prueba',owner:true},users:[],content:[],items:[],notices:[],pages:[]};
  };
 });
}
async function royalSurface(locator,label){
 const paint=await locator.evaluate(e=>{const c=getComputedStyle(e);return {background:c.backgroundImage,color:c.color};});
 assert.match(paint.background,/linear-gradient/,label+' visible gradient');
 assert.doesNotMatch(paint.background,/rgb\(4[89], 1[12][0-9], 2[0-9][0-9]\)/,label+' no pale blue');
}
const paleFailures=[];
async function noPaleBlocks(page,selector,label){
 const pale=await page.locator(selector).evaluateAll(roots=>roots.flatMap(root=>[root,...root.querySelectorAll('*')]).filter(e=>{
  const r=e.getBoundingClientRect();// El logotipo de Facebook conserva su azul de marca; no es una superficie de la app.
  if(!r.height||r.width*r.height<1500||['IMG','CANVAS','svg'].includes(e.tagName)||e.closest('.v74-fb-icon'))return false;
  // Los botones primarios de Cuenta recuperan su cyan original; no son paneles azul claro.
  if(document.body.dataset.appRoute?.startsWith('account')&&e.matches('.v569-primary'))return false;
  const c=getComputedStyle(e),colors=[...(c.backgroundImage+' '+c.backgroundColor).matchAll(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?/g)];
  return colors.some(x=>(x[4]===undefined||+x[4]>.6)&&+x[1]<120&&+x[2]>80&&+x[2]<190&&+x[3]>175);
 }).map(e=>String(e.className)));
 if(pale.length)paleFailures.push({label,classes:pale});
}
try{
 const page=await openApp(resolve(root,'dist'));const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await fixtureAccount(page);
 for(const route of ['players','historyLog','accountEdit','accountPrivacy','accountSecurity','accountDevices','accountPreferences','accountAdvisor','accountCloud','notifications','publications','leagueTools','matchday']){
  await go(page,route);
  const rootPaint=await page.locator('#screen').evaluate(e=>getComputedStyle(e).backgroundImage);
  assert.match(rootPaint,route.startsWith('account')?/rgb\(7, 9, 103\).*rgb\(2, 4, 79\)/:/rgb\(23, 59, 179\).*rgb\(4, 17, 63\)/,route+' requested canvas');
  if(route==='historyLog'){
   await page.locator('.v164-history-match').first().waitFor();
   const cards=page.locator('.v164-history-match');
   await royalSurface(cards.first(),'Partidos anteriores first card');
   await royalSurface(cards.last(),'Partidos anteriores last card');
   const crests=await page.locator('.v164-history-match').evaluateAll(cards=>cards.map(card=>{
    const cat=card.querySelector('.v164-history-meta>span').textContent;
    return [...card.querySelectorAll('.v164-history-team')].map(team=>({
     expected:window.LJR_TEAMS_CURRENT_LOGO.get(team.querySelector('em').textContent,cat)||window.LJR_SEASON_LOGOS.get(team.querySelector('em').textContent),
     actual:team.querySelector('img')?.src,
     matte:getComputedStyle(team.querySelector('.v164-history-logo')).backgroundColor
    }));
   }).flat());
   assert.ok(crests.length>0);
   for(const crest of crests){if(crest.expected)assert.equal(crest.actual,crest.expected);assert.equal(crest.matte,'rgba(0, 0, 0, 0)');}
   await cards.first().locator('summary').click();
   assert.equal(await cards.first().locator('details').getAttribute('open'),'','Original match details open');
   await page.screenshot({path:resolve(output,'historyLog-results.png'),fullPage:true});
  }
  await noPaleBlocks(page,'#screen',route);
  await page.screenshot({path:resolve(output,route+'.png')});
 }
 await go(page,'more');
 for(const tool of ['sponsors','calendar-generator','incidents','motm','csv-import','delegates','officials','audit','meeting','schedule-match']){
  await page.evaluate(()=>document.querySelectorAll('body > .liga-media-modal,body > .v105-modal').forEach(e=>e.remove()));
  await page.evaluate(t=>window.LJR_V105_OPEN_TOOL(t),tool);
  const surface=page.locator('body > .v105-modal > .v105-dialog');
  await surface.waitFor({state:'visible'});await page.waitForTimeout(700);
  await royalSurface(surface,tool+' complete dialog');
  if(tool==='sponsors'){
   await royalSurface(surface.locator('.sp-metric').first(),'Sponsors counters');
   await surface.locator('[data-sp-tab="register"]').click();
   assert.equal(await surface.locator('[data-sp-page="register"]').isVisible(),true);
   assert.equal(await surface.locator('[data-sp-page="overview"]').isVisible(),false);
   await surface.locator('[data-sp-field="brand"]').fill('Prueba sin guardar');
   assert.equal(await surface.locator('[data-sp-field="brand"]').inputValue(),'Prueba sin guardar');
  }
  if(tool==='calendar-generator')await royalSurface(surface.locator('.v1240-local'),'Calendar assistant');
  if(tool==='incidents')await royalSurface(surface.locator('.v1111-form'),'Incident form');
  if(tool==='meeting')await royalSurface(surface.locator('.v919-meeting-hero'),'Meeting banner');
  await noPaleBlocks(page,'body > .v105-modal',tool);
  await page.screenshot({path:resolve(output,tool+'.png')});
 }
 await page.evaluate(()=>document.querySelectorAll('body > .liga-media-modal,body > .v105-modal').forEach(e=>e.remove()));
 for(const method of ['openNotice','openReview','openPages']){
  await page.evaluate(m=>window.LJR_EDITOR_CENTER[m](),method);
  const surface=page.locator('body > .liga-media-modal > section').last();
  await surface.waitFor({state:'visible'});await page.waitForTimeout(700);
  await royalSurface(surface,method+' complete editor');
  if(method==='openNotice')await royalSurface(surface.locator('.ljr-notice-fixture-label'),'Notice fixture selector');
  await noPaleBlocks(page,'body > .liga-media-modal',method);
  await page.screenshot({path:resolve(output,method+'.png')});
  await page.evaluate(()=>document.querySelectorAll('body > .liga-media-modal').forEach(e=>e.remove()));
 }
 // Desktop and mobile share this layer; verify the entire list rather than one crop.
 await page.setViewportSize({width:1366,height:900});await go(page,'historyLog');
 await royalSurface(page.locator('.v164-history-match').last(),'Desktop last historical match');
 await page.screenshot({path:resolve(output,'historyLog-desktop.png')});
 assert.deepEqual(paleFailures,[],'No pale inner panels, including below the fold');
 assert.deepEqual(errors,[],'No app runtime errors');
 console.log('PASS: 13 complete pages, 10 real tools, 3 editors, transparent historical crests, native forms, sponsor tabs and match details.');
}finally{await browser.close();}
