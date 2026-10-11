import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const code=read('src/desktop-home-restore-20261011.js');
const css=read('src/desktop-home-restore-20261011.css');
const shell=read('src/desktop-shell.js');
const html=read('index.html');
test('PC homepage script parses and exports renderer',()=>{
 assert.doesNotThrow(()=>new vm.Script(code));
 const ctx={window:{}};
 vm.runInNewContext(code,ctx,{timeout:1000});
 assert.equal(typeof ctx.window.LJR_PC_HOME_V2.render,'function');
 const actual=ctx.window.LJR_PC_HOME_V2.render({
  top:()=>'<header data-test="nav"></header>',
  footer:()=>'<footer data-test="footer"></footer>',
  desktopOfficialGames:()=>[{text:'Dom 11/10 · 08:00',home:'Aldama',away:'Galena'}],
  desktopOfficialTeams:()=>[]
 });
 for(const label of ['Últimas noticias','Momentos','Resúmenes en vídeo','En portada','Lo más destacado','Ver todos los partidos','CATEGORÍAS OFICIALES'])assert.ok(actual.includes(label),label);
 for(const route of ['competition','moments','news','history','video','safe-data'])assert.ok(actual.includes('data-desk-route="'+route+'"'),route);
 assert.ok(actual.includes('Aldama')&&actual.includes('Galena'));
 assert.ok(actual.includes('data-desktop-shell="1"'));
 assert.ok(actual.includes('data-test="nav"'));
 assert.ok(actual.includes('data-test="footer"'));
});
test('desktop design is isolated from native mobile / APK',()=>{
 assert.ok(css.includes('body.lj-desktop .ljpc-ref-home'));
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
 assert.ok(html.includes('desktop-home-restore-20261011.js'));
 assert.ok(html.includes('desktop-home-restore-20261011.css'));
 assert.match(shell,/window\.LJR_PC_HOME_V2\?\.render/);
 assert.match(shell,/window\.LJR_PC_NATIVE_ROUTES\?\.has\(r\)/);
 assert.doesNotMatch(code,/UEFA\.tv|Champions League|Lamine Yamal|Bayern/);
});
