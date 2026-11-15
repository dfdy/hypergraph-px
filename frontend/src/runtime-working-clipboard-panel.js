/**
 * # Hypergraph PX — Retained working-reference inspection controls
 *
 * Display private working checkpoints and explicit committed replacements while
 * keeping the original source evidence inspectable.
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
 * Used by: Annotations and provenance panels through the private working-reference
 * clipboard.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Inspection is read-only and replacement evidence does not overwrite an
 * original reference. All late responses are guarded against removed views or
 * locked workspaces.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-working-clipboard-panel.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

/** Create safe text-based controls with optional presentation classes. */
const node=(tag,text,className)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 if(className)e.className=className;

 return e;};

/** Convert opaque identity bytes into a stable comparison key. */
const key=id=>id.map(/* Encode one identity byte as two hexadecimal digits. */ n=>n.toString(16).padStart(2,'0')).join('');

/** Append supported retained working-reference controls and explicit promotion/retry actions. */
export function appendWorkingClipboard(parent,adapter,{busy,change,notify,fork}){
 if(!adapter.features.workingCopy)return;

 const clipboard=adapter.workingClipboard,section=node('div');

 section.className='working-references';parent.append(section);


 if(clipboard.total||clipboard.pending)section.append(node('span','Working-source references','caption'));


 for(const entry of clipboard.entries){
  const working=entry.target.kind==='working',source=entry.target.source,title=adapter.docs.get(key(source.document))?.title??'Retained document',chip=node('div');

  chip.className='clip-chip';


  const inspect=node('button',`${title} · ${working?'Working checkpoint':'Committed replacement'} · ${[...entry.preview].slice(0,45).join('')}`),remove=node('button','×');

  remove.setAttribute('aria-label',`Remove working reference from ${title}`);inspect.disabled=remove.disabled=busy||!!clipboard.pending;
  remove.onclick=/* Run removal of this working-reference entry through shared mutation coordination. */ ()=>change(/* Remove the exact entry at the current working clipboard generation. */ ()=>adapter.changeWorkingClipboard({action:'remove',generation:clipboard.generation,entry:entry.id}));
  inspect.onclick=/* Resolve the selected working or committed target and show its exact retained passage. */ async()=>{inspect.disabled=true;

   try{
   const resolved=working?await clipboard.inspect(source):await adapter.request('anchor/resolve',{document:source.document,snapshot:source.snapshot,revision:source.revision,occurrence_path:source.occurrence_path,start_byte:source.start_byte,end_byte:source.end_byte});


   if(adapter.lifecycle!=='unlocked'||!parent.contains(section))return;

    const passage=working?resolved.passage:resolved.text;

    if(typeof passage!=='string'||!passage.isWellFormed())throw Error('Invalid retained source');


   const popup=node('dialog');

    popup.className='function-dialog';popup.setAttribute('aria-label','Retained working source');

    const pre=node('pre',passage);

    pre.className='source-preview';

    const status=node('p'),actions=node('div'),close=node('button','Close source');

    actions.className='dialog-actions';close.onclick=/* Close the retained-source inspection dialog. */ ()=>popup.close();popup.addEventListener('close',/* Remove the closed retained-source dialog node. */ ()=>popup.remove(),{once:true});
   popup.append(node('h2',working?'Working checkpoint · read only':'Committed replacement · read only'),node('p',working?(resolved.promotion?'This exact checkpoint has Commit promotion evidence; its original target is retained.':'This checkpoint is private retained source. It has not been promoted by an exact Commit.'):'This is a new reference to committed source. Its original working reference remains retained.'),pre,status);


   if(!working){const original=node('button','Inspect original working reference');

     original.onclick=/* Inspect the original working reference behind an explicit committed replacement. */ async()=>{try{const prior=await adapter.request('working/reference',{entry:entry.target.previous});

      if(!popup.isConnected||adapter.lifecycle!=='unlocked')return;

      if(prior.target?.kind!=='working')throw Error('Invalid original reference');

      const view=await clipboard.inspect(prior.target.source);

      if(!popup.isConnected||adapter.lifecycle!=='unlocked')return;

      pre.textContent=view.passage;status.textContent='Original working checkpoint · exact retained source';}catch(error){if(popup.isConnected)status.textContent=error.message;}};actions.append(original);}


   if(fork){const label=node('label','Fork name'),name=node('input');

     name.setAttribute('aria-label','Fork name');name.maxLength=512;name.value=`Fork of ${title}`;label.append(name);

     const create=node('button','Fork captured source');

     create.onclick=/* Publish an independent Fork from the inspected exact retained source after explicit naming. */ async()=>{if(!name.value.trim())return;

      create.disabled=name.disabled=close.disabled=true;popup.oncancel=/* Prevent closing the review during an in-flight Fork publication. */ e=>e.preventDefault();

      try{await fork(source,passage,name.value,working);popup.close();}catch(error){status.textContent=error.message;}finally{name.disabled=close.disabled=false;popup.oncancel=null;}};popup.append(label);actions.append(create);}


   actions.append(close);popup.append(actions);document.body.append(popup);popup.showModal();
  }catch(error){if(parent.contains(section)&&adapter.lifecycle==='unlocked')notify(error.message);}finally{inspect.disabled=busy;}};
  chip.append(inspect,remove);section.append(chip);
 }


 if(clipboard.next!==null){const more=node('button','More working references');

  more.disabled=busy;more.onclick=/* Coordinate loading the next working-reference page. */ ()=>change(/* Load the next generation-consistent working-reference page. */ ()=>adapter.loadWorkingClipboard(true));section.append(more);}


 if(clipboard.total){const clear=node('button','Clear working references');

  clear.disabled=busy||!!clipboard.pending;clear.onclick=/* Coordinate an explicit clear of the visible working-reference collection. */ ()=>change(/* Submit clear against the current working clipboard generation. */ ()=>adapter.changeWorkingClipboard({action:'clear',generation:clipboard.generation}));section.append(clear);}


 if(clipboard.pending){const retry=node('button','Retry working-reference operation');

  retry.disabled=busy;retry.onclick=/* Coordinate reconciliation of an uncertain working-reference mutation. */ ()=>change(/* Retry the original frozen working-reference operation. */ ()=>adapter.retryWorkingClipboard());section.append(retry);}


 if(clipboard.error){section.append(node('p',clipboard.error));

  const recover=node('button','Update promoted references');

  recover.disabled=busy;recover.onclick=/* Coordinate a request to discover exact Commit promotion evidence. */ ()=>change(/* Reconcile available promotions without silently rewriting original working references. */ ()=>adapter.reconcileWorkingReferences());section.append(recover);}
}
