/**
 * # Hypergraph PX — Acknowledged runtime buffers and command coordination
 *
 * Coordinates exact browser buffers, acknowledged recovery saves, explicit and
 * departure Commits, pinned source operations and lifecycle transitions through
 * the real runtime API.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root/frontend_comments.
 * Latest editing harness: Codex; version/build: unknown.
 * Latest editing model: OpenAI; exact model identifier/revision: unknown.
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Runtime requests and buffer coordination — application shell, history
 * and branch inspection, annotations, clipboard and selection commands.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [Exact text and anchors][spec-3]
 * - [authority lifecycle md][spec-4]
 *
 * Boundary: Current implementation uses the trusted-server whole-document runtime;
 * it does not implement the candidate multi-user authority design. Frozen
 * operation identities preserve uncertain retries. Recovery acknowledgement is
 * distinct from immutable Commit history; source byte coordinates are UTF8 and
 * never guessed from display positions.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-adapter.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 * [spec-4]: ../../docs/06-subsystems/contracts/authority-lifecycle.md
 */

import {runtimeRequest,forkExecution,snapshotRequest,bootstrapRequest,emptyRequest,unlockRequest,documentRequest,branchRequest} from './api-client.ts';

export {runtimeRequest} from './api-client.ts';

import {publicationContributors} from './publication-contributors.js';
import {auditRequest,auditReport} from './runtime-audit.js';
import {RuntimeComments,commentPlan} from './runtime-comments.js';
/** Real single-owner runtime boundary. No fixture operations or browser persistence. */
import {RuntimeClipboard} from './runtime-clipboard.js';
import {RuntimeWorkingClipboard} from './runtime-working-clipboard.js';
import {validAssertionSource} from './runtime-assertions.js';
import {RuntimeAssertions} from './runtime-assertions.js';
import {capturedAssertion} from './captured-assertion.js';
import {documentForkGraph} from './document-fork-graph.js';
import {overlayGraph} from './overlay-graph.js';

/** Allocate an unpredictable operation identity once so retries reuse the same command envelope. */
export function operationId(){return [...crypto.getRandomValues(new Uint8Array(32))];}

/** Encode identities as stable hexadecimal browser map keys. */
const idString=id=>id.map(/* Represent each identity byte with exactly two hexadecimal digits. */ byte=>byte.toString(16).padStart(2,'0')).join('');

/** Compare complete validated identities before accepting ownership or receipt correspondence. */
const sameId=(a,b)=>validId(a)&&validId(b)&&a.every(/* Compare bytes at the same identity position. */ (byte,i)=>byte===b[i]);

/** Recognise an exact 32-byte runtime identity. */
const validId=id=>Array.isArray(id)&&id.length===32&&id.every(/* Reject identity elements outside the integer byte range. */ byte=>Number.isInteger(byte)&&byte>=0&&byte<=255);

/** Recognise safe nonnegative sequence, generation and resource counters. */
const counter=n=>Number.isSafeInteger(n)&&n>=0;

const comparisonFields=['document','node','branch','parent','source_name','parent_name','source_revision','source_snapshot','parent_revision','parent_snapshot'];

/** Validate complete captured branch-comparison identity and bounded friendly names. */
function validComparison(context,scope){
 return context&&Object.keys(context).length===comparisonFields.length&&comparisonFields.every(/* Require every comparison field to be explicitly present. */ k=>Object.hasOwn(context,k))&&comparisonFields.filter(/* Separate identity fields from human-readable comparison names. */ k=>!k.endsWith('_name')).every(/* Validate each comparison identity field. */ k=>validId(context[k]))&&sameId(context.document,scope.document)&&sameId(context.node,scope.node)&&sameId(context.branch,scope.branch)&&!sameId(context.parent,scope.branch)&&['source_name','parent_name'].every(/* Require well-formed nonblank branch names within the UTF8 byte budget. */ k=>typeof context[k]==='string'&&context[k].isWellFormed()&&context[k].trim()&&new TextEncoder().encode(context[k]).length<=512);
}

/** Clone and recursively freeze command inputs so queued work and retries cannot drift. */
function frozenCopy(value){const copy=structuredClone(value);/* Freeze nested values before freezing their parent container. */

 const freeze=item=>{if(item&&typeof item==='object'){for(const child of Object.values(item))freeze(child);

   Object.freeze(item);}

  return item;};

 return freeze(copy);}

/** Retry one transport failure with the same request while leaving explicit HTTP failures terminal. */
async function retryTransport(request,path,body){
 for(let attempt=0;attempt<2;attempt++){
  try{return await request(path,body);}catch(error){if(error.status||attempt===1)throw error;}
 }
}

/** Own real runtime buffer coordination and resource queues without fixture operations or browser persistence. */
export class RuntimeAdapter {
 /** Create isolated runtime buffers, resource queues and pending-operation slots from validated editor states. */
 constructor(states,request=runtimeRequest,features={}){
  this.request=request;this.features=features;this.docs=new Map();this.buffers=new Map();this.originalBranches=new Map();this.branchNames=new Map();this.branchPending=null;this.workingClipboard=new RuntimeWorkingClipboard(request,operationId);this.privateClipboard=new RuntimeClipboard(request,operationId);this.assertions=new RuntimeAssertions(request,operationId);this.comments=new RuntimeComments(request,operationId);this.queues=new Map();this.lifecycle='unlocked';this.lockPromise=null;this.creationPending=null;this.creationRegistersEditor=false;this.forkPending=null;this.mergePending=null;


  for(const input of states)this.registerEditor(input);
 }


 /** Validate and register an original document editor without allowing duplicate identities. */
 registerEditor(input){
  const state=structuredClone(input);


  if(!validId(state.document)||!validId(state.base)||!validId(state.snapshot)||!counter(state.generation)||!counter(state.acknowledged_sequence)||typeof state.text!=='string'||!state.text.isWellFormed())throw Error('Invalid runtime editor state');


  const id=idString(state.document);

  if(this.docs.has(id))throw Error('Duplicate runtime document');


  const buffer=this.makeBuffer(state);

  this.originalBranches.set(id,state.branch);this.branchNames.set(buffer.context,'Original');this.docs.set(id,buffer);

  return this.get(id);
 }


 /** Create branch-scoped mutable buffer state while retaining acknowledged runtime coordinates. */
 makeBuffer(state){
  const id=idString(state.document),context=validId(state.branch)?id+'/'+idString(state.branch):id;


  const buffer={id,context,title:state.title,source:state.text,sequence:state.acknowledged_sequence,acknowledged:state.acknowledged_sequence,runtime:structuredClone(state),pending:null,error:null};

  this.buffers.set(context,buffer);

  return buffer;
 }


 /** Identify the active document buffer including its branch scope. */
 contextKey(id){return this.get(id).context;}


 /** Return the known friendly branch name with an explicit alternative fallback. */
 branchLabel(id){return this.branchNames.get(this.contextKey(id))??'Alternative';}


 /** Resolve the exact captured branch buffer rather than whichever branch is currently active. */
 capturedBuffer(captured){const d=this.buffers.get(captured.context);

  if(!d)throw Error('Unknown branch buffer');

  return d;}


 /** Distinguish an alternative branch from the document’s original branch. */
 isChild(id){const d=this.get(id);

  return validId(d.runtime.branch)&&!sameId(d.runtime.branch,this.originalBranches.get(id));}


