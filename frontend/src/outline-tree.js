/**
 * # Hypergraph PX — Source heading navigation tree
 *
 * Organize heading ranges into a navigable hierarchy with independent collapse
 * state and current-location markers.
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
 * Used by: Interface shell and navigation through the workspace contents outline.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: This hierarchy is a presentation of source headings, not canonical
 * graph ancestry. Heading offsets are navigation hints and collapse state does not
 * publish content.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/outline-tree.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

/** Build a nested heading tree by source order and heading level. */
export function headingTree(headings){
 const roots=[],stack=[];


 for(const heading of headings){
  const entry={...heading,children:[]};


  while(stack.length&&stack.at(-1).level>=entry.level)stack.pop();


  (stack.at(-1)?.children??roots).push(entry);stack.push(entry);
 }


 return roots;
}

/** Find the heading active at a given source position. */
export function headingAt(headings,position){let current=null;

 for(const heading of headings){if(heading.from>position)break;

  current=heading;}

 return current;}

/** Create outline rendering and collapse-state coordination around caller-owned navigation actions. */
export function createOutlineTree({onNavigate,onToggle}){
 const collapsed=new Set();

 let current=null;


 /** Scope a heading's collapse identity to its document and anchor. */
 const key=(document,heading)=>document+'\0'+heading.anchor;


 /** Render one document's heading hierarchy as accessible outline controls. */
 function render(document,headings){
  const group=window.document.createElement('div');

  group.className='outline';group.id=`outline-${document}`;group.dataset.document=document;


  /** Append nested heading entries and their expand/collapse controls recursively. */
  function append(parent,entries){for(const heading of entries){
   const branch=window.document.createElement('div');

    branch.className='outline-node';branch.dataset.headingFrom=heading.from;


   const row=window.document.createElement('div');

    row.className='heading-row';


   const open=window.document.createElement('button');

    open.className='heading-open';open.textContent=heading.label;open.dataset.document=document;open.dataset.headingFrom=heading.from;
   open.onclick=/* Navigate to the exact heading source offset selected by this button. */ ()=>onNavigate(document,heading.from);


   if(heading.children.length){
    const toggle=window.document.createElement('button');

     toggle.className='heading-toggle';


    const children=window.document.createElement('div');

     children.className='outline-children';children.id=`${group.id}-section-${heading.from}`;


    /** Update a heading's expanded state, accessible label and child visibility together. */
    const update=()=>{const closed=collapsed.has(key(document,heading));

      toggle.textContent=closed?'▸':'▾';toggle.setAttribute('aria-label',`${closed?'Expand':'Collapse'} ${heading.label} subsections`);toggle.setAttribute('aria-expanded',String(!closed));toggle.setAttribute('aria-controls',children.id);children.hidden=closed;};


    toggle.onclick=/* Toggle the selected section's collapsed state and report a layout change. */ ()=>{const id=key(document,heading);

      collapsed.has(id)?collapsed.delete(id):collapsed.add(id);update();onToggle();};update();append(children,heading.children);row.append(toggle,open);branch.append(row,children);
   }else{const spacer=window.document.createElement('span');

     spacer.className='heading-leaf-spacer';spacer.setAttribute('aria-hidden','true');row.append(spacer,open);branch.append(row);}


   parent.append(branch);
  }}


  append(group,headingTree(headings));

  return group;
 }


 /** Mark the selected document/heading location in an existing rendered outline. */
 function mark(container){for(const button of container.querySelectorAll('.heading-open')){const selected=current&&button.dataset.document===current.document&&Number(button.dataset.headingFrom)===current.from;

   button.classList.toggle('current',!!selected);

   if(selected)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');}}


 return {render,mark,
  /** Retain the current heading location for subsequent outline marking. */
  setCurrent(document,heading){current=heading?{document,from:heading.from}:null;},
  /** Expand every ancestor section needed to reveal a target heading. */
  expandPath(document,headings,target){for(const heading of headings)if(heading.from<=target.from&&heading.to>target.from)collapsed.delete(key(document,heading));},
  /** Apply a requested collapse/expand state to all headings in one document. */
  setAll(document,headings,closed){for(const heading of headings){const id=key(document,heading);

   closed?collapsed.add(id):collapsed.delete(id);}}
 };
}
