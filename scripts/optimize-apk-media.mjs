// Build-only copies. Originals, published web artwork and every local URL survive.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const directory=path.resolve(process.argv[2]||'dist');
const hash=b=>createHash('sha256').update(b).digest('hex');
async function list(dir){const all=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())all.push(...await list(f));else if(e.isFile()&&/\.(webp|jpe?g|png)$/i.test(f))all.push(f)}return all}
const cache=new Map(),changes=[];
for(const file of await list(directory)){
 const original=await fs.readFile(file);if(original.length<120000)continue;
 const name=path.relative(directory,file),digest=hash(original);
 let result=cache.get(digest);
 if(!result){
  const meta=await sharp(original).metadata();
  // Never flatten animation, upsample, clip/crop, or compress the app icon.
  if((meta.pages||1)>1||/app-icon|icon\.png$/.test(name))continue;
  const limit=/season-2026|official-logos|\/teams\//.test(name)?768:1600;
  const job=sharp(original).rotate().resize({width:limit,height:limit,fit:'inside',withoutEnlargement:true});
  const ext=path.extname(file).toLowerCase();
  const encoded=await (ext==='.webp'?job.webp({quality:86,alphaQuality:100,effort:5}):ext==='.png'?job.png({compressionLevel:9}):job.jpeg({quality:87,mozjpeg:true})).toBuffer();
  const after=await sharp(encoded).metadata();
  if(meta.hasAlpha&&!after.hasAlpha)throw Error('Lost transparency: '+name);
  result=encoded.length<original.length*.9?{bytes:encoded,width:after.width,height:after.height}:null;cache.set(digest,result);
 }
 if(!result)continue;
 await fs.writeFile(file,result.bytes);changes.push({path:name,before:original.length,after:result.bytes.length,width:result.width,height:result.height,originalSHA256:digest});
}
const report={files:changes.length,savedBytes:changes.reduce((sum,x)=>sum+x.before-x.after,0),changes};
await fs.writeFile('android-media-optimization.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({files:report.files,savedBytes:report.savedBytes}));
