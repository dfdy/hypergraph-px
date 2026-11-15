/**
 * # Hypergraph PX — Runtime fork exact-buffer regression scenarios
 *
 * Checks branch-scoped source isolation, historical Fork identity and
 * uncertain-command recovery with a deduplicating synthetic runtime.
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
 * Boundary: Synthetic command receipts model specific retry and acknowledgement
 * cases. They are not integrated storage/transport acceptance or an authenticated
 * provenance proof.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-fork.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';

const id=/* Allocate deterministic synthetic Fork identities. */ n=>Array(32).fill(n),text='Exact 😀\r\ne\u0301中\rtail\n';

const source={document:id(1),node:id(2),occurrence:id(3),base:id(4),snapshot:id(5),title:'Source',text,generation:0,acknowledged_sequence:0};

/** Build an independent Fork output and idempotent synthetic runtime with controllable failures. */
function fixture(){
 const calls=[],output={...source,document:id(11),node:id(12),occurrence:id(13),base:id(14),snapshot:id(15),title:'Fork'},receipts=new Map();

 let drop=0,bad=false,editorDrop=false;


 /** Record exact requests, retain one operation receipt and optionally fail transport or editor loading. */
 const request=async(path,body)=>{
  calls.push({path,body:structuredClone(body)});


  if(path==='snapshot')return {text};


  if(path==='editor'){if(editorDrop)throw Error('Editor unavailable');

   return output;}


  if(path==='lock')return {locked:true};


  assert.equal(path,'commands');assert.equal(body.request.command,'fork');


  const k=JSON.stringify(body.operation);

  if(!receipts.has(k))receipts.set(k,{operation:body.operation,outcome:{result:'forked',document:output.document,transformation:id(20),revision:output.base,snapshot:output.snapshot}});


  if(drop-->0)throw Error('Lost reply');


  const receipt=structuredClone(receipts.get(k));

  if(bad)receipt.outcome.document=source.document;

  return receipt;
 };


 const a=new RuntimeAdapter([source],request),first=[...a.docs.keys()][0];


 return {a,first,calls,output,receipts,setDrop:/* Set deliberately lost receipt count. */ n=>{drop=n;},setBad:/* Toggle invalid reuse of the source document identity. */ v=>{bad=v;},setEditorDrop:/* Toggle failure loading the successfully created output editor. */ v=>{editorDrop=v;},fork:/* Fork the complete exact original fixture source. */ ()=>a.forkSource(first,0,new TextEncoder().encode(text).length,text,'Fork')};
}

test('fork retry retains exact operation and raw bytes while preserving later source typing',/* Verify lost receipts retain one exact operation and original bytes while newer source typing survives. */ async()=>{
 const f=fixture();

 f.setDrop(2);await assert.rejects(f.fork(),/Lost reply/);

 const frozen=structuredClone(f.a.forkPending);

 f.a.edit(f.first,'Later unsaved text');
 assert.throws(f.fork,/pending fork/);

 const output=await f.a.retryFork();

 assert.equal(output.source,text);assert.equal(f.a.get(f.first).source,'Later unsaved text');assert.equal(f.a.get(f.first).acknowledged,0);assert.equal(f.receipts.size,1);assert.equal(f.a.forkPending,null);


 const requests=f.calls.filter(/* Select command retries for byte-identical envelope comparison. */ c=>c.path==='commands');

 assert.equal(requests.length,3);

 for(const c of requests)assert.deepEqual(c.body,frozen);

 assert.equal(frozen.request.plan.quote,text);
});

test('lost editor read after acknowledged fork reconciles one receipt before registering output',/* Verify failed output loading retains the acknowledged Fork for registration retry. */ async()=>{
 const f=fixture();

 f.setEditorDrop(true);await assert.rejects(f.fork(),/Editor unavailable/);assert.ok(f.a.forkPending);assert.equal(f.a.docs.size,1);f.setEditorDrop(false);await f.a.retryFork();assert.equal(f.receipts.size,1);assert.equal(f.a.docs.size,2);
});

test('malformed fork receipt retains pending identity and never registers source as output',/* Verify a source-identity output receipt is rejected without registering a second source. */ async()=>{
 const f=fixture();

 f.setBad(true);await assert.rejects(f.fork(),/Mismatched fork/);assert.ok(f.a.forkPending);assert.equal(f.a.docs.size,1);f.setBad(false);await f.a.retryFork();assert.equal(f.a.docs.size,2);
});

