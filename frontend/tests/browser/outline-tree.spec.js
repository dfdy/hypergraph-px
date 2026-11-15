/**
 * Hypergraph PX — Explorer hierarchy browser checks
 *
 * Check independent outline disclosure, structure guides, follow-editor
 * navigation and tooltip/highlight presentation without changing source.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/outline-tree.spec.js)
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

/** Download the exact current editor source for before/after non-mutation checks. */
async function source(page) { const ready = page.waitForEvent('download'); await page.getByRole('button', { name: '↓ Markdown', exact: true }).click(); return readFile(await (await ready).path(), 'utf8'); }

test.beforeEach(/** Open the synthetic editor with ordinary fixture prompts accepted before each outline scenario. */ async ({ page }) => {
    page.on('dialog', /** Accept synthetic page dialogs so unrelated prompts do not stall outline checks. */  d => d.accept());
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Markdown document editor' })).toBeVisible();
});

test('every branch collapses independently, section guides span children, and close/open all works in both lenses', /** Check independent disclosure, uniform hierarchical guides and close/open-all behavior in workspace and document lenses. */ async ({ page }) => {
    const original = await source(page);
    const heading = page.getByRole('button', { name: 'Collapse Research notes subsections', exact: true });

    await heading.click();
    await expect(page.locator('#navigation .heading-open').filter({ hasText: 'Note 1', exact: true })).toBeHidden();
    await page.getByRole('button', { name: 'Expand Research notes subsections', exact: true }).click();
    await expect(page.locator('#navigation .heading-open').filter({ hasText: 'Note 1', exact: true })).toBeVisible();
    const guides = page.locator('#navigation .outline-children:visible');
    expect(await guides.count()).toBeGreaterThan(1);
    await expect(guides.first()).toHaveCSS('border-left-width', '1px');
    expect((await guides.first().boundingBox()).height).toBeGreaterThan(100);
    const steps = await guides.evaluateAll(/** Measure every visible guide horizontal offset relative to its enclosing outline guide. */  elements => elements.map(/** Calculate one guide nesting step from actual browser rectangles. */  element => element.getBoundingClientRect().left - element.parentElement.closest('.outline-children,.outline').getBoundingClientRect().left));
    expect(steps.length).toBeGreaterThan(1);

    for (const step of steps)
        expect(step).toBe(18);
    await page.getByRole('button', { name: 'Close all', exact: true }).click();
    await expect(page.locator('#navigation .chapter')).toHaveCount(6);
    await expect(page.locator('#navigation .outline')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open all', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Open all', exact: true }).click();
    await expect(page.locator('#navigation .outline')).toHaveCount(6);
    await expect(page.locator('#navigation')).not.toContainText('Synthetic dissertation');
    await expect(page.locator('.explorer-heading')).toHaveText('EXPLORER');
    await page.getByRole('tab', { name: 'Document', exact: true }).click();
    await page.getByRole('button', { name: 'Close all', exact: true }).click();
    await expect(page.locator('#navigation .chapter')).toHaveCount(1);
    await expect(page.locator('#navigation .heading-open:visible')).toHaveCount(0);
    await page.getByRole('button', { name: 'Open all', exact: true }).click();
    expect(await page.locator('#navigation .heading-open:visible').count()).toBeGreaterThan(10);
    expect(await source(page)).toBe(original);
});

