/**
 * Hypergraph PX — Exact provenance marker browser checks
 *
 * Check sentence/paragraph/section provenance controls, source-neutral geometry
 * and linked counterpart navigation in synthetic tab-only documents.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/sentence-provenance.spec.js)
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

/** Download exact current source to detect presentation or navigation rewriting. */
async function source(page) { const ready = page.waitForEvent('download'); await page.getByRole('button', { name: '↓ Markdown', exact: true }).click(); return readFile(await (await ready).path(), 'utf8'); }

test.beforeEach(/** Open the synthetic editor and accept fixture prompts before each provenance scenario. */ async ({ page }) => {
    page.on('dialog', /** Accept synthetic page dialogs without attaching to any personal browser session. */  d => d.accept());
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Markdown document editor' })).toBeVisible();
});

test('sentence-start provenance icons distinguish all links and inspect their precise counterpart', /** Check every provenance icon meaning, counterpart inspection and source-neutral sentence-start placement. */ async ({ page }) => {
    const original = await source(page), icons = page.locator('#editorHost .sentence-provenance');

    for (const label of ['Has been forked', 'Is a fork', 'Is a copy of', 'Is a revision of', 'Is transposed from', 'Is extracted from', 'Is split from', 'Is merged from', 'Is an embed of (pinned)', 'References sentence'])
        await expect(icons.getByRole('button', { name: label, exact: true })).toHaveCount(1);

    for (const root of ['#editorHost', '#mapText'])
        expect(await page.locator(root).evaluate(/** Inspect marker order in the editor and Navigator without altering rendered source. */  element => {
            const nodes = [...element.querySelectorAll('.sentence-provenance,.relationship-boundary')];

            return nodes.indexOf(nodes.find(/** Locate the first semantic relationship boundary among source-neutral markers. */  node => node.classList.contains('relationship-boundary'))) < nodes.indexOf(nodes.filter(/** Collect sentence provenance markers to compare their order against relationship controls. */  node => node.classList.contains('sentence-provenance'))[1]);
        })).toBe(true);
    const outgoing = icons.getByRole('button', { name: 'Has been forked', exact: true });

    await outgoing.hover();
    await expect(page.getByRole('tooltip')).toContainText('Has been forked', { timeout: 5000 });
    await outgoing.click();
    await expect(page.getByRole('tab', { name: 'Provenance', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.provenance-card.inspected h3')).toHaveText('Has been forked');
    await expect(page.locator('.provenance-card.inspected')).toContainText('Synthetic provenance example');
    await page.locator('.provenance-card.inspected').getByRole('button', { name: 'Go to linked sentence', exact: true }).click();
    await expect.poll(/** Poll selected source after navigating to the linked counterpart sentence. */ () => page.evaluate(/** Read the browser selected plain text for exact counterpart comparison. */ () => window.getSelection().toString())).toBe('This is an entirely synthetic document for exploring the interface.');
    expect(await source(page)).toBe(original);
    const geometry = await page.locator('#editorHost .sentence-provenance').first().evaluate(/** Read source text before the first provenance group to verify sentence-start placement. */  group => { const range = document.createRange(); range.selectNodeContents(group.closest('.cm-line')); range.setEndBefore(group); return range.toString(); });
    expect(geometry).toBe('');
    await page.screenshot({ path: '../.local/artifacts/ui/sentence-provenance-icons.png' });
});

test('forking a whole sentence shows outgoing and incoming icons and supports cross-document navigation', /** Check whole-sentence Fork creates outgoing/incoming endpoints and navigates across independent documents. */ async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' }), text = '# Test\n\nA standalone source sentence.';

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(text);
    await page.keyboard.press('ControlOrMeta+Home');

    for (let i = 0; i < 8; i++)
        await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ControlOrMeta+Shift+End');
    await page.getByRole('button', { name: 'Fork', exact: true }).click();
    await page.getByLabel('Fork name').fill('Sentence fork');
    await page.getByRole('button', { name: 'Create demo fork', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('Sentence fork');
    await page.locator('#editorHost .sentence-provenance').getByRole('button', { name: 'Is a fork', exact: true }).click();
    await expect(page.locator('.provenance-card.inspected')).toContainText('Tab-only operation');
    await page.locator('.provenance-card.inspected').getByRole('button', { name: 'Go to linked sentence', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('Introduction');
    await expect(page.locator('#editorHost .sentence-provenance').getByRole('button', { name: 'Has been forked', exact: true })).toHaveCount(1);
    expect(await source(page)).toBe(text);
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.insertText('# Inserted heading\n\n');
    await expect(page.locator('#editorHost .sentence-provenance').getByRole('button', { name: 'Has been forked', exact: true })).toHaveCount(1);
    await page.getByRole('button', { name: 'Sentence fork', exact: true }).click();
    await page.locator('#editorHost .sentence-provenance').getByRole('button', { name: 'Is a fork', exact: true }).click();
    await expect(page.locator('.provenance-card.inspected').getByRole('button', { name: 'Go to linked sentence', exact: true })).toBeEnabled();
});

test('provenance clipboard fork paste adds both sentence endpoints without treating capture alone as derivation', /** Check capture alone adds no derivation while explicit simulated Fork paste adds both sentence endpoints. */ async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText('# Source\n\nA complete source sentence.');
    await page.keyboard.press('ControlOrMeta+A');
    await page.getByRole('button', { name: 'Copy selection to clipboard', exact: true }).click();
    await expect(page.locator('#editorHost .sentence-provenance')).toHaveCount(0);
    await page.getByRole('button', { name: 'Next chapter', exact: true }).click();
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText('# Destination\n\n');
    await page.getByRole('button', { name: 'Simulate fork paste', exact: true }).click();
    await page.locator('#editorHost .sentence-provenance').getByRole('button', { name: 'Is a fork', exact: true }).click();
    await expect(page.locator('.provenance-card.inspected')).toContainText('A complete source sentence.');
    await page.locator('.provenance-card.inspected').getByRole('button', { name: 'Go to linked sentence', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('Introduction');
    await expect(page.locator('#editorHost .sentence-provenance').getByRole('button', { name: 'Has been forked', exact: true })).toHaveCount(1);
});

test('paragraph and section icons sit above and left of their text and inspect the correct unit', /** Check paragraph/section icons reserve source-neutral space and navigate to the exact selected unit. */ async ({ page }) => {
    const original = await source(page);

    for (const kind of ['paragraph', 'section']) {
        const row = page.locator(`#editorHost .provenance-${kind}`).first();

        await expect(row).toBeVisible();
        const geometry = await row.evaluate(/** Measure provenance marker position relative to the first owned source text on its line. */  element => { const box = element.getBoundingClientRect(), line = element.closest('.cm-line'), nodes = document.createTreeWalker(line, NodeFilter.SHOW_TEXT); let node; while ((node = nodes.nextNode())) {
            if (node.textContent.trim() && !node.parentElement.closest('[contenteditable="false"]')) {
                const range = document.createRange();
                range.selectNodeContents(node);
                const text = range.getBoundingClientRect();

                return { above: box.bottom <= text.top + 1, left: Math.abs(box.left - line.getBoundingClientRect().left) < 1 };
            }
        } throw Error('Missing source text'); });
        expect(geometry).toEqual({ above: true, left: true });
        await row.getByRole('button', { name: 'Has been forked', exact: true }).click();
        const card = page.locator('.provenance-card.inspected');

        await expect(card).toContainText(`${kind} link`);
        await expect(card.getByRole('button', { name: `Go to linked ${kind}`, exact: true })).toBeEnabled();
    }
    await page.locator('.provenance-card.inspected').getByRole('button', { name: 'Go to linked section', exact: true }).click();
    await expect.poll(/** Poll exact section selection after linked-section navigation. */ () => page.evaluate(/** Read browser selected section text for exact range comparison. */ () => window.getSelection().toString())).toBe(original.slice(original.indexOf('## A workspace'), original.indexOf('## Working with evidence')).trimEnd());
    const copied = await page.locator('#editorHost .cm-content').evaluate(/** Copy linked section source through the editor clipboard path to exclude source-neutral decoration text. */  content => { const data = new DataTransfer(); content.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data })); return data.getData('text/plain'); });
    expect(copied).toBe(original.slice(original.indexOf('## A workspace'), original.indexOf('## Working with evidence')).trimEnd());

    for (const kind of ['paragraph', 'section'])
        await expect(page.locator(`#mapText .provenance-${kind}`)).not.toHaveCount(0);
    expect(await source(page)).toBe(original);
    await page.screenshot({ path: '../.local/artifacts/ui/paragraph-section-provenance.png' });
});
