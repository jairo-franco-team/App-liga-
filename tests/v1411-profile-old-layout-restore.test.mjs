import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const style=read('src/v1411-profile-old-layout-restore.css');
test('V1412: Perfil conserva menú original sin cuadros y adopta azul rey medio',()=>{
 const link='src/v1411-profile-old-layout-restore.css?v=20261010-v1415-azul-rey-uniforme';
 assert.ok(html.includes(link));
 assert.ok(html.indexOf(link)>html.indexOf('src/v1402-account-admin-royal-blue.css'));
 for(const token of ['background:#2055B7!important','.v12-profile-card[data-v569-owned]','.v569-profile-account-menu>button','.v12-profile-menu>.v12-profile-row','background:transparent!important','border-radius:0!important','border-bottom:1px solid','.v569-profile-buttons>button:first-child','linear-gradient(180deg,#2865BF']){
  assert.ok(style.includes(token),'No existe '+token);
 }
});
test('V1411: no afecta Cuenta, navegación ni interacciones',()=>{
 assert.match(style,/html body\[data-app-route="profile"\]/);
 assert.doesNotMatch(style,/data-app-route\^="account"|data-app-route="competition"|data-app-route="home"/);
 assert.doesNotMatch(style,/<script|javascript:|pointer-events\s*:\s*none|display\s*:\s*none\s*!important/i);
 assert.ok(!style.includes('.topbar{')&&!style.includes('.bottom-nav{'));
});

test('V1414: Perfil mantiene azul rey medio sin la capa nocturna',()=>{
 const patch=style.slice(style.indexOf('/* V1414: neutraliza el repintado oscuro'));
 assert.ok(patch.length>500,'Debe existir la corrección visual final');
 for(const color of ['#2760BC','#2C68C6','#2459B8','#2B62BC']) assert.ok(patch.includes(color),'Falta azul rey '+color);
 assert.ok(patch.includes('#screen#screen#screen .v12-profile-card'),'Debe superar la antigua capa oscura');
 assert.ok(patch.includes('#screen#screen#screen .v569-profile-account-menu>button'),'Debe corregir filas');
 assert.doesNotMatch(patch,/<script|javascript:|pointer-events\\s*:\\s*none/i);
});

test('V1415: el último selector mantiene azul rey y no recupera marino oscuro',()=>{
 const tail=style.slice(style.indexOf('/* V1415 |'));
 assert.ok(tail.length>500,'Debe existir un acabado final del perfil');
 for(const color of ['#2055B7','#2760BC','#2C68C6','#265AB7']) assert.ok(tail.includes(color),'No coincide '+color);
 assert.doesNotMatch(tail,/#0b1655|#090f39|#101e57|#152854|#10225e/i);
});
