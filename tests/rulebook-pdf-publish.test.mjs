import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const reader=readFileSync(new URL('../src/v102-rulebook-preview-fix.js',import.meta.url),'utf8');
const source='docs/Reglamento_Liga_Juventino_Rosas_2026_2027.pdf';
const pdf=readFileSync(new URL('../'+source,import.meta.url));
test('Reglamento 2026–2027 existe como PDF real y publicado en Pages y APK',()=>{
 assert.equal(pdf.subarray(0,5).toString('ascii'),'%PDF-');
 assert.ok(pdf.length>10000);
 assert.ok(vite.includes("'"+source+"', 'dist/"+source+"'"));
 assert.ok(vite.includes("Falta el Reglamento PDF válido en el paquete publicado"));
});
test('Los tres enlaces del reglamento usan una ruta relativa a la aplicación',()=>{
 assert.ok(main.includes("const V60_RULEBOOK='./"+source+"'"));
 assert.ok(reader.includes("const PDF='./"+source+"'"));
 assert.match(main,/href=\"'\+V60_RULEBOOK\+'\" target=\"_blank\"/);
 assert.match(main,/href=\"'\+V60_RULEBOOK\+'\" download=/);
});
