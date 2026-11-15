/**
 * # Hypergraph PX — Workspace docking and editor preservation evidence
 *
 * Checks panel moves and desktop geometry while retaining editor identity,
 * source, selection and undo.
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
 * Used by: Browser workspace docking; Playwright desktop assurance.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/docking.spec.js
 * [spec0]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec1]: ../../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec2]: ../../../docs/05-domain/text-and-anchors.md
 * [spec3]: ../../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec4]: ../../../docs/09-guides/developers/repository-development.md
 * [spec5]: ../../../docs/06-subsystems/frontend-interaction.md
 */
import { test, expect } from './fixtures.js';
import { readFile } from 'node:fs/promises';

/** Download exact editor source before and after layout changes. */
async function source(page) {
    const ready = page.waitForEvent('download');
    await page.getByRole('button', { name: '↓ Markdown', exact: true }).click();
    return readFile(await (await ready).path(), 'utf8');
}

/** Move an existing panel through its layout controls and require editor focus restoration. */
async function movePanel(page, panel, position) {
    await page.getByRole('button', { name: 'Layout', exact: true }).click();
    await page.getByLabel('Panel to move').selectOption(panel);
    await page.getByLabel('Position relative to document').selectOption(position);
    await page.getByRole('button', { name: 'Move panel', exact: true }).click();

    await expect(page.getByRole('textbox', { name: 'Markdown document editor' })).toBeFocused();
}

test('docking preserves the same editor, exact source, selection, and undo across moves and resize', /** Verify docking preserves the same editor, exact source, selection, and undo across moves and resize. */ async ({ page }) => {
    const errors = [];
    page.on('pageerror', /** Collect unexpected page errors during repeated docking operations. */ error => errors.push(error.message));
    page.on('dialog', /** Accept the fixture dialog while retaining the same editor instance. */ dialog => dialog.accept());
    await page.goto('/');

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await expect(editor).toBeVisible();

    const original = await source(page);
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.insertText('Docking 🧭 test\n\n');
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.press('Shift+End');
    await page.locator('.cm-editor').evaluate(/** Capture the original editor DOM identity before moving panels. */ element => {
        window.dockingEditor = element;
    });
    for (const position of ['left', 'bottom', 'right']) {
        await movePanel(page, 'investigation', position);

        expect(await page.locator('.cm-editor').evaluate(/** Compare current editor DOM identity with the captured instance. */ element => element === window.dockingEditor)).toBe(true);

        await editor.focus();

        await expect.poll(/** Poll until the original source selection is restored after docking. */ () => page.evaluate(/** Read the actual browser selection text. */ () => getSelection().toString())).toBe('Docking 🧭 test');
        expect(await source(page)).toBe('Docking 🧭 test\n\n' + original);
    }
    await page.getByRole('separator', { name: 'Resize interaction and investigation column', exact: true }).focus();
    await page.keyboard.press('ArrowLeft');
    await editor.focus();

    await expect.poll(/** Poll source selection after resizing the split column. */ () => page.evaluate(/** Read browser selection after the resize interaction. */ () => getSelection().toString())).toBe('Docking 🧭 test');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('button', { name: 'Undo', exact: true }).click();

    expect(await source(page)).toBe(original);

    await page.getByRole('button', { name: 'Redo', exact: true }).click();

    expect(await source(page)).toBe('Docking 🧭 test\n\n' + original);
    expect(errors).toEqual([]);
});

test('desktop viewport resizing settles Dockview overlays without overflow or replacing the editor', /** Verify desktop viewport resizing settles Dockview overlays without overflow or replacing the editor. */ async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.cm-editor')).toBeVisible();

    await page.locator('.cm-editor').evaluate(/** Capture editor identity before the viewport resize sequence. */ element => window.resizingEditor = element);
    for (const width of [2000, 1280, 1600, 2000, 1280]) {
        await page.setViewportSize({ width, height: 1000 });

        await expect.poll(/** Poll layout overflow, sidebar edge and editor identity until resizing settles. */ () => page.evaluate(/** Measure actual browser layout and editor identity together. */ () => ({ overflow: document.documentElement.scrollWidth > innerWidth, right: document.querySelector('.right-sidebar').getBoundingClientRect().right, editor: document.querySelector('.cm-editor') === window.resizingEditor }))).toEqual({ overflow: false, right: width, editor: true });
    }
});

