/**
 * # Hypergraph PX — Accessible workspace column sizing
 *
 * Coordinate bounded keyboard/pointer column resizing with docking sizes while
 * preserving a usable document-editor area.
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
 * Used by: Interface shell and navigation through workspace layout and display
 * controls.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: Sizes are CSS-pixel presentation preferences, not document data.
 * Pointer cancellation restores initial widths; the Navigator has a fixed90-pixel
 * reservation when visible.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/column-widths.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

/** Install accessible resize handles and keep current column geometry within the workspace's presentation limits. */
export function installColumnWidths(workspace,{onLayout=/* Allow embedding callers to omit optional layout notifications. */ ()=>{},onSave=/* Allow embedding callers to omit optional preference persistence notifications. */ ()=>{},sizing}={}){
 const widths={outline:226,sidebar:348},handles={};


 /** Compute available workspace width after Navigator reservation and minimum editor space. */
 function limits(){const map=workspace.classList.contains('navigator-hidden')?0:90;

  return {available:workspace.clientWidth-map,minimumEditor:320};}


 /** Clamp column widths, coordinate dock sizing and update visible/accessible handle geometry. */
 function apply(changed){
  if(!changed&&sizing)Object.assign(widths,sizing.values());


    const {available,minimumEditor}=limits();


  widths.outline=Math.max(160,Math.min(450,widths.outline));
  widths.sidebar=Math.max(260,Math.min(600,widths.sidebar));


  const excess=widths.outline+widths.sidebar+minimumEditor-available;


  if(excess>0){
   const first=changed==='sidebar'?'sidebar':'outline',second=first==='sidebar'?'outline':'sidebar';


   const minimum={outline:160,sidebar:260};

   let remaining=excess;


   for(const key of [first,second]){const reduction=Math.min(remaining,widths[key]-minimum[key]);

    widths[key]-=reduction;remaining-=reduction;}
  }


  if(changed)sizing?.resize(widths,changed);


    workspace.style.setProperty('--outline-width',widths.outline+'px');
  workspace.style.setProperty('--sidebar-width',widths.sidebar+'px');


  const root=workspace.getBoundingClientRect(),outline=workspace.querySelector('.navigator').getBoundingClientRect(),sidebar=workspace.querySelector('.right-sidebar').getBoundingClientRect();


  if(handles.outline){
     const editor=workspace.querySelector('.editor-pane').getBoundingClientRect();


     if(!document.body.classList.contains('resizing-columns')){
      handles.outline.hidden=!!sizing&&(outline.left>=editor.left||Math.abs(outline.top-editor.top)>1||Math.abs(outline.bottom-root.bottom)>1);
      handles.sidebar.hidden=!!sizing&&(sidebar.left<editor.left||Math.abs(sidebar.top-editor.top)>1||Math.abs(sidebar.bottom-root.bottom)>1);
     }


     handles.outline.style.left=outline.right-root.left-4+'px';handles.sidebar.style.left=sidebar.left-root.left-4+'px';
    }


  for(const [key,handle] of Object.entries(handles)){handle.setAttribute('aria-valuenow',Math.round(widths[key]));}


  onLayout();
 }


 for(const [key,label] of [['outline','Resize workspace column'],['sidebar','Resize interaction and investigation column']]){
  const handle=document.createElement('div');

  handle.className='column-divider';handle.tabIndex=0;handle.role='separator';handle.setAttribute('aria-label',label);handle.setAttribute('aria-orientation','vertical');handle.setAttribute('aria-valuemin',key==='outline'?160:260);handle.setAttribute('aria-valuemax',key==='outline'?450:600);workspace.append(handle);handles[key]=handle;
  handle.addEventListener('keydown',/* Resize a chosen column by accessible keyboard steps or reset it with Home. */ event=>{handle.classList.remove('pointer-resize');

   if(!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;

   event.preventDefault();widths[key]=event.key==='Home'?(key==='outline'?226:348):widths[key]+(event.key==='ArrowRight'?1:-1)*(key==='sidebar'?-1:1)*(event.shiftKey?40:10);apply(key);onSave();});
  handle.addEventListener('dblclick',/* Reset one column to its initial presentation width on double-click. */ ()=>{widths[key]=key==='outline'?226:348;apply(key);onSave();});
  handle.addEventListener('pointerdown',/* Start a primary-button resize with exact initial widths and pointer capture. */ event=>{
   if(event.button!==0)return;

   event.preventDefault();handle.classList.add('pointer-resize');handle.focus({preventScroll:true});handle.setPointerCapture(event.pointerId);


   const initial={...widths},origin=event.clientX;

   let active=true;

   document.body.classList.add('resizing-columns');


   /** Apply pointer displacement to the active column while maintaining opposite-edge direction. */
   const move=e=>{widths[key]=initial[key]+(e.clientX-origin)*(key==='sidebar'?-1:1);apply(key);};


   /** Release resize listeners/capture and report the final layout preference once. */
   const finish=()=>{if(!active)return;

    active=false;handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',cancel);handle.removeEventListener('lostpointercapture',finish);document.removeEventListener('keydown',escape);document.body.classList.remove('resizing-columns');

    if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);

    onSave();};


   /** Restore the initial widths when a pointer resize is cancelled. */
   const cancel=()=>{Object.assign(widths,initial);apply('restore');finish();};


   /** Cancel the current pointer resize on Escape. */
   const escape=e=>{if(e.key==='Escape'){e.preventDefault();cancel();}};


   handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',cancel);handle.addEventListener('lostpointercapture',finish);document.addEventListener('keydown',escape);
  });
 }


 const observer=new ResizeObserver(/* Recalculate presentation widths after observed workspace/container geometry changes. */ ()=>apply());

 observer.observe(workspace);


  if(sizing)for(const element of workspace.querySelectorAll('.navigator,.editor-pane,.right-sidebar'))observer.observe(element);


 apply();


 return {apply,values:/* Return a fresh snapshot of current column and docking widths. */ ()=>({...widths,...sizing?.values()}),/* Restore supported saved width values and reapply all current bounds. */ restore(value){if(value&&typeof value==='object'){for(const key of ['outline','sidebar'])if(Number.isFinite(value[key]))widths[key]=value[key];}

  apply('restore');}};
}
