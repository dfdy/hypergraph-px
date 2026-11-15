// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Retrospective assertion integration scenario
 *
 * Exercise exact historical participant anchors, retained judgement history,
 * frozen acknowledgement recovery and captured-source n-ary declaration.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/assertion-workflow.mjs)
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
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Exact text and anchors](../../docs/05-domain/text-and-anchors.md)
 *
 * Boundary: Assertions and review acceptance are retrospective overlay records,
 * not text snapshots or checked proofs; participant roles and exact sources
 * remain explicit.
 */
import { expect } from '@playwright/test';

import { resolve } from 'node:path';

/** Check assertion create/review retries, retained judgement history, deduplication and n-ary captured-source review without text mutation. */
export async function exerciseAssertionOverlay({ page, ok, first, recovery, paste, dropReplies, restoreReplies, commands, check, root, checks }) {
    const previous = await ok('editor', { document: first });
    const text = 'First claim 😀.\r\nContinuation e\u0301.\r\n\r\nSecond claim 中.\r\n';

    await paste(text);
    await page.getByRole('button', { name: 'Commit', exact: true }).click();
    await expect.poll(/** Wait for the exact new committed fixture snapshot rather than accepting unchanged editor text alone. */ async () => { const state = await ok('editor', { document: first }); return JSON.stringify(state.snapshot) !== JSON.stringify(previous.snapshot) && (await ok('snapshot', { document: first, snapshot: state.snapshot })).text === text; }).toBe(true);
    const source = await ok('editor', { document: first }), input = { document: first, snapshot: source.snapshot, generation: null, offset: 0, limit: 8 };

    /** Open a selected-source relationship review and choose the registered equivalence predicate. */
    async function openRelation() {
        await page.getByRole('textbox', { name: 'Markdown document editor' }).focus();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Shift+F10');
        await page.getByRole('menuitem', { name: 'Add relations', exact: true }).click();
        const dialog = page.getByRole('dialog');

        await expect(dialog).toContainText('proposed retrospective assertion');
        await dialog.getByRole('combobox', { name: 'Search relationships', exact: true }).fill('logically equivalent');
        await dialog.getByLabel('Relationship type', { exact: true }).selectOption('preview:logical-argumentative:is_equivalent_to');

        return dialog;
    }
    let dialog = await openRelation();
    check(await dialog.locator('pre').first().textContent() === 'First claim 😀.\r\nContinuation e\u0301.', 'Relationship review normalized exact source');
    const offset = commands.length;

    await dropReplies('assertion', 2);
    await dialog.getByRole('button', { name: 'Add relation', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('Synthetic lost acknowledgement');
    const uncertain = await ok('assertions', input);
    check(uncertain.total === 1 && uncertain.generation === 1 && uncertain.entries[0].record.status === 'proposed', 'Unknown assertion create did not publish one proposed record');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await restoreReplies();
    await expect(page.getByRole('button', { name: 'Retry assertion operation', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Retry assertion operation', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry assertion operation', exact: true })).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Show all retained assertions in this document' }).check();
    await expect(page.locator('.assertion-card')).toHaveCount(1);
    const creates = commands.slice(offset).filter(/** Select recorded assertion creation attempts after the lost-reply boundary. */    c => c.request.command === 'assertion' && c.request.mutation.action === 'create');
    check(creates.length === 3 && creates.every(/** Require every creation retry to retain the original frozen command body. */    c => JSON.stringify(c) === JSON.stringify(creates[0])), 'Assertion create retry changed frozen operation');
    check(JSON.stringify(await ok('editor', { document: first })) === JSON.stringify(source), 'Assertion creation changed source/head/history');
    await page.getByRole('button', { name: 'Inspect source participant', exact: true }).click();
    check(await page.getByRole('dialog').locator('pre').textContent() === 'First claim 😀.\r\nContinuation e\u0301.', 'Assertion source inspection changed historical bytes');
    await page.getByRole('button', { name: 'Close source', exact: true }).click();
    await page.getByRole('button', { name: 'Accept assertion', exact: true }).click();
    await expect(page.locator('.assertion-card')).toContainText('Accepted');
    const accepted = await ok('assertions', input);
    const reviewOffset = commands.length;

    await dropReplies('assertion', 2);
    await page.getByRole('button', { name: 'Reject assertion', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry assertion operation', exact: true })).toBeVisible();
    const rejected = await ok('assertions', input);
    check(rejected.entries[0].record.status === 'rejected' && JSON.stringify(rejected.entries[0].record.parent) === JSON.stringify(accepted.entries[0].revision), 'Review did not retain previous judgement ancestry');
    await restoreReplies();
    await page.getByRole('button', { name: 'Retry assertion operation', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry assertion operation', exact: true })).toHaveCount(0);
    const reviews = commands.slice(reviewOffset).filter(/** Select assertion review attempts after the review acknowledgement failure. */    c => c.request.command === 'assertion');
    check(reviews.length === 3 && reviews.every(/** Require every judgement retry to retain the original review operation body. */    c => JSON.stringify(c) === JSON.stringify(reviews[0])), 'Assertion review retry changed original operation');
    check(JSON.stringify(await ok('assertions', input)) === JSON.stringify(rejected), 'Review retry published another judgement');
    await page.getByRole('button', { name: 'Review history', exact: true }).click();
    const historyDialog = page.getByRole('dialog');

    await expect(historyDialog.getByRole('status')).toHaveText('Rejected · assertion revision 3');
    await historyDialog.getByRole('button', { name: 'Earlier judgement', exact: true }).click();
    await expect(historyDialog.getByRole('status')).toHaveText('Accepted · assertion revision 2');
    await historyDialog.getByRole('button', { name: 'Inspect source participant 1', exact: true }).click();
    check(await page.getByRole('dialog').filter({ hasText: 'Historical assertion participant · read only' }).locator('pre').textContent() === 'First claim 😀.\r\nContinuation e\u0301.', 'Review history changed pinned participant bytes');
    await page.getByRole('button', { name: 'Close source', exact: true }).click();

    for (const theme of ['dark', 'light']) {
        if (theme === 'light')
            await page.evaluate(/** Switch to light theme for retained judgement history screenshots. */ () => document.body.classList.toggle('light'));
        await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-assertion-history-${theme}.png`), animations: 'disabled' });
    }
    await page.evaluate(/** Restore dark theme after judgement history capture. */ () => document.body.classList.toggle('light'));
    await historyDialog.getByRole('button', { name: 'Earlier judgement', exact: true }).click();
    await expect(historyDialog.getByRole('status')).toHaveText('Proposed · assertion revision 1');
    await expect(historyDialog.getByRole('button', { name: 'Earlier judgement', exact: true })).toBeDisabled();
    await historyDialog.getByRole('button', { name: 'Later judgement', exact: true }).click();
    await expect(historyDialog.getByRole('status')).toHaveText('Accepted · assertion revision 2');
    await historyDialog.getByRole('button', { name: 'Later judgement', exact: true }).click();
    await expect(historyDialog.getByRole('status')).toHaveText('Rejected · assertion revision 3');
    await historyDialog.getByRole('button', { name: 'Close history', exact: true }).click();
    check(JSON.stringify(await ok('editor', { document: first })) === JSON.stringify(source), 'Review history mutated source/head');
    checks.push('exact assertion judgement history and participant inspection preserve earlier proposed/accepted states without rewriting current rejected view or text');

    for (const theme of ['dark', 'light']) {
        if (theme === 'light')
            await page.evaluate(/** Switch to light theme for retained assertion card screenshots. */ () => document.body.classList.toggle('light'));
        await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-assertions-${theme}.png`), animations: 'disabled' });
    }
    await page.evaluate(/** Restore dark theme after assertion card capture. */ () => document.body.classList.toggle('light'));
    dialog = await openRelation();
    await dialog.getByRole('button', { name: 'Add relation', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    const dedup = await ok('assertions', input);
    check(dedup.total === 1 && dedup.generation === rejected.generation && dedup.entries[0].record.status === 'rejected', 'Duplicate wording reset an existing reviewed assertion');
    await paste(text.replace('First claim', 'Changed claim'));
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    dialog = await openRelation();
    await dialog.getByRole('button', { name: 'Add relation', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('Commit this source');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    check((await ok('assertions', input)).generation === rejected.generation, 'Uncommitted assertion changed overlay');
    await paste(recovery);
    await page.getByRole('button', { name: 'Commit', exact: true }).click();
    await expect.poll(/** Wait until the recovery source is present in the committed snapshot. */ async () => { const state = await ok('editor', { document: first }); return (await ok('snapshot', { document: first, snapshot: state.snapshot })).text; }).toBe(recovery);
    await expect(page.locator('#investigationBody')).toContainText('0 assertions at the current caret');
    await page.getByRole('checkbox', { name: 'Show all retained assertions in this document' }).check();
    await expect(page.locator('.assertion-card')).toHaveCount(1);
    const current = await ok('editor', { document: first }), retrospective = await ok('assertions', { ...input, snapshot: current.snapshot });
    check(retrospective.text_snapshot_scope === 'semantic_assertions_excluded' && JSON.stringify(retrospective.entries[0].record.participants) === JSON.stringify(rejected.entries[0].record.participants), 'New text snapshot relocated old participant anchors');
    checks.push('retrospective assertions preserve exact participants and text snapshots through lost create/review replies, retained review, deduplication and source edits');
    const clipboard = await ok('clipboard', { generation: null, offset: 0, limit: 16 }), captured = clipboard.entries.find(/** Find an available retained capture for the n-ary participant declaration. */    e => e.available);
    check(!!captured, 'Missing captured source for declaration review');
    const { document: documentId, snapshot, revision, occurrence_path, start_byte, end_byte } = captured.source, quote = (await ok('anchor/resolve', { document: documentId, snapshot, revision, occurrence_path, start_byte, end_byte })).text;
    const beforeDeclaration = await ok('editor', { document: first }), key = /** Encode a protected capture identifier for the participant source chooser. */    id => id.map(/** Encode one capture identity byte as fixed-width hexadecimal. */    n => n.toString(16).padStart(2, '0')).join('');

    await page.getByRole('button', { name: 'Declare captured-source assertion', exact: true }).click();
    let composer = page.getByRole('dialog', { name: 'Declare a role-labelled assertion' });

    await expect(composer.getByRole('button', { name: 'Propose assertion', exact: true })).toBeDisabled();
    await composer.getByRole('button', { name: 'Cancel', exact: true }).click();
    check((await ok('assertions', input)).total === 1, 'Cancelled declaration published a claim');
    await page.getByRole('button', { name: 'Declare captured-source assertion', exact: true }).click();
    composer = page.getByRole('dialog', { name: 'Declare a role-labelled assertion' });
    await composer.getByLabel('Assertion name', { exact: true }).fill('Grouped claims');
    await composer.getByLabel('Meaning and interpretation', { exact: true }).fill('Synthetic owner-declared n-ary claim, not a proof.');
    await composer.getByLabel('Scope or premises', { exact: true }).fill('Synthetic only');
    await composer.getByRole('button', { name: 'Add participant', exact: true }).click();
    const participants = composer.locator('fieldset');

    await expect(participants).toHaveCount(3);
    await page.evaluate(/** Install a delayed participant resolution to verify cleared choices reject stale previews. */ () => {
        const actual = window.fetch.bind(window);
        let once = true, start;
        window.__composerStarted = new Promise(/** Publish readiness when the composer source request reaches its controlled delay. */    r => { start = r; });
        window.__restoreComposerFetch = /** Restore the original browser fetch after participant preview isolation testing. */
            () => { window.fetch = actual; };
        window.fetch = /** Delay one actual anchor response while preserving its server-produced body. */
            async (...args) => {
                const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;
                const response = await actual(...args);

                if (inputUrl.endsWith('/api/v1/anchor/resolve') && once) {
                    once = false;
                    start();
                    await new Promise(/** Expose the controlled participant response release callback. */    r => { window.__releaseComposerSource = r; });
                }

                return response;
            };
    });
    await participants.first().getByLabel('Captured source', { exact: true }).selectOption(key(captured.id));
    await page.evaluate(/** Wait for participant source capture before clearing the chosen source. */ () => window.__composerStarted);
    await participants.first().getByLabel('Captured source', { exact: true }).selectOption('');
    await page.evaluate(/** Release the obsolete participant response and restore original fetch. */ () => { window.__releaseComposerSource(); window.__restoreComposerFetch(); });
    await expect(participants.first().locator('pre')).toHaveText('Choose a captured source.');
    await expect(composer.getByRole('button', { name: 'Propose assertion', exact: true })).toBeDisabled();

    for (let i = 0; i < 3; i++) {
        await participants.nth(i).getByLabel('Captured source', { exact: true }).selectOption(key(captured.id));
        await participants.nth(i).getByLabel('Participant role', { exact: true }).fill(i === 2 ? 'conclusion' : 'premise');
        await expect(participants.nth(i).locator('pre')).toHaveText(quote, { useInnerText: false });
        check(await participants.nth(i).locator('pre').textContent() === quote, 'Composer normalized historical source');
    }

    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });

        for (const theme of ['dark', 'light']) {
            if (theme === 'light')
                await page.evaluate(/** Switch to light theme for n-ary declaration composer capture. */ () => document.body.classList.toggle('light'));
            await composer.evaluate(/** Scroll the participant composer to its top for screenshot inspection. */    e => { e.scrollTop = 0; });
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-assertion-composer-${theme}-${width}.png`), animations: 'disabled' });
            await composer.evaluate(/** Scroll the participant composer to its bottom for screenshot inspection. */    e => { e.scrollTop = e.scrollHeight; });
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-assertion-composer-bottom-${theme}-${width}.png`), animations: 'disabled' });
        }
        await page.evaluate(/** Restore dark theme after each declaration screenshot pair. */ () => document.body.classList.toggle('light'));
    }
    await page.setViewportSize({ width: 1600, height: 1000 });
    const declarationOffset = commands.length;

    await dropReplies('assertion', 2);
    await composer.getByRole('button', { name: 'Propose assertion', exact: true }).click();
    await expect(composer.getByRole('alert')).toContainText('Synthetic lost acknowledgement');
    await expect(composer.getByRole('button', { name: 'Propose assertion', exact: true })).toBeDisabled();
    await composer.getByRole('button', { name: 'Cancel', exact: true }).click();
    await restoreReplies();
    await page.getByRole('button', { name: 'Retry assertion operation', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry assertion operation', exact: true })).toHaveCount(0);
    const calls = commands.slice(declarationOffset).filter(/** Select n-ary assertion publication attempts after the lost-acknowledgement boundary. */    c => c.request.command === 'assertion');
    check(calls.length === 3 && calls.every(/** Require every n-ary declaration retry to retain the frozen reviewed operation. */    c => JSON.stringify(c) === JSON.stringify(calls[0])), 'Captured declaration retry changed frozen claim');
    check(JSON.stringify(await ok('editor', { document: first })) === JSON.stringify(beforeDeclaration), 'Captured declaration changed source state');
    check(JSON.stringify(await ok('clipboard', { generation: null, offset: 0, limit: 16 })) === JSON.stringify(clipboard), 'Captured declaration consumed or changed clipboard');
    const view = await ok('assertions', input), nary = view.entries.find(/** Find the retained custom grouped-claims definition in the assertion view. */    e => e.definition.definition.label === 'Grouped claims');
    check(view.total === 2 && nary.record.participants.length === 3 && nary.record.participants.every(/** Require each repeated-role participant to retain the exact captured historical source. */    p => JSON.stringify(p.source) === JSON.stringify(captured.source)), 'Reviewed declaration lost exact ordered participant sources');
    checks.push('reviewed captured-source n-ary UI preserves repeated roles and historical bytes through cancellation and frozen lost-reply recovery without source or clipboard mutation');

    return { input, view, nary: nary.record.node, narySource: quote };
}
