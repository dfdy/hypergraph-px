/** Exact immutable judgement navigation; later reviews never redirect these IDs. */
import {assertionPropertyLabels} from './assertion-properties.js';
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
export function openAssertionHistory(adapter,initial,notify){
 const dialog=node('dialog');dialog.className='function-dialog assertion-history';const heading=node('h2','Assertion review history');heading.id='assertion-review-history-title';dialog.setAttribute('aria-labelledby',heading.id);
 const status=node('p','Loading exact assertion revision…'),body=node('div'),actions=node('div'),later=node('button','Later judgement'),earlier=node('button','Earlier judgement'),close=node('button','Close history');status.setAttribute('role','status');actions.className='dialog-actions';actions.append(later,earlier,close);
 dialog.append(heading,node('p','Retrospective annotation history, separate from the text snapshot. Owner acceptance is not a checked logical proof.'),status,body,actions);
 let cursor=0,entry=null,busy=false,request=0;const frames=[{revision:structuredClone(initial.revision),generation:initial.generation}];
 const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';
 function controls(){later.disabled=busy||cursor===0;earlier.disabled=busy||!entry?.record.parent;}
 async function inspect(source){const token=request;try{const {document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=source,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});if(!current()||token!==request)return;if(typeof result.text!=='string')throw Error('Invalid historical participant');const popup=node('dialog');popup.className='function-dialog';const pre=node('pre',result.text);pre.className='source-preview';const done=node('button','Close source');done.onclick=()=>popup.close();popup.addEventListener('close',()=>popup.remove(),{once:true});popup.append(node('h2','Historical assertion participant · read only'),pre,done);document.body.append(popup);popup.showModal();}catch(error){if(current()&&token===request)notify(error.message);}}
 async function show(index,revision,expectedGeneration){
  if(busy||!current())return;busy=true;controls();const token=++request;status.textContent='Loading exact assertion revision…';
  try{const result=await adapter.assertionRevision(initial.record.node,revision);if(!current()||token!==request)return;if(result.generation!==expectedGeneration)throw Error('Inconsistent assertion history order');
   entry=result;cursor=index;frames[index]={revision:structuredClone(result.revision),generation:result.generation};body.replaceChildren(node('h3',result.definition.definition.label),node('p',result.definition.definition.description));status.textContent=`${result.record.status[0].toUpperCase()+result.record.status.slice(1)} · assertion revision ${result.generation+1}`;
   for(const text of assertionPropertyLabels(result.record.properties))body.append(node('p',text));for(const [i,p] of result.record.participants.entries()){const button=node('button',`Inspect ${p.role} participant ${i+1}`);button.onclick=()=>void inspect(p.source);body.append(button);}
  }catch(error){if(current()&&token===request)status.textContent='Assertion history unavailable: '+error.message;}
  finally{if(current()&&token===request){busy=false;controls();}}
 }
 later.onclick=()=>{const frame=frames[cursor-1];if(frame)void show(cursor-1,frame.revision,frame.generation);};
 earlier.onclick=()=>{if(entry?.record.parent&&entry.generation>0)void show(cursor+1,entry.record.parent,entry.generation-1);};
 close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{request++;dialog.remove();},{once:true});document.body.append(dialog);dialog.showModal();void show(0,initial.revision,initial.generation);
}
