/**
 * # Hypergraph PX — Branch and unpublished-source browser evidence
 *
 * Checks bounded branch review, explicit creation context and inert private
 * checkpoint inspection.
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
 * Used by: Branch and working clipboard panels; component Playwright assurance.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/working-branches.spec.js
 * [spec0]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec1]: ../../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec2]: ../../../docs/05-domain/text-and-anchors.md
 * [spec3]: ../../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec4]: ../../../docs/09-guides/developers/repository-development.md
 * [spec5]: ../../../docs/06-subsystems/frontend-interaction.md
 */
// Component-only synthetic evidence; real branch/editor integration remains separate.
import { test, expect } from './fixtures.js';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const frontend = fileURLToPath(new URL('../../', import.meta.url)), styles = await readFile(new URL('../../styles.css', import.meta.url), 'utf8');

let bundle;

test.beforeAll(/** Bundle branch and private-working-clipboard panels for component-only evidence. */ async () => {
    const result = await build({ stdin: { contents: "import {openBranches} from './src/runtime-branches-panel.js';import {appendWorkingClipboard} from './src/runtime-working-clipboard-panel.js';window.__workingPanels={openBranches,appendWorkingClipboard};", resolveDir: frontend }, bundle: true, format: 'iife', write: false });
    bundle = result.outputFiles[0].text;
});

/** Open isolated styled panels with controlled branch and working-source adapters. */
async function open(page) {
    await page.goto('about:blank');
    await page.addStyleTag({ content: styles });
    await page.addScriptTag({ content: bundle });
    await page.evaluate(/** Install exact committed/working source fixtures without a real server or database. */ () => {
        const id = /** Create deterministic fixed-width transport identities for distinct contexts. */ n => Array(32).fill(n), doc = id(1), source = { kind: 'working_checkpoint', document: doc, node: id(2), branch: id(3), working_branch: id(4), checkpoint: id(5), occurrence_path: [id(6)], start_byte: 0, end_byte: 9 };
        window.__selected = [];
        window.__created = [];
        window.__adapter = {
            features: { workingCopy: true }, lifecycle: 'unlocked', branchPending: null, docs: new Map([[doc.map(/** Encode each document identity byte for the fake adapter lookup key. */ n => n.toString(16).padStart(2, '0')).join(''), { title: 'Synthetic research' }]]), get: /** Return current private typing separately from the committed snapshot fixture. */ () => ({ id: 'synthetic', runtime: { document: doc, branch: id(3), snapshot: id(7) }, source: 'Newer private typing' }), snapshot: /** Return exact committed Markdown including table/math and unnormalised line endings. */ async () => ({ text: '# Reviewed committed source\r\n\r\n| Claim | Evidence |\r\n| --- | --- |\r\n| A | B |\r\n\r\n$$x^2$$\r\n\r\nExact 😀中\rfinal' }), branchPage: /** Return one named branch alongside the original branch identity. */ async () => ({ original_branch: id(3), entries: [{ branch: id(8), name: 'Alternative interpretation' }], next: null }), createBranch: /** Record the reviewed creation context without performing backend publication. */ async (_doc, name, captured) => {
                window.__created.push({ name, captured });
                return { branch: id(9) };
            }, workingClipboard: {
                entries: [{ id: id(10), target: { kind: 'working', source }, preview: '<script>😀' }], generation: 1, total: 1, next: null, pending: null, inspect: /** Return exact hostile-looking unpublished checkpoint text for inert inspection. */ async () => ({ passage: '<script>😀\r\n中', promotion: null })
            }
        };
    });
}

