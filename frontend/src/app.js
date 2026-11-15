/**
 * # Hypergraph PX — Browser workspace composition and exact-source interaction
 *
 * Composes the editor, navigation and inspection panels, connecting
 * capability-gated runtime workflows while keeping fixture-only demonstrations
 * visibly separate.
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
 * Used by: Interface shell and navigation — browser application entry point loaded
 * by the frontend page.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 * - [Browser runtime and API contract][spec-3]
 * - [Exact text and anchors][spec-4]
 *
 * Boundary: The shell delegates durable commands and permissions to the runtime.
 * Current whole-document implementation is not the candidate multi-user
 * architecture. Display UTF16 ranges are checked against owned source before
 * persistent UTF8 use; saves acknowledge recovery while explicit or
 * logical-departure Commit creates history. Local storage contains appearance
 * preferences only.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/app.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-4]: ../../docs/05-domain/text-and-anchors.md
 */

import {inlinePresentation,setMarkdownSource} from './inline-presentation.js';
import {projectRuntimeRelations} from './runtime-relation-projection.js';
import {editorProjection,ownedRange,ownedSource,ownedSourceExtension,exactInsertion} from './owned-source.js';
import {editorStructureGuides} from './structure-guides.js';
import {assertionPropertyLabels} from './assertion-properties.js';
import {sentenceProvenanceField,addSentenceProvenance,seedSentenceProvenance,sentenceUnits,containedProvenanceUnits,provenancePair,provenanceLabel} from './sentence-provenance.js';
import {sentenceProvenanceMarkers,onInspectSentenceProvenance} from './sentence-provenance-view.js';
import {relationshipContext} from './relationship-details.js';
import {openRelationshipDialog} from './relationship-dialog.js';
import {relationshipType,relationshipCategory,relationshipTags} from './relationship-catalog.js';
import {createOutlineTree,headingAt} from './outline-tree.js';
import {relationshipField,seedRelationships,addRelationship,removeRelationship,selectedRelationshipPair,relationshipsAtCaret,setRuntimeRelationships} from './relationships.js';
import {relationshipMarkers,onInspectRelationship} from './relationship-markers.js';
import {documentPresentation,presentationLineClasses} from './document-presentation.js';
import {sourceSelectionStyle} from './source-selection.js';
import {installColumnWidths} from './column-widths.js';
import {installWorkspaceDocking} from './workspace-docking.js';
import {installWorkspaceLayoutControls} from './workspace-layout-controls.js';
import {syntaxTree} from '@codemirror/language';
import {installFunctionsBar} from './functions-bar.js';
import {renderMinimap,bindMinimap} from './minimap.js';
import {installTooltips} from './tooltips.js';
import {EditorState,Compartment,Prec} from '@codemirror/state';
import {EditorView,keymap,drawSelection,Decoration,ViewPlugin} from '@codemirror/view';
import {history,historyKeymap,defaultKeymap,undo,redo,indentWithTab} from '@codemirror/commands';
import {markdown,markdownKeymap,markdownLanguage} from '@codemirror/lang-markdown';
import {formattingState,blockStyleState,inlinePlan,blockPlan} from './formatting.js';
import {FixtureAdapter} from './adapter.js';
import {documents as fixtureDocuments,contributors} from './fixtures.js';
import {initializeRuntime} from './runtime-adapter.js';
import {renderPublicationContributors} from './runtime-contributors.js';
import {renderHistory} from './history-panel.js';
import {renderComments} from './runtime-comments-panel.js';
import {renderDerivation} from './runtime-derivation.js';
import {openRuntimeGraph} from './runtime-graph.js';
import {renderAssertionOverlay} from './runtime-assertions-panel.js';
import {openMergeComposer} from './merge-composer.js';
import {renderPrivateClipboard} from './runtime-clipboard-panel.js';
import {appendWorkingClipboard} from './runtime-working-clipboard-panel.js';
import {openBranches} from './runtime-branches-panel.js';
import {openDocumentAudit} from './runtime-audit-panel.js';
import {showBuildVersion} from './build-version.js';

void showBuildVersion();

const runtime = await initializeRuntime();

let branchSwitching=false;

const runtimeEditing=new Compartment();

/** Suspend runtime text mutation during branch transitions or non-unlocked lifecycle states. */
const runtimeEditingRules=()=>runtime&&(branchSwitching||runtime.adapter.lifecycle!=='unlocked')?[EditorState.readOnly.of(true),EditorView.editable.of(false),EditorState.transactionFilter.of(/* Reject document-changing transactions while retaining safe view transactions. */ tr=>tr.docChanged?[]:tr)]:[];

const documents = runtime?.documents ?? fixtureDocuments;

import {authorshipField,authorshipHistory,currentAuthor,currentAgent,getAuthorAt} from './authorship.js';
import {mathRendering,setMathRendered,onMathContext} from './math-view.js';
import {tableRendering,onTableContext} from './table-view.js';
import {documentHeadings,markdownHeadingLink} from './context-actions.js';

const $=/* Find one application control by selector. */ s=>document.querySelector(s),$$=/* Collect matching controls into a stable iterable array. */ s=>[...document.querySelectorAll(s)];

let assertionPanel=null;

const textRelationViews=new Map();
let textRelationScope=null;

let navigatorVisible=true,navigatorSide='right';

const localForks=[];
let functionsBar,columnWidths,inspectedRelationship=null,inspectedProvenance=null,relationshipEdits=false;

const adapter=runtime?.adapter??new FixtureAdapter(documents),states=new Map(),comments=new Map(),reviews=new Map(),expanded=new Set([documents[0].id]);
let active=documents[0].id,view,checkpointTimer,toastTimer,selectedClip=null,pinned=null,interaction='Agent',investigation='Relationships',lens='Workspace',mapFrame,clipboardBusy=false;

/** Build text-labelled application DOM without interpreting source as markup. */
const node=(tag,text,className)=>{const el=document.createElement(tag);

 if(text!==undefined)el.textContent=text;

 if(className)el.className=className;

 return el;};

/** Display a transient user notification and replace its existing dismissal timer. */
function notify(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(/* Hide the notification after its display interval. */ ()=>$('#toast').hidden=true,4000);}

/** Read the title from the current adapter buffer. */
function title(){return adapter.get(active).title;}

let treeNavigationMode='caret',allTreeClosed=false,treeFrame=null,treeReason='scroll',treeForce=false,lastFollowTarget=null;

const outlineTree=createOutlineTree({onNavigate:/* Navigate outline targets only after successful document departure and activation. */ async(id,from)=>{if(id!==active){if(await openDocument(id))requestAnimationFrame(/* Jump after layout only if the intended document remains active. */ ()=>{if(active===id)jump(from);});}else jump(from);},onToggle:/* Clear the global closed-tree flag after an individual disclosure change. */ ()=>{allTreeClosed=false;updateTreeControls();}});

/** Synchronise the global tree disclosure label and pressed state. */
function updateTreeControls(){const button=$('#toggleAllTree');

 button.textContent=allTreeClosed?'Open all':'Close all';button.setAttribute('aria-pressed',String(allTreeClosed));}

/** Coalesce optional tree following while prioritising caret-triggered navigation. */
function scheduleTreeFollow(reason='scroll',force=false){
 if(!view||!$('#followTree').checked)return;


 if(reason==='caret'||treeFrame===null)treeReason=reason;

 treeForce=treeForce||force;


 if(treeFrame!==null)return;


 treeFrame=requestAnimationFrame(/* Follow the current heading after layout without overriding unsupported navigation lenses. */ ()=>{
  treeFrame=null;

  const forced=treeForce;

  treeForce=false;

  if(!$('#followTree').checked||!['Workspace','Document'].includes(lens))return;


  const headings=documentHeadings(view.state.doc.toString());

  let position=view.state.selection.main.head;


  if(treeReason==='scroll'){const box=view.scrollDOM.getBoundingClientRect(),content=view.contentDOM.getBoundingClientRect();

   position=view.posAtCoords({x:Math.max(box.left+10,content.left+35),y:box.top+12},false)??position;}


  const heading=headingAt(headings,position),target=active+'\0'+(heading?.anchor??'');

  outlineTree.setCurrent(active,heading);


  if(heading&&(forced||target!==lastFollowTarget)){
   expanded.add(active);outlineTree.expandPath(active,headings,heading);allTreeClosed=false;updateTreeControls();renderNavigation();
  }


  const button=heading?[...$('#navigation').querySelectorAll('.heading-open')].find(/* Find the visible heading control for this exact document and source position. */ button=>button.dataset.document===active&&Number(button.dataset.headingFrom)===heading.from):null;


  if(button?.getClientRects().length){const viewport=$('#navigation').getBoundingClientRect(),row=button.getBoundingClientRect();

   if(row.top<viewport.top||row.bottom>viewport.bottom)$('#navigation').scrollTop+=row.top<viewport.top?row.top-viewport.top-4:row.bottom-viewport.bottom+4;}


  lastFollowTarget=target;outlineTree.mark($('#navigation'));
 });
}

/** Capture document, branch buffer, sequence and directional selection for stale-context checks. */
function selectionContext(){const s=view.state.selection.main;

 return {document:active,buffer:editorKey(active),title:title(),sequence:adapter.get(active).sequence,from:s.from,to:s.to,anchor:s.anchor,head:s.head,text:view.state.sliceDoc(s.from,s.to)};}

