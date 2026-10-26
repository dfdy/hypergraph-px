import {test} from 'node:test';
import assert from 'node:assert/strict';
import {capturedAssertion} from '../src/captured-assertion.js';
import {RuntimeAdapter} from '../src/runtime-adapter.js';
const id=n=>Array(32).fill(n),quote='😀\r\n中',source={document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence_path:[id(5)],start_byte:1,end_byte:10};
const input=()=>({label:'Grouped claims',description:'Explicit contextual interpretation.',participants:['premise','premise','conclusion'].map(role=>({role,source:structuredClone(source),quote})),properties:{scope:'Synthetic only'}});
test('captured declarations retain ordered repeated roles and exact historical bytes without draft preconditions',()=>{
 const x=input(),m=capturedAssertion(x);assert.deepEqual(m.predicate.roles,[{id:'premise',label:'premise'},{id:'conclusion',label:'conclusion'}]);assert.equal(m.participants.length,3);assert.equal(m.participants[0].quote,quote);assert.equal(m.participants[0].expected_draft,null);x.participants[0].source.snapshot[0]=99;assert.equal(m.participants[0].source.snapshot[0],3);
 for(const alter of [x=>x.participants[0].quote='Normalized\n',x=>x.participants[0].role=' ',x=>x.participants.push(...Array(6).fill(x.participants[0])),x=>x.label='😀'.repeat(81),x=>x.participants[0].source.start_byte=-1,x=>x.properties.scope='\ud800']){const invalid=input();alter(invalid);assert.throws(()=>capturedAssertion(invalid));}
 const large=input();large.participants=Array.from({length:3},()=>({role:'premise',source:{...structuredClone(source),start_byte:0,end_byte:800000},quote:'a'.repeat(800000)}));assert.throws(()=>capturedAssertion(large),/Combined/);
});
test('captured declaration freezes before queueing and reconciles lost replies without consulting or publishing current source',async()=>{
 let release;const blocker=new Promise(r=>{release=r;}),calls=[];let drop=2;
 const adapter=new RuntimeAdapter([],async(path,body)=>{calls.push({path,body:structuredClone(body)});if(drop-->0)throw Error('Lost reply');return {operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(21),generation:0,status:'proposed',deduplicated:false}}};});
 const held=adapter.serialise('assertions',()=>blocker),x=input(),pending=adapter.createCapturedAssertion(x);x.label='Later';x.participants[0].quote='Later';x.participants[0].source.snapshot[0]=99;release();await held;await assert.rejects(pending,/Lost reply/);await adapter.retryAssertion();assert.equal(calls.length,3);assert.ok(calls.every(c=>c.path==='commands'));assert.deepEqual(calls[0],calls[2]);assert.equal(calls[0].body.request.mutation.predicate.label,'Grouped claims');assert.equal(calls[0].body.request.mutation.participants[0].quote,quote);assert.equal(calls[0].body.request.mutation.participants[0].source.snapshot[0],3);
});
