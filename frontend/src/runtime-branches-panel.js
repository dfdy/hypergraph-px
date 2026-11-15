/**
 * # Hypergraph PX — Committed-source branch review and selection
 *
 * Review captured committed source, page available branches and coordinate
 * explicit branch selection or child-branch creation.
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
 * Used by: History, branches and graph inspection through the application's branch
 * controls.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [domain navigation md][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: A child begins from the reviewed committed source, not pending edits.
 * Branch publication and original-operation reconciliation stay in the runtime
 * adapter; dialogs cannot grant authority.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-branches-panel.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/domain-navigation.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

import {openParentComparison} from './runtime-branch-comparison.js';

/** Create safe text-based branch controls and source preview elements. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 return e;};

/** Compare the current branch identity representation without changing it. */
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/** Open captured-source branch review with explicit selection, creation and retry controls. */
export function openBranches(adapter,id,{select,notify}){
 const captured=adapter.get(id),dialog=node('dialog');

 dialog.className='function-dialog branch-dialog';dialog.setAttribute('aria-label','Document branches');


 const status=node('p','Loading branches…'),list=node('div'),more=node('button','More branches'),close=node('button','Close'),name=node('input'),create=node('button','Create child branch'),retry=node('button','Retry branch creation'),preview=node('pre');


 name.setAttribute('aria-label','New branch name');name.maxLength=512;preview.className='source-preview';preview.setAttribute('aria-label','Committed branch source');

 const label=node('label','New branch name');

 label.append(name);status.setAttribute('role','status');more.hidden=true;retry.hidden=!adapter.branchPending;
 dialog.append(node('h2','Document branches'),node('p','Each branch has an independent working buffer. A new child starts from the exact committed source below; pending edits are excluded.'),list,more,node('h3','Reviewed committed source'),preview,label,status,create,retry,close);document.body.append(dialog);dialog.showModal();

 let next=null,busy=false;


 /** Require the branch dialog to remain open in an unlocked workspace. */
 const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';


 const compare=node('button','Compare committed with parent');


 if(adapter.features.branchComparison&&adapter.isChild(id)){
  dialog.insertBefore(compare,close);compare.onclick=/* Open parent comparison for the captured child branch and bind its lifetime to this dialog. */ ()=>{if(busy||!current())return;

   const popup=openParentComparison(adapter,id,captured.runtime.branch,current);

   if(!popup)return;/* Close the dependent comparison when its branch dialog closes. */

   const cleanup=()=>popup.close();

   dialog.addEventListener('close',cleanup,{once:true});popup.addEventListener('close',/* Detach the dependent cleanup listener after comparison closes independently. */ ()=>dialog.removeEventListener('close',cleanup),{once:true});};
 }


 /** Gate branch controls while operations are busy or branch creation remains uncertain. */
 const controls=()=>{create.disabled=busy||!!adapter.branchPending;compare.disabled=more.disabled=close.disabled=name.disabled=retry.disabled=busy;retry.hidden=!adapter.branchPending;

  for(const b of list.querySelectorAll('button'))b.disabled=busy||b.dataset.current==='true';};


 /** Select one explicit branch while preventing cancellation during the transition. */
 async function choose(branch){if(busy)return;

  busy=true;controls();dialog.oncancel=/* Prevent closing the dialog while the selected branch transition is in flight. */ e=>e.preventDefault();

  try{await select(branch);dialog.close();}catch(error){if(current())status.textContent=error.message;}finally{busy=false;dialog.oncancel=null;

   if(current())controls();}}


 /** Render a selectable branch button and label the captured current branch. */
 function choice(branch,title){const button=node('button',title+(same(branch,captured.runtime.branch)?' · current':''));

  button.dataset.current=String(same(branch,captured.runtime.branch));button.onclick=/* Request the branch represented by this exact button. */ ()=>void choose(branch);list.append(button);}


 /** Load bounded branch choices and preserve the explicit original-branch entry. */
 async function load(append=false){busy=true;controls();

  try{const page=await adapter.branchPage(id,append?next:null);

   if(!current())return;

   if(!append){list.replaceChildren();choice(page.original_branch,'Original branch');}

   for(const entry of page.entries)choice(entry.branch,entry.name);

   next=page.next;more.hidden=next===null;status.textContent='Choose a branch, or name a child of the reviewed branch.';}catch(error){if(current())status.textContent=error.message;}finally{busy=false;

   if(current())controls();}}


 close.onclick=/* Close branch review without creating or selecting another branch. */ ()=>dialog.close();dialog.addEventListener('close',/* Remove the closed branch dialog. */ ()=>dialog.remove(),{once:true});more.onclick=/* Append the next page of available branches. */ ()=>void load(true);
 create.disabled=true;create.onclick=/* Create a child only from the reviewed captured committed context and select it after confirmation. */ async()=>{if(busy||!name.value.trim())return;

  busy=true;controls();dialog.oncancel=/* Prevent cancellation during the original child-creation attempt. */ e=>e.preventDefault();

  try{const result=await adapter.createBranch(id,name.value,captured);

   if(current()){await select(result.branch);dialog.close();}}catch(error){if(current())status.textContent=error.status===409?'The reviewed committed source changed. Close and reopen branches to review it again.':error.message;}finally{busy=false;dialog.oncancel=null;

   if(current())controls();}};
 retry.onclick=/* Reconcile pending child creation using its original operation, then select the confirmed child. */ async()=>{if(busy)return;

  busy=true;controls();

  try{const result=await adapter.retryBranch();

   if(current()){await select(result.branch);dialog.close();}}catch(error){if(current())status.textContent=error.message;}finally{busy=false;

   if(current())controls();}};
 void (/* Load the captured committed source preview before making branch choices available. */ async()=>{try{const source=await adapter.snapshot(id,captured.runtime.snapshot);

   if(!current())return;

   preview.textContent=source.text;await load();}catch(error){if(current()){status.textContent=error.message;notify(error.message);}}})();
}
