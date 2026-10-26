import {binaryFingerprint,refreshManualRuntime} from './manual-runtime-update.mjs';
import {testBrowser} from './browser-session.mjs';
// SPDX-License-Identifier: AGPL-3.0-only
// TLS preflight only: no trust installation, warning bypass, unlock or real data.
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {createServer} from 'node:net';
import {chromium,webkit} from '@playwright/test';
const engine=process.argv[2]??'chromium';if(!['chromium','webkit'].includes(engine))throw Error('Expected browser: chromium or webkit');
const root=resolve(import.meta.dirname,'../..'),temporary=await mkdtemp(join(tmpdir(),'hpx-tls-preflight-'));
let runtime,browser,passed=false;
const testedSha=await binaryFingerprint();
try{
 const probe=createServer();await new Promise((yes,no)=>{probe.once('error',no);probe.listen(0,'127.0.0.1',yes);});const port=probe.address().port;await new Promise((yes,no)=>probe.close(error=>error?no(error):yes()));
 runtime=spawn(resolve(root,'target/debug/hypergraph'),['--workspace',join(temporary,'synthetic.hpx'),'--create','--cert',resolve(root,'artifacts/local-tls/localhost.pem'),'--key',resolve(root,'artifacts/local-tls/localhost-key.pem'),'--port',String(port)],{stdio:['ignore','pipe','pipe']});
 const url=await new Promise((yes,no)=>{let output='';const timer=setTimeout(()=>no(Error('Runtime TLS preflight startup timed out')),10000);runtime.once('error',()=>{clearTimeout(timer);no(Error('Runtime binary could not start'));});runtime.once('exit',()=>{clearTimeout(timer);no(Error('Runtime TLS preflight exited'));});runtime.stdout.on('data',bytes=>{output+=bytes.toString();const match=output.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+/);if(match){clearTimeout(timer);yes(match[0]);}});});
 browser=engine==='chromium'?await testBrowser():await webkit.launch({headless:true});const context=browser.contexts()[0]??await browser.newContext();const page=await context.newPage();
 // Explicitly retain default certificate verification. Never log the launch URL.
 try{await page.goto(url,{waitUntil:'networkidle'});}catch(error){
  const code=String(error.message).match(/net::ERR_[A-Z_]+/)?.[0]??'navigation_failed';
  throw Error(`Browser TLS verification did not succeed (${code}). No workspace was unlocked and no trust settings were changed by this preflight.`);
 }
 if(!await page.getByRole('button',{name:'Create workspace',exact:true}).isVisible())throw Error('TLS connected but runtime initialization did not reach the locked workspace');
 passed=true;console.log('PASS: '+engine+' verified runtime TLS and reached authenticated locked-workspace UI without trust changes or unlock');
}finally{
 await browser?.close();
 if(runtime?.pid&&runtime.exitCode===null){const exited=new Promise(resolve=>runtime.once('exit',resolve));runtime.kill();await exited;}await rm(temporary,{recursive:true,force:true});
}


if(passed&&!process.exitCode)await refreshManualRuntime(testedSha,'check-runtime-tls.mjs');
