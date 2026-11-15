/**
 * # Hypergraph PX — Context actions regression scenarios
 *
 * Checks browser context actions behaviour with isolated synthetic inputs and
 * explicit assertions.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/context-actions.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {documentHeadings,markdownHeadingLink} from '../src/context-actions.js';

test('heading links discover exact targets across LF, CRLF, CR and mixed endings without normalization',/* Verify exact heading positions and link bytes across newline forms, duplicate labels and fenced examples. */ ()=>{
 for(const newline of ['\n','\r\n','\r']){
  const text=['# Target','body','## Repeated 😀','x','## Repeated 😀','```','# Hidden','```','# Final'].join(newline),headings=documentHeadings(text);


  assert.deepEqual(headings.map(/* Collect discovered labels to detect included fenced examples. */ h=>h.label),['Target','Repeated 😀','Repeated 😀','Final']);
  assert.deepEqual(headings.map(/* Collect generated anchors to verify duplicate disambiguation. */ h=>h.anchor),['target','repeated','repeated-1','final']);
  assert.deepEqual(headings.map(/* Collect exact source starts without normalising newline bytes. */ h=>h.from),['# Target','## Repeated 😀','## Repeated 😀','# Final'].map(/* Compute expected repeated-heading positions from the original string. */ (value,i)=>i===2?text.indexOf(value,text.indexOf(value)+1):text.indexOf(value)));
  assert.equal(headings[0].to,text.indexOf('# Final'));assert.equal(headings.at(-1).to,text.length);
 }


 assert.deepEqual(documentHeadings('# One\r\n## Two\r### Three\n').map(/* Collect mixed-ending heading labels to verify all newline forms parse. */ h=>h.label),['One','Two','Three']);
 assert.equal(markdownHeadingLink('artial 😀, [text]!\r\nnext',{anchor:'target'}),'[artial 😀, \\[text\\]!\r\nnext](#target)');
});
