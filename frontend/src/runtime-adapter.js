/** Real single-owner runtime boundary. No fixture operations or browser persistence. */
export function operationId(){return [...crypto.getRandomValues(new Uint8Array(32))];}
const idString=id=>id.map(byte=>byte.toString(16).padStart(2,'0')).join('');
export async function runtimeRequest(path,body){
 const response=await fetch('/api/v1/'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 const value=await response.json();if(!response.ok){const error=new Error(value.error||'Runtime request failed');error.status=response.status;throw error;}return value;
}
export class RuntimeAdapter {
 constructor(states,request=runtimeRequest){this.request=request;this.docs=new Map(states.map(state=>{const id=idString(state.document);return [id,{id,title:state.title,source:state.text,sequence:state.acknowledged_sequence,acknowledged:state.acknowledged_sequence,runtime:{...state},pending:null,error:null}];}));this.clipboard=[];this.queues=new Map();}
 get(id){const d=this.docs.get(id);if(!d)throw Error('Unknown runtime document');return {...d};}
 edit(id,source){const d=this.docs.get(id);if(!d)throw Error('Unknown runtime document');if(d.sequence>=Number.MAX_SAFE_INTEGER)throw Error('Editing sequence limit');d.source=source;return ++d.sequence;}
 serialise(id,action){const next=(this.queues.get(id)||Promise.resolve()).catch(()=>{}).then(action);this.queues.set(id,next);return next;}
 async send(d,request){
  if(!d.pending)d.pending={operation:operationId(),request};
  const frozen=d.pending;let receipt;
  for(let attempt=0;attempt<2;attempt++){try{receipt=await this.request('commands',frozen);break;}catch(error){d.error=error.message;if(error.status||attempt===1)throw error;}}
  if(JSON.stringify(receipt.operation)!==JSON.stringify(frozen.operation))throw Error('Mismatched runtime receipt');
  const result=receipt.outcome;
  if(result.result==='saved'||result.result==='committed'){
   if(JSON.stringify(result.document)!==JSON.stringify(d.runtime.document))throw Error('Mismatched document receipt');
   d.runtime.generation=result.generation;d.acknowledged=result.sequence;d.runtime.acknowledged_sequence=result.sequence;
   if(result.result==='committed'){d.runtime.base=result.revision;d.runtime.snapshot=result.snapshot;}
  }else throw Error('Unexpected runtime result');
  d.pending=null;d.error=null;return receipt;
 }
 async saveCaptured(d,captured){
  if(d.pending)await this.send(d,d.pending.request);
  if(captured.sequence<d.acknowledged)throw Error('Captured buffer is older than the acknowledged draft');
  if(captured.sequence===d.acknowledged)return;
  await this.send(d,{command:'save',document:d.runtime.document,generation:d.runtime.generation,base:d.runtime.base,previous_sequence:d.acknowledged,sequence:captured.sequence,text:captured.source});
 }
 checkpoint(id){const captured=this.get(id);return this.serialise(id,async()=>{const d=this.docs.get(id);await this.saveCaptured(d,captured);return {document:id,sequence:captured.sequence,durable:true};});}
 commit(id){const captured=this.get(id);return this.serialise(id,async()=>{const d=this.docs.get(id);await this.saveCaptured(d,captured);return this.send(d,{command:'commit',document:d.runtime.document,generation:d.runtime.generation,base:d.runtime.base,sequence:captured.sequence});});}
 async create(title,text=''){const operation=operationId(),request={command:'create',title,text};return this.request('commands',{operation,request});}
 snapshot(id){const d=this.get(id);return this.request('snapshot',{document:d.runtime.document,snapshot:d.runtime.snapshot});}
}

function element(tag,text){const e=document.createElement(tag);if(text)e.textContent=text;return e;}
export async function initializeRuntime(){
 if(location.protocol!=='https:')return null;
 const cover=element('div');cover.className='runtime-unlock';const form=element('form'),heading=element('h1','Hypergraph PX'),status=element('p','Connecting to local runtime…'),label=element('label','Workspace passphrase'),input=element('input'),submit=element('button','Unlock workspace');
 input.type='password';input.autocomplete='current-password';input.required=true;input.maxLength=1024;input.setAttribute('aria-label','Workspace passphrase');label.append(input);submit.type='submit';form.append(heading,status,label,submit);cover.append(form);document.body.append(cover);submit.disabled=true;
 try{
  const fragment=new URLSearchParams(location.hash.slice(1)),launch=fragment.get('launch');if(launch){history.replaceState(null,'',location.pathname);await runtimeRequest('bootstrap',{token:launch});}
  let runtime=await runtimeRequest('runtime');if(runtime.contract!==1||runtime.mode!=='trusted_server'||runtime.ownership!=='whole_document')throw Error('Unsupported runtime contract');
  if(runtime.locked){status.textContent=runtime.create?'Create an encrypted local workspace. Choose its unlock passphrase.':'Unlock your encrypted local workspace.';submit.textContent=runtime.create?'Create workspace':'Unlock workspace';input.autocomplete=runtime.create?'new-password':'current-password';submit.disabled=false;input.focus();
   await new Promise(resolve=>{form.onsubmit=async event=>{event.preventDefault();submit.disabled=true;const passphrase=input.value;input.value='';try{await runtimeRequest('unlock',{passphrase});resolve();}catch(error){status.textContent=error.message==='unlock_failed'?'Workspace could not be unlocked. Check the passphrase and workspace.':error.message;submit.disabled=false;input.focus();}};});
  }
  const summaries=await runtimeRequest('documents',{});
  if(!summaries.length){status.textContent='Name your first document.';label.textContent='Document name';input.type='text';input.autocomplete='off';input.value='';input.maxLength=512;input.setAttribute('aria-label','Document name');label.append(input);submit.textContent='Create document';submit.disabled=false;input.focus();
   const summary=await new Promise(resolve=>{form.onsubmit=async event=>{event.preventDefault();if(!input.value.trim())return;submit.disabled=true;try{const receipt=await runtimeRequest('commands',{operation:operationId(),request:{command:'create',title:input.value,text:''}});resolve({document:receipt.outcome.document});}catch(error){status.textContent=error.message;submit.disabled=false;}};});summaries.push(summary);
  }
  const states=[];for(const summary of summaries)states.push(await runtimeRequest('editor',{document:summary.document}));
  const adapter=new RuntimeAdapter(states);cover.remove();return {adapter,documents:[...adapter.docs.values()].map(d=>({id:d.id,title:d.title,source:d.source}))};
 }catch(error){status.textContent=`Connection unavailable: ${error.message}. Open the private launch URL printed by the runtime.`;label.hidden=true;submit.hidden=true;throw error;}
}
