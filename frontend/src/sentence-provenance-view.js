/**
 * # Hypergraph PX — Source-unit provenance markers
 *
 * Present explicit provenance links as accessible inline/block controls and route
 * user inspection to the application.
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
 * Used by: Owned-source editing and presentation and annotation/provenance
 * inspection in the document editor.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Provenance and history contract][spec-2]
 *
 * Boundary: Markers are derived UI, not content or authentication. Synthetic and
 * tab-only origins remain labelled, and interactions do not modify authored
 * source.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/sentence-provenance-view.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/provenance-model.md
 */

import {Decoration,ViewPlugin,WidgetType} from '@codemirror/view';
import {provenanceKinds,provenanceLabel,sentenceProvenanceField,sentenceProvenanceGroups} from './sentence-provenance.js';

/** Ignore inspection until the application installs its explicit provenance handler. */
let inspect=()=>{};

/** Install the application-owned source-unit provenance inspector. */
export function onInspectSentenceProvenance(handler){inspect=handler;}

/** Create accessible directional buttons for each explicit record in a provenance group. */
export function createSentenceProvenanceMarker(group,onClick){
 const span=document.createElement('span');

 const unitKind=group.unitKind??'sentence';

 span.className=unitKind==='sentence'?'sentence-provenance':'block-provenance';span.dataset.unitKind=unitKind;span.contentEditable='false';span.role='group';span.setAttribute('aria-label',`${unitKind[0].toUpperCase()+unitKind.slice(1)} provenance links`);


 for(const record of group.records){
  const button=document.createElement('button');

  button.type='button';button.className='sentence-provenance-icon';button.dataset.provenanceId=record.id;button.dataset.unitKind=unitKind;button.dataset.kind=record.kind;button.dataset.direction=record.direction;

  const name=provenanceLabel(record);

  button.setAttribute('aria-label',name);button.dataset.tooltip=`${name} · ${unitKind} · ${record.other.title} · ${record.origin==='fixture'?'synthetic example':'tab-only operation'}`;


  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');

  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');

  const path=document.createElementNS(svg.namespaceURI,'path');

  path.setAttribute('d',provenanceKinds[record.kind].path);svg.append(path);button.append(svg);


  const direction=document.createElement('span');

  direction.className='provenance-direction';direction.setAttribute('aria-hidden','true');direction.style.transform=record.direction==='incoming'?'rotate(180deg)':'';button.append(direction);button.onmousedown=/* Keep marker mouse-down from replacing the existing editor selection. */ event=>event.preventDefault();button.onclick=/* Request inspection of this exact provenance record identity. */ ()=>onClick?.(record.id);span.append(button);
 }


 return span;
}

class ProvenanceWidget extends WidgetType{
 /** Retain one group of source-aligned provenance records for widget comparison. */
 constructor(group){super();this.group=group;}

 /* Reuse a provenance widget only when its complete displayed group agrees. */ eq(other){return JSON.stringify(this.group)===JSON.stringify(other.group);}

 /* Build inline or block provenance controls with the corresponding unit-kind presentation. */ toDOM(){const marker=createSentenceProvenanceMarker(this.group,/* Forward a selected marker identity to the installed provenance inspector. */ id=>inspect(id));

  if((this.group.unitKind??'sentence')==='sentence')return marker;

  const row=document.createElement('span');

  row.className='provenance-block-row provenance-'+this.group.unitKind;row.contentEditable='false';row.append(marker);

  return row;}

 /* Keep widget events inside provenance controls rather than source editing. */ ignoreEvent(){return true;}
}

/** Install a view plugin rendering current source-unit provenance groups. */
export const sentenceProvenanceMarkers=ViewPlugin.fromClass(class{
 /** Build initial provenance decorations for the current editor view. */
 constructor(view){this.build(view);}


 /** Create current marker decorations and one block-start line class per source position. */
 build(view){const groups=sentenceProvenanceGroups(view.state),lines=new Set(),decorations=[];


  for(const group of groups){if(group.unitKind!=='sentence'&&!lines.has(group.position)){lines.add(group.position);decorations.push(Decoration.line({class:'cm-provenance-block-start'}).range(group.position));}

   decorations.push(Decoration.widget({widget:new ProvenanceWidget(group),side:group.unitKind==='sentence'?0:-10}).range(group.position));}


  this.decorations=Decoration.set(decorations,true);
 }


 /** Rebuild markers when text or explicit provenance field state changes. */
 update(update){if(update.docChanged||update.startState.field(sentenceProvenanceField)!==update.state.field(sentenceProvenanceField))this.build(update.view);}

},{decorations:/* Expose the plugin's current decoration set to CodeMirror. */ plugin=>plugin.decorations});
