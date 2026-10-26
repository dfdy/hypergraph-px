// SPDX-License-Identifier: AGPL-3.0-only
// Leave a synthetic HTTPS runtime for the owner. Never automate their browser.
import {spawn} from 'node:child_process';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createServer} from 'node:net';
import https from 'node:https';
const root=resolve(import.meta.dirname,'../..'),artifacts=resolve(root,'artifacts');
// Repeated use must not replace or stop the owner's running instance.
let manual;
try{manual=JSON.parse(await readFile(join(artifacts,'manual-runtime-session.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
if(manual){
 const target=new URL(manual.origin);if(manual.synthetic!==true||target.protocol!=='https:'||target.hostname!=='127.0.0.1')throw Error('Unexpected manual runtime record');
 const leaf=await readFile(join(artifacts,'local-tls/localhost.pem'));
 const alive=await new Promise(resolve=>{const request=https.get(target.origin+'/api/v1/runtime',{ca:leaf,allowPartialTrustChain:true,rejectUnauthorized:true},response=>{response.resume();resolve(response.statusCode===401);});request.setTimeout(3000,()=>request.destroy());request.on('error',()=>resolve(false));});
 if(!alive)throw Error('The recorded manual instance is not reachable; inspect it before replacing it');
 console.log('Existing manual HTTPS runtime preserved at '+target.origin);console.log('Private launch shortcut: artifacts/manual-runtime-launch.webloc');process.exit(0);
}
const session=JSON.parse(await readFile(join(artifacts,'headed-runtime-session.json'),'utf8'));
if(session.synthetic!==true||!session.directory.startsWith(artifacts+'/runtime-workflow-'))throw Error('Expected the existing synthetic test workspace');
const workspace=join(session.directory,'synthetic.hpx');await access(workspace);
async function choosePort(){
 const probe=createServer();let preferred=true;await new Promise((yes,no)=>{probe.once('error',error=>{if(error.code==='EADDRINUSE'){preferred=false;yes();}else no(error);});probe.listen(8388,'127.0.0.1',yes);});
 if(preferred){await new Promise(resolve=>probe.close(resolve));return 8388;}
 const fallback=createServer();await new Promise((yes,no)=>{fallback.once('error',no);fallback.listen(0,'127.0.0.1',yes);});const port=fallback.address().port;await new Promise(resolve=>fallback.close(resolve));return port;
}
const port=await choosePort();const runtime=spawn(resolve(root,'target/debug/hypergraph'),['--workspace',workspace,'--cert',join(artifacts,'local-tls/localhost.pem'),'--key',join(artifacts,'local-tls/localhost-key.pem'),'--port',String(port)],{detached:true,stdio:['ignore','pipe','pipe']});runtime.unref();
const launch=await new Promise((yes,no)=>{let output='';const timer=setTimeout(()=>no(Error('Manual runtime startup timed out')),10000);runtime.once('error',()=>{clearTimeout(timer);no(Error('Manual runtime failed to start'));});runtime.once('exit',()=>{clearTimeout(timer);no(Error('Manual runtime exited during startup'));});runtime.stdout.on('data',bytes=>{output+=bytes.toString();const match=output.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+/);if(match){clearTimeout(timer);yes(match[0]);}});});
await writeFile(join(artifacts,'manual-runtime-launch.webloc'),`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>${launch}</string></dict></plist>\n`,{mode:0o600});
await writeFile(join(artifacts,'manual-runtime-launch.html'),`<!doctype html><meta charset="utf-8"><title>Hypergraph PX private launch</title><h1>Hypergraph PX</h1><p><a rel="noreferrer" href="${launch}">Open the local HTTPS workspace</a></p><p>This private link establishes your browser session. Use synthetic documents only.</p>`,{mode:0o600});
await writeFile(join(artifacts,'manual-runtime-session.json'),JSON.stringify({pid:runtime.pid,origin:'https://127.0.0.1:'+port,workspace,synthetic:true,launchShortcut:'artifacts/manual-runtime-launch.webloc'},null,2),{mode:0o600});
console.log('Manual HTTPS runtime running at https://127.0.0.1:'+port);console.log('Private launch shortcut: artifacts/manual-runtime-launch.webloc');console.log('Synthetic workspace preserved; no browser automation launched.');
process.exit(0);
