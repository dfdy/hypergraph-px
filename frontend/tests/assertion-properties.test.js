/**
 * # Hypergraph PX — Assertion properties regression scenarios
 *
 * Checks exact assertion properties semantics with isolated synthetic identities,
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/assertion-properties.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {assertionProperties,assertionPropertyLabels} from '../src/assertion-properties.js';
import {relationshipField,adjacentPairs,addRelationship,canonicalRelationship} from '../src/relationships.js';

test('polarity, uncertainty, attribution and scope qualify an assertion without changing its predicate',/* Verify qualifiers preserve predicate identity and source while supplying explicit readable labels. */ ()=>{
 let state=EditorState.create({doc:'A happens. B happens.',extensions:[relationshipField]});

 const pair=adjacentPairs(state,'sentence')[0],properties={negated:true,certainty:'possible',attribution:' Reviewer ',scope:' Within this study '};


 state=state.update({effects:addRelationship.of({kind:'sentence',pair,predicateId:'preview:causal-empirical:causes',properties})}).state;


 const records=state.field(relationshipField).records;

 assert.equal(records.length,1);assert.equal(records[0].predicateId,'preview:causal-empirical:causes');assert.equal(records[0].name,'causes');assert.deepEqual(records[0].properties,{negated:true,certainty:'possible',attribution:'Reviewer',scope:'Within this study'});assert.deepEqual(canonicalRelationship(records[0]).properties,records[0].properties);assert.equal(state.doc.toString(),'A happens. B happens.');
 assert.deepEqual(assertionPropertyLabels(records[0].properties),['Negated','Certainty: possible','Attributed to: Reviewer','Scope: Within this study']);assert.deepEqual(assertionPropertyLabels(),[]);
});

test('assertion properties have neutral defaults and reject unsupported or oversized values before record creation',/* Verify neutral defaults and rejection of unsupported, oversized or malformed property objects. */ ()=>{
 assert.deepEqual(assertionProperties(),{negated:false,certainty:'unspecified',attribution:'',scope:''});


 for(const properties of [{negated:'yes'},{certainty:'proven'},{scope:'x'.repeat(501)},{attribution:'x'.repeat(201)},{permissions:'admin'},null,[]])assert.throws(/* Attempt each invalid property object before any relationship is stored. */ ()=>assertionProperties(properties));


 const state=EditorState.create({doc:'One sentence. Two sentence.',extensions:[relationshipField]}),pair=adjacentPairs(state,'sentence')[0];

 assert.equal(state.update({effects:addRelationship.of({kind:'sentence',pair,predicateId:'preview:logical-argumentative:supports',properties:{permissions:'admin'}})}).state.field(relationshipField).records.length,0);
});

test('browsing category never changes the stored qualified fact or the inverse canonical roles',/* Verify browsing tags do not change qualified assertion meaning or inverse roles. */ ()=>{
 const state=EditorState.create({doc:'One sentence. Two sentence.',extensions:[relationshipField]}),pair=adjacentPairs(state,'sentence')[0];


 /** Create the same inverse predicate through different browsing tags. */
 const create=categoryId=>state.update({effects:addRelationship.of({kind:'sentence',pair,predicateId:'preview:logical-argumentative:is_supported_by',categoryId,properties:{certainty:'probable'}})}).state.field(relationshipField).records[0];


 assert.deepEqual(create('epistemological'),create('logical-argumentative'));

 const meaning=canonicalRelationship(create('epistemological'));

 assert.equal(meaning.source.from,pair.right.from);assert.equal(meaning.predicateId,'preview:logical-argumentative:supports');assert.equal(meaning.properties.certainty,'probable');
});


test('repeating a typed assertion through another browsing tag reuses one record, but changed properties remain distinct',/* Verify cross-tag duplicates reuse identity while changed qualifiers remain distinct. */ ()=>{
 let state=EditorState.create({doc:'One sentence. Two sentence.',extensions:[relationshipField]}),pair=adjacentPairs(state,'sentence')[0];


 /** Build a repeatable add effect whose only varying inputs are tag and properties. */
 const effect=(categoryId,properties={})=>addRelationship.of({kind:'sentence',pair,predicateId:'preview:causal-empirical:causes',categoryId,properties});


 state=state.update({effects:effect('causal-empirical')}).state;

 const id=state.field(relationshipField).lastAddedId;


 state=state.update({effects:effect('dialectical-process')}).state;assert.equal(state.field(relationshipField).records.length,1);assert.equal(state.field(relationshipField).lastAddedId,id);
 state=state.update({effects:effect('dialectical-process',{certainty:'possible'})}).state;assert.equal(state.field(relationshipField).records.length,2);assert.notEqual(state.field(relationshipField).lastAddedId,id);
});
