/**
 * # Hypergraph PX — Captured assertion regression scenarios
 *
 * Checks exact captured assertion semantics with isolated synthetic identities,
 * captured source and invalid-response cases.
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
 * - [Assertions and predicate semantics][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Synthetic fixtures exercise validation and identity boundaries; they
 * do not establish integrated product delivery, authenticated provenance or a
 * checked proof.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/captured-assertion.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {capturedAssertion} from '../src/captured-assertion.js';
import {RuntimeAdapter} from '../src/runtime-adapter.js';

const id=/* Allocate deterministic synthetic identities for captured-source fixtures. */ n=>Array(32).fill(n),quote='😀\r\n中',source={document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence_path:[id(5)],start_byte:1,end_byte:10};

/** Build repeated ordered roles pinned to exact historical Unicode/newline bytes. */
const input=()=>({label:'Grouped claims',description:'Explicit contextual interpretation.',participants:['premise','premise','conclusion'].map(/* Detach each repeated participant’s source coordinates. */ role=>({role,source:structuredClone(source),quote})),properties:{scope:'Synthetic only'}});

test('captured declarations retain ordered repeated roles and exact historical bytes without draft preconditions',/* Verify ordered repeated roles and strict validation without introducing draft preconditions. */ ()=>{
 const x=input(),m=capturedAssertion(x);

 assert.deepEqual(m.predicate.roles,[{id:'premise',label:'premise'},{id:'conclusion',label:'conclusion'}]);assert.equal(m.participants.length,3);assert.equal(m.participants[0].quote,quote);assert.equal(m.participants[0].expected_draft,null);x.participants[0].source.snapshot[0]=99;assert.equal(m.participants[0].source.snapshot[0],3);


 for(const alter of [/* Change exact captured quote bytes to test mismatch rejection. */ x=>x.participants[0].quote='Normalized\n',/* Remove the participant role name. */ x=>x.participants[0].role=' ',/* Exceed the participant-count bound. */ x=>x.participants.push(...Array(6).fill(x.participants[0])),/* Exceed the Unicode label byte bound. */ x=>x.label='😀'.repeat(81),/* Introduce a negative byte boundary. */ x=>x.participants[0].source.start_byte=-1,/* Introduce an unpaired surrogate in qualifiers. */ x=>x.properties.scope='\ud800']){const invalid=input();

  alter(invalid);assert.throws(/* Attempt the malformed captured declaration. */ ()=>capturedAssertion(invalid));}


 const large=input();

 large.participants=Array.from({length:3},/* Build individually bounded participants whose combined source budget is exceeded. */ ()=>({role:'premise',source:{...structuredClone(source),start_byte:0,end_byte:800000},quote:'a'.repeat(800000)}));assert.throws(/* Attempt the declaration exceeding the aggregate source budget. */ ()=>capturedAssertion(large),/Combined/);
});

test('captured declaration freezes before queueing and reconciles lost replies without consulting or publishing current source',/* Verify queue freezing and same-operation retry after lost replies without reading current source. */ async()=>{
 let release;

 const blocker=new Promise(/* Expose control of the synthetic queue blocker. */ r=>{release=r;}),calls=[];

 let drop=2;


 const adapter=new RuntimeAdapter([],/* Record detached command bytes and simulate lost replies before returning a matching receipt. */ async(path,body)=>{calls.push({path,body:structuredClone(body)});

  if(drop-->0)throw Error('Lost reply');

  return {operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(21),generation:0,status:'proposed',deduplicated:false}}};});


 const held=adapter.serialise('assertions',/* Hold the assertion queue so caller mutation can precede command execution. */ ()=>blocker),x=input(),pending=adapter.createCapturedAssertion(x);

 x.label='Later';x.participants[0].quote='Later';x.participants[0].source.snapshot[0]=99;release();await held;await assert.rejects(pending,/Lost reply/);await adapter.retryAssertion();assert.equal(calls.length,3);assert.ok(calls.every(/* Require every retry to stay on the command route. */ c=>c.path==='commands'));assert.deepEqual(calls[0],calls[2]);assert.equal(calls[0].body.request.mutation.predicate.label,'Grouped claims');assert.equal(calls[0].body.request.mutation.participants[0].quote,quote);assert.equal(calls[0].body.request.mutation.participants[0].source.snapshot[0],3);
});
