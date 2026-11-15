/**
 * # Hypergraph PX — Sentence provenance anchor regression scenarios
 *
 * Checks structural anchors, exact source ownership and visible direction for
 * sentence provenance.
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
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Synthetic editor fixtures preserve exact text and distinguish tab-only
 * provenance from durable retrospective claims. Passing these cases is not
 * integrated graph or persistence acceptance.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/sentence-provenance.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {sentenceUnits,provenanceKinds,provenancePair,provenanceLabel,sentenceProvenanceField,addSentenceProvenance,sentenceProvenanceGroups} from '../src/sentence-provenance.js';

/** Create isolated source with the tab-only provenance field. */
const stateFor=text=>EditorState.create({doc:text,extensions:[sentenceProvenanceField]});

/** Build paired synthetic endpoints for the first two sentence units. */
function pair(state,kind='fork',extra={}){const units=sentenceUnits(state);

 return provenancePair({eventId:'event:1',kind,source:{document:'a',title:'A',sequence:0,anchor:units[0]},target:{document:'a',title:'A',sequence:0,anchor:units[1]},...extra});}

test('sentence provenance distinguishes directions for all link kinds and embed policies',/* Verify every supported provenance kind preserves direction and embed policy remains explicit. */ ()=>{
 const state=stateFor('One sentence. Another sentence.');

 assert.equal(Object.keys(provenanceKinds).length,9);


 for(const kind of Object.keys(provenanceKinds)){const records=pair(state,kind,kind==='embed'?{policy:'pinned'}:{});

  assert.notEqual(provenanceLabel(records[0]),provenanceLabel(records[1]));assert.equal(records[0].other.endpointId,records[1].id);}


 assert.match(provenanceLabel(pair(state,'embed',{policy:'live'})[1]),/live/);assert.throws(/* Reject embed provenance without a resolution policy. */ ()=>pair(state,'embed'));assert.throws(/* Reject an unknown provenance kind. */ ()=>pair(state,'unknown'));
});

test('all sentence links remain separate, map exactly and become review-needed after a source edit',/* Verify multiple links remain independent, map through unrelated edits and stay stale after invalidation. */ ()=>{
 let state=stateFor('One sentence. Another sentence.');

 const records=[...pair(state),...provenancePair({eventId:'event:2',kind:'copy',source:{document:'a',anchor:sentenceUnits(state)[0]},target:{document:'a',anchor:sentenceUnits(state)[1]}})];


 state=state.update({effects:addSentenceProvenance.of(records)}).state;assert.equal(state.field(sentenceProvenanceField).length,4);assert.equal(sentenceProvenanceGroups(state)[0].records.length,2);assert.equal(state.doc.toString(),'One sentence. Another sentence.');
 state=state.update({changes:{from:0,insert:'# 🧭 Header\n\n'}}).state;assert.equal(state.field(sentenceProvenanceField).every(/* Require all links to remain valid after an unrelated heading insertion. */ r=>!r.stale),true);assert.equal(sentenceProvenanceGroups(state)[0].position,'# 🧭 Header\n\n'.length);


 const at=sentenceProvenanceGroups(state)[0].position;

 state=state.update({changes:{from:at+1,insert:'Changed'}}).state;assert.equal(state.field(sentenceProvenanceField).filter(/* Count endpoints invalidated by a source edit. */ r=>r.stale).length,2);assert.equal(sentenceProvenanceGroups(state).length,1);
 state=state.update({changes:{from:at+1,to:at+8,insert:''}}).state;assert.equal(state.field(sentenceProvenanceField).filter(/* Verify undo-like source restoration does not silently reactivate stale endpoints. */ r=>r.stale).length,2);
});

test('sentence anchors are structural, not text matching, and exclude headings/fences/table cells',/* Verify structural sentence anchors exclude headings/code/tables and repeated effects do not duplicate identities. */ ()=>{
 let state=stateFor('# Heading.\n\nRepeated sentence. Repeated sentence.\n\n```\nCode sentence.\n```\n\n| Table | Cell |\n|---|---|\n| Hidden sentence. | Other. |\n');

 const units=sentenceUnits(state);

 assert.equal(units.length,2);assert.notEqual(units[0].from,units[1].from);


 const records=pair(state);

 state=state.update({effects:addSentenceProvenance.of([...records,{...records[0],id:'bad',anchor:{from:0,to:10,text:'# Heading.'}}])}).state;assert.equal(state.field(sentenceProvenanceField).length,2);
 state=state.update({effects:addSentenceProvenance.of(records)}).state;assert.equal(state.field(sentenceProvenanceField).length,2);
});


