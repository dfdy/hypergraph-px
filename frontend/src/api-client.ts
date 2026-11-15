/**
 * # Hypergraph PX — Typed same-origin runtime requests
 *
 * Adapts generated API schemas and route metadata into lazy browser requests,
 * keeping request envelopes and response types aligned with the backend.
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
 * Used by: Runtime requests and buffer coordination — runtime adapter and browser
 * command callers.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 *
 * Boundary: Transport typing is not authorisation. The backend enforces access;
 * route-only operations retain unknown results until specifically migrated.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/api-client.ts
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

import {runtimeRoutes} from './generated/api-routes.js';
// SPDX-License-Identifier: AGPL-3.0-only
import createClient from 'openapi-fetch';
import type {paths,components} from './generated/api.d.ts';

type PostPath={ [K in keyof paths]: paths[K] extends {post:unknown}?K:never }[keyof paths];

/** Expose the generated ForkPlan schema to browser runtime callers without duplicating its wire definition. */
export type ForkPlan=components['schemas']['ForkPlan'];

/** Expose the generated ForkExecute schema to browser runtime callers without duplicating its wire definition. */
export type ForkExecute=components['schemas']['ForkExecute'];

/** Expose the generated ForkReceipt schema to browser runtime callers without duplicating its wire definition. */
export type ForkReceipt=components['schemas']['ForkReceipt'];

/** Expose the generated BootstrapRequest schema to browser runtime callers without duplicating its wire definition. */
export type BootstrapRequest=components['schemas']['BootstrapRequest'];

/** Expose the generated BootstrapResponse schema to browser runtime callers without duplicating its wire definition. */
export type BootstrapResponse=components['schemas']['BootstrapResponse'];

/** Wrap the bootstrap token in the generated request shape. */
export function bootstrapRequest(token:BootstrapRequest['token']):BootstrapRequest{return {token};}

/** Expose the generated EmptyRequest schema to browser runtime callers without duplicating its wire definition. */
export type EmptyRequest=components['schemas']['EmptyRequest'];

/** Expose the generated UnlockRequest schema to browser runtime callers without duplicating its wire definition. */
export type UnlockRequest=components['schemas']['UnlockRequest'];

/** Expose the generated LockStateResponse schema to browser runtime callers without duplicating its wire definition. */
export type LockStateResponse=components['schemas']['LockStateResponse'];

/** Expose the generated KeychainEnrollmentResponse schema to browser runtime callers without duplicating its wire definition. */
export type KeychainEnrollmentResponse=components['schemas']['KeychainEnrollmentResponse'];

/** Expose the generated KeychainRemovalResponse schema to browser runtime callers without duplicating its wire definition. */
export type KeychainRemovalResponse=components['schemas']['KeychainRemovalResponse'];

/** Expose the generated KeychainStatusResponse schema to browser runtime callers without duplicating its wire definition. */
export type KeychainStatusResponse=components['schemas']['KeychainStatusResponse'];

/** Construct the explicit empty body required by lifecycle routes. */
export function emptyRequest():EmptyRequest{return {};}

/** Wrap a passphrase for the unlock endpoint without changing it. */
export function unlockRequest(passphrase:UnlockRequest['passphrase']):UnlockRequest{return {passphrase};}

/** Expose the generated DocumentRequest schema to browser runtime callers without duplicating its wire definition. */
export type DocumentRequest=components['schemas']['DocumentRequest'];

/** Expose the generated BranchRequest schema to browser runtime callers without duplicating its wire definition. */
export type BranchRequest=components['schemas']['BranchRequest'];

/** Expose the generated EditorState schema to browser runtime callers without duplicating its wire definition. */
export type EditorState=components['schemas']['EditorState'];

/** Address editor state by the supplied document identity. */
export function documentRequest(document:DocumentRequest['document']):DocumentRequest{return {document};}

/** Address the chosen document branch without confusing it with the active branch. */
export function branchRequest(document:BranchRequest['document'],branch:BranchRequest['branch']):BranchRequest{return {document,branch};}

/** Expose the generated AuditRequest schema to browser runtime callers without duplicating its wire definition. */
export type AuditRequest=components['schemas']['AuditRequest'];

/** Expose the generated DocumentAuditReport schema to browser runtime callers without duplicating its wire definition. */
export type DocumentAuditReport=components['schemas']['DocumentAuditReport'];

/** Bound a read-only document audit using the caller’s byte budget. */
export function auditReadRequest(document:AuditRequest['document'],max_bytes:AuditRequest['max_bytes']):AuditRequest{return {document,max_bytes};}

