/**
 * # Hypergraph PX — Acknowledged buffers, lifecycle and history regression scenarios
 *
 * Exercises exact captured source, generation/sequence acknowledgement, uncertain
 * retries, logical departure Commit and security lifecycle ordering against a
 * deduplicating synthetic runtime.
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
 * - [authority lifecycle md][spec-4]
 *
 * Boundary: Synthetic transport and in-memory state verify specific adapter
 * contracts, not actual encrypted persistence or whole-product security. Draft
 * acknowledgement, immutable publication, keychain authority and locked access
 * remain distinct.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-adapter.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 * [spec-4]: ../../docs/06-subsystems/contracts/authority-lifecycle.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';

const id=/* Allocate deterministic synthetic document and operation identities. */ byte=>Array(32).fill(byte),key=/* Encode fixture identities for map lookup and equality. */ value=>JSON.stringify(value);

/** Build exact Unicode/newline editor state with initial acknowledgement coordinates. */
const state=byte=>({document:id(byte),title:'Document '+byte,text:'Original 😀 e\u0301\r\n中',generation:0,acknowledged_sequence:0,base:id(30+byte),snapshot:id(60+byte)});

/** Create externally controlled resolve/reject gates for ordering tests. */
const deferred=()=>{let resolve,reject;

 const promise=new Promise(/* Expose both promise settlement controls. */ (yes,no)=>{resolve=yes;reject=no;});

 return {promise,resolve,reject};};

/** Yield one event-loop turn so queued work can start. */
const tick=()=>new Promise(/* Schedule the event-loop yield without delaying test cleanup. */ resolve=>setImmediate(resolve));

/** Emulate generation-checked saves, immutable Commits, creation and idempotent receipts. */
function server(states=[state(1),state(2)]){
 const documents=new Map(states.map(/* Detach initial document state into the synthetic server map. */ s=>[key(s.document),structuredClone(s)])),receipts=new Map(),snapshots=new Map();

 let next=100,locked=false;


 const initialSnapshots=new Map(states.map(/* Retain original committed snapshots separately from mutable drafts. */ s=>[key(s.snapshot),s.text]));


 const calls=[];


 /** Record requests and enforce locked, generation, sequence and same-operation semantics. */
 const request=async(path,body)=>{
  calls.push({path,body:structuredClone(body)});


  if(path==='lock'){locked=true;

   return {locked:true};}


  if(locked)throw Object.assign(Error('locked'),{status:423});


  if(path==='snapshot')return {text:snapshots.get(key(body.snapshot))??initialSnapshots.get(key(body.snapshot))};


  assert.equal(path,'commands');


  const prior=receipts.get(key(body.operation));


  if(prior){assert.deepEqual(prior.request,body.request);

   return structuredClone(prior.receipt);}


  const c=body.request;

  let outcome;


  if(c.command==='create'){
   const s={...state(next++),title:c.title,text:c.text};

   documents.set(key(s.document),s);outcome={result:'created',document:s.document};
  }else{
   const s=documents.get(key(c.document));

   assert.ok(s);


   if(s.generation!==c.generation||!assertIds(s.base,c.base))throw Object.assign(Error('conflict'),{status:409});


   if(c.command==='save'){
    assert.equal(c.previous_sequence,s.acknowledged_sequence);assert.ok(c.sequence>c.previous_sequence);
    s.text=c.text;s.acknowledged_sequence=c.sequence;
   }else{
    assert.equal(c.command,'commit');assert.equal(c.sequence,s.acknowledged_sequence);
    s.base=id(next++);s.snapshot=id(next++);snapshots.set(key(s.snapshot),s.text);
   }


   s.generation++;outcome={result:c.command==='save'?'saved':'committed',document:s.document,generation:s.generation,sequence:s.acknowledged_sequence};


   if(c.command==='commit')Object.assign(outcome,{revision:s.base,snapshot:s.snapshot});
  }


  const receipt={operation:body.operation,outcome};

  receipts.set(key(body.operation),{request:structuredClone(c),receipt:structuredClone(receipt)});

  return structuredClone(receipt);
 };


 return {request,documents,receipts,calls,snapshots};
}

/** Compare complete fixture identity arrays. */
const assertIds=(a,b)=>key(a)===key(b);

