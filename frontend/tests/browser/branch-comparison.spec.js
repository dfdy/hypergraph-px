/**
 * # Hypergraph PX — Committed branch comparison evidence
 *
 * Checks inert exact committed snapshots and common-base inspection while
 * rejecting stale or partial results.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex /root/storage_comments (OpenAI coding agent).
 * Latest editing harness: Codex; version/build unknown (not exposed).
 * Latest editing model: OpenAI; exact identifier/revision unknown (not exposed).
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Parent comparison component; synthetic browser assurance.
 *
 * Specification:
 * - [Browser interface responsibilities][spec0]
 * - [Workspace organisation responsibilities][spec1]
 * - [Exact text and anchor contract][spec2]
 * - [Browser-runtime transport boundary][spec3]
 * - [Repository development checks][spec4]
 * - [Frontend interaction contract][spec5]
 *
 * Boundary: Synthetic/component browser evidence does not establish real HTTPS,
 * SQLite recovery, provider custody or full product acceptance. Test assertions and
 * source literals are preserved; this commenting pass does not execute the tests.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/branch-comparison.spec.js
 * [spec0]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec1]: ../../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec2]: ../../../docs/05-domain/text-and-anchors.md
 * [spec3]: ../../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec4]: ../../../docs/09-guides/developers/repository-development.md
 * [spec5]: ../../../docs/06-subsystems/frontend-interaction.md
 */
import { test, expect } from './fixtures.js';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

let bundle;

const styles = await readFile(new URL('../../styles.css', import.meta.url), 'utf8');

test.beforeAll(/** Bundle the committed-parent comparison panel independently of server integration. */ async () => {
    const result = await build({ stdin: { contents: "import {openParentComparison} from './src/runtime-branch-comparison.js';window.openComparison=openParentComparison;", resolveDir: fileURLToPath(new URL('../../', import.meta.url)) }, bundle: true, format: 'iife', write: false });
    bundle = result.outputFiles[0].text;
});

/** Open exact-source comparison with controlled fake snapshot and parent-read responses. */
async function open(page) {
    await page.goto('about:blank');
    await page.addStyleTag({ content: styles });
    await page.addScriptTag({ content: bundle });
    await page.evaluate(/** Install fixture state for delayed replies and invalidated parent view checks. */ () => {
        window.calls = [];
        window.delay = false;
        window.valid = true;
        window.denied = false;

        const id = /** Create deterministic fixed-width snapshot and branch identities. */ n => Array(32).fill(n), text = '<script>😀\r\nAfter table and math\r';
        window.adapter = {
            lifecycle: 'unlocked', parentComparison: /** Record captured branch scope and simulate delayed or denied comparison lookup. */ async (document, branch) => {
                window.calls.push({ document, branch });
                if (window.delay)
                    await new Promise(/** Retain the pending comparison resolver for context-invalidation tests. */ r => window.release = r);
                if (window.denied)
                    throw Error('Current scope denied');
                return { source_name: 'Alternative', parent_name: 'Original branch', source_snapshot: id(1), parent_snapshot: id(2) };
            }, snapshot: /** Return distinct exact committed source for each comparison side. */ async (_doc, snapshot) => ({ text: snapshot[0] === 1 ? text : 'Parent e\u0301\n' })
        };
        window.open = /** Reopen the captured comparison with its original branch and validity check. */
            () => window.openComparison(window.adapter, 'captured', id(9), /** Check whether the original parent view is still valid. */ () => window.valid);
        window.open();
    });
}

test('comparison shows inert exact committed bytes and explicit pending-draft exclusion', /** Verify comparison shows inert exact committed bytes and explicit pending-draft exclusion. */ async ({ page }) => {
    await open(page);

    const popup = page.getByRole('dialog', { name: 'Compare committed branch with parent' });
    await expect(popup.getByRole('status')).toHaveText('Committed snapshots differ.');
    await expect(popup).toContainText('Pending edits on either branch are excluded.');
    expect(await popup.getByLabel('Selected branch · committed').textContent()).toBe('<script>😀\r\nAfter table and math\r');
    expect(await popup.getByLabel('Parent branch · committed').textContent()).toBe('Parent e\u0301\n');
    await expect(popup.locator('script')).toHaveCount(0);

    await page.keyboard.press('Escape');

    await expect(popup).toHaveCount(0);
});

test('closing, lock and invalidated parent view discard a delayed comparison context', /** Verify closing, lock and invalidated parent view discard a delayed comparison context. */ async ({ page }) => {
    for (const action of ['close', 'lock', 'obsolete']) {
        await open(page);

        await expect(page.getByRole('status')).toHaveText('Committed snapshots differ.');

        await page.evaluate(/** Delay the next comparison lookup before invalidating its owner. */ () => window.delay = true);
        await page.getByRole('button', { name: 'Refresh comparison' }).click();

        await expect.poll(/** Poll until the delayed comparison release hook exists. */ () => page.evaluate(/** Inspect the browser fixture resolver without completing the request. */ () => !!window.release)).toBe(true);
        if (action === 'close')
            await page.keyboard.press('Escape');
        else
            await page.evaluate(/** Invalidate comparison by workspace lock or obsolete parent context. */ action => {
                if (action === 'lock')
                    window.adapter.lifecycle = 'locked';
                else
                    window.valid = false;
            }, action);
        await page.evaluate(/** Resolve the old comparison after invalidation. */ () => window.release());

        await expect(page.locator('.snapshot-comparison-columns')).toHaveCount(0);
    }
});

