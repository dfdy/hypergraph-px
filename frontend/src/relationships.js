import {assertionProperties} from './assertion-properties.js';
import {documentHeadings} from './context-actions.js';
import {relationshipType,relationshipCategory} from './relationship-catalog.js';
// Synthetic, tab-only relationships. Exact UTF-16 draft ranges are not graph identities.
import {StateEffect,StateField} from '@codemirror/state';
import {documentPresentation} from './document-presentation.js';
import {codeRanges,mathExpressions} from './math.js';

export function adjacentPairs(state,kind){
 const text=state.doc.toString(),paragraphs=[];
 if(kind==='section'){
  const siblings=new Map(),stack=[];
  for(const heading of documentHeadings(text)){
   while(stack.length&&stack.at(-1).level>=heading.level)stack.pop();
   const parent=stack.at(-1)?.from??-1;if(!siblings.has(parent))siblings.set(parent,[]);siblings.get(parent).push(heading);stack.push(heading);
  }
  const pairs=[];
  const unit=heading=>{const source=text.slice(heading.from,heading.to).trimEnd();return {from:heading.from,to:heading.from+source.length,text:source};};
  for(const headings of siblings.values())for(let i=1;i<headings.length;i++){
   if(headings[i-1].to!==headings[i].from)continue;
   const left=unit(headings[i-1]),right=unit(headings[i]),gapLine=state.doc.lineAt(Math.min(left.to+1,text.length));
   pairs.push({left,right,position:gapLine.text.trim()===''?gapLine.from:right.from});
  }
  return pairs;
 }
 documentPresentation(state).tree.iterate({enter(node){if(node.name==='Paragraph'&&node.node.parent?.name==='Document')paragraphs.push({from:node.from,to:node.to,text:text.slice(node.from,node.to)});}});
 if(kind==='paragraph')return paragraphs.slice(1).flatMap((right,i)=>{
  const left=paragraphs[i],gap=text.slice(left.to,right.from);
  return /^\s+$/.test(gap)?[{left,right,position:state.doc.lineAt(left.to+1).from}]:[];
 });
 if(kind!=='sentence')return [];
 const protectedRanges=[...codeRanges(text),...mathExpressions(text)],pairs=[];
 for(const paragraph of paragraphs){
  const sentences=[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(paragraph.text)].map(segment=>{
   const from=paragraph.from+segment.index+segment.segment.length-segment.segment.trimStart().length;
   const value=segment.segment.trim();return {from,to:from+value.length,text:value};
  }).filter(range=>range.text);
  for(let i=1;i<sentences.length;i++){
   const left=sentences[i-1],right=sentences[i];
   if(protectedRanges.some(range=>range.from<right.to&&range.to>left.from))continue;
   pairs.push({left,right,position:right.from});
  }
 }
 return pairs;
}
export function pairForSelection(state,kind){
 const selection=state.selection.main,pairs=adjacentPairs(state,kind);
 if(!selection.empty){
  const text=state.sliceDoc(selection.from,selection.to);
  const from=selection.from+text.length-text.trimStart().length,to=selection.to-(text.length-text.trimEnd().length);
  // Both complete units define the target. The head alone can belong to a different pair.
  return pairs.find(pair=>pair.left.from===from&&pair.right.to===to)||null;
 }
 const caret=selection.head;
 // Prefer a boundary containing the caret, then a unit containing it. Never guess another section.
 return pairs.find(pair=>caret>=pair.left.to&&caret<=pair.right.from)||pairs.find(pair=>caret>=pair.left.from&&caret<=pair.right.to)||null;
}
export function selectedRelationshipPair(state){if(state.selection.main.empty)return null;for(const kind of ['section','sentence','paragraph']){const pair=pairForSelection(state,kind);if(pair)return {kind,pair};}return null;}
function samePair(pair,record){return pair.left.from===record.left.from&&pair.left.to===record.left.to&&pair.right.from===record.right.from&&pair.right.to===record.right.to;}
export const addRelationship=StateEffect.define();
export const removeRelationship=StateEffect.define();
export const relationshipField=StateField.define({
 create(){return {records:[],serial:0};},
 update(value,tr){
  let records=value.records,serial=value.serial,lastAddedId=value.lastAddedId??null;
  if(tr.docChanged){
   const pairs={sentence:adjacentPairs(tr.state,'sentence'),paragraph:adjacentPairs(tr.state,'paragraph'),section:adjacentPairs(tr.state,'section')};
   records=records.map(record=>{
    const map=range=>({...range,from:tr.changes.mapPos(range.from,1),to:tr.changes.mapPos(range.to,-1)});
    const mapped={...record,left:map(record.left),right:map(record.right)};
    const pair=pairs[record.kind].find(pair=>samePair(pair,mapped));
    const valid=!record.stale&&pair&&tr.state.sliceDoc(mapped.left.from,mapped.left.to)===record.left.text&&tr.state.sliceDoc(mapped.right.from,mapped.right.to)===record.right.text;
    return {...mapped,position:pair?.position??mapped.right.from,stale:!valid};
   });
  }
  for(const effect of tr.effects){
   if(effect.is(addRelationship)){
    lastAddedId=null;let properties;try{properties=assertionProperties(effect.value.properties??{});}catch{continue;}
    const {kind,name,pair,predicateId,custom,categoryId}=effect.value,definition=predicateId?relationshipType(predicateId):null,label=definition?.label??definition?.type??String(name??'').trim();
    if(predicateId&&!definition||custom&&(predicateId||categoryId&&!relationshipCategory(categoryId)))continue;
    if(!['sentence','paragraph','section'].includes(kind)||!label||label.length>80||!pair)continue;
    const actual=adjacentPairs(tr.state,kind).find(candidate=>samePair(candidate,pair));
    if(!actual||actual.left.text!==pair.left.text||actual.right.text!==pair.right.text)continue;
    const candidate={...actual,kind,name:label,properties,...(definition?{predicateId:definition.id,canonicalPredicateId:definition.canonicalId,orientation:definition.orientation}:custom?{custom:true,categoryId:categoryId??null}:{}),stale:false};
    const key=assertionIdentity(candidate),existing=key?records.find(record=>!record.stale&&assertionIdentity(record)===key):null;
    if(existing){lastAddedId=existing.id;continue;}
    lastAddedId=`demo:relationship:${++serial}`;records=[...records,{...candidate,id:lastAddedId}];
   }else if(effect.is(removeRelationship))records=records.filter(record=>record.id!==effect.value);
  }
  return records===value.records&&serial===value.serial&&lastAddedId===(value.lastAddedId??null)?value:{records,serial,lastAddedId};
 }
});
// A reviewed inverse wording is one assertion with reversed canonical roles,
// not another automatically generated edge. Resolve current mapped anchors lazily.
export function canonicalRelationship(record){
 const definition=relationshipType(record.predicateId);if(!definition)return null;
 return {predicateId:definition.canonicalId,source:definition.orientation==='reverse'?record.right:record.left,target:definition.orientation==='reverse'?record.left:record.right,symmetric:definition.symmetry==='symmetric',properties:assertionProperties(record.properties??{})};
}
// Browsing tags never participate in assertion identity. Different qualifiers remain distinct claims.
function assertionIdentity(record){
 const meaning=canonicalRelationship(record);if(!meaning)return null;
 let participants=[meaning.source,meaning.target].map(range=>[range.from,range.to]);
 if(meaning.symmetric)participants.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 return JSON.stringify([record.kind,meaning.predicateId,participants,meaning.properties]);
}
export function relationshipsAtCaret(state,position=state.selection.main.head){
 return state.field(relationshipField).records.filter(record=>[record.left,record.right].some(range=>range.to>range.from&&position>=range.from&&position<=range.to));
}
export function seedRelationships(state){
 const sentence=adjacentPairs(state,'sentence')[0],paragraph=adjacentPairs(state,'paragraph')[0];let serial=0;
 const records=[];
 for(const [kind,name,pair] of [['sentence','Elaborates',sentence],['sentence','Clarifies',sentence],['paragraph','Contrasts',paragraph]])if(pair)records.push({...pair,kind,name,properties:assertionProperties(),id:`demo:relationship:${++serial}`,stale:false});
 return {records,serial};
}
export function relationshipBoundaries(state){
 const groups=new Map();
 for(const record of state.field(relationshipField,false)?.records??[]){if(record.stale)continue;const key=`${record.kind}:${record.position}`;if(!groups.has(key)){const gapFrom=record.kind==='sentence'&&/^[ \t]+$/.test(state.sliceDoc(record.left.to,record.right.from))?record.left.to:undefined;groups.set(key,{kind:record.kind,position:record.position,gapFrom,ownLine:state.doc.lineAt(record.position).text.trim()==='',records:[]});}groups.get(key).records.push(record);}
 return [...groups.values()];
}
