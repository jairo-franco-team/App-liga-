import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const runtime = read('src/desktop-parity-runtime-20261008.js');
const bridge = read('src/desktop-mobile-function-bridge.js');
const shell = read('src/desktop-shell.js');
const sections = read('src/desktop-sections.js');
const html = read('index.html');

test('PC parity scripts remain syntactically valid', () => {
  for (const [path, content] of Object.entries({
    'desktop-parity-runtime-20261008.js': runtime,
    'desktop-mobile-function-bridge.js': bridge,
    'desktop-shell.js': shell,
    'desktop-sections.js': sections
  })) assert.doesNotThrow(() => new vm.Script(content, { filename: path }));
});

test('new PC tools link to existing authorized routes instead of empty pages', () => {
  for (const route of ['publicationCenter', 'jrControl', 'rankings', 'video', 'matchday', 'recruitment', 'weatherFields', 'publications']) {
    assert.ok(runtime.includes('"' + route + '"'), 'missing PC link to ' + route);
  }
  for (const missing of ['"contentStudio"', '"editorVisual"', '"communityGames"', '"registration"']) {
    assert.ok(!runtime.includes(missing), 'nonexistent desktop route ' + missing);
  }
});

test('PC bridge keeps mobile and APK route isolation', () => {
  assert.match(runtime, /\['mobile','apk'\]\.includes\(mode\(\)\)/);
  assert.match(bridge, /\['mobile','apk'\]\.includes\(qs\(\)\.get\('mode'\)\)/);
});

test('suspended Sunday fixtures never count as future PC fixtures or completed results', () => {
  assert.match(bridge, /!x\.played&&!x\.awarded&&!x\.suspended/);
  assert.match(bridge, /x\.suspended\?'SUSPENDIDO'/);
  assert.match(bridge, /x\.awarded\|\|x\.suspended/);
  assert.match(bridge, /\['suspended','Suspendidos'\]/);
  assert.match(shell, /weekend_suspension_2026_10_11/);
  assert.match(sections, /weekend_suspension_2026_10_11/);
});

test('PC browser loads new parity scripts with independent cache versions', () => {
  assert.match(html, /desktop-parity-runtime-20261008\.js\?v=20261012-pc-mobile-parity-v2/);
  assert.match(html, /desktop-mobile-function-bridge\.js\?v=20261012-pc-suspended-v3/);
  assert.match(html, /desktop-shell\.js\?v=20261012-pc-suspended-v2/);
  assert.match(html, /desktop-sections\.js\?v=20261012-pc-suspended-v2/);
});