 /** Capture independent copies of every retained branch buffer for lifecycle transitions. */
 allBuffers(){return [...this.buffers.values()].map(/* Clone each buffer so lifecycle captures cannot follow subsequent local mutations. */ d=>structuredClone(d));}


 /** Read a bounded branch page and verify identities, descending ordinals and continuation linkage. */
 async branchPage(id,next=null){
  this.requireUnlocked();

  const d=this.get(id),body=frozenCopy({document:d.runtime.document,next,limit:16}),page=await this.request('branches',body);


  if(!sameId(page?.document,body.document)||!sameId(page.original_branch,this.originalBranches.get(id))||!Array.isArray(page.entries)||page.entries.length>16||page.next!==null&&!validId(page.next))throw Error('Invalid branch page');


  let ordinal=null;

  const seen=new Set();

  for(const e of page.entries){if(!['document','node','branch','draft','parent','revision','snapshot','actor','device','operation'].every(/* Validate all identity-bearing branch metadata fields. */ k=>validId(e[k]))||!sameId(e.document,body.document)||!sameId(e.node,d.runtime.node)||sameId(e.branch,e.parent)||sameId(e.branch,page.original_branch)||typeof e.name!=='string'||!e.name.isWellFormed()||!e.name.trim()||new TextEncoder().encode(e.name).length>512||!counter(e.ordinal)||e.ordinal===0||e.previous!==null&&!validId(e.previous)||ordinal!==null&&e.ordinal!==ordinal-1)throw Error('Invalid branch metadata');

   const key=idString(e.branch);

   if(seen.has(key))throw Error('Invalid branch listing cycle');

   seen.add(key);ordinal=e.ordinal;this.branchNames.set(id+'/'+idString(e.branch),e.name);}


  if(next!==null&&page.entries.length&&!sameId(next,page.entries[0].branch)||page.entries.length&&JSON.stringify(page.next)!==JSON.stringify(page.entries.at(-1).previous))throw Error('Invalid branch continuation');

  return structuredClone(page);
 }


 /** Commit changed departure source before switching to a validated branch editor. */
 async selectBranch(id,branch){
  this.requireUnlocked();

  if(!validId(branch))throw Error('Invalid branch identity');

  const captured=this.get(id);

  if(sameId(branch,captured.runtime.branch))return captured;


  return this.serialise(id,/* Serialize branch departure and buffer activation so a late response cannot change the wrong source. */ async()=>{
   await this.commitCaptured(this.capturedBuffer(captured),captured,true);


   const key=id+'/'+idString(branch);

   let buffer=this.buffers.get(key);


   if(!buffer){const editor=await this.request('branches/editor',frozenCopy(branchRequest(captured.runtime.document,branch)));

    if(!sameId(editor?.document,captured.runtime.document)||!sameId(editor.branch,branch)||!sameId(editor.node,captured.runtime.node)||!sameId(editor.manifest,captured.runtime.manifest)||!sameId(editor.occurrence,captured.runtime.occurrence)||!validId(editor.draft)||!validId(editor.base)||!validId(editor.snapshot)||!counter(editor.generation)||!counter(editor.acknowledged_sequence)||typeof editor.text!=='string'||!editor.text.isWellFormed()||new TextEncoder().encode(editor.text).length>2*1024*1024)throw Error('Invalid branch editor');

    buffer=this.makeBuffer(editor);}


   this.docs.set(id,buffer);

   return this.get(id);
  });
 }


 /** Freeze an explicitly reviewed branch-creation request with a reusable operation identity. */
 createBranch(id,name,reviewed=this.get(id)){
  this.requireUnlocked();

  const d=structuredClone(reviewed);

  if(d.id!==id)throw Error('Branch review changed');

  if(this.branchPending)throw Error('Retry the pending branch creation first');

  if(typeof name!=='string'||!name.isWellFormed()||!name.trim()||new TextEncoder().encode(name).length>512)throw Error('Invalid branch name');


  this.branchPending=frozenCopy({operation:operationId(),request:{command:'branch',mutation:{action:'create',document:d.runtime.document,parent:d.runtime.branch,revision:d.runtime.base,snapshot:d.runtime.snapshot,name}}});

  return this.serialise('branches',/* Send branch creation only when its resource queue permits it. */ ()=>this.sendBranch());
 }


 /** Retry the exact pending branch creation, validate its receipt and retain uncertainty until resolved. */
 async sendBranch(){const frozen=this.branchPending;

  if(!frozen)throw Error('No pending branch creation');

  let receipt;

  try{receipt=await retryTransport(this.request,'commands',frozen);}catch(error){if(error.status>=400&&error.status<500)this.branchPending=null;

   throw error;}

  const state=receipt?.outcome?.state;

  if(!sameId(receipt?.operation,frozen.operation)||receipt?.outcome?.result!=='branch'||!validId(state?.branch)||sameId(state.branch,frozen.request.mutation.parent)||state.outcome?.result!=='created'||!sameId(state.outcome.document,frozen.request.mutation.document))throw Error('Invalid branch creation receipt');

  this.branchNames.set(idString(state.outcome.document)+'/'+idString(state.branch),frozen.request.mutation.name);this.branchPending=null;

  return structuredClone(state);}


 /** Resume the retained branch creation without allocating a replacement operation. */
 retryBranch(){this.requireUnlocked();

  return this.serialise('branches',/* Send the pending branch envelope within its serialization queue. */ ()=>this.sendBranch());}


 /** Capture exact selected UTF8 source as a committed reference or immutable working checkpoint according to actual source equality. */
 captureAdaptive(id,start,end,quote,retainCommitted=true){
  this.requireUnlocked();

  const captured=this.get(id),raw=new TextEncoder().encode(captured.source);


  if(this.privateClipboard.pending||this.workingClipboard.pending)throw Error('Retry the pending source reference first');


  if(!counter(start)||!counter(end)||start>=end||end>raw.length||typeof quote!=='string'||!quote.isWellFormed())throw Error('Invalid exact source range');


  let selected;

  try{selected=new TextDecoder('utf-8',{fatal:true}).decode(raw.slice(start,end));}catch{throw Error('Selection splits a scalar');}

  if(selected!==quote)throw Error('Selection changed');


  return this.serialise(id,/* Save the captured buffer before deciding whether its exact text already matches a committed snapshot. */ async()=>{const d=this.capturedBuffer(captured);

   await this.saveCaptured(d,captured);


   const snapshot=await this.request('snapshot',frozenCopy(snapshotRequest(d.runtime.document,d.runtime.snapshot)));


   if(typeof snapshot?.text!=='string')throw Error('Invalid committed source');


   if(snapshot.text===captured.source){const source=frozenCopy({document:d.runtime.document,node:d.runtime.node,snapshot:d.runtime.snapshot,revision:d.runtime.base,occurrence_path:[d.runtime.occurrence],start_byte:start,end_byte:end});

    if(!retainCommitted)return {captured_source:source};

    return this.serialise('clipboard',/* Capture a committed private reference under the clipboard queue with the original draft expectation. */ async()=>{const state=await this.privateClipboard.mutate({action:'capture',generation:this.privateClipboard.generation,source,expected_draft:this.isChildBuffer(captured)?null:{generation:d.runtime.generation,sequence:captured.sequence},quote});

     return {...state,captured_source:source};});}


   const plan=frozenCopy({document:d.runtime.document,branch:d.runtime.branch,generation:d.runtime.generation,base:d.runtime.base,sequence:captured.sequence,text:captured.source,start_byte:start,end_byte:end,quote});

   return this.serialise('working-clipboard',/* Capture a working reference using the already frozen source plan. */ ()=>this.workingClipboard.copy(plan));
  });
 }


