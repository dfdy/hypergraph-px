import {build} from 'esbuild';
import {mkdir,copyFile,cp,readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {cachedBuild,installDist,frontend} from './scripts/build-cache.mjs';
export async function buildFrontend({snapshotOnly=false}={}){
 const file=path=>resolve(frontend,path);
 const snapshot=await cachedBuild(async output=>{
  await mkdir(resolve(output,'vendor/katex'),{recursive:true});await mkdir(resolve(output,'assets'),{recursive:true});
  await copyFile(file('../docs/assets/logo.png'),resolve(output,'assets/logo.png'));
  await build({absWorkingDir:frontend,entryPoints:['src/app.js'],bundle:true,format:'esm',minify:true,outfile:resolve(output,'app.js'),legalComments:'linked'});
  const version=JSON.parse(await readFile(file('package.json'),'utf8')).version+'.0';
  await writeFile(resolve(output,'index.html'),(await readFile(file('index.html'),'utf8')).replace('Version pending','v'+version));
  await writeFile(resolve(output,'build-version.json'),JSON.stringify({version})+'\n');
  await copyFile(file('styles.css'),resolve(output,'styles.css'));
  await copyFile(file('node_modules/katex/dist/katex.min.css'),resolve(output,'vendor/katex/katex.min.css'));
  await cp(file('node_modules/katex/dist/fonts'),resolve(output,'vendor/katex/fonts'),{recursive:true});
  const lock=JSON.parse(await readFile(file('package-lock.json'),'utf8')),notices=['Hypergraph PX frontend: AGPL-3.0-only. See LICENSE.'];
  for(const [name,entry] of Object.entries(lock.packages)){if(!name)continue;let files=[];try{files=await readdir(file(name));}catch{continue;}for(const license of files.filter(f=>/^(license|copying)(\.|$)/i.test(f)))notices.push(`\n${name} ${entry.version} (${entry.license})\n${await readFile(file(`${name}/${license}`),'utf8')}`);}
  for(const name of (await readdir(file('../legal/upstream-notices'))).filter(n=>n.endsWith('-LICENSE')).sort())notices.push('\n'+name+'\n'+await readFile(file('../legal/upstream-notices/'+name),'utf8'));
  await writeFile(resolve(output,'THIRD_PARTY_NOTICES.txt'),notices.join('\n'));await copyFile(file('../LICENSE'),resolve(output,'LICENSE'));
 });
 return {...snapshot,installed:snapshotOnly?false:await installDist(snapshot)};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const result=await buildFrontend();console.log((result.cached?'Reused verified':'Built')+' static frontend in frontend/dist (source '+result.source.slice(0,12)+', '+result.seconds.toFixed(3)+'s)');}