/** Create an adapter and expose its first two document keys for isolation scenarios. */
function adapter(request,states=[state(1),state(2)]){const a=new RuntimeAdapter(states,request);

 return {a,first:[...a.docs.keys()][0],second:[...a.docs.keys()][1]};}

test('delayed saves capture exact text and do not acknowledge later edits or another document',/* Verify delayed save acknowledges captured bytes without overwriting newer typing or another document. */ async()=>{
 const s=server(),gate=deferred(),started=deferred();


 const {a,first,second}=adapter(/* Delay only the first document’s acknowledgement after the server accepted it. */ async(path,body)=>{const receipt=await s.request(path,body);

  if(body.request?.document[0]===1){started.resolve();await gate.promise;}

  return receipt;});


 const source='Saved 😀e\u0301\r\n中';

 a.edit(first,source);

 const saving=a.checkpoint(first);

 await started.promise;
 a.edit(first,'Newer text');a.edit(second,'Independent');await a.checkpoint(second);
 assert.equal(a.get(first).acknowledged,0);assert.equal(a.get(second).acknowledged,1);
 gate.resolve();await saving;assert.equal(a.get(first).source,'Newer text');assert.equal(a.get(first).acknowledged,1);
 assert.equal(s.documents.get(key(id(1))).text,source);assert.equal(a.get(first).sequence,2);
});

test('a lost save acknowledgement retries identical operation and captured bytes',/* Verify one lost save reply retries identical bytes and creates one accepted operation. */ async()=>{
 const s=server();

 let drop=true;


 const {a,first}=adapter(/* Lose the first reply after server acceptance. */ async(path,body)=>{const result=await s.request(path,body);

  if(drop){drop=false;

   throw Error('lost acknowledgement');}

  return result;});


 a.edit(first,'Exact\r\n😀');await a.checkpoint(first);
 assert.equal(s.receipts.size,1);assert.equal(s.calls.length,2);assert.deepEqual(s.calls[0],s.calls[1]);assert.equal(a.get(first).acknowledged,1);
});

test('two lost acknowledgements retain the pending operation before saving queued newer source',/* Verify two lost replies retain pending intent before saving queued newer source. */ async()=>{
 const s=server();

 let offline=true;


 const {a,first}=adapter(/* Simulate an offline response after the server has accepted each request. */ async(path,body)=>{const result=await s.request(path,body);

  if(offline)throw Error('connection lost');

  return result;});


 a.edit(first,'Captured');await assert.rejects(a.checkpoint(first),/connection lost/);


 const pending=a.get(first).pending;

 assert.equal(a.get(first).acknowledged,0);a.edit(first,'Later');offline=false;await a.checkpoint(first);
 assert.deepEqual(s.calls[2].body,pending);assert.notDeepEqual(s.calls[3].body.operation,pending.operation);
 assert.equal(s.documents.get(key(id(1))).text,'Later');assert.equal(a.get(first).acknowledged,2);assert.equal(s.receipts.size,2);
});

test('retrying an uncertain commit reconciles the original commit without a second revision',/* Verify uncertain Commit retries the original publication without a second immutable revision. */ async()=>{
 const s=server();

 let drop=true;


 const {a,first}=adapter(/* Lose Commit acknowledgements while retaining successful server publication. */ async(path,body)=>{const result=await s.request(path,body);

  if(drop&&body.request.command==='commit')throw Error('lost commit acknowledgement');

  return result;});


 a.edit(first,'Committed');await assert.rejects(a.commit(first),/lost commit/);
 assert.equal(s.snapshots.size,1);

 const pending=a.get(first).pending;

 drop=false;


 const receipt=await a.commit(first);

 assert.deepEqual(receipt.operation,pending.operation);assert.equal(s.snapshots.size,1);assert.equal(s.receipts.size,2);assert.equal(a.get(first).pending,null);
});

test('queued commit uses its captured edit and preserves still newer typing',/* Verify queued Commit captures its own source while preserving still newer local typing. */ async()=>{
 const s=server(),gate=deferred(),started=deferred();

 let firstSave=true;


 const {a,first}=adapter(/* Hold the first accepted save until later Commit and typing have been queued. */ async(path,body)=>{const result=await s.request(path,body);

  if(firstSave){firstSave=false;started.resolve();await gate.promise;}

  return result;});


 a.edit(first,'One');

 const saving=a.checkpoint(first);

 await started.promise;
 a.edit(first,'Two\r\n😀');

 const committing=a.commit(first);

 a.edit(first,'Three');gate.resolve();await saving;await committing;
 assert.equal((await a.snapshot(first)).text,'Two\r\n😀');assert.equal(a.get(first).source,'Three');assert.equal(a.get(first).sequence,3);assert.equal(a.get(first).acknowledged,2);
});

