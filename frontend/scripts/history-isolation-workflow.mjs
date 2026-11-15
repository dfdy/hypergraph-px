// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Stale historical inspection integration scenario
 *
 * Delay snapshot and comparison queries and verify that a history refresh
 * invalidates their obsolete dialogs.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/history-isolation-workflow.mjs)
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
 *
 * Boundary: Tests read-only inspection lifecycle and Escape cleanup; it does not
 * infer production guarantees from merely defining the scenario.
 */
import { expect } from '@playwright/test';

import { resolve } from 'node:path';

/** Check that history refresh discards delayed inspection results and read-only dialogs close cleanly across desktop themes. */
export async function exerciseHistoryIsolation({ page, root, checks }) {
    const panel = page.locator('#investigationBody');

    for (const stage of ['snapshot', 'comparison-head', 'comparison-sources']) {
        await page.evaluate(/** Install a one-shot fetch interception for the selected snapshot/comparison query stage. */    stage => {
            const actual = window.fetch.bind(window);
            let once = true, start;
            window.__historyInspectionStarted = new Promise(/** Publish a readiness signal when the selected historical response is intercepted. */    resolve => { start = resolve; });
            window.__restoreHistoryInspection = /** Restore the browser original fetch implementation after the controlled delay. */
                () => { window.fetch = actual; };
            window.fetch = /** Delay exactly one matching historical response while retaining its original server result. */
                async (...args) => {
                    const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                    const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;
                    const response = await actual(...args), path = inputUrl;
                    const match = stage === 'comparison-head' ? (path.endsWith('/api/v1/history') || path.endsWith('/api/v1/branches/history/page')) && JSON.parse(inputBody).limit === 1 : path.endsWith('/api/v1/snapshot');

                    if (once && match) {
                        once = false;
                        start();
                        await new Promise(/** Expose the release callback so the test can deliver the delayed historical response deliberately. */    resolve => { window.__releaseHistoryInspection = resolve; });
                    }

                    return response;
                };
        }, stage);
        await panel.getByRole('button', { name: stage === 'snapshot' ? 'View snapshot' : 'Compare with latest committed', exact: true }).first().click();
        await page.evaluate(/** Wait for interception readiness with a bounded failure path. */ () => Promise.race([window.__historyInspectionStarted, new Promise(/** Create the interception deadline rejection without resolving an unobserved request. */ (_, reject) => setTimeout(/** Reject a scenario whose historical request never reaches the interception point. */ () => reject(Error('History inspection interception timed out')), 10000))]));
        await panel.getByRole('button', { name: 'Refresh', exact: true }).click();
        await expect(panel).toContainText('History page 1');
        await page.evaluate(/** Release the delayed reply, restore fetch and wait for the UI stale-result guard to settle. */ async () => {
            window.__releaseHistoryInspection();
            window.__restoreHistoryInspection();
            await new Promise(/** Wait across two animation frames before asserting absence of an obsolete dialog. */    resolve => requestAnimationFrame(/** Advance the second frame before completing the UI settlement wait. */ () => requestAnimationFrame(resolve)));
        });
        await expect(page.locator('dialog')).toHaveCount(0);
    }
    await panel.getByRole('button', { name: 'View snapshot', exact: true }).first().click();
    await expect(page.getByRole('dialog', { name: 'Historical snapshot · read only' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
    await panel.getByRole('button', { name: 'Compare with latest committed', exact: true }).first().click();
    const comparison = page.getByRole('dialog', { name: 'Compare committed snapshots' });

    await expect(comparison).toBeVisible();

    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });

        for (const theme of ['dark', 'light']) {
            await page.evaluate(/** Apply the requested desktop theme for the visible comparison capture. */    theme => document.body.classList.toggle('light', theme === 'light'), theme);
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-history-isolation-${theme}-${width}.png`), animations: 'disabled' });
        }
    }
    await page.evaluate(/** Restore the default dark theme after inspection geometry capture. */ () => document.body.classList.remove('light'));
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
    checks.push('history refresh invalidates delayed snapshot, comparison-head and comparison-source replies; Escape removes exact-source dialogs');
}
