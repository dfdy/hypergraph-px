/**
 * # Hypergraph PX — Runtime comments runtime regression scenarios
 *
 * Checks exact captured scope, asynchronous responses and recovery semantics for
 * runtime comments.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-comments.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeComments,commentPlan} from '../src/runtime-comments.js';
import {RuntimeAdapter} from '../src/runtime-adapter.js';

const id=/* Allocate deterministic synthetic comment identities. */ n=>Array(32).fill(n),source=/* Build exact historical passage coordinates. */ ()=>({document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence_path:[id(5)],start_byte:0,end_byte:8});

/** Build comment bytes with significant whitespace and mixed newline forms. */
const plan=()=>({source:source(),quote:'😀\r\nAB',body:'  Comment 😀e\u0301\r\nExact\r  '});

/** Build immutable decreasing document-comment metadata. */
const record=(n=2)=>({node:id(n+20),revision:id(n+40),source:source(),body:'Comment\r\n😀',actor:id(6),device:id(7),operation:id(n+60),ordinal:n,previous_document_comment:n===1?null:id(n+39),expected_draft:null});

/** Build a complete snapshot-scoped page excluding comments from text history. */
const page=()=>({document:id(1),snapshot:id(3),text_snapshot_scope:'comments_excluded',entries:[record(2),record(1)],next:null});

test('comment plan preserves exact bytes and validates immutable source/body bounds',/* Verify exact body/quote preservation, frozen ownership and strict source/body bounds. */ ()=>{
 const p=plan(),f=commentPlan(p);

 assert.equal(f.body,p.body);assert.equal(f.quote,p.quote);p.source.revision[0]=99;assert.equal(f.source.revision[0],4);assert.ok(Object.isFrozen(f.source.revision));


 for(const change of [/* Remove meaningful comment content while retaining whitespace. */ p=>p.body=' \r\n',/* Introduce malformed Unicode in comment text. */ p=>p.body='\ud800',/* Exceed the comment UTF8 byte budget. */ p=>p.body='😀'.repeat(4097),/* Mismatch source byte extent and quote length. */ p=>p.source.end_byte=7,/* Remove required occurrence ownership. */ p=>p.source.occurrence_path=[],/* Change the exact source quote. */ p=>p.quote='Wrong']){const p=plan();

  change(p);assert.throws(/* Attempt the invalid immutable comment plan. */ ()=>commentPlan(p));}


 const p2=plan();

 p2.body='😀'.repeat(4096);assert.equal(commentPlan(p2).body,p2.body);
});

test('comment pages validate exact scope and immutable decreasing paging chains',/* Verify detached pages, exact scope and decreasing immutable paging chains. */ async()=>{
 const p=page(),c=new RuntimeComments(/* Return a fresh synthetic valid page. */ async()=>p,/* Allocate a deterministic operation identity for the page client. */ ()=>id(90)),result=await c.page(id(1),id(3));

 result.entries[0].body='Changed';assert.equal(p.entries[0].body,'Comment\r\n😀');


 for(const change of [/* Redirect the response document. */ p=>p.document=id(9),/* Redirect the response snapshot. */ p=>p.snapshot=id(9),/* Include comments falsely in text-snapshot scope. */ p=>p.text_snapshot_scope='included',/* Introduce malformed Unicode in stored comment text. */ p=>p.entries[0].body='\ud800',/* Break ordinal continuity. */ p=>p.entries[0].ordinal=4,/* Break previous-comment linkage. */ p=>p.entries[0].previous_document_comment=id(99),/* Duplicate comment node identity. */ p=>p.entries[1].node=p.entries[0].node,/* Introduce an invalid continuation cursor. */ p=>p.next=id(99),/* Redirect a comment’s source document. */ p=>p.entries[0].source.document=id(99),/* Reuse the source node identity as the comment node. */ p=>p.entries[0].node=p.entries[0].source.node]){const p=page();

  change(p);

  const c=new RuntimeComments(/* Return the independently malformed page. */ async()=>p,/* Supply the deterministic operation allocator to the invalid-page client. */ ()=>id(90));

  await assert.rejects(c.page(id(1),id(3)));}


 await assert.rejects(c.page(id(1),id(3),id(99)));await assert.rejects(c.page(id(1),id(3),null,9));
});

test('unknown comment publication freezes before queuing and lock reconciles exactly once',/* Verify queued comment bytes freeze and uncertain publication reconciles before lock exactly once. */ async()=>{
 const state={document:id(1),node:id(2),snapshot:id(3),base:id(4),occurrence:id(5),text:'Source',title:'Source',generation:0,acknowledged_sequence:0},calls=[];

 let drop=2,release;


 const adapter=new RuntimeAdapter([state],/* Record immutable command bytes and simulate lost comment replies before lock acknowledgement. */ async(path,body)=>{calls.push({path,body:structuredClone(body)});

  if(path==='lock')return {locked:true};

  if(drop-->0)throw Error('Lost comment reply');

  return {operation:body.operation,outcome:{result:'commented',state:{document:id(1),node:id(20),revision:id(21),ordinal:1}}};});

 const key=[...adapter.docs.keys()][0];


 const hold=adapter.serialise('comments',/* Hold the comments queue until the caller has mutated its original inputs. */ ()=>new Promise(/* Expose the queue blocker’s release gate. */ r=>{release=r;}));

 await new Promise(/* Yield until the queue blocker has started. */ r=>setImmediate(r));

 const input=plan(),pending=adapter.createComment(input);

 input.body='Later';input.source.revision[0]=99;release();await hold;await assert.rejects(pending,/Lost comment reply/);assert.ok(adapter.comments.pending);
 await adapter.lock();assert.equal(adapter.lifecycle,'locked');assert.equal(adapter.comments.pending,null);assert.equal(calls.length,4);assert.deepEqual(calls[0],calls[1]);assert.deepEqual(calls[0],calls[2]);assert.equal(calls[0].body.request.plan.body,plan().body);assert.equal(calls[0].body.request.plan.source.revision[0],4);assert.equal(adapter.get(key).source,'Source');assert.equal(calls[3].path,'lock');
});

test('mismatched comment receipts retain recovery while known rejections release the intent',/* Verify mismatched receipts retain recovery while explicit conflicts release rejected intent. */ async()=>{
 for(const change of [/* Mismatch the operation identity. */ r=>r.operation=id(99),/* Mismatch the comment’s document identity. */ r=>r.outcome.state.document=id(99),/* Reuse the source logical node as the created comment. */ r=>r.outcome.state.node=id(2),/* Return an invalid zero comment ordinal. */ r=>r.outcome.state.ordinal=0]){const c=new RuntimeComments(/* Return an independently corrupted creation receipt. */ async(path,body)=>{const r={operation:body.operation,outcome:{result:'commented',state:{document:id(1),node:id(20),revision:id(21),ordinal:1}}};

   change(r);

   return r;},/* Provide a stable comment operation identity for receipt validation. */ ()=>id(90));

  await assert.rejects(c.create(plan()),/Mismatched/);assert.ok(c.pending);}


 const c=new RuntimeComments(/* Return an explicit HTTP conflict rather than uncertain transport failure. */ async()=>{throw Object.assign(Error('Conflict'),{status:409});},/* Provide a stable identity for the known-rejection case. */ ()=>id(90));

 await assert.rejects(c.create(plan()),/Conflict/);assert.equal(c.pending,null);
});
