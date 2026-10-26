import {contributorColour} from './publication-contributors.js';
import {openContributorEvidence} from './contributor-evidence.js';
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const key=id=>id.map(n=>n.toString(16).padStart(2,'0')).join('');
export function renderPublicationContributors(parent,adapter,id){
 const panel=node('div'),status=node('p','Loading publication evidence…'),rows=node('div'),actions=node('div'),refresh=node('button','Refresh contributors'),more=node('button','More publication evidence');status.setAttribute('role','status');actions.className='dialog-actions contributor-actions';actions.append(refresh,more);const scope=node('details');scope.className='contributor-scope';scope.append(node('summary','About this contributor view'),node('p','Publishers from committed text history only. Original authorship, semantic reviews, comments and interaction contributions remain unindexed. This incomplete contributor view is separate from presence.'));panel.append(rows,status,actions,scope);parent.append(panel);
 let snapshot=null,next=null,busy=false,human=null,publications=new Map(),principals=new Map(),tokens=new Set();const current=()=>parent.contains(panel)&&adapter.lifecycle==='unlocked';
 function controls(){refresh.disabled=more.disabled=busy;more.hidden=next===null;}
 function row(label,kind,principal,count,pinned=false){const e=node('div'),dot=node('span',[...label][0]??'?'),text=node('div');e.className='contributor';e.dataset.principal=key(principal);dot.className='dot';dot.style.background=contributorColour(principal,human.principal);text.append(node('strong',label),node('small',kind+(pinned?' · current human':'')),node('small',count?`Recorded publisher · ${count} loaded publication${count===1?'':'s'}`:'No publication evidence loaded for this principal.'));const identity=node('details');identity.className='contributor-identity';identity.append(node('summary','Identity'),node('small',key(principal)));text.append(identity);const evidence=node('button','Inspect publication evidence');evidence.disabled=!count;evidence.onclick=()=>openContributorEvidence(adapter,id,principal,[...publications.values()],current);text.append(evidence);e.append(dot,text);return e;}
 function paint(){rows.replaceChildren();if(!human)return;rows.append(node('div','CURRENT CONTEXT','eyebrow'),row(human.label||'Local workspace owner','Human',human.principal,principals.get(key(human.principal))?.count??0,true),node('p','No current agent','caption'));
  const others=[...principals.values()].filter(p=>key(p.principal)!==key(human.principal));if(others.length)rows.append(node('div','OTHER RECORDED PUBLISHERS','eyebrow contributor-divider'));for(const p of others)rows.append(row('Principal '+key(p.principal).slice(0,12),'Principal kind not recorded',p.principal,p.count));
 }
 async function load(append=false){if(busy||!current())return;busy=true;controls();status.textContent='Loading authorized publication history…';
  try{if(!append){snapshot=adapter.get(id).runtime.snapshot;next=null;human=null;publications=new Map();principals=new Map();tokens=new Set();rows.replaceChildren();}
   const page=await adapter.publicationContributors(id,snapshot,append?next:null);if(!current())return;
   if(human&&key(human.principal)!==key(page.current_human.principal))throw Error('Current principal changed; refresh contributors');
   const incoming=new Set();for(const entry of page.publications){const revision=key(entry.revision);if(publications.has(revision)||incoming.has(revision))throw Error('Repeated publication page');incoming.add(revision);}
   const token=JSON.stringify(page.next);if(page.next!==null&&tokens.has(token))throw Error('Repeated contributor cursor');
   human=page.current_human;for(const entry of page.publications){publications.set(key(entry.revision),entry);const k=key(entry.principal),principal=principals.get(k)??{principal:entry.principal,count:0};principal.count++;principals.set(k,principal);}if(page.next!==null)tokens.add(token);next=page.next;paint();status.textContent=`${publications.size} committed publications loaded${page.complete_text_publications?' · beginning of this snapshot’s text history reached': ' · older evidence available'}. Other contribution families remain unindexed.`;
  }catch(error){if(current())status.textContent='Contributor evidence unavailable: '+error.message;}
  finally{if(current()){busy=false;controls();}}
 }
 refresh.onclick=()=>void load();more.onclick=()=>void load(true);controls();void load();
}
