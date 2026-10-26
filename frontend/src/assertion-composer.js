/** Human-reviewed n-ary declarations from protected, exact historical references. */
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const key=id=>id.map(n=>n.toString(16).padStart(2,'0')).join('');
export function openAssertionComposer(adapter,notify,confirmed){
 const dialog=node('dialog');dialog.className='function-dialog assertion-composer';const title=node('h2','Declare a role-labelled assertion');title.id='assertion-composer-title';dialog.setAttribute('aria-labelledby',title.id);
 const form=node('form'),label=node('input'),description=node('input'),scope=node('input'),attribution=node('input'),certainty=node('select'),negated=node('input'),sources=node('div'),status=node('p'),actions=node('div');form.onsubmit=e=>e.preventDefault();status.setAttribute('role','alert');actions.className='dialog-actions';
 const field=(text,control)=>{const l=node('label',text);control.setAttribute('aria-label',text);l.append(control);return l;};label.maxLength=160;description.maxLength=8192;scope.maxLength=500;attribution.maxLength=200;
 for(const value of ['unspecified','possible','probable','certain']){const o=node('option',value);o.value=value;certainty.append(o);}negated.type='checkbox';
 const more=node('button','Load more captured sources'),add=node('button','Add participant'),create=node('button','Propose assertion'),close=node('button','Cancel');for(const b of [more,add,create,close])b.type='button';create.className='primary-action';
 form.append(field('Assertion name',label),field('Meaning and interpretation',description),field('Scope or premises',scope),field('Attributed to',attribution),field('Certainty',certainty),field('Negated claim',negated),sources,add,more,status,actions);actions.append(create,close);
 dialog.append(title,node('p','Review 2–8 exact captured sources and name each participant role. Repeated roles are allowed. This creates one proposed retrospective claim, separate from text snapshots. Same wording does not unify separately declared predicates. Acceptance is not a checked proof.'),form);
 let entries=[],rows=[],busy=false,loading=true,success=false;const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';
 function controls(){for(const e of form.querySelectorAll('input,select,button'))e.disabled=busy||loading;add.disabled=busy||loading||rows.length>=8;create.disabled=busy||loading||rows.length<2||rows.some(r=>!r.quote)||!!adapter.assertions.pending;more.hidden=adapter.privateClipboard.next===null;dialog.oncancel=busy?e=>e.preventDefault():null;}
 function choices(row){const value=row.select.value;row.select.replaceChildren(node('option','Choose captured source'));row.select.firstChild.value='';for(const entry of entries){if(!entry.available)continue;const name=adapter.docs.get(key(entry.source.document))?.title??'Retained document',option=node('option',`${name} · ${[...entry.preview].slice(0,45).join('')}`);option.value=key(entry.id);row.select.append(option);}row.select.value=value;}
 function addRow(){
  const container=node('fieldset'),legend=node('legend',`Participant ${rows.length+1}`),select=node('select'),role=node('input'),pre=node('pre','Choose a source to inspect its exact historical text.'),context=node('p'),remove=node('button','Remove participant');remove.type='button';pre.className='source-preview';role.maxLength=64;container.append(legend,field('Captured source',select),field('Participant role',role),context,pre,remove);sources.append(container);
  const row={container,select,role,quote:null,source:null,token:0};rows.push(row);choices(row);
  select.onchange=async()=>{const token=++row.token;row.quote=row.source=null;context.textContent='';pre.textContent='Loading exact historical source…';controls();const entry=entries.find(e=>key(e.id)===select.value);if(!entry){pre.textContent='Choose a captured source.';return;}
   try{const s=structuredClone(entry.source),{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=s,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});if(!current()||token!==row.token||!rows.includes(row))return;if(typeof result.text!=='string')throw Error('Invalid source response');row.source=s;row.quote=result.text;pre.textContent=result.text;context.textContent=`Historical snapshot ${key(snapshot).slice(0,12)} · bytes ${start_byte}–${end_byte}`;
   }catch(error){if(current()&&token===row.token)pre.textContent='Source unavailable: '+error.message;}finally{if(current())controls();}
  };
  remove.onclick=()=>{row.token++;rows=rows.filter(r=>r!==row);container.remove();for(const [i,r] of rows.entries())r.container.querySelector('legend').textContent=`Participant ${i+1}`;controls();};controls();
 }
 async function load(append=false){loading=true;controls();try{await adapter.loadClipboard(append);if(!current())return;entries=adapter.clipboard;for(const row of rows)choices(row);status.textContent=entries.some(e=>e.available)?'Choose captured sources below. Source text and clipboard entries remain unchanged.':'Capture committed text with Copy source reference first.';}catch(error){if(current())status.textContent=error.message;}finally{loading=false;if(current())controls();}}
 add.onclick=addRow;more.onclick=()=>void load(true);close.onclick=()=>dialog.close();
 create.onclick=async()=>{
  if(busy||loading||rows.some(r=>!r.quote))return;busy=true;controls();
  try{await adapter.createCapturedAssertion({label:label.value,description:description.value,participants:rows.map(r=>({role:r.role.value,source:r.source,quote:r.quote})),properties:{scope:scope.value,attribution:attribution.value,certainty:certainty.value,negated:negated.checked}});if(!current())return;success=true;notify('Proposed assertion recorded.');dialog.close();}
  catch(error){if(current())status.textContent=error.message+(adapter.assertions.pending?' Close this review and use Retry assertion operation to reconcile the same frozen claim.':'');}
  finally{busy=false;if(current())controls();}
 };
 dialog.addEventListener('close',()=>{for(const r of rows)r.token++;dialog.remove();confirmed(success);},{once:true});document.body.append(dialog);dialog.showModal();addRow();addRow();void load();return dialog;
}
