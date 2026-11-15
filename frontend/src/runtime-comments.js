/**
 * # Hypergraph PX — Retrospective committed-passage comments
 *
 * Validate exact comment intent, page immutable comment records and reconcile
 * uncertain comment publication with the original operation body.
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
 * Used by: Annotation and provenance operations through the runtime adapter and
 * Comments panel.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Comments remain outside text snapshots. Browser shape checks do not
 * authenticate source or grant backend authority; pending operations are retained
 * until a definitive result can be checked.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-comments.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {validAssertionSource} from './runtime-assertions.js';

/** Require an identity encoded as exactly32 valid byte values. */
const id=v=>Array.isArray(v)&&v.length===32&&v.every(/* Check that one identity element is an integer byte. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Compare two validated opaque identities without string coercion. */
const same=(a,b)=>id(a)&&id(b)&&a.every(/* Compare the corresponding identity bytes. */ (v,i)=>v===b[i]);

/** Require a nonnegative safely represented wire counter. */
const count=v=>Number.isSafeInteger(v)&&v>=0;

/** Count exact UTF8 bytes for comment and quote limits. */
const bytes=v=>new TextEncoder().encode(v).length;

/** Recursively freeze captured operation data so retries cannot acquire a changed body. */
const freeze=value=>{for(const child of Object.values(value))if(child&&typeof child==='object')freeze(child);

 return Object.freeze(value);};

/** Validate and freeze a nonempty comment bound to an exact committed passage. */
export function commentPlan(input){
 if(!validAssertionSource(input?.source)||typeof input.quote!=='string'||!input.quote.isWellFormed()||bytes(input.quote)!==input.source.end_byte-input.source.start_byte||typeof input.body!=='string'||!input.body.isWellFormed()||!input.body.trim()||bytes(input.body)>16384)throw Error('Choose an exact committed passage and enter a comment (up to 16 KiB)');


 return freeze(structuredClone({source:input.source,expected_draft:null,quote:input.quote,body:input.body}));
}

/** Validate one retained comment's identities, source binding, ordinal and paging predecessor. */
function valid(record,document){return ['node','revision','actor','device','operation'].every(/* Require every mandatory comment identity field to have the supported byte shape. */ k=>id(record?.[k]))&&validAssertionSource(record.source)&&same(record.source.document,document)&&!same(record.node,record.source.node)&&typeof record.body==='string'&&record.body.isWellFormed()&&!!record.body.trim()&&bytes(record.body)<=16384&&count(record.ordinal)&&record.ordinal>0&&(record.previous_document_comment===null||id(record.previous_document_comment))&&(record.ordinal===1)===(record.previous_document_comment===null)&&!same(record.previous_document_comment,record.revision)&&(record.expected_draft===null||count(record.expected_draft?.generation)&&count(record.expected_draft?.sequence));}

/** Coordinate scoped comment reads and one frozen pending publication at a time. */
export class RuntimeComments {
 /** Retain request/operation providers and initialize the single pending-comment slot. */
 constructor(request,operation){this.request=request;this.operation=operation;this.pending=null;}


 /** Read and validate a bounded snapshot-scoped comment page with an exact predecessor chain. */
 async page(document,snapshot,next=null,limit=8){
  if(!id(document)||!id(snapshot)||next!==null&&!id(next)||!Number.isInteger(limit)||limit<1||limit>8)throw Error('Invalid comment page request');


  const body=freeze(structuredClone({document,snapshot,next,limit})),page=await this.request('comments',body);


  if(!same(page?.document,body.document)||!same(page?.snapshot,body.snapshot)||page.text_snapshot_scope!=='comments_excluded'||!Array.isArray(page.entries)||page.entries.length>limit||page.entries.some(/* Reject a returned comment whose retained source or record structure is invalid. */ r=>!valid(r,body.document))||page.next!==null&&!id(page.next)||!page.entries.length&&(body.next!==null||page.next!==null)||page.entries.length<limit&&page.next!==null)throw Error('Invalid retrospective comment page');


  const seen=new Set();

  for(const [i,r] of page.entries.entries()){for(const value of [r.node,r.revision]){const key=JSON.stringify(value);

    if(seen.has(key))throw Error('Repeated comment identity');

    seen.add(key);}

   if(i&&(!same(page.entries[i-1].previous_document_comment,r.revision)||page.entries[i-1].ordinal!==r.ordinal+1))throw Error('Invalid comment paging chain');}


  if(body.next!==null&&!same(page.entries[0]?.revision,body.next)||page.entries.length&&JSON.stringify(page.next)!==JSON.stringify(page.entries.at(-1).previous_document_comment))throw Error('Mismatched comment cursor');


  return structuredClone(page);
 }


 /** Freeze one new comment operation and refuse to replace an unresolved pending publication. */
 create(plan){if(this.pending)throw Error('Retry the pending comment before publishing another');

  this.pending=freeze({operation:this.operation(),request:{command:'comment',plan:commentPlan(plan)}});

  return this.retry();}


 /** Retry the original frozen comment body and validate its exact operation/document outcome before clearing pending state. */
 async retry(){
  if(!this.pending)throw Error('No pending comment');

  const frozen=this.pending;

  let receipt;


  try{for(let attempt=0;attempt<2;attempt++){try{receipt=await this.request('commands',frozen);

     break;}catch(error){if(error.status||attempt===1)throw error;}}}catch(error){if(error.status>=400&&error.status<500)this.pending=null;

   throw error;}


  const state=receipt?.outcome?.state;


  if(!same(receipt?.operation,frozen.operation)||receipt?.outcome?.result!=='commented'||!same(state?.document,frozen.request.plan.source.document)||!id(state.node)||same(state.node,frozen.request.plan.source.node)||!id(state.revision)||!count(state.ordinal)||state.ordinal<1)throw Error('Mismatched comment receipt');


  this.pending=null;

  return structuredClone(state);
 }
}
