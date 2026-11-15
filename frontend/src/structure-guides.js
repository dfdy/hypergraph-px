/**
 * # Hypergraph PX — Derived section and paragraph rails
 *
 * Draw source-aligned visual structure rails from Markdown section nesting and
 * paragraph extents, independently of provenance.
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
 * Used by: Owned-source editing and presentation through the CodeMirror structure
 * gutter.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: Rail lanes and caches are presentation only, not logical graph
 * parentage or durable recovery. Replacement math/table widgets retain containing
 * section rails without inventing source positions.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/structure-guides.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {gutter,GutterMarker,EditorView} from '@codemirror/view';
import {documentPresentation} from './document-presentation.js';

/** Define the gutter's baseline inset, lane separation and text gap in CSS pixels. */
export const STRUCTURE_LEFT_INSET=24,STRUCTURE_LANE_STEP=18,STRUCTURE_TEXT_GAP=12;

const models=new WeakMap();

// Structure derives from Markdown, independently of provenance or whitespace indentation.
/** Build or reuse source-derived section/paragraph ranges and their nested gutter lanes. */
export function structureGuideModel(state){
 let model=models.get(state.doc);

 if(model)return model;


 const text=state.doc.toString(),headings=[],paragraphs=[];


 documentPresentation(state).tree.iterate({/* Collect document-level heading starts and nonempty paragraph extents from the full Markdown tree. */ enter(node){
  const heading=/^(?:ATXHeading([1-6])|SetextHeading([12]))$/.exec(node.name);


  if(heading&&node.node.parent?.name==='Document')headings.push({from:node.from,level:Number(heading[1]??heading[2])});


  if(node.name==='Paragraph'){const value=text.slice(node.from,node.to).trimEnd();

   if(value)paragraphs.push({from:node.from,to:node.from+value.length,kind:'paragraph'});}
 }});


 const sections=headings.map(/* Determine a section's exact source extent up to the next same-or-higher heading. */ (heading,index)=>{const end=headings.slice(index+1).find(/* Find the heading that closes the current section nesting level. */ next=>next.level<=heading.level)?.from??text.length;

  return {...heading,to:heading.from+text.slice(heading.from,end).trimEnd().length,kind:'section'};});


 const ranges=[],stack=[];


 for(const unit of [...sections,...paragraphs].sort(/* Order structural ranges by source start, keeping a section before its same-position contents. */ (a,b)=>a.from-b.from||(a.kind==='section'?-1:1))){
  while(stack.length&&stack.at(-1).to<=unit.from)stack.pop();


  const range={...unit,id:unit.kind+':'+unit.from,lane:stack.length};

  ranges.push(range);

  if(unit.kind==='section')stack.push(range);
 }


 const lines=new Map();


 for(const range of ranges){const first=state.doc.lineAt(range.from).number,last=state.doc.lineAt(Math.max(range.from,range.to-1)).number;


  for(let number=first;number<=last;number++){const line=state.doc.line(number);

   if(!lines.has(line.from))lines.set(line.from,[]);

   lines.get(line.from).push({...range,start:number===first,end:number===last});}
 }


 const maxLane=ranges.reduce(/* Find the deepest rail lane needed to reserve a stable gutter width. */ (maximum,range)=>Math.max(maximum,range.lane),0);


 model={ranges,lines,maxLane,width:STRUCTURE_LEFT_INSET+maxLane*STRUCTURE_LANE_STEP+STRUCTURE_TEXT_GAP};models.set(state.doc,model);

 return model;
}

/** Return structure segments intersecting a line or replacement-widget source extent. */
export function structureGuideSegments(state,from,to=state.doc.lineAt(from).to){
 const model=structureGuideModel(state),line=state.doc.lineAt(from);


 if(to<=line.to)return model.lines.get(line.from)??[];


 // Replacement table/math blocks still carry their containing section rails.
 return model.ranges.filter(/* Select structural ranges overlapping the requested rendered block. */ range=>range.from<=to&&range.to>from).map(/* Mark whether each intersecting rail begins or ends within the rendered block. */ range=>({...range,start:range.from>=from,end:range.to<=to}));
}

class StructureMarker extends GutterMarker{
 /** Capture exact rail segments and geometry for one gutter marker. */
 constructor(segments,width,from,to){super();this.segments=segments;this.width=width;this.from=from;this.to=to;}


 /** Reuse a gutter marker only when source extents, width and segments match. */
 eq(other){return this.width===other.width&&this.from===other.from&&this.to===other.to&&JSON.stringify(this.segments)===JSON.stringify(other.segments);}


 /** Render noninteractive rails with source-bound metadata for editor layout. */
 toDOM(){
  const group=document.createElement('div');

  group.className='editor-structure-rails';group.setAttribute('aria-hidden','true');group.style.width=this.width+'px';

  if(this.from!==undefined){group.dataset.sourceFrom=this.from;group.dataset.sourceTo=this.to;}


  for(const segment of this.segments){const rail=document.createElement('span');

   rail.className='editor-structure-rail '+segment.kind;rail.dataset.guideId=segment.id;rail.dataset.lane=segment.lane;rail.dataset.guideFrom=segment.from;rail.dataset.guideTo=segment.to;rail.style.left=(STRUCTURE_LEFT_INSET+segment.lane*STRUCTURE_LANE_STEP)+'px';rail.style.top=segment.start?'3px':'0';rail.style.bottom=segment.end?'3px':'0';group.append(rail);}


  return group;
 }
}

/** Install source-derived editor gutter width, line rails and replacement-widget rails. */
export const editorStructureGuides=[EditorView.editorAttributes.compute(['doc'],/* Set editor gutter-width styling from the current source-derived structure model. */ state=>({style:`--structure-gutter-width:${structureGuideModel(state).width}px`})),gutter({
 class:'cm-structure-gutter',renderEmptyElements:true,
 initialSpacer:/* Create an empty spacer with the current required structure-gutter width. */ view=>new StructureMarker([],structureGuideModel(view.state).width),
 updateSpacer:/* Replace the spacer only when source structure changes its required width. */ (spacer,update)=>spacer.width===structureGuideModel(update.state).width?spacer:new StructureMarker([],structureGuideModel(update.state).width),
 lineMarker:/* Render structural rails for a normal editor line. */ (view,line)=>new StructureMarker(structureGuideSegments(view.state,line.from,line.to),structureGuideModel(view.state).width,line.from,line.to),
 widgetMarker:/* Render containing rails beside a replacement table or mathematics block. */ (view,_widget,block)=>new StructureMarker(structureGuideSegments(view.state,block.from,block.to),structureGuideModel(view.state).width,block.from,block.to),
 lineMarkerChange:/* Rebuild gutter line markers when source content changes. */ update=>update.docChanged
})];
