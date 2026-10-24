import {isMathRendered,renderCellMath} from './math-view.js';
import {StateField,StateEffect} from '@codemirror/state';
import {EditorView,Decoration,WidgetType} from '@codemirror/view';
import {parseTables,editTable,cellSourceRange} from './tables.js';
import {authorshipField,getAuthorAt,authorHue} from './authorship.js';
let contextHandler=()=>{};
export function onTableContext(handler){contextHandler=handler}
const toggleTableSource=StateEffect.define();
export function tableContextAt(view,pos){return parseTables(view.state.doc.toString()).find(t=>pos>=t.from&&pos<=t.to)||null}
function commit(view,table,doc,action,row,col,value){
 if(view.state.doc!==doc)return;
 const range=action==='cell'?cellSourceRange(table,row,col):null;
 let changes;
 if(range){const insert=value.replace(/\r?\n/g,' ').replace(/(?<!\\)\|/g,'\\|');changes={from:range.from,to:range.to,insert};}
 else{const insert=editTable(table,action,row,col,value),old=table.source;let start=0,end=0;while(start<old.length&&start<insert.length&&old[start]===insert[start])start++;while(end<old.length-start&&end<insert.length-start&&old[old.length-1-end]===insert[insert.length-1-end])end++;changes={from:table.from+start,to:table.to-end,insert:insert.slice(start,insert.length-end)};}
 view.dispatch({changes,selection:{anchor:changes.from},userEvent:'input.table'});view.focus();
}
class TableWidget extends WidgetType{
 constructor(table,attribution,renderedMath){super();this.table=table;this.attribution=attribution;this.renderedMath=renderedMath}
 eq(other){return this.table.from===other.table.from&&this.table.source===other.table.source&&this.attribution===other.attribution&&this.renderedMath===other.renderedMath}
 get estimatedHeight(){return 42+this.table.rows.length*38}
 toDOM(view){
  const data=this.table,doc=view.state.doc,wrap=document.createElement('div');wrap.className='rendered-table-block';wrap.dataset.tableFrom=data.from;wrap.setAttribute('contenteditable','false');
  const caption=document.createElement('div');caption.className='table-caption';const label=document.createElement('span');label.textContent='TABLE';const source=document.createElement('button');source.type='button';source.textContent='Edit Markdown';source.onclick=()=>{view.dispatch({effects:toggleTableSource.of(data.from)});view.focus()};caption.append(label,source);wrap.append(caption);
  const table=document.createElement('table');table.setAttribute('aria-label','Document table');
  data.rows.forEach((row,ri)=>{let tr=document.createElement('tr');row.forEach((value,ci)=>{const cell=document.createElement(ri===0?'th':'td');const sourcePosition=cellSourceRange(data,ri,ci)?.from??data.from;const author=getAuthorAt(view.state,sourcePosition);cell.className='table-author-text';cell.style.setProperty('--author-hue',authorHue(author.id,author.kind));cell.dataset.authorId=author.id;renderCellMath(cell,value.replace(/\\\|/g,'|'),this.renderedMath);cell.style.textAlign=data.align[ci];cell.tabIndex=0;cell.setAttribute('aria-label',`Row ${ri+1}, column ${ci+1}: ${value||'empty'}`);if(ri===0)cell.scope='col';
   cell.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();contextHandler(e,{table:data,doc,row:ri,col:ci,sourcePosition})};
   const edit=()=>{if(cell.querySelector('input'))return;const input=document.createElement('input');input.className='table-cell-input';input.value=value.replace(/\\\|/g,'|');input.setAttribute('aria-label',`Edit row ${ri+1}, column ${ci+1}`);cell.replaceChildren(input);input.focus();input.select();let cancelled=false;input.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();cancelled=true;input.blur()}else if(e.key==='Enter'){e.preventDefault();input.blur()}e.stopPropagation()};input.onblur=()=>{if(!cancelled&&input.value!==value.replace(/\\\|/g,'|'))commit(view,data,doc,'cell',ri,ci,input.value);else renderCellMath(cell,value.replace(/\\\|/g,'|'),this.renderedMath)};};
   cell.ondblclick=edit;cell.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();edit()}else if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();const r=cell.getBoundingClientRect();contextHandler({clientX:r.left,clientY:r.bottom,preventDefault(){},stopPropagation(){}},{table:data,doc,row:ri,col:ci,sourcePosition})}};tr.append(cell)});(ri===0?table.createTHead():table.tBodies[0]||table.createTBody()).append(tr)});
  wrap.append(table);const hint=document.createElement('div');hint.className='table-hint';hint.textContent='Double-click a cell to edit · right-click for rows and columns';wrap.append(hint);return wrap;
 }
 ignoreEvent(){return true}
}
function build(state,sourceTables){return Decoration.set(parseTables(state.doc.toString()).map(t=>sourceTables.has(t.from)?Decoration.widget({widget:new SourceToggle(t.from),block:true,side:-1}).range(t.from):Decoration.replace({widget:new TableWidget(t,state.field(authorshipField),isMathRendered(state)),block:true}).range(t.from,t.to)),true)}
class SourceToggle extends WidgetType{constructor(from){super();this.from=from}eq(o){return o.from===this.from}toDOM(view){const el=document.createElement('div');el.className='table-source-toggle';const b=document.createElement('button');b.type='button';b.textContent='Render table';b.onclick=()=>view.dispatch({effects:toggleTableSource.of(this.from)});el.append(b);return el}ignoreEvent(){return true}}
export const tableRendering=StateField.define({
 create(state){return {sourceTables:new Set(),decorations:build(state,new Set())}},
 update(value,tr){let sources=value.sourceTables;if(tr.docChanged)sources=new Set([...sources].map(p=>tr.changes.mapPos(p)));for(const e of tr.effects)if(e.is(toggleTableSource)){sources=new Set(sources);sources.has(e.value)?sources.delete(e.value):sources.add(e.value)}return tr.docChanged||tr.effects.length>0?{sourceTables:sources,decorations:build(tr.state,sources)}:value},
 provide:field=>EditorView.decorations.from(field,v=>v.decorations)
});

export function createTablePreview(view,table){return new TableWidget(table,view.state.field(authorshipField),isMathRendered(view.state)).toDOM(view);}
export function createTableSourcePreview(view,from){return new SourceToggle(from).toDOM(view);}