test('column resize cancellation remains reversible', /** Verify column resize cancellation remains reversible. */ async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.cm-editor')).toBeVisible();

    const handle = page.getByRole('separator', { name: 'Resize workspace column', exact: true }), outline = page.locator('.workspace .navigator');

    const before = (await outline.boundingBox()).width, box = await handle.boundingBox();
    await page.mouse.move(box.x + 4, box.y + 150);
    await page.mouse.down();
    await page.mouse.move(box.x + 44, box.y + 150);
    await page.keyboard.press('Escape');
    await page.mouse.up();

    await expect.poll(/** Poll the column width until Escape restores the pre-drag geometry. */ async () => (await outline.boundingBox()).width).toBeCloseTo(before, 0);
});

test('pointer drag docks a real Dockview panel below the document without replacing the editor', /** Verify pointer drag docks a real Dockview panel below the document without replacing the editor. */ async ({ page }) => {
    page.on('dialog', /** Accept the fixture dialog before pointer docking. */ dialog => dialog.accept());
    await page.goto('/');

    await expect(page.locator('.cm-editor')).toBeVisible();

    const original = await source(page);

    const content = page.getByRole('textbox', { name: 'Markdown document editor' });
    await content.focus();
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.press('Shift+End');
    await page.locator('.cm-editor').evaluate(/** Retain the original editor element through pointer panel movement. */ element => window.dockingEditor = element);

    const tab = page.locator('.workspace-dock-tab').filter({ hasText: 'Interaction & Investigation' }), from = await tab.boundingBox(), document = await page.locator('.editor-surface').boundingBox();
    await page.mouse.move(from.x + 40, from.y + 12);
    await page.mouse.down();
    await page.mouse.move(document.x + document.width / 2, document.y + document.height - 45, { steps: 20 });
    await page.mouse.up();

    await expect.poll(/** Compare sidebar/editor geometry to confirm the panel docked below the document. */ async () => {
        const side = await page.locator('.right-sidebar').boundingBox(), editor = await page.locator('.editor-surface').boundingBox();
        return side.y >= editor.y + editor.height;
    }).toBe(true);

    expect(await page.locator('.cm-editor').evaluate(/** Check pointer docking retained the exact editor DOM instance. */ element => element === window.dockingEditor)).toBe(true);
    await expect(page.getByRole('separator', { name: 'Resize interaction and investigation column', exact: true })).toBeHidden();

    await content.focus();

    await expect.poll(/** Poll the selected original source line after pointer docking. */ () => page.evaluate(/** Read the restored source selection from the browser. */ () => getSelection().toString())).toBe('# 1. Introduction');
    expect(await source(page)).toBe(original);
});

