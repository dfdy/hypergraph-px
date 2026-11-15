/**
 * # Hypergraph PX — Readable Markdown browser evidence
 *
 * Checks rendered headings, styles and links without changing exact owned
 * Markdown or clipboard text.
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
 * Used by: Browser editor and Navigator; Playwright presentation assurance.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/markdown-presentation.spec.js
 * [spec0]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec1]: ../../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec2]: ../../../docs/05-domain/text-and-anchors.md
 * [spec3]: ../../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec4]: ../../../docs/09-guides/developers/repository-development.md
 * [spec5]: ../../../docs/06-subsystems/frontend-interaction.md
 */
import { test, expect } from './fixtures.js';
import { readFile } from 'node:fs/promises';

/** Download exact owned Markdown for source-preservation assertions. */
async function source(page) {
    const ready = page.waitForEvent('download');
    await page.locator('#download').click();
    return readFile(await (await ready).path(), 'utf8');
}

const text = '# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six\n\nOrdinary **Bold words** and *Italic words* and [Go to One](#one).\n\n`**literal** [code](#one)`';

test('readable Markdown uses actual font styles, six heading sizes and concealed navigable link code without editing source', /** Verify readable Markdown uses actual font styles, six heading sizes and concealed navigable link code without editing source. */ async ({ page }) => {
    const errors = [];
    page.on('pageerror', /** Record unexpected renderer errors during styling/link interaction. */ e => errors.push(e.message));
    page.on('dialog', /** Accept the fixture page dialog without treating it as source modification. */ d => d.accept());
    await page.goto('/');

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(text);

    await expect(editor.locator('.cm-markdown-bold')).toHaveCSS('font-weight', '750');
    await expect(editor.locator('.cm-markdown-italic')).toHaveCSS('font-style', 'italic');

    const sizes = await editor.evaluate(/** Read all six heading font sizes from the live editor. */ root => [1, 2, 3, 4, 5, 6].map(/** Measure one heading computed font size rather than inferring from class names. */ n => parseFloat(getComputedStyle(root.querySelector('.cm-h' + n)).fontSize)));
    expect(sizes.every(/** Require every deeper heading to be smaller than the previous level. */ (size, i) => !i || sizes[i - 1] > size)).toBe(true);

    const link = editor.getByRole('link', { name: 'Go to One' });
    await expect(link).toBeVisible();
    await expect(editor).not.toContainText('](#one).');
    await expect(editor.locator('.cm-inline-code')).toContainText('[code](#one)');
    expect(await source(page)).toBe(text);

    await page.getByLabel('Markdown source', { exact: true }).check();

    await expect(editor).toContainText('[Go to One](#one)');

    await link.click();

    await expect(page.getByRole('button', { name: 'Heading 1 style', exact: true })).toHaveAttribute('aria-pressed', 'false');

    await page.getByLabel('Markdown source', { exact: true }).uncheck();

    expect(await source(page)).toBe(text);

    await link.click();

    await expect(page.getByRole('button', { name: 'Heading 1 style', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(await source(page)).toBe(text);

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');

    const copied = await editor.evaluate(/** Dispatch clipboard copy and read exact plaintext rather than displayed concealment. */ el => {
        const data = new DataTransfer();
        el.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data }));
        return data.getData('text/plain');
    });
    expect(copied).toBe(text);

    await page.keyboard.insertText('replacement');
    await page.keyboard.press('ControlOrMeta+z');

    expect(await source(page)).toBe(text);
    await expect(link).toBeVisible();
    expect(errors).toEqual([]);
});

test('formatted text and links match Navigator layout in both themes below table/math widgets', /** Verify formatted text and links match Navigator layout in both themes below table/math widgets. */ async ({ page }) => {
    page.on('dialog', /** Accept fixture dialogs before the below-widget geometry scenario. */ d => d.accept());
    await page.goto('/');

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText('| A | B |\n| --- | --- |\n| a | b |\n\n$$\nx=1\n$$\n\n' + text);
    await page.getByLabel('Maths display', { exact: true }).selectOption('rendered');
    for (const theme of ['dark', 'light'])
        for (const width of [1280, 1600, 2000]) {
            await page.setViewportSize({ width, height: 1200 });
            await page.evaluate(/** Toggle only the current display theme for the width/theme sweep. */ t => document.body.classList.toggle('light', t === 'light'), theme);
            await editor.focus();
            await page.keyboard.press('ControlOrMeta+End');

            await expect(editor.getByRole('link', { name: 'Go to One' })).toBeVisible();
            await expect(page.locator('#mapText .cm-markdown-bold').first()).toHaveCSS('font-weight', '750');
            await expect(page.locator('#mapText')).toContainText('Bold words');
            await expect(page.locator('#mapText')).not.toContainText('](#one).');

            await page.screenshot({ path: `../.local/artifacts/markdown-presentation-${theme}-${width}.png`, animations: 'disabled' });
        }
});

test('selecting a rendered link label does not follow it and preserves exact source', /** Verify selecting a rendered link label does not follow it and preserves exact source. */ async ({ page }) => {
    page.on('dialog', /** Accept the fixture dialog before selecting a link label. */ d => d.accept());
    await page.goto('/');

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(text);

    const link = editor.getByRole('link', { name: 'Go to One' });

    const bounds = await link.boundingBox();
    await page.mouse.move(bounds.x + 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width - 2, bounds.y + bounds.height / 2, { steps: 12 });
    await page.mouse.up();

    await expect.poll(/** Poll for a real browser text selection after pointer dragging. */ () => page.evaluate(/** Read selected label text without following its target. */ () => window.getSelection().toString())).toMatch(/Go to/);

    // The browser's trailing click must not replace the selected label with a heading jump.
    await link.evaluate(/** Dispatch the trailing click to prove selected labels do not navigate. */ el => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));

    await expect(page.getByRole('button', { name: 'Heading 1 style', exact: true })).toHaveAttribute('aria-pressed', 'false');
    expect(await source(page)).toBe(text);
});

test('escaped brackets remain one readable heading link with maths rendering enabled', /** Verify escaped brackets remain one readable heading link with maths rendering enabled. */ async ({ page }) => {
    page.on('dialog', /** Accept the fixture dialog before escaped-bracket rendering. */ d => d.accept());
    await page.goto('/');

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText('# Target\n\n[artial 😀, \\[text\\]!](#target)');
    await page.getByLabel('Maths display', { exact: true }).selectOption('rendered');

    await expect(editor.getByRole('link', { name: 'artial 😀, [text]!' })).toHaveCount(1);
    await expect(editor.getByRole('link', { name: 'artial 😀, [text]!' })).toBeVisible();
});
