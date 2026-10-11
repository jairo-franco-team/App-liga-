import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('pc-exact-original-20261011.html');
const shell=read('src/desktop-shell.js');
const index=read('index.html');
test('The supplied original HTML structure and Tailwind geometry are preserved for the desktop home',()=>{
 for(const marker of ['data-name="page layout container"','data-name="header navigation wrapper"','data-name="fixtures strip container"','data-name="stories list container"','data-name="hero section container"','data-name="moments section container"','data-name="sponsors band"','data-name="footer links"'])
  assert.ok(html.includes(marker),marker);
 for(const literal of ['max-w-[1090px]','grid-cols-[1fr_300px]','h-[340px]','grid-cols-7','h-[176px]'])
  assert.ok(html.includes(literal),literal);
 assert.equal((html.match(/data-name="moment card \d+"/g)||[]).length,7);
 assert.equal((html.match(/data-name="story item \d+"/g)||[]).length,12);
 assert.equal((html.match(/<div\b[^>]*data-name="match card \d+"/g)||[]).length,6);
 assert.ok((html.match(/data-pc-route=/g)||[]).length>70);
});
test('Brand belongs to Liga Juventino Rosas; original fixture placeholders do not invent scores',()=>{
 assert.match(html,/LIGA JUVENTINO ROSAS/);
 assert.match(html,/escudo-liga-azul-sin-fondo-v1007\.png/);
 assert.ok(!html.includes('../../assets/football/'));
 assert.doesNotMatch(html,/Lamine Yamal|Man United|Bayern München|© 1998-2026 UEFA/);
 assert.match(html,/CATEGORÍAS OFICIALES/);
});
test('Original HTML bridge and shell parse, route via messages, official fixture sync stays PC-only',()=>{
 const match=html.match(/<script id="ljpc-exact-bridge">([\s\S]*?)<\/script>/);
 assert.ok(match,'JS bridge');
 assert.doesNotThrow(()=>new vm.Script(match[1]));
 assert.doesNotThrow(()=>new vm.Script(shell));
 assert.match(shell,/ljpc-exact-html-home/);
 assert.match(shell,/pcExactFixtures\(\)/);
 assert.match(shell,/window\.LJR_PC_NATIVE_ROUTES\?\.has\(r\)/);
 assert.match(shell,/if\(!desktop\(\)\)return/);
 assert.match(index,/desktop-shell\.js\?v=20261011-html-exacto-from-upload/);
 assert.ok(!html.includes('window.top.location='));
});