test('Web Awesome controls and Dockview are self-contained and do not introduce external assets or CSP violations', /** Verify Web Awesome controls and Dockview are self-contained and do not introduce external assets or CSP violations. */ async ({ page, request }) => {
    const remote = [], violations = [];
    await page.exposeFunction('recordDockViolation', /** Collect browser CSP violations for explicit filtering/assertion. */ value => violations.push(value));
    await page.addInitScript(/** Install a CSP event listener before the application loads. */ () => document.addEventListener('securitypolicyviolation', /** Forward only blocked URI/directive evidence from the browser to the fixture. */ event => window.recordDockViolation({ uri: event.blockedURI, directive: event.effectiveDirective })));
    page.on('request', /** Record any HTTP asset request outside numeric loopback. */ request => {
        if (/^https?:/.test(request.url()) && new URL(request.url()).hostname !== '127.0.0.1')
            remote.push(request.url());
    });
    await page.goto('/');

    await expect(page.locator('.cm-editor')).toBeVisible();

    await page.getByRole('button', { name: 'Layout', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Workspace layout' })).toBeVisible();
    expect(await page.locator('#workspaceLayout').evaluate(/** Check the self-contained control exposes its shadow button. */ element => !!element.shadowRoot?.querySelector('button'))).toBe(true);

    await page.getByRole('button', { name: 'Reset layout', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Workspace layout' })).not.toBeVisible();
    expect(remote).toEqual([]);
    // The pre-existing preview build-version fetch is blocked by connect-src none.
    expect(violations.filter(/** Ignore only the known preview version fetch; every other CSP violation remains a failure. */ value => !value.uri.endsWith('/build-version.json'))).toEqual([]);

    const notices = await (await request.get('/THIRD_PARTY_NOTICES.txt')).text();
    for (const name of ['dockview 8.9.0', 'dockview-core 8.9.0', '@awesome.me/webawesome 3.14.0'])
        expect(notices).toContain(name);
});

for (const width of [1280, 1440, 1920])
    for (const light of [false, true])
        test(`desktop geometry and below-widget inspection ${width} ${light ? 'light' : 'dark'}`, /** Verify desktop panel geometry and below-widget inspection across this width/theme sample. */ async ({ page }, info) => {
            const errors = [];
            page.on('pageerror', /** Collect unexpected errors across the theme/desktop geometry sweep. */ error => errors.push(error.message));
            await page.setViewportSize({ width, height: 1000 });
            await page.goto('/');

            await expect(page.locator('.cm-editor')).toBeVisible();
            if (light)
                await page.getByRole('button', { name: 'Switch theme' }).click();
            await page.getByLabel('Maths display').selectOption('rendered');
            await page.locator('.outline button').filter({ hasText: 'Working with evidence' }).click();

            await expect(page.locator('#editorHost .rendered-table-block')).toHaveCount(1);

            await page.screenshot({ path: info.outputPath(`table-${width}-${light ? 'light' : 'dark'}.png`) });
            await page.locator('.outline button').filter({ hasText: 'A small mathematical example' }).click();

            await expect(page.locator('#editorHost .math-rendered')).toHaveCount(2);

            await page.screenshot({ path: info.outputPath(`math-${width}-${light ? 'light' : 'dark'}.png`) });
            await page.locator('.outline button').filter({ hasText: 'Closing reflection' }).click();
            await page.locator('.cm-scroller').evaluate(/** Scroll slightly above the closing reflection to inspect below-widget content. */ element => {
                element.scrollTop = Math.max(0, element.scrollTop - 180);
            });
            await page.evaluate(/** Wait for local font loading before measuring workspace columns. */ () => document.fonts.ready);

            const geometry = await page.evaluate(/** Read all panel boundaries in one browser layout sample. */ () => {
                const box = /** Convert one selected DOM rectangle to serializable geometry. */ selector => document.querySelector(selector).getBoundingClientRect().toJSON();
                return { outline: box('.navigator'), editor: box('.editor-pane'), map: box('#documentNavigator'), sidebar: box('.right-sidebar'), overflow: document.documentElement.scrollWidth > innerWidth };
            });
            expect(geometry.overflow).toBe(false);
            expect(geometry.outline.width).toBe(226);
            expect(geometry.sidebar.width).toBe(348);
            expect(geometry.map.width).toBe(90);
            expect(geometry.outline.right).toBeLessThanOrEqual(geometry.editor.left + 1);
            expect(geometry.editor.right).toBeLessThanOrEqual(geometry.map.left + 1);
            expect(geometry.map.right).toBeLessThanOrEqual(geometry.sidebar.left + 1);

            await page.screenshot({ path: info.outputPath(`workspace-${width}-${light ? 'light' : 'dark'}.png`) });

            expect(errors).toEqual([]);
        });
