// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Scoped publication contributor integration scenario
 *
 * Verify the authenticated human publication view across pinned cursors,
 * restart, identity color stability and stale cross-document responses.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/contributors-workflow.mjs)
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
 *
 * Boundary: Publication evidence does not establish original sentence
 * authorship, complete contributors or a current agent; no such identities are
 * invented.
 */
import { randomBytes } from 'node:crypto';

import { expect } from '@playwright/test';

import { resolve } from 'node:path';

/** Check pinned publication contributor evidence, stable principal identity/color and read-only stale-response isolation. */
export async function exerciseContributors({ page, ok, api, first, second, start, stop, open, unlock, root, check, checks }) {
    const key = /** Encode workspace principal identity for comparison with rendered contributor metadata. */    id => id.map(/** Encode one principal byte as fixed-width hexadecimal. */    n => n.toString(16).padStart(2, '0')).join(''), before = await ok('editor', { document: first }), pinned = { document: first, snapshot: before.snapshot, cursor: null, limit: 1 }, initial = await ok('contributors/publications', pinned);
    check(initial.current_agent === null && !initial.complete_contributors && initial.publications[0].role === 'publisher', 'Contributor scope invented an agent, authorship or completeness');

    for (let i = 0; i < 17; i++) {
        const s = await ok('editor', { document: first }), saved = await ok('commands', { operation: [...randomBytes(32)], request: { command: 'save', document: first, generation: s.generation, base: s.base, previous_sequence: s.acknowledged_sequence, sequence: s.acknowledged_sequence + 1, text: s.text } });

        await ok('commands', { operation: [...randomBytes(32)], request: { command: 'commit', document: first, generation: saved.outcome.generation, base: s.base, sequence: saved.outcome.sequence } });
    }
    const latest = await ok('editor', { document: first }), historical = await ok('contributors/publications', pinned);
    check(JSON.stringify(historical.publications) === JSON.stringify(initial.publications), 'Historical contributor view followed a newer head');

    if (initial.next !== null) {
        const tampered = structuredClone(initial.next);
        tampered[20] ^= 1;
        check((await api('contributors/publications', { ...pinned, cursor: tampered })).status === 400, 'Contributor cursor tampering was accepted');
        check((await api('contributors/publications', { ...pinned, snapshot: latest.snapshot, cursor: initial.next })).status === 400, 'Contributor cursor escaped its snapshot');
    }
    await stop();
    await open(await start(false));
    await expect(page.getByRole('button', { name: 'Unlock workspace', exact: true })).toBeVisible();
    check((await api('contributors/publications', pinned)).status === 423, 'Locked contributor query exposed context');
    await unlock();
    await expect(page.getByRole('textbox', { name: 'Markdown document editor' })).toBeVisible();

    if (initial.next !== null) {
        const old = await ok('contributors/publications', { ...pinned, cursor: initial.next });
        check(old.publications.every(/** Exclude the newer publication revision from a cursor pinned to an older snapshot. */    e => JSON.stringify(e.revision) !== JSON.stringify(latest.base)), 'Restarted cursor read a newer publication');
    }
    await page.getByRole('textbox', { name: 'Markdown document editor' }).focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.locator('[data-interaction="Users"]').click();
    const panel = page.locator('#interactionBody');

    await expect(panel.locator('.contributor')).toHaveCount(1);
    await expect(panel).toContainText('No current agent');
    await expect(panel).toContainText(initial.current_human.label);
    check(await panel.locator('.contributor').getAttribute('data-principal') === key(initial.current_human.principal), 'Current human was not resolved by principal identity');
    await expect(panel.getByRole('button', { name: 'More publication evidence', exact: true })).toBeVisible();
    const colour = await panel.locator('.dot').evaluate(/** Read the initial contributor color from computed browser style. */    e => getComputedStyle(e).backgroundColor);

    await panel.getByRole('button', { name: 'More publication evidence', exact: true }).click();
    await expect(panel.locator('.contributor')).toHaveCount(1);
    check(await panel.locator('.dot').evaluate(/** Read the paged contributor color to verify principal identity styling remains stable. */    e => getComputedStyle(e).backgroundColor) === colour, 'Contributor pagination changed principal colour');
    await panel.getByRole('button', { name: 'Inspect publication evidence', exact: true }).click();
    const evidence = page.getByRole('dialog', { name: 'Recorded publication evidence' });

    await expect(evidence.locator('article')).toHaveCount(8);
    await evidence.getByRole('button', { name: 'Inspect publication snapshot', exact: true }).first().click();
    const snapshot = page.getByRole('dialog').filter({ hasText: 'Publication snapshot · read only' });
    check(await snapshot.locator('pre').textContent() === latest.text, 'Contributor evidence normalized exact publication snapshot');
    await snapshot.getByRole('button', { name: 'Close snapshot', exact: true }).click();
    await evidence.getByRole('button', { name: 'Older evidence', exact: true }).click();
    await expect(evidence.getByRole('status')).toContainText('evidence page 2');
    await evidence.getByRole('button', { name: 'Newer evidence', exact: true }).click();
    await expect(evidence.getByRole('status')).toContainText('evidence page 1');

    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });

        for (const theme of ['dark', 'light']) {
            if (theme === 'light')
                await page.evaluate(/** Switch to light theme for contributor evidence dialog screenshots. */ () => document.body.classList.toggle('light'));

            for (const section of ['top', 'bottom']) {
                await evidence.evaluate(/** Scroll publication evidence to its top or bottom for complete desktop inspection. */ (e, section) => { e.scrollTop = section === 'top' ? 0 : e.scrollHeight; }, section);
                await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-contributor-evidence-${section}-${theme}-${width}.png`), animations: 'disabled' });
            }
        }
        await page.evaluate(/** Restore dark theme after the evidence screenshot pair. */ () => document.body.classList.toggle('light'));
    }
    await page.setViewportSize({ width: 1600, height: 1000 });
    await evidence.getByRole('button', { name: 'Close evidence', exact: true }).click();

    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });

        for (const theme of ['dark', 'light']) {
            if (theme === 'light')
                await page.evaluate(/** Switch to light theme for contributor panel screenshots. */ () => document.body.classList.toggle('light'));
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-contributors-${theme}-${width}.png`), animations: 'disabled' });
        }
        await page.evaluate(/** Restore dark theme after contributor panel capture. */ () => document.body.classList.toggle('light'));
    }
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.evaluate(/** Install a delayed publication-evidence response to test active-document isolation. */ () => {
        const actual = window.fetch.bind(window);
        let once = true, start;
        window.__contributorsStarted = new Promise(/** Publish a signal when contributor evidence reaches the controlled delay. */    r => { start = r; });
        window.__restoreContributors = /** Restore browser original fetch after contributor response isolation testing. */
            () => { window.fetch = actual; };
        window.fetch = /** Delay the first actual contributor publication response without changing its content. */
            async (...args) => {
                const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;
                const response = await actual(...args);

                if (inputUrl.endsWith('/api/v1/contributors/publications') && once) {
                    once = false;
                    start();
                    await new Promise(/** Expose the delayed contributor response release callback. */    r => { window.__releaseContributors = r; });
                }

                return response;
            };
    });
    await panel.getByRole('button', { name: 'Refresh contributors', exact: true }).click();
    await page.evaluate(/** Wait for contributor response capture before switching documents. */ () => window.__contributorsStarted);
    await page.getByRole('button', { name: 'Second synthetic document', exact: true }).click();
    await expect(panel).toContainText('beginning of this snapshot');
    await page.evaluate(/** Release the stale contributor response and restore fetch after document navigation. */ () => { window.__releaseContributors(); window.__restoreContributors(); });
    await expect(panel).toContainText('beginning of this snapshot');
    check(JSON.stringify(await ok('editor', { document: first })) === JSON.stringify(latest), 'Contributor browsing mutated source or history');
    await page.getByRole('button', { name: 'First synthetic document', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('First synthetic document');
    const selected = await page.getByRole('textbox', { name: 'Markdown document editor' }).evaluate(/** Copy exact selected editor source to verify contributor browsing preserved selection. */    element => { const data = new DataTransfer(); element.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data })); return data.getData('text/plain'); });
    check(selected === before.text, 'Contributor browsing lost exact editor selection');
    await page.locator('[data-interaction="Agent"]').click();
    checks.push('authenticated publication contributors pin the actual human without agent/authorship inference, preserve historical scope across commit/restart, reject tampered cursors and ignore stale cross-document replies');
}
