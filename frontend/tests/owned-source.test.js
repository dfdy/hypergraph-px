/**
 * # Hypergraph PX — Owned source exact-source regression scenarios
 *
 * Checks editor source and display boundaries with isolated Unicode, newline,
 * Markdown and structural fixtures.
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
 * - [Exact text and anchors][spec-2]
 * - [Frontend interaction contract][spec-3]
 *
 * Boundary: Assertions cover isolated editor models, not integrated persistence or
 * browser acceptance. Original fixture text and all executable assertions remain
 * unchanged.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/owned-source.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 * [spec-3]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState,Transaction} from '@codemirror/state';
import {history,undo,redo,isolateHistory} from '@codemirror/commands';
import {applyOwnedChanges,editorProjection,exactInsertion,ownedSource,ownedSourceExtension} from '../src/owned-source.js';

test('mixed CRLF, LF, CR and Unicode retain exact owned bytes through separated editor changes',/* Verify separated edits preserve mixed newline forms, combining scalars and supplementary Unicode exactly. */ ()=>{
 const source='A😀e\u0301\r\nB\nC\rD',before=editorProjection(source);


 assert.equal(applyOwnedChanges(source,before,[{from:0,to:1,text:'Edited'},{from:before.length,to:before.length,text:'!'}]),'Edited😀e\u0301\r\nB\nC\rD!');
 assert.equal(applyOwnedChanges(source,before,[{from:6,to:7,text:'Bee'}]),'A😀e\u0301\r\nBee\nC\rD');
 assert.throws(/* Attempt insertion through a surrogate pair to require rejection. */ ()=>applyOwnedChanges(source,before,[{from:2,to:2,text:'x'}]),/range/);
 assert.throws(/* Attempt changes against a stale display projection. */ ()=>applyOwnedChanges(source,'stale',[{from:0,to:0,text:'x'}]),/Stale/);
});

test('typed newlines use local source convention while exact paste preserves its own mixed endings',/* Verify typed newlines adopt local conventions while exact paste retains its own original endings. */ ()=>{
 const source='A\r\nB\nC',before=editorProjection(source);


 assert.equal(applyOwnedChanges(source,before,[{from:3,to:3,text:'\nTyped'}]),'A\r\nB\r\nTyped\nC');


 const raw='P\rQ\r\nR\n';

 assert.equal(applyOwnedChanges(source,before,[{from:3,to:3,text:editorProjection(raw)}],{from:3,to:3,source:raw}),'A\r\nBP\rQ\r\nR\n\nC');
 assert.throws(/* Attempt an exact insertion whose displayed text does not match its original annotation. */ ()=>applyOwnedChanges(source,before,[{from:3,to:3,text:'different'}],{from:3,to:3,source:raw}),/Mismatched/);
});

test('undo and redo restore exact mixed line endings, combining scalars and pasted bytes',/* Verify undo/redo restores exact owned text independently of the LF display. */ ()=>{
 const original='A😀\r\nB\nC\rD';

 let state=EditorState.create({doc:editorProjection(original),extensions:[history(),ownedSourceExtension(original)]});


 /** Apply history-generated transactions to the isolated test state. */
 const dispatch=tr=>{state=tr.state;};/* Read the exact source field for byte-preservation assertions. */

 const source=()=>state.field(ownedSource);


 const raw='P\r\nQ\rR\n';

 state=state.update({changes:{from:0,to:state.doc.length,insert:editorProjection(raw)},annotations:[exactInsertion.of({from:0,to:state.doc.length,source:raw}),isolateHistory.of('full')]}).state;
 assert.equal(source(),raw);assert.ok(undo({state,dispatch}));assert.equal(source(),original);assert.ok(redo({state,dispatch}));assert.equal(source(),raw);
});

test('grouped typing history and deletion preserve original mixed endings on undo/redo',/* Verify grouped typing and whole-buffer deletion restore original mixed endings through undo/redo. */ ()=>{
 const original='A\r\nB\nC\rD';

 let state=EditorState.create({doc:editorProjection(original),extensions:[history(),ownedSourceExtension(original)]});


 /** Advance the isolated state with history-generated transactions. */
 const dispatch=tr=>{state=tr.state;};


 for(const char of ['x','y','z'])state=state.update({changes:{from:1,to:1,insert:char},annotations:Transaction.userEvent.of('input.type')}).state;


 const typed=state.field(ownedSource);

 assert.equal(typed,'Azyx\r\nB\nC\rD');
 assert.ok(undo({state,dispatch}));assert.equal(state.field(ownedSource),original);assert.ok(redo({state,dispatch}));assert.equal(state.field(ownedSource),typed);
 state=state.update({changes:{from:0,to:state.doc.length,insert:''},annotations:isolateHistory.of('full')}).state;assert.equal(state.field(ownedSource),'');
 assert.ok(undo({state,dispatch}));assert.equal(state.field(ownedSource),typed);
});
