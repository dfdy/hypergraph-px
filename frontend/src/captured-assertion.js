/**
 * # Hypergraph PX — Captured immutable assertion intent
 *
 * Build a reviewed assertion command from explicit immutable participant
 * references, exact quotes and claim properties.
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
 * Used by: Annotation and provenance operations, through the assertion composer.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Assertions and predicate semantics][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: This validates browser intent only. Backend source authentication,
 * workspace permissions and publication remain authoritative.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/captured-assertion.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

import {validAssertionSource} from './runtime-assertions.js';
import {assertionProperties} from './assertion-properties.js';

/** Count UTF8 bytes for wire-size and exact source-range comparisons. */
const bytes=value=>new TextEncoder().encode(value).length;

/** Validate and freeze a declared claim with bounded exact participants rather than reading mutable editor offsets. */
export function capturedAssertion({label,description,participants,properties}){
 if(typeof label!=='string'||!label.isWellFormed()||!label.trim()||[...label.trim()].length>80||typeof description!=='string'||!description.isWellFormed()||!description.trim()||bytes(description.trim())>8192)throw Error('Enter a claim name and description');


 if(!Array.isArray(participants)||participants.length<2||participants.length>8)throw Error('Choose between 2 and 8 participants');


 let total=0;

 const roles=new Map(),inputs=participants.map(/* Validate one role/source/quote binding and copy it into the immutable assertion intent. */ p=>{
  if(typeof p.role!=='string'||!p.role.isWellFormed()||!p.role.trim()||bytes(p.role.trim())>64)throw Error('Enter a role for every participant (up to 64 bytes)');


  if(!validAssertionSource(p.source)||typeof p.quote!=='string'||!p.quote.isWellFormed()||bytes(p.quote)!==p.source.end_byte-p.source.start_byte)throw Error('Invalid exact participant source');


  total+=bytes(p.quote);

  const role=p.role.trim();

  roles.set(role,{id:role,label:role});

  return {role,source:structuredClone(p.source),expected_draft:null,quote:p.quote};
 });


 if(total>2*1024*1024)throw Error('Combined participants exceed the 2 MiB limit');


 const claim=assertionProperties(properties);

 if(!claim.attribution.isWellFormed()||!claim.scope.isWellFormed())throw Error('Invalid assertion properties');


 return {action:'create',predicate:{kind:'declared',label:label.trim(),description:description.trim(),roles:[...roles.values()]},participants:inputs,properties:claim};
}