test('mismatched result, identity, sequence, generation and commit bindings never advance state',/* Verify mismatched acknowledgement fields never advance generation, sequence or committed snapshot. */ async()=>{
 for(const change of [/* Mismatch operation identity. */ r=>r.operation=id(9),/* Redirect the acknowledgement document. */ r=>r.outcome.document=id(2),/* Return an unrequested sequence. */ r=>r.outcome.sequence=9,/* Return an unchanged generation. */ r=>r.outcome.generation=0,/* Return a fractional generation. */ r=>r.outcome.generation=1.5,/* Return a Commit outcome for a save command. */ r=>r.outcome.result='committed']){
  const s=server();

  const {a,first}=adapter(/* Corrupt one accepted server receipt for independent client-validation checks. */ async(path,body)=>{const r=await s.request(path,body);

   change(r);

   return r;});


  a.edit(first,'Unsaved');await assert.rejects(a.checkpoint(first),/Mismatched/);assert.equal(a.get(first).acknowledged,0);assert.equal(a.get(first).runtime.generation,0);assert.ok(a.get(first).pending);assert.ok(a.get(first).error);
 }


 const s=server();

 const {a,first}=adapter(/* Return a malformed committed snapshot identity. */ async(path,body)=>{const r=await s.request(path,body);

  r.outcome.snapshot=[1];

  return r;});


 await assert.rejects(a.commit(first),/Invalid committed/);assert.deepEqual(a.get(first).runtime.snapshot,id(61));
});

test('constructor and getters isolate owned identities, source and pending operations',/* Verify constructor/getter copies and frozen command inputs isolate owned state. */ async()=>{
 const states=[state(1)],s=server(states);

 const {a,first}=adapter(/* Check nested command immutability before delegating to the synthetic server. */ async(path,body)=>{assert.ok(Object.isFrozen(body));assert.ok(Object.isFrozen(body.operation));assert.throws(/* Attempt mutation of the frozen operation identity. */ ()=>body.operation[0]=255,TypeError);

  return s.request(path,body);},states);


 states[0].document[0]=255;

 const copy=a.get(first);

 copy.runtime.document[0]=254;copy.runtime.base[0]=253;
 a.edit(first,'Owned');await a.checkpoint(first);assert.deepEqual(a.get(first).runtime.document,id(1));
 assert.throws(/* Attempt local source containing an unpaired surrogate. */ ()=>a.edit(first,'\ud800'),/invalid Unicode/);
});

test('uncertain document creation retains its operation and rejects a different intent',/* Verify uncertain creation retains its operation and rejects replacement name/text intent. */ async()=>{
 const s=server();

 let drop=true;


 const {a}=adapter(/* Lose creation replies after the server has created its document once. */ async(path,body)=>{const result=await s.request(path,body);

  if(drop)throw Error('lost creation');

  return result;});


 await assert.rejects(a.create('Original','😀\r\n'),/lost creation/);await assert.rejects(a.create('Different'),/original name/);
 assert.equal(s.documents.size,3);drop=false;

 const receipt=await a.create('Original','😀\r\n');

 assert.equal(receipt.outcome.result,'created');assert.equal(s.documents.size,3);assert.deepEqual(s.calls[0].body,s.calls[2].body);
});

test('lock drains queued document saves and suspends edits before requesting server lock',/* Verify lock drains captured/newer drafts and suspends mutation before requesting server lock. */ async()=>{
 const s=server(),gate=deferred(),started=deferred();


 const {a,first,second}=adapter(/* Hold the first document save acknowledgement during lock preparation. */ async(path,body)=>{const result=await s.request(path,body);

  if(path==='commands'&&body.request.document[0]===1){started.resolve();await gate.promise;}

  return result;});


 a.edit(first,'First');

 const saving=a.checkpoint(first);

 await started.promise;a.edit(first,'Latest');a.edit(second,'Other');


 const locking=a.lock();

 assert.throws(/* Reject editing after lock preparation has begun. */ ()=>a.edit(first,'Late'),/suspended/);assert.throws(/* Reject Commit after lock preparation has begun. */ ()=>a.commit(first),/suspended/);assert.throws(/* Reject document creation after lock preparation has begun. */ ()=>a.create('Late'),/suspended/);await tick();assert.equal(s.calls.some(/* Detect any prematurely issued lock request. */ c=>c.path==='lock'),false);
 gate.resolve();await saving;await locking;assert.equal(s.calls.at(-1).path,'lock');assert.equal(s.documents.get(key(id(1))).text,'Latest');assert.equal(s.documents.get(key(id(2))).text,'Other');assert.equal(a.lifecycle,'locked');
});