/** Decorate presentation syntax and allow only supported heading, HTTP and mail links. */
function sourceDecorations(v){const model=documentPresentation(v.state),ranges=[];

 for(const from of new Set([...model.headings.keys(),...model.gaps]))ranges.push(Decoration.line({class:presentationLineClasses(model,from)}).range(from));

 for(const item of model.inline)ranges.push(Decoration.mark({class:item.className}).range(item.from,item.to));

 for(const link of model.links){const target=link.target?.replace(/^<(.*)>$/,'$1');

  if(target&&/^(#|https?:|mailto:)/i.test(target))ranges.push(Decoration.mark({tagName:'a',class:'cm-editor-link',attributes:{href:target,...(target.startsWith('#')?{}:{target:'_blank',rel:'noopener noreferrer'})}}).range(link.from,link.to));}

 for(const marker of model.markers)ranges.push(Decoration.mark({class:'cm-source-marker'}).range(marker.from,marker.to));

 return Decoration.set(ranges,true);}

const headingStyle=ViewPlugin.fromClass(class{/* Build initial source decorations for the editor view. */ constructor(v){this.decorations=sourceDecorations(v)}

 /* Rebuild syntax decorations after text or parse-tree changes. */ update(u){if(u.docChanged||syntaxTree(u.startState)!==syntaxTree(u.state))this.decorations=sourceDecorations(u.view)}},{decorations:/* Expose current syntax decorations to CodeMirror. */ v=>v.decorations});

/** Create an editor state with exact runtime ownership or explicitly synthetic fixture annotations. */
function makeState(d){const text=d.source,split=text.indexOf('## Working with evidence');

 const spans=runtime?[]:d.attribution??(split>=0?[{from:0,to:split,author:currentAuthor},{from:split,to:text.length,author:currentAgent}]:[]);

 return EditorState.create({doc:runtime?editorProjection(text):text,extensions:[runtimeEditing.of(runtimeEditingRules()),runtime?ownedSourceExtension(text,notify):[],markdown({base:markdownLanguage}),history(),drawSelection(),keymap.of([...markdownKeymap,...defaultKeymap,...historyKeymap,indentWithTab,{key:'Mod-b',run:/* Apply bold formatting through the shared formatting planner. */ ()=>wrap('**')},{key:'Mod-i',run:/* Apply italic formatting through the shared formatting planner. */ ()=>wrap('*')}]),authorshipField.init(/* Initialise attribution spans from the current document’s explicit fixture metadata. */ ()=>spans),authorshipHistory,mathRendering,tableRendering,relationshipField.init(/* Seed synthetic relationships only for eligible original fixture documents. */ state=>runtime||d.fixtureFork?{records:[],serial:0}:seedRelationships(state)),relationshipMarkers,sentenceProvenanceField.init(/* Seed synthetic provenance only for the designated fixture document. */ state=>!runtime&&d.id===documents[0].id?seedSentenceProvenance(state,d):[]),sentenceProvenanceMarkers,editorStructureGuides,Prec.low(headingStyle),inlinePresentation,EditorView.lineWrapping,EditorView.contentAttributes.of({'aria-label':'Markdown document editor',spellcheck:'false'}),EditorView.mouseSelectionStyle.of(sourceSelectionStyle),EditorView.updateListener.of(update)]});}

/** Coordinate editor changes, delayed draft acknowledgement and dependent navigation/panels. */
function update(u){if(runtime&&(branchSwitching||adapter.lifecycle!=='unlocked'))queueMicrotask(/* Clear unsafe runtime overlays after the current transaction completes. */ ()=>paintTextRelations());

 if(u.transactions.some(/* Detect whether this transaction changes editor-local relationship records. */ tr=>tr.effects.some(/* Recognise explicit relationship add/remove effects. */ effect=>effect.is(addRelationship)||effect.is(removeRelationship))))relationshipEdits=true;

 const relationsChanged=u.startState.field(relationshipField)!==u.state.field(relationshipField);

 const provenanceChanged=u.startState.field(sentenceProvenanceField)!==u.state.field(sentenceProvenanceField);

 if(u.selectionSet){inspectedRelationship=null;inspectedProvenance=null;}

 if(u.docChanged){queueMicrotask(/* Refresh committed overlays after source-change handling has completed. */ ()=>refreshTextRelations());

  const id=active;

  adapter.edit(id,runtime?u.state.field(ownedSource):u.state.doc.toString());renderNavigation();renderClipboard();updateStatus();clearTimeout(checkpointTimer);checkpointTimer=setTimeout(/* Checkpoint the captured document after inactivity and report unacknowledged draft failures. */ async()=>{try{await adapter.checkpoint(id);}catch(error){notify('Draft not acknowledged: '+error.message);}

   if(active===id){updateStatus();

    if(interaction==='Comments')renderInteraction();}},5000);}


 if(u.selectionSet||u.docChanged){treeNavigationMode='caret';scheduleTreeFollow('caret');updatePosition();

  if(!pinned||investigation==='Relationships')renderInvestigation();

  updateCapture();functionsBar?.update(selectionContext());}


 if(u.selectionSet||u.docChanged||syntaxTree(u.startState)!==syntaxTree(u.state))updateBlockStyle();


 if(relationsChanged||provenanceChanged){renderInvestigation();scheduleMap();}


 if(u.docChanged||u.geometryChanged||u.viewportChanged)scheduleMap();}

/** Add newly registered runtime documents to the shell’s document navigation list. */
function syncRuntimeDocuments(){let changed=false;

 if(runtime)for(const d of adapter.docs.values())if(!documents.some(/* Avoid duplicating a runtime document already known to navigation. */ record=>record.id===d.id)){documents.push({id:d.id,title:d.title,source:d.source});changed=true;}

 return changed;}

/** Present actual acknowledgement, pending-command and capability state without claiming Commit from save. */
function updateStatus(){if(runtime){queueMicrotask(/* Refresh exact text relations after status rendering completes. */ ()=>refreshTextRelations());

  if(syncRuntimeDocuments())renderNavigation();

  const merge=$('#retryMerge');

  if(merge)merge.hidden=!adapter.mergePending;

  $('#mergeSelection').disabled=!runtime.mergeSupported||adapter.lifecycle!=='unlocked'||!!adapter.mergePending;

  const creation=$('#retryCreation');

  if(creation)creation.hidden=!adapter.creationPending;

  const retry=$('#retryFork');

  if(retry)retry.hidden=!adapter.forkPending;

  const d=adapter.get(active);

  if($('#runtimeBranches'))$('#runtimeBranches').textContent='Branches · '+adapter.branchLabel(active);

  $('#draftStatus').textContent=d.error?'Save needs attention: '+d.error:d.sequence>d.acknowledged?'Modified · draft not yet acknowledged':'Draft saved · '+(runtime.branchesSupported?adapter.branchLabel(active)+' working buffer':'encrypted local workspace');

  for(const id of ['embedSelection','paste'])$('#'+id).disabled=true;

  updateCapture();functionsBar?.update(selectionContext());

  return;}

 const d=adapter.get(active);

 $('#draftStatus').textContent=d.sequence>d.acknowledged?'Modified · tab only':d.sequence?'Checkpoint simulated · tab only':'Synthetic fixture · tab only';}

const wordCounts=new WeakMap(),workspaceWordCounts=new Map(),wordSegmenter=new Intl.Segmenter(undefined,{granularity:'word'});

/** Count word-like segments using language-aware segmentation. */
function countWords(text){let count=0;

 for(const segment of wordSegmenter.segment(text))if(segment.isWordLike)count++;

 return count;}

/** Update document and workspace word totals with buffer-sequence-aware caching. */
function updatePosition(){
 const doc=view.state.doc;


 let count=wordCounts.get(doc);

 if(count===undefined){count=countWords(doc.toString());wordCounts.set(doc,count);}


 workspaceWordCounts.set(editorKey(active),{sequence:adapter.get(active).sequence,count});


 let total=0;


 for(const record of adapter.docs.values()){let cached=workspaceWordCounts.get(record.context??record.id);

  if(!cached||cached.sequence!==record.sequence){cached={sequence:record.sequence,count:countWords(record.source)};workspaceWordCounts.set(record.context??record.id,cached);}

  total+=cached.count;}


 const number=node('strong',count.toLocaleString());

 number.id='wordCount';


 const workspace=node('strong',total.toLocaleString());

 workspace.id='workspaceWordCount';
 $('#position').replaceChildren(document.createTextNode('Document '),number,document.createTextNode(' words · Workspace '),workspace,document.createTextNode(' words'));
}

/** Apply source/math presentation preferences through editor effects. */
function applyPresentation(){if(view&&view.state.field(inlinePresentation).source!==$('#markdownSource').checked)view.dispatch({effects:setMarkdownSource.of($('#markdownSource').checked)});

 view.dispatch({effects:setMathRendered.of($('#mathMode').value==='rendered')});}

/** Use branch-scoped editor cache keys for runtime buffers. */
function editorKey(id){return runtime?adapter.contextKey(id):id;}

/** Freeze edits while committing departure and restoring the chosen branch’s cached editor state. */
async function switchBranch(id,branch){
 if(branchSwitching||adapter.lifecycle!=='unlocked')throw Error('Finish the current operation before switching branch');


 branchSwitching=true;clearTimeout(checkpointTimer);

 const previous=adapter.contextKey(id);


 if(active===id){states.set(previous,{state:view.state,scroll:view.scrollDOM.scrollTop});view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});}


 try{await adapter.selectBranch(id,branch);

  if(active!==id)return;


  const cached=states.get(adapter.contextKey(id));

  view.setState(cached?.state||makeState(adapter.get(id)));pinned=null;inspectedRelationship=null;inspectedProvenance=null;lastFollowTarget=null;applyPresentation();
  requestAnimationFrame(/* Restore branch scroll geometry after layout and force outline follow. */ ()=>{view.scrollDOM.scrollTop=cached?.scroll||0;scheduleMap();treeNavigationMode='scroll';scheduleTreeFollow('scroll',true);});
 }finally{branchSwitching=false;

  if(active===id){view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});refreshAll();}}
}

/** Leave the active document only after its required runtime departure Commit succeeds. */
async function openDocument(id){
 if(id===active)return true;

 if(branchSwitching)return false;


 clearTimeout(checkpointTimer);states.set(editorKey(active),{state:view.state,scroll:view.scrollDOM.scrollTop});


 if(runtime&&adapter.lifecycle==='unlocked'){
  branchSwitching=true;view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});


  try{await adapter.depart(active);}
  catch(error){notify('Could not leave this node: '+error.message);

   return false;}
  finally{branchSwitching=false;view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});refreshAll();}


  if(adapter.lifecycle!=='unlocked')return false;
 }


 expanded.add(id);active=id;inspectedRelationship=null;inspectedProvenance=null;lastFollowTarget=null;


 const cached=states.get(editorKey(id));

 view.setState(cached?.state||makeState(adapter.get(id)));

 if(runtime)view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});

 applyPresentation();
 requestAnimationFrame(/* Restore the destination document’s scroll and outline after layout. */ ()=>{view.scrollDOM.scrollTop=cached?.scroll||0;scheduleMap();treeNavigationMode='scroll';scheduleTreeFollow('scroll',true);});refreshAll();

 return true;
}

/** Refresh dependent shell controls and panels for the active document/buffer. */
function refreshAll(){syncRuntimeDocuments();$('#documentTitle').textContent=title();

 const chapterIndex=documents.findIndex(/* Locate the active document’s source-order position for previous/next controls. */ d=>d.id===active);

 $('#previous').disabled=chapterIndex<=0;$('#next').disabled=chapterIndex<0||chapterIndex===documents.length-1;updateCapture();renderNavigation();renderInteraction();renderInvestigation();renderClipboard();updateStatus();updatePosition();updateBlockStyle();functionsBar?.update(selectionContext());scheduleMap();queueMicrotask(/* Refresh runtime overlays after shell state refresh completes. */ ()=>refreshTextRelations());}

/** Move the caret and scroll to a source position without modifying text. */
function jump(pos){view.dispatch({selection:{anchor:pos},effects:EditorView.scrollIntoView(pos,{y:'start',yMargin:25})});view.focus();}

/** Render an outline from the document’s LF display projection. */
function outline(parent,id=active){parent.append(outlineTree.render(id,documentHeadings(editorProjection(adapter.get(id).source))));}

/** Build a document row with separate disclosure and activation controls. */
function appendDocumentRow(nav,d){const row=node('div',undefined,`chapter ${d.id===active?'active':''}`);

 row.dataset.document=d.id;

 const toggle=node('button',expanded.has(d.id)?'▾':'▸','chapter-toggle');

 toggle.setAttribute('aria-label',`${expanded.has(d.id)?'Collapse':'Expand'} ${d.title} headings`);toggle.setAttribute('aria-expanded',String(expanded.has(d.id)));toggle.setAttribute('aria-controls',`outline-${d.id}`);toggle.onclick=/* Toggle this document’s outline and restore focus to its replacement disclosure control. */ ()=>{expanded.has(d.id)?expanded.delete(d.id):expanded.add(d.id);allTreeClosed=false;updateTreeControls();renderNavigation();document.querySelector(`.chapter[data-document="${d.id}"] .chapter-toggle`).focus();};

 const open=node('button',d.title,'chapter-open');

 open.onclick=/* Activate the document represented by this row. */ ()=>openDocument(d.id);row.append(toggle,open);nav.append(row);

 if(expanded.has(d.id))outline(nav,d.id);}

