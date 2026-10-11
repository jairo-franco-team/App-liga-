/* App compilada real, sin conexiones ni escrituras a servicios externos.
   Comprueba los lienzos nuevos y que Perfil conserve su presentación. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'artifacts/v1440');
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const pages=[];
async function openApp(dist,original=false){
 const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 pages.push(page);
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!=='http://royal.test')return route.abort();
  if(original&&url.pathname.includes('v1420-reference-blue-surfaces'))return route.fulfill({body:'',contentType:'text/css'});
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
async function transparent(locator,label){
 const paints=await locator.evaluateAll(elements=>elements.map(e=>{const c=getComputedStyle(e);return {bg:c.backgroundColor,image:c.backgroundImage,border:c.borderTopWidth,radius:c.borderRadius}}));
 assert.ok(paints.length,label+' exists');
 for(const p of paints){assert.equal(p.bg,'rgba(0, 0, 0, 0)',label+' transparent');assert.equal(p.image,'none',label+' no extra gradient');}
}

// A gradient on a control or a nested painted label must fail (Botones ZIP).
async function solid(locator,label){
 const paints=await locator.evaluateAll(es=>es.map(e=>{const c=getComputedStyle(e);return {image:c.backgroundImage,color:c.backgroundColor}}));
 assert.ok(paints.length,label+' exists');
 for(const p of paints){assert.equal(p.image,'none',label+' must use solid fill, no gradient');assert.notEqual(p.color,'rgba(0, 0, 0, 0)',label+' has one solid surface');}
}
async function canvas(locator,label){
 const paints=await locator.evaluateAll(es=>es.map(e=>{const c=getComputedStyle(e);return {image:c.backgroundImage,size:c.backgroundSize,color:c.backgroundColor}}));
 assert.ok(paints.length,label+' exists');
 for(const p of paints){assert.ok(p.image.includes('linear-gradient'),label+' gradient belongs on canvas');assert.equal(p.color,'rgb(0, 0, 64)',label+' dark-blue canvas');}
}
try{
 const page=await openApp(resolve(root,'dist'));await fixtureAccount(page);
 await go(page,'ligaControl');
 const jrInfo=page.locator('.v562-panel:has(.v562-sync-grid)').first();await jrInfo.waitFor();
 assert.match(await jrInfo.evaluate(e=>getComputedStyle(e).backgroundImage),/fantasy-card/,'Large JR information card uses original Fantasy design');
 await transparent(page.locator('.v562-sync-grid>article'),'Summary children share the large card');
 await page.screenshot({path:resolve(output,'jr-control-412.png')});
 await go(page,'leagueTools');
 assert.match(await page.locator('.v726-tools-hero').evaluate(e=>getComputedStyle(e).backgroundImage),/fantasy-frame/,'Tools intro uses the supplied transparent PNG');
 await solid(page.locator('.v726-tool-card'),'Tool buttons');
 await page.screenshot({path:resolve(output,'tools-412.png')});
 const themes=[];
 for(const tool of ['delegates','calendar-generator','meeting','incidents']){
  await page.evaluate(()=>document.querySelectorAll('body > .v105-modal').forEach(e=>e.remove()));
  await page.evaluate(t=>window.LJR_V105_OPEN_TOOL(t),tool);
  const dialog=page.locator('body>.v105-modal>.v105-dialog');await dialog.waitFor();await page.waitForTimeout(700);
  themes.push(await dialog.evaluate(e=>getComputedStyle(e).backgroundImage));
  await canvas(dialog,tool+' canvas');
  await solid(dialog.locator('select').first(),tool+' native selector');
  await dialog.screenshot({path:resolve(output,tool+'-412.png')});
  await dialog.locator('.v105-close,[data-close]').first().click();assert.equal(await dialog.count(),0,tool+' original close');
 }
 assert.equal(new Set(themes).size,4,'Four captured tools use different original Drive backgrounds');
 await go(page,'matchday');await page.evaluate(()=>window.LJR_DESIGN_STUDIO.open('Comunicado'));
 const studio=page.locator('.ljr-content-studio');await studio.waitFor();await page.waitForTimeout(700);
 assert.match(await studio.evaluate(e=>getComputedStyle(e).backgroundImage),/publication-lines/,'Publication keeps its own pattern even when it is also an editor dialog');
 assert.match(await studio.locator(':scope>.ljr-simple-intro').evaluate(e=>getComputedStyle(e).backgroundImage),/fantasy-card/,'Large publication guide uses the original Fantasy card');
 assert.equal(await studio.locator('.ljr-simple-intro svg[data-ljr-icon]').count(),1,'Publication guide uses an original Miapp vector');
 await studio.locator('.ljr-admin-howto>summary').click();
 const art=studio.locator('.cms-design-intro');
 assert.match(await art.evaluate(e=>getComputedStyle(e,'::after').backgroundImage),/league-trophy/,'Publication help includes the provided PNG artwork');
 await solid(studio.locator('[name=type]'),'Publication selector');
 await studio.locator('[name=title]').fill('Prueba visual sin publicar');
 assert.equal(await studio.locator('[name=title]').inputValue(),'Prueba visual sin publicar');
 await studio.evaluate(e=>{e.scrollTop=0;});
 await studio.screenshot({path:resolve(output,'publication-412.png')});
 await studio.locator('.ljr-admin-howto').screenshot({path:resolve(output,'publication-art-412.png')});
 await studio.locator('[data-close]').click();assert.equal(await studio.count(),0);
 console.log('PASS: original Drive backgrounds vary by captured section, PNG large-card designs, flat native controls, unchanged close/input functions');
}finally{await browser.close();}
