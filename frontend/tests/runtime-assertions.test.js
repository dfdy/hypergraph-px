/**
 * # Hypergraph PX — Runtime assertions retry and scope scenarios
 *
 * Checks exact captured ownership and same-operation recovery for runtime
 * assertions using synthetic transport and source fixtures.
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
 * - [Browser runtime and API contract][spec-2]
 * - [Assertions and predicate semantics][spec-3]
 *
 * Boundary: These isolated tests preserve the distinction between private recovery
 * references, committed text and retrospective assertion review; they do not
 * establish integrated product acceptance.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-assertions.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/assertions-and-predicates.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAssertions} from '../src/runtime-assertions.js';

const id=/* Allocate deterministic synthetic assertion identities. */ n=>Array(32).fill(n),source=/* Build exact historical participant byte coordinates. */ (start=0,end=1)=>({document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence_path:[id(5)],start_byte:start,end_byte:end});

const properties={negated:false,certainty:'unspecified',attribution:'',scope:''};

/** Build a registered symmetric predicate mutation with explicit draft preconditions. */
const mutation=()=>({action:'create',predicate:{kind:'registered',choice:'preview:logical-argumentative:is_equivalent_to'},participants:[{role:'source',source:source(),expected_draft:{generation:0,sequence:0},quote:'A'},{role:'target',source:source(1,2),expected_draft:{generation:0,sequence:0},quote:'B'}],properties:structuredClone(properties)});

/** Build one proposed assertion and captured predicate-definition version. */
const entry=()=>({revision:id(22),generation:0,record:{node:id(20),parent:null,definition:id(30),participants:[{role:'source',source:source()},{role:'target',source:source(1,2)}],properties:structuredClone(properties),status:'proposed',proposer:id(40),actor:id(40),device:id(41),operation:id(42)},definition:{version:id(50),definition:{predicate_id:'preview:logical-argumentative:is_equivalent_to',registry_version:1,label:'is equivalent to',description:'Same contextual logical content.',roles:[{id:'source',label:'Source'},{id:'target',label:'Target'}],participant_mode:'binary',context_fields:['interpretation and premises'],symmetric:true,family:null}}});

test('unknown assertion replies retain byte-identical operation/inputs and do not reset a deduplicated review',/* Verify uncertain replies retry identical inputs without resetting an existing accepted review. */ async()=>{
 const calls=[];

 let drop=2;

 const a=new RuntimeAssertions(/* Lose initial command replies and return an accepted deduplicated result. */ async(path,body)=>{calls.push(structuredClone(body));

  if(drop-->0)throw Error('Lost reply');

  return {operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(21),generation:3,status:'accepted',deduplicated:true}}};},/* Supply a stable synthetic assertion operation identity. */ ()=>id(70));


 const m=mutation(),pending=a.mutate(m);

 m.properties.scope='Later mutable caller value';await assert.rejects(pending,/Lost reply/);assert.ok(a.pending);

 const state=await a.retry();

 assert.equal(state.status,'accepted');assert.equal(state.generation,3);assert.deepEqual(calls[0],calls[1]);assert.deepEqual(calls[0],calls[2]);assert.equal(calls[0].request.mutation.properties.scope,'');assert.equal(a.pending,null);
});

test('mismatched review acknowledgement keeps its original intent until the exact next revision arrives',/* Verify wrong review generation retains intent until the exact next revision arrives. */ async()=>{
 let correct=false;

 const a=new RuntimeAssertions(/* Return a controllably wrong or correct review generation. */ async(path,body)=>({operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(23),generation:correct?1:2,status:'accepted',deduplicated:false}}}),/* Supply a stable review operation identity. */ ()=>id(70));


 await assert.rejects(a.mutate({action:'review',node:id(20),revision:id(22),generation:0,status:'accepted'}),/Mismatched/);assert.ok(a.pending);correct=true;await a.retry();assert.equal(a.pending,null);
});

test('known precondition rejection releases failed assertion intent without clearing another operation implicitly',/* Verify explicit precondition conflict releases rejected assertion intent. */ async()=>{
 const a=new RuntimeAssertions(/* Return a known HTTP conflict rather than uncertain transport loss. */ async()=>{throw Object.assign(Error('conflict'),{status:409});},/* Supply a stable operation identity for conflict handling. */ ()=>id(70));

 await assert.rejects(a.mutate(mutation()),/conflict/);assert.equal(a.pending,null);
});

test('retrospective pages bind text snapshot, role-labelled incidence and explicit excluded scope',/* Verify retrospective paging pins snapshot and role meaning while excluding assertions from text history. */ async()=>{
 const page={document:id(1),snapshot:id(3),text_snapshot_scope:'semantic_assertions_excluded',generation:1,total:1,entries:[entry()],next:null};

 let body;

 const a=new RuntimeAssertions(/* Capture the requested page scope and return a detached-check fixture. */ async(path,input)=>{body=input;

  return page;},/* Supply a deterministic paging client operation allocator. */ ()=>id(70));

 const result=await a.page(id(1),id(3));

 assert.equal(result.entries[0].record.status,'proposed');assert.equal(body.generation,null);result.entries[0].record.status='accepted';assert.equal(page.entries[0].record.status,'proposed');


 for(const alter of [/* Redirect the pinned snapshot. */ p=>p.snapshot=id(9),/* Misdeclare assertion inclusion in text snapshots. */ p=>p.text_snapshot_scope='included',/* Introduce an unknown participant role. */ p=>p.entries[0].record.participants[0].role='unknown',/* Reverse a participant byte range. */ p=>p.entries[0].record.participants[0].source.end_byte=-1,/* Reuse the source node as the assertion identity. */ p=>p.entries[0].record.node=id(2)]){const invalid=structuredClone(page);

  alter(invalid);

  const b=new RuntimeAssertions(/* Return each malformed page independently. */ async()=>invalid,/* Supply deterministic operation identity to malformed-page clients. */ ()=>id(70));

  await assert.rejects(b.page(id(1),id(3)),/Invalid/);}
});