/** Render the chosen navigation lens with honest runtime-versus-fixture capability boundaries. */
function renderNavigation(){
 const nav=$('#navigation');

 nav.replaceChildren();


 if(lens==='Workspace'){for(const d of [...documents,...localForks])appendDocumentRow(nav,d);}
 else if(lens==='Document'){appendDocumentRow(nav,adapter.get(active));}
 else if(lens==='Graph'&&runtime?.graphSupported){const card=node('div',undefined,'card');

  card.append(node('h3',runtime.overlayGraphSupported?'Selected node graph':'Document fork graph'),node('p',runtime.overlayGraphSupported?'Inspect documents, retained assertions and their exact role-labelled connections.':'Inspect selected document nodes and their recorded forks. Semantic relationships are not available yet.'));

  const open=node('button','Choose graph nodes');

  open.onclick=/* Open the bounded runtime graph inspector with supported incidence scopes. */ ()=>openRuntimeGraph(adapter,active,notify,/* Return focus to the editor after graph inspection closes. */ ()=>view.focus(),{assertions:runtime.overlayGraphSupported,transformations:runtime.transformationGraphSupported});card.append(open);nav.append(card);}
 else{nav.append(node('div',lens==='Graph'?'Relationships in this fixture':'History in this fixture','collection-title'));

  const card=node('div',undefined,'card');

  card.append(node('h3',lens==='Graph'?'No canonical graph connected':'No durable history connected'),node('p','This preview supports local document interaction. Authoritative graph traversal, snapshots and history require Rust application services.'));nav.append(card);}


 outlineTree.mark(nav);
}

/** Coalesce miniature navigation rendering to the next animation frame. */
function scheduleMap(){cancelAnimationFrame(mapFrame);mapFrame=requestAnimationFrame(updateMap);}

/** Render the minimap only after the editor exists. */
function updateMap(){if(view)renderMinimap(view,$('#mapTrack'),$('#mapText'),$('#mapViewport'));}

/** Dispatch planned inline formatting and return editor focus. */
function wrap(mark){view.dispatch({...inlinePlan(view.state,mark==='**'?'bold':'italic'),userEvent:'input.format'});view.focus();

 return true;}

/** Dispatch planned block formatting and return editor focus. */
function toggleBlock(type){view.dispatch({...blockPlan(view.state,type),userEvent:'input.format'});view.focus();}

/** Disable capture for empty selections or unavailable/busy/locked runtime resources. */
function updateCapture(){if(!view)return;

 $('#capture').disabled=view.state.selection.main.empty||!!runtime&&(!runtime.clipboardSupported||clipboardBusy||branchSwitching||!!adapter.privateClipboard.pending||!!adapter.workingClipboard.pending||adapter.lifecycle!=='unlocked');}

/** Serialize UI clipboard actions and refresh conflict state without hiding failures. */
async function clipboardAction(action){
 if(clipboardBusy)return;

 clipboardBusy=true;renderClipboard();updateCapture();


 try{await action();notify('Private clipboard updated.');}
 catch(error){if(error.status===409)await adapter.loadClipboard().catch(/* Ignore a secondary conflict-refresh failure while retaining the original user-visible error. */ ()=>{});

  notify(error.message);}
 finally{clipboardBusy=false;renderClipboard();updateCapture();}
}

/** Capture exact runtime bytes or explicitly tab-only fixture source and provenance units. */
function capture(){
 if(runtime){
  if(!runtime.clipboardSupported)return;


  try{const selection=view.state.selection.main,source=view.state.field(ownedSource),range=ownedRange(source,view.state.doc.toString(),selection.from,selection.to),encoder=new TextEncoder();


  void clipboardAction(/* Submit runtime capture using UTF8 offsets mapped from exact owned UTF16 source. */ ()=>adapter.captureSource(active,encoder.encode(source.slice(0,range.from)).length,encoder.encode(source.slice(0,range.to)).length,range.text));}catch(error){notify(error.message);}

  return;
 }


 try{const s=view.state.selection.main;

  const e=adapter.capture(active,s.from,s.to);

  e.provenanceUnits=containedProvenanceUnits(view.state,e.from,e.to);e.sentenceUnits=sentenceUnits(view.state).filter(/* Retain only whole sentence units contained by the fixture capture. */ unit=>unit.from>=e.from&&unit.to<=e.to).map(/* Detach captured fixture sentence metadata from mutable editor records. */ unit=>({...unit}));selectedClip=e.id;renderClipboard();notify('Captured a tab-only source selection. No graph promotion or commit.');}catch(e){notify(e.message);}}

/** Simulate independent fixture paste and provenance links without implying durable graph publication. */
function paste(clear=false,all=false){
 try{
  const ids=all?adapter.clipboard.map(/* Collect fixture clipboard entry identities for the requested paste scope. */ e=>e.id===selectedClip?selectedClip:e.id):[selectedClip||adapter.clipboard[0]?.id],plan=adapter.forkPlan(ids),selection=view.state.selection.main,destination=adapter.get(active),beforeSequence=destination.sequence;


  const transaction=view.state.update({changes:{from:selection.from,to:selection.to,insert:plan.text},selection:{anchor:selection.from+plan.text.length},userEvent:'input.paste'});


  view.dispatch(transaction);

  const records=[];

  let offset=selection.from;


  for(const entry of plan.entries){
   const currentSource=adapter.get(entry.document),known=entry.document===active?entry.sequence===beforeSequence:entry.sequence===currentSource.sequence;


   for(const [index,capturedUnit] of (entry.provenanceUnits??(entry.sentenceUnits??[]).map(/* Adapt older sentence-only fixture metadata to explicit provenance unit records. */ anchor=>({anchor,unitKind:'sentence'}))).entries()){const {anchor:unit,unitKind}=capturedUnit;


    const anchor=known&&entry.document===active?{...unit,from:transaction.changes.mapPos(unit.from,1),to:transaction.changes.mapPos(unit.to,-1)}:{...unit};


    const pair=provenancePair({eventId:`${plan.id}:${entry.id}:${index}`,kind:'fork',unitKind,source:{document:entry.document,title:entry.title,sequence:entry.sequence,anchor,capturedAnchor:unit},target:{document:active,title:destination.title,sequence:adapter.get(active).sequence,anchor:{from:offset+unit.from-entry.from,to:offset+unit.to-entry.from,text:unit.text}}});


    // Captured historical sources still identify the origin, but cannot fabricate a live source icon.
    if(known)records.push(pair[0]);

    records.push(pair[1]);
   }


   offset+=entry.text.length+2;
  }


  publishProvenance(records);adapter.finishFork(plan,clear);renderClipboard();renderInvestigation();notify('Independent text pasted from captured source · simulation, no graph publication.');view.focus();
 }catch(error){notify(error.message);}
}

/** Render encrypted runtime references or separate tab-only fixture clipboard controls. */
function renderClipboard(){const list=$('#clipboardItems');


 if(runtime){
  if(!runtime.clipboardSupported||['locked','uncertain'].includes(adapter.lifecycle)){list.replaceChildren();

   return;}


  renderPrivateClipboard(list,adapter,{busy:clipboardBusy,change:clipboardAction,notify,fork:runtime.forkSupported?/* Fork a committed private reference and refresh pending status even on failure. */ async(source,quote,name)=>{try{showRuntimeFork(await adapter.forkReference(source,quote,name));}finally{updateStatus();}}:null});
  appendWorkingClipboard(list,adapter,{busy:clipboardBusy,change:clipboardAction,notify,fork:/* Fork the chosen working or committed reference through its correct runtime command. */ async(source,quote,name,working)=>{try{showRuntimeFork(await (working?adapter.forkWorkingReference(source,quote,name):adapter.forkReference(source,quote,name)));}finally{updateStatus();}}});
  $('#clearClipboard').disabled=clipboardBusy||!adapter.privateClipboard.total||!!adapter.privateClipboard.pending;$('#paste').disabled=true;

  if($('#refreshClipboard'))$('#refreshClipboard').disabled=clipboardBusy;

  return;
 }


list.replaceChildren();

 for(const e of adapter.clipboard){const chip=node('div',undefined,`clip-chip ${e.id===selectedClip?'selected':''}`),b=node('button',e.text.slice(0,65));

  b.title=`${e.title} · local sequence ${e.sequence} · UTF-16 ${e.from}–${e.to}`;b.onclick=/* Select this fixture clipboard chip for the next simulated paste. */ ()=>{selectedClip=e.id;renderClipboard();};

  const remove=node('button','×');

  remove.setAttribute('aria-label',`Remove clipboard entry from ${e.title}`);remove.onclick=/* Remove this fixture entry and clear its selected-chip state if necessary. */ ()=>{adapter.remove(e.id);

   if(selectedClip===e.id)selectedClip=null;

   renderClipboard();};chip.append(b,remove);list.append(chip);}

 if(!adapter.clipboard.length)list.append(node('span','Select text to capture its source.','empty-inline'));

 $('#paste').disabled=!adapter.clipboard.length;$('#clearClipboard').disabled=!adapter.clipboard.length;}

/** Render supported durable interactions or clearly labelled synthetic demonstrations. */
function renderInteraction(){const p=$('#interactionBody');

 p.replaceChildren();

 if(runtime){if(interaction==='Comments'&&runtime.commentsSupported){renderComments(p,adapter,active,notify);

   return;}

  if(interaction==='Users'&&runtime.publicationContributorsSupported){renderPublicationContributors(p,adapter,active);

   return;}

  p.append(node('p',interaction==='Users'?'Contributor history is not yet connected.':interaction+' is not yet available in the durable runtime.'));

  return;}

 if(interaction==='Users'){p.append(node('div','CURRENT CONTEXT · SYNTHETIC','eyebrow'));

  for(const [i,c] of (adapter.get(active).fixtureFork?contributors.filter(/* Keep only explicitly pinned synthetic contributors for a fixture fork. */ c=>c.pinned):contributors).entries()){if(i===2)p.append(node('div','OTHER DOCUMENT CONTRIBUTORS','eyebrow contributor-divider'));

   const row=node('div',undefined,'contributor'),dot=node('span',c.name[0],'dot');

   dot.style.background=c.color;

   const text=node('div');

   text.append(node('strong',c.name),node('small',c.role));row.append(dot,text);p.append(row);}

  p.append(node('p','Contributor display is separate from presence. None of these identities is an authenticated account.','caption'));

  return;}


 if(interaction==='Comments'){for(const [name,text] of [['Local Writer','Could this paragraph distinguish a claim from the evidence supporting it?'],['Avery Example','Consider comparing a second interpretation before accepting this connection.']]){const c=node('article',undefined,'card');

   c.append(node('span','Synthetic annotation','tag'),node('h3',name),node('p',text));p.append(c);}

  for(const comment of comments.get(active)||[]){const card=node('article',undefined,'card'),stale=comment.context.sequence!==adapter.get(active).sequence;

   card.append(node('span','Local comment · simulation','tag'),node('h3','Local Writer'),node('p',comment.text));

   if(comment.context.text){card.append(node('p',stale?'Source changed — anchor needs review.':'Captured selection · exact local sequence'));

    const passage=node('blockquote',comment.context.text);

    card.append(passage);

    const go=node('button','Show captured passage');

    go.disabled=stale;go.onclick=/* Navigate a local comment’s captured passage only while its source sequence remains unchanged. */ ()=>{if(comment.context.sequence!==adapter.get(active).sequence){notify('Source changed — this comment anchor needs review.');renderInteraction();

      return;}

     view.dispatch({selection:{anchor:comment.context.from,head:comment.context.to},effects:EditorView.scrollIntoView(comment.context.from,{y:'center'})});view.focus();};card.append(go);}

   p.append(card);}

  const form=node('div',undefined,'agent-input'),input=node('textarea');

  input.placeholder='Add a local test comment…';input.setAttribute('aria-label','Local test comment');

  const add=node('button','Add test comment');

  add.onclick=/* Add a tab-only comment with a captured editor context. */ ()=>{if(!input.value.trim())return;

   const list=comments.get(active)||[];

   list.push({text:input.value.trim(),context:selectionContext()});comments.set(active,list);renderInteraction();notify('Comment added in this tab only.');};form.append(input,add);p.append(form,node('p','Synthetic examples and local test comments only. Reload clears comments; durable anchoring is unavailable.','caption'));

  return;}


 const msg=node('div',undefined,'agent-message'),avatar=node('div','✧','avatar'),body=node('div',undefined,'message-content');

 body.append(node('strong','Research Assistant · demonstration'),node('p','Explore the document, capture a passage, or inspect a concept. Suggestions here illustrate the workflow; no model is connected.'),node('div','How does this passage connect evidence, interpretation and authorship?','suggestion'));msg.append(avatar,body);p.append(msg);

 const composer=node('div',undefined,'agent-input'),input=node('textarea');

 input.placeholder='Ask about your writing…';input.setAttribute('aria-label','Demonstration agent prompt');

 const send=node('button','Send demo prompt');

 send.onclick=/* Explain that the demonstration prompt does not contact a provider. */ ()=>{notify('No agent connected. Your prompt stays in this tab.');};composer.append(input,send);p.append(composer,node('p','No provider requests or document disclosure.','caption'));}

