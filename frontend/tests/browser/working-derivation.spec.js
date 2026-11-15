/**
 * Hypergraph PX — Retained working-source derivation component checks
 *
 * Mount the actual derivation/working clipboard components with controlled
 * protected-source results to verify exact inert text and stale/denied access
 * handling.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/working-derivation.spec.js)
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

import { fileURLToPath } from 'node:url';

let bundle;

test.beforeAll(/** Bundle the maintained derivation and working clipboard components in memory for isolated browser fixtures. */ async () => { const result = await build({ stdin: { contents: "import {renderDerivation} from './src/runtime-derivation.js';import {RuntimeWorkingClipboard} from './src/runtime-working-clipboard.js';window.renderDerivation=renderDerivation;window.WorkingClipboard=RuntimeWorkingClipboard;", resolveDir: fileURLToPath(new URL('../../', import.meta.url)) }, bundle: true, format: 'iife', write: false }); bundle = result.outputFiles[0].text; });

/** Mount deterministic working-Fork evidence with controlled denial/delay behavior and no persistent backend. */
async function setup(page) {
    await page.goto('about:blank');
    await page.addScriptTag({ content: bundle });
    await page.evaluate(/** Create synthetic identities, retained working source and externally controlled component adapter state. */ () => {
        const id = /** Build a deterministic synthetic 32-byte identity. */  n => Array(32).fill(n), key = /** Encode a synthetic document identity for the component mount key. */  id => id.map(/** Encode one synthetic identity byte as fixed-width hexadecimal. */  n => n.toString(16).padStart(2, '0')).join(''), text = '<script>😀\r\n中\r';
        const source = { kind: 'working_checkpoint', document: id(1), node: id(2), branch: id(3), working_branch: id(4), checkpoint: id(5), occurrence_path: [id(6)], start_byte: 0, end_byte: new TextEncoder().encode(text).length };
        window.eventRecord = { kind: 'working_fork', transformation: id(7), operation: id(8), actor: id(9), device: id(10), input: source, output: { document: id(11), node: id(12), snapshot: id(13), revision: id(14), occurrence_path: [id(15)], start_byte: 0, end_byte: source.end_byte } };
        window.calls = [];
        window.errors = [];
        window.deny = false;
        window.delay = false;
        const missing = /** Report an intentionally unavailable component route with a scoped not-found status. */ () => { throw Object.assign(Error('Missing'), { status: 404 }); };
        const request = /** Record protected reader calls and return cloned derivation/source evidence or deliberate denial/delay. */ async (path, body) => {
            window.calls.push({ path, body: structuredClone(body) });

            if (path === 'working/derivation')
                return structuredClone(window.eventRecord);

            if (path === 'working/source') {
                if (window.deny)
                    throw Object.assign(Error('Denied'), { status: 403 });

                if (window.delay)
                    await new Promise(/** Expose the retained source release callback for stale-access experiments. */  resolve => window.release = resolve);

                return { source: structuredClone(source), text, base: id(16), sequence: 3, publication: 'private_working_checkpoint', promotion: null };
            }

            return missing();
        };
        window.adapter = { features: { workingCopy: true }, lifecycle: 'unlocked', get: /** Return the currently selected synthetic document identity to component lifecycle checks. */ () => ({ runtime: { document: id(11) } }), docs: new Map(), request, derivation: missing, workingClipboard: new window.WorkingClipboard(request, /** Provide a deterministic synthetic mutation identity to the working clipboard adapter. */ () => id(17)) };
        window.mount = document.createElement('div');
        document.body.append(window.mount);
        window.render = /** Render derivation into the current test mount using its selected document identity. */
            () => window.renderDerivation(window.mount, window.adapter, key(id(11)), /** Collect component notices so protected-reader rejection is observable. */  message => window.errors.push(message));
        window.render();
    });
    await expect(page.getByRole('button', { name: 'Inspect exact working fork source' })).toBeVisible();
}

test('working Fork inspects exact inert checkpoint bytes through the protected source reader', /** Check exact inert checkpoint text is inspected only through the protected working-source reader. */ async ({ page }) => {
    await setup(page);
    await expect(page.locator('h3')).toHaveText('Forked from unpublished working source');
    await page.getByRole('button', { name: 'Inspect exact working fork source' }).click();
    const dialog = page.getByRole('dialog');
    expect(await dialog.locator('pre').textContent()).toBe('<script>😀\r\n中\r');
    await expect(dialog.locator('script')).toHaveCount(0);
    await expect(dialog).toContainText('unpublished source');
    expect((await page.evaluate(/** Read actual component route calls after exact-source inspection. */ () => window.calls)).map(/** Extract route paths to verify the protected derivation/source lookup sequence. */  c => c.path)).toEqual(['merge', 'working/derivation', 'working/source']);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
});

test('working Fork rejects mismatched evidence and current access denial', /** Check access denial produces no source dialog and invalid same-node derivation evidence is rejected. */ async ({ page }) => {
    await setup(page);
    await page.evaluate(/** Enable controlled current-access denial for protected source inspection. */ () => { window.deny = true; });
    await page.getByRole('button', { name: 'Inspect exact working fork source' }).click();
    await expect.poll(/** Poll component notices until the protected reader denial is visible. */ () => page.evaluate(/** Read collected protected-reader error notices. */ () => window.errors)).toEqual(['Denied']);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.evaluate(/** Forge an invalid same-node derivation output and remount to verify evidence validation. */ () => { window.eventRecord.output.node = window.eventRecord.input.node; window.mount.replaceChildren(); window.render(); });
    await expect(page.locator('p')).toContainText('Invalid recorded working-source derivation');
    await expect(page.getByRole('button')).toHaveCount(0);
});

test('delayed protected source cannot open after lock or panel replacement', /** Check delayed source responses cannot open after workspace lock or panel replacement. */ async ({ page }) => {
    for (const action of ['lock', 'replace']) {
        await setup(page);
        await page.evaluate(/** Enable a held source response before inspection begins. */ () => { window.delay = true; });
        await page.getByRole('button', { name: 'Inspect exact working fork source' }).click();
        await expect.poll(/** Poll until the protected source response reaches its controlled delay. */ () => page.evaluate(/** Read whether the retained source release callback is available. */ () => !!window.release)).toBe(true);
        await page.evaluate(/** Lock the adapter or replace its mount before releasing the now-obsolete source response. */  action => { if (action === 'lock')
            window.adapter.lifecycle = 'locked';
        else
            window.mount.replaceChildren(); window.release(); }, action);
        await expect(page.getByRole('dialog')).toHaveCount(0);
    }
});
