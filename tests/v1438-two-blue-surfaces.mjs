/* App compilada real, sin conexiones ni escrituras a servicios externos.
   Comprueba los lienzos nuevos y que Perfil conserve su presentación. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'artifacts/v1438');
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

// Returning a lighter palette, a third stop, or painting a nested label must fail.
async function twoColors(locator,label){
 const images=await locator.evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundImage));
 assert.ok(images.length,label+' exists');
 for(const img of images)assert.equal(img,'linear-gradient(rgb(1, 7, 155) 0%, rgb(0, 0, 64) 100%)',label+' uses only the two sample colors from top to bottom');
}
try{
 for(const width of [360,412]){
 const page=await openApp(resolve(root,'dist'));await page.setViewportSize({width,height:915});await fixtureAccount(page);
 await go(page,'ligaControl');await twoColors(page.locator('button.v562-card'),'JR cards');
 await transparent(page.locator('.v562-card-copy,.v562-card .v562-icon'),'JR card contents');
 await transparent(page.locator('.v562-panel:has(.v562-sync-grid)'),'Summary structural wrapper');
 await twoColors(page.locator('.ljr-cms-entry>button'),'CMS quick actions');
 assert.equal(await page.locator('.ljr-cms-quick-icon svg[data-ljr-icon]').count(),4,'All four CMS actions use Drive vectors');
 await transparent(page.locator('.ljr-cms-entry'),'CMS structural wrapper');
 await page.screenshot({path:resolve(output,'jr-control-'+width+'.png')});
 await go(page,'leagueTools');await twoColors(page.locator('.v726-tool-card'),'Tools cards');
 await transparent(page.locator('.v734-tool-top,.v734-tool-head,.v734-tool-details'),'Tools card interiors');
 assert.ok(await page.locator('.v726-tool-icon svg[data-ljr-icon]').count()>8,'Tools use distinct original Drive vectors');
 await page.locator('[data-v734-tool-details]').first().click();assert.ok(await page.locator('.v734-tool-detail-panel:not([hidden])').count(),'Tool details still open');
 await page.screenshot({path:resolve(output,'tools-'+width+'.png')});
 await go(page,'matchday');await page.evaluate(()=>window.LJR_DESIGN_STUDIO.open('Comunicado'));
 const studio=page.locator('.liga-media-modal>section.ljr-content-studio');await studio.waitFor({state:'visible'});
 await twoColors(studio,'Publication editor');await twoColors(studio.locator('input:not([type=color]):not([type=checkbox]):not([type=radio]),textarea').first(),'Editor field');
 await transparent(studio.locator('details>summary'),'Accordion labels');
 await studio.locator('details').first().locator('summary').click();
 await studio.locator('[name=title]').fill('Prueba de dos colores');assert.equal(await studio.locator('[name=title]').inputValue(),'Prueba de dos colores');
 await studio.screenshot({path:resolve(output,'publication-'+width+'.png')});
 await studio.locator('[data-close]').click();assert.equal(await studio.count(),0);
 await page.evaluate(()=>window.LJR_V105_OPEN_TOOL('delegates'));const delegates=page.locator('.v105-dialog').last();await delegates.waitFor({state:'visible'});await twoColors(delegates,'Delegate tool');await transparent(delegates.locator('details>summary'),'Delegate labels');
 await page.evaluate(()=>document.querySelectorAll('body>.v105-modal').forEach(e=>e.remove()));
 await page.evaluate(()=>window.LJR_V105_OPEN_TOOL('sponsors'));const search=page.locator('.sp-search input');await search.waitFor();
 await transparent(search,'Sponsor inner search');await search.fill('Prueba');assert.equal(await search.inputValue(),'Prueba');await page.close();
 console.log('PASS '+width+'px two colors, native inputs/details/close, single inner surfaces and Drive icons');
 }
}finally{await browser.close();}
