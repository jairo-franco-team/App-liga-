import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const script = new URL('../native/android/prepare-assets.mjs', import.meta.url).pathname;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'liga-android-assets-'));
  const publicDir = path.join(root, 'android/app/src/main/assets/public');
  const javaDir = path.join(root, 'android/app/src/main/java/mx/ligajuventino/app');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(javaDir, { recursive: true });
  fs.writeFileSync(path.join(javaDir, 'MainActivity.java'), 'class MainActivity { void onCreate() { super.onCreate(savedInstanceState); } }');
  fs.writeFileSync(path.join(javaDir, 'LigaNotificationsPlugin.java'), 'class LigaNotificationsPlugin { void read() { getContext().getAssets().open("public/" + localPath); } }');
  const files = {
    'index.html': '<script src="assets/app.js"></script><img src="assets/photo-abcd1234.png?v=2">',
    'assets/app.js': 'const history="assets/history/"; const crest="assets/season/team.png"; fetch(history + "same.png")',
    'assets/styles.css': 'body {background:url("./photo-abcd1234.png")}',
    'assets/photo-abcd1234.png': Buffer.from('unchanged original image bytes'),
    'assets/history/same.png': Buffer.from('unchanged original image bytes'),
    'assets/season/team.png': Buffer.from('unchanged original image bytes'),
    'assets/different.png': Buffer.from('different photo with equal extension'),
    'assets/different-format.jpg': Buffer.from('unchanged original image bytes'),
    'assets/video.mp4': Buffer.from('original video range bytes'),
    'assets/video-copy.mp4': Buffer.from('original video range bytes'),
    'icons/logo.png': Buffer.from('unchanged original image bytes'),
  };
  for (const [name, bytes] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(publicDir, name)), { recursive: true });
    fs.writeFileSync(path.join(publicDir, name), bytes);
  }
  return { root, publicDir, javaDir, files };
}

function run(root, ...extra) {
  return spawnSync(process.execPath, [script, '--project', root, ...extra], { encoding: 'utf8' });
}

test('all original URLs retain identical bytes while only redundant image bytes leave the APK', () => {
  const f = fixture();
  try {
    const result = run(f.root);
    assert.equal(result.status, 0, result.stderr);
    const aliases = JSON.parse(fs.readFileSync(path.join(f.publicDir, '../liga-asset-aliases.json')));
    const report = JSON.parse(fs.readFileSync(path.join(f.root, 'android-asset-report.json')));
    for (const [name, bytes] of Object.entries(f.files)) {
      const target = aliases[name] || name;
      assert.equal(hash(fs.readFileSync(path.join(f.publicDir, target))), hash(bytes), name);
      assert.equal(path.extname(target), path.extname(name), `MIME extension retained: ${name}`);
    }
    assert.equal(Object.keys(aliases).length, 3);
    assert.ok(fs.existsSync(path.join(f.publicDir, 'assets/photo-abcd1234.png')), 'initial Vite CSS/image URL survives before native bridge startup completes');
    for (const name of ['index.html', 'assets/app.js', 'assets/styles.css', 'assets/different.png', 'assets/different-format.jpg', 'assets/video.mp4', 'assets/video-copy.mp4']) {
      assert.ok(fs.existsSync(path.join(f.publicDir, name)), name);
    }
    assert.equal(report.savedMediaBytes, Buffer.byteLength(f.files['icons/logo.png']) * 3);
    const activity = fs.readFileSync(path.join(f.javaDir, 'MainActivity.java'), 'utf8');
    assert.ok(activity.indexOf('LigaAssetAliases.install(this, bridgeBuilder)') < activity.indexOf('super.onCreate(savedInstanceState)'), 'alias routing installed before app load');
    assert.match(fs.readFileSync(path.join(f.javaDir, 'LigaNotificationsPlugin.java'), 'utf8'), /LigaAssetAliases\.open\(getContext\(\), localPath\)/);
    // A repeated packaging invocation must retain its complete original inventory.
    assert.equal(run(f.root).status, 0);
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.root, 'android-asset-report.json'))).beforeBytes, report.beforeBytes);
  } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
});

