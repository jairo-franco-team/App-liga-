import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../src/v840-apk-match-notifications.js',import.meta.url),'utf8');
const fragment=source.slice(source.indexOf('function feedMarkup(){'),source.indexOf('\nfunction renderFeed(){'));
test('actual recent-activity feed shows APK refusal instead of an activation prompt',()=>{
 const ctx={inbox:()=>[],Capacitor:{isNativePlatform:()=>true},read:()=>({granted:false,state:'denied'}),PERM:'permission',window:{},readIds:()=>[],view:{type:'all',category:'all',more:false},data:()=>null,MAX_INBOX:28,feedback:'',esc:String};
 runInNewContext(fragment+'\nresult=feedMarkup();',ctx);
 assert.match(ctx.result,/Avisos bloqueados.*Android/);
 assert.match(ctx.result,/Cómo permitir avisos/);
 assert.doesNotMatch(ctx.result,/desde el navegador/);
});
