import {publicationContributors} from './publication-contributors.js';
/** Real single-owner runtime boundary. No fixture operations or browser persistence. */
import {RuntimeClipboard} from './runtime-clipboard.js';
import {validAssertionSource} from './runtime-assertions.js';
import {RuntimeAssertions} from './runtime-assertions.js';
import {capturedAssertion} from './captured-assertion.js';
import {documentForkGraph} from './document-fork-graph.js';
import {overlayGraph} from './overlay-graph.js';
export function operationId(){return [...crypto.getRandomValues(new Uint8Array(32))];}
const idString=id=>id.map(byte=>byte.toString(16).padStart(2,'0')).join('');
export async function runtimeRequest(path,body){
 const response=await fetch('/api/v1/'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 const value=await response.json();if(!response.ok){const error=new Error(value.error||'Runtime request failed');error.status=response.status;throw error;}return value;
}
const sameId=(a,b)=>validId(a)&&validId(b)&&a.every((byte,i)=>byte===b[i]);
const validId=id=>Array.isArray(id)&&id.length===32&&id.every(byte=>Number.isInteger(byte)&&byte>=0&&byte<=255);
const counter=n=>Number.isSafeInteger(n)&&n>=0;
function frozenCopy(value){const copy=structuredClone(value);const freeze=item=>{if(item&&typeof item==='object'){for(const child of Object.values(item))freeze(child);Object.freeze(item);}return item;};return freeze(copy);}
async function retryTransport(request,path,body){
 for(let attempt=0;attempt<2;attempt++){
  try{return await request(path,body);}catch(error){if(error.status||attempt===1)throw error;}
 }
}
export class RuntimeAdapter {
 constructor(states,request=runtimeRequest){
  this.request=request;this.docs=new Map();this.privateClipboard=new RuntimeClipboard(request,operationId);this.assertions=new RuntimeAssertions(request,operationId);this.queues=new Map();this.lifecycle='unlocked';this.lockPromise=null;this.creationPending=null;this.creationRegistersEditor=false;this.forkPending=null;this.mergePending=null;
  for(const input of states)this.registerEditor(input);
 }
 registerEditor(input){
  const state=structuredClone(input);
  if(!validId(state.document)||!validId(state.base)||!validId(state.snapshot)||!counter(state.generation)||!counter(state.acknowledged_sequence)||typeof state.text!=='string'||!state.text.isWellFormed())throw Error('Invalid runtime editor state');
  const id=idString(state.document);if(this.docs.has(id))throw Error('Duplicate runtime document');
  this.docs.set(id,{id,title:state.title,source:state.text,sequence:state.acknowledged_sequence,acknowledged:state.acknowledged_sequence,runtime:state,pending:null,error:null});return this.get(id);
 }
 async sendMerge(){
  if(!this.mergePending)throw Error('No pending merge');
  const frozen=this.mergePending;let receipt;
  try{receipt=await retryTransport(this.request,'commands',frozen);}catch(error){if(error.status>=400&&error.status<500)this.mergePending=null;throw error;}
  const result=receipt?.outcome;
  if(!sameId(receipt?.operation,frozen.operation)||result?.result!=='merged'||!['document','transformation','revision','snapshot'].every(key=>validId(result[key]))||frozen.request.plan.inputs.some(input=>sameId(result.document,input.source.document)))throw Error('Mismatched merge receipt');
  const id=idString(result.document);
  if(!this.docs.has(id)){
   const state=await this.request('editor',{document:result.document});
   if(!sameId(state?.document,result.document)||!validId(state.node)||!validId(state.occurrence)||frozen.request.plan.inputs.some(input=>sameId(state.node,input.source.node)))throw Error('Invalid merge editor state');
   this.registerEditor(state);
  }
  this.mergePending=null;return this.get(id);
 }
 retryMerge(){this.requireUnlocked();return this.serialise('merge',()=>this.sendMerge());}
 mergeSources(input){
  this.requireUnlocked();if(this.mergePending)throw Error('Retry the pending merge before creating another');
  const plan=frozenCopy(input),bytes=v=>new TextEncoder().encode(v).length;if(bytes(JSON.stringify(plan))>14*1024*1024-1024)throw Error('Reviewed merge exceeds the encoded request limit');
  if(typeof plan.title!=='string'||!plan.title.isWellFormed()||!plan.title.trim()||bytes(plan.title)>512||typeof plan.text!=='string'||!plan.text.isWellFormed()||!plan.text.length||bytes(plan.text)>2*1024*1024||!Array.isArray(plan.inputs)||plan.inputs.length<2||plan.inputs.length>8)throw Error('Invalid reviewed merge');
  let total=0;for(const i of plan.inputs){if(!validAssertionSource(i.source)||i.expected_draft!==null||typeof i.quote!=='string'||!i.quote.isWellFormed()||bytes(i.quote)!==i.source.end_byte-i.source.start_byte)throw Error('Invalid exact merge input');total+=bytes(i.quote);}if(total>2*1024*1024)throw Error('Combined merge inputs exceed 2 MiB');
  return this.serialise('merge',()=>{if(this.mergePending)throw Error('Retry the pending merge before creating another');this.mergePending=frozenCopy({operation:operationId(),request:{command:'merge',plan}});return this.sendMerge();});
 }
 async sendFork(){
  if(!this.forkPending)throw Error('No pending fork');
  const frozen=this.forkPending;let receipt;
  try{receipt=await retryTransport(this.request,'commands',frozen);}catch(error){if(error.status>=400&&error.status<500)this.forkPending=null;throw error;}
  const result=receipt?.outcome;
  if(!sameId(receipt?.operation,frozen.operation)||result?.result!=='forked'||!['document','transformation','revision','snapshot'].every(key=>validId(result[key]))||sameId(result.document,frozen.request.plan.source.document))throw Error('Mismatched fork receipt');
  const id=idString(result.document);
  if(!this.docs.has(id)){
   const state=await this.request('editor',{document:result.document});
   if(!sameId(state?.document,result.document)||!validId(state.node)||!validId(state.occurrence)||sameId(state.node,frozen.request.plan.source.node))throw Error('Invalid fork editor state');
   this.registerEditor(state);
  }
  this.forkPending=null;return this.get(id);
 }
 retryFork(){this.requireUnlocked();return this.serialise('fork',()=>this.sendFork());}
 forkSource(id,startByte,endByte,quote,title){
  this.requireUnlocked();const captured=this.get(id);
  if(this.forkPending)throw Error('Retry the pending fork before creating another');
  if(typeof title!=='string'||!title.trim()||new TextEncoder().encode(title).length>512||!title.isWellFormed())throw Error('Invalid fork name');
  if(!counter(startByte)||!counter(endByte)||startByte>=endByte||typeof quote!=='string'||!quote.isWellFormed())throw Error('Invalid source selection');
  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before forking');
  return this.serialise(id,()=>this.serialise('fork',async()=>{
   if(this.forkPending)throw Error('Retry the pending fork before creating another');
   const d=this.docs.get(id);
   if(d.runtime.generation!==captured.runtime.generation||!sameId(d.runtime.base,captured.runtime.base))throw Error('Source changed; select the source again');
   const snapshot=await this.request('snapshot',{document:captured.runtime.document,snapshot:captured.runtime.snapshot});
   if(snapshot.text!==captured.source)throw Error('Commit this source before forking');
   if(!validId(captured.runtime.node)||!validId(captured.runtime.occurrence))throw Error('Invalid fork source identity');
   const source={document:captured.runtime.document,node:captured.runtime.node,snapshot:captured.runtime.snapshot,revision:captured.runtime.base,occurrence_path:[captured.runtime.occurrence],start_byte:startByte,end_byte:endByte};
   this.forkPending=frozenCopy({operation:operationId(),request:{command:'fork',plan:{title,source,expected_draft:{generation:captured.runtime.generation,sequence:captured.acknowledged},quote}}});
   return this.sendFork();
  }));
 }
 forkReference(source,quote,title){
  this.requireUnlocked();
  if(this.forkPending)throw Error('Retry the pending fork before creating another');
  if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid fork name');
  if(!source||!['document','node','snapshot','revision'].every(k=>validId(source[k]))||!Array.isArray(source.occurrence_path)||source.occurrence_path.length!==1||!source.occurrence_path.every(validId)||!counter(source.start_byte)||!counter(source.end_byte)||source.end_byte<=source.start_byte||typeof quote!=='string'||!quote.isWellFormed()||new TextEncoder().encode(quote).length!==source.end_byte-source.start_byte)throw Error('Invalid captured source');
  const plan=frozenCopy({title,source,expected_draft:null,quote});
  return this.serialise('fork',async()=>{
   if(this.forkPending)throw Error('Retry the pending fork before creating another');
   this.forkPending=frozenCopy({operation:operationId(),request:{command:'fork',plan}});return this.sendFork();
  });
 }
 publicationContributors(id,snapshot,cursor=null,limit=16){this.requireUnlocked();const d=this.get(id);return publicationContributors(this.request,d.runtime.document,snapshot??d.runtime.snapshot,cursor,limit);}
 assertionRevision(node,revision){this.requireUnlocked();return this.assertions.revision(node,revision);}
 assertionPage(id,generation=null,offset=0){this.requireUnlocked();const d=this.get(id);return this.assertions.page(d.runtime.document,d.runtime.snapshot,generation,offset);}
 retryAssertion(){this.requireUnlocked();return this.serialise('assertions',()=>this.assertions.retry());}
 createCapturedAssertion(input){this.requireUnlocked();const mutation=frozenCopy(capturedAssertion(input));return this.serialise('assertions',()=>this.assertions.mutate(mutation));}
 reviewAssertion(entry,status){this.requireUnlocked();return this.serialise('assertions',()=>this.assertions.mutate({action:'review',node:entry.record.node,revision:entry.revision,generation:entry.generation,status}));}
 createAssertion(id,inputs,fields){
  this.requireUnlocked();const captured=this.get(id),plan=frozenCopy({inputs,fields});
  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before proposing a relationship');
  return this.serialise(id,()=>this.serialise('assertions',async()=>{
   const d=this.docs.get(id);if(d.runtime.generation!==captured.runtime.generation||!sameId(d.runtime.base,captured.runtime.base))throw Error('Source changed; select the participants again');
   const snapshot=await this.request('snapshot',{document:captured.runtime.document,snapshot:captured.runtime.snapshot});if(snapshot.text!==captured.source)throw Error('Commit this source before proposing a relationship');
   const participants=plan.inputs.map(input=>({role:input.role,source:{document:captured.runtime.document,node:captured.runtime.node,snapshot:captured.runtime.snapshot,revision:captured.runtime.base,occurrence_path:[captured.runtime.occurrence],start_byte:input.start_byte,end_byte:input.end_byte},expected_draft:{generation:captured.runtime.generation,sequence:captured.acknowledged},quote:input.quote}));
   const predicate=plan.fields.custom?{kind:'declared',label:plan.fields.name,description:'Owner-declared relationship; its interpretation is qualified by the assertion scope.',roles:[{id:'source',label:'Source participant'},{id:'target',label:'Target participant'}]}:{kind:'registered',choice:plan.fields.predicateId};
   return this.assertions.mutate({action:'create',predicate,participants,properties:plan.fields.properties});
  }));
 }
 async transformationGraph(selection){
  this.requireUnlocked();if(!Array.isArray(selection)||!selection.length||selection.length>16)throw Error('Choose between 1 and 16 distinct nodes');const frozen=frozenCopy(selection),raw=await this.request('graph/transformations',{nodes:frozen});return overlayGraph(raw,frozen,{transformations:true});
 }
 async overlayGraph(selection){
  this.requireUnlocked();if(!Array.isArray(selection)||!selection.length||selection.length>16)throw Error('Choose between 1 and 16 distinct nodes');
  const frozen=frozenCopy(selection),raw=await this.request('graph/overlay',{nodes:frozen});return overlayGraph(raw,frozen);
 }
 async documentGraph(ids){
  this.requireUnlocked();if(!Array.isArray(ids)||!ids.length||ids.length>16||new Set(ids).size!==ids.length)throw Error('Choose between 1 and 16 distinct document nodes');
  const requested=[...ids],body=frozenCopy({documents:requested.map(id=>this.get(id).runtime.document)}),raw=await this.request('graph',body);return documentForkGraph(raw,requested);
 }
 derivation(id){this.requireUnlocked();return this.request('derivation',{document:this.get(id).runtime.document});}
 requireUnlocked(){if(this.lifecycle!=='unlocked')throw Error('Workspace is locking or locked; editing is suspended');}
 get clipboard(){if(['locked','uncertain'].includes(this.lifecycle))this.requireUnlocked();return structuredClone(this.privateClipboard.entries);}
 loadClipboard(more=false){this.requireUnlocked();return this.serialise('clipboard',()=>this.privateClipboard.load(more));}
 changeClipboard(mutation){this.requireUnlocked();return this.serialise('clipboard',()=>this.privateClipboard.mutate(mutation));}
 retryClipboard(){this.requireUnlocked();return this.serialise('clipboard',()=>this.privateClipboard.retry());}
 captureSource(id,startByte,endByte,quote){
  this.requireUnlocked();const captured=this.get(id),generation=this.privateClipboard.generation;
  if(!counter(startByte)||!counter(endByte)||startByte>=endByte||endByte>new TextEncoder().encode(captured.source).length)throw Error('Invalid source selection');
  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before capturing a provenance reference');
  return this.serialise(id,()=>this.serialise('clipboard',async()=>{
   const d=this.docs.get(id);
   if(d.runtime.generation!==captured.runtime.generation||!sameId(d.runtime.base,captured.runtime.base))throw Error('Source changed; capture the selection again');
   const snapshot=await this.request('snapshot',{document:captured.runtime.document,snapshot:captured.runtime.snapshot});
   if(snapshot.text!==captured.source)throw Error('Commit this source before capturing a provenance reference');
   const source={document:captured.runtime.document,node:captured.runtime.node,snapshot:captured.runtime.snapshot,revision:captured.runtime.base,occurrence_path:[captured.runtime.occurrence],start_byte:startByte,end_byte:endByte};
   return this.privateClipboard.mutate({action:'capture',generation,source,expected_draft:{generation:captured.runtime.generation,sequence:captured.acknowledged},quote});
  }));
 }
 get(id){const d=this.docs.get(id);if(!d)throw Error('Unknown runtime document');return structuredClone(d);}
 edit(id,source){
  this.requireUnlocked();const d=this.docs.get(id);if(!d)throw Error('Unknown runtime document');
  if(typeof source!=='string'||!source.isWellFormed())throw Error('Source contains an invalid Unicode scalar');
  if(d.sequence>=Number.MAX_SAFE_INTEGER)throw Error('Editing sequence limit');d.source=source;return ++d.sequence;
 }
 serialise(id,action){
  const next=(this.queues.get(id)||Promise.resolve()).catch(()=>{}).then(action);this.queues.set(id,next);
  const cleanup=()=>{if(this.queues.get(id)===next)this.queues.delete(id);};next.then(cleanup,cleanup);return next;
 }
 async send(d,request){
  if(!d.pending)d.pending=frozenCopy({operation:operationId(),request});
  const frozen=d.pending;
  try{
   const receipt=await retryTransport(this.request,'commands',frozen),result=receipt?.outcome,command=frozen.request;
   if(!sameId(receipt?.operation,frozen.operation))throw Error('Mismatched runtime receipt');
   const expected=command.command==='save'?'saved':'committed';
   if(result?.result!==expected||!sameId(result.document,command.document)||!sameId(result.document,d.runtime.document)||!counter(result.generation)||result.generation!==command.generation+1||!counter(result.sequence)||result.sequence!==command.sequence)throw Error('Mismatched runtime acknowledgement');
   if(expected==='committed'&&(!validId(result.revision)||!validId(result.snapshot)))throw Error('Invalid committed snapshot receipt');
   d.runtime.generation=result.generation;d.acknowledged=result.sequence;d.runtime.acknowledged_sequence=result.sequence;
   if(expected==='committed'){d.runtime.base=[...result.revision];d.runtime.snapshot=[...result.snapshot];}
   d.pending=null;d.error=null;return receipt;
  }catch(error){d.error=error.message;throw error;}
 }
 async saveCaptured(d,captured){
  if(d.pending)await this.send(d,d.pending.request);
  if(captured.sequence<d.acknowledged)throw Error('Captured buffer is older than the acknowledged draft');
  if(captured.sequence===d.acknowledged)return;
  await this.send(d,{command:'save',document:d.runtime.document,generation:d.runtime.generation,base:d.runtime.base,previous_sequence:d.acknowledged,sequence:captured.sequence,text:captured.source});
 }
 checkpoint(id){this.requireUnlocked();const captured=this.get(id);return this.serialise(id,async()=>{const d=this.docs.get(id);await this.saveCaptured(d,captured);return {document:id,sequence:captured.sequence,durable:true};});}
 commit(id){
  this.requireUnlocked();const captured=this.get(id);
  return this.serialise(id,async()=>{
   const d=this.docs.get(id);
   if(d.pending?.request.command==='commit'&&d.pending.request.sequence===captured.sequence)return this.send(d,d.pending.request);
   await this.saveCaptured(d,captured);
   return this.send(d,{command:'commit',document:d.runtime.document,generation:d.runtime.generation,base:d.runtime.base,sequence:captured.sequence});
  });
 }
 async sendCreation(title,text,register=false){
  if(this.creationPending&&(this.creationPending.request.title!==title||this.creationPending.request.text!==text))throw Error('Retry the pending document creation with its original name and text before creating another document');
  this.creationRegistersEditor=register||this.creationRegistersEditor;
  if(!this.creationPending)this.creationPending=frozenCopy({operation:operationId(),request:{command:'create',title,text}});
  const frozen=this.creationPending,receipt=await retryTransport(this.request,'commands',frozen);
  if(!sameId(receipt?.operation,frozen.operation)||receipt?.outcome?.result!=='created'||!validId(receipt.outcome.document))throw Error('Mismatched document creation receipt');
  let state;
  if(this.creationRegistersEditor){
   const id=idString(receipt.outcome.document);
   if(!this.docs.has(id)){
    const editor=await this.request('editor',{document:receipt.outcome.document});
    if(!sameId(editor?.document,receipt.outcome.document)||!validId(editor.node)||!validId(editor.occurrence))throw Error('Invalid created editor state');
    this.registerEditor(editor);
   }
   state=this.get(id);
  }
  this.creationPending=null;this.creationRegistersEditor=false;return register?state:receipt;
 }
 createAndRegister(title,text=''){
  this.requireUnlocked();if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid document name');
  return this.serialise('create',()=>this.sendCreation(title,text,true));
 }
 retryCreation(){
  this.requireUnlocked();return this.serialise('create',()=>{if(!this.creationPending)throw Error('No pending document creation');const {title,text}=this.creationPending.request;return this.sendCreation(title,text,true);});
 }
 create(title,text=''){this.requireUnlocked();return this.serialise('create',()=>this.sendCreation(title,text));}
 async settleDrafts(captured){
  const actions=captured.map(state=>this.serialise(state.id,()=>this.saveCaptured(this.docs.get(state.id),state)));
  if(this.queues.has('create'))actions.push(this.queues.get('create'));
  if(this.queues.has('assertions'))actions.push(this.queues.get('assertions'));
  if(this.queues.has('merge'))actions.push(this.queues.get('merge'));
  if(this.queues.has('fork'))actions.push(this.queues.get('fork'));
  if(this.queues.has('clipboard'))actions.push(this.queues.get('clipboard'));
  const settled=await Promise.allSettled(actions),failed=settled.find(result=>result.status==='rejected');if(failed)throw failed.reason;
  if(this.creationPending){const {title,text}=this.creationPending.request;await this.sendCreation(title,text);}
  if(this.forkPending)await this.sendFork();
  if(this.mergePending)await this.sendMerge();
  if(this.assertions.pending)await this.assertions.retry();
  if(this.privateClipboard.pending)await this.privateClipboard.retry();
 }
 keychainStatus(){return this.request('keychain/status',{});}
 async keychain(action){
  if(!['enroll','remove'].includes(action))throw Error('Invalid keychain action');
  this.requireUnlocked();this.lifecycle='securing';const captured=[...this.docs.values()].map(d=>this.get(d.id));
  try{
   await this.settleDrafts(captured);
   let receipt;
   try{receipt=await this.request('keychain/'+action,{});}
   catch(error){
    // An unknown reply is reconciled through credential-free status, never a new secret.
    if(error.status)throw error;
    const status=await this.keychainStatus();
    if(status.enrolled!==(action==='enroll')||status.cleanup_pending)throw error;
    return {status,reconciled:true};
   }
   if(receipt?.enrolled!==(action==='enroll'))throw Error('Invalid keychain acknowledgement');
   return {status:await this.keychainStatus(),backup_created:receipt.backup_created,reconciled:false};
  }finally{this.lifecycle='unlocked';}
 }
 lock(){
  if(this.lifecycle==='securing')return Promise.reject(Error('Keychain operation is in progress'));
  if(this.lifecycle==='locked')return Promise.resolve({locked:true});
  if(this.lockPromise)return this.lockPromise;
  this.lifecycle='locking';const captured=[...this.docs.values()].map(d=>this.get(d.id));let lockAttempted=false;
  this.lockPromise=(async()=>{
   try{
    await this.settleDrafts(captured);
    lockAttempted=true;const receipt=await retryTransport(this.request,'lock',{});
    if(receipt?.locked!==true)throw Error('Invalid lock acknowledgement');
    this.lifecycle='locked';return receipt;
   }catch(error){this.lifecycle=lockAttempted?'uncertain':'unlocked';throw error;}
   finally{this.lockPromise=null;}
  })();return this.lockPromise;
 }
 snapshot(id,snapshot){
  this.requireUnlocked();const d=this.get(id);if(snapshot!==undefined&&!validId(snapshot))throw Error('Invalid snapshot identity');
  const body=frozenCopy({document:d.runtime.document,snapshot:snapshot??d.runtime.snapshot});
  return Promise.resolve(this.request('snapshot',body)).then(result=>{
   if(typeof result?.text!=='string'||!result.text.isWellFormed()||new TextEncoder().encode(result.text).length>2*1024*1024)throw Error('Invalid snapshot response');
   return {text:result.text};
  });
 }
 async history(id,next=null,limit=12){
  this.requireUnlocked();if(next!==null&&!validId(next)||!Number.isInteger(limit)||limit<1||limit>32)throw Error('Invalid history request');
  const d=this.get(id),page=await this.request('history',frozenCopy({document:d.runtime.document,next,limit}));
  if(!sameId(page?.document,d.runtime.document)||!Array.isArray(page.entries)||!page.entries.length||page.entries.length>limit||page.next!==null&&!validId(page.next))throw Error('Invalid history page');
  const seen=new Set();
  for(const [i,entry] of page.entries.entries()){
   if(!['revision','snapshot','operation','actor','device'].every(key=>validId(entry[key]))||entry.parent!==null&&!validId(entry.parent)||!counter(entry.text_bytes)||entry.text_bytes>2*1024*1024)throw Error('Invalid history entry');
   const key=idString(entry.revision);if(seen.has(key)||sameId(entry.revision,entry.parent))throw Error('Invalid history cycle');seen.add(key);
   if(i&&!sameId(page.entries[i-1].parent,entry.revision)||i===0&&next!==null&&!sameId(next,entry.revision))throw Error('Invalid history chain');
  }
  const parent=page.entries.at(-1).parent;
  if(parent===null?page.next!==null:!sameId(parent,page.next))throw Error('Invalid history cursor');
  if(page.next!==null&&seen.has(idString(page.next)))throw Error('Invalid history cycle');
  return structuredClone(page);
 }
}

function element(tag,text){const e=document.createElement(tag);if(text)e.textContent=text;return e;}
export async function initializeRuntime(){
 if(location.protocol!=='https:')return null;
 const cover=element('div');cover.className='runtime-unlock';const form=element('form'),heading=element('h1','Hypergraph PX'),status=element('p','Connecting to local runtime…'),label=element('label','Workspace passphrase'),input=element('input'),submit=element('button','Unlock workspace'),keychain=element('button','Unlock with macOS Keychain');
 const logo=element('img');logo.src='/assets/logo.png';logo.alt='';logo.width=36;logo.height=36;heading.prepend(logo);
 keychain.type='button';keychain.hidden=true;
 const actions=element('div');actions.className='dialog-actions';actions.append(submit,keychain);
 input.type='password';input.autocomplete='current-password';input.required=true;input.maxLength=1024;input.setAttribute('aria-label','Workspace passphrase');label.append(input);submit.type='submit';form.append(heading,status,label,actions);cover.append(form);document.body.append(cover);submit.disabled=true;
 try{
  const fragment=new URLSearchParams(location.hash.slice(1)),launch=fragment.get('launch');if(launch){history.replaceState(null,'',location.pathname);await runtimeRequest('bootstrap',{token:launch});}
  let runtime=await runtimeRequest('runtime');if(runtime.contract!==1||runtime.mode!=='trusted_server'||runtime.ownership!=='whole_document')throw Error('Unsupported runtime contract');
  if(runtime.locked){status.textContent=runtime.create?'Create an encrypted local workspace. Choose its unlock passphrase.':'Unlock your encrypted local workspace.';submit.textContent=runtime.create?'Create workspace':'Unlock workspace';input.autocomplete=runtime.create?'new-password':'current-password';submit.disabled=false;input.focus();
   if(runtime.keychain_supported){const enrollment=await runtimeRequest('keychain/status',{});keychain.hidden=!enrollment.enrolled;}
   await new Promise(resolve=>{
    const attempt=async action=>{submit.disabled=keychain.disabled=true;input.value='';try{await action();resolve();}catch(error){status.textContent=error.message==='unlock_failed'?'Workspace could not be unlocked. Check the passphrase and workspace.':error.message==='keychain_denied'?'Keychain access was denied or canceled. You can use your passphrase.':error.message;submit.disabled=keychain.disabled=false;input.focus();}};
    form.onsubmit=event=>{event.preventDefault();const passphrase=input.value;void attempt(()=>runtimeRequest('unlock',{passphrase}));};
    keychain.onclick=()=>void attempt(()=>runtimeRequest('unlock/keychain',{}));
   });
   keychain.hidden=true;
  }
  const summaries=await runtimeRequest('documents',{});
  if(!summaries.length){status.textContent='Name your first document.';label.textContent='Document name';input.type='text';input.autocomplete='off';input.value='';input.maxLength=512;input.setAttribute('aria-label','Document name');label.append(input);submit.textContent='Create document';submit.disabled=false;input.focus();
   const creator=new RuntimeAdapter([]);
   const summary=await new Promise(resolve=>{form.onsubmit=async event=>{event.preventDefault();if(!input.value.trim())return;submit.disabled=true;try{const receipt=await creator.create(input.value);resolve({document:receipt.outcome.document});}catch(error){status.textContent=error.message;submit.disabled=false;}};});summaries.push(summary);
  }
  const states=[];for(const summary of summaries)states.push(await runtimeRequest('editor',{document:summary.document}));
  const adapter=new RuntimeAdapter(states),clipboardSupported=runtime.capabilities?.includes('private_clipboard')??false;
  if(clipboardSupported)await adapter.loadClipboard();
  cover.remove();return {adapter,clipboardSupported,publicationContributorsSupported:runtime.capabilities?.includes('publication_contributors')??false,transformationGraphSupported:runtime.capabilities?.includes('transformation_graph')??false,mergeSupported:runtime.capabilities?.includes('reviewed_merge')??false,assertionHistorySupported:runtime.capabilities?.includes('assertion_review_history')??false,overlayGraphSupported:runtime.capabilities?.includes('semantic_overlay_graph')??false,assertionsSupported:runtime.capabilities?.includes('semantic_assertion_overlay')??false,graphSupported:runtime.capabilities?.includes('document_fork_graph')??false,forkSupported:runtime.capabilities?.includes('fork')??false,documents:[...adapter.docs.values()].map(d=>({id:d.id,title:d.title,source:d.source}))};
 }catch(error){status.textContent=`Connection unavailable: ${error.message}. Open the private launch URL printed by the runtime.`;label.hidden=true;submit.hidden=true;throw error;}
}
