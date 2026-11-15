/**
 * # Hypergraph PX — Role-labelled captured assertion composition
 *
 * Review exact protected source captures and their explicit participant roles
 * before recording a proposed retrospective claim.
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
 * Used by: Annotations and provenance operations through captured-source assertion
 * declaration controls.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Assertions and predicate semantics][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: This creates a declaration separate from text snapshots. Repeated
 * roles are explicit incidences; matching wording does not unify predicate
 * identities or prove the claim.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/assertion-composer.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

/** Create a safe text-based DOM element for assertion review. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 return e;};

/** Render capture identity bytes as stable selection keys. */
const key=id=>id.map(/* Encode one identity byte as two hexadecimal digits. */ n=>n.toString(16).padStart(2,'0')).join('');

/** Open the role-labelled assertion review with bounded exact captured participants and claim properties. */
export function openAssertionComposer(adapter,notify,confirmed){
 const dialog=node('dialog');

 dialog.className='function-dialog assertion-composer';

 const title=node('h2','Declare a role-labelled assertion');

 title.id='assertion-composer-title';dialog.setAttribute('aria-labelledby',title.id);


 const form=node('form'),label=node('input'),description=node('input'),scope=node('input'),attribution=node('input'),certainty=node('select'),negated=node('input'),sources=node('div'),status=node('p'),actions=node('div');

 form.onsubmit=/* Prevent native form submission from bypassing explicit assertion publication. */ e=>e.preventDefault();status.setAttribute('role','alert');actions.className='dialog-actions';


 /** Associate an accessible visible label with one assertion-review control. */
 const field=(text,control)=>{const l=node('label',text);

  control.setAttribute('aria-label',text);l.append(control);

  return l;};

 label.maxLength=160;description.maxLength=8192;scope.maxLength=500;attribution.maxLength=200;


 for(const value of ['unspecified','possible','probable','certain']){const o=node('option',value);

  o.value=value;certainty.append(o);}

 negated.type='checkbox';


 const more=node('button','Load more captured sources'),add=node('button','Add participant'),create=node('button','Propose assertion'),close=node('button','Cancel');

 for(const b of [more,add,create,close])b.type='button';

 create.className='primary-action';
 form.append(field('Assertion name',label),field('Meaning and interpretation',description),field('Scope or premises',scope),field('Attributed to',attribution),field('Certainty',certainty),field('Negated claim',negated),sources,add,more,status,actions);actions.append(create,close);
 dialog.append(title,node('p','Review 2–8 exact captured sources and name each participant role. Repeated roles are allowed. This creates one proposed retrospective claim, separate from text snapshots. Same wording does not unify separately declared predicates. Acceptance is not a checked proof.'),form);


 let entries=[],rows=[],busy=false,loading=true,success=false;/* Require the review dialog to remain open and the workspace unlocked. */

 const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';


 /** Gate declaration controls during loading, missing quotes or unresolved publication. */
 function controls(){for(const e of form.querySelectorAll('input,select,button'))e.disabled=busy||loading;

  add.disabled=busy||loading||rows.length>=8;create.disabled=busy||loading||rows.length<2||rows.some(/* Detect a participant whose exact historical quote has not been reviewed. */ r=>!r.quote)||!!adapter.assertions.pending;more.hidden=adapter.privateClipboard.next===null;dialog.oncancel=busy?/* Prevent closing the dialog during an original assertion-publication attempt. */ e=>e.preventDefault():null;}


 /** Refresh a participant row's available capture choices while preserving its explicit selection. */
 function choices(row){const value=row.select.value;

  row.select.replaceChildren(node('option','Choose captured source'));row.select.firstChild.value='';

  for(const entry of entries){if(!entry.available)continue;

   const name=adapter.docs.get(key(entry.source.document))?.title??'Retained document',option=node('option',`${name} · ${[...entry.preview].slice(0,45).join('')}`);

   option.value=key(entry.id);row.select.append(option);}

  row.select.value=value;}


 /** Add a role/source review row with a separate token for exact historical-source loading. */
 function addRow(){
  const container=node('fieldset'),legend=node('legend',`Participant ${rows.length+1}`),select=node('select'),role=node('input'),pre=node('pre','Choose a source to inspect its exact historical text.'),context=node('p'),remove=node('button','Remove participant');

  remove.type='button';pre.className='source-preview';role.maxLength=64;container.append(legend,field('Captured source',select),field('Participant role',role),context,pre,remove);sources.append(container);


  const row={container,select,role,quote:null,source:null,token:0};

  rows.push(row);choices(row);
  select.onchange=/* Resolve one selected source capture and discard stale or removed-row results. */ async()=>{const token=++row.token;

   row.quote=row.source=null;context.textContent='';pre.textContent='Loading exact historical source…';controls();

   const entry=entries.find(/* Match the capture identity selected by this participant row. */ e=>key(e.id)===select.value);

   if(!entry){pre.textContent='Choose a captured source.';

    return;}


   try{const s=structuredClone(entry.source),{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=s,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});

    if(!current()||token!==row.token||!rows.includes(row))return;

    if(typeof result.text!=='string')throw Error('Invalid source response');

    row.source=s;row.quote=result.text;pre.textContent=result.text;context.textContent=`Historical snapshot ${key(snapshot).slice(0,12)} · bytes ${start_byte}–${end_byte}`;
   }catch(error){if(current()&&token===row.token)pre.textContent='Source unavailable: '+error.message;}finally{if(current())controls();}
  };
  remove.onclick=/* Remove the participant, invalidate its source read and renumber remaining roles. */ ()=>{row.token++;rows=rows.filter(/* Keep participant rows other than the one explicitly removed. */ r=>r!==row);container.remove();

   for(const [i,r] of rows.entries())r.container.querySelector('legend').textContent=`Participant ${i+1}`;

   controls();};controls();
 }


 /** Load more available private captures without changing their retained source evidence. */
 async function load(append=false){loading=true;controls();

  try{await adapter.loadClipboard(append);

   if(!current())return;

   entries=adapter.clipboard;

   for(const row of rows)choices(row);

   status.textContent=entries.some(/* Detect whether any captured source is available for assertion composition. */ e=>e.available)?'Choose captured sources below. Source text and clipboard entries remain unchanged.':'Capture committed text with Copy source reference first.';}catch(error){if(current())status.textContent=error.message;}finally{loading=false;

   if(current())controls();}}


 add.onclick=addRow;more.onclick=/* Append further captured-source choices. */ ()=>void load(true);close.onclick=/* Cancel the unpublished declaration review. */ ()=>dialog.close();
 create.onclick=/* Publish the reviewed explicit roles, exact quotes and claim properties as one proposed assertion. */ async()=>{
  if(busy||loading||rows.some(/* Prevent publication when any participant lacks an exact reviewed quote. */ r=>!r.quote))return;

  busy=true;controls();


  try{await adapter.createCapturedAssertion({label:label.value,description:description.value,participants:rows.map(/* Copy one reviewed participant role/source/quote into the captured assertion intent. */ r=>({role:r.role.value,source:r.source,quote:r.quote})),properties:{scope:scope.value,attribution:attribution.value,certainty:certainty.value,negated:negated.checked}});

   if(!current())return;

   success=true;notify('Proposed assertion recorded.');dialog.close();}
  catch(error){if(current())status.textContent=error.message+(adapter.assertions.pending?' Close this review and use Retry assertion operation to reconcile the same frozen claim.':'');}
  finally{busy=false;

   if(current())controls();}
 };
 dialog.addEventListener('close',/* Invalidate pending participant reads, remove the review and report whether publication succeeded. */ ()=>{for(const r of rows)r.token++;

  dialog.remove();confirmed(success);},{once:true});document.body.append(dialog);dialog.showModal();addRow();addRow();void load();

 return dialog;
}
