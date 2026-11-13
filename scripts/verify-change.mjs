// Advisory scope selection plus explicit Tier A execution; never a delivery gate.
import {spawn} from 'node:child_process';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
export function planChanges(files){
 if(!files.length)throw Error('Supply the exact increment with --files; the dirty tree includes unrelated retained work.');
 if(files.some(file=>file.startsWith('/')||file.split('/').includes('..')))throw Error('Paths must be repository-relative.');
 const docs=files.every(p=>p.startsWith('docs/')||['AGENTS.md','README.md','INPUT.md'].includes(p));
 const toolingPaths=new Set(['frontend/build.mjs','frontend/server.mjs','frontend/playwright.config.js','frontend/package.json','frontend/scripts/build-cache.mjs','frontend/scripts/run-ui.mjs','scripts/verify-change.mjs']);
 const tooling=files.every(p=>toolingPaths.has(p)||p.includes('/tests/'));
 const rust=files.some(p=>p.startsWith('crates/'));const proof=files.some(p=>p.startsWith('proofs/')||p.includes('Cargo.lock')||p.endsWith('rust-toolchain.toml'));
 const frontend=files.some(p=>p.startsWith('frontend/'));
 const unknown=files.some(p=>!toolingPaths.has(p)&&!p.startsWith('docs/')&&!p.startsWith('frontend/')&&!p.startsWith('crates/')&&!['AGENTS.md','README.md','INPUT.md'].includes(p));
 const sensitiveTools=files.some(p=>/(manual-runtime|check-runtime|check-keychain|signing|trust)/.test(p));
 const critical=rust||proof||unknown||sensitiveTools||files.some(p=>/package(?:-lock)?\.json$|Cargo\.(?:lock|toml)$|legal\//.test(p));
 const node={label:'Node contracts/tooling',command:['npm','--prefix','frontend','test']};
 const browser={label:'Isolated full headless frontend regression',command:['npm','--prefix','frontend','run','test:ui']};
 const documentation={label:'Documentation and local archive integrity',command:['python3','scripts/verify_documentation.py','--check-local-sources']};
 const focused={label:'Changed presentation interaction (development feedback only)',command:['npm','--prefix','frontend','run','test:ui','--','tests/browser/markdown-presentation.spec.js']};
 return {files,classification:docs?'documentation':critical?'broad-or-sensitive':tooling?'tooling':'frontend',tiers:{
  A:docs?[documentation]:rust?[{label:'Affected Rust formatting',command:['cargo','fmt','--all','--','--check']}]:[node,...(frontend&&!tooling?[focused]:[])],
  B:docs?[]:frontend?[browser]:[],
  C:[...(!docs?[node]:[]),...(critical?[{label:'Full Rust regression',command:['cargo','test','--workspace','--offline','--locked']},{label:'Warnings-denied Rust analysis',command:['cargo','clippy','--workspace','--all-targets','--offline','--locked','--','-D','warnings']}]:[]),...(frontend?[browser]:[]),documentation]
 },requiredReview:docs?[]:tooling&&!critical?['Validate cache invalidation, failed runs, concurrent isolation and input mutation handling; compare protected app/runtime bytes.']:['Before integrated delivery: relevant actual HTTPS/SQLite, exact-source/recovery/authority, visual/selection/Undo and compatibility acceptance. Every actual run verifies exact binary identity; guarded handoff occurs at a completed verified milestone or explicit owner request (OWNER020).','Sensitive changes require applicable crash, old-reader, encrypted-storage/plaintext and format checks; no required acceptance check may be omitted.'],
 omittedBroadEvidence:docs?'Application checks omitted because this declared increment changes documentation only; no new application acceptance.':!critical?'Rust/proof reruns omitted for this declared frontend/tooling increment: backend/proof source, toolchain and dependency inputs must remain unchanged. Prior evidence retains its original scope.':'No broad waiver: unclassified, persistent, authority, crypto, history, dependency or proof changes require broader review.',
 proofReplay:proof?'Required for changed proof/toolchain/dependency assumptions.':'Retain prior bounded proof evidence only if its exact sources, toolchains and assumptions remain unchanged.',
 status:'plan only; Tier A success is not integration, acceptance or deployment'};
}
async function main(){
 const args=process.argv.slice(2),at=args.indexOf('--files'),runAt=args.indexOf('--run');
 if(at<0)throw Error('Usage: node scripts/verify-change.mjs --files path ... [--run A]');
 const files=args.slice(at+1).filter((p,i,list)=>{const firstOption=list.findIndex(value=>value.startsWith('--'));return firstOption<0||i<firstOption;});
 const plan=planChanges(files);console.log(JSON.stringify(plan,null,2));
 if(runAt<0)return;if(args[runAt+1]!=='A')throw Error('Only --run A is automatic; integration/deployment requires deliberate milestone orchestration.');
 const root=resolve(import.meta.dirname,'..'),base=join(root,'artifacts/verification');await mkdir(base,{recursive:true});const directory=await mkdtemp(join(base,'run-')),results=[];
 for(const task of plan.tiers.A){const start=performance.now();const child=spawn(task.command[0],task.command.slice(1),{cwd:root,stdio:'inherit'});const code=await new Promise((yes,no)=>{child.once('error',no);child.once('exit',code=>yes(code??1));});results.push({label:task.label,command:task.command,seconds:(performance.now()-start)/1000,exit_code:code});if(code){process.exitCode=code;break;}}
 await writeFile(join(directory,'run.json'),JSON.stringify({plan,results,status:process.exitCode?'failed':'Tier A passed only',deployment:'none'},null,2)+'\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
