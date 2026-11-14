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
test('generated contract references resolve; existing fields, constraints and operations cannot silently break',()=>{
 validateReferences(spec);
 for(const mutate of [s=>delete s.paths['/api/v1/commands'],s=>delete s.components.schemas.ForkPlan.properties.title,s=>s.components.schemas.Id.maxItems=33,s=>s.components.schemas.ForkPlan.required=[],s=>s.security=[],s=>s.components.securitySchemes.session.name='other']){const next=structuredClone(spec);mutate(next);assert.throws(()=>assertCompatible(spec,next),/changed/);}
 const added=structuredClone(spec);added.paths['/api/v1/future']={post:{}};assert.doesNotThrow(()=>assertCompatible(spec,added));
 assert.throws(()=>validateReferences({$ref:'https://example.invalid/schema'}),/External/);assert.throws(()=>validateReferences({$ref:'#/absent'}),/Unresolved/);
});
test('reviewed route-only refinement cannot weaken an existing typed schema, errors or security',()=>{
 const previous=structuredClone(spec),path='/api/v1/snapshot',operation=previous.paths[path].post;
 operation['x-hpx-schema-coverage']='route-only';operation.requestBody.content['application/json'].schema={};operation.responses['200'].content['application/json'].schema={};
 assert.throws(()=>assertCompatible(previous,spec),/operation changed/);
 assert.doesNotThrow(()=>assertCompatible(previous,spec,{reviewedRefinements:[path]}));
 const bad=structuredClone(spec);bad.paths[path].post.responses.default.description='Changed error contract';assert.throws(()=>assertCompatible(previous,bad,{reviewedRefinements:[path]}),/error\/security/);
 const typed=structuredClone(spec);typed.components.schemas.ForkPlan.properties.title.type='number';assert.throws(()=>assertCompatible(previous,typed,{reviewedRefinements:[path]}),/schema changed/);
});
test('reviewed GET refinement keeps its body-free method and session security',()=>{
 const path='/api/v1/runtime',previous=structuredClone(spec),operation=previous.paths[path].get;
 operation['x-hpx-schema-coverage']='route-only';operation.responses['200'].content['application/json'].schema={};
 assert.throws(()=>assertCompatible(previous,spec),/operation changed/);assert.doesNotThrow(()=>assertCompatible(previous,spec,{reviewedRefinements:[path]}));
 for(const mutate of [o=>o.security=[],o=>o.requestBody={content:{'application/json':{schema:{$ref:'#/components/schemas/SnapshotRequest'}}}}]){const bad=structuredClone(spec);mutate(bad.paths[path].get);assert.throws(()=>assertCompatible(previous,bad,{reviewedRefinements:[path]}),/error\/security/);}
});
test('schema cache binds both input identity and the entire schema output',()=>{
 const record={identity:'expected',spec};record.sha256=createHash('sha256').update(JSON.stringify(spec)).digest('hex');assert.equal(schemaCacheValid(record,'expected'),true);assert.equal(schemaCacheValid(record,'other'),false);const bad=structuredClone(record);bad.spec.openapi='invalid';assert.equal(schemaCacheValid(bad,'expected'),false);
});
test('Bootstrap conformance treats writeOnly as an annotation while preserving strict input and source-free response fields',()=>{
 assert.doesNotThrow(()=>assertComponent('BootstrapRequest',{token:'SYNTHETIC-only'}));assert.throws(()=>assertComponent('BootstrapRequest',{token:null}),/violates/);assert.doesNotThrow(()=>assertComponent('BootstrapResponse',{authenticated:true}));assert.throws(()=>assertComponent('BootstrapResponse',{authenticated:true,token:'unexpected'}),/violates/);
});
test('actual conformance bindings derive only from typed generated operations',()=>{
 assert.ok(typedBindings.some(b=>b.path==='/api/v1/bootstrap'&&b.request==='BootstrapRequest'));assert.ok(typedBindings.some(b=>b.path==='/api/v1/runtime'&&b.request===null&&b.response==='RuntimeResponse'));assert.ok(!typedBindings.some(b=>b.path==='/api/v1/history'));assert.doesNotThrow(()=>assertBoundPayload('/api/v1/bootstrap','POST','request',{token:'SYNTHETIC'}));assert.throws(()=>assertBoundPayload('/api/v1/documents','POST','request',{}),/No typed/);
});
test('authentication empty-body schema preserves canonical objects and the existing empty-sequence compatibility',()=>{
 for(const value of [{},[]])assert.doesNotThrow(()=>assertComponent('EmptyRequest',value));for(const value of [null,[{}],{extra:0}])assert.throws(()=>assertComponent('EmptyRequest',value),/violates/);
});
test('keychain acknowledgement schemas contain flags and exclude credential/path fields',()=>{
 assert.doesNotThrow(()=>assertBoundPayload('/api/v1/keychain/enroll','POST','response',{backup_created:true,enrolled:true}));assert.doesNotThrow(()=>assertBoundPayload('/api/v1/keychain/remove','POST','response',{cleanup_pending:false,enrolled:false}));assert.throws(()=>assertBoundPayload('/api/v1/keychain/enroll','POST','response',{backup_created:true,enrolled:true,backup_path:'unexpected'}),/violates/);
});
test('audit constraints and source-free report schema derive from the same contract',()=>{
 assert.equal(auditMaxBytes,spec.components.schemas.AuditRequest.properties.max_bytes.maximum);assert.equal(auditScope,spec.components.schemas.DocumentAuditReport.properties.scope.enum[0]);
 const report={document:Array(32).fill(1),scope:auditScope,authenticated_records:8,encrypted_bytes:2000,finding:null};assert.doesNotThrow(()=>assertBoundPayload('/api/v1/audit/document','POST','response',report));assert.throws(()=>assertBoundPayload('/api/v1/audit/document','POST','request',{document:Array(32).fill(1),max_bytes:auditMaxBytes+1}),/violates/);
});
test('reviewed ignored-body responses cannot silently introduce request validation',()=>{
 const path='/api/v1/documents',previous=structuredClone(spec),operation=previous.paths[path].post;
 operation['x-hpx-schema-coverage']='route-only';delete operation['x-hpx-request-body'];operation.requestBody.required=true;operation.responses['200'].content['application/json'].schema={};
 assert.throws(()=>assertCompatible(previous,spec),/operation changed/);assert.doesNotThrow(()=>assertCompatible(previous,spec,{reviewedRefinements:[path]}));
 for(const mutate of [o=>o.requestBody.required=true,o=>o.requestBody.content['application/json'].schema={$ref:'#/components/schemas/EmptyRequest'}]){const bad=structuredClone(spec);mutate(bad.paths[path].post);assert.throws(()=>assertCompatible(previous,bad,{reviewedRefinements:[path]}),/arbitrary optional bodies/);}
 assert.equal(typedBindings.find(b=>b.path===path).request,null);assert.doesNotThrow(()=>assertBoundPayload(path,'POST','response',[{document:Array(32).fill(1),title:'Exact 😀'}]));
});
test('generated dispatch methods and JSON media types match every inventoried operation',()=>{
 for(const [path,methods] of Object.entries(spec.paths)){const [method,operation]=Object.entries(methods)[0];assert.equal(runtimeRoutes[path].method,method.toUpperCase());assert.equal(runtimeRoutes[path].contentType,operation.requestBody?.content?Object.keys(operation.requestBody.content)[0]:undefined);}
});
test('generated client sends frozen Fork, retains JSON bytes and selects problem details without changing legacy request negotiation',async()=>{
 const actualFetch=globalThis.fetch,actualLocation=globalThis.location;globalThis.location={origin:'https://127.0.0.1:9999'};const calls=[];
 globalThis.fetch=async request=>{calls.push({url:request.url,body:await request.text(),method:request.method,credentials:request.credentials,cache:request.cache,accept:request.headers.get('accept'),type:request.headers.get('content-type')});return Response.json({received:true});};
 try{
  const id=Array(32).fill(1),plan={title:'Exact 😀',quote:'x\r\ny',expected_draft:null,source:{document:id,node:id,snapshot:id,revision:id,occurrence_path:[id],start_byte:0,end_byte:4}},body=forkExecution(id,plan);Object.freeze(body);
  assert.deepEqual(await runtimeRequest('commands',body),{received:true});assert.equal(calls[0].body,JSON.stringify(body));assert.equal(calls[0].accept,'application/problem+json');assert.equal(calls[0].credentials,'same-origin');assert.equal(calls[0].cache,'no-store');assert.equal(calls[0].type,'application/json');
  await runtimeRequest('documents',{});assert.equal(calls[1].accept,null);await runtimeRequest('runtime');assert.equal(calls[2].body,'');await runtimeRequest('bootstrap',bootstrapRequest('SYNTHETIC-token'));assert.equal(calls[3].body,JSON.stringify({token:'SYNTHETIC-token'}));assert.equal(calls[3].accept,null);await runtimeRequest('documents');assert.equal(calls[4].method,'POST');assert.equal(calls[4].body,'');assert.equal(calls[4].type,'application/json');await runtimeRequest('lock');assert.equal(calls[5].method,'POST');assert.equal(calls[2].method,'GET');
 }finally{globalThis.fetch=actualFetch;if(actualLocation===undefined)delete globalThis.location;else globalThis.location=actualLocation;}
});
test('generated client retains stable code and HTTP status for legacy and problem errors, and transport uncertainty stays retryable',async()=>{
 const actualFetch=globalThis.fetch,actualLocation=globalThis.location;globalThis.location={origin:'https://127.0.0.1:9999'};
 try{for(const problem of [false,true]){globalThis.fetch=async()=>Response.json(problem?{type:'about:blank',title:'Conflict',status:409,error:'stale_source'}:{error:'stale_source'},{status:409,headers:{'Content-Type':problem?'application/problem+json':'application/json'}});await assert.rejects(runtimeRequest('commands',{}),e=>e.status===409&&e.message==='stale_source');}
 globalThis.fetch=async()=>{throw new TypeError('Lost acknowledgement');};await assert.rejects(runtimeRequest('commands',{}),e=>!e.status&&e.message==='Lost acknowledgement');
 }finally{globalThis.fetch=actualFetch;if(actualLocation===undefined)delete globalThis.location;else globalThis.location=actualLocation;}
});
