/**
 * Hypergraph PX — Workbench geometry and selection browser checks
 *
 * Verify exact-source word counts, panel resizing, stable Navigator projection
 * and semantic selection gestures across source-neutral layout changes.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/workspace-enhancements.spec.js)
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

const errors = new WeakMap();

test.beforeEach(/** Open a fresh synthetic editor while collecting errors and accepting fixture dialogs. */ async ({ page }) => {
    errors.set(page, []);
    page.on('pageerror', /** Retain page exceptions for the per-scenario browser-error assertion. */  e => errors.get(page).push(e.message));
    page.on('dialog', /** Accept ordinary synthetic fixture dialogs. */  d => d.accept());
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Markdown document editor' })).toBeVisible();
});

test.afterEach(/** Require each workbench scenario to finish without browser page errors. */ async ({ page }) => expect(errors.get(page)).toEqual([]));

/** Download exact current editor source for before/after mutation checks. */
async function source(page) { const ready = page.waitForEvent('download'); await page.getByRole('button', { name: '↓ Markdown', exact: true }).click(); return readFile(await (await ready).path(), 'utf8'); }

/** Locate a precise pointer coordinate inside a requested source word at a character offset. */
async function point(page, word, offset = 2) {
    return page.locator('.cm-content').evaluate(/** Traverse owned text nodes and measure the requested scalar-sized source range. */ (root, { word, offset }) => { const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = walker.nextNode())) {
        const at = n.textContent.indexOf(word);

        if (at >= 0) {
            const r = document.createRange();
            r.setStart(n, at + offset);
            r.setEnd(n, at + offset + 1);
            const box = r.getBoundingClientRect();

            return { x: box.left + box.width * .25, y: box.top + box.height / 2 };
        }
    } throw new Error('Missing source word ' + word); }, { word, offset });
}

/** Perform one complete pointer drag gesture between measured source coordinates. */
async function drag(page, from, to) { await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(to.x, to.y, { steps: 12 }); await page.mouse.up(); }

// CodeMirror paints the DOM selection during its next measured view update.
// Assert the resulting range after it settles, rather than reading the prior drag.

/** Wait for the rendered DOM selection to match the expected semantic range. */
async function expectSelected(page, text) {
    await expect.poll(/** Poll the browser selected text after CodeMirror measured selection updates. */ () => page.evaluate(/** Read current browser selected plain text. */ () => window.getSelection().toString())).toBe(text);
}

// Start an independent selection gesture, not a native drag of already-selected text.

/** Clear prior selection drag state before beginning an independent source-selection gesture. */
async function dragSource(page, from, to) {
    await page.getByRole('textbox', { name: 'Markdown document editor' }).focus();
    await page.keyboard.press('ArrowLeft');
    const start = await point(page, from), end = await point(page, to);

    await drag(page, start, end);
}

/** Wait for selection paint and return current selected plain text. */
async function selected(page) {
    await page.evaluate(/** Wait for two animation frames before reading selection. */ () => new Promise(/** Coordinate selection layout settlement across two frames. */  resolve => requestAnimationFrame(/** Advance the second frame before completing selection settlement. */ () => requestAnimationFrame(resolve))));

    return page.evaluate(/** Read selected plain text after layout settles. */ () => window.getSelection().toString());
}

const count = /** Read a rendered numeric word total independent of thousands separators. */ async (page, id) => Number((await page.locator(id).innerText()).replaceAll(',', ''));