 /** Determine original-versus-alternative branch status for a captured buffer. */
 isChildBuffer(d){return validId(d.runtime.branch)&&!sameId(d.runtime.branch,this.originalBranches.get(d.id));}


 /** Choose committed or working-reference Fork after exact adaptive capture. */
 async forkSelected(id,start,end,quote,title){if(this.forkPending)throw Error('Retry the pending fork first');

  if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid fork name');

  const capture=await this.captureAdaptive(id,start,end,quote,false);

  return capture.source?this.forkWorkingReference(capture.source,quote,title):this.forkReference(capture.captured_source,quote,title);}


 /** Freeze a working-source Fork request without overwriting an unresolved Fork. */
 forkWorkingReference(source,quote,title){
  this.requireUnlocked();

  if(this.forkPending)throw Error('Retry the pending fork first');

  if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid fork name');


  const plan=frozenCopy({title,source,quote});

  return this.serialise('fork',/* Allocate and retain a working Fork operation only when its queue becomes active. */ ()=>{if(this.forkPending)throw Error('Retry the pending fork first');

   this.forkPending=frozenCopy({operation:operationId(),request:{command:'working_fork',plan}});

   return this.sendFork();});
 }


 /** Capture an exact working-source reference after saving its captured buffer. */
 captureWorking(id,start,end,quote){
  this.requireUnlocked();

  const captured=this.get(id);

  if(this.workingClipboard.pending)throw Error('Retry the pending working-reference operation first');


  return this.serialise(id,/* Order working capture after document work and before other working-clipboard mutations. */ ()=>this.serialise('working-clipboard',/* Save captured source before creating its exact working checkpoint reference. */ async()=>{const d=this.capturedBuffer(captured);

   await this.saveCaptured(d,captured);

   return this.workingClipboard.copy({document:d.runtime.document,branch:d.runtime.branch,generation:d.runtime.generation,base:d.runtime.base,sequence:captured.sequence,text:captured.source,start_byte:start,end_byte:end,quote});}));
 }


 /** Load a working-clipboard page only while unlocked and in resource order. */
 loadWorkingClipboard(more=false){this.requireUnlocked();

  return this.serialise('working-clipboard',/* Read the requested working-reference page within its queue. */ ()=>this.workingClipboard.load(more));}


 /** Apply one explicit working-clipboard mutation in resource order. */
 changeWorkingClipboard(mutation){this.requireUnlocked();

  return this.serialise('working-clipboard',/* Send the requested working-reference mutation when its queue is ready. */ ()=>this.workingClipboard.mutate(mutation));}


 /** Retry the retained working-reference operation rather than replacing it. */
 retryWorkingClipboard(){this.requireUnlocked();

  return this.serialise('working-clipboard',/* Resume the working-clipboard pending envelope in its own queue. */ ()=>this.workingClipboard.retry());}


 /** Promote working references after Commit only when the runtime supports working copies. */
 async promoteWorking(publication){if(!this.features.workingCopy)return;

  return this.serialise('working-clipboard',/* Refresh working-reference generation, resolve prior uncertainty and promote the acknowledged publication. */ async()=>{await this.workingClipboard.load();

   if(this.workingClipboard.pending)await this.workingClipboard.retry();

   return this.workingClipboard.mutate({action:'promote',generation:this.workingClipboard.generation,publication});});}


 /** Reconcile retained working references with previously recorded promotions after reconnect. */
 async reconcileWorkingReferences(){
  if(!this.features.workingCopy)return;

  return this.serialise('working-clipboard',/* Load all working references and apply discovered promotions without creating new text history. */ async()=>{
   if(this.workingClipboard.pending)await this.workingClipboard.retry();


   await this.workingClipboard.load();

   while(this.workingClipboard.next!==null)await this.workingClipboard.load(true);


   const publications=new Map();

   for(const e of this.workingClipboard.entries){if(e.target.kind!=='working')continue;

    const view=await this.workingClipboard.inspect(e.target.source);

    if(view.promotion)publications.set(idString(view.promotion.operation),view.promotion.operation);}


   for(const publication of publications.values())await this.workingClipboard.mutate({action:'promote',generation:this.workingClipboard.generation,publication});


   this.workingClipboard.error=null;
  });
 }


 /** Send a retained reviewed Merge and register only its distinct validated output document. */
 async sendMerge(){
  if(!this.mergePending)throw Error('No pending merge');


  const frozen=this.mergePending;

  let receipt;


  try{receipt=await retryTransport(this.request,'commands',frozen);}catch(error){if(error.status>=400&&error.status<500)this.mergePending=null;

   throw error;}


  const result=receipt?.outcome;


  if(!sameId(receipt?.operation,frozen.operation)||result?.result!=='merged'||!['document','transformation','revision','snapshot'].every(/* Validate every Merge result identity before accepting its receipt. */ key=>validId(result[key]))||frozen.request.plan.inputs.some(/* Reject a Merge output document that reuses any input document identity. */ input=>sameId(result.document,input.source.document)))throw Error('Mismatched merge receipt');


  const id=idString(result.document);


  if(!this.docs.has(id)){
   const state=await this.request('editor',documentRequest(result.document));


   if(!sameId(state?.document,result.document)||!validId(state.node)||!validId(state.occurrence)||frozen.request.plan.inputs.some(/* Reject a Merge output editor that reuses an input logical node. */ input=>sameId(state.node,input.source.node)))throw Error('Invalid merge editor state');


   this.registerEditor(state);
  }


  this.mergePending=null;

  return this.get(id);
 }


 /** Retry an unresolved Merge with the original frozen command. */
 retryMerge(){this.requireUnlocked();

  return this.serialise('merge',/* Send the retained Merge within the Merge resource queue. */ ()=>this.sendMerge());}


 /** Validate reviewed Merge text and pinned inputs against encoded and source-byte budgets. */
 mergeSources(input){
  this.requireUnlocked();

  if(this.mergePending)throw Error('Retry the pending merge before creating another');


  const plan=frozenCopy(input),bytes=/* Measure exact UTF8 byte costs rather than JavaScript code units. */ v=>new TextEncoder().encode(v).length;

  if(bytes(JSON.stringify(plan))>14*1024*1024-1024)throw Error('Reviewed merge exceeds the encoded request limit');


  if(typeof plan.title!=='string'||!plan.title.isWellFormed()||!plan.title.trim()||bytes(plan.title)>512||typeof plan.text!=='string'||!plan.text.isWellFormed()||!plan.text.length||bytes(plan.text)>2*1024*1024||!Array.isArray(plan.inputs)||plan.inputs.length<2||plan.inputs.length>8)throw Error('Invalid reviewed merge');


  let total=0;

  for(const i of plan.inputs){if(!validAssertionSource(i.source)||i.expected_draft!==null||typeof i.quote!=='string'||!i.quote.isWellFormed()||bytes(i.quote)!==i.source.end_byte-i.source.start_byte)throw Error('Invalid exact merge input');

   total+=bytes(i.quote);}

  if(total>2*1024*1024)throw Error('Combined merge inputs exceed 2 MiB');


  return this.serialise('merge',/* Retain one immutable Merge envelope when its serialization queue activates. */ ()=>{if(this.mergePending)throw Error('Retry the pending merge before creating another');

   this.mergePending=frozenCopy({operation:operationId(),request:{command:'merge',plan}});

   return this.sendMerge();});
 }


