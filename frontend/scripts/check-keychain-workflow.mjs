import {binaryFingerprint,refreshManualRuntime} from './manual-runtime-update.mjs';
// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic storage/history integration over verified HTTPS. Native keychain is opt-in; no browser.
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {createServer} from 'node:net';
import {connect} from 'node:tls';

const native=process.argv.includes('--native-keychain');
if(!native&&!process.argv.includes('--history-only'))throw Error('Choose --history-only or --native-keychain (unique synthetic item; OS consent may be requested).');
const root=resolve(import.meta.dirname,'../..'),binary=join(root,'target/debug/hypergraph');
const cert=join(root,'artifacts/local-tls/localhost.pem'),key=join(root,'artifacts/local-tls/localhost-key.pem');
const approved='05865badace97aad0cb8abf4460e12f6a1574b812759780052e8ffb486bf8428';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const ensure=(value,message)=>{if(!value)throw Error(message);};
const operation=()=>[...randomBytes(32)];
const checks=[],passphrase='SYNTHETIC-ONLY-keychain-workflow-'+randomBytes(16).toString('hex');
let directory,workspace,child,port,cookie,leaf,enrolled=false,enrollmentConfirmed=false,passed=false;
const testedSha=await binaryFingerprint();
async function stop(){
 if(child&&child.exitCode===null&&child.signalCode===null){const exit=new Promise(resolve=>child.once('exit',resolve));child.kill();await exit;}
 child=null;
}
async function start(create=false){
 const server=createServer();await new Promise((yes,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',yes);});
 port=server.address().port;await new Promise(resolve=>server.close(resolve));
 child=spawn(binary,['--workspace',workspace,...(create?['--create']:[]),'--cert',cert,'--key',key,'--port',String(port)],{stdio:['ignore','pipe','pipe']});
 const launch=await new Promise((yes,no)=>{
  let output='';const timer=setTimeout(()=>no(Error('Synthetic runtime startup timed out')),10000);
  child.once('error',()=>{clearTimeout(timer);no(Error('Synthetic runtime could not start'));});
  child.once('exit',()=>{clearTimeout(timer);no(Error('Synthetic runtime exited'));});
  child.stdout.on('data',bytes=>{output+=bytes.toString();const match=output.match(/#launch=([a-f0-9]+)/);if(match){clearTimeout(timer);yes(match[1]);}});
 });
 cookie=undefined;await api('bootstrap',{token:launch});
}
async function api(path,body){
 const socket=connect({host:'127.0.0.1',port,servername:'localhost',ca:leaf,allowPartialTrustChain:true,rejectUnauthorized:true});
 return new Promise((yes,no)=>{
  let data=Buffer.alloc(0);const timer=setTimeout(()=>{socket.destroy();no(Error('Synthetic HTTPS request timed out'));},15000);
  socket.once('secureConnect',()=>{
   if(!socket.authorized||digest(socket.getPeerCertificate().raw)!==approved){socket.destroy();clearTimeout(timer);no(Error('Unexpected TLS peer'));return;}
   const bytes=body===undefined?'':JSON.stringify(body);
   socket.write([`${body===undefined?'GET':'POST'} /api/v1/${path} HTTP/1.1`,`Host: 127.0.0.1:${port}`,...(cookie?['Cookie: '+cookie]:[]),...(body===undefined?[]:[`Origin: https://127.0.0.1:${port}`,'Content-Type: application/json','Content-Length: '+Buffer.byteLength(bytes)]),'',''].join('\r\n')+bytes);
  });
  socket.on('data',bytes=>{data=Buffer.concat([data,bytes]);});
  socket.on('error',()=>{clearTimeout(timer);no(Error('Synthetic HTTPS request failed'));});
  socket.once('close',()=>{
   clearTimeout(timer);
   try{
    const boundary=data.indexOf('\r\n\r\n');ensure(boundary>=0,'Missing HTTPS response');
    const headers=data.subarray(0,boundary).toString(),status=Number(headers.match(/^HTTP\/1\.1 (\d+)/)?.[1]);
    cookie=headers.match(/Set-Cookie: (__Host-hpx=[^;]+)/i)?.[1]??cookie;
    const result=JSON.parse(data.subarray(boundary+4).toString());
    if(status!==200){const error=Error(result.error??'Synthetic request rejected');error.status=status;throw error;}
    yes(result);
   }catch(error){no(error);}
  });
 });
}
async function command(request){return api('commands',{operation:operation(),request});}
try{
 leaf=await readFile(cert);ensure(digest(execFileSync('/usr/bin/openssl',['x509','-in',cert,'-outform','DER']))===approved,'Certificate differs from approved leaf');
 directory=await mkdtemp(join(root,'artifacts/keychain-workflow-'));workspace=join(directory,'synthetic.hpx');
 await start(true);
 ensure((await api('runtime')).locked,'Startup was not locked');
 ensure(!(await api('keychain/status',{})).enrolled,'Fresh workspace unexpectedly enrolled');
 await api('unlock',{passphrase});
 const source='SYNTHETIC keychain recovery😀\r\n中 e\u0301\rfinal\n';
 const created=await command({command:'create',title:'Synthetic keychain workflow',text:source}),document=created.outcome.document;
 let editor=await api('editor',{document});
 const committed=await command({command:'commit',document,generation:editor.generation,base:editor.base,sequence:editor.acknowledged_sequence});
 const snapshot=committed.outcome.snapshot;
 const history=await api('history',{document,next:null,limit:1});
 ensure(history.entries.length===1&&history.next&&JSON.stringify(history.entries[0].snapshot)===JSON.stringify(snapshot),'History head does not match exact commit');
 ensure(history.entries[0].text_bytes===Buffer.byteLength(source),'History source byte count changed');checks.push('bounded history metadata matches exact committed snapshot');
 let invalid;try{await api('history',{document,next:null,limit:0});}catch(error){invalid=error.status;}
 ensure(invalid===400,'Invalid history page limit accepted');checks.push('history page limits rejected at authenticated route');
 if(native){
 enrolled=true;const enrollment=await api('keychain/enroll',{});enrollmentConfirmed=true;
 ensure(enrollment.enrolled&&enrollment.backup_created,'Explicit upgrade backup was not confirmed');checks.push('explicit native enrollment and verified schema upgrade');
 }
 await stop();await start();
 ensure((await api('runtime')).locked,'Restart did not stay locked');
 ensure((await api('keychain/status',{})).enrolled===native,'Restart changed enrollment');checks.push('restart remains locked and reports exact enrollment');
 let locked;try{await api('history',{document,next:null,limit:1});}catch(error){locked=error.status;}ensure(locked===423,'Locked history access accepted');checks.push('locked runtime denies history reads');
 if(native)await api('unlock/keychain',{});else await api('unlock',{passphrase});editor=await api('editor',{document});ensure(editor.text===source,'Keychain unlock changed exact source');
 ensure((await api('snapshot',{document,snapshot})).text===source,'Keychain upgrade changed immutable snapshot');checks.push(native?'explicit native unlock restores exact draft and snapshot':'passphrase unlock restores exact draft and snapshot');
 const older=await api('history',{document,next:history.next,limit:1});ensure(older.entries.length===1&&older.next===null,'Stable history cursor did not reach initial publication');
 ensure((await api('snapshot',{document,snapshot:older.entries[0].snapshot})).text===source,'Exact historical reconstruction changed after restart');checks.push('older-page cursor and exact historical snapshot survive restart');
 const anchor={document,snapshot:older.entries[0].snapshot,revision:older.entries[0].revision,occurrence_path:[editor.occurrence],start_byte:Buffer.byteLength('SYNTHETIC keychain recovery'),end_byte:Buffer.byteLength(source)};
 ensure((await api('anchor/resolve',anchor)).text==='😀\r\n中 e\u0301\rfinal\n','Exact historical anchor range changed');
 let split;try{await api('anchor/resolve',{...anchor,start_byte:anchor.start_byte+1});}catch(error){split=error.status;}ensure(split===400,'Split UTF-8 scalar anchor accepted');
 checks.push('exact revision-bound historical anchors resolve; split scalar rejected');

 await api('lock',{});await api('unlock',{passphrase});checks.push('passphrase unlock succeeds after explicit lock');
 if(native){await api('keychain/remove',{});enrolled=false;}
 ensure(!(await api('keychain/status',{})).enrolled,'Removal retained wrapper');
 await stop();await start();await api('unlock',{passphrase});ensure((await api('editor',{document})).text===source,'Recovery after removal changed exact source');
 ensure((await api('snapshot',{document,snapshot})).text===source,'Recovery after removal changed snapshot');checks.push(native?'native removal and restarted passphrase recovery':'independent restart preserves source and committed snapshot');
 await writeFile(join(root,native?'artifacts/keychain-workflow-native.json':'artifacts/history-workflow-tls.json'),JSON.stringify({synthetic:true,browser:false,nativeKeychain:native,manualRuntimeTouched:false,checks},null,2));
 passed=true;console.log(`PASS: ${checks.length} synthetic HTTPS storage/history workflow checks`);
}catch(error){console.error('FAIL: '+error.message);process.exitCode=1;}
finally{
 if(enrolled){
  try{
   if(!child||child.exitCode!==null)await start();
   if((await api('runtime')).locked)await api('unlock',{passphrase});
   const status=await api('keychain/status',{});
   // If creation's outcome was unknown and no wrapper survived, never erase
   // the only workspace identity that can support scoped orphan inspection.
   if(!enrollmentConfirmed&&!status.enrolled&&!status.cleanup_pending)throw Error('Native creation outcome requires inspection');
   await api('keychain/remove',{});enrolled=false;
  }catch{console.error('Synthetic native cleanup needs attention; retained test workspace under artifacts/keychain-workflow-* for explicit recovery.');}
 }
 await stop();if(directory&&!enrolled)await rm(directory,{recursive:true,force:true});
}

if(passed&&!process.exitCode)await refreshManualRuntime(testedSha,'check-keychain-workflow.mjs');
