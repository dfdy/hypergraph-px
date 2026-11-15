/**
 * # Hypergraph PX — Runtime relation projection anchor regression scenarios
 *
 * Checks structural anchors, exact source ownership and visible direction for
 * runtime relation projection.
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
 * Used by: Frontend development validation — Node unit-test runner and regression
 * suite.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Synthetic editor fixtures preserve exact text and distinguish tab-only
 * provenance from durable retrospective claims. Passing these cases is not
 * integrated graph or persistence acceptance.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-relation-projection.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {relationshipControlWord} from '../src/relationship-markers.js';
import {relationshipType} from '../src/relationship-catalog.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {projectRuntimeRelations} from '../src/runtime-relation-projection.js';
import {ownedSourceExtension,editorProjection} from '../src/owned-source.js';
import {relationshipField,setRuntimeRelationships,adjacentPairs} from '../src/relationships.js';

const id=/* Allocate deterministic synthetic committed-source identities. */ n=>Array(32).fill(n),encode=/* Measure exact UTF8 source byte lengths for fixture anchors. */ text=>new TextEncoder().encode(text).length;

/** Bind source text to complete committed document/snapshot/revision/occurrence scope. */
const scope=source=>({document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence:id(5),source,entries:[]});

/** Create an LF display backed by exact original source. */
const state=raw=>EditorState.create({doc:editorProjection(raw),extensions:[ownedSourceExtension(raw),relationshipField]});

/** Build a binary captured assertion with exact source-role coordinates. */
function entry(s,left,right,n=20,name='determines'){
 /** Locate fixture text once and calculate its exact UTF8 cuts without normalising endings. */
 const source=text=>{const from=s.source.indexOf(text);

  assert.ok(from>=0);

  return {document:s.document,node:s.node,snapshot:s.snapshot,revision:s.revision,occurrence_path:[s.occurrence],start_byte:encode(s.source.slice(0,from)),end_byte:encode(s.source.slice(0,from+text.length))};};


 return {revision:id(n+1),generation:0,record:{node:id(n),parent:null,definition:id(30),participants:[{role:'source',source:source(left)},{role:'target',source:source(right)}],properties:{negated:false,certainty:'unspecified',attribution:'',scope:''},status:'proposed',proposer:id(40),actor:id(40),device:id(41),operation:id(42)},definition:{version:id(50),definition:{predicate_id:'test:predicate',registry_version:1,label:name,description:'Recorded claim; not proof.',context_fields:[],symmetric:false,participant_mode:'binary',roles:[{id:'source',label:'Source'},{id:'target',label:'Target'}]}}};
}

test('exact UTF8 scopes project distinct sentence and paragraph controls while retaining role direction',/* Verify sentence/paragraph controls preserve distinct assertion identities and canonical role direction across Unicode and CRLF. */ ()=>{
 const raw='# Scope\r\n\r\nCafé 😀 first. Second e\u0301 sentence.\r\n\r\nAnother paragraph.\r',s=scope(raw),view=state(raw);


 const first=entry(s,'Café 😀 first.','Second e\u0301 sentence.'),second=entry(s,'Café 😀 first.','Second e\u0301 sentence.',22,'justifies'),paragraph=entry(s,'Café 😀 first. Second e\u0301 sentence.','Another paragraph.',24,'contrasts');


 second.record.participants.reverse();second.record.participants[0].role='source';second.record.participants[1].role='target';s.entries=[first,second,paragraph];


 const result=projectRuntimeRelations(view,s);

 assert.deepEqual(result.records.map(/* Collect projected structural kinds for adjacency assertions. */ r=>r.kind),['sentence','sentence','paragraph']);assert.equal(result.records[0].position,adjacentPairs(view,'sentence')[0].position);assert.notEqual(result.records[0].id,result.records[1].id);assert.equal(result.records[1].entry.record.participants[0].source.start_byte,second.record.participants[0].source.start_byte);assert.equal(view.doc.toString(),editorProjection(raw));assert.equal(raw,s.source);
});

