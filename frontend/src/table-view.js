/**
 * # Hypergraph PX — Editable table presentation widgets
 *
 * Render Markdown tables as keyboard-accessible editor widgets and route
 * cell/structure edits back to exact source intervals.
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
 * Used by: Owned-source editing and presentation, table context actions and
 * detached preview composition.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: Widgets retain the exact document object used to build them and reject
 * stale commits. Attribution is display evidence; rendering and source toggles
 * create no separate content identity.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/table-view.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

import {isMathRendered,renderCellMath} from './math-view.js';
import {StateField,StateEffect} from '@codemirror/state';
import {EditorView,Decoration,WidgetType} from '@codemirror/view';
import {parseTables,editTable,cellSourceRange} from './tables.js';
import {authorshipField,getAuthorAt,authorHue} from './authorship.js';

/** Ignore table context requests until the application installs its action handler. */
let contextHandler=()=>{};

/** Install the application-owned table context-action handler. */
export function onTableContext(handler){contextHandler=handler}

const toggleTableSource=StateEffect.define();

/** Find the parsed table containing an exact editor source position. */
export function tableContextAt(view,pos){return parseTables(view.state.doc.toString()).find(/* Match the table interval containing the requested UTF16 offset. */ t=>pos>=t.from&&pos<=t.to)||null}

/** Dispatch a bounded source edit only while the widget's original document object remains current. */
function commit(view,table,doc,action,row,col,value){
 if(view.state.doc!==doc)return;


 const range=action==='cell'?cellSourceRange(table,row,col):null;


 let changes;


 if(range){const insert=value.replace(/\r?\n/g,' ').replace(/(?<!\\)\|/g,'\\|');

  changes={from:range.from,to:range.to,insert};}
 else{const insert=editTable(table,action,row,col,value),old=table.source;

  let start=0,end=0;

  while(start<old.length&&start<insert.length&&old[start]===insert[start])start++;

  while(end<old.length-start&&end<insert.length-start&&old[old.length-1-end]===insert[insert.length-1-end])end++;

  changes={from:table.from+start,to:table.to-end,insert:insert.slice(start,insert.length-end)};}


 view.dispatch({changes,selection:{anchor:changes.from},userEvent:'input.table'});view.focus();
}

class TableWidget extends WidgetType{
 /** Capture a parsed table, attribution field and mathematics mode for widget reuse checks. */
 constructor(table,attribution,renderedMath){super();this.table=table;this.attribution=attribution;this.renderedMath=renderedMath}


 /** Reuse a widget only when its source, position, attribution and math mode agree. */
 eq(other){return this.table.from===other.table.from&&this.table.source===other.table.source&&this.attribution===other.attribution&&this.renderedMath===other.renderedMath}


 /** Estimate the rendered table height for editor layout before DOM measurement. */
 get estimatedHeight(){return 78+this.table.rows.length*38}


 /** Build the accessible table DOM with source switching and per-cell editing handlers. */
 toDOM(view){
  const data=this.table,doc=view.state.doc,wrap=document.createElement('div');

  wrap.className='rendered-table-block';wrap.dataset.tableFrom=data.from;wrap.setAttribute('contenteditable','false');


  const caption=document.createElement('div');

  caption.className='table-caption';

  const label=document.createElement('span');

  label.textContent='TABLE';

  const source=document.createElement('button');

  source.type='button';source.textContent='Edit Markdown';source.onclick=/* Switch this exact table to Markdown source and restore editor focus. */ ()=>{view.dispatch({effects:toggleTableSource.of(data.from)});view.focus()};caption.append(label,source);wrap.append(caption);


  const table=document.createElement('table');

  table.setAttribute('aria-label','Document table');
  data.rows.forEach(/* Create one rendered table row from the parsed source model. */ (row,ri)=>{let tr=document.createElement('tr');

   row.forEach(/* Create an attributed, aligned, keyboard-focusable cell at its exact source interval. */ (value,ci)=>{const cell=document.createElement(ri===0?'th':'td');

    const sourcePosition=cellSourceRange(data,ri,ci)?.from??data.from;

    const author=getAuthorAt(view.state,sourcePosition);

    cell.className='table-author-text';cell.style.setProperty('--author-hue',authorHue(author.id,author.kind));cell.dataset.authorId=author.id;renderCellMath(cell,value.replace(/\\\|/g,'|'),this.renderedMath);cell.style.textAlign=data.align[ci];cell.tabIndex=0;cell.setAttribute('aria-label',`Row ${ri+1}, column ${ci+1}: ${value||'empty'}`);

    if(ri===0)cell.scope='col';


   cell.oncontextmenu=/* Open context actions for the specific table cell without bubbling the browser menu. */ e=>{e.preventDefault();e.stopPropagation();contextHandler(e,{table:data,doc,row:ri,col:ci,sourcePosition})};


   /** Open a cell input once, preserving its original source value for cancellation or commit. */
   const edit=()=>{if(cell.querySelector('input'))return;

     const input=document.createElement('input');

     input.className='table-cell-input';input.value=value.replace(/\\\|/g,'|');input.setAttribute('aria-label',`Edit row ${ri+1}, column ${ci+1}`);cell.replaceChildren(input);input.focus();input.select();

     let cancelled=false;

     input.onkeydown=/* Handle Enter/Escape within the cell editor and stop editor-wide key propagation. */ e=>{if(e.key==='Escape'){e.preventDefault();cancelled=true;input.blur()}else if(e.key==='Enter'){e.preventDefault();input.blur()}

      e.stopPropagation()};input.onblur=/* Commit an intentional changed cell on blur or restore its original rendered value. */ ()=>{if(!cancelled&&input.value!==value.replace(/\\\|/g,'|'))commit(view,data,doc,'cell',ri,ci,input.value);else renderCellMath(cell,value.replace(/\\\|/g,'|'),this.renderedMath)};};


   cell.ondblclick=edit;cell.onkeydown=/* Handle keyboard cell editing and position the context menu without requiring a mouse. */ e=>{if(e.key==='Enter'){e.preventDefault();edit()}else if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();

      const r=cell.getBoundingClientRect();

      contextHandler({clientX:r.left,clientY:r.bottom,/* Provide the no-op preventDefault hook expected by the synthetic keyboard context event. */ preventDefault(){},/* Provide the no-op propagation hook expected by the synthetic keyboard context event. */ stopPropagation(){}},{table:data,doc,row:ri,col:ci,sourcePosition})}};tr.append(cell)});(ri===0?table.createTHead():table.tBodies[0]||table.createTBody()).append(tr)});
  wrap.append(table);