/** Render local relationship meanings, qualifiers, review state and explicit removal controls. */
function renderDocumentRelationships(parent){
 parent.append(node('div','ADJACENT TEXT RELATIONSHIPS · '+title(),'eyebrow'));


 const all=view.state.field(relationshipField).records,inspected=inspectedRelationship?.document===active?all.find(/* Resolve the currently inspected relationship within this document. */ record=>record.id===inspectedRelationship.id):null,records=inspected?[inspected]:relationshipsAtCaret(view.state);


 if(!records.length)parent.append(node('p','No relationships at the current caret.','caption'));


 for(const record of records){
  const card=node('article',undefined,'card relationship-card');

  card.dataset.relationshipId=record.id;card.tabIndex=-1;
  card.classList.toggle('inspected',inspectedRelationship?.document===active&&inspectedRelationship.id===record.id);


  const connector=node('div',undefined,'relationship-connector');

  const before=node('span','↓'),after=node('span','↓');

  before.setAttribute('aria-hidden','true');after.setAttribute('aria-hidden','true');

  const symbol=relationshipType(record.predicateId)?.symbol;

  connector.append(before,node('h3',record.name),...(symbol?[node('span',symbol,'relationship-symbol')]:[]),after);
  card.append(node('span',`${record.kind} · ${record.stale?'Source changed — anchor needs review':'tab-only example'}`,'tag'),node('blockquote',record.left.text),connector,...assertionPropertyLabels(record.properties).map(/* Present each relationship qualifier as text. */ label=>node('p',label,'caption assertion-property')),node('blockquote',record.right.text));


  if(record.custom)card.append(node('span',`Custom relationship${record.categoryId?' · '+relationshipCategory(record.categoryId).label:''}`,'tag'));


  const definition=relationshipType(record.predicateId);

  if(definition){card.append(...relationshipTags(definition).map(/* Present each browsing tag separately from assertion meaning. */ tag=>node('span',tag.label,'tag')),...(definition.symbol?[node('p',`P ${definition.symbol} Q · ${definition.family}`,'caption')]:[]),node('p',`Definition: ${definition.definition}`,'caption'),node('p',`Example: ${definition.example}`,'caption'),relationshipContext(definition));

   if(definition.inverse)card.append(node('p',`Inverse label: ${definition.inverse}`,'caption'));}


  const reviewKey=active+'\0'+record.id;

  card.append(node('p',reviews.get(reviewKey)||'Proposed','caption'));


  for(const label of ['Accept','Reject','Reset']){const review=node('button',label+' relation');

   review.setAttribute('aria-label',`${label} ${record.name} relation`);review.disabled=record.stale;review.onclick=/* Update tab-only review state without claiming a durable or checked judgement. */ ()=>{reviews.set(reviewKey,label==='Accept'?'Accepted locally':label==='Reject'?'Rejected locally':'Proposed');renderInvestigation();};card.append(review);}


  const remove=node('button','Remove relationship');

  remove.setAttribute('aria-label',`Remove ${record.name} relationship`);remove.onclick=/* Remove the represented editor-local relationship through its state effect. */ ()=>{view.dispatch({effects:removeRelationship.of(record.id)});};card.append(remove);parent.append(card);
 }


 parent.append(node('p','Arrows are connection controls, not claims that a relationship is symmetric. Source edits that invalidate an anchor hide its arrow and retain a review-needed entry.','caption'));
}

/** Open a nonstale relationship in the appropriate runtime or fixture inspector. */
function inspectRelationship(id){
 const record=view.state.field(relationshipField).records.find(/* Find the exact nonstale relationship activated by its marker. */ r=>r.id===id&&!r.stale);

 if(!record)return;


 if(record.runtime){$('#investigation').classList.remove('collapsed');$('#collapseInvestigation').setAttribute('aria-expanded','true');setTab('investigation','Relationships');assertionPanel?.inspect(record.entry,record.name);

  return;}


 inspectedRelationship={document:active,id};$('#investigation').classList.remove('collapsed');$('#collapseInvestigation').setAttribute('aria-expanded','true');setTab('investigation','Relationships');


 const card=[...$('#investigationBody').querySelectorAll('.relationship-card')].find(/* Find the rendered local relationship card for focus and scrolling. */ card=>card.dataset.relationshipId===id);

 card?.focus({preventScroll:true});card?.scrollIntoView({block:'nearest'});
}

onInspectRelationship(inspectRelationship);

/** Resolve a live counterpart for a nonstale tab-only provenance endpoint. */
function provenanceTarget(record){
 if(record.stale)return null;


 const other=record.other,cached=other.document===active?view.state:states.get(other.document)?.state;


 const endpoint=cached?.field(sentenceProvenanceField).find(/* Find the matching nonstale counterpart identity in cached editor state. */ candidate=>candidate.id===other.endpointId&&!candidate.stale);


 return endpoint?{document:other.document,anchor:endpoint.anchor}:null;
}

/** Open a nonstale local provenance record for inspection. */
function inspectProvenance(id){
 const record=view.state.field(sentenceProvenanceField).find(/* Resolve the provenance marker’s exact nonstale record. */ record=>record.id===id&&!record.stale);

 if(!record)return;


 inspectedProvenance={document:active,id};$('#investigation').classList.remove('collapsed');$('#collapseInvestigation').setAttribute('aria-expanded','true');setTab('investigation','Provenance');


 const card=[...$('#investigationBody').querySelectorAll('.provenance-card')].find(/* Find the rendered provenance card for keyboard focus. */ card=>card.dataset.provenanceId===id);

 card?.focus({preventScroll:true});card?.scrollIntoView({block:'nearest'});
}

onInspectSentenceProvenance(inspectProvenance);

/** Bound provenance excerpts for compact inspection presentation. */
function provenanceExcerpt(text){return text.length>350?text.slice(0,350)+'…':text;}

/** Render tab-only provenance endpoints with explicit stale/captured-source limitations. */
function renderSentenceProvenance(parent){
 const all=view.state.field(sentenceProvenanceField),selected=inspectedProvenance?.document===active?all.find(/* Select the explicitly inspected provenance record. */ record=>record.id===inspectedProvenance.id):null,caret=view.state.selection.main.head;


 const records=selected?[selected]:all.filter(/* Find provenance records covering the caret. */ record=>caret>=record.anchor.from&&caret<=record.anchor.to);


 parent.append(node('div','PROVENANCE LINKS','eyebrow'));


 if(!records.length)parent.append(node('p','No provenance links at the current caret.','caption'));


 for(const record of records){
  const card=node('article',undefined,'card provenance-card');

  card.dataset.provenanceId=record.id;card.tabIndex=-1;card.classList.toggle('inspected',record.id===selected?.id);
  card.append(node('span',record.origin==='fixture'?'Synthetic provenance example':'Tab-only operation','tag'),node('h3',provenanceLabel(record)),node('p',`${record.unitKind??'sentence'} link`,'caption'),node('blockquote',provenanceExcerpt(record.anchor.text)),node('p',`Linked ${record.unitKind??'sentence'} · ${record.other.title}`,'caption'),node('blockquote',provenanceExcerpt(record.other.anchor.text)));


  if(record.stale)card.append(node('p','Source changed — anchor needs review.','caption'));


  const target=provenanceTarget(record),go=node('button',`Go to linked ${record.unitKind??'sentence'}`);

  go.disabled=!target;go.onclick=/* Recheck a linked endpoint before navigating and selecting its current exact range. */ async()=>{const current=provenanceTarget(record);

   if(!current){notify('The linked content needs review or its captured source is unavailable.');

    return;}

   if(current.document!==active&&!await openDocument(current.document))return;

   view.dispatch({selection:{anchor:current.anchor.from,head:current.anchor.to},effects:EditorView.scrollIntoView(current.anchor.from,{y:'center'})});view.focus();setTab('investigation','Provenance');};card.append(go);


  if(!target&&!record.stale)card.append(node('p','Captured source only — current linked sentence unavailable or changed.','caption'));


  parent.append(card);
 }


 parent.append(node('p','Provenance examples and operations stay in this tab. Semantic relationship labels do not create these links.','caption'));
}

/** Distribute tab-only provenance effects to active or cached document states. */
function publishProvenance(records){
 const byDocument=new Map();

 for(const record of records){if(!byDocument.has(record.document))byDocument.set(record.document,[]);

  byDocument.get(record.document).push(record);}


 for(const [document,links] of byDocument){if(document===active)view.dispatch({effects:addSentenceProvenance.of(links)});else{const cached=states.get(document)??{state:makeState(adapter.get(document)),scroll:0};

   states.set(document,{...cached,state:cached.state.update({effects:addSentenceProvenance.of(links)}).state});}}
}

/** Register and show a successfully created runtime document with a capability-appropriate message. */
function showRuntimeFork(record,message='Created an independent fork with retained source history.'){
 if(!documents.some(/* Avoid adding the returned runtime document twice. */ d=>d.id===record.id))documents.push({id:record.id,title:record.title,source:record.source});


 lens='Workspace';

 for(const button of $$('[data-lens]'))button.setAttribute('aria-selected',String(button.dataset.lens===lens));


 openDocument(record.id);notify(message);
}

