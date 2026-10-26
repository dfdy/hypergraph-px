import {build} from 'esbuild';
import {mkdir,copyFile,cp,readFile,writeFile,readdir} from 'node:fs/promises';
await mkdir('dist/vendor/katex',{recursive:true});
await mkdir('dist/assets',{recursive:true});
await copyFile('../docs/assets/logo.png','dist/assets/logo.png');
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',minify:true,outfile:'dist/app.js',legalComments:'linked'});
for(const file of ['index.html','styles.css'])await copyFile(file,`dist/${file}`);
await copyFile('node_modules/katex/dist/katex.min.css','dist/vendor/katex/katex.min.css');
await cp('node_modules/katex/dist/fonts','dist/vendor/katex/fonts',{recursive:true});
const lock=JSON.parse(await readFile('package-lock.json','utf8'));const notices=['Hypergraph PX frontend: AGPL-3.0-only. See LICENSE.'];
for(const [name,entry] of Object.entries(lock.packages)){if(!name)continue;let files=[];try{files=await readdir(name);}catch{continue;}for(const file of files.filter(f=>/^(license|copying)(\.|$)/i.test(f))){notices.push(`\n${name} ${entry.version} (${entry.license})\n${await readFile(`${name}/${file}`,'utf8')}`);}}
await writeFile('dist/THIRD_PARTY_NOTICES.txt',notices.join('\n'));
await copyFile('../LICENSE','dist/LICENSE');
console.log('Built static frontend in frontend/dist');