test('packaging fails when any previously inventoried runtime URL becomes missing or changes bytes', () => {
  for (const corruption of ['missing', 'changed']) {
    const f = fixture();
    try {
      assert.equal(run(f.root).status, 0);
      const aliases = JSON.parse(fs.readFileSync(path.join(f.publicDir, '../liga-asset-aliases.json')));
      const target = aliases['assets/history/same.png'] || 'assets/history/same.png';
      if (corruption === 'missing') fs.unlinkSync(path.join(f.publicDir, target));
      else fs.writeFileSync(path.join(f.publicDir, target), 'corrupted media');
      const result = run(f.root, '--verify-only');
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Missing Android asset|Changed Android asset/);
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  }
});

test('unexpected native generated code aborts before deleting any asset', () => {
  const f = fixture();
  try {
    fs.writeFileSync(path.join(f.javaDir, 'LigaNotificationsPlugin.java'), 'unrecognized native asset loader');
    const result = run(f.root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Native notification asset loader/);
    for (const name of Object.keys(f.files)) assert.ok(fs.existsSync(path.join(f.publicDir, name)), name);
  } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
});

test('final APK verification measures ZIP bytes and rejects missing or corrupted reachable media', () => {
  const verifier = new URL('../native/android/verify-apk-assets.py', import.meta.url).pathname;
  for (const corruption of ['none', 'missing', 'changed', 'padded']) {
    const f = fixture();
    try {
      const baseline = path.join(f.root, 'baseline.apk');
      const apk = path.join(f.root, 'optimized.apk');
      if (corruption === 'padded') {
        for (const name of ['assets/photo-abcd1234.png', 'assets/history/same.png', 'assets/season/team.png', 'icons/logo.png']) {
          fs.writeFileSync(path.join(f.publicDir, name), Buffer.alloc(700_000, 42));
        }
      }
      const zip = String.raw`
import pathlib, sys, zipfile
root, output, corruption = sys.argv[1:]
if corruption == 'padded': pathlib.Path(output).write_bytes(b'\0' * 2_000_000)
with zipfile.ZipFile(output, 'a' if corruption == 'padded' else 'w', compression=zipfile.ZIP_STORED) as archive:
    archive.writestr('classes.dex', b'fixture native code')
    for file in pathlib.Path(root).rglob('*'):
        if not file.is_file(): continue
        name = 'assets/' + file.relative_to(root).as_posix()
        if corruption == 'missing' and name == 'assets/public/assets/different.png': continue
        data = file.read_bytes()
        if corruption == 'changed' and name == 'assets/public/assets/different.png': data = b'corrupted original image'
        archive.writestr(name, data)
`;
      let result = spawnSync('python', ['-c', zip, path.join(f.publicDir, '..'), baseline, 'none'], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(run(f.root).status, 0);
      result = spawnSync('python', ['-c', zip, path.join(f.publicDir, '..'), apk, corruption], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      result = spawnSync('python', [verifier, '--apk', apk, '--baseline', baseline, '--report', path.join(f.root, 'android-asset-report.json')], { encoding: 'utf8' });
      if (corruption === 'none') {
        assert.equal(result.status, 0, result.stderr);
        const report = JSON.parse(fs.readFileSync(path.join(f.root, 'android-asset-report.json')));
        assert.equal(report.optimizedApkBytes, fs.statSync(apk).size);
        assert.equal(report.savedApkBytes, fs.statSync(baseline).size - fs.statSync(apk).size);
        assert.equal(report.verifiedApkPublicBytes, report.afterPublicBytes);
      } else {
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Missing Android asset|Changed Android asset|retained incremental ZIP padding/);
      }
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  }
});
