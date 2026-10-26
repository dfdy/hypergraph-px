/** Private encrypted clipboard transport. Frozen mutations survive uncertain replies. */
const id=value=>Array.isArray(value)&&value.length===32&&value.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const same=(a,b)=>id(a)&&id(b)&&a.every((n,i)=>n===b[i]);
const number=n=>Number.isSafeInteger(n)&&n>=0;
const freeze=value=>{for(const item of Object.values(value))if(item&&typeof item==='object')freeze(item);return Object.freeze(value);};
function validEntry(entry){
 if(!id(entry?.id)||typeof entry.available!=='boolean')return false;
 if(!entry.available)return entry.source===null&&entry.preview===null;
 const s=entry.source;
 return id(entry?.id)&&s&&['document','node','snapshot','revision'].every(key=>id(s[key]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&id(s.occurrence_path[0])&&number(s.start_byte)&&number(s.end_byte)&&s.start_byte<s.end_byte&&s.end_byte<=2*1024*1024&&typeof entry.preview==='string'&&entry.preview.isWellFormed()&&[...entry.preview].length<=120;
}
export class RuntimeClipboard {
 constructor(request,operation){this.request=request;this.operation=operation;this.entries=[];this.generation=0;this.total=0;this.next=null;this.pending=null;this.revision=0;}
 async load(more=false){
  const revision=++this.revision,offset=more?this.next:0,generation=more?this.generation:null;
  if(offset===null)return;
  const page=await this.request('clipboard',{generation,offset,limit:16});
  if(!number(page?.generation)||!number(page.total)||page.total>128||!Array.isArray(page.entries)||page.entries.length>16||page.entries.some(entry=>!validEntry(entry))||offset+page.entries.length>page.total||page.next!==(offset+page.entries.length<page.total?offset+page.entries.length:null)||more&&page.generation!==generation||page.entries.length!==Math.min(16,page.total-offset))throw Error('Invalid private clipboard page');
  const entries=more?[...this.entries,...page.entries]:page.entries,seen=new Set();
  for(const entry of entries){const key=JSON.stringify(entry.id);if(seen.has(key))throw Error('Duplicate private clipboard identity');seen.add(key);}
  if(revision!==this.revision)return false;
  this.entries=structuredClone(entries);this.generation=page.generation;this.total=page.total;this.next=page.next;return true;
 }
 async mutate(mutation){
  if(this.pending)throw Error('Retry the pending clipboard operation before another change');
  if(mutation.generation!==this.generation)throw Error('Clipboard changed; refresh and retry');
  this.expectedCount=this.total;
  this.pending=freeze({operation:this.operation(),request:{command:'clipboard',mutation:structuredClone(mutation)}});
  return this.retry();
 }
 async retry(){
  if(!this.pending)return;
  const pending=this.pending;let receipt;
  for(let attempt=0;attempt<2;attempt++){
   try{receipt=await this.request('commands',pending);break;}
   catch(error){
    if(error.status){if([400,403,404,409,413].includes(error.status))this.pending=null;throw error;}
    if(attempt===1)throw error;
   }
  }
  const state=receipt?.outcome?.state,m=pending.request.mutation;
  if(!same(receipt?.operation,pending.operation)||receipt?.outcome?.result!=='clipboard'||!number(state?.generation)||state.generation<m.generation||state.generation>m.generation+1||!number(state?.count)||state.count>128||m.action==='capture'&&!id(state.entry)||m.action!=='capture'&&state.entry!==null||m.action==='clear'&&state.count!==0)throw Error('Invalid private clipboard acknowledgement');
  const advanced=state.generation===m.generation+1;
  if(m.action==='capture'&&state.count!==this.expectedCount+(advanced?1:0)||m.action==='remove'&&(!advanced||state.count!==this.expectedCount-1)||m.action==='clear'&&advanced!==(this.expectedCount>0))throw Error('Invalid private clipboard state transition');
  this.pending=null;await this.load();return structuredClone(state);
 }
}
