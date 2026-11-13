// SPDX-License-Identifier: AGPL-3.0-only
// Local integration checks hand off only the exact binary they exercised.
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
export function handoffRequested(args=process.argv.slice(2)){return args.includes('--handoff');}
export function verifyTestedFingerprint(expected,actual){if(!/^[a-f0-9]{64}$/.test(expected)||expected!==actual)throw Error('Runtime binary changed during tests; successful verification requires the exact tested binary');}
export async function binaryFingerprint(){return createHash('sha256').update(await readFile(resolve(root,'target/debug/hypergraph'))).digest('hex');}
export async function refreshManualRuntime(testedSha,name){
 verifyTestedFingerprint(testedSha,await binaryFingerprint());
 if(!handoffRequested()){console.log('Verified exact binary; manual handoff deferred to a completed milestone or explicit request (--handoff).');return;}
 try{await access(resolve(root,'artifacts/manual-runtime-session.json'));}catch(error){if(error.code==='ENOENT')return;throw error;}
 await new Promise((yes,no)=>{
  const child=spawn(process.execPath,[resolve(import.meta.dirname,'refresh-manual-runtime.mjs'),'--tested-sha',testedSha,'--verified-by',name],{stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',bytes=>process.stdout.write(bytes));child.stderr.on('data',()=>{});
  child.once('error',()=>no(Error('Manual runtime updater could not start')));child.once('exit',code=>code===0?yes():no(Error('Manual runtime update failed; inspect its recorded process and handoff lock before retrying')));
 });
}
