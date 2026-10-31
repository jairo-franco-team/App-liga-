import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=read('src/pc-forced-handset-layout-20261012.js');
const css=read('src/pc-forced-handset-layout-20261012.css');
const html=read('index.html');
function boot(mode,width=412,height=915,touch=5){
 const classes=new Map();let metaChanged=false, lookedUp=false, ready;
 const document={
  readyState:'loading',
  documentElement:{classList:{toggle:(key,on)=>classes.set(key,on)}},
  addEventListener:(key,cb)=>{if(key==='DOMContentLoaded')ready=cb;},
  querySelector:(selector)=>{lookedUp=true;return selector==='meta[name="viewport"]'?{setAttribute:(k,v)=>{if(k==='content'&&v==='width=device-width,initial-scale=1')metaChanged=true}}:null},
  getElementById:()=>null
 };
 const window={addEventListener:()=>{}};
 const ctx={window,document,location:{search:'?mode='+mode},screen:{width,height},navigator:{maxTouchPoints:touch},URLSearchParams,requestAnimationFrame:cb=>cb()};
 vm.runInNewContext(js,ctx);
 assert.equal(typeof ready,'function');
 ready();
 return {active:classes.get('ljpc-forced-handset'),metaChanged,lookedUp};
}
test('El JS se interpreta y no altera los modos mobile y apk',()=>{
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const m of ['mobile','apk']){
  const result=boot(m);
  assert.equal(result.active,false);
  assert.equal(result.metaChanged,false);
  assert.equal(result.lookedUp,false);
 }
});
test('La correccion se activa solo para escritorio forzado en telefono tactil',()=>{
 assert.equal(boot('desktop').active,true);
 assert.equal(boot('desktop').metaChanged,true);
 assert.equal(boot('desktop',1440,900,0).active,false);
 assert.equal(boot('desktop',412,915,0).active,false);
});
test('Imagen y circulos se acotan; iframe PC puede reordenar sus columnas sin esconder controles',()=>{
 assert.match(css,/html\.ljpc-forced-handset body\.lj-desktop/);
 assert.match(css,/max-height:230px!important/);
 assert.match(css,/img\[src\*="home-players"/);
 assert.match(js,/\[data-name="stories wrapper"\]/);
 assert.match(js,/\[data-name="hero section container"\]/);
 assert.match(js,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(js,/max-height:210px!important/);
 assert.match(js,/frame\.addEventListener\('load'/);
 assert.doesNotMatch(css,/html\.preview-mobile|html\.preview-apk/);
});
test('Carga unica CSS/JS y mantiene proteccion final de Perfil',()=>{
 const style='src/pc-forced-handset-layout-20261012.css';
 const script='src/pc-forced-handset-layout-20261012.js';
 const profile='src/profile-first-screenshot-restore.css';
 assert.equal(html.split(style).length-1,1);
 assert.equal(html.split(script).length-1,1);
 assert.ok(html.indexOf(style)>0&&html.indexOf(style)<html.indexOf(profile));
 const tail=html.slice(html.indexOf(profile)).replace(/<link[^>]*v1464-mobile-header-logo-performance\.css[^>]*>/gi,'');
 assert.doesNotMatch(tail,/<link\s+rel="stylesheet"/);
});

test('La barra PC forzada cabe en un viewport estrecho sin ocultar los siete botones',()=>{
 assert.match(css,/grid-template-areas:"brand login" "links links"!important/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/\.ljpc-u-links>details\[open\]/);
 assert.match(css,/\.ljpc-u-matchlist/);
 assert.match(css,/overflow-x:auto!important/);
 assert.match(css,/scroll-snap-align:start!important/);
 assert.match(js,/height:218px!important/);
 assert.match(js,/max-height:none!important/);
 assert.match(js,/flex:0 0 69px!important/);
 assert.match(html,/pc-forced-handset-layout-20261012\.css\?v=pc-full-visible-20261012-v2/);
 assert.match(html,/pc-forced-handset-layout-20261012\.js\?v=pc-full-visible-20261012-v2/);
});
