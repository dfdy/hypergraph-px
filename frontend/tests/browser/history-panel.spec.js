/**
 * Hypergraph PX — Historical inspection browser component checks
 *
 * Drive controlled history/head/snapshot responses to verify exact inert
 * text/downloads and stale-result cancellation across refresh and navigation.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/history-panel.spec.js)
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
 * Used by: Isolated headless Playwright preview test runner; browser editor
 * component regression workflow.
 *
 * Specification:
 * - [Browser editor definition](../../../docs/06-subsystems/diagrams/browser/interface.c4)
 * - [Exact source and anchors](../../../docs/05-domain/text-and-anchors.md)
 * - [Evidence and isolated test workflow](../../../docs/09-guides/reference/development-evidence.md)
 *
 * Boundary: Synthetic browser/component evidence only; no real HTTPS runtime,
 * native trust/enrollment or product-wide proof is established by these
 * fixtures.
 */
import { test, expect } from './fixtures.js';

import { readFile } from 'node:fs/promises';

const styles = await readFile(new URL('../../styles.css', import.meta.url), 'utf8');

const source = await readFile(new URL('../../src/history-panel.js', import.meta.url), 'utf8');

/** Mount the actual history component with a synthetic deferred adapter in an isolated document. */
async function open(page) {
    await page.goto('about:blank');
    await page.addStyleTag({ content: styles });
    await page.evaluate(/** Create deterministic history metadata and externally releasable head/snapshot queries inside the test browser. */ async (url) => {
        const { renderHistory } = await import(url), id = /** Build one deterministic 32-byte synthetic revision or snapshot identity. */  n => Array(32).fill(n), entry = /** Build a synthetic history entry with explicit same-node parent metadata. */  n => ({ revision: id(n), snapshot: id(n + 10), parent: n === 1 ? null : id(n - 1), text_bytes: 12 });
        const container = document.createElement('div');
        document.body.append(container);
        window.__notices = [];
        window.__snapshots = [];
        window.__heads = [];
        const adapter = { lifecycle: 'unlocked', history: /** Return a bounded fixture history page or defer its latest committed-head lookup. */ async (document, cursor, limit) => {
                if (limit === 1) {
                    if (window.__holdHead)
                        return new Promise(/** Retain a release action for a deliberately delayed committed-head query. */  resolve => window.__heads.push(/** Resolve the held committed-head query with its originally selected fixture entry. */ () => resolve({ entries: [entry(50)] })));

                    return { entries: [entry(50)] };
                }

                return cursor === null ? { entries: [entry(3), entry(2)], next: id(1) } : { entries: [entry(1)], next: null };
            }, snapshot: /** Defer an exact snapshot lookup until the test supplies source or failure. */ async (document, snapshot) => new Promise(/** Retain snapshot identity and promise controls for ordered source reply delivery. */ (resolve, reject) => window.__snapshots.push({ snapshot, resolve, reject })) };
        window.__reply = /** Deliver one queued snapshot response or its selected error. */
            (i, text, error) => { const p = window.__snapshots[i]; error ? p.reject(Error(error)) : p.resolve({ text }); };
        renderHistory(container, adapter, 'synthetic-document', /** Collect user notices so stale errors can be distinguished from current failures. */  message => window.__notices.push(message));
    }, 'data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    await expect(page.getByRole('button', { name: 'View snapshot', exact: true })).toHaveCount(2);
}

test('history inspection keeps exact untrusted source/download and removes dialogs on Escape', /** Check exact untrusted historical source, download bytes, inert markup and Escape dialog removal. */ async ({ page }) => {
    await open(page);
    const text = 'Exact 😀 e\u0301\r\n中\r<img src=x onerror="window.__executed=true">\n';

    await page.getByRole('button', { name: 'View snapshot', exact: true }).first().click();
    await page.evaluate(/** Return the selected exact untrusted source to the first snapshot request. */  text => window.__reply(0, text), text);
    let dialog = page.getByRole('dialog', { name: 'Historical snapshot · read only' });
    expect(await dialog.locator('pre').textContent()).toBe(text);
    await expect(dialog.locator('img')).toHaveCount(0);
    const ready = page.waitForEvent('download');

    await dialog.getByRole('button', { name: 'Download snapshot', exact: true }).click();
    expect(await readFile(await (await ready).path(), 'utf8')).toBe(text);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Compare with latest committed', exact: true }).first().click();
    await expect.poll(/** Poll until comparison has requested both exact source snapshots. */ () => page.evaluate(/** Read the number of retained snapshot requests from browser fixture state. */ () => window.__snapshots.length)).toBe(3);
    await page.evaluate(/** Deliver identical selected/latest committed source bytes for exact-equality comparison. */  text => { window.__reply(1, text); window.__reply(2, text); }, text);
    dialog = page.getByRole('dialog', { name: 'Compare committed snapshots' });
    await expect(dialog.getByRole('status')).toHaveText('These snapshots contain exactly the same bytes.');
    expect(await dialog.locator('pre').allTextContents()).toEqual([text, text]);
    expect(await page.evaluate(/** Observe whether malicious-looking historical source executed as markup. */ () => window.__executed)).toBeUndefined();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
});

test('history page and refresh changes cancel old snapshots/errors while latest inspection wins', /** Check page/refresh invalidation of old sources/errors and latest-inspection wins. */ async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'View snapshot', exact: true }).first().click();
    await page.getByRole('button', { name: 'Older', exact: true }).click();
    await expect(page.getByRole('button', { name: 'View snapshot', exact: true })).toHaveCount(1);
    await page.evaluate(/** Deliver a previous-page source after navigation so it must be ignored. */ () => window.__reply(0, 'Stale previous page'));
    await expect(page.locator('dialog')).toHaveCount(0);
    const inspect = page.getByRole('button', { name: 'View snapshot', exact: true });

    await inspect.click();
    await inspect.click();
    await page.evaluate(/** Deliver the newest inspection source before its superseded predecessor. */ () => window.__reply(2, 'Latest inspection'));
    const dialog = page.getByRole('dialog', { name: 'Historical snapshot · read only' });

    await expect(dialog.locator('pre')).toHaveText('Latest inspection');
    await page.evaluate(/** Deliver the superseded inspection response without allowing it to replace the visible dialog. */ () => window.__reply(1, 'Superseded inspection'));
    await expect(page.locator('dialog')).toHaveCount(1);
    await expect(dialog.locator('pre')).toHaveText('Latest inspection');
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await inspect.click();
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.evaluate(/** Reject an obsolete inspection after refresh to verify stale errors produce no notice. */ () => window.__reply(3, null, 'Stale error'));
    expect(await page.evaluate(/** Read collected notices after a superseded request fails. */ () => window.__notices)).toEqual([]);
    await expect(page.locator('dialog')).toHaveCount(0);
});