test('lock reconciles pending fork before dropping authority',/* Verify lock reconciles unresolved Fork before dropping authority. */ async()=>{
 const f=fixture();

 f.setDrop(2);await assert.rejects(f.fork());await f.a.lock();assert.equal(f.a.lifecycle,'locked');assert.equal(f.a.forkPending,null);assert.equal(f.receipts.size,1);assert.equal(f.calls.at(-1).path,'lock');
});

test('unacknowledged and uncommitted sources reject without implicit save or commit',/* Verify unacknowledged/uncommitted source fails without implicit save or Commit. */ async()=>{
 const f=fixture();

 f.a.edit(f.first,'Draft');assert.throws(f.fork,/Save and commit/);assert.equal(f.calls.length,0);


 const g=fixture();

 g.a.docs.get(g.first).source='Acknowledged draft';await assert.rejects(g.fork(),/Commit this source/);assert.deepEqual(g.calls.map(/* Collect routes to detect an unintended source mutation. */ c=>c.path),['snapshot']);assert.equal(g.receipts.size,0);
});

test('captured-reference Fork pins its historic input without saving newer source or clearing clipboard',/* Verify captured-reference Fork uses pinned history while leaving newer source and clipboard untouched. */ async()=>{
 const f=fixture(),binding={document:id(1),node:source.node,snapshot:source.snapshot,revision:source.base,occurrence_path:[source.occurrence],start_byte:0,end_byte:new TextEncoder().encode(text).length};


 f.a.edit(f.first,'Newer unacknowledged source');

 const output=await f.a.forkReference(binding,text,'Historic fork');


 assert.equal(output.source,text);assert.equal(f.a.get(f.first).source,'Newer unacknowledged source');assert.equal(f.a.get(f.first).acknowledged,0);assert.deepEqual(f.calls.map(/* Collect captured-reference routes to detect unnecessary source reads or saves. */ c=>c.path),['commands','editor']);


 const plan=f.calls[0].body.request.plan;

 assert.equal(plan.expected_draft,null);assert.deepEqual(plan.source,binding);assert.equal(plan.quote,text);
});

test('captured-reference Fork freezes inputs before queuing and retries one operation after unknown replies',/* Verify captured-reference inputs freeze before queuing and all retries share one operation. */ async()=>{
 const f=fixture(),binding={document:id(1),node:source.node,snapshot:source.snapshot,revision:source.base,occurrence_path:[source.occurrence],start_byte:0,end_byte:new TextEncoder().encode(text).length};


 f.setDrop(2);

 const pending=f.a.forkReference(binding,text,'Historic fork');

 binding.start_byte=99;binding.document[0]=99;await assert.rejects(pending,/Lost reply/);
 await f.a.retryFork();

 const calls=f.calls.filter(/* Collect only command attempts for exact retry comparison. */ c=>c.path==='commands');

 assert.equal(calls.length,3);assert.deepEqual(calls[0],calls[1]);assert.deepEqual(calls[0],calls[2]);assert.equal(calls[0].body.request.plan.source.start_byte,0);assert.equal(calls[0].body.request.plan.source.document[0],1);assert.equal(f.receipts.size,1);
});

test('captured-reference Fork rejects malformed scopes and scalar byte lengths before any request',/* Verify malformed scope and scalar byte length reject before transport. */ ()=>{
 const f=fixture(),binding={document:id(1),node:id(2),snapshot:id(5),revision:id(4),occurrence_path:[id(3)],start_byte:0,end_byte:1};


 assert.throws(/* Attempt a supplementary scalar against an incorrect one-byte source extent. */ ()=>f.a.forkReference(binding,'😀','Historic fork'),/Invalid captured/);assert.equal(f.calls.length,0);
});

test('adaptive Fork from committed bytes retains its source in derivation without adding a clipboard entry',/* Verify adaptive Fork from committed bytes records derivation without creating clipboard entries. */ async()=>{
 const f=fixture();

 f.a.features.workingCopy=true;

 const result=await f.fork();

 assert.equal(result.source,text);assert.deepEqual(f.calls.map(/* Collect adaptive Fork routes to verify read/command/registration order. */ c=>c.path),['snapshot','commands','editor']);assert.equal(f.a.privateClipboard.total,0);assert.equal(f.a.workingClipboard.total,0);assert.equal(f.calls[1].body.request.plan.expected_draft,null);
});
