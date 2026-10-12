import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/v971-global-official-player-media.js',import.meta.url),'utf8');
function registry(){
 let conversions=0;
 const context={window:{LJR_OFFICIAL_DATA:{categories:{3:{name:'Primera',player_profiles:{Juventus:Array.from({length:2000},(_,i)=>({name:'Jugador '+i,photo:''}))}}}}},String:v=>{conversions++;return String(v)},URLSearchParams,Map,Set};
 const code=source.slice(source.indexOf('const norm='),source.indexOf('function catStored()'));
 vm.runInNewContext(code+';globalThis.lookup=find;',context);
 return {context,reset:()=>{conversions=0},count:()=>conversions};
}
test('repeated official player lookups do not normalize the entire roster again',()=>{
 const r=registry();assert.equal(r.context.lookup('Jugador 1999','Juventus','3').name,'Jugador 1999');r.reset();
 for(let i=0;i<20;i++)assert.equal(r.context.lookup('Jugador 1999','Juventus','3').name,'Jugador 1999');
 assert.ok(r.count()<200,'20 repeated lookups must use the name index; conversions: '+r.count());
});
test('a replacement official snapshot invalidates the player index',()=>{
 const r=registry();r.context.lookup('Jugador 1999');
 r.context.window.LJR_OFFICIAL_DATA={categories:{3:{name:'Primera',player_profiles:{Juventus:[{name:'Nuevo jugador',photo:''}]}}}};
 assert.equal(r.context.lookup('Jugador 1999'),null);assert.equal(r.context.lookup('Nuevo jugador').name,'Nuevo jugador');
});
test('a failed official portrait stays a fallback instead of creating another request on every mutation',()=>{
 let created=0,img=null;
 const holder={dataset:{},closest:()=>null,querySelector:()=>img,replaceChildren:n=>{img=n},classList:{add(){},remove(){}},removeAttribute(){},set textContent(v){img=null}};
 const context={document:{createElement(){created++;return {isConnected:true,classList:{add(){}},getAttribute(){return this.src}}}},Set};
 // Include the same failure state as the production portrait renderer.
 vm.runInNewContext(source.slice(source.indexOf('function picture('),source.indexOf('function meta('))+';globalThis.show=picture;',context);
 const person={name:'Jugador oficial',photo:'https://res.cloudinary.com/league/image/upload/jugadores/one'};
 context.show(holder,person);img.onerror();for(let i=0;i<10;i++)context.show(holder,person);
 assert.equal(created,1,'failed URL must not be inserted again');
});
test('lazy image scheduling does not synchronously measure image layout',()=>{
 let measurements=0;
 const image={tagName:'IMG',isConnected:true,complete:false,fetchPriority:'auto',hasAttribute:()=>false,closest:()=>null,getBoundingClientRect(){measurements++;return {top:0,bottom:50,left:0,right:50}}};
 const lazy=readFileSync(new URL('../src/v1230-global-mobile-perf.js',import.meta.url),'utf8');
 const ctx={image,window:{innerHeight:915,innerWidth:412},WeakSet};
 vm.runInNewContext(lazy.slice(lazy.indexOf('const skipped='),lazy.indexOf('function drain()'))+';enhance(image);',ctx);
 assert.equal(image.decoding,'async');assert.equal(measurements,0,'the browser should handle viewport loading, without a forced layout');
});
