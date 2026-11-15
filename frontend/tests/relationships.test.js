/**
 * # Hypergraph PX — Relationships semantic regression scenarios
 *
 * Checks exact adjacent-source relationships, canonical meaning and browsing
 * identity with explicit editor and registry fixtures.
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
 * - [Exact text and anchors][spec-3]
 *
 * Boundary: Registry validation and local editor examples do not imply durable
 * graph publication or checked logical truth. Tags remain browsing metadata,
 * separate from assertion meaning.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/relationships.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {adjacentPairs,pairForSelection,relationshipsAtCaret,relationshipField,addRelationship,removeRelationship,relationshipBoundaries} from '../src/relationships.js';

/** Create an isolated relationship-aware editor document. */
function state(doc){return EditorState.create({doc,extensions:[relationshipField]});}

/** Add a local named relationship to the first eligible adjacent structural pair. */
function add(s,name='Supports',kind='sentence'){return s.update({effects:addRelationship.of({kind,name,pair:adjacentPairs(s,kind)[0]})}).state;}

test('adjacency stays inside prose and rejects intervening headings, code and tables',/* Verify adjacency stays within prose and excludes intervening headings, code, tables and protected syntax. */ ()=>{
 const s=state('# Title\n\nFirst sentence. Second sentence.\n\nNext paragraph.\n\n## Other\n\nDifferent section.\n\n```\nFake sentence. Fake second.\n```\n\nAfter code.\n\n| A | B |\n|---|---|\n| x | y |\n\nAfter table.');


 const pairs=adjacentPairs(s,'paragraph');

 assert.equal(pairs.length,1);assert.equal(pairs[0].right.text,'Next paragraph.');
 assert.equal(adjacentPairs(s,'sentence').length,1);
 assert.equal(adjacentPairs(state('A `code. value` sentence. Another sentence.'),'sentence').length,0);
});

test('multiple relationships retain distinct identity without touching source; removal is exact',/* Verify multiple local meanings keep distinct identities without text mutation and removal targets one record. */ ()=>{
 let s=state('Café 🧭 first. Second sentence.\n\nAnother paragraph.');

 const source=s.doc.toString();

 s=add(add(s,'Supports'),'Clarifies');


 const records=s.field(relationshipField).records;

 assert.equal(records.length,2);assert.notEqual(records[0].id,records[1].id);assert.equal(relationshipBoundaries(s)[0].records.length,2);assert.equal(s.doc.toString(),source);
 s=s.update({effects:removeRelationship.of(records[0].id)}).state;assert.deepEqual(s.field(relationshipField).records.map(/* Collect remaining names after exact removal. */ r=>r.name),['Clarifies']);
});

test('unrelated Unicode insertion maps exact anchors; content changes or broken adjacency become review-needed',/* Verify unrelated Unicode edits map synthetic anchors but changed text or adjacency marks records stale. */ ()=>{
 let s=add(state('First sentence. Second sentence.\n\nNext paragraph.'));


 s=s.update({changes:{from:0,insert:'# 🧭\n\n'}}).state;
 assert.equal(s.field(relationshipField).records[0].stale,false);assert.equal(s.field(relationshipField).records[0].left.from,6);
 s=s.update({changes:{from:s.doc.toString().indexOf('Second'),insert:'Changed '}}).state;
 assert.equal(s.field(relationshipField).records[0].stale,true);assert.equal(relationshipBoundaries(s).length,0);


 let paragraph=add(state('One paragraph.\n\nAnother paragraph.'),'Contrasts','paragraph');


 paragraph=paragraph.update({changes:{from:paragraph.doc.toString().indexOf('Another'),insert:'## Intervening heading\n\n'}}).state;
 assert.equal(paragraph.field(relationshipField).records[0].stale,true);
});

test('forward/reverse selections of two sentences target their shared boundary, not the head pair',/* Verify selection direction does not replace the exact two-unit shared boundary with the head’s neighbouring pair. */ ()=>{
 const text='First sentence. Second sentence. Third sentence.',base=state(text);


 const from=text.indexOf('Second'),to=text.length;


 for(const selection of [{anchor:from,head:to},{anchor:to,head:from}]){
  const s=base.update({selection}).state,pair=pairForSelection(s,'sentence');


  assert.equal(pair.left.text,'Second sentence.');assert.equal(pair.right.text,'Third sentence.');assert.equal(pair.position,text.indexOf('Third'));
 }


 const all=base.update({selection:{anchor:0,head:text.length}}).state;

 assert.equal(pairForSelection(all,'sentence'),null);


 const partial=base.update({selection:{anchor:from+2,head:to}}).state;

 assert.equal(pairForSelection(partial,'sentence'),null);
});

test('two selected paragraphs choose the shared gap in both directions and trim outer whitespace',/* Verify paragraph selection trims only outer whitespace and chooses the same pair in either direction. */ ()=>{
 const text='Earlier.\n\nSecond paragraph.\n\nThird paragraph.\n',base=state(text),from=text.indexOf('Second');


 for(const selection of [{anchor:from-1,head:text.length},{anchor:text.length,head:from-1}]){
  const pair=pairForSelection(base.update({selection}).state,'paragraph');

  assert.equal(pair.left.text,'Second paragraph.');assert.equal(pair.right.text,'Third paragraph.');assert.equal(pair.position,text.indexOf('Third')-1);
 }
});

test('sentence arrow gaps collapse horizontal separators only and restore after the last relationship is removed',/* Verify horizontal sentence-gap styling disappears after the last relationship without altering whitespace source. */ ()=>{
 let s=add(add(state('First sentence.  \tSecond sentence.'),'Supports'),'Clarifies');


 const groups=relationshipBoundaries(s);

 assert.equal(groups.length,1);assert.equal(groups[0].gapFrom,'First sentence.'.length);assert.equal(s.sliceDoc(groups[0].gapFrom,groups[0].position),'  \t');


 for(const record of [...s.field(relationshipField).records])s=s.update({effects:removeRelationship.of(record.id)}).state;


 assert.deepEqual(relationshipBoundaries(s),[]);assert.equal(s.doc.toString(),'First sentence.  \tSecond sentence.');


 const soft=add(state('First sentence.\nSecond sentence.'));

 assert.equal(relationshipBoundaries(soft)[0].gapFrom,undefined);
});

test('caret relevance includes either endpoint, combines sentence/paragraph links and excludes unrelated text',/* Verify caret relevance includes either endpoint while combining structural kinds and excluding unrelated source. */ ()=>{
 const text='Alpha one. Beta two.\n\nGamma three. Delta four.\n\nUnrelated paragraph.';

 let s=state(text);

 s=add(s,'Sentence connection');s=add(s,'Paragraph connection','paragraph');
 assert.deepEqual(relationshipsAtCaret(s,text.indexOf('Alpha')+2).map(/* Collect all meanings attached to the first paragraph’s caret. */ record=>record.name),['Sentence connection','Paragraph connection']);
 assert.deepEqual(relationshipsAtCaret(s,text.indexOf('Gamma')+2).map(/* Collect the meaning spanning the second paragraph’s caret. */ record=>record.name),['Paragraph connection']);
 assert.deepEqual(relationshipsAtCaret(s,text.indexOf('Unrelated')+2),[]);
});
