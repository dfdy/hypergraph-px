import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAssertions} from '../src/runtime-assertions.js';
const id=n=>Array(32).fill(n),source=(start=0,end=1)=>({document:id(1),node:id(2),snapshot:id(3),revision:id(4),occurrence_path:[id(5)],start_byte:start,end_byte:end});
const properties={negated:false,certainty:'unspecified',attribution:'',scope:''};
const mutation=()=>({action:'create',predicate:{kind:'registered',choice:'preview:logical-argumentative:is_equivalent_to'},participants:[{role:'source',source:source(),expected_draft:{generation:0,sequence:0},quote:'A'},{role:'target',source:source(1,2),expected_draft:{generation:0,sequence:0},quote:'B'}],properties:structuredClone(properties)});
const entry=()=>({revision:id(22),generation:0,record:{node:id(20),parent:null,definition:id(30),participants:[{role:'source',source:source()},{role:'target',source:source(1,2)}],properties:structuredClone(properties),status:'proposed',proposer:id(40),actor:id(40),device:id(41),operation:id(42)},definition:{version:id(50),definition:{predicate_id:'preview:logical-argumentative:is_equivalent_to',registry_version:1,label:'is equivalent to',description:'Same contextual logical content.',roles:[{id:'source',label:'Source'},{id:'target',label:'Target'}],participant_mode:'binary',context_fields:['interpretation and premises'],symmetric:true,family:null}}});
test('unknown assertion replies retain byte-identical operation/inputs and do not reset a deduplicated review',async()=>{
 const calls=[];let drop=2;const a=new RuntimeAssertions(async(path,body)=>{calls.push(structuredClone(body));if(drop-->0)throw Error('Lost reply');return {operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(21),generation:3,status:'accepted',deduplicated:true}}};},()=>id(70));
 const m=mutation(),pending=a.mutate(m);m.properties.scope='Later mutable caller value';await assert.rejects(pending,/Lost reply/);assert.ok(a.pending);const state=await a.retry();assert.equal(state.status,'accepted');assert.equal(state.generation,3);assert.deepEqual(calls[0],calls[1]);assert.deepEqual(calls[0],calls[2]);assert.equal(calls[0].request.mutation.properties.scope,'');assert.equal(a.pending,null);
});
test('mismatched review acknowledgement keeps its original intent until the exact next revision arrives',async()=>{
 let correct=false;const a=new RuntimeAssertions(async(path,body)=>({operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(23),generation:correct?1:2,status:'accepted',deduplicated:false}}}),()=>id(70));
 await assert.rejects(a.mutate({action:'review',node:id(20),revision:id(22),generation:0,status:'accepted'}),/Mismatched/);assert.ok(a.pending);correct=true;await a.retry();assert.equal(a.pending,null);
});
test('known precondition rejection releases failed assertion intent without clearing another operation implicitly',async()=>{
 const a=new RuntimeAssertions(async()=>{throw Object.assign(Error('conflict'),{status:409});},()=>id(70));await assert.rejects(a.mutate(mutation()),/conflict/);assert.equal(a.pending,null);
});
test('retrospective pages bind text snapshot, role-labelled incidence and explicit excluded scope',async()=>{
 const page={document:id(1),snapshot:id(3),text_snapshot_scope:'semantic_assertions_excluded',generation:1,total:1,entries:[entry()],next:null};let body;const a=new RuntimeAssertions(async(path,input)=>{body=input;return page;},()=>id(70));const result=await a.page(id(1),id(3));assert.equal(result.entries[0].record.status,'proposed');assert.equal(body.generation,null);result.entries[0].record.status='accepted';assert.equal(page.entries[0].record.status,'proposed');
 for(const alter of [p=>p.snapshot=id(9),p=>p.text_snapshot_scope='included',p=>p.entries[0].record.participants[0].role='unknown',p=>p.entries[0].record.participants[0].source.end_byte=-1,p=>p.entries[0].record.node=id(2)]){const invalid=structuredClone(page);alter(invalid);const b=new RuntimeAssertions(async()=>invalid,()=>id(70));await assert.rejects(b.page(id(1),id(3)),/Invalid/);}
});
test('stale page generations and duplicate node identities fail instead of merging incompatible views',async()=>{
 const page={document:id(1),snapshot:id(3),text_snapshot_scope:'semantic_assertions_excluded',generation:2,total:2,entries:[entry(),entry()],next:null};const a=new RuntimeAssertions(async()=>page,()=>id(70));await assert.rejects(a.page(id(1),id(3),1),/Invalid/);await assert.rejects(a.page(id(1),id(3)),/Duplicate/);
});
test('adapter freezes committed participant capture while preserving newer typing',async()=>{
 const {RuntimeAdapter}=await import('../src/runtime-adapter.js');let release,started;const wait=new Promise(r=>{release=r;}),began=new Promise(r=>{started=r;}),calls=[];
 const editor={document:id(1),node:id(2),snapshot:id(3),base:id(4),occurrence:id(5),title:'Source',text:'AB',generation:0,acknowledged_sequence:0};
 const a=new RuntimeAdapter([editor],async(path,body)=>{calls.push({path,body:structuredClone(body)});if(path==='snapshot'){started();await wait;return {text:'AB'};}return {operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(21),generation:0,status:'proposed',deduplicated:false}}};});const first=[...a.docs.keys()][0],inputs=[{role:'source',start_byte:0,end_byte:1,quote:'A'},{role:'target',start_byte:1,end_byte:2,quote:'B'}],fields={predicateId:'preview:logical-argumentative:is_equivalent_to',properties:structuredClone(properties)};
 const creating=a.createAssertion(first,inputs,fields);await began;inputs[0].quote='X';fields.properties.scope='Later';a.edit(first,'Newer typing');release();await creating;assert.equal(a.get(first).source,'Newer typing');assert.equal(a.get(first).acknowledged,0);assert.equal(calls[1].body.request.mutation.participants[0].quote,'A');assert.equal(calls[1].body.request.mutation.properties.scope,'');
});
test('adapter lock reconciles an uncertain assertion before dropping authority',async()=>{
 const {RuntimeAdapter}=await import('../src/runtime-adapter.js');let drop=2;const calls=[];
 const editor={document:id(1),node:id(2),snapshot:id(3),base:id(4),occurrence:id(5),title:'Source',text:'AB',generation:0,acknowledged_sequence:0};
 const a=new RuntimeAdapter([editor],async(path,body)=>{calls.push({path,body:structuredClone(body)});if(path==='snapshot')return {text:'AB'};if(path==='lock')return {locked:true};if(drop-->0)throw Error('Lost reply');return {operation:body.operation,outcome:{result:'assertion',state:{node:id(20),revision:id(21),generation:0,status:'proposed',deduplicated:false}}};});const first=[...a.docs.keys()][0];await assert.rejects(a.createAssertion(first,[{role:'source',start_byte:0,end_byte:1,quote:'A'},{role:'target',start_byte:1,end_byte:2,quote:'B'}],{predicateId:'preview:logical-argumentative:is_equivalent_to',properties}),/Lost reply/);await a.lock();assert.equal(a.lifecycle,'locked');assert.equal(a.assertions.pending,null);assert.equal(calls.at(-1).path,'lock');const requests=calls.filter(c=>c.path==='commands');assert.equal(requests.length,3);assert.deepEqual(requests[0],requests[1]);assert.deepEqual(requests[0],requests[2]);
});
test('exact assertion history rejects a current-head substitution or a different assertion identity',async()=>{
 const historical=entry(),envelope={text_snapshot_scope:'semantic_assertions_excluded',entry:historical};const a=new RuntimeAssertions(async()=>envelope,()=>id(70));const old=await a.revision(id(20),id(22));assert.equal(old.record.status,'proposed');old.record.status='accepted';assert.equal(historical.record.status,'proposed');
 for(const change of [e=>e.entry.revision=id(99),e=>e.entry.record.node=id(98),e=>e.text_snapshot_scope='included']){const invalid=structuredClone(envelope);change(invalid);const b=new RuntimeAssertions(async()=>invalid,()=>id(70));await assert.rejects(b.revision(id(20),id(22)),/Invalid exact assertion/);}
});
