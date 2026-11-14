// Cargo metadata is authoritative for output roots,including environment/config overrides.
import {execFileSync} from 'node:child_process';
import {resolve,join,basename} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
export const repositoryRoot=resolve(fileURLToPath(new URL('../..',import.meta.url)));
export function cargoTargetDirectory({root=repositoryRoot,env=process.env,execute=execFileSync}={}){
 const data=JSON.parse(execute('cargo',['metadata','--format-version','1','--no-deps','--locked','--offline'],{cwd:root,env,encoding:'utf8'}));
 if(typeof data.target_directory!=='string'||!data.target_directory)throw Error('Cargo metadata lacks target_directory');
 return resolve(root,data.target_directory);
}
export function cargoExecutable({profile='debug',name='hypergraph',example=false,env=process.env,target=env.CARGO_BUILD_TARGET,...options}={}){
 const directory=cargoTargetDirectory({...options,env});
 const targetFolder=target?(target.endsWith('.json')?basename(target,'.json'):target):'';
 if(!/^[a-zA-Z0-9_-]+$/.test(profile)||!name||name.includes('/')||name.includes('\\'))throw Error('Invalid Cargo executable/profile');
 return join(directory,targetFolder,profile,example?'examples':'',name+(process.platform==='win32'?'.exe':''));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2),options={};
 for(let i=0;i<args.length;i++){if(['--profile','--name','--target'].includes(args[i])&&args[i+1])options[args[i].slice(2)]=args[++i];else throw Error('Usage: cargo-path.mjs [--profile debug|release] [--name hypergraph] [--target triple]');}
 console.log(cargoExecutable(options));
}
