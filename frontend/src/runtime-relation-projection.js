// SPDX-License-Identifier: AGPL-3.0-only
/**
 * # Hypergraph PX — Exact committed relationship overlays
 *
 * Maps bounded committed assertion byte ranges to current editor boundaries only
 * when document, snapshot, revision and occurrence ownership all match.
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
 * Used by: Annotations and provenance panels — runtime adapter in-text relation
 * loading and editor relationship markers.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Assertions and predicate semantics][spec-2]
 * - [Exact text and anchors][spec-3]
 *
 * Boundary: No quote search, anchor relocation or source edit occurs. Unsupported,
 * stale, nonbinary or nonadjacent claims remain excluded and counted rather than
 * guessed into place.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-relation-projection.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

import {adjacentPairs} from './relationships.js';
import {editorProjection} from './owned-source.js';
import {validAssertionEntry} from './runtime-assertions.js';
import {relationshipType} from './relationship-catalog.js';

/** Compare complete source identity arrays and occurrence paths structurally. */
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/** Encode assertion node identity as a stable display-record key. */
const key=id=>id.map(/* Encode one identity byte as two hexadecimal digits. */ n=>n.toString(16).padStart(2,'0')).join('');

/** Validate exact 32-byte identities before accepting scope ownership. */
const id=value=>Array.isArray(value)&&value.length===32&&value.every(/* Reject noninteger or out-of-range identity bytes. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Use an approved inverse label only when captured predicate meaning matches the registry. */
function displayName(entry,reversed,kind){
 const definition=entry.definition.definition;


 if(!reversed||definition.symmetric)return definition.label;


 const known=relationshipType(definition.predicate_id),inverse=known?.inverseId?relationshipType(known.inverseId):null;


 // Use a reviewed converse only when the captured meaning matches this registry.
 if(known&&inverse&&known.orientation==='forward'&&known.label===definition.label&&known.definition===definition.description&&definition.roles.find(/* Locate the captured source role for converse-label verification. */ r=>r.id==='source')?.label===known.sourceRole&&definition.roles.find(/* Locate the captured target role for converse-label verification. */ r=>r.id==='target')?.label===known.targetRole)return inverse.label;


 return definition.label+' · '+(kind==='sentence'?'second to first':'below to above');
}

// Store only requested boundaries, not a map entry for every source character.
/** Map only requested UTF8 byte boundaries to display UTF16 cuts while collapsing CRLF. */
function displayBoundaries(source,wanted){
 const result=new Map();

 let bytes=0,display=0;


 for(let at=0;at<source.length;){
  if(wanted.has(bytes))result.set(bytes,display);


  if(source[at]==='\r'&&source[at+1]==='\n'){at+=2;bytes+=2;display++;

   continue;}


  const cp=source.codePointAt(at),units=cp>0xffff?2:1;


  bytes+=cp<0x80?1:cp<0x800?2:cp<0x10000?3:4;display+=units;at+=units;
 }


 if(wanted.has(bytes))result.set(bytes,display);

 return result;
}

/** Project validated same-source binary assertions onto exact adjacent editor units and report exclusions. */
export function projectRuntimeRelations(state,scope){
 if(!scope||!['document','node','snapshot','revision','occurrence'].every(/* Validate every required scope identity. */ k=>id(scope[k]))||typeof scope.source!=='string'||!scope.source.isWellFormed()||new TextEncoder().encode(scope.source).length>2*1024*1024||!Array.isArray(scope.entries)||scope.entries.length>1024||scope.entries.some(/* Reject malformed assertion entries before projection begins. */ e=>!validAssertionEntry(e)))throw Error('Invalid in-text relation scope');


 if(editorProjection(scope.source)!==state.doc.toString())throw Error('Stale in-text relation source');


 const seen=new Set();

 for(const e of scope.entries){const identity=key(e.record.node);

  if(seen.has(identity))throw Error('Duplicate in-text relation identity');

  seen.add(identity);}


 /** Require complete committed source ownership, including the exact occurrence path. */
 const matches=source=>same(source.document,scope.document)&&same(source.node,scope.node)&&same(source.snapshot,scope.snapshot)&&same(source.revision,scope.revision)&&same(source.occurrence_path,[scope.occurrence]);


 const eligible=scope.entries.filter(/* Select only proposed/accepted binary assertions whose participants belong to this exact scope. */ e=>['proposed','accepted'].includes(e.record.status)&&e.definition.definition.participant_mode==='binary'&&e.record.participants.length===2&&e.record.participants.every(/* Check this participant against all committed ownership coordinates. */ p=>matches(p.source)));


 const wanted=new Set(eligible.flatMap(/* Collect all requested byte boundaries for one eligible assertion. */ e=>e.record.participants.flatMap(/* Collect each participant’s exact start and end byte cuts. */ p=>[p.source.start_byte,p.source.end_byte]))),offsets=displayBoundaries(scope.source,wanted);


 const pairs=['section','sentence','paragraph'].flatMap(/* Enumerate adjacent pairs for each supported structural kind. */ kind=>adjacentPairs(state,kind).map(/* Retain the structural kind alongside its pair bounds. */ pair=>({...pair,kind}))),records=[];


 for(const entry of eligible){
  const ranges=entry.record.participants.map(/* Convert one participant’s committed byte range through the exact boundary map. */ p=>({from:offsets.get(p.source.start_byte),to:offsets.get(p.source.end_byte)}));


  if(ranges.some(/* Exclude unmappable, empty or reversed participant ranges. */ r=>r.from===undefined||r.to===undefined||r.from>=r.to))continue;


  const [left,right]=ranges.toSorted(/* Order participants by their visual source position. */ (a,b)=>a.from-b.from);


  const pair=pairs.find(/* Require both exact participant extents to equal one current adjacent pair. */ p=>p.left.from===left.from&&p.left.to===left.to&&p.right.from===right.from&&p.right.to===right.to);


  if(!pair)continue;


  records.push({...pair,id:'runtime:'+key(entry.record.node),name:displayName(entry,ranges[0].from>ranges[1].from,pair.kind),properties:entry.record.properties,status:entry.record.status,runtime:true,stale:false,entry});
 }


 return {records,loaded:scope.entries.length,excluded:scope.entries.length-records.length};
}
