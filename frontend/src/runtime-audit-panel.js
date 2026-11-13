// SPDX-License-Identifier: AGPL-3.0-only
/** Explicit, read-only original-branch audit; never invokes Save, Commit or repair. */
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const records={document:'document metadata',head:'published head',draft:'saved working buffer',manifest:'manifest',snapshot:'closed snapshot',revision:'published revision',publication:'publication event'};
const problems={missing:'A required record is missing.',unreadable_encrypted_record:'An encrypted record could not be opened or authenticated.',unsupported_or_malformed:'A decoded record has an unsupported or malformed shape.',inconsistent:'The record does not match its required context.',budget:'The read budget was reached.'};
export function openDocumentAudit(adapter,id){
 const captured=adapter.get(id),dialog=node('dialog');dialog.className='function-dialog';dialog.setAttribute('aria-label','Original branch integrity');
 const status=node('p','Ready to check saved data.'),details=node('p'),run=node('button','Run integrity check'),close=node('button','Close');status.setAttribute('role','status');details.className='caption';
 const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';let token=0;
 dialog.append(node('h2','Original branch integrity'),node('p',captured.title),node('p','Checks the saved working buffer and latest publication of this document’s original branch. Running this check does not save typing or change your text.'),node('p','Named branches, retained history, working checkpoints, references, annotations and receipts are outside this check. It does not establish whether an older workspace was restored.'),status,details);
 const actions=node('div');actions.className='dialog-actions';actions.append(run,close);dialog.append(actions);document.body.append(dialog);dialog.showModal();
 close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{token++;dialog.remove();},{once:true});
 run.onclick=async()=>{
  if(!current())return;const request=++token;run.disabled=true;status.textContent='Checking saved original-branch records…';details.textContent='';
  try{
   const report=await adapter.auditDocument(id);if(!current()||request!==token)return;
   if(report.finding===null){status.textContent='All 8 selected records passed this check.';details.textContent='This result covers this read view and the scope above. No repair was performed.';}
   else {status.textContent=`Check incomplete · stopped at ${records[report.finding.record]}.`;details.textContent=`${problems[report.finding.problem]} Remaining dependent records were not checked. No repair was performed.`;}
  }catch(error){if(current()&&request===token){status.textContent='Integrity check unavailable.';details.textContent=error.message;}}
  finally{if(current()&&request===token)run.disabled=false;}
 };
}
