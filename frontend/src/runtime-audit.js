// SPDX-License-Identifier: AGPL-3.0-only
/** A report describes only the captured document's saved original branch. */
import {auditScope,auditMaxBytes} from './generated/api-constraints.js';
export {auditScope,auditMaxBytes} from './generated/api-constraints.js';
import {auditReadRequest} from './api-client.ts';
const roles=['document','head','draft','manifest','snapshot','revision','publication'];
const problems=['missing','unreadable_encrypted_record','unsupported_or_malformed','inconsistent','budget'];
const fields=(value,names)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===names.length&&names.every(name=>Object.hasOwn(value,name));
const identity=value=>Array.isArray(value)&&value.length===32&&value.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
export function auditRequest(document,maxBytes=auditMaxBytes){
 if(!identity(document)||!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>auditMaxBytes)throw Error('Invalid integrity check scope or read budget');
 return auditReadRequest([...document],maxBytes);
}
export function auditReport(value,request){
 if(!fields(value,['document','scope','authenticated_records','encrypted_bytes','finding'])||!identity(value.document)||!value.document.every((n,i)=>n===request.document[i])||value.scope!==auditScope||!Number.isSafeInteger(value.authenticated_records)||value.authenticated_records<1||value.authenticated_records>8||!Number.isSafeInteger(value.encrypted_bytes)||value.encrypted_bytes<1||value.encrypted_bytes>request.max_bytes)throw Error('Invalid integrity check report');
 const finding=value.finding;
 if(finding===null){if(value.authenticated_records!==8)throw Error('Incomplete integrity check reported as complete');}
 else {
  if(!fields(finding,['record','problem'])||!roles.includes(finding.record)||!problems.includes(finding.problem))throw Error('Invalid integrity check finding');
  const expected=roles.indexOf(finding.record)+1+(finding.problem==='inconsistent'?1:0);
  if(value.authenticated_records!==expected)throw Error('Integrity check counts do not match its stopped scope');
 }
 return structuredClone(value);
}
