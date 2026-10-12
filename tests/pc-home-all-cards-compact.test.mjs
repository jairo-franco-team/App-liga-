import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/pc-home-all-cards-compact-20261011.css');
const index=read('index.html');
const home=read('src/v100-additive-functions.js');
const bottom=read('src/v105-green-app-bottom.js');
const safe=read('src/v6-safe.js');

test('Compact home cards CSS is isolated to the desktop app home route',()=>{
  assert.match(css,/html\.ljpc-unified-pc body\.lj-desktop\[data-app-route="home"\]/);
  assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
  assert.doesNotMatch(css,/pointer-events\s*:\s*none|display\s*:\s*none|position\s*:\s*absolute/);
  assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
  const k=index.indexOf('pc-home-all-cards-compact-20261011.css');
  assert.ok(k>index.indexOf('pc-uefa-18-references-20261012.css'));
  assert.ok(k<index.indexOf('profile-first-screenshot-restore.css'));
});

test('PC favorite selects, buttons, Fan Zone and native actions remain accessible',()=>{
  for(const id of ['#v100-home-extra','.v100-fav-card','.v100-quick-grid','.v100-pulse','.v100-status','.v100-actions']){
    assert.ok(css.includes(id),'missing PC compact selector: '+id);
  }
  for(const attr of ['data-v100-fav-cat','data-v100-fav-team','data-v100-save-fav','data-v100-open-fav','data-v100-react']){
    assert.ok(home.includes(attr),'original favorite/fan control missing: '+attr);
  }
  assert.match(css,/\.v100-fav-card select\s*\{/);
  assert.match(css,/\.v100-actions\s*\{/);
});

test('Original league table, goals, videos, banner and final video keep their handlers',()=>{
  for(const className of ['.v6-scorers','.v6-table-row','.v6-video-list','.v73-home-interleaved','.v105-final','.v105-grid','.v105-card']){
    assert.ok(css.includes(className),'missing compact desktop feature: '+className);
  }
  assert.match(safe,/data-safe-route="scorers"/);
  assert.match(bottom,/data-v105-route/);
  assert.match(bottom,/\bcontrols playsinline/);
  assert.match(css,/@media\(max-width:880px\)/);
});

test('No route data or mobile APK files are replaced by the CSS-only home integration',()=>{
  assert.match(index,/pc-home-all-cards-compact-20261011\.css\?v=pc-all-cards-compact-20261011-v1/);
  assert.match(index,/pc-home-all-cards-compact-20261011\.css[^\n]+media="screen"/);
  assert.doesNotMatch(css,/document\.|window\.|\.remove\(|innerHTML/);
});