/** Create paired synthetic provenance endpoints for whole units retained by a demo fork. */
function registerForkProvenance(context,destination){
 const source={document:active,title:title(),sequence:adapter.get(active).sequence},incoming=[],outgoing=[];


 for(const {anchor:unit,unitKind} of containedProvenanceUnits(view.state,context.from,context.to)){
  const eventId=`demo:unit-fork:${destination.id}:${unitKind}:${unit.from}`;


  const pair=provenancePair({eventId,kind:'fork',unitKind,source:{...source,anchor:unit},target:{document:destination.id,title:destination.title,sequence:0,anchor:{from:unit.from-context.from,to:unit.to-context.from,text:unit.text}}});

  outgoing.push(pair[0]);incoming.push(pair[1]);
 }


 if(outgoing.length)view.dispatch({effects:addSentenceProvenance.of(outgoing)});


 states.set(destination.id,{state:makeState(destination).update({effects:addSentenceProvenance.of(incoming)}).state,scroll:0});
}

/** Remove durable text overlays without affecting synthetic preview relationships. */
function clearTextRelations(){
 if(view?.state.field(relationshipField).records.some(/* Detect whether any displayed relationship comes from the runtime. */ record=>record.runtime))view.dispatch({effects:setRuntimeRelationships.of(null)});
}

/** Display committed relation projections only against matching active source and lifecycle state. */
function paintTextRelations(){
 if(!textRelationScope||!view)return;

 const d=adapter.get(active),cached=textRelationViews.get(editorKey(active));


 if(branchSwitching){clearTextRelations();textRelationScope.label.textContent='Text relations paused while switching editing context.';

  return;}


 if(adapter.lifecycle!=='unlocked'){textRelationViews.clear();clearTextRelations();textRelationScope.label.textContent='Text relations unavailable while locked.';

  return;}


 if(!cached||JSON.stringify(cached.snapshot)!==JSON.stringify(d.runtime.snapshot)){clearTextRelations();textRelationScope.label.textContent='Loading text relations…';

  return;}


 textRelationScope.button.disabled=!!cached.loading;


 if(cached.error){clearTextRelations();textRelationScope.label.textContent='Text relations unavailable: '+cached.error;

  return;}


 if(!cached.entries){clearTextRelations();textRelationScope.label.textContent='Loading text relations…';

  return;}


 if(d.source!==cached.source){clearTextRelations();textRelationScope.label.textContent='Text relations hidden while writing differs from the committed snapshot.';

  return;}


 try{
  const projection=projectRuntimeRelations(view.state,{...d.runtime,revision:d.runtime.base,source:cached.source,entries:cached.entries});


  const previous=view.state.field(relationshipField).records.filter(/* Compare only runtime projection records before replacing overlays. */ record=>record.runtime);


  if(JSON.stringify(previous)!==JSON.stringify(projection.records))view.dispatch({effects:setRuntimeRelationships.of({source:cached.source,text:view.state.doc.toString(),records:projection.records})});


  textRelationScope.label.textContent=`Retrospective relations · ${projection.records.length} in text · ${cached.entries.length} of ${cached.total} loaded · adjacent pairs · dotted = proposed`;
 }catch(error){clearTextRelations();textRelationScope.label.textContent='Text relations unavailable: '+error.message;}
}

/** Accept loaded relations only for their still-current buffer, snapshot and nonolder generation. */
function acceptTextRelations(documentId,buffer,data){
 if(adapter.lifecycle!=='unlocked')return;

 const d=adapter.get(documentId);

 if(d.context!==buffer||JSON.stringify(data.snapshot)!==JSON.stringify(d.runtime.snapshot))return;


 const old=textRelationViews.get(buffer);

 if(old?.generation>data.generation)return;


 textRelationViews.set(buffer,{...data,loading:false});

 if(active===documentId&&editorKey(active)===buffer)paintTextRelations();
}

/** Load bounded assertion overlays with per-buffer pending identity and exact committed source. */
function refreshTextRelations(force=false){
 if(!runtime?.assertionsSupported||!view)return;


 if(!textRelationScope){const host=node('div',undefined,'text-relation-scope'),label=node('span'),button=node('button','Refresh text relations');

  label.setAttribute('aria-live','polite');host.append(label,button);$('#editorHost').before(host);textRelationScope={label,button};button.onclick=/* Force both text-overlay and assertion-panel refresh from the explicit refresh control. */ ()=>{refreshTextRelations(true);assertionPanel?.refresh();};}


 if(branchSwitching||adapter.lifecycle!=='unlocked'){paintTextRelations();

  return;}


 const documentId=active,d=adapter.get(documentId),buffer=editorKey(documentId),old=textRelationViews.get(buffer);


 if(!force&&old&&JSON.stringify(old.snapshot)===JSON.stringify(d.runtime.snapshot)){paintTextRelations();

  return;}


 const pending={snapshot:d.runtime.snapshot,loading:true};

 textRelationViews.set(buffer,pending);paintTextRelations();
 void(/* Fetch assertion entries and their exact source while rejecting superseded pending loads. */ async()=>{try{
  const page=await adapter.assertionPage(documentId),text=await adapter.snapshot(documentId,page.snapshot);


  if(textRelationViews.get(buffer)!==pending||adapter.lifecycle!=='unlocked')return;


  acceptTextRelations(documentId,buffer,{snapshot:page.snapshot,source:text.text,entries:page.entries,generation:page.generation,next:page.next,total:page.total});
 }catch(error){if(textRelationViews.get(buffer)===pending){pending.loading=false;pending.error=error.message;

    if(active===documentId&&editorKey(active)===buffer)paintTextRelations();}}})();
}

/** Map the caret to exact owned UTF8 coordinates for runtime assertion inspection. */
function assertionContext(){const d=adapter.get(active),position=view.state.selection.main.head,range=ownedRange(d.source,view.state.doc.toString(),position,position);

 return {document:d.runtime.document,snapshot:d.runtime.snapshot,source:d.source,caret_byte:new TextEncoder().encode(d.source.slice(0,range.from)).length};}

/** Render current investigation panels while preserving buffer-scoped durable panel identity. */
function renderInvestigation(){if(!view)return;

 if(runtime){const p=$('#investigationBody');

  if(investigation==='Relationships'&&p.dataset.assertionDocument===editorKey(active)&&p.firstElementChild){assertionPanel?.update();

   return;}

  if((investigation==='History'&&p.dataset.historyDocument===editorKey(active)||investigation==='Provenance'&&p.dataset.derivationDocument===editorKey(active))&&p.firstElementChild)return;

  p.replaceChildren();delete p.dataset.historyDocument;delete p.dataset.derivationDocument;delete p.dataset.assertionDocument;

  if(investigation==='History'){renderHistory(p,adapter,active,notify);p.dataset.historyDocument=editorKey(active);}else if(investigation==='Relationships'&&runtime.assertionsSupported){assertionPanel=renderAssertionOverlay(p,adapter,active,assertionContext,notify,{history:runtime.assertionHistorySupported,onLoaded:(/* Capture the panel’s originating buffer and document for asynchronous overlay results. */ (buffer,documentId)=>/* Accept loaded overlay data only against its captured origin. */ data=>acceptTextRelations(documentId,buffer,data))(editorKey(active),active)});p.dataset.assertionDocument=editorKey(active);}else if(investigation==='Provenance'&&runtime.forkSupported){renderDerivation(p,adapter,active,notify);p.dataset.derivationDocument=editorKey(active);}else p.append(node('p',investigation+' is not yet connected to durable storage.'));

  return;}

 const p=$('#investigationBody'),record=investigation==='Relationships'&&inspectedRelationship?.document===active?view.state.field(relationshipField).records.find(/* Resolve the explicitly inspected fixture relationship. */ r=>r.id===inspectedRelationship.id):null,ctx=record?{...selectionContext(),text:record.left.text+' → '+record.right.text}:investigation==='Relationships'?selectionContext():pinned||selectionContext();

 p.replaceChildren();

 const c=node('div',`${record?'Inspecting relationship':pinned&&investigation!=='Relationships'?'Pinned':'Following editor'} · ${ctx.title} · local sequence ${ctx.sequence}`,'context-label');

 if(record&&pinned)c.append(node('p','Pinned editor context retained.','caption'));

 if(ctx.text)c.append(node('blockquote',ctx.text));

 p.append(c);


 if(investigation==='Concepts'){p.append(node('div','SYNTHETIC CONCEPTS','eyebrow'));

  for(const [name,description] of [['Interpretation','An account of what a passage or observation means. Multiple formulations may coexist.'],['Evidence','Material offered in support of a claim, considered within its context.']]){const card=node('article',undefined,'card');

   card.append(node('span','Example concept','tag'),node('h3',name),node('p',description));

   const b=node('button','Go to example occurrence →');

   b.onclick=/* Navigate a synthetic concept example without claiming authoritative graph search. */ ()=>{const text=view.state.doc.toString(),at=text.toLowerCase().indexOf(name.toLowerCase());

    if(at>=0)jump(at);else notify('No matching synthetic occurrence in this document.');};card.append(b);p.append(card);}}
 else if(investigation==='Relationships'){renderDocumentRelationships(p);}
 else if(investigation==='Provenance'){renderSentenceProvenance(p);p.append(node('div','LOCAL SIMULATION LOG','eyebrow'));

  for(const op of adapter.pastes.slice(-8).reverse()){const c=node('article',undefined,'card');

   c.append(node('h3',op.id),node('p',`Captured input: ${op.sources.map(/* Describe each simulated paste input with its captured local source sequence. */ s=>`${s.document} at sequence ${s.sequence}`).join(', ')}`));p.append(c);}

  p.append(node('p','This tab log is not canonical provenance. No graph records or immutable revisions are published.','caption'));}
 else if(investigation==='Sources'){const card=node('article',undefined,'card');

  card.append(node('h3','Citation sources'),node('p','Zotero desktop and cloud adapters are planned. No library, credentials or external source is connected.'));p.append(card);}
 else p.append(node('p','No durable history or snapshots exist in this preview. Local undo/redo changes your working text; reloading resets the fixture.','caption'));}

/** Select an interaction/investigation tab and update accessible selection state. */
function setTab(kind,name){if(kind==='interaction'){interaction=name;renderInteraction();}else{investigation=name;renderInvestigation();}

 for(const b of $$(`[data-${kind}]`))b.setAttribute('aria-selected',String(b.dataset[kind]===name));}

for(const list of $$('[role=tablist]'))list.addEventListener('keydown',/* Provide standard roving tab activation with arrows, Home and End. */ e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;

 const buttons=[...list.querySelectorAll('[role=tab]')],current=buttons.indexOf(document.activeElement);

 if(current<0)return;

 e.preventDefault();

 const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(current+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;

 buttons[next].focus();buttons[next].click();});

for(const b of $$('[data-interaction]'))b.onclick=/* Select the interaction tab represented by this control. */ ()=>setTab('interaction',b.dataset.interaction);

for(const b of $$('[data-investigation]'))b.onclick=/* Select the investigation tab represented by this control. */ ()=>setTab('investigation',b.dataset.investigation);

for(const b of $$('[data-lens]'))b.onclick=/* Change the navigation lens and force current-heading follow when appropriate. */ ()=>{lens=b.dataset.lens;

 for(const x of $$('[data-lens]'))x.setAttribute('aria-selected',String(x===b));

 renderNavigation();scheduleTreeFollow('caret',true);};

