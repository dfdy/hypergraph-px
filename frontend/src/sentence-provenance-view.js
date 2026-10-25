import {Decoration,ViewPlugin,WidgetType} from '@codemirror/view';
import {provenanceKinds,provenanceLabel,sentenceProvenanceField,sentenceProvenanceGroups} from './sentence-provenance.js';
let inspect=()=>{};
export function onInspectSentenceProvenance(handler){inspect=handler;}
export function createSentenceProvenanceMarker(group,onClick){
 const span=document.createElement('span');const unitKind=group.unitKind??'sentence';span.className=unitKind==='sentence'?'sentence-provenance':'block-provenance';span.dataset.unitKind=unitKind;span.contentEditable='false';span.role='group';span.setAttribute('aria-label',`${unitKind[0].toUpperCase()+unitKind.slice(1)} provenance links`);
 for(const record of group.records){
  const button=document.createElement('button');button.type='button';button.className='sentence-provenance-icon';button.dataset.provenanceId=record.id;button.dataset.unitKind=unitKind;button.dataset.kind=record.kind;button.dataset.direction=record.direction;const name=provenanceLabel(record);button.setAttribute('aria-label',name);button.dataset.tooltip=`${name} · ${unitKind} · ${record.other.title} · ${record.origin==='fixture'?'synthetic example':'tab-only operation'}`;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',provenanceKinds[record.kind].path);svg.append(path);button.append(svg);
  const direction=document.createElement('span');direction.className='provenance-direction';direction.setAttribute('aria-hidden','true');direction.style.transform=record.direction==='incoming'?'rotate(180deg)':'';button.append(direction);button.onmousedown=event=>event.preventDefault();button.onclick=()=>onClick?.(record.id);span.append(button);
 }
 return span;
}
class ProvenanceWidget extends WidgetType{
 constructor(group){super();this.group=group;}eq(other){return JSON.stringify(this.group)===JSON.stringify(other.group);}toDOM(){const marker=createSentenceProvenanceMarker(this.group,id=>inspect(id));if((this.group.unitKind??'sentence')==='sentence')return marker;const row=document.createElement('span');row.className='provenance-block-row provenance-'+this.group.unitKind;row.contentEditable='false';row.append(marker);return row;}ignoreEvent(){return true;}
}
export const sentenceProvenanceMarkers=ViewPlugin.fromClass(class{
 constructor(view){this.build(view);}
 build(view){const groups=sentenceProvenanceGroups(view.state),lines=new Set(),decorations=[];
  for(const group of groups){if(group.unitKind!=='sentence'&&!lines.has(group.position)){lines.add(group.position);decorations.push(Decoration.line({class:'cm-provenance-block-start'}).range(group.position));}decorations.push(Decoration.widget({widget:new ProvenanceWidget(group),side:group.unitKind==='sentence'?0:-10}).range(group.position));}
  this.decorations=Decoration.set(decorations,true);
 }
 update(update){if(update.docChanged||update.startState.field(sentenceProvenanceField)!==update.state.field(sentenceProvenanceField))this.build(update.view);}

},{decorations:plugin=>plugin.decorations});
