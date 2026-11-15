// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Retained historical comment integration scenario
 *
 * Publish exact historical comments through cancellation, stale preview, frozen
 * retry, inert markup, paging and cross-document response tests.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/comments-workflow.mjs)
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
 * Boundary: Comments remain separate from text snapshots and protected clipboard
 * references; their body is displayed as inert text and creates no source
 * authorship proof.
 */
import { expect } from '@playwright/test';

import { randomBytes } from 'node:crypto';

import { resolve } from 'node:path';

/** Check immutable exact-body comments and pinned historical passages without source, history or clipboard mutation. */
export async function exerciseComments({ page, ok, api, first, second, recovery, commands, dropReplies, restoreReplies, root, check, checks }) {
    const before = await ok('editor', { document: first }), clipboard = await ok('clipboard', { generation: null, offset: 0, limit: 16 }), capture = clipboard.entries.find(/** Choose an available captured passage from the first fixture document. */    e => e.available && JSON.stringify(e.source.document) === JSON.stringify(first)), key = /** Encode a protected capture identifier for the comment passage chooser. */    id => id.map(/** Encode one capture identifier byte as fixed-width hexadecimal. */    n => n.toString(16).padStart(2, '0')).join('');
    check(!!capture, 'Missing exact comment capture');
    const input = { document: first, snapshot: before.snapshot, next: null, limit: 8 }, body = 'SYNTHETIC-COMMENT 😀e\u0301\r\n<img src=x onerror="window.__commentExecuted=true">\rFinal thought.\n';

    await page.locator('[data-interaction="Comments"]').click();
    const panel = page.locator('#interactionBody');

    await expect(panel).toContainText('No retained comments');

    /** Open the comment composer, choose the protected source and wait for its exact historical quote. */
    async function compose() {
        await panel.getByRole('button', { name: 'Comment on a captured passage', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Comment on a committed passage' });

        await dialog.getByLabel('Captured comment passage', { exact: true }).selectOption(key(capture.id));
        await expect.poll(/** Read the comment preview text while awaiting its historical source resolution. */ () => dialog.locator('pre').textContent()).toBe(recovery);

        return dialog;
    }
    let dialog = await compose();

    await page.evaluate(/** Install one delayed anchor resolution to test clearing the comment source selection. */ () => {
        const actual = window.fetch.bind(window);
        let once = true, start;
        window.__commentPreviewStarted = new Promise(/** Publish a signal when the preview request enters the controlled delay. */    r => { start = r; });
        window.__restoreCommentPreview = /** Restore original browser fetch after the preview stale-response experiment. */
            () => { window.fetch = actual; };
        window.fetch = /** Delay one actual anchor resolution response without changing its server result. */
            async (...args) => {
                const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;
                const response = await actual(...args);

                if (once && inputUrl.endsWith('/api/v1/anchor/resolve')) {
                    once = false;
                    start();
                    await new Promise(/** Expose the preview response release callback. */    r => { window.__releaseCommentPreview = r; });
                }

                return response;
            };
    });
    await dialog.getByLabel('Captured comment passage', { exact: true }).selectOption('');
    await dialog.getByLabel('Captured comment passage', { exact: true }).selectOption(key(capture.id));
    await page.evaluate(/** Wait until the preview response has been captured before clearing the chosen passage. */ () => window.__commentPreviewStarted);
    await dialog.getByLabel('Captured comment passage', { exact: true }).selectOption('');
    await page.evaluate(/** Release the obsolete preview response and restore fetch. */ () => { window.__releaseCommentPreview(); window.__restoreCommentPreview(); });
    await expect(dialog.locator('pre')).toHaveText('Choose a retained committed passage.');
    await expect(dialog.getByRole('button', { name: 'Publish comment', exact: true })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    check((await ok('comments', input)).entries.length === 0, 'Canceled comment was published');
    dialog = await compose();
    const editor = dialog.getByRole('textbox', { name: 'Comment text', exact: true });

    await editor.focus();
    await editor.evaluate(/** Paste the exact mixed-newline comment body using the browser clipboard event path. */ (e, text) => { const data = new DataTransfer(); data.setData('text/plain', text); e.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })); }, body);
    await page.keyboard.press('ControlOrMeta+A');
    const copied = await editor.evaluate(/** Copy exact comment review text to detect Unicode or newline normalization. */    e => { const data = new DataTransfer(); e.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data })); return data.getData('text/plain'); });
    check(copied === body, 'Comment review normalized exact pasted bytes');

    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });

        for (const theme of ['dark', 'light']) {
            await page.evaluate(/** Apply the requested comment composer screenshot theme. */    theme => document.body.classList.toggle('light', theme === 'light'), theme);

            for (const section of ['top', 'bottom']) {
                await dialog.evaluate(/** Scroll the composer to the requested top or bottom screenshot section. */ (e, s) => { e.scrollTop = s === 'top' ? 0 : e.scrollHeight; }, section);
                await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-comment-review-${section}-${theme}-${width}.png`), animations: 'disabled' });
            }
        }
    }
    await page.evaluate(/** Restore the default dark theme after composer screenshots. */ () => document.body.classList.remove('light'));
    await page.setViewportSize({ width: 1600, height: 1000 });
    const offset = commands.length;

    await dropReplies('comment', 2);
    await dialog.getByRole('button', { name: 'Publish comment', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('Synthetic lost acknowledgement');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await restoreReplies();
    await panel.getByRole('button', { name: 'Retry comment publication', exact: true }).click();
    await expect(panel.locator('.comment-card')).toHaveCount(1);
    const recorded = await ok('comments', input);
    check(recorded.entries.length === 1 && recorded.entries[0].body === body && JSON.stringify(recorded.entries[0].source) === JSON.stringify(capture.source), 'Comment publication changed body or historical anchor');
    const calls = commands.slice(offset).filter(/** Select recorded comment publications after the dropped-acknowledgement boundary. */    c => c.request.command === 'comment');
    check(calls.length === 3 && calls.every(/** Require every comment retry to retain the frozen original operation body. */    c => JSON.stringify(c) === JSON.stringify(calls[0])), 'Comment retry changed frozen publication');
    await expect(panel.locator('.comment-body')).toHaveText(body, { useInnerText: false });
    await expect(panel.locator('img')).toHaveCount(0);
    check(await page.evaluate(/** Observe whether malicious-looking comment markup executed in the browser. */ () => window.__commentExecuted) === undefined, 'Comment markup executed');
    await panel.getByRole('button', { name: 'Inspect comment passage', exact: true }).click();
    const passage = page.getByRole('dialog', { name: 'Comment passage · read only' });
    check(await passage.locator('pre').textContent() === recovery, 'Comment passage followed a newer head');
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
    const invalid = { operation: [...randomBytes(32)], request: { command: 'comment', plan: { source: capture.source, expected_draft: { generation: before.generation, sequence: before.acknowledged_sequence + 1 }, quote: recovery, body: 'Stale editor' } } };
    check((await api('commands', invalid)).status === 409, 'Comment accepted stale editor context');

    for (let i = 0; i < 9; i++)
        await ok('commands', { operation: [...randomBytes(32)], request: { command: 'comment', plan: { source: capture.source, expected_draft: null, quote: recovery, body: `Retained synthetic comment ${i + 2}` } } });
    await panel.getByRole('button', { name: 'Refresh comments', exact: true }).click();
    await expect(panel.locator('.comment-card')).toHaveCount(8);
    await panel.getByRole('button', { name: 'Older comments', exact: true }).click();
    await expect(panel.locator('.comment-card')).toHaveCount(10);
    await expect(panel.getByRole('button', { name: 'Older comments', exact: true })).toBeHidden();
    await expect(panel.locator('.comment-body').last()).toHaveText(body, { useInnerText: false });

    for (const theme of ['dark', 'light']) {
        await page.evaluate(/** Apply the requested retained-comment panel screenshot theme. */    theme => document.body.classList.toggle('light', theme === 'light'), theme);
        await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-comments-${theme}.png`), animations: 'disabled' });
    }
    await page.evaluate(/** Restore dark theme after comment panel screenshots. */ () => document.body.classList.remove('light'));
    await page.evaluate(/** Install a delayed comments page to test document-switch response isolation. */ () => {
        const actual = window.fetch.bind(window);
        let once = true, start;
        window.__commentPageStarted = new Promise(/** Publish a signal when the comments page reaches its controlled delay. */    r => { start = r; });
        window.__restoreCommentPage = /** Restore original browser fetch after the delayed comment page experiment. */
            () => { window.fetch = actual; };
        window.fetch = /** Delay one actual comment-page response while the test switches active documents. */
            async (...args) => {
                const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;
                const response = await actual(...args);

                if (once && inputUrl.endsWith('/api/v1/comments')) {
                    once = false;
                    start();
                    await new Promise(/** Expose the retained comment-page response release callback. */    r => { window.__releaseCommentPage = r; });
                }

                return response;
            };
    });
    await panel.getByRole('button', { name: 'Refresh comments', exact: true }).click();
    await page.evaluate(/** Wait for comment-page capture before switching the active document. */ () => window.__commentPageStarted);
    await page.getByRole('button', { name: 'Second synthetic document', exact: true }).click();
    await expect(panel).toContainText('No retained comments');
    await page.evaluate(/** Release the obsolete comments page and restore fetch without changing its payload. */ () => { window.__releaseCommentPage(); window.__restoreCommentPage(); });
    await expect(panel.locator('.comment-card')).toHaveCount(0);
    await page.getByRole('button', { name: 'First synthetic document', exact: true }).click();
    await expect(panel.locator('.comment-card')).toHaveCount(8);
    check(JSON.stringify(await ok('editor', { document: first })) === JSON.stringify(before), 'Comments changed text/draft/history');
    check(JSON.stringify(await ok('clipboard', { generation: null, offset: 0, limit: 16 })) === JSON.stringify(clipboard), 'Comments consumed private captures');
    checks.push('immutable exact historical comments preserve body/source bytes, cancellation and frozen lost replies, inert markup, paging and stale-document isolation without text or clipboard writes');

    return { input, view: await ok('comments', input) };
}
