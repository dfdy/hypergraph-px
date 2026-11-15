/**
 * # Hypergraph PX — Pinned Fork and synthesis evidence panel
 *
 * Inspect committed or private-working Fork inputs and ordered synthesis inputs
 * without following newer source heads.
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
 * Used by: Annotations and provenance panels through derivation inspection in the
 * application shell.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Provenance and history contract][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: The panel reports recorded transformations, not original sentence
 * authorship or logical proof. Backend source reads remain protected and late
 * responses cannot update a removed/locked view.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-derivation.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/provenance-model.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

import {validWorkingSource} from './runtime-working-clipboard.js';

/** A fork's pinned input and initial output, independent of later revision history. */
/** Create safe text-based evidence elements with optional presentation classes. */
const node=(tag,text,className)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 if(className)e.className=className;

 return e;};

/** Validate the supported32-byte identity representation. */
const validId=id=>Array.isArray(id)&&id.length===32&&id.every(/* Require each identity element to be an integer byte. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Build a stable hexadecimal identity key for exact comparisons and labels. */
const key=id=>id.map(/* Encode one identity byte with two hexadecimal digits. */ n=>n.toString(16).padStart(2,'0')).join('');

/** Create a derivation panel and inspect the supported pinned transformation family for this document. */
export function renderDerivation(parent,adapter,id,notify){
 const panel=node('div'),status=node('p','Loading recorded derivation…');

 panel.append(status);parent.append(panel);


 /** Require the panel to remain attached and the workspace unlocked before applying evidence. */
 const current=()=>parent.contains(panel)&&adapter.lifecycle==='unlocked';


 void (/* Load synthesis, committed-Fork or working-Fork evidence using explicit route fallbacks and validate its bindings. */ async()=>{
  try{
   let event;


   try{event=await adapter.request('merge',{document:adapter.get(id).runtime.document});}
   catch(error){
    if(error.status!==404)throw error;


    try{event=await adapter.derivation(id);}
    catch(error){if(error.status!==404||!adapter.features.workingCopy)throw error;

     event=await adapter.request('working/derivation',{document:adapter.get(id).runtime.document});}
   }


   if(!current())return;


   if(event.kind==='working_fork'){
    const {input,output}=event;


    if(!['transformation','operation','actor','device'].every(/* Validate each working-Fork transformation/publication identity. */ k=>validId(event[k]))||!validWorkingSource(input)||!output||!['document','node','snapshot','revision'].every(/* Validate each initial working-Fork output identity. */ k=>validId(output[k]))||!Array.isArray(output.occurrence_path)||output.occurrence_path.length!==1||!output.occurrence_path.every(validId)||output.start_byte!==0||!Number.isSafeInteger(output.end_byte)||output.end_byte!==input.end_byte-input.start_byte||key(output.document)!==id||key(input.node)===key(output.node))throw Error('Invalid recorded working-source derivation');


    panel.replaceChildren(node('h3','Forked from unpublished working source'),node('p',adapter.docs.get(key(input.document))?.title??'Retained source document'),node('p','This independent document retains an exact private working checkpoint and its initial published output. Later edits and Commit do not change the original source.','caption'));


    const source=structuredClone(input),inspect=node('button','Inspect exact working fork source');

    inspect.onclick=/* Inspect the exact retained working checkpoint without treating promotion as replacement of the original. */ async()=>{
     inspect.disabled=true;


     try{
      const result=await adapter.workingClipboard.inspect(source);

      if(!current())return;


      const dialog=node('dialog');

      dialog.className='function-dialog';

      const preview=node('pre',result.passage);

      preview.className='source-preview';

      const close=node('button','Close source');

      close.onclick=/* Close the retained working-source dialog. */ ()=>dialog.close();dialog.addEventListener('close',/* Remove the closed working-source dialog node. */ ()=>dialog.remove(),{once:true});dialog.append(node('h2','Working fork source · read only'),node('p',result.promotion?'The original private checkpoint is retained with exact Commit promotion evidence.':'Retained private checkpoint · unpublished source.'),preview,close);document.body.append(dialog);dialog.showModal();
     }catch(error){if(current())notify(error.message);}finally{inspect.disabled=false;}
    };panel.append(inspect);

    return;
   }


   if(event.kind==='reviewed_synthesis'){
    if(event.source_authorship!=='unknown'||!['transformation','operation','actor','device'].every(/* Validate each recorded synthesis transformation/publication identity. */ k=>validId(event[k]))||event.inputs?.length<2||event.inputs?.length>8||event.outputs?.length!==1||key(event.outputs[0].document)!==id)throw Error('Invalid recorded synthesis');


    panel.replaceChildren(node('h3','Reviewed synthesis from committed inputs'),node('p','Ordered inputs and initial output are pinned historical versions. The publisher reviewed this output; original sentence authorship is unknown. Source histories are retained.'));


    for(const [i,input] of event.inputs.entries()){
     if(!['document','node','snapshot','revision'].every(/* Validate every required identity in one committed synthesis input. */ k=>validId(input[k]))||!Array.isArray(input.occurrence_path)||input.occurrence_path.length!==1||!input.occurrence_path.every(validId)||key(input.node)===key(event.outputs[0].node)||!Number.isSafeInteger(input.start_byte)||!Number.isSafeInteger(input.end_byte)||input.start_byte<0||input.end_byte<=input.start_byte)throw Error('Invalid synthesis input');


     const inspect=node('button',`Inspect exact merge input ${i+1}`);

     inspect.onclick=/* Resolve and display one exact ordered synthesis input with current-view guards. */ async()=>{try{const {document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=input,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});

      if(!current())return;

      if(typeof result.text!=='string')throw Error('Invalid exact merge input');

      const popup=node('dialog');

      popup.className='function-dialog';

      const pre=node('pre',result.text);

      pre.className='source-preview';

      const close=node('button','Close source');

      close.onclick=/* Close the retained synthesis-source preview. */ ()=>popup.close();popup.addEventListener('close',/* Remove the closed synthesis-source dialog. */ ()=>popup.remove(),{once:true});popup.append(node('h2','Merge input · read only'),pre,close);document.body.append(popup);popup.showModal();}catch(error){if(current())notify(error.message);}};panel.append(inspect);
    }


    return;
   }


   if(event.kind!=='fork'||!['transformation','operation','actor','device'].every(/* Validate each committed-Fork transformation/publication identity. */ k=>validId(event[k]))||event.inputs?.length!==1||event.outputs?.length!==1)throw Error('Invalid recorded derivation');


   const input=event.inputs[0],output=event.outputs[0];


   for(const s of [input,output])if(!['document','node','snapshot','revision'].every(/* Validate each identity in the Fork's pinned input and initial output. */ k=>validId(s[k]))||!Array.isArray(s.occurrence_path)||s.occurrence_path.length!==1||!s.occurrence_path.every(validId)||!Number.isSafeInteger(s.start_byte)||!Number.isSafeInteger(s.end_byte)||s.start_byte<0||s.end_byte<=s.start_byte)throw Error('Invalid recorded derivation');


   if(key(output.document)!==id||key(input.node)===key(output.node))throw Error('Invalid fork identity');


   panel.replaceChildren(node('h3','Forked from committed source'),node('p',adapter.docs.get(key(input.document))?.title??'Retained source document'),node('p','The source and the initial fork are pinned versions. Later edits have their own revision history.','caption'));


   const inspect=node('button','Inspect exact fork source');

   inspect.onclick=/* Resolve the exact committed Fork input and display its retained text read-only. */ async()=>{
    inspect.disabled=true;


    try{
     const result=await adapter.request('anchor/resolve',{document:input.document,snapshot:input.snapshot,revision:input.revision,occurrence_path:input.occurrence_path,start_byte:input.start_byte,end_byte:input.end_byte});

     if(!current())return;


     if(typeof result.text!=='string')throw Error('Invalid source response');


     const dialog=node('dialog');

     dialog.className='function-dialog';

     const preview=node('pre',result.text);

     preview.className='source-preview';

     const close=node('button','Close');

     close.onclick=/* Close and remove the committed-source preview dialog. */ ()=>{dialog.close();dialog.remove();};dialog.append(node('h2','Fork source · read only'),preview,close);document.body.append(dialog);dialog.showModal();
    }catch(error){if(current())notify(error.message);}finally{inspect.disabled=false;}
   };panel.append(inspect);
  }catch(error){if(current())status.textContent=error.status===404?'No recorded derivation for this document.':'Recorded derivation unavailable: '+error.message;}
 })();
}
