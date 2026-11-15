/**
 * # Hypergraph PX — Source-unit provenance display records
 *
 * Derive exact sentence/paragraph/section units and retain explicitly labelled
 * tab-operation or synthetic provenance links around those units.
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
 * Used by: Annotations and provenance presentation, in-text provenance markers and
 * the application fixture/action coordination.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Provenance and history contract][spec-2]
 * - [Exact text and anchors][spec-3]
 *
 * Boundary: These display records do not prove authentic historical provenance or
 * grant authority. Anchors become stale when edited text no longer matches the
 * exact source unit; fixtures remain synthetic.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/sentence-provenance.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/provenance-model.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

import {StateEffect,StateField} from '@codemirror/state';
import {documentPresentation} from './document-presentation.js';
import {codeRanges,mathExpressions} from './math.js';

/** Define supported display labels/icons for explicit provenance relation families. */
export const provenanceKinds=Object.freeze({
 fork:{incoming:'Is a fork',outgoing:'Has been forked',path:'M7 4v10m0-6h6a4 4 0 0 0 4-4M7 14v6M4 4h6M14 4h6M4 20h6'},
 copy:{incoming:'Is a copy of',outgoing:'Has been copied',path:'M8 8h11v12H8zM5 16H3V3h12v2'},
 revision:{incoming:'Is a revision of',outgoing:'Has a later revision',path:'M5 5h10v4M5 5v14h14v-7M11 13l8-8 2 2-8 8-3 1z'},
 transpose:{incoming:'Is transposed from',outgoing:'Has a transposed occurrence',path:'M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4'},
 extract:{incoming:'Is extracted from',outgoing:'Has extracted content',path:'M4 4h10v5M4 4v16h16v-8M11 13l9-9m-6 0h6v6'},
 split:{incoming:'Is split from',outgoing:'Has been split',path:'M12 20V10M12 10 5 3m7 7 7-7M3 7V3h4m10 0h4v4'},
 merge:{incoming:'Is merged from',outgoing:'Contributes to a merge',path:'M5 3v5l7 6 7-6V3M12 14v7m-4-4 4 4 4-4'},
 embed:{incoming:'Is an embed of',outgoing:'Has an embedded occurrence',path:'M8 4H3v16h5m8-16h5v16h-5M8 12h8m-3-3 3 3-3 3'},
 reference:{incoming:'References sentence',outgoing:'Is referenced by',path:'M10 8 7 5 3 9l3 3m8 4 3 3 4-4-3-3M8 16l8-8'}
});

const unitCache=new WeakMap(),segmenter=new Intl.Segmenter('en',{granularity:'sentence'});

/** Derive and cache exact source-unit ranges for supported sentence, paragraph or section display grouping. */
export function provenanceUnits(state,unitKind='sentence'){
 let cache=unitCache.get(state.doc);

 if(!cache){cache=new Map();unitCache.set(state.doc,cache);}

 if(cache.has(unitKind))return cache.get(unitKind);


 const source=state.doc.toString(),ranges=[],headings=[];


 if(unitKind==='section'){
  documentPresentation(state).tree.iterate({/* Collect heading starts and levels for section provenance extents. */ enter(node){const match=/^(?:ATXHeading([1-6])|SetextHeading([12]))$/.exec(node.name);

   if(match)headings.push({from:node.from,level:Number(match[1]??match[2])});}});


  for(const [index,heading] of headings.entries()){const end=headings.slice(index+1).find(/* Find the next heading that ends this provenance section's nesting level. */ next=>next.level<=heading.level)?.from??source.length,text=source.slice(heading.from,end).trimEnd();

   ranges.push({from:heading.from,to:heading.from+text.length,text});}
 }else if(unitKind==='paragraph'){
  documentPresentation(state).tree.iterate({/* Collect exact nonempty paragraph text from Markdown paragraph nodes. */ enter(node){if(node.name==='Paragraph'){const text=source.slice(node.from,node.to).trimEnd();

    if(text)ranges.push({from:node.from,to:node.from+text.length,text});}}});
 }else if(unitKind==='sentence'){
  const protectedRanges=[...codeRanges(source),...mathExpressions(source)];


  for(const paragraph of provenanceUnits(state,'paragraph'))for(const segment of segmenter.segment(paragraph.text)){const text=segment.segment.trim(),from=paragraph.from+segment.index+segment.segment.length-segment.segment.trimStart().length;

   if(text&&!protectedRanges.some(/* Exclude sentence starts contained in protected code or mathematics source. */ range=>from>=range.from&&from<range.to))ranges.push({from,to:from+text.length,text});}
 }


 cache.set(unitKind,ranges);

 return ranges;
}

/** Return sentence units through the shared exact-source unit derivation. */
export const sentenceUnits=state=>provenanceUnits(state,'sentence');

