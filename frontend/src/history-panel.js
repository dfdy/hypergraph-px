/** Bounded read-only local publication history; no editor source transactions. */
const node=(tag,text)=>{const element=document.createElement(tag);if(text)element.textContent=text;return element;};
export function renderHistory(container,adapter,id,notify){
 const panel=node('div'),status=node('p','Loading committed history…'),list=node('div'),actions=node('div');actions.className='dialog-actions';
 const newer=node('button','Newer'),older=node('button','Older'),refresh=node('button','Refresh');
 panel.append(node('p','Committed revisions only. Draft saves do not add history. Refresh to include later commits.'),status,list,actions);actions.append(newer,older,refresh);container.append(panel);
 let cursors=[],index=-1,busy=false;
 const current=()=>container.contains(panel)&&adapter.lifecycle==='unlocked';
 function controls(){newer.disabled=busy||index<=0;older.disabled=busy||!cursors[index+1];refresh.disabled=busy;}
 async function showSnapshot(entry){
  try{
   const snapshot=await adapter.snapshot(id,entry.snapshot);if(!current())return;
   if(typeof snapshot.text!=='string')throw Error('Invalid snapshot response');
   const dialog=node('dialog');dialog.className='function-dialog';
   dialog.append(node('h2','Historical snapshot · read only'),node('pre',snapshot.text));dialog.querySelector('pre').className='source-preview';
   const actions=node('div'),download=node('button','Download snapshot'),close=node('button','Close');actions.className='dialog-actions';
   download.onclick=()=>{const url=URL.createObjectURL(new Blob([snapshot.text],{type:'text/markdown;charset=utf-8'})),link=node('a');link.href=url;link.download='hypergraph-historical-snapshot.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
   close.onclick=()=>{dialog.close();dialog.remove();};actions.append(download,close);dialog.append(actions);document.body.append(dialog);dialog.showModal();
  }catch(error){if(current())notify(error.message);}
 }
 async function compareSnapshot(entry){
  try{
   const head=await adapter.history(id,null,1);if(!current())return;
   const latest=head.entries[0];
   const [historical,committed]=await Promise.all([adapter.snapshot(id,entry.snapshot),adapter.snapshot(id,latest.snapshot)]);if(!current())return;
   if(typeof historical.text!=='string'||typeof committed.text!=='string')throw Error('Invalid snapshot comparison response');
   const dialog=node('dialog');dialog.className='function-dialog snapshot-comparison';
   const heading=node('h2','Compare committed snapshots');heading.id='snapshot-comparison-title';dialog.setAttribute('aria-labelledby',heading.id);
   const description=node('p','The latest committed version was captured when this comparison opened. Uncommitted draft edits are excluded.');
   const summary=node('p',historical.text===committed.text?'These snapshots contain exactly the same bytes.':'These snapshots differ.');summary.setAttribute('role','status');
   const columns=node('div');columns.className='snapshot-comparison-columns';
   for(const [label,text] of [['Selected historical snapshot',historical.text],['Latest committed snapshot',committed.text]]){
    const section=node('section'),title=node('h3',label),size=node('p',`${new TextEncoder().encode(text).length} UTF-8 bytes`),pre=node('pre',text);pre.className='source-preview';pre.setAttribute('aria-label',label);section.append(title,size,pre);columns.append(section);
   }
   const actions=node('div'),close=node('button','Close');actions.className='dialog-actions';close.onclick=()=>{dialog.close();dialog.remove();};actions.append(close);
   dialog.append(heading,description,summary,columns,actions);document.body.append(dialog);dialog.showModal();
  }catch(error){if(current())notify('Comparison unavailable: '+error.message);}
 }
 async function load(cursor,target,reset=false){
  if(busy||!current())return;busy=true;controls();status.textContent='Loading committed history…';
  try{
   const page=await adapter.history(id,cursor);if(!current())return;
   if(reset)cursors=[];
   cursors[target]=page.entries[0].revision;cursors[target+1]=page.next;index=target;
   list.replaceChildren();
   for(const entry of page.entries){
    const row=node('article'),button=node('button','View snapshot'),description=node('p',`${entry.parent===null?'Initial publication':'Committed revision'} · ${entry.text_bytes} UTF-8 bytes`);
    row.className='card';button.onclick=()=>void showSnapshot(entry);const compare=node('button','Compare with latest committed');compare.onclick=()=>void compareSnapshot(entry);row.append(description,button,compare);list.append(row);
   }
   status.textContent=`History page ${index+1}${page.next===null?' · beginning of history':''}`;
  }catch(error){if(current())status.textContent='History unavailable: '+error.message;}
  finally{busy=false;controls();}
 }
 newer.onclick=()=>void load(cursors[index-1],index-1);
 older.onclick=()=>void load(cursors[index+1],index+1);
 refresh.onclick=()=>void load(null,0,true);
 controls();void load(null,0,true);
}
