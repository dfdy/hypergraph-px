/**
 * # Hypergraph PX — Control labels regression scenarios
 *
 * Checks browser control labels behaviour with isolated synthetic inputs and
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/control-labels.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isDescriptiveControlLabel} from '../src/control-labels.js';

test('self-explanatory control labels omit redundant tips while formatting abbreviations and glyphs retain names',/* Verify descriptive labels suppress redundant tips while terse formatting labels and glyphs still need explanations. */ ()=>{
 for(const label of ['Fork','Agent','↓ Markdown','Follow editor','Use custom','Source document','Copy selection to provenance clipboard'])assert.equal(isDescriptiveControlLabel(label),true,label);


 for(const label of ['', '¶','B','I','H4','H₁','Aa','↔','1 2 3'])assert.equal(isDescriptiveControlLabel(label),false,label);
});
