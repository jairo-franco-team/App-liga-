/* App compilada real, sin conexiones ni escrituras a servicios externos.
   Comprueba los lienzos nuevos y que Perfil conserve su presentación. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'artifacts/v1439');
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
 for(const width of [360,412]){
 const page=await openApp(resolve(root,'dist'));await page.setViewportSize({width,height:915});await fixtureAccount(page);
 await go(page,'ligaControl');await solid(page.locator('button.v562-card'),'JR cards');
 await transparent(page.locator('.v562-hero,.v562-card-copy,.v562-card .v562-icon'),'JR card contents');
 await transparent(page.locator('.v562-panel:has(.v562-sync-grid)'),'Summary structural wrapper');
 await solid(page.locator('.ljr-cms-entry>button'),'CMS quick actions');
 assert.ok(await page.locator('.v562-card .v562-icon svg[data-ljr-icon]').count()>15,'JR cards use original Drive vectors');
 assert.equal(await page.locator('.ljr-cms-quick-icon svg[data-ljr-icon]').count(),4,'All four CMS actions use Drive vectors');
 await transparent(page.locator('.ljr-cms-entry'),'CMS structural wrapper');
 await canvas(page.locator('#screen'),'JR background');
 const fade=await page.locator('#screen').evaluate(e=>getComputedStyle(e).backgroundSize.split(',').at(-1).trim().split(' ').at(-1));
 assert.ok(parseFloat(fade)<=620,'JR fade ends within one viewport rather than stretching down a long page');
 const edge=await page.locator('[data-cms-story]').evaluate(e=>getComputedStyle(e,'::after').maskComposite);
 assert.ok(edge.split(',').every(x=>x.trim()==='exclude'),'Featured chromatic accent is only a thin masked border');
 const styles=await page.locator('.ljr-cms-entry>button').evaluateAll(es=>es.map(e=>{const c=getComputedStyle(e);return c.backgroundColor+' '+c.borderColor}));assert.ok(new Set(styles).size>=3,'CMS actions offer solid primary/secondary/outline variation');
 await page.screenshot({path:resolve(output,'jr-control-'+width+'.png')});
 await go(page,'leagueTools');await solid(page.locator('.v726-tool-card'),'Tools cards');
 await transparent(page.locator('.v734-tool-top,.v734-tool-head,.v734-tool-details'),'Tools card interiors');
 assert.ok(await page.locator('.v726-tool-icon svg[data-ljr-icon]').count()>8,'Tools use distinct original Drive vectors');
 await page.locator('[data-v734-tool-details]').first().click();assert.ok(await page.locator('.v734-tool-detail-panel:not([hidden])').count(),'Tool details still open');
 await solid(page.locator('.v734-tool-go'),'Open tool action');
 assert.equal(await page.locator('.v734-tool-go').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(0, 219, 234)','Open action uses the ZIP flat cyan primary');
 assert.ok(await page.locator('.v734-tool-go').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=12,'Action labels are readable');
 await page.screenshot({path:resolve(output,'tools-'+width+'.png')});
 await go(page,'matchday');await page.evaluate(()=>window.LJR_DESIGN_STUDIO.open('Comunicado'));
 const studio=page.locator('.liga-media-modal>section.ljr-content-studio');await studio.waitFor({state:'visible'});
 await canvas(studio,'Publication editor');await solid(studio.locator('input:not([type=color]):not([type=checkbox]):not([type=radio]),textarea').first(),'Editor field');
 await transparent(studio.locator('details>summary'),'Accordion labels');
 await studio.locator('details').first().locator('summary').click();
 await studio.locator('[name=title]').fill('Prueba de dos colores');assert.equal(await studio.locator('[name=title]').inputValue(),'Prueba de dos colores');
 await studio.screenshot({path:resolve(output,'publication-'+width+'.png')});
 await studio.locator('[data-close]').click();assert.equal(await studio.count(),0);
 await page.evaluate(()=>window.LJR_V105_OPEN_TOOL('delegates'));const delegates=page.locator('.v105-dialog').last();await delegates.waitFor({state:'visible'});await canvas(delegates,'Delegate tool');await transparent(delegates.locator('details>summary'),'Delegate labels');
 await page.evaluate(()=>document.querySelectorAll('body>.v105-modal').forEach(e=>e.remove()));
 await page.evaluate(()=>window.LJR_V105_OPEN_TOOL('sponsors'));const search=page.locator('.sp-search input');await search.waitFor();
 await transparent(search,'Sponsor inner search');await search.fill('Prueba');assert.equal(await search.inputValue(),'Prueba');await page.close();
 console.log('PASS '+width+'px solid controls and varied blue canvases, native inputs/details/close, single inner surfaces and Drive icons');
 }
}finally{await browser.close();}
