import {editorStructureGuides} from './structure-guides.js';
import {assertionPropertyLabels} from './assertion-properties.js';
import {sentenceProvenanceField,addSentenceProvenance,seedSentenceProvenance,sentenceUnits,containedProvenanceUnits,provenancePair,provenanceLabel} from './sentence-provenance.js';
import {sentenceProvenanceMarkers,onInspectSentenceProvenance} from './sentence-provenance-view.js';
import {relationshipContext} from './relationship-details.js';
import {openRelationshipDialog} from './relationship-dialog.js';
import {relationshipType,relationshipCategory,relationshipTags} from './relationship-catalog.js';
import {createOutlineTree,headingAt} from './outline-tree.js';
import {relationshipField,seedRelationships,addRelationship,removeRelationship,selectedRelationshipPair,relationshipsAtCaret} from './relationships.js';
import {relationshipMarkers,onInspectRelationship} from './relationship-markers.js';
import {documentPresentation,presentationLineClasses} from './document-presentation.js';
import {sourceSelectionStyle} from './source-selection.js';
import {installColumnWidths} from './column-widths.js';
import {syntaxTree} from '@codemirror/language';
import {installFunctionsBar} from './functions-bar.js';
import {renderMinimap,bindMinimap} from './minimap.js';
import {installTooltips} from './tooltips.js';
import {EditorState} from '@codemirror/state';
import {EditorView,keymap,drawSelection,Decoration,ViewPlugin} from '@codemirror/view';
import {history,historyKeymap,defaultKeymap,undo,redo,indentWithTab} from '@codemirror/commands';
import {markdown,markdownKeymap,markdownLanguage} from '@codemirror/lang-markdown';
import {formattingState,blockStyleState,inlinePlan,blockPlan} from './formatting.js';
import {FixtureAdapter} from './adapter.js';
import {documents,contributors} from './fixtures.js';
import {authorshipField,authorshipHistory,currentAuthor,currentAgent,getAuthorAt} from './authorship.js';
import {mathRendering,setMathRendered,onMathContext} from './math-view.js';
import {tableRendering,onTableContext} from './table-view.js';
import {documentHeadings,markdownHeadingLink} from './context-actions.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let navigatorVisible=true,navigatorSide='right';
const localForks=[];let functionsBar,columnWidths,inspectedRelationship=null,inspectedProvenance=null,relationshipEdits=false;
const adapter=new FixtureAdapter(documents),states=new Map(),comments=new Map(),reviews=new Map(),expanded=new Set([documents[0].id]);let active=documents[0].id,view,checkpointTimer,toastTimer,selectedClip=null,pinned=null,interaction='Agent',investigation='Relationships',lens='Workspace',mapFrame;
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
function notify(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4000);}
function title(){return adapter.get(active).title;}
let treeNavigationMode='caret',allTreeClosed=false,treeFrame=null,treeReason='scroll',treeForce=false,lastFollowTarget=null;
const outlineTree=createOutlineTree({onNavigate:(id,from)=>{if(id!==active){openDocument(id);requestAnimationFrame(()=>jump(from));}else jump(from);},onToggle:()=>{allTreeClosed=false;updateTreeControls();}});
function updateTreeControls(){const button=$('#toggleAllTree');button.textContent=allTreeClosed?'Open all':'Close all';button.setAttribute('aria-pressed',String(allTreeClosed));}
function scheduleTreeFollow(reason='scroll',force=false){
 if(!view||!$('#followTree').checked)return;
 if(reason==='caret'||treeFrame===null)treeReason=reason;treeForce=treeForce||force;
 if(treeFrame!==null)return;
 treeFrame=requestAnimationFrame(()=>{
  treeFrame=null;const forced=treeForce;treeForce=false;if(!$('#followTree').checked||!['Workspace','Document'].includes(lens))return;
  const headings=documentHeadings(view.state.doc.toString());let position=view.state.selection.main.head;
  if(treeReason==='scroll'){const box=view.scrollDOM.getBoundingClientRect(),content=view.contentDOM.getBoundingClientRect();position=view.posAtCoords({x:Math.max(box.left+10,content.left+35),y:box.top+12},false)??position;}
  const heading=headingAt(headings,position),target=active+'\0'+(heading?.anchor??'');outlineTree.setCurrent(active,heading);
  if(heading&&(forced||target!==lastFollowTarget)){
   expanded.add(active);outlineTree.expandPath(active,headings,heading);allTreeClosed=false;updateTreeControls();renderNavigation();
  }
  const button=heading?[...$('#navigation').querySelectorAll('.heading-open')].find(button=>button.dataset.document===active&&Number(button.dataset.headingFrom)===heading.from):null;
  if(button?.getClientRects().length){const viewport=$('#navigation').getBoundingClientRect(),row=button.getBoundingClientRect();if(row.top<viewport.top||row.bottom>viewport.bottom)$('#navigation').scrollTop+=row.top<viewport.top?row.top-viewport.top-4:row.bottom-viewport.bottom+4;}
  lastFollowTarget=target;outlineTree.mark($('#navigation'));
 });
}

