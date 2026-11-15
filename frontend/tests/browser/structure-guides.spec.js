/**
 * # Hypergraph PX — Source-aligned structure guide evidence
 *
 * Checks gutter hierarchy, spacing and below-widget alignment without indenting
 * or modifying owned source.
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
 * Used by: Browser editor and Explorer guide presentation; Playwright assurance.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/structure-guides.spec.js
 * [spec0]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec1]: ../../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec2]: ../../../docs/05-domain/text-and-anchors.md
 * [spec3]: ../../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec4]: ../../../docs/09-guides/developers/repository-development.md
 * [spec5]: ../../../docs/06-subsystems/frontend-interaction.md
 */
import { test, expect } from './fixtures.js';
import { readFile } from 'node:fs/promises';

/** Download original owned source for guide-layout preservation checks. */
async function source(page) {
    const ready = page.waitForEvent('download');
    await page.getByRole('button', { name: '↓ Markdown', exact: true }).click();
    return readFile(await (await ready).path(), 'utf8');
}

test('editor structure guides share a fixed gutter, follow hierarchy/wrapping and never indent or alter source', /** Verify editor structure guides share a fixed gutter, follow hierarchy/wrapping and never indent or alter source. */ async ({ page }) => {
    const errors = [];
    page.on('pageerror', /** Collect uncaught errors while navigating hierarchical guide fixtures. */ error => errors.push(error.message));
    page.on('dialog', /** Accept fixture dialogs before entering exact source. */ dialog => dialog.accept());
    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.goto('/');

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await expect(editor).toBeVisible();

    const text = '# Root\n\nRoot paragraph ' + ('with enough text to wrap over several lines. '.repeat(8)) + '\n\n### Child\n\nChild paragraph.\n\n#### Nested\n\nNested paragraph.\n\n## Sibling\n\nLast paragraph.';
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(text);
    await page.keyboard.press('ControlOrMeta+Home');

    await expect(page.locator('.cm-structure-gutter')).toBeVisible();

    const geometry = await page.locator('.cm-scroller').evaluate(/** Measure gutter, source and guide-rail geometry together in the live scroller. */ scroller => {
        const gutter = scroller.querySelector('.cm-structure-gutter').getBoundingClientRect(), content = scroller.querySelector('.cm-content').getBoundingClientRect(), lines = [...scroller.querySelectorAll('.cm-line')].map(/** Capture each source line bounding rectangle for horizontal-alignment comparison. */ line => line.getBoundingClientRect()), rails = [...scroller.querySelectorAll('.editor-structure-rail')].map(/** Capture rail width, lane and horizontal position for spacing checks. */ rail => ({ left: rail.getBoundingClientRect().left, width: rail.getBoundingClientRect().width, lane: Number(rail.dataset.lane) }));
        return {
            gutterWidth: gutter.width, gutterBeforeText: gutter.right <= content.left, textSpread: Math.max(...lines.map(/** Extract source-line left edges for the maximum-spread calculation. */ line => line.left)) - Math.min(...lines.map(/** Extract source-line left edges for the minimum-spread calculation. */ line => line.left)), horizontalOverflow: scroller.scrollWidth - scroller.clientWidth, rails
        };
    });
    expect(geometry.gutterWidth).toBe(90);
    expect(geometry.gutterBeforeText).toBe(true);
    expect(geometry.textSpread).toBeLessThan(1);
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(geometry.rails.every(/** Require guide rails to remain one CSS pixel wide. */ rail => rail.width === 1)).toBe(true);

    const lanes = [...new Map(geometry.rails.map(/** Pair each rail lane with its actual left position before deduplication. */ rail => [rail.lane, rail.left])).entries()].sort(/** Order rail lanes numerically before comparing successive spacing. */ (a, b) => a[0] - b[0]);
    for (let i = 1; i < lanes.length; i++)
        expect(lanes[i][1] - lanes[i - 1][1]).toBe(18);

    const root = await page.locator('.editor-structure-rail[data-guide-id="section:0"]').evaluateAll(/** Collect all rendered segments of the root guide for continuity checks. */ nodes => nodes.map(/** Measure one root-guide segment vertical bounds. */ node => ({ top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom })));
    expect(root.length).toBeGreaterThan(5);
    for (let i = 1; i < root.length; i++)
        expect(Math.abs(root[i].top - root[i - 1].bottom)).toBeLessThan(1);

    const paragraph = page.locator(`.editor-structure-rail[data-guide-id="paragraph:${text.indexOf('Root paragraph')}"]`);
    expect((await paragraph.first().boundingBox()).height).toBeGreaterThan(60);

    await page.locator('.cm-scroller').evaluate(/** Scroll to the final paragraph to test virtualized guide alignment. */ element => element.scrollTop = element.scrollHeight);
    await page.locator('#editorHost .cm-content .cm-line').filter({ hasText: 'Last paragraph.' }).scrollIntoViewIfNeeded();

    const lastLine = await page.locator('.cm-content .cm-line').filter({ hasText: 'Last paragraph.' }).boundingBox(), lastGuide = await page.locator(`.editor-structure-rail[data-guide-id="paragraph:${text.indexOf('Last paragraph')}"]`).boundingBox();
    expect(Math.abs(lastGuide.y - lastLine.y - 3)).toBeLessThan(1);
    expect(Math.abs(lastGuide.height - lastLine.height + 6)).toBeLessThan(1);

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');

    expect(await editor.evaluate(/** Copy exact source through the editor clipboard event path. */ element => {
        const data = new DataTransfer();
        element.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data }));
        return data.getData('text/plain');
    })).toBe(text);
    expect(await source(page)).toBe(text);
    expect(errors).toEqual([]);

    await page.screenshot({ path: '../.local/artifacts/ui/editor-structure-guides.png' });
});

