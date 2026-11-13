import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';
import {auditRequest,auditReport,auditScope,auditMaxBytes} from '../src/runtime-audit.js';
const id=n=>Array(32).fill(n),input={document:id(1),node:id(2),branch:id(3),base:id(4),snapshot:id(5),generation:0,acknowledged_sequence:0,title:'Synthetic original and child',text:'Exact 😀\r\n中\r'};
const report=()=>({document:id(1),scope:auditScope,authenticated_records:8,encrypted_bytes:1234,finding:null});
test('audit freezes document scope independently of branch selection or newer typing and sends no mutation',async()=>{
 let release;const calls=[],adapter=new RuntimeAdapter([input],async(path,body)=>{calls.push({path,body:structuredClone(body)});await new Promise(r=>release=r);return report();});
 const document=[...adapter.docs.keys()][0];adapter.edit(document,'Private pending text');const before=adapter.get(document),pending=adapter.auditDocument(document);adapter.docs.get(document).runtime.branch=id(9);adapter.edit(document,'Newer private text');release();const value=await pending;
 assert.equal(value.finding,null);assert.deepEqual(calls,[{path:'audit/document',body:{document:id(1),max_bytes:auditMaxBytes}}]);assert.equal(adapter.get(document).source,'Newer private text');assert.equal(adapter.get(document).acknowledged,before.acknowledged);assert.equal(adapter.get(document).pending,null);
});
test('audit rejects incomplete success, wrong scope, unknown fields and inconsistent finding counters',()=>{
 const request=auditRequest(id(1));for(const change of [{document:id(99)},{scope:'entire_workspace'},{authenticated_records:7},{encrypted_bytes:auditMaxBytes+1},{source:'unexpected source'},{finding:{record:'catalog',problem:'missing'}},{authenticated_records:3,finding:{record:'draft',problem:'inconsistent'}},{finding:{record:'draft',problem:'inconsistent',repair:'guessed'}}])assert.throws(()=>auditReport({...report(),...change},request));
 for(const finding of [{record:'draft',problem:'missing'},{record:'draft',problem:'budget'},{record:'draft',problem:'unreadable_encrypted_record'},{record:'draft',problem:'unsupported_or_malformed'}])assert.equal(auditReport({...report(),authenticated_records:3,finding},request).finding.problem,finding.problem);
 assert.equal(auditReport({...report(),authenticated_records:4,finding:{record:'draft',problem:'inconsistent'}},request).authenticated_records,4);
 for(const max of [0,-1,1.5,auditMaxBytes+1])assert.throws(()=>auditRequest(id(1),max));
});
test('locking invalidates an outstanding report and locked audit sends no request',async()=>{
 let release,calls=0;const adapter=new RuntimeAdapter([input],async()=>{calls++;await new Promise(r=>release=r);return report();}),document=[...adapter.docs.keys()][0];
 const pending=adapter.auditDocument(document);adapter.lifecycle='locked';release();await assert.rejects(pending,/locking or locked/);await assert.rejects(adapter.auditDocument(document),/locking or locked/);assert.equal(calls,1);
});