test('branch review is bounded at desktop widths and explicitly excludes pending edits', /** Verify branch review is bounded at desktop widths and explicitly excludes pending edits. */ async ({ page }) => {
    await open(page);
    for (const theme of ['light', 'dark'])
        for (const width of [1280, 1600, 2000]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(/** Set theme and open branch review with controlled selection/notification callbacks. */ theme => {
                document.body.classList.toggle('light', theme === 'light');
                window.__workingPanels.openBranches(window.__adapter, 'synthetic', {
                    select: /** Record selected branch identities without mutating source. */ branch => {
                        window.__selected.push(branch);
                    }, notify: /** Suppress notification side effects in this isolated visual fixture. */ () => { }
                });
            }, theme);

            const popup = page.getByRole('dialog', { name: 'Document branches' });
            await expect(popup.getByRole('button', { name: 'Original branch · current' })).toBeDisabled();
            await expect(popup.getByRole('button', { name: 'Alternative interpretation' })).toBeVisible();
            await expect(popup).toContainText('pending edits are excluded');
            await expect(popup.locator('pre')).toContainText('Exact 😀中');

            const box = await popup.boundingBox();
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(width);
            expect(box.height).toBeLessThanOrEqual(1000);

            await page.screenshot({ path: resolve(frontend, `../.local/artifacts/branch-review-${theme}-${width}.png`) });
            await popup.getByRole('button', { name: 'Close', exact: true }).click();

            await expect(popup).toHaveCount(0);
        }
});

test('child creation publishes the reviewed context while Cancel creates no branch', /** Verify child creation publishes the reviewed context while Cancel creates no branch. */ async ({ page }) => {
    await open(page);
    await page.evaluate(/** Open branch review before testing cancellation without creation. */ () => window.__workingPanels.openBranches(window.__adapter, 'synthetic', {
        select: /** Record a selected branch for the first review instance. */ branch => window.__selected.push(branch), notify: /** Keep notification handling inert during cancellation. */ () => { }
    }));

    let popup = page.getByRole('dialog', { name: 'Document branches' });
    await expect(popup.getByRole('button', { name: 'Create child branch' })).toBeEnabled();

    await page.keyboard.press('Escape');

    expect(await page.evaluate(/** Read the creation count to prove Escape created no child. */ () => window.__created.length)).toBe(0);

    await page.evaluate(/** Reopen branch review for deliberate named-child creation. */ () => window.__workingPanels.openBranches(window.__adapter, 'synthetic', {
        select: /** Record selected branch identity after explicit child creation. */ branch => window.__selected.push(branch), notify: /** Keep notification handling inert during deliberate creation. */ () => { }
    }));
    popup = page.getByRole('dialog', { name: 'Document branches' });
    await popup.getByRole('textbox', { name: 'New branch name' }).fill('Named child');
    await popup.getByRole('button', { name: 'Create child branch' }).click();

    await expect(popup).toHaveCount(0);

    const created = await page.evaluate(/** Read the captured creation intent for exact snapshot-context assertions. */ () => window.__created);
    expect(created).toHaveLength(1);
    expect(created[0].captured.runtime.snapshot).toEqual(Array(32).fill(7));
});

test('working-source inspection stays inert and is labelled as an unpublished checkpoint', /** Verify working-source inspection stays inert and is labelled as an unpublished checkpoint. */ async ({ page }) => {
    await open(page);
    await page.evaluate(/** Mount the private reference list with an explicit local-only change callback. */ () => {
        const mount = document.createElement('div');
        mount.id = 'working-component';
        document.body.append(mount);
        window.__workingPanels.appendWorkingClipboard(mount, window.__adapter, {
            busy: false, change: /** Run only the requested fixture state change without external persistence. */ fn => fn(), notify: /** Leave private-list notifications inert in this component fixture. */ () => { }
        });
    });
    await page.locator('#working-component').getByRole('button', { name: /Working checkpoint/ }).click();

    const popup = page.getByRole('dialog', { name: 'Retained working source' });
    await expect(popup).toContainText('It has not been promoted');
    expect(await popup.locator('pre').textContent()).toBe('<script>😀\r\n中');
    expect(await popup.locator('script').count()).toBe(0);
    for (const theme of ['light', 'dark']) {
        await page.evaluate(/** Toggle the display theme without altering retained source evidence. */ t => document.body.classList.toggle('light', t === 'light'), theme);
        await page.setViewportSize({ width: 1280, height: 1000 });
        await page.screenshot({ path: resolve(frontend, `../.local/artifacts/working-inspection-${theme}-1280.png`) });
    }
    await popup.getByRole('button', { name: 'Close source' }).click();

    await expect(popup).toHaveCount(0);
});
