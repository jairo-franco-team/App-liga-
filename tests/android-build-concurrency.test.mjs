import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const yaml=readFileSync(new URL('../.github/workflows/android-debug.yml',import.meta.url),'utf8');

test('Android: no cancelar builds activos cuando llegan nuevas publicaciones',()=>{
 const section=yaml.match(/^concurrency:\n([\s\S]*?)\n\njobs:/m)?.[1]||'';
 assert.match(section,/cancel-in-progress:\s*false/,'La APK debe poder terminar');
 assert.match(section,/group: android-debug-/,'Mantener cola por rama');
 assert.match(section,/github\.event_name == 'workflow_dispatch'/,'La compilación manual conserva grupo independiente');
 assert.match(yaml,/name: Upload APK artifact/);
 assert.match(yaml,/name: Publish stable APK download/);
});
