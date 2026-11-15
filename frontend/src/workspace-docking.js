/**
 * # Hypergraph PX — Workspace container docking
 *
 * Use Dockview to move and resize the existing workspace panels without
 * reconstructing their editor or source state.
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
 * Used by: Interface shell and navigation through the application workspace and
 * layout controls.
 *
 * Specification:
 * - [organisation c4][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: Docking owns DOM containers only. It never serializes source,
 * selection or undo and does not introduce another editor identity or persistent
 * workspace format.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/workspace-docking.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {createDockview,themeDark} from 'dockview';

/** Define the existing Explorer, document editor and Interaction/Investigation panel identities. */
export const workspacePanels=Object.freeze([
 {id:'explorer',title:'Explorer'},
 {id:'editor',title:'Document editor'},
 {id:'investigation',title:'Interaction & Investigation'}
]);

/** List supported relative docking positions around the retained document editor. */
export const dockPositions=Object.freeze(['left','right','top','bottom']);

// Layout owns containers only. In particular, it never constructs or serializes an editor.
/** Wrap existing panel containers in Dockview and coordinate layout without recreating CodeMirror state. */
export function installWorkspaceDocking(workspace,{onLayout=/* Allow callers to omit an optional layout-change notification. */ ()=>{}}={}){
 const explorer=workspace.querySelector('.navigator'),editor=workspace.querySelector('.editor-pane'),navigator=workspace.querySelector('#documentNavigator'),sidebar=workspace.querySelector('.right-sidebar');


 const surface=document.createElement('div');

 surface.className='editor-surface';surface.append(editor,navigator);


 const elements={explorer,editor:surface,investigation:sidebar};


 const host=document.createElement('div');

 host.className='workspace-dock';workspace.prepend(host);workspace.classList.add('docked-workspace');


 const api=createDockview(host,{
  theme:{...themeDark,name:'hpx',gap:0},
  disableFloatingGroups:true,dndStrategy:'pointer',defaultRenderer:'always',
  createComponent:/* Return the already existing panel DOM for Dockview's requested component identity. */ ({id})=>({element:elements[id],/* Leave initialization empty because this panel component reuses pre-existing DOM/state. */ init(){}}),
  createTabComponent:/* Create a simple tab renderer that displays the supplied panel title safely. */ ()=>{
   const element=document.createElement('div');

  element.className='workspace-dock-tab';


   return {element,/* Set the dock tab's visible title from Dockview metadata. */ init({title}){element.textContent=title;}};
  },defaultTabComponent:'workspace'
 });


 api.layout(host.clientWidth,host.clientHeight);


 const panels={};


 for(const {id,title} of workspacePanels)panels[id]=api.addPanel({id,title,component:id,renderer:'always',...(id==='explorer'?{initialWidth:226}:id==='editor'?{position:{referencePanel:'explorer',direction:'right'}}:{initialWidth:348,position:{referencePanel:'editor',direction:'right'}})});


 panels.explorer.api.setConstraints({minimumWidth:160,minimumHeight:100});
 panels.editor.api.setConstraints({minimumWidth:410,minimumHeight:260});
 panels.investigation.api.setConstraints({minimumWidth:260,minimumHeight:100});


 /** Restore side-panel widths and reserve the remaining host width for the editor. */
 function restoreWidths({outline=226,sidebar=348}){
   panels.explorer.api.setSize({width:outline});
   panels.investigation.api.setSize({width:sidebar});
   panels.editor.api.setSize({width:host.clientWidth-outline-sidebar});
  }


  restoreWidths({});
 panels.editor.api.setActive();


 let disposed=false;


 const change=api.onDidLayoutChange(/* Notify layout changes only while this docking instance remains active. */ ()=>{if(!disposed)onLayout();});


 /** Move a supported non-editor panel relative to the retained editor and optionally set its bounded size. */
 function move(id,position,size){
  if(!panels[id]||id==='editor'||!dockPositions.includes(position))throw Error('Unsupported workspace panel placement');


  panels[id].api.moveTo({group:panels.editor.api.group,position});


  if(Number.isFinite(size)&&size>=160&&size<=800)panels[id].api.setSize(position==='top'||position==='bottom'?{height:size}:{width:size});


  panels.editor.api.setActive();onLayout();
 }


 /** Return Explorer and Investigation to their conventional sides and initial widths. */
 function reset(){
  move('explorer','left');move('investigation','right');
  restoreWidths({});
 }


 return {
  move,reset,
  values:/* Read current Explorer and Investigation widths from Dockview's panel geometry. */ ()=>({outline:panels.explorer.api.width,sidebar:panels.investigation.api.width}),
  /** Apply a restored or specifically changed side-panel width through Dockview. */
  resize(widths,changed){const target={...widths};

  if(changed==='restore'){restoreWidths(target);

   return;}

  for(const key of [changed]){const panel=panels[key==='outline'?'explorer':'investigation'];

   if(key==='outline'||key==='sidebar')panel.api.setSize({width:target[key]});}},
  /** Stop notifications and dispose docking resources without serializing editor data. */
  dispose(){disposed=true;change.dispose();api.dispose();}
 };
}
