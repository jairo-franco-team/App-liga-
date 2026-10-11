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
async function transparent(locator,label){
 const paints=await locator.evaluateAll(elements=>elements.map(e=>{const c=getComputedStyle(e);return {bg:c.backgroundColor,image:c.backgroundImage,border:c.borderTopWidth,radius:c.borderRadius}}));
 assert.ok(paints.length,label+' exists');
 for(const p of paints){assert.equal(p.bg,'rgba(0, 0, 0, 0)',label+' transparent');assert.equal(p.image,'none',label+' no extra gradient');}
}
try{
 for(const width of [360,412]){
  const page=await openApp(resolve(root,'dist'));await page.setViewportSize({width,height:915});await fixtureAccount(page);
  await go(page,'players');await page.locator('[data-v562-cat]').selectOption('4');
  const team=page.locator('[data-v562-team]');const tavera=await team.locator('option').evaluateAll(options=>options.find(o=>o.textContent.includes('TAVERA'))?.value);
  assert.ok(tavera,'Official Tavera team available');await team.selectOption(tavera);await page.waitForTimeout(200);
  await transparent(page.locator('.v562-search input'),'search inner input');
  assert.equal(await page.locator('.v562-search input').evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
  await transparent(page.locator('.v562-player'),'player rows');await transparent(page.locator('.v562-team-head'),'team header');
  await page.locator('[data-v562-search]').fill('Carlos');assert.match(await page.locator('.v562-player').first().innerText(),/Carlos/i);
  await page.locator('[data-v562-search]').fill('');await page.screenshot({path:resolve(output,'players-'+width+'.png')});
  await go(page,'matchday');await transparent(page.locator('.md1132-team'),'team and crest actions');
  await transparent(page.locator('.v60-tool-page,.v164-matchday-center'),'matchday structural wrappers');
  await transparent(page.locator('.md1132-crest'),'crest frames');
  await page.screenshot({path:resolve(output,'matchday-'+width+'.png')});
  await page.locator('.v164-matchday-center').screenshot({path:resolve(output,'match-center-'+width+'.png')});
  await page.evaluate(()=>window.LJR_DESIGN_STUDIO.open('Comunicado'));const studio=page.locator('.liga-media-modal>section.ljr-content-studio');await studio.waitFor({state:'visible'});
  await transparent(studio.locator('details>summary'),'studio accordion headings');
  const details=studio.locator('.cms-extra-design').first();await details.locator('summary').click();assert.ok(await details.getAttribute('open')!==null,'Participants accordion opens');
  await details.locator('[name=participants]').fill('TAVERA FC');assert.equal(await details.locator('[name=participants]').inputValue(),'TAVERA FC');
  await details.screenshot({path:resolve(output,'participants-'+width+'.png')});
  await studio.locator('[name=title]').fill('Título de prueba visual');assert.equal(await studio.locator('[name=title]').inputValue(),'Título de prueba visual');
  await studio.screenshot({path:resolve(output,'studio-'+width+'.png')});
  const overflow=await studio.evaluate(root=>[...root.querySelectorAll('input,select,textarea,button,summary')].filter(e=>{const r=e.getBoundingClientRect();return r.height&&getComputedStyle(e).visibility!=='hidden'&&(r.left<root.getBoundingClientRect().left-1||r.right>root.getBoundingClientRect().right+1)}).map(e=>e.outerHTML.slice(0,100)));
  assert.deepEqual(overflow,[],'Controls stay inside the studio');
  await studio.locator('[data-close]').click();assert.equal(await studio.count(),0,'Native close works');
  await page.evaluate(()=>window.LJR_V105_OPEN_TOOL('delegates'));const delegates=page.locator('.v105-dialog').last();await delegates.waitFor({state:'visible'});
  await transparent(delegates.locator('.v1126-extra>summary'),'Delegate accordion headings');
  await delegates.locator('.v1126-extra>summary').first().click();assert.ok(await delegates.locator('.v1126-extra').first().getAttribute('open')!==null);
  console.log('PASS '+width+'px: single search border, transparent player rows and crest controls, matchday wrapper, editable studio, accordions and native close.');
  await page.close();
 }
}finally{await browser.close();}
