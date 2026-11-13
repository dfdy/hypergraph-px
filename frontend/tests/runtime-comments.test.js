import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeComments,commentPlan} from '../src/runtime-comments.js';
import {RuntimeAdapter} from '../src/runtime-adapter.js';
const id=n=>Array(32).fill(n),source=()=>({document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence_path:[id(5)],start_byte:0,end_byte:8});
const plan=()=>({source:source(),quote:'😀\r\nAB',body:'  Comment 😀e\u0301\r\nExact\r  '});
const record=(n=2)=>({node:id(n+20),revision:id(n+40),source:source(),body:'Comment\r\n😀',actor:id(6),device:id(7),operation:id(n+60),ordinal:n,previous_document_comment:n===1?null:id(n+39),expected_draft:null});
const page=()=>({document:id(1),snapshot:id(3),text_snapshot_scope:'comments_excluded',entries:[record(2),record(1)],next:null});
test('comment plan preserves exact bytes and validates immutable source/body bounds',()=>{
 const p=plan(),f=commentPlan(p);assert.equal(f.body,p.body);assert.equal(f.quote,p.quote);p.source.revision[0]=99;assert.equal(f.source.revision[0],4);assert.ok(Object.isFrozen(f.source.revision));
 for(const change of [p=>p.body=' \r\n',p=>p.body='\ud800',p=>p.body='😀'.repeat(4097),p=>p.source.end_byte=7,p=>p.source.occurrence_path=[],p=>p.quote='Wrong']){const p=plan();change(p);assert.throws(()=>commentPlan(p));}
 const p2=plan();p2.body='😀'.repeat(4096);assert.equal(commentPlan(p2).body,p2.body);
});
test('comment pages validate exact scope and immutable decreasing paging chains',async()=>{
 const p=page(),c=new RuntimeComments(async()=>p,()=>id(90)),result=await c.page(id(1),id(3));result.entries[0].body='Changed';assert.equal(p.entries[0].body,'Comment\r\n😀');
 for(const change of [p=>p.document=id(9),p=>p.snapshot=id(9),p=>p.text_snapshot_scope='included',p=>p.entries[0].body='\ud800',p=>p.entries[0].ordinal=4,p=>p.entries[0].previous_document_comment=id(99),p=>p.entries[1].node=p.entries[0].node,p=>p.next=id(99),p=>p.entries[0].source.document=id(99),p=>p.entries[0].node=p.entries[0].source.node]){const p=page();change(p);const c=new RuntimeComments(async()=>p,()=>id(90));await assert.rejects(c.page(id(1),id(3)));}
 await assert.rejects(c.page(id(1),id(3),id(99)));await assert.rejects(c.page(id(1),id(3),null,9));
});
test('unknown comment publication freezes before queuing and lock reconciles exactly once',async()=>{
 const state={document:id(1),node:id(2),snapshot:id(3),base:id(4),occurrence:id(5),text:'Source',title:'Source',generation:0,acknowledged_sequence:0},calls=[];let drop=2,release;
 const adapter=new RuntimeAdapter([state],async(path,body)=>{calls.push({path,body:structuredClone(body)});if(path==='lock')return {locked:true};if(drop-->0)throw Error('Lost comment reply');return {operation:body.operation,outcome:{result:'commented',state:{document:id(1),node:id(20),revision:id(21),ordinal:1}}};});const key=[...adapter.docs.keys()][0];
 const hold=adapter.serialise('comments',()=>new Promise(r=>{release=r;}));await new Promise(r=>setImmediate(r));const input=plan(),pending=adapter.createComment(input);input.body='Later';input.source.revision[0]=99;release();await hold;await assert.rejects(pending,/Lost comment reply/);assert.ok(adapter.comments.pending);
 await adapter.lock();assert.equal(adapter.lifecycle,'locked');assert.equal(adapter.comments.pending,null);assert.equal(calls.length,4);assert.deepEqual(calls[0],calls[1]);assert.deepEqual(calls[0],calls[2]);assert.equal(calls[0].body.request.plan.body,plan().body);assert.equal(calls[0].body.request.plan.source.revision[0],4);assert.equal(adapter.get(key).source,'Source');assert.equal(calls[3].path,'lock');
});
test('mismatched comment receipts retain recovery while known rejections release the intent',async()=>{
 for(const change of [r=>r.operation=id(99),r=>r.outcome.state.document=id(99),r=>r.outcome.state.node=id(2),r=>r.outcome.state.ordinal=0]){const c=new RuntimeComments(async(path,body)=>{const r={operation:body.operation,outcome:{result:'commented',state:{document:id(1),node:id(20),revision:id(21),ordinal:1}}};change(r);return r;},()=>id(90));await assert.rejects(c.create(plan()),/Mismatched/);assert.ok(c.pending);}
 const c=new RuntimeComments(async()=>{throw Object.assign(Error('Conflict'),{status:409});},()=>id(90));await assert.rejects(c.create(plan()),/Conflict/);assert.equal(c.pending,null);
});