function selectionContext(){const s=view.state.selection.main;return {document:active,title:title(),sequence:adapter.get(active).sequence,from:s.from,to:s.to,anchor:s.anchor,head:s.head,text:view.state.sliceDoc(s.from,s.to)};}
function sourceDecorations(v){const model=documentPresentation(v.state),ranges=[];for(const from of new Set([...model.headings.keys(),...model.gaps]))ranges.push(Decoration.line({class:presentationLineClasses(model,from)}).range(from));for(const marker of model.markers)ranges.push(Decoration.mark({class:'cm-source-marker'}).range(marker.from,marker.to));return Decoration.set(ranges,true);}
const headingStyle=ViewPlugin.fromClass(class{constructor(v){this.decorations=sourceDecorations(v)}update(u){if(u.docChanged||syntaxTree(u.startState)!==syntaxTree(u.state))this.decorations=sourceDecorations(u.view)}},{decorations:v=>v.decorations});
function makeState(d){const text=d.source,split=text.indexOf('## Working with evidence');const spans=d.attribution??(split>=0?[{from:0,to:split,author:currentAuthor},{from:split,to:text.length,author:currentAgent}]:[]);return EditorState.create({doc:text,extensions:[markdown({base:markdownLanguage}),history(),drawSelection(),keymap.of([...markdownKeymap,...defaultKeymap,...historyKeymap,indentWithTab,{key:'Mod-b',run:()=>wrap('**')},{key:'Mod-i',run:()=>wrap('*')}]),authorshipField.init(()=>spans),authorshipHistory,mathRendering,tableRendering,relationshipField.init(state=>d.fixtureFork?{records:[],serial:0}:seedRelationships(state)),relationshipMarkers,sentenceProvenanceField.init(state=>d.id===documents[0].id?seedSentenceProvenance(state,d):[]),sentenceProvenanceMarkers,editorStructureGuides,headingStyle,EditorView.lineWrapping,EditorView.contentAttributes.of({'aria-label':'Markdown document editor',spellcheck:'false'}),EditorView.mouseSelectionStyle.of(sourceSelectionStyle),EditorView.updateListener.of(update)]});}
function update(u){if(u.transactions.some(tr=>tr.effects.some(effect=>effect.is(addRelationship)||effect.is(removeRelationship))))relationshipEdits=true;const relationsChanged=u.startState.field(relationshipField)!==u.state.field(relationshipField);const provenanceChanged=u.startState.field(sentenceProvenanceField)!==u.state.field(sentenceProvenanceField);if(u.selectionSet){inspectedRelationship=null;inspectedProvenance=null;}if(u.docChanged){const id=active;adapter.edit(id,u.state.doc.toString());renderNavigation();renderClipboard();updateStatus();clearTimeout(checkpointTimer);checkpointTimer=setTimeout(async()=>{await adapter.checkpoint(id);if(active===id){updateStatus();if(interaction==='Comments')renderInteraction();}},5000);}
 if(u.selectionSet||u.docChanged){treeNavigationMode='caret';scheduleTreeFollow('caret');updatePosition();if(!pinned||investigation==='Relationships')renderInvestigation();$('#capture').disabled=view.state.selection.main.empty;functionsBar?.update(selectionContext());}
 if(u.selectionSet||u.docChanged||syntaxTree(u.startState)!==syntaxTree(u.state))updateBlockStyle();
 if(relationsChanged||provenanceChanged){renderInvestigation();scheduleMap();}
 if(u.docChanged||u.geometryChanged||u.viewportChanged)scheduleMap();}
function updateStatus(){const d=adapter.get(active);$('#draftStatus').textContent=d.sequence>d.acknowledged?'Modified · tab only':d.sequence?'Checkpoint simulated · tab only':'Synthetic fixture · tab only';}
const wordCounts=new WeakMap(),workspaceWordCounts=new Map(),wordSegmenter=new Intl.Segmenter(undefined,{granularity:'word'});
function countWords(text){let count=0;for(const segment of wordSegmenter.segment(text))if(segment.isWordLike)count++;return count;}
function updatePosition(){
 const doc=view.state.doc;
 let count=wordCounts.get(doc);if(count===undefined){count=countWords(doc.toString());wordCounts.set(doc,count);}
 workspaceWordCounts.set(active,{sequence:adapter.get(active).sequence,count});
 let total=0;
 for(const record of adapter.docs.values()){let cached=workspaceWordCounts.get(record.id);if(!cached||cached.sequence!==record.sequence){cached={sequence:record.sequence,count:countWords(record.source)};workspaceWordCounts.set(record.id,cached);}total+=cached.count;}
 const number=node('strong',count.toLocaleString());number.id='wordCount';
 const workspace=node('strong',total.toLocaleString());workspace.id='workspaceWordCount';
 $('#position').replaceChildren(document.createTextNode('Document '),number,document.createTextNode(' words · Workspace '),workspace,document.createTextNode(' words'));
}
function applyPresentation(){view.dispatch({effects:setMathRendered.of($('#mathMode').value==='rendered')});}
function openDocument(id){if(id===active)return;expanded.add(id);clearTimeout(checkpointTimer);states.set(active,{state:view.state,scroll:view.scrollDOM.scrollTop});active=id;inspectedRelationship=null;inspectedProvenance=null;const cached=states.get(id);view.setState(cached?.state||makeState(adapter.get(id)));applyPresentation();requestAnimationFrame(()=>{view.scrollDOM.scrollTop=cached?.scroll||0;scheduleMap();treeNavigationMode='scroll';scheduleTreeFollow('scroll',true);});refreshAll();}
function refreshAll(){$('#documentTitle').textContent=title();const chapterIndex=documents.findIndex(d=>d.id===active);$('#previous').disabled=chapterIndex<=0;$('#next').disabled=chapterIndex<0||chapterIndex===documents.length-1;$('#capture').disabled=view.state.selection.main.empty;renderNavigation();renderInteraction();renderInvestigation();renderClipboard();updateStatus();updatePosition();updateBlockStyle();functionsBar?.update(selectionContext());scheduleMap();}
function jump(pos){view.dispatch({selection:{anchor:pos},effects:EditorView.scrollIntoView(pos,{y:'start',yMargin:25})});view.focus();}
function outline(parent,id=active){parent.append(outlineTree.render(id,documentHeadings(adapter.get(id).source)));}
function appendDocumentRow(nav,d){const row=node('div',undefined,`chapter ${d.id===active?'active':''}`);row.dataset.document=d.id;const toggle=node('button',expanded.has(d.id)?'▾':'▸','chapter-toggle');toggle.setAttribute('aria-label',`${expanded.has(d.id)?'Collapse':'Expand'} ${d.title} headings`);toggle.setAttribute('aria-expanded',String(expanded.has(d.id)));toggle.setAttribute('aria-controls',`outline-${d.id}`);toggle.onclick=()=>{expanded.has(d.id)?expanded.delete(d.id):expanded.add(d.id);allTreeClosed=false;updateTreeControls();renderNavigation();document.querySelector(`.chapter[data-document="${d.id}"] .chapter-toggle`).focus();};const open=node('button',d.title,'chapter-open');open.onclick=()=>openDocument(d.id);row.append(toggle,open);nav.append(row);if(expanded.has(d.id))outline(nav,d.id);}
function renderNavigation(){
 const nav=$('#navigation');nav.replaceChildren();
 if(lens==='Workspace'){for(const d of [...documents,...localForks])appendDocumentRow(nav,d);}
 else if(lens==='Document'){appendDocumentRow(nav,adapter.get(active));}
 else{nav.append(node('div',lens==='Graph'?'Relationships in this fixture':'History in this fixture','collection-title'));const card=node('div',undefined,'card');card.append(node('h3',lens==='Graph'?'No canonical graph connected':'No durable history connected'),node('p','This preview supports local document interaction. Authoritative graph traversal, snapshots and history require Rust application services.'));nav.append(card);}
 outlineTree.mark(nav);
}

