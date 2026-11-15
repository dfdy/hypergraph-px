/**
 * # Hypergraph PX — Private committed-source reference controls
 *
 * Display acknowledged protected clipboard references, inspect exact historical
 * passages and offer independent Fork creation from those captures.
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
 * Used by: Annotations and provenance panels through the application's private
 * source-reference clipboard.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Unavailable sources remain explicit. This view neither edits source
 * nor performs a synthetic paste; backend source resolution and mutation receipts
 * remain authoritative.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-clipboard-panel.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

/** Create a DOM element with text assigned safely rather than parsed as markup. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text)e.textContent=text;

 return e;};

/** Render a captured identity as a stable hexadecimal key. */
const key=id=>id.map(/* Encode one identity byte with two hexadecimal digits. */ byte=>byte.toString(16).padStart(2,'0')).join('');

/** Render the acknowledged private clipboard with inspection, generation-bound removal and retry controls. */
export function renderPrivateClipboard(list,adapter,{busy,change,notify,fork}){
 list.replaceChildren();


 for(const entry of adapter.clipboard){
  const title=entry.available?(adapter.docs.get(key(entry.source.document))?.title??'Retained document'):'Unavailable source';


  const chip=node('div');

  chip.className='clip-chip';


  const show=node('button',entry.available?`${title} · ${[...entry.preview].slice(0,65).join('')}`:'Captured source unavailable'),remove=node('button','×');

  remove.setAttribute('aria-label',`Remove captured source from ${title}`);
  remove.disabled=busy||!!adapter.privateClipboard.pending;show.disabled=remove.disabled||!entry.available;
  show.onclick=/* Resolve an available captured passage and display the exact retained text read-only. */ async()=>{
   try{
    const s=entry.source,text=await adapter.request('anchor/resolve',{document:s.document,snapshot:s.snapshot,revision:s.revision,occurrence_path:s.occurrence_path,start_byte:s.start_byte,end_byte:s.end_byte});


    if(adapter.lifecycle!=='unlocked'||!list.contains(chip))return;


    if(typeof text.text!=='string')throw Error('Invalid captured source response');


    const dialog=node('dialog');

    dialog.className='function-dialog';

    const preview=node('pre',text.text);

    preview.className='source-preview';

    const close=node('button','Close');

    close.onclick=/* Close and remove the captured-source preview dialog. */ ()=>{dialog.close();dialog.remove();};
    dialog.append(node('h2','Captured source · read only'),node('p',title),preview);


    const actions=node('div');

    actions.className='dialog-actions';


    if(fork){
     const label=node('label','Fork name'),name=node('input');

     name.setAttribute('aria-label','Fork name');name.value=`Fork of ${title}`;name.maxLength=512;label.append(name);


     const explanation=node('p','Create an independent document from this exact captured version. The source and clipboard reference stay available.'),status=node('p'),create=node('button','Fork captured source');

     status.setAttribute('role','status');create.className='primary-action';
     create.onclick=/* Create an independent Fork only after the user supplies a name for the inspected exact capture. */ async()=>{
      if(!name.value.trim()){name.focus();

      return;}


      create.disabled=name.disabled=close.disabled=true;dialog.oncancel=/* Prevent dialog cancellation while Fork publication is in flight. */ e=>e.preventDefault();


      try{await fork(s,text.text,name.value.trim());dialog.close();dialog.remove();}catch(error){status.textContent=error.message;}
      finally{name.disabled=close.disabled=false;dialog.oncancel=null;}
     };dialog.append(explanation,label,status);actions.append(create);
    }


    actions.append(close);dialog.append(actions);document.body.append(dialog);dialog.showModal();
   }catch(error){if(adapter.lifecycle==='unlocked')notify(error.message);}
  };
  remove.onclick=/* Run one captured-entry removal through the application mutation coordinator. */ ()=>change(/* Submit removal of this entry against the currently loaded clipboard generation. */ ()=>adapter.changeClipboard({action:'remove',generation:adapter.privateClipboard.generation,entry:entry.id}));
  chip.append(show,remove);list.append(chip);
 }


 if(!adapter.privateClipboard.total&&!adapter.workingClipboard?.total)list.append(node('span',adapter.features?.workingCopy?'Select text to capture its exact source reference.':'Select committed text to capture its exact source reference.'));


 if(adapter.privateClipboard.next!==null){const more=node('button','More captured sources');

  more.disabled=busy;more.onclick=/* Run additional clipboard paging through the shared busy/error coordinator. */ ()=>change(/* Load the next acknowledged private clipboard page. */ ()=>adapter.loadClipboard(true));list.append(more);}


 if(adapter.privateClipboard.pending){const retry=node('button','Retry clipboard operation');

  retry.disabled=busy;retry.onclick=/* Run reconciliation of a pending clipboard operation through the shared coordinator. */ ()=>change(/* Retry the original frozen clipboard operation. */ ()=>adapter.retryClipboard());list.append(retry);}
}
