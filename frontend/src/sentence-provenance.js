import {StateEffect,StateField} from '@codemirror/state';
import {documentPresentation} from './document-presentation.js';
import {codeRanges,mathExpressions} from './math.js';
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
export function provenanceUnits(state,unitKind='sentence'){
 let cache=unitCache.get(state.doc);if(!cache){cache=new Map();unitCache.set(state.doc,cache);}if(cache.has(unitKind))return cache.get(unitKind);
 const source=state.doc.toString(),ranges=[],headings=[];
 if(unitKind==='section'){
  documentPresentation(state).tree.iterate({enter(node){const match=/^(?:ATXHeading([1-6])|SetextHeading([12]))$/.exec(node.name);if(match)headings.push({from:node.from,level:Number(match[1]??match[2])});}});
  for(const [index,heading] of headings.entries()){const end=headings.slice(index+1).find(next=>next.level<=heading.level)?.from??source.length,text=source.slice(heading.from,end).trimEnd();ranges.push({from:heading.from,to:heading.from+text.length,text});}
 }else if(unitKind==='paragraph'){
  documentPresentation(state).tree.iterate({enter(node){if(node.name==='Paragraph'){const text=source.slice(node.from,node.to).trimEnd();if(text)ranges.push({from:node.from,to:node.from+text.length,text});}}});
 }else if(unitKind==='sentence'){
  const protectedRanges=[...codeRanges(source),...mathExpressions(source)];
  for(const paragraph of provenanceUnits(state,'paragraph'))for(const segment of segmenter.segment(paragraph.text)){const text=segment.segment.trim(),from=paragraph.from+segment.index+segment.segment.length-segment.segment.trimStart().length;if(text&&!protectedRanges.some(range=>from>=range.from&&from<range.to))ranges.push({from,to:from+text.length,text});}
 }
 cache.set(unitKind,ranges);return ranges;
}
export const sentenceUnits=state=>provenanceUnits(state,'sentence');
export function containedProvenanceUnits(state,from,to){return ['sentence','paragraph','section'].flatMap(unitKind=>provenanceUnits(state,unitKind).filter(unit=>unit.from>=from&&unit.to<=to).map(anchor=>({unitKind,anchor})));}
export function provenanceLabel(record){const kind=provenanceKinds[record.kind];return kind?(record.kind==='reference'&&record.direction==='incoming'?`References ${record.unitKind??'sentence'}`:kind[record.direction])+(record.kind==='embed'?` (${record.policy})`:''):'';}
export function provenancePair({eventId,kind,source,target,origin='tab-operation',policy,linkId=eventId,unitKind='sentence'}){
 if(!['sentence','paragraph','section'].includes(unitKind)||!provenanceKinds[kind]||kind==='embed'&&!['pinned','live'].includes(policy))throw Error('Unsupported sentence provenance kind or policy');
 const endpoint=(local,other,direction,suffix,otherSuffix)=>({id:linkId+':'+suffix,eventId,kind,unitKind,direction,origin,...(policy?{policy}:{}),document:local.document,anchor:{...local.anchor},captured:{sequence:local.sequence,anchor:{...(local.capturedAnchor??local.anchor)}},other:{...other,anchor:{...other.anchor},endpointId:linkId+':'+otherSuffix},stale:false});
 return [endpoint(source,target,'outgoing','source','target'),endpoint(target,source,'incoming','target','source')];
}
export const addSentenceProvenance=StateEffect.define();
function validAnchor(state,anchor,unitKind='sentence'){return provenanceUnits(state,unitKind).some(unit=>unit.from===anchor.from&&unit.to===anchor.to&&unit.text===anchor.text);}
export const sentenceProvenanceField=StateField.define({create:()=>[],update(records,tr){
 if(tr.docChanged)records=records.map(record=>{const anchor={...record.anchor,from:tr.changes.mapPos(record.anchor.from,1),to:tr.changes.mapPos(record.anchor.to,-1)};return {...record,anchor,stale:record.stale||!validAnchor(tr.state,anchor,record.unitKind??'sentence')};});
 for(const effect of tr.effects)if(effect.is(addSentenceProvenance))for(const record of effect.value){if(!records.some(r=>r.id===record.id)&&provenanceKinds[record.kind]&&['incoming','outgoing'].includes(record.direction)&&record.other?.anchor&&validAnchor(tr.state,record.anchor,record.unitKind??'sentence')&&(!['embed'].includes(record.kind)||['pinned','live'].includes(record.policy)))records=[...records,{...record,anchor:{...record.anchor},other:{...record.other,anchor:{...record.other.anchor}},stale:false}];}
 return records;
}});
export function sentenceProvenanceGroups(state){
 const groups=new Map();for(const record of state.field(sentenceProvenanceField,false)??[]){if(record.stale)continue;const unitKind=record.unitKind??'sentence',position=unitKind==='sentence'?record.anchor.from:state.doc.lineAt(record.anchor.from).from,key=unitKind+':'+position;if(!groups.has(key))groups.set(key,{position,unitKind,records:[]});groups.get(key).records.push(record);}
 return [...groups.values()].sort((a,b)=>a.position-b.position||a.unitKind.localeCompare(b.unitKind));
}
export function seedSentenceProvenance(state,document){
 const records=[],kinds=['fork','copy','revision','transpose','extract','split','merge','embed','reference'];
 for(const unitKind of ['sentence','paragraph','section']){const units=provenanceUnits(state,unitKind);if(units.length<2)continue;
  kinds.forEach((kind,index)=>{const source={document:document.id,title:document.title,sequence:document.sequence,anchor:units[index%Math.min(3,units.length-1)]},target={document:document.id,title:document.title,sequence:document.sequence,anchor:units[1+index%(units.length-1)]};records.push(...provenancePair({eventId:`demo:provenance:${unitKind}:${index}`,kind,unitKind,source,target,origin:'fixture',...(kind==='embed'?{policy:'pinned'}:{})}));});
 }
 return records;
}
