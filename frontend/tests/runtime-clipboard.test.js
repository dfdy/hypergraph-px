/**
 * # Hypergraph PX — Private clipboard validation and retry scenarios
 *
 * Checks immutable capture intent, generation-scoped paging, unavailable-source
 * confidentiality and exact source-coordinate mapping with synthetic runtime
 * responses.
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
 * Boundary: Private references are not text publication or clipboard-driven editor
 * writes. These isolated cases do not establish integrated encrypted storage or
 * browser acceptance.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-clipboard.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeClipboard} from '../src/runtime-clipboard.js';
import {ownedRange,editorProjection} from '../src/owned-source.js';

/** Allocate deterministic synthetic clipboard identities. */
const id=n=>Array(32).fill(n);

const source={document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence_path:[id(5)],start_byte:0,end_byte:4};

/** Build an available private reference with detached exact ownership. */
const entry=n=>({id:id(n),available:true,source:structuredClone(source),preview:'😀'});

const capture={action:'capture',generation:0,source,expected_draft:null,quote:'😀'};

/** Build a bounded generation-scoped clipboard page. */
const page=(generation,entries,total=entries.length,next=null)=>({generation,total,entries,next});

/** Build an operation-correlated clipboard acknowledgement. */
const ack=(body,state={generation:1,entry:id(9),count:1})=>({operation:body.operation,outcome:{result:'clipboard',state}});

test('lost clipboard replies retain exact immutable request and reconcile without a new operation',/* Verify lost replies retain one immutable operation and reconcile without identity replacement. */ async()=>{
 let lost=true,operations=0;

 const requests=[];


 const c=new RuntimeClipboard(/* Return the refreshed page or deliberately lose the frozen mutation response. */ async(path,body)=>{
  if(path==='clipboard')return page(1,[entry(9)]);


  requests.push(body);assert.ok(Object.isFrozen(body.request.mutation.source.revision));

  if(lost)throw Error('lost reply');

  return ack(body);
 },/* Count operation allocations to detect an accidental new retry identity. */ ()=>id(++operations));


 await assert.rejects(c.mutate(capture),/lost reply/);assert.ok(c.pending);lost=false;await c.retry();
 assert.equal(operations,1);assert.equal(requests.length,3);assert.deepEqual(requests[0],requests[2]);assert.equal(c.pending,null);assert.equal(c.entries.length,1);assert.equal(c.generation,1);
});

test('wrong receipt identity or state never acknowledges or replaces pending intent',/* Verify wrong receipt identity/state never clears intent or advances local generation. */ async()=>{
 for(const alter of [/* Mismatch operation identity. */ r=>r.operation=id(7),/* Return the wrong acknowledgement generation. */ r=>r.outcome.state.generation=2,/* Return an inconsistent entry count. */ r=>r.outcome.state.count=2,/* Return malformed clipboard entry identity. */ r=>r.outcome.state.entry=[1],/* Return an unrelated command outcome. */ r=>r.outcome.result='saved']){
  const c=new RuntimeClipboard(/* Return an independently corrupted acknowledgement. */ async(_path,body)=>{const r=ack(body);

   alter(r);

   return r;},/* Supply a stable operation identity for receipt mismatch cases. */ ()=>id(8));


  await assert.rejects(c.mutate(capture),/Invalid private clipboard/);assert.ok(c.pending);assert.equal(c.generation,0);assert.deepEqual(c.entries,[]);
 }
});

test('known precondition failure releases failed intent for explicit refresh and retry',/* Verify explicit conflict releases failed intent and requires current-generation retry. */ async()=>{
 const c=new RuntimeClipboard(/* Return a refreshed generation after rejecting the mutation with HTTP conflict. */ async path=>{if(path==='clipboard')return page(2,[]);

  throw Object.assign(Error('conflict'),{status:409});},/* Supply deterministic operation identity for conflict handling. */ ()=>id(8));


 await assert.rejects(c.mutate(capture),/conflict/);assert.equal(c.pending,null);await c.load();assert.equal(c.generation,2);
 await assert.rejects(c.mutate(capture),/Clipboard changed/);assert.equal(c.pending,null);
});

