// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Source-neutral semantic label integration scenario
 *
 * Verify retained role-labelled claims render readable words without changing
 * exact source, protected storage, acknowledgement state or historical scope.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/text-relations-workflow.mjs)
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
 * Latest editing harness: Codex; version/build: Unknown (not exposed).
 * Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Owned synthetic runtime integration harness.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Exact text and anchors](../../docs/05-domain/text-and-anchors.md)
 *
 * Boundary: Semantic decorations are source-neutral retrospective assertions;
 * recorded review and wording are distinct from text ownership or checked
 * logical proof.
 */
import { expect } from '@playwright/test';

import { randomBytes } from 'node:crypto';

import { execFileSync } from 'node:child_process';

import { resolve } from 'node:path';

/** Check exact semantic relation controls, role inspection, review state, Undo, restart and snapshot-specific visibility. */
export async function exerciseTextRelations({ page, root, ok, api, checks, restart, database }) {
    const check = /** Fail the scenario when relation presentation changes source or violates retained claim scope. */ (v, m) => {
        if (!v)
            throw Error(m);
    }, command = /** Submit a setup or review command with a fresh operation identity. */    request => ok('commands', { operation: [...randomBytes(32)], request });
    const text = '# Semantic relations\r\n\r\n| Claim | Value |\r\n| --- | --- |\r\n| 😀 | é |\r\n\r\n$$\r\nE=mc^2\r\n$$\r\n\r\n## Below relation widgets\r\n\r\nFirst claim 😀. Second claim é.\r\n\r\nThird paragraph.\r\n\r\nFourth paragraph.';
    const document = (await command({ command: 'create', title: 'Synthetic semantic relations', text })).outcome.document;

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Synthetic semantic relations', exact: true }).click();
    const state = await ok('editor', { document }), byte = /** Compute UTF8 byte length for exact persisted participant boundaries. */    s => new TextEncoder().encode(s).length;
    const source = /** Build an exact historical participant anchor from fixture quote boundaries and committed source identity. */    quote => { const from = text.indexOf(quote); return { document, node: state.node, snapshot: state.snapshot, revision: state.base, occurrence_path: [state.occurrence], start_byte: byte(text.slice(0, from)), end_byte: byte(text.slice(0, from + quote.length)) }; };

    /** Create a registered source/target assertion using exact source quotes and acknowledged draft expectations. */
    async function create(choice, left, right, properties = { negated: false, certainty: 'unspecified', attribution: '', scope: '' }) { return command({ command: 'assertion', mutation: { action: 'create', predicate: { kind: 'registered', choice }, participants: [{ role: 'source', source: source(left), expected_draft: { generation: state.generation, sequence: state.acknowledged_sequence }, quote: left }, { role: 'target', source: source(right), expected_draft: { generation: state.generation, sequence: state.acknowledged_sequence }, quote: right }], properties } }); }
    await create('preview:ontological:determines', 'First claim 😀.', 'Second claim é.');
    await create('preview:epistemological:justifies', 'First claim 😀.', 'Second claim é.');
    await create('preview:rhetorical-discourse:contrasts', 'Third paragraph.', 'Fourth paragraph.');
    await create('preview:epistemological:justifies', 'Third paragraph.', 'Fourth paragraph.');
    await page.getByRole('button', { name: 'Refresh text relations', exact: true }).click();
    const labels = /** Locate only runtime-backed relationship labels inside the editor surface. */ () => page.locator('#editorHost .relationship-label[data-runtime-relation]');

    await expect(labels()).toHaveCount(4);
    const index = await ok('assertions', { document, snapshot: state.snapshot, generation: null, offset: 0, limit: 8 });
    const expected = index.entries.filter(/** Select retained proposed/accepted assertions whose word controls should be visible. */    e => ['proposed', 'accepted'].includes(e.record.status)).map(/** Derive the visible brace-enclosed label from the retained predicate definition. */    e => '{' + e.definition.definition.label + '}');
    check((await labels().allTextContents()).every(/** Require every rendered word to correspond to an actual retained definition. */    label => expected.includes(label)), 'Displayed labels do not name retained definitions');
    const hash = /** Fingerprint exact encrypted synthetic records through a read-only SQLite query to detect presentation mutation. */ () => execFileSync('python3', ['-c', 'import sqlite3,sys,hashlib; d=sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True); h=hashlib.sha256(); rows=d.execute("SELECT kind,id,generation,envelope FROM slots UNION ALL SELECT kind,id,0,envelope FROM objects ORDER BY kind,id").fetchall(); [(h.update(str(k).encode()),h.update(i),h.update(str(g).encode()),h.update(e)) for k,i,g,e in rows]; print(h.hexdigest())', database], { encoding: 'utf8' }).trim();
    const originalHash = hash(), editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    const copied = /** Copy current editor source to verify source-neutral relation controls never enter plain text. */ () => editor.evaluate(/** Dispatch a plain-text copy event from the owned editor selection. */    e => { const d = new DataTransfer(); e.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: d })); return d.getData('text/plain'); });
    check(await copied() === text, 'Decoration entered exact clipboard source');
    const inspectedId = await labels().first().getAttribute('data-relationship-id'), key = /** Encode assertion identity to match the inspected runtime relationship control. */    id => id.map(/** Encode one assertion identity byte as fixed-width hexadecimal. */    n => n.toString(16).padStart(2, '0')).join(''), inspectedEntry = index.entries.find(/** Resolve the inspected control to its retained assertion node. */    e => 'runtime:' + key(e.record.node) === inspectedId), participant = inspectedEntry.record.participants.find(/** Choose the source-role participant for exact historical quote inspection. */    p => p.role === 'source').source, expectedQuote = new TextDecoder().decode(new TextEncoder().encode(text).slice(participant.start_byte, participant.end_byte));

    await page.getByRole('button', { name: 'Collapse investigation panel', exact: true }).click();
    await labels().first().click();
    await expect(page.locator('.assertion-card.inspected')).toHaveCount(1);
    await expect(page.locator('#investigation')).not.toHaveClass(/collapsed/);
    check(await copied() === text, 'Inspection changed exact selection');
    await page.getByRole('button', { name: 'Inspect source participant', exact: true }).click();
    check(await page.getByRole('dialog').locator('pre').textContent() === expectedQuote, 'Inspection resolved a different participant');
    await page.getByRole('button', { name: 'Close source', exact: true }).click();
    await labels().nth(1).focus();
    await page.keyboard.press('Space');
    await expect(page.locator('.assertion-card.inspected')).toHaveCount(1);
    check(hash() === originalHash, 'Relation display or inspection changed protected storage');
    check(JSON.stringify(await ok('editor', { document })) === JSON.stringify(state), 'Relation display changed draft acknowledgement or committed head');
    checks.push('actual protected assertions render separate brace-enclosed words with exact role/source inspection; pointer/keyboard preserve ciphertext, source, selection and draft/head');
    await labels().first().click();
    await page.getByRole('button', { name: 'Accept assertion', exact: true }).click();
    await expect(page.locator('#editorHost [data-relationship-id="' + inspectedId + '"]').first()).toHaveAttribute('data-status', 'accepted');
    await page.getByRole('button', { name: 'Reject assertion', exact: true }).click();
    await expect(labels()).toHaveCount(3);
    await expect(page.locator('.assertion-card.inspected')).toContainText('Rejected');
    await page.getByRole('button', { name: 'Accept assertion', exact: true }).click();
    await expect(labels()).toHaveCount(4);
    check(JSON.stringify(await ok('editor', { document })) === JSON.stringify(state), 'Relation review changed text/head acknowledgement');
    checks.push('actual accepted/rejected relation reviews update word-control status or visibility while retaining the claim and exact immutable text');
    await expect(page.locator('#editorHost .relationship-paragraph button')).toHaveCount(2);
    checks.push('multiple distinct paragraph relations remain separate brace-word controls centered together in their exact source gap');
    await page.getByLabel('Maths display', { exact: true }).selectOption('rendered');
    await page.getByRole('button', { name: 'Below relation widgets', exact: true }).click();

    for (const theme of ['dark', 'light'])
        for (const width of [1280, 1600, 2000]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(/** Apply the requested desktop theme for relation word geometry checks. */    t => document.body.classList.toggle('light', t === 'light'), theme);
            await page.evaluate(/** Wait for two frames before measuring the centered paragraph relation row. */ () => new Promise(/** Coordinate the two-frame browser layout settlement wait. */    resolve => requestAnimationFrame(/** Advance the second frame before relation geometry measurement. */ () => requestAnimationFrame(resolve))));
            const layout = await page.locator('#editorHost .relationship-paragraph').evaluate(/** Measure relation-row centering and containment relative to its exact source line. */    marker => { const rect = marker.getBoundingClientRect(), line = marker.closest('.cm-line').getBoundingClientRect(); return { delta: (rect.left + rect.right - line.left - line.right) / 2, inside: rect.left >= line.left - 1 && rect.right <= line.right + 1 }; });
            check(Math.abs(layout.delta) < 2 && layout.inside, 'Paragraph relation words are not centered in their gap');
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-semantic-words-${theme}-${width}.png`), animations: 'disabled' });
        }
    await create('preview:ontological:is_determined_by', 'First claim 😀.', 'Second claim é.');
    await create('preview:epistemological:justifies', 'First claim 😀.', 'Second claim é.', { negated: true, certainty: 'possible', attribution: '', scope: '' });
    await page.getByRole('button', { name: 'Refresh text relations', exact: true }).click();
    await expect(labels()).toHaveCount(6);
    const qualified = await labels().allTextContents();
    check(qualified.includes('{is determined by}') && qualified.includes('{possible: not justifies}'), 'Word controls reversed or dropped recorded claim meaning');
    checks.push('registered reverse wording and explicit negation/certainty remain visible without changing stored predicate identity or participant roles');
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');
    await expect(labels()).toHaveCount(0);
    await page.keyboard.press('ControlOrMeta+z');
    await expect(labels()).toHaveCount(6);
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    check((await ok('editor', { document })).text === text, 'Relation decoration corrupted Undo or source');
    checks.push('sentence relation words and centered paragraph words use the same source-neutral layout in editor/Navigator across six desktop/theme views below table/math; changed draft hides controls and exact Undo restores matching controls');
    await restart();
    await page.getByRole('button', { name: 'Synthetic semantic relations', exact: true }).click();
    await expect(labels()).toHaveCount(6);
    check((await ok('editor', { document })).text === text, 'Restart changed relation source');
    check((await ok('assertions', { document, snapshot: state.snapshot, generation: null, offset: 0, limit: 8 })).total === 6, 'Restart lost retained relation identity');
    await page.getByRole('tab', { name: 'Concepts', exact: true }).click();
    await page.getByRole('button', { name: 'Commit', exact: true }).click();
    await expect(labels()).toHaveCount(0);
    await expect(page.locator('.text-relation-scope')).toContainText('0 in text');
    check((await ok('editor', { document })).text === text, 'Unchanged Commit normalized relation source');
    check((await ok('snapshot', { document, snapshot: state.snapshot })).text === text, 'New head changed earlier relation snapshot');
    checks.push('unchanged explicit Commit in another investigation pane clears old-snapshot controls while retaining exact earlier text and retrospective assertions');
    const other = (await command({ command: 'create', title: 'Synthetic unrelated text', text: 'Unrelated node.' })).outcome.document;
    check((await ok('assertions', { document: other, snapshot: (await ok('editor', { document: other })).snapshot, generation: null, offset: 0, limit: 8 })).total === 0, 'Relations leaked into another document');
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.evaluate(/** Restore default dark theme after relation restart and scope checks. */ () => document.body.classList.remove('light'));
    checks.push('retained exact semantic relation words reload after locked process restart and stay out of unrelated document scope');
}
