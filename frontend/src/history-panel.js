/**
 * # Hypergraph PX — Read-only committed history browsing
 *
 * Pages committed revisions and opens exact historical snapshots or comparisons
 * without changing the active editor source.
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
 * Used by: History, branches and graph inspection — application history panel.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: Draft saves add no historical entries. Async inspections are discarded
 * after lock, detachment or a newer inspection; comparisons capture the latest
 * Commit when opened.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/history-panel.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

/** Build DOM elements using textContent so historical text is never interpreted as markup. */
const node=(tag,text)=>{const element=document.createElement(tag);

 if(text)element.textContent=text;

 return element;};

/** Mount a bounded history browser whose controls page a stable snapshot and inspect committed text. */
export function renderHistory(container,adapter,id,notify){
 const panel=node('div'),status=node('p','Loading committed history…'),list=node('div'),actions=node('div');

 actions.className='dialog-actions';


 const newer=node('button','Newer'),older=node('button','Older'),refresh=node('button','Refresh');


 panel.append(node('p','Committed revisions only. Draft saves do not add history. Refresh to include later commits.'),status,list,actions);actions.append(newer,older,refresh);container.append(panel);


 let cursors=[],index=-1,busy=false,inspection=0,sourceSnapshot;


 /** Permit responses only while this panel remains attached and the workspace unlocked. */
 const current=()=>container.contains(panel)&&adapter.lifecycle==='unlocked';


 /** Disable paging during requests and when no adjacent cursor exists. */
 function controls(){newer.disabled=busy||index<=0;older.disabled=busy||!cursors[index+1];refresh.disabled=busy;}


 /** Fetch and display one exact historical snapshot while rejecting superseded inspections. */
 async function showSnapshot(entry){
  const token=++inspection,valid=/* Ignore snapshot responses once a newer inspection or workspace lock invalidates them. */ ()=>current()&&token===inspection;


  try{
   const snapshot=await adapter.snapshot(id,entry.snapshot);

   if(!valid())return;


   if(typeof snapshot.text!=='string')throw Error('Invalid snapshot response');


   const dialog=node('dialog');

   dialog.className='function-dialog';


   const heading=node('h2','Historical snapshot · read only');

   heading.id='history-snapshot-title';dialog.setAttribute('aria-labelledby',heading.id);dialog.append(heading,node('pre',snapshot.text));dialog.querySelector('pre').className='source-preview';


   const actions=node('div'),download=node('button','Download snapshot'),close=node('button','Close');

   actions.className='dialog-actions';
   download.onclick=/* Download the already inspected snapshot without creating an editor transaction. */ ()=>{const url=URL.createObjectURL(new Blob([snapshot.text],{type:'text/markdown;charset=utf-8'})),link=node('a');

    link.href=url;link.download='hypergraph-historical-snapshot.md';link.click();setTimeout(/* Release the temporary download URL after the browser has had time to use it. */ ()=>URL.revokeObjectURL(url),1000);};
   close.onclick=/* Close the historical snapshot dialog. */ ()=>dialog.close();dialog.addEventListener('close',/* Remove the closed snapshot dialog and its retained text from the DOM. */ ()=>dialog.remove(),{once:true});actions.append(download,close);dialog.append(actions);document.body.append(dialog);dialog.showModal();
  }catch(error){if(valid())notify(error.message);}
 }


 /** Compare the selected snapshot with the latest committed snapshot captured at opening. */
 async function compareSnapshot(entry){
  const token=++inspection,valid=/* Reject comparison results after another inspection or lifecycle change. */ ()=>current()&&token===inspection;


  try{
   const head=await adapter.history(id,null,1);

   if(!valid())return;


   const latest=head.entries[0];


   const [historical,committed]=await Promise.all([adapter.snapshot(id,entry.snapshot),adapter.snapshot(id,latest.snapshot)]);

   if(!valid())return;


   if(typeof historical.text!=='string'||typeof committed.text!=='string')throw Error('Invalid snapshot comparison response');


   const dialog=node('dialog');

   dialog.className='function-dialog snapshot-comparison';


   const heading=node('h2','Compare committed snapshots');

   heading.id='snapshot-comparison-title';dialog.setAttribute('aria-labelledby',heading.id);


   const description=node('p','The latest committed version was captured when this comparison opened. Uncommitted draft edits are excluded.');


   const summary=node('p',historical.text===committed.text?'These snapshots contain exactly the same bytes.':'These snapshots differ.');

   summary.setAttribute('role','status');


   const columns=node('div');

   columns.className='snapshot-comparison-columns';


   for(const [label,text] of [['Selected historical snapshot',historical.text],['Latest committed snapshot',committed.text]]){
    const section=node('section'),title=node('h3',label),size=node('p',`${new TextEncoder().encode(text).length} UTF-8 bytes`),pre=node('pre',text);

    pre.className='source-preview';pre.setAttribute('aria-label',label);section.append(title,size,pre);columns.append(section);
   }


   const actions=node('div'),close=node('button','Close');

   actions.className='dialog-actions';close.onclick=/* Close the read-only comparison dialog. */ ()=>dialog.close();dialog.addEventListener('close',/* Remove the comparison dialog after close. */ ()=>dialog.remove(),{once:true});actions.append(close);
   dialog.append(heading,description,summary,columns,actions);document.body.append(dialog);dialog.showModal();
  }catch(error){if(valid())notify('Comparison unavailable: '+error.message);}
 }


 /** Fetch one bounded history page, retain its snapshot cursor and recover controls on failure. */
 async function load(cursor,target,reset=false){
  if(busy||!current())return;

  inspection++;busy=true;controls();status.textContent='Loading committed history…';


  try{
   const page=await adapter.history(id,cursor,12,reset?undefined:sourceSnapshot);

   if(!current())return;


   if(reset)cursors=[];


   if(page.snapshot)sourceSnapshot=page.snapshot;


   cursors[target]=page.cursor??page.entries[0].revision;cursors[target+1]=page.next;index=target;
   list.replaceChildren();


   for(const entry of page.entries){
    const row=node('article'),button=node('button','View snapshot'),description=node('p',`${entry.parent===null?'Initial publication':'Committed revision'} · ${entry.text_bytes} UTF-8 bytes`);


    row.className='card';button.onclick=/* Inspect this row’s committed snapshot. */ ()=>void showSnapshot(entry);

    const compare=node('button','Compare with latest committed');

    compare.onclick=/* Compare this row with the latest committed revision. */ ()=>void compareSnapshot(entry);row.append(description,button,compare);list.append(row);
   }


   status.textContent=`History page ${index+1}${page.next===null?' · beginning of history':''}`;
  }catch(error){if(current())status.textContent='History unavailable: '+error.message;}
  finally{busy=false;controls();}
 }


 newer.onclick=/* Move to the previously visited newer history page. */ ()=>void load(cursors[index-1],index-1);
 older.onclick=/* Follow the next cursor toward older committed history. */ ()=>void load(cursors[index+1],index+1);
 refresh.onclick=/* Refresh from the current committed head and reset the paging snapshot. */ ()=>void load(null,0,true);
 controls();void load(null,0,true);
}
