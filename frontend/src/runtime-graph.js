/** Bounded read-only identity selection. No graph action dispatches an editor transaction. */
import {identityKey as key} from './document-fork-graph.js';
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
function svgNode(tag,attrs={}){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
function titleLines(title,fontFamily){
 const context=document.createElement('canvas').getContext('2d');context.font='16px '+fontFamily;
 const units=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(title)].map(s=>s.segment),first=[];
 while(units.length&&context.measureText(first.join('')+units[0]).width<=70)first.push(units.shift());
 if(!first.length&&units.length)first.push(units.shift());
 if(!units.length)return [first.join('')];
 if(context.measureText(units.join('')).width<=70)return [first.join(''),units.join('')];
 const tail=[];while(units.length&&context.measureText('…'+units.at(-1)+tail.join('')).width<=70)tail.unshift(units.pop());
 return [first.join(''),'…'+tail.join('')];
}
export function openRuntimeGraph(adapter,initial,notify,focusEditor,{assertions=false,transformations=false}={}){
 const dialog=node('dialog');dialog.className='function-dialog runtime-graph';const heading=node('h2',assertions?'Selected node graph':'Document fork graph');heading.id='runtime-graph-title';dialog.setAttribute('aria-labelledby',heading.id);
 dialog.append(heading,node('p',assertions?'Choose up to 16 document and assertion nodes. Role lines identify historical participants, not whole current documents or logical inference. Fork arrows record derivation. The default scope excludes Merge; choose the Merge relationship scope below to include recorded synthesis.':'Choose up to 16 document nodes. Lines show recorded historical forks. Semantic relationships are not available in this view.'));
 const layout=node('div'),chooser=node('fieldset'),main=node('div'),status=node('p','Choose nodes and show the graph.'),canvas=node('div'),details=node('div'),textView=node('details');layout.className='runtime-graph-layout';chooser.className='graph-chooser';main.className='graph-main';status.setAttribute('role','status');canvas.className='graph-canvas';details.className='graph-inspection';textView.append(node('summary','Nodes and recorded relationships'));const textList=node('div');textView.append(textList);
 main.tabIndex=0;main.setAttribute('role','region');main.setAttribute('aria-label','Graph and inspection');
 const mode=node('select');mode.setAttribute('aria-label','Graph relationship scope');for(const [value,text] of [['existing','Fork and assertion incidence'],['transformations','Include reviewed Merge transformations']]){const option=node('option',text);option.value=value;mode.append(option);}if(transformations){const label=node('label','Graph relationship scope');label.append(mode);dialog.append(label);}mode.onchange=()=>invalidate();
 chooser.append(node('legend','Graph nodes'));const boxes=[],selections=new Map();let generation=0;
 const current=()=>dialog.isConnected&&dialog.open&&adapter.lifecycle==='unlocked';
 const show=node('button','Show graph'),close=node('button','Close'),actions=node('div');actions.className='dialog-actions';actions.append(show,close);main.append(status,canvas,details,textView);layout.append(chooser,main);dialog.append(layout,actions);
 function invalidate(){generation++;canvas.replaceChildren();details.replaceChildren();textList.replaceChildren();status.textContent='Selection changed. Show graph to refresh.';show.disabled=false;}
 function checkbox(labelText,value,selection,checked=false){const label=node('label'),input=node('input');input.type='checkbox';input.setAttribute('aria-label',labelText);input.value=value;input.checked=checked;label.append(input,node('span',labelText));chooser.append(label);boxes.push(input);selections.set(input,selection);input.onchange=invalidate;return input;}
 for(const [index,d] of [...adapter.docs.values()].entries())checkbox(`${d.title} · node ${index+1}`,d.id,{kind:'document',document:adapter.get(d.id).runtime.document},d.id===initial);
 if(assertions){
  chooser.append(node('h3','Retained assertions'));const label=node('label','Assertions from document'),scope=node('select');label.className='graph-assertion-scope';scope.setAttribute('aria-label','Assertions from document');for(const d of adapter.docs.values()){const option=node('option',d.title);option.value=d.id;scope.append(option);}scope.value=initial;label.append(scope);chooser.append(label);
  const load=node('button','Load retained assertions'),more=node('button','More assertion choices');more.hidden=true;chooser.append(load,more);const cursors=new Map(),loaded=new Map();let loading=0;
  scope.onchange=()=>{loading++;load.disabled=more.disabled=false;more.hidden=cursors.get(scope.value)?.next==null;invalidate();};
  async function choices(append){
   const selected=scope.value,cursor=append?cursors.get(selected):null,token=++loading;invalidate();load.disabled=more.disabled=true;status.textContent='Loading retained assertion choices…';
   try{
    const page=await adapter.assertionPage(selected,cursor?.generation??null,cursor?.next??0);if(!current()||loading!==token)return;
    if(cursor&&JSON.stringify(cursor.snapshot)!==JSON.stringify(page.snapshot))throw Error('Source snapshot changed; reload assertions');
    for(const entry of page.entries){const id=key(entry.record.node),text=`${entry.definition.definition.label} · ${entry.record.status} · assertion ${loaded.size+1}`;
     if(!loaded.has(id))loaded.set(id,checkbox(text,'assertion:'+id,{kind:'assertion',node:entry.record.node}));
    }
    cursors.set(selected,{generation:page.generation,next:page.next,snapshot:page.snapshot});status.textContent='Choose assertion nodes, then show the graph. Retained claims may refer to earlier text snapshots.';
   }catch(error){if(current()&&loading===token)status.textContent='Assertion choices unavailable: '+error.message;}
   finally{if(current()&&loading===token){load.disabled=more.disabled=false;more.hidden=cursors.get(selected)?.next==null;}}
  }
  load.onclick=()=>void choices(false);more.onclick=()=>void choices(true);
 }
 function dismiss(){generation++;dialog.close();dialog.remove();focusEditor();}close.onclick=dismiss;dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss();});
 function preview(title,text){if(typeof text!=='string')throw Error('Invalid exact source response');const popup=node('dialog');popup.className='function-dialog';const pre=node('pre',text);pre.className='source-preview';const close=node('button','Close source');close.onclick=()=>popup.close();popup.addEventListener('close',()=>popup.remove(),{once:true});popup.append(node('h2',title),pre,close);document.body.append(popup);popup.showModal();}
 function sourceButton(label,source,title){const button=node('button',label);button.onclick=async()=>{const token=generation;try{const {document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte}=source,result=await adapter.request('anchor/resolve',{document:documentId,snapshot,revision,occurrence_path,start_byte,end_byte});if(current()&&generation===token)preview(title,result.text);}catch(error){if(current()&&generation===token)notify(error.message);}};return button;}
 function inspectNode(n){
  details.replaceChildren(node('h3',n.title));
  if(n.kind==='assertion'){const entry=n.assertion;details.append(node('p',`${entry.record.status} · owner judgement, not a checked proof.`),node('p','Separate retrospective assertion revision. Its participant ranges are not the whole current document.'),node('p',entry.definition.definition.description),...(n.qualifiers??[]).map(text=>node('p',text)));for(const [index,p] of entry.record.participants.entries())details.append(sourceButton(`Inspect ${p.role} participant ${index+1}`,p.source,'Graph assertion participant · read only'));return;}
  details.append(node('p','Document node · committed snapshot captured for this graph.'));const inspect=node('button','Inspect committed snapshot');inspect.onclick=async()=>{const token=generation;try{const result=await adapter.snapshot(key(n.document),n.snapshot);if(current()&&generation===token)preview('Committed node snapshot',result.text);}catch(error){if(current()&&generation===token)notify(error.message);}};details.append(inspect);
 }
 function inspectEdge(edge,nodes){
  if(edge.kind==='merge'){const event=edge.event;details.replaceChildren(node('h3','Recorded reviewed Merge'),node('p','One synthesis transformation with ordered pinned inputs and an independent initial output. Original sentence authorship is unknown; this is not proof or same-identity ancestry.'));for(const [i,input] of event.inputs.entries())details.append(sourceButton(`Inspect Merge input ${i+1}`,input,'Graph Merge input · read only'));details.append(sourceButton('Inspect initial Merge output',event.outputs[0],'Graph initial Merge output · read only'));return;}

  if(edge.kind==='participant'){const claim=nodes.get(key(edge.assertion));details.replaceChildren(node('h3',`Participant role: ${edge.role}`),node('p',`${claim.title} · ${claim.assertion.record.status} · retrospective assertion`),node('p','This role binds an exact historical range. It does not assert a new binary fact between every participant.'));details.append(sourceButton('Inspect exact participant source',edge.source,'Graph assertion participant · read only'));return;}
  const input=edge.inputs[0],output=edge.outputs[0];details.replaceChildren(node('h3','Recorded Fork'),node('p',`${nodes.get(key(input.node)).title} → ${nodes.get(key(output.node)).title}`),node('p','The input and initial output are pinned historical versions. This record does not assert original authorship or checked logical proof.'));details.append(sourceButton('Inspect exact fork source',input,'Graph fork source · read only'));
 }
 function paint(graph){
  canvas.replaceChildren();details.replaceChildren();textList.replaceChildren();const nodes=new Map(graph.nodes.map(n=>[key(n.node),n])),positions=new Map(),semantic=graph.projection!=='document_forks';
  const svg=svgNode('svg',{viewBox:'0 0 960 620',role:'group','aria-label':semantic?'Selected nodes and role-labelled assertion incidence':'Selected document nodes and recorded fork relationships'}),defs=svgNode('defs'),marker=svgNode('marker',{id:'fork-direction',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.append(svgNode('path',{d:'M 0 0 L 10 5 L 0 10 z'}));defs.append(marker);svg.append(defs);
  graph.nodes.forEach((n,i)=>{const angle=-Math.PI/2+2*Math.PI*i/graph.nodes.length;positions.set(key(n.node),graph.nodes.length===1?{x:480,y:310}:{x:480+350*Math.cos(angle),y:310+225*Math.sin(angle)});});
  const parallel=new Map();
  for(const edge of graph.edges){
   if(edge.kind==='merge')continue;
   const participant=edge.kind==='participant',from=participant?edge.source.node:edge.inputs[0].node,to=participant?edge.assertion:edge.outputs[0].node,pair=key(from)+key(to);parallel.set(pair,(parallel.get(pair)??0)+1);
  }
  for(const [index,edge] of graph.edges.entries()){
   if(edge.kind!=='merge')continue;const event=edge.event,output=event.outputs[0],end=positions.get(key(output.node)),visible=event.inputs.map((source,i)=>({source,i,p:positions.get(key(source.node))})).filter(x=>x.p),average=visible.length?{x:visible.reduce((sum,x)=>sum+x.p.x,0)/visible.length,y:visible.reduce((sum,x)=>sum+x.p.y,0)/visible.length}:{x:end.x-180,y:end.y},center={x:Math.max(80,Math.min(880,(average.x+end.x)/2+((index%3)-1)*28)),y:Math.max(100,Math.min(520,(average.y+end.y)/2+36))};
   const g=svgNode('g',{'class':'graph-transformation',tabindex:0,role:'button','aria-label':`Inspect reviewed Merge with ${event.inputs.length} ordered inputs`});
   for(const {p,i} of visible){const dx=center.x-p.x,dy=center.y-p.y,len=Math.hypot(dx,dy)||1,mid={x:(p.x+center.x)/2-dy/len*(i-(event.inputs.length-1)/2)*32,y:(p.y+center.y)/2+dx/len*(i-(event.inputs.length-1)/2)*32};g.append(svgNode('path',{d:`M${p.x+dx/len*44},${p.y+dy/len*44} Q${mid.x},${mid.y} ${center.x},${center.y}`,'class':'graph-merge-input','data-index':i}));const label=svgNode('text',{x:mid.x,y:mid.y-8,'text-anchor':'middle'});label.textContent=`input ${i+1}`;g.append(label);}
   const dx=end.x-center.x,dy=end.y-center.y,len=Math.hypot(dx,dy)||1;g.append(svgNode('path',{d:`M${center.x},${center.y} L${end.x-dx/len*46},${end.y-dy/len*46}`,'marker-end':'url(#fork-direction)','class':'graph-merge-output'}),svgNode('circle',{cx:center.x,cy:center.y,r:16}));const label=svgNode('text',{x:center.x,y:center.y+34,'text-anchor':'middle'});label.textContent='Merge';g.append(label);g.onclick=()=>inspectEdge(edge,nodes);g.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();inspectEdge(edge,nodes);}};svg.append(g);const button=node('button',`Reviewed Merge · ${event.inputs.length} ordered inputs → ${nodes.get(key(output.node)).title}`);button.onclick=()=>inspectEdge(edge,nodes);textList.append(button);
  }
  const visits=new Map();
  for(const edge of graph.edges){
   if(edge.kind==='merge')continue;
   const participant=edge.kind==='participant',from=participant?edge.source.node:edge.inputs[0].node,to=participant?edge.assertion:edge.outputs[0].node,pair=key(from)+key(to),visit=visits.get(pair)??0;visits.set(pair,visit+1);
   const a=positions.get(key(from)),b=positions.get(key(to)),dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),start={x:a.x+dx/length*44,y:a.y+dy/length*44},end={x:b.x-dx/length*47,y:b.y-dy/length*47},offset=(visit-(parallel.get(pair)-1)/2)*Math.min(160,320/Math.max(1,parallel.get(pair)-1)),mid={x:(start.x+end.x)/2-dy/length*offset,y:(start.y+end.y)/2+dx/length*offset};
   const description=participant?`${edge.role} participant ${edge.index+1}: ${nodes.get(key(from)).title} in ${nodes.get(key(to)).title}`:`Recorded Fork: ${nodes.get(key(from)).title} to ${nodes.get(key(to)).title}`;
   const labelPoint={x:(start.x+2*mid.x+end.x)/4,y:(start.y+2*mid.y+end.y)/4},labelY=Math.max(24,Math.min(596,labelPoint.y-8+(participant?(visit%3-1)*24:0)));
   const g=svgNode('g',{'class':'graph-edge','data-kind':participant?'participant':'fork',tabindex:0,role:'button','aria-label':description}),path=svgNode('path',{d:`M${start.x},${start.y} Q${mid.x},${mid.y} ${end.x},${end.y}`}),label=svgNode('text',{x:Math.max(100,Math.min(860,labelPoint.x)),y:labelY,'text-anchor':'middle'});if(!participant)path.setAttribute('marker-end','url(#fork-direction)');label.textContent=participant?[...edge.role].slice(0,12).join(''):'forked into';g.append(path);if(participant){g.append(svgNode('path',{d:`M${labelPoint.x},${labelPoint.y} L${labelPoint.x},${labelY+3}`,'class':'graph-edge-leader'}));}g.append(label);g.onclick=()=>inspectEdge(edge,nodes);g.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();inspectEdge(edge,nodes);}};svg.append(g);const button=node('button',description);button.onclick=()=>inspectEdge(edge,nodes);textList.append(button);
  }
  for(const [index,n] of graph.nodes.entries()){
   const p=positions.get(key(n.node)),g=svgNode('g',{'class':'graph-node','data-kind':n.kind??'document',tabindex:0,role:'button','aria-label':`Inspect node ${index+1}: ${n.title}`}),circle=svgNode('circle',{cx:p.x,cy:p.y,r:42}),label=svgNode('text',{x:p.x,y:p.y-3,'text-anchor':'middle'});for(const [j,line] of titleLines(n.title,getComputedStyle(dialog).fontFamily).entries()){const span=svgNode('tspan',{x:p.x,dy:j?16:0});span.textContent=line;label.append(span);}g.append(circle,label);if(n.kind==='assertion'){const state=svgNode('text',{x:p.x,y:p.y+64,'text-anchor':'middle','class':'graph-assertion-status'});state.textContent=n.assertion.record.status+' assertion';g.append(state);}g.onclick=()=>inspectNode(n);g.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();inspectNode(n);}};svg.append(g);const button=node('button',`Node ${index+1}: ${n.title}${n.kind==='assertion'?' · '+n.assertion.record.status:''}`);button.onclick=()=>inspectNode(n);textList.append(button);
  }
  canvas.append(svg);status.textContent=`${graph.nodes.length} selected nodes · ${graph.edges.length} ${graph.projection==='transformation_incidence'?'recorded transformation/role groups':semantic?'visible role/Fork connections':'recorded forks'}. Connections to unselected nodes are outside this view.`;const outside=semantic?graph.outside_selection:graph.inputs_outside_selection;if(outside)status.append(document.createTextNode(` ${outside} supported incidences have endpoints outside the selection.`));
 }
 show.onclick=async()=>{
  const selected=boxes.filter(b=>b.checked),token=++generation;show.disabled=true;canvas.replaceChildren();details.replaceChildren();textList.replaceChildren();status.textContent='Loading selected node graph…';
  try{const typed=selected.map(b=>selections.get(b)),graph=mode.value==='transformations'?await adapter.transformationGraph(typed):typed.some(s=>s.kind==='assertion')?await adapter.overlayGraph(typed):await adapter.documentGraph(selected.map(b=>b.value));if(current()&&generation===token)paint(graph);}catch(error){if(current()&&generation===token)status.textContent='Graph unavailable: '+error.message;}finally{if(current()&&generation===token)show.disabled=false;}
 };
 document.body.append(dialog);dialog.showModal();
}
