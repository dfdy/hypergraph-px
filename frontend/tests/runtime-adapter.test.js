import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';

const id=byte=>Array(32).fill(byte),key=value=>JSON.stringify(value);
const state=byte=>({document:id(byte),title:'Document '+byte,text:'Original 😀 e\u0301\r\n中',generation:0,acknowledged_sequence:0,base:id(30+byte),snapshot:id(60+byte)});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function server(states=[state(1),state(2)]){
 const documents=new Map(states.map(s=>[key(s.document),structuredClone(s)])),receipts=new Map(),snapshots=new Map();let next=100,locked=false;
 const calls=[];
 const request=async(path,body)=>{
  calls.push({path,body:structuredClone(body)});
  if(path==='lock'){locked=true;return {locked:true};}
  if(locked)throw Object.assign(Error('locked'),{status:423});
  if(path==='snapshot')return {text:snapshots.get(key(body.snapshot))};
  assert.equal(path,'commands');
  const prior=receipts.get(key(body.operation));
  if(prior){assert.deepEqual(prior.request,body.request);return structuredClone(prior.receipt);}
  const c=body.request;let outcome;
  if(c.command==='create'){
   const s={...state(next++),title:c.title,text:c.text};documents.set(key(s.document),s);outcome={result:'created',document:s.document};
  }else{
   const s=documents.get(key(c.document));assert.ok(s);
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
  const receipt={operation:body.operation,outcome};receipts.set(key(body.operation),{request:structuredClone(c),receipt:structuredClone(receipt)});return structuredClone(receipt);
 };
 return {request,documents,receipts,calls,snapshots};
}
const assertIds=(a,b)=>key(a)===key(b);
function adapter(request,states=[state(1),state(2)]){const a=new RuntimeAdapter(states,request);return {a,first:[...a.docs.keys()][0],second:[...a.docs.keys()][1]};}

test('delayed saves capture exact text and do not acknowledge later edits or another document',async()=>{
 const s=server(),gate=deferred(),started=deferred();
 const {a,first,second}=adapter(async(path,body)=>{const receipt=await s.request(path,body);if(body.request?.document[0]===1){started.resolve();await gate.promise;}return receipt;});
 const source='Saved 😀e\u0301\r\n中';a.edit(first,source);const saving=a.checkpoint(first);await started.promise;
 a.edit(first,'Newer text');a.edit(second,'Independent');await a.checkpoint(second);
 assert.equal(a.get(first).acknowledged,0);assert.equal(a.get(second).acknowledged,1);
 gate.resolve();await saving;assert.equal(a.get(first).source,'Newer text');assert.equal(a.get(first).acknowledged,1);
 assert.equal(s.documents.get(key(id(1))).text,source);assert.equal(a.get(first).sequence,2);
});

test('a lost save acknowledgement retries identical operation and captured bytes',async()=>{
 const s=server();let drop=true;
 const {a,first}=adapter(async(path,body)=>{const result=await s.request(path,body);if(drop){drop=false;throw Error('lost acknowledgement');}return result;});
 a.edit(first,'Exact\r\n😀');await a.checkpoint(first);
 assert.equal(s.receipts.size,1);assert.equal(s.calls.length,2);assert.deepEqual(s.calls[0],s.calls[1]);assert.equal(a.get(first).acknowledged,1);
});

test('two lost acknowledgements retain the pending operation before saving queued newer source',async()=>{
 const s=server();let offline=true;
 const {a,first}=adapter(async(path,body)=>{const result=await s.request(path,body);if(offline)throw Error('connection lost');return result;});
 a.edit(first,'Captured');await assert.rejects(a.checkpoint(first),/connection lost/);
 const pending=a.get(first).pending;assert.equal(a.get(first).acknowledged,0);a.edit(first,'Later');offline=false;await a.checkpoint(first);
 assert.deepEqual(s.calls[2].body,pending);assert.notDeepEqual(s.calls[3].body.operation,pending.operation);
 assert.equal(s.documents.get(key(id(1))).text,'Later');assert.equal(a.get(first).acknowledged,2);assert.equal(s.receipts.size,2);
});

test('retrying an uncertain commit reconciles the original commit without a second revision',async()=>{
 const s=server();let drop=true;
 const {a,first}=adapter(async(path,body)=>{const result=await s.request(path,body);if(drop&&body.request.command==='commit')throw Error('lost commit acknowledgement');return result;});
 a.edit(first,'Committed');await assert.rejects(a.commit(first),/lost commit/);
 assert.equal(s.snapshots.size,1);const pending=a.get(first).pending;drop=false;
 const receipt=await a.commit(first);assert.deepEqual(receipt.operation,pending.operation);assert.equal(s.snapshots.size,1);assert.equal(s.receipts.size,2);assert.equal(a.get(first).pending,null);
});

test('queued commit uses its captured edit and preserves still newer typing',async()=>{
 const s=server(),gate=deferred(),started=deferred();let firstSave=true;
 const {a,first}=adapter(async(path,body)=>{const result=await s.request(path,body);if(firstSave){firstSave=false;started.resolve();await gate.promise;}return result;});
 a.edit(first,'One');const saving=a.checkpoint(first);await started.promise;
 a.edit(first,'Two\r\n😀');const committing=a.commit(first);a.edit(first,'Three');gate.resolve();await saving;await committing;
 assert.equal((await a.snapshot(first)).text,'Two\r\n😀');assert.equal(a.get(first).source,'Three');assert.equal(a.get(first).sequence,3);assert.equal(a.get(first).acknowledged,2);
});

test('mismatched result, identity, sequence, generation and commit bindings never advance state',async()=>{
 for(const change of [r=>r.operation=id(9),r=>r.outcome.document=id(2),r=>r.outcome.sequence=9,r=>r.outcome.generation=0,r=>r.outcome.generation=1.5,r=>r.outcome.result='committed']){
  const s=server();const {a,first}=adapter(async(path,body)=>{const r=await s.request(path,body);change(r);return r;});
  a.edit(first,'Unsaved');await assert.rejects(a.checkpoint(first),/Mismatched/);assert.equal(a.get(first).acknowledged,0);assert.equal(a.get(first).runtime.generation,0);assert.ok(a.get(first).pending);assert.ok(a.get(first).error);
 }
 const s=server();const {a,first}=adapter(async(path,body)=>{const r=await s.request(path,body);r.outcome.snapshot=[1];return r;});
 await assert.rejects(a.commit(first),/Invalid committed/);assert.deepEqual(a.get(first).runtime.snapshot,id(61));
});

test('constructor and getters isolate owned identities, source and pending operations',async()=>{
 const states=[state(1)],s=server(states);const {a,first}=adapter(async(path,body)=>{assert.ok(Object.isFrozen(body));assert.ok(Object.isFrozen(body.operation));assert.throws(()=>body.operation[0]=255,TypeError);return s.request(path,body);},states);
 states[0].document[0]=255;const copy=a.get(first);copy.runtime.document[0]=254;copy.runtime.base[0]=253;
 a.edit(first,'Owned');await a.checkpoint(first);assert.deepEqual(a.get(first).runtime.document,id(1));
 assert.throws(()=>a.edit(first,'\ud800'),/invalid Unicode/);
});

test('uncertain document creation retains its operation and rejects a different intent',async()=>{
 const s=server();let drop=true;
 const {a}=adapter(async(path,body)=>{const result=await s.request(path,body);if(drop)throw Error('lost creation');return result;});
 await assert.rejects(a.create('Original','😀\r\n'),/lost creation/);await assert.rejects(a.create('Different'),/original name/);
 assert.equal(s.documents.size,3);drop=false;const receipt=await a.create('Original','😀\r\n');assert.equal(receipt.outcome.result,'created');assert.equal(s.documents.size,3);assert.deepEqual(s.calls[0].body,s.calls[2].body);
});

test('lock drains queued document saves and suspends edits before requesting server lock',async()=>{
 const s=server(),gate=deferred(),started=deferred();
 const {a,first,second}=adapter(async(path,body)=>{const result=await s.request(path,body);if(path==='commands'&&body.request.document[0]===1){started.resolve();await gate.promise;}return result;});
 a.edit(first,'First');const saving=a.checkpoint(first);await started.promise;a.edit(first,'Latest');a.edit(second,'Other');
 const locking=a.lock();assert.throws(()=>a.edit(first,'Late'),/suspended/);assert.throws(()=>a.commit(first),/suspended/);assert.throws(()=>a.create('Late'),/suspended/);await tick();assert.equal(s.calls.some(c=>c.path==='lock'),false);
 gate.resolve();await saving;await locking;assert.equal(s.calls.at(-1).path,'lock');assert.equal(s.documents.get(key(id(1))).text,'Latest');assert.equal(s.documents.get(key(id(2))).text,'Other');assert.equal(a.lifecycle,'locked');
});

test('failed pre-lock save retains source, prevents lock request and permits recovery',async()=>{
 const s=server();let fail=true;
 const {a,first}=adapter(async(path,body)=>{if(fail)throw Object.assign(Error('conflict'),{status:409});return s.request(path,body);});
 a.edit(first,'Keep this');await assert.rejects(a.lock(),/conflict/);assert.equal(a.lifecycle,'unlocked');assert.equal(a.get(first).source,'Keep this');assert.equal(s.calls.length,0);
 fail=false;await a.checkpoint(first);await a.lock();assert.equal(a.lifecycle,'locked');
});

test('unknown lock outcome keeps edits suspended and permits an idempotent lock retry',async()=>{
 const s=server();let drop=true;
 const {a,first}=adapter(async(path,body)=>{const result=await s.request(path,body);if(path==='lock'&&drop)throw Error('lost lock acknowledgement');return result;});
 a.edit(first,'Safe');await assert.rejects(a.lock(),/lost lock/);assert.equal(a.lifecycle,'uncertain');assert.throws(()=>a.edit(first,'Lost'),/suspended/);
 drop=false;await a.lock();assert.equal(a.lifecycle,'locked');assert.equal(s.calls.filter(c=>c.path==='commands').length,1);
});

test('lock waits for document creation before dropping workspace authority',async()=>{
 const s=server(),gate=deferred(),started=deferred();
 const {a}=adapter(async(path,body)=>{const receipt=await s.request(path,body);if(path==='commands'){started.resolve();await gate.promise;}return receipt;});
 const creating=a.create('Queued');await started.promise;const locking=a.lock();await tick();assert.equal(s.calls.some(c=>c.path==='lock'),false);gate.resolve();await creating;await locking;assert.equal(s.documents.size,3);assert.equal(a.lifecycle,'locked');
});

test('invalid and duplicated initial runtime identities/counters are rejected',()=>{
 for(const change of [s=>s.document=[1],s=>s.base[0]=256,s=>s.snapshot=null,s=>s.generation=0.5,s=>s.acknowledged_sequence=Number.MAX_SAFE_INTEGER+1]){const s=state(1);change(s);assert.throws(()=>new RuntimeAdapter([s]),/Invalid runtime/);}
 assert.throws(()=>new RuntimeAdapter([state(1),state(1)]),/Duplicate/);
});

test('keychain upgrade drains exact drafts and suspends edits until its result',async()=>{
 const s=server(),gate=deferred(),started=deferred();
 const {a,first}=adapter(async(path,body)=>{
  if(path==='keychain/enroll'){started.resolve();await gate.promise;return {enrolled:true,backup_created:true};}
  if(path==='keychain/status')return {supported:true,schema:2,enrolled:true,cleanup_pending:false};
  return s.request(path,body);
 });
 a.edit(first,'Before upgrade😀\r\n');const upgrading=a.keychain('enroll');
 assert.equal(a.lifecycle,'securing');assert.throws(()=>a.edit(first,'Late'),/suspended/);await assert.rejects(a.lock(),/in progress/);
 await started.promise;assert.equal(a.get(first).acknowledged,1);gate.resolve();
 assert.equal((await upgrading).backup_created,true);assert.equal(a.lifecycle,'unlocked');
 assert.equal(s.calls.filter(c=>c.path==='commands')[0].body.request.text,'Before upgrade😀\r\n');
});

test('unknown enrollment reply reconciles status without resubmitting enrollment',async()=>{
 let enrollments=0;
 const {a}=adapter(async(path)=>{
  if(path==='keychain/enroll'){enrollments++;throw Error('lost reply');}
  if(path==='keychain/status')return {supported:true,enrolled:true,cleanup_pending:false,schema:2};
  throw Error('Unexpected request');
 });
 assert.equal((await a.keychain('enroll')).reconciled,true);assert.equal(enrollments,1);assert.equal(a.lifecycle,'unlocked');
});

test('keychain failures and incomplete cleanup keep recovery and editing available',async()=>{
 for(const response of ['denied','cleanup','not-enrolled']){
  let calls=0;const {a}=adapter(async path=>{
   if(path==='keychain/enroll'){calls++;const error=Error(response);if(response==='denied')error.status=403;throw error;}
   return {enrolled:response!=='not-enrolled',cleanup_pending:response==='cleanup'};
  });
  await assert.rejects(a.keychain('enroll'));assert.equal(a.lifecycle,'unlocked');assert.equal(calls,1);
 }
});

const historyEntry=(revision,parent)=>({revision:id(revision),parent:parent===null?null:id(parent),snapshot:id(revision+40),operation:id(revision+80),actor:id(200),device:id(201),text_bytes:12});
test('history reads bind exact immutable cursors without changing current drafts or publication state',async()=>{
 const calls=[],page={document:id(1),entries:[historyEntry(10,9),historyEntry(9,8)],next:id(8)};
 const {a,first}=adapter(async(path,body)=>{calls.push({path,body});if(path==='snapshot')return {text:'Old😀\r\n'};return page;});
 a.edit(first,'Still typing');const before=a.get(first),result=await a.history(first,id(10),2);
 assert.deepEqual(calls[0],{path:'history',body:{document:id(1),next:id(10),limit:2}});
 assert.ok(Object.isFrozen(calls[0].body));result.entries[0].revision[0]=255;assert.equal(page.entries[0].revision[0],10);
 assert.deepEqual(a.get(first),before);assert.equal((await a.snapshot(first,id(50))).text,'Old😀\r\n');
 assert.deepEqual(calls[1],{path:'snapshot',body:{document:id(1),snapshot:id(50)}});assert.deepEqual(a.get(first),before);
});

test('snapshot reads freeze historical identities before delayed transport and detach exact source replies',async()=>{
 const gate=deferred(),snapshot=id(50),response={text:'Exact 😀 e\u0301\r\n中\rfinal\n'};let sent;
 const {a,first}=adapter(async(path,body)=>{assert.equal(path,'snapshot');sent=body;await gate.promise;return response;});
 const before=a.get(first),pending=a.snapshot(first,snapshot);snapshot[0]=99;
 assert.deepEqual(sent,{document:id(1),snapshot:id(50)});assert.ok(Object.isFrozen(sent.snapshot));
 gate.resolve();const result=await pending;assert.equal(result.text,response.text);result.text='Changed';assert.equal(response.text,'Exact 😀 e\u0301\r\n中\rfinal\n');assert.deepEqual(a.get(first),before);
});

test('snapshot reads reject malformed Unicode and UTF-8 overflow before inspection or download',async()=>{
 for(const response of [null,{}, {text:3},{text:'\ud800'},{text:'\udc00'},{text:'😀'.repeat(524289)}]){
  const {a,first}=adapter(async()=>response);await assert.rejects(a.snapshot(first),/Invalid snapshot response/);
 }
 for(const text of ['', '😀'.repeat(524288)]){const {a,first}=adapter(async()=>({text}));assert.equal((await a.snapshot(first)).text,text);}
 const {a,first}=adapter(async()=>{throw Error('Should not request');});assert.throws(()=>a.snapshot(first,[1]),/Invalid snapshot identity/);a.lifecycle='locked';assert.throws(()=>a.snapshot(first),/locked/);
});

test('malformed history scope, identity, chains and cursors are rejected before rendering',async()=>{
 for(const change of [p=>p.document=id(2),p=>p.entries=[],p=>p.entries[0].actor=[1],p=>p.entries[0].text_bytes=-1,p=>p.entries[0].parent=id(7),p=>p.entries[1].revision=id(10),p=>p.next=id(9),p=>p.next=null,p=>p.entries[0].parent=id(10)]){
  const page={document:id(1),entries:[historyEntry(10,9),historyEntry(9,8)],next:id(8)};change(page);
  const {a,first}=adapter(async()=>page);await assert.rejects(a.history(first,id(10),2),/Invalid history/);
 }
 const {a,first}=adapter(async()=>{throw Error('Should not request');});
 await assert.rejects(a.history(first,null,33),/Invalid history request/);await assert.rejects(a.history(first,[1]),/Invalid history request/);
});

test('copy preserves captured source and lock waits for its private acknowledgement',async()=>{
 const input={...state(1),node:id(80),occurrence:id(81)},gate=deferred(),started=deferred(),calls=[];let captured;
 const {a,first}=adapter(async(path,body)=>{
  calls.push({path,body});
  if(path==='snapshot')return {text:input.text};
  if(path==='commands'){
   assert.equal(body.request.command,'clipboard');captured=body;started.resolve();await gate.promise;
   return {operation:body.operation,outcome:{result:'clipboard',state:{generation:1,count:1,entry:id(9)}}};
  }
  if(path==='clipboard')return {generation:1,total:1,next:null,entries:[{id:id(9),available:true,source:captured.request.mutation.source,preview:input.text}]};
  if(path==='lock')return {locked:true};throw Error('Unexpected route');
 },[input]);
 const before=a.get(first),copying=a.captureSource(first,0,new TextEncoder().encode(input.text).length,input.text);
 await started.promise;const locking=a.lock();await tick();assert.equal(calls.some(c=>c.path==='lock'),false);gate.resolve();await copying;await locking;
 assert.equal(a.lifecycle,'locked');assert.throws(()=>a.clipboard,/suspended/);assert.deepEqual(a.get(first),before);
 assert.equal(calls.filter(c=>c.path==='commands').length,1);assert.equal(captured.request.mutation.quote,input.text);
});

test('copy requires acknowledged committed source and never saves or commits implicitly',async()=>{
 const input={...state(1),node:id(80),occurrence:id(81)},calls=[];
 const {a,first}=adapter(async(path)=>{calls.push(path);return {text:'A different committed source'};},[input]);
 const size=new TextEncoder().encode(input.text).length;
 await assert.rejects(a.captureSource(first,0,size,input.text),/Commit this source/);assert.deepEqual(calls,['snapshot']);
 a.edit(first,'Unacknowledged');assert.throws(()=>a.captureSource(first,0,2,'Un'),/Save and commit/);assert.deepEqual(calls,['snapshot']);assert.equal(a.get(first).source,'Unacknowledged');
});
