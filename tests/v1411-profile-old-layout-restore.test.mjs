import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const style=read('src/v1411-profile-old-layout-restore.css');
test('V1412: Perfil conserva menú original sin cuadros y adopta azul rey medio',()=>{
 const link='src/v1411-profile-old-layout-restore.css?v=20261010-v1412-royal-profile-topbar';
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