/** Collect complete semantic units wholly contained by the requested source interval. */
export function containedProvenanceUnits(state,from,to){return ['sentence','paragraph','section'].flatMap(/* Collect one supported semantic unit family within the exact selection. */ unitKind=>provenanceUnits(state,unitKind).filter(/* Keep only units whose entire interval fits the requested selection. */ unit=>unit.from>=from&&unit.to<=to).map(/* Attach the unit kind to its retained exact source anchor. */ anchor=>({unitKind,anchor})));}

/** Describe a provenance record's direction and explicit embed/reference policy for display. */
export function provenanceLabel(record){const kind=provenanceKinds[record.kind];

 return kind?(record.kind==='reference'&&record.direction==='incoming'?`References ${record.unitKind??'sentence'}`:kind[record.direction])+(record.kind==='embed'?` (${record.policy})`:''):'';}

/** Construct paired directional display endpoints from exact captured source/target units. */
export function provenancePair({eventId,kind,source,target,origin='tab-operation',policy,linkId=eventId,unitKind='sentence'}){
 if(!['sentence','paragraph','section'].includes(unitKind)||!provenanceKinds[kind]||kind==='embed'&&!['pinned','live'].includes(policy))throw Error('Unsupported sentence provenance kind or policy');


 /** Build one directional endpoint while retaining local/counterpart capture context. */
 const endpoint=(local,other,direction,suffix,otherSuffix)=>({id:linkId+':'+suffix,eventId,kind,unitKind,direction,origin,...(policy?{policy}:{}),document:local.document,anchor:{...local.anchor},captured:{sequence:local.sequence,anchor:{...(local.capturedAnchor??local.anchor)}},other:{...other,anchor:{...other.anchor},endpointId:linkId+':'+otherSuffix},stale:false});


 return [endpoint(source,target,'outgoing','source','target'),endpoint(target,source,'incoming','target','source')];
}

/** Request addition of explicit source-unit display records through editor state. */
export const addSentenceProvenance=StateEffect.define();

/** Require an anchor's exact interval and text to equal a current derived semantic unit. */
function validAnchor(state,anchor,unitKind='sentence'){return provenanceUnits(state,unitKind).some(/* Match the anchor's exact position, extent and source text. */ unit=>unit.from===anchor.from&&unit.to===anchor.to&&unit.text===anchor.text);}

/** Keep source-unit provenance display records mapped to current text with explicit staleness. */
export const sentenceProvenanceField=StateField.define({create:/* Initialize source-unit provenance with no assumed records. */ ()=>[],/* Map records through edits and add only supported exact-anchor display records. */ update(records,tr){
 if(tr.docChanged)records=records.map(/* Translate one existing anchor and retain staleness when its exact unit no longer matches. */ record=>{const anchor={...record.anchor,from:tr.changes.mapPos(record.anchor.from,1),to:tr.changes.mapPos(record.anchor.to,-1)};

  return {...record,anchor,stale:record.stale||!validAnchor(tr.state,anchor,record.unitKind??'sentence')};});


 for(const effect of tr.effects)if(effect.is(addSentenceProvenance))for(const record of effect.value){if(!records.some(/* Detect an already retained provenance record identity before adding another. */ r=>r.id===record.id)&&provenanceKinds[record.kind]&&['incoming','outgoing'].includes(record.direction)&&record.other?.anchor&&validAnchor(tr.state,record.anchor,record.unitKind??'sentence')&&(!['embed'].includes(record.kind)||['pinned','live'].includes(record.policy)))records=[...records,{...record,anchor:{...record.anchor},other:{...record.other,anchor:{...record.other.anchor}},stale:false}];}


 return records;
}});

/** Group non-stale provenance records by unit kind and display position. */
export function sentenceProvenanceGroups(state){
 const groups=new Map();

 for(const record of state.field(sentenceProvenanceField,false)??[]){if(record.stale)continue;

  const unitKind=record.unitKind??'sentence',position=unitKind==='sentence'?record.anchor.from:state.doc.lineAt(record.anchor.from).from,key=unitKind+':'+position;

  if(!groups.has(key))groups.set(key,{position,unitKind,records:[]});

  groups.get(key).records.push(record);}


 return [...groups.values()].sort(/* Order marker groups by source position and stable unit-kind label. */ (a,b)=>a.position-b.position||a.unitKind.localeCompare(b.unitKind));
}

/** Create explicitly synthetic examples of each supported provenance display kind. */
export function seedSentenceProvenance(state,document){
 const records=[],kinds=['fork','copy','revision','transpose','extract','split','merge','embed','reference'];


 for(const unitKind of ['sentence','paragraph','section']){const units=provenanceUnits(state,unitKind);

  if(units.length<2)continue;


  kinds.forEach(/* Construct one paired synthetic relation between existing exact source units. */ (kind,index)=>{const source={document:document.id,title:document.title,sequence:document.sequence,anchor:units[index%Math.min(3,units.length-1)]},target={document:document.id,title:document.title,sequence:document.sequence,anchor:units[1+index%(units.length-1)]};

   records.push(...provenancePair({eventId:`demo:provenance:${unitKind}:${index}`,kind,unitKind,source,target,origin:'fixture',...(kind==='embed'?{policy:'pinned'}:{})}));});
 }


 return records;
}
