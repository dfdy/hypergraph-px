import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';
const id=n=>Array(32).fill(n),key=v=>JSON.stringify(v),tick=()=>new Promise(r=>setImmediate(r));
const state=()=>({document:id(1),node:id(2),branch:id(3),manifest:id(4),occurrence:id(5),draft:id(6),base:id(7),snapshot:id(8),generation:0,acknowledged_sequence:0,title:'Same document',text:'Original 😀\r\n中\r'});
function server(){
 const original=state(),child={...state(),branch:id(9),draft:id(10)},states=new Map([[key(original.branch),original],[key(child.branch),child]]),receipts=new Map(),snapshots=new Map([[key(original.snapshot),original.text]]),calls=[];let lose=0;
 const request=async(path,body)=>{
  calls.push({path,body:structuredClone(body)});
  if(path==='branches/editor')return structuredClone(states.get(key(body.branch)));
  if(path==='lock')return {locked:true};if(path==='snapshot')return {text:snapshots.get(key(body.snapshot))};
  assert.equal(path,'commands');const prior=receipts.get(key(body.operation));let receipt;
  if(prior){assert.deepEqual(prior.request,body.request);receipt=prior.receipt;}
  else {const scoped=body.request.command==='branch',c=scoped?body.request.mutation:body.request,action=scoped?c.action:c.command,s=states.get(key(scoped?c.branch:original.branch));
   assert.equal(c.generation,s.generation);assert.deepEqual(c.base,s.base);s.generation++;s.acknowledged_sequence=c.sequence;
   let result;if(action==='save'){assert.equal(c.previous_sequence,c.sequence-1);s.text=c.text;result={result:'saved',document:s.document,generation:s.generation,sequence:c.sequence};}
   else {s.base=id(40+s.generation);s.snapshot=id(60+s.generation);snapshots.set(key(s.snapshot),s.text);result={result:'committed',document:s.document,generation:s.generation,sequence:c.sequence,revision:s.base,snapshot:s.snapshot};}
   receipt={operation:body.operation,outcome:scoped?{result:'branch',state:{branch:c.branch,outcome:result}}:result};receipts.set(key(body.operation),{request:structuredClone(body.request),receipt:structuredClone(receipt)});
  }
  if(lose>0){lose--;throw Error('Lost acknowledgement');}return structuredClone(receipt);
 };
 return {request,original,child,states,calls,setLose:n=>lose=n};
}
test('branch buffers retain pending exact typing and route child retries to the frozen branch',async()=>{
 const s=server(),adapter=new RuntimeAdapter([s.original],s.request,{branches:true}),doc=[...adapter.docs.keys()][0];
 adapter.edit(doc,'Parent pending 😀\r\n');await adapter.selectBranch(doc,id(9));assert.equal(adapter.get(doc).source,s.child.text);
 adapter.edit(doc,'Child draft 😀\r');s.setLose(2);await assert.rejects(adapter.checkpoint(doc),/Lost/);
 const frozen=structuredClone(adapter.get(doc).pending);adapter.edit(doc,'Child newer 😀\r\n');await adapter.selectBranch(doc,id(3));
 assert.equal(adapter.get(doc).source,'Parent pending 😀\r\n');assert.notEqual(s.original.base[0],7);
 await adapter.selectBranch(doc,id(9));assert.equal(adapter.get(doc).source,'Child newer 😀\r\n');await adapter.commit(doc);
 assert.equal(s.child.text,'Child newer 😀\r\n');assert.equal(s.original.text,'Parent pending 😀\r\n');
 const retries=s.calls.filter(c=>key(c.body?.operation)===key(frozen.operation));assert.ok(retries.length>=3);for(const retry of retries)assert.deepEqual(retry.body,frozen);
 await adapter.selectBranch(doc,id(3));await adapter.lock();assert.equal(adapter.lifecycle,'locked');assert.equal(adapter.allBuffers().length,2);
});
test('queued branch switching preserves newer parent typing while a captured save is delayed',async()=>{
 const s=server();let release,held=true;const request=async(path,body)=>{if(path==='commands'&&held){held=false;await new Promise(r=>release=r);}return s.request(path,body);};
 const adapter=new RuntimeAdapter([s.original],request,{branches:true}),doc=[...adapter.docs.keys()][0];adapter.edit(doc,'First\r\n');const save=adapter.checkpoint(doc);await tick();adapter.edit(doc,'Newer 😀\r\n');const switchPromise=adapter.selectBranch(doc,id(9));release();await save;await switchPromise;
 await adapter.selectBranch(doc,id(3));assert.equal(adapter.get(doc).source,'Newer 😀\r\n');assert.equal(s.original.text,'Newer 😀\r\n');
});
test('branch history sends detached opaque cursors and rejects a response from another branch',async()=>{
 const original=state();let body;const next=[4,5,6],cursor=[1,2,3];let wrong=false;
 const adapter=new RuntimeAdapter([original],async(path,input)=>{assert.equal(path,'branches/history/page');body=input;await tick();return {document:original.document,branch:wrong?id(9):original.branch,snapshot:original.snapshot,cursor:[8,9],entries:[{revision:id(30),parent:id(31),snapshot:id(32),operation:id(33),actor:id(34),device:id(35),text_bytes:20}],next};},{branches:true});
 const doc=[...adapter.docs.keys()][0],pending=adapter.history(doc,cursor);cursor[0]=99;await pending;assert.deepEqual(body.cursor,[1,2,3]);adapter.docs.get(doc).runtime.snapshot=id(99);await adapter.history(doc,[1,2,3],12,original.snapshot);assert.deepEqual(body.snapshot,original.snapshot);wrong=true;await assert.rejects(adapter.history(doc,[1,2]),/Invalid history page/);
});

test('branch departure reconciles an unknown Commit once, rejects departure on failure and skips unchanged or same-branch selections',async()=>{
 const s=server(),adapter=new RuntimeAdapter([s.original],s.request,{branches:true}),doc=[...adapter.docs.keys()][0];
 await adapter.selectBranch(doc,id(3));assert.equal(s.calls.length,0);
 await adapter.selectBranch(doc,id(9));assert.equal(s.calls.filter(c=>c.path==='commands').length,0);
 adapter.edit(doc,'Child exact 😀\r\n');await adapter.checkpoint(doc);s.setLose(2);
 await assert.rejects(adapter.selectBranch(doc,id(3)),/Lost/);assert.deepEqual(adapter.get(doc).runtime.branch,id(9));
 const frozen=adapter.get(doc).pending;assert.equal(frozen.request.mutation.action,'commit');
 await adapter.selectBranch(doc,id(3));const retries=s.calls.filter(c=>key(c.body?.operation)===key(frozen.operation));assert.equal(retries.length,3);for(const call of retries)assert.deepEqual(call.body,frozen);
 await adapter.selectBranch(doc,id(9));const before=s.calls.filter(c=>c.path==='commands').length;await adapter.selectBranch(doc,id(3));assert.equal(s.calls.filter(c=>c.path==='commands').length,before);
});