test('cross-document, old revision/snapshot, other occurrence, n-ary and inactive claims do not acquire controls',/* Verify foreign ownership, old versions, n-ary/inactive claims and scalar-splitting cuts acquire no controls. */ ()=>{
 const raw='First. Second.',s=scope(raw),base=entry(s,'First.','Second.');


 for(const field of ['document','node','snapshot','revision','occurrence_path']){
  const changed=structuredClone(base);

  changed.record.participants[0].source[field]=field==='occurrence_path'?[id(99)]:id(99);assert.equal(projectRuntimeRelations(state(raw),{...s,entries:[changed]}).records.length,0,field);
 }


 for(const status of ['rejected','superseded']){const changed=structuredClone(base);

  changed.record.status=status;assert.equal(projectRuntimeRelations(state(raw),{...s,entries:[changed]}).excluded,1);}


 const declared=structuredClone(base);

 declared.definition.definition.participant_mode='role_labelled';assert.equal(projectRuntimeRelations(state(raw),{...s,entries:[declared]}).records.length,0);


 const split=entry(scope('First 😀. Second.'),'First 😀.','Second.');

 split.record.participants[0].source.end_byte=8;assert.equal(projectRuntimeRelations(state('First 😀. Second.'),{...scope('First 😀. Second.'),entries:[split]}).records.length,0);
 assert.throws(/* Reject duplicate assertion identity before overlay placement. */ ()=>projectRuntimeRelations(state(raw),{...s,entries:[base,base]}),/Duplicate/);assert.throws(/* Reject source whose display no longer matches the editor. */ ()=>projectRuntimeRelations(state(raw+'!'),{...s,entries:[base]}),/Stale/);
});

test('repeated text is resolved solely by exact ranges and partial units are never inferred',/* Verify repeated text uses exact coordinates and partial units never acquire inferred controls. */ ()=>{
 const raw='First. Next. First. Next.',s=scope(raw),r=entry(s,'First.','Next.');


 for(const p of r.record.participants){p.source.start_byte+=13;p.source.end_byte+=13;}


 const result=projectRuntimeRelations(state(raw),{...s,entries:[r]});

 assert.equal(result.records.length,1);assert.equal(result.records[0].left.from,13);assert.equal(result.records[0].right.from,20);
 r.record.participants[0].source.start_byte++;assert.equal(projectRuntimeRelations(state(raw),{...s,entries:[r]}).records.length,0);
});

test('runtime decorations preserve exact source and are dropped rather than relocated on edits',/* Verify runtime decorations require exact owned source and are dropped rather than relocated after edits. */ ()=>{
 const raw='First. Second.\r\n',s=scope(raw);

 let view=state(raw);

 s.entries=[entry(s,'First.','Second.')];

 const projection=projectRuntimeRelations(view,s),effect={source:raw,text:editorProjection(raw),records:projection.records};


 view=view.update({effects:setRuntimeRelationships.of(effect)}).state;assert.equal(view.field(relationshipField).records.length,1);assert.equal(view.doc.toString(),editorProjection(raw));
 view=view.update({effects:setRuntimeRelationships.of({...effect,source:raw.replace('\r\n','\n')})}).state;assert.equal(view.field(relationshipField).records.length,0);
 view=view.update({effects:setRuntimeRelationships.of(effect)}).state;view=view.update({changes:{from:0,insert:'Unrelated. '}}).state;assert.equal(view.field(relationshipField).records.length,0);
 view=view.update({effects:setRuntimeRelationships.of(effect)}).state;assert.equal(view.field(relationshipField).records.length,0);
});

test('reversed relations use only registered matching converses or explicit direction words',/* Verify reverse wording uses only matching registered converses or explicit direction labels. */ ()=>{
 const raw='First. Second.',s=scope(raw),r=entry(s,'Second.','First.'),known=relationshipType('preview:ontological:determines');


 Object.assign(r.definition.definition,{predicate_id:known.id,label:known.label,description:known.definition,roles:[{id:'source',label:known.sourceRole},{id:'target',label:known.targetRole}]});


 let result=projectRuntimeRelations(state(raw),{...s,entries:[r]});

 assert.equal(result.records[0].name,'is determined by');assert.equal(result.records[0].entry.record.participants[0].source.start_byte,7);
 r.definition.definition.description='A different captured meaning';result=projectRuntimeRelations(state(raw),{...s,entries:[r]});assert.equal(result.records[0].name,'determines · second to first');
 r.definition.definition.symmetric=true;assert.equal(projectRuntimeRelations(state(raw),{...s,entries:[r]}).records[0].name,'determines');
});

test('visible relation words preserve negation and declared certainty rather than displaying an opposite claim',/* Verify visible relation wording retains negation and declared certainty. */ ()=>{
 assert.equal(relationshipControlWord({name:'determines'}),'determines');
 assert.equal(relationshipControlWord({name:'determines',properties:{negated:true,certainty:'possible'}}),'possible: not determines');
});
