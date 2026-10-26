import {exerciseContributors} from './contributors-workflow.mjs';
import {exerciseMergeGraph} from './merge-graph-workflow.mjs';
import {exerciseReviewedMerge} from './merge-workflow.mjs';
import {exerciseAssertionOverlay} from './assertion-workflow.mjs';
import {binaryFingerprint,refreshManualRuntime} from './manual-runtime-update.mjs';
import {testBrowser} from './browser-session.mjs';
// SPDX-License-Identifier: AGPL-3.0-only
// Real HTTPS/SQLite acceptance with synthetic documents only. Never bypass TLS.
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,rm,readFile,readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {createServer} from 'node:net';
import {chromium,webkit,expect} from '@playwright/test';
const compatAt=process.argv.indexOf('--compat-reader'),compatReader=compatAt<0?null:process.argv[compatAt+1];
const engine=process.argv[2]??'chromium';if(!['chromium','webkit'].includes(engine))throw Error('Expected browser: chromium or webkit');
const root=resolve(import.meta.dirname,'../..'),approved='05865badace97aad0cb8abf4460e12f6a1574b812759780052e8ffb486bf8428';
const passphrase='SYNTHETIC-ONLY-runtime-validation-2026',checks=[];
let directory,runtime,browser,page,nativeEnrollmentAttempted=false,keepDirectory=false,passed=false;
const testedSha=await binaryFingerprint();
const check=(condition,message)=>{if(!condition)throw Error(message);};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function start(create,executable=resolve(root,'target/debug/hypergraph')){
 const probe=createServer();await new Promise((yes,no)=>{probe.once('error',no);probe.listen(0,'127.0.0.1',yes);});const port=probe.address().port;await new Promise((yes,no)=>probe.close(error=>error?no(error):yes()));
 runtime=spawn(executable,['--workspace',join(directory,'synthetic.hpx'),...(create?['--create']:[]),'--cert',resolve(root,'artifacts/local-tls/localhost.pem'),'--key',resolve(root,'artifacts/local-tls/localhost-key.pem'),'--port',String(port)],{stdio:['ignore','pipe','pipe']});
 return new Promise((yes,no)=>{let output='';const timer=setTimeout(()=>no(Error('Runtime startup timed out')),10000);runtime.once('error',()=>{clearTimeout(timer);no(Error('Runtime could not start'));});runtime.once('exit',()=>{clearTimeout(timer);no(Error('Runtime exited during startup'));});runtime.stdout.on('data',bytes=>{output+=bytes.toString();const match=output.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+/);if(match){clearTimeout(timer);yes(match[0]);}});});
}
async function stop(signal='SIGTERM'){
 if(runtime?.pid&&runtime.exitCode===null&&runtime.signalCode===null){const exited=new Promise(resolve=>runtime.once('exit',resolve));runtime.kill(signal);await exited;}runtime=null;
}
async function open(url){
 try{await page.goto(url,{waitUntil:'networkidle'});}catch(error){const code=String(error.message).match(/net::ERR_[A-Z_]+/)?.[0]??'navigation_failed';throw Error('Authenticated browser navigation failed: '+code);}
}
async function api(path,body){
 return page.evaluate(async({path,body})=>{const response=await fetch('/api/v1/'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});return {status:response.status,body:await response.json()};},{path,body});
}
async function ok(path,body){const result=await api(path,body);check(result.status===200,'Unexpected API status for '+path+': '+result.status);return result.body;}
async function unlock(create=false){
 await page.getByLabel('Workspace passphrase',{exact:true}).fill(passphrase);await page.getByRole('button',{name:create?'Create workspace':'Unlock workspace',exact:true}).click();
}
async function paste(source){
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+A');
 await editor.evaluate((element,text)=>{const data=new DataTransfer();data.setData('text/plain',text);element.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));},source);
}
async function dropReplies(command,count){
 await page.evaluate(({command,count})=>{const actual=window.fetch.bind(window);window.__acceptanceRestoreFetch=()=>{window.fetch=actual;};window.fetch=async(...args)=>{const response=await actual(...args);if(String(args[0]).endsWith('/api/v1/commands')&&JSON.parse(args[1].body).request.command===command&&count-->0)throw new TypeError('Synthetic lost acknowledgement');return response;};},{command,count});
}
async function restoreReplies(){await page.evaluate(()=>{window.__acceptanceRestoreFetch?.();delete window.__acceptanceRestoreFetch;});}
async function run(){
 const der=execFileSync('/usr/bin/openssl',['x509','-in',resolve(root,'artifacts/local-tls/localhost.pem'),'-outform','DER']);check(digest(der)===approved,'Certificate differs from approved fingerprint; runtime not started');
 await mkdir(resolve(root,'artifacts'),{recursive:true});directory=await mkdtemp(resolve(root,'artifacts/runtime-workflow-'));
 const launch=await start(true);browser=engine==='chromium'?await testBrowser():await webkit.launch({headless:true});const context=browser.contexts()[0]??await browser.newContext();page=context.pages()[0]??await context.newPage();await page.bringToFront();await page.setViewportSize({width:1600,height:1000});page.on('dialog',dialog=>dialog.accept());
 const commands=[];page.on('request',request=>{if(request.url().endsWith('/api/v1/commands'))commands.push(request.postDataJSON());});
 await open(launch);await expect(page.getByRole('button',{name:'Create workspace',exact:true})).toBeVisible();check(!new URL(page.url()).hash,'Launch capability retained in URL');
 const cookie=(await context.cookies()).find(cookie=>cookie.name==='__Host-hpx');check(cookie?.secure&&cookie.httpOnly&&cookie.sameSite==='Strict','Session cookie restrictions missing');checks.push('verified TLS, bootstrap fragment removal and restricted session cookie');
 await unlock(true);await page.getByLabel('Document name',{exact:true}).fill('First synthetic document');await page.getByRole('button',{name:'Create document',exact:true}).click();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();
 const summaries=await ok('documents',{}),first=summaries[0].document,initial=await ok('editor',{document:first});check(initial.text==='','Unexpected initial source');
 const original='SYNTHETIC-CUSTODY-SENTINEL 😀e\u0301\r\nSecond line\nThird\rFourth';await paste(original);
 await expect.poll(async()=>(await ok('editor',{document:first})).text,{timeout:15000}).toBe(original);let state=await ok('editor',{document:first});check(JSON.stringify(state.snapshot)===JSON.stringify(initial.snapshot),'Autosave published immutable history');checks.push('five-second autosave preserves mixed newline/Unicode bytes without committing');
 const offset=commands.length,lost='Lost-save 😀\r\nAcknowledgement',latest='Later typing e\u0301\r\nExact source\n';
 await dropReplies('save',2);await paste(lost);await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.locator('#draftStatus')).toContainText('Save needs attention');check((await ok('editor',{document:first})).text===lost,'Dropped acknowledgement did not reach durable storage');
 await restoreReplies();await paste(latest);await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect.poll(async()=>(await ok('editor',{document:first})).text).toBe(latest);
 const retries=commands.slice(offset);check(retries.length>=4,'Missing retry observations');check(JSON.stringify(retries[0])===JSON.stringify(retries[1])&&JSON.stringify(retries[0])===JSON.stringify(retries[2]),'Unknown save changed operation identity or request');checks.push('lost save replies retry exact operation before queued newer source');
 await dropReplies('commit',2);await page.getByRole('button',{name:'Commit',exact:true}).click();await expect(page.locator('#draftStatus')).toContainText('Save needs attention');const committed=await ok('editor',{document:first}),commitRequest=commands.at(-1);await restoreReplies();await page.getByRole('button',{name:'Commit',exact:true}).click();
 await expect(page.locator('#draftStatus')).not.toContainText('Save needs attention');state=await ok('editor',{document:first});check(JSON.stringify(state.snapshot)===JSON.stringify(committed.snapshot),'Uncertain commit retry created another snapshot');check(JSON.stringify(commands.at(-1))===JSON.stringify(commitRequest),'Commit retry changed operation identity');check((await ok('snapshot',{document:first,snapshot:committed.snapshot})).text===latest,'Committed snapshot differs from exact source');checks.push('unknown commit reconciles one immutable revision/snapshot');
 const creationOffset=commands.length;await page.evaluate(()=>{window.__creationWindowSentinel=true;});await dropReplies('create',2);
 page.removeAllListeners('dialog');page.once('dialog',dialog=>dialog.accept('Second synthetic document'));await page.getByRole('button',{name:'New document',exact:true}).click();await expect(page.getByRole('button',{name:'Retry new document',exact:true})).toBeVisible();page.on('dialog',dialog=>dialog.accept());
 for(const theme of ['dark','light']){if(theme==='light')await page.evaluate(()=>document.body.classList.toggle('light'));for(const width of [1280,2000]){await page.setViewportSize({width,height:1000});await page.screenshot({path:resolve(root,`artifacts/runtime-create-retry-${theme}-${width}.png`),animations:'disabled'});}}await page.evaluate(()=>document.body.classList.toggle('light'));await page.setViewportSize({width:1600,height:1000});
 const typingDuringCreation=latest+'Typing during uncertain creation 😀\r\n';await paste(typingDuringCreation);await restoreReplies();await page.getByRole('button',{name:'Retry new document',exact:true}).click();await expect(page.getByRole('button',{name:'Second synthetic document',exact:true})).toBeVisible();
 check(await page.evaluate(()=>window.__creationWindowSentinel===true),'Document creation reloaded the page');const creations=commands.slice(creationOffset).filter(c=>c.request.command==='create');check(creations.length===3&&creations.every(c=>JSON.stringify(c)===JSON.stringify(creations[0])),'Creation retry changed frozen operation');check((await ok('documents',{})).length===2,'Creation retry duplicated documents');
 await expect.poll(async()=>(await ok('editor',{document:first})).text).toBe(typingDuringCreation);check((await ok('snapshot',{document:first,snapshot:committed.snapshot})).text===latest,'Creating a document implicitly committed the source');
 checks.push('unknown new-document replies reconcile without reload, duplicate creation or losing later source typing');
 await page.getByRole('button',{name:'Second synthetic document',exact:true}).click();const other='Independent second document 😀\r\n';await paste(other);await page.getByRole('button',{name:'Save draft',exact:true}).click();const all=await ok('documents',{}),second=all.find(item=>item.title==='Second synthetic document').document;check((await ok('editor',{document:second})).text===other,'Second document source differs');await page.getByRole('button',{name:'First synthetic document',exact:true}).click();check((await ok('editor',{document:first})).text===typingDuringCreation,'Document switch lost typing during creation');await paste(latest);await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect.poll(async()=>(await ok('editor',{document:first})).text).toBe(latest);checks.push('document creation and switching preserve independent owned buffers');
 await page.getByRole('button',{name:'Lock',exact:true}).click();await expect(page.getByRole('button',{name:'Unlock workspace',exact:true})).toBeVisible();check((await api('editor',{document:first})).status===423,'Locked runtime still exposes editor data');await unlock();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();checks.push('lock drops runtime authority; passphrase unlock restores acknowledged source');
 const recovery='SYNTHETIC-CUSTODY-SENTINEL recovery 😀\r\nUncommitted e\u0301\n';await paste(recovery);await expect.poll(async()=>(await ok('editor',{document:first})).text,{timeout:15000}).toBe(recovery);await stop('SIGKILL');const restarted=await start(false);await open(restarted);await expect(page.getByRole('button',{name:'Unlock workspace',exact:true})).toBeVisible();await unlock();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();check((await ok('editor',{document:first})).text===recovery,'Abrupt restart lost acknowledged draft');check((await ok('editor',{document:second})).text===other,'Restart changed other document');checks.push('abrupt process restart recovers acknowledged uncommitted drafts');
 check((await ok('snapshot',{document:first,snapshot:initial.snapshot})).text==='','Initial historical snapshot changed');check((await ok('snapshot',{document:first,snapshot:committed.snapshot})).text===latest,'Committed historical snapshot changed');const receipt=await ok('commands',commitRequest);check(JSON.stringify(receipt.outcome.snapshot)===JSON.stringify(committed.snapshot),'Persisted retry receipt changed after restart');check((await ok('editor',{document:first})).text===recovery,'Historical receipt retry altered current draft');checks.push('exact old/new historical reconstruction and receipt retry survive restart');
 // Populate a second immutable page, then reload the adapter's exact current base.
 for(let i=0;i<14;i++){const current=await ok('editor',{document:first});await ok('commands',{operation:[...randomBytes(32)],request:{command:'commit',document:first,generation:current.generation,base:current.base,sequence:current.acknowledged_sequence}});}
 await page.reload({waitUntil:'networkidle'});await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();
 const beforeHistory=await ok('editor',{document:first});
 await page.locator('[data-investigation="History"]').click();await expect(page.locator('#investigationBody')).toContainText('History page 1');
 check(await page.locator('#investigationBody').getByRole('button',{name:'View snapshot',exact:true}).count()===12,'History did not bound its first page');
 let observedHistory=0;const observe=request=>{if(request.url().endsWith('/api/v1/history'))observedHistory++;};page.on('request',observe);
 await page.getByRole('textbox',{name:'Markdown document editor'}).click();await page.keyboard.press('ArrowRight');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));check(observedHistory===0,'Selection changes refetched retained history');page.off('request',observe);
 await page.evaluate(()=>{const actual=window.fetch.bind(window);let delay=true;let started;window.__historyStarted=new Promise(resolve=>{started=resolve;});window.__restoreHistoryFetch=()=>{window.fetch=actual;};window.fetch=async(...args)=>{const response=await actual(...args);if(String(args[0]).endsWith('/api/v1/history')&&delay){delay=false;started();await new Promise(resolve=>{window.__releaseHistory=resolve;});}return response;};});
 try{
  await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.evaluate(()=>window.__historyStarted);
  await page.getByRole('button',{name:'Second synthetic document',exact:true}).click();await expect(page.locator('#investigationBody').getByRole('button',{name:'View snapshot',exact:true})).toHaveCount(1);
  await page.evaluate(()=>window.__releaseHistory());await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await expect(page.locator('#investigationBody').getByRole('button',{name:'View snapshot',exact:true})).toHaveCount(1);
 }finally{await page.evaluate(()=>{window.__releaseHistory?.();window.__restoreHistoryFetch?.();delete window.__releaseHistory;delete window.__restoreHistoryFetch;delete window.__historyStarted;});}
 await page.getByRole('button',{name:'First synthetic document',exact:true}).click();await expect(page.locator('#investigationBody').getByRole('button',{name:'View snapshot',exact:true})).toHaveCount(12);
 checks.push('selection changes do not refetch history; stale replies cannot replace another document history');
 await page.getByRole('button',{name:'Older',exact:true}).click();await expect(page.locator('#investigationBody')).toContainText('History page 2');
 const olderPage=await ok('history',{document:first,next:(await ok('history',{document:first,next:null,limit:12})).next,limit:12});
 const historicalIndex=olderPage.entries.findIndex(entry=>JSON.stringify(entry.snapshot)===JSON.stringify(committed.snapshot));check(historicalIndex>=0,'Original committed snapshot not retained on older page');
 await page.locator('#investigationBody').getByRole('button',{name:'View snapshot',exact:true}).nth(historicalIndex).click();
 const historicalDialog=page.getByRole('dialog');await expect(historicalDialog).toContainText('Historical snapshot · read only');check(await historicalDialog.locator('pre').textContent()===latest,'Historical UI substituted current source');
 const downloading=page.waitForEvent('download');await historicalDialog.getByRole('button',{name:'Download snapshot',exact:true}).click();const download=await downloading;check((await readFile(await download.path())).equals(Buffer.from(latest)),'Historical download normalized exact bytes');
 await historicalDialog.getByRole('button',{name:'Close',exact:true}).click();
 await page.locator('#investigationBody').getByRole('button',{name:'Compare with latest committed',exact:true}).nth(historicalIndex).click();
 const comparison=page.getByRole('dialog');await expect(comparison).toContainText('Compare committed snapshots');check(await comparison.getByLabel('Selected historical snapshot',{exact:true}).textContent()===latest,'Comparison changed historical bytes');check(await comparison.getByLabel('Latest committed snapshot',{exact:true}).textContent()===recovery,'Comparison substituted current draft or wrong committed snapshot');
 for(const theme of ['dark','light']){if(theme==='light')await page.evaluate(()=>document.body.classList.toggle('light'));await page.screenshot({path:resolve(root,`artifacts/runtime-history-comparison-${theme}.png`),animations:'disabled'});}await page.evaluate(()=>document.body.classList.toggle('light'));
 await comparison.getByRole('button',{name:'Close',exact:true}).click();
 checks.push('read-only exact historical/current committed snapshot comparison excludes draft edits');
 check(JSON.stringify(await ok('editor',{document:first}))===JSON.stringify(beforeHistory),'History browsing changed the current editor state');
 await page.getByRole('button',{name:'Newer',exact:true}).click();await expect(page.locator('#investigationBody')).toContainText('History page 1');checks.push('bounded two-page history UI and exact historical download leave current state unchanged');

 const clipboardRequest={generation:null,offset:0,limit:16};check((await ok('clipboard',clipboardRequest)).total===0,'Fresh private clipboard is not empty');
 const copyOffset=commands.length;await page.getByRole('textbox',{name:'Markdown document editor'}).focus();await page.keyboard.press('ControlOrMeta+A');
 await dropReplies('clipboard',2);await page.getByRole('button',{name:'Copy source reference',exact:true}).click();await expect(page.getByRole('button',{name:'Retry clipboard operation',exact:true})).toBeVisible();
 const captured=await ok('clipboard',clipboardRequest);check(captured.total===1&&captured.generation===1,'Lost capture reply did not reach private storage');
 await restoreReplies();await page.getByRole('button',{name:'Retry clipboard operation',exact:true}).click();await expect(page.locator('.clipboard .clip-chip')).toHaveCount(1);
 const copies=commands.slice(copyOffset).filter(command=>command.request.command==='clipboard');check(copies.length===3&&copies.every(copy=>JSON.stringify(copy)===JSON.stringify(copies[0])),'Clipboard retry changed its frozen operation');
 check(JSON.stringify(await ok('editor',{document:first}))===JSON.stringify(beforeHistory),'Clipboard capture modified source state or history');
 await page.locator('.clipboard .clip-chip > button').first().click();check(await page.getByRole('dialog').locator('pre').textContent()===recovery,'Captured source preview changed exact bytes');await page.getByRole('button',{name:'Close',exact:true}).click();
 await paste('Uncommitted clipboard source 😀\r\n');await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect.poll(async()=>(await ok('editor',{document:first})).text).toBe('Uncommitted clipboard source 😀\r\n');
 await page.getByRole('textbox',{name:'Markdown document editor'}).focus();await page.keyboard.press('ControlOrMeta+A');await page.getByRole('button',{name:'Copy source reference',exact:true}).click();await expect(page.locator('#toast')).toContainText('Commit this source');check((await ok('clipboard',clipboardRequest)).generation===1,'Uncommitted copy changed private state');
 await paste(recovery);await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect.poll(async()=>(await ok('editor',{document:first})).text).toBe(recovery);
 await stop();await open(await start(false));await expect(page.getByRole('button',{name:'Unlock workspace',exact:true})).toBeVisible();check((await api('clipboard',clipboardRequest)).status===423,'Locked runtime exposes private clipboard');await unlock();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();await expect(page.locator('.clipboard .clip-chip')).toHaveCount(1);
 const restartedClipboard=await ok('clipboard',clipboardRequest);check(JSON.stringify(restartedClipboard.entries[0].id)===JSON.stringify(captured.entries[0].id),'Restart replaced captured reference identity');
 await page.getByRole('button',{name:'Remove captured source from First synthetic document',exact:true}).click();await expect(page.locator('.clipboard .clip-chip')).toHaveCount(0);check((await ok('snapshot',{document:first,snapshot:captured.entries[0].source.snapshot})).text===recovery,'Clipboard removal deleted source history');
 await page.getByRole('textbox',{name:'Markdown document editor'}).focus();await page.keyboard.press('ControlOrMeta+A');await page.getByRole('button',{name:'Copy source reference',exact:true}).click();await expect(page.locator('.clipboard .clip-chip')).toHaveCount(1);
 await page.locator('.clipboard').getByRole('button',{name:'Clear all',exact:true}).click();await expect(page.locator('.clipboard .clip-chip')).toHaveCount(0);
 await page.getByRole('textbox',{name:'Markdown document editor'}).focus();await page.keyboard.press('ControlOrMeta+A');await page.getByRole('button',{name:'Copy source reference',exact:true}).click();await expect(page.locator('.clipboard .clip-chip')).toHaveCount(1);
 checks.push('private clipboard exact capture/retry, uncommitted rejection, locked restart recovery, removal and clear retain source history');
 const forkSource=await ok('editor',{document:first}),forkOffset=commands.length;
 await page.getByRole('textbox',{name:'Markdown document editor'}).focus();await page.keyboard.press('ControlOrMeta+A');
 await page.locator('#forkSelection').click();await page.getByLabel('Fork name',{exact:true}).fill('Durable synthetic fork');
 check(await page.getByRole('dialog').locator('pre').textContent()===recovery,'Fork review normalized source bytes');
 await page.screenshot({path:resolve(root,'artifacts/runtime-fork-review.png'),animations:'disabled'});
 await page.evaluate(()=>document.body.classList.toggle('light'));await page.screenshot({path:resolve(root,'artifacts/runtime-fork-review-light.png'),animations:'disabled'});await page.evaluate(()=>document.body.classList.toggle('light'));
 await dropReplies('fork',2);await page.getByRole('button',{name:'Create fork',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Synthetic lost acknowledgement');
 await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.getByRole('button',{name:'Retry fork',exact:true})).toBeVisible();
 const createdForks=(await ok('documents',{})).filter(d=>d.title==='Durable synthetic fork');check(createdForks.length===1,'Unknown fork reply duplicated output');const forkDocument=createdForks[0].document;
 await restoreReplies();await page.getByRole('button',{name:'Retry fork',exact:true}).click();await expect(page.locator('#documentTitle')).toHaveText('Durable synthetic fork');
 const forkCommands=commands.slice(forkOffset).filter(c=>c.request.command==='fork');check(forkCommands.length===3&&forkCommands.every(c=>JSON.stringify(c)===JSON.stringify(forkCommands[0])),'Fork retry changed frozen intent');
 const initialFork=await ok('editor',{document:forkDocument}),derivation=await ok('derivation',{document:forkDocument});
 check(initialFork.text===recovery&&JSON.stringify(initialFork.node)!==JSON.stringify(forkSource.node),'Fork lost independent identity or exact source');
 check(JSON.stringify(await ok('editor',{document:first}))===JSON.stringify(forkSource),'Fork mutated source draft/history');
 check(derivation.kind==='fork'&&JSON.stringify(derivation.inputs[0].snapshot)===JSON.stringify(forkSource.snapshot)&&JSON.stringify(derivation.outputs[0].snapshot)===JSON.stringify(initialFork.snapshot),'Fork derivation is not pinned');
 const firstForkHistory=await ok('history',{document:forkDocument,next:null,limit:12});check(firstForkHistory.entries.length===1&&firstForkHistory.entries[0].parent===null,'Fork incorrectly shares source revision ancestry');
 await page.locator('[data-investigation="Provenance"]').click();await expect(page.getByRole('button',{name:'Inspect exact fork source',exact:true})).toBeVisible();await page.getByRole('button',{name:'Inspect exact fork source',exact:true}).click();check(await page.getByRole('dialog').locator('pre').textContent()===recovery,'Fork provenance resolved current draft instead of captured source');await page.getByRole('button',{name:'Close',exact:true}).click();
 const editedFork='Independent fork edit 😀\r\n';await paste(editedFork);await page.getByRole('button',{name:'Commit',exact:true}).click();await expect.poll(async()=>(await ok('editor',{document:forkDocument})).text).toBe(editedFork);
 check(JSON.stringify(await ok('derivation',{document:forkDocument}))===JSON.stringify(derivation),'Later revision rewrote original derivation');check((await ok('editor',{document:first})).text===recovery,'Destination edit changed source');
 await stop();await open(await start(false));await expect(page.getByRole('button',{name:'Unlock workspace',exact:true})).toBeVisible();check((await api('derivation',{document:forkDocument})).status===423,'Locked runtime exposes derivation');await unlock();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();
 check(JSON.stringify(await ok('derivation',{document:forkDocument}))===JSON.stringify(derivation),'Restart lost derivation');check((await ok('snapshot',{document:forkDocument,snapshot:initialFork.snapshot})).text===recovery,'Restart lost initial fork snapshot');
 checks.push('durable independent fork with frozen lost-reply recovery, exact provenance inspection, separate edits/history and locked restart recovery');
 const assertionBaseline=await exerciseAssertionOverlay({page,ok,first,recovery,paste,dropReplies,restoreReplies,commands,check,root,checks});
 const mergeBaseline=await exerciseReviewedMerge({page,ok,api,first,forkDocument,recovery,root,commands,dropReplies,restoreReplies,start,stop,open,unlock,check,checks});
 const capability=await ok('runtime');
 if(capability.keychain_supported){
  await page.getByRole('button',{name:'Keychain',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Keep your passphrase for recovery');
  await page.screenshot({path:resolve(root,'artifacts/runtime-keychain-before-enrollment.png'),animations:'disabled'});
  nativeEnrollmentAttempted=true;await page.getByRole('button',{name:'Enable keychain unlock',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Keychain enrollment confirmed',{timeout:30000});await page.getByRole('button',{name:'Close',exact:true}).click();
  check((await ok('keychain/status',{})).enrolled,'UI enrollment was not durable');
  await page.getByRole('button',{name:'Lock',exact:true}).click();await expect(page.getByRole('button',{name:'Unlock with macOS Keychain',exact:true})).toBeVisible();
  await page.screenshot({path:resolve(root,'artifacts/runtime-keychain-unlock.png'),animations:'disabled'});
  await page.getByRole('button',{name:'Unlock with macOS Keychain',exact:true}).click();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible({timeout:30000});
  check((await ok('editor',{document:first})).text===beforeHistory.text,'Native UI unlock changed source');
  await page.getByRole('button',{name:'Lock',exact:true}).click();await expect(page.getByRole('button',{name:'Unlock workspace',exact:true})).toBeVisible();await unlock();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();
  await page.getByRole('button',{name:'Keychain',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Your passphrase remains available');await page.screenshot({path:resolve(root,'artifacts/runtime-keychain-enrolled.png'),animations:'disabled'});
  await page.getByRole('button',{name:'Remove keychain unlock',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Keychain enrollment removed.');nativeEnrollmentAttempted=false;await page.getByRole('button',{name:'Close',exact:true}).click();
  check(!(await ok('keychain/status',{})).enrolled,'UI removal retained enrollment');checks.push('explicit keychain UI enrollment, native unlock, passphrase fallback and scoped removal');
 }
 if(compatReader){
  check(digest(await readFile(compatReader))===compatReader.split('/').at(-1),'Compatibility binary does not match its immutable snapshot name');
  const privateHash=()=>execFileSync('python3',['-c','import sqlite3,sys,pathlib,hashlib; db=sqlite3.connect(pathlib.Path(sys.argv[1]).as_uri()+"?mode=ro",uri=True); rows=db.execute("SELECT id,generation,envelope FROM slots WHERE kind>=10 UNION ALL SELECT id,0,envelope FROM objects WHERE kind>=10 ORDER BY id").fetchall(); h=hashlib.sha256(); [(h.update(i),h.update(g.to_bytes(8,"big")),h.update(e)) for i,g,e in rows]; print(h.hexdigest())',join(directory,'synthetic.hpx')],{encoding:'utf8'}).trim();
  const protectedBefore=privateHash(),before=await ok('clipboard',clipboardRequest);
  await stop();await open(await start(false,compatReader));await unlock();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();
  check(!(await ok('runtime')).capabilities.includes('private_clipboard'),'Compatibility reader already implements the new clipboard');
  const old=await ok('editor',{document:first});check(old.text===recovery,'Old reader changed current source');
  const saved=await ok('commands',{operation:[...randomBytes(32)],request:{command:'save',document:first,generation:old.generation,base:old.base,previous_sequence:old.acknowledged_sequence,sequence:old.acknowledged_sequence+1,text:old.text}});
  await ok('commands',{operation:[...randomBytes(32)],request:{command:'commit',document:first,generation:saved.outcome.generation,base:old.base,sequence:saved.outcome.sequence}});
  const oldFork=await ok('editor',{document:forkDocument});check(oldFork.text===editedFork,'Old reader lost fork content');
  const oldForkSaved=await ok('commands',{operation:[...randomBytes(32)],request:{command:'save',document:forkDocument,generation:oldFork.generation,base:oldFork.base,previous_sequence:oldFork.acknowledged_sequence,sequence:oldFork.acknowledged_sequence+1,text:oldFork.text}});
  await ok('commands',{operation:[...randomBytes(32)],request:{command:'commit',document:forkDocument,generation:oldForkSaved.outcome.generation,base:oldFork.base,sequence:oldForkSaved.outcome.sequence}});
  const oldMerge=await ok('editor',{document:mergeBaseline.document});check(oldMerge.text===mergeBaseline.text,'Old reader lost reviewed synthesis content');
  const oldMergeSaved=await ok('commands',{operation:[...randomBytes(32)],request:{command:'save',document:mergeBaseline.document,generation:oldMerge.generation,base:oldMerge.base,previous_sequence:oldMerge.acknowledged_sequence,sequence:oldMerge.acknowledged_sequence+1,text:oldMerge.text}});
  await ok('commands',{operation:[...randomBytes(32)],request:{command:'commit',document:mergeBaseline.document,generation:oldMergeSaved.outcome.generation,base:oldMerge.base,sequence:oldMergeSaved.outcome.sequence}});
  check(privateHash()===protectedBefore,'Old reader rewrote optional protected clipboard/derivation state');
  await stop();await open(await start(false));await unlock();await expect(page.locator('.clipboard .clip-chip')).toHaveCount(1);
  check(JSON.stringify(await ok('clipboard',clipboardRequest))===JSON.stringify(before),'Old reader changed the pinned private reference');
  check(JSON.stringify(await ok('derivation',{document:forkDocument}))===JSON.stringify(derivation),'Old reader changed pinned derivation');
  check(JSON.stringify(await ok('assertions',assertionBaseline.input))===JSON.stringify(assertionBaseline.view),'Old reader changed versioned assertion overlay');
  check(JSON.stringify(await ok('merge',{document:mergeBaseline.document}))===JSON.stringify(mergeBaseline.event),'Old reader changed reviewed synthesis evidence');
  checks.push('pre-clipboard/fork/assertion reader opens/saves/commits both documents while preserving optional ciphertext and exact overlays byte-for-byte');
 }
 await page.locator('[data-investigation="History"]').click();await expect(page.locator('#investigationBody')).toContainText('History page 1');


 const capturedBeforeFork=await ok('clipboard',clipboardRequest),newerSource='Newer uncommitted source 😀\r\n';
 await paste(newerSource);await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect.poll(async()=>(await ok('editor',{document:first})).text).toBe(newerSource);
 const newerEditor=await ok('editor',{document:first});
 await page.locator('[data-investigation="History"]').click();await page.locator('#investigationBody').getByRole('button',{name:'Compare with latest committed',exact:true}).first().click();await expect(page.getByRole('dialog')).toContainText('These snapshots contain exactly the same bytes.');check(await page.getByRole('dialog').getByLabel('Latest committed snapshot',{exact:true}).textContent()===recovery,'Comparison included newer uncommitted draft');check((await ok('editor',{document:first})).text===newerSource,'Read-only comparison changed draft');await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();

 await page.locator('.clipboard .clip-chip > button').first().click();check(await page.getByRole('dialog').locator('pre').textContent()===recovery,'Captured fork review followed newer source');await page.getByLabel('Fork name',{exact:true}).fill('Captured historic fork');
 for(const theme of ['dark','light']){if(theme==='light')await page.evaluate(()=>document.body.classList.toggle('light'));await page.screenshot({path:resolve(root,`artifacts/runtime-captured-fork-${theme}.png`),animations:'disabled'});}await page.evaluate(()=>document.body.classList.toggle('light'));
 await page.getByRole('button',{name:'Fork captured source',exact:true}).click();await expect(page.locator('#documentTitle')).toHaveText('Captured historic fork');
 const historicFork=(await ok('documents',{})).find(d=>d.title==='Captured historic fork').document;
 check((await ok('editor',{document:historicFork})).text===recovery,'Captured-reference fork changed exact historical bytes');
 check(JSON.stringify(await ok('editor',{document:first}))===JSON.stringify(newerEditor),'Captured-reference fork saved or committed newer source');
 check(JSON.stringify(await ok('clipboard',clipboardRequest))===JSON.stringify(capturedBeforeFork),'Fork consumed or changed protected reference');
 const historicDerivation=await ok('derivation',{document:historicFork});check(JSON.stringify(historicDerivation.inputs[0])===JSON.stringify(capturedBeforeFork.entries[0].source),'Captured-reference fork changed pinned binding');
 await stop();await open(await start(false));await unlock();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();check(JSON.stringify(await ok('derivation',{document:historicFork}))===JSON.stringify(historicDerivation),'Restart changed captured-reference derivation');
 await paste(recovery);await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect.poll(async()=>(await ok('editor',{document:first})).text).toBe(recovery);
 checks.push('reviewed historical clipboard Fork preserves newer uncommitted source, pinned input and private reference across restart');

 const widgetSource='# Widget capture\r\n\r\nBefore the table.\r\n\r\n| Term | Value |\r\n| --- | --- |\r\n| Exact 😀 | e\u0301 |\r\n\r\n$$\r\nE=mc^2\r\n$$\r\n\r\n## After widgets\r\n\r\nExact text below table and maths.\r\n';
 await page.getByRole('button',{name:'Second synthetic document',exact:true}).click();await paste(widgetSource);await page.getByRole('button',{name:'Commit',exact:true}).click();await expect.poll(async()=>(await ok('editor',{document:second})).text).toBe(widgetSource);
 await page.getByRole('textbox',{name:'Markdown document editor'}).focus();await page.keyboard.press('ControlOrMeta+A');await page.getByRole('button',{name:'Copy source reference',exact:true}).click();await expect(page.locator('.clipboard .clip-chip')).toHaveCount(2);
 await page.getByRole('button',{name:'First synthetic document',exact:true}).click();
 const beforeGraph=await ok('editor',{document:first});
 await page.getByRole('textbox',{name:'Markdown document editor'}).focus();await page.keyboard.press('ControlOrMeta+A');
 await page.locator('[data-lens="Graph"]').click();await page.getByRole('button',{name:'Choose graph nodes',exact:true}).click();
 const graphDialog=page.getByRole('dialog');await expect(graphDialog).toContainText('Role lines identify historical participants');
 for(const box of await graphDialog.getByRole('checkbox').all())await box.check();
 await graphDialog.getByRole('button',{name:'Show graph',exact:true}).click();await expect(graphDialog.locator('.graph-node')).toHaveCount(5);await expect(graphDialog.locator('.graph-edge')).toHaveCount(2);
 const graphIds=(await ok('documents',{})).map(d=>d.document),graphProjection=await ok('graph',{documents:graphIds});check(graphProjection.nodes.length===5&&graphProjection.edges.length===2,'Graph query lost selected document/fork scope');
 await graphDialog.locator('.graph-edge').first().focus();await page.keyboard.press('Enter');await expect(graphDialog.locator('.graph-inspection')).toContainText('Recorded Fork');await graphDialog.getByRole('button',{name:'Inspect exact fork source',exact:true}).click();check(await page.getByRole('dialog').filter({hasText:'Graph fork source · read only'}).locator('pre').textContent()===recovery,'Graph replaced pinned source with current document');await page.getByRole('button',{name:'Close source',exact:true}).click();
 for(const theme of ['dark','light']){if(theme==='light')await page.evaluate(()=>document.body.classList.toggle('light'));for(const width of [1280,1600,2000]){await page.setViewportSize({width,height:1000});await page.screenshot({path:resolve(root,`artifacts/runtime-graph-${theme}-${width}.png`),animations:'disabled'});check(await graphDialog.evaluate(d=>{const r=d.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}),'Graph dialog exceeds desktop bounds');}}await page.evaluate(()=>document.body.classList.toggle('light'));await page.setViewportSize({width:1600,height:1000});
 await page.evaluate(()=>{const actual=window.fetch.bind(window);window.__restoreGraphFetch=()=>{window.fetch=actual;};window.fetch=async(...args)=>{const response=await actual(...args);if(String(args[0]).endsWith('/api/v1/graph')){window.__graphStarted=true;await new Promise(resolve=>{window.__releaseGraph=resolve;});}return response;};});
 try{
  await graphDialog.getByRole('button',{name:'Show graph',exact:true}).click();await expect.poll(()=>page.evaluate(()=>!!window.__graphStarted)).toBe(true);
  const firstBox=graphDialog.getByRole('checkbox').first();await firstBox.uncheck();await expect(graphDialog.locator('.graph-node')).toHaveCount(0);await page.evaluate(()=>window.__releaseGraph());await expect(graphDialog.getByRole('status')).toContainText('Selection changed');await firstBox.check();
 }finally{await page.evaluate(()=>{window.__releaseGraph?.();window.__restoreGraphFetch?.();delete window.__releaseGraph;delete window.__restoreGraphFetch;delete window.__graphStarted;});}
 await graphDialog.getByRole('button',{name:'Close',exact:true}).click();
 const selectedAfterGraph=await page.getByRole('textbox',{name:'Markdown document editor'}).evaluate(element=>{const data=new DataTransfer();element.dispatchEvent(new ClipboardEvent('copy',{bubbles:true,cancelable:true,clipboardData:data}));return data.getData('text/plain');});check(selectedAfterGraph===recovery,'Graph changed exact editor selection');
 check(JSON.stringify(await ok('editor',{document:first}))===JSON.stringify(beforeGraph),'Graph inspection mutated editor/head/history');
 await page.locator('[data-lens="Workspace"]').click();checks.push('read-only selected document/Fork graph with labelled nodes/direction, exact source inspection, stale-result isolation and desktop themes/widths preserves source/selection');
 await page.locator('[data-lens="Graph"]').click();await page.getByRole('button',{name:'Choose graph nodes',exact:true}).click();const semanticGraphDialog=page.getByRole('dialog');
 await semanticGraphDialog.getByRole('button',{name:'Load retained assertions',exact:true}).click();await semanticGraphDialog.getByRole('checkbox',{name:/Grouped claims/}).check();await semanticGraphDialog.getByRole('button',{name:'Show graph',exact:true}).click();
 await expect(semanticGraphDialog.locator('.graph-node')).toHaveCount(2);await expect(semanticGraphDialog.locator('.graph-node[data-kind="assertion"]')).toHaveCount(1);await expect(semanticGraphDialog.locator('.graph-edge[data-kind="participant"]')).toHaveCount(3);check(await semanticGraphDialog.locator('.graph-edge[data-kind="participant"] [marker-end]').count()===0,'Role incidence was rendered as an inferred causal/logical arrow');
 const overlayProjection=await ok('graph/overlay',{nodes:[{kind:'document',document:first},{kind:'assertion',node:assertionBaseline.nary}]});check(overlayProjection.edges.length===3&&overlayProjection.nodes.length===2,'N-ary projection became independent binary facts');
 await semanticGraphDialog.locator('.graph-edge[data-kind="participant"]').first().focus();await page.keyboard.press('Enter');await semanticGraphDialog.getByRole('button',{name:'Inspect exact participant source',exact:true}).click();check(await page.getByRole('dialog').filter({hasText:'Graph assertion participant · read only'}).locator('pre').textContent()===assertionBaseline.narySource,'Graph incidence substituted current source text');await page.getByRole('button',{name:'Close source',exact:true}).click();
 await semanticGraphDialog.locator('.graph-node[data-kind="assertion"]').focus();await page.keyboard.press('Enter');await expect(semanticGraphDialog.locator('.graph-inspection')).toContainText('not a checked proof');
 for(const theme of ['dark','light']){if(theme==='light')await page.evaluate(()=>document.body.classList.toggle('light'));for(const width of [1280,1600,2000]){await page.setViewportSize({width,height:1000});await page.screenshot({path:resolve(root,`artifacts/runtime-overlay-graph-${theme}-${width}.png`),animations:'disabled'});}}await page.evaluate(()=>document.body.classList.toggle('light'));await page.setViewportSize({width:1600,height:1000});
 await page.evaluate(()=>{const actual=window.fetch.bind(window);window.__restoreOverlayGraph=()=>{window.fetch=actual;};window.fetch=async(...args)=>{const response=await actual(...args);if(String(args[0]).endsWith('/api/v1/graph/overlay')){window.__overlayGraphStarted=true;await new Promise(resolve=>{window.__releaseOverlayGraph=resolve;});}return response;};});
 try{await semanticGraphDialog.getByRole('button',{name:'Show graph',exact:true}).click();await expect.poll(()=>page.evaluate(()=>!!window.__overlayGraphStarted)).toBe(true);await semanticGraphDialog.getByRole('checkbox',{name:/Grouped claims/}).uncheck();await page.evaluate(()=>window.__releaseOverlayGraph());await expect(semanticGraphDialog.locator('.graph-node')).toHaveCount(0);await expect(semanticGraphDialog.getByRole('status')).toContainText('Selection changed');}
 finally{await page.evaluate(()=>{window.__releaseOverlayGraph?.();window.__restoreOverlayGraph?.();delete window.__releaseOverlayGraph;delete window.__restoreOverlayGraph;delete window.__overlayGraphStarted;});}
 await semanticGraphDialog.getByRole('button',{name:'Close',exact:true}).click();await page.locator('[data-lens="Workspace"]').click();check(JSON.stringify(await ok('editor',{document:first}))===JSON.stringify(beforeGraph),'Semantic graph mutated source/head/history');
 const selectedAfterSemanticGraph=await page.getByRole('textbox',{name:'Markdown document editor'}).evaluate(element=>{const data=new DataTransfer();element.dispatchEvent(new ClipboardEvent('copy',{bubbles:true,cancelable:true,clipboardData:data}));return data.getData('text/plain');});check(selectedAfterSemanticGraph===recovery,'Semantic graph changed exact editor selection');
 checks.push('selected assertion node graph preserves three ordered n-ary incidences, exact historical ranges, evidence status and stale-view isolation in desktop themes/widths');
 await exerciseMergeGraph({page,ok,first,mergeBaseline,recovery,root,check,checks});
 for(let index=(await ok('documents',{})).length+1;index<=17;index++)await ok('commands',{operation:[...randomBytes(32)],request:{command:'create',title:`Graph boundary node ${index}`,text:'Synthetic graph boundary only.'}});
 const boundaryDocuments=(await ok('documents',{})).map(d=>d.document);check((await api('graph',{documents:boundaryDocuments})).status===400,'Graph accepted more than 16 selected nodes');
 await page.reload({waitUntil:'networkidle'});await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();await page.locator('[data-lens="Graph"]').click();await page.getByRole('button',{name:'Choose graph nodes',exact:true}).click();
 const boundaryDialog=page.getByRole('dialog');for(const box of await boundaryDialog.getByRole('checkbox').all())await box.check();await boundaryDialog.getByRole('button',{name:'Show graph',exact:true}).click();await expect(boundaryDialog.getByRole('status')).toContainText('between 1 and 16');await expect(boundaryDialog.locator('.graph-node')).toHaveCount(0);
 await boundaryDialog.getByRole('checkbox').last().uncheck();await boundaryDialog.getByRole('button',{name:'Show graph',exact:true}).click();await expect(boundaryDialog.locator('.graph-node')).toHaveCount(16);
 for(const theme of ['dark','light']){if(theme==='light')await page.evaluate(()=>document.body.classList.toggle('light'));await page.screenshot({path:resolve(root,`artifacts/runtime-graph-limit-${theme}.png`),animations:'disabled'});}await page.evaluate(()=>document.body.classList.toggle('light'));
 await boundaryDialog.getByRole('button',{name:'Close',exact:true}).click();await page.locator('[data-lens="Workspace"]').click();check(JSON.stringify(await ok('editor',{document:first}))===JSON.stringify(beforeGraph),'Bounded graph query changed source or history');
 checks.push('graph 16-node boundary renders, while 17-node selections reject without partial output or source writes');
 await exerciseContributors({page,ok,api,first,second,start,stop,open,unlock,root,check,checks});
 for(const file of ['app.js','styles.css','assets/logo.png']){const served=await page.evaluate(async file=>{const bytes=await(await fetch('/'+file)).arrayBuffer();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');},file);check(served===digest(await readFile(resolve(root,'frontend/dist',file))),'Embedded/development asset mismatch: '+file);}check(await page.locator('.brand img').evaluate(img=>img.complete&&img.naturalWidth===1245&&img.naturalHeight===1254),'Provided logo failed to render');check(await page.evaluate(async()=>(await fetch('/assets/logo.png')).headers.get('content-type'))==='image/png','Logo MIME type is incorrect');checks.push('embedded application/style/logo assets match built development assets and supplied logo renders');
 await expect(page.locator('.document-bar .subtle')).toHaveText('Local workspace');
 for(const theme of ['dark','light']){
  if(theme==='light')await page.getByRole('button',{name:'Switch theme',exact:true}).click();
  for(const width of [1280,1600,2000]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,grid:getComputedStyle(document.querySelector('.workspace')).gridTemplateColumns}));if(overflow.scroll>overflow.width){await page.screenshot({path:resolve(root,'artifacts/runtime-layout-overflow.png')});throw Error('Live runtime layout overflow: '+JSON.stringify(overflow));}
   await page.screenshot({path:resolve(root,`artifacts/runtime-workflow-${engine}-${theme}-${width}.png`),animations:'disabled'});
   if(width===1600){
    await page.getByRole('button',{name:'Second synthetic document',exact:true}).click();await page.getByLabel('Maths display',{exact:true}).selectOption('rendered');await page.getByRole('button',{name:'After widgets',exact:true}).click();
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:resolve(root,`artifacts/runtime-clipboard-widgets-${theme}.png`),animations:'disabled'});
    check((await ok('editor',{document:second})).text===widgetSource,'Private clipboard or rendered widgets changed exact source');await page.getByRole('button',{name:'First synthetic document',exact:true}).click();
   }
   if(width!==1600){await page.getByRole('button',{name:'Keychain',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();const box=await page.getByRole('dialog').boundingBox();check(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width,'Keychain dialog exceeds desktop viewport');await page.screenshot({path:resolve(root,`artifacts/runtime-keychain-${theme}-${width}.png`),animations:'disabled'});await page.getByRole('button',{name:'Close',exact:true}).click();}

  }
 }
 checks.push('live runtime labels, private clipboard and layout at 1280/1600/2000 in both themes, including below table/math replacements');
 for(const name of await readdir(directory)){const file=join(directory,name);if(!(await stat(file)).isFile())continue;const bytes=await readFile(file);for(const needle of ['SYNTHETIC-REVIEWED-MERGE','SYNTHETIC-CUSTODY-SENTINEL',passphrase,'First synthetic document'])check(!bytes.includes(Buffer.from(needle)),'Plaintext sentinel present in encrypted workspace files');}checks.push('workspace/database sidecars contain no tested plaintext sentinels');
 await writeFile(resolve(root,'artifacts/runtime-workflow-'+engine+'.json'),JSON.stringify({browser:engine,checks,synthetic:true,trust:'approved user leaf SSL across localhost/127.0.0.1 SANs; validation enabled'},null,2));passed=true;console.log('PASS: '+engine+' real HTTPS/SQLite workflow ('+checks.length+' checks, synthetic documents only); validation complete, cleaning isolated test resources');
}
try{await run();}catch(error){console.error('FAIL: '+String(error.message).replace(/#launch=[a-f0-9]+/g,'#launch=[redacted]'));process.exitCode=1;}finally{
 if(nativeEnrollmentAttempted){
  try{const status=await ok('keychain/status',{});if(!status.enrolled&&!status.cleanup_pending)throw Error('Unconfirmed native outcome');if((await ok('runtime')).locked)await ok('unlock',{passphrase});await ok('keychain/remove',{});nativeEnrollmentAttempted=false;}
  catch{keepDirectory=true;process.exitCode=1;console.error('Synthetic native cleanup needs attention; retained isolated artifacts/runtime-workflow-* workspace for scoped recovery.');}
 }
 await browser?.close();await stop();if(directory&&!keepDirectory)await rm(directory,{recursive:true,force:true});
}

if(passed&&!process.exitCode)await refreshManualRuntime(testedSha,'check-runtime-workflow.mjs');