test('workspace/document totals follow edits, undo and independent forks; requested layout placements', /** Check exact-source document/workspace word totals through edits/Undo/Fork and requested title/control placement. */ async ({ page }) => {
    const original = await source(page), document = await count(page, '#wordCount'), workspace = await count(page, '#workspaceWordCount');
    expect(workspace).toBeGreaterThan(document);
    await expect(page.locator('#position')).toContainText(/^Document [\d,]+ words · Workspace [\d,]+ words$/);
    await expect(page.locator('#wordCount')).toHaveCSS('font-weight', '700');
    await expect(page.locator('#workspaceWordCount')).toHaveCSS('font-weight', '700');
    expect(await page.locator('.brand-px').evaluate(/** Read the PX brand suffix computed font size. */  e => getComputedStyle(e).fontSize)).toBe(await page.locator('.brand').evaluate(/** Read the main brand font size for matching suffix presentation. */  e => getComputedStyle(e).fontSize));
    await expect(page.locator('.document-bar #download')).toBeVisible();
    await expect(page.locator('.navigator-foot #download')).toHaveCount(0);
    await expect(page.locator('.document-bar')).not.toContainText('demo branch');
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.insertText('Extra words\n\n');
    await expect.poll(/** Poll current document words after inserting the fixture words. */ () => count(page, '#wordCount')).toBe(document + 2);
    await expect.poll(/** Poll workspace words after inserting the fixture words. */ () => count(page, '#workspaceWordCount')).toBe(workspace + 2);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect.poll(/** Poll restored workspace words after Undo. */ () => count(page, '#workspaceWordCount')).toBe(workspace);
    expect(await source(page)).toBe(original);
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.press('ControlOrMeta+Shift+End');
    await page.getByRole('button', { name: 'Fork', exact: true }).click();
    await page.getByLabel('Fork name').fill('Counted test fork');
    await page.getByRole('button', { name: 'Create demo fork' }).click();
    await expect.poll(/** Poll Fork document words to verify exact independent source duplication. */ () => count(page, '#wordCount')).toBe(document);
    await expect.poll(/** Poll workspace total after adding the independent Fork. */ () => count(page, '#workspaceWordCount')).toBe(workspace + document);
});

test('column separators drag and resize by keyboard while Navigator stays fixed', /** Check pointer/keyboard column resizing, fixed Navigator width and Escape rollback persistence. */ async ({ page }) => {
    const original = await source(page), map = page.locator('#documentNavigator'), initial = (await map.boundingBox()).width, outline = page.locator('.workspace .navigator');
    const before = (await outline.boundingBox()).width, handle = page.getByRole('separator', { name: 'Resize workspace column', exact: true }), box = await handle.boundingBox();

    await drag(page, { x: box.x + 4, y: box.y + 150 }, { x: box.x + 64, y: box.y + 150 });
    expect((await outline.boundingBox()).width).toBeCloseTo(before + 60, 0);
    expect((await map.boundingBox()).width).toBe(initial);
    const side = page.getByRole('separator', { name: 'Resize interaction and investigation column', exact: true });

    await side.focus();
    await page.keyboard.press('ArrowLeft');
    expect((await map.boundingBox()).width).toBe(initial);
    await page.getByRole('button', { name: 'Move navigator to left', exact: true }).click();
    expect((await map.boundingBox()).width).toBe(initial);
    expect(await source(page)).toBe(original);
    const width = (await outline.boundingBox()).width, again = await handle.boundingBox();

    await page.mouse.move(again.x + 4, again.y + 150);
    await page.mouse.down();
    await page.mouse.move(again.x + 44, again.y + 150);
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect.poll(/** Poll outline width after canceling the pointer resize. */ async () => (await outline.boundingBox()).width).toBeCloseTo(width, 0);
    await page.reload();
    await expect.poll(/** Poll persisted outline width after reloading canceled resize state. */ async () => (await outline.boundingBox()).width).toBeCloseTo(width, 0);
});

test('Navigator content stays stable across scrolling with full table and formula rendering', /** Check the Navigator rendered table/math projection remains identical while editor scrolling changes viewport position. */ async ({ page }) => {
    await page.getByLabel('Maths display').selectOption('rendered');
    await expect(page.locator('#mapText .rendered-table-block')).toHaveCount(1);
    await expect(page.locator('#mapText .math-rendered')).toHaveCount(2);
    await page.evaluate(/** Wait for loaded fonts before recording Navigator projection identity. */ async () => { await document.fonts.ready; });
    const initial = await page.locator('#mapText').innerHTML();
    const total = Number(await page.locator('#mapTrack').getAttribute('data-total-height'));

    for (const fraction of [0, .2, .65, 1, .4, 0]) {
        await page.locator('.cm-scroller').evaluate(/** Scroll the editor to a requested fraction without changing its source projection. */ (e, f) => { e.scrollTop = f * (e.scrollHeight - e.clientHeight); }, fraction);
        await page.evaluate(/** Wait two frames before comparing the stable Navigator projection. */ () => new Promise(/** Coordinate the Navigator layout two-frame wait. */  r => requestAnimationFrame(/** Advance the second frame before checking projection stability. */ () => requestAnimationFrame(r))));
        expect(await page.locator('#mapText').innerHTML()).toBe(initial);
        expect(Number(await page.locator('#mapTrack').getAttribute('data-total-height'))).toBeCloseTo(total, 0);
    }
    await page.locator('#documentNavigator').screenshot({ path: '../.local/artifacts/ui/navigator-stable.png' });
});

