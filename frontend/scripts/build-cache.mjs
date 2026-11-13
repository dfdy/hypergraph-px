// Local generated assets only. Content checks are cache validity, not test acceptance.
import {createHash,randomUUID} from 'node:crypto';
import {readdir,readFile,writeFile,mkdir,mkdtemp,rename,rm,cp} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
export const root=resolve(import.meta.dirname,'../..');
export const frontend=join(root,'frontend');
export async function filesUnder(directory){
 const result=[];
 async function walk(path){for(const entry of (await readdir(path,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){if(entry.name==='.bin')continue;const file=join(path,entry.name);if(entry.isSymbolicLink())throw Error('Build inputs/outputs must not contain symlinks: '+relative(root,file));if(entry.isDirectory())await walk(file);else if(entry.isFile())result.push(file);}}
 await walk(directory);return result;
}
export async function hashFiles(files){
 const hash=createHash('sha256');for(const file of [...files].sort()){hash.update(relative(root,file));hash.update('\0');hash.update(createHash('sha256').update(await readFile(file)).digest());}return hash.digest('hex');
}
export async function assetDigest(directory){
 const hash=createHash('sha256');for(const file of await filesUnder(directory)){hash.update(relative(directory,file));hash.update('\0');hash.update(createHash('sha256').update(await readFile(file)).digest());}return hash.digest('hex');
}
export async function inputIdentity(){
 const files=[...await filesUnder(join(frontend,'src')),...await filesUnder(join(root,'legal/upstream-notices')),...await filesUnder(join(frontend,'node_modules')),...['frontend/index.html','frontend/styles.css','frontend/package.json','frontend/package-lock.json','frontend/build.mjs','frontend/scripts/build-cache.mjs','docs/assets/logo.png','LICENSE'].map(p=>join(root,p))];
 return createHash('sha256').update(process.version+'\0'+process.platform+'\0'+process.arch+'\0'+await hashFiles(files)).digest('hex');
}
export async function validEntry(directory,source){
 try{const record=JSON.parse(await readFile(join(directory,'manifest.json'),'utf8'));return record.source===source&&record.assets===await assetDigest(join(directory,'assets'))?record:null;}catch{return null;}
}
export async function cachedBuild(build){
 const start=performance.now(),source=await inputIdentity(),cache=join(root,'.verification/frontend-assets');await mkdir(cache,{recursive:true});const entry=join(cache,source);
 let record=await validEntry(entry,source),cached=!!record;
 if(!record){
  const temporary=await mkdtemp(join(cache,'.building-'));
  try{
   await build(join(temporary,'assets'));
   if(await inputIdentity()!==source)throw Error('Frontend inputs changed during build; no valid snapshot published');
   record={source,assets:await assetDigest(join(temporary,'assets')),node:process.version};await writeFile(join(temporary,'manifest.json'),JSON.stringify(record)+'\n');
   try{await rename(temporary,entry);}catch(error){
    if(!['EEXIST','ENOTEMPTY'].includes(error.code))throw error;
    if(!await validEntry(entry,source)){const quarantine=join(cache,'.invalid-'+randomUUID());await rename(entry,quarantine);await rename(temporary,entry);await rm(quarantine,{recursive:true,force:true});}
   }
  }finally{await rm(temporary,{recursive:true,force:true});}
 }
 return {...record,directory:join(entry,'assets'),cached,seconds:(performance.now()-start)/1000};
}
export async function installDist(snapshot){
 const dist=join(frontend,'dist');try{if(await assetDigest(dist)===snapshot.assets)return false;}catch{}
 const lock=join(root,'.verification/frontend-dist.lock');await mkdir(lock).catch(error=>{if(error.code==='EEXIST')throw Error('Another frontend dist update is active; serialize shared-output builds');throw error;});
 try{await rm(dist,{recursive:true,force:true});await cp(snapshot.directory,dist,{recursive:true});if(await assetDigest(dist)!==snapshot.assets)throw Error('Installed frontend assets failed content verification');}finally{await rm(lock,{recursive:true,force:true});}return true;
}