 /** Send the retained committed or working Fork and validate its independent output identities. */
 async sendFork(){
  if(!this.forkPending)throw Error('No pending fork');


  const frozen=this.forkPending;

  let receipt;


  try{receipt=await retryTransport(this.request,'commands',frozen);}catch(error){if(error.status>=400&&error.status<500)this.forkPending=null;

   throw error;}


  const working=frozen.request.command==='working_fork',result=working?receipt?.outcome?.state:receipt?.outcome;


  if(!sameId(receipt?.operation,frozen.operation)||(working?receipt?.outcome?.result!=='working_forked':result?.result!=='forked')||!['document','transformation','revision','snapshot'].every(/* Validate each Fork result identity field. */ key=>validId(result[key]))||sameId(result.document,frozen.request.plan.source.document))throw Error('Mismatched fork receipt');


  const id=idString(result.document);


  if(!this.docs.has(id)){
   const state=await this.request('editor',documentRequest(result.document));


   if(!sameId(state?.document,result.document)||!validId(state.node)||!validId(state.occurrence)||sameId(state.node,frozen.request.plan.source.node))throw Error('Invalid fork editor state');


   this.registerEditor(state);
  }


  this.forkPending=null;

  return this.get(id);
 }


 /** Retry the existing Fork without inventing another operation identity. */
 retryFork(){this.requireUnlocked();

  return this.serialise('fork',/* Send the frozen Fork after prior Fork work settles. */ ()=>this.sendFork());}


 /** Fork an exact committed selection, or use adaptive working capture when supported. */
 forkSource(id,startByte,endByte,quote,title){
  if(this.features.workingCopy)return this.forkSelected(id,startByte,endByte,quote,title);


  this.requireUnlocked();

  const captured=this.get(id);


  if(this.forkPending)throw Error('Retry the pending fork before creating another');


  if(typeof title!=='string'||!title.trim()||new TextEncoder().encode(title).length>512||!title.isWellFormed())throw Error('Invalid fork name');


  if(!counter(startByte)||!counter(endByte)||startByte>=endByte||typeof quote!=='string'||!quote.isWellFormed())throw Error('Invalid source selection');


  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before forking');


  return this.serialise(id,/* Order committed-source Fork after document work and before other Fork operations. */ ()=>this.serialise('fork',/* Recheck captured generation and committed text before freezing the Fork command. */ async()=>{
   if(this.forkPending)throw Error('Retry the pending fork before creating another');


   const d=this.capturedBuffer(captured);


   if(d.runtime.generation!==captured.runtime.generation||!sameId(d.runtime.base,captured.runtime.base))throw Error('Source changed; select the source again');


   const snapshot=await this.request('snapshot',snapshotRequest(captured.runtime.document,captured.runtime.snapshot));


   if(snapshot.text!==captured.source)throw Error('Commit this source before forking');


   if(!validId(captured.runtime.node)||!validId(captured.runtime.occurrence))throw Error('Invalid fork source identity');


   const source={document:captured.runtime.document,node:captured.runtime.node,snapshot:captured.runtime.snapshot,revision:captured.runtime.base,occurrence_path:[captured.runtime.occurrence],start_byte:startByte,end_byte:endByte};


   this.forkPending=frozenCopy(forkExecution(operationId(),{title,source,expected_draft:this.isChildBuffer(captured)?null:{generation:captured.runtime.generation,sequence:captured.acknowledged},quote}));


   return this.sendFork();
  }));
 }


 /** Fork an already pinned exact reference without requiring the source to remain the current draft. */
 forkReference(source,quote,title){
  this.requireUnlocked();


  if(this.forkPending)throw Error('Retry the pending fork before creating another');


  if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid fork name');


  if(!source||!['document','node','snapshot','revision'].every(/* Validate all captured source identity fields. */ k=>validId(source[k]))||!Array.isArray(source.occurrence_path)||source.occurrence_path.length!==1||!source.occurrence_path.every(validId)||!counter(source.start_byte)||!counter(source.end_byte)||source.end_byte<=source.start_byte||typeof quote!=='string'||!quote.isWellFormed()||new TextEncoder().encode(quote).length!==source.end_byte-source.start_byte)throw Error('Invalid captured source');


  const plan=frozenCopy({title,source,expected_draft:null,quote});


  return this.serialise('fork',/* Allocate a Fork operation only after confirming no unresolved Fork occupies the queue. */ async()=>{
   if(this.forkPending)throw Error('Retry the pending fork before creating another');


   this.forkPending=frozenCopy(forkExecution(operationId(),plan));

   return this.sendFork();
  });
 }


 /** Read bounded contributors for the requested or currently captured publication snapshot. */
 publicationContributors(id,snapshot,cursor=null,limit=16){this.requireUnlocked();

  const d=this.get(id);

  return publicationContributors(this.request,d.runtime.document,snapshot??d.runtime.snapshot,cursor,limit);}


 /** Read immutable passage comments for a pinned document snapshot. */
 commentPage(id,snapshot,next=null){this.requireUnlocked();

  const d=this.get(id);

  return this.comments.page(d.runtime.document,snapshot??d.runtime.snapshot,next);}


 /** Validate and queue one exact committed-passage comment plan. */
 createComment(input){this.requireUnlocked();

  const plan=commentPlan(input);

  return this.serialise('comments',/* Create the validated comment in comments-resource order. */ ()=>this.comments.create(plan));}


 /** Retry the retained comment operation while unlocked. */
 retryComment(){this.requireUnlocked();

  return this.serialise('comments',/* Resume the comments resource’s exact pending command. */ ()=>this.comments.retry());}


 /** Read one exact assertion revision rather than assuming the mutable current review. */
 assertionRevision(node,revision){this.requireUnlocked();

  return this.assertions.revision(node,revision);}


 /** Page assertions scoped to the active document’s captured committed snapshot. */
 assertionPage(id,generation=null,offset=0){this.requireUnlocked();

  const d=this.get(id);

  return this.assertions.page(d.runtime.document,d.runtime.snapshot,generation,offset);}


 /** Retry the retained assertion mutation without replacing its operation. */
 retryAssertion(){this.requireUnlocked();

  return this.serialise('assertions',/* Send the pending assertion mutation within its queue. */ ()=>this.assertions.retry());}


 /** Validate and freeze a cross-source captured assertion before queuing it. */
 createCapturedAssertion(input){this.requireUnlocked();

  const mutation=frozenCopy(capturedAssertion(input));

  return this.serialise('assertions',/* Submit the already frozen assertion mutation in resource order. */ ()=>this.assertions.mutate(mutation));}


 /** Review the exact assertion revision and generation represented by the inspector. */
 reviewAssertion(entry,status){this.requireUnlocked();

  return this.serialise('assertions',/* Send review against the captured node, revision and generation to reject stale judgement. */ ()=>this.assertions.mutate({action:'review',node:entry.record.node,revision:entry.revision,generation:entry.generation,status}));}


