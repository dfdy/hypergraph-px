// Own immutable assets, OS-assigned loopback port, browser and evidence per run.
import {spawn} from 'node:child_process';
import {mkdir,mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {buildFrontend} from '../build.mjs';
import {root,frontend,filesUnder,hashFiles,inputIdentity,assetDigest} from './build-cache.mjs';
const start=performance.now(),runs=join(root,'artifacts/ui-runs');await mkdir(runs,{recursive:true});
const directory=await mkdtemp(join(runs,'run-'));let server,child,signalReceived=false;
const evidence={kind:'headless-preview',started:new Date().toISOString(),arguments:process.argv.slice(2),status:'incomplete',deployment:'none; preview checks never authorize executable handoff'};
async function stop(process){if(process&&process.exitCode===null&&process.signalCode===null){await new Promise(resolve=>{const timer=setTimeout(()=>process.kill('SIGKILL'),3000);timer.unref();process.once('exit',()=>{clearTimeout(timer);resolve();});process.kill('SIGTERM');});}}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{signalReceived=true;child?.kill(signal);server?.kill(signal);});
try{
 const snapshot=await buildFrontend({snapshotOnly:true});evidence.source=snapshot.source;evidence.asset_sha256=snapshot.assets;evidence.build={cached:snapshot.cached,seconds:snapshot.seconds};
 const tooling=async()=>hashFiles([...['frontend/playwright.config.js','frontend/package.json','frontend/package-lock.json','frontend/server.mjs','frontend/scripts/run-ui.mjs','frontend/scripts/browser-session.mjs'].map(p=>join(root,p)),...await filesUnder(join(frontend,'tests'))]);
 const testSource=await tooling();evidence.test_source_sha256=testSource;
 const previewStart=performance.now();
 server=spawn(process.execPath,['server.mjs'],{cwd:frontend,env:{...process.env,HPX_PREVIEW_ROOT:snapshot.directory,HYPERGRAPH_PREVIEW_PORT:'0'},stdio:['ignore','pipe','pipe']});
 const url=await new Promise((yes,no)=>{let output='';const timeout=setTimeout(()=>no(Error('Isolated preview startup timed out')),15000);server.once('error',error=>{clearTimeout(timeout);no(error);});server.once('exit',()=>{clearTimeout(timeout);no(Error('Isolated preview exited during startup'));});server.stdout.on('data',bytes=>{output+=bytes;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timeout);yes(match[0]);}});});
 evidence.preview_seconds=(performance.now()-previewStart)/1000;evidence.preview=url;
 const testStart=performance.now();
 child=spawn(process.execPath,[join(frontend,'node_modules/@playwright/test/cli.js'),'test',...process.argv.slice(2)],{cwd:frontend,env:{...process.env,HPX_UI_BASE_URL:url,HPX_UI_ARTIFACTS:directory},stdio:'inherit'});
 const code=await new Promise((yes,no)=>{child.once('error',no);child.once('exit',(code)=>yes(code??1));});
 evidence.test_seconds=(performance.now()-testStart)/1000;evidence.exit_code=code;
 try{const report=JSON.parse(await readFile(join(directory,'playwright.json'),'utf8'));evidence.test_stats=report.stats;evidence.failure_category=code?(report.stats?.unexpected?'test-or-fixture; inspect retained report/trace':'runner-or-configuration'):'none';if(code===0&&!((report.stats?.expected??0)+(report.stats?.unexpected??0)+(report.stats?.flaky??0)))throw Error('No tests executed; verification cannot pass');}catch(error){if(code===0)throw error;evidence.failure_category='runner-or-configuration';}
 if(await inputIdentity()!==snapshot.source||await tooling()!==testSource||await assetDigest(snapshot.directory)!==snapshot.assets)throw Error('Inputs/assets changed during verification; passing output is not valid evidence');
 evidence.status=code===0&&!signalReceived?'passed':'failed';process.exitCode=code||Number(signalReceived);
}catch(error){evidence.status='invalid';evidence.error=error.message;process.exitCode=1;console.error('UI verification invalid: '+error.message);}
finally{await stop(child);await stop(server);evidence.total_seconds=(performance.now()-start)/1000;await writeFile(join(directory,'run.json'),JSON.stringify(evidence,null,2)+'\n');console.log('UI run evidence: '+relative(root,join(directory,'run.json')));}
