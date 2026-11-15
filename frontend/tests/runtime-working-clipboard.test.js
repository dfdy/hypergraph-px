/**
 * # Hypergraph PX — Runtime working clipboard retry and scope scenarios
 *
 * Checks exact captured ownership and same-operation recovery for runtime working
 * clipboard using synthetic transport and source fixtures.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-working-clipboard.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/assertions-and-predicates.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeWorkingClipboard} from '../src/runtime-working-clipboard.js';

const id=/* Allocate deterministic synthetic working-reference identities. */ n=>Array(32).fill(n),text='A\r\n😀中\rfinal',plan=/* Build exact mixed-ending source and a selected UTF8 passage. */ ()=>({document:id(1),branch:id(2),generation:3,base:id(4),sequence:5,text,start_byte:3,end_byte:10,quote:'😀中'});

/** Build a pinned private working-checkpoint reference. */
const source=()=>({kind:'working_checkpoint',document:id(1),node:id(6),branch:id(2),working_branch:id(7),checkpoint:id(8),occurrence_path:[id(9)],start_byte:3,end_byte:10});

test('working copy retains its exact operation and source through lost replies and changed caller input',/* Verify lost replies retain one operation and original captured source despite caller mutation. */ async()=>{
 let lose=2;

 const calls=[];

 const clipboard=new RuntimeWorkingClipboard(/* Return synthetic list/copy responses and deliberately lose initial operation replies. */ async(path,body)=>{
  if(path==='working/clipboard')return {generation:1,total:1,entries:[{id:id(10),target:{kind:'working',source:source()},preview:'😀中'}],next:null};


  calls.push(structuredClone(body));

  if(lose-->0)throw Error('Lost reply');

  return {operation:body.operation,outcome:{result:'working_copied',state:{checkpoint:{document:id(1),node:id(6),branch:id(2),working_branch:id(7),checkpoint:id(8),ordinal:1},source:source(),entry:id(10),generation:1,count:1}}};
 },/* Supply a stable operation identity for retry equality. */ ()=>id(11));

 const input=plan();

 const pending=clipboard.copy(input);

 input.text='Changed';await assert.rejects(pending,/Lost/);await clipboard.retry();assert.equal(clipboard.pending,null);assert.equal(clipboard.total,1);

 for(const call of calls)assert.deepEqual(call,calls[0]);

 assert.equal(calls[0].request.plan.text,text);
});

test('working source inspection freezes range and IDs and preserves exact retained passage',/* Verify inspection freezes IDs/ranges and returns exact retained passage as detached data. */ async()=>{
 let request;

 const clipboard=new RuntimeWorkingClipboard(/* Delay inspection before returning the exact requested checkpoint source. */ async(path,body)=>{request=body;await new Promise(/* Yield to permit caller mutation while the request is pending. */ r=>setImmediate(r));

  return {source:structuredClone(body),text,base:id(4),sequence:5,publication:'private_working_checkpoint',promotion:null};},/* Supply the inspection client’s deterministic operation allocator. */ ()=>id(1));


 const input=source(),pending=clipboard.inspect(input);

 input.start_byte=0;input.checkpoint[0]=99;

 const view=await pending;

 assert.equal(view.passage,'😀中');assert.equal(request.start_byte,3);assert.equal(request.checkpoint[0],8);view.source.checkpoint[0]=55;assert.equal(request.checkpoint[0],8);
});

test('invalid scalar selections and mismatched working-copy receipts remain rejected',/* Verify scalar-splitting selection fails before transport and mismatched receipts retain pending intent. */ async()=>{
 let calls=0;

 const clipboard=new RuntimeWorkingClipboard(/* Count unexpected calls and return a deliberately mismatched receipt. */ async()=>{calls++;

  return {};},/* Supply a stable identity for pending-intent validation. */ ()=>id(1));

 const split=plan();

 split.start_byte=4;assert.throws(/* Attempt capture with a UTF8 cut inside the supplementary scalar. */ ()=>clipboard.copy(split),/scalar/);assert.equal(calls,0);
 await assert.rejects(clipboard.copy(plan()),/Mismatched/);assert.ok(clipboard.pending);assert.throws(/* Attempt a second copy while prior uncertain intent remains pending. */ ()=>clipboard.copy(plan()),/pending/);
});