 /** Create an in-document assertion only from acknowledged source equal to its committed snapshot. */
 createAssertion(id,inputs,fields){
  this.requireUnlocked();

  const captured=this.get(id),plan=frozenCopy({inputs,fields});


  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before proposing a relationship');


  return this.serialise(id,/* Order document-source checks before the shared assertions mutation. */ ()=>this.serialise('assertions',/* Revalidate captured generation and committed source before constructing pinned participants. */ async()=>{
   const d=this.capturedBuffer(captured);

   if(d.runtime.generation!==captured.runtime.generation||!sameId(d.runtime.base,captured.runtime.base))throw Error('Source changed; select the participants again');


   const snapshot=await this.request('snapshot',snapshotRequest(captured.runtime.document,captured.runtime.snapshot));

   if(snapshot.text!==captured.source)throw Error('Commit this source before proposing a relationship');


   const participants=plan.inputs.map(/* Bind each requested role to exact committed document, occurrence and byte coordinates. */ input=>({role:input.role,source:{document:captured.runtime.document,node:captured.runtime.node,snapshot:captured.runtime.snapshot,revision:captured.runtime.base,occurrence_path:[captured.runtime.occurrence],start_byte:input.start_byte,end_byte:input.end_byte},expected_draft:this.isChildBuffer(captured)?null:{generation:captured.runtime.generation,sequence:captured.acknowledged},quote:input.quote}));


   const predicate=plan.fields.custom?{kind:'declared',label:plan.fields.name,description:'Owner-declared relationship; its interpretation is qualified by the assertion scope.',roles:[{id:'source',label:'Source participant'},{id:'target',label:'Target participant'}]}:{kind:'registered',choice:plan.fields.predicateId};


   return this.assertions.mutate({action:'create',predicate,participants,properties:plan.fields.properties});
  }));
 }


 /** Request and validate a bounded graph including reviewed transformation incidence. */
 async transformationGraph(selection){
  this.requireUnlocked();

  if(!Array.isArray(selection)||!selection.length||selection.length>16)throw Error('Choose between 1 and 16 distinct nodes');

  const frozen=frozenCopy(selection),raw=await this.request('graph/transformations',{nodes:frozen});

  return overlayGraph(raw,frozen,{transformations:true});
 }


 /** Request and validate a bounded retrospective assertion-incidence graph. */
 async overlayGraph(selection){
  this.requireUnlocked();

  if(!Array.isArray(selection)||!selection.length||selection.length>16)throw Error('Choose between 1 and 16 distinct nodes');


  const frozen=frozenCopy(selection),raw=await this.request('graph/overlay',{nodes:frozen});

  return overlayGraph(raw,frozen);
 }


 /** Request a document-only Fork graph with distinct selected document identities. */
 async documentGraph(ids){
  this.requireUnlocked();

  if(!Array.isArray(ids)||!ids.length||ids.length>16||new Set(ids).size!==ids.length)throw Error('Choose between 1 and 16 distinct document nodes');


  const requested=[...ids],body=frozenCopy({documents:requested.map(/* Resolve each selected browser document key to its runtime document identity. */ id=>this.get(id).runtime.document)}),raw=await this.request('graph',body);

  return documentForkGraph(raw,requested);
 }


 /** Read recorded derivation for the selected runtime document. */
 derivation(id){this.requireUnlocked();

  return this.request('derivation',{document:this.get(id).runtime.document});}


 /** Request a bounded integrity audit and validate it after rechecking unlock state. */
 async auditDocument(id,maxBytes){this.requireUnlocked();

  const request=auditRequest(this.get(id).runtime.document,maxBytes),report=await this.request('audit/document',request);

  this.requireUnlocked();

  return auditReport(report,request);}


 /** Capture a validated parent-branch comparison context without changing branch state. */
 async parentComparison(id,branch=this.get(id).runtime.branch){
  this.requireUnlocked();

  if(!validId(branch))throw Error('Invalid branch identity');

  const captured=this.get(id),body=frozenCopy(branchRequest(captured.runtime.document,branch)),context=await this.request('branches/comparison',body);

  this.requireUnlocked();


  if(!validComparison(context,{...body,node:captured.runtime.node}))throw Error('Invalid parent-branch comparison context');


  return structuredClone(context);
 }


 /** Resolve a bounded common-base report only while its complete comparison context remains unchanged. */
 async parentBase(id,context){
  this.requireUnlocked();

  const expected=frozenCopy(context),scope=this.get(id).runtime;


  if(!validComparison(expected,{document:scope.document,node:scope.node,branch:expected?.branch}))throw Error('Invalid common-base request');


  const raw=await this.request('branches/merge-base',frozenCopy({document:expected.document,branch:expected.branch}));

  this.requireUnlocked();


  if(!raw||Object.keys(raw).length!==3||!['comparison','selection','revisions_read'].every(/* Require every expected top-level common-base report field. */ k=>Object.hasOwn(raw,k))||!counter(raw.revisions_read)||raw.revisions_read<1||raw.revisions_read>1024||!validComparison(raw.comparison,{...expected})||!raw.selection)throw Error('Invalid common-base report');


  if(!comparisonFields.every(/* Reject any changed comparison coordinate before interpreting a common base. */ k=>JSON.stringify(raw.comparison[k])===JSON.stringify(expected[k])))throw Error('Branches changed. Refresh comparison before inspecting their common base');


  const result=raw.selection,keys=Object.keys(result),has=/* Require the exact field set for each common-base result variant. */ fields=>keys.length===fields.length&&fields.every(/* Check explicit presence of every field in this result variant. */ k=>Object.hasOwn(result,k));


  const valid=result.result==='base'?has(['result','revision','snapshot','source_in_target','target_in_source'])&&validId(result.revision)&&validId(result.snapshot)&&typeof result.source_in_target==='boolean'&&typeof result.target_in_source==='boolean':result.result==='unrelated'?has(['result']):result.result==='ambiguous'&&has(['result','revisions'])&&Array.isArray(result.revisions)&&result.revisions.length>=2&&result.revisions.length<=1024&&result.revisions.every(validId)&&new Set(result.revisions.map(idString)).size===result.revisions.length;


  if(!valid||result.result==='base'&&(result.source_in_target!==sameId(result.revision,expected.source_revision)||result.target_in_source!==sameId(result.revision,expected.parent_revision)||result.source_in_target&&!sameId(result.snapshot,expected.source_snapshot)||result.target_in_source&&!sameId(result.snapshot,expected.parent_snapshot)))throw Error('Invalid common-base report');

  return structuredClone(raw);
 }


 /** Suspend editing and protected operations during lock, uncertain or securing lifecycle states. */
 requireUnlocked(){if(this.lifecycle!=='unlocked')throw Error('Workspace is locking or locked; editing is suspended');}


 /** Return a detached clipboard view only when lifecycle policy allows it. */
 get clipboard(){if(['locked','uncertain'].includes(this.lifecycle))this.requireUnlocked();

  return structuredClone(this.privateClipboard.entries);}


 /** Load private committed references in clipboard-resource order. */
 loadClipboard(more=false){this.requireUnlocked();

  return this.serialise('clipboard',/* Read a committed-reference page inside its queue. */ ()=>this.privateClipboard.load(more));}


 /** Queue one explicit private-clipboard mutation. */
 changeClipboard(mutation){this.requireUnlocked();

  return this.serialise('clipboard',/* Submit the requested private-reference mutation in resource order. */ ()=>this.privateClipboard.mutate(mutation));}