test('failed pre-lock save retains source, prevents lock request and permits recovery',/* Verify failed draft settlement retains source, prevents lock and permits explicit recovery. */ async()=>{
 const s=server();

 let fail=true;


 const {a,first}=adapter(/* Return a known save conflict until the test enables recovery. */ async(path,body)=>{if(fail)throw Object.assign(Error('conflict'),{status:409});

  return s.request(path,body);});


 a.edit(first,'Keep this');await assert.rejects(a.lock(),/conflict/);assert.equal(a.lifecycle,'unlocked');assert.equal(a.get(first).source,'Keep this');assert.equal(s.calls.length,0);
 fail=false;await a.checkpoint(first);await a.lock();assert.equal(a.lifecycle,'locked');
});

test('unknown lock outcome keeps edits suspended and permits an idempotent lock retry',/* Verify unknown lock outcome retains edit suspension and supports idempotent lock retry. */ async()=>{
 const s=server();

 let drop=true;


 const {a,first}=adapter(/* Lose lock acknowledgements after server lock has already occurred. */ async(path,body)=>{const result=await s.request(path,body);

  if(path==='lock'&&drop)throw Error('lost lock acknowledgement');

  return result;});


 a.edit(first,'Safe');await assert.rejects(a.lock(),/lost lock/);assert.equal(a.lifecycle,'uncertain');assert.throws(/* Reject editing while lock outcome remains uncertain. */ ()=>a.edit(first,'Lost'),/suspended/);
 drop=false;await a.lock();assert.equal(a.lifecycle,'locked');assert.equal(s.calls.filter(/* Count save commands to detect duplicate text mutations during lock retry. */ c=>c.path==='commands').length,1);
});

test('lock waits for document creation before dropping workspace authority',/* Verify lock waits for queued creation before dropping workspace authority. */ async()=>{
 const s=server(),gate=deferred(),started=deferred();


 const {a}=adapter(/* Hold creation acknowledgement until the test releases it. */ async(path,body)=>{const receipt=await s.request(path,body);

  if(path==='commands'){started.resolve();await gate.promise;}

  return receipt;});


 const creating=a.create('Queued');

 await started.promise;

 const locking=a.lock();

 await tick();assert.equal(s.calls.some(/* Detect a premature lock request while creation is unresolved. */ c=>c.path==='lock'),false);gate.resolve();await creating;await locking;assert.equal(s.documents.size,3);assert.equal(a.lifecycle,'locked');
});

test('invalid and duplicated initial runtime identities/counters are rejected',/* Verify malformed/duplicate initial identities and unsafe counters fail construction. */ ()=>{
 for(const change of [/* Malformed initial document identity. */ s=>s.document=[1],/* Introduce an out-of-byte-range base element. */ s=>s.base[0]=256,/* Remove initial snapshot identity. */ s=>s.snapshot=null,/* Introduce a fractional generation. */ s=>s.generation=0.5,/* Exceed the safe acknowledged-sequence limit. */ s=>s.acknowledged_sequence=Number.MAX_SAFE_INTEGER+1]){const s=state(1);

  change(s);assert.throws(/* Attempt construction from the independently malformed editor state. */ ()=>new RuntimeAdapter([s]),/Invalid runtime/);}


 assert.throws(/* Attempt registration of duplicate document identities. */ ()=>new RuntimeAdapter([state(1),state(1)]),/Duplicate/);
});

