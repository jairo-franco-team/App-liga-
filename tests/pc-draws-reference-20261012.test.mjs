import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=get('src/pc-uefa-18-references-20261012.js');
const css=get('src/pc-draws-exact-uefa-geometry-20261012.css');
const html=get('index.html');
const route='html.ljpc18-active[data-ljpc18-route="pc-draws"] body.lj-desktop';

test('PC Sorteos preserves four functional tabs and draw categories',()=>{
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const feature of ["function drawsPage()","data-u18-draw-tab","['results','Resultados']","['updates','Actualizaciones']","['pots','Bombos']","['procedure','Procedimiento']",
 "if(d.u18DrawTab)","state.drawTab=d.u18DrawTab",'data-u18-go="bracketBuilder"','data-u18-go="video"',"u18-drawrecommended","u18-drawpromo","u18-drawcover","u18-entrants","tableRows()","catSelect()"]){
  assert.ok(js.includes(feature),'missing live draw route: '+feature);
 }
 assert.ok(js.includes("route()==='pc-draws'&&!state.showClassic"),'PC original tools are only hidden until requested');
 assert.ok(js.includes('data-u18-open-draw-original'),'Original management panel remains accessible');
});
test('Local images are real existing league assets, never UEFA sponsors',()=>{
 for(const file of ['assets/liga-logo.webp','assets/home-players-user.png','public/home-header-original-v775.jpg','public/final-trophy-drive.png'])
   assert.ok(existsSync(new URL('../'+file,import.meta.url)),'Missing local Liga asset '+file);
 for(const url of ['./assets/liga-logo.webp','./assets/home-players-user.png','./home-header-original-v775.jpg','./final-trophy-drive.png'])
   assert.ok(js.includes(url),'Missing correct website asset URL '+url);
 const portion=js.slice(js.indexOf('function drawsPage()'),js.indexOf('\nconst vids=[',js.indexOf('function drawsPage()')));
 assert.doesNotMatch(portion,/hyundai|uefa\.com|source\.unsplash|PS5|crypto\.com/i);
});
test('Pixel geometry styles only PC draw route; mobile final CSS is preserved',()=>{
 assert.ok(css.includes(route));
 const rules=css.split('\n').filter(x=>x.startsWith('html.'));
 assert.ok(rules.length>40);
 assert.ok(rules.every(x=>x.includes(route)),'All selectors must use pc-draws scope');
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
 for(const cls of ['u18-drawtabs','u18-drawrecommended','u18-bluehead','u18-drawstage'])
   assert.ok(css.includes(cls));
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
 const draw=html.indexOf('pc-draws-exact-uefa-geometry-20261012.css');
 const repair=html.indexOf('pc-desktop-screen-repair-20261012.css');
 const mobileLast=html.indexOf('profile-first-screenshot-restore.css');
 assert.ok(draw>repair&&mobileLast>draw);
});