for(const b of $$('[data-format]')){b.onmousedown=/* Preserve editor selection while pressing a formatting button. */ e=>e.preventDefault();b.onclick=/* Apply the selected inline/block action or insert an explicit table source template. */ ()=>{const action=b.dataset.format;

  if(action==='bold')wrap('**');else if(action==='italic')wrap('*');else if(['quote','bullet','number'].includes(action))toggleBlock(action);else{const pos=view.state.selection.main.to;

   view.dispatch({changes:{from:pos,insert:'\n\n| Column 1 | Column 2 |\n| --- | --- |\n| Value | Value |\n\n'},userEvent:'input.table'});view.focus();}};}

/** Reflect actual selection formatting and heading state in toolbar pressed states. */
function updateBlockStyle(){const formats=formattingState(view.state);

 for(const button of $$('[data-format]')){if(button.dataset.format in formats)button.setAttribute('aria-pressed',String(formats[button.dataset.format]));}

 const block=blockStyleState(view.state);

 for(const button of $$('[data-block-style]')){const level=Number(button.dataset.blockStyle);

  button.setAttribute('aria-pressed',String(level===0?block.paragraph:block.headingLevel===level));}}

for(const button of $$('[data-block-style]')){button.onmousedown=/* Preserve editor selection while pressing a heading-style button. */ e=>e.preventDefault();button.onclick=/* Replace selected line prefixes with the requested heading level in one transaction. */ ()=>{const level=Number(button.dataset.blockStyle),selection=view.state.selection.main,first=view.state.doc.lineAt(selection.from),last=view.state.doc.lineAt(selection.to>selection.from&&view.state.doc.lineAt(selection.to).from===selection.to?selection.to-1:selection.to),changes=[];

  for(let n=first.number;n<=last.number;n++){const line=view.state.doc.line(n);

   changes.push({from:line.from,to:line.to,insert:'#'.repeat(level)+(level?' ':'')+line.text.replace(/^#{1,6}\s+/,'')});}

  view.dispatch({changes,userEvent:'input.format'});updateBlockStyle();view.focus();};}

$('#undo').onclick=/* Undo one editor history step and restore editor focus. */ ()=>{undo(view);view.focus();};
$('#redo').onclick=/* Redo one editor history step and restore editor focus. */ ()=>{redo(view);view.focus();};
$('#capture').onclick=capture;
$('#paste').onclick=/* Paste the selected synthetic clipboard entry. */ ()=>paste();
$('#clearClipboard').onclick=/* Clear tab-only clipboard and selection state. */ ()=>{adapter.clipboard=[];selectedClip=null;renderClipboard();};

$('#previous').onclick=/* Navigate to the preceding document in the shell’s ordered list. */ ()=>openDocument(documents[documents.findIndex(/* Locate the active document before choosing its predecessor. */ d=>d.id===active)-1].id);
$('#next').onclick=/* Navigate to the next document in the shell’s ordered list. */ ()=>openDocument(documents[documents.findIndex(/* Locate the active document before choosing its successor. */ d=>d.id===active)+1].id);

$('#pinContext').onclick=/* Toggle a captured inspection context without changing editor source. */ ()=>{pinned=pinned?null:selectionContext();$('#pinContext').setAttribute('aria-pressed',String(!!pinned));$('#pinContext').textContent=pinned?'◆ Unpin':'◇ Pin context';renderInvestigation();};

$('#download').onclick=/* Download exact uncommitted owned text rather than substituting the runtime display projection. */ ()=>{const bytes=runtime?adapter.get(active).source:view.state.doc.toString(),blob=new Blob([bytes],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=node('a');

 a.href=url;a.download=`hypergraph-demo-${adapter.get(active).fixtureFork?'fork-'+active.split(':').at(-1):documents.findIndex(/* Find the active document’s ordinal for the download filename. */ d=>d.id===active)+1}-uncommitted.md`;a.click();setTimeout(/* Release the temporary download URL after the browser can use it. */ ()=>URL.revokeObjectURL(url),1000);notify('Requested download of this exact uncommitted tab buffer.');};

$('#markdownSource').onchange=/* Change Markdown presentation and refresh miniature geometry. */ ()=>{applyPresentation();scheduleMap();};
$('#mathMode').onchange=/* Change mathematical presentation and retain the display preference. */ ()=>{applyPresentation();scheduleMap();savePreferences();};
$('#authors').onchange=/* Toggle attribution display and retain the preference. */ ()=>{document.body.classList.toggle('authors-on',$('#authors').checked);savePreferences();};
$('#fontSize').oninput=/* Apply the chosen font size and remeasure the minimap. */ ()=>{document.documentElement.style.setProperty('--font-size',$('#fontSize').value+'px');$('#fontValue').textContent=$('#fontSize').value;savePreferences();scheduleMap();};
$('#wrap').onchange=/* Apply the chosen wrap width and remeasure the minimap. */ ()=>{document.documentElement.style.setProperty('--wrap',$('#wrap').value+'ch');savePreferences();scheduleMap();};
$('#theme').onclick=/* Toggle display theme and retain the preference. */ ()=>{document.body.classList.toggle('light');savePreferences();};

/** Persist optional appearance/navigation preferences without storing document content. */
function savePreferences(){try{localStorage.setItem('hypergraph-display-v1',JSON.stringify({light:document.body.classList.contains('light'),wrap:Number($('#wrap').value),font:Number($('#fontSize').value),authors:$('#authors').checked,redCaret:$('#redCaret').checked,dragSnapping:$('#dragSnapping').checked,math:$('#mathMode').value,upper:parseFloat($('.right-sidebar').style.getPropertyValue('--upper'))||48,navigatorVisible,navigatorSide,followTree:$('#followTree').checked,columnWidths:columnWidths?.values()??{outline:226,sidebar:348}}));}catch{/* Appearance persistence is optional. */}}

/** Restore only validated display preferences and tolerate unavailable local storage. */
function loadPreferences(){try{const p=JSON.parse(localStorage.getItem('hypergraph-display-v1')||'{}');

  document.body.classList.toggle('light',p.light===true);

  if([60,80,100,120].includes(p.wrap))$('#wrap').value=p.wrap;

  if(Number.isInteger(p.font)&&p.font>=13&&p.font<=23)$('#fontSize').value=p.font;

  $('#authors').checked=p.authors===true;$('#followTree').checked=p.followTree===true;$('#redCaret').checked=p.redCaret!==false;$('#dragSnapping').checked=p.dragSnapping!==false;$('#mathMode').value=p.math==='rendered'?'rendered':'source';

  if(Number.isFinite(p.upper))setSplit(p.upper);

  columnWidths?.restore(p.columnWidths);navigatorVisible=p.navigatorVisible!==false;navigatorSide=p.navigatorSide==='left'?'left':'right';document.documentElement.style.setProperty('--wrap',$('#wrap').value+'ch');document.documentElement.style.setProperty('--font-size',$('#fontSize').value+'px');$('#fontValue').textContent=$('#fontSize').value;document.body.classList.toggle('authors-on',$('#authors').checked);}catch{}

 applyCaretPreference();applyNavigatorPreferences();}

/** Clamp the investigation/interaction split and expose its accessible percentage. */
function setSplit(value){const v=Math.max(20,Math.min(75,value));

 $('.right-sidebar').style.setProperty('--upper',v+'%');$('#panelDivider').setAttribute('aria-valuenow',Math.round(v));}

const divider=$('#panelDivider');
divider.onkeydown=/* Adjust sidebar split with keyboard controls and persist the resulting preference. */ e=>{if(!['ArrowUp','ArrowDown','Home'].includes(e.key))return;

 e.preventDefault();setSplit(e.key==='Home'?48:Number(divider.getAttribute('aria-valuenow'))+(e.key==='ArrowDown'?3:-3));savePreferences();};
divider.onpointerdown=/* Capture a primary-pointer sidebar-divider drag. */ e=>{if(e.button!==0)return;

 divider.setPointerCapture(e.pointerId);/* Convert pointer height into the clamped sidebar split percentage. */

 const move=ev=>{const box=$('.right-sidebar').getBoundingClientRect();

  setSplit((ev.clientY-box.top)/box.height*100);};/* Remove drag listeners and persist the completed divider position. */

 const end=()=>{divider.removeEventListener('pointermove',move);divider.removeEventListener('pointerup',end);divider.removeEventListener('pointercancel',end);savePreferences();};

 divider.addEventListener('pointermove',move);divider.addEventListener('pointerup',end);divider.addEventListener('pointercancel',end);};

for(const name of ['Interaction','Investigation'])$(`#collapse${name}`).onclick=/* Toggle the requested sidebar panel and synchronise its accessible expanded state. */ ()=>{const panel=$('#'+name.toLowerCase());

 panel.classList.toggle('collapsed');$(`#collapse${name}`).setAttribute('aria-expanded',String(!panel.classList.contains('collapsed')));};

bindMinimap($('#mapTrack'),$('#mapViewport'),/* Supply the current editor instance to minimap navigation. */ ()=>view);

$('#mapViewport').onkeydown=/* Scroll the editor from accessible minimap keyboard controls. */ e=>{if(!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))return;

 e.preventDefault();

 const el=view.scrollDOM;

 el.scrollTop=e.key==='Home'?0:e.key==='End'?el.scrollHeight:el.scrollTop+(e.key==='ArrowUp'||e.key==='PageUp'?-1:1)*(e.key.startsWith('Page')?el.clientHeight:60);};

/** Open relationship creation with exact participants and current-source validation callbacks. */
function addSelectedRelations(context,choice){
 if(!choice)return;


 openRelationshipDialog({
  participantText:runtime?/* Read each runtime participant from exact owned text rather than LF display text. */ unit=>ownedRange(adapter.get(active).source,view.state.doc.toString(),unit.from,unit.to).text:undefined,runtime:!!runtime,editorElement:/* Supply the editor pane used to position the chooser. */ ()=>$('.editor-pane'),
  current:/* Require the chooser’s captured document and local sequence to remain current. */ captured=>active===captured.document&&adapter.get(active).sequence===captured.sequence,
  restore:/* Restore chooser selection only while the captured context still matches. */ captured=>{if(active===captured.document&&adapter.get(active).sequence===captured.sequence)view.dispatch({selection:{anchor:captured.anchor,head:captured.head}});},
  focusEditor:/* Return focus to the editor after the relationship chooser closes. */ ()=>view.focus(),inspect:runtime?/* Refresh durable assertion inspection after successful runtime creation. */ ()=>{const p=$('#investigationBody');

  delete p.dataset.assertionDocument;setTab('investigation','Relationships');}:inspectRelationship,
  create:/* Create a runtime pinned assertion or validated tab-only preview from the captured pair. */ (captured,selected,relationship)=>{
   if(active!==captured.document||adapter.get(active).sequence!==captured.sequence)throw Error('The selected source changed. Select it again.');


   if(runtime){
    const source=adapter.get(captured.document).source,display=view.state.doc.toString(),encoder=new TextEncoder(),inputs=[['source',selected.pair.left],['target',selected.pair.right]].map(/* Convert each participant’s display range into exact owned UTF8 offsets and quote. */ ([role,unit])=>{const range=ownedRange(source,display,unit.from,unit.to);

    return {role,start_byte:encoder.encode(source.slice(0,range.from)).length,end_byte:encoder.encode(source.slice(0,range.to)).length,quote:range.text};});


    return adapter.createAssertion(captured.document,inputs,relationship);
   }


   const before=view.state.field(relationshipField).serial;

  view.dispatch({effects:addRelationship.of({...selected,...relationship})});

  const value=view.state.field(relationshipField);


   if(!value.lastAddedId)throw Error('Those units are no longer an eligible adjacent pair.');


   notify(value.serial===before?'This assertion already exists; showing its relationship.':'Relationship added in this tab only. No graph record was published.');

  return value.lastAddedId;
  }
 },context,choice);
}

/** Build contextual actions while separating current runtime capabilities from fixture simulations. */
function contextMenu(event,pos){event.preventDefault?.();

 const menu=$('#contextMenu');

 menu.replaceChildren();

 const relationContext={...selectionContext()},relationChoice=selectedRelationshipPair(view.state);

 if(runtime){menu.append(node('p','Attribution: unknown original authorship.','caption'));

  if(runtime.assertionsSupported){const add=node('button','Add relations');

   add.setAttribute('role','menuitem');add.disabled=!relationChoice||adapter.lifecycle!=='unlocked';add.onclick=/* Close the context menu and open runtime relationship creation for the captured pair. */ ()=>{menu.hidden=true;addSelectedRelations(relationContext,relationChoice);};menu.append(add);}else menu.append(node('p','Graph actions will be enabled as durable services are added.','caption'));

  menu.hidden=false;menu.style.left=Math.min(event.clientX,innerWidth-320)+'px';menu.style.top=Math.min(event.clientY,innerHeight-80)+'px';

  return;}

 const author=getAuthorAt(view.state,pos);

 menu.append(node('p',`Attribution: ${author.name} · synthetic`,'caption'));

 for(const [label,action,enabled] of [['Add relations',/* Open fixture relationship creation for the captured pair. */ ()=>addSelectedRelations(relationContext,relationChoice),!!relationChoice],['Copy selection to provenance clipboard',capture,!view.state.selection.main.empty],['Simulate fork paste',/* Simulate paste of the selected fixture reference. */ ()=>paste(),!!adapter.clipboard.length],['Simulate fork paste and clear',/* Simulate paste and clear the consumed fixture clipboard. */ ()=>paste(true),!!adapter.clipboard.length],['Simulate paste all and clear',/* Simulate paste of all fixture entries and clear them. */ ()=>paste(true,true),!!adapter.clipboard.length],['Transclude · Rust service unavailable',/* Leave unavailable transclusion without an executable fixture action. */ ()=>{},false]]){const b=node('button',label);

  b.setAttribute('role','menuitem');b.disabled=!enabled;b.onclick=/* Close the context menu before executing its selected action. */ ()=>{menu.hidden=true;action();};menu.append(b);}

 menu.hidden=false;menu.style.left=Math.max(0,Math.min(event.clientX,innerWidth-menu.offsetWidth-10))+'px';menu.style.top=Math.max(0,Math.min(event.clientY,innerHeight-menu.offsetHeight-10))+'px';menu.querySelector('button:not(:disabled)')?.focus();}

onMathContext(/* Open contextual actions at the mathematical source start. */ (e,x)=>contextMenu(e,x.from));
onTableContext(/* Open contextual actions at the table’s mapped source position. */ (e,x)=>contextMenu(e,x.sourcePosition));

document.addEventListener('pointerdown',/* Dismiss context actions after a pointer gesture outside the menu. */ e=>{if(!$('#contextMenu').contains(e.target))$('#contextMenu').hidden=true;});
document.addEventListener('keydown',/* Dismiss context actions with Escape and restore editor focus. */ e=>{if(e.key==='Escape'&&!$('#contextMenu').hidden){$('#contextMenu').hidden=true;view.focus();}});

const docking=installWorkspaceDocking($('.workspace'),{onLayout:/* Reapply widths and remeasure editor/minimap after docking layout changes. */ ()=>{columnWidths?.apply();view?.requestMeasure();scheduleMap();}});

installWorkspaceLayoutControls(docking,{onLayout:/* Reapply widths and remeasure editor/minimap after layout-control actions. */ ()=>{columnWidths?.apply();view?.requestMeasure();scheduleMap();},focusEditor:/* Return focus to an existing editor after workspace layout controls. */ ()=>view?.focus()});

columnWidths=installColumnWidths($('.workspace'),{onLayout:/* Remeasure editor and minimap after column-width changes. */ ()=>{view?.requestMeasure();scheduleMap();},onSave:savePreferences,sizing:docking});
loadPreferences();
view=new EditorView({parent:$('#editorHost'),state:makeState(adapter.get(active))});
view.scrollDOM.addEventListener('wheel',/* Treat direct editor wheel input as scroll-driven tree navigation. */ ()=>{treeNavigationMode='scroll';},{passive:true});
view.scrollDOM.addEventListener('pointerdown',/* Recognise scrollbar-track gestures as scroll-driven tree navigation. */ event=>{if(event.target===view.scrollDOM)treeNavigationMode='scroll';});
view.scrollDOM.addEventListener('scroll',/* Update minimap and switch tree following to scroll when caret leaves the viewport. */ ()=>{scheduleMap();

 if(treeNavigationMode==='caret'){const caret=view.coordsAtPos(view.state.selection.main.head),box=view.scrollDOM.getBoundingClientRect();

  if(!caret||caret.bottom<box.top||caret.top>box.bottom)treeNavigationMode='scroll';}

 scheduleTreeFollow(treeNavigationMode);},{passive:true});
for(const event of ['wheel','pointerdown','keydown'])$('#documentNavigator').addEventListener(event,/* Treat Navigator gestures as deliberate scroll navigation. */ ()=>{treeNavigationMode='scroll';},{passive:true});
view.dom.addEventListener('contextmenu',/* Open the source-position context menu only when another handler has not consumed it. */ e=>{if(e.defaultPrevented)return;

 const p=view.posAtCoords({x:e.clientX,y:e.clientY});

 contextMenu(e,p??view.state.selection.main.head);});
view.dom.addEventListener('keydown',/* Offer keyboard context actions at the current caret’s screen rectangle. */ e=>{if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){const rect=view.coordsAtPos(view.state.selection.main.head)||view.dom.getBoundingClientRect();

  contextMenu({preventDefault:/* Suppress the original keyboard context-menu action when the custom menu handles it. */ ()=>e.preventDefault(),clientX:rect.left,clientY:rect.bottom},view.state.selection.main.head);}});
view.dom.addEventListener('click',/* Follow permitted editor links while preserving source editing and nonempty selections. */ event=>{const link=event.target.closest?.('a.cm-editor-link');

 if(!link)return;

 if($('#markdownSource').checked||!view.state.selection.main.empty&&!event.ctrlKey&&!event.metaKey){event.preventDefault();

  return;}

 const target=link.getAttribute('href');

 if(target?.startsWith('#')){event.preventDefault();

  let anchor;

  try{anchor=decodeURIComponent(target.slice(1));}catch{return;}

  const heading=documentHeadings(view.state.doc.toString()).find(/* Resolve the current decoded heading anchor without guessing a replacement target. */ item=>item.anchor===anchor);

  if(heading)jump(heading.from);else notify('This heading is no longer in the document.');}});
new ResizeObserver(scheduleMap).observe($('#editorHost'));
applyPresentation();
functionsBar=installFunctionsBar({runtime:!!runtime,forkSupported:runtime?.forkSupported,canFork:/* Allow runtime Fork only when unlocked and no earlier Fork remains unresolved. */ ()=>adapter.lifecycle==='unlocked'&&!adapter.forkPending,exactSelection:/* Read the toolbar’s exact owned selection for runtime source previews. */ context=>runtime?ownedRange(view.state.field(ownedSource),view.state.doc.toString(),context.from,context.to).text:view.state.sliceDoc(context.from,context.to),createRuntimeFork:/* Map a checked selected range to UTF8 before issuing runtime Fork and updating status. */ async(context,name)=>{const range=ownedRange(view.state.field(ownedSource),view.state.doc.toString(),context.from,context.to),source=adapter.get(context.document).source,bytes=new TextEncoder();

 try{const record=await adapter.forkSource(context.document,bytes.encode(source.slice(0,range.from)).length,bytes.encode(source.slice(0,range.to)).length,range.text,name);

  showRuntimeFork(record);}finally{updateStatus();}},canEdit:/* Allow editing only outside locked, read-only and branch-transition states. */ ()=>!runtime||adapter.lifecycle==='unlocked'&&!branchSwitching&&!view.state.readOnly,getContext:selectionContext,getDocument:/* Expose detached adapter document state to selection commands. */ id=>adapter.get(id),listDocuments:/* List original and tab-only fork documents for chooser previews. */ ()=>[...documents,...localForks],notify,focusEditor:/* Return editor focus after selection-tool dialogs. */ ()=>view.focus(),restoreContext:/* Restore a toolbar selection only when document, branch buffer and sequence still match. */ context=>{if(context&&active===context.document&&context.buffer===editorKey(active)&&adapter.get(active).sequence===context.sequence)view.dispatch({selection:{anchor:context.anchor??context.from,head:context.head??context.to}});},insertLink:/* Insert a heading link with exact source annotation when runtime projection changes newlines. */ (context,heading,label)=>{const source=markdownHeadingLink(label,heading);

 view.dispatch({changes:{from:context.from,to:context.to,insert:runtime?editorProjection(source):source},annotations:runtime?[exactInsertion.of({from:context.from,to:context.to,source})]:[],userEvent:'input.link'});view.focus();},createFork:/* Create a fixture-only independent fork and retain its synthetic attribution/provenance. */ (context,name)=>{const attribution=view.state.field(authorshipField).map(/* Clip each author span to the selected fixture fork and rebase its positions. */ span=>({from:Math.max(span.from,context.from)-context.from,to:Math.min(span.to,context.to)-context.from,author:span.author})).filter(/* Exclude empty attribution spans from the fixture fork. */ span=>span.to>span.from);

 const record=adapter.createFork(context,name,attribution);

 registerForkProvenance(context,record);localForks.push(record);lens='Workspace';

 for(const button of $$('[data-lens]'))button.setAttribute('aria-selected',String(button.dataset.lens===lens));

 openDocument(record.id);notify('Created an independent demo fork in this tab. Original source unchanged.');}});
refreshAll();
window.addEventListener('beforeunload',/* Warn before unload when runtime work is unresolved or fixture-only changes would be lost. */ e=>{if(runtime){if(branchSwitching||adapter.branchPending||adapter.workingClipboard.pending||adapter.creationPending||adapter.forkPending||adapter.mergePending||adapter.assertions.pending||adapter.comments.pending||adapter.privateClipboard.pending||clipboardBusy||adapter.lifecycle==='uncertain'||adapter.allBuffers().some(/* Detect unacknowledged or uncertain retained runtime buffers. */ d=>d.pending||d.sequence>d.acknowledged)){e.preventDefault();e.returnValue='';}

  return;}

 if(relationshipEdits||[...adapter.docs.values()].some(/* Detect locally edited fixture documents. */ d=>d.sequence)||adapter.clipboard.length||comments.size||reviews.size||localForks.length){e.preventDefault();e.returnValue='';}});

installTooltips();

/** Apply Navigator visibility and side without changing editor source state. */
function applyNavigatorPreferences(){
 const workspace=$('.workspace'),navigator=$('#documentNavigator'),editor=$('.editor-pane');


 workspace.classList.toggle('navigator-hidden',!navigatorVisible);
 workspace.classList.toggle('navigator-left',navigatorSide==='left');


 const surface=$('.editor-surface')??workspace;


  surface.insertBefore(navigator,navigatorSide==='left'?editor:editor.nextSibling);
 $('#navigatorToggle').setAttribute('aria-pressed',String(navigatorVisible));
 $('#navigatorToggle').setAttribute('aria-label',navigatorVisible?'Hide navigator':'Show navigator');
 $('#navigatorSide').setAttribute('aria-label',navigatorSide==='left'?'Move navigator to right':'Move navigator to left');
 $('#navigatorSide').textContent=navigatorSide==='left'?'Right →':'← Left';
 columnWidths?.apply();view?.requestMeasure();scheduleMap();
}

$('#navigatorToggle').onclick=/* Toggle Navigator visibility and retain the display preference. */ ()=>{navigatorVisible=!navigatorVisible;applyNavigatorPreferences();savePreferences();};

$('#navigatorSide').onclick=/* Move Navigator to the opposite side, retain preferences and preserve control focus. */ ()=>{navigatorSide=navigatorSide==='left'?'right':'left';applyNavigatorPreferences();savePreferences();$('#navigatorSide').focus({preventScroll:true});};

/** Apply the optional red caret display preference. */
function applyCaretPreference(){document.body.classList.toggle('red-caret',$('#redCaret').checked);}

$('#redCaret').onchange=/* Update caret display and persist the preference. */ ()=>{applyCaretPreference();savePreferences();};

$('#dragSnapping').onchange=savePreferences;

document.fonts?.addEventListener('loadingdone',/* Remeasure editor geometry after fonts finish loading. */ ()=>{view.requestMeasure();scheduleMap();});

$('#followTree').onchange=/* Reset tree-follow target when the preference changes and follow immediately when enabled. */ ()=>{savePreferences();lastFollowTarget=null;

 if($('#followTree').checked)scheduleTreeFollow('caret',true);};

$('#toggleAllTree').onclick=/* Set all document heading disclosures consistently after cancelling pending follow work. */ ()=>{
 if(treeFrame!==null){cancelAnimationFrame(treeFrame);treeFrame=null;treeForce=false;}


 allTreeClosed=!allTreeClosed;expanded.clear();


 for(const record of [...documents,...localForks]){outlineTree.setAll(record.id,documentHeadings(editorProjection(adapter.get(record.id).source)),allTreeClosed);

  if(!allTreeClosed)expanded.add(record.id);}


 updateTreeControls();renderNavigation();
};

scheduleTreeFollow('scroll',true);

if(runtime){
 $('.document-bar .subtle').textContent='Local workspace';
 $('.demo-badge').textContent='Encrypted local workspace';


 const foot=$('.navigator-foot');

 foot.replaceChildren($('.tree-controls'),node('span','Local workspace · HTTPS'));
 $('footer > span:last-child').textContent='Trusted-server mode · local runtime';
 $('.clipboard').hidden=!runtime.clipboardSupported;


 if(runtime.clipboardSupported){
  $('.clipboard').setAttribute('aria-label','Private provenance clipboard');$('.clipboard-label span').textContent='· private encrypted workspace';
  $('#capture').textContent='Copy source reference';$('#paste').textContent='Paste as fork · unavailable';
  $('#capture').onmousedown=/* Preserve editor selection before runtime reference capture. */ event=>event.preventDefault();
  $('#clearClipboard').onclick=/* Clear the runtime private clipboard through the guarded UI action path. */ ()=>clipboardAction(/* Submit clear against the current clipboard generation. */ ()=>adapter.changeClipboard({action:'clear',generation:adapter.privateClipboard.generation}));


  const refresh=node('button','Refresh clipboard');

  refresh.id='refreshClipboard';refresh.onclick=/* Refresh runtime clipboard controls through the guarded UI action path. */ ()=>clipboardAction(/* Reload committed and working references and reconcile recorded promotions. */ async()=>{await adapter.loadClipboard();

   if(runtime.workingCopySupported){await adapter.loadWorkingClipboard();await adapter.reconcileWorkingReferences();}});

  const controls=node('div',undefined,'clipboard-controls');

  controls.append(refresh,$('#clearClipboard'));$('.clipboard-label').append(controls);
 }

 $('#authors').checked=false;$('#authors').disabled=true;document.body.classList.remove('authors-on');


 for(const tab of $$('[data-interaction] small'))tab.remove();


 const controls=node('div',undefined,'runtime-actions');


 if(runtime.auditSupported){const audit=node('button','Check integrity');

  audit.id='runtimeAudit';audit.onclick=/* Open the bounded integrity-audit inspector for the active document. */ ()=>openDocumentAudit(adapter,active);controls.append(audit);}


 if(runtime.branchesSupported){const branches=node('button','Branches');

  branches.id='runtimeBranches';branches.onclick=/* Open branch inspection with the originating document captured. */ ()=>{const id=active;

   openBranches(adapter,id,{select:/* Switch the captured document to the branch chosen by its inspector. */ branch=>switchBranch(id,branch),notify});};controls.append(branches);}

 const keychainButton=node('button','Keychain');


 keychainButton.onclick=/* Inspect keychain status and offer explicit enrollment/removal with recovery limitations. */ async()=>{
  keychainButton.disabled=true;


  try{
   const status=await adapter.keychainStatus(),dialog=node('dialog');

   dialog.className='function-dialog';
   dialog.append(node('h2','Workspace keychain unlock'),node('p',!status.supported?'Keychain unlock is unavailable on this platform.':status.cleanup_pending?'A keychain item still needs cleanup. Retry removal before enrolling again.':status.enrolled?'This workspace can be unlocked through macOS Keychain. Your passphrase remains available for recovery.':'Enable macOS Keychain unlock for this workspace. Keep your passphrase for recovery on another device.'));


   if(status.supported&&!status.enrolled&&!status.cleanup_pending)dialog.append(node('p','Enabling creates and verifies an encrypted backup beside the workspace before upgrading its format. Older versions of Hypergraph PX may be unable to open the upgraded workspace.'));


   if(status.enrolled||status.cleanup_pending)dialog.append(node('p','Removal disables this workspace’s keychain wrapper before deleting its keychain item. Old copies and backups can retain earlier access. Retry failed cleanup before locking or closing; pending cleanup is held only in memory.'));


   const message=node('p');

   message.setAttribute('role','status');dialog.append(message);


   const actions=node('div',undefined,'dialog-actions'),close=node('button','Close');

   close.onclick=/* Close and remove the keychain dialog without changing enrollment. */ ()=>{dialog.close();dialog.remove();};


   if(status.supported){const action=status.enrolled||status.cleanup_pending?'remove':'enroll',apply=node('button',action==='enroll'?'Enable keychain unlock':'Remove keychain unlock');


    apply.onclick=/* Execute the explicit keychain action while suspending edits and conflicting dialog controls. */ async()=>{apply.disabled=close.disabled=true;dialog.oncancel=/* Prevent dialog cancellation while keychain outcome is unresolved. */ event=>event.preventDefault();clearTimeout(checkpointTimer);


     try{const operation=adapter.keychain(action);

      view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});await operation;message.textContent=action==='enroll'?'Keychain enrollment confirmed. Passphrase recovery remains available.':'Keychain enrollment removed.';}
     catch(error){message.textContent=error.message==='keychain_cleanup_pending'?'Keychain cleanup is pending. Close this dialog and choose Keychain again to retry removal. Passphrase recovery remains available.':error.message==='keychain_item_exists'?'An existing keychain item could not be verified. It was left unchanged. Use your passphrase.':error.message==='keychain_denied'?'Keychain access was denied or canceled. Passphrase recovery remains available.':error.message;}
     finally{close.disabled=false;dialog.oncancel=null;view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});updateStatus();}
    };actions.append(apply);
   }


   actions.append(close);dialog.append(actions);document.body.append(dialog);dialog.showModal();
  }catch(error){notify(error.message);}finally{keychainButton.disabled=false;}
 };


 const mergeButton=$('#mergeSelection'),retryMerge=node('button','Retry merge');

 retryMerge.id='retryMerge';retryMerge.hidden=true;
 mergeButton.disabled=!runtime.mergeSupported;mergeButton.onclick=/* Open reviewed Merge only when unlocked and no prior Merge is pending. */ ()=>{if(adapter.lifecycle!=='unlocked'||adapter.mergePending){notify('Retry the pending merge before creating another.');

   return;}

  openMergeComposer(adapter,notify,/* Show the independently created synthesis document after acknowledged publication. */ record=>showRuntimeFork(record,'Published reviewed synthesis with retained inputs.'),updateStatus);};
 retryMerge.onclick=/* Retry the existing Merge and always refresh pending-command status. */ async()=>{retryMerge.disabled=true;

  try{showRuntimeFork(await adapter.retryMerge(),'Merge publication confirmed.');}catch(error){notify(error.message);}finally{retryMerge.disabled=false;updateStatus();}};
 controls.append(retryMerge);


 const retryFork=node('button','Retry fork');

 retryFork.hidden=true;retryFork.id='retryFork';retryFork.onclick=/* Retry the existing Fork and always refresh pending-command status. */ async()=>{retryFork.disabled=true;

  try{showRuntimeFork(await adapter.retryFork());}catch(error){notify(error.message);}finally{retryFork.disabled=false;updateStatus();}};


 const retryCreation=node('button','Retry new document');

 retryCreation.id='retryCreation';retryCreation.hidden=true;retryCreation.onclick=/* Retry the existing document creation without replacing its original inputs. */ async()=>{retryCreation.disabled=true;

  try{showRuntimeFork(await adapter.retryCreation(),'Document creation confirmed.');}catch(error){notify(error.message);}finally{retryCreation.disabled=false;updateStatus();}};
 controls.append(keychainButton,retryCreation,retryFork);


 for(const [label,action] of [['Save draft',/* Acknowledge the current draft for recovery without creating immutable history. */ async()=>{await adapter.checkpoint(active);notify('Draft durably saved.');}],['Commit',/* Commit the current buffer and refresh publication-dependent clipboard and assertion views. */ async()=>{await adapter.commit(active);renderClipboard();updateCapture();notify('Committed an immutable revision and snapshot.');delete $('#investigationBody').dataset.assertionDocument;renderInvestigation();}],['New document',/* Create a named runtime document only after an explicit nonblank user entry. */ async()=>{const name=prompt('Document name');

  if(!name?.trim())return;

  showRuntimeFork(await adapter.createAndRegister(name),'Created a new document.');}],['Lock',/* Suspend edits during lock and reload only after lock acknowledgement. */ async()=>{const locking=adapter.lock();

  view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});

  try{await locking;location.reload();}finally{view.dispatch({effects:runtimeEditing.reconfigure(runtimeEditingRules())});}}]]){const button=node('button',label);

  button.onclick=/* Run an explicit runtime action with duplicate-click suppression and visible errors. */ async()=>{if(branchSwitching&&label!=='Lock')return;

   button.disabled=true;

   try{await action();}catch(error){notify(error.message);}finally{button.disabled=false;updateStatus();}};controls.append(button);}


 $('.header-actions').prepend(controls);
 updateCapture();$('#embedSelection').disabled=true;
 updateStatus();
}