test('keychain upgrade drains exact drafts and suspends edits until its result',/* Verify explicit keychain enrollment settles exact drafts and suspends edits until acknowledged. */ async()=>{
 const s=server(),gate=deferred(),started=deferred();


 const {a,first}=adapter(/* Emulate delayed enrollment and credential-free status while delegating ordinary saves. */ async(path,body)=>{
  if(path==='keychain/enroll'){started.resolve();await gate.promise;

   return {enrolled:true,backup_created:true};}


  if(path==='keychain/status')return {supported:true,schema:2,enrolled:true,cleanup_pending:false};


  return s.request(path,body);
 });


 a.edit(first,'Before upgrade😀\r\n');

 const upgrading=a.keychain('enroll');


 assert.equal(a.lifecycle,'securing');assert.throws(/* Reject typing during keychain securing state. */ ()=>a.edit(first,'Late'),/suspended/);await assert.rejects(a.lock(),/in progress/);
 await started.promise;assert.equal(a.get(first).acknowledged,1);gate.resolve();
 assert.equal((await upgrading).backup_created,true);assert.equal(a.lifecycle,'unlocked');
 assert.equal(s.calls.filter(/* Find the draft save sent before enrollment. */ c=>c.path==='commands')[0].body.request.text,'Before upgrade😀\r\n');
});

test('unknown enrollment reply reconciles status without resubmitting enrollment',/* Verify lost enrollment reply reconciles through status without repeating enrollment. */ async()=>{
 let enrollments=0;


 const {a}=adapter(/* Lose one enrollment response and expose its completed status. */ async(path)=>{
  if(path==='keychain/enroll'){enrollments++;

   throw Error('lost reply');}


  if(path==='keychain/status')return {supported:true,enrolled:true,cleanup_pending:false,schema:2};


  throw Error('Unexpected request');
 });


 assert.equal((await a.keychain('enroll')).reconciled,true);assert.equal(enrollments,1);assert.equal(a.lifecycle,'unlocked');
});

test('keychain failures and incomplete cleanup keep recovery and editing available',/* Verify denial, incomplete cleanup and unenrolled status preserve recovery and restore editing state. */ async()=>{
 for(const response of ['denied','cleanup','not-enrolled']){
  let calls=0;

  const {a}=adapter(/* Return explicit denial or uncertain enrollment with deliberately incomplete status. */ async path=>{
   if(path==='keychain/enroll'){calls++;

    const error=Error(response);

    if(response==='denied')error.status=403;

    throw error;}


   return {enrolled:response!=='not-enrolled',cleanup_pending:response==='cleanup'};
  });


  await assert.rejects(a.keychain('enroll'));assert.equal(a.lifecycle,'unlocked');assert.equal(calls,1);
 }
});

/** Build immutable committed-history metadata with explicit ancestry. */
const historyEntry=(revision,parent)=>({revision:id(revision),parent:parent===null?null:id(parent),snapshot:id(revision+40),operation:id(revision+80),actor:id(200),device:id(201),text_bytes:12});

test('history reads bind exact immutable cursors without changing current drafts or publication state',/* Verify historical reads pin cursors and leave current draft/publication state untouched. */ async()=>{
 const calls=[],page={document:id(1),entries:[historyEntry(10,9),historyEntry(9,8)],next:id(8)};


 const {a,first}=adapter(/* Return synthetic history or pinned historical text and record exact read scope. */ async(path,body)=>{calls.push({path,body});

  if(path==='snapshot')return {text:'Old😀\r\n'};

  return page;});


 a.edit(first,'Still typing');

 const before=a.get(first),result=await a.history(first,id(10),2);


 assert.deepEqual(calls[0],{path:'history',body:{document:id(1),next:id(10),limit:2}});
 assert.ok(Object.isFrozen(calls[0].body));result.entries[0].revision[0]=255;assert.equal(page.entries[0].revision[0],10);
 assert.deepEqual(a.get(first),before);assert.equal((await a.snapshot(first,id(50))).text,'Old😀\r\n');
 assert.deepEqual(calls[1],{path:'snapshot',body:{document:id(1),snapshot:id(50)}});assert.deepEqual(a.get(first),before);
});

