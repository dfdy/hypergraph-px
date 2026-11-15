/**
 * # Hypergraph PX — Runtime audit runtime regression scenarios
 *
 * Checks bounded runtime audit responses and exact-source invariants using
 * explicit synthetic runtime fixtures.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root/frontend_comments.
 * Latest editing harness: Codex; version/build: unknown.
 * Latest editing model: OpenAI; exact model identifier/revision: unknown.
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Frontend development validation — Node unit-test runner and regression
 * suite.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Transport fixtures establish isolated validation and retry behaviour,
 * not real-data acceptance, authenticated provenance or whole-application proof.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/runtime-audit.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeAdapter} from '../src/runtime-adapter.js';
import {auditRequest,auditReport,auditScope,auditMaxBytes} from '../src/runtime-audit.js';

const id=/* Allocate deterministic document-audit fixture identities. */ n=>Array(32).fill(n),input={document:id(1),node:id(2),branch:id(3),base:id(4),snapshot:id(5),generation:0,acknowledged_sequence:0,title:'Synthetic original and child',text:'Exact 😀\r\n中\r'};

/** Build a complete bounded successful audit result without exposing plaintext. */
const report=()=>({document:id(1),scope:auditScope,authenticated_records:8,encrypted_bytes:1234,finding:null});

test('audit freezes document scope independently of branch selection or newer typing and sends no mutation',/* Verify an audit pins its document independently of branch switching and newer unacknowledged typing. */ async()=>{
 let release;

 const calls=[],adapter=new RuntimeAdapter([input],/* Capture the read-only audit request and delay its synthetic response. */ async(path,body)=>{calls.push({path,body:structuredClone(body)});await new Promise(/* Expose a release gate for mutating local state during the request. */ r=>release=r);

  return report();});


 const document=[...adapter.docs.keys()][0];

 adapter.edit(document,'Private pending text');

 const before=adapter.get(document),pending=adapter.auditDocument(document);

 adapter.docs.get(document).runtime.branch=id(9);adapter.edit(document,'Newer private text');release();

 const value=await pending;


 assert.equal(value.finding,null);assert.deepEqual(calls,[{path:'audit/document',body:{document:id(1),max_bytes:auditMaxBytes}}]);assert.equal(adapter.get(document).source,'Newer private text');assert.equal(adapter.get(document).acknowledged,before.acknowledged);assert.equal(adapter.get(document).pending,null);
});

test('audit rejects incomplete success, wrong scope, unknown fields and inconsistent finding counters',/* Verify malformed scope, fields, counters and findings are rejected while supported partial findings remain explicit. */ ()=>{
 const request=auditRequest(id(1));

 for(const change of [{document:id(99)},{scope:'entire_workspace'},{authenticated_records:7},{encrypted_bytes:auditMaxBytes+1},{source:'unexpected source'},{finding:{record:'catalog',problem:'missing'}},{authenticated_records:3,finding:{record:'draft',problem:'inconsistent'}},{finding:{record:'draft',problem:'inconsistent',repair:'guessed'}}])assert.throws(/* Attempt each independently malformed audit report. */ ()=>auditReport({...report(),...change},request));


 for(const finding of [{record:'draft',problem:'missing'},{record:'draft',problem:'budget'},{record:'draft',problem:'unreadable_encrypted_record'},{record:'draft',problem:'unsupported_or_malformed'}])assert.equal(auditReport({...report(),authenticated_records:3,finding},request).finding.problem,finding.problem);


 assert.equal(auditReport({...report(),authenticated_records:4,finding:{record:'draft',problem:'inconsistent'}},request).authenticated_records,4);


 for(const max of [0,-1,1.5,auditMaxBytes+1])assert.throws(/* Reject invalid audit byte budgets before a request is sent. */ ()=>auditRequest(id(1),max));
});

test('locking invalidates an outstanding report and locked audit sends no request',/* Verify locking invalidates an outstanding audit and blocks new audit requests. */ async()=>{
 let release,calls=0;

 const adapter=new RuntimeAdapter([input],/* Count requests and delay the sole in-flight report. */ async()=>{calls++;await new Promise(/* Expose the delayed report’s release gate. */ r=>release=r);

  return report();}),document=[...adapter.docs.keys()][0];


 const pending=adapter.auditDocument(document);

 adapter.lifecycle='locked';release();await assert.rejects(pending,/locking or locked/);await assert.rejects(adapter.auditDocument(document),/locking or locked/);assert.equal(calls,1);
});
