/**
 * # Hypergraph PX — Formatting regression scenarios
 *
 * Checks browser formatting behaviour with isolated synthetic inputs and explicit
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/formatting.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {test} from 'node:test';import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';import {markdown} from '@codemirror/lang-markdown';
import {formattingState,inlinePlan,blockPlan} from '../src/formatting.js';

/** Create a parsed Markdown selection for formatting plans. */
function state(source,at,end=at){return EditorState.create({doc:source,selection:{anchor:at,head:end},extensions:[markdown()]});}

test('format context follows parsed emphasis and excludes code and unrelated text',/* Verify formatting context follows actual parsed emphasis and excludes code and unrelated text. */ ()=>{const s='**strong** and *emphasis* with `**code**`';

 assert.equal(formattingState(state(s,4)).bold,true);assert.equal(formattingState(state(s,19)).italic,true);assert.equal(formattingState(state(s,s.indexOf('code')+1)).bold,false);assert.equal(formattingState(state(s,s.indexOf(' and ')+2)).bold,false);});

test('inline toggle removes only enclosing marks and preserves nested emphasis',/* Verify removing bold preserves nested emphasis and adding italic wraps only selected text. */ ()=>{const s=state('**bold *and italic***',5);

 const result=s.update(inlinePlan(s,'bold')).state;

 assert.equal(result.doc.toString(),'bold *and italic*');

 const selected=state('plain text',0,5);

 assert.equal(selected.update(inlinePlan(selected,'italic')).state.doc.toString(),'*plain* text');});

test('ordered-list conversion preserves nested structure and toggles off explicitly',/* Verify list conversion retains nested indentation and explicitly toggles off. */ ()=>{const s=state('- first\n  - nested\n- second',3);

 const converted=s.update(blockPlan(s,'number')).state;

 assert.equal(converted.doc.toString(),'1. first\n   - nested\n2. second');assert.equal(formattingState(converted).number,true);assert.equal(converted.update(blockPlan(converted,'number')).state.doc.toString(),'first\n   - nested\nsecond');});

test('blockquote context and toggle include implicit continuation lines',/* Verify quote continuation and multiline list conversion use actual block scope. */ ()=>{const s=state('> first\ncontinued',12);

 assert.equal(formattingState(s).quote,true);assert.equal(s.update(blockPlan(s,'quote')).state.doc.toString(),'first\ncontinued');

 const plain=state('first\nsecond',0,12);

 assert.equal(plain.update(blockPlan(plain,'number')).state.doc.toString(),'1. first\n2. second');});

import {blockStyleState} from '../src/formatting.js';
import {markdownLanguage} from '@codemirror/lang-markdown';

/** Create a full-language Markdown state at a text or numeric selection. */
function styled(source,needle,end){const from=typeof needle==='number'?needle:source.indexOf(needle);

 return EditorState.create({doc:source,selection:{anchor:from,head:end??from},extensions:[markdown({base:markdownLanguage})]});}

test('Paragraph is off in lists, quotes, fenced code, tables and separators, not ordinary inline styles',/* Verify paragraph state excludes block constructs while admitting ordinary inline formatting. */ ()=>{for(const [source,word] of [['1. Numbered','Numbered'],['- Bullet','Bullet'],['- [x] Task','Task'],['> Quoted','Quoted'],['```\n# Literal\n```','Literal'],['| A | B |\n| --- | --- |\n| cell | value |','cell'],['---',1]])assert.equal(blockStyleState(styled(source,word)).paragraph,false,source);

 assert.equal(blockStyleState(styled('**ordinary bold**','ordinary')).paragraph,true);assert.equal(blockStyleState(styled('`**literal**`','literal')).paragraph,true);assert.equal(blockStyleState(styled('',0)).paragraph,true);});

test('nested and Setext headings use their actual level; mixed selections do not claim normal text',/* Verify nested and Setext heading levels and mixed-selection classification. */ ()=>{assert.equal(blockStyleState(styled('> ## Nested heading','Nested')).headingLevel,2);assert.equal(blockStyleState(styled('Title\n=====','Title')).headingLevel,1);assert.equal(blockStyleState(styled('Title\n-----','Title')).headingLevel,2);assert.equal(blockStyleState(styled('plain\n\n## heading',0,'plain\n\n## heading'.length)).kind,'mixed');assert.equal(blockStyleState(styled('one\n\ntwo',0,8)).paragraph,true);});

test('nested list indicators choose the nearest list, keeping quote and inline styles independent',/* Verify nearest nested list indicators while quote and emphasis states remain independent. */ ()=>{let s=styled('1. outer\n   - **inner**','inner');

 assert.equal(formattingState(s).bullet,true);assert.equal(formattingState(s).number,false);assert.equal(formattingState(s).bold,true);s=styled('- outer\n  1. inner','inner');assert.equal(formattingState(s).number,true);assert.equal(formattingState(s).bullet,false);s=styled('> **quoted**','quoted');assert.equal(formattingState(s).quote,true);assert.equal(formattingState(s).bold,true);assert.equal(formattingState(styled('**bold** plain',8)).bold,false);});
