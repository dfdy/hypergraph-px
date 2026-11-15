/**
 * # Hypergraph PX — Validated assertion and transformation graph projections
 *
 * Checks bounded runtime graph responses before retrospective assertion roles and
 * transformation events are displayed together.
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
 * Used by: History, branches and graph inspection — runtime graph dialog.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Assertions and predicate semantics][spec-2]
 * - [Browser runtime and API contract][spec-3]
 *
 * Boundary: Graph incidence is read-only projection evidence; participant roles
 * remain parts of one assertion, and text snapshots exclude semantic assertions.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/overlay-graph.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 */

import {documentForkGraph,identityKey as key} from './document-fork-graph.js';
import {assertionPropertyLabels} from './assertion-properties.js';
import {validAssertionSource,validAssertionEntry} from './runtime-assertions.js';

/** Recognise complete 32-byte identities before using them as graph keys. */
const id=v=>Array.isArray(v)&&v.length===32&&v.every(/* Reject fractional or out-of-byte-range identity elements. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Compare validated identities without accepting malformed endpoints. */
const same=(a,b)=>id(a)&&id(b)&&a.every(/* Require each byte to match at its original identity position. */ (v,i)=>v===b[i]);

/** Distinguish exact committed source bindings, including occurrence paths and byte ranges. */
const sourceKey=s=>JSON.stringify([s.document,s.node,s.snapshot,s.revision,s.occurrence_path,s.start_byte,s.end_byte]);

/** Validate selection correspondence, event incidence and resource budgets before returning an isolated graph projection. */
export function overlayGraph(raw,selection,{transformations=false}={}){
 if(raw?.projection!==(transformations?'transformation_incidence':'retrospective_incidence')||raw.text_snapshot_scope!=='semantic_assertions_excluded'||!Array.isArray(raw.nodes)||raw.nodes.length!==selection.length||!selection.length||selection.length>16||!Array.isArray(raw.edges)||raw.edges.length>128||!Number.isSafeInteger(raw.outside_selection)||raw.outside_selection<0)throw Error('Invalid overlay graph');


 const nodes=[],byNode=new Map(),documents=[],claims=[];


 for(const [index,n] of raw.nodes.entries()){
  const requested=selection[index];

  if(n?.kind!==requested?.kind)throw Error('Mismatched graph node kind');

  let normalized;


  if(n.kind==='document'){
   if(!id(requested.document)||!same(n.context?.document,requested.document))throw Error('Invalid document graph node');

   documents.push(n.context);normalized={...n.context,kind:'document'};
  }else if(n.kind==='assertion'){
   if(!id(requested.node)||!validAssertionEntry(n.context)||!same(n.context.record.node,requested.node))throw Error('Invalid assertion graph node');

   claims.push(n.context);normalized={kind:'assertion',node:n.context.record.node,revision:n.context.revision,title:(n.context.record.properties.negated?'Negated · ':'')+(n.context.record.properties.certainty!=='unspecified'?n.context.record.properties.certainty+' · ':'')+n.context.definition.definition.label,qualifiers:assertionPropertyLabels(n.context.record.properties),assertion:n.context};
  }else throw Error('Unsupported graph node');


  if(!id(normalized.node)||byNode.has(key(normalized.node)))throw Error('Duplicate graph node identity');

  byNode.set(key(normalized.node),normalized);nodes.push(normalized);
 }


 if(documents.length)documentForkGraph({projection:'document_forks',nodes:documents,edges:[],inputs_outside_selection:0},documents.map(/* Select document identities for the existing fork-graph validator. */ d=>key(d.document)));


 const edges=[],incidences=new Set(),forks=new Set(),outputs=new Set(),sources=new Set();

 let missing=0;


 for(const edge of raw.edges){
  if(edge?.kind==='merge'){
   const event=edge.event;

   if(!transformations||!event||event.kind!=='reviewed_synthesis'||event.source_authorship!=='unknown'||!['transformation','operation','actor','device'].every(/* Require all transformation, operation, actor and device identities to be well formed. */ k=>id(event[k]))||!Array.isArray(event.inputs)||event.inputs.length<2||event.inputs.length>8||!Array.isArray(event.outputs)||event.outputs.length!==1||!validAssertionSource(event.outputs[0])||event.outputs[0].start_byte!==0)throw Error('Invalid Merge transformation');


   const output=event.outputs[0],target=byNode.get(key(output.node));

   if(target?.kind!=='document'||!same(target.document,output.document)||outputs.has(key(output.node))||forks.has(key(event.transformation)))throw Error('Invalid or duplicate Merge output');


   let bytes=0;

   for(const input of event.inputs){if(!validAssertionSource(input)||same(input.node,output.node))throw Error('Invalid Merge input');

    const origin=byNode.get(key(input.node));

    if(origin&&(origin.kind!=='document'||!same(origin.document,input.document)))throw Error('Invalid Merge participant');

    bytes+=input.end_byte-input.start_byte;sources.add(sourceKey(input));

    if(!origin)missing++;}

   if(bytes>2*1024*1024)throw Error('Invalid Merge source budget');

   sources.add(sourceKey(output));forks.add(key(event.transformation));outputs.add(key(output.node));edges.push(structuredClone(edge));
  }else if(edge?.kind==='fork'){
   const event=edge.event;

   if(!id(event?.inputs?.[0]?.node)||!id(event?.outputs?.[0]?.node))throw Error('Invalid fork endpoint identity');

   const a=byNode.get(key(event?.inputs?.[0]?.node??[])),b=byNode.get(key(event?.outputs?.[0]?.node??[]));


   if(a?.kind!=='document'||b?.kind!=='document')throw Error('Invalid fork endpoints');

   documentForkGraph({projection:'document_forks',nodes:[a,b],edges:[event],inputs_outside_selection:0},[key(a.document),key(b.document)]);


   if(forks.has(key(event.transformation))||outputs.has(key(b.node)))throw Error('Duplicate graph fork');

   forks.add(key(event.transformation));outputs.add(key(b.node));edges.push(event);
  }else if(edge?.kind==='participant'){
   if(!id(edge.assertion)||!id(edge.revision)||!Number.isInteger(edge.index)||edge.index<0)throw Error('Invalid role incidence');


   const target=byNode.get(key(edge.assertion)),entry=target?.assertion,p=entry?.record.participants[edge.index];


   if(!p||!same(edge.revision,entry.revision)||edge.role!==p.role||sourceKey(edge.source??{})!==sourceKey(p.source))throw Error('Mismatched participant incidence');


   const origin=byNode.get(key(p.source.node));

   if(origin?.kind!=='document'||!same(origin.document,p.source.document))throw Error('Invalid participant node');


   const identity=key(edge.assertion)+':'+edge.index;

   if(incidences.has(identity))throw Error('Duplicate participant incidence');

   incidences.add(identity);edges.push(edge);
  }else throw Error('Unsupported graph relationship');
 }


 for(const entry of claims)for(const [index,p] of entry.record.participants.entries()){
  sources.add(sourceKey(p.source));

  const origin=byNode.get(key(p.source.node));

  if(origin){if(origin.kind!=='document'||!incidences.has(key(entry.record.node)+':'+index))throw Error('Missing selected participant incidence');}else missing++;
 }


 if(sources.size>64||raw.outside_selection<missing||raw.outside_selection>missing+documents.length-outputs.size)throw Error('Invalid graph scope budget');


 return structuredClone({projection:raw.projection,nodes,edges,outside_selection:raw.outside_selection});
}
