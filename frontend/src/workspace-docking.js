import {createDockview,themeDark} from 'dockview';

export const workspacePanels=Object.freeze([
 {id:'explorer',title:'Explorer'},
 {id:'editor',title:'Document editor'},
 {id:'investigation',title:'Interaction & Investigation'}
]);
export const dockPositions=Object.freeze(['left','right','top','bottom']);

// Layout owns containers only. In particular, it never constructs or serializes an editor.
export function installWorkspaceDocking(workspace,{onLayout=()=>{}}={}){
 const explorer=workspace.querySelector('.navigator'),editor=workspace.querySelector('.editor-pane'),navigator=workspace.querySelector('#documentNavigator'),sidebar=workspace.querySelector('.right-sidebar');
 const surface=document.createElement('div');surface.className='editor-surface';surface.append(editor,navigator);
 const elements={explorer,editor:surface,investigation:sidebar};
 const host=document.createElement('div');host.className='workspace-dock';workspace.prepend(host);workspace.classList.add('docked-workspace');
 const api=createDockview(host,{
  theme:{...themeDark,name:'hpx',gap:0},
  disableFloatingGroups:true,dndStrategy:'pointer',defaultRenderer:'always',
  createComponent:({id})=>({element:elements[id],init(){}}),
  createTabComponent:()=>{
   const element=document.createElement('div');element.className='workspace-dock-tab';
   return {element,init({title}){element.textContent=title;}};
  },defaultTabComponent:'workspace'
 });
 api.layout(host.clientWidth,host.clientHeight);
 const panels={};
 for(const {id,title} of workspacePanels)panels[id]=api.addPanel({id,title,component:id,renderer:'always',...(id==='explorer'?{initialWidth:226}:id==='editor'?{position:{referencePanel:'explorer',direction:'right'}}:{initialWidth:348,position:{referencePanel:'editor',direction:'right'}})});
 panels.explorer.api.setConstraints({minimumWidth:160,minimumHeight:100});
 panels.editor.api.setConstraints({minimumWidth:410,minimumHeight:260});
 panels.investigation.api.setConstraints({minimumWidth:260,minimumHeight:100});
 function restoreWidths({outline=226,sidebar=348}){
   panels.explorer.api.setSize({width:outline});
   panels.investigation.api.setSize({width:sidebar});
   panels.editor.api.setSize({width:host.clientWidth-outline-sidebar});
  }
  restoreWidths({});
 panels.editor.api.setActive();
 let disposed=false;
 const change=api.onDidLayoutChange(()=>{if(!disposed)onLayout();});
 function move(id,position,size){
  if(!panels[id]||id==='editor'||!dockPositions.includes(position))throw Error('Unsupported workspace panel placement');
  panels[id].api.moveTo({group:panels.editor.api.group,position});
  if(Number.isFinite(size)&&size>=160&&size<=800)panels[id].api.setSize(position==='top'||position==='bottom'?{height:size}:{width:size});
  panels.editor.api.setActive();onLayout();
 }
 function reset(){
  move('explorer','left');move('investigation','right');
  restoreWidths({});
 }
 return {
  move,reset,
  values:()=>({outline:panels.explorer.api.width,sidebar:panels.investigation.api.width}),
  resize(widths,changed){const target={...widths};if(changed==='restore'){restoreWidths(target);return;}for(const key of [changed]){const panel=panels[key==='outline'?'explorer':'investigation'];if(key==='outline'||key==='sidebar')panel.api.setSize({width:target[key]});}},
  dispose(){disposed=true;change.dispose();api.dispose();}
 };
}
