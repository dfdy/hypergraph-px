import {Decoration,ViewPlugin,WidgetType} from '@codemirror/view';
import {relationshipField,relationshipBoundaries} from './relationships.js';
let inspect=()=>{};
export function onInspectRelationship(handler){inspect=handler;}
export function createRelationshipMarker(group,onClick){
 const span=document.createElement('span');span.className=`relationship-boundary relationship-${group.kind}`;span.contentEditable='false';span.setAttribute('role','group');span.setAttribute('aria-label',`Relationships between adjacent ${group.kind==='sentence'?'sentences':'paragraphs'}`);
 for(const record of group.records){
  const button=document.createElement('button');button.type='button';button.className='relationship-arrow';button.dataset.relationshipId=record.id;button.setAttribute('aria-label',record.name);button.dataset.tooltip=record.name;
  // Double-ended connection glyphs do not imply a symmetric semantic predicate.
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',group.kind==='sentence'?'M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4':'M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4');svg.append(path);button.append(svg);
  button.addEventListener('click',()=>onClick?.(record.id));span.append(button);
 }
 return span;
}
class BoundaryWidget extends WidgetType{
 constructor(group){super();this.group=group;}
 eq(other){return JSON.stringify(this.group)===JSON.stringify(other.group);}
 toDOM(){return createRelationshipMarker(this.group,id=>inspect(id));}
 ignoreEvent(){return true;}
}
export const relationshipMarkers=ViewPlugin.fromClass(class{
 constructor(view){this.build(view);}
 build(view){this.decorations=Decoration.set(relationshipBoundaries(view.state).map(group=>Decoration.widget({widget:new BoundaryWidget(group),side:-1}).range(group.position)),true);}
 update(update){if(update.docChanged||update.startState.field(relationshipField)!==update.state.field(relationshipField))this.build(update.view);}
},{decorations:plugin=>plugin.decorations});
