import {binaryFingerprint,refreshManualRuntime} from './manual-runtime-update.mjs';
// SPDX-License-Identifier: AGPL-3.0-only
// Real local transport rejection tests. No trust changes or certificate bypass.
import {testBrowser} from './browser-session.mjs';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {mkdtemp,rm,readFile,writeFile,chmod,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {createServer,connect as plainConnect} from 'node:net';
import {connect as tlsConnect} from 'node:tls';

const root=resolve(import.meta.dirname,'../..');
const binary=resolve(root,'target/debug/hypergraph');
const cert=resolve(root,'artifacts/local-tls/localhost.pem');
const key=resolve(root,'artifacts/local-tls/localhost-key.pem');
const approved='05865badace97aad0cb8abf4460e12f6a1574b812759780052e8ffb486bf8428';
const checks=[],useBrowser=!process.argv.includes('--no-browser');
let temporary,browser,context,foreground,guard,untrusted,leaf,passed=false;
const testedSha=await binaryFingerprint();
const ensure=(value,message)=>{if(!value)throw Error(message);};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function freePort(){
 const server=createServer();await new Promise((yes,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',yes);});
 const port=server.address().port;await new Promise((yes,no)=>server.close(error=>error?no(error):yes()));return port;
}
async function start(certificate,privateKey,name){
 const port=await freePort(),workspace=join(temporary,name+'.hpx');
 const child=spawn(binary,['--workspace',workspace,'--create','--cert',certificate,'--key',privateKey,'--port',String(port)],{stdio:['ignore','pipe','pipe']});
 const url=await new Promise((yes,no)=>{let text='';const timer=setTimeout(()=>no(Error('Guard runtime startup timed out')),10000);
 child.once('error',()=>{clearTimeout(timer);no(Error('Guard runtime failed to start'));});child.once('exit',()=>{clearTimeout(timer);no(Error('Guard runtime exited during startup'));});
 child.stdout.on('data',chunk=>{text+=chunk.toString();const match=text.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+/);if(match){clearTimeout(timer);yes(match[0]);}});
 });return {child,port,workspace,url};
}
async function stop(server){if(server?.child.pid&&server.child.exitCode===null&&server.child.signalCode===null){const exit=new Promise(resolve=>server.child.once('exit',resolve));server.child.kill();await exit;}}
function tlsSocket(port,servername='localhost'){
 // Trust only the exact approved leaf for this client. Node verifies the chain
 // and hostname; the installed OS/browser trust stores are not modified.
 const socket=tlsConnect({host:'127.0.0.1',servername,port,ca:leaf,allowPartialTrustChain:true,rejectUnauthorized:true});
 return new Promise((yes,no)=>{socket.once('error',no);socket.once('secureConnect',()=>{try{ensure(socket.authorized,'TLS client was not authenticated');ensure(digest(socket.getPeerCertificate().raw)===approved,'Unexpected peer certificate');socket.removeListener('error',no);yes(socket);}catch(error){socket.destroy();no(error);}});});
}
async function raw(port,request){
 const socket=await tlsSocket(port);return new Promise((yes,no)=>{let data='';const timer=setTimeout(()=>{socket.destroy();no(Error('Raw TLS response timed out'));},4000);
 socket.on('data',bytes=>data+=bytes.toString());socket.on('error',error=>{if(!data){clearTimeout(timer);no(Error('Raw TLS response failed: '+error.code));}});socket.on('close',()=>{clearTimeout(timer);yes({status:Number(data.match(/^HTTP\/1\.1 (\d+)/)?.[1]),data});});socket.write(request);
 });
}
function request(port,path,{method='GET',cookie,origin,contentType='application/json',extra=[],body=''}={}){
 return [method+' '+path+' HTTP/1.1','Host: 127.0.0.1:'+port,...(origin===undefined?[]:['Origin: '+origin]),...(cookie?['Cookie: '+cookie]:[]),...(method==='POST'?['Content-Type: '+contentType,'Content-Length: '+Buffer.byteLength(body)]:[]),...extra,'',''].join('\r\n')+body;
}
async function status(expected,options,label,path='/api/v1/runtime'){
 const response=await raw(guard.port,request(guard.port,path,options));ensure(response.status===expected,label+': unexpected HTTP status '+response.status);checks.push(label);
}
async function browserRejects(url,expected,label){
 const page=await context.newPage();await page.bringToFront();let failure;
 try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:10000});}catch(error){failure=String(error.message).match(/net::ERR_[A-Z_]+/)?.[0];}
 ensure(failure===expected,label+': unexpected browser outcome '+failure);checks.push(label);
 // Retain the visible browser, not ephemeral rejection tabs containing errors.
 await page.close();
}
async function run(){
 leaf=await readFile(cert);ensure(digest(execFileSync('/usr/bin/openssl',['x509','-in',cert,'-outform','DER']))===approved,'Current certificate differs from approved fingerprint');
 temporary=await mkdtemp(resolve(root,'artifacts/runtime-security-'));
 const fakeCert=join(temporary,'untrusted.pem'),fakeKey=join(temporary,'untrusted-key.pem');
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',fakeKey,'-out',fakeCert,'-days','1','-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1'],{stdio:'ignore'});await chmod(fakeKey,0o600);
 const startup=async(certificate,privateKey,expected,label)=>{
  const workspace=join(temporary,'must-not-exist.hpx');const result=spawnSync(binary,['--workspace',workspace,'--create','--cert',certificate,'--key',privateKey,'--port',String(await freePort())],{encoding:'utf8',timeout:3000});
  ensure(result.status===1&&expected.test(result.stderr),label+' did not fail closed');ensure(!String(result.stdout).includes('#launch='),label+' published a launch capability');let exists=true;try{await access(workspace);}catch{exists=false;}ensure(!exists,label+' created a workspace');checks.push(label);
 };
 await chmod(fakeKey,0o644);await startup(fakeCert,fakeKey,/mode 0600/,'unsafe private-key permissions rejected before launch');await chmod(fakeKey,0o600);
 await startup(cert,fakeKey,/Runtime startup failed/,'mismatched certificate/private key rejected before launch');
 const missing=join(temporary,'empty-key.pem');await writeFile(missing,'',{mode:0o600});await startup(fakeCert,missing,/private key/,'empty private key rejected before launch');
 guard=await start(cert,key,'locked');const origin='https://127.0.0.1:'+guard.port;let auth;
 if(useBrowser){
  browser=await testBrowser();foreground=browser.contexts()[0].pages().find(page=>page.url().startsWith('https://127.0.0.1:'));context=await browser.newContext();
  const page=await context.newPage();await page.bringToFront();await page.goto(guard.url,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Create workspace',exact:true}).waitFor();
  const cookie=(await context.cookies()).find(cookie=>cookie.name==='__Host-hpx');ensure(cookie,'Bootstrap cookie missing');auth=cookie.name+'='+cookie.value;
 }else{
  const token=new URLSearchParams(new URL(guard.url).hash.slice(1)).get('launch');
  const response=await raw(guard.port,request(guard.port,'/api/v1/bootstrap',{method:'POST',origin,body:JSON.stringify({token})}));
  ensure(response.status===200,'Verified TLS bootstrap failed');auth=response.data.match(/Set-Cookie: (__Host-hpx=[^;]+)/i)?.[1];ensure(auth,'Bootstrap cookie missing');
 }
 await status(200,{cookie:auth},'authenticated locked-runtime status allowed');
 await status(401,{},'missing session rejected');await status(401,{cookie:'__Host-hpx=invalid'},'forged session rejected');
 await status(401,{cookie:auth+'; __Host-hpx=invalid'},'conflicting session cookies rejected');
 await status(401,{cookie:auth+'; '+auth},'duplicate session cookies rejected');
 await status(403,{method:'POST',cookie:auth,origin:'https://not-authorized.invalid',body:'{}'},'foreign origin rejected','/api/v1/documents');
 await status(403,{method:'POST',cookie:auth,body:'{}'},'missing origin rejected','/api/v1/documents');
 await status(415,{method:'POST',cookie:auth,origin,contentType:'text/plain',body:'{}'},'non-JSON content type rejected','/api/v1/documents');
 await status(401,{cookie:auth+'\u00a0'},'Unicode cookie whitespace is not normalized into a session');
 await status(403,{method:'POST',cookie:auth,origin:origin+'\u2000',body:'{}'},'Unicode origin whitespace is not normalized into authority','/api/v1/documents');
 await status(403,{cookie:auth,extra:['Sec-Fetch-Site: cross-site']},'cross-site fetch metadata rejected');
 const wrongHost=await raw(guard.port,'GET /api/v1/runtime HTTP/1.1\r\nHost: localhost:'+guard.port+'\r\nCookie: '+auth+'\r\n\r\n');ensure(wrongHost.status===403,'Mismatched Host accepted');checks.push('mismatched Host rejected');
 await status(423,{method:'POST',cookie:auth,origin,body:'{}'},'locked workspace blocks document access','/api/v1/documents');
 const duplicate=await raw(guard.port,request(guard.port,'/api/v1/bootstrap',{method:'POST',origin,body:'{}',extra:['Content-Length: 2']}));ensure(duplicate.status===400,'Duplicate Content-Length accepted');checks.push('duplicate framing rejected');
 const huge=await raw(guard.port,'POST /api/v1/bootstrap HTTP/1.1\r\nHost: 127.0.0.1:'+guard.port+'\r\nContent-Length: 999999999\r\n\r\n');ensure(huge.status===400,'Oversized body declaration accepted');checks.push('oversized body declaration rejected before reading body');
 const slow=await tlsSocket(guard.port),started=Date.now();
 await new Promise((yes,no)=>{const interval=setInterval(()=>slow.write('a'),150),timer=setTimeout(()=>{slow.destroy();no(Error('Fragmented request exceeded total deadline'));},12500);slow.on('error',()=>{});slow.once('close',()=>{clearInterval(interval);clearTimeout(timer);const elapsed=Date.now()-started;try{ensure(elapsed>=8000&&elapsed<12500,'Unexpected fragmented-request close time');yes();}catch(error){no(error);}});slow.write('GET / HTTP/1.1\r\nHost: 127.0.0.1:'+guard.port+'\r\nX-Padding: ');});checks.push('continuous fragmented request closes at total deadline');await status(200,{cookie:auth},'healthy request succeeds after a timed-out client');
 await new Promise((yes,no)=>{let bytes='';const socket=plainConnect({host:'127.0.0.1',port:guard.port});const timer=setTimeout(()=>{socket.destroy();no(Error('Plaintext probe exceeded the total deadline'));},12500);socket.on('connect',()=>socket.write('GET / HTTP/1.1\r\nHost: 127.0.0.1:'+guard.port+'\r\n\r\n'));socket.on('data',chunk=>bytes+=chunk.toString());socket.on('error',()=>{});socket.on('close',()=>{clearTimeout(timer);try{ensure(!bytes.startsWith('HTTP/'),'Plaintext HTTP response received');yes();}catch(error){no(error);}});});checks.push('plaintext HTTP receives no application response');
 untrusted=await start(fakeCert,fakeKey,'untrusted');
 if(useBrowser){
  await browserRejects('https://wrong.localhost:'+guard.port+'/', 'net::ERR_CERT_COMMON_NAME_INVALID','browser rejects certificate hostname mismatch');
  await browserRejects('https://127.0.0.1:'+untrusted.port+'/', 'net::ERR_CERT_AUTHORITY_INVALID','browser rejects untrusted certificate without fallback');
 }else{
  let mismatch;try{const socket=await tlsSocket(guard.port,'wrong.localhost');socket.destroy();}catch(error){mismatch=error.code;}
  ensure(mismatch==='ERR_TLS_CERT_ALTNAME_INVALID','TLS client did not reject the mismatched hostname');checks.push('verified TLS client rejects hostname mismatch');
  let unknown;try{const socket=await tlsSocket(untrusted.port);socket.destroy();}catch(error){unknown=error.code;}
  ensure(['DEPTH_ZERO_SELF_SIGNED_CERT','SELF_SIGNED_CERT_IN_CHAIN','UNABLE_TO_VERIFY_LEAF_SIGNATURE'].includes(unknown),'TLS client did not reject the untrusted certificate: '+unknown);checks.push('verified TLS client rejects untrusted certificate');
 }
 let exists=true;try{await access(guard.workspace);}catch{exists=false;}ensure(!exists,'Security probes unexpectedly created a workspace');checks.push('rejection tests created or unlocked no workspace');
 await writeFile(resolve(root,'artifacts/runtime-security-' + (useBrowser?'chromium':'tls-client') + '.json'),JSON.stringify({checks,synthetic:true,browser:useBrowser?'isolated headless Chromium':'not used; verified Node TLS client',trustChanged:false},null,2));passed=true;console.log('PASS: '+checks.length+' real runtime security rejection checks');
}
try{await run();}catch(error){console.error('FAIL: '+String(error.message).replace(/#launch=[a-f0-9]+/g,'#launch=[redacted]'));process.exitCode=1;}finally{await context?.close();await browser?.close();await stop(guard);await stop(untrusted);if(temporary)await rm(temporary,{recursive:true,force:true});await foreground?.bringToFront().catch(()=>{});}

if(passed&&!process.exitCode)await refreshManualRuntime(testedSha,'check-runtime-security.mjs');
