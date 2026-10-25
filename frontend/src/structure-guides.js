import {gutter,GutterMarker,EditorView} from '@codemirror/view';
import {documentPresentation} from './document-presentation.js';
export const STRUCTURE_LEFT_INSET=24,STRUCTURE_LANE_STEP=18,STRUCTURE_TEXT_GAP=12;
const models=new WeakMap();
// Structure derives from Markdown, independently of provenance or whitespace indentation.
export function structureGuideModel(state){
 let model=models.get(state.doc);if(model)return model;
 const text=state.doc.toString(),headings=[],paragraphs=[];
 documentPresentation(state).tree.iterate({enter(node){
  const heading=/^(?:ATXHeading([1-6])|SetextHeading([12]))$/.exec(node.name);
  if(heading&&node.node.parent?.name==='Document')headings.push({from:node.from,level:Number(heading[1]??heading[2])});
  if(node.name==='Paragraph'){const value=text.slice(node.from,node.to).trimEnd();if(value)paragraphs.push({from:node.from,to:node.from+value.length,kind:'paragraph'});}
 }});
 const sections=headings.map((heading,index)=>{const end=headings.slice(index+1).find(next=>next.level<=heading.level)?.from??text.length;return {...heading,to:heading.from+text.slice(heading.from,end).trimEnd().length,kind:'section'};});
 const ranges=[],stack=[];
 for(const unit of [...sections,...paragraphs].sort((a,b)=>a.from-b.from||(a.kind==='section'?-1:1))){
  while(stack.length&&stack.at(-1).to<=unit.from)stack.pop();
  const range={...unit,id:unit.kind+':'+unit.from,lane:stack.length};ranges.push(range);if(unit.kind==='section')stack.push(range);
 }
 const lines=new Map();
 for(const range of ranges){const first=state.doc.lineAt(range.from).number,last=state.doc.lineAt(Math.max(range.from,range.to-1)).number;
  for(let number=first;number<=last;number++){const line=state.doc.line(number);if(!lines.has(line.from))lines.set(line.from,[]);lines.get(line.from).push({...range,start:number===first,end:number===last});}
 }
 const maxLane=ranges.reduce((maximum,range)=>Math.max(maximum,range.lane),0);
 model={ranges,lines,maxLane,width:STRUCTURE_LEFT_INSET+maxLane*STRUCTURE_LANE_STEP+STRUCTURE_TEXT_GAP};models.set(state.doc,model);return model;
}
export function structureGuideSegments(state,from,to=state.doc.lineAt(from).to){
 const model=structureGuideModel(state),line=state.doc.lineAt(from);
 if(to<=line.to)return model.lines.get(line.from)??[];
 // Replacement table/math blocks still carry their containing section rails.
 return model.ranges.filter(range=>range.from<=to&&range.to>from).map(range=>({...range,start:range.from>=from,end:range.to<=to}));
}
class StructureMarker extends GutterMarker{
 constructor(segments,width,from,to){super();this.segments=segments;this.width=width;this.from=from;this.to=to;}
 eq(other){return this.width===other.width&&this.from===other.from&&this.to===other.to&&JSON.stringify(this.segments)===JSON.stringify(other.segments);}
 toDOM(){
  const group=document.createElement('div');group.className='editor-structure-rails';group.setAttribute('aria-hidden','true');group.style.width=this.width+'px';if(this.from!==undefined){group.dataset.sourceFrom=this.from;group.dataset.sourceTo=this.to;}
  for(const segment of this.segments){const rail=document.createElement('span');rail.className='editor-structure-rail '+segment.kind;rail.dataset.guideId=segment.id;rail.dataset.lane=segment.lane;rail.dataset.guideFrom=segment.from;rail.dataset.guideTo=segment.to;rail.style.left=(STRUCTURE_LEFT_INSET+segment.lane*STRUCTURE_LANE_STEP)+'px';rail.style.top=segment.start?'3px':'0';rail.style.bottom=segment.end?'3px':'0';group.append(rail);}
  return group;
 }
}
export const editorStructureGuides=[EditorView.editorAttributes.compute(['doc'],state=>({style:`--structure-gutter-width:${structureGuideModel(state).width}px`})),gutter({
 class:'cm-structure-gutter',renderEmptyElements:true,
 initialSpacer:view=>new StructureMarker([],structureGuideModel(view.state).width),
 updateSpacer:(spacer,update)=>spacer.width===structureGuideModel(update.state).width?spacer:new StructureMarker([],structureGuideModel(update.state).width),
 lineMarker:(view,line)=>new StructureMarker(structureGuideSegments(view.state,line.from,line.to),structureGuideModel(view.state).width,line.from,line.to),
 widgetMarker:(view,_widget,block)=>new StructureMarker(structureGuideSegments(view.state,block.from,block.to),structureGuideModel(view.state).width,block.from,block.to),
 lineMarkerChange:update=>update.docChanged
})];
