import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../pc-exact-original-20261011.html',import.meta.url),'utf8');
const desktopShell=readFileSync(new URL('../src/desktop-shell.js',import.meta.url),'utf8');

test('PC home official-category disclaimer is legible without changing banner geometry',()=>{
 const banner=html.match(/<div[^>]+data-name="banner container"[^>]*>[\s\S]*?<\/div>/);
 assert.ok(banner,'desktop categories banner must remain');
 assert.match(banner[0],/w-\[560px\]/,'keep reference banner width');
 assert.match(banner[0],/data-name="banner title"/);
 assert.match(banner[0],/class="text-\[9px\] leading-\[12px\] text-\[#b7f5d6\]"[^>]+data-name="banner legal disclaimer"/);
 assert.match(banner[0],/Primera, Intermedia, Segunda, Veteranos 35\+ y Veteranos 50\+/);
});

test('Featured sidebar has distinct labels with the same original click routes and geometry',()=>{
 const first=html.match(/data-name="sidebar item 3"[^>]*data-pc-route="([^"]+)"[\s\S]*?data-name="item text">\s*([^<]+)/);
 const second=html.match(/data-name="sidebar item 4"[^>]*data-pc-route="([^"]+)"[\s\S]*?data-name="item text">\s*([^<]+)/);
 assert.ok(first&&second);
 assert.equal(first[1],'moments');
 assert.equal(second[1],'moments');
 assert.equal(first[2].trim(),'Momentos de la liga');
 assert.equal(second[2].trim(),'Jugadores y momentos');
 assert.match(html,/data-name="highlighted articles sidebar"/);
});

test('Desktop iframe is the only page affected, not the native mobile UI',()=>{
 assert.match(desktopShell,/src="\.\/pc-exact-original-20261011\.html\?v=/);
 assert.doesNotMatch(html,/pointer-events:\s*none|data-pc-route=""/);
});
