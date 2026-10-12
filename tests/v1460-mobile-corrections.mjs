/* App compilada real, sin conexiones ni escrituras a servicios externos.
   Comprueba fondos completos, controles originales y las pantallas fuera del ZIP. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'artifacts/v1460');
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const pages=[];
async function openApp(dist,original=false){
 const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 pages.push(page);
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!=='http://royal.test')return route.abort();
  if(original&&url.pathname.includes('v1441-captured-design.js'))return route.fulfill({body:'',contentType:'application/javascript'});
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
try{
 const page=await openApp(resolve(root,'dist'));await fixtureAccount(page);
 for(const width of [360,412]){
  await page.setViewportSize({width,height:915});
  for(const route of ['accountEdit','accountPreferences','accountPrivacy','profile','suspensionTool','scheduleChanges','news','search']){
   await go(page,route);await page.waitForTimeout(220);
   assert.equal(await page.locator('.ljr-uefa-side').count(),0,'PC sidebar absent from mobile '+route);
   const wrappers=await page.locator('[data-design-surface="clear"]:visible').evaluateAll(es=>es.filter(e=>!e.closest('[data-design-paper]')).map(e=>({c:e.className,bg:getComputedStyle(e).backgroundColor,image:getComputedStyle(e).backgroundImage,border:getComputedStyle(e).borderTopWidth})));
   assert.ok(wrappers.length>0,'Captured structural wrappers found '+route);
   for(const w of wrappers){assert.equal(w.bg,'rgba(0, 0, 0, 0)',route+' wrapper '+w.c);assert.equal(w.image,'none',route+' wrapper artwork must belong to canvas');assert.equal(w.border,'0px',route+' no nested wrapper frame');}
   const labels=await page.locator('label:has(>select):visible').evaluateAll(es=>es.filter(e=>!e.closest('[data-design-paper]')).map(e=>{const control=e.querySelector('select').getBoundingClientRect();const caption=e.querySelector(':scope>b,:scope>span');return caption?control.top-caption.getBoundingClientRect().bottom:10;}));
   assert.ok(labels.every(g=>g>=3),route+' labels cannot overlap selectors');
   await page.screenshot({path:resolve(output,route+'-'+width+'.png')});
  }
 }
 await go(page,'profile');
 const rowPaint=await page.locator('.v12-profile-row:visible,.v569-profile-menu-row:visible,.v1300-menu-row:visible').evaluateAll(es=>es.map(e=>({bg:getComputedStyle(e).backgroundColor,radius:getComputedStyle(e).borderRadius})));
 assert.ok(rowPaint.length>0&&rowPaint.every(p=>p.bg==='rgba(0, 0, 0, 0)'&&p.radius==='0px'),'Profile links share separators without painted nested frames: '+JSON.stringify(rowPaint));
 await page.evaluate(()=>window.LJR_PROFILE.open());await page.waitForTimeout(800);
 const avatar=page.locator('[aria-label="Mi avatar y mi camiseta"]');
 assert.ok(await avatar.locator('.ljr-gamer-avatar').count()>0);
 assert.ok((await avatar.locator('.ljr-gamer-avatar').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundImage))).every(x=>x.includes('url(')),'Animal avatar sprite artwork survives text styling');
 assert.match(await avatar.locator('[data-avatar-preview]').evaluate(e=>getComputedStyle(e).backgroundImage),/conic-gradient/,'Avatar preview has a single rainbow circle');
 const avatarGeometry=await avatar.evaluate(e=>{
  const form=e.querySelector('.ljr-profile-form'),label=form.querySelector('.ljr-photo-upload'),input=label.querySelector('input'),caption=form.querySelector(':scope>p'),gallery=form.querySelector('.ljr-avatar-gallery');
  const rect=n=>{const r=n.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}};
  const initial=e.querySelector('[data-avatar-preview]>.ljr-profile-initial');
  let centered=true;if(initial){const range=document.createRange();range.selectNodeContents(initial);const text=range.getBoundingClientRect(),box=initial.getBoundingClientRect();centered=Math.abs((text.left+text.right-box.left-box.right)/2)<5&&Math.abs((text.top+text.bottom-box.top-box.bottom)/2)<12;}
  return {label:rect(label),input:rect(input),caption:rect(caption),gallery:rect(gallery),centered};
 });
 assert.ok(avatarGeometry.input.bottom<=avatarGeometry.label.bottom+1,'Photo input stays inside its own field');
 assert.ok(avatarGeometry.caption.top>=avatarGeometry.label.bottom+12&&avatarGeometry.gallery.top>=avatarGeometry.caption.bottom+12,'Photo field, avatar heading and gallery do not overlap: '+JSON.stringify(avatarGeometry));
 assert.ok(avatarGeometry.centered,'Profile initial is visually centered in its rainbow circle');
 await page.screenshot({path:resolve(output,'avatar-dialog.png')});await page.locator('.liga-media-modal [data-close]').last().click();
 await go(page,'v38Weekly');
 const scroll=page.locator('.v553-week-scroll').first();
 await scroll.evaluate(e=>e.scrollLeft=e.scrollWidth);
 const right=await scroll.evaluate(e=>({remaining:e.scrollWidth-e.clientWidth-e.scrollLeft,padding:getComputedStyle(e.querySelector('td:last-child')).paddingRight}));
 assert.ok(right.remaining<=2,'Last weekly match column can be fully reached');assert.ok(parseFloat(right.padding)>=12,'Jornada column keeps room at the right edge');
 await scroll.scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,'weekly-last-column.png')});
 await go(page,'search');await page.waitForTimeout(400);
 const rows=page.locator('.v414-player-row');assert.equal(await rows.count(),6,'Only six actual player rows are constructed');
 const more=page.locator('[data-ljr-list-more="search-official"]');
 assert.equal(await more.count(),1,'Real player list has Ver más');await more.click();assert.equal(await rows.count(),12,'Ver más adds six actual rows');
 await page.evaluate(()=>{const s=document.querySelector('#screen');s.scrollTop=320;window.scrollTo(0,320);});await page.waitForTimeout(100);
 const offset=await page.evaluate(()=>({screen:document.querySelector('#screen').scrollTop,window:window.scrollY}));
 assert.ok(offset.screen+offset.window>0,'Search scroll is set on the real route');
 await go(page,'leagueTools');await page.evaluate(()=>window.LJR_NAVIGATION.back());
 await page.waitForFunction(()=>document.body.dataset.appRoute==='search');await page.waitForTimeout(1300);
 assert.equal(await rows.count(),12,'Back retains expanded six-row pages');
 const returned=await page.evaluate(()=>({screen:document.querySelector('#screen').scrollTop,window:window.scrollY}));
 assert.ok(Math.abs(returned.screen-offset.screen)<=2&&Math.abs(returned.window-offset.window)<=2,'Back restores exact previous scroll');
 await go(page,'notifications');
 await page.locator('#v105-bottom[data-v105-route="notifications"] .v105-card[data-v105-route="notifications"]').click();
 assert.ok(await page.evaluate(()=>document.querySelector('.v46-ref-notifications-main').contains(document.activeElement)),'Preferencias actuales focuses a real notification control');
 console.log('V1460: 8 captured sections at 360/412px; transparent wrapper backgrounds, PC isolation, native selector geometry, animal sprites, independent weekly table, 6/12 real search rows and exact back scroll verified.');
}finally{await browser.close();}
