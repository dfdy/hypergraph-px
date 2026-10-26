/** Display only acknowledged protected references. No fixture paste or source edits. */
const node=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
const key=id=>id.map(byte=>byte.toString(16).padStart(2,'0')).join('');
export function renderPrivateClipboard(list,adapter,{busy,change,notify,fork}){
 list.replaceChildren();
 for(const entry of adapter.clipboard){
  const title=entry.available?(adapter.docs.get(key(entry.source.document))?.title??'Retained document'):'Unavailable source';
  const chip=node('div');chip.className='clip-chip';
  const show=node('button',entry.available?`${title} · ${[...entry.preview].slice(0,65).join('')}`:'Captured source unavailable'),remove=node('button','×');remove.setAttribute('aria-label',`Remove captured source from ${title}`);
  remove.disabled=busy||!!adapter.privateClipboard.pending;show.disabled=remove.disabled||!entry.available;
  show.onclick=async()=>{
   try{
    const s=entry.source,text=await adapter.request('anchor/resolve',{document:s.document,snapshot:s.snapshot,revision:s.revision,occurrence_path:s.occurrence_path,start_byte:s.start_byte,end_byte:s.end_byte});
    if(adapter.lifecycle!=='unlocked'||!list.contains(chip))return;
    if(typeof text.text!=='string')throw Error('Invalid captured source response');
    const dialog=node('dialog');dialog.className='function-dialog';const preview=node('pre',text.text);preview.className='source-preview';const close=node('button','Close');close.onclick=()=>{dialog.close();dialog.remove();};
    dialog.append(node('h2','Captured source · read only'),node('p',title),preview);
    const actions=node('div');actions.className='dialog-actions';
    if(fork){
     const label=node('label','Fork name'),name=node('input');name.setAttribute('aria-label','Fork name');name.value=`Fork of ${title}`;name.maxLength=512;label.append(name);
     const explanation=node('p','Create an independent document from this exact captured version. The source and clipboard reference stay available.'),status=node('p'),create=node('button','Fork captured source');status.setAttribute('role','status');create.className='primary-action';
     create.onclick=async()=>{
      if(!name.value.trim()){name.focus();return;}
      create.disabled=name.disabled=close.disabled=true;dialog.oncancel=e=>e.preventDefault();
      try{await fork(s,text.text,name.value.trim());dialog.close();dialog.remove();}catch(error){status.textContent=error.message;}
      finally{name.disabled=close.disabled=false;dialog.oncancel=null;}
     };dialog.append(explanation,label,status);actions.append(create);
    }
    actions.append(close);dialog.append(actions);document.body.append(dialog);dialog.showModal();
   }catch(error){if(adapter.lifecycle==='unlocked')notify(error.message);}
  };
  remove.onclick=()=>change(()=>adapter.changeClipboard({action:'remove',generation:adapter.privateClipboard.generation,entry:entry.id}));
  chip.append(show,remove);list.append(chip);
 }
 if(!adapter.privateClipboard.total)list.append(node('span','Select committed text to capture its exact source reference.'));
 if(adapter.privateClipboard.next!==null){const more=node('button','More captured sources');more.disabled=busy;more.onclick=()=>change(()=>adapter.loadClipboard(true));list.append(more);}
 if(adapter.privateClipboard.pending){const retry=node('button','Retry clipboard operation');retry.disabled=busy;retry.onclick=()=>change(()=>adapter.retryClipboard());list.append(retry);}
}
