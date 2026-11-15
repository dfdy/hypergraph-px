// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Retained synthesis graph integration scenario
 *
 * Inspect a reviewed Merge as one transformation with ordered historical
 * inputs/output, selected-node boundaries and stale-view isolation.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/merge-graph-workflow.mjs)
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
 * Used by: Owned synthetic runtime integration harness after reviewed synthesis
 * setup.
 *
 * Specification:
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 *
 * Boundary: Graph inspection must remain read-only and never infer original
 * sentence authorship from synthesis provenance.
 */
import { expect } from '@playwright/test';

import { resolve } from 'node:path';

/** Check ordered Merge incidences, exact retained participant inspection, bounded graph selection and stale query isolation. */
export async function exerciseMergeGraph({ page, ok, first, mergeBaseline, recovery, root, check, checks }) {
    const before = await ok('editor', { document: first });

    await page.locator('[data-lens="Graph"]').click();
    await page.getByRole('button', { name: 'Choose graph nodes', exact: true }).click();
    const dialog = page.getByRole('dialog');

    await dialog.getByRole('combobox', { name: 'Graph relationship scope', exact: true }).selectOption('transformations');
    const input = dialog.getByRole('checkbox', { name: /First synthetic document.*node/ }), fork = dialog.getByRole('checkbox', { name: /Durable synthetic fork.*node/ }), output = dialog.getByRole('checkbox', { name: /Reviewed synthetic synthesis.*node/ });

    await fork.check();
    await output.check();
    await dialog.getByRole('button', { name: 'Show graph', exact: true }).click();
    await expect(dialog.locator('.graph-node')).toHaveCount(3);
    await expect(dialog.locator('.graph-transformation')).toHaveCount(1);
    await expect(dialog.locator('.graph-merge-input')).toHaveCount(2);
    await expect(dialog.locator('.graph-merge-output[marker-end]')).toHaveCount(1);
    await dialog.locator('.graph-transformation').focus();
    await page.keyboard.press('Enter');
    await expect(dialog.locator('.graph-inspection')).toContainText('Original sentence authorship is unknown');
    await dialog.getByRole('button', { name: 'Inspect Merge input 1', exact: true }).click();
    const preview = page.getByRole('dialog').filter({ hasText: 'Graph Merge input · read only' });
    check(await preview.locator('pre').textContent() === recovery, 'Merge graph relocated historical input');
    await preview.getByRole('button', { name: 'Close source', exact: true }).click();
    await dialog.getByRole('button', { name: 'Inspect initial Merge output', exact: true }).click();
    const result = page.getByRole('dialog').filter({ hasText: 'Graph initial Merge output · read only' });
    check(await result.locator('pre').textContent() === mergeBaseline.text, 'Merge graph changed initial reviewed output bytes');
    await result.getByRole('button', { name: 'Close source', exact: true }).click();

    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });

        for (const theme of ['dark', 'light']) {
            if (theme === 'light')
                await page.evaluate(/** Switch to the light theme for the graph screenshot pass. */ () => document.body.classList.toggle('light'));
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-merge-graph-${theme}-${width}.png`), animations: 'disabled' });
            check(await dialog.evaluate(/** Check that the graph dialog remains completely within the current desktop viewport. */    d => { const r = d.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight; }), 'Merge graph dialog exceeds desktop bounds');
        }
        await page.evaluate(/** Restore the dark theme after each graph geometry pass. */ () => document.body.classList.toggle('light'));
    }
    await page.setViewportSize({ width: 1600, height: 1000 });
    await fork.uncheck();
    await dialog.getByRole('button', { name: 'Show graph', exact: true }).click();
    await expect(dialog.locator('.graph-node')).toHaveCount(2);
    await expect(dialog.locator('.graph-merge-input')).toHaveCount(1);
    await expect(dialog.getByRole('status')).toContainText('1 supported incidences');
    await input.uncheck();
    await dialog.getByRole('button', { name: 'Show graph', exact: true }).click();
    await expect(dialog.locator('.graph-node')).toHaveCount(1);
    await expect(dialog.locator('.graph-merge-input')).toHaveCount(0);
    await expect(dialog.getByRole('status')).toContainText('2 supported incidences');
    await page.evaluate(/** Install one delayed transformation response to test invalidation after selection changes. */ () => {
        const actual = window.fetch.bind(window);
        let once = true, start;
        window.__mergeGraphStarted = new Promise(/** Publish a signal when the transformation query reaches its controlled response delay. */    r => { start = r; });
        window.__restoreMergeGraph = /** Restore the browser original fetch after the graph stale-response experiment. */
            () => { window.fetch = actual; };
        window.fetch = /** Retain the actual first transformation response until the test explicitly releases it. */
            async (...args) => {
                const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;
                const response = await actual(...args);

                if (inputUrl.endsWith('/api/v1/graph/transformations') && once) {
                    once = false;
                    start();
                    await new Promise(/** Expose the delayed graph response release callback. */    r => { window.__releaseMergeGraph = r; });
                }

                return response;
            };
    });
    await dialog.getByRole('button', { name: 'Show graph', exact: true }).click();
    await page.evaluate(/** Wait for transformation response capture before changing the selected graph nodes. */ () => window.__mergeGraphStarted);
    await output.uncheck();
    await page.evaluate(/** Release the obsolete transformation response and restore fetch after changing graph selection. */ () => { window.__releaseMergeGraph(); window.__restoreMergeGraph(); });
    await expect(dialog.locator('.graph-transformation')).toHaveCount(0);
    await expect(dialog.getByRole('status')).toContainText('Selection changed');
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await page.locator('[data-lens="Workspace"]').click();
    check(JSON.stringify(await ok('editor', { document: first })) === JSON.stringify(before), 'Merge graph changed editor/history');
    checks.push('Merge graph retains one transformation with ordered exact inputs/output, keyboard inspection, explicit outside-selection boundaries and stale-view isolation');
}