test('editor guide spacing and colour match Explorer with balanced margins in both themes and desktop widths', /** Verify editor guide spacing and colour match Explorer with balanced margins in both themes and desktop widths. */ async ({ page }) => {
    page.on('dialog', /** Accept fixture dialogs before comparing editor and Explorer guide styling. */ dialog => dialog.accept());
    await page.goto('/');

    await expect(page.locator('.editor-structure-rail').first()).toBeVisible();
    for (const light of [false, true]) {
        if (light)
            await page.getByRole('button', { name: 'Switch theme', exact: true }).click();
        for (const width of [1600, 2000, 1280]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(/** Wait for two animation frames before geometry sampling after viewport changes. */ () => new Promise(/** Schedule the first frame while retaining the completion resolver. */ resolve => requestAnimationFrame(/** Schedule the second frame before resolving the layout wait. */ () => requestAnimationFrame(resolve))));

            const actual = await page.evaluate(/** Sample matching editor/Explorer spacing and colours from actual rendered styles. */ () => {
                const scroller = document.querySelector('.cm-scroller'), boundary = scroller.getBoundingClientRect(), gutter = document.querySelector('.cm-structure-gutter').getBoundingClientRect(), content = document.querySelector('.cm-content'), line = content.querySelector('.cm-line'), rails = [...document.querySelectorAll('.editor-structure-rail')], byLane = [...new Map(rails.map(/** Pair rail lane IDs with measured positions for ordered comparison. */ rail => [Number(rail.dataset.lane), rail.getBoundingClientRect().left])).entries()].sort(/** Sort editor lanes by numeric lane rather than DOM order. */ (a, b) => a[0] - b[0]);

                const outline = document.querySelector('#navigation .outline'), explorer = [outline, ...outline.querySelectorAll('.outline-children')].filter(/** Keep only visible Explorer guide containers in the comparison. */ element => element.getBoundingClientRect().height > 0), positions = [...new Set(explorer.map(/** Extract Explorer container left positions without estimating indentation. */ element => element.getBoundingClientRect().left))].sort(/** Sort distinct Explorer left positions numerically. */ (a, b) => a - b), probe = document.createElement('span');
                probe.style.borderLeft = '1px solid var(--border)';
                document.body.append(probe);

                const border = getComputedStyle(probe).borderLeftColor;
                probe.remove();

                const textColumn = line.getBoundingClientRect().left + parseFloat(getComputedStyle(line).paddingLeft);
                return {
                    editorSteps: byLane.slice(1).map(/** Measure each adjacent editor lane step from actual positions. */ (entry, index) => entry[1] - byLane[index][1]), explorerSteps: positions.slice(1).map(/** Measure each adjacent Explorer step from actual positions. */ (x, index) => x - positions[index]), editorColours: [...new Set(rails.map(/** Read each rail computed background colour for agreement checks. */ rail => getComputedStyle(rail).backgroundColor))], opacities: [...new Set(rails.map(/** Read each rail computed opacity without assuming a theme default. */ rail => getComputedStyle(rail).opacity))], explorerColour: getComputedStyle(outline).borderLeftColor, border, inset: byLane[0][1] - boundary.left, textGap: textColumn - (byLane.at(-1)[1] + 1), leftPadding: parseFloat(getComputedStyle(content).paddingLeft), centeringGap: content.getBoundingClientRect().left - gutter.right, overflow: scroller.scrollWidth - scroller.clientWidth, gutterWidth: gutter.width
                };
            });
            expect(actual.editorSteps.length).toBeGreaterThan(0);
            expect(actual.editorSteps.every(/** Require every editor lane interval to equal the prescribed spacing. */ step => step === 18)).toBe(true);
            expect(actual.explorerSteps.every(/** Require every Explorer guide interval to match the same spacing. */ step => step === 18)).toBe(true);
            expect(actual.explorerSteps.length).toBeGreaterThan(0);
            expect(actual.editorColours).toEqual([actual.explorerColour]);
            expect(actual.editorColours).toEqual([actual.border]);
            expect(actual.opacities).toEqual(['1']);
            expect(actual.inset).toBe(24);
            expect(actual.textGap).toBeLessThanOrEqual(34);
            expect(actual.textGap).toBeGreaterThanOrEqual(12);
            expect(actual.leftPadding).toBe(0);
            expect(Math.abs(actual.centeringGap)).toBeLessThan(1);
            expect(actual.overflow).toBeLessThanOrEqual(1);
            expect(actual.gutterWidth).toBe(90);
            if (width === 1600)
                await page.screenshot({ path: `../.local/artifacts/ui/structure-guides-balanced-${light ? 'light' : 'dark'}.png` });
        }
    }
});

