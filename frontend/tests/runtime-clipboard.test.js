import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeClipboard} from '../src/runtime-clipboard.js';
import {ownedRange,editorProjection} from '../src/owned-source.js';
const id=n=>Array(32).fill(n);
const source={document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence_path:[id(5)],start_byte:0,end_byte:4};
const entry=n=>({id:id(n),available:true,source:structuredClone(source),preview:'😀'});
const capture={action:'capture',generation:0,source,expected_draft:null,quote:'😀'};
const page=(generation,entries,total=entries.length,next=null)=>({generation,total,entries,next});
const ack=(body,state={generation:1,entry:id(9),count:1})=>({operation:body.operation,outcome:{result:'clipboard',state}});
test('lost clipboard replies retain exact immutable request and reconcile without a new operation',async()=>{
 let lost=true,operations=0;const requests=[];
 const c=new RuntimeClipboard(async(path,body)=>{
  if(path==='clipboard')return page(1,[entry(9)]);
  requests.push(body);assert.ok(Object.isFrozen(body.request.mutation.source.revision));if(lost)throw Error('lost reply');return ack(body);
 },()=>id(++operations));
 await assert.rejects(c.mutate(capture),/lost reply/);assert.ok(c.pending);lost=false;await c.retry();
 assert.equal(operations,1);assert.equal(requests.length,3);assert.deepEqual(requests[0],requests[2]);assert.equal(c.pending,null);assert.equal(c.entries.length,1);assert.equal(c.generation,1);
});
test('wrong receipt identity or state never acknowledges or replaces pending intent',async()=>{
 for(const alter of [r=>r.operation=id(7),r=>r.outcome.state.generation=2,r=>r.outcome.state.count=2,r=>r.outcome.state.entry=[1],r=>r.outcome.result='saved']){
  const c=new RuntimeClipboard(async(_path,body)=>{const r=ack(body);alter(r);return r;},()=>id(8));
  await assert.rejects(c.mutate(capture),/Invalid private clipboard/);assert.ok(c.pending);assert.equal(c.generation,0);assert.deepEqual(c.entries,[]);
 }
});
test('known precondition failure releases failed intent for explicit refresh and retry',async()=>{
 const c=new RuntimeClipboard(async path=>{if(path==='clipboard')return page(2,[]);throw Object.assign(Error('conflict'),{status:409});},()=>id(8));
 await assert.rejects(c.mutate(capture),/conflict/);assert.equal(c.pending,null);await c.load();assert.equal(c.generation,2);
 await assert.rejects(c.mutate(capture),/Clipboard changed/);assert.equal(c.pending,null);
});
test('malformed and unauthorized source previews cannot enter the private clipboard view',async()=>{
 for(const alter of [p=>p.entries[0].id=[1],p=>p.entries[0].source.occurrence_path=[],p=>p.entries[0].available=false,p=>p.entries[0].preview='x'.repeat(121),p=>p.next=1,p=>p.total=0,p=>p.entries.push(structuredClone(p.entries[0]))]){
  const p=page(1,[entry(9)]);alter(p);const c=new RuntimeClipboard(async()=>p,()=>id(8));
  await assert.rejects(c.load(),/private clipboard/);assert.deepEqual(c.entries,[]);
 }
 const c=new RuntimeClipboard(async()=>page(1,[{id:id(9),available:false,source:null,preview:null}]),()=>id(8));await c.load();assert.equal(c.entries[0].preview,null);
});
test('a late older clipboard read cannot overwrite a newer generation',async()=>{
 const waiting=[];const c=new RuntimeClipboard(()=>new Promise(resolve=>waiting.push(resolve)),()=>id(8));
 const old=c.load(),current=c.load();waiting[1](page(2,[entry(10)]));await current;waiting[0](page(1,[entry(9)]));assert.equal(await old,false);assert.equal(c.generation,2);assert.deepEqual(c.entries[0].id,id(10));
});
test('private pagination retains exact generation and rejects duplicate identities',async()=>{
 const all=Array.from({length:20},(_,i)=>({...entry(i+10),source:{...source,start_byte:i,end_byte:i+1},preview:'x'}));
 const calls=[];const c=new RuntimeClipboard(async(_path,body)=>{calls.push(body);return body.offset===0?page(20,all.slice(0,16),20,16):page(20,all.slice(16),20);},()=>id(8));
 await c.load();await c.load(true);assert.equal(c.entries.length,20);assert.deepEqual(calls[1],{generation:20,offset:16,limit:16});assert.equal(c.next,null);
});
test('source display coordinates map to exact UTF-8 capture without newline normalization',()=>{
 const source='A😀\r\n中e\u0301\rtail\n',range=ownedRange(source,editorProjection(source),1,5),encoder=new TextEncoder();
 assert.deepEqual(range,{from:1,to:6,text:'😀\r\n中'});assert.equal(encoder.encode(source.slice(0,range.from)).length,1);assert.equal(encoder.encode(source.slice(0,range.to)).length,10);
 assert.throws(()=>ownedRange(source,editorProjection(source),2,3),/Invalid owned-source range/);
});
