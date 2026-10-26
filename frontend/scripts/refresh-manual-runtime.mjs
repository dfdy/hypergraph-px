// SPDX-License-Identifier: AGPL-3.0-only
// Explicitly authorized handoff of a successfully tested binary to the manual copy.
import {spawn,execFileSync} from 'node:child_process';
import {readFile,writeFile,access,mkdir,chmod,rename,open,unlink} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {createServer} from 'node:net';
import https from 'node:https';
const root=resolve(import.meta.dirname,'../..'),artifacts=join(root,'artifacts');
const built=join(root,'target/debug/hypergraph'),cert=join(artifacts,'local-tls/localhost.pem'),key=join(artifacts,'local-tls/localhost-key.pem');
const record=join(artifacts,'manual-runtime-session.json'),lockPath=join(artifacts,'manual-runtime-update.lock');
const argument=name=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const approved='05865badace97aad0cb8abf4460e12f6a1574b812759780052e8ffb486bf8428';
let lock,runtime;
async function acquire(){
 for(let i=0;i<120;i++){
  try{const file=await open(lockPath,'wx',0o600);await file.writeFile(JSON.stringify({pid:process.pid}));return file;}
  catch(error){if(error.code!=='EEXIST')throw error;await sleep(250);}
 }
 throw Error('Another manual-runtime update still owns the handoff lock');
}
async function alive(origin){
 const leaf=await readFile(cert);
 return new Promise(resolve=>{const request=https.get(origin+'/api/v1/runtime',{ca:leaf,allowPartialTrustChain:true,rejectUnauthorized:true},response=>{response.resume();resolve(response.statusCode===401);});request.setTimeout(3000,()=>request.destroy());request.on('error',()=>resolve(false));});
}
async function freePort(preferred){
 const server=createServer();
 try{await new Promise((yes,no)=>{server.once('error',no);server.listen(preferred??0,'127.0.0.1',yes);});const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port;}
 catch(error){if(error.code!=='EADDRINUSE')throw error;return freePort();}
}
function ownedProcess(session){
 const expected=[session.binary??built,'--workspace',session.workspace,'--cert',cert,'--key',key,'--port',String(new URL(session.origin).port)].join(' ');
 let command;try{command=execFileSync('/bin/ps',['-p',String(session.pid),'-o','command='],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{return false;}
 return command===expected;
}
async function stopRecorded(session){
 if(!ownedProcess(session))throw Error('Recorded PID does not exactly match the manual runtime; no process was stopped');
 process.kill(session.pid,'SIGTERM');
 for(let i=0;i<100;i++){if(!ownedProcess(session))return;await sleep(50);}
 throw Error('Manual runtime did not exit after SIGTERM; no force kill was used');
}
async function start(binary,workspace,port){
 const child=spawn(binary,['--workspace',workspace,'--cert',cert,'--key',key,'--port',String(port)],{detached:true,stdio:['ignore','pipe','pipe']});runtime=child;
 const launch=await new Promise((yes,no)=>{let output='';const timer=setTimeout(()=>no(Error('Manual runtime startup timed out')),10000);
  child.once('error',()=>{clearTimeout(timer);no(Error('Manual runtime failed to start'));});child.once('exit',()=>{clearTimeout(timer);no(Error('Manual runtime exited during startup'));});
  child.stdout.on('data',bytes=>{output+=bytes.toString();const match=output.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+/);if(match){clearTimeout(timer);yes(match[0]);}});
 });
 if(!await alive(new URL(launch).origin))throw Error('Replacement manual runtime failed verified HTTPS readiness');
 return {child,launch};
}
async function privateWrite(path,bytes){
 const temporary=path+'.pending-'+process.pid;await writeFile(temporary,bytes,{mode:0o600,flag:'wx'});await rename(temporary,path);await chmod(path,0o600);
}
try{
 lock=await acquire();
 const manual=JSON.parse(await readFile(record,'utf8')),origin=new URL(manual.origin);
 if(manual.synthetic!==true||origin.protocol!=='https:'||origin.hostname!=='127.0.0.1'||!Number.isSafeInteger(manual.pid)||!manual.workspace.startsWith(artifacts+'/'))throw Error('Unexpected manual runtime record');
 await access(manual.workspace);
 const expected=argument('--tested-sha');if(!/^[a-f0-9]{64}$/.test(expected??''))throw Error('Updating requires the successful synthetic test binary SHA-256');
 const bytes=await readFile(built);if(digest(bytes)!==expected)throw Error('Built binary changed after the successful test; manual runtime was not updated');
 if(digest(execFileSync('/usr/bin/openssl',['x509','-in',cert,'-outform','DER']))!==approved)throw Error('Local certificate differs from the approved leaf');
 const reachable=await alive(origin.origin);
 if(manual.binary_sha256===expected&&reachable&&ownedProcess(manual)){await privateWrite(record,JSON.stringify({...manual,verified_by:argument('--verified-by')??'explicit synthetic test',verified_at:new Date().toISOString()},null,2));console.log('Manual HTTPS runtime already runs the tested build at '+origin.origin);}
 else{
  const folder=join(artifacts,'manual-runtime-binaries');await mkdir(folder,{recursive:true,mode:0o700});
  const binary=join(folder,expected);try{await writeFile(binary,bytes,{flag:'wx',mode:0o700});}catch(error){if(error.code!=='EEXIST')throw error;}
  if(digest(await readFile(binary))!==expected)throw Error('Immutable manual binary snapshot failed verification');
  if(reachable)await stopRecorded(manual);
  else if(ownedProcess(manual))throw Error('Recorded process is alive but HTTPS is unavailable; it was left untouched');
  const port=await freePort(Number(origin.port)),replacement=await start(binary,manual.workspace,port),launch=replacement.launch;
  await privateWrite(join(artifacts,'manual-runtime-launch.webloc'),`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>${launch}</string></dict></plist>\n`);
  await privateWrite(join(artifacts,'manual-runtime-launch.html'),`<!doctype html><meta charset="utf-8"><title>Hypergraph PX private launch</title><h1>Hypergraph PX</h1><p><a rel="noreferrer" href="${launch}">Open the updated local HTTPS workspace</a></p><p>This private link establishes your browser session. Use synthetic documents only.</p>`);
  await privateWrite(record,JSON.stringify({...manual,pid:replacement.child.pid,origin:new URL(launch).origin,binary,binary_sha256:expected,verified_by:argument('--verified-by')??'explicit synthetic test',updated:new Date().toISOString(),verified_at:new Date().toISOString()},null,2));
  replacement.child.stdout.destroy();replacement.child.stderr.destroy();replacement.child.unref();runtime=null;
  console.log('Manual HTTPS runtime updated to the tested build at '+new URL(launch).origin);console.log('Same workspace preserved; runtime starts locked.');
 }
 console.log('Private launch shortcut: artifacts/manual-runtime-launch.webloc');
}finally{
 if(runtime&&runtime.exitCode===null)runtime.kill('SIGTERM');
 if(lock){await lock.close();await unlink(lockPath);}
}
