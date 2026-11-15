/**
 * # Hypergraph PX — Reviewed independent synthesis composition
 *
 * Review ordered immutable input captures and edit an independent owned-text
 * output before explicitly publishing synthesis provenance.
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
 * Used by: Annotations and provenance operations through the application's
 * independent Merge action.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Provenance and history contract][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: This is cross-identity synthesis, not same-node parent Merge. Captured
 * inputs and review output remain separate; copied wording establishes neither
 * source authorship nor agreement/proof.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/merge-composer.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/provenance-model.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

import {EditorState,Compartment} from '@codemirror/state';
import {EditorView,keymap} from '@codemirror/view';
import {history,historyKeymap,defaultKeymap} from '@codemirror/commands';
import {ownedSource,ownedSourceExtension} from './owned-source.js';

/** Create a safe text-based element for synthesis review controls. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 return e;};

/** Render opaque capture identities as stable selection keys. */
const key=id=>id.map(/* Encode one identity byte as two hexadecimal digits. */ n=>n.toString(16).padStart(2,'0')).join('');

/** Open an owned-output review for two to eight exact captured synthesis inputs. */
export function openMergeComposer(adapter,notify,confirmed,finished){
 const dialog=node('dialog');

 dialog.className='function-dialog merge-composer';

 const heading=node('h2','Merge into a new document');

 heading.id='merge-composer-title';dialog.setAttribute('aria-labelledby',heading.id);


 const name=node('input'),sources=node('div'),editorHost=node('div'),status=node('p'),actions=node('div'),more=node('button','More captured inputs'),add=node('button','Add merge input'),publish=node('button','Publish reviewed synthesis'),close=node('button','Cancel');

 name.maxLength=512;name.setAttribute('aria-label','Merged document name');

 const label=node('label','Merged document name');

 label.append(name);editorHost.className='merge-review-editor';status.setAttribute('role','alert');actions.className='dialog-actions';actions.append(publish,close);publish.className='primary-action';
 dialog.append(heading,node('p','Review 2–8 pinned source ranges, then write and review your synthesis. Publication creates a new independent document and retains every input. Input selection does not establish original sentence authorship or prove agreement.'),label,sources,add,more,node('h3','Reviewed output'),node('p','Local review until publication. Closing discards this unpublished review.'),editorHost,status,actions);


 const editing=new Compartment();

 let busy=false,loading=true,rows=[],entries=[];/* Require the synthesis dialog to remain open and its workspace unlocked. */

 const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';


 document.body.append(dialog);dialog.showModal();


 const editor=new EditorView({parent:editorHost,state:EditorState.create({doc:'',extensions:[ownedSourceExtension(''),history(),keymap.of([...defaultKeymap,...historyKeymap]),EditorView.lineWrapping,EditorView.contentAttributes.of({'aria-label':'Reviewed merge output'}),editing.of([])]})});


 /** Gate source/output controls during loading, unresolved publication or missing reviewed inputs. */
 function controls(){for(const e of dialog.querySelectorAll('button,input,select'))e.disabled=busy||loading;

  add.disabled=busy||loading||rows.length>=8;publish.disabled=busy||loading||rows.length<2||rows.some(/* Detect an input whose exact retained quote has not yet been loaded. */ r=>r.quote===null)||!!adapter.mergePending;more.hidden=adapter.privateClipboard.next===null;dialog.oncancel=busy?/* Prevent cancellation while original synthesis publication is in flight. */ e=>e.preventDefault():null;editor.dispatch({effects:editing.reconfigure(busy?[EditorState.readOnly.of(true),EditorView.editable.of(false)]:[])});}


 /** Rebuild one row's captured-input choices while retaining its explicit selection. */
 function choices(row){const v=row.select.value;

  row.select.replaceChildren(node('option','Choose captured input'));row.select.firstChild.value='';

  for(const e of entries){if(!e.available)continue;

   const option=node('option',(adapter.docs.get(key(e.source.document))?.title??'Retained document')+' · '+[...e.preview].slice(0,50).join(''));

   option.value=key(e.id);row.select.append(option);}

  row.select.value=v;}


 /** Append an ordered source-review row with its own stale-read token and removal action. */
 function addRow(){const box=node('fieldset'),legend=node('legend'),select=node('select'),pre=node('pre','Choose an exact committed capture.'),context=node('p'),remove=node('button','Remove merge input');

  pre.className='source-preview';select.setAttribute('aria-label','Captured merge input');box.append(legend,select,context,pre,remove);sources.append(box);

  const row={box,select,quote:null,source:null,token:0};

  rows.push(row);choices(row);number();
  select.onchange=/* Resolve the row's selected immutable capture and discard obsolete or removed-row responses. */ async()=>{const token=++row.token;

   row.quote=row.source=null;context.textContent='';pre.textContent='Loading exact historical input…';controls();

   const selected=entries.find(/* Match the exact capture identity selected in this row. */ e=>key(e.id)===select.value);

   if(!selected){pre.textContent='Choose an exact committed capture.';

    return;}

   try{const s=structuredClone(selected.source),{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=s,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});

    if(!current()||token!==row.token||!rows.includes(row))return;

    if(typeof result.text!=='string')throw Error('Invalid exact input');

    row.source=s;row.quote=result.text;pre.textContent=result.text;context.textContent=`Historical snapshot ${key(snapshot).slice(0,12)} · bytes ${start_byte}–${end_byte}`;}catch(error){if(current()&&token===row.token)pre.textContent='Input unavailable: '+error.message;}finally{if(current())controls();}};
  remove.onclick=/* Remove this input row and invalidate any pending source response for it. */ ()=>{row.token++;rows=rows.filter(/* Keep every synthesis row other than the explicitly removed row. */ r=>r!==row);box.remove();number();controls();};controls();
 }


 /** Update input legends to show the exact current order of synthesis participants. */
 function number(){rows.forEach(/* Number one ordered synthesis input row for the review surface. */ (r,i)=>{r.box.querySelector('legend').textContent=`Merge input ${i+1}`;});}


 /** Load available captured sources and refresh every row's choices without changing retained source text. */
 async function load(append=false){loading=true;controls();

  try{await adapter.loadClipboard(append);

   if(!current())return;

   entries=adapter.clipboard;rows.forEach(choices);status.textContent=entries.some(/* Detect whether at least one captured input is currently available. */ e=>e.available)?'Choose and review the ordered inputs.':'Capture committed text with Copy source reference first.';}catch(error){if(current())status.textContent=error.message;}finally{loading=false;

   if(current())controls();}}


 add.onclick=addRow;more.onclick=/* Append additional captured source choices. */ ()=>void load(true);close.onclick=/* Cancel the unpublished synthesis review. */ ()=>dialog.close();
 publish.onclick=/* Publish the exact owned output with ordered frozen input quotes and report uncertain original-operation recovery. */ async()=>{if(busy||loading)return;

  busy=true;controls();

  try{const record=await adapter.mergeSources({title:name.value.trim(),text:editor.state.field(ownedSource),inputs:rows.map(/* Copy one reviewed input binding and quote into the ordered synthesis command. */ r=>({source:r.source,quote:r.quote,expected_draft:null}))});

   if(!current())return;

   dialog.close();confirmed(record);}catch(error){if(current())status.textContent=error.message+(adapter.mergePending?' Close review and use Retry merge to reconcile the original publication.':'');}finally{busy=false;

   if(current())controls();

   finished();}};
 dialog.addEventListener('close',/* Invalidate source reads, destroy the owned review editor and notify completion when the dialog closes. */ ()=>{rows.forEach(/* Invalidate one row's outstanding exact-source request. */ r=>r.token++);editor.destroy();dialog.remove();finished();},{once:true});addRow();addRow();void load();
}