function scheduleMap(){cancelAnimationFrame(mapFrame);mapFrame=requestAnimationFrame(updateMap);}
function updateMap(){if(view)renderMinimap(view,$('#mapTrack'),$('#mapText'),$('#mapViewport'));}
function wrap(mark){view.dispatch({...inlinePlan(view.state,mark==='**'?'bold':'italic'),userEvent:'input.format'});view.focus();return true;}
function toggleBlock(type){view.dispatch({...blockPlan(view.state,type),userEvent:'input.format'});view.focus();}
function capture(){try{const s=view.state.selection.main;const e=adapter.capture(active,s.from,s.to);e.provenanceUnits=containedProvenanceUnits(view.state,e.from,e.to);e.sentenceUnits=sentenceUnits(view.state).filter(unit=>unit.from>=e.from&&unit.to<=e.to).map(unit=>({...unit}));selectedClip=e.id;renderClipboard();notify('Captured a tab-only source selection. No graph promotion or commit.');}catch(e){notify(e.message);}}
function paste(clear=false,all=false){
 try{
  const ids=all?adapter.clipboard.map(e=>e.id===selectedClip?selectedClip:e.id):[selectedClip||adapter.clipboard[0]?.id],plan=adapter.forkPlan(ids),selection=view.state.selection.main,destination=adapter.get(active),beforeSequence=destination.sequence;
  const transaction=view.state.update({changes:{from:selection.from,to:selection.to,insert:plan.text},selection:{anchor:selection.from+plan.text.length},userEvent:'input.paste'});
  view.dispatch(transaction);const records=[];let offset=selection.from;
  for(const entry of plan.entries){
   const currentSource=adapter.get(entry.document),known=entry.document===active?entry.sequence===beforeSequence:entry.sequence===currentSource.sequence;
   for(const [index,capturedUnit] of (entry.provenanceUnits??(entry.sentenceUnits??[]).map(anchor=>({anchor,unitKind:'sentence'}))).entries()){const {anchor:unit,unitKind}=capturedUnit;
    const anchor=known&&entry.document===active?{...unit,from:transaction.changes.mapPos(unit.from,1),to:transaction.changes.mapPos(unit.to,-1)}:{...unit};
    const pair=provenancePair({eventId:`${plan.id}:${entry.id}:${index}`,kind:'fork',unitKind,source:{document:entry.document,title:entry.title,sequence:entry.sequence,anchor,capturedAnchor:unit},target:{document:active,title:destination.title,sequence:adapter.get(active).sequence,anchor:{from:offset+unit.from-entry.from,to:offset+unit.to-entry.from,text:unit.text}}});
    // Captured historical sources still identify the origin, but cannot fabricate a live source icon.
    if(known)records.push(pair[0]);records.push(pair[1]);
   }
   offset+=entry.text.length+2;
  }
  publishProvenance(records);adapter.finishFork(plan,clear);renderClipboard();renderInvestigation();notify('Independent text pasted from captured source · simulation, no graph publication.');view.focus();
 }catch(error){notify(error.message);}
}