test('snapshot reads freeze historical identities before delayed transport and detach exact source replies',/* Verify delayed historical snapshot requests freeze identity and detach exact text replies. */ async()=>{
 const gate=deferred(),snapshot=id(50),response={text:'Exact 😀 e\u0301\r\n中\rfinal\n'};

 let sent;


 const {a,first}=adapter(/* Hold the snapshot reply while caller-owned identity bytes change. */ async(path,body)=>{assert.equal(path,'snapshot');sent=body;await gate.promise;

  return response;});


 const before=a.get(first),pending=a.snapshot(first,snapshot);

 snapshot[0]=99;
 assert.deepEqual(sent,{document:id(1),snapshot:id(50)});assert.ok(Object.isFrozen(sent.snapshot));
 gate.resolve();

 const result=await pending;

 assert.equal(result.text,response.text);result.text='Changed';assert.equal(response.text,'Exact 😀 e\u0301\r\n中\rfinal\n');assert.deepEqual(a.get(first),before);
});

test('snapshot reads reject malformed Unicode and UTF-8 overflow before inspection or download',/* Verify malformed Unicode, byte overflow and invalid/locked snapshot requests fail before use. */ async()=>{
 for(const response of [null,{}, {text:3},{text:'\ud800'},{text:'\udc00'},{text:'😀'.repeat(524289)}]){
  const {a,first}=adapter(/* Return each independently malformed snapshot response. */ async()=>response);

  await assert.rejects(a.snapshot(first),/Invalid snapshot response/);
 }


 for(const text of ['', '😀'.repeat(524288)]){const {a,first}=adapter(/* Return a valid empty or maximum-bound snapshot. */ async()=>({text}));

  assert.equal((await a.snapshot(first)).text,text);}


 const {a,first}=adapter(/* Fail if a locally rejected snapshot request reaches transport. */ async()=>{throw Error('Should not request');});

 assert.throws(/* Attempt a malformed requested snapshot identity. */ ()=>a.snapshot(first,[1]),/Invalid snapshot identity/);a.lifecycle='locked';assert.throws(/* Attempt a snapshot read after explicit lock. */ ()=>a.snapshot(first),/locked/);
});

test('malformed history scope, identity, chains and cursors are rejected before rendering',/* Verify malformed history scope, identity, ancestry and continuation fail before rendering. */ async()=>{
 for(const change of [/* Redirect history to another document. */ p=>p.document=id(2),/* Return an empty page where an entry is required. */ p=>p.entries=[],/* Corrupt actor identity. */ p=>p.entries[0].actor=[1],/* Return negative text-byte length. */ p=>p.entries[0].text_bytes=-1,/* Break the parent chain between adjacent entries. */ p=>p.entries[0].parent=id(7),/* Duplicate a revision identity. */ p=>p.entries[1].revision=id(10),/* Point continuation back into the current page. */ p=>p.next=id(9),/* Remove continuation while ancestry continues. */ p=>p.next=null,/* Introduce self-parent revision ancestry. */ p=>p.entries[0].parent=id(10)]){
  const page={document:id(1),entries:[historyEntry(10,9),historyEntry(9,8)],next:id(8)};

  change(page);


  const {a,first}=adapter(/* Return each independently corrupted history page. */ async()=>page);

  await assert.rejects(a.history(first,id(10),2),/Invalid history/);
 }


 const {a,first}=adapter(/* Fail if invalid local history arguments reach transport. */ async()=>{throw Error('Should not request');});


 await assert.rejects(a.history(first,null,33),/Invalid history request/);await assert.rejects(a.history(first,[1]),/Invalid history request/);
});

test('copy preserves captured source and lock waits for its private acknowledgement',/* Verify exact provenance capture is acknowledged before lock and never changes source. */ async()=>{
 const input={...state(1),node:id(80),occurrence:id(81)},gate=deferred(),started=deferred(),calls=[];

 let captured;


 const {a,first}=adapter(/* Emulate pinned source, delayed private capture, refreshed clipboard and lock in explicit order. */ async(path,body)=>{
  calls.push({path,body});


  if(path==='snapshot')return {text:input.text};


  if(path==='commands'){
   assert.equal(body.request.command,'clipboard');captured=body;started.resolve();await gate.promise;


   return {operation:body.operation,outcome:{result:'clipboard',state:{generation:1,count:1,entry:id(9)}}};
  }


  if(path==='clipboard')return {generation:1,total:1,next:null,entries:[{id:id(9),available:true,source:captured.request.mutation.source,preview:input.text}]};


  if(path==='lock')return {locked:true};

  throw Error('Unexpected route');
 },[input]);


 const before=a.get(first),copying=a.captureSource(first,0,new TextEncoder().encode(input.text).length,input.text);


 await started.promise;

 const locking=a.lock();

 await tick();assert.equal(calls.some(/* Detect a premature lock while private capture is unresolved. */ c=>c.path==='lock'),false);gate.resolve();await copying;await locking;
 assert.equal(a.lifecycle,'locked');assert.throws(/* Reject access to private clipboard contents after lock. */ ()=>a.clipboard,/suspended/);assert.deepEqual(a.get(first),before);
 assert.equal(calls.filter(/* Count mutations to detect hidden source save or Commit. */ c=>c.path==='commands').length,1);assert.equal(captured.request.mutation.quote,input.text);
});

