/**
 * # Hypergraph PX — Recorded publisher evidence browser checks
 *
 * Checks bounded evidence paging and exact inert snapshot inspection without
 * claiming complete authorship.
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
 * Used by: Contributor evidence component; isolated Playwright assurance.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/contributor-evidence.spec.js
 * [spec0]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec1]: ../../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec2]: ../../../docs/05-domain/text-and-anchors.md
 * [spec3]: ../../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec4]: ../../../docs/09-guides/developers/repository-development.md
 * [spec5]: ../../../docs/06-subsystems/frontend-interaction.md
 */
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const styles = await readFile(new URL('../../styles.css', import.meta.url), 'utf8');

const source = await readFile(new URL('../../src/contributor-evidence.js', import.meta.url), 'utf8');

/** Open the evidence component with exact inert snapshot text and optional controlled delay. */
async function open(page, delayed = false) {
    await page.goto('about:blank');
    await page.addStyleTag({ content: styles });
    await page.evaluate(/** Import the component and install bounded synthetic publisher facts. */ async ({ url, delayed }) => {
        const { openContributorEvidence } = await import(url), id = /** Create deterministic fixed-width publisher/revision/snapshot identities. */ n => Array(32).fill(n);
        window.__evidenceCalls = [];

        const adapter = {
            lifecycle: 'unlocked', snapshot: /** Record exact snapshot requests and optionally defer the response. */ async (document, snapshot) => {
                window.__evidenceCalls.push({ document, snapshot });
                if (delayed)
                    return new Promise(/** Retain a release action for the pending snapshot request. */ r => {
                        window.__releaseEvidence = /** Complete the delayed snapshot with synthetic exact text. */
                            () => r({ text: 'Delayed source' });
                    });
                return { text: 'Exact 😀\r\n中\r<img src=x onerror="window.__executed=true">\n' };
            }
        };

        const facts = Array.from({ length: 10 }, /** Produce distinct publication facts without claiming full source authorship. */ (_, i) => ({ principal: id(1), revision: id(i + 2), snapshot: id(i + 40), operation: id(i + 80), role: 'publisher' }));
        openContributorEvidence(adapter, 'synthetic-document', id(1), facts, /** Keep this isolated evidence view valid until explicitly closed or repaged. */ () => true);
    }, { url: 'data:text/javascript;base64,' + Buffer.from(source).toString('base64'), delayed });
}

test('loaded publisher evidence pages and exact snapshots remain read-only untrusted text', /** Verify loaded publisher evidence pages and exact snapshots remain read-only untrusted text. */ async ({ page }) => {
    await open(page);

    const dialog = page.getByRole('dialog', { name: 'Recorded publication evidence' });
    await expect(dialog.locator('article')).toHaveCount(8);

    await dialog.getByRole('button', { name: 'Inspect publication snapshot' }).first().click();

    const snapshot = page.getByRole('dialog').filter({ hasText: 'Publication snapshot · read only' });
    expect(await snapshot.locator('pre').textContent()).toBe('Exact 😀\r\n中\r<img src=x onerror="window.__executed=true">\n');
    await expect(snapshot.locator('img')).toHaveCount(0);
    expect(await page.evaluate(/** Check hostile snapshot markup never executed its synthetic handler. */ () => window.__executed)).toBeUndefined();

    await snapshot.getByRole('button', { name: 'Close snapshot' }).click();
    await dialog.getByRole('button', { name: 'Older evidence' }).click();

    await expect(dialog.locator('article')).toHaveCount(2);
    await expect(dialog.getByRole('button', { name: 'Older evidence' })).toBeDisabled();

    await dialog.getByRole('button', { name: 'Newer evidence' }).click();

    await expect(dialog.locator('article')).toHaveCount(8);
    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const theme of ['dark', 'light']) {
            if (theme === 'light')
                await page.evaluate(/** Enable the light theme for a desktop screenshot sample. */ () => document.body.classList.add('light'));
            for (const section of ['top', 'bottom']) {
                await dialog.evaluate(/** Move only the evidence dialog to its requested top/bottom section. */ (e, section) => {
                    e.scrollTop = section === 'top' ? 0 : e.scrollHeight;
                }, section);
                await page.screenshot({ path: fileURLToPath(new URL(`../../../.local/artifacts/contributor-evidence-component-${section}-${theme}-${width}.png`, import.meta.url)), animations: 'disabled' });
            }
        }
        await page.evaluate(/** Restore the base theme after the desktop sweep. */ () => document.body.classList.remove('light'));
    }
});

test('closing evidence or changing its page discards an outstanding exact-snapshot reply', /** Verify closing evidence or changing its page discards an outstanding exact-snapshot reply. */ async ({ page }) => {
    await open(page, true);

    let dialog = page.getByRole('dialog', { name: 'Recorded publication evidence' });
    await dialog.getByRole('button', { name: 'Inspect publication snapshot' }).first().click();
    await dialog.getByRole('button', { name: 'Older evidence' }).click();
    await page.evaluate(/** Release an obsolete snapshot after the evidence page changes. */ () => window.__releaseEvidence());

    await expect(page.getByRole('dialog')).toHaveCount(1);

    await dialog.getByRole('button', { name: 'Inspect publication snapshot' }).first().click();
    await dialog.getByRole('button', { name: 'Close evidence' }).click();
    await page.evaluate(/** Release an obsolete snapshot after the parent dialog closes. */ () => window.__releaseEvidence());

    await expect(page.getByRole('dialog')).toHaveCount(0);
});
