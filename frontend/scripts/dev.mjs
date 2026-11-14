import {watch} from 'node:fs';
import {resolve} from 'node:path';
import {buildFrontend} from '../build.mjs';
import {createDevelopmentServer} from './dev-server.mjs';
import {frontend,root,isSharedBrowserInput} from './build-cache.mjs';
export function options(args){const result={};for(let i=0;i<args.length;i++){const arg=args[i];if(arg==='--mock')result.mock=true;else if(['--port','--backend','--cert','--key','--ca'].includes(arg)){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing value for '+arg);result[arg.slice(2)]=args[++i];}else throw Error('Unknown frontend option: '+arg);}return result;}
const opts=options(process.argv.slice(2));
let snapshot=await buildFrontend({snapshotOnly:true});
const service=await createDevelopmentServer({...opts,port:Number(opts.port??process.env.HPX_FRONTEND_PORT??3000),assets:()=>snapshot.directory});
console.log(`HPX frontend: ${service.url} (${opts.mock?'synthetic tab-only mock; no backend':'verified HTTPS API proxy'})`);
console.log('Source changes rebuild assets; reload deliberately to avoid discarding an owned editing buffer.');
let timer,pending=false,rebuilding=false;
async function rebuild(){if(rebuilding){pending=true;return;}rebuilding=true;try{snapshot=await buildFrontend({snapshotOnly:true});console.log('Frontend rebuilt; reload when ready.');}catch(error){console.error('Frontend rebuild failed; previous assets retained:',error.message);}finally{rebuilding=false;if(pending){pending=false;void rebuild();}}}
const watcher=watch(frontend,{recursive:true},(_event,name)=>{if(!name||!(/^(src\/|index\.html$|styles\.css$|build\.mjs$)/.test(name)))return;clearTimeout(timer);timer=setTimeout(()=>void rebuild(),100);});
const changed=()=>{clearTimeout(timer);timer=setTimeout(()=>void rebuild(),100);};
const sharedWatcher=watch(resolve(root,'shared'),{recursive:true},(_event,name)=>{if(isSharedBrowserInput(name))changed();});
const legalWatcher=watch(resolve(root,'shared/legal/upstream-notices'),(_event,name)=>{if(typeof name==='string'&&/^[^/]+-LICENSE$/.test(name))changed();});
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{clearTimeout(timer);watcher.close();sharedWatcher.close();legalWatcher.close();await service.close();});
