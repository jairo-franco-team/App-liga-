import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { rosterGroups, monthIndicator } from '../src/v839-reference-data.js';

const normKey = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

test('roster cards preserve every official player and their published position', async () => {
  const db = JSON.parse(await readFile(new URL('../public/data/official-live.json', import.meta.url)));
  for (const category of Object.values(db.categories)) {
    for (const [team, names] of Object.entries(category.rosters)) {
      const players = rosterGroups(category, team).flatMap(group => group.players);
      assert.equal(players.length, new Set(names.map(name => normKey(name))).size, team);
      assert.deepEqual(new Set(players.map(player => normKey(player.name))), new Set(names.map(name => normKey(name))), team);
      for (const player of players) assert.ok(!player.number || /^\d{1,3}$/.test(player.number));
    }
  }
});

test('month indicator keeps the active dot aligned with the visible calendar month', () => {
  const months = [
    { key: '2026-08', label: 'Agosto 2026' },
    { key: '2026-09', label: 'Septiembre 2026' },
    { key: '2026-10', label: 'Octubre 2026' }
  ];
  assert.deepEqual(monthIndicator(months, 0), { index: 0, total: 3, dots: [true, false, false] });
  assert.deepEqual(monthIndicator(months, 2), { index: 2, total: 3, dots: [false, false, true] });
  assert.deepEqual(monthIndicator(months, 9), { index: 2, total: 3, dots: [false, false, true] });
});

test('calendar reference stylesheet stays wired after legacy calendar overrides', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/v839-calendar-reference.css', import.meta.url), 'utf8');
  assert.ok(html.lastIndexOf('v839-calendar-reference.css') > html.lastIndexOf('v817-calendar-reference-restore.css'));
  assert.match(css, /data-app-route="calendar"[\s\S]*\.v415-cal-hero\s*\{[\s\S]*display:\s*none\s*!important/);
  assert.match(css, /\.v415-roster-card-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});
