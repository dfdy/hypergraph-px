// Synthetic, tab-only relationships. Exact UTF-16 draft ranges are not graph identities.
import {StateEffect,StateField} from '@codemirror/state';
import {documentPresentation} from './document-presentation.js';
import {codeRanges,mathExpressions} from './math.js';

export function adjacentPairs(state,kind){
 const text=state.doc.toString(),paragraphs=[];
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
export function pairAtCaret(state,kind){
 const caret=state.selection.main.head,pairs=adjacentPairs(state,kind);
 // Prefer a boundary containing the caret, then a unit containing it. Never guess another section.
 return pairs.find(pair=>caret>=pair.left.to&&caret<=pair.right.from)||pairs.find(pair=>caret>=pair.left.from&&caret<=pair.right.to)||null;
}
function samePair(pair,record){return pair.left.from===record.left.from&&pair.left.to===record.left.to&&pair.right.from===record.right.from&&pair.right.to===record.right.to;}
export const addRelationship=StateEffect.define();
export const removeRelationship=StateEffect.define();
export const relationshipField=StateField.define({
 create(){return {records:[],serial:0};},
 update(value,tr){
  let records=value.records,serial=value.serial;
  if(tr.docChanged){
   const pairs={sentence:adjacentPairs(tr.state,'sentence'),paragraph:adjacentPairs(tr.state,'paragraph')};
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
    const {kind,name,pair}=effect.value,label=String(name).trim();
    if(!['sentence','paragraph'].includes(kind)||!label||label.length>80||!pair)continue;
    const actual=adjacentPairs(tr.state,kind).find(candidate=>samePair(candidate,pair));
    if(!actual||actual.left.text!==pair.left.text||actual.right.text!==pair.right.text)continue;
    records=[...records,{...actual,kind,name:label,id:`demo:relationship:${++serial}`,stale:false}];
   }else if(effect.is(removeRelationship))records=records.filter(record=>record.id!==effect.value);
  }
  return records===value.records&&serial===value.serial?value:{records,serial};
 }
});
export function seedRelationships(state){
 const sentence=adjacentPairs(state,'sentence')[0],paragraph=adjacentPairs(state,'paragraph')[0];let serial=0;
 const records=[];
 for(const [kind,name,pair] of [['sentence','Elaborates',sentence],['sentence','Clarifies',sentence],['paragraph','Contrasts',paragraph]])if(pair)records.push({...pair,kind,name,id:`demo:relationship:${++serial}`,stale:false});
 return {records,serial};
}
export function relationshipBoundaries(state){
 const groups=new Map();
 for(const record of state.field(relationshipField,false)?.records??[]){if(record.stale)continue;const key=`${record.kind}:${record.position}`;if(!groups.has(key))groups.set(key,{kind:record.kind,position:record.position,records:[]});groups.get(key).records.push(record);}
 return [...groups.values()];
}