 /** Retry the retained private-clipboard operation while unlocked. */
 retryClipboard(){this.requireUnlocked();

  return this.serialise('clipboard',/* Resume the private clipboard’s pending envelope. */ ()=>this.privateClipboard.retry());}


 /** Capture exact committed provenance, using adaptive working capture only when supported. */
 captureSource(id,startByte,endByte,quote){
  if(this.features.workingCopy)return this.captureAdaptive(id,startByte,endByte,quote);


  this.requireUnlocked();

  const captured=this.get(id),generation=this.privateClipboard.generation;


  if(!counter(startByte)||!counter(endByte)||startByte>=endByte||endByte>new TextEncoder().encode(captured.source).length)throw Error('Invalid source selection');


  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before capturing a provenance reference');


  return this.serialise(id,/* Sequence capture after source operations and before clipboard mutations. */ ()=>this.serialise('clipboard',/* Recheck generation and committed snapshot equality before creating a pinned reference. */ async()=>{
   const d=this.capturedBuffer(captured);


   if(d.runtime.generation!==captured.runtime.generation||!sameId(d.runtime.base,captured.runtime.base))throw Error('Source changed; capture the selection again');


   const snapshot=await this.request('snapshot',snapshotRequest(captured.runtime.document,captured.runtime.snapshot));


   if(snapshot.text!==captured.source)throw Error('Commit this source before capturing a provenance reference');


   const source={document:captured.runtime.document,node:captured.runtime.node,snapshot:captured.runtime.snapshot,revision:captured.runtime.base,occurrence_path:[captured.runtime.occurrence],start_byte:startByte,end_byte:endByte};


   return this.privateClipboard.mutate({action:'capture',generation,source,expected_draft:this.isChildBuffer(captured)?null:{generation:captured.runtime.generation,sequence:captured.acknowledged},quote});
  }));
 }


 /** Return a detached active-buffer view or reject an unknown document. */
 get(id){const d=this.docs.get(id);

  if(!d)throw Error('Unknown runtime document');

  return structuredClone(d);}


 /** Update exact local source and advance its sequence without claiming durable acknowledgement. */
 edit(id,source){
  this.requireUnlocked();

  const d=this.docs.get(id);

  if(!d)throw Error('Unknown runtime document');


  if(typeof source!=='string'||!source.isWellFormed())throw Error('Source contains an invalid Unicode scalar');


  if(d.sequence>=Number.MAX_SAFE_INTEGER)throw Error('Editing sequence limit');

  d.source=source;

  return ++d.sequence;
 }


 /** Serialize work per resource while allowing later work to proceed after a prior rejection. */
 serialise(id,action){
  const next=(this.queues.get(id)||Promise.resolve()).catch(/* Consume the previous queue rejection solely to let the next explicit action run. */ ()=>{}).then(action);

  this.queues.set(id,next);


  /** Remove a completed queue entry only if no newer action replaced it. */
  const cleanup=()=>{if(this.queues.get(id)===next)this.queues.delete(id);};

  next.then(cleanup,cleanup);

  return next;
 }


 /** Send or retry one frozen save/Commit command and accept only an exactly corresponding acknowledgement. */
 async send(d,request){
  if(!d.pending){if(validId(d.runtime.branch)&&!sameId(d.runtime.branch,this.originalBranches.get(d.id))){const {command,...mutation}=request;

    request={command:'branch',mutation:{action:command,branch:d.runtime.branch,...mutation}};}

   d.pending=frozenCopy({operation:operationId(),request});}


  const frozen=d.pending;


  try{
   const receipt=await retryTransport(this.request,'commands',frozen),scoped=frozen.request.command==='branch',command=scoped?{command:frozen.request.mutation.action,...frozen.request.mutation}:frozen.request,result=scoped?receipt?.outcome?.state?.outcome:receipt?.outcome;


   if(scoped&&(receipt?.outcome?.result!=='branch'||!sameId(receipt.outcome.state.branch,d.runtime.branch)))throw Error('Mismatched branch acknowledgement');


   if(!sameId(receipt?.operation,frozen.operation))throw Error('Mismatched runtime receipt');


   const expected=command.command==='save'?'saved':'committed';


   if(result?.result!==expected||!sameId(result.document,command.document)||!sameId(result.document,d.runtime.document)||!counter(result.generation)||result.generation!==command.generation+1||!counter(result.sequence)||result.sequence!==command.sequence)throw Error('Mismatched runtime acknowledgement');


   if(expected==='committed'&&(!validId(result.revision)||!validId(result.snapshot)))throw Error('Invalid committed snapshot receipt');


   d.runtime.generation=result.generation;d.acknowledged=result.sequence;d.runtime.acknowledged_sequence=result.sequence;


   if(expected==='committed'){d.runtime.base=[...result.revision];d.runtime.snapshot=[...result.snapshot];}


   d.pending=null;d.error=null;

   return receipt;
  }catch(error){d.error=error.message;

   throw error;}
 }


 /** Acknowledge captured source in order, rejecting captures older than already acknowledged state. */
 async saveCaptured(d,captured){
  if(d.pending)await this.send(d,d.pending.request);


  if(captured.sequence<d.acknowledged)throw Error('Captured buffer is older than the acknowledged draft');


  if(captured.sequence===d.acknowledged)return;


  await this.send(d,{command:'save',document:d.runtime.document,generation:d.runtime.generation,base:d.runtime.base,previous_sequence:d.acknowledged,sequence:captured.sequence,text:captured.source});
 }


 /** Save one captured draft and report durable recovery acknowledgement without creating history. */
 checkpoint(id){this.requireUnlocked();

  const captured=this.get(id);

  return this.serialise(id,/* Save the captured branch buffer before returning the acknowledged checkpoint sequence. */ async()=>{const d=this.capturedBuffer(captured);

   await this.saveCaptured(d,captured);

   return {document:id,sequence:captured.sequence,durable:true};});}


 // Logical departure only: never called by DOM blur or autosave.
 /** Commit changed source on logical departure, independently of blur or autosave. */
 depart(id){this.requireUnlocked();

  const captured=this.get(id);

  return this.serialise(id,/* Commit the captured departing buffer only when it differs from its committed snapshot. */ ()=>this.commitCaptured(this.capturedBuffer(captured),captured,true));}


 /** Explicitly Commit the captured document buffer in document-resource order. */
 commit(id){this.requireUnlocked();

  const captured=this.get(id);

  return this.serialise(id,/* Commit the exact buffer captured at the user’s command. */ ()=>this.commitCaptured(this.capturedBuffer(captured),captured));}


 /** Resolve pending Commit or save then Commit, promoting references only after acknowledgement. */
 async commitCaptured(d,captured,onlyChanged=false){
  const pending=d.pending?.request;


  let receipt;


  if(pending&&(pending.command==='commit'&&pending.sequence===captured.sequence||pending.command==='branch'&&pending.mutation.action==='commit'&&pending.mutation.sequence===captured.sequence))receipt=await this.send(d,pending);
  else {
   await this.saveCaptured(d,captured);


   if(onlyChanged){const snapshot=await this.snapshot(captured.id,d.runtime.snapshot);

    if(snapshot.text===captured.source)return null;}


   receipt=await this.send(d,{command:'commit',document:d.runtime.document,generation:d.runtime.generation,base:d.runtime.base,sequence:captured.sequence});
  }


  await this.promoteWorking(receipt.operation).catch(/* Preserve successful text Commit while reporting separate reference-promotion failure. */ error=>{this.workingClipboard.error='Text committed; reference replacement needs attention: '+error.message;});

  return receipt;
 }