test('stale page generations and duplicate node identities fail instead of merging incompatible views',/* Verify stale generations and duplicate assertion identities cannot merge into one view. */ async()=>{
 const page={document:id(1),snapshot:id(3),text_snapshot_scope:'semantic_assertions_excluded',generation:2,total:2,entries:[entry(),entry()],next:null};

 const a=new RuntimeAssertions(/* Return a page with deliberately duplicated nodes. */ async()=>page,/* Supply the stale-page client operation allocator. */ ()=>id(70));

 await assert.rejects(a.page(id(1),id(3),1),/Invalid/);await assert.rejects(a.page(id(1),id(3)),/Duplicate/);
});

test('adapter freezes committed participant capture while preserving newer typing',/* Verify queued participant source/qualifiers freeze while newer document typing remains intact. */ async()=>{
 const {RuntimeAdapter}=await import('../src/runtime-adapter.js');

 let release,started;

 const wait=new Promise(/* Expose the source-snapshot response release gate. */ r=>{release=r;}),began=new Promise(/* Signal that the snapshot request has begun. */ r=>{started=r;}),calls=[];


 const editor={document:id(1),node:id(2),snapshot:id(3),base:id(4),occurrence:id(5),title:'Source',text:'AB',generation:0,acknowledged_sequence:0};


 const a=new RuntimeAdapter([editor],/* Delay committed-source verification and record exact submitted participant bytes. */ async(path,body)=>{calls.push({path,body:structuredClone(body)});

  if(path==='snapshot'){started();await wait;

   return {text:'AB'};}

  return {operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(21),generation:0,status:'proposed',deduplicated:false}}};});

 const first=[...a.docs.keys()][0],inputs=[{role:'source',start_byte:0,end_byte:1,quote:'A'},{role:'target',start_byte:1,end_byte:2,quote:'B'}],fields={predicateId:'preview:logical-argumentative:is_equivalent_to',properties:structuredClone(properties)};


 const creating=a.createAssertion(first,inputs,fields);

 await began;inputs[0].quote='X';fields.properties.scope='Later';a.edit(first,'Newer typing');release();await creating;assert.equal(a.get(first).source,'Newer typing');assert.equal(a.get(first).acknowledged,0);assert.equal(calls[1].body.request.mutation.participants[0].quote,'A');assert.equal(calls[1].body.request.mutation.properties.scope,'');
});

test('adapter lock reconciles an uncertain assertion before dropping authority',/* Verify lock reconciles uncertain assertion mutation before dropping authority. */ async()=>{
 const {RuntimeAdapter}=await import('../src/runtime-adapter.js');

 let drop=2;

 const calls=[];


 const editor={document:id(1),node:id(2),snapshot:id(3),base:id(4),occurrence:id(5),title:'Source',text:'AB',generation:0,acknowledged_sequence:0};


 const a=new RuntimeAdapter([editor],/* Simulate committed-source reads, lost assertion replies and final lock acknowledgement. */ async(path,body)=>{calls.push({path,body:structuredClone(body)});

  if(path==='snapshot')return {text:'AB'};

  if(path==='lock')return {locked:true};

  if(drop-->0)throw Error('Lost reply');

  return {operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(21),generation:0,status:'proposed',deduplicated:false}}};});

 const first=[...a.docs.keys()][0];

 await assert.rejects(a.createAssertion(first,[{role:'source',start_byte:0,end_byte:1,quote:'A'},{role:'target',start_byte:1,end_byte:2,quote:'B'}],{predicateId:'preview:logical-argumentative:is_equivalent_to',properties}),/Lost reply/);await a.lock();assert.equal(a.lifecycle,'locked');assert.equal(a.assertions.pending,null);assert.equal(calls.at(-1).path,'lock');

 const requests=calls.filter(/* Select command requests for exact retry comparisons. */ c=>c.path==='commands');

 assert.equal(requests.length,3);assert.deepEqual(requests[0],requests[1]);assert.deepEqual(requests[0],requests[2]);
});

test('exact assertion history rejects a current-head substitution or a different assertion identity',/* Verify exact historical assertion lookup rejects current-head or foreign-identity substitution. */ async()=>{
 const historical=entry(),envelope={text_snapshot_scope:'semantic_assertions_excluded',entry:historical};

 const a=new RuntimeAssertions(/* Return the requested historical assertion envelope. */ async()=>envelope,/* Supply the historical-read client operation allocator. */ ()=>id(70));

 const old=await a.revision(id(20),id(22));

 assert.equal(old.record.status,'proposed');old.record.status='accepted';assert.equal(historical.record.status,'proposed');


 for(const change of [/* Substitute another assertion revision. */ e=>e.entry.revision=id(99),/* Substitute another logical assertion node. */ e=>e.entry.record.node=id(98),/* Misdeclare historical assertion text-snapshot scope. */ e=>e.text_snapshot_scope='included']){const invalid=structuredClone(envelope);

  change(invalid);

  const b=new RuntimeAssertions(/* Return each independently malformed historical envelope. */ async()=>invalid,/* Supply a stable operation allocator for invalid historical reads. */ ()=>id(70));

  await assert.rejects(b.revision(id(20),id(22)),/Invalid exact assertion/);}
});
