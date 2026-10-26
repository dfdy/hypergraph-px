import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';
const id=n=>Array(32).fill(n),state=n=>({document:id(n),node:id(n+10),occurrence:id(n+20),base:id(n+30),snapshot:id(n+40),generation:0,acknowledged_sequence:0,title:`Document ${n}`,text:'Original 😀\r\n'});
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
function fixture(){
 const output=state(3),calls=[],receipts=new Map();let drop=0,editorDrop=false,gate=null,started=null;
 const request=async(path,body)=>{
  calls.push({path,body:structuredClone(body)});
  if(path==='editor'){if(editorDrop)throw Error('Editor unavailable');return output;}
  if(path==='lock')return {locked:true};
  assert.equal(path,'commands');assert.equal(body.request.command,'create');const k=JSON.stringify(body.operation);
  if(!receipts.has(k))receipts.set(k,{operation:body.operation,outcome:{result:'created',document:output.document}});
  if(started){started.resolve();await gate.promise;}if(drop-->0)throw Error('Lost creation reply');return receipts.get(k);
 };
 const a=new RuntimeAdapter([state(1),state(2)],request),[first,second]=a.docs.keys();return {a,first,second,calls,receipts,setDrop:n=>{drop=n;},setEditorDrop:v=>{editorDrop=v;},delay:()=>{gate=deferred();started=deferred();return {gate,started};}};
}
test('registering a new document preserves newer typing and another unsaved document without reload or forced saves',async()=>{
 const f=fixture(),{gate,started}=f.delay();f.a.edit(f.second,'Independent unsaved text');const creating=f.a.createAndRegister('New');await started.promise;f.a.edit(f.first,'New typing while creation is in flight');gate.resolve();const output=await creating;
 assert.equal(output.id,[...f.a.docs.keys()][2]);assert.equal(f.a.get(f.first).source,'New typing while creation is in flight');assert.equal(f.a.get(f.first).acknowledged,0);assert.equal(f.a.get(f.second).source,'Independent unsaved text');assert.deepEqual(f.calls.map(c=>c.path),['commands','editor']);
});
test('unknown creation and failed editor read retain one frozen operation through registration retry',async()=>{
 const f=fixture();f.setDrop(2);await assert.rejects(f.a.createAndRegister('New'),/Lost creation/);const original=structuredClone(f.a.creationPending);f.setEditorDrop(true);await assert.rejects(f.a.retryCreation(),/Editor unavailable/);assert.equal(f.a.docs.size,2);assert.deepEqual(f.a.creationPending,original);
 f.setEditorDrop(false);const output=await f.a.retryCreation();assert.equal(f.a.docs.size,3);assert.equal(output.title,'Document 3');assert.equal(f.receipts.size,1);assert.equal(f.a.creationPending,null);for(const call of f.calls.filter(c=>c.path==='commands'))assert.deepEqual(call.body,original);
});
test('lock reconciles registration without converting an unknown create into a second document',async()=>{
 const f=fixture();f.setDrop(2);await assert.rejects(f.a.createAndRegister('New'));await f.a.lock();assert.equal(f.receipts.size,1);assert.equal(f.a.docs.size,3);assert.equal(f.a.creationPending,null);assert.equal(f.a.lifecycle,'locked');assert.equal(f.calls.at(-1).path,'lock');
});
