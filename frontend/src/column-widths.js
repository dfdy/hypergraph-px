// Presentation-only sizes: Navigator always remains 90 CSS pixels wide.
export function installColumnWidths(workspace,{onLayout=()=>{},onSave=()=>{}}={}){
 const widths={outline:226,sidebar:348},handles={};
 function limits(){const map=workspace.classList.contains('navigator-hidden')?0:90;return {available:workspace.clientWidth-map,minimumEditor:320};}
 function apply(changed){
  const {available,minimumEditor}=limits();
  widths.outline=Math.max(160,Math.min(450,widths.outline));
  widths.sidebar=Math.max(260,Math.min(600,widths.sidebar));
  const excess=widths.outline+widths.sidebar+minimumEditor-available;
  if(excess>0){
   const first=changed==='sidebar'?'sidebar':'outline',second=first==='sidebar'?'outline':'sidebar';
   const minimum={outline:160,sidebar:260};let remaining=excess;
   for(const key of [first,second]){const reduction=Math.min(remaining,widths[key]-minimum[key]);widths[key]-=reduction;remaining-=reduction;}
  }
  workspace.style.setProperty('--outline-width',widths.outline+'px');
  workspace.style.setProperty('--sidebar-width',widths.sidebar+'px');
  const root=workspace.getBoundingClientRect(),outline=workspace.querySelector('.navigator').getBoundingClientRect(),sidebar=workspace.querySelector('.right-sidebar').getBoundingClientRect();
  if(handles.outline){handles.outline.style.left=outline.right-root.left-4+'px';handles.sidebar.style.left=sidebar.left-root.left-4+'px';}
  for(const [key,handle] of Object.entries(handles)){handle.setAttribute('aria-valuenow',Math.round(widths[key]));}
  onLayout();
 }
 for(const [key,label] of [['outline','Resize workspace column'],['sidebar','Resize interaction and investigation column']]){
  const handle=document.createElement('div');handle.className='column-divider';handle.tabIndex=0;handle.role='separator';handle.setAttribute('aria-label',label);handle.setAttribute('aria-orientation','vertical');handle.setAttribute('aria-valuemin',key==='outline'?160:260);handle.setAttribute('aria-valuemax',key==='outline'?450:600);workspace.append(handle);handles[key]=handle;
  handle.addEventListener('keydown',event=>{handle.classList.remove('pointer-resize');if(!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;event.preventDefault();widths[key]=event.key==='Home'?(key==='outline'?226:348):widths[key]+(event.key==='ArrowRight'?1:-1)*(key==='sidebar'?-1:1)*(event.shiftKey?40:10);apply(key);onSave();});
  handle.addEventListener('dblclick',()=>{widths[key]=key==='outline'?226:348;apply(key);onSave();});
  handle.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;event.preventDefault();handle.classList.add('pointer-resize');handle.focus({preventScroll:true});handle.setPointerCapture(event.pointerId);
   const initial={...widths},origin=event.clientX;let active=true;document.body.classList.add('resizing-columns');
   const move=e=>{widths[key]=initial[key]+(e.clientX-origin)*(key==='sidebar'?-1:1);apply(key);};
   const finish=()=>{if(!active)return;active=false;handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',cancel);handle.removeEventListener('lostpointercapture',finish);document.removeEventListener('keydown',escape);document.body.classList.remove('resizing-columns');if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);onSave();};
   const cancel=()=>{Object.assign(widths,initial);apply();finish();};
   const escape=e=>{if(e.key==='Escape'){e.preventDefault();cancel();}};
   handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',cancel);handle.addEventListener('lostpointercapture',finish);document.addEventListener('keydown',escape);
  });
 }
 new ResizeObserver(()=>apply()).observe(workspace);
 apply();
 return {apply,values:()=>({...widths}),restore(value){if(value&&typeof value==='object'){for(const key of ['outline','sidebar'])if(Number.isFinite(value[key]))widths[key]=value[key];}apply();}};
}