test('copy requires acknowledged committed source and never saves or commits implicitly',/* Verify source capture requires acknowledged committed equality and performs no implicit publication. */ async()=>{
 const input={...state(1),node:id(80),occurrence:id(81)},calls=[];


 const {a,first}=adapter(/* Return a different committed snapshot and record that only a read occurred. */ async(path)=>{calls.push(path);

  return {text:'A different committed source'};},[input]);


 const size=new TextEncoder().encode(input.text).length;


 await assert.rejects(a.captureSource(first,0,size,input.text),/Commit this source/);assert.deepEqual(calls,['snapshot']);
 a.edit(first,'Unacknowledged');assert.throws(/* Attempt capture after newer local edits are unacknowledged. */ ()=>a.captureSource(first,0,2,'Un'),/Save and commit/);assert.deepEqual(calls,['snapshot']);assert.equal(a.get(first).source,'Unacknowledged');
});

test('logical departure publishes changed acknowledged drafts exactly once and skips unchanged revisits',/* Verify logical departure Commits changed recovered drafts once and skips unchanged revisits. */ async()=>{
 const initial={...state(1),text:'Recovered draft 😀\r\n',acknowledged_sequence:4};

 const s=server([initial]);

 s.snapshots.set(key(initial.snapshot),'Earlier committed');


 const {a,first}=adapter(s.request,[initial]);

 await a.depart(first);
 assert.equal(s.calls.filter(/* Count immutable departure publications separately from saves. */ c=>c.body?.request?.command==='commit').length,1);assert.equal(s.calls.filter(/* Detect an unnecessary save of already acknowledged recovered source. */ c=>c.body?.request?.command==='save').length,0);


 const head=a.get(first).runtime.snapshot;

 assert.equal(s.snapshots.get(key(head)),initial.text);await a.depart(first);assert.equal(s.receipts.size,1);
 a.edit(first,'Later 😀\r\n中\r');await a.depart(first);assert.equal(s.snapshots.get(key(a.get(first).runtime.snapshot)),'Later 😀\r\n中\r');
});

test('logical departure retains unknown publication and retries its frozen operation before later typing',/* Verify uncertain departure publication retries one operation and later captured departure preserves newer typing. */ async()=>{
 const s=server();

 let drop=true;

 const {a,first}=adapter(/* Lose departure Commit replies after server publication. */ async(path,body)=>{const result=await s.request(path,body);

  if(drop&&body?.request?.command==='commit')throw Error('lost departure Commit');

  return result;});


 a.edit(first,'Outgoing first');await assert.rejects(a.depart(first),/lost departure/);

 const frozen=a.get(first).pending;

 assert.equal(s.snapshots.size,1);drop=false;
 await a.depart(first);assert.equal(s.snapshots.size,1);assert.equal(a.get(first).pending,null);assert.ok(s.calls.filter(/* Count identical retries of the retained departure operation. */ c=>key(c.body?.operation)===key(frozen.operation)).length===3);


 const gate=deferred(),started=deferred();

 let hold=true;

 const original=s.request;

 a.request=/* Hold the next accepted save while later typing occurs during departure. */ async(path,body)=>{const result=await original(path,body);

  if(hold&&body?.request?.command==='save'){hold=false;started.resolve();await gate.promise;}

  return result;};
 a.edit(first,'Captured next');

 const leaving=a.depart(first);

 await started.promise;a.edit(first,'Still newer typing');gate.resolve();await leaving;
 assert.equal(s.snapshots.get(key(a.get(first).runtime.snapshot)),'Captured next');assert.equal(a.get(first).source,'Still newer typing');assert.equal(a.get(first).sequence,a.get(first).acknowledged+1);
});
