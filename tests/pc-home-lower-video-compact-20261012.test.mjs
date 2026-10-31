import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/pc-home-lower-video-compact-20261012.css');
const html=read('index.html');
const controls=read('src/v977-global-video-controls.css');
const view=read('src/v105-green-app-bottom.js');
test('PC final video corrects the V977 vertical wrapper while preserving controls',()=>{
 assert.match(controls,/\.v105-final \.v977-player\{aspect-ratio:4\/5!important/);
 assert.match(css,/#v105-bottom \.v105-final > \.v977-player\{/);
 assert.match(css,/aspect-ratio:16\/9!important/);
 assert.match(css,/max-height:210px!important/);
 assert.match(css,/#v105-bottom \.v105-final > \.v977-player > video\{/);
 assert.match(view,/function finalVideo\(\)/);
 assert.match(view,/controls playsinline preload="metadata"/);
});
test('Favorite card, quick buttons, reactions and league status remain in the DOM',()=>{
 for(const cls of ['.v100-fav-card','.v100-quick-grid','.v100-pulse','.v100-status','.v105-grid','.v105-final-copy']){
   assert.ok(css.includes(cls),cls);
 }
 assert.match(css,/grid-row:2!important;align-self:start!important/);
 assert.match(css,/grid-column:1\/-1!important;grid-row:3!important/);
});
test('Only desktop home in the main app or explicit PC handset is touched',()=>{
 assert.match(css,/html\.ljpc-unified-pc body\.lj-desktop\[data-app-route="home"\]/);
 assert.match(css,/html\.ljpc-forced-handset body\.lj-desktop/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk|body\.mobile-mode/);
 assert.doesNotMatch(css,/display:none!important/);
});
test('CSS is loaded once before final profile stylesheet',()=>{
 const path='src/pc-home-lower-video-compact-20261012.css';
 assert.equal(html.split(path).length-1,1);
 assert.ok(html.indexOf(path)<html.indexOf('src/profile-first-screenshot-restore.css'));
 assert.doesNotMatch(html.slice(html.indexOf('src/profile-first-screenshot-restore.css')),/<link\s+rel="stylesheet"/);
});
