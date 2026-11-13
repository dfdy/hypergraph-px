/** Retained working sources and explicit replacement evidence; never edits source. */
const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
const key=id=>id.map(n=>n.toString(16).padStart(2,'0')).join('');
export function appendWorkingClipboard(parent,adapter,{busy,change,notify,fork}){
 if(!adapter.features.workingCopy)return;const clipboard=adapter.workingClipboard,section=node('div');section.className='working-references';parent.append(section);
 if(clipboard.total||clipboard.pending)section.append(node('span','Working-source references','caption'));
 for(const entry of clipboard.entries){
  const working=entry.target.kind==='working',source=entry.target.source,title=adapter.docs.get(key(source.document))?.title??'Retained document',chip=node('div');chip.className='clip-chip';
  const inspect=node('button',`${title} · ${working?'Working checkpoint':'Committed replacement'} · ${[...entry.preview].slice(0,45).join('')}`),remove=node('button','×');remove.setAttribute('aria-label',`Remove working reference from ${title}`);inspect.disabled=remove.disabled=busy||!!clipboard.pending;
  remove.onclick=()=>change(()=>adapter.changeWorkingClipboard({action:'remove',generation:clipboard.generation,entry:entry.id}));
  inspect.onclick=async()=>{inspect.disabled=true;try{
   const resolved=working?await clipboard.inspect(source):await adapter.request('anchor/resolve',{document:source.document,snapshot:source.snapshot,revision:source.revision,occurrence_path:source.occurrence_path,start_byte:source.start_byte,end_byte:source.end_byte});
   if(adapter.lifecycle!=='unlocked'||!parent.contains(section))return;const passage=working?resolved.passage:resolved.text;if(typeof passage!=='string'||!passage.isWellFormed())throw Error('Invalid retained source');
   const popup=node('dialog');popup.className='function-dialog';popup.setAttribute('aria-label','Retained working source');const pre=node('pre',passage);pre.className='source-preview';const status=node('p'),actions=node('div'),close=node('button','Close source');actions.className='dialog-actions';close.onclick=()=>popup.close();popup.addEventListener('close',()=>popup.remove(),{once:true});
   popup.append(node('h2',working?'Working checkpoint · read only':'Committed replacement · read only'),node('p',working?(resolved.promotion?'This exact checkpoint has Commit promotion evidence; its original target is retained.':'This checkpoint is private retained source. It has not been promoted by an exact Commit.'):'This is a new reference to committed source. Its original working reference remains retained.'),pre,status);
   if(!working){const original=node('button','Inspect original working reference');original.onclick=async()=>{try{const prior=await adapter.request('working/reference',{entry:entry.target.previous});if(!popup.isConnected||adapter.lifecycle!=='unlocked')return;if(prior.target?.kind!=='working')throw Error('Invalid original reference');const view=await clipboard.inspect(prior.target.source);if(!popup.isConnected||adapter.lifecycle!=='unlocked')return;pre.textContent=view.passage;status.textContent='Original working checkpoint · exact retained source';}catch(error){if(popup.isConnected)status.textContent=error.message;}};actions.append(original);}
   if(fork){const label=node('label','Fork name'),name=node('input');name.setAttribute('aria-label','Fork name');name.maxLength=512;name.value=`Fork of ${title}`;label.append(name);const create=node('button','Fork captured source');create.onclick=async()=>{if(!name.value.trim())return;create.disabled=name.disabled=close.disabled=true;popup.oncancel=e=>e.preventDefault();try{await fork(source,passage,name.value,working);popup.close();}catch(error){status.textContent=error.message;}finally{name.disabled=close.disabled=false;popup.oncancel=null;}};popup.append(label);actions.append(create);}
   actions.append(close);popup.append(actions);document.body.append(popup);popup.showModal();
  }catch(error){if(parent.contains(section)&&adapter.lifecycle==='unlocked')notify(error.message);}finally{inspect.disabled=busy;}};
  chip.append(inspect,remove);section.append(chip);
 }
 if(clipboard.next!==null){const more=node('button','More working references');more.disabled=busy;more.onclick=()=>change(()=>adapter.loadWorkingClipboard(true));section.append(more);}
 if(clipboard.total){const clear=node('button','Clear working references');clear.disabled=busy||!!clipboard.pending;clear.onclick=()=>change(()=>adapter.changeWorkingClipboard({action:'clear',generation:clipboard.generation}));section.append(clear);}
 if(clipboard.pending){const retry=node('button','Retry working-reference operation');retry.disabled=busy;retry.onclick=()=>change(()=>adapter.retryWorkingClipboard());section.append(retry);}
 if(clipboard.error){section.append(node('p',clipboard.error));const recover=node('button','Update promoted references');recover.disabled=busy;recover.onclick=()=>change(()=>adapter.reconcileWorkingReferences());section.append(recover);}
}