test('multiple parents in one merge event retain distinct link endpoints and frozen capture coordinates',/* Verify one Merge event can retain distinct links from several parent units with frozen capture coordinates. */ ()=>{
 const state=stateFor('One sentence. Another sentence. A result sentence.'),units=sentenceUnits(state),source={document:'a',sequence:7,anchor:units[0]},target={document:'a',sequence:8,anchor:units[2]};


 const first=provenancePair({eventId:'merge:1',linkId:'merge:1:parent:1',kind:'merge',source,target}),second=provenancePair({eventId:'merge:1',linkId:'merge:1:parent:2',kind:'merge',source:{...source,anchor:units[1]},target});


 const records=state.update({effects:addSentenceProvenance.of([...first,...second])}).state.field(sentenceProvenanceField);

 assert.equal(records.length,4);assert.equal(new Set(records.map(/* Collect shared event identities separately from endpoint identities. */ record=>record.eventId)).size,1);assert.equal(new Set(records.map(/* Collect individual endpoint identities to detect accidental collapse. */ record=>record.id)).size,4);assert.deepEqual(first[0].captured,{sequence:7,anchor:units[0]});
});

test('paragraph and section provenance use their own exact structural anchors, not inherited sentence links',/* Verify paragraph and section provenance use exact own-unit anchors and scope-specific invalidation. */ async()=>{
 const {provenanceUnits}=await import('../src/sentence-provenance.js');

 let state=stateFor('# Root\n\n## One\n\nFirst sentence. Second sentence.\n\nAnother paragraph.\n\n### Child\n\nNested body.\n\n## Two\n\nFinal body.\n');


 const paragraphs=provenanceUnits(state,'paragraph'),sections=provenanceUnits(state,'section');

 assert.equal(paragraphs.length,4);assert.ok(sections.find(/* Find the first section including its nested body. */ s=>s.text.startsWith('## One')).text.includes('Nested body.'));assert.ok(!sections.find(/* Find the same section for exclusion of the following sibling. */ s=>s.text.startsWith('## One')).text.includes('## Two'));


 /** Build a paired provenance link for an explicitly selected structural unit kind. */
 const create=(kind,units)=>provenancePair({eventId:'event:'+kind,kind:'fork',unitKind:kind,source:{document:'a',anchor:units[0]},target:{document:'a',anchor:units[1]}});


 state=state.update({effects:addSentenceProvenance.of([...create('sentence',sentenceUnits(state)),...create('paragraph',paragraphs),...create('section',sections)])}).state;
 assert.equal(state.field(sentenceProvenanceField).length,6);assert.equal(sentenceProvenanceGroups(state).filter(/* Count paragraph provenance groups separately. */ g=>g.unitKind==='paragraph').length,2);assert.equal(sentenceProvenanceGroups(state).filter(/* Count section provenance groups separately. */ g=>g.unitKind==='section').length,2);


 const at=paragraphs[0].from+1;

 state=state.update({changes:{from:at,insert:'Changed '}}).state;assert.equal(state.field(sentenceProvenanceField).filter(/* Count stale paragraph endpoints after editing their exact source. */ r=>r.unitKind==='paragraph'&&r.stale).length,1);assert.equal(state.field(sentenceProvenanceField).filter(/* Count stale containing-section endpoints independently of paragraph links. */ r=>r.unitKind==='section'&&r.stale).length,2);assert.equal(state.field(sentenceProvenanceField).filter(/* Retain the unaffected paragraph endpoint. */ r=>r.unitKind==='paragraph'&&!r.stale).length,1);
});

test('section units include Setext headings and ignore heading-like text in fenced code',/* Verify Setext sections are recognised while fenced heading-like text is excluded. */ async()=>{
 const {provenanceUnits}=await import('../src/sentence-provenance.js');

 const state=stateFor('Root\n====\n\nText.\n\n```\n## Not a section\n```\n\nNext\n----\n\nBody.\n');

 const sections=provenanceUnits(state,'section');

 assert.equal(sections.length,2);assert.equal(sections[0].from,0);assert.ok(sections[1].text.startsWith('Next\n----'));
});
