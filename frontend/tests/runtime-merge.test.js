/**
 * # Hypergraph PX — Runtime merge runtime regression scenarios
 *
 * Checks bounded runtime merge responses and exact-source invariants using
 * explicit synthetic runtime fixtures.
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
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Transport fixtures establish isolated validation and retry behaviour,
 * not real-data acceptance, authenticated provenance or whole-application proof.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-merge.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';

const id=/* Allocate deterministic synthetic input and output identities. */ n=>Array(32).fill(n),quote='Pinned 😀\r\n中\rA\n',text='Reviewed 😀\r\nSynthesis e\u0301\rtail\n';

const editor={document:id(1),node:id(2),snapshot:id(3),base:id(4),occurrence:id(5),title:'Input',text:quote,generation:0,acknowledged_sequence:0};

/** Build reviewed synthesis with exact output bytes and repeated ordered pinned inputs. */
const input=()=>({title:'Synthesis',text,inputs:[1,2].map(/* Preserve each repeated input’s exact historical coordinates and quote. */ ()=>({source:{document:editor.document,node:editor.node,snapshot:editor.snapshot,revision:editor.base,occurrence_path:[editor.occurrence],start_byte:0,end_byte:new TextEncoder().encode(quote).length},expected_draft:null,quote}))});

/** Build an isolated runtime that can lose receipts, fail registration or return wrong output identity. */
function fixture(){let drop=0,editorDrop=false,bad=false;

 const calls=[];

 const output={...editor,document:id(11),node:id(12),snapshot:id(13),base:id(14),occurrence:id(15),text,title:'Synthesis'};

 const a=new RuntimeAdapter([editor],/* Record command bytes and emulate Merge, editor loading and lock responses with controlled failures. */ async(path,body)=>{calls.push({path,body:structuredClone(body)});

  if(path==='editor'){if(editorDrop)throw Error('Editor unavailable');

   return output;}

  if(path==='lock')return {locked:true};

  assert.equal(path,'commands');assert.equal(body.request.command,'merge');

  if(drop-->0)throw Error('Lost reply');

  return {operation:body.operation,outcome:{result:'merged',document:bad?editor.document:output.document,transformation:id(20),revision:output.base,snapshot:output.snapshot}};});

 return {a,calls,setDrop:/* Choose how many transport replies are lost. */ n=>{drop=n;},setEditorDrop:/* Control editor-registration availability after successful publication. */ v=>{editorDrop=v;},setBad:/* Control invalid reuse of an input document identity in the receipt. */ v=>{bad=v;}};}

test('reviewed synthesis freezes ordered inputs and exact output before queuing and reconciles one lost publication',/* Verify queued input freezing, exact synthesis output and same-operation retry after lost replies. */ async()=>{
 const f=fixture();

 f.setDrop(2);

 const plan=input(),creating=f.a.mergeSources(plan);

 plan.text='Later';plan.inputs[0].quote='Later';await assert.rejects(creating,/Lost reply/);

 const first=[...f.a.docs.keys()][0];

 f.a.edit(first,'New input typing');

 const out=await f.a.retryMerge();

 assert.equal(out.source,text);assert.equal(f.a.get(first).source,'New input typing');assert.deepEqual(f.calls[0],f.calls[1]);assert.deepEqual(f.calls[0],f.calls[2]);assert.equal(f.calls[0].body.request.plan.text,text);assert.equal(f.calls[0].body.request.plan.inputs[0].quote,quote);assert.equal(f.a.mergePending,null);
});

test('failed merge editor registration retains exact publication and rejects a source-identity receipt',/* Verify registration failure retains the original publication and invalid output identity cannot register a document. */ async()=>{const f=fixture();

 f.setEditorDrop(true);await assert.rejects(f.a.mergeSources(input()),/Editor unavailable/);assert.ok(f.a.mergePending);f.setEditorDrop(false);await f.a.retryMerge();assert.equal(f.a.docs.size,2);

 const g=fixture();

 g.setBad(true);await assert.rejects(g.a.mergeSources(input()),/Mismatched merge/);assert.equal(g.a.docs.size,1);assert.ok(g.a.mergePending);g.setBad(false);await g.a.retryMerge();assert.equal(g.a.docs.size,2);});

test('locking reconciles an uncertain reviewed merge and malformed inputs never reach storage',/* Verify lock reconciles uncertain Merge while malformed reviewed inputs never reach the runtime. */ async()=>{const f=fixture();

 f.setDrop(2);await assert.rejects(f.a.mergeSources(input()));await f.a.lock();assert.equal(f.a.lifecycle,'locked');assert.equal(f.a.mergePending,null);assert.equal(f.calls.at(-1).path,'lock');

 for(const alter of [/* Reduce inputs below the minimum synthesis count. */ p=>p.inputs.pop(),/* Remove the reviewed output text. */ p=>p.text='',/* Mismatch an exact input quote. */ p=>p.inputs[0].quote='Wrong',/* Introduce a forbidden mutable draft precondition. */ p=>p.inputs[0].expected_draft={},/* Introduce malformed Unicode in reviewed output. */ p=>p.text='\ud800']){const g=fixture(),p=input();

  alter(p);assert.throws(/* Attempt each invalid Merge plan before any command is sent. */ ()=>g.a.mergeSources(p));assert.equal(g.calls.length,0);}});
