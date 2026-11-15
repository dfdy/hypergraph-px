/**
 * Hypergraph PX — Scoped contributor identity color checks
 *
 * Render synthetic publication facts across pages and themes to verify stable
 * principal colors, white initials and explicit incomplete identity scope.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/contributor-colours.spec.js)
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

import { build } from 'esbuild';

import { readFile } from 'node:fs/promises';

import { fileURLToPath } from 'node:url';

const frontend = fileURLToPath(new URL('../../', import.meta.url)), styles = await readFile(new URL('../../styles.css', import.meta.url), 'utf8');

let moduleSource;

test.beforeAll(/** Bundle the maintained publication-contributor component in memory for isolated presentation tests. */ async () => { const result = await build({ absWorkingDir: frontend, entryPoints: ['src/runtime-contributors.js'], bundle: true, format: 'esm', write: false }); moduleSource = result.outputFiles[0].text; });

test('contributor badges keep white initials and stable identity colours across pages in both themes', /** Check contributor paging keeps identity colors and white initials stable at all supported desktop widths/themes. */ async ({ page }) => {
    await page.goto('about:blank');
    await page.addStyleTag({ content: styles });
    await page.evaluate(/** Mount the actual contributor component with deterministic scoped synthetic publication facts. */ async (url) => {
        const { renderPublicationContributors } = await import(url), id = /** Build a deterministic synthetic 32-byte principal/revision identity. */  n => Array(32).fill(n), parent = document.createElement('section');
        parent.style.cssText = 'width:340px;height:90vh;overflow:auto;margin:24px;padding:12px;background:var(--panel)';
        document.body.append(parent);
        const fact = /** Create a synthetic publisher fact without claiming original sentence authorship. */  n => ({ principal: id(n), revision: id(n + 20), snapshot: id(2), operation: id(n + 40), role: 'publisher' });
        const adapter = { lifecycle: 'unlocked', get: /** Return the component selected immutable snapshot identity. */ () => ({ runtime: { snapshot: id(2) } }), publicationContributors: /** Return deterministic first/next contributor pages with explicit completeness metadata. */ async (document, snapshot, cursor) => ({ current_human: { principal: id(1), label: 'Current synthetic human' }, publications: cursor === null ? [fact(1), fact(3), fact(4)] : [fact(5), fact(6)], next: cursor === null ? [99] : null, complete_text_publications: cursor !== null }) };
        renderPublicationContributors(parent, adapter, 'synthetic-document');
    }, 'data:text/javascript;base64,' + Buffer.from(moduleSource).toString('base64'));
    await expect(page.locator('.contributor')).toHaveCount(3);
    const initial = await page.locator('.contributor').evaluateAll(/** Collect initial contributor identity/color pairs from the actual DOM. */  rows => rows.map(/** Read one contributor principal and badge background color. */  r => ({ principal: r.dataset.principal, background: getComputedStyle(r.querySelector('.dot')).backgroundColor })));

    await page.getByRole('button', { name: 'More publication evidence', exact: true }).click();
    await expect(page.locator('.contributor')).toHaveCount(5);

    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });

        for (const theme of ['dark', 'light']) {
            await page.evaluate(/** Apply the requested desktop screenshot theme. */  theme => document.body.classList.toggle('light', theme === 'light'), theme);
            const badges = await page.locator('.contributor').evaluateAll(/** Collect current contributor principal/background/foreground styling after pagination. */  rows => rows.map(/** Read one contributor badge computed colors without changing its state. */  r => { const e = r.querySelector('.dot'), style = getComputedStyle(e); return { principal: r.dataset.principal, background: style.backgroundColor, foreground: style.color }; }));
            expect(badges.slice(0, 3).map(/** Project only identity/background fields for stable-color comparison. */ ({ principal, background }) => ({ principal, background }))).toEqual(initial);
            expect(new Set(badges.map(/** Collect badge backgrounds to verify distinct fixture principal colors. */  b => b.background)).size).toBe(5);
            expect(badges.every(/** Require every contributor initial to use white foreground in each theme. */  b => b.foreground === 'rgb(255, 255, 255)')).toBe(true);
            await expect(page.getByText('No current agent', { exact: true })).toBeVisible();
            await expect(page.getByText('Principal kind not recorded', { exact: true })).toHaveCount(4);
            await page.locator('section').evaluate(/** Scroll the contributor fixture panel to its top before screenshot capture. */  e => { e.scrollTop = 0; });
            await page.screenshot({ path: `../.local/artifacts/contributor-colours-${theme}-${width}.png`, animations: 'disabled' });
        }
    }
});
