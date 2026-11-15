/**
 * # Hypergraph PX — Accessible relationship boundary controls
 *
 * Renders noneditable relationship controls at adjacent text boundaries and
 * refreshes them when relationship state or document structure changes.
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
 * Used by: Owned-source editing and presentation — browser editor relationship
 * inspection.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: Widgets present relationship records without editing owned text.
 * Durable status labels remain visible; marker coordinates are display UTF16
 * positions.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/relationship-markers.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {Decoration,ViewPlugin,WidgetType} from '@codemirror/view';
import {relationshipField,relationshipBoundaries} from './relationships.js';
import {assertionProperties} from './assertion-properties.js';

/** Ignore inspection requests until the application registers its handler. */
let inspect=()=>{};

/** Connect marker activation to the application’s relationship inspector. */
export function onInspectRelationship(handler){inspect=handler;}

/** Include certainty and negation in the visible relationship wording. */
export function relationshipControlWord(record){
 const properties=assertionProperties(record.properties??{});


 return (properties.certainty==='unspecified'?'':properties.certainty+': ')+(properties.negated?'not ':'')+record.name;
}

/** Build accessible boundary controls using text labels and explicit runtime status. */
export function createRelationshipMarker(group,onClick){
 const span=document.createElement('span');

 span.className=`relationship-boundary relationship-${group.kind}${group.ownLine?' relationship-own-line':''}`;span.contentEditable='false';span.setAttribute('role','group');span.setAttribute('aria-label',`Relationships between adjacent ${group.kind+'s'}`);


 for(const record of group.records){
  const word=relationshipControlWord(record),button=document.createElement('button');

  button.type='button';button.className='relationship-arrow relationship-label';button.dataset.relationshipId=record.id;button.setAttribute('aria-label',record.runtime?`${word} · ${record.status} relation`:word);button.textContent='{'+word+'}';


  if(record.runtime){button.dataset.status=record.status;button.dataset.runtimeRelation='true';}


  button.addEventListener('click',/* Inspect the exact record represented by this button. */ ()=>onClick?.(record.id));span.append(button);
 }


 return span;
}

class BoundaryWidget extends WidgetType{
 /** Retain the boundary group represented by this editor widget. */
 constructor(group){super();this.group=group;}


 /** Reuse widgets only when their complete represented group is unchanged. */
 eq(other){return JSON.stringify(this.group)===JSON.stringify(other.group);}


 /** Create the widget DOM and connect it to the current inspector. */
 toDOM(){return createRelationshipMarker(this.group,/* Forward the activated record identity to the registered inspector. */ id=>inspect(id));}


 /** Keep widget interactions outside normal editor event handling. */
 ignoreEvent(){return true;}
}

/** Install relationship widgets and gap styling in the editor view. */
export const relationshipMarkers=ViewPlugin.fromClass(class{
 /** Build initial relationship decorations for the mounted editor. */
 constructor(view){this.build(view);}


 /** Place each boundary widget and any preceding sentence-gap styling. */
 build(view){this.decorations=Decoration.set(relationshipBoundaries(view.state).flatMap(/* Produce decorations for one group while preserving its own boundary position. */ group=>[...(group.gapFrom===undefined?[]:[Decoration.mark({class:'relationship-gap'}).range(group.gapFrom,group.position)]),Decoration.widget({widget:new BoundaryWidget(group),side:-1}).range(group.position)]),true);}


 /** Rebuild decorations after source or relationship-state changes. */
 update(update){if(update.docChanged||update.startState.field(relationshipField)!==update.state.field(relationshipField))this.build(update.view);}
},{decorations:/* Expose the plugin’s current decoration set to CodeMirror. */ plugin=>plugin.decorations});
