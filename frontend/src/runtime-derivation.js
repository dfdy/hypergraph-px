/** A fork's pinned input and initial output, independent of later revision history. */
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const validId=id=>Array.isArray(id)&&id.length===32&&id.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const key=id=>id.map(n=>n.toString(16).padStart(2,'0')).join('');
export function renderDerivation(parent,adapter,id,notify){
 const panel=node('div'),status=node('p','Loading recorded derivation…');panel.append(status);parent.append(panel);
 const current=()=>parent.contains(panel)&&adapter.lifecycle==='unlocked';
 void (async()=>{
  try{
   let event;
   try{event=await adapter.request('merge',{document:adapter.get(id).runtime.document});}
   catch(error){if(error.status!==404)throw error;event=await adapter.derivation(id);}
   if(!current())return;
   if(event.kind==='reviewed_synthesis'){
    if(event.source_authorship!=='unknown'||!['transformation','operation','actor','device'].every(k=>validId(event[k]))||event.inputs?.length<2||event.inputs?.length>8||event.outputs?.length!==1||key(event.outputs[0].document)!==id)throw Error('Invalid recorded synthesis');
    panel.replaceChildren(node('h3','Reviewed synthesis from committed inputs'),node('p','Ordered inputs and initial output are pinned historical versions. The publisher reviewed this output; original sentence authorship is unknown. Source histories are retained.'));
    for(const [i,input] of event.inputs.entries()){
     if(!['document','node','snapshot','revision'].every(k=>validId(input[k]))||!Array.isArray(input.occurrence_path)||input.occurrence_path.length!==1||!input.occurrence_path.every(validId)||key(input.node)===key(event.outputs[0].node)||!Number.isSafeInteger(input.start_byte)||!Number.isSafeInteger(input.end_byte)||input.start_byte<0||input.end_byte<=input.start_byte)throw Error('Invalid synthesis input');
     const inspect=node('button',`Inspect exact merge input ${i+1}`);inspect.onclick=async()=>{try{const {document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=input,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});if(!current())return;if(typeof result.text!=='string')throw Error('Invalid exact merge input');const popup=node('dialog');popup.className='function-dialog';const pre=node('pre',result.text);pre.className='source-preview';const close=node('button','Close source');close.onclick=()=>popup.close();popup.addEventListener('close',()=>popup.remove(),{once:true});popup.append(node('h2','Merge input · read only'),pre,close);document.body.append(popup);popup.showModal();}catch(error){if(current())notify(error.message);}};panel.append(inspect);
    }
    return;
   }
   if(event.kind!=='fork'||!['transformation','operation','actor','device'].every(k=>validId(event[k]))||event.inputs?.length!==1||event.outputs?.length!==1)throw Error('Invalid recorded derivation');
   const input=event.inputs[0],output=event.outputs[0];
   for(const s of [input,output])if(!['document','node','snapshot','revision'].every(k=>validId(s[k]))||!Array.isArray(s.occurrence_path)||s.occurrence_path.length!==1||!s.occurrence_path.every(validId)||!Number.isSafeInteger(s.start_byte)||!Number.isSafeInteger(s.end_byte)||s.start_byte<0||s.end_byte<=s.start_byte)throw Error('Invalid recorded derivation');
   if(key(output.document)!==id||key(input.node)===key(output.node))throw Error('Invalid fork identity');
   panel.replaceChildren(node('h3','Forked from committed source'),node('p',adapter.docs.get(key(input.document))?.title??'Retained source document'),node('p','The source and the initial fork are pinned versions. Later edits have their own revision history.','caption'));
   const inspect=node('button','Inspect exact fork source');inspect.onclick=async()=>{
    inspect.disabled=true;
    try{
     const result=await adapter.request('anchor/resolve',{document:input.document,snapshot:input.snapshot,revision:input.revision,occurrence_path:input.occurrence_path,start_byte:input.start_byte,end_byte:input.end_byte});if(!current())return;
     if(typeof result.text!=='string')throw Error('Invalid source response');
     const dialog=node('dialog');dialog.className='function-dialog';const preview=node('pre',result.text);preview.className='source-preview';const close=node('button','Close');close.onclick=()=>{dialog.close();dialog.remove();};dialog.append(node('h2','Fork source · read only'),preview,close);document.body.append(dialog);dialog.showModal();
    }catch(error){if(current())notify(error.message);}finally{inspect.disabled=false;}
   };panel.append(inspect);
  }catch(error){if(current())status.textContent=error.status===404?'No recorded derivation for this document.':'Recorded derivation unavailable: '+error.message;}
 })();
}
