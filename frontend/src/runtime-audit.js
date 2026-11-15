// SPDX-License-Identifier: AGPL-3.0-only
/**
 * # Hypergraph PX — Bounded original-branch integrity reports
 *
 * Construct a limited integrity read request and validate its exact document
 * scope, authenticated-record count and stopped finding.
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
 * Used by: History, branches and graph inspection through the runtime integrity
 * audit panel.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [recovery md][spec-3]
 *
 * Boundary: An audit covers only the captured document's saved original branch. It
 * performs no repair, proves no full restore guarantee and must not report an
 * incomplete traversal as complete.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/runtime-audit.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/08-assurance/recovery.md
 */

import {auditScope,auditMaxBytes} from './generated/api-constraints.js';

export {auditScope,auditMaxBytes} from './generated/api-constraints.js';

import {auditReadRequest} from './api-client.ts';

const roles=['document','head','draft','manifest','snapshot','revision','publication'];

const problems=['missing','unreadable_encrypted_record','unsupported_or_malformed','inconsistent','budget'];

/** Require an object with exactly the expected report field names. */
const fields=(value,names)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===names.length&&names.every(/* Check that each expected field exists as an own property. */ name=>Object.hasOwn(value,name));

/** Recognize an opaque identity encoded as exactly32 integer bytes. */
const identity=value=>Array.isArray(value)&&value.length===32&&value.every(/* Validate one byte in the audit document identity. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Build an explicitly scoped document integrity request with a supported byte budget. */
export function auditRequest(document,maxBytes=auditMaxBytes){
 if(!identity(document)||!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>auditMaxBytes)throw Error('Invalid integrity check scope or read budget');


 return auditReadRequest([...document],maxBytes);
}

/** Validate an audit report against its captured document/budget and exact success or stopped-scope count. */
export function auditReport(value,request){
 if(!fields(value,['document','scope','authenticated_records','encrypted_bytes','finding'])||!identity(value.document)||!value.document.every(/* Compare report document bytes to the original request identity. */ (n,i)=>n===request.document[i])||value.scope!==auditScope||!Number.isSafeInteger(value.authenticated_records)||value.authenticated_records<1||value.authenticated_records>8||!Number.isSafeInteger(value.encrypted_bytes)||value.encrypted_bytes<1||value.encrypted_bytes>request.max_bytes)throw Error('Invalid integrity check report');


 const finding=value.finding;


 if(finding===null){if(value.authenticated_records!==8)throw Error('Incomplete integrity check reported as complete');}
 else {
  if(!fields(finding,['record','problem'])||!roles.includes(finding.record)||!problems.includes(finding.problem))throw Error('Invalid integrity check finding');


  const expected=roles.indexOf(finding.record)+1+(finding.problem==='inconsistent'?1:0);


  if(value.authenticated_records!==expected)throw Error('Integrity check counts do not match its stopped scope');
 }


 return structuredClone(value);
}
