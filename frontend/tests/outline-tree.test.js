/**
 * # Hypergraph PX — Outline tree regression scenarios
 *
 * Checks browser outline tree behaviour with isolated synthetic inputs and
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/outline-tree.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {headingTree,headingAt} from '../src/outline-tree.js';
import {documentHeadings} from '../src/context-actions.js';

test('heading hierarchy handles skipped levels, siblings and fenced examples without losing order',/* Verify skipped heading levels, sibling order and fenced examples produce correct hierarchy and caret lookup. */ ()=>{
 const source='# Root\n\n### Deep\n\n###### Leaf\n\n## Peer\n\n```\n# Fake\n```\n\n# Next\n';


 const headings=documentHeadings(source),tree=headingTree(headings);


 assert.deepEqual(tree.map(/* Collect root labels to verify their original order. */ h=>h.label),['Root','Next']);assert.deepEqual(tree[0].children.map(/* Collect direct child labels to distinguish siblings from deeper descendants. */ h=>h.label),['Deep','Peer']);assert.equal(tree[0].children[0].children[0].label,'Leaf');
 assert.equal(headingAt(headings,source.indexOf('Leaf')).label,'Leaf');assert.equal(headingAt(headings,source.indexOf('Next')).label,'Next');assert.equal(headingAt(headings,-1),null);
});
