// Isolated CLI lifecycle checks; no trust installation or manual workspace access.
import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {createServer,connect} from 'node:net';
import {resolve,join} from 'node:path';
import {expect} from '@playwright/test';
import {testBrowser} from './browser-session.mjs';
const root=resolve(import.meta.dirname,'../..'),directory=await mkdtemp(join(root,'.local/artifacts/development-cli-'));
const children=new Set(),checks=[];let browser;
async function freePort(){const server=createServer();await new Promise((yes,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',yes);});const port=server.address().port;await new Promise(yes=>server.close(yes));return String(port);}
function start(mode,args=[]){const child=spawn(process.execPath,['shared/tooling/hpx.mjs',mode,...args],{cwd:root,stdio:['ignore','pipe','pipe']});children.add(child);child.output='';for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{child.output+=data;});return child;}
async function ready(child,pattern){await expect.poll(()=>{if(child.exitCode!==null||child.signalCode!==null)throw Error('Development child exited before ready');return pattern.test(child.output);},{timeout:120000}).toBe(true);return child.output.match(pattern)[1];}
async function stop(child){if(child.exitCode===null&&child.signalCode===null){const ended=new Promise(yes=>child.once('exit',yes));child.kill('SIGTERM');await Promise.race([ended,new Promise((_,no)=>{const timer=setTimeout(()=>no(Error('Development supervisor did not stop')),10000);timer.unref();})]);}children.delete(child);}
async function closed(port){await expect.poll(()=>new Promise(yes=>{const socket=connect({host:'127.0.0.1',port:Number(port)});socket.once('connect',()=>{socket.destroy();yes(false);});socket.once('error',()=>yes(true));})).toBe(true);}
const cert=resolve(root,'.local/credentials/tls/localhost.pem'),key=resolve(root,'.local/credentials/tls/localhost-key.pem');
const tls=['--cert',cert,'--key',key],trust=[...tls,'--ca',cert];
try{
 browser=await testBrowser();const page=await browser.contexts()[0].newPage();
 const frontendPort=await freePort(),backendPort=await freePort();
 for(let i=0;i<2;i++){
  const mock=start('frontend',['--mock','--frontend-port',frontendPort]);const url=await ready(mock,/HPX frontend: (http:\/\/127\.0\.0\.1:\d+)/);
  await page.goto(url);await expect(page.locator('.cm-editor')).toBeVisible();expect(await page.evaluate(()=>fetch('/api/v1/runtime').then(r=>r.status))).toBe(503);
  await stop(mock);await closed(frontendPort);
 }
 checks.push('root mock command starts/restarts independently, renders editor, denies persistent API and closes its port');
 const workspace=join(directory,'independent.hpx');let backend=start('backend',['--workspace',workspace,'--create','--backend-port',backendPort,...tls]);
 let launch=await ready(backend,/(https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+)/);
 let frontend=start('frontend',['--frontend-port',frontendPort,'--backend','https://127.0.0.1:'+backendPort,...trust]);
 const url=await ready(frontend,/HPX frontend: (https:\/\/127\.0\.0\.1:\d+)/);
 await page.goto(url+'/'+new URL(launch).hash);await expect(page.getByRole('button',{name:'Create workspace',exact:true})).toBeVisible();
 await page.getByLabel('Workspace passphrase',{exact:true}).fill('SYNTHETIC-CLI-lifecycle-only-2026');await page.getByRole('button',{name:'Create workspace',exact:true}).click();await expect(page.getByRole('button',{name:'Create document',exact:true})).toBeVisible({timeout:15000});
 await stop(frontend);await closed(frontendPort);expect(backend.exitCode).toBe(null);
 frontend=start('frontend',['--frontend-port',frontendPort,'--backend','https://127.0.0.1:'+backendPort,...trust]);await ready(frontend,/HPX frontend: (https:\/\/127\.0\.0\.1:\d+)/);await page.goto(url);await expect(page.getByRole('button',{name:'Create document',exact:true})).toBeVisible();
 checks.push('connected frontend independently restarts while authenticated backend and synthetic workspace stay alive');
 await stop(backend);backend=start('backend',['--workspace',workspace,'--backend-port',backendPort,...tls]);launch=await ready(backend,/(https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+)/);
 await page.goto('about:blank');await page.goto(url+'/'+new URL(launch).hash);await expect(page.getByRole('button',{name:'Unlock workspace',exact:true})).toBeVisible();expect(frontend.exitCode).toBe(null);
 checks.push('backend independently restarts locked while frontend remains alive; launch/session and unlock remain separate');
 await stop(frontend);await stop(backend);await closed(frontendPort);await closed(backendPort);
 const combined=start('dev',['--workspace',join(directory,'combined.hpx'),'--create','--frontend-port',frontendPort,'--backend-port',backendPort,...trust]);
 launch=await ready(combined,/(?:Development launch \(private\): )(https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+)/);await ready(combined,/HPX frontend: (https:\/\/127\.0\.0\.1:\d+)/);
 await page.goto('about:blank');await page.goto(launch);await expect(page.getByRole('button',{name:'Create workspace',exact:true})).toBeVisible();await stop(combined);await closed(frontendPort);await closed(backendPort);
 checks.push('combined command starts two configured origins, translates launch capability and terminates both children');
 await writeFile(join(root,'.local/artifacts/reorganisation-development-cli.json'),JSON.stringify({status:'passed',checks,synthetic:true},null,2)+'\n');console.log('PASS: '+checks.length+' development CLI lifecycle checks');
}finally{await browser?.close();for(const child of children)await stop(child);await rm(directory,{recursive:true,force:true});}
