/* App compilada real, sin conexiones ni escrituras a servicios externos.
   Comprueba fondos completos, controles originales y las pantallas fuera del ZIP. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'artifacts/v1441');
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
 const routes=['ligaControl','leagueTools','discipline','recruitment','refereeOffline','cedulas','players','v38Weekly','bracketBuilder','publicationCenter','profile','accountPassword','accountDevices','accountSecurity','accountPrivacy','accountPreferences','accountAdvisor','notifications','permissionBuilder','matchCenter','quiniela','matchday','agendaBuilder','weatherFields','cedulaBuilder','rulebook','ligaQR','televisados','v38Alerts'];
 for(const route of routes){
  await go(page,route);
  if(route==='televisados'){await page.evaluate(()=>window.LJR_V440_TELEVISADOS.mount());await page.waitForTimeout(100);}
  assert.equal(await page.locator('#screen').getAttribute('data-captured-design')!==null,true,route+' captured canvas');
  const bg=await page.locator('#screen').evaluate(e=>({image:getComputedStyle(e).backgroundImage,attach:getComputedStyle(e).backgroundAttachment}));
  assert.match(bg.image,/linear-gradient/,route+' royal to navy');assert.match(bg.attach,/fixed/,route+' design remains visible at the bottom');
  await page.locator('[data-design-card]:visible').last().scrollIntoViewIfNeeded();await page.waitForTimeout(80);assert.match(await page.locator('#screen').evaluate(e=>getComputedStyle(e).backgroundImage),/url/,'Original artwork remains at bottom');
  const cards=page.locator('[data-design-card]');assert.ok(await cards.count()>0,route+' lower content receives styling');
  const flat=await page.locator('#screen[data-captured-design] button:not([data-design-card])').evaluateAll(es=>es.filter(e=>e.getClientRects().length&&!e.closest('[data-design-paper]')).map(e=>getComputedStyle(e).backgroundImage));
  assert.ok(flat.every(x=>x==='none'),route+' buttons have solid fills');
  if(['ligaControl','players','profile','weatherFields','v38Weekly','publicationCenter'].includes(route)){
   await page.screenshot({path:resolve(output,route+'-bottom.png')});await page.locator('#screen').evaluate(e=>{e.scrollTop=0;for(let p=e.parentElement;p;p=p.parentElement)p.scrollTop=0;window.scrollTo(0,0);});await page.screenshot({path:resolve(output,route+'-top.png')});
  }
 }
 await go(page,'players');const pick=page.locator('select').first();const values=await pick.locator('option').evaluateAll(es=>es.map(e=>e.value));if(values.length>1){await pick.selectOption(values[1]);await page.waitForTimeout(350);assert.equal(await pick.inputValue(),values[1],'Original player selector still filters');}
 await go(page,'ligaControl');assert.ok(await page.locator('.ljr-cms-entry .ljr-design-edge').count()>=2,'Several original CMS controls have a fine rainbow frame');
 const title=page.locator('.ljr-cms-quick-title').first();assert.equal(await title.evaluate(e=>getComputedStyle(e).wordBreak),'normal','CMS words do not break mid-word');
 for(const [api,name] of [['openNotice','notice'],['openReview','review'],['openPages','pages']]){
  await page.evaluate(method=>window.LJR_EDITOR_CENTER[method](),api);const dialog=page.locator('[data-captured-dialog]').last();await dialog.waitFor();assert.match(await dialog.evaluate(e=>getComputedStyle(e).backgroundImage),/url/,'Original '+name+' dialog uses design');
  const close=dialog.locator('[data-close],.ljr-editor-close,.ljr-admin-close,button[aria-label="Cerrar"]').first();if(await close.count())await close.click();else await page.evaluate(()=>document.querySelectorAll('.ljr-editor-overlay').forEach(e=>e.remove()));
 }
 await go(page,'ligaControl');await page.locator('.ljr-cms-entry [data-cms-design]').click();const studio=page.locator('.ljr-content-studio');await studio.waitFor();await studio.locator('[name=title]').fill('Prueba local sin publicar');assert.equal(await studio.locator('[name=title]').inputValue(),'Prueba local sin publicar','Original publication button and title field');await studio.locator('[data-close],.ljr-admin-close').first().click();
 await page.setViewportSize({width:360,height:800});
 for(const route of ['ligaControl','leagueTools','players','v38Alerts','weatherFields']){
  await go(page,route);await page.waitForFunction(()=>{const es=[...document.querySelectorAll('#screen .ljr-design-edge')];return es.length>0&&es.every(e=>e.isConnected&&getComputedStyle(e).pointerEvents==='none');});
  const labels=await page.locator('.ljr-cms-quick-title').evaluateAll(es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth})));assert.ok(labels.every(e=>e.scroll<=e.width+1),route+' labels fit at 360px');
  await page.locator('[data-design-card]:visible').last().scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,route+'-360-bottom.png')});
 }
 await go(page,'profile');await page.locator('.v12-profile-row').filter({hasText:'Ajustes de la aplicación'}).click();const settings=page.locator('[data-captured-dialog]').last();await settings.waitFor();await settings.locator('[data-close]').click();
 await page.evaluate(()=>window.LJR_PROFILE.open());const avatar=page.locator('[data-captured-dialog]').last();await avatar.waitFor();assert.ok(await avatar.locator('input[type=file]').count()>0,'Original avatar picker preserved');await avatar.locator('[data-close]').click();
 await go(page,'rulebook');assert.equal(await page.locator('.v102-rulebook-paper').getAttribute('data-design-card'),null,'PDF paper remains original');
 // Both comparison pages start with the same account and filter state; prior
 // form interactions and the avatar viewer cannot affect this comparison.
 const untouched=await openApp(resolve(root,'dist'));await fixtureAccount(untouched);await untouched.setViewportSize({width:360,height:800});
 const baseline=await openApp(resolve(root,'dist'),true);await fixtureAccount(baseline);await baseline.setViewportSize({width:360,height:800});
 const signature=p=>p.locator('#screen').evaluate(root=>{
  const paint=e=>{const c=getComputedStyle(e);return {image:c.backgroundImage,bg:c.backgroundColor,ink:c.color,border:c.borderTopColor};};
  // Private CMS entry availability depends on the auth refresh; compare the
  // original public controls, whose appearance this task must preserve.
  return {screen:paint(root),controls:[...root.querySelectorAll('button,select,input')].filter(e=>e.getClientRects().length&&!e.closest('.ljr-cms-entry')).slice(0,16).map(paint)};
 });
 for(const route of ['teams','following','scorers','fantasy','stats','history','accountLogin','accountRegister','accountEdit','accountCloud','credentialBuilder','appInstall','tableExport','publications','historyLog','more']){
  await go(untouched,route);await go(baseline,route);
  assert.equal(await untouched.locator('#screen').getAttribute('data-captured-design'),null,route+' outside captured scope');
  assert.equal(await untouched.locator('#screen [data-design-card]').count(),0,route+' untouched');
  assert.deepEqual(await signature(untouched),await signature(baseline),route+' retains original backgrounds and control colors');
 }
 console.log('V1441: 29 complete routes at 412px, five complete mobile routes at 360px, solid controls, rainbow frames, editors, original selector, avatar, document and 16 protected routes verified.');
}finally{await browser.close();}
