// SPDX-License-Identifier: AGPL-3.0-only
/**
 * # Hypergraph PX — Read-only original-branch integrity inspection
 *
 * Present an explicitly bounded integrity check of a document's saved
 * original-branch records and explain any stopped scope.
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
 * Used by: History, branches and graph inspection through document integrity
 * controls.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [recovery md][spec-3]
 *
 * Boundary: The operation performs no Save, Commit or repair. Named branches, full
 * history, working checkpoints, annotations and freshness detection remain outside
 * this audit's stated scope.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-audit-panel.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/08-assurance/recovery.md
 */

/** Create a safely text-populated element for integrity status and finding descriptions. */
const node=(tag,text)=>{const e=document.createElement(tag);

 if(text!==undefined)e.textContent=text;

 return e;};

const records={document:'document metadata',head:'published head',draft:'saved working buffer',manifest:'manifest',snapshot:'closed snapshot',revision:'published revision',publication:'publication event'};

const problems={missing:'A required record is missing.',unreadable_encrypted_record:'An encrypted record could not be opened or authenticated.',unsupported_or_malformed:'A decoded record has an unsupported or malformed shape.',inconsistent:'The record does not match its required context.',budget:'The read budget was reached.'};

/** Open a read-only integrity dialog for the explicitly captured document context. */
export function openDocumentAudit(adapter,id){
 const captured=adapter.get(id),dialog=node('dialog');

 dialog.className='function-dialog';dialog.setAttribute('aria-label','Original branch integrity');


 const status=node('p','Ready to check saved data.'),details=node('p'),run=node('button','Run integrity check'),close=node('button','Close');

 status.setAttribute('role','status');details.className='caption';


 /** Require the integrity dialog to remain open and the workspace unlocked before displaying results. */
 const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';

 let token=0;


 dialog.append(node('h2','Original branch integrity'),node('p',captured.title),node('p','Checks the saved working buffer and latest publication of this document’s original branch. Running this check does not save typing or change your text.'),node('p','Named branches, retained history, working checkpoints, references, annotations and receipts are outside this check. It does not establish whether an older workspace was restored.'),status,details);


 const actions=node('div');

 actions.className='dialog-actions';actions.append(run,close);dialog.append(actions);document.body.append(dialog);dialog.showModal();
 close.onclick=/* Close the integrity inspection without writing workspace data. */ ()=>dialog.close();dialog.addEventListener('close',/* Invalidate pending audit responses and remove the closed dialog. */ ()=>{token++;dialog.remove();},{once:true});
 run.onclick=/* Run the bounded original-branch audit and distinguish complete selected scope from stopped findings. */ async()=>{
  if(!current())return;

  const request=++token;

  run.disabled=true;status.textContent='Checking saved original-branch records…';details.textContent='';


  try{
   const report=await adapter.auditDocument(id);

   if(!current()||request!==token)return;


   if(report.finding===null){status.textContent='All 8 selected records passed this check.';details.textContent='This result covers this read view and the scope above. No repair was performed.';}
   else {status.textContent=`Check incomplete · stopped at ${records[report.finding.record]}.`;details.textContent=`${problems[report.finding.problem]} Remaining dependent records were not checked. No repair was performed.`;}
  }catch(error){if(current()&&request===token){status.textContent='Integrity check unavailable.';details.textContent=error.message;}}
  finally{if(current()&&request===token)run.disabled=false;}
 };
}