  const hint=document.createElement('div');

  hint.className='table-hint';hint.textContent='Double-click a cell to edit · right-click for rows and columns';wrap.append(hint);

  const layout=document.createElement('div');

  layout.className='table-block-layout';layout.dataset.tableFrom=data.from;layout.setAttribute('contenteditable','false');layout.append(wrap);

  return layout;
 }


 /** Keep widget interaction inside the table DOM rather than passing events into source editing. */
 ignoreEvent(){return true}
}

/** Build rendered replacements or source-mode controls for every current table. */
function build(state,sourceTables){return Decoration.set(parseTables(state.doc.toString()).map(/* Choose the source-toggle or rendered widget for one parsed table. */ t=>sourceTables.has(t.from)?Decoration.widget({widget:new SourceToggle(t.from),block:true,side:-1}).range(t.from):Decoration.replace({widget:new TableWidget(t,state.field(authorshipField),isMathRendered(state)),block:true}).range(t.from,t.to)),true)}

class SourceToggle extends WidgetType{/* Retain the exact table start represented by a source-mode toggle widget. */ constructor(from){super();this.from=from}

 /* Reuse a source toggle only at the same table source offset. */ eq(o){return o.from===this.from}

 /* Build a button returning this table from source mode to rendered presentation. */ toDOM(view){const el=document.createElement('div');

  el.className='table-source-toggle';

  const b=document.createElement('button');

  b.type='button';b.textContent='Render table';b.onclick=/* Dispatch the render-mode effect for this exact table source position. */ ()=>view.dispatch({effects:toggleTableSource.of(this.from)});el.append(b);

  return el}

 /* Keep source-toggle interactions in the widget rather than the source editor. */ ignoreEvent(){return true}}

/** Maintain source/render toggles and derived table decorations in editor state. */
export const tableRendering=StateField.define({
 /** Initialize table state with all tables rendered and no source-mode exceptions. */
 create(state){return {sourceTables:new Set(),decorations:build(state,new Set())}},
 /** Map source-mode positions through edits and rebuild decorations after relevant changes. */
 update(value,tr){let sources=value.sourceTables;

 if(tr.docChanged)sources=new Set([...sources].map(/* Map one remembered source-toggle offset through the current document change set. */ p=>tr.changes.mapPos(p)));

 for(const e of tr.effects)if(e.is(toggleTableSource)){sources=new Set(sources);sources.has(e.value)?sources.delete(e.value):sources.add(e.value)}

 return tr.docChanged||tr.effects.length>0?{sourceTables:sources,decorations:build(tr.state,sources)}:value},
 provide:/* Expose the current table field's decorations to CodeMirror. */ field=>EditorView.decorations.from(field,/* Read the decoration set from the table rendering state. */ v=>v.decorations)
});

/** Create a detached table widget preview using current attribution and mathematics settings. */
export function createTablePreview(view,table){return new TableWidget(table,view.state.field(authorshipField),isMathRendered(view.state)).toDOM(view);}

/** Create a detached source-toggle preview at the requested table offset. */
export function createTableSourcePreview(view,from){return new SourceToggle(from).toDOM(view);}
