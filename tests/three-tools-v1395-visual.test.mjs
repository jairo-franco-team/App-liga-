import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/v1395-admin-three-tools-night-polish.css', import.meta.url), 'utf8');

test('V1395 se carga una sola vez y después de los overrides previos', () => {
  const marker = 'src/v1395-admin-three-tools-night-polish.css';
  assert.equal(page.split(marker).length - 1, 1);
  assert.ok(page.indexOf(marker) > page.indexOf('v1386-admin-dialog-consistency.css'));
  assert.ok(page.indexOf(marker) > page.indexOf('v1195-credential-page-blue-harmony.css'));
  assert.ok(page.indexOf(marker) > page.indexOf('v1003-agenda-compact-premium.css'));
  assert.ok(page.indexOf(marker) > page.indexOf('v1175-sponsors-blue-unified.css'));
});

test('V1395 mantiene aisladas las tres pantallas sin cambiar scripts ni rutas', () => {
  assert.match(styles, /body\[data-app-route="credentialBuilder"\]/);
  assert.match(styles, /body\[data-app-route="agendaBuilder"\]/);
  assert.match(styles, /\.v105-modal\.v105-sponsors-modal/);
  assert.doesNotMatch(styles, /<script|@import|display\s*:\s*none|pointer-events\s*:\s*none/i);
});

test('Patrocinadores conserva estados seleccionados, filtros y formato de impresión', () => {
  assert.match(styles, /@media screen\s*\{/);
  assert.match(styles, /\.sp-tabs button\[aria-selected="true"\]/);
  assert.match(styles, /\.sp-btn\.sp-primary/);
  assert.match(styles, /\.sp-search input\[type=search\]/);
  assert.doesNotMatch(styles, /sp-printing|@media print/);
});

test('Credenciales y agenda mantienen controles interactivos y accesibilidad', () => {
  assert.match(styles, /\.v1005-step-grid>button/);
  assert.match(styles, /\.registration-capture \.capture-actions>button:not\(:disabled\)/);
  assert.match(styles, /\.v159-picker\[data-v159-picker="team"\]/);
  assert.match(styles, /\.v159-picker\[data-v159-picker="field"\]/);
  assert.match(styles, /focus-visible/);
  assert.match(styles, /prefers-reduced-motion/);
});
