import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/pc-home-no-overlap-20261011.css');
const compact=read('src/pc-compact-integrated-20261011.css');
const html=read('index.html');
const banners=read('src/v73-v38-motion-banners.js');
const native=read('src/v105-green-app-bottom.css');

test('Inicio PC uses vertical document flow instead of collapsed overlapping grid tracks',()=>{
 assert.match(css,/#screen\{\s*display:flex!important;[\s\S]*?flex-flow:column nowrap!important;/);
 assert.match(css,/#screen > #safeHomeExtra\{[\s\S]*?grid-auto-rows:max-content!important;/);
 assert.match(css,/#safeHomeExtra > \.v6-section\{[\s\S]*?display:block!important;[\s\S]*?grid-row:auto!important;/);
 assert.match(css,/#screen > #v105-bottom\[data-v105-route="home"\]\{[\s\S]*?order:5!important;/);
 assert.match(css,/#screen > \.v114-upcoming-slot\{[\s\S]*?order:1!important;/);
 assert.match(css,/#screen > #safeHomeExtra\{[\s\S]*?order:2!important;/);
 assert.match(css,/#screen > #ljpc-exact-html-home\{[\s\S]*?order:0!important;/);
});

test('Video and motion banners reserve height for absolute video assets and buttons',()=>{
 assert.match(native,/\.v105-motion video\{position:absolute/);
 assert.match(css,/#v105-bottom \.v105-motion\{[\s\S]*?min-height:136px!important;/);
 assert.match(css,/#v105-bottom \.v105-motion-copy\{[\s\S]*?min-height:136px!important;/);
 assert.match(css,/#safeHomeExtra > \.v73-home-interleaved\{[\s\S]*?min-height:165px!important;/);
 assert.match(css,/grid-template-areas:[\s\S]*?"toggle toggle"!important;/);
 for(const type of ['kicker','title','description','pills','toggle'])assert.match(css,new RegExp('grid-area:'+type+'!important'));
 assert.doesNotMatch(compact,/min-height:95px!important/);
 assert.ok(banners.includes('v73-motion-toggle'));
 assert.ok(banners.includes('v73-motion-pills'));
});

test('Native results, scorers and next fixtures keep independent auto-height rows',()=>{
 assert.match(css,/\.v6-table-row\)\{[\s\S]*?min-height:32px!important;/);
 assert.match(css,/\.v6-scorers > button\{[\s\S]*?min-height:35px!important;/);
 assert.match(css,/\.v103-upcoming-card\{[\s\S]*?grid-auto-rows:max-content!important;/);
 assert.match(css,/\.v103-upcoming-day\{[\s\S]*?grid-row:auto!important;/);
 assert.match(css,/\.v103-upcoming-match\{[\s\S]*?min-height:48px!important;/);
 assert.match(css,/\.v73-home-interleaved \.v73-motion-pills button\{[\s\S]*?min-height:32px!important;/);
});

test('Fix applies after former PC compact stylesheet and never to mobile/APK',()=>{
 const old=html.indexOf('pc-compact-integrated-20261011.css');
 const next=html.indexOf('pc-home-no-overlap-20261011.css?v=20261011-no-overlap-pc-v1');
 assert.ok(old>0&&next>old);
 assert.equal((html.match(/pc-home-no-overlap-20261011\.css/g)||[]).length,1);
 assert.ok(css.split('\n').filter(line=>line.startsWith('html.ljpc-unified-pc body.lj-desktop')).length>10);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
 assert.doesNotMatch(css,/pointer-events:none!important/);
});
