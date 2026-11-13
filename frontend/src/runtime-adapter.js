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
export function operationId(){return [...crypto.getRandomValues(new Uint8Array(32))];}
const idString=id=>id.map(byte=>byte.toString(16).padStart(2,'0')).join('');

const sameId=(a,b)=>validId(a)&&validId(b)&&a.every((byte,i)=>byte===b[i]);
const validId=id=>Array.isArray(id)&&id.length===32&&id.every(byte=>Number.isInteger(byte)&&byte>=0&&byte<=255);
const counter=n=>Number.isSafeInteger(n)&&n>=0;
const comparisonFields=['document','node','branch','parent','source_name','parent_name','source_revision','source_snapshot','parent_revision','parent_snapshot'];
function validComparison(context,scope){
 return context&&Object.keys(context).length===comparisonFields.length&&comparisonFields.every(k=>Object.hasOwn(context,k))&&comparisonFields.filter(k=>!k.endsWith('_name')).every(k=>validId(context[k]))&&sameId(context.document,scope.document)&&sameId(context.node,scope.node)&&sameId(context.branch,scope.branch)&&!sameId(context.parent,scope.branch)&&['source_name','parent_name'].every(k=>typeof context[k]==='string'&&context[k].isWellFormed()&&context[k].trim()&&new TextEncoder().encode(context[k]).length<=512);
}
function frozenCopy(value){const copy=structuredClone(value);const freeze=item=>{if(item&&typeof item==='object'){for(const child of Object.values(item))freeze(child);Object.freeze(item);}return item;};return freeze(copy);}
async function retryTransport(request,path,body){
 for(let attempt=0;attempt<2;attempt++){
  try{return await request(path,body);}catch(error){if(error.status||attempt===1)throw error;}
 }
}
export class RuntimeAdapter {
 constructor(states,request=runtimeRequest,features={}){
  this.request=request;this.features=features;this.docs=new Map();this.buffers=new Map();this.originalBranches=new Map();this.branchNames=new Map();this.branchPending=null;this.workingClipboard=new RuntimeWorkingClipboard(request,operationId);this.privateClipboard=new RuntimeClipboard(request,operationId);this.assertions=new RuntimeAssertions(request,operationId);this.comments=new RuntimeComments(request,operationId);this.queues=new Map();this.lifecycle='unlocked';this.lockPromise=null;this.creationPending=null;this.creationRegistersEditor=false;this.forkPending=null;this.mergePending=null;
  for(const input of states)this.registerEditor(input);
 }
 registerEditor(input){
  const state=structuredClone(input);
  if(!validId(state.document)||!validId(state.base)||!validId(state.snapshot)||!counter(state.generation)||!counter(state.acknowledged_sequence)||typeof state.text!=='string'||!state.text.isWellFormed())throw Error('Invalid runtime editor state');
  const id=idString(state.document);if(this.docs.has(id))throw Error('Duplicate runtime document');
  const buffer=this.makeBuffer(state);this.originalBranches.set(id,state.branch);this.branchNames.set(buffer.context,'Original');this.docs.set(id,buffer);return this.get(id);
 }
 makeBuffer(state){
  const id=idString(state.document),context=validId(state.branch)?id+'/'+idString(state.branch):id;
  const buffer={id,context,title:state.title,source:state.text,sequence:state.acknowledged_sequence,acknowledged:state.acknowledged_sequence,runtime:structuredClone(state),pending:null,error:null};this.buffers.set(context,buffer);return buffer;
 }
 contextKey(id){return this.get(id).context;}
 branchLabel(id){return this.branchNames.get(this.contextKey(id))??'Alternative';}
 capturedBuffer(captured){const d=this.buffers.get(captured.context);if(!d)throw Error('Unknown branch buffer');return d;}
 isChild(id){const d=this.get(id);return validId(d.runtime.branch)&&!sameId(d.runtime.branch,this.originalBranches.get(id));}
 allBuffers(){return [...this.buffers.values()].map(d=>structuredClone(d));}
 async branchPage(id,next=null){
  this.requireUnlocked();const d=this.get(id),body=frozenCopy({document:d.runtime.document,next,limit:16}),page=await this.request('branches',body);
  if(!sameId(page?.document,body.document)||!sameId(page.original_branch,this.originalBranches.get(id))||!Array.isArray(page.entries)||page.entries.length>16||page.next!==null&&!validId(page.next))throw Error('Invalid branch page');
  let ordinal=null;const seen=new Set();for(const e of page.entries){if(!['document','node','branch','draft','parent','revision','snapshot','actor','device','operation'].every(k=>validId(e[k]))||!sameId(e.document,body.document)||!sameId(e.node,d.runtime.node)||sameId(e.branch,e.parent)||sameId(e.branch,page.original_branch)||typeof e.name!=='string'||!e.name.isWellFormed()||!e.name.trim()||new TextEncoder().encode(e.name).length>512||!counter(e.ordinal)||e.ordinal===0||e.previous!==null&&!validId(e.previous)||ordinal!==null&&e.ordinal!==ordinal-1)throw Error('Invalid branch metadata');const key=idString(e.branch);if(seen.has(key))throw Error('Invalid branch listing cycle');seen.add(key);ordinal=e.ordinal;this.branchNames.set(id+'/'+idString(e.branch),e.name);}
  if(next!==null&&page.entries.length&&!sameId(next,page.entries[0].branch)||page.entries.length&&JSON.stringify(page.next)!==JSON.stringify(page.entries.at(-1).previous))throw Error('Invalid branch continuation');return structuredClone(page);
 }
 async selectBranch(id,branch){
  this.requireUnlocked();if(!validId(branch))throw Error('Invalid branch identity');const captured=this.get(id);if(sameId(branch,captured.runtime.branch))return captured;
  return this.serialise(id,async()=>{
   await this.commitCaptured(this.capturedBuffer(captured),captured,true);
   const key=id+'/'+idString(branch);let buffer=this.buffers.get(key);
   if(!buffer){const editor=await this.request('branches/editor',frozenCopy(branchRequest(captured.runtime.document,branch)));if(!sameId(editor?.document,captured.runtime.document)||!sameId(editor.branch,branch)||!sameId(editor.node,captured.runtime.node)||!sameId(editor.manifest,captured.runtime.manifest)||!sameId(editor.occurrence,captured.runtime.occurrence)||!validId(editor.draft)||!validId(editor.base)||!validId(editor.snapshot)||!counter(editor.generation)||!counter(editor.acknowledged_sequence)||typeof editor.text!=='string'||!editor.text.isWellFormed()||new TextEncoder().encode(editor.text).length>2*1024*1024)throw Error('Invalid branch editor');buffer=this.makeBuffer(editor);}
   this.docs.set(id,buffer);return this.get(id);
  });
 }
 createBranch(id,name,reviewed=this.get(id)){
  this.requireUnlocked();const d=structuredClone(reviewed);if(d.id!==id)throw Error('Branch review changed');if(this.branchPending)throw Error('Retry the pending branch creation first');if(typeof name!=='string'||!name.isWellFormed()||!name.trim()||new TextEncoder().encode(name).length>512)throw Error('Invalid branch name');
  this.branchPending=frozenCopy({operation:operationId(),request:{command:'branch',mutation:{action:'create',document:d.runtime.document,parent:d.runtime.branch,revision:d.runtime.base,snapshot:d.runtime.snapshot,name}}});return this.serialise('branches',()=>this.sendBranch());
 }
 async sendBranch(){const frozen=this.branchPending;if(!frozen)throw Error('No pending branch creation');let receipt;try{receipt=await retryTransport(this.request,'commands',frozen);}catch(error){if(error.status>=400&&error.status<500)this.branchPending=null;throw error;}const state=receipt?.outcome?.state;if(!sameId(receipt?.operation,frozen.operation)||receipt?.outcome?.result!=='branch'||!validId(state?.branch)||sameId(state.branch,frozen.request.mutation.parent)||state.outcome?.result!=='created'||!sameId(state.outcome.document,frozen.request.mutation.document))throw Error('Invalid branch creation receipt');this.branchNames.set(idString(state.outcome.document)+'/'+idString(state.branch),frozen.request.mutation.name);this.branchPending=null;return structuredClone(state);}
 retryBranch(){this.requireUnlocked();return this.serialise('branches',()=>this.sendBranch());}
 captureAdaptive(id,start,end,quote,retainCommitted=true){
  this.requireUnlocked();const captured=this.get(id),raw=new TextEncoder().encode(captured.source);
  if(this.privateClipboard.pending||this.workingClipboard.pending)throw Error('Retry the pending source reference first');
  if(!counter(start)||!counter(end)||start>=end||end>raw.length||typeof quote!=='string'||!quote.isWellFormed())throw Error('Invalid exact source range');
  let selected;try{selected=new TextDecoder('utf-8',{fatal:true}).decode(raw.slice(start,end));}catch{throw Error('Selection splits a scalar');}if(selected!==quote)throw Error('Selection changed');
  return this.serialise(id,async()=>{const d=this.capturedBuffer(captured);await this.saveCaptured(d,captured);
   const snapshot=await this.request('snapshot',frozenCopy(snapshotRequest(d.runtime.document,d.runtime.snapshot)));
   if(typeof snapshot?.text!=='string')throw Error('Invalid committed source');
   if(snapshot.text===captured.source){const source=frozenCopy({document:d.runtime.document,node:d.runtime.node,snapshot:d.runtime.snapshot,revision:d.runtime.base,occurrence_path:[d.runtime.occurrence],start_byte:start,end_byte:end});if(!retainCommitted)return {captured_source:source};return this.serialise('clipboard',async()=>{const state=await this.privateClipboard.mutate({action:'capture',generation:this.privateClipboard.generation,source,expected_draft:this.isChildBuffer(captured)?null:{generation:d.runtime.generation,sequence:captured.sequence},quote});return {...state,captured_source:source};});}
   const plan=frozenCopy({document:d.runtime.document,branch:d.runtime.branch,generation:d.runtime.generation,base:d.runtime.base,sequence:captured.sequence,text:captured.source,start_byte:start,end_byte:end,quote});return this.serialise('working-clipboard',()=>this.workingClipboard.copy(plan));
  });
 }
 isChildBuffer(d){return validId(d.runtime.branch)&&!sameId(d.runtime.branch,this.originalBranches.get(d.id));}
 async forkSelected(id,start,end,quote,title){if(this.forkPending)throw Error('Retry the pending fork first');if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid fork name');const capture=await this.captureAdaptive(id,start,end,quote,false);return capture.source?this.forkWorkingReference(capture.source,quote,title):this.forkReference(capture.captured_source,quote,title);}
 forkWorkingReference(source,quote,title){
  this.requireUnlocked();if(this.forkPending)throw Error('Retry the pending fork first');if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid fork name');
  const plan=frozenCopy({title,source,quote});return this.serialise('fork',()=>{if(this.forkPending)throw Error('Retry the pending fork first');this.forkPending=frozenCopy({operation:operationId(),request:{command:'working_fork',plan}});return this.sendFork();});
 }
 captureWorking(id,start,end,quote){
  this.requireUnlocked();const captured=this.get(id);if(this.workingClipboard.pending)throw Error('Retry the pending working-reference operation first');
  return this.serialise(id,()=>this.serialise('working-clipboard',async()=>{const d=this.capturedBuffer(captured);await this.saveCaptured(d,captured);return this.workingClipboard.copy({document:d.runtime.document,branch:d.runtime.branch,generation:d.runtime.generation,base:d.runtime.base,sequence:captured.sequence,text:captured.source,start_byte:start,end_byte:end,quote});}));
 }
 loadWorkingClipboard(more=false){this.requireUnlocked();return this.serialise('working-clipboard',()=>this.workingClipboard.load(more));}
 changeWorkingClipboard(mutation){this.requireUnlocked();return this.serialise('working-clipboard',()=>this.workingClipboard.mutate(mutation));}
 retryWorkingClipboard(){this.requireUnlocked();return this.serialise('working-clipboard',()=>this.workingClipboard.retry());}
 async promoteWorking(publication){if(!this.features.workingCopy)return;return this.serialise('working-clipboard',async()=>{await this.workingClipboard.load();if(this.workingClipboard.pending)await this.workingClipboard.retry();return this.workingClipboard.mutate({action:'promote',generation:this.workingClipboard.generation,publication});});}
 async reconcileWorkingReferences(){
  if(!this.features.workingCopy)return;return this.serialise('working-clipboard',async()=>{
   if(this.workingClipboard.pending)await this.workingClipboard.retry();
   await this.workingClipboard.load();while(this.workingClipboard.next!==null)await this.workingClipboard.load(true);
   const publications=new Map();for(const e of this.workingClipboard.entries){if(e.target.kind!=='working')continue;const view=await this.workingClipboard.inspect(e.target.source);if(view.promotion)publications.set(idString(view.promotion.operation),view.promotion.operation);}
   for(const publication of publications.values())await this.workingClipboard.mutate({action:'promote',generation:this.workingClipboard.generation,publication});
   this.workingClipboard.error=null;
  });
 }
 async sendMerge(){
  if(!this.mergePending)throw Error('No pending merge');
  const frozen=this.mergePending;let receipt;
  try{receipt=await retryTransport(this.request,'commands',frozen);}catch(error){if(error.status>=400&&error.status<500)this.mergePending=null;throw error;}
  const result=receipt?.outcome;
  if(!sameId(receipt?.operation,frozen.operation)||result?.result!=='merged'||!['document','transformation','revision','snapshot'].every(key=>validId(result[key]))||frozen.request.plan.inputs.some(input=>sameId(result.document,input.source.document)))throw Error('Mismatched merge receipt');
  const id=idString(result.document);
  if(!this.docs.has(id)){
   const state=await this.request('editor',documentRequest(result.document));
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
  const working=frozen.request.command==='working_fork',result=working?receipt?.outcome?.state:receipt?.outcome;
  if(!sameId(receipt?.operation,frozen.operation)||(working?receipt?.outcome?.result!=='working_forked':result?.result!=='forked')||!['document','transformation','revision','snapshot'].every(key=>validId(result[key]))||sameId(result.document,frozen.request.plan.source.document))throw Error('Mismatched fork receipt');
  const id=idString(result.document);
  if(!this.docs.has(id)){
   const state=await this.request('editor',documentRequest(result.document));
   if(!sameId(state?.document,result.document)||!validId(state.node)||!validId(state.occurrence)||sameId(state.node,frozen.request.plan.source.node))throw Error('Invalid fork editor state');
   this.registerEditor(state);
  }
  this.forkPending=null;return this.get(id);
 }
 retryFork(){this.requireUnlocked();return this.serialise('fork',()=>this.sendFork());}
 forkSource(id,startByte,endByte,quote,title){
  if(this.features.workingCopy)return this.forkSelected(id,startByte,endByte,quote,title);
  this.requireUnlocked();const captured=this.get(id);
  if(this.forkPending)throw Error('Retry the pending fork before creating another');
  if(typeof title!=='string'||!title.trim()||new TextEncoder().encode(title).length>512||!title.isWellFormed())throw Error('Invalid fork name');
  if(!counter(startByte)||!counter(endByte)||startByte>=endByte||typeof quote!=='string'||!quote.isWellFormed())throw Error('Invalid source selection');
  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before forking');
  return this.serialise(id,()=>this.serialise('fork',async()=>{
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
 forkReference(source,quote,title){
  this.requireUnlocked();
  if(this.forkPending)throw Error('Retry the pending fork before creating another');
  if(typeof title!=='string'||!title.trim()||!title.isWellFormed()||new TextEncoder().encode(title).length>512)throw Error('Invalid fork name');
  if(!source||!['document','node','snapshot','revision'].every(k=>validId(source[k]))||!Array.isArray(source.occurrence_path)||source.occurrence_path.length!==1||!source.occurrence_path.every(validId)||!counter(source.start_byte)||!counter(source.end_byte)||source.end_byte<=source.start_byte||typeof quote!=='string'||!quote.isWellFormed()||new TextEncoder().encode(quote).length!==source.end_byte-source.start_byte)throw Error('Invalid captured source');
  const plan=frozenCopy({title,source,expected_draft:null,quote});
  return this.serialise('fork',async()=>{
   if(this.forkPending)throw Error('Retry the pending fork before creating another');
   this.forkPending=frozenCopy(forkExecution(operationId(),plan));return this.sendFork();
  });
 }
 publicationContributors(id,snapshot,cursor=null,limit=16){this.requireUnlocked();const d=this.get(id);return publicationContributors(this.request,d.runtime.document,snapshot??d.runtime.snapshot,cursor,limit);}
 commentPage(id,snapshot,next=null){this.requireUnlocked();const d=this.get(id);return this.comments.page(d.runtime.document,snapshot??d.runtime.snapshot,next);}
 createComment(input){this.requireUnlocked();const plan=commentPlan(input);return this.serialise('comments',()=>this.comments.create(plan));}
 retryComment(){this.requireUnlocked();return this.serialise('comments',()=>this.comments.retry());}
 assertionRevision(node,revision){this.requireUnlocked();return this.assertions.revision(node,revision);}
 assertionPage(id,generation=null,offset=0){this.requireUnlocked();const d=this.get(id);return this.assertions.page(d.runtime.document,d.runtime.snapshot,generation,offset);}
 retryAssertion(){this.requireUnlocked();return this.serialise('assertions',()=>this.assertions.retry());}
 createCapturedAssertion(input){this.requireUnlocked();const mutation=frozenCopy(capturedAssertion(input));return this.serialise('assertions',()=>this.assertions.mutate(mutation));}
 reviewAssertion(entry,status){this.requireUnlocked();return this.serialise('assertions',()=>this.assertions.mutate({action:'review',node:entry.record.node,revision:entry.revision,generation:entry.generation,status}));}
 createAssertion(id,inputs,fields){
  this.requireUnlocked();const captured=this.get(id),plan=frozenCopy({inputs,fields});
  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before proposing a relationship');
  return this.serialise(id,()=>this.serialise('assertions',async()=>{
   const d=this.capturedBuffer(captured);if(d.runtime.generation!==captured.runtime.generation||!sameId(d.runtime.base,captured.runtime.base))throw Error('Source changed; select the participants again');
   const snapshot=await this.request('snapshot',snapshotRequest(captured.runtime.document,captured.runtime.snapshot));if(snapshot.text!==captured.source)throw Error('Commit this source before proposing a relationship');
   const participants=plan.inputs.map(input=>({role:input.role,source:{document:captured.runtime.document,node:captured.runtime.node,snapshot:captured.runtime.snapshot,revision:captured.runtime.base,occurrence_path:[captured.runtime.occurrence],start_byte:input.start_byte,end_byte:input.end_byte},expected_draft:this.isChildBuffer(captured)?null:{generation:captured.runtime.generation,sequence:captured.acknowledged},quote:input.quote}));
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
 async auditDocument(id,maxBytes){this.requireUnlocked();const request=auditRequest(this.get(id).runtime.document,maxBytes),report=await this.request('audit/document',request);this.requireUnlocked();return auditReport(report,request);}
 async parentComparison(id,branch=this.get(id).runtime.branch){
  this.requireUnlocked();if(!validId(branch))throw Error('Invalid branch identity');const captured=this.get(id),body=frozenCopy(branchRequest(captured.runtime.document,branch)),context=await this.request('branches/comparison',body);this.requireUnlocked();
  if(!validComparison(context,{...body,node:captured.runtime.node}))throw Error('Invalid parent-branch comparison context');
  return structuredClone(context);
 }
 async parentBase(id,context){
  this.requireUnlocked();const expected=frozenCopy(context),scope=this.get(id).runtime;
  if(!validComparison(expected,{document:scope.document,node:scope.node,branch:expected?.branch}))throw Error('Invalid common-base request');
  const raw=await this.request('branches/merge-base',frozenCopy({document:expected.document,branch:expected.branch}));this.requireUnlocked();
  if(!raw||Object.keys(raw).length!==3||!['comparison','selection','revisions_read'].every(k=>Object.hasOwn(raw,k))||!counter(raw.revisions_read)||raw.revisions_read<1||raw.revisions_read>1024||!validComparison(raw.comparison,{...expected})||!raw.selection)throw Error('Invalid common-base report');
  if(!comparisonFields.every(k=>JSON.stringify(raw.comparison[k])===JSON.stringify(expected[k])))throw Error('Branches changed. Refresh comparison before inspecting their common base');
  const result=raw.selection,keys=Object.keys(result),has=fields=>keys.length===fields.length&&fields.every(k=>Object.hasOwn(result,k));
  const valid=result.result==='base'?has(['result','revision','snapshot','source_in_target','target_in_source'])&&validId(result.revision)&&validId(result.snapshot)&&typeof result.source_in_target==='boolean'&&typeof result.target_in_source==='boolean':result.result==='unrelated'?has(['result']):result.result==='ambiguous'&&has(['result','revisions'])&&Array.isArray(result.revisions)&&result.revisions.length>=2&&result.revisions.length<=1024&&result.revisions.every(validId)&&new Set(result.revisions.map(idString)).size===result.revisions.length;
  if(!valid||result.result==='base'&&(result.source_in_target!==sameId(result.revision,expected.source_revision)||result.target_in_source!==sameId(result.revision,expected.parent_revision)||result.source_in_target&&!sameId(result.snapshot,expected.source_snapshot)||result.target_in_source&&!sameId(result.snapshot,expected.parent_snapshot)))throw Error('Invalid common-base report');return structuredClone(raw);
 }
 requireUnlocked(){if(this.lifecycle!=='unlocked')throw Error('Workspace is locking or locked; editing is suspended');}
 get clipboard(){if(['locked','uncertain'].includes(this.lifecycle))this.requireUnlocked();return structuredClone(this.privateClipboard.entries);}
 loadClipboard(more=false){this.requireUnlocked();return this.serialise('clipboard',()=>this.privateClipboard.load(more));}
 changeClipboard(mutation){this.requireUnlocked();return this.serialise('clipboard',()=>this.privateClipboard.mutate(mutation));}
 retryClipboard(){this.requireUnlocked();return this.serialise('clipboard',()=>this.privateClipboard.retry());}
 captureSource(id,startByte,endByte,quote){
  if(this.features.workingCopy)return this.captureAdaptive(id,startByte,endByte,quote);
  this.requireUnlocked();const captured=this.get(id),generation=this.privateClipboard.generation;
  if(!counter(startByte)||!counter(endByte)||startByte>=endByte||endByte>new TextEncoder().encode(captured.source).length)throw Error('Invalid source selection');
  if(captured.sequence!==captured.acknowledged)throw Error('Save and commit this source before capturing a provenance reference');
  return this.serialise(id,()=>this.serialise('clipboard',async()=>{
   const d=this.capturedBuffer(captured);
   if(d.runtime.generation!==captured.runtime.generation||!sameId(d.runtime.base,captured.runtime.base))throw Error('Source changed; capture the selection again');
   const snapshot=await this.request('snapshot',snapshotRequest(captured.runtime.document,captured.runtime.snapshot));
   if(snapshot.text!==captured.source)throw Error('Commit this source before capturing a provenance reference');
   const source={document:captured.runtime.document,node:captured.runtime.node,snapshot:captured.runtime.snapshot,revision:captured.runtime.base,occurrence_path:[captured.runtime.occurrence],start_byte:startByte,end_byte:endByte};
   return this.privateClipboard.mutate({action:'capture',generation,source,expected_draft:this.isChildBuffer(captured)?null:{generation:captured.runtime.generation,sequence:captured.acknowledged},quote});
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
  if(!d.pending){if(validId(d.runtime.branch)&&!sameId(d.runtime.branch,this.originalBranches.get(d.id))){const {command,...mutation}=request;request={command:'branch',mutation:{action:command,branch:d.runtime.branch,...mutation}};}d.pending=frozenCopy({operation:operationId(),request});}
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
   d.pending=null;d.error=null;return receipt;
  }catch(error){d.error=error.message;throw error;}
 }
 async saveCaptured(d,captured){
  if(d.pending)await this.send(d,d.pending.request);
  if(captured.sequence<d.acknowledged)throw Error('Captured buffer is older than the acknowledged draft');
  if(captured.sequence===d.acknowledged)return;
  await this.send(d,{command:'save',document:d.runtime.document,generation:d.runtime.generation,base:d.runtime.base,previous_sequence:d.acknowledged,sequence:captured.sequence,text:captured.source});
 }
 checkpoint(id){this.requireUnlocked();const captured=this.get(id);return this.serialise(id,async()=>{const d=this.capturedBuffer(captured);await this.saveCaptured(d,captured);return {document:id,sequence:captured.sequence,durable:true};});}
 // Logical departure only: never called by DOM blur or autosave.
 depart(id){this.requireUnlocked();const captured=this.get(id);return this.serialise(id,()=>this.commitCaptured(this.capturedBuffer(captured),captured,true));}
 commit(id){this.requireUnlocked();const captured=this.get(id);return this.serialise(id,()=>this.commitCaptured(this.capturedBuffer(captured),captured));}
 async commitCaptured(d,captured,onlyChanged=false){
  const pending=d.pending?.request;
  let receipt;
  if(pending&&(pending.command==='commit'&&pending.sequence===captured.sequence||pending.command==='branch'&&pending.mutation.action==='commit'&&pending.mutation.sequence===captured.sequence))receipt=await this.send(d,pending);
  else {
   await this.saveCaptured(d,captured);
   if(onlyChanged){const snapshot=await this.snapshot(captured.id,d.runtime.snapshot);if(snapshot.text===captured.source)return null;}
   receipt=await this.send(d,{command:'commit',document:d.runtime.document,generation:d.runtime.generation,base:d.runtime.base,sequence:captured.sequence});
  }
  await this.promoteWorking(receipt.operation).catch(error=>{this.workingClipboard.error='Text committed; reference replacement needs attention: '+error.message;});return receipt;
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
    const editor=await this.request('editor',documentRequest(receipt.outcome.document));
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
  const actions=captured.map(state=>this.serialise(state.id,()=>this.saveCaptured(this.capturedBuffer(state),state)));
  if(this.queues.has('create'))actions.push(this.queues.get('create'));
  if(this.queues.has('assertions'))actions.push(this.queues.get('assertions'));
  if(this.queues.has('merge'))actions.push(this.queues.get('merge'));
  if(this.queues.has('fork'))actions.push(this.queues.get('fork'));
  if(this.queues.has('clipboard'))actions.push(this.queues.get('clipboard'));
  if(this.queues.has('comments'))actions.push(this.queues.get('comments'));
  if(this.queues.has('branches'))actions.push(this.queues.get('branches'));
  if(this.queues.has('working-clipboard'))actions.push(this.queues.get('working-clipboard'));
  const settled=await Promise.allSettled(actions),failed=settled.find(result=>result.status==='rejected');if(failed)throw failed.reason;
  if(this.creationPending){const {title,text}=this.creationPending.request;await this.sendCreation(title,text);}
  if(this.forkPending)await this.sendFork();
  if(this.mergePending)await this.sendMerge();
  if(this.assertions.pending)await this.assertions.retry();
  if(this.privateClipboard.pending)await this.privateClipboard.retry();
  if(this.comments.pending)await this.comments.retry();
  if(this.branchPending)await this.sendBranch();
  if(this.workingClipboard.pending)await this.workingClipboard.retry();
 }
 keychainStatus(){return this.request('keychain/status',emptyRequest());}
 async keychain(action){
  if(!['enroll','remove'].includes(action))throw Error('Invalid keychain action');
  this.requireUnlocked();this.lifecycle='securing';const captured=this.allBuffers();
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
 lock(){
  if(this.lifecycle==='securing')return Promise.reject(Error('Keychain operation is in progress'));
  if(this.lifecycle==='locked')return Promise.resolve({locked:true});
  if(this.lockPromise)return this.lockPromise;
  this.lifecycle='locking';const captured=this.allBuffers();let lockAttempted=false;
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
  const body=frozenCopy(snapshotRequest(d.runtime.document,snapshot??d.runtime.snapshot));
  return Promise.resolve(this.request('snapshot',body)).then(result=>{
   if(typeof result?.text!=='string'||!result.text.isWellFormed()||new TextEncoder().encode(result.text).length>2*1024*1024)throw Error('Invalid snapshot response');
   return {text:result.text};
  });
 }
 async history(id,next=null,limit=12,snapshot){
  this.requireUnlocked();const scoped=!!this.features.branches,opaque=v=>Array.isArray(v)&&v.length>0&&v.length<=4096&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
  if(next!==null&&!(scoped?opaque(next):validId(next))||!Number.isInteger(limit)||limit<1||limit>32)throw Error('Invalid history request');
  const d=this.get(id),pinned=snapshot??d.runtime.snapshot;if(scoped&&!validId(pinned))throw Error('Invalid history snapshot');const page=await this.request(scoped?'branches/history/page':'history',frozenCopy(scoped?{document:d.runtime.document,branch:d.runtime.branch,snapshot:pinned,cursor:next,limit}:{document:d.runtime.document,next,limit}));
  if(!sameId(page?.document,d.runtime.document)||!Array.isArray(page.entries)||!page.entries.length||page.entries.length>limit||page.next!==null&&!(scoped?opaque(page.next):validId(page.next))||scoped&&(!sameId(page.branch,d.runtime.branch)||!sameId(page.snapshot,pinned)||!opaque(page.cursor)))throw Error('Invalid history page');
  const seen=new Set();for(const [i,e] of page.entries.entries()){
   if(!['revision','snapshot','operation','actor','device'].every(k=>validId(e[k]))||e.parent!==null&&!validId(e.parent)||!counter(e.text_bytes)||e.text_bytes>2*1024*1024)throw Error('Invalid history entry');
   const key=idString(e.revision);if(seen.has(key)||sameId(e.revision,e.parent))throw Error('Invalid history cycle');seen.add(key);
   if(i&&!sameId(page.entries[i-1].parent,e.revision)||!scoped&&i===0&&next!==null&&!sameId(next,e.revision))throw Error('Invalid history chain');
  }
  const parent=page.entries.at(-1).parent;
  if(scoped){if((parent===null)!==(page.next===null)||next===null&&!sameId(page.entries[0].snapshot,pinned))throw Error('Invalid branch history continuation');}
  else {if(parent===null?page.next!==null:!sameId(parent,page.next))throw Error('Invalid history cursor');if(page.next!==null&&seen.has(idString(page.next)))throw Error('Invalid history cycle');}
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
  const fragment=new URLSearchParams(location.hash.slice(1)),launch=fragment.get('launch');if(launch){history.replaceState(null,'',location.pathname);await runtimeRequest('bootstrap',bootstrapRequest(launch));}
  let runtime=await runtimeRequest('runtime');if(runtime.contract!==1||runtime.mode!=='trusted_server'||runtime.ownership!=='whole_document')throw Error('Unsupported runtime contract');
  if(runtime.locked){status.textContent=runtime.create?'Create an encrypted local workspace. Choose its unlock passphrase.':'Unlock your encrypted local workspace.';submit.textContent=runtime.create?'Create workspace':'Unlock workspace';input.autocomplete=runtime.create?'new-password':'current-password';submit.disabled=false;input.focus();
   if(runtime.keychain_supported){const enrollment=await runtimeRequest('keychain/status',emptyRequest());keychain.hidden=!enrollment.enrolled;}
   await new Promise(resolve=>{
    const attempt=async action=>{submit.disabled=keychain.disabled=true;input.value='';try{await action();resolve();}catch(error){status.textContent=error.message==='unlock_failed'?'Workspace could not be unlocked. Check the passphrase and workspace.':error.message==='keychain_denied'?'Keychain access was denied or canceled. You can use your passphrase.':error.message;submit.disabled=keychain.disabled=false;input.focus();}};
    form.onsubmit=event=>{event.preventDefault();const passphrase=input.value;void attempt(()=>runtimeRequest('unlock',unlockRequest(passphrase)));};
    keychain.onclick=()=>void attempt(()=>runtimeRequest('unlock/keychain',emptyRequest()));
   });
   keychain.hidden=true;
  }
  const summaries=await runtimeRequest('documents',{});
  if(!summaries.length){status.textContent='Name your first document.';label.textContent='Document name';input.type='text';input.autocomplete='off';input.value='';input.maxLength=512;input.setAttribute('aria-label','Document name');label.append(input);submit.textContent='Create document';submit.disabled=false;input.focus();
   const creator=new RuntimeAdapter([]);
   const summary=await new Promise(resolve=>{form.onsubmit=async event=>{event.preventDefault();if(!input.value.trim())return;submit.disabled=true;try{const receipt=await creator.create(input.value);resolve({document:receipt.outcome.document});}catch(error){status.textContent=error.message;submit.disabled=false;}};});summaries.push(summary);
  }
  const states=[];for(const summary of summaries)states.push(await runtimeRequest('editor',documentRequest(summary.document)));
  const features={parentBase:runtime.capabilities?.includes('branch_parent_base')??false,branchComparison:runtime.capabilities?.includes('branch_parent_comparison')??false,branches:runtime.capabilities?.includes('local_branches')??false,workingCopy:runtime.capabilities?.includes('working_copy')??false},adapter=new RuntimeAdapter(states,runtimeRequest,features),clipboardSupported=runtime.capabilities?.includes('private_clipboard')??false;
  if(clipboardSupported)await adapter.loadClipboard();
  if(features.workingCopy){await adapter.loadWorkingClipboard();await adapter.reconcileWorkingReferences().catch(error=>{adapter.workingClipboard.error='Reference replacement needs attention: '+error.message;});}
  cover.remove();return {adapter,auditSupported:runtime.capabilities?.includes('document_integrity_audit')??false,clipboardSupported,branchesSupported:features.branches,workingCopySupported:features.workingCopy,commentsSupported:runtime.capabilities?.includes('committed_passage_comments')??false,publicationContributorsSupported:runtime.capabilities?.includes('publication_contributors')??false,transformationGraphSupported:runtime.capabilities?.includes('transformation_graph')??false,mergeSupported:runtime.capabilities?.includes('reviewed_merge')??false,assertionHistorySupported:runtime.capabilities?.includes('assertion_review_history')??false,overlayGraphSupported:runtime.capabilities?.includes('semantic_overlay_graph')??false,assertionsSupported:runtime.capabilities?.includes('semantic_assertion_overlay')??false,graphSupported:runtime.capabilities?.includes('document_fork_graph')??false,forkSupported:runtime.capabilities?.includes('fork')??false,documents:[...adapter.docs.values()].map(d=>({id:d.id,title:d.title,source:d.source}))};
 }catch(error){status.textContent=`Connection unavailable: ${error.message}. Open the private launch URL printed by the runtime.`;label.hidden=true;submit.hidden=true;throw error;}
}
