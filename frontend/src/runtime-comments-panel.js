/**
 * # Hypergraph PX — Retrospective comment browsing and composition
 *
 * Display pinned committed-passage comments and compose a new exact-source comment
 * with a separate owned review buffer.
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
 * Used by: Annotations and provenance panels through the application Comments view.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [Exact text and anchors][spec-3]
 *
 * Boundary: Comments are retrospective records excluded from text snapshots.
 * Closing review discards its unpublished local body; uncertain publication
 * remains an original operation to reconcile, not a new submission.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-comments-panel.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

import {EditorState,Compartment} from '@codemirror/state';
import {EditorView,keymap} from '@codemirror/view';
import {history,historyKeymap,defaultKeymap} from '@codemirror/commands';
import {ownedSource,ownedSourceExtension} from './owned-source.js';

/** Create safe text-based DOM elements for comment content and labels. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 return e;};

/** Render opaque identities as stable hexadecimal comparison/display keys. */
const key=id=>id.map(/* Encode one identity byte as two hexadecimal digits. */ n=>n.toString(16).padStart(2,'0')).join('');

/** Create the scoped retained-comment panel and its refresh, inspection and retry controls. */
export function renderComments(parent,adapter,id,notify){
 const panel=node('div'),status=node('p','Loading comments…'),list=node('div'),actions=node('div'),add=node('button','Comment on a captured passage'),refresh=node('button','Refresh comments'),more=node('button','Older comments'),retry=node('button','Retry comment publication');

 actions.className='dialog-actions comment-actions';actions.append(refresh,more,retry);status.setAttribute('role','status');panel.append(node('p','Retrospective comments on exact committed passages. Text snapshots exclude comments; earlier passages remain inspectable after edits.'),add,status,list,actions);parent.append(panel);


 let entries=[],snapshot=null,next=null,busy=false,inspection=0;/* Require the panel to remain mounted in an unlocked workspace. */

 const current=()=>parent.contains(panel)&&adapter.lifecycle==='unlocked';


 /** Gate paging and publication controls while requests or an uncertain comment operation are pending. */
 function controls(){refresh.disabled=more.disabled=retry.disabled=busy;more.hidden=next===null;retry.hidden=!adapter.comments.pending;add.disabled=busy||!!adapter.comments.pending;}


 /** Resolve a comment's exact historical passage and discard superseded inspection responses. */
 async function inspect(entry){const token=++inspection;

  try{const s=entry.source,result=await adapter.request('anchor/resolve',{document:s.document,snapshot:s.snapshot,revision:s.revision,occurrence_path:s.occurrence_path,start_byte:s.start_byte,end_byte:s.end_byte});

   if(!current()||token!==inspection)return;

   if(typeof result.text!=='string')throw Error('Invalid retained passage response');

   const dialog=node('dialog');

   dialog.className='function-dialog';

   const heading=node('h2','Comment passage · read only');

   heading.id='comment-passage-title';dialog.setAttribute('aria-labelledby',heading.id);

   const pre=node('pre',result.text),close=node('button','Close passage');

   pre.className='source-preview';close.onclick=/* Close the read-only historical-passage dialog. */ ()=>dialog.close();dialog.addEventListener('close',/* Remove the closed historical-passage dialog node. */ ()=>dialog.remove(),{once:true});dialog.append(heading,node('p','Exact historical passage. The comment is a separate retrospective annotation.'),pre,close);document.body.append(dialog);dialog.showModal();}catch(error){if(current()&&token===inspection)notify(error.message);}}


 /** Repaint retained comment cards without interpreting comment bodies as HTML. */
 function paint(){list.replaceChildren();

  for(const entry of entries){const card=node('article');

   card.className='card comment-card';

   const body=node('pre',entry.body),show=node('button','Inspect comment passage');

   body.className='comment-body';show.onclick=/* Inspect the exact source passage attached to this retained comment. */ ()=>void inspect(entry);card.append(node('h3',`Comment ${entry.ordinal} · retrospective`),node('p','Recorded commenter '+key(entry.actor).slice(0,12)),node('p','Historical snapshot '+key(entry.source.snapshot).slice(0,12)),body,show);list.append(card);}

  status.textContent=entries.length?`${entries.length} loaded comments${next===null?' · beginning of retained comment history reached':''}.`:'No retained comments in this document.';}


 /** Refresh or append a snapshot-pinned comment page while rejecting repeated revision identities. */
 async function load(append=false){if(busy||!current())return;

  busy=true;inspection++;controls();status.textContent='Loading retrospective comments…';

  try{if(!append)snapshot=adapter.get(id).runtime.snapshot;

   const page=await adapter.commentPage(id,snapshot,append?next:null);

   if(!current())return;

   const combined=append?[...entries,...page.entries]:page.entries,seen=new Set();

   for(const r of combined){const k=key(r.revision);

    if(seen.has(k))throw Error('Repeated comment page');

    seen.add(k);}

   entries=combined;next=page.next;paint();}catch(error){if(current())status.textContent='Comments unavailable: '+error.message;}finally{if(current()){busy=false;controls();}}}


 add.onclick=/* Open comment composition and refresh this panel after the review finishes. */ ()=>openCommentComposer(adapter,id,notify,/* Reload comments only if the originating panel is still current. */ ()=>{if(current())void load();});refresh.onclick=/* Refresh retained comments from a newly captured document snapshot. */ ()=>void load();more.onclick=/* Load the next older comment page within the captured snapshot scope. */ ()=>void load(true);retry.onclick=/* Reconcile the original pending comment operation and then refresh visible evidence. */ async()=>{busy=true;controls();

  try{await adapter.retryComment();notify('Original comment publication confirmed.');}catch(error){if(current())notify(error.message);}finally{busy=false;

   if(current())void load();}};controls();void load();
}

