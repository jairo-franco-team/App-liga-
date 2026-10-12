import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import sharp from 'sharp';import {spawnSync} from 'node:child_process';
test('APK-only media optimization preserves URLs, alpha and aspect ratio, and avoids enlarging small media',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'liga-media-'));
 try{
  const dir=path.join(root,'dist/assets/season-2026');await fs.mkdir(dir,{recursive:true});
  let seed=7;const pixels=Buffer.alloc(1800*1200*4);for(let i=0;i<pixels.length;i++){seed=(seed*1664525+1013904223)>>>0;pixels[i]=i%4===3?128:seed>>>24}
  const big=await sharp(pixels,{raw:{width:1800,height:1200,channels:4}}).webp({lossless:true}).toBuffer();
  await fs.writeFile(path.join(dir,'club.webp'),big);
  const small=await sharp({create:{width:32,height:32,channels:4,background:'#00778877'}}).png().toBuffer();await fs.writeFile(path.join(dir,'small.png'),small);
  const run=spawnSync(process.execPath,[new URL('../scripts/optimize-apk-media.mjs',import.meta.url).pathname,path.join(root,'dist')],{cwd:root,encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  const optimized=await fs.readFile(path.join(dir,'club.webp'));const meta=await sharp(optimized).metadata();assert.equal(meta.width,768);assert.equal(meta.height,512);assert.equal(meta.hasAlpha,true);assert.equal(meta.format,'webp');assert.ok(optimized.length<big.length/2);
  assert.deepEqual(await fs.readFile(path.join(dir,'small.png')),small,'small image remains byte-identical');
  const report=JSON.parse(await fs.readFile(path.join(root,'android-media-optimization.json')));assert.equal(report.files,1);assert.equal(report.savedBytes,big.length-optimized.length);
 }finally{await fs.rm(root,{recursive:true,force:true})}
});
