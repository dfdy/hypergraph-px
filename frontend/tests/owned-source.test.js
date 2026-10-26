import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState,Transaction} from '@codemirror/state';
import {history,undo,redo,isolateHistory} from '@codemirror/commands';
import {applyOwnedChanges,editorProjection,exactInsertion,ownedSource,ownedSourceExtension} from '../src/owned-source.js';

test('mixed CRLF, LF, CR and Unicode retain exact owned bytes through separated editor changes',()=>{
 const source='A😀e\u0301\r\nB\nC\rD',before=editorProjection(source);
 assert.equal(applyOwnedChanges(source,before,[{from:0,to:1,text:'Edited'},{from:before.length,to:before.length,text:'!'}]),'Edited😀e\u0301\r\nB\nC\rD!');
 assert.equal(applyOwnedChanges(source,before,[{from:6,to:7,text:'Bee'}]),'A😀e\u0301\r\nBee\nC\rD');
 assert.throws(()=>applyOwnedChanges(source,before,[{from:2,to:2,text:'x'}]),/range/);
 assert.throws(()=>applyOwnedChanges(source,'stale',[{from:0,to:0,text:'x'}]),/Stale/);
});

test('typed newlines use local source convention while exact paste preserves its own mixed endings',()=>{
 const source='A\r\nB\nC',before=editorProjection(source);
 assert.equal(applyOwnedChanges(source,before,[{from:3,to:3,text:'\nTyped'}]),'A\r\nB\r\nTyped\nC');
 const raw='P\rQ\r\nR\n';assert.equal(applyOwnedChanges(source,before,[{from:3,to:3,text:editorProjection(raw)}],{from:3,to:3,source:raw}),'A\r\nBP\rQ\r\nR\n\nC');
 assert.throws(()=>applyOwnedChanges(source,before,[{from:3,to:3,text:'different'}],{from:3,to:3,source:raw}),/Mismatched/);
});

test('undo and redo restore exact mixed line endings, combining scalars and pasted bytes',()=>{
 const original='A😀\r\nB\nC\rD';let state=EditorState.create({doc:editorProjection(original),extensions:[history(),ownedSourceExtension(original)]});
 const dispatch=tr=>{state=tr.state;};const source=()=>state.field(ownedSource);
 const raw='P\r\nQ\rR\n';state=state.update({changes:{from:0,to:state.doc.length,insert:editorProjection(raw)},annotations:[exactInsertion.of({from:0,to:state.doc.length,source:raw}),isolateHistory.of('full')]}).state;
 assert.equal(source(),raw);assert.ok(undo({state,dispatch}));assert.equal(source(),original);assert.ok(redo({state,dispatch}));assert.equal(source(),raw);
});

test('grouped typing history and deletion preserve original mixed endings on undo/redo',()=>{
 const original='A\r\nB\nC\rD';let state=EditorState.create({doc:editorProjection(original),extensions:[history(),ownedSourceExtension(original)]});
 const dispatch=tr=>{state=tr.state;};
 for(const char of ['x','y','z'])state=state.update({changes:{from:1,to:1,insert:char},annotations:Transaction.userEvent.of('input.type')}).state;
 const typed=state.field(ownedSource);assert.equal(typed,'Azyx\r\nB\nC\rD');
 assert.ok(undo({state,dispatch}));assert.equal(state.field(ownedSource),original);assert.ok(redo({state,dispatch}));assert.equal(state.field(ownedSource),typed);
 state=state.update({changes:{from:0,to:state.doc.length,insert:''},annotations:isolateHistory.of('full')}).state;assert.equal(state.field(ownedSource),'');
 assert.ok(undo({state,dispatch}));assert.equal(state.field(ownedSource),typed);
});
