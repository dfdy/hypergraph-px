import {runtimeRoutes} from './generated/api-routes.js';
// SPDX-License-Identifier: AGPL-3.0-only
import createClient from 'openapi-fetch';
import type {paths,components} from './generated/api.d.ts';
type PostPath={ [K in keyof paths]: paths[K] extends {post:unknown}?K:never }[keyof paths];
export type ForkPlan=components['schemas']['ForkPlan'];
export type ForkExecute=components['schemas']['ForkExecute'];
export type ForkReceipt=components['schemas']['ForkReceipt'];
export type BootstrapRequest=components['schemas']['BootstrapRequest'];
export type BootstrapResponse=components['schemas']['BootstrapResponse'];
export function bootstrapRequest(token:BootstrapRequest['token']):BootstrapRequest{return {token};}
export type EmptyRequest=components['schemas']['EmptyRequest'];
export type UnlockRequest=components['schemas']['UnlockRequest'];
export type LockStateResponse=components['schemas']['LockStateResponse'];
export type KeychainEnrollmentResponse=components['schemas']['KeychainEnrollmentResponse'];
export type KeychainRemovalResponse=components['schemas']['KeychainRemovalResponse'];
export type KeychainStatusResponse=components['schemas']['KeychainStatusResponse'];
export function emptyRequest():EmptyRequest{return {};}
export function unlockRequest(passphrase:UnlockRequest['passphrase']):UnlockRequest{return {passphrase};}
export type DocumentRequest=components['schemas']['DocumentRequest'];
export type BranchRequest=components['schemas']['BranchRequest'];
export type EditorState=components['schemas']['EditorState'];
export function documentRequest(document:DocumentRequest['document']):DocumentRequest{return {document};}
export function branchRequest(document:BranchRequest['document'],branch:BranchRequest['branch']):BranchRequest{return {document,branch};}
export type AuditRequest=components['schemas']['AuditRequest'];
export type DocumentAuditReport=components['schemas']['DocumentAuditReport'];
export function auditReadRequest(document:AuditRequest['document'],max_bytes:AuditRequest['max_bytes']):AuditRequest{return {document,max_bytes};}
export type DocumentsResponse=components['schemas']['DocumentsResponse'];
export type RuntimeResponse=components['schemas']['RuntimeResponse'];
export type SnapshotRequest=components['schemas']['SnapshotRequest'];
export type SnapshotResponse=components['schemas']['SnapshotResponse'];
export function snapshotRequest(document:SnapshotRequest['document'],snapshot:SnapshotRequest['snapshot']):SnapshotRequest{return {document,snapshot};}
export function forkExecution(operation:ForkExecute['operation'],plan:ForkPlan):ForkExecute{return {operation,request:{command:'fork',plan}};}
// Construct lazily: importing editor models must not access browser globals.
export function runtimeRequest(path:'bootstrap',body:BootstrapRequest):Promise<BootstrapResponse>;
export function runtimeRequest(path:'unlock',body:UnlockRequest):Promise<LockStateResponse>;
export function runtimeRequest(path:'unlock/keychain',body:EmptyRequest):Promise<LockStateResponse>;
export function runtimeRequest(path:'keychain/status',body:EmptyRequest):Promise<KeychainStatusResponse>;
export function runtimeRequest(path:'editor',body:DocumentRequest):Promise<EditorState>;
export function runtimeRequest(path:'branches/editor',body:BranchRequest):Promise<EditorState>;
export function runtimeRequest(path:'keychain/enroll',body:EmptyRequest):Promise<KeychainEnrollmentResponse>;
export function runtimeRequest(path:'keychain/remove',body:EmptyRequest):Promise<KeychainRemovalResponse>;
export function runtimeRequest(path:'audit/document',body:AuditRequest):Promise<DocumentAuditReport>;
export function runtimeRequest(path:'documents',body?:unknown):Promise<DocumentsResponse>;
export function runtimeRequest(path:'lock',body?:unknown):Promise<LockStateResponse>;
export function runtimeRequest(path:'runtime'):Promise<RuntimeResponse>;
export function runtimeRequest(path:'snapshot',body:SnapshotRequest):Promise<SnapshotResponse>;
export function runtimeRequest(path:string,body?:unknown):Promise<unknown>;
export async function runtimeRequest(path:string,body?:unknown):Promise<unknown>{
 const client=createClient<paths>({baseUrl:globalThis.location.origin,credentials:'same-origin',cache:'no-store',fetch:(request)=>globalThis.fetch(request)});
 const endpoint=('/api/v1/'+path) as keyof paths;
 const fork=path==='commands'&&(body as ForkExecute|undefined)?.request?.command==='fork';
 const route=(runtimeRoutes as Record<string,{method:string,contentType?:string}>)[endpoint];
 const method=route?.method??(body===undefined?'GET':'POST'),headers:Record<string,string>={};
 if(route?.contentType)headers['Content-Type']=route.contentType;
 if(fork)headers.Accept='application/problem+json';
 const options={body,headers};
 // Route-only operations intentionally remain unknown until their own migration.
 const result=method==='GET'?await client.GET(endpoint as '/api/v1/runtime',{headers}):await client.POST(endpoint as PostPath,options);
 if(!result.response.ok){const value=result.error as {error?:string}|undefined;const error=new Error(value?.error||'Runtime request failed') as Error&{status:number};error.status=result.response.status;throw error;}return result.data;
}
