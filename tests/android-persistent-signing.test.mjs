import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Android stable signature is secret-backed and restored before both APK build passes',()=>{
 const y=read('.github/workflows/android-debug.yml');
 assert.match(y,/LJR_ANDROID_DEBUG_KEYSTORE_B64:\s*\$\{\{ secrets\.LJR_ANDROID_DEBUG_KEYSTORE_B64 \}\}/);
 assert.match(y,/base64 --decode > "\$HOME\/\.android\/debug\.keystore"/);
 assert.match(y,/keytool -list -keystore/);
 assert.ok(y.indexOf('Restore optional persistent Android signing keystore')<y.indexOf('Build baseline debug APK'));
 assert.match(y,/LJR_APK_SIGNING_STATUS=persistent debug key/);
 assert.match(y,/LJR_APK_SIGNING_STATUS=temporary debug key/);
 assert.match(y,/Firma APK: \$\{LJR_APK_SIGNING_STATUS:-no verificada\}/);
 assert.doesNotMatch(y,/BEGIN (?:RSA )?PRIVATE KEY/);
});

test('missing secret preserves existing APK build while documenting the signature incompatibility',()=>{
 const y=read('.github/workflows/android-debug.yml');
 const guide=read('docs/android-firma-persistente.md');
 assert.match(y,/if \[\[ -z "\$\{LJR_ANDROID_DEBUG_KEYSTORE_B64:-\}" \]\]; then/);
 assert.ok(y.indexOf('exit 0')<y.indexOf('Build baseline debug APK'));
 assert.match(guide,/INSTALL_FAILED_UPDATE_INCOMPATIBLE/);
 assert.match(guide,/no puede actualizarse/);
 assert.match(guide,/nunca/i);
});
