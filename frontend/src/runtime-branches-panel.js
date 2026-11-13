/** Explicit committed-source review and bounded branch selection. */
import {openParentComparison} from './runtime-branch-comparison.js';
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function openBranches(adapter,id,{select,notify}){
 const captured=adapter.get(id),dialog=node('dialog');dialog.className='function-dialog branch-dialog';dialog.setAttribute('aria-label','Document branches');
 const status=node('p','Loading branches…'),list=node('div'),more=node('button','More branches'),close=node('button','Close'),name=node('input'),create=node('button','Create child branch'),retry=node('button','Retry branch creation'),preview=node('pre');
 name.setAttribute('aria-label','New branch name');name.maxLength=512;preview.className='source-preview';preview.setAttribute('aria-label','Committed branch source');const label=node('label','New branch name');label.append(name);status.setAttribute('role','status');more.hidden=true;retry.hidden=!adapter.branchPending;
 dialog.append(node('h2','Document branches'),node('p','Each branch has an independent working buffer. A new child starts from the exact committed source below; pending edits are excluded.'),list,more,node('h3','Reviewed committed source'),preview,label,status,create,retry,close);document.body.append(dialog);dialog.showModal();let next=null,busy=false;
 const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';
 const compare=node('button','Compare committed with parent');
 if(adapter.features.branchComparison&&adapter.isChild(id)){
  dialog.insertBefore(compare,close);compare.onclick=()=>{if(busy||!current())return;const popup=openParentComparison(adapter,id,captured.runtime.branch,current);if(!popup)return;const cleanup=()=>popup.close();dialog.addEventListener('close',cleanup,{once:true});popup.addEventListener('close',()=>dialog.removeEventListener('close',cleanup),{once:true});};
 }
 const controls=()=>{create.disabled=busy||!!adapter.branchPending;compare.disabled=more.disabled=close.disabled=name.disabled=retry.disabled=busy;retry.hidden=!adapter.branchPending;for(const b of list.querySelectorAll('button'))b.disabled=busy||b.dataset.current==='true';};
 async function choose(branch){if(busy)return;busy=true;controls();dialog.oncancel=e=>e.preventDefault();try{await select(branch);dialog.close();}catch(error){if(current())status.textContent=error.message;}finally{busy=false;dialog.oncancel=null;if(current())controls();}}
 function choice(branch,title){const button=node('button',title+(same(branch,captured.runtime.branch)?' · current':''));button.dataset.current=String(same(branch,captured.runtime.branch));button.onclick=()=>void choose(branch);list.append(button);}
 async function load(append=false){busy=true;controls();try{const page=await adapter.branchPage(id,append?next:null);if(!current())return;if(!append){list.replaceChildren();choice(page.original_branch,'Original branch');}for(const entry of page.entries)choice(entry.branch,entry.name);next=page.next;more.hidden=next===null;status.textContent='Choose a branch, or name a child of the reviewed branch.';}catch(error){if(current())status.textContent=error.message;}finally{busy=false;if(current())controls();}}
 close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove(),{once:true});more.onclick=()=>void load(true);
 create.disabled=true;create.onclick=async()=>{if(busy||!name.value.trim())return;busy=true;controls();dialog.oncancel=e=>e.preventDefault();try{const result=await adapter.createBranch(id,name.value,captured);if(current()){await select(result.branch);dialog.close();}}catch(error){if(current())status.textContent=error.status===409?'The reviewed committed source changed. Close and reopen branches to review it again.':error.message;}finally{busy=false;dialog.oncancel=null;if(current())controls();}};
 retry.onclick=async()=>{if(busy)return;busy=true;controls();try{const result=await adapter.retryBranch();if(current()){await select(result.branch);dialog.close();}}catch(error){if(current())status.textContent=error.message;}finally{busy=false;if(current())controls();}};
 void (async()=>{try{const source=await adapter.snapshot(id,captured.runtime.snapshot);if(!current())return;preview.textContent=source.text;await load();}catch(error){if(current()){status.textContent=error.message;notify(error.message);}}})();
}
