import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';
const id=n=>Array(32).fill(n),editor={document:id(1),node:id(2),branch:id(3),base:id(4),snapshot:id(5),generation:0,acknowledged_sequence:0,title:'Source',text:'Saved source 😀\r\n'};
const context=()=>({document:id(1),node:id(2),branch:id(9),parent:id(3),source_name:'Child',parent_name:'Original branch',source_revision:id(10),source_snapshot:id(11),parent_revision:id(12),parent_snapshot:id(13)});
test('parent comparison freezes explicit branch scope and leaves newer typing and acknowledgement unchanged',async()=>{
 let release;const calls=[],adapter=new RuntimeAdapter([editor],async(path,body)=>{calls.push({path,body:structuredClone(body)});await new Promise(r=>release=r);return context();}),document=[...adapter.docs.keys()][0],branch=id(9);
 const pending=adapter.parentComparison(document,branch);branch[0]=99;adapter.edit(document,'Newer pending source');release();const value=await pending;
 assert.deepEqual(calls,[{path:'branches/comparison',body:{document:id(1),branch:id(9)}}]);assert.deepEqual(value.branch,id(9));assert.equal(adapter.get(document).source,'Newer pending source');assert.equal(adapter.get(document).acknowledged,0);assert.equal(adapter.get(document).pending,null);
});
test('parent comparison rejects redirected, malformed or self-parent metadata and lock-invalidated replies',async()=>{
 for(const change of [{document:id(99)},{node:id(99)},{parent:id(9)},{source_snapshot:[1]},{parent_name:'x'.repeat(513)},{source_name:''},{draft:'unrequested'}]){
  const adapter=new RuntimeAdapter([editor],async()=>({...context(),...change})),document=[...adapter.docs.keys()][0];await assert.rejects(adapter.parentComparison(document,id(9)),/Invalid parent-branch comparison/);
 }
 let release,calls=0;const adapter=new RuntimeAdapter([editor],async()=>{calls++;await new Promise(r=>release=r);return context();}),document=[...adapter.docs.keys()][0],pending=adapter.parentComparison(document,id(9));adapter.lifecycle='locked';release();await assert.rejects(pending,/locking or locked/);await assert.rejects(adapter.parentComparison(document,id(9)),/locking or locked/);assert.equal(calls,1);
});
test('common base is pinned to the inspected pair and remains read-only during newer typing',async()=>{
 const original=context(),report={comparison:original,selection:{result:'base',revision:id(14),snapshot:id(15),source_in_target:false,target_in_source:false},revisions_read:3};let release;const calls=[];
 const adapter=new RuntimeAdapter([editor],async(path,body)=>{calls.push({path,body});await new Promise(r=>release=r);return report;}),document=[...adapter.docs.keys()][0];
 const pending=adapter.parentBase(document,original);original.source_snapshot[0]=99;adapter.edit(document,'Newer pending draft');release();
 await assert.rejects(pending,/Branches changed/);assert.equal(adapter.get(document).source,'Newer pending draft');assert.equal(adapter.get(document).pending,null);
 assert.deepEqual(calls,[{path:'branches/merge-base',body:{document:id(1),branch:id(9)}}]);
 const frozen={comparison:context(),selection:report.selection,revisions_read:3};adapter.request=async()=>frozen;assert.deepEqual(await adapter.parentBase(document,context()),frozen);
});
test('common base rejects malformed, redirected and lock-invalidated results without an inferred base',async()=>{
 const good={comparison:context(),selection:{result:'base',revision:id(14),snapshot:id(15),source_in_target:false,target_in_source:false},revisions_read:3};
 for(const change of [{revisions_read:0},{revisions_read:1025},{revisions_read:1.5},{selection:null},{selection:{result:'base',revision:id(14),snapshot:[1],source_in_target:false,target_in_source:false}},{selection:{...good.selection,source_in_target:1}},{selection:{...good.selection,source_in_target:true}},{selection:{...good.selection,revision:id(10)}},{selection:{result:'unrelated',snapshot:id(1)}},{selection:{result:'ambiguous',revisions:[id(1),id(1)]}},{extra:'unrequested'},{comparison:{...context(),document:id(99)}}]){
  const adapter=new RuntimeAdapter([editor],async()=>({...good,...change})),document=[...adapter.docs.keys()][0];await assert.rejects(adapter.parentBase(document,context()),/Invalid common-base/);
 }
 const adapter=new RuntimeAdapter([editor],async()=>{adapter.lifecycle='locked';return good;}),document=[...adapter.docs.keys()][0];await assert.rejects(adapter.parentBase(document,context()),/locking or locked/);
 for(const selection of [{result:'unrelated'},{result:'ambiguous',revisions:[id(1),id(2)]}]){const a=new RuntimeAdapter([editor],async()=>({...good,selection})),d=[...a.docs.keys()][0];assert.deepEqual((await a.parentBase(d,context())).selection,selection);}
});
