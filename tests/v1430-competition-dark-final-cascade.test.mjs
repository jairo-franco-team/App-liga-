import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>readFileSync(resolve(root,p),'utf8');
const html=read('index.html');
const night=read('src/v1426-competition-exact-dark-background.css');
const late=read('src/v1428-more-reference-gradient-fix.css');

test('V1430: Clasificación/Cuadro permanece en fondo #000040 sin degradado posterior',()=>{
  const screen=night.slice(night.indexOf('/* V1427 ·'));
  assert.match(screen,/background-color:#000040!important;/);
  assert.match(screen,/background-image:none!important;/);
  for(const sel of ['#screen#screen#screen','.v12-bracket-reference','.v40-content','.v12-bracket-stage-tabs','.ljr-knockout']){
    assert.ok(screen.includes(sel),'faltó '+sel);
  }
  assert.doesNotMatch(late,/body(?:\.v40-standings-master)?\[data-app-route="competition"\]/);
  assert.doesNotMatch(late,/#101cb0|#091388|#070f72|#05094b/i);
  assert.match(late,/V1430: Se retiró la sobreescritura/);
});

test('V1430: CSS de Más no cambia Competición y conservó Herramientas/Admin/Notificaciones',()=>{
  for(const marker of ['/* 2. Herramientas:', '/* 3. Administración:', '/* 4. Notificaciones:']){
    assert.ok(late.includes(marker),'Se perdió '+marker);
  }
  const oldLink='src/v1426-competition-exact-dark-background.css?v=20261011-v1427-fondo-000040';
  const fixLink='src/v1428-more-reference-gradient-fix.css?v=20261011-v1432-imagen3-degradado-rey-noche';
  // V1433: la capa universal se retiró para restaurar el diseño original.
  // No debe cargarse de nuevo encima de Clasificación ni de Cuadro.
  assert.equal(html.split(fixLink).length-1,0);
  assert.ok(html.indexOf(oldLink)>0);
  assert.ok(!html.includes('src/v1428-more-reference-gradient-fix.css'));
  const following=[...html.slice(html.indexOf(oldLink)+oldLink.length).matchAll(/<link[^>]+href="([^"]+\.css(?:\?[^"]*)?)"/g)];
  for(const x of following){
    const path=x[1].replace(/^\.\//,'').split('?')[0];
    if(!existsSync(resolve(root,path))) continue;
    const css=read(path);
    if(css.includes('body[data-app-route="competition"]') && /#screen#screen#screen/.test(css)){
      assert.ok(path.endsWith('v1426-competition-exact-dark-background.css'), 'CSS posterior pisa Competición: '+path);
    }
  }
});