function renderClipboard(){const list=$('#clipboardItems');list.replaceChildren();for(const e of adapter.clipboard){const chip=node('div',undefined,`clip-chip ${e.id===selectedClip?'selected':''}`),b=node('button',e.text.slice(0,65));b.title=`${e.title} · local sequence ${e.sequence} · UTF-16 ${e.from}–${e.to}`;b.onclick=()=>{selectedClip=e.id;renderClipboard();};const remove=node('button','×');remove.setAttribute('aria-label',`Remove clipboard entry from ${e.title}`);remove.onclick=()=>{adapter.remove(e.id);if(selectedClip===e.id)selectedClip=null;renderClipboard();};chip.append(b,remove);list.append(chip);}if(!adapter.clipboard.length)list.append(node('span','Select text to capture its source.','empty-inline'));$('#paste').disabled=!adapter.clipboard.length;$('#clearClipboard').disabled=!adapter.clipboard.length;}
function renderInteraction(){const p=$('#interactionBody');p.replaceChildren();if(interaction==='Users'){p.append(node('div','CURRENT CONTEXT · SYNTHETIC','eyebrow'));for(const [i,c] of (adapter.get(active).fixtureFork?contributors.filter(c=>c.pinned):contributors).entries()){if(i===2)p.append(node('div','OTHER DOCUMENT CONTRIBUTORS','eyebrow contributor-divider'));const row=node('div',undefined,'contributor'),dot=node('span',c.name[0],'dot');dot.style.background=c.color;const text=node('div');text.append(node('strong',c.name),node('small',c.role));row.append(dot,text);p.append(row);}p.append(node('p','Contributor display is separate from presence. None of these identities is an authenticated account.','caption'));return;}
 if(interaction==='Comments'){for(const [name,text] of [['Local Writer','Could this paragraph distinguish a claim from the evidence supporting it?'],['Avery Example','Consider comparing a second interpretation before accepting this connection.']]){const c=node('article',undefined,'card');c.append(node('span','Synthetic annotation','tag'),node('h3',name),node('p',text));p.append(c);}for(const comment of comments.get(active)||[]){const card=node('article',undefined,'card'),stale=comment.context.sequence!==adapter.get(active).sequence;card.append(node('span','Local comment · simulation','tag'),node('h3','Local Writer'),node('p',comment.text));if(comment.context.text){card.append(node('p',stale?'Source changed — anchor needs review.':'Captured selection · exact local sequence'));const passage=node('blockquote',comment.context.text);card.append(passage);const go=node('button','Show captured passage');go.disabled=stale;go.onclick=()=>{if(comment.context.sequence!==adapter.get(active).sequence){notify('Source changed — this comment anchor needs review.');renderInteraction();return;}view.dispatch({selection:{anchor:comment.context.from,head:comment.context.to},effects:EditorView.scrollIntoView(comment.context.from,{y:'center'})});view.focus();};card.append(go);}p.append(card);}const form=node('div',undefined,'agent-input'),input=node('textarea');input.placeholder='Add a local test comment…';input.setAttribute('aria-label','Local test comment');const add=node('button','Add test comment');add.onclick=()=>{if(!input.value.trim())return;const list=comments.get(active)||[];list.push({text:input.value.trim(),context:selectionContext()});comments.set(active,list);renderInteraction();notify('Comment added in this tab only.');};form.append(input,add);p.append(form,node('p','Synthetic examples and local test comments only. Reload clears comments; durable anchoring is unavailable.','caption'));return;}
 const msg=node('div',undefined,'agent-message'),avatar=node('div','✧','avatar'),body=node('div',undefined,'message-content');body.append(node('strong','Research Assistant · demonstration'),node('p','Explore the document, capture a passage, or inspect a concept. Suggestions here illustrate the workflow; no model is connected.'),node('div','How does this passage connect evidence, interpretation and authorship?','suggestion'));msg.append(avatar,body);p.append(msg);const composer=node('div',undefined,'agent-input'),input=node('textarea');input.placeholder='Ask about your writing…';input.setAttribute('aria-label','Demonstration agent prompt');const send=node('button','Send demo prompt');send.onclick=()=>{notify('No agent connected. Your prompt stays in this tab.');};composer.append(input,send);p.append(composer,node('p','No provider requests or document disclosure.','caption'));}