test('failed exact snapshot resolution does not display a partial source or retain older success', /** Verify failed exact snapshot resolution does not display a partial source or retain older success. */ async ({ page }) => {
    await open(page);

    await expect(page.getByRole('status')).toHaveText('Committed snapshots differ.');

    await page.evaluate(/** Replace snapshot loading with a deterministic one-side failure. */ () => window.adapter.snapshot = /** Reject the parent snapshot while retaining an unpaired source result. */
        async (_doc, snapshot) => {
            if (snapshot[0] === 2)
                throw Error('Source unavailable');
            return { text: 'Unpaired source' };
        });
    await page.getByRole('button', { name: 'Refresh comparison' }).click();

    await expect(page.getByRole('status')).toHaveText('Comparison unavailable: Source unavailable');
    await expect(page.locator('.snapshot-comparison-columns')).toHaveCount(0);
});

/** Enable optional common-base inspection in the isolated component fixture. */
async function enableBase(page) {
    await page.evaluate(/** Reopen the panel with a bounded synthetic common-base capability. */ () => {
        document.querySelector('dialog').close();
        window.adapter.features = { parentBase: true };
        window.adapter.parentBase = /** Return a controlled common-base result with optional delayed completion. */
            async () => {
                if (window.delayBase)
                    await new Promise(/** Retain the pending common-base resolver for stale-result rejection. */ resolve => window.releaseBase = resolve);
                return { selection: { result: 'base', snapshot: Array(32).fill(3), source_in_target: false, target_in_source: false } };
            };

        const snapshot = window.adapter.snapshot;
        window.adapter.snapshot = /** Return exact common-base bytes while delegating ordinary comparison snapshots. */
            async (doc, id) => id[0] === 3 ? { text: 'Common <script> 😀\r\nBase\r' } : snapshot(doc, id);
        window.open();
    });
}

test('common-base inspection renders inert exact source without replacing the committed pair', /** Verify common-base inspection renders inert exact source without replacing the committed pair. */ async ({ page }) => {
    await open(page);
    await enableBase(page);

    const popup = page.getByRole('dialog', { name: 'Compare committed branch with parent' });
    await popup.getByRole('button', { name: 'Inspect common base' }).click();

    await expect(popup.getByLabel('Common committed base')).toBeVisible();
    expect(await popup.getByLabel('Common committed base').textContent()).toBe('Common <script> 😀\r\nBase\r');
    expect(await popup.getByLabel('Selected branch · committed').textContent()).toBe('<script>😀\r\nAfter table and math\r');
    await expect(popup.locator('script')).toHaveCount(0);
    await expect(popup).toContainText('Inspection preserves both branches and their pending edits.');
});

test('common-base results are discarded after close, lock, invalidation or comparison refresh', /** Verify common-base results are discarded after close, lock, invalidation or comparison refresh. */ async ({ page }) => {
    for (const action of ['close', 'lock', 'obsolete', 'refresh']) {
        await open(page);
        await enableBase(page);
        await page.evaluate(/** Delay the next base lookup before closing or refreshing its owning view. */ () => window.delayBase = true);
        await page.getByRole('button', { name: 'Inspect common base' }).click();

        await expect.poll(/** Poll until common-base inspection is waiting on the fixture resolver. */ () => page.evaluate(/** Read whether the delayed base release hook has been installed. */ () => !!window.releaseBase)).toBe(true);
        if (action === 'close')
            await page.keyboard.press('Escape');
        else if (action === 'refresh')
            await page.getByRole('button', { name: 'Refresh comparison' }).click();
        else
            await page.evaluate(/** Invalidate the common-base context by lock or obsolete view. */ action => {
                if (action === 'lock')
                    window.adapter.lifecycle = 'locked';
                else
                    window.valid = false;
            }, action);
        await page.evaluate(/** Resolve the old base lookup after context invalidation. */ () => window.releaseBase());

        await expect(page.getByLabel('Common committed base')).toHaveCount(0);
    }
});

test('failed common-base snapshot lookup leaves the compared versions available without partial base text', /** Verify failed common-base snapshot lookup leaves the compared versions available without partial base text. */ async ({ page }) => {
    await open(page);
    await enableBase(page);
    await page.evaluate(/** Install a base-only snapshot failure while preserving comparison-side reads. */ () => {
        const snapshot = window.adapter.snapshot;
        window.adapter.snapshot = /** Reject the base snapshot without hiding the existing committed pair. */
            async (doc, id) => {
                if (id[0] === 3)
                    throw Error('Source unavailable');
                return snapshot(doc, id);
            };
    });
    await page.getByRole('button', { name: 'Inspect common base' }).click();

    await expect(page.getByRole('dialog')).toContainText('Common base unavailable: Source unavailable');
    await expect(page.getByLabel('Common committed base')).toHaveCount(0);
    await expect(page.getByLabel('Selected branch · committed')).toBeVisible();
});
