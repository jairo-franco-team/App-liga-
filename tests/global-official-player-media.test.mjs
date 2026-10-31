import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('public/data/official-live.json',root),'utf8'));
const script=fs.readFileSync(new URL('src/v971-global-official-player-media.js',root),'utf8');

function load(){
 const context={
  window:{LJR_OFFICIAL_DATA:data,addEventListener(){}},
  document:{readyState:'complete',body:{},querySelectorAll:()=>[],addEventListener(){}},
  MutationObserver:function(){this.observe=()=>{};},
  fetch:async()=>({ok:true,json:async()=>data}),
  setTimeout:()=>0,
  clearTimeout(){}
 };
 context.globalThis=context.window;
 vm.runInNewContext(script,context);
 return context;
}

test('uses official Liga Juventino player photos from the public database without inventing data',()=>{
 const ctx=load();
 const api=ctx.window.LJR_PLAYER_MEDIA;
 assert.ok(api,'LJR_PLAYER_MEDIA must be exposed');
 assert.match(api.photo('Jesus Conejo','LINCES','3'),/^https:\/\/res\.cloudinary\.com\/rdk7ndhb\/image\/upload\/.*\/jugadores\//);
 assert.equal(api.photo('No registrado','LINCES','3'),'');
 assert.equal(api.position('No registrado','LINCES','3'),'');
 const html=api.avatar('Jesus Conejo',{team:'LINCES',catId:'3'});
 assert.match(html,/res\.cloudinary\.com\/rdk7ndhb\/image\/upload/);
 assert.match(html,/data-player-photo="1"/);
});

test('Main renderer uses official photo avatars across scorers, cards, lineups and player profile',()=>{
 const main=fs.readFileSync(new URL('src/main.js',root),'utf8');
 assert.match(main,/function officialPlayerAvatar\(/);
 assert.match(main,/officialPlayerAvatar\(s\.player,\{team:s\.team/);
 assert.match(main,/officialPlayerAvatar\(p\.name,\{team:t\.name/);
 assert.match(main,/officialPlayerAvatar\(player\.name,\{team:team\?\.name/);
});

test('Global styles center player faces inside circular frames',()=>{
 const css=fs.readFileSync(new URL('src/v971-global-official-player-media.css',root),'utf8');
 assert.match(css,/object-fit:cover!important/);
 assert.match(css,/object-position:center 18%!important/);
});
