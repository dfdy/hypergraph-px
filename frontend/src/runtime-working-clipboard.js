/** Exact unpublished references. Every uncertain mutation retains its original body. */
const id=v=>Array.isArray(v)&&v.length===32&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const same=(a,b)=>id(a)&&id(b)&&a.every((n,i)=>n===b[i]);
const count=n=>Number.isSafeInteger(n)&&n>=0;
const bytes=s=>new TextEncoder().encode(s);
const freeze=v=>{if(v&&typeof v==='object'){for(const c of Object.values(v))freeze(c);Object.freeze(v);}return v;};
export function validWorkingSource(s){return s?.kind==='working_checkpoint'&&['document','node','branch','working_branch','checkpoint'].every(k=>id(s[k]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&id(s.occurrence_path[0])&&count(s.start_byte)&&count(s.end_byte)&&s.start_byte<s.end_byte&&s.end_byte<=2*1024*1024;}
function committed(s){return s&&['document','node','revision','snapshot'].every(k=>id(s[k]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&id(s.occurrence_path[0])&&count(s.start_byte)&&count(s.end_byte)&&s.start_byte<s.end_byte&&s.end_byte<=2*1024*1024;}
function promotion(p){return p&&['checkpoint','document','branch','working_branch','revision','snapshot','operation'].every(k=>id(p[k]));}
function entry(e){return id(e?.id)&&typeof e.preview==='string'&&e.preview.isWellFormed()&&[...e.preview].length<=120&&(e.target?.kind==='working'?validWorkingSource(e.target.source):e.target?.kind==='committed'&&committed(e.target.source)&&id(e.target.previous)&&promotion(e.target.promotion)&&same(e.target.source.document,e.target.promotion.document)&&same(e.target.source.revision,e.target.promotion.revision)&&same(e.target.source.snapshot,e.target.promotion.snapshot));}
export class RuntimeWorkingClipboard {
 constructor(request,operation){this.request=request;this.operation=operation;this.entries=[];this.generation=0;this.total=0;this.next=null;this.pending=null;this.revision=0;}
 async load(more=false){
  const token=++this.revision,offset=more?this.next:0,generation=more?this.generation:null;if(offset===null)return;
  const page=await this.request('working/clipboard',{generation,offset,limit:16});
  if(!count(page?.generation)||!count(page.total)||page.total>128||!Array.isArray(page.entries)||page.entries.length!==Math.min(16,page.total-offset)||page.entries.some(e=>!entry(e))||page.next!==(offset+page.entries.length<page.total?offset+page.entries.length:null)||more&&page.generation!==generation)throw Error('Invalid working clipboard page');
  const entries=more?[...this.entries,...page.entries]:page.entries,seen=new Set();for(const e of entries){const k=JSON.stringify(e.id);if(seen.has(k))throw Error('Duplicate working reference');seen.add(k);}
  if(token!==this.revision)return false;
  this.entries=structuredClone(entries);this.generation=page.generation;this.total=page.total;this.next=page.next;return true;
 }
 copy(plan){
  if(this.pending)throw Error('Retry the pending working-reference operation first');
  if(typeof plan?.text!=='string'||!plan.text.isWellFormed()||typeof plan.quote!=='string'||!plan.quote.isWellFormed()||!['document','branch','base'].every(k=>id(plan[k]))||!['generation','sequence','start_byte','end_byte'].every(k=>count(plan[k]))||plan.start_byte>=plan.end_byte)throw Error('Invalid exact working capture');
  const source=bytes(plan.text);if(source.length>2*1024*1024||plan.end_byte>source.length)throw Error('Working source exceeds its bounds');
  let quote;try{quote=new TextDecoder('utf-8',{fatal:true}).decode(source.slice(plan.start_byte,plan.end_byte));}catch{throw Error('Working selection splits a scalar');}
  if(quote!==plan.quote)throw Error('Working selection changed');
  if(bytes(JSON.stringify(plan)).length>14*1024*1024-2048)throw Error('Working capture exceeds encoded request limit');
  return this.begin({command:'working_copy',plan,generation:this.generation});
 }
 mutate(mutation){if(this.pending)throw Error('Retry the pending working-reference operation first');if(!['remove','clear','promote'].includes(mutation.action)||mutation.generation!==this.generation||mutation.action==='remove'&&!id(mutation.entry)||mutation.action==='promote'&&!id(mutation.publication))throw Error('Invalid working-reference mutation');return this.begin({command:'working_clipboard',mutation});}
 begin(request){this.expectedCount=this.total;this.pending=freeze({operation:this.operation(),request:structuredClone(request)});return this.retry();}
 async retry(){
  if(!this.pending)return;const frozen=this.pending;let receipt;
  for(let attempt=0;attempt<2;attempt++){try{receipt=await this.request('commands',frozen);break;}catch(error){if(error.status){if([400,403,404,409,413].includes(error.status))this.pending=null;throw error;}if(attempt===1)throw error;}}
  if(!same(receipt?.operation,frozen.operation))throw Error('Mismatched working-reference operation');
  const r=receipt.outcome,s=r?.state,c=frozen.request,copy=c.command==='working_copy',generation=copy?c.generation:c.mutation.generation;
  if(r?.result!==(copy?'working_copied':'working_clipboard')||!count(s?.generation)||!count(s.count)||s.count>128||s.generation<generation||s.generation>generation+1)throw Error('Invalid working-reference receipt');
  if(copy){
   const p=c.plan,k=s.checkpoint,source=s.source;
   if(s.generation!==generation+1||s.count!==this.expectedCount+1||!id(s.entry)||!validWorkingSource(source)||!k||!['document','node','branch','working_branch','checkpoint'].every(key=>same(k[key],source[key]))||!count(k.ordinal)||k.ordinal===0||!same(source.document,p.document)||!same(source.branch,p.branch)||source.start_byte!==p.start_byte||source.end_byte!==p.end_byte)throw Error('Invalid working-copy acknowledgement');
  }else{
   const m=c.mutation,advanced=s.generation===generation+1;
   if(m.action==='remove'&&(!advanced||s.count!==this.expectedCount-1)||m.action==='clear'&&(s.count!==0||advanced!==(this.expectedCount>0))||m.action==='promote'&&(s.count!==this.expectedCount||this.expectedCount===0&&advanced))throw Error('Invalid working-reference transition');
  }
  this.pending=null;await this.load();return structuredClone(s);
 }
 async inspect(source){
  if(!validWorkingSource(source))throw Error('Invalid working source');const frozen=freeze(structuredClone(source)),view=await this.request('working/source',frozen);
  if(!validWorkingSource(view?.source)||!['document','node','branch','working_branch','checkpoint'].every(k=>same(view.source[k],frozen[k]))||!same(view.source.occurrence_path[0],frozen.occurrence_path[0])||view.source.start_byte!==frozen.start_byte||view.source.end_byte!==frozen.end_byte||view.publication!=='private_working_checkpoint'||!id(view.base)||!count(view.sequence)||typeof view.text!=='string'||!view.text.isWellFormed()||bytes(view.text).length>2*1024*1024||view.promotion!==null&&(!promotion(view.promotion)||!same(view.promotion.checkpoint,frozen.checkpoint)||!same(view.promotion.document,frozen.document)||!same(view.promotion.branch,frozen.branch)||!same(view.promotion.working_branch,frozen.working_branch)))throw Error('Invalid working source response');
  const raw=bytes(view.text);if(frozen.end_byte>raw.length)throw Error('Invalid working source range');
  const passage=new TextDecoder('utf-8',{fatal:true}).decode(raw.slice(frozen.start_byte,frozen.end_byte));return {...structuredClone(view),passage};
 }
}
