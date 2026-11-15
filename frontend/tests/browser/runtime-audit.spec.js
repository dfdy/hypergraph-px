/**
 * # Hypergraph PX — Bounded integrity audit browser evidence
 *
 * Checks audit scope, partial findings and obsolete results with a controlled
 * fake adapter.
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
 * Used by: Runtime audit panel component; synthetic browser assurance.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/runtime-audit.spec.js
 * [spec0]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec1]: ../../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec2]: ../../../docs/05-domain/text-and-anchors.md
 * [spec3]: ../../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec4]: ../../../docs/09-guides/developers/repository-development.md
 * [spec5]: ../../../docs/06-subsystems/frontend-interaction.md
 */
// Synthetic component evidence; actual HTTPS/SQLite is verified by the runtime workflow.
import { test, expect } from './fixtures.js';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

let bundle;

const styles = await readFile(new URL('../../styles.css', import.meta.url), 'utf8');

test.beforeAll(/** Bundle only the audit panel so this fixture cannot imply full runtime integration. */ async () => {
    const result = await build({ stdin: { contents: "import {openDocumentAudit} from './src/runtime-audit-panel.js';window.openAudit=openDocumentAudit;", resolveDir: fileURLToPath(new URL('../../', import.meta.url)) }, bundle: true, format: 'iife', write: false });
    bundle = result.outputFiles[0].text;
});

/** Open isolated styled audit UI with a controllable fake adapter. */
async function open(page) {
    await page.goto('about:blank');
    await page.addStyleTag({ content: styles });
    await page.addScriptTag({ content: bundle });
    await page.evaluate(/** Install explicit delayed/denied/bounded finding controls for this browser scenario. */ () => {
        window.calls = 0;
        window.delayed = false;
        window.finding = null;
        window.denied = false;
        window.adapter = {
            lifecycle: 'unlocked', get: /** Return inert hostile-looking title and branch context for rendering safety checks. */ () => ({ title: '<script>Untouched child source', runtime: { branch: Array(32).fill(9) } }), auditDocument: /** Count audit reads and simulate delay, denial or the selected bounded finding. */ async () => {
                window.calls++;
                if (window.delayed)
                    await new Promise(/** Retain the pending audit resolver so the test controls response timing. */ r => window.release = r);
                if (window.denied)
                    throw Error('Current scope denied');
                return { finding: window.finding };
            }
        };
        window.openAudit(window.adapter, 'captured-document');
    });
}

test('audit explains original-branch scope before running and labels the bounded success', /** Verify audit explains original-branch scope before running and labels the bounded success. */ async ({ page }) => {
    await open(page);

    const dialog = page.getByRole('dialog', { name: 'Original branch integrity' });
    await expect(dialog).toContainText('does not save typing');
    await expect(dialog).toContainText('Named branches');
    expect(await page.evaluate(/** Read the audit call count to prove opening the panel does not run a check. */ () => window.calls)).toBe(0);
    await expect(dialog.locator('script')).toHaveCount(0);

    await dialog.getByRole('button', { name: 'Run integrity check' }).click();

    await expect(dialog.getByRole('status')).toHaveText('All 8 selected records passed this check.');
    await expect(dialog).toContainText('No repair was performed');

    await dialog.getByRole('button', { name: 'Close', exact: true }).click();

    await expect(dialog).toHaveCount(0);
});

test('partial findings and denied reads never become a successful workspace status', /** Verify partial findings and denied reads never become a successful workspace status. */ async ({ page }) => {
    await open(page);

    const dialog = page.getByRole('dialog', { name: 'Original branch integrity' });
    await page.evaluate(/** Inject an incomplete draft-budget finding without changing source state. */ () => window.finding = { record: 'draft', problem: 'budget' });
    await dialog.getByRole('button', { name: 'Run integrity check' }).click();

    await expect(dialog).toContainText('Check incomplete · stopped at saved working buffer');
    await expect(dialog).toContainText('Remaining dependent records were not checked');

    await page.evaluate(/** Deny the next audit read to test failure replacing earlier success. */ () => window.denied = true);
    await dialog.getByRole('button', { name: 'Run integrity check' }).click();

    await expect(dialog.getByRole('status')).toHaveText('Integrity check unavailable.');
    await expect(dialog).toContainText('Current scope denied');
});

test('closing or locking discards delayed audit results', /** Verify closing or locking discards delayed audit results. */ async ({ page }) => {
    for (const action of ['close', 'lock']) {
        await open(page);

        const dialog = page.getByRole('dialog', { name: 'Original branch integrity' });
        await page.evaluate(/** Delay the next audit reply until the owning view is closed or locked. */ () => window.delayed = true);
        await dialog.getByRole('button', { name: 'Run integrity check' }).click();

        await expect.poll(/** Poll until the delayed audit has installed its release hook. */ () => page.evaluate(/** Inspect whether the browser fixture resolver is available. */ () => !!window.release)).toBe(true);
        if (action === 'close')
            await page.keyboard.press('Escape');
        else
            await page.evaluate(/** Invalidate the view by locking the fake workspace. */ () => window.adapter.lifecycle = 'locked');
        await page.evaluate(/** Release the old audit reply after its owning context is invalid. */ () => window.release());
        if (action === 'close')
            await expect(dialog).toHaveCount(0);
        else
            await expect(dialog.getByRole('status')).toHaveText('Checking saved original-branch records…');
    }
});
