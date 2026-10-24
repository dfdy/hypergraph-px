import katex from 'katex';
import {StateField,StateEffect} from '@codemirror/state';
import {EditorView,Decoration,WidgetType} from '@codemirror/view';
import {mathExpressions} from './math.js';
import {parseTables} from './tables.js';
import {authorshipField,getAuthorAt,authorHue} from './authorship.js';
let contextHandler=()=>{};
export function onMathContext(handler){contextHandler=handler}
export const setMathRendered=StateEffect.define();
export function renderExpression(element,expression){
 try{if(expression.tex.length>32768)throw new Error('Expression exceeds preview size limit');katex.render(expression.tex,element,{displayMode:expression.display,throwOnError:true,output:'htmlAndMathml',trust:false,maxExpand:1000,maxSize:20,strict:'warn'});return true}
 catch(error){element.textContent=expression.tex;element.classList.add('math-error');element.title='Maths preview error: '+error.message+' — switch Maths to Source to edit';return false}
}
export function renderCellMath(element,text,rendered){
 element.replaceChildren();if(!rendered){element.textContent=text;return}
 let cursor=0;for(const expression of mathExpressions(text)){element.append(document.createTextNode(text.slice(cursor,expression.from)));const span=document.createElement('span');span.className='math-cell';renderExpression(span,{...expression,display:false});element.append(span);cursor=expression.to}element.append(document.createTextNode(text.slice(cursor)));
}
class MathWidget extends WidgetType{
 constructor(expression,author){super();this.expression=expression;this.author=author}
 eq(other){return this.expression.from===other.expression.from&&this.expression.to===other.expression.to&&this.expression.tex===other.expression.tex&&this.expression.display===other.expression.display&&this.author.id===other.author.id}
 get estimatedHeight(){return this.expression.block?70:-1}
 toDOM(view){const expression=this.expression;const el=document.createElement(expression.block?'div':'span');el.className='math-rendered '+(expression.block?'math-block':'math-inline')+' table-author-text';el.dataset.mathFrom=expression.from;el.dataset.mathTo=expression.to;el.dataset.authorId=this.author.id;el.style.setProperty('--author-hue',authorHue(this.author.id,this.author.kind));el.contentEditable='false';el.tabIndex=0;el.title='Maths preview — switch Maths to Source to edit';renderExpression(el,expression);
 el.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();contextHandler(e,expression)};
 el.onkeydown=e=>{if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){e.preventDefault();const r=el.getBoundingClientRect();contextHandler({clientX:r.left,clientY:r.bottom},expression)}};
 return el}
 ignoreEvent(){return true}
}
function build(state){const text=state.doc.toString(),tables=parseTables(text);return Decoration.set(mathExpressions(text,{exclude:tables}).map(e=>Decoration.replace({widget:new MathWidget(e,getAuthorAt(state,e.from)),block:e.block}).range(e.renderFrom,e.renderTo)),true)}
export const mathRendering=StateField.define({
 create(){return {rendered:false,decorations:Decoration.none}},
 update(value,tr){let rendered=value.rendered;for(const e of tr.effects)if(e.is(setMathRendered))rendered=!!e.value;return rendered!==value.rendered||tr.docChanged||tr.effects.length?{rendered,decorations:rendered?build(tr.state):Decoration.none}:value},
 provide:field=>EditorView.decorations.from(field,v=>v.decorations)
});
export function isMathRendered(state){return state.field(mathRendering).rendered}
