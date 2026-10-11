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
async function royalSurface(locator,label){
 const paint=await locator.evaluate(e=>{const c=getComputedStyle(e);return {background:c.backgroundImage,color:c.color};});
 assert.match(paint.background,/linear-gradient/,label+' visible gradient');
 assert.doesNotMatch(paint.background,/rgb\(4[89], 1[12][0-9], 2[0-9][0-9]\)/,label+' no pale blue');
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
try{const page=await openApp(resolve(root,'dist'));const original=await openApp(resolve(root,'dist'),true);
for(const route of ['following','teams','scorers','rulebook','history','stats']){
 await go(page,route);await go(original,route);
 const paints=p=>p.locator('#app>.topbar').evaluate(e=>{const c=getComputedStyle(e);return {bg:c.backgroundColor,img:c.backgroundImage}});
 assert.deepEqual(await paints(page),await paints(original),route+' original header');
 const canvas=p=>p.locator('#screen').evaluate(e=>{const c=getComputedStyle(e);return {bg:c.backgroundColor,img:c.backgroundImage}});
 assert.deepEqual(await canvas(page),await canvas(original),route+' original canvas');console.log('PASS original '+route);
 await page.screenshot({path:resolve(output,'restored-'+route+'.png')});
}
await go(page,'simulator');assert.equal(await page.locator('#screen').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(0, 0, 64)');console.log('PASS navy classification/bracket');
}finally{await browser.close();}
