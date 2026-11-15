/**
 * # Hypergraph PX — Adapter regression scenarios
 *
 * Checks browser adapter behaviour with isolated synthetic inputs and explicit
 * assertions.
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
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: These isolated tests establish their stated scenarios, not integrated
 * product delivery or formal proof. Fixture bytes and all assertions are
 * preserved.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/adapter.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {test} from 'node:test';import assert from 'node:assert/strict';import {FixtureAdapter} from '../src/adapter.js';

/** Create independent synthetic documents with a supplementary Unicode scalar for range tests. */
const make=()=>new FixtureAdapter([{id:'a',title:'A',source:'original 🧭 passage'},{id:'b',title:'B',source:'second'}]);

test('delayed checkpoint acknowledges captured sequence without overwriting later typing or another document',/* Verify a delayed acknowledgement retains its captured sequence without overwriting newer source or another document. */ async()=>{const a=make();

 a.edit('a','first');

 const pending=a.checkpoint('a',10);

 a.edit('a','newer');a.edit('b','independent');

 const ack=await pending;

 assert.equal(ack.sequence,1);assert.deepEqual(a.get('a'),{id:'a',title:'A',source:'newer',sequence:2,acknowledged:1});assert.equal(a.get('b').acknowledged,0);});

test('repeated fixture fork plans retain captured source and distinct operation IDs; clear follows completion',/* Verify repeated plans retain captured text, allocate distinct simulated operations and clear only after completion. */ ()=>{const a=make(),entry=a.capture('a',0,8);

 a.edit('a','changed source');

 const first=a.forkPlan([entry.id]),second=a.forkPlan([entry.id]);

 assert.equal(first.text,'original');assert.equal(second.text,'original');assert.notEqual(first.id,second.id);assert.equal(a.clipboard.length,1);a.finishFork(first,true);assert.equal(a.clipboard.length,0);assert.equal(a.pastes[0].sources[0].sequence,0);});

test('invalid range and missing clipboard items reject before any local publication',/* Verify malformed ranges and missing entries fail before any simulated publication. */ ()=>{const a=make();

 assert.throws(/* Attempt a cut through the supplementary scalar to test boundary rejection. */ ()=>a.capture('a',10,11),/Unicode/);assert.throws(/* Attempt an out-of-bounds capture. */ ()=>a.capture('a',0,100),/range/);

 const c=a.capture('a',0,8);

 assert.throws(/* Attempt a plan containing an entry that no longer exists. */ ()=>a.forkPlan([c.id,'missing']),/changed/);assert.equal(a.pastes.length,0);assert.equal(a.clipboard.length,1);});

test('demo forks keep exact captured source, independent identity/edits and attribution; stale source rejects',/* Verify independent fixture fork identity, source and attribution while rejecting stale creation. */ ()=>{const a=make(),context={document:'a',sequence:0,from:0,to:8,text:'original'},attribution=[{from:0,to:8,author:{id:'demo:original-author',name:'Original fixture author'}}];

 const first=a.createFork(context,'First',attribution),second=a.createFork(context,'Second',attribution);

 assert.notEqual(first.id,second.id);assert.equal(first.source,'original');assert.deepEqual(first.attribution,attribution);a.edit(first.id,'independent');assert.equal(a.get('a').source,'original 🧭 passage');assert.equal(a.get(second.id).source,'original');a.edit('a','changed');assert.throws(/* Attempt creation against the stale captured source sequence. */ ()=>a.createFork(context,'Stale',attribution),/changed/);assert.equal(a.docs.size,4);});
