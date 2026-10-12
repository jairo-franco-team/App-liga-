import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const styles=read('src/pc-unified-navigation-20261011.css');
const page=read('index.html');
const shell=read('src/pc-unified-navigation-20261011.js');
const mobileLock=read('src/v637-home-competition-scroll-lock.css');
const mobileChrome=read('src/v768-scroll-chrome.css');

test('PC scroll belongs to the document and no separate #screen scroll leaves footer fixed',()=>{
 assert.match(styles,/html\.ljpc-unified-pc\{\s*height:auto!important;[\s\S]*?overflow-y:auto!important;/);
 assert.match(styles,/html\.ljpc-unified-pc body\{\s*position:relative!important;[\s\S]*?height:auto!important;/);
 assert.match(styles,/html\.ljpc-unified-pc body #app,[\s\S]*?\.app-shell\{[\s\S]*?overflow:visible!important;/);
 assert.match(styles,/html\.ljpc-unified-pc body #screen\{[\s\S]*?position:relative!important;[\s\S]*?overflow-y:visible!important;/);
 assert.match(styles,/html\.ljpc-unified-pc body #ljpc-unified-pc-footer\{[\s\S]*?position:relative!important;[\s\S]*?bottom:auto!important;/);
 assert.match(shell,/screen\.insertAdjacentHTML\('afterend',footerMarkup\(\)\)/);
 assert.match(styles,/html\.ljpc-unified-pc body #ljpc-home-integrated-footer\{\s*display:none!important;/);
});

test('Footer scroll CSS is loaded last to override mobile layout and defeat stale cache',()=>{
 const idx=page.indexOf('pc-unified-navigation-20261011.css?v=pc-footer-stories-flow-20261011-v3');
 assert.ok(idx>0);
 assert.ok(idx>page.indexOf('desktop-browser-editorial-20261011.css'));
 assert.ok(idx>page.indexOf('v637-home-competition-scroll-lock.css'));
 assert.ok(idx>page.indexOf('v768-scroll-chrome.css'));
 assert.equal((page.match(/pc-unified-navigation-20261011\.css/g)||[]).length,1);
});

test('Only desktop gets natural document scrolling: mobile/APK scroll lock is preserved',()=>{
 assert.match(shell,/!\['mobile','apk'\]\.includes\(mode\(\)\)/);
 assert.match(styles,/html\.ljpc-unified-pc body #screen/);
 assert.doesNotMatch(styles,/html\.preview-mobile|html\.preview-apk/);
 assert.match(mobileLock,/@media\s*\(max-width:1023px\)/);
 assert.match(mobileChrome,/@media\(max-width:1023px\)/);
});

test('Navy footer and sponsor palette are unchanged by the scroll-only patch',()=>{
 assert.match(styles,/#ljpc-unified-pc-footer \.ljpc-u-sponsor\{[\s\S]*?background:linear-gradient\(180deg,#08253e,#06172f\)!important;/);
 assert.match(styles,/#ljpc-unified-pc-footer\{[\s\S]*?background:#030a20;/);
});
