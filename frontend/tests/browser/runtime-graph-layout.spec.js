/**
 * # Hypergraph PX — Independent graph scrolling evidence
 *
 * Checks keyboard-accessible graph inspection and chooser geometry across desktop
 * themes and widths.
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
 * Used by: Runtime graph panel component; desktop browser assurance.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/runtime-graph-layout.spec.js
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

const frontend = fileURLToPath(new URL('../../', import.meta.url));

let moduleSource;

test.beforeAll(/** Bundle the graph component for isolated desktop geometry evidence. */ async () => {
    const result = await build({ absWorkingDir: frontend, entryPoints: ['src/runtime-graph.js'], bundle: true, format: 'esm', write: false });
    moduleSource = result.outputFiles[0].text;
});

test('graph choices and keyboard-accessible inspection scroll independently at desktop widths in both themes', /** Verify graph choices and keyboard-accessible inspection scroll independently at desktop widths in both themes. */ async ({ page }) => {
    await page.route('**/graph-layout-test.js', /** Serve the exact bundled graph component through the fixture page. */ route => route.fulfill({ contentType: 'text/javascript', body: moduleSource }));
    await page.goto('/');
    await page.evaluate(/** Install many synthetic documents and open a graph with inert selection callbacks. */ async (url) => {
        const { openRuntimeGraph } = await import(url), id = /** Create deterministic fixed-width fixture identities. */ n => Array(32).fill(n);

        const docs = new Map(Array.from({ length: 40 }, /** Give chooser entries distinct labels with retained Unicode context. */ (_, i) => [String(i), { id: String(i), title: `Synthetic document ${i + 1} · retained Unicode 😀 context` }]));

        const adapter = {
            docs, lifecycle: 'unlocked', get: /** Resolve a selected synthetic document to its stored transport identity. */ key => ({ runtime: { document: id(Number(key) + 1) } }), documentGraph: /** Return only selected synthetic nodes and no inferred graph edges. */ async (selection) => ({
                projection: 'document_forks', nodes: selection.map(/** Map a chosen document to its exact synthetic node and title. */ key => ({ document: id(Number(key) + 1), node: id(Number(key) + 101), title: docs.get(key).title })), edges: [], inputs_outside_selection: 0
            })
        };
        window.__graphNotifications = [];
        openRuntimeGraph(adapter, '0', /** Record unexpected user notifications for the final empty-notification assertion. */ message => window.__graphNotifications.push(message), /** Leave source selection inert in this component-only fixture. */ () => { });
    }, '/graph-layout-test.js');

    const dialog = page.getByRole('dialog', { name: 'Document fork graph' }), chooser = dialog.locator('.graph-chooser'), main = dialog.getByRole('region', { name: 'Graph and inspection' });
    for (let i = 1; i < 16; i++)
        await chooser.getByRole('checkbox').nth(i).check();
    await dialog.getByRole('button', { name: 'Show graph', exact: true }).click();

    await expect(dialog.locator('.graph-node')).toHaveCount(16);

    await main.getByText('Nodes and recorded relationships', { exact: true }).click();
    for (const width of [1280, 1600, 2000]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const theme of ['dark', 'light']) {
            await page.evaluate(/** Switch the page theme without changing graph data. */ theme => document.body.classList.toggle('light', theme === 'light'), theme);
            await chooser.evaluate(/** Set chooser scroll independently before moving inspection focus. */ e => {
                e.scrollTop = 120;
            });

            const chosenTop = await chooser.evaluate(/** Read the chooser scroll position for preservation checks. */ e => e.scrollTop);
            await main.focus();
            await main.press('End');

            await expect.poll(/** Poll until keyboard End scrolls the inspection region. */ () => main.evaluate(/** Read inspection scroll from the browser DOM. */ e => e.scrollTop)).toBeGreaterThan(0);
            await expect.poll(/** Poll until the inspection viewport reaches its exact scroll end. */ () => main.evaluate(/** Measure remaining inspection scroll distance with rounding tolerance. */ e => Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop))).toBeLessThanOrEqual(1);
            expect(await chooser.evaluate(/** Check chooser position did not follow inspection scrolling. */ e => e.scrollTop)).toBe(chosenTop);
            expect(await dialog.locator('.runtime-graph-layout').evaluate(/** Check the outer layout did not become the scrolling owner. */ e => e.scrollTop)).toBe(0);

            const inspectionTop = await main.evaluate(/** Capture inspection position before focusing a distant chooser item. */ e => e.scrollTop);
            await chooser.getByRole('checkbox').last().focus();

            await expect(chooser.getByRole('checkbox').last()).toBeInViewport();
            expect(await main.evaluate(/** Check chooser focus did not move the inspection viewport. */ e => e.scrollTop)).toBe(inspectionTop);
            await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();

            await main.evaluate(/** Reset inspection scrolling for the next width/theme sample. */ e => {
                e.scrollTop = 0;
            });
            await chooser.evaluate(/** Reset chooser scrolling independently for the next sample. */ e => {
                e.scrollTop = 0;
            });

            const bounds = await dialog.boundingBox();
            expect(bounds.x).toBeGreaterThanOrEqual(0);
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
            expect(bounds.y + bounds.height).toBeLessThanOrEqual(1000);

            await page.screenshot({ path: `../.local/artifacts/runtime-graph-layout-${theme}-${width}.png`, animations: 'disabled' });
        }
    }
    expect(await page.evaluate(/** Read all component notifications to reject unexpected errors. */ () => window.__graphNotifications)).toEqual([]);

    await dialog.getByRole('button', { name: 'Close', exact: true }).click();

    await expect(dialog).toHaveCount(0);
});
