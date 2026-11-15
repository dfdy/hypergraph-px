/**
 * # Hypergraph PX — Private committed-source clipboard transport
 *
 * Load generation-consistent private clipboard entries and reconcile exact
 * capture/remove/clear operations after uncertain replies.
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
 * Used by: Runtime buffer coordination and the private committed-source clipboard
 * panel.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 *
 * Boundary: The browser retains intent but does not persist clipboard plaintext.
 * Availability placeholders remain explicit; backend encrypted storage, authority
 * and operation replay are authoritative.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-clipboard.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

/** Recognize a32-byte opaque identity on the wire. */
const id=value=>Array.isArray(value)&&value.length===32&&value.every(/* Check one identity element is a valid integer byte. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Compare supported identities without coercing their representation. */
const same=(a,b)=>id(a)&&id(b)&&a.every(/* Compare corresponding identity bytes. */ (n,i)=>n===b[i]);

/** Require a safe nonnegative generation, count or source offset. */
const number=n=>Number.isSafeInteger(n)&&n>=0;

/** Freeze mutation data recursively so retries cannot change captured intent. */
const freeze=value=>{for(const item of Object.values(value))if(item&&typeof item==='object')freeze(item);

 return Object.freeze(value);};

/** Validate either an explicit unavailable placeholder or a bounded exact-source clipboard entry. */
function validEntry(entry){
 if(!id(entry?.id)||typeof entry.available!=='boolean')return false;


 if(!entry.available)return entry.source===null&&entry.preview===null;


 const s=entry.source;


 return id(entry?.id)&&s&&['document','node','snapshot','revision'].every(/* Validate each committed source identity required by an available entry. */ key=>id(s[key]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&id(s.occurrence_path[0])&&number(s.start_byte)&&number(s.end_byte)&&s.start_byte<s.end_byte&&s.end_byte<=2*1024*1024&&typeof entry.preview==='string'&&entry.preview.isWellFormed()&&[...entry.preview].length<=120;
}

/** Maintain bounded clipboard page state and one frozen original mutation. */
export class RuntimeClipboard {
 /** Initialize clipboard paging, stale-read tokens and the pending-operation slot. */
 constructor(request,operation){this.request=request;this.operation=operation;this.entries=[];this.generation=0;this.total=0;this.next=null;this.pending=null;this.revision=0;}


 /** Load one bounded clipboard page, reject duplicate identities and ignore an older overlapping response. */
 async load(more=false){
  const revision=++this.revision,offset=more?this.next:0,generation=more?this.generation:null;


  if(offset===null)return;


  const page=await this.request('clipboard',{generation,offset,limit:16});


  if(!number(page?.generation)||!number(page.total)||page.total>128||!Array.isArray(page.entries)||page.entries.length>16||page.entries.some(/* Reject malformed or inconsistent available/unavailable clipboard entries. */ entry=>!validEntry(entry))||offset+page.entries.length>page.total||page.next!==(offset+page.entries.length<page.total?offset+page.entries.length:null)||more&&page.generation!==generation||page.entries.length!==Math.min(16,page.total-offset))throw Error('Invalid private clipboard page');


  const entries=more?[...this.entries,...page.entries]:page.entries,seen=new Set();


  for(const entry of entries){const key=JSON.stringify(entry.id);

   if(seen.has(key))throw Error('Duplicate private clipboard identity');

   seen.add(key);}


  if(revision!==this.revision)return false;


  this.entries=structuredClone(entries);this.generation=page.generation;this.total=page.total;this.next=page.next;

  return true;
 }


 /** Capture a generation-matched mutation once and preserve its original operation identity. */
 async mutate(mutation){
  if(this.pending)throw Error('Retry the pending clipboard operation before another change');


  if(mutation.generation!==this.generation)throw Error('Clipboard changed; refresh and retry');


  this.expectedCount=this.total;
  this.pending=freeze({operation:this.operation(),request:{command:'clipboard',mutation:structuredClone(mutation)}});


  return this.retry();
 }


 /** Replay the frozen clipboard request and verify generation/count transitions before refreshing visible state. */
 async retry(){
  if(!this.pending)return;


  const pending=this.pending;

  let receipt;


  for(let attempt=0;attempt<2;attempt++){
   try{receipt=await this.request('commands',pending);

    break;}
   catch(error){
    if(error.status){if([400,403,404,409,413].includes(error.status))this.pending=null;

     throw error;}


    if(attempt===1)throw error;
   }
  }


  const state=receipt?.outcome?.state,m=pending.request.mutation;


  if(!same(receipt?.operation,pending.operation)||receipt?.outcome?.result!=='clipboard'||!number(state?.generation)||state.generation<m.generation||state.generation>m.generation+1||!number(state?.count)||state.count>128||m.action==='capture'&&!id(state.entry)||m.action!=='capture'&&state.entry!==null||m.action==='clear'&&state.count!==0)throw Error('Invalid private clipboard acknowledgement');


  const advanced=state.generation===m.generation+1;


  if(m.action==='capture'&&state.count!==this.expectedCount+(advanced?1:0)||m.action==='remove'&&(!advanced||state.count!==this.expectedCount-1)||m.action==='clear'&&advanced!==(this.expectedCount>0))throw Error('Invalid private clipboard state transition');


  this.pending=null;await this.load();

  return structuredClone(state);
 }
}
