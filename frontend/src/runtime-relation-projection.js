// SPDX-License-Identifier: AGPL-3.0-only
// Exact committed overlays only. No quote searching, relocation or source changes.
import {adjacentPairs} from './relationships.js';
import {editorProjection} from './owned-source.js';
import {validAssertionEntry} from './runtime-assertions.js';
import {relationshipType} from './relationship-catalog.js';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const key=id=>id.map(n=>n.toString(16).padStart(2,'0')).join('');
const id=value=>Array.isArray(value)&&value.length===32&&value.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
function displayName(entry,reversed,kind){
 const definition=entry.definition.definition;
 if(!reversed||definition.symmetric)return definition.label;
 const known=relationshipType(definition.predicate_id),inverse=known?.inverseId?relationshipType(known.inverseId):null;
 // Use a reviewed converse only when the captured meaning matches this registry.
 if(known&&inverse&&known.orientation==='forward'&&known.label===definition.label&&known.definition===definition.description&&definition.roles.find(r=>r.id==='source')?.label===known.sourceRole&&definition.roles.find(r=>r.id==='target')?.label===known.targetRole)return inverse.label;
 return definition.label+' · '+(kind==='sentence'?'second to first':'below to above');
}

// Store only requested boundaries, not a map entry for every source character.
function displayBoundaries(source,wanted){
 const result=new Map();let bytes=0,display=0;
 for(let at=0;at<source.length;){
  if(wanted.has(bytes))result.set(bytes,display);
  if(source[at]==='\r'&&source[at+1]==='\n'){at+=2;bytes+=2;display++;continue;}
  const cp=source.codePointAt(at),units=cp>0xffff?2:1;
  bytes+=cp<0x80?1:cp<0x800?2:cp<0x10000?3:4;display+=units;at+=units;
 }
 if(wanted.has(bytes))result.set(bytes,display);return result;
}
export function projectRuntimeRelations(state,scope){
 if(!scope||!['document','node','snapshot','revision','occurrence'].every(k=>id(scope[k]))||typeof scope.source!=='string'||!scope.source.isWellFormed()||new TextEncoder().encode(scope.source).length>2*1024*1024||!Array.isArray(scope.entries)||scope.entries.length>1024||scope.entries.some(e=>!validAssertionEntry(e)))throw Error('Invalid in-text relation scope');
 if(editorProjection(scope.source)!==state.doc.toString())throw Error('Stale in-text relation source');
 const seen=new Set();for(const e of scope.entries){const identity=key(e.record.node);if(seen.has(identity))throw Error('Duplicate in-text relation identity');seen.add(identity);}
 const matches=source=>same(source.document,scope.document)&&same(source.node,scope.node)&&same(source.snapshot,scope.snapshot)&&same(source.revision,scope.revision)&&same(source.occurrence_path,[scope.occurrence]);
 const eligible=scope.entries.filter(e=>['proposed','accepted'].includes(e.record.status)&&e.definition.definition.participant_mode==='binary'&&e.record.participants.length===2&&e.record.participants.every(p=>matches(p.source)));
 const wanted=new Set(eligible.flatMap(e=>e.record.participants.flatMap(p=>[p.source.start_byte,p.source.end_byte]))),offsets=displayBoundaries(scope.source,wanted);
 const pairs=['section','sentence','paragraph'].flatMap(kind=>adjacentPairs(state,kind).map(pair=>({...pair,kind}))),records=[];
 for(const entry of eligible){
  const ranges=entry.record.participants.map(p=>({from:offsets.get(p.source.start_byte),to:offsets.get(p.source.end_byte)}));
  if(ranges.some(r=>r.from===undefined||r.to===undefined||r.from>=r.to))continue;
  const [left,right]=ranges.toSorted((a,b)=>a.from-b.from);
  const pair=pairs.find(p=>p.left.from===left.from&&p.left.to===left.to&&p.right.from===right.from&&p.right.to===right.to);
  if(!pair)continue;
  records.push({...pair,id:'runtime:'+key(entry.record.node),name:displayName(entry,ranges[0].from>ranges[1].from,pair.kind),properties:entry.record.properties,status:entry.record.status,runtime:true,stale:false,entry});
 }
 return {records,loaded:scope.entries.length,excluded:scope.entries.length-records.length};
}
