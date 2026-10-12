// Android generated assets only: retain all web URLs while storing identical images once.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.avif']);

function filesUnder(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) return filesUnder(path.join(directory, entry.name), relative + '/');
    if (!entry.isFile()) throw new Error('Unsupported Android asset entry: ' + relative);
    return [relative];
  });
}

export function auditAssets(publicDir) {
  const inventory = {};
  const groups = new Map();
  for (const name of filesUnder(publicDir)) {
    const bytes = fs.readFileSync(path.join(publicDir, name));
    inventory[name] = { bytes: bytes.length, sha256: digest(bytes) };
    const extension = path.extname(name).toLowerCase();
    if (!imageExtensions.has(extension)) continue;
    const key = extension + ':' + inventory[name].sha256;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(name);
  }
  const aliases = {};
  let savedMediaBytes = 0;
  let savedDeflatedMediaBytes = 0;
  for (const names of groups.values()) {
    // Keep Vite's initial CSS/image requests physical, even during Bridge startup.
    // Dynamic stable paths remain available through exact-byte aliases.
    names.sort((a, b) => Number(/-[\w-]{8}\.[^.]+$/.test(b)) - Number(/-[\w-]{8}\.[^.]+$/.test(a)) || a.localeCompare(b));
    for (const name of names.slice(1)) {
      aliases[name] = names[0];
      savedMediaBytes += inventory[name].bytes;
      savedDeflatedMediaBytes += deflateRawSync(fs.readFileSync(path.join(publicDir, name)), { level: 6 }).length;
    }
  }
  const beforeBytes = Object.values(inventory).reduce((total, file) => total + file.bytes, 0);
  return { beforeBytes, afterPublicBytes: beforeBytes - savedMediaBytes, savedMediaBytes, savedDeflatedMediaBytes, originalFileCount: Object.keys(inventory).length, removedFileCount: Object.keys(aliases).length, aliases, inventory };
}

export function verifyAssets(publicDir, report, aliases) {
  for (const [name, original] of Object.entries(report.inventory)) {
    const canonical = aliases[name] || name;
    if (aliases[canonical]) throw new Error('Chained Android asset alias: ' + name);
    if (path.extname(canonical).toLowerCase() !== path.extname(name).toLowerCase()) throw new Error('Android alias MIME mismatch: ' + name);
    const target = path.resolve(publicDir, canonical);
    if (!target.startsWith(path.resolve(publicDir) + path.sep)) throw new Error('Unsafe Android asset path: ' + name);
    if (!fs.existsSync(target)) throw new Error('Missing Android asset: ' + name + ' -> ' + canonical);
    const bytes = fs.readFileSync(target);
    if (bytes.length !== original.bytes || digest(bytes) !== original.sha256) throw new Error('Changed Android asset: ' + name);
  }
}

export function prepareAssets(projectRoot, { verifyOnly = false } = {}) {
  const assetsDir = path.join(projectRoot, 'android/app/src/main/assets');
  const publicDir = path.join(assetsDir, 'public');
  const aliasFile = path.join(assetsDir, 'liga-asset-aliases.json');
  const reportFile = path.join(projectRoot, 'android-asset-report.json');
  if (verifyOnly || fs.existsSync(aliasFile)) {
    const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    verifyAssets(publicDir, report, JSON.parse(fs.readFileSync(aliasFile, 'utf8')));
    return report;
  }
  const javaDir = path.join(projectRoot, 'android/app/src/main/java/mx/ligajuventino/app');
  const activityFile = path.join(javaDir, 'MainActivity.java');
  const notificationFile = path.join(javaDir, 'LigaNotificationsPlugin.java');
  let activity = fs.readFileSync(activityFile, 'utf8');
  let notification = fs.readFileSync(notificationFile, 'utf8');
  const activityAnchor = 'super.onCreate(savedInstanceState);';
  const notificationAnchor = 'getContext().getAssets().open("public/" + localPath)';
  if (activity.split(activityAnchor).length !== 2) throw new Error('Native activity asset installer anchor changed');
  if (notification.split(notificationAnchor).length !== 2) throw new Error('Native notification asset loader changed');
  // Fail before deleting anything if the native installer cannot preserve every URL.
  const report = auditAssets(publicDir);
  for (const name of [...Object.keys(report.aliases), ...Object.values(report.aliases)]) {
    if (!/^[a-zA-Z0-9_./ -]+$/.test(name) || name.split('/').includes('..')) throw new Error('Unsupported Android alias filename: ' + name);
  }
  activity = activity.replace(activityAnchor, 'LigaAssetAliases.install(this, bridgeBuilder);\n        ' + activityAnchor);
  notification = notification.replace(notificationAnchor, 'LigaAssetAliases.open(getContext(), localPath)');
  fs.copyFileSync(new URL('./LigaAssetAliases.java', import.meta.url), path.join(javaDir, 'LigaAssetAliases.java'));
  fs.writeFileSync(activityFile, activity);
  fs.writeFileSync(notificationFile, notification);
  const aliasText = JSON.stringify(report.aliases);
  fs.writeFileSync(aliasFile, aliasText);
  report.aliasManifestBytes = Buffer.byteLength(aliasText);
  report.afterAssetBytes = report.afterPublicBytes + report.aliasManifestBytes;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
  for (const name of Object.keys(report.aliases)) fs.unlinkSync(path.join(publicDir, name));
  verifyAssets(publicDir, report, report.aliases);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const projectIndex = args.indexOf('--project');
  const report = prepareAssets(path.resolve(projectIndex < 0 ? '.' : args[projectIndex + 1]), { verifyOnly: args.includes('--verify-only') });
  console.log(JSON.stringify({ beforeBytes: report.beforeBytes, afterAssetBytes: report.afterAssetBytes, savedMediaBytes: report.savedMediaBytes, savedDeflatedMediaBytes: report.savedDeflatedMediaBytes, originalFileCount: report.originalFileCount, removedFileCount: report.removedFileCount }));
}
