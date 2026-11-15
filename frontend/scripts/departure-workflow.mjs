// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Acknowledged node departure integration scenario
 *
 * Verify that leaving a changed node publishes one frozen Commit and waits for
 * acknowledgement while preserving exact source, Undo and historical
 * reconstruction.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/departure-workflow.mjs)
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
 * Boundary: Formatting and blur do not publish. Lost acknowledgements retain the
 * outgoing node and retry the original operation; this covers the currently
 * adopted departure scope.
 */
import { expect } from '@playwright/test';

import { randomBytes } from 'node:crypto';

import { resolve } from 'node:path';

/** Check automatic departure Commit, frozen retry, pending-edit lockout, exact Undo and restart reconstruction. */
export async function exerciseDeparture({ page, root, ok, paste, checks, dropReplies, restoreReplies, restart, commands }) {
    const check = /** Fail the scenario when departure identity, source or history differs from the expected invariant. */ (v, m) => {
        if (!v)
            throw Error(m);
    }, command = /** Submit one setup/runtime command with a new operation identity. */    request => ok('commands', { operation: [...randomBytes(32)], request });
    const seed = '# Departure evidence\r\n\r\n| Claim | Value |\r\n| --- | --- |\r\n| 😀 | e\u0301 |\r\n\r\n$$\r\nE=mc^2\r\n$$\r\n\r\n## Below departure widgets\r\n\r\nExact 中\rfinal';
    const source = (await command({ command: 'create', title: 'Synthetic departure source', text: seed })).outcome.document;

    await command({ command: 'create', title: 'Synthetic departure target', text: '' });
    await page.reload({ waitUntil: 'networkidle' });
    const sourceButton = /** Locate the outgoing fixture document control without caching a stale DOM element. */ () => page.getByRole('button', { name: 'Synthetic departure source', exact: true }), targetButton = /** Locate the destination fixture document control for repeated departure attempts. */ () => page.getByRole('button', { name: 'Synthetic departure target', exact: true }), editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await sourceButton().click();
    await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure source');
    const before = await ok('editor', { document: source }), text = seed + '\r\nLatest departure 😀';

    await paste(text);
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.getByRole('button', { name: 'Bold', exact: true }).click();
    await page.locator('#undo').click();
    await page.locator('#documentTitle').click();
    check(JSON.stringify((await ok('editor', { document: source })).snapshot) === JSON.stringify(before.snapshot), 'Formatting or DOM blur committed text');
    const operationOffset = commands.length;

    try {
        await dropReplies('commit', 2);
        await targetButton().click();
        await expect(page.locator('#toast')).toContainText('Could not leave this node');
        await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure source');
        await expect(editor).toHaveAttribute('contenteditable', 'true');
        await restoreReplies();
        await targetButton().click();
        await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure target');
    }
    finally {
        await restoreReplies();
    }
    const operations = commands.slice(operationOffset).filter(/** Select only recorded Commit attempts for the outgoing fixture document. */    body => body.request.command === 'commit' && JSON.stringify(body.request.document) === JSON.stringify(source)).map(/** Extract operation identities from departure Commit attempts. */    body => body.operation);
    check(operations.length === 3 && operations.every(/** Require every retry to retain the first departure operation identity. */    op => JSON.stringify(op) === JSON.stringify(operations[0])), 'Departure did not retry the original frozen Commit');
    const committed = await ok('editor', { document: source });
    check((await ok('snapshot', { document: source, snapshot: committed.snapshot })).text === text, 'Departure lost exact mixed-newline source');
    check((await ok('snapshot', { document: source, snapshot: before.snapshot })).text === seed, 'Departure changed earlier history');
    checks.push('node departure auto-commits exact text; ordinary formatting/blur does not publish; lost Commit keeps outgoing node active and retries one original operation');
    await sourceButton().click();
    await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure source');
    await targetButton().click();
    await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure target');
    check(JSON.stringify((await ok('editor', { document: source })).base) === JSON.stringify(committed.base), 'Unchanged revisit created another revision');
    await sourceButton().click();
    await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure source');
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');
    await page.evaluate(/** Install a delayed Commit acknowledgement to observe the blocked departure UI. */ () => {
        const actual = window.fetch.bind(window);
        window.__restoreDeparture = /** Restore the original browser fetch after the delayed departure experiment. */
            () => window.fetch = actual;
        window.fetch = /** Retain an actual Commit response while signaling that departure has reached acknowledgement waiting. */
            async (...args) => {
                const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;
                const response = await actual(...args);

                if (inputUrl.endsWith('/api/v1/commands') && JSON.parse(inputBody).request.command === 'commit') {
                    window.__departureStarted = true;
                    await new Promise(/** Expose a deliberate release callback for the delayed departure response. */    resolve => window.__releaseDeparture = resolve);
                }

                return response;
            };
    });

    try {
        await targetButton().click();
        await expect.poll(/** Poll browser interception readiness before asserting outgoing editor lockout. */ () => page.evaluate(/** Read whether the delayed departure response has been captured. */ () => !!window.__departureStarted)).toBe(true);
        await expect(editor).toHaveAttribute('contenteditable', 'false');
        await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure source');
        await page.evaluate(/** Release the delayed acknowledgement so destination activation may proceed. */ () => window.__releaseDeparture());
        await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure target');
    }
    finally {
        await page.evaluate(/** Release any pending response, restore fetch and remove test-only browser state even on failure. */ () => { window.__releaseDeparture?.(); window.__restoreDeparture?.(); delete window.__releaseDeparture; delete window.__restoreDeparture; delete window.__departureStarted; });
    }
    await sourceButton().click();
    await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure source');
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+z');
    await page.keyboard.press('ControlOrMeta+A');
    const selected = await editor.evaluate(/** Copy exact source after Undo to prove departure did not rewrite the editor buffer. */    e => { const data = new DataTransfer(); e.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data })); return data.getData('text/plain'); });
    check(selected === text, 'Departure changed exact source or Undo');
    checks.push('delayed node departure waits for acknowledgement before destination editing; unchanged revisits skip publication and exact Undo survives round trips');

    for (const theme of ['dark', 'light'])
        for (const width of [1280, 1600, 2000]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(/** Apply the requested desktop theme below table/math widgets. */    t => document.body.classList.toggle('light', t === 'light'), theme);
            await page.getByLabel('Maths display', { exact: true }).selectOption('rendered');
            await page.getByRole('button', { name: 'Below departure widgets', exact: true }).click();
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-departure-${theme}-${width}.png`), animations: 'disabled' });
        }
    await targetButton().click();
    await expect(page.locator('#documentTitle')).toHaveText('Synthetic departure target');
    const final = await ok('editor', { document: source });

    await restart();
    check(JSON.stringify((await ok('editor', { document: source })).snapshot) === JSON.stringify(final.snapshot), 'Restart lost departure publication');
    check((await ok('snapshot', { document: source, snapshot: final.snapshot })).text === text, 'Restart normalized departure snapshot');
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.evaluate(/** Restore dark theme after restart and departure geometry checks. */ () => document.body.classList.remove('light'));
    checks.push('automatic departure publications and prior exact history survive locked process restart; source below table/math remains usable at three desktop widths in both themes');
}