/** Expose the generated DocumentsResponse schema to browser runtime callers without duplicating its wire definition. */
export type DocumentsResponse=components['schemas']['DocumentsResponse'];

/** Expose the generated RuntimeResponse schema to browser runtime callers without duplicating its wire definition. */
export type RuntimeResponse=components['schemas']['RuntimeResponse'];

/** Expose the generated SnapshotRequest schema to browser runtime callers without duplicating its wire definition. */
export type SnapshotRequest=components['schemas']['SnapshotRequest'];

/** Expose the generated SnapshotResponse schema to browser runtime callers without duplicating its wire definition. */
export type SnapshotResponse=components['schemas']['SnapshotResponse'];

/** Address an exact historical snapshot within its document. */
export function snapshotRequest(document:SnapshotRequest['document'],snapshot:SnapshotRequest['snapshot']):SnapshotRequest{return {document,snapshot};}

/** Wrap a fork plan in its operation identity and command envelope. */
export function forkExecution(operation:ForkExecute['operation'],plan:ForkPlan):ForkExecute{return {operation,request:{command:'fork',plan}};}

// Construct lazily: importing editor models must not access browser globals.
/** Type bootstrap calls as returning bootstrap session state. */
export function runtimeRequest(path:'bootstrap',body:BootstrapRequest):Promise<BootstrapResponse>;

/** Type passphrase unlock calls as returning workspace lock state. */
export function runtimeRequest(path:'unlock',body:UnlockRequest):Promise<LockStateResponse>;

/** Type keychain unlock calls separately from enrollment. */
export function runtimeRequest(path:'unlock/keychain',body:EmptyRequest):Promise<LockStateResponse>;

/** Type keychain status queries without granting enrollment authority. */
export function runtimeRequest(path:'keychain/status',body:EmptyRequest):Promise<KeychainStatusResponse>;

/** Type active-document editor reads against the generated editor schema. */
export function runtimeRequest(path:'editor',body:DocumentRequest):Promise<EditorState>;

/** Type branch editor reads against the same exact editor schema. */
export function runtimeRequest(path:'branches/editor',body:BranchRequest):Promise<EditorState>;

/** Type explicit keychain enrollment responses. */
export function runtimeRequest(path:'keychain/enroll',body:EmptyRequest):Promise<KeychainEnrollmentResponse>;

/** Type explicit keychain removal responses. */
export function runtimeRequest(path:'keychain/remove',body:EmptyRequest):Promise<KeychainRemovalResponse>;

/** Type bounded document audit responses. */
export function runtimeRequest(path:'audit/document',body:AuditRequest):Promise<DocumentAuditReport>;

/** Type document-list responses while retaining the route’s optional body. */
export function runtimeRequest(path:'documents',body?:unknown):Promise<DocumentsResponse>;

/** Type workspace-lock responses. */
export function runtimeRequest(path:'lock',body?:unknown):Promise<LockStateResponse>;

/** Type runtime capability discovery without a request body. */
export function runtimeRequest(path:'runtime'):Promise<RuntimeResponse>;

/** Type exact snapshot responses. */
export function runtimeRequest(path:'snapshot',body:SnapshotRequest):Promise<SnapshotResponse>;

/** Retain an unknown-result escape hatch for routes not yet specifically typed. */
export function runtimeRequest(path:string,body?:unknown):Promise<unknown>;

/** Send same-origin uncached requests using generated routes and surface HTTP status on runtime errors. */
export async function runtimeRequest(path:string,body?:unknown):Promise<unknown>{
 const client=createClient<paths>({baseUrl:globalThis.location.origin,credentials:'same-origin',cache:'no-store',fetch:/* Defer browser fetch lookup until a request is made rather than during model imports. */ (request)=>globalThis.fetch(request)});


 const endpoint=('/api/v1/'+path) as keyof paths;


 const fork=path==='commands'&&(body as ForkExecute|undefined)?.request?.command==='fork';


 const route=(runtimeRoutes as Record<string,{method:string,contentType?:string}>)[endpoint];


 const method=route?.method??(body===undefined?'GET':'POST'),headers:Record<string,string>={};


 if(route?.contentType)headers['Content-Type']=route.contentType;


 if(fork)headers.Accept='application/problem+json';


 const options={body,headers};


 // Route-only operations intentionally remain unknown until their own migration.
 const result=method==='GET'?await client.GET(endpoint as '/api/v1/runtime',{headers}):await client.POST(endpoint as PostPath,options);


 if(!result.response.ok){const value=result.error as {error?:string}|undefined;

  const error=new Error(value?.error||'Runtime request failed') as Error&{status:number};

  error.status=result.response.status;

  throw error;}

 return result.data;
}
