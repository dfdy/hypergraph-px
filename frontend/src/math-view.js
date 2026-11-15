/**
 * # Hypergraph PX — Bounded mathematics presentation widgets
 *
 * Render supported exact-source mathematics with trusted-disabled KaTeX and
 * reversible source/render editor state.
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
 * Used by: Owned-source editing and presentation, rendered table cells and
 * mathematics context actions.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: Rendering is a visual aid, not a proof or source rewrite.
 * Size/expansion limits bound preview work; parser errors fall back to literal
 * source text and a visible error state.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/math-view.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

import katex from 'katex';
import {StateField,StateEffect} from '@codemirror/state';
import {EditorView,Decoration,WidgetType} from '@codemirror/view';
import {mathExpressions} from './math.js';
import {parseTables} from './tables.js';
import {authorshipField,getAuthorAt,authorHue} from './authorship.js';

/** Ignore mathematics context requests until the application provides a handler. */
let contextHandler=()=>{};

/** Install the application-owned mathematics context-action handler. */
export function onMathContext(handler){contextHandler=handler}

/** Request mathematics source/render mode without changing document source. */
export const setMathRendered=StateEffect.define();

/** Render bounded TeX with untrusted features disabled, falling back to literal text on failure. */
export function renderExpression(element,expression){
 try{if(expression.tex.length>32768)throw new Error('Expression exceeds preview size limit');

  katex.render(expression.tex,element,{displayMode:expression.display,throwOnError:true,output:'htmlAndMathml',trust:false,maxExpand:1000,maxSize:20,strict:'warn'});

  return true}
 catch(error){element.textContent=expression.tex;element.classList.add('math-error');element.title='Maths preview error: '+error.message+' — switch Maths to Source to edit';

  return false}
}

/** Render inline mathematics within a cell while keeping surrounding text as text nodes. */
export function renderCellMath(element,text,rendered){
 element.replaceChildren();

 if(!rendered){element.textContent=text;

  return}


 let cursor=0;

 for(const expression of mathExpressions(text)){element.append(document.createTextNode(text.slice(cursor,expression.from)));

  const span=document.createElement('span');

  span.className='math-cell';renderExpression(span,{...expression,display:false});element.append(span);cursor=expression.to}

 element.append(document.createTextNode(text.slice(cursor)));
}

class MathWidget extends WidgetType{
 /** Retain an exact parsed expression and its display-attribution record for widget reuse. */
 constructor(expression,author){super();this.expression=expression;this.author=author}


 /** Reuse a math widget only when its exact range, TeX, display mode and attribution agree. */
 eq(other){return this.expression.from===other.expression.from&&this.expression.to===other.expression.to&&this.expression.tex===other.expression.tex&&this.expression.display===other.expression.display&&this.author.id===other.author.id}


 /** Estimate block mathematics height while allowing ordinary inline measurement. */
 get estimatedHeight(){return this.expression.block?70:-1}


 /** Build an attributed keyboard-focusable mathematics widget without making it editable source. */
 toDOM(view){const expression=this.expression;

  const el=document.createElement(expression.block?'div':'span');

  el.className='math-rendered '+(expression.block?'math-block':'math-inline')+' table-author-text';el.dataset.mathFrom=expression.from;el.dataset.mathTo=expression.to;el.dataset.authorId=this.author.id;el.style.setProperty('--author-hue',authorHue(this.author.id,this.author.kind));el.contentEditable='false';el.tabIndex=0;el.title='Maths preview — switch Maths to Source to edit';renderExpression(el,expression);
 el.oncontextmenu=/* Open context actions for the exact expression and suppress the native mouse menu. */ e=>{e.preventDefault();e.stopPropagation();contextHandler(e,expression)};
 el.onkeydown=/* Open the mathematics context menu from its keyboard-accessible widget location. */ e=>{if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){e.preventDefault();

    const r=el.getBoundingClientRect();

    contextHandler({clientX:r.left,clientY:r.bottom},expression)}};


 return el}


 /** Keep interactions within the mathematics widget instead of forwarding editor input. */
 ignoreEvent(){return true}
}

/** Build mathematics replacements while excluding table ranges handled by table widgets. */
function build(state){const text=state.doc.toString(),tables=parseTables(text);

 return Decoration.set(mathExpressions(text,{exclude:tables}).map(/* Replace one exact expression range with its source-bound mathematics widget. */ e=>Decoration.replace({widget:new MathWidget(e,getAuthorAt(state,e.from)),block:e.block}).range(e.renderFrom,e.renderTo)),true)}

/** Maintain mathematics presentation mode and its derived CodeMirror decorations. */
export const mathRendering=StateField.define({
 /** Initialize mathematics in literal source mode without rendering replacements. */
 create(){return {rendered:false,decorations:Decoration.none}},
 /** Rebuild math decorations when source, rendering mode or editor effects change. */
 update(value,tr){let rendered=value.rendered;

 for(const e of tr.effects)if(e.is(setMathRendered))rendered=!!e.value;

 return rendered!==value.rendered||tr.docChanged||tr.effects.length?{rendered,decorations:rendered?build(tr.state):Decoration.none}:value},
 provide:/* Expose mathematics decorations from the current state field. */ field=>EditorView.decorations.from(field,/* Read the current field's mathematics decoration set. */ v=>v.decorations)
});

/** Return the current mathematics rendering preference from editor state. */
export function isMathRendered(state){return state.field(mathRendering).rendered}

/** Create a detached mathematics preview with attribution from the current exact source position. */
export function createMathPreview(view,expression){return new MathWidget(expression,getAuthorAt(view.state,expression.from)).toDOM(view);}
