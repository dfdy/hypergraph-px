/** Immutable committed-passage comments, separate from text snapshots. */
import {validAssertionSource} from './runtime-assertions.js';
const id=v=>Array.isArray(v)&&v.length===32&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const same=(a,b)=>id(a)&&id(b)&&a.every((v,i)=>v===b[i]);
const count=v=>Number.isSafeInteger(v)&&v>=0;
const bytes=v=>new TextEncoder().encode(v).length;
const freeze=value=>{for(const child of Object.values(value))if(child&&typeof child==='object')freeze(child);return Object.freeze(value);};
export function commentPlan(input){
 if(!validAssertionSource(input?.source)||typeof input.quote!=='string'||!input.quote.isWellFormed()||bytes(input.quote)!==input.source.end_byte-input.source.start_byte||typeof input.body!=='string'||!input.body.isWellFormed()||!input.body.trim()||bytes(input.body)>16384)throw Error('Choose an exact committed passage and enter a comment (up to 16 KiB)');
 return freeze(structuredClone({source:input.source,expected_draft:null,quote:input.quote,body:input.body}));
}
function valid(record,document){return ['node','revision','actor','device','operation'].every(k=>id(record?.[k]))&&validAssertionSource(record.source)&&same(record.source.document,document)&&!same(record.node,record.source.node)&&typeof record.body==='string'&&record.body.isWellFormed()&&!!record.body.trim()&&bytes(record.body)<=16384&&count(record.ordinal)&&record.ordinal>0&&(record.previous_document_comment===null||id(record.previous_document_comment))&&(record.ordinal===1)===(record.previous_document_comment===null)&&!same(record.previous_document_comment,record.revision)&&(record.expected_draft===null||count(record.expected_draft?.generation)&&count(record.expected_draft?.sequence));}
export class RuntimeComments {
 constructor(request,operation){this.request=request;this.operation=operation;this.pending=null;}
 async page(document,snapshot,next=null,limit=8){
  if(!id(document)||!id(snapshot)||next!==null&&!id(next)||!Number.isInteger(limit)||limit<1||limit>8)throw Error('Invalid comment page request');
  const body=freeze(structuredClone({document,snapshot,next,limit})),page=await this.request('comments',body);
  if(!same(page?.document,body.document)||!same(page?.snapshot,body.snapshot)||page.text_snapshot_scope!=='comments_excluded'||!Array.isArray(page.entries)||page.entries.length>limit||page.entries.some(r=>!valid(r,body.document))||page.next!==null&&!id(page.next)||!page.entries.length&&(body.next!==null||page.next!==null)||page.entries.length<limit&&page.next!==null)throw Error('Invalid retrospective comment page');
  const seen=new Set();for(const [i,r] of page.entries.entries()){for(const value of [r.node,r.revision]){const key=JSON.stringify(value);if(seen.has(key))throw Error('Repeated comment identity');seen.add(key);}if(i&&(!same(page.entries[i-1].previous_document_comment,r.revision)||page.entries[i-1].ordinal!==r.ordinal+1))throw Error('Invalid comment paging chain');}
  if(body.next!==null&&!same(page.entries[0]?.revision,body.next)||page.entries.length&&JSON.stringify(page.next)!==JSON.stringify(page.entries.at(-1).previous_document_comment))throw Error('Mismatched comment cursor');
  return structuredClone(page);
 }
 create(plan){if(this.pending)throw Error('Retry the pending comment before publishing another');this.pending=freeze({operation:this.operation(),request:{command:'comment',plan:commentPlan(plan)}});return this.retry();}
 async retry(){
  if(!this.pending)throw Error('No pending comment');const frozen=this.pending;let receipt;
  try{for(let attempt=0;attempt<2;attempt++){try{receipt=await this.request('commands',frozen);break;}catch(error){if(error.status||attempt===1)throw error;}}}catch(error){if(error.status>=400&&error.status<500)this.pending=null;throw error;}
  const state=receipt?.outcome?.state;
  if(!same(receipt?.operation,frozen.operation)||receipt?.outcome?.result!=='commented'||!same(state?.document,frozen.request.plan.source.document)||!id(state.node)||same(state.node,frozen.request.plan.source.node)||!id(state.revision)||!count(state.ordinal)||state.ordinal<1)throw Error('Mismatched comment receipt');
  this.pending=null;return structuredClone(state);
 }
}
