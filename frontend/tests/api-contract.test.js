/**
 * # Hypergraph PX — Api contract contract regression scenarios
 *
 * Checks generated API compatibility and change-sensitive tooling evidence without
 * altering runtime versions, publication authority or acceptance boundaries.
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
 * Used by: Frontend development validation — Node unit-test runner, schema
 * conformance and developer-tooling regression suite.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [development evidence md][spec-3]
 *
 * Boundary: Synthetic schema mutations and transport responses are verification
 * inputs, not adopted format changes. Planning checks never grant deployment,
 * trust enrollment or product-acceptance authority.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/api-contract.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/09-guides/reference/development-evidence.md
 */

import {runtimeRoutes} from '../src/generated/api-routes.js';
import {auditScope,auditMaxBytes} from '../src/generated/api-constraints.js';
import {assertComponent,typedBindings,assertBoundPayload} from '../scripts/assert-api-schema.mjs';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assertCompatible,validateReferences,schemaCacheValid} from '../scripts/generate-contract.mjs';
import {runtimeRequest,forkExecution,bootstrapRequest} from '../src/api-client.ts';

const spec=JSON.parse(await readFile(new URL('../../shared/openapi.json',import.meta.url)));

test('generated contract references resolve; existing fields, constraints and operations cannot silently break',/* Verify schema references resolve and compatibility rejects silent removal or weakening of existing contracts. */ ()=>{
 validateReferences(spec);


 for(const mutate of [/* Remove a required command route. */ s=>delete s.paths['/api/v1/commands'],/* Remove an existing Fork title field. */ s=>delete s.components.schemas.ForkPlan.properties.title,/* Change fixed identity length. */ s=>s.components.schemas.Id.maxItems=33,/* Weaken existing required fields. */ s=>s.components.schemas.ForkPlan.required=[],/* Remove global session security. */ s=>s.security=[],/* Change the session cookie identity. */ s=>s.components.securitySchemes.session.name='other']){const next=structuredClone(spec);

  mutate(next);assert.throws(/* Attempt each independently incompatible contract. */ ()=>assertCompatible(spec,next),/changed/);}


 const added=structuredClone(spec);

 added.paths['/api/v1/future']={post:{}};assert.doesNotThrow(/* Permit a purely additive future route. */ ()=>assertCompatible(spec,added));
 assert.throws(/* Reject an external schema reference. */ ()=>validateReferences({$ref:'https://example.invalid/schema'}),/External/);assert.throws(/* Reject an unresolved local schema reference. */ ()=>validateReferences({$ref:'#/absent'}),/Unresolved/);
});

test('reviewed route-only refinement cannot weaken an existing typed schema, errors or security',/* Verify reviewed route-only refinement cannot weaken typed schemas, errors or security. */ ()=>{
 const previous=structuredClone(spec),path='/api/v1/snapshot',operation=previous.paths[path].post;


 operation['x-hpx-schema-coverage']='route-only';operation.requestBody.content['application/json'].schema={};operation.responses['200'].content['application/json'].schema={};
 assert.throws(/* Reject refinement without explicit reviewed-path permission. */ ()=>assertCompatible(previous,spec),/operation changed/);
 assert.doesNotThrow(/* Accept the exact explicitly reviewed typed refinement. */ ()=>assertCompatible(previous,spec,{reviewedRefinements:[path]}));


 const bad=structuredClone(spec);

 bad.paths[path].post.responses.default.description='Changed error contract';assert.throws(/* Reject changed errors despite reviewed schema refinement. */ ()=>assertCompatible(previous,bad,{reviewedRefinements:[path]}),/error\/security/);


 const typed=structuredClone(spec);

 typed.components.schemas.ForkPlan.properties.title.type='number';assert.throws(/* Reject changed existing component types despite reviewed route refinement. */ ()=>assertCompatible(previous,typed,{reviewedRefinements:[path]}),/schema changed/);
});

test('reviewed GET refinement keeps its body-free method and session security',/* Verify GET refinement retains body-free method and session security. */ ()=>{
 const path='/api/v1/runtime',previous=structuredClone(spec),operation=previous.paths[path].get;


 operation['x-hpx-schema-coverage']='route-only';operation.responses['200'].content['application/json'].schema={};
 assert.throws(/* Reject unreviewed runtime response refinement. */ ()=>assertCompatible(previous,spec),/operation changed/);assert.doesNotThrow(/* Accept the explicitly reviewed GET refinement. */ ()=>assertCompatible(previous,spec,{reviewedRefinements:[path]}));


 for(const mutate of [/* Remove operation security to test preservation. */ o=>o.security=[],/* Introduce a body into the body-free runtime GET. */ o=>o.requestBody={content:{'application/json':{schema:{$ref:'#/components/schemas/SnapshotRequest'}}}}]){const bad=structuredClone(spec);

  mutate(bad.paths[path].get);assert.throws(/* Reject each method/security-boundary change. */ ()=>assertCompatible(previous,bad,{reviewedRefinements:[path]}),/error\/security/);}
});

