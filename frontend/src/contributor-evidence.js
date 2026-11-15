/**
 * # Hypergraph PX — Recorded publication evidence inspection
 *
 * Page through already loaded publisher records and inspect their exact protected
 * snapshots in read-only dialogs.
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
 * Used by: Annotations and provenance panels, through runtime contributor
 * inspection.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 *
 * Boundary: Recorded publishers are not necessarily original text authors. Late
 * results are discarded after the dialog/context changes or workspace locks.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/contributor-evidence.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

/** Create a DOM element with optional textContent so evidence strings are not interpreted as markup. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 return e;};

/** Render an identity byte array as a stable hexadecimal comparison key. */
const key=id=>id.map(/* Encode one identity byte as two hexadecimal digits. */ n=>n.toString(16).padStart(2,'0')).join('');

/** Open bounded read-only evidence paging for one selected recorded principal. */
export function openContributorEvidence(adapter,documentId,principal,publications,currentContext){
 const facts=structuredClone(publications.filter(/* Select only publication facts attributed to the requested principal identity. */ p=>key(p.principal)===key(principal))),dialog=node('dialog'),heading=node('h2','Recorded publication evidence'),status=node('p'),list=node('div'),actions=node('div'),newer=node('button','Newer evidence'),older=node('button','Older evidence'),close=node('button','Close evidence');

 dialog.className='function-dialog';heading.id='contributor-evidence-title';dialog.setAttribute('aria-labelledby',heading.id);status.setAttribute('role','status');actions.className='dialog-actions';actions.append(newer,older,close);
 dialog.append(heading,node('p','These retained events identify a publisher, not necessarily an original text author. This list contains only the publication evidence already loaded in Users.'),status,list,actions);

 let page=0,request=0;


 /** Check that this dialog still belongs to an unlocked, current document context. */
 const current=()=>dialog.isConnected&&dialog.open&&currentContext()&&adapter.lifecycle==='unlocked';


 /** Load one exact publication snapshot and ignore stale or malformed responses. */
 async function inspect(entry){const token=++request;

  try{const result=await adapter.snapshot(documentId,entry.snapshot);

   if(!current()||token!==request)return;

   if(typeof result.text!=='string')throw Error('Invalid publication snapshot');

   const popup=node('dialog');

   popup.className='function-dialog';

   const pre=node('pre',result.text);

   pre.className='source-preview';

   const close=node('button','Close snapshot');

   close.onclick=/* Close the read-only snapshot dialog on explicit user action. */ ()=>popup.close();popup.addEventListener('close',/* Remove the closed snapshot dialog from the document. */ ()=>popup.remove(),{once:true});popup.append(node('h2','Publication snapshot · read only'),pre,close);document.body.append(popup);popup.showModal();}catch(error){if(current()&&token===request)status.textContent='Publication snapshot unavailable: '+error.message;}}


 /** Render the current eight-record evidence page and update navigation bounds. */
 function paint(){request++;list.replaceChildren();

  const slice=facts.slice(page*8,page*8+8);

  status.textContent=`${facts.length} loaded publication records · evidence page ${page+1}`;

  for(const [i,entry] of slice.entries()){const row=node('article');

   row.className='card';row.append(node('p',`Recorded publisher · publication ${page*8+i+1}`),node('p','Revision '+key(entry.revision).slice(0,12)));

   const inspectButton=node('button','Inspect publication snapshot');

   inspectButton.onclick=/* Inspect the exact retained snapshot represented by this evidence row. */ ()=>void inspect(entry);row.append(inspectButton);list.append(row);}

  newer.disabled=page===0;older.disabled=(page+1)*8>=facts.length;}


 newer.onclick=/* Move to the previous loaded evidence page and repaint its controls. */ ()=>{page--;paint();};older.onclick=/* Move to the next loaded evidence page and repaint its controls. */ ()=>{page++;paint();};close.onclick=/* Close publication evidence without mutating any workspace state. */ ()=>dialog.close();dialog.addEventListener('close',/* Invalidate pending snapshot reads and remove the closed evidence dialog. */ ()=>{request++;dialog.remove();},{once:true});document.body.append(dialog);dialog.showModal();paint();
}