test('follow editor reveals the current section, scrolls the tree, persists its toggle, and stops when disabled', /** Check follow-editor reveal/scroll, focus retention, persisted preference and disabled-state isolation. */ async ({ page }) => {
    const errors = [];
    page.on('pageerror', /** Retain browser errors so navigation failures cannot silently pass the follow-editor scenario. */  e => errors.push(e.message));
    const follow = page.getByRole('checkbox', { name: 'Follow editor', exact: true });

    await expect(follow).not.toBeChecked();
    await follow.check();
    await expect(page.locator('#navigation [aria-current="location"]')).toHaveText('1. Introduction');
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await expect(page.locator('#navigation [aria-current="location"]')).toHaveText('Closing reflection');
    expect(await page.locator('#navigation').evaluate(/** Check the active outline row fits inside its scrollable navigation viewport. */  element => { const row = element.querySelector('[aria-current="location"]').getBoundingClientRect(), box = element.getBoundingClientRect(); return row.top >= box.top && row.bottom <= box.bottom; })).toBe(true);
    await expect(editor).toBeFocused();
    await page.locator('#navigation').evaluate(/** Reset navigation scroll so the next caret movement must deliberately reveal the active row. */  element => { element.scrollTop = 0; });
    await page.keyboard.press('ArrowLeft');
    await expect.poll(/** Poll whether follow-editor has scrolled the active row back into view. */ () => page.locator('#navigation').evaluate(/** Measure active-row containment relative to navigation bounds during follow polling. */  element => { const row = element.querySelector('[aria-current="location"]').getBoundingClientRect(), box = element.getBoundingClientRect(); return row.top >= box.top && row.bottom <= box.bottom; })).toBe(true);
    await page.getByRole('button', { name: 'Close all', exact: true }).click();
    await expect(page.locator('#navigation .chapter')).toHaveCount(6);
    await expect(page.locator('#navigation .outline')).toHaveCount(0);
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await expect(page.locator('#navigation [aria-current="location"]')).toHaveText('1. Introduction');
    await expect(page.locator('#navigation .chapter')).toHaveCount(6);
    await page.locator('.cm-scroller').evaluate(/** Scroll the editor to its final source area to test current-section tracking. */  element => { element.scrollTop = element.scrollHeight; });
    await expect(page.locator('#navigation [aria-current="location"]')).toHaveText(/^Note [0-9]+$/);
    const frozen = await page.locator('#navigation [aria-current="location"]').innerText();

    await follow.uncheck();
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await expect(page.locator('#navigation [aria-current="location"]')).toHaveText(frozen);
    await follow.check();
    await page.getByRole('tab', { name: 'Document', exact: true }).click();
    await expect(page.locator('#navigation [aria-current="location"]')).toHaveText('1. Introduction');
    await page.reload();
    await expect(follow).toBeChecked();
    await expect(page.locator('#navigation [aria-current="location"]')).toHaveText('1. Introduction');
    expect(errors).toEqual([]);
    await page.screenshot({ path: '../.local/artifacts/ui/follow-outline.png' });
});

test('Explorer title and Relations-first investigation order are displayed', /** Check Explorer naming, uniform chapter structure and the Relations-first investigation tab order. */ async ({ page }) => {
    await expect(page.locator('.explorer-heading')).toHaveText('EXPLORER');
    await expect(page.locator('.explorer-heading')).not.toContainText('⌕');
    await expect(page.locator('#navigation > .chapter')).toHaveCount(6);
    await expect(page.locator('#navigation .collection-toggle')).toHaveCount(0);
    expect(await page.getByRole('tablist', { name: 'Investigation tabs' }).getByRole('tab').allTextContents()).toEqual(['Relations', 'Concepts', 'Sources', 'Provenance', 'History']);
    await expect(page.getByRole('tab', { name: 'Relations', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.screenshot({ path: '../.local/artifacts/ui/explorer-uniform-guides.png' });
});

test('Explorer highlights have gaps and text entries have no tooltips while disclosure tips remain', /** Check separated current/hover highlights and suppress tooltips on self-labelled text while preserving disclosure guidance. */ async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Follow editor', exact: true }).check();
    const root = page.locator('#navigation .heading-open').filter({ hasText: '1. Introduction', exact: true }), child = page.locator('#navigation .heading-open').filter({ hasText: 'A workspace for connected writing', exact: true });

    await expect(root).toHaveAttribute('aria-current', 'location');
    const chapter = await page.locator('#navigation .chapter.active').boundingBox(), heading = await root.boundingBox(), next = await child.boundingBox();
    expect(heading.y - chapter.y - chapter.height).toBeGreaterThan(0);
    expect(next.y - heading.y - heading.height).toBeGreaterThan(0);
    await child.hover();
    await page.waitForTimeout(3300);
    await expect(page.getByRole('tooltip')).toBeHidden();
    await page.screenshot({ path: '../.local/artifacts/ui/explorer-separated-highlights.png' });
    await page.getByRole('button', { name: 'Introduction', exact: true }).hover();
    await page.waitForTimeout(3300);
    await expect(page.getByRole('tooltip')).toBeHidden();
    await page.getByRole('button', { name: 'Collapse Introduction headings', exact: true }).hover();
    await expect(page.getByRole('tooltip')).toHaveText('Collapse Introduction headings', { timeout: 5000 });
});