/** Open an independent owned-text review editor for a selected captured committed passage. */
export function openCommentComposer(adapter,id,notify,finished){
 const documentId=adapter.get(id).runtime.document,dialog=node('dialog'),heading=node('h2','Comment on a committed passage'),select=node('select'),label=node('label','Captured comment passage'),pre=node('pre','Choose a retained committed passage.'),host=node('div'),status=node('p'),more=node('button','More captured passages'),publish=node('button','Publish comment'),close=node('button','Cancel'),actions=node('div');

 dialog.className='function-dialog comment-composer';heading.id='comment-composer-title';dialog.setAttribute('aria-labelledby',heading.id);select.setAttribute('aria-label','Captured comment passage');label.append(select);pre.className='source-preview';host.className='comment-review-editor';status.setAttribute('role','alert');actions.className='dialog-actions';publish.className='primary-action';actions.append(publish,close);dialog.append(heading,node('p','Choose a protected capture from this document and review its exact historical passage. The immutable comment is separate from the text snapshot. Closing discards the unpublished review.'),label,more,pre,node('h3','Comment text'),host,status,actions);document.body.append(dialog);dialog.showModal();


 let entries=[],source=null,quote=null,token=0,loading=true,busy=false;

 const editing=new Compartment(),current=/* Require the composer to remain open in an unlocked workspace. */ ()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';


 const editor=new EditorView({parent:host,state:EditorState.create({doc:'',extensions:[ownedSourceExtension(''),history(),keymap.of([...defaultKeymap,...historyKeymap]),EditorView.lineWrapping,EditorView.contentAttributes.of({'aria-label':'Comment text'}),editing.of([])]})});


 /** Gate source selection, publication and review editing during loading or publication. */
 function controls(){select.disabled=more.disabled=close.disabled=busy||loading;publish.disabled=busy||loading||source===null||!!adapter.comments.pending;more.hidden=adapter.privateClipboard.next===null;dialog.oncancel=busy?/* Prevent cancellation while the original publication attempt is in flight. */ e=>e.preventDefault():null;editor.dispatch({effects:editing.reconfigure(busy?[EditorState.readOnly.of(true),EditorView.editable.of(false)]:[])});}


 /** Load available clipboard passages belonging to the selected document only. */
 async function load(append=false){loading=true;controls();

  try{await adapter.loadClipboard(append);

   if(!current())return;

   entries=adapter.clipboard.filter(/* Keep only available captured passages from this exact document identity. */ e=>e.available&&key(e.source.document)===key(documentId));

   const selected=select.value;

   select.replaceChildren(node('option','Choose captured passage'));select.firstChild.value='';

   for(const e of entries){const option=node('option',e.preview);

    option.value=key(e.id);select.append(option);}

   select.value=selected;status.textContent=entries.length?'Review the passage, then write your comment.':'Use Copy source reference on committed text in this document first.';}catch(error){if(current())status.textContent=error.message;}finally{loading=false;

   if(current())controls();}}


 select.onchange=/* Resolve the chosen retained passage with a request token before allowing comment publication. */ async()=>{const active=++token;

  source=quote=null;pre.textContent='Loading exact historical passage…';controls();

  const selected=entries.find(/* Match the selected captured-passage identity. */ e=>key(e.id)===select.value);

  if(!selected){pre.textContent='Choose a retained committed passage.';

   return;}

  try{const s=structuredClone(selected.source),result=await adapter.request('anchor/resolve',{document:s.document,snapshot:s.snapshot,revision:s.revision,occurrence_path:s.occurrence_path,start_byte:s.start_byte,end_byte:s.end_byte});

   if(!current()||active!==token)return;

   if(typeof result.text!=='string'||!result.text.isWellFormed()||new TextEncoder().encode(result.text).length!==s.end_byte-s.start_byte)throw Error('Invalid exact comment passage');

   source=s;quote=result.text;pre.textContent=result.text;}catch(error){if(current()&&active===token)pre.textContent='Passage unavailable: '+error.message;}finally{if(current())controls();}};
 more.onclick=/* Append more captured passages to the source chooser. */ ()=>void load(true);close.onclick=/* Cancel the unpublished comment review. */ ()=>dialog.close();publish.onclick=/* Publish the captured passage and exact owned comment body, retaining uncertainty for explicit retry. */ async()=>{if(busy||loading||source===null)return;

  busy=true;controls();

  try{await adapter.createComment({source,quote,body:editor.state.field(ownedSource)});

   if(current()){notify('Comment published against the retained passage.');dialog.close();}}catch(error){if(current())status.textContent=error.message+(adapter.comments.pending?' Close review and use Retry comment publication to reconcile the original operation.':'');}finally{busy=false;

   if(current())controls();

   finished();}};
 dialog.addEventListener('close',/* Invalidate outstanding source reads, destroy the review editor and notify the caller on close. */ ()=>{token++;editor.destroy();dialog.remove();finished();},{once:true});void load();
}
