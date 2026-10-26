/** Retrospective annotation inspection. Exact snapshot anchors are never relocated. */
import {assertionPropertyLabels} from './assertion-properties.js';
import {openAssertionHistory} from './assertion-history.js';
import {openAssertionComposer} from './assertion-composer.js';
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function renderAssertionOverlay(parent,adapter,id,context,notify,{history=false}={}){
 const panel=node('div'),intro=node('p','Retrospective assertion overlay. Text snapshots exclude these claims. Acceptance records an owner judgement, not a checked proof.'),status=node('p','Loading assertions…'),label=node('label'),all=node('input'),list=node('div'),actions=node('div');all.type='checkbox';label.className='assertion-overlay-choice';label.append(all,document.createTextNode(' Show all retained assertions in this document'));actions.className='dialog-actions';status.setAttribute('role','status');
 const declare=node('button','Declare captured-source assertion'),refresh=node('button','Refresh assertions'),more=node('button','More assertions'),retry=node('button','Retry assertion operation');retry.hidden=true;actions.append(refresh,more,retry);panel.append(intro,declare,label,status,list,actions);parent.append(panel);
 let entries=[],generation=null,next=null,busy=false,request=0,snapshotText=null,snapshot=null;
 const current=()=>parent.contains(panel)&&adapter.lifecycle==='unlocked';
 function controls(){refresh.disabled=more.disabled=retry.disabled=busy;declare.disabled=busy||!!adapter.assertions.pending;more.hidden=next===null;retry.hidden=!adapter.assertions.pending;}
 async function inspect(source){try{const {document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=source,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});if(!current())return;if(typeof result.text!=='string')throw Error('Invalid assertion source response');const dialog=node('dialog');dialog.className='function-dialog';const pre=node('pre',result.text);pre.className='source-preview';const close=node('button','Close source');close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.append(node('h2','Assertion participant · read only'),pre,close);document.body.append(dialog);dialog.showModal();}catch(error){if(current())notify(error.message);}}
 function paint(){
  if(!current())return;controls();list.replaceChildren();const c=context(),exact=c.source===snapshotText&&same(c.snapshot,snapshot);
  const visible=all.checked?entries:entries.filter(entry=>exact&&entry.record.participants.some(p=>same(p.source.document,c.document)&&same(p.source.snapshot,snapshot)&&p.source.start_byte<=c.caret_byte&&p.source.end_byte>=c.caret_byte));
  status.textContent=all.checked?`${entries.length} loaded retained assertions · separate overlay view.`:exact?`${visible.length} assertions at the current caret in this committed snapshot.`:'Uncommitted or newer source has no exact caret mapping. Show retained assertions to inspect earlier claims.';
  for(const entry of visible){
   const r=entry.record,d=entry.definition.definition,card=node('article');card.className='card assertion-card';card.dataset.assertionNode=r.node.join(',');card.append(node('h3',d.label),node('p',`${r.status[0].toUpperCase()+r.status.slice(1)} · retrospective assertion · revision ${entry.generation+1}`),node('p',d.description));
   for(const text of assertionPropertyLabels(r.properties))card.append(node('p',text));
   for(const p of r.participants){const role=d.roles.find(role=>role.id===p.role)?.label??p.role;card.append(node('p',`${role} · exact historical participant`));const show=node('button','Inspect '+p.role+' participant');show.onclick=()=>void inspect(p.source);card.append(show);}
   if(d.context_fields.length)card.append(node('p','Interpretation context: '+d.context_fields.join('; ')));
   if(history){const previous=node('button','Review history');previous.onclick=()=>openAssertionHistory(adapter,entry,notify);card.append(previous);}
   const review=node('div');review.className='dialog-actions';for(const [value,text] of [['accepted','Accept assertion'],['rejected','Reject assertion'],['superseded','Mark superseded']]){const button=node('button',text);button.disabled=busy||r.status===value||!!adapter.assertions.pending;button.onclick=()=>void change(()=>adapter.reviewAssertion(entry,value));review.append(button);}card.append(review);list.append(card);
  }
 }
 async function load(append=false){
  if(busy||!current())return;busy=true;controls();const token=++request;status.textContent='Loading retrospective assertions…';
  try{
   const page=await adapter.assertionPage(id,append?generation:null,append?next:0);if(!current()||request!==token)return;
   const text=await adapter.snapshot(id,page.snapshot);if(!current()||request!==token)return;if(typeof text.text!=='string')throw Error('Invalid assertion snapshot response');
   if(append&&!same(snapshot,page.snapshot))throw Error('Snapshot changed; refresh assertions');
   const combined=append?[...entries,...page.entries]:page.entries,ids=new Set();for(const entry of combined){const key=JSON.stringify(entry.record.node);if(ids.has(key))throw Error('Duplicate assertion page identity');ids.add(key);}
   entries=combined;generation=page.generation;next=page.next;snapshot=page.snapshot;snapshotText=text.text;busy=false;paint();
  }catch(error){if(current()&&request===token)status.textContent='Assertion overlay unavailable: '+error.message;}
  finally{if(current()&&request===token){busy=false;controls();}}
 }
 async function change(action){if(busy||!current())return;busy=true;paint();try{await action();notify('Assertion operation confirmed.');}catch(error){if(current())notify(error.message);}finally{busy=false;controls();await load();}}
 declare.onclick=()=>openAssertionComposer(adapter,notify,success=>{if(success)all.checked=true;void load();});all.onchange=paint;refresh.onclick=()=>void load();more.onclick=()=>void load(true);retry.onclick=()=>void change(()=>adapter.retryAssertion());void load();return {update:paint,refresh:()=>load()};
}
