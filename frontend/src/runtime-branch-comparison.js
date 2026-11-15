// SPDX-License-Identifier: AGPL-3.0-only
/**
 * # Hypergraph PX — Exact committed parent-branch comparison
 *
 * Display two captured committed branch snapshots and optionally inspect their
 * actual common committed base.
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
 * Used by: History, branches and graph inspection through branch comparison
 * controls.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [domain navigation md][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: This read-only comparison excludes pending edits and creates no draft
 * save, parent write or conflict resolution. Request/context tokens discard
 * results for a changed or closed comparison.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-branch-comparison.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/domain-navigation.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

/** Create a safe DOM element for retained snapshot labels and source text. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 return e;};

/** Open a read-only comparison of the explicitly selected committed branch and its parent. */
export function openParentComparison(adapter,id,branch,valid=/* Allow the comparison when the caller supplies no additional view-validity restriction. */ ()=>true){
 if(adapter.lifecycle!=='unlocked')return;


 const dialog=node('dialog');

 dialog.className='function-dialog snapshot-comparison';dialog.setAttribute('aria-label','Compare committed branch with parent');


 const status=node('p'),content=node('div'),refresh=node('button','Refresh comparison'),close=node('button','Close comparison'),actions=node('div');

 status.setAttribute('role','status');actions.className='dialog-actions';actions.append(refresh,close);
 dialog.append(node('h2','Compare committed branch with parent'),node('p','Both committed versions are captured together. Pending edits on either branch are excluded.'),status,content,actions);document.body.append(dialog);dialog.showModal();


 const inspect=node('button','Inspect common base'),baseContent=node('div');

 baseContent.className='common-base-inspection';inspect.disabled=true;

 if(adapter.features?.parentBase){actions.prepend(inspect);content.after(baseContent);}


 let captured=null,token=0;/* Require the same open dialog, caller context and unlocked workspace before using results. */

 const current=()=>dialog.isConnected&&dialog.open&&valid()&&adapter.lifecycle==='unlocked';


 close.onclick=/* Close the comparison without changing either branch. */ ()=>dialog.close();dialog.addEventListener('close',/* Invalidate pending comparison requests and remove the closed dialog. */ ()=>{token++;dialog.remove();},{once:true});


 /** Capture committed comparison context and fetch both exact snapshots without following later heads. */
 async function load(){
  const request=++token;

  captured=null;inspect.disabled=true;refresh.disabled=true;content.replaceChildren();baseContent.replaceChildren();dialog.classList.remove('has-common-base');status.textContent='Loading committed branch comparison…';


  try{
   const context=await adapter.parentComparison(id,branch);

   if(!current()||request!==token)return;


   const [source,parent]=await Promise.all([adapter.snapshot(id,context.source_snapshot),adapter.snapshot(id,context.parent_snapshot)]);

   if(!current()||request!==token)return;


   status.textContent=source.text===parent.text?'Committed snapshots have identical bytes.':'Committed snapshots differ.';


   const columns=node('div');

   columns.className='snapshot-comparison-columns';


   for(const [label,name,text] of [['Selected branch · committed',context.source_name,source.text],['Parent branch · committed',context.parent_name,parent.text]]){
    const section=node('section'),heading=node('h3',label),nameLabel=node('p',name),pre=node('pre',text);

    nameLabel.style.overflowWrap='anywhere';pre.className='source-preview';pre.setAttribute('aria-label',label);section.append(heading,nameLabel,node('p',`${new TextEncoder().encode(text).length} UTF-8 bytes`),pre);columns.append(section);
   }


   content.append(columns);captured=context;inspect.disabled=false;
  }catch(error){if(current()&&request===token)status.textContent='Comparison unavailable: '+error.message;}
  finally{if(current()&&request===token)refresh.disabled=false;}
 }


 inspect.onclick=/* Inspect the captured pair's actual common base and report unrelated/ambiguous results without choosing another base. */ async()=>{
  if(!captured||!current())return;

  const context=captured,request=token;

  inspect.disabled=true;baseContent.replaceChildren(node('p','Inspecting shared committed history…'));


  try{
   const report=await adapter.parentBase(id,context);

   if(!current()||request!==token)return;


   const result=report.selection;


   if(result.result!=='base'){baseContent.replaceChildren(node('p',result.result==='unrelated'?'No shared committed version was found.':'More than one shared base remains; automatic selection is unavailable.'));

    return;}


   const source=await adapter.snapshot(id,result.snapshot);

   if(!current()||request!==token)return;


   const pre=node('pre',source.text);

   pre.className='source-preview';pre.setAttribute('aria-label','Common committed base');
   dialog.classList.add('has-common-base');baseContent.replaceChildren(node('h3','Common committed base'),node('p',result.source_in_target?'The selected committed version is already in the parent’s history.':result.target_in_source?'The parent’s committed version is already in the selected branch’s history.':'This shared version precedes both branches’ changes.'),node('p','Inspection preserves both branches and their pending edits.'),pre);
  }catch(error){if(current()&&request===token)baseContent.replaceChildren(node('p','Common base unavailable: '+error.message));}
  finally{if(current()&&request===token)inspect.disabled=false;}
 };
 refresh.onclick=/* Refresh both committed snapshots under a newly captured comparison context. */ ()=>void load();void load();

 return dialog;
}