function renderDocumentRelationships(parent){
 parent.append(node('div','ADJACENT TEXT RELATIONSHIPS · '+title(),'eyebrow'));
 const all=view.state.field(relationshipField).records,inspected=inspectedRelationship?.document===active?all.find(record=>record.id===inspectedRelationship.id):null,records=inspected?[inspected]:relationshipsAtCaret(view.state);
 if(!records.length)parent.append(node('p','No relationships at the current caret.','caption'));
 for(const record of records){
  const card=node('article',undefined,'card relationship-card');card.dataset.relationshipId=record.id;card.tabIndex=-1;
  card.classList.toggle('inspected',inspectedRelationship?.document===active&&inspectedRelationship.id===record.id);
  const connector=node('div',undefined,'relationship-connector');const before=node('span','↓'),after=node('span','↓');before.setAttribute('aria-hidden','true');after.setAttribute('aria-hidden','true');const symbol=relationshipType(record.predicateId)?.symbol;connector.append(before,node('h3',record.name),...(symbol?[node('span',symbol,'relationship-symbol')]:[]),after);
  card.append(node('span',`${record.kind} · ${record.stale?'Source changed — anchor needs review':'tab-only example'}`,'tag'),node('blockquote',record.left.text),connector,...assertionPropertyLabels(record.properties).map(label=>node('p',label,'caption assertion-property')),node('blockquote',record.right.text));
  if(record.custom)card.append(node('span',`Custom relationship${record.categoryId?' · '+relationshipCategory(record.categoryId).label:''}`,'tag'));
  const definition=relationshipType(record.predicateId);if(definition){card.append(...relationshipTags(definition).map(tag=>node('span',tag.label,'tag')),...(definition.symbol?[node('p',`P ${definition.symbol} Q · ${definition.family}`,'caption')]:[]),node('p',`Definition: ${definition.definition}`,'caption'),node('p',`Example: ${definition.example}`,'caption'),relationshipContext(definition));if(definition.inverse)card.append(node('p',`Inverse label: ${definition.inverse}`,'caption'));}
  const reviewKey=active+'\0'+record.id;card.append(node('p',reviews.get(reviewKey)||'Proposed','caption'));
  for(const label of ['Accept','Reject','Reset']){const review=node('button',label+' relation');review.setAttribute('aria-label',`${label} ${record.name} relation`);review.disabled=record.stale;review.onclick=()=>{reviews.set(reviewKey,label==='Accept'?'Accepted locally':label==='Reject'?'Rejected locally':'Proposed');renderInvestigation();};card.append(review);}
  const remove=node('button','Remove relationship');remove.setAttribute('aria-label',`Remove ${record.name} relationship`);remove.onclick=()=>{view.dispatch({effects:removeRelationship.of(record.id)});};card.append(remove);parent.append(card);
 }
 parent.append(node('p','Arrows are connection controls, not claims that a relationship is symmetric. Source edits that invalidate an anchor hide its arrow and retain a review-needed entry.','caption'));
}
function inspectRelationship(id){
 const record=view.state.field(relationshipField).records.find(r=>r.id===id&&!r.stale);if(!record)return;
 inspectedRelationship={document:active,id};$('#investigation').classList.remove('collapsed');$('#collapseInvestigation').setAttribute('aria-expanded','true');setTab('investigation','Relationships');
 const card=[...$('#investigationBody').querySelectorAll('.relationship-card')].find(card=>card.dataset.relationshipId===id);card?.focus({preventScroll:true});card?.scrollIntoView({block:'nearest'});
}
onInspectRelationship(inspectRelationship);
function provenanceTarget(record){
 if(record.stale)return null;
 const other=record.other,cached=other.document===active?view.state:states.get(other.document)?.state;
 const endpoint=cached?.field(sentenceProvenanceField).find(candidate=>candidate.id===other.endpointId&&!candidate.stale);
 return endpoint?{document:other.document,anchor:endpoint.anchor}:null;
}
function inspectProvenance(id){
 const record=view.state.field(sentenceProvenanceField).find(record=>record.id===id&&!record.stale);if(!record)return;
 inspectedProvenance={document:active,id};$('#investigation').classList.remove('collapsed');$('#collapseInvestigation').setAttribute('aria-expanded','true');setTab('investigation','Provenance');
 const card=[...$('#investigationBody').querySelectorAll('.provenance-card')].find(card=>card.dataset.provenanceId===id);card?.focus({preventScroll:true});card?.scrollIntoView({block:'nearest'});
}
onInspectSentenceProvenance(inspectProvenance);
function provenanceExcerpt(text){return text.length>350?text.slice(0,350)+'…':text;}
function renderSentenceProvenance(parent){
 const all=view.state.field(sentenceProvenanceField),selected=inspectedProvenance?.document===active?all.find(record=>record.id===inspectedProvenance.id):null,caret=view.state.selection.main.head;
 const records=selected?[selected]:all.filter(record=>caret>=record.anchor.from&&caret<=record.anchor.to);
 parent.append(node('div','PROVENANCE LINKS','eyebrow'));
 if(!records.length)parent.append(node('p','No provenance links at the current caret.','caption'));
 for(const record of records){
  const card=node('article',undefined,'card provenance-card');card.dataset.provenanceId=record.id;card.tabIndex=-1;card.classList.toggle('inspected',record.id===selected?.id);
  card.append(node('span',record.origin==='fixture'?'Synthetic provenance example':'Tab-only operation','tag'),node('h3',provenanceLabel(record)),node('p',`${record.unitKind??'sentence'} link`,'caption'),node('blockquote',provenanceExcerpt(record.anchor.text)),node('p',`Linked ${record.unitKind??'sentence'} · ${record.other.title}`,'caption'),node('blockquote',provenanceExcerpt(record.other.anchor.text)));
  if(record.stale)card.append(node('p','Source changed — anchor needs review.','caption'));
  const target=provenanceTarget(record),go=node('button',`Go to linked ${record.unitKind??'sentence'}`);go.disabled=!target;go.onclick=()=>{const current=provenanceTarget(record);if(!current){notify('The linked content needs review or its captured source is unavailable.');return;}if(current.document!==active)openDocument(current.document);view.dispatch({selection:{anchor:current.anchor.from,head:current.anchor.to},effects:EditorView.scrollIntoView(current.anchor.from,{y:'center'})});view.focus();setTab('investigation','Provenance');};card.append(go);
  if(!target&&!record.stale)card.append(node('p','Captured source only — current linked sentence unavailable or changed.','caption'));
  parent.append(card);
 }
 parent.append(node('p','Provenance examples and operations stay in this tab. Semantic relationship labels do not create these links.','caption'));
}
function publishProvenance(records){
 const byDocument=new Map();for(const record of records){if(!byDocument.has(record.document))byDocument.set(record.document,[]);byDocument.get(record.document).push(record);}
 for(const [document,links] of byDocument){if(document===active)view.dispatch({effects:addSentenceProvenance.of(links)});else{const cached=states.get(document)??{state:makeState(adapter.get(document)),scroll:0};states.set(document,{...cached,state:cached.state.update({effects:addSentenceProvenance.of(links)}).state});}}
}
function registerForkProvenance(context,destination){
 const source={document:active,title:title(),sequence:adapter.get(active).sequence},incoming=[],outgoing=[];
 for(const {anchor:unit,unitKind} of containedProvenanceUnits(view.state,context.from,context.to)){
  const eventId=`demo:unit-fork:${destination.id}:${unitKind}:${unit.from}`;
  const pair=provenancePair({eventId,kind:'fork',unitKind,source:{...source,anchor:unit},target:{document:destination.id,title:destination.title,sequence:0,anchor:{from:unit.from-context.from,to:unit.to-context.from,text:unit.text}}});outgoing.push(pair[0]);incoming.push(pair[1]);
 }
 if(outgoing.length)view.dispatch({effects:addSentenceProvenance.of(outgoing)});
 states.set(destination.id,{state:makeState(destination).update({effects:addSentenceProvenance.of(incoming)}).state,scroll:0});
}
function renderInvestigation(){if(!view)return;const p=$('#investigationBody'),record=investigation==='Relationships'&&inspectedRelationship?.document===active?view.state.field(relationshipField).records.find(r=>r.id===inspectedRelationship.id):null,ctx=record?{...selectionContext(),text:record.left.text+' → '+record.right.text}:investigation==='Relationships'?selectionContext():pinned||selectionContext();p.replaceChildren();const c=node('div',`${record?'Inspecting relationship':pinned&&investigation!=='Relationships'?'Pinned':'Following editor'} · ${ctx.title} · local sequence ${ctx.sequence}`,'context-label');if(record&&pinned)c.append(node('p','Pinned editor context retained.','caption'));if(ctx.text)c.append(node('blockquote',ctx.text));p.append(c);
 if(investigation==='Concepts'){p.append(node('div','SYNTHETIC CONCEPTS','eyebrow'));for(const [name,description] of [['Interpretation','An account of what a passage or observation means. Multiple formulations may coexist.'],['Evidence','Material offered in support of a claim, considered within its context.']]){const card=node('article',undefined,'card');card.append(node('span','Example concept','tag'),node('h3',name),node('p',description));const b=node('button','Go to example occurrence →');b.onclick=()=>{const text=view.state.doc.toString(),at=text.toLowerCase().indexOf(name.toLowerCase());if(at>=0)jump(at);else notify('No matching synthetic occurrence in this document.');};card.append(b);p.append(card);}}
 else if(investigation==='Relationships'){renderDocumentRelationships(p);}
 else if(investigation==='Provenance'){renderSentenceProvenance(p);p.append(node('div','LOCAL SIMULATION LOG','eyebrow'));for(const op of adapter.pastes.slice(-8).reverse()){const c=node('article',undefined,'card');c.append(node('h3',op.id),node('p',`Captured input: ${op.sources.map(s=>`${s.document} at sequence ${s.sequence}`).join(', ')}`));p.append(c);}p.append(node('p','This tab log is not canonical provenance. No graph records or immutable revisions are published.','caption'));}
 else if(investigation==='Sources'){const card=node('article',undefined,'card');card.append(node('h3','Citation sources'),node('p','Zotero desktop and cloud adapters are planned. No library, credentials or external source is connected.'));p.append(card);}
 else p.append(node('p','No durable history or snapshots exist in this preview. Local undo/redo changes your working text; reloading resets the fixture.','caption'));}
