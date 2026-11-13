import {Decoration,ViewPlugin,WidgetType} from '@codemirror/view';
import {relationshipField,relationshipBoundaries} from './relationships.js';
import {assertionProperties} from './assertion-properties.js';
let inspect=()=>{};
export function onInspectRelationship(handler){inspect=handler;}
export function relationshipControlWord(record){
 const properties=assertionProperties(record.properties??{});
 return (properties.certainty==='unspecified'?'':properties.certainty+': ')+(properties.negated?'not ':'')+record.name;
}
export function createRelationshipMarker(group,onClick){
 const span=document.createElement('span');span.className=`relationship-boundary relationship-${group.kind}${group.ownLine?' relationship-own-line':''}`;span.contentEditable='false';span.setAttribute('role','group');span.setAttribute('aria-label',`Relationships between adjacent ${group.kind+'s'}`);
 for(const record of group.records){
  const word=relationshipControlWord(record),button=document.createElement('button');button.type='button';button.className='relationship-arrow relationship-label';button.dataset.relationshipId=record.id;button.setAttribute('aria-label',record.runtime?`${word} · ${record.status} relation`:word);button.textContent='{'+word+'}';
  if(record.runtime){button.dataset.status=record.status;button.dataset.runtimeRelation='true';}
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
 build(view){this.decorations=Decoration.set(relationshipBoundaries(view.state).flatMap(group=>[...(group.gapFrom===undefined?[]:[Decoration.mark({class:'relationship-gap'}).range(group.gapFrom,group.position)]),Decoration.widget({widget:new BoundaryWidget(group),side:-1}).range(group.position)]),true);}
 update(update){if(update.docChanged||update.startState.field(relationshipField)!==update.state.field(relationshipField))this.build(update.view);}
},{decorations:plugin=>plugin.decorations});
