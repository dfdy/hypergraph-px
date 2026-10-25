import {sentenceProvenanceField,sentenceProvenanceGroups} from './sentence-provenance.js';
import {createSentenceProvenanceMarker} from './sentence-provenance-view.js';
import {relationshipField,relationshipBoundaries} from './relationships.js';
import {createRelationshipMarker} from './relationship-markers.js';
import {parseTables} from './tables.js';
import {tableRendering,createTablePreview,createTableSourcePreview} from './table-view.js';
import {isMathRendered,createMathPreview} from './math-view.js';
import {mathExpressions} from './math.js';
import {authorshipField,authorHue} from './authorship.js';
import {documentPresentation,presentationLineClasses} from './document-presentation.js';

const layouts=new WeakMap();
function appendSource(parent,source,from,to,markers,authors,relations=[],provenance=[]){
 const boundaries=new Set([from,to]);
 for(const group of provenance)if(group.position>=from&&group.position<to)boundaries.add(group.position);
 for(const group of relations){if(group.position>=from&&group.position<to)boundaries.add(group.position);if(group.gapFrom!==undefined&&group.gapFrom>from&&group.gapFrom<to)boundaries.add(group.gapFrom);}
 if(from===to){for(const group of relations.filter(group=>group.position===from))parent.append(createRelationshipMarker(group));for(const group of provenance.filter(group=>group.position===from))parent.append(createSentenceProvenanceMarker(group));}
 for(const range of [...markers,...authors]){if(range.from<to&&range.to>from){boundaries.add(Math.max(from,range.from));boundaries.add(Math.min(to,range.to));}}
 const points=[...boundaries].sort((a,b)=>a-b);
 for(let i=0;i<points.length-1;i++){
  const start=points[i],end=points[i+1];for(const group of relations.filter(group=>group.position===start))parent.append(createRelationshipMarker(group));for(const group of provenance.filter(group=>group.position===start))parent.append(createSentenceProvenanceMarker(group));const span=document.createElement('span');span.textContent=source.slice(start,end);
  if(markers.some(r=>start>=r.from&&start<r.to))span.classList.add('cm-source-marker');
  if(relations.some(group=>group.gapFrom!==undefined&&start>=group.gapFrom&&end<=group.position))span.classList.add('relationship-gap');
  const author=authors.find(r=>start>=r.from&&start<r.to)?.author;
  if(author){span.classList.add('cm-author-text');span.dataset.authorId=author.id;span.style.setProperty('--author-hue',authorHue(author.id,author.kind));}
  parent.append(span);
 }
}
function buildLayout(view,track,layer){
 const state=view.state,source=state.doc.toString(),style=getComputedStyle(view.contentDOM),width=view.contentDOM.clientWidth;
 const mathMode=isMathRendered(state),sourceTables=state.field(tableRendering).sourceTables,authors=state.field(authorshipField),relationships=state.field(relationshipField),provenance=state.field(sentenceProvenanceField);
 const key=[width,style.fontFamily,style.fontSize,style.paddingTop,style.paddingBottom,style.paddingLeft,style.paddingRight].join('|');
 let layout=layouts.get(track);
 if(layout&&layout.doc===state.doc&&layout.key===key&&layout.mathMode===mathMode&&layout.sourceTables===sourceTables&&layout.authors===authors&&layout.relationships===relationships&&layout.provenance===provenance)return layout;
 const relations=relationshipBoundaries(state),allProvenance=sentenceProvenanceGroups(state),provenanceGroups=allProvenance.filter(group=>group.unitKind==='sentence'),blockProvenance=allProvenance.filter(group=>group.unitKind!=='sentence'),model=documentPresentation(state),tables=parseTables(source),expressions=mathMode?mathExpressions(source,{exclude:tables}):[];
 const tableByStart=new Map(tables.map(t=>[t.from,t])),mathByStart=new Map(expressions.filter(e=>e.block).map(e=>[e.renderFrom,e]));
 const nodes=[],blocks=[];
 layer.replaceChildren();
 layer.style.cssText='position:absolute;left:0;top:0;box-sizing:border-box;transform-origin:top left;pointer-events:none;white-space:normal;';
 Object.assign(layer.style,{width:width+'px',fontFamily:style.fontFamily,fontSize:style.fontSize,lineHeight:'1.9',paddingTop:style.paddingTop,paddingBottom:style.paddingBottom,paddingLeft:style.paddingLeft,paddingRight:style.paddingRight,tabSize:style.tabSize,fontVariantLigatures:style.fontVariantLigatures});
 for(let n=1;n<=state.doc.lines;n++){
  const line=state.doc.line(n),table=tableByStart.get(line.from),math=mathByStart.get(line.from);
  let element,to=line.to;
  if(table&&!sourceTables.has(table.from)){element=createTablePreview(view,table);to=table.to;n=state.doc.lineAt(to).number;}
  else if(math){element=createMathPreview(view,math);to=math.renderTo;n=state.doc.lineAt(to).number;}
  else{
   const text=document.createElement('div');text.className='cm-line mini-source-line '+presentationLineClasses(model,line.from);text.dataset.sourceFrom=line.from;
   Object.assign(text.style,{whiteSpace:'pre-wrap',overflowWrap:'anywhere',wordBreak:'break-word'});
   for(const group of blockProvenance.filter(group=>group.position===line.from)){text.classList.add('cm-provenance-block-start');const row=document.createElement('span');row.className='provenance-block-row provenance-'+group.unitKind;row.append(createSentenceProvenanceMarker(group));text.append(row);}
   let cursor=line.from;
   for(const expression of expressions.filter(e=>!e.block&&e.from>=line.from&&e.to<=line.to)){
    appendSource(text,source,cursor,expression.from,model.markers,authors,relations,provenanceGroups);text.append(createMathPreview(view,expression));cursor=expression.to;
   }
   appendSource(text,source,cursor,line.to,model.markers,authors,relations,provenanceGroups);if(!line.text)text.append(document.createElement('br'));element=text;
   if(table&&sourceTables.has(table.from)){element=document.createElement('div');element.append(createTableSourcePreview(view,table.from),text);}
  }
  element.dataset.sourceFrom=line.from;element.dataset.sourceTo=to;element.inert=true;
  element.querySelectorAll('[id],[tabindex]').forEach(e=>{e.removeAttribute('id');e.removeAttribute('tabindex');});
  nodes.push(element);blocks.push({from:line.from,to,element});
 }
 layer.append(...nodes);
 layout={doc:state.doc,key,relationships,provenance,mathMode,sourceTables,authors,blocks,layer};layouts.set(track,layout);return layout;
}
function blockForPosition(layout,position){
 let low=0,high=layout.blocks.length-1;
 while(low<high){const middle=Math.ceil((low+high)/2);if(layout.blocks[middle].from<=position)low=middle;else high=middle-1;}
 return layout.blocks[low];
}
function measure(layout,scale){
 const root=layout.layer.getBoundingClientRect();
 for(const block of layout.blocks){const r=block.element.getBoundingClientRect(),style=getComputedStyle(block.element),before=parseFloat(style.marginTop)||0,after=parseFloat(style.marginBottom)||0;block.top=(r.top-root.top)/scale-before;block.height=r.height/scale+before+after;}
 layout.total=layout.layer.clientHeight;
}
function projectedHeight(view,layout,screenY){
 const scroll=view.scrollDOM,top=view.documentTop;
 const root=layout.layer.getBoundingClientRect(),scale=layout.scale;
 const candidates=[];
 for(const actual of view.contentDOM.querySelectorAll('.cm-line,.table-block-layout,.math-block')){
  let position,mini;
  if(actual.classList.contains('cm-line')){
   try{position=view.posAtDOM(actual,0);}catch{continue;}
   const block=blockForPosition(layout,position);if(block.from!==position)continue;
   mini=block.element.classList.contains('mini-source-line')?block.element:block.element.querySelector('.mini-source-line');
  }else{position=Number(actual.dataset.tableFrom??actual.dataset.mathFrom);mini=blockForPosition(layout,position).element;}
  if(!mini)continue;
  const real=actual.getBoundingClientRect(),small=mini.getBoundingClientRect();
  const distance=screenY<real.top?real.top-screenY:screenY>real.bottom?screenY-real.bottom:0;
  const top=(small.top-root.top)/scale,height=small.height/scale;
  const projected=distance===0&&real.height?top+(screenY-real.top)*height/real.height:top+screenY-real.top;
  candidates.push({distance,projected});
 }
 if(candidates.length){candidates.sort((a,b)=>a.distance-b.distance);return Math.max(0,Math.min(layout.total,candidates[0].projected));}
 const first=layout.blocks[0],last=layout.blocks.at(-1),lastMain=view.lineBlockAt(view.state.doc.length);
 if(screenY<top)return Math.max(0,first.top+screenY-top);
 if(screenY>top+lastMain.bottom)return Math.min(layout.total,last.top+last.height+screenY-top-lastMain.bottom);
 const block=view.lineBlockAtHeight(Math.max(0,screenY-top)),mini=blockForPosition(layout,block.from);
 const fraction=block.height?Math.max(0,Math.min(1,(screenY-top-block.top)/block.height)):0;
 return mini.top+fraction*mini.height;
}
export function renderMinimap(view,track,layer,viewport){
 if(!view.contentDOM.clientWidth||!track.clientHeight)return;
 const layout=buildLayout(view,track,layer),scale=Math.min(.1,track.clientWidth/view.contentDOM.clientWidth);
 layer.style.transform='scale('+scale+')';layout.scale=scale;measure(layout,scale);
 const box=view.scrollDOM.getBoundingClientRect(),start=projectedHeight(view,layout,box.top),end=projectedHeight(view,layout,box.bottom);
 const visible=Math.max(0,end-start),height=visible*scale,progress=Math.max(0,Math.min(1,start/Math.max(1,layout.total-visible))),overflow=Math.max(0,layout.total*scale-track.clientHeight),offset=progress*overflow;
 layer.style.top=-offset+'px';viewport.style.height=height+'px';viewport.style.top=start*scale-offset+'px';viewport.setAttribute('aria-valuenow',Math.round(progress*100));
 Object.assign(track.dataset,{scale,offset,travel:Math.max(0,Math.min(layout.total*scale,track.clientHeight)-height),totalHeight:layout.total});
 layout.scale=scale;layout.offset=offset;layout.visible=visible;
}
function scrollToProjected(view,layout,height){
 const target=Math.max(0,Math.min(layout.total-layout.visible,height));
 let block=layout.blocks.find(b=>b.top+b.height>=target)||layout.blocks.at(-1);
 const fraction=Math.max(0,Math.min(1,(target-block.top)/Math.max(1,block.height))),actual=view.lineBlockAt(block.from);
 view.scrollDOM.scrollTop=Math.max(0,view.documentPadding.top+actual.top+fraction*actual.height);
 view.requestMeasure({key:layout,read:v=>{const measured=v.lineBlockAt(block.from);return Math.max(0,v.documentPadding.top+measured.top+fraction*measured.height);},write:(top,v)=>{if(Math.abs(v.scrollDOM.scrollTop-top)>1)v.scrollDOM.scrollTop=top;}});

}
export function bindMinimap(track,viewport,getView){
 track.parentElement.addEventListener('wheel',event=>{if(event.ctrlKey||event.metaKey||!event.deltaY)return;const view=getView(),unit=event.deltaMode===1?view.defaultLineHeight:event.deltaMode===2?view.scrollDOM.clientHeight:1;event.preventDefault();view.scrollDOM.scrollTop+=event.deltaY*unit;},{passive:false});
 track.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;event.preventDefault();track.setPointerCapture(event.pointerId);
  const rect=track.getBoundingClientRect(),grab=event.target===viewport?event.clientY-viewport.getBoundingClientRect().top:viewport.getBoundingClientRect().height/2;
  const move=e=>{const layout=layouts.get(track);if(!layout)return;const travel=Number(track.dataset.travel),progress=travel?Math.max(0,Math.min(1,(e.clientY-rect.top-grab)/travel)):0;scrollToProjected(getView(),layout,progress*Math.max(0,layout.total-layout.visible));};
  if(event.target!==viewport)move(event);
  const finish=()=>{track.removeEventListener('pointermove',move);track.removeEventListener('pointerup',finish);track.removeEventListener('pointercancel',finish);};
  track.addEventListener('pointermove',move);track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);
 });
}
