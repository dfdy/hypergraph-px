// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Exact-source heading-link integration scenario
 *
 * Exercise partial-word Markdown heading links across selection, cancellation,
 * draft Save, Commit, Undo and acknowledged reload.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/heading-link-workflow.mjs)
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
 * Used by: Owned synthetic runtime integration harness.
 *
 * Specification:
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Exact text and anchors](../../docs/05-domain/text-and-anchors.md)
 *
 * Boundary: This scenario preserves mixed newlines and Unicode below table/math
 * widgets; recorded screenshots and assertions only count when the harness
 * executes.
 */
import { expect } from '@playwright/test';

import { resolve } from 'node:path';

/** Check selected heading-link source, immutable snapshot and Undo/reload boundaries in a real isolated browser/runtime workflow. */
export async function exerciseHeadingLink({ page, root, ok, paste, checks, document }) {
    const check = /** Fail the scenario immediately when an exact-source or publication invariant is violated. */ (v, m) => {
        if (!v)
            throw Error(m);
    }, editor = page.getByRole('textbox', { name: 'Markdown document editor' }), link = page.getByRole('button', { name: 'Link', exact: true });
    const write = /** Click a save/Commit control and wait until its acknowledged operation re-enables the button. */ async (name) => { const button = page.getByRole('button', { name, exact: true }); await button.click(); await expect(button).toBeEnabled(); };
    const seed = '# Target\r\n\r\n| A | B |\r\n| --- | --- |\r\n| a | b |\r\n\r\n$$\r\nx=1\r\n$$\r\n\r\n## Level two\r\n\r\n### Level three\r\n\r\n#### Level four\r\n\r\n##### Level five\r\n\r\n###### Level six\r\n\r\n**Bold words** and *Italic words*.\r\n\r\nx partial 😀, [text]! y';
    const initial = await ok('editor', { document });

    await paste(seed);
    await page.getByLabel('Maths display', { exact: true }).selectOption('rendered');
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await expect(link).toBeDisabled();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Shift+Home');

    for (let i = 0; i < 3; i++)
        await page.keyboard.press('Shift+ArrowRight');
    await expect(link).toBeEnabled();
    await link.click();
    const popup = page.getByRole('dialog', { name: 'Link to a heading' });

    await expect(popup.getByLabel('Link text')).toHaveValue('artial 😀, [text]!');
    await popup.getByRole('button', { name: 'Cancel', exact: true }).click();
    await link.click();
    await expect(popup.getByLabel('Link text')).toHaveValue('artial 😀, [text]!');

    for (const theme of ['dark', 'light'])
        for (const width of [1280, 1600, 2000]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(/** Apply the requested screenshot theme without changing editor content. */    t => document.body.classList.toggle('light', t === 'light'), theme);
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-heading-link-${theme}-${width}.png`), animations: 'disabled' });
        }
    await popup.getByLabel('Target heading').selectOption({ label: 'Target' });
    await popup.getByRole('button', { name: 'Insert Markdown link' }).click();
    await expect(editor.locator('.cm-markdown-bold')).toHaveCSS('font-weight', '750');
    await expect(editor.locator('.cm-markdown-italic')).toHaveCSS('font-style', 'italic');
    await expect(editor.getByRole('link', { name: 'artial 😀, [text]!' })).toBeVisible();
    await expect(editor).not.toContainText('](#target)');
    const expected = seed.replace('artial 😀, [text]!', '[artial 😀, \\[text\\]!](#target)');

    await write('Save draft');
    check((await ok('editor', { document })).text === expected, 'Selected heading link changed exact surrounding source');
    check(JSON.stringify((await ok('editor', { document })).snapshot) === JSON.stringify(initial.snapshot), 'Link or dialog focus published a Commit');
    await write('Commit');
    const committed = await ok('editor', { document });
    check((await ok('snapshot', { document, snapshot: committed.snapshot })).text === expected, 'Committed Link source differs');
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+z');
    await write('Save draft');
    check((await ok('editor', { document })).text === seed, 'Heading link Undo lost exact source');
    check((await ok('snapshot', { document, snapshot: committed.snapshot })).text === expected, 'Undo changed immutable Link snapshot');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(editor).toBeVisible();
    check((await ok('editor', { document })).text === seed, 'Reload lost acknowledged link Undo draft');
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await write('Save draft');
    await page.evaluate(/** Restore the default dark theme after desktop screenshot checks. */ () => document.body.classList.remove('light'));
    await page.setViewportSize({ width: 1600, height: 1000 });
    checks.push('heading Link accepts partial-word punctuation/emoji selection under CRLF below table/math; cancellation preserves selection; draft/Commit/exact snapshot/Undo/reload pass without focus Commit; six desktop/theme dialogs inspected');
}
