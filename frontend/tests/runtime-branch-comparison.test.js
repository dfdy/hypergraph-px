/**
 * # Hypergraph PX — Runtime branch comparison runtime regression scenarios
 *
 * Checks exact captured scope, asynchronous responses and recovery semantics for
 * runtime branch comparison.
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
 * - [Exact text and anchors][spec-3]
 *
 * Boundary: All identities and transports are synthetic. These tests exercise
 * isolated runtime adapter behaviour and do not establish integrated security or
 * real-data acceptance.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-branch-comparison.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';

const id=/* Allocate deterministic synthetic comparison identities. */ n=>Array(32).fill(n),editor={document:id(1),node:id(2),branch:id(3),base:id(4),snapshot:id(5),generation:0,acknowledged_sequence:0,title:'Source',text:'Saved source 😀\r\n'};

/** Build pinned child/parent branch heads and friendly names. */
const context=()=>({document:id(1),node:id(2),branch:id(9),parent:id(3),source_name:'Child',parent_name:'Original branch',source_revision:id(10),source_snapshot:id(11),parent_revision:id(12),parent_snapshot:id(13)});

test('parent comparison freezes explicit branch scope and leaves newer typing and acknowledgement unchanged',/* Verify requested branch scope freezes without modifying newer draft source or acknowledgement. */ async()=>{
 let release;

 const calls=[],adapter=new RuntimeAdapter([editor],/* Capture the comparison request and delay its response. */ async(path,body)=>{calls.push({path,body:structuredClone(body)});await new Promise(/* Expose the delayed comparison release gate. */ r=>release=r);

  return context();}),document=[...adapter.docs.keys()][0],branch=id(9);


 const pending=adapter.parentComparison(document,branch);

 branch[0]=99;adapter.edit(document,'Newer pending source');release();

 const value=await pending;


 assert.deepEqual(calls,[{path:'branches/comparison',body:{document:id(1),branch:id(9)}}]);assert.deepEqual(value.branch,id(9));assert.equal(adapter.get(document).source,'Newer pending source');assert.equal(adapter.get(document).acknowledged,0);assert.equal(adapter.get(document).pending,null);
});

test('parent comparison rejects redirected, malformed or self-parent metadata and lock-invalidated replies',/* Verify redirected/malformed/self-parent metadata and post-lock replies are rejected. */ async()=>{
 for(const change of [{document:id(99)},{node:id(99)},{parent:id(9)},{source_snapshot:[1]},{parent_name:'x'.repeat(513)},{source_name:''},{draft:'unrequested'}]){
  const adapter=new RuntimeAdapter([editor],/* Return one independently malformed comparison context. */ async()=>({...context(),...change})),document=[...adapter.docs.keys()][0];

  await assert.rejects(adapter.parentComparison(document,id(9)),/Invalid parent-branch comparison/);
 }


 let release,calls=0;

 const adapter=new RuntimeAdapter([editor],/* Count and delay the only in-flight comparison request. */ async()=>{calls++;await new Promise(/* Expose the lock-race comparison release gate. */ r=>release=r);

  return context();}),document=[...adapter.docs.keys()][0],pending=adapter.parentComparison(document,id(9));

 adapter.lifecycle='locked';release();await assert.rejects(pending,/locking or locked/);await assert.rejects(adapter.parentComparison(document,id(9)),/locking or locked/);assert.equal(calls,1);
});

test('common base is pinned to the inspected pair and remains read-only during newer typing',/* Verify common-base results remain pinned to inspected heads and never modify newer typing. */ async()=>{
 const original=context(),report={comparison:original,selection:{result:'base',revision:id(14),snapshot:id(15),source_in_target:false,target_in_source:false},revisions_read:3};

 let release;

 const calls=[];


 const adapter=new RuntimeAdapter([editor],/* Capture and delay the common-base request while comparison state changes. */ async(path,body)=>{calls.push({path,body});await new Promise(/* Expose the delayed common-base release gate. */ r=>release=r);

  return report;}),document=[...adapter.docs.keys()][0];


 const pending=adapter.parentBase(document,original);

 original.source_snapshot[0]=99;adapter.edit(document,'Newer pending draft');release();
 await assert.rejects(pending,/Branches changed/);assert.equal(adapter.get(document).source,'Newer pending draft');assert.equal(adapter.get(document).pending,null);
 assert.deepEqual(calls,[{path:'branches/merge-base',body:{document:id(1),branch:id(9)}}]);


 const frozen={comparison:context(),selection:report.selection,revisions_read:3};

 adapter.request=/* Return a still-current frozen common-base report for the success case. */ async()=>frozen;assert.deepEqual(await adapter.parentBase(document,context()),frozen);
});

test('common base rejects malformed, redirected and lock-invalidated results without an inferred base',/* Verify malformed or redirected bases fail closed while unrelated/ambiguous outcomes remain explicit. */ async()=>{
 const good={comparison:context(),selection:{result:'base',revision:id(14),snapshot:id(15),source_in_target:false,target_in_source:false},revisions_read:3};


 for(const change of [{revisions_read:0},{revisions_read:1025},{revisions_read:1.5},{selection:null},{selection:{result:'base',revision:id(14),snapshot:[1],source_in_target:false,target_in_source:false}},{selection:{...good.selection,source_in_target:1}},{selection:{...good.selection,source_in_target:true}},{selection:{...good.selection,revision:id(10)}},{selection:{result:'unrelated',snapshot:id(1)}},{selection:{result:'ambiguous',revisions:[id(1),id(1)]}},{extra:'unrequested'},{comparison:{...context(),document:id(99)}}]){
  const adapter=new RuntimeAdapter([editor],/* Return one independently malformed common-base report. */ async()=>({...good,...change})),document=[...adapter.docs.keys()][0];

  await assert.rejects(adapter.parentBase(document,context()),/Invalid common-base/);
 }


 const adapter=new RuntimeAdapter([editor],/* Lock before returning a syntactically valid report to test lifecycle invalidation. */ async()=>{adapter.lifecycle='locked';

  return good;}),document=[...adapter.docs.keys()][0];

 await assert.rejects(adapter.parentBase(document,context()),/locking or locked/);


 for(const selection of [{result:'unrelated'},{result:'ambiguous',revisions:[id(1),id(2)]}]){const a=new RuntimeAdapter([editor],/* Return an explicit unrelated or ambiguous selection without inventing a unique base. */ async()=>({...good,selection})),d=[...a.docs.keys()][0];

  assert.deepEqual((await a.parentBase(d,context())).selection,selection);}
});