test('malformed and unauthorized source previews cannot enter the private clipboard view',/* Verify malformed and misleading unavailable previews cannot enter the clipboard view. */ async()=>{
 for(const alter of [/* Return malformed entry identity. */ p=>p.entries[0].id=[1],/* Remove source occurrence ownership. */ p=>p.entries[0].source.occurrence_path=[],/* Mark source unavailable while still returning its private source/preview. */ p=>p.entries[0].available=false,/* Exceed the allowed preview length. */ p=>p.entries[0].preview='x'.repeat(121),/* Return an inconsistent continuation offset. */ p=>p.next=1,/* Understate total entries. */ p=>p.total=0,/* Duplicate a private reference identity. */ p=>p.entries.push(structuredClone(p.entries[0]))]){
  const p=page(1,[entry(9)]);

  alter(p);

  const c=new RuntimeClipboard(/* Return an independently malformed clipboard page. */ async()=>p,/* Supply the invalid-page client operation allocator. */ ()=>id(8));


  await assert.rejects(c.load(),/private clipboard/);assert.deepEqual(c.entries,[]);
 }


 const c=new RuntimeClipboard(/* Return an explicitly unavailable reference with source and preview withheld. */ async()=>page(1,[{id:id(9),available:false,source:null,preview:null}]),/* Supply the unavailable-reference client operation allocator. */ ()=>id(8));

 await c.load();assert.equal(c.entries[0].preview,null);
});

test('a late older clipboard read cannot overwrite a newer generation',/* Verify late older reads cannot overwrite a newer accepted generation. */ async()=>{
 const waiting=[];

 const c=new RuntimeClipboard(/* Create independently controlled read responses. */ ()=>new Promise(/* Retain each read resolver in arrival order. */ resolve=>waiting.push(resolve)),/* Supply the generation-race client operation allocator. */ ()=>id(8));


 const old=c.load(),current=c.load();

 waiting[1](page(2,[entry(10)]));await current;waiting[0](page(1,[entry(9)]));assert.equal(await old,false);assert.equal(c.generation,2);assert.deepEqual(c.entries[0].id,id(10));
});

test('private pagination retains exact generation and rejects duplicate identities',/* Verify pagination requests exact generation/offset and retains all unique entries. */ async()=>{
 const all=Array.from({length:20},/* Build twenty distinct one-byte synthetic references. */ (_,i)=>({...entry(i+10),source:{...source,start_byte:i,end_byte:i+1},preview:'x'}));


 const calls=[];

 const c=new RuntimeClipboard(/* Serve two generation-consistent bounded pages and record continuation input. */ async(_path,body)=>{calls.push(body);

  return body.offset===0?page(20,all.slice(0,16),20,16):page(20,all.slice(16),20);},/* Supply the pagination client operation allocator. */ ()=>id(8));


 await c.load();await c.load(true);assert.equal(c.entries.length,20);assert.deepEqual(calls[1],{generation:20,offset:16,limit:16});assert.equal(c.next,null);
});

test('source display coordinates map to exact UTF-8 capture without newline normalization',/* Verify display cuts map to exact owned UTF8 without newline normalisation. */ ()=>{
 const source='A😀\r\n中e\u0301\rtail\n',range=ownedRange(source,editorProjection(source),1,5),encoder=new TextEncoder();


 assert.deepEqual(range,{from:1,to:6,text:'😀\r\n中'});assert.equal(encoder.encode(source.slice(0,range.from)).length,1);assert.equal(encoder.encode(source.slice(0,range.to)).length,10);
 assert.throws(/* Attempt a display cut inside the supplementary scalar. */ ()=>ownedRange(source,editorProjection(source),2,3),/Invalid owned-source range/);
});
