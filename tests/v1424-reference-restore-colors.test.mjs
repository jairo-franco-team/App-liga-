import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/v1423-previous-colors-player.css');
const index=read('index.html');
const profile=read('src/profile-first-screenshot-restore.css');

test('V1424: los controles de vídeo vuelven a iconos blancos y fondos transparentes',()=>{
 assert.match(css,/@layer ljr-reference-surfaces/);
 for(const player of ['.v977-player','.ljr-video-player','.v919-stream-frame'])
  assert.ok(css.includes(player),player);
 assert.match(css,/\.v977-controls,\.ljr-video-controls,\.v919-stream-controls/);
 assert.match(css,/background:transparent!important;background-image:none!important/);
 assert.match(css,/color:#fff!important/);
 assert.match(css,/\.v918-icon-filled/);
 assert.match(css,/\.v977-player \.v977-controls button svg/);
 assert.doesNotMatch(css,/<script|javascript:|on(click|change|submit)\s*=/i);
});
test('V1424: Cuadro / Play-off conserva colores originales azul y cyan sin modificar fases',()=>{
 assert.match(css,/\.v12-bracket-reference/);
 assert.match(css,/\.v12-bracket-stage-tabs button:not\(\.active\)/);
 assert.match(css,/\.v12-bracket-stage-tabs button\.active/);
 assert.match(css,/background:#10dce7!important/);
 assert.match(css,/background:#1c2057!important/);
 assert.match(css,/\.ljr-ko-tabs button\.active/);
 assert.doesNotMatch(css,/display:none!important|pointer-events:none!important/);
});
test('V1424: Avatar y Cuenta recuperan colores previos y conservan fotos y seleccion',()=>{
 assert.match(css,/section\[aria-label="Mi avatar y mi camiseta"\]/);
 assert.match(css,/\.ljr-profile-preview/);
 assert.match(css,/\.ljr-avatar-gallery>button/);
 assert.match(css,/input\[type=file\]::file-selector-button/);
 assert.match(css,/#213aaa|#2862bc/);
 assert.match(profile,/V1423 \| Colores anteriores restaurados/);
 assert.match(profile,/background-color:#05075e!important/);
 assert.doesNotMatch(css,/\.ljr-avatar-gallery>button\s*\{[^}]*pointer-events:none/i);
});
test('V1424: CSS restaurado se carga después del tema de referencia y sin duplicados',()=>{
 const restored='src/v1423-previous-colors-player.css?v=20261011-v1425-fondo-azul-oscuro-cuadro';
 const first='src/v1420-reference-blue-surfaces.css';
 const last='src/profile-first-screenshot-restore.css';
 assert.equal(index.split(restored).length-1,1);
 assert.ok(index.indexOf(first)>0&&index.indexOf(restored)>index.indexOf(first));
 assert.ok(index.indexOf(last)>index.indexOf(restored));
});

test('V1425: Competición vuelve al azul oscuro también en la cabecera',()=>{
 assert.match(css,/V1425 · Fondo AZUL OSCURO de Competición/);
 assert.match(css,/body\[data-app-route="competition"\] :is\(/);
 assert.match(css,/#app > \.topbar/);
 assert.match(css,/\.app-shell > \.topbar/);
 assert.match(css,/\.ljr-scroll-header/);
 assert.match(css,/linear-gradient\(180deg,#172877 0%,#0b1261 52%,#06074b 100%\)/);
 assert.match(css,/body\[data-app-route="competition"\] #screen\{/);
 assert.match(css,/background-color:#06064a!important/);
 assert.match(css,/body\[data-app-route="competition"\] #screen \.v12-bracket-reference/);
 assert.match(css,/background-color:#050547!important/);
 assert.match(css,/body\[data-app-route="competition"\] #screen>\.tabs/);
 assert.doesNotMatch(css,/<script|pointer-events\s*:\s*none|display\s*:\s*none/i);
});
