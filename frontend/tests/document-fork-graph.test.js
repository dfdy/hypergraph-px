/**
 * # Hypergraph PX — Document fork graph regression scenarios
 *
 * Checks exact document fork graph semantics with isolated synthetic identities,
 * captured source and invalid-response cases.
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
 * - [Assertions and predicate semantics][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Synthetic fixtures exercise validation and identity boundaries; they
 * do not establish integrated product delivery, authenticated provenance or a
 * checked proof.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/document-fork-graph.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {documentForkGraph,identityKey as key} from '../src/document-fork-graph.js';

/** Allocate deterministic graph fixture identities. */
const id=n=>Array(32).fill(n);

/** Build distinct document nodes sharing a friendly label. */
const node=(n,title='Same label')=>({document:id(n),node:id(n+10),revision:id(n+20),snapshot:id(n+30),title});

/** Build pinned historical endpoints independently of current node heads. */
const endpoint=(n,revision=n+20)=>({document:id(n),node:id(n+10),revision:id(revision),snapshot:id(n+30),occurrence_path:[id(n+40)],start_byte:0,end_byte:8});

const edge={kind:'fork',transformation:id(90),operation:id(91),actor:id(92),device:id(93),inputs:[endpoint(1)],outputs:[endpoint(2)]};

/** Create a fresh bounded Fork projection for each mutation case. */
const projection=()=>({projection:'document_forks',nodes:[node(1),node(2)],edges:[structuredClone(edge)],inputs_outside_selection:0});

const requested=[key(id(1)),key(id(2))];

test('equal-labelled distinct nodes and pinned historical endpoints remain distinct in a read-only graph',/* Verify equal labels do not merge identities and historical endpoints remain pinned and detached. */ ()=>{
 const raw=projection();

 raw.nodes[0].revision=id(70);

 const view=documentForkGraph(raw,requested);

 assert.deepEqual(view,raw);assert.notEqual(key(view.nodes[0].node),key(view.nodes[1].node));assert.notDeepEqual(view.nodes[0].revision,view.edges[0].inputs[0].revision);view.nodes[0].title='Changed view';assert.equal(raw.nodes[0].title,'Same label');
});

test('duplicate/out-of-scope incidence, malformed endpoints and unsupported relationship families fail closed',/* Verify malformed, duplicate and unsupported graph incidence fails closed. */ ()=>{
 const invalid=[];


 for(const mutate of [/* Duplicate a logical node identity. */ p=>p.nodes[1].node=p.nodes[0].node,/* Reverse response order against the requested selection. */ p=>p.nodes.reverse(),/* Duplicate the Fork event. */ p=>p.edges.push(p.edges[0]),/* Move the input document outside the selection. */ p=>p.edges[0].inputs[0].document=id(3),/* Change the input node identity without its document. */ p=>p.edges[0].inputs[0].node=id(99),/* Change output source length against the Fork input. */ p=>p.edges[0].outputs[0].end_byte=9,/* Introduce an unsupported semantic relationship kind. */ p=>p.edges[0].kind='semantic',/* Introduce unsupported multiple Fork inputs. */ p=>p.edges[0].inputs.push(endpoint(1)),/* Overstate missing boundary incidence. */ p=>p.inputs_outside_selection=2,/* Change the projection’s declared scope. */ p=>p.projection='all_relationships']){const p=projection();

  mutate(p);invalid.push(p);}


 for(const p of invalid)assert.throws(/* Attempt each independently malformed graph. */ ()=>documentForkGraph(p,requested),/Invalid|Duplicate/);
});

test('disconnected and boundary selections retain explicit supported scope and never fabricate an edge',/* Verify a boundary-only selection retains its count without fabricating an edge. */ ()=>{
 const p={projection:'document_forks',nodes:[node(2)],edges:[],inputs_outside_selection:1};

 assert.deepEqual(documentForkGraph(p,[key(id(2))]),p);
 assert.throws(/* Reject an empty requested selection. */ ()=>documentForkGraph(p,[]),/Invalid/);assert.throws(/* Reject duplicate requested document identities. */ ()=>documentForkGraph(projection(),[requested[0],requested[0]]),/Invalid/);
});