test('schema cache binds both input identity and the entire schema output',/* Verify schema cache binds both input identity and complete output digest. */ ()=>{
 const record={identity:'expected',spec};

 record.sha256=createHash('sha256').update(JSON.stringify(spec)).digest('hex');assert.equal(schemaCacheValid(record,'expected'),true);assert.equal(schemaCacheValid(record,'other'),false);

 const bad=structuredClone(record);

 bad.spec.openapi='invalid';assert.equal(schemaCacheValid(bad,'expected'),false);
});

test('Bootstrap conformance treats writeOnly as an annotation while preserving strict input and source-free response fields',/* Verify writeOnly remains an annotation while bootstrap shapes stay strict and source-free. */ ()=>{
 assert.doesNotThrow(/* Accept a synthetic string bootstrap token. */ ()=>assertComponent('BootstrapRequest',{token:'SYNTHETIC-only'}));assert.throws(/* Reject a null bootstrap token. */ ()=>assertComponent('BootstrapRequest',{token:null}),/violates/);assert.doesNotThrow(/* Accept the source-free authenticated bootstrap response. */ ()=>assertComponent('BootstrapResponse',{authenticated:true}));assert.throws(/* Reject leaking a bootstrap token into the response. */ ()=>assertComponent('BootstrapResponse',{authenticated:true,token:'unexpected'}),/violates/);
});

test('actual conformance bindings derive only from typed generated operations',/* Verify runtime conformance bindings come only from generated typed operations. */ ()=>{
 assert.ok(typedBindings.some(/* Find the typed bootstrap request binding. */ b=>b.path==='/api/v1/bootstrap'&&b.request==='BootstrapRequest'));assert.ok(typedBindings.some(/* Find body-free typed runtime discovery. */ b=>b.path==='/api/v1/runtime'&&b.request===null&&b.response==='RuntimeResponse'));assert.ok(!typedBindings.some(/* Detect an incorrectly claimed typed legacy-history binding. */ b=>b.path==='/api/v1/history'));assert.doesNotThrow(/* Validate a payload on its actual typed bootstrap route. */ ()=>assertBoundPayload('/api/v1/bootstrap','POST','request',{token:'SYNTHETIC'}));assert.throws(/* Reject request validation where the operation has no typed request binding. */ ()=>assertBoundPayload('/api/v1/documents','POST','request',{}),/No typed/);
});

test('authentication empty-body schema preserves canonical objects and the existing empty-sequence compatibility',/* Verify empty-body compatibility admits only canonical empty object or existing empty-sequence form. */ ()=>{
 for(const value of [{},[]])assert.doesNotThrow(/* Accept each supported empty request representation. */ ()=>assertComponent('EmptyRequest',value));

 for(const value of [null,[{}],{extra:0}])assert.throws(/* Reject nonempty or null authentication bodies. */ ()=>assertComponent('EmptyRequest',value),/violates/);
});

test('keychain acknowledgement schemas contain flags and exclude credential/path fields',/* Verify keychain acknowledgements contain public flags without credential or path disclosure. */ ()=>{
 assert.doesNotThrow(/* Accept source-free enrollment flags. */ ()=>assertBoundPayload('/api/v1/keychain/enroll','POST','response',{backup_created:true,enrolled:true}));assert.doesNotThrow(/* Accept source-free removal flags. */ ()=>assertBoundPayload('/api/v1/keychain/remove','POST','response',{cleanup_pending:false,enrolled:false}));assert.throws(/* Reject unexpected backup-path disclosure. */ ()=>assertBoundPayload('/api/v1/keychain/enroll','POST','response',{backup_created:true,enrolled:true,backup_path:'unexpected'}),/violates/);
});

test('audit constraints and source-free report schema derive from the same contract',/* Verify audit budgets and source-free response scope derive from the same generated contract. */ ()=>{
 assert.equal(auditMaxBytes,spec.components.schemas.AuditRequest.properties.max_bytes.maximum);assert.equal(auditScope,spec.components.schemas.DocumentAuditReport.properties.scope.enum[0]);


 const report={document:Array(32).fill(1),scope:auditScope,authenticated_records:8,encrypted_bytes:2000,finding:null};

 assert.doesNotThrow(/* Validate the bounded public audit report shape. */ ()=>assertBoundPayload('/api/v1/audit/document','POST','response',report));assert.throws(/* Reject a request exceeding the generated audit budget. */ ()=>assertBoundPayload('/api/v1/audit/document','POST','request',{document:Array(32).fill(1),max_bytes:auditMaxBytes+1}),/violates/);
});

