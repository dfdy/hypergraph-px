// Presentation-only hierarchy; source positions are navigation hints, not graph IDs.
export function headingTree(headings){
 const roots=[],stack=[];
 for(const heading of headings){
  const entry={...heading,children:[]};
  while(stack.length&&stack.at(-1).level>=entry.level)stack.pop();
  (stack.at(-1)?.children??roots).push(entry);stack.push(entry);
 }
 return roots;
}
export function headingAt(headings,position){let current=null;for(const heading of headings){if(heading.from>position)break;current=heading;}return current;}
export function createOutlineTree({onNavigate,onToggle}){
 const collapsed=new Set();let current=null;
 const key=(document,heading)=>document+'\0'+heading.anchor;
 function render(document,headings){
  const group=window.document.createElement('div');group.className='outline';group.id=`outline-${document}`;group.dataset.document=document;
  function append(parent,entries){for(const heading of entries){
   const branch=window.document.createElement('div');branch.className='outline-node';branch.dataset.headingFrom=heading.from;
   const row=window.document.createElement('div');row.className='heading-row';
   const open=window.document.createElement('button');open.className='heading-open';open.textContent=heading.label;open.dataset.document=document;open.dataset.headingFrom=heading.from;
   open.onclick=()=>onNavigate(document,heading.from);
   if(heading.children.length){
    const toggle=window.document.createElement('button');toggle.className='heading-toggle';
    const children=window.document.createElement('div');children.className='outline-children';children.id=`${group.id}-section-${heading.from}`;
    const update=()=>{const closed=collapsed.has(key(document,heading));toggle.textContent=closed?'▸':'▾';toggle.setAttribute('aria-label',`${closed?'Expand':'Collapse'} ${heading.label} subsections`);toggle.setAttribute('aria-expanded',String(!closed));toggle.setAttribute('aria-controls',children.id);children.hidden=closed;};
    toggle.onclick=()=>{const id=key(document,heading);collapsed.has(id)?collapsed.delete(id):collapsed.add(id);update();onToggle();};update();append(children,heading.children);row.append(toggle,open);branch.append(row,children);
   }else{const spacer=window.document.createElement('span');spacer.className='heading-leaf-spacer';spacer.setAttribute('aria-hidden','true');row.append(spacer,open);branch.append(row);}
   parent.append(branch);
  }}
  append(group,headingTree(headings));return group;
 }
 function mark(container){for(const button of container.querySelectorAll('.heading-open')){const selected=current&&button.dataset.document===current.document&&Number(button.dataset.headingFrom)===current.from;button.classList.toggle('current',!!selected);if(selected)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');}}
 return {render,mark,
  setCurrent(document,heading){current=heading?{document,from:heading.from}:null;},
  expandPath(document,headings,target){for(const heading of headings)if(heading.from<=target.from&&heading.to>target.from)collapsed.delete(key(document,heading));},
  setAll(document,headings,closed){for(const heading of headings){const id=key(document,heading);closed?collapsed.add(id):collapsed.delete(id);}}
 };
}
