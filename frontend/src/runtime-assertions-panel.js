/**
 * # Hypergraph PX — Retrospective assertion overlay controls
 *
 * Inspect explicit retained claims, show exact-caret matches only when source
 * correspondence holds and submit attributable review operations.
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
 * Used by: Annotations and provenance panels, in-text relationship labels and
 * assertion history controls.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Assertions and predicate semantics][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: Owner acceptance is a judgement, not a proof. Uncommitted/newer text
 * does not inherit an exact historical caret mapping, and comparison or inspection
 * never silently resolves a claim.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-assertions-panel.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

import {assertionPropertyLabels} from './assertion-properties.js';
import {openAssertionHistory} from './assertion-history.js';
import {openAssertionComposer} from './assertion-composer.js';

/** Create safe text-only labels and containers for retained assertion evidence. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 return e;};

/** Compare the existing byte-array identity representations in this scoped panel. */
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/** Build the retrospective overlay with exact-caret filtering, explicit inspection and reviewed mutation controls. */
export function renderAssertionOverlay(parent,adapter,id,context,notify,{history=false,onLoaded=/* Allow callers to omit the optional notification of newly loaded assertion evidence. */ ()=>{}}={}){
 const panel=node('div'),intro=node('p','Retrospective assertion overlay. Text snapshots exclude these claims. Acceptance records an owner judgement, not a checked proof.'),status=node('p','Loading assertions…'),label=node('label'),all=node('input'),list=node('div'),actions=node('div');

 all.type='checkbox';label.className='assertion-overlay-choice';label.append(all,document.createTextNode(' Show all retained assertions in this document'));actions.className='dialog-actions';status.setAttribute('role','status');


 const declare=node('button','Declare captured-source assertion'),refresh=node('button','Refresh assertions'),more=node('button','More assertions'),retry=node('button','Retry assertion operation');

 retry.hidden=true;actions.append(refresh,more,retry);panel.append(intro,declare,label,status,list,actions);parent.append(panel);


 let entries=[],generation=null,next=null,busy=false,request=0,snapshotText=null,snapshot=null,inspected=null;


 /** Require the panel to remain mounted and its workspace unlocked. */
 const current=()=>parent.contains(panel)&&adapter.lifecycle==='unlocked';


 /** Gate paging/review controls while loading or reconciling a pending assertion operation. */
 function controls(){refresh.disabled=more.disabled=retry.disabled=busy;declare.disabled=busy||!!adapter.assertions.pending;more.hidden=next===null;retry.hidden=!adapter.assertions.pending;}


 /** Read an explicitly retained participant source without relocating its historical anchor. */
 async function inspect(source){try{const {document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=source,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});

   if(!current())return;

   if(typeof result.text!=='string')throw Error('Invalid assertion source response');

   const dialog=node('dialog');

   dialog.className='function-dialog';

   const pre=node('pre',result.text);

   pre.className='source-preview';

   const close=node('button','Close source');

   close.onclick=/* Close the read-only participant-source dialog. */ ()=>dialog.close();dialog.addEventListener('close',/* Remove the closed participant-source dialog. */ ()=>dialog.remove(),{once:true});dialog.append(node('h2','Assertion participant · read only'),pre,close);document.body.append(dialog);dialog.showModal();}catch(error){if(current())notify(error.message);}}


 /** Render exact matching or explicitly inspected claims and clear stale caret inspection state. */
 function paint(){
  if(!current())return;

  controls();list.replaceChildren();

  const c=context(),exact=c.source===snapshotText&&same(c.snapshot,snapshot);


  if(inspected&&(inspected.caret!==c.caret_byte||inspected.source!==c.source||!same(inspected.snapshot,c.snapshot)))inspected=null;


  const visible=inspected?[inspected.entry]:all.checked?entries:entries.filter(/* Select assertions whose exact retained participant interval contains the current committed caret. */ entry=>exact&&entry.record.participants.some(/* Match one participant's document, snapshot and byte range to the current exact source context. */ p=>same(p.source.document,c.document)&&same(p.source.snapshot,snapshot)&&p.source.start_byte<=c.caret_byte&&p.source.end_byte>=c.caret_byte));


  status.textContent=inspected?'Inspecting the selected retrospective relation.':all.checked?`${entries.length} loaded retained assertions · separate overlay view.`:exact?`${visible.length} assertions at the current caret in this committed snapshot.`:'Uncommitted or newer source has no exact caret mapping. Show retained assertions to inspect earlier claims.';


  for(const entry of visible){
   const r=entry.record,d=entry.definition.definition,card=node('article');

   card.className='card assertion-card'+(inspected?' inspected':'');card.tabIndex=-1;card.dataset.assertionNode=r.node.join(',');card.append(node('h3',d.label),node('p',`${r.status[0].toUpperCase()+r.status.slice(1)} · retrospective assertion · revision ${entry.generation+1}`),node('p',d.description));


   if(inspected?.wording&&inspected.wording!==d.label)card.append(node('p','Text control wording: '+inspected.wording));


   for(const text of assertionPropertyLabels(r.properties))card.append(node('p',text));


   for(const p of r.participants){const role=d.roles.find(/* Find the friendly label for a participant's explicitly declared role. */ role=>role.id===p.role)?.label??p.role;

    card.append(node('p',`${role} · exact historical participant`));

    const show=node('button','Inspect '+p.role+' participant');

    show.onclick=/* Inspect this participant's immutable source binding. */ ()=>void inspect(p.source);card.append(show);}


   if(d.context_fields.length)card.append(node('p','Interpretation context: '+d.context_fields.join('; ')));


   if(history){const previous=node('button','Review history');

    previous.onclick=/* Open the retained judgement history for the selected assertion revision. */ ()=>openAssertionHistory(adapter,entry,notify);card.append(previous);}


   const review=node('div');

   review.className='dialog-actions';

   for(const [value,text] of [['accepted','Accept assertion'],['rejected','Reject assertion'],['superseded','Mark superseded']]){const button=node('button',text);

    button.disabled=busy||r.status===value||!!adapter.assertions.pending;button.onclick=/* Run one explicit review action through the panel's busy/error coordination. */ ()=>void change(/* Submit the selected assertion's requested review judgement. */ ()=>adapter.reviewAssertion(entry,value));review.append(button);}

   card.append(review);list.append(card);
  }
 }


 /** Load generation-consistent assertion evidence and its exact text snapshot before painting. */
 async function load(append=false){
  if(busy||!current())return;

  busy=true;controls();

  const token=++request;

  status.textContent='Loading retrospective assertions…';


  try{
   const page=await adapter.assertionPage(id,append?generation:null,append?next:0);

   if(!current()||request!==token)return;


   const text=await adapter.snapshot(id,page.snapshot);

   if(!current()||request!==token)return;

   if(typeof text.text!=='string')throw Error('Invalid assertion snapshot response');


   if(append&&!same(snapshot,page.snapshot))throw Error('Snapshot changed; refresh assertions');


   const combined=append?[...entries,...page.entries]:page.entries,ids=new Set();

   for(const entry of combined){const key=JSON.stringify(entry.record.node);

    if(ids.has(key))throw Error('Duplicate assertion page identity');

    ids.add(key);}


   entries=combined;

   if(inspected){const latest=entries.find(/* Find the newly loaded revision of the currently inspected assertion identity. */ e=>same(e.record.node,inspected.entry.record.node));

    if(latest)inspected.entry=latest;}

   generation=page.generation;next=page.next;snapshot=page.snapshot;snapshotText=text.text;busy=false;onLoaded({snapshot,source:snapshotText,entries,generation,next,total:page.total});paint();
  }catch(error){if(current()&&request===token)status.textContent='Assertion overlay unavailable: '+error.message;}
  finally{if(current()&&request===token){busy=false;controls();}}
 }


 /** Serialize one panel action and refresh evidence after its outcome is reported. */
 async function change(action){if(busy||!current())return;

  busy=true;paint();

  try{await action();notify('Assertion operation confirmed.');}catch(error){if(current())notify(error.message);}finally{busy=false;controls();await load();}}


 declare.onclick=/* Open captured-source assertion composition and refresh the overlay on completion. */ ()=>openAssertionComposer(adapter,notify,/* Show all retained assertions after a successful declaration, then reload evidence. */ success=>{if(success)all.checked=true;

  void load();});all.onchange=/* Clear explicit relation inspection when the user changes the all-assertions view. */ ()=>{inspected=null;paint();};refresh.onclick=/* Refresh the retained assertion evidence. */ ()=>void load();more.onclick=/* Append the next page from the current assertion generation. */ ()=>void load(true);retry.onclick=/* Reconcile the original pending assertion operation through panel coordination. */ ()=>void change(/* Retry the original frozen assertion intent rather than generating another mutation. */ ()=>adapter.retryAssertion());void load();

 return {update:paint,refresh:/* Expose a caller-triggered evidence refresh operation. */ ()=>load(),inspect:/* Inspect one explicitly selected relation and retain its exact current source/caret context. */ (entry,wording)=>{const c=context();

  inspected={entry,wording,caret:c.caret_byte,source:c.source,snapshot:c.snapshot};paint();

  const card=list.querySelector('.assertion-card');

  card?.focus({preventScroll:true});card?.scrollIntoView({block:'nearest'});}};
}
