import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const css=read('src/profile-first-screenshot-restore.css');

test('Perfil clásico: último estilo aislado, posterior a las capas generales',()=>{
 const file='src/profile-first-screenshot-restore.css';
 assert.equal((html.match(/profile-first-screenshot-restore\.css/g)||[]).length,1);
 const old=html.indexOf('src/v1411-profile-old-layout-restore.css');
 const pos=html.indexOf(file);
 assert.ok(pos>old&&old>0,'La restauración independiente debe estar al final del Perfil');
 const tail=html.slice(pos);
 assert.doesNotMatch(tail,/<link\s+rel="stylesheet"/,'Ningún CSS debe repintar la vista Perfil después');
});

test('Perfil clásico: las tarjetas y filas de la referencia prevalecen',()=>{
 assert.ok(css.includes('#screen#screen#screen#screen#screen'));
 for(const selector of ['.v12-profile-card[data-v569-owned]','.v569-profile-hero',
 '.v569-profile-buttons>button','.v569-profile-account-menu>button',
 '.v12-profile-menu>.v12-profile-row','.v12-profile-row-icon']){
   assert.ok(css.includes(selector),selector+' ausente');
 }
 // Verificar la estructura restaurada, sin fijar hexadecimales de la paleta.
 assert.match(css,/background-color:#[0-9a-f]{6}!important/i);
 assert.match(css,/background-image:linear-gradient/i);
 assert.match(css,/border-bottom:1px solid/);
 assert.match(css,/border-radius:0!important/);
 assert.match(css,/box-shadow/);
});

test('Perfil clásico: sin alteraciones funcionales ni de otras rutas',()=>{
 assert.doesNotMatch(css,/data-app-route\^="account"|data-app-route="competition"|data-app-route="home"/);
 assert.doesNotMatch(css,/<script|javascript:|pointer-events\s*:\s*none|display\s*:\s*none/i);
 assert.doesNotMatch(css,/\.topbar\s*\{|\.bottom-nav\s*\{/);
});

test('V1417: muestra el Perfil azul noche de la captura y no las filas azules sólidas',()=>{
 assert.match(html,/profile-first-screenshot-restore\.css\?v=20261011-v1417-captura-perfil-azul-noche/);
 assert.ok(css.includes('background-color:#05075e!important'),'Fondo superior de Perfil original');
 assert.ok(css.includes('linear-gradient(180deg,#070967 0%,#05075e 43%,#02044f 100%)'),'Fondo nocturno completo');
 assert.ok(css.includes('background-color:#101778!important'),'Tarjeta Mi cuenta azul profundo');
 assert.ok(css.includes('background-color:#2455af!important'),'Boton principal original');
 assert.ok(css.includes('border:2px solid #38d9e8!important'),'Avatar turquesa');
 const rows=css.slice(css.indexOf('/* Opciones: FILAS TRANSPARENTES'));
 assert.ok(rows.includes('.v569-profile-account-menu>button'));
 assert.ok(rows.includes('.v12-profile-menu>.v12-profile-row'));
 assert.ok(rows.includes('background-color:transparent!important'));
 assert.ok(rows.includes('border-bottom:1px solid rgba(120,139,207,.18)!important'));
 assert.ok(rows.includes('border-radius:0!important'));
 const icons=rows.slice(rows.indexOf('.v569-profile-account-menu>button>span'));
 assert.ok(icons.includes('background:transparent!important'),'Iconos sin bloque de color');
 assert.doesNotMatch(css,/data-app-route\^="account"|data-app-route="home"|pointer-events\s*:/);
});