test('one through five repeated clicks select caret, word, sentence, paragraph, section', /** Check repeated clicks progress from caret to word/sentence/paragraph/section without changing source. */ async ({ page }) => {
    const original = await source(page), p = await point(page, 'Hypergraph');

    await page.mouse.click(p.x, p.y, { clickCount: 1 });
    await expect(page.getByRole('button', { name: 'Copy selection to clipboard', exact: true })).toBeDisabled();
    await page.mouse.click(p.x, p.y, { clickCount: 2 });
    expect(await selected(page)).toBe('Hypergraph');
    const paragraph = 'Welcome to the Hypergraph research workspace. This is an entirely synthetic document for exploring the interface. Type freely: changes stay in this browser tab.';

    for (const [clicks, expected] of [[3, 'Welcome to the Hypergraph research workspace.'], [4, paragraph], [5, original]]) {
        await page.mouse.click(p.x, p.y, { clickCount: clicks });
        await page.getByRole('button', { name: 'Fork', exact: true }).click();
        await expect(page.locator('.function-dialog .source-preview')).toHaveText(expected);
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
    expect(await source(page)).toBe(original);
});

test('drag snapping promotes sentences/paragraphs in both directions and can be disabled', /** Check bidirectional semantic drag snapping, code/math exclusions and persisted disable preference. */ async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.insertText('# Snap tests\n\nAlpha one. Beta two.\n\nGamma three. Delta four.\n\n`code one. code two.`\n\n\\(math one. math two.\\)\n\n');
    await page.keyboard.press('ControlOrMeta+Home');
    const original = await source(page);

    await dragSource(page, 'Alpha', 'Beta');
    await expectSelected(page, 'Alpha one. Beta two.');
    await dragSource(page, 'Alpha', 'Gamma');
    await expectSelected(page, 'Alpha one. Beta two.\n\nGamma three. Delta four.');
    await dragSource(page, 'Gamma', 'Alpha');
    await expectSelected(page, 'Alpha one. Beta two.\n\nGamma three. Delta four.');
    await dragSource(page, 'code one', 'code two');
    expect((await selected(page)).length).toBeLessThan('code one. code two.'.length);
    await dragSource(page, 'math one', 'math two');
    expect((await selected(page)).length).toBeLessThan('math one. math two.'.length);
    await page.getByRole('checkbox', { name: 'Drag snapping', exact: true }).uncheck();
    await dragSource(page, 'Alpha', 'Beta');
    expect(await selected(page)).not.toBe('Alpha one. Beta two.');
    expect((await selected(page)).length).toBeLessThan('Alpha one. Beta two.'.length);
    expect(await source(page)).toBe(original);
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Drag snapping', exact: true })).not.toBeChecked();
});

test('semantic blocks have presentation spacing without rewriting source or splitting soft lines', /** Check visual semantic-block spacing preserves exact source and does not split soft source continuations. */ async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.insertText('# Adjacent heading\nParagraph without an empty line.\nA soft continuation.\n## Next heading\nMore prose.\n\n');
    const current = await source(page);

    await expect(page.locator('.cm-editor .cm-line').filter({ hasText: 'Paragraph without an empty line.' })).toHaveCSS('padding-top', '12px');
    await expect(page.locator('.cm-editor .cm-line').filter({ hasText: 'A soft continuation.' })).toHaveCSS('padding-top', '0px');
    await expect(page.locator('.cm-editor .cm-line').filter({ hasText: '## Next heading' })).toHaveCSS('padding-top', '12px');
    expect(await source(page)).toBe(current);
});

