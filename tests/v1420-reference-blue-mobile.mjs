/* Verificación visual móvil: estilos reales, formularios de prueba aislados.
   No inicia sesiones, envía avisos ni escribe datos en servicios reales. */
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync} from 'node:fs';
import {resolve, extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..');
const out=resolve(process.env.VISUAL_OUTPUT||resolve(root,'artifacts/v1420-reference-blue'));
mkdirSync(out,{recursive:true});
const html=readFileSync(resolve(root,'index.html'),'utf8');
const sheets=['./src/styles.css',...new Set([...html.matchAll(/<link\b[^>]*href="(\.\/src\/[^"?]+\.css)(?:\?[^"\s]*)?"/g)].map(m=>m[1]))];
const links=sheets.map(p=>`<link rel="stylesheet" href="${p}">`).join('');
const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8v4a4 4 0 0 1-8 0V3ZM12 11v7M8 21h8M8 4H4v3a4 4 0 0 0 4 4M16 4h4v3a4 4 0 0 1-4 4"/></svg>';
const tile=(label,i)=>`<button type="button" class="ljr-admin-tile" ${i===3?'hidden':''}><span class="ljr-admin-tile-icon">${icon}</span><span class="ljr-admin-tile-label">${label}</span></button>`;
const sections=[
 ['Administración de la Liga','<div class="liga-media-modal"><section class="ljr-admin-manage">','ljr-admin-area'],
 ['Publicar en la Liga','<div class="liga-media-modal"><section class="ljr-content-studio">','ljr-editor-preview'],
 ['Revisar avisos','<div class="liga-media-modal"><section class="ljr-editor-dialog">','ljr-review-card'],
 ['Junta de la Liga','<div class="v105-modal v875-meeting-modal"><section class="v105-dialog">','v105-meeting-notice'],
 ['Árbitros y oficiales','<div class="v105-modal v1125-officials-modal"><section class="v105-dialog">','v1125-editor'],
 ['Nueva sanción','<div class="v105-modal v639-sanction-modal v1130-sanction-pro"><section class="v105-dialog v1130-dialog">','v1130-summary'],
 ['Auditoría de herramientas','<div class="v105-modal v1107-admin-modal v1212-audit-modal"><section class="v105-dialog">','v1212-item'],
 ['Ajustes de la aplicación','<div class="liga-media-modal"><section aria-label="Ajustes de la aplicación">','ljr-simple-intro']
];
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try {
 for(const width of [360,412]) {
  const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  let fixture='';
  await page.route('**/*', async route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='http://ljr.test')return route.abort();
   if(url.pathname==='/fixture')return route.fulfill({contentType:'text/html',body:fixture});
   const file=resolve(root,url.pathname.slice(1));
   try {const type={'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'}[extname(file)]||'text/html';await route.fulfill({contentType:type,body:readFileSync(file)});}catch {await route.fulfill({status:404,body:'Unavailable test asset'});}
  });
  for(let i=0;i<sections.length;i++) {
   const [title,opening,card]=sections[i];
   fixture=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${links}<style>body{margin:0;font:14px system-ui;background:#080b58}.liga-media-modal,.v105-modal{padding:12px!important}section>header{display:flex;gap:12px;align-items:center;justify-content:space-between}h2{margin:0}form{display:grid;gap:12px;margin-top:14px}label{display:grid;gap:7px}input,select,textarea{width:100%;padding:10px;font:inherit}section>header+div{margin-top:16px;padding:14px}.cms-kind-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}section{padding:15px!important;max-height:94dvh!important;overflow:auto!important}</style></head><body>${opening}<header><h2>${title}</h2><button type="button" data-close aria-label="Cerrar">×</button></header><div class="${card}"><strong>Contenido y datos oficiales</strong><p class="ljr-admin-section-sub">Selecciona la herramienta que necesitas.</p><div class="cms-kind-grid">${['Noticias','Tabla de goleo','Jornadas y resultados','Oculto por permisos'].map(tile).join('')}</div></div><form class="cms-form"><label>Categoría<select id="category"><option>Primera Fuerza</option><option>Veteranos 50+</option></select></label><label>Equipo<input id="team" placeholder="Busca un equipo"></label><label>Descripción<textarea rows="2"></textarea></label><label>Imagen<input type="file"></label><button type="submit">Guardar borrador</button><button type="button" class="ljr-admin-tile-danger">Cerrar sesión</button><button type="button" disabled>Publicación no disponible</button></form></section></div><script>window.saved=0;document.querySelector('form').onsubmit=e=>{e.preventDefault();window.saved++};document.querySelector('[data-close]').onclick=()=>document.querySelector('section').remove();</script></body></html>`;
   await page.goto('http://ljr.test/fixture',{waitUntil:'networkidle'});
   const metrics=await page.evaluate(()=>{
    const section=document.querySelector('section'),input=document.querySelector('#team'),tile=document.querySelector('.ljr-admin-tile');
    const styles=e=>({background:getComputedStyle(e).backgroundImage,color:getComputedStyle(e).color});
    const icon=document.querySelector('.ljr-admin-tile-icon svg').getBoundingClientRect();
    const visible=[...document.querySelectorAll('button,input,select,textarea')].filter(e=>e.getBoundingClientRect().height&&getComputedStyle(e).visibility!=='hidden');
    return {section:styles(section),field:getComputedStyle(input).backgroundColor,tile:styles(tile),icon:{w:icon.width,h:icon.height},outside:visible.filter(e=>{const r=e.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1}).map(e=>e.outerHTML.slice(0,90)),hidden:getComputedStyle(document.querySelector('[hidden]')).display};
   });
   assert.match(metrics.section.background,/rgb\(0, 0, 64\)/,title+' canvas');
   assert.equal(metrics.field,'rgb(8, 8, 79)',title+' field');
   assert.equal(metrics.tile.color,'rgb(255, 255, 255)',title+' button text');
   assert.deepEqual(metrics.outside,[],title+' controls inside viewport');
   assert.equal(metrics.hidden,'none',title+' hidden permissions preserved');
   assert.deepEqual(metrics.icon,{w:23,h:23},title+' icon proportions');
   await page.locator('#category').selectOption({label:'Veteranos 50+'});
   await page.locator('#team').fill('Boavista FC');
   await page.locator('button[type=submit]').click();
   assert.equal(await page.evaluate(()=>window.saved),1,title+' submit handler preserved');
   assert.equal(await page.locator('#category').inputValue(),'Veteranos 50+');
   assert.equal(await page.locator('#team').inputValue(),'Boavista FC');
   assert.equal(await page.locator('button[disabled]').isEnabled(),false);
   await page.locator('section').evaluate(e=>{e.scrollTop=0});
   await page.screenshot({path:resolve(out,`dialog-${i}-${width}.png`)});
   await page.locator('[data-close]').click();
   assert.equal(await page.locator('section').count(),0,title+' close handler preserved');
  }
  await page.close();
  console.log(`PASS ${width}px: ${sections.length} dialog families, native selects, editable inputs, submit/close, disabled/hidden states, icons and viewport bounds.`);
 }
}finally{await browser.close();}