 /** Reuse pending creation bytes and register its validated output editor only when requested. */
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
    const editor=await this.request('editor',documentRequest(receipt.outcome.document));


    if(!sameId(editor?.document,receipt.outcome.document)||!validId(editor.node)||!validId(editor.occurrence))throw Error('Invalid created editor state');


    this.registerEditor(editor);
   }


   state=this.get(id);
  }


  this.creationPending=null;this.creationRegistersEditor=false;

  return register?state:receipt;
 }


 /** Validate the requested document name and create a registered editor in creation order. */
 createAndRegister(title,text=''){
  this.requireUnlocked();

  if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid document name');


  return this.serialise('create',/* Create and register the frozen document request after prior creations settle. */ ()=>this.sendCreation(title,text,true));
 }


 /** Retry pending creation with its original title and text. */
 retryCreation(){
  this.requireUnlocked();

  return this.serialise('create',/* Reject absent creation state and resend the original creation inputs. */ ()=>{if(!this.creationPending)throw Error('No pending document creation');

   const {title,text}=this.creationPending.request;

   return this.sendCreation(title,text,true);});
 }


 /** Create a document receipt without implicitly registering an editor. */
 create(title,text=''){this.requireUnlocked();

  return this.serialise('create',/* Send creation within its resource queue. */ ()=>this.sendCreation(title,text));}


 /** Settle captured drafts and all queued/pending resources before a security lifecycle transition. */
 async settleDrafts(captured){
  const actions=captured.map(/* Schedule each captured buffer’s exact save in document order. */ state=>this.serialise(state.id,/* Save the captured branch rather than the currently selected branch. */ ()=>this.saveCaptured(this.capturedBuffer(state),state)));


  if(this.queues.has('create'))actions.push(this.queues.get('create'));


  if(this.queues.has('assertions'))actions.push(this.queues.get('assertions'));


  if(this.queues.has('merge'))actions.push(this.queues.get('merge'));


  if(this.queues.has('fork'))actions.push(this.queues.get('fork'));


  if(this.queues.has('clipboard'))actions.push(this.queues.get('clipboard'));


  if(this.queues.has('comments'))actions.push(this.queues.get('comments'));


  if(this.queues.has('branches'))actions.push(this.queues.get('branches'));


  if(this.queues.has('working-clipboard'))actions.push(this.queues.get('working-clipboard'));


  const settled=await Promise.allSettled(actions),failed=settled.find(/* Identify a rejected settlement so lock or keychain work cannot proceed as if saving succeeded. */ result=>result.status==='rejected');

  if(failed)throw failed.reason;


  if(this.creationPending){const {title,text}=this.creationPending.request;

   await this.sendCreation(title,text);}


  if(this.forkPending)await this.sendFork();


  if(this.mergePending)await this.sendMerge();


  if(this.assertions.pending)await this.assertions.retry();


  if(this.privateClipboard.pending)await this.privateClipboard.retry();


  if(this.comments.pending)await this.comments.retry();


  if(this.branchPending)await this.sendBranch();


  if(this.workingClipboard.pending)await this.workingClipboard.retry();
 }


 /** Read credential-free keychain enrollment status for explicit UI and uncertain-result reconciliation. */
 keychainStatus(){return this.request('keychain/status',emptyRequest());}


 /** Perform explicit enrollment/removal after settling work, reconciling lost replies through status. */
 async keychain(action){
  if(!['enroll','remove'].includes(action))throw Error('Invalid keychain action');


  this.requireUnlocked();this.lifecycle='securing';

  const captured=this.allBuffers();


  try{
   await this.settleDrafts(captured);


   let receipt;


   try{receipt=await this.request('keychain/'+action,emptyRequest());}
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


 /** Capture and settle all drafts before lock, distinguishing pre-lock failure from uncertain lock outcome. */
 lock(){
  if(this.lifecycle==='securing')return Promise.reject(Error('Keychain operation is in progress'));


  if(this.lifecycle==='locked')return Promise.resolve({locked:true});


  if(this.lockPromise)return this.lockPromise;


  this.lifecycle='locking';

  const captured=this.allBuffers();

  let lockAttempted=false;


  this.lockPromise=(/* Finish pending work, request lock and update lifecycle only after a validated acknowledgement. */ async()=>{
   try{
    await this.settleDrafts(captured);
    lockAttempted=true;

    const receipt=await retryTransport(this.request,'lock',{});


    if(receipt?.locked!==true)throw Error('Invalid lock acknowledgement');


    this.lifecycle='locked';

    return receipt;
   }catch(error){this.lifecycle=lockAttempted?'uncertain':'unlocked';

    throw error;}
   finally{this.lockPromise=null;}
  })();

  return this.lockPromise;
 }


 /** Read a pinned exact snapshot with bounded text validation. */
 snapshot(id,snapshot){
  this.requireUnlocked();

  const d=this.get(id);

  if(snapshot!==undefined&&!validId(snapshot))throw Error('Invalid snapshot identity');


  const body=frozenCopy(snapshotRequest(d.runtime.document,snapshot??d.runtime.snapshot));


  return Promise.resolve(this.request('snapshot',body)).then(/* Reject malformed or oversized source before exposing snapshot text. */ result=>{
   if(typeof result?.text!=='string'||!result.text.isWellFormed()||new TextEncoder().encode(result.text).length>2*1024*1024)throw Error('Invalid snapshot response');


   return {text:result.text};
  });
 }


 /** Read bounded committed history with branch-scoped or legacy cursor validation and chain checks. */
 async history(id,next=null,limit=12,snapshot){
  this.requireUnlocked();

  const scoped=!!this.features.branches,opaque=/* Recognise a bounded opaque branch-history cursor without interpreting its bytes as an identity. */ v=>Array.isArray(v)&&v.length>0&&v.length<=4096&&v.every(/* Require opaque cursor elements to be integer bytes. */ n=>Number.isInteger(n)&&n>=0&&n<=255);


  if(next!==null&&!(scoped?opaque(next):validId(next))||!Number.isInteger(limit)||limit<1||limit>32)throw Error('Invalid history request');


  const d=this.get(id),pinned=snapshot??d.runtime.snapshot;

  if(scoped&&!validId(pinned))throw Error('Invalid history snapshot');

  const page=await this.request(scoped?'branches/history/page':'history',frozenCopy(scoped?{document:d.runtime.document,branch:d.runtime.branch,snapshot:pinned,cursor:next,limit}:{document:d.runtime.document,next,limit}));


  if(!sameId(page?.document,d.runtime.document)||!Array.isArray(page.entries)||!page.entries.length||page.entries.length>limit||page.next!==null&&!(scoped?opaque(page.next):validId(page.next))||scoped&&(!sameId(page.branch,d.runtime.branch)||!sameId(page.snapshot,pinned)||!opaque(page.cursor)))throw Error('Invalid history page');


  const seen=new Set();

  for(const [i,e] of page.entries.entries()){
   if(!['revision','snapshot','operation','actor','device'].every(/* Validate immutable history-entry identities. */ k=>validId(e[k]))||e.parent!==null&&!validId(e.parent)||!counter(e.text_bytes)||e.text_bytes>2*1024*1024)throw Error('Invalid history entry');


   const key=idString(e.revision);

   if(seen.has(key)||sameId(e.revision,e.parent))throw Error('Invalid history cycle');

   seen.add(key);


   if(i&&!sameId(page.entries[i-1].parent,e.revision)||!scoped&&i===0&&next!==null&&!sameId(next,e.revision))throw Error('Invalid history chain');
  }


  const parent=page.entries.at(-1).parent;


  if(scoped){if((parent===null)!==(page.next===null)||next===null&&!sameId(page.entries[0].snapshot,pinned))throw Error('Invalid branch history continuation');}
  else {if(parent===null?page.next!==null:!sameId(parent,page.next))throw Error('Invalid history cursor');

   if(page.next!==null&&seen.has(idString(page.next)))throw Error('Invalid history cycle');}


  return structuredClone(page);
 }

}

/** Build text-labelled unlock and creation UI elements safely. */
function element(tag,text){const e=document.createElement(tag);

 if(text)e.textContent=text;

 return e;}

/** Establish the trusted HTTPS runtime, explicitly unlock and load capability-scoped real document buffers. */
export async function initializeRuntime(){
 if(location.protocol!=='https:')return null;


  if(document.querySelector('meta[name="hpx-development-mode"]')?.content==='mock')return null;


 const cover=element('div');

 cover.className='runtime-unlock';

 const form=element('form'),heading=element('h1','Hypergraph PX'),status=element('p','Connecting to local runtime…'),label=element('label','Workspace passphrase'),input=element('input'),submit=element('button','Unlock workspace'),keychain=element('button','Unlock with macOS Keychain');


 const logo=element('img');

 logo.src='/assets/logo.png';logo.alt='';logo.width=36;logo.height=36;heading.prepend(logo);
 keychain.type='button';keychain.hidden=true;


 const actions=element('div');

 actions.className='dialog-actions';actions.append(submit,keychain);
 input.type='password';input.autocomplete='current-password';input.required=true;input.maxLength=1024;input.setAttribute('aria-label','Workspace passphrase');label.append(input);submit.type='submit';form.append(heading,status,label,actions);cover.append(form);document.body.append(cover);submit.disabled=true;


 try{
  const fragment=new URLSearchParams(location.hash.slice(1)),launch=fragment.get('launch');

  if(launch){history.replaceState(null,'',location.pathname);await runtimeRequest('bootstrap',bootstrapRequest(launch));}


  let runtime=await runtimeRequest('runtime');

  if(runtime.contract!==1||runtime.mode!=='trusted_server'||runtime.ownership!=='whole_document')throw Error('Unsupported runtime contract');


  if(runtime.locked){status.textContent=runtime.create?'Create an encrypted local workspace. Choose its unlock passphrase.':'Unlock your encrypted local workspace.';submit.textContent=runtime.create?'Create workspace':'Unlock workspace';input.autocomplete=runtime.create?'new-password':'current-password';submit.disabled=false;input.focus();


   if(runtime.keychain_supported){const enrollment=await runtimeRequest('keychain/status',emptyRequest());

    keychain.hidden=!enrollment.enrolled;}


   await new Promise(/* Wait for an explicit successful passphrase or enrolled-keychain unlock. */ resolve=>{
    /** Disable competing unlock controls and clear the secret input before awaiting an unlock attempt. */
    const attempt=async action=>{submit.disabled=keychain.disabled=true;input.value='';

     try{await action();resolve();}catch(error){status.textContent=error.message==='unlock_failed'?'Workspace could not be unlocked. Check the passphrase and workspace.':error.message==='keychain_denied'?'Keychain access was denied or canceled. You can use your passphrase.':error.message;submit.disabled=keychain.disabled=false;input.focus();}};


    form.onsubmit=/* Capture the submitted passphrase for one explicit unlock attempt. */ event=>{event.preventDefault();

     const passphrase=input.value;

     void attempt(/* Send the captured passphrase through the typed unlock request. */ ()=>runtimeRequest('unlock',unlockRequest(passphrase)));};
    keychain.onclick=/* Start an explicit enrolled-keychain unlock attempt. */ ()=>void attempt(/* Send keychain unlock without enrolling a credential or sending a passphrase. */ ()=>runtimeRequest('unlock/keychain',emptyRequest()));
   });
   keychain.hidden=true;
  }


  const summaries=await runtimeRequest('documents',{});


  if(!summaries.length){status.textContent='Name your first document.';label.textContent='Document name';input.type='text';input.autocomplete='off';input.value='';input.maxLength=512;input.setAttribute('aria-label','Document name');label.append(input);submit.textContent='Create document';submit.disabled=false;input.focus();


   const creator=new RuntimeAdapter([]);


   const summary=await new Promise(/* Wait for explicit first-document creation before loading editor state. */ resolve=>{form.onsubmit=/* Create the named first document and preserve errors for retry without dismissing the form. */ async event=>{event.preventDefault();

     if(!input.value.trim())return;

     submit.disabled=true;

     try{const receipt=await creator.create(input.value);

      resolve({document:receipt.outcome.document});}catch(error){status.textContent=error.message;submit.disabled=false;}};});

   summaries.push(summary);
  }


  const states=[];

  for(const summary of summaries)states.push(await runtimeRequest('editor',documentRequest(summary.document)));


  const features={parentBase:runtime.capabilities?.includes('branch_parent_base')??false,branchComparison:runtime.capabilities?.includes('branch_parent_comparison')??false,branches:runtime.capabilities?.includes('local_branches')??false,workingCopy:runtime.capabilities?.includes('working_copy')??false},adapter=new RuntimeAdapter(states,runtimeRequest,features),clipboardSupported=runtime.capabilities?.includes('private_clipboard')??false;


  if(clipboardSupported)await adapter.loadClipboard();


  if(features.workingCopy){await adapter.loadWorkingClipboard();await adapter.reconcileWorkingReferences().catch(/* Report reference reconciliation failure separately from otherwise usable loaded source. */ error=>{adapter.workingClipboard.error='Reference replacement needs attention: '+error.message;});}


  cover.remove();

  return {adapter,auditSupported:runtime.capabilities?.includes('document_integrity_audit')??false,clipboardSupported,branchesSupported:features.branches,workingCopySupported:features.workingCopy,commentsSupported:runtime.capabilities?.includes('committed_passage_comments')??false,publicationContributorsSupported:runtime.capabilities?.includes('publication_contributors')??false,transformationGraphSupported:runtime.capabilities?.includes('transformation_graph')??false,mergeSupported:runtime.capabilities?.includes('reviewed_merge')??false,assertionHistorySupported:runtime.capabilities?.includes('assertion_review_history')??false,overlayGraphSupported:runtime.capabilities?.includes('semantic_overlay_graph')??false,assertionsSupported:runtime.capabilities?.includes('semantic_assertion_overlay')??false,graphSupported:runtime.capabilities?.includes('document_fork_graph')??false,forkSupported:runtime.capabilities?.includes('fork')??false,documents:[...adapter.docs.values()].map(/* Expose detached document summaries for application editor setup. */ d=>({id:d.id,title:d.title,source:d.source}))};
 }catch(error){status.textContent=`Connection unavailable: ${error.message}. Open the private launch URL printed by the runtime.`;label.hidden=true;submit.hidden=true;

  throw error;}
}
