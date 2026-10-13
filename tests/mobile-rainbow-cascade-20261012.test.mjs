import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../src/mobile-rainbow-bottom-nav-20261012.css',import.meta.url),'utf8');
const shell=readFileSync(new URL('../src/mobile-shell.css',import.meta.url),'utf8');
test('rainbow mobile overrides use same CSS cascade layer as mobile-shell !important rules',()=>{
 assert.match(shell,/@layer ljr-mobile-shell\s*\{/);
 assert.match(css,/@layer ljr-mobile-shell\s*\{/);
 assert.doesNotMatch(css,/\.ljpc-unified-pc body .*nav-icon\{color/);
 for(const [route,color] of Object.entries({home:'#ff5d83',competition:'#ffc858',video:'#57efa3',fantasy:'#45cfff',more:'#b28bff'})){
  assert.ok(css.includes('data-route="'+route+'"] .nav-icon{color:'+color+'!important}'),route+' keeps its dedicated color');
 }
});