test('history navigation invalidates comparisons during both head capture and exact source reads', /** Check navigation invalidates comparisons both during committed-head capture and during exact source reads. */ async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Compare with latest committed', exact: true }).first().click();
    await expect.poll(/** Poll until both selected and committed source lookups are queued. */ () => page.evaluate(/** Read queued snapshot count for comparison setup readiness. */ () => window.__snapshots.length)).toBe(2);
    await page.getByRole('button', { name: 'Older', exact: true }).click();
    await page.evaluate(/** Deliver obsolete comparison sources after paging away. */ () => { window.__reply(0, 'Old selected source'); window.__reply(1, 'Captured committed source'); });
    await expect(page.locator('dialog')).toHaveCount(0);
    await page.evaluate(/** Enable controlled committed-head delay for the next comparison attempt. */ () => { window.__holdHead = true; });
    await page.getByRole('button', { name: 'Compare with latest committed', exact: true }).click();
    await expect.poll(/** Poll until the committed-head lookup is held for navigation invalidation. */ () => page.evaluate(/** Read the number of deferred committed-head requests. */ () => window.__heads.length)).toBe(1);
    await page.getByRole('button', { name: 'Newer', exact: true }).click();
    await page.evaluate(/** Release the obsolete committed-head query after changing history pages. */ () => window.__heads[0]());
    expect(await page.evaluate(/** Check an invalidated head reply did not trigger further snapshot requests. */ () => window.__snapshots.length)).toBe(2);
    await expect(page.locator('dialog')).toHaveCount(0);
    expect(await page.evaluate(/** Read notices after invalidated comparison completion to detect stale UI errors. */ () => window.__notices)).toEqual([]);
});
