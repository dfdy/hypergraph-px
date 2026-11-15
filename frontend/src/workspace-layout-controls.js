/**
 * # Hypergraph PX — Keyboard-accessible panel layout controls
 *
 * Offer explicit panel movement and layout reset controls alongside pointer-based
 * docking.
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
 * Used by: Shared controls and status through workspace docking and the
 * application header.
 *
 * Specification:
 * - [organisation c4][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: The dialog changes presentation layout only. Existing editor state
 * remains intact and focus returns to the editor only after an actual layout move.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/workspace-layout-controls.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import '@awesome.me/webawesome/dist/components/button/button.js';
import {workspacePanels,dockPositions} from './workspace-docking.js';

/** Install the layout trigger/dialog and coordinate accessible move/reset actions with Dockview. */
export function installWorkspaceLayoutControls(docking,{onLayout=/* Allow callers to omit optional layout-change reporting. */ ()=>{},focusEditor=/* Allow callers to omit optional editor-focus restoration. */ ()=>{}}={}){
 const trigger=document.createElement('wa-button');

 trigger.id='workspaceLayout';trigger.setAttribute('size','s');trigger.setAttribute('appearance','outlined');trigger.textContent='Layout';trigger.setAttribute('aria-haspopup','dialog');
 document.querySelector('.header-actions').prepend(trigger);


 const dialog=document.createElement('dialog');

 dialog.className='function-dialog workspace-layout-dialog';dialog.setAttribute('aria-labelledby','workspaceLayoutTitle');


 const title=document.createElement('h2');

 title.id='workspaceLayoutTitle';title.textContent='Workspace layout';


 const explanation=document.createElement('p');

 explanation.textContent='Drag a panel tab to dock it, or use these keyboard-accessible controls. Layout changes do not change document text. Panel placement lasts for this session.';


 /** Build an accessible labelled select from explicit supported layout choices. */
 function select(label,items){const field=document.createElement('label');

  field.textContent=label;

  const input=document.createElement('select');

  for(const {id,title} of items){const option=document.createElement('option');

   option.value=id;option.textContent=title;input.append(option);}

  field.append(input);

  return {field,input};}


 const panel=select('Panel to move',workspacePanels.filter(/* Exclude the retained editor panel from movable side-panel choices. */ p=>p.id!=='editor'));


 const position=select('Position relative to document',dockPositions.map(/* Give each supported docking direction a friendly display title. */ id=>({id,title:id[0].toUpperCase()+id.slice(1)})));

 position.input.value='right';


 const dimension=document.createElement('label');

 dimension.textContent='Panel size (pixels along docking direction)';


  const size=document.createElement('input');

 size.type='number';size.min='160';size.max='800';size.step='1';size.value='348';dimension.append(size);


  const actions=document.createElement('div');

 actions.className='dialog-actions';


 /** Create a compact action button bound to its supplied explicit layout operation. */
 function button(text,action){const button=document.createElement('wa-button');

  button.setAttribute('size','s');button.textContent=text;button.addEventListener('click',action);

  return button;}


 let moved=false;


  /** Close the current layout review dialog. */
  const close=()=>dialog.close();


 actions.append(button('Reset layout',/* Reset panel positions and restore editor focus after closing. */ ()=>{docking.reset();onLayout();moved=true;close();}),button('Close',close),button('Move panel',/* Validate size input before moving the selected panel and reporting layout changes. */ ()=>{if(!size.reportValidity())return;

  docking.move(panel.input.value,position.input.value,Number(size.value));onLayout();moved=true;close();}));
 dialog.append(title,explanation,panel.field,position.field,dimension,actions);
 trigger.addEventListener('click',/* Open a fresh layout review without claiming any panel has moved yet. */ ()=>{moved=false;document.body.append(dialog);dialog.showModal();});dialog.addEventListener('close',/* Remove the closed dialog and return focus to the appropriate editor or trigger. */ ()=>{dialog.remove();

  if(moved)focusEditor();else trigger.focus();});


 return {/* Remove layout controls and their dialog when this installation is disposed. */ dispose(){trigger.remove();dialog.remove();}};
}
