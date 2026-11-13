// SPDX-License-Identifier: AGPL-3.0-only
// Capture the current embedded runtime with disposable synthetic content only.
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import {createServer} from 'node:net';
import {resolve,join} from 'node:path';
import {expect} from '@playwright/test';
import {testBrowser} from './browser-session.mjs';
import {binaryFingerprint,refreshManualRuntime} from './manual-runtime-update.mjs';

const root=resolve(import.meta.dirname,'../..'),cert=join(root,'artifacts/local-tls/localhost.pem'),key=join(root,'artifacts/local-tls/localhost-key.pem');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),testedSha=await binaryFingerprint();
const approved='05865badace97aad0cb8abf4460e12f6a1574b812759780052e8ffb486bf8428';
const samples=[
 ['Connected writing',`# A workspace for connected ideas

Ideas develop through encounters with evidence, interpretations and other people. A useful writing environment preserves those connections while letting the argument change.

## Keep the evidence in view

This document is an original synthetic example. It contains no manuscript, research-participant information or private workspace content.

| Contribution | Context | Review |
| --- | --- | --- |
| A source passage | An exact retained version | Inspect |
| An interpretation | A claim with stated premises | Review |

## Reuse without losing origins

Capture a committed passage as a protected source reference. Fork creates an independent document; reviewed synthesis records its ordered inputs. Neither operation establishes original authorship.

## Make reasoning inspectable

Relationships retain their participant roles, exact source contexts and explicit review state. An accepted claim remains distinct from a checked logical proof.

### A mathematical example

The identity \\(a^2 + b^2 = c^2\\) can be displayed as source or rendered notation. Rendering alone does not verify a proof.

## Follow an idea through time

Draft saves protect work in progress. Explicit commits retain immutable snapshots that can be inspected and compared after later edits.

## Questions for further inquiry

Which assumptions support this interpretation? What evidence would challenge it? How did the contribution change between retained versions?
`],
 ['Evidence and interpretations','# Evidence and interpretations\n\nKeep a source, a proposed interpretation and a recorded review distinct. This is synthetic demonstration content.\n'],
 ['Research questions','# Research questions\n\nWhat changes when a passage is read in a different context? Which premises remain disputed?\n'],
 ['Method and reflection','# Method and reflection\n\nDocument the scope of a claim and the limits of its evidence.\n']
];
let directory,runtime,browser,passed=false;
try{
 if(sha(execFileSync('/usr/bin/openssl',['x509','-in',cert,'-outform','DER']))!==approved)throw Error('Certificate differs from approved leaf');
 directory=await mkdtemp(join(root,'artifacts/readme-runtime-'));
 const probe=createServer();await new Promise((yes,no)=>{probe.once('error',no);probe.listen(0,'127.0.0.1',yes);});const port=probe.address().port;await new Promise((yes,no)=>probe.close(error=>error?no(error):yes()));
 runtime=spawn(join(root,'target/debug/hypergraph'),['--workspace',join(directory,'synthetic.hpx'),'--create','--cert',cert,'--key',key,'--port',String(port)],{stdio:['ignore','pipe','pipe']});
 const launch=await new Promise((yes,no)=>{let output='';const timeout=setTimeout(()=>no(Error('Synthetic capture runtime startup timed out')),10000);runtime.once('error',()=>{clearTimeout(timeout);no(Error('Capture runtime could not start'));});runtime.once('exit',()=>{clearTimeout(timeout);no(Error('Capture runtime exited'));});runtime.stdout.on('data',bytes=>{output+=bytes;const match=output.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+/);if(match){clearTimeout(timeout);yes(match[0]);}});});
 browser=await testBrowser();const page=await browser.contexts()[0].newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewportSize({width:1600,height:1000});
 await page.goto(launch,{waitUntil:'networkidle'});await page.getByLabel('Workspace passphrase',{exact:true}).fill('SYNTHETIC-ONLY-readme-'+randomBytes(16).toString('hex'));await page.getByRole('button',{name:'Create workspace',exact:true}).click();await expect(page.getByLabel('Document name',{exact:true})).toBeVisible();
 const api=async(path,body)=>page.evaluate(async({path,body})=>{const response=await fetch('/api/v1/'+path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});if(!response.ok)throw Error('Synthetic capture API failed: '+path);return response.json();},{path,body});
 for(const [title,text] of samples)await api('commands',{operation:[...randomBytes(32)],request:{command:'create',title,text}});
 await page.reload({waitUntil:'networkidle'});await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();await expect(page.locator('.demo-badge')).toHaveText('Encrypted local workspace');
 const documents=await api('documents',{});for(const [title,text] of samples){const document=documents.find(d=>d.title===title)?.document;if(!document)throw Error('Synthetic capture document missing');const editor=await api('editor',{document});if(editor.text!==text||(await api('snapshot',{document,snapshot:editor.snapshot})).text!==text)throw Error('Synthetic capture source mismatch');}
 for(const file of ['app.js','styles.css']){const served=await page.evaluate(async file=>{const bytes=await(await fetch('/'+file)).arrayBuffer();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');},file);if(served!==sha(await readFile(join(root,'frontend/dist',file))))throw Error('Embedded capture assets differ from the current frontend build');}
 await page.getByRole('tab',{name:'Users',exact:true}).click();await expect(page.locator('#interactionBody')).toContainText('No current agent');await page.getByLabel('Maths display',{exact:true}).selectOption('rendered');
 await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
 if(errors.length||await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Synthetic capture has page errors or desktop overflow');
 await page.screenshot({path:join(root,'docs/assets/desktop-preview.png'),animations:'disabled'});passed=true;console.log('Updated README screenshot from the current embedded HTTPS runtime (1600 × 1000; isolated synthetic data).');
}catch(error){throw Error(String(error.message).replace(/#launch=[a-f0-9]+/g,'#launch=[redacted]'));}
finally{
 await browser?.close();if(runtime?.pid&&runtime.exitCode===null&&runtime.signalCode===null){const exited=new Promise(resolve=>runtime.once('exit',resolve));runtime.kill('SIGTERM');await exited;}
 if(directory)await rm(directory,{recursive:true,force:true});
}
if(passed)await refreshManualRuntime(testedSha,'capture-runtime-readme.mjs');