function setTab(kind,name){if(kind==='interaction'){interaction=name;renderInteraction();}else{investigation=name;renderInvestigation();}for(const b of $$(`[data-${kind}]`))b.setAttribute('aria-selected',String(b.dataset[kind]===name));}
for(const list of $$('[role=tablist]'))list.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=[...list.querySelectorAll('[role=tab]')],current=buttons.indexOf(document.activeElement);if(current<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(current+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();buttons[next].click();});
for(const b of $$('[data-interaction]'))b.onclick=()=>setTab('interaction',b.dataset.interaction);
for(const b of $$('[data-investigation]'))b.onclick=()=>setTab('investigation',b.dataset.investigation);
for(const b of $$('[data-lens]'))b.onclick=()=>{lens=b.dataset.lens;for(const x of $$('[data-lens]'))x.setAttribute('aria-selected',String(x===b));renderNavigation();scheduleTreeFollow('caret',true);};
for(const b of $$('[data-format]')){b.onmousedown=e=>e.preventDefault();b.onclick=()=>{const action=b.dataset.format;if(action==='bold')wrap('**');else if(action==='italic')wrap('*');else if(['quote','bullet','number'].includes(action))toggleBlock(action);else{const pos=view.state.selection.main.to;view.dispatch({changes:{from:pos,insert:'\n\n| Column 1 | Column 2 |\n| --- | --- |\n| Value | Value |\n\n'},userEvent:'input.table'});view.focus();}};}
function updateBlockStyle(){const formats=formattingState(view.state);for(const button of $$('[data-format]')){if(button.dataset.format in formats)button.setAttribute('aria-pressed',String(formats[button.dataset.format]));}const block=blockStyleState(view.state);for(const button of $$('[data-block-style]')){const level=Number(button.dataset.blockStyle);button.setAttribute('aria-pressed',String(level===0?block.paragraph:block.headingLevel===level));}}
for(const button of $$('[data-block-style]')){button.onmousedown=e=>e.preventDefault();button.onclick=()=>{const level=Number(button.dataset.blockStyle),selection=view.state.selection.main,first=view.state.doc.lineAt(selection.from),last=view.state.doc.lineAt(selection.to>selection.from&&view.state.doc.lineAt(selection.to).from===selection.to?selection.to-1:selection.to),changes=[];for(let n=first.number;n<=last.number;n++){const line=view.state.doc.line(n);changes.push({from:line.from,to:line.to,insert:'#'.repeat(level)+(level?' ':'')+line.text.replace(/^#{1,6}\s+/,'')});}view.dispatch({changes,userEvent:'input.format'});updateBlockStyle();view.focus();};}
$('#undo').onclick=()=>{undo(view);view.focus();};$('#redo').onclick=()=>{redo(view);view.focus();};$('#capture').onclick=capture;$('#paste').onclick=()=>paste();$('#clearClipboard').onclick=()=>{adapter.clipboard=[];selectedClip=null;renderClipboard();};
$('#previous').onclick=()=>openDocument(documents[documents.findIndex(d=>d.id===active)-1].id);$('#next').onclick=()=>openDocument(documents[documents.findIndex(d=>d.id===active)+1].id);
$('#pinContext').onclick=()=>{pinned=pinned?null:selectionContext();$('#pinContext').setAttribute('aria-pressed',String(!!pinned));$('#pinContext').textContent=pinned?'◆ Unpin':'◇ Pin context';renderInvestigation();};
$('#download').onclick=()=>{const bytes=view.state.doc.toString(),blob=new Blob([bytes],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=`hypergraph-demo-${adapter.get(active).fixtureFork?'fork-'+active.split(':').at(-1):documents.findIndex(d=>d.id===active)+1}-uncommitted.md`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Requested download of this exact uncommitted tab buffer.');};
$('#mathMode').onchange=()=>{applyPresentation();scheduleMap();savePreferences();};$('#authors').onchange=()=>{document.body.classList.toggle('authors-on',$('#authors').checked);savePreferences();};$('#fontSize').oninput=()=>{document.documentElement.style.setProperty('--font-size',$('#fontSize').value+'px');$('#fontValue').textContent=$('#fontSize').value;savePreferences();scheduleMap();};$('#wrap').onchange=()=>{document.documentElement.style.setProperty('--wrap',$('#wrap').value+'ch');savePreferences();scheduleMap();};$('#theme').onclick=()=>{document.body.classList.toggle('light');savePreferences();};
function savePreferences(){try{localStorage.setItem('hypergraph-display-v1',JSON.stringify({light:document.body.classList.contains('light'),wrap:Number($('#wrap').value),font:Number($('#fontSize').value),authors:$('#authors').checked,redCaret:$('#redCaret').checked,dragSnapping:$('#dragSnapping').checked,math:$('#mathMode').value,upper:parseFloat($('.right-sidebar').style.getPropertyValue('--upper'))||48,navigatorVisible,navigatorSide,followTree:$('#followTree').checked,columnWidths:columnWidths?.values()??{outline:226,sidebar:348}}));}catch{/* Appearance persistence is optional. */}}
function loadPreferences(){try{const p=JSON.parse(localStorage.getItem('hypergraph-display-v1')||'{}');document.body.classList.toggle('light',p.light===true);if([60,80,100,120].includes(p.wrap))$('#wrap').value=p.wrap;if(Number.isInteger(p.font)&&p.font>=13&&p.font<=23)$('#fontSize').value=p.font;$('#authors').checked=p.authors===true;$('#followTree').checked=p.followTree===true;$('#redCaret').checked=p.redCaret!==false;$('#dragSnapping').checked=p.dragSnapping!==false;$('#mathMode').value=p.math==='rendered'?'rendered':'source';if(Number.isFinite(p.upper))setSplit(p.upper);columnWidths?.restore(p.columnWidths);navigatorVisible=p.navigatorVisible!==false;navigatorSide=p.navigatorSide==='left'?'left':'right';document.documentElement.style.setProperty('--wrap',$('#wrap').value+'ch');document.documentElement.style.setProperty('--font-size',$('#fontSize').value+'px');$('#fontValue').textContent=$('#fontSize').value;document.body.classList.toggle('authors-on',$('#authors').checked);}catch{}applyCaretPreference();applyNavigatorPreferences();}
function setSplit(value){const v=Math.max(20,Math.min(75,value));$('.right-sidebar').style.setProperty('--upper',v+'%');$('#panelDivider').setAttribute('aria-valuenow',Math.round(v));}
const divider=$('#panelDivider');divider.onkeydown=e=>{if(!['ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();setSplit(e.key==='Home'?48:Number(divider.getAttribute('aria-valuenow'))+(e.key==='ArrowDown'?3:-3));savePreferences();};divider.onpointerdown=e=>{if(e.button!==0)return;divider.setPointerCapture(e.pointerId);const move=ev=>{const box=$('.right-sidebar').getBoundingClientRect();setSplit((ev.clientY-box.top)/box.height*100);};const end=()=>{divider.removeEventListener('pointermove',move);divider.removeEventListener('pointerup',end);divider.removeEventListener('pointercancel',end);savePreferences();};divider.addEventListener('pointermove',move);divider.addEventListener('pointerup',end);divider.addEventListener('pointercancel',end);};
for(const name of ['Interaction','Investigation'])$(`#collapse${name}`).onclick=()=>{const panel=$('#'+name.toLowerCase());panel.classList.toggle('collapsed');$(`#collapse${name}`).setAttribute('aria-expanded',String(!panel.classList.contains('collapsed')));};
bindMinimap($('#mapTrack'),$('#mapViewport'),()=>view);
$('#mapViewport').onkeydown=e=>{if(!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))return;e.preventDefault();const el=view.scrollDOM;el.scrollTop=e.key==='Home'?0:e.key==='End'?el.scrollHeight:el.scrollTop+(e.key==='ArrowUp'||e.key==='PageUp'?-1:1)*(e.key.startsWith('Page')?el.clientHeight:60);};
function addSelectedRelations(context,choice){
 if(!choice)return;
 openRelationshipDialog({
  editorElement:()=>$('.editor-pane'),
  current:captured=>active===captured.document&&adapter.get(active).sequence===captured.sequence,
  restore:captured=>{if(active===captured.document&&adapter.get(active).sequence===captured.sequence)view.dispatch({selection:{anchor:captured.anchor,head:captured.head}});},
  focusEditor:()=>view.focus(),inspect:inspectRelationship,
  create:(captured,selected,relationship)=>{
   if(active!==captured.document||adapter.get(active).sequence!==captured.sequence)throw Error('The selected source changed. Select it again.');
   const before=view.state.field(relationshipField).serial;view.dispatch({effects:addRelationship.of({...selected,...relationship})});const value=view.state.field(relationshipField);
   if(!value.lastAddedId)throw Error('Those units are no longer an eligible adjacent pair.');
   notify(value.serial===before?'This assertion already exists; showing its relationship.':'Relationship added in this tab only. No graph record was published.');return value.lastAddedId;
  }
 },context,choice);
}
function contextMenu(event,pos){event.preventDefault?.();const menu=$('#contextMenu');menu.replaceChildren();const relationContext={...selectionContext()},relationChoice=selectedRelationshipPair(view.state);const author=getAuthorAt(view.state,pos);menu.append(node('p',`Attribution: ${author.name} · synthetic`,'caption'));for(const [label,action,enabled] of [['Add relations',()=>addSelectedRelations(relationContext,relationChoice),!!relationChoice],['Copy selection to provenance clipboard',capture,!view.state.selection.main.empty],['Simulate fork paste',()=>paste(),!!adapter.clipboard.length],['Simulate fork paste and clear',()=>paste(true),!!adapter.clipboard.length],['Simulate paste all and clear',()=>paste(true,true),!!adapter.clipboard.length],['Transclude · Rust service unavailable',()=>{},false]]){const b=node('button',label);b.setAttribute('role','menuitem');b.disabled=!enabled;b.onclick=()=>{menu.hidden=true;action();};menu.append(b);}menu.hidden=false;menu.style.left=Math.max(0,Math.min(event.clientX,innerWidth-menu.offsetWidth-10))+'px';menu.style.top=Math.max(0,Math.min(event.clientY,innerHeight-menu.offsetHeight-10))+'px';menu.querySelector('button:not(:disabled)')?.focus();}
onMathContext((e,x)=>contextMenu(e,x.from));onTableContext((e,x)=>contextMenu(e,x.sourcePosition));
document.addEventListener('pointerdown',e=>{if(!$('#contextMenu').contains(e.target))$('#contextMenu').hidden=true;});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#contextMenu').hidden){$('#contextMenu').hidden=true;view.focus();}});
columnWidths=installColumnWidths($('.workspace'),{onLayout:()=>{view?.requestMeasure();scheduleMap();},onSave:savePreferences});loadPreferences();view=new EditorView({parent:$('#editorHost'),state:makeState(adapter.get(active))});view.scrollDOM.addEventListener('wheel',()=>{treeNavigationMode='scroll';},{passive:true});view.scrollDOM.addEventListener('pointerdown',event=>{if(event.target===view.scrollDOM)treeNavigationMode='scroll';});view.scrollDOM.addEventListener('scroll',()=>{scheduleMap();if(treeNavigationMode==='caret'){const caret=view.coordsAtPos(view.state.selection.main.head),box=view.scrollDOM.getBoundingClientRect();if(!caret||caret.bottom<box.top||caret.top>box.bottom)treeNavigationMode='scroll';}scheduleTreeFollow(treeNavigationMode);},{passive:true});for(const event of ['wheel','pointerdown','keydown'])$('#documentNavigator').addEventListener(event,()=>{treeNavigationMode='scroll';},{passive:true});view.dom.addEventListener('contextmenu',e=>{if(e.defaultPrevented)return;const p=view.posAtCoords({x:e.clientX,y:e.clientY});contextMenu(e,p??view.state.selection.main.head);});view.dom.addEventListener('keydown',e=>{if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){const rect=view.coordsAtPos(view.state.selection.main.head)||view.dom.getBoundingClientRect();contextMenu({preventDefault:()=>e.preventDefault(),clientX:rect.left,clientY:rect.bottom},view.state.selection.main.head);}});new ResizeObserver(scheduleMap).observe($('#editorHost'));applyPresentation();functionsBar=installFunctionsBar({getContext:selectionContext,getDocument:id=>adapter.get(id),listDocuments:()=>[...documents,...localForks],notify,focusEditor:()=>view.focus(),restoreContext:context=>{if(context&&active===context.document&&adapter.get(active).sequence===context.sequence)view.dispatch({selection:{anchor:context.anchor??context.from,head:context.head??context.to}});},insertLink:(context,heading,label)=>{view.dispatch({changes:{from:context.from,to:context.to,insert:markdownHeadingLink(label,heading)},userEvent:'input.link'});view.focus();},createFork:(context,name)=>{const attribution=view.state.field(authorshipField).map(span=>({from:Math.max(span.from,context.from)-context.from,to:Math.min(span.to,context.to)-context.from,author:span.author})).filter(span=>span.to>span.from);const record=adapter.createFork(context,name,attribution);registerForkProvenance(context,record);localForks.push(record);lens='Workspace';for(const button of $$('[data-lens]'))button.setAttribute('aria-selected',String(button.dataset.lens===lens));openDocument(record.id);notify('Created an independent demo fork in this tab. Original source unchanged.');}});refreshAll();window.addEventListener('beforeunload',e=>{if(relationshipEdits||[...adapter.docs.values()].some(d=>d.sequence)||adapter.clipboard.length||comments.size||reviews.size||localForks.length){e.preventDefault();e.returnValue='';}});

installTooltips();

function applyNavigatorPreferences(){
 const workspace=$('.workspace'),navigator=$('#documentNavigator'),editor=$('.editor-pane');
 workspace.classList.toggle('navigator-hidden',!navigatorVisible);
 workspace.classList.toggle('navigator-left',navigatorSide==='left');
 workspace.insertBefore(navigator,navigatorSide==='left'?editor:$('.right-sidebar'));
 $('#navigatorToggle').setAttribute('aria-pressed',String(navigatorVisible));
 $('#navigatorToggle').setAttribute('aria-label',navigatorVisible?'Hide navigator':'Show navigator');
 $('#navigatorSide').setAttribute('aria-label',navigatorSide==='left'?'Move navigator to right':'Move navigator to left');
 $('#navigatorSide').textContent=navigatorSide==='left'?'Right →':'← Left';
 columnWidths?.apply();view?.requestMeasure();scheduleMap();
}
$('#navigatorToggle').onclick=()=>{navigatorVisible=!navigatorVisible;applyNavigatorPreferences();savePreferences();};
$('#navigatorSide').onclick=()=>{navigatorSide=navigatorSide==='left'?'right':'left';applyNavigatorPreferences();savePreferences();$('#navigatorSide').focus({preventScroll:true});};

function applyCaretPreference(){document.body.classList.toggle('red-caret',$('#redCaret').checked);}
$('#redCaret').onchange=()=>{applyCaretPreference();savePreferences();};

$('#dragSnapping').onchange=savePreferences;

document.fonts?.addEventListener('loadingdone',()=>{view.requestMeasure();scheduleMap();});

$('#followTree').onchange=()=>{savePreferences();lastFollowTarget=null;if($('#followTree').checked)scheduleTreeFollow('caret',true);};
$('#toggleAllTree').onclick=()=>{
 if(treeFrame!==null){cancelAnimationFrame(treeFrame);treeFrame=null;treeForce=false;}
 allTreeClosed=!allTreeClosed;expanded.clear();
 for(const record of [...documents,...localForks]){outlineTree.setAll(record.id,documentHeadings(adapter.get(record.id).source),allTreeClosed);if(!allTreeClosed)expanded.add(record.id);}
 updateTreeControls();renderNavigation();
};
scheduleTreeFollow('scroll',true);
