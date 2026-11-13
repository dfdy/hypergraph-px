import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeWorkingClipboard} from '../src/runtime-working-clipboard.js';
const id=n=>Array(32).fill(n),text='A\r\n😀中\rfinal',plan=()=>({document:id(1),branch:id(2),generation:3,base:id(4),sequence:5,text,start_byte:3,end_byte:10,quote:'😀中'});
const source=()=>({kind:'working_checkpoint',document:id(1),node:id(6),branch:id(2),working_branch:id(7),checkpoint:id(8),occurrence_path:[id(9)],start_byte:3,end_byte:10});
test('working copy retains its exact operation and source through lost replies and changed caller input',async()=>{
 let lose=2;const calls=[];const clipboard=new RuntimeWorkingClipboard(async(path,body)=>{
  if(path==='working/clipboard')return {generation:1,total:1,entries:[{id:id(10),target:{kind:'working',source:source()},preview:'😀中'}],next:null};
  calls.push(structuredClone(body));if(lose-->0)throw Error('Lost reply');return {operation:body.operation,outcome:{result:'working_copied',state:{checkpoint:{document:id(1),node:id(6),branch:id(2),working_branch:id(7),checkpoint:id(8),ordinal:1},source:source(),entry:id(10),generation:1,count:1}}};
 },()=>id(11));const input=plan();const pending=clipboard.copy(input);input.text='Changed';await assert.rejects(pending,/Lost/);await clipboard.retry();assert.equal(clipboard.pending,null);assert.equal(clipboard.total,1);for(const call of calls)assert.deepEqual(call,calls[0]);assert.equal(calls[0].request.plan.text,text);
});
test('working source inspection freezes range and IDs and preserves exact retained passage',async()=>{
 let request;const clipboard=new RuntimeWorkingClipboard(async(path,body)=>{request=body;await new Promise(r=>setImmediate(r));return {source:structuredClone(body),text,base:id(4),sequence:5,publication:'private_working_checkpoint',promotion:null};},()=>id(1));
 const input=source(),pending=clipboard.inspect(input);input.start_byte=0;input.checkpoint[0]=99;const view=await pending;assert.equal(view.passage,'😀中');assert.equal(request.start_byte,3);assert.equal(request.checkpoint[0],8);view.source.checkpoint[0]=55;assert.equal(request.checkpoint[0],8);
});
test('invalid scalar selections and mismatched working-copy receipts remain rejected',async()=>{
 let calls=0;const clipboard=new RuntimeWorkingClipboard(async()=>{calls++;return {};},()=>id(1));const split=plan();split.start_byte=4;assert.throws(()=>clipboard.copy(split),/scalar/);assert.equal(calls,0);
 await assert.rejects(clipboard.copy(plan()),/Mismatched/);assert.ok(clipboard.pending);assert.throws(()=>clipboard.copy(plan()),/pending/);
});
