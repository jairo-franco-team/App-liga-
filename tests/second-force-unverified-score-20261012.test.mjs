import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/official-live.json',import.meta.url),'utf8'));
test('San Antonio FC vs Tavera FC remains pending until the league confirms the result',()=>{
  const rows=(data.categories?.['4']?.fixtures||[]).flatMap(block=>block.rows||[]);
  const match=rows.find(r=>r[2]==='SAN ANTONIO FC'&&r[6]==='TAVERA FC'&&String(r[8]||'').startsWith('10/10/2026'));
  assert.ok(match,'The October 10 Second Force fixture must remain in the official schedule');
  assert.equal(match[3],'-','Home score must remain unconfirmed');
  assert.equal(match[5],'-','Away score must remain unconfirmed');
  assert.match(data.official_weekly_sync?.pending_matches_2026_10_10||/pending/i,/San Antonio FC-Tavera FC 12:00/);
});