test('reviewed ignored-body responses cannot silently introduce request validation',/* Verify reviewed ignored-body refinement cannot silently introduce mandatory request validation. */ ()=>{
 const path='/api/v1/documents',previous=structuredClone(spec),operation=previous.paths[path].post;


 operation['x-hpx-schema-coverage']='route-only';delete operation['x-hpx-request-body'];operation.requestBody.required=true;operation.responses['200'].content['application/json'].schema={};
 assert.throws(/* Reject unreviewed ignored-body response refinement. */ ()=>assertCompatible(previous,spec),/operation changed/);assert.doesNotThrow(/* Accept the explicitly reviewed response refinement preserving ignored-body semantics. */ ()=>assertCompatible(previous,spec,{reviewedRefinements:[path]}));


 for(const mutate of [/* Make an ignored request body required. */ o=>o.requestBody.required=true,/* Replace arbitrary ignored bodies with a typed empty-only schema. */ o=>o.requestBody.content['application/json'].schema={$ref:'#/components/schemas/EmptyRequest'}]){const bad=structuredClone(spec);

  mutate(bad.paths[path].post);assert.throws(/* Reject each weakening of arbitrary optional-body compatibility. */ ()=>assertCompatible(previous,bad,{reviewedRefinements:[path]}),/arbitrary optional bodies/);}


 assert.equal(typedBindings.find(/* Find the operation’s actual response-only typed binding. */ b=>b.path===path).request,null);assert.doesNotThrow(/* Validate exact document response Unicode on the response-only binding. */ ()=>assertBoundPayload(path,'POST','response',[{document:Array(32).fill(1),title:'Exact 😀'}]));
});

test('generated dispatch methods and JSON media types match every inventoried operation',/* Verify dispatch methods and media types cover every inventoried operation. */ ()=>{
 for(const [path,methods] of Object.entries(spec.paths)){const [method,operation]=Object.entries(methods)[0];

  assert.equal(runtimeRoutes[path].method,method.toUpperCase());assert.equal(runtimeRoutes[path].contentType,operation.requestBody?.content?Object.keys(operation.requestBody.content)[0]:undefined);}
});

test('generated client sends frozen Fork, retains JSON bytes and selects problem details without changing legacy request negotiation',/* Verify generated requests preserve exact Fork JSON and negotiation while retaining legacy method/body behaviour. */ async()=>{
 const actualFetch=globalThis.fetch,actualLocation=globalThis.location;

 globalThis.location={origin:'https://127.0.0.1:9999'};

 const calls=[];


 globalThis.fetch=/* Capture actual Request bytes and negotiation metadata without contacting a server. */ async request=>{calls.push({url:request.url,body:await request.text(),method:request.method,credentials:request.credentials,cache:request.cache,accept:request.headers.get('accept'),type:request.headers.get('content-type')});

  return Response.json({received:true});};


 try{
  const id=Array(32).fill(1),plan={title:'Exact 😀',quote:'x\r\ny',expected_draft:null,source:{document:id,node:id,snapshot:id,revision:id,occurrence_path:[id],start_byte:0,end_byte:4}},body=forkExecution(id,plan);

  Object.freeze(body);
  assert.deepEqual(await runtimeRequest('commands',body),{received:true});assert.equal(calls[0].body,JSON.stringify(body));assert.equal(calls[0].accept,'application/problem+json');assert.equal(calls[0].credentials,'same-origin');assert.equal(calls[0].cache,'no-store');assert.equal(calls[0].type,'application/json');
  await runtimeRequest('documents',{});assert.equal(calls[1].accept,null);await runtimeRequest('runtime');assert.equal(calls[2].body,'');await runtimeRequest('bootstrap',bootstrapRequest('SYNTHETIC-token'));assert.equal(calls[3].body,JSON.stringify({token:'SYNTHETIC-token'}));assert.equal(calls[3].accept,null);await runtimeRequest('documents');assert.equal(calls[4].method,'POST');assert.equal(calls[4].body,'');assert.equal(calls[4].type,'application/json');await runtimeRequest('lock');assert.equal(calls[5].method,'POST');assert.equal(calls[2].method,'GET');
 }finally{globalThis.fetch=actualFetch;

  if(actualLocation===undefined)delete globalThis.location;else globalThis.location=actualLocation;}
});

test('generated client retains stable code and HTTP status for legacy and problem errors, and transport uncertainty stays retryable',/* Verify stable HTTP error/status handling while transport uncertainty remains retryable. */ async()=>{
 const actualFetch=globalThis.fetch,actualLocation=globalThis.location;

 globalThis.location={origin:'https://127.0.0.1:9999'};


 try{for(const problem of [false,true]){globalThis.fetch=/* Return a synthetic legacy or problem-details conflict response. */ async()=>Response.json(problem?{type:'about:blank',title:'Conflict',status:409,error:'stale_source'}:{error:'stale_source'},{status:409,headers:{'Content-Type':problem?'application/problem+json':'application/json'}});await assert.rejects(runtimeRequest('commands',{}),/* Require stable public error code and HTTP conflict status. */ e=>e.status===409&&e.message==='stale_source');}


 globalThis.fetch=/* Throw an unclassified transport failure instead of an HTTP response. */ async()=>{throw new TypeError('Lost acknowledgement');};await assert.rejects(runtimeRequest('commands',{}),/* Require transport uncertainty to have no invented HTTP status. */ e=>!e.status&&e.message==='Lost acknowledgement');
 }finally{globalThis.fetch=actualFetch;

  if(actualLocation===undefined)delete globalThis.location;else globalThis.location=actualLocation;}
});
