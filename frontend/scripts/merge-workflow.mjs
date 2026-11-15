// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Reviewed synthesis publication integration scenario
 *
 * Review exact captured inputs and output, then verify frozen retry, independent
 * identity, retained provenance and locked restart behavior.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/merge-workflow.mjs)
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
 * Boundary: This tests the current reviewed-new-document synthesis scope;
 * cross-identity inputs never become same-node revision parents and source
 * authorship remains unknown.
 */
import { randomBytes } from 'node:crypto';

import { resolve } from 'node:path';

import { expect } from '@playwright/test';

/** Check cancellation, exact review/Undo, idempotent publication, ordered provenance and locked restart of one independent synthesis. */
export async function exerciseReviewedMerge({ page, ok, api, first, forkDocument, recovery, root, commands, dropReplies, restoreReplies, start, stop, open, unlock, check, checks }) {
    const before = await ok('editor', { document: first }), fork = await ok('editor', { document: forkDocument }), clip = await ok('clipboard', { generation: null, offset: 0, limit: 16 });
    const extra = { document: forkDocument, node: fork.node, snapshot: fork.snapshot, revision: fork.base, occurrence_path: [fork.occurrence], start_byte: 0, end_byte: new TextEncoder().encode(fork.text).length };
    const captured = await ok('commands', { operation: [...randomBytes(32)], request: { command: 'clipboard', mutation: { action: 'capture', generation: clip.generation, source: extra, expected_draft: null, quote: fork.text } } });
    const reviewClipboard = await ok('clipboard', { generation: null, offset: 0, limit: 16 }), a = reviewClipboard.entries.find(/** Find the captured reference from the original input document. */    e => JSON.stringify(e.source.document) === JSON.stringify(first)), b = reviewClipboard.entries.find(/** Find the newly captured reference by its protected clipboard entry identity. */    e => JSON.stringify(e.id) === JSON.stringify(captured.outcome.state.entry)), key = /** Encode a protected reference identifier for the browser selection control. */    id => id.map(/** Encode one identifier byte as fixed-width hexadecimal. */    n => n.toString(16).padStart(2, '0')).join('');
    const count = (await ok('documents', {})).length;

    await page.getByRole('button', { name: 'Merge', exact: true }).click();
    let dialog = page.getByRole('dialog', { name: 'Merge into a new document' });

    await expect(dialog.getByRole('button', { name: 'Publish reviewed synthesis' })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    check((await ok('documents', {})).length === count, 'Cancelled merge created an output');
    await page.getByRole('button', { name: 'Merge', exact: true }).click();
    dialog = page.getByRole('dialog', { name: 'Merge into a new document' });
    await dialog.getByLabel('Merged document name').fill('Reviewed synthetic synthesis');
    const boxes = dialog.locator('fieldset');

    for (const [i, e] of [a, b].entries()) {
        await boxes.nth(i).getByLabel('Captured merge input').selectOption(key(e.id));
        await expect(boxes.nth(i).locator('pre')).toHaveText(i === 0 ? recovery : fork.text);
        check(await boxes.nth(i).locator('pre').textContent() === (i === 0 ? recovery : fork.text), 'Merge input preview normalized pinned bytes');
    }
    const text = 'SYNTHETIC-REVIEWED-MERGE 😀\r\nNew interpretation e\u0301中.\rRetained inputs are not proof.\n';
    const output = dialog.getByRole('textbox', { name: 'Reviewed merge output' });

    await output.focus();
    await output.evaluate(/** Paste the reviewed mixed-newline synthesis through the browser clipboard event path. */ (element, text) => { const data = new DataTransfer(); data.setData('text/plain', text); element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })); }, text);
    // Separate the synthetic typing from the paste's normal 500ms undo group.
    await page.waitForTimeout(650);
    await page.keyboard.type(' temporary review edit');
    await page.keyboard.press('ControlOrMeta+z');
    await page.keyboard.press('ControlOrMeta+A');
    const exact = await output.evaluate(/** Copy the review editor exact source after Undo to verify the original pasted output was restored. */    element => { const data = new DataTransfer(); element.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data })); return data.getData('text/plain'); });
    check(exact === text, 'Review typing/undo did not restore exact pasted output');

    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });

        for (const theme of ['dark', 'light']) {
            if (theme === 'light')
                await page.evaluate(/** Switch to light theme for reviewed-synthesis desktop screenshots. */ () => document.body.classList.toggle('light'));

            for (const section of ['top', 'bottom']) {
                await dialog.evaluate(/** Scroll the review dialog to its top or bottom for complete desktop inspection. */ (e, section) => { e.scrollTop = section === 'top' ? 0 : e.scrollHeight; }, section);
                await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-merge-review-${section}-${theme}-${width}.png`), animations: 'disabled' });
            }
        }
        await page.evaluate(/** Restore dark theme after each review screenshot pair. */ () => document.body.classList.toggle('light'));
    }
    await page.setViewportSize({ width: 1600, height: 1000 });
    const offset = commands.length;

    await dropReplies('merge', 2);
    await dialog.getByRole('button', { name: 'Publish reviewed synthesis' }).click();
    await expect(dialog.getByRole('alert')).toContainText('Synthetic lost acknowledgement');
    await expect(dialog.getByRole('button', { name: 'Publish reviewed synthesis' })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await restoreReplies();
    await page.getByRole('button', { name: 'Retry merge', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('Reviewed synthetic synthesis');
    const merges = (await ok('documents', {})).filter(/** Locate synthesis outputs by the unique fixture title to detect duplicate publication. */    d => d.title === 'Reviewed synthetic synthesis');
    check(merges.length === 1, 'Lost merge reply duplicated output');
    const document = merges[0].document, event = await ok('merge', { document }), initial = await ok('editor', { document });
    check(initial.text === text && JSON.stringify(initial.node) !== JSON.stringify(before.node) && JSON.stringify(initial.node) !== JSON.stringify(fork.node), 'Merge lost exact independent output');
    check((await ok('history', { document, next: null, limit: 12 })).entries[0].parent === null, 'Merge inserted cross-identity revision parents');
    check(event.kind === 'reviewed_synthesis' && event.source_authorship === 'unknown' && JSON.stringify(event.inputs) === JSON.stringify([a.source, b.source]) && JSON.stringify(event.outputs[0].snapshot) === JSON.stringify(initial.snapshot), 'Merge lost ordered provenance or invented source authorship');
    const calls = commands.slice(offset).filter(/** Select recorded Merge commands after the lost-acknowledgement boundary. */    c => c.request.command === 'merge');
    check(calls.length === 3 && calls.every(/** Require every Merge retry to preserve the exact original frozen operation body. */    c => JSON.stringify(c) === JSON.stringify(calls[0])), 'Merge retry changed reviewed operation');
    check(JSON.stringify(await ok('editor', { document: first })) === JSON.stringify(before) && JSON.stringify(await ok('editor', { document: forkDocument })) === JSON.stringify(fork), 'Merge changed an input buffer/history');
    check(JSON.stringify(await ok('clipboard', { generation: null, offset: 0, limit: 16 })) === JSON.stringify(reviewClipboard), 'Merge consumed private references');
    await page.locator('[data-investigation="Provenance"]').click();
    await expect(page.locator('#investigationBody')).toContainText('original sentence authorship is unknown');
    await page.getByRole('button', { name: 'Inspect exact merge input 1', exact: true }).click();
    check(await page.getByRole('dialog').locator('pre').textContent() === recovery, 'Merge provenance followed source head');
    await page.getByRole('button', { name: 'Close source', exact: true }).click();
    await stop();
    await open(await start(false));
    await expect(page.getByRole('button', { name: 'Unlock workspace', exact: true })).toBeVisible();
    check((await api('merge', { document })).status === 423, 'Locked runtime exposed synthesis provenance');
    await unlock();
    check(JSON.stringify(await ok('merge', { document })) === JSON.stringify(event), 'Restart changed merge provenance');
    check((await ok('snapshot', { document, snapshot: initial.snapshot })).text === text, 'Restart lost reviewed output snapshot');
    const after = await ok('clipboard', { generation: null, offset: 0, limit: 16 });

    await ok('commands', { operation: [...randomBytes(32)], request: { command: 'clipboard', mutation: { action: 'remove', generation: after.generation, entry: captured.outcome.state.entry } } });
    await page.getByRole('button', { name: 'Refresh clipboard', exact: true }).click();
    await expect(page.locator('.clipboard .clip-chip')).toHaveCount(1);
    await page.getByRole('button', { name: 'First synthetic document', exact: true }).click();
    checks.push('reviewed new-document synthesis preserves exact mixed-newline output and ordered independent inputs through cancellation, frozen lost replies, provenance inspection and locked restart');

    return { document, event, text };
}