test('backward drag after the final full stop selects words without grabbing the following paragraph', /** Check backward drag from final punctuation selects words without including the next paragraph. */ async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' }), text = '# Snap end\n\nFirst sentence. Last words here.\n\nNext paragraph.\n';

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(text);
    await expect(page.getByRole('checkbox', { name: 'Drag snapping', exact: true })).toBeChecked();
    const points = await page.locator('.cm-content').evaluate(/** Measure drag endpoints at final punctuation and the interior target word from actual source text nodes. */  root => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const at = node.textContent.indexOf('Last words here.');

            if (at >= 0) {
                const last = document.createRange(), word = document.createRange();
                last.setStart(node, at + 'Last words here'.length);
                last.setEnd(node, at + 'Last words here.'.length);
                word.setStart(node, at + 'Last '.length);
                word.setEnd(node, at + 'Last w'.length);
                const end = last.getBoundingClientRect(), start = word.getBoundingClientRect();

                return { from: { x: end.right + .1, y: end.top + end.height / 2 }, to: { x: start.left + .1, y: start.top + start.height / 2 } };
            }
        }
        throw Error('Missing test sentence');
    });

    await drag(page, points.from, points.to);
    await expect.poll(/** Poll selected source after the backward punctuation drag. */ () => selected(page)).toBe('words here.');
    expect(await source(page)).toBe(text);
});

test('sidebar halves share divider insets and tab spacing at default and resized widths', /** Check both sidebar halves share tab/heading/body insets through keyboard resizing. */ async ({ page }) => {
    const handle = page.getByRole('separator', { name: 'Resize interaction and investigation column', exact: true });

    /** Measure and compare both sidebar halves before and after each requested resize. */
    async function check() {
        const result = await page.locator('.right-sidebar').evaluate(/** Read sidebar panel geometry and computed tab styles relative to the same outer edge. */  sidebar => {
            const edge = sidebar.getBoundingClientRect().left;

            return [...sidebar.querySelectorAll('.right-panel')].map(/** Collect one panel heading/tab/body inset and tab rhythm for peer comparison. */  panel => ({ tab: panel.querySelector('.tabs button').getBoundingClientRect().left - edge, heading: panel.querySelector('.pane-heading > span').getBoundingClientRect().left - edge, body: Number.parseFloat(getComputedStyle(panel.querySelector('.panel-body')).paddingLeft), gap: getComputedStyle(panel.querySelector('.tabs')).gap, padding: getComputedStyle(panel.querySelector('.tabs button')).padding, font: getComputedStyle(panel.querySelector('.tabs button')).fontSize }));
        });
        expect(result[0]).toEqual(result[1]);
        expect(result[0].tab).toBe(12);
        expect(result[0].heading).toBe(12);
        expect(result[0].body).toBe(12);
        expect(result[0].gap).toBe('4px');
    }
    await check();
    await handle.focus();
    await page.keyboard.press('Home');

    for (let i = 0; i < 9; i++)
        await page.keyboard.press('ArrowRight');
    await check();
    const history = page.getByRole('tablist', { name: 'Investigation tabs' }).getByRole('tab', { name: 'History', exact: true });

    await history.focus();
    await expect(history).toBeInViewport();
    await handle.focus();
    await page.keyboard.press('Home');

    for (let i = 0; i < 5; i++)
        await page.keyboard.press('Shift+ArrowLeft');
    await check();
    await page.keyboard.press('Home');
    await check();
    await page.screenshot({ path: '../.local/artifacts/ui/sidebar-consistent-spacing.png' });
});

test('drag selection follows moves through blank gaps and can restart inside an existing selection', /** Check blank-gap selection movement and restarting a drag inside highlighted text remain source-neutral. */ async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' }), text = '# Gap test\n\nAlpha one. Beta two.\n\n## Next section\n\nGamma three.';

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(text);
    const alpha = await point(page, 'Alpha'), beta = await point(page, 'Beta'), gap = await page.locator('#editorHost .cm-line').nth(3).boundingBox();

    await page.mouse.move(alpha.x, alpha.y);
    await page.mouse.down();
    await page.mouse.move(gap.x + 30, gap.y + gap.height / 2, { steps: 10 });
    await expect.poll(/** Poll semantic selection while the pointer moves through a blank source gap. */ () => selected(page)).toBe('Alpha one. Beta two.');
    await page.mouse.move(beta.x, beta.y, { steps: 8 });
    await expect.poll(/** Poll semantic selection after returning from the gap into source text. */ () => selected(page)).toBe('Alpha one. Beta two.');
    await page.mouse.up();
    // The next mouse drag starts inside highlighted text. It must redraw selection, not drag the text.
    await drag(page, beta, { x: beta.x + 20, y: beta.y });
    const partial = await selected(page);
    expect(partial.length).toBeGreaterThan(0);
    expect(partial.length).toBeLessThan('Alpha one. Beta two.'.length);
    expect(await source(page)).toBe(text);
});
