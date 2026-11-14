import {cargoExecutable} from './cargo-path.mjs';
// One-shot builds and independently supervised development processes. No trust installation.
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const [command,...args]=process.argv.slice(2),opts={};
const allowed=['--workspace','--cert','--key','--ca','--frontend-port','--backend-port','--backend','--build-number'];
for(let i=0;i<args.length;i++){if(['--mock','--create'].includes(args[i]))opts[args[i].slice(2)]=true;else if(allowed.includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--'))opts[args[i].slice(2)]=args[++i];else throw Error('Unknown/missing option: '+args[i]);}
const run=(program,arguments_,env={})=>new Promise((yes,no)=>{const child=spawn(program,arguments_,{cwd:root,stdio:'inherit',env:{...process.env,...env}});child.once('error',no);child.once('exit',code=>code===0?yes():no(Error(program+' exited '+code)));});
function port(value,fallback){const n=Number(value??fallback);if(!Number.isInteger(n)||n<1024||n>65535)throw Error('Ports must be integers from 1024 to 65535');return String(n);}
const frontendPort=port(opts['frontend-port']??process.env.HPX_FRONTEND_PORT,3000),backendPort=port(opts['backend-port']??process.env.HPX_BACKEND_PORT,8000);
const frontendArgs=()=>['frontend/scripts/dev.mjs','--port',frontendPort,...(opts.mock?['--mock']:['--backend',opts.backend??'https://127.0.0.1:'+backendPort]),...['cert','key','ca'].flatMap(name=>opts[name]?['--'+name,resolve(opts[name])]:[])];
if(command==='build'){
 const number=String(opts['build-number']??'1');if(!/^[1-9][0-9]{0,15}$/.test(number))throw Error('Build number must be a positive integer with at most 16 digits');
 await run('npm',['--prefix','frontend','ci','--ignore-scripts','--no-audit','--no-fund']);
 await run('cargo',['fetch','--locked']);
  await run('npm',['--prefix','frontend','run','api:check']);
 await run('npm',['--prefix','frontend','run','build']);
 await run('cargo',['build','--release','--locked','-p','hypergraph-runtime','--bin','hypergraph'],{HPX_RELEASE_BUILD_NUMBER:number});
 console.log('Self-contained executable: '+cargoExecutable({profile:'release'})+' (embedded frontend, no Node runtime).');
}else if(['frontend','backend','dev'].includes(command)){
 if(command==='dev'&&opts.mock)throw Error('Use dev:mock to run without a backend');
 if(command!=='frontend'&&(!opts.workspace||!opts.cert||!opts.key))throw Error('Backend requires --workspace, --cert and --key; workspace creation additionally requires --create');
 if(command==='dev'&&frontendPort===backendPort)throw Error('Development ports must differ');
 if(!opts.mock&&command!=='backend'&&(!opts.cert||!opts.key))throw Error('Connected frontend requires --cert and --key (and --ca if backend trust is not in Node); use --mock for fixtures');
 const children=[];let stopping=false;
 async function stop(code=0){if(stopping)return;stopping=true;for(const child of children)if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');const timer=setTimeout(()=>{for(const child of children)if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');},3000);timer.unref();await Promise.all(children.map(child=>child.exitCode!==null||child.signalCode!==null?Promise.resolve():new Promise(resolve=>child.once('exit',resolve))));clearTimeout(timer);process.exitCode=code;}
 function start(program,arguments_,capture=false){const child=spawn(program,arguments_,{cwd:root,env:process.env,stdio:capture?['inherit','pipe','inherit']:'inherit'});children.push(child);if(capture){let buffered='';child.stdout.on('data',data=>{process.stdout.write(data);buffered+=data;const match=buffered.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=([a-f0-9]+)/);if(match){console.log(`Development launch (private): https://127.0.0.1:${frontendPort}/#launch=${match[1]}`);buffered='';}});}child.once('error',error=>{console.error(error.message);void stop(1);});child.once('exit',code=>{if(!stopping)void stop(code??1);});return child;}
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>void stop());
 if(command!=='frontend')start('cargo',['run','--locked','-p','hypergraph-runtime','--bin','hypergraph','--features','dev-backend','--','--workspace',resolve(opts.workspace),'--cert',resolve(opts.cert),'--key',resolve(opts.key),'--port',backendPort,...(opts.create?['--create']:[])],command==='dev');
 if(command!=='backend')start(process.execPath,frontendArgs());
}else throw Error('Usage: node shared/tooling/hpx.mjs frontend|backend|dev|build [options]. See docs/09-guides/developers/repository-development.md');
