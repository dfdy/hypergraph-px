/**
 * # Hypergraph PX — Bounded document and Fork graph validation
 *
 * Validate the requested node ordering and exact pinned transformation incidences
 * before a graph renderer receives them.
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
 * Used by: History, branches and graph inspection through the runtime
 * document/Fork graph view.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Provenance and history contract][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: Current node labels and historical edge endpoints are distinct scopes.
 * Validation does not infer shared authorship, follow missing external sources or
 * turn the projection into an editable graph.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/document-fork-graph.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/provenance-model.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

/** Render identity bytes as a stable hexadecimal graph key. */
export const identityKey=id=>id.map(/* Encode one identity byte as two hexadecimal digits. */ n=>n.toString(16).padStart(2,'0')).join('');

/** Validate the supported32-byte wire identity shape. */
const validId=id=>Array.isArray(id)&&id.length===32&&id.every(/* Check that one identity element is an integer byte. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Require a safe nonnegative graph count or source offset. */
const counter=n=>Number.isSafeInteger(n)&&n>=0;

/** Validate an exact committed source endpoint with the supported one-occurrence path and byte bounds. */
function endpoint(s){return s&&['document','node','revision','snapshot'].every(/* Validate each required document/node/revision/snapshot endpoint identity. */ k=>validId(s[k]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&s.occurrence_path.every(validId)&&counter(s.start_byte)&&counter(s.end_byte)&&s.end_byte>s.start_byte&&s.end_byte<=2*1024*1024;}

/** Validate a bounded document/Fork projection against the exact requested document order and incidences. */
export function documentForkGraph(raw,requested){
 if(raw?.projection!=='document_forks'||!Array.isArray(raw.nodes)||raw.nodes.length!==requested.length||!requested.length||requested.length>16||new Set(requested).size!==requested.length||!Array.isArray(raw.edges)||raw.edges.length>raw.nodes.length||!counter(raw.inputs_outside_selection)||raw.inputs_outside_selection+raw.edges.length>raw.nodes.length)throw Error('Invalid graph projection');


 const nodes=new Map(),documents=new Map();


 for(const [i,n] of raw.nodes.entries()){
  if(!n||!['document','node','revision','snapshot'].every(/* Validate identity fields for each current selected document node. */ k=>validId(n[k]))||identityKey(n.document)!==requested[i]||typeof n.title!=='string'||!n.title.isWellFormed()||new TextEncoder().encode(n.title).length>512)throw Error('Invalid graph node');


  const key=identityKey(n.node),document=identityKey(n.document);

  if(nodes.has(key)||documents.has(document))throw Error('Duplicate graph identity');

  nodes.set(key,n);documents.set(document,n);
 }


 const transformations=new Set(),outputs=new Set();


 for(const e of raw.edges){
  if(e?.kind!=='fork'||!['transformation','operation','actor','device'].every(/* Validate retained transformation/publication identities for each Fork edge. */ k=>validId(e[k]))||e.inputs?.length!==1||e.outputs?.length!==1||!endpoint(e.inputs[0])||!endpoint(e.outputs[0]))throw Error('Invalid graph relationship');


  const input=e.inputs[0],output=e.outputs[0],from=identityKey(input.node),to=identityKey(output.node),event=identityKey(e.transformation);


  if(!nodes.has(from)||!nodes.has(to)||identityKey(nodes.get(from).document)!==identityKey(input.document)||identityKey(nodes.get(to).document)!==identityKey(output.document)||from===to||transformations.has(event)||outputs.has(to)||output.start_byte!==0||output.end_byte!==input.end_byte-input.start_byte)throw Error('Invalid graph incidence');


  transformations.add(event);outputs.add(to);
 }


 return structuredClone(raw);
}
