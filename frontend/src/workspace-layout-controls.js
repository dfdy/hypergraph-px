import '@awesome.me/webawesome/dist/components/button/button.js';
import {workspacePanels,dockPositions} from './workspace-docking.js';

export function installWorkspaceLayoutControls(docking,{onLayout=()=>{},focusEditor=()=>{}}={}){
 const trigger=document.createElement('wa-button');trigger.id='workspaceLayout';trigger.setAttribute('size','s');trigger.setAttribute('appearance','outlined');trigger.textContent='Layout';trigger.setAttribute('aria-haspopup','dialog');
 document.querySelector('.header-actions').prepend(trigger);
 const dialog=document.createElement('dialog');dialog.className='function-dialog workspace-layout-dialog';dialog.setAttribute('aria-labelledby','workspaceLayoutTitle');
 const title=document.createElement('h2');title.id='workspaceLayoutTitle';title.textContent='Workspace layout';
 const explanation=document.createElement('p');explanation.textContent='Drag a panel tab to dock it, or use these keyboard-accessible controls. Layout changes do not change document text. Panel placement lasts for this session.';
 function select(label,items){const field=document.createElement('label');field.textContent=label;const input=document.createElement('select');for(const {id,title} of items){const option=document.createElement('option');option.value=id;option.textContent=title;input.append(option);}field.append(input);return {field,input};}
 const panel=select('Panel to move',workspacePanels.filter(p=>p.id!=='editor'));
 const position=select('Position relative to document',dockPositions.map(id=>({id,title:id[0].toUpperCase()+id.slice(1)})));position.input.value='right';
 const dimension=document.createElement('label');dimension.textContent='Panel size (pixels along docking direction)';
  const size=document.createElement('input');size.type='number';size.min='160';size.max='800';size.step='1';size.value='348';dimension.append(size);
  const actions=document.createElement('div');actions.className='dialog-actions';
 function button(text,action){const button=document.createElement('wa-button');button.setAttribute('size','s');button.textContent=text;button.addEventListener('click',action);return button;}
 let moved=false;
  const close=()=>dialog.close();
 actions.append(button('Reset layout',()=>{docking.reset();onLayout();moved=true;close();}),button('Close',close),button('Move panel',()=>{if(!size.reportValidity())return;docking.move(panel.input.value,position.input.value,Number(size.value));onLayout();moved=true;close();}));
 dialog.append(title,explanation,panel.field,position.field,dimension,actions);
 trigger.addEventListener('click',()=>{moved=false;document.body.append(dialog);dialog.showModal();});dialog.addEventListener('close',()=>{dialog.remove();if(moved)focusEditor();else trigger.focus();});
 return {dispose(){trigger.remove();dialog.remove();}};
}
