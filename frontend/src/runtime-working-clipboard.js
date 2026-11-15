/**
 * # Hypergraph PX — Exact private working-reference transport
 *
 * Capture and inspect exact unpublished working checkpoints and reconcile
 * clipboard transitions without replacing uncertain operation bodies.
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
 * Used by: Runtime buffer coordination, private working-reference clipboard and
 * working-source derivation inspection.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [Exact text and anchors][spec-3]
 *
 * Boundary: Working checkpoints remain distinct from committed revisions. Byte
 * slicing uses fatal UTF8 decoding; retained private evidence and promotion links
 * are checked without claiming current authority from possession.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-working-clipboard.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

/** Recognize the exact32-byte wire identity representation. */
const id=v=>Array.isArray(v)&&v.length===32&&v.every(/* Require integer byte values within an identity. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Compare two validated identities byte for byte. */
const same=(a,b)=>id(a)&&id(b)&&a.every(/* Compare corresponding wire identity bytes. */ (n,i)=>n===b[i]);

/** Require a nonnegative safe integer for counters and byte offsets. */
const count=n=>Number.isSafeInteger(n)&&n>=0;

/** Encode original text as UTF8 for exact byte-boundary and request-size checks. */
const bytes=s=>new TextEncoder().encode(s);

/** Recursively freeze a captured operation while preserving non-object scalar values. */
const freeze=v=>{if(v&&typeof v==='object'){for(const c of Object.values(v))freeze(c);

  Object.freeze(v);}

 return v;};

/** Validate a bounded private working-checkpoint source binding. */
export function validWorkingSource(s){return s?.kind==='working_checkpoint'&&['document','node','branch','working_branch','checkpoint'].every(/* Validate each document/node/branch/checkpoint identity in a working source. */ k=>id(s[k]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&id(s.occurrence_path[0])&&count(s.start_byte)&&count(s.end_byte)&&s.start_byte<s.end_byte&&s.end_byte<=2*1024*1024;}

/** Validate a committed replacement source without conflating it with a working checkpoint. */
function committed(s){return s&&['document','node','revision','snapshot'].every(/* Validate each identity in a committed-source reference. */ k=>id(s[k]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&id(s.occurrence_path[0])&&count(s.start_byte)&&count(s.end_byte)&&s.start_byte<s.end_byte&&s.end_byte<=2*1024*1024;}

/** Validate the identity fields connecting a retained checkpoint to an exact Commit promotion. */
function promotion(p){return p&&['checkpoint','document','branch','working_branch','revision','snapshot','operation'].every(/* Check each required promotion identity field. */ k=>id(p[k]));}

/** Validate a working entry or an explicitly linked committed promotion target. */
function entry(e){return id(e?.id)&&typeof e.preview==='string'&&e.preview.isWellFormed()&&[...e.preview].length<=120&&(e.target?.kind==='working'?validWorkingSource(e.target.source):e.target?.kind==='committed'&&committed(e.target.source)&&id(e.target.previous)&&promotion(e.target.promotion)&&same(e.target.source.document,e.target.promotion.document)&&same(e.target.source.revision,e.target.promotion.revision)&&same(e.target.source.snapshot,e.target.promotion.snapshot));}

/** Maintain generation-consistent working references and frozen copy/mutation receipts. */
export class RuntimeWorkingClipboard {
 /** Initialize working-reference pages, stale-read tokens and frozen pending intent. */
 constructor(request,operation){this.request=request;this.operation=operation;this.entries=[];this.generation=0;this.total=0;this.next=null;this.pending=null;this.revision=0;}


 /** Load a bounded generation-consistent working clipboard page and ignore outdated overlapping reads. */
 async load(more=false){
  const token=++this.revision,offset=more?this.next:0,generation=more?this.generation:null;

  if(offset===null)return;


  const page=await this.request('working/clipboard',{generation,offset,limit:16});


  if(!count(page?.generation)||!count(page.total)||page.total>128||!Array.isArray(page.entries)||page.entries.length!==Math.min(16,page.total-offset)||page.entries.some(/* Reject malformed working entries or inconsistent promotion bindings. */ e=>!entry(e))||page.next!==(offset+page.entries.length<page.total?offset+page.entries.length:null)||more&&page.generation!==generation)throw Error('Invalid working clipboard page');


  const entries=more?[...this.entries,...page.entries]:page.entries,seen=new Set();

  for(const e of entries){const k=JSON.stringify(e.id);

   if(seen.has(k))throw Error('Duplicate working reference');

   seen.add(k);}


  if(token!==this.revision)return false;


  this.entries=structuredClone(entries);this.generation=page.generation;this.total=page.total;this.next=page.next;

  return true;
 }


 /** Validate exact source bytes, scalar-safe selected quote and encoded request limits before freezing working capture. */
 copy(plan){
  if(this.pending)throw Error('Retry the pending working-reference operation first');


  if(typeof plan?.text!=='string'||!plan.text.isWellFormed()||typeof plan.quote!=='string'||!plan.quote.isWellFormed()||!['document','branch','base'].every(/* Require the captured document, branch and base identities. */ k=>id(plan[k]))||!['generation','sequence','start_byte','end_byte'].every(/* Require safe captured generation, sequence and byte-boundary values. */ k=>count(plan[k]))||plan.start_byte>=plan.end_byte)throw Error('Invalid exact working capture');


  const source=bytes(plan.text);

  if(source.length>2*1024*1024||plan.end_byte>source.length)throw Error('Working source exceeds its bounds');


  let quote;

  try{quote=new TextDecoder('utf-8',{fatal:true}).decode(source.slice(plan.start_byte,plan.end_byte));}catch{throw Error('Working selection splits a scalar');}


  if(quote!==plan.quote)throw Error('Working selection changed');


  if(bytes(JSON.stringify(plan)).length>14*1024*1024-2048)throw Error('Working capture exceeds encoded request limit');


  return this.begin({command:'working_copy',plan,generation:this.generation});
 }


 /** Validate remove/clear/promote intent against the currently loaded clipboard generation. */
 mutate(mutation){if(this.pending)throw Error('Retry the pending working-reference operation first');

  if(!['remove','clear','promote'].includes(mutation.action)||mutation.generation!==this.generation||mutation.action==='remove'&&!id(mutation.entry)||mutation.action==='promote'&&!id(mutation.publication))throw Error('Invalid working-reference mutation');

  return this.begin({command:'working_clipboard',mutation});}


 /** Freeze one request with its original operation and expected pre-mutation count. */
 begin(request){this.expectedCount=this.total;this.pending=freeze({operation:this.operation(),request:structuredClone(request)});

  return this.retry();}


 /** Retry the original working-reference operation and validate the specific copy/mutation transition. */
 async retry(){
  if(!this.pending)return;

  const frozen=this.pending;

  let receipt;


  for(let attempt=0;attempt<2;attempt++){try{receipt=await this.request('commands',frozen);

    break;}catch(error){if(error.status){if([400,403,404,409,413].includes(error.status))this.pending=null;

     throw error;}

    if(attempt===1)throw error;}}


  if(!same(receipt?.operation,frozen.operation))throw Error('Mismatched working-reference operation');


  const r=receipt.outcome,s=r?.state,c=frozen.request,copy=c.command==='working_copy',generation=copy?c.generation:c.mutation.generation;


  if(r?.result!==(copy?'working_copied':'working_clipboard')||!count(s?.generation)||!count(s.count)||s.count>128||s.generation<generation||s.generation>generation+1)throw Error('Invalid working-reference receipt');


  if(copy){
   const p=c.plan,k=s.checkpoint,source=s.source;


   if(s.generation!==generation+1||s.count!==this.expectedCount+1||!id(s.entry)||!validWorkingSource(source)||!k||!['document','node','branch','working_branch','checkpoint'].every(/* Check that receipt checkpoint identities exactly match the returned working source. */ key=>same(k[key],source[key]))||!count(k.ordinal)||k.ordinal===0||!same(source.document,p.document)||!same(source.branch,p.branch)||source.start_byte!==p.start_byte||source.end_byte!==p.end_byte)throw Error('Invalid working-copy acknowledgement');
  }else{
   const m=c.mutation,advanced=s.generation===generation+1;


   if(m.action==='remove'&&(!advanced||s.count!==this.expectedCount-1)||m.action==='clear'&&(s.count!==0||advanced!==(this.expectedCount>0))||m.action==='promote'&&(s.count!==this.expectedCount||this.expectedCount===0&&advanced))throw Error('Invalid working-reference transition');
  }


  this.pending=null;await this.load();

  return structuredClone(s);
 }


 /** Inspect one exact retained checkpoint and decode only its validated selected UTF8 passage. */
 async inspect(source){
  if(!validWorkingSource(source))throw Error('Invalid working source');

  const frozen=freeze(structuredClone(source)),view=await this.request('working/source',frozen);


  if(!validWorkingSource(view?.source)||!['document','node','branch','working_branch','checkpoint'].every(/* Check returned working-source identities against the frozen inspection request. */ k=>same(view.source[k],frozen[k]))||!same(view.source.occurrence_path[0],frozen.occurrence_path[0])||view.source.start_byte!==frozen.start_byte||view.source.end_byte!==frozen.end_byte||view.publication!=='private_working_checkpoint'||!id(view.base)||!count(view.sequence)||typeof view.text!=='string'||!view.text.isWellFormed()||bytes(view.text).length>2*1024*1024||view.promotion!==null&&(!promotion(view.promotion)||!same(view.promotion.checkpoint,frozen.checkpoint)||!same(view.promotion.document,frozen.document)||!same(view.promotion.branch,frozen.branch)||!same(view.promotion.working_branch,frozen.working_branch)))throw Error('Invalid working source response');


  const raw=bytes(view.text);

  if(frozen.end_byte>raw.length)throw Error('Invalid working source range');


  const passage=new TextDecoder('utf-8',{fatal:true}).decode(raw.slice(frozen.start_byte,frozen.end_byte));

  return {...structuredClone(view),passage};
 }
}
