import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const original=read('src/pc-unified-navigation-20261011.js');
const nav=original.match(/const NAV=\[([\s\S]*?)\];/);
const expected=[...(nav?.[1]||'').matchAll(/\['([^']+)','[^']+'\]/g)].map(m=>m[1]);
test('Gaming keeps the same eight PC navbar labels and their order on six pages',()=>{
 assert.deepEqual(expected,['Inicio','Partidos','Clasificación','Liga TV','Sorteos','Gaming','Datos','Más']);
 for(const page of ['index.html','about.html','services.html','portfolio.html','blog.html','contact.html']){
  const html=read('gaming/'+page);
  const section=html.match(/<nav class="gaming-pc-links"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(section,'Missing desktop navbar: '+page);
  const onlyTabs=section[1].replace(/<div role="group"[^>]*>[\s\S]*?<\/div>/g,'');
  const names=[...onlyTabs.matchAll(/<(?:a|summary)[^>]*>([\s\S]*?)<\/(?:a|summary)>/g)]
   .map(m=>m[1].replace(/<[^>]+>/g,'').trim());
  assert.deepEqual(names,expected,'Navbar drifted on '+page);
  assert.match(html,/href="header-pc\.css\?v=/);
  assert.match(html,/href="styles\.css\?v=/);
  assert.match(html,/class="secondary-nav"/);
 }
});
test('PC Gaming header fixes are isolated from original mobile and APK',()=>{
 const css=read('gaming/header-pc.css');
 assert.match(css,/Align dropdown menus with their parent tab/);
 assert.match(css,/\.gaming-pc-links>details>div\{[\s\S]*?position:absolute/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk|body\[data-app-route/);
});