test('guides stay aligned after tables and rendered maths through scrolling, wrapping and table source toggles', /** Verify guides stay aligned after tables and rendered maths through scrolling, wrapping and table source toggles. */ async ({ page }) => {
    const errors = [];
    page.on('pageerror', /** Collect errors while toggling table/math source presentation. */ error => errors.push(error.message));
    page.on('dialog', /** Accept fixture dialogs during below-widget guide scenarios. */ dialog => dialog.accept());
    await page.goto('/');

    const original = await source(page);

    const locations = [['Working with evidence', '### A small mathematical example'], ['Reuse without losing context', '1. Capture a meaningful passage.'], ['Reuse without losing context', '2. Choose a destination in this or another chapter.'], ['Reuse without losing context', '3. Inspect the result and its original source label.'], ['Questions for further investigation', '## Questions for further investigation']];
    /** Revisit every exact source location and require gutter/source row alignment. */
    async function aligned() {
        for (const [heading, text] of locations) {
            await page.getByRole('button', { name: heading, exact: true }).click();

            const from = original.indexOf(text);
            expect(from).toBeGreaterThan(0);

            const line = page.locator('#editorHost .cm-line').filter({ hasText: text }), row = page.locator(`.cm-structure-gutter .editor-structure-rails[data-source-from="${from}"]`);
            await expect(line).toBeVisible();
            await expect(row).toHaveCount(1);
            await expect.poll(/** Poll row/line bounds until both vertical position and height agree. */ async () => {
                const boxes = await Promise.all([line.boundingBox(), row.locator('..').boundingBox()]);
                return Math.max(Math.abs(boxes[0].y - boxes[1].y), Math.abs(boxes[0].height - boxes[1].height));
            }).toBeLessThan(1);
        }
    }
    await aligned();
    await page.getByLabel('Maths display', { exact: true }).selectOption('rendered');
    await aligned();
    await page.getByLabel('Wrap width', { exact: true }).selectOption('60');
    await aligned();
    await page.getByLabel('Editor font size', { exact: true }).fill('21');
    await aligned();
    await page.getByRole('button', { name: 'Working with evidence', exact: true }).click();
    await page.locator('#editorHost .rendered-table-block').getByRole('button', { name: 'Edit Markdown', exact: true }).click();
    await aligned();
    await page.getByRole('button', { name: 'Working with evidence', exact: true }).click();
    await page.locator('#editorHost .table-source-toggle').getByRole('button', { name: 'Render table', exact: true }).click();
    await aligned();
    await page.getByRole('button', { name: 'Working with evidence', exact: true }).click();

    await expect.poll(/** Poll the rendered table wrapper padding after toggling presentation. */ () => page.locator('#editorHost .table-block-layout').evaluate(/** Measure wrapper/card height and top offset from their actual DOM rectangles. */ element => {
        const wrapper = element.getBoundingClientRect(), card = element.querySelector('.rendered-table-block').getBoundingClientRect();
        return [wrapper.height - card.height, card.y - wrapper.y];
    })).toEqual([36, 18]);

    await page.getByRole('button', { name: 'Reuse without losing context', exact: true }).click();
    await page.screenshot({ path: '../.local/artifacts/ui/guides-after-table-maths.png' });

    expect(await source(page)).toBe(original);
    expect(errors).toEqual([]);
});
