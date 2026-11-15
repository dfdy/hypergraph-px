/**
 * # Hypergraph PX — Historical relationship-label browser evidence
 *
 * Checks protected retrospective label projection, review and stale-result
 * rejection using a synthetic runtime transport.
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
 * Used by: Browser editor relationship presentation; synthetic application
 * assurance.
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/runtime-relations.spec.js
 * [spec0]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec1]: ../../../docs/06-subsystems/diagrams/browser/organisation.c4
 * [spec2]: ../../../docs/05-domain/text-and-anchors.md
 * [spec3]: ../../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec4]: ../../../docs/09-guides/developers/repository-development.md
 * [spec5]: ../../../docs/06-subsystems/frontend-interaction.md
 */
// Exact committed semantic-label projection through the app; no real server in these fixtures.
import { test, expect } from './fixtures.js';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const raw = '# Scope\r\n\r\n| A | B |\r\n| --- | --- |\r\n| a | b |\r\n\r\n$$\r\nx=1\r\n$$\r\n\r\n## Below widgets\r\n\r\nFirst claim 😀. Second claim e\u0301.\r\n\r\nThird paragraph.\r\n\r\nFourth paragraph.';

let bundle;

test.beforeAll(/** Bundle the actual application with a strictly synthetic relation transport replacement. */ async () => {
    const fixture = `
const original = ${JSON.stringify(raw)}, identity = /** Create deterministic fixed-width transport identities for this synthetic workspace. */ n => Array(32).fill(n), bytes = /** Measure exact UTF8 byte lengths when converting JavaScript source slices to persisted-style coordinates. */ text => new TextEncoder().encode(text).length;
const state = { document: identity(1), node: identity(2), branch: identity(3), base: identity(4), snapshot: identity(5), occurrence: identity(6), manifest: identity(7), draft: identity(8), title: 'Relations fixture', text: original, generation: 0, acknowledged_sequence: 0 };
const source = /** Capture a named exact passage against the fixture immutable snapshot without normalizing text. */ text => { const from = original.indexOf(text); return { document: state.document, node: state.node, snapshot: state.snapshot, revision: state.base, occurrence_path: [state.occurrence], start_byte: bytes(original.slice(0, from)), end_byte: bytes(original.slice(0, from + text.length)) }; };
const entry = /** Build one retained binary assertion with its pinned meaning, participant roles and explicit review state. */ (n, label, left, right, status = 'proposed') => ({ revision: identity(n + 1), generation: 0, record: { node: identity(n), parent: null, definition: identity(n + 100), participants: [{ role: 'source', source: source(left) }, { role: 'target', source: source(right) }], properties: { negated: false, certainty: 'unspecified', attribution: '', scope: '' }, status, proposer: identity(40), actor: identity(40), device: identity(41), operation: identity(n + 2) }, definition: { version: identity(n + 100), definition: { predicate_id: 'test:relation:' + n, registry_version: 1, label, description: 'Retrospective claim, not a checked proof.', context_fields: [], symmetric: false, participant_mode: 'binary', roles: [{ id: 'source', label: 'Source' }, { id: 'target', label: 'Target' }] } } });
const entries = [entry(20, 'determines', 'First claim 😀.', 'Second claim é.'), entry(24, 'justifies', 'First claim 😀.', 'Second claim é.', 'accepted'), entry(28, 'contrasts', 'Third paragraph.', 'Fourth paragraph.'), entry(32, 'rejects', 'First claim 😀.', 'Second claim é.', 'rejected')];
if (window.__twoParagraphRelations)
    entries.push(entry(44, 'justifies', 'Third paragraph.', 'Fourth paragraph.'));
if (window.__manyRelations)
    for (let n = 0; n < 8; n++)
        entries.push(entry(80 + n * 4, 'extra ' + n, 'First claim 😀.', 'Second claim é.'));
const snapshots = new Map([[JSON.stringify(state.snapshot), original]]);
let next = 70, assertionGeneration = 1;
window.__relationCalls = [];
window.__pendingRelationReads = [];
const request = /** Emulate protected relation/snapshot reads and explicit Save, Commit and review results without a real server. */ async (path, body) => {
    window.__relationCalls.push({ path, body: structuredClone(body) });
    if (path === 'assertions') {
        if (window.__delayRelationReads)
            await new Promise(/** Retain a pending protected-read resolver until the test invalidates or restores its context. */ resolve => window.__pendingRelationReads.push(resolve));
        if (window.__denyRelations)
            throw Object.assign(Error('Denied'), { status: 403 });
        const selected = entries.slice(body.offset, body.offset + body.limit);
        return { document: body.document, snapshot: body.snapshot, text_snapshot_scope: 'semantic_assertions_excluded', generation: assertionGeneration, total: entries.length, entries: structuredClone(selected), next: body.offset + selected.length < entries.length ? body.offset + selected.length : null };
    }
    if (path === 'snapshot')
        return { text: snapshots.get(JSON.stringify(body.snapshot)) };
    if (path === 'lock') {
        if (window.__holdRelationLock)
            await new Promise(/** Retain lock completion independently so the UI must conceal source before the reply arrives. */ resolve => window.__releaseRelationLock = resolve);
        return { locked: true };
    }
    if (path === 'anchor/resolve')
        return { text: new TextDecoder().decode(new TextEncoder().encode(original).slice(body.start_byte, body.end_byte)) };
    if (path === 'commands') {
        const command = body.request;
        if (command.command === 'assertion') {
            const mutation = command.mutation, e = entries.find(/** Locate only the exact logical assertion identity requested for a synthetic review transition. */ e => JSON.stringify(e.record.node) === JSON.stringify(mutation.node));
            e.record.parent = e.revision;
            e.revision = identity(next++);
            e.generation++;
            e.record.status = mutation.status;
            e.record.operation = body.operation;
            assertionGeneration++;
            return { operation: body.operation, outcome: { result: 'assertion', state: { node: e.record.node, revision: e.revision, generation: e.generation, status: e.record.status, deduplicated: false } } };
        }
        state.generation++;
        if (command.command === 'save') {
            state.text = command.text;
            state.acknowledged_sequence = command.sequence;
        }
        else {
            state.base = identity(next++);
            state.snapshot = identity(next++);
            snapshots.set(JSON.stringify(state.snapshot), state.text);
        }
        return { operation: body.operation, outcome: { result: command.command === 'save' ? 'saved' : 'committed', document: state.document, generation: state.generation, sequence: state.acknowledged_sequence, revision: state.base, snapshot: state.snapshot } };
    }
    throw Error('Unexpected fixture request: ' + path);
};
const adapter = new RuntimeAdapter([state], request);
window.__relationAdapter = adapter;
return { adapter, documents: [...adapter.docs.values()].map(/** Expose fixture document summaries from the adapter without creating additional source owners. */ d => ({ id: d.id, title: d.title, source: d.source })), assertionsSupported: true };
`;

    const result = await build({
        entryPoints: ['src/app.js'], absWorkingDir: fileURLToPath(new URL('../../', import.meta.url)), bundle: true, format: 'esm', write: false, plugins: [{
                name: 'relation-fixture', /** Register a build-only adapter override; production transport source remains unchanged. */
                setup(builder) {
                    builder.onLoad({ filter: /runtime-adapter\.js$/ }, /** Load the real adapter module and replace only its preview bootstrap return. */ async (args) => ({
                        contents: (await readFile(args.path, 'utf8')).replace("if(location.protocol!=='https:')return null;", /** Supply the unchanged executable fixture string as replacement source. */ () => fixture), loader: 'js'
                    }));
                }
            }]
    });
    bundle = result.outputFiles[0].text;
});

/** Serve the bundled synthetic app and await the expected durable label count. */
async function open(page, expected = 3) {
    await page.route('**/app.js', /** Fulfill only the application bundle request with the controlled build output. */ route => route.fulfill({ body: bundle, contentType: 'text/javascript' }));
    await page.goto('/');

    await expect(page.locator('#editorHost .relationship-label')).toHaveCount(expected);
}

const labels = /** Select durable relationship labels from the editor, excluding miniature duplicates. */ page => page.locator('#editorHost .relationship-label');

const source = /** Read owned source from the active synthetic runtime document. */ page => page.evaluate(/** Resolve the current adapter document and return its exact source bytes. */ () => window.__relationAdapter.get([...window.__relationAdapter.docs.keys()][0]).source);

const copy = /** Copy through the editor event path rather than reading the visual projection. */ editor => editor.evaluate(/** Return exact clipboard plaintext from a synthetic copy event. */ e => {
    const data = new DataTransfer();
    e.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data }));
    return data.getData('text/plain');
});

test('durable brace labels preserve exact source/selection and inspect one relation with its roles', /** Verify durable brace labels preserve exact source/selection and inspect one relation with its roles. */ async ({ page }) => {
    const errors = [];
    page.on('pageerror', /** Collect renderer errors while exercising relation inspection. */ e => errors.push(e.message));
    await open(page);

    await expect(labels(page)).toHaveText(['{determines}', '{justifies}', '{contrasts}']);
    await expect(page.locator('#mapText .relationship-label')).toHaveCount(3);
    await expect(page.locator('.text-relation-scope')).toContainText('3 in text · 4 of 4 loaded');

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');

    expect(await copy(editor)).toBe(raw);

    await page.getByRole('button', { name: 'Collapse investigation panel' }).click();
    await labels(page).first().click();

    await expect(page.locator('#investigation')).not.toHaveClass(/collapsed/);
    await expect(page.locator('.assertion-card.inspected')).toContainText('determines');
    await expect(page.locator('.assertion-card.inspected')).toContainText('Source · exact historical participant');
    expect(await copy(editor)).toBe(raw);

    await page.getByRole('button', { name: 'Inspect source participant', exact: true }).click();

    await expect(page.getByRole('dialog').locator('pre')).toHaveText('First claim 😀.');

    await page.getByRole('button', { name: 'Close source', exact: true }).click();
    await labels(page).nth(1).focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('.assertion-card.inspected')).toContainText('justifies');
    expect(await source(page)).toBe(raw);
    expect(errors).toEqual([]);
});

test('typing hides durable labels without relocating them; Undo restores exact matching source and later Commit does not retarget old claims', /** Verify typing hides durable labels without relocating them; Undo restores exact matching source and later Commit does not retarget old claims. */ async ({ page }) => {
    await open(page);

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');

    await expect(labels(page)).toHaveCount(0);
    await expect(page.locator('.text-relation-scope')).toContainText('hidden while writing');

    await page.keyboard.press('ControlOrMeta+z');

    await expect(labels(page)).toHaveCount(3);
    expect(await source(page)).toBe(raw);

    await page.keyboard.type('!');
    await page.getByRole('button', { name: 'Commit', exact: true }).click();

    await expect(labels(page)).toHaveCount(0);
    await expect(page.locator('.text-relation-scope')).toContainText('0 in text');

    await page.getByRole('checkbox', { name: 'Show all retained assertions in this document' }).check();

    await expect(page.locator('.assertion-card')).toHaveCount(4);
});

test('delayed and denied reads never redraw labels into changed or locked text', /** Verify delayed and denied reads never redraw labels into changed or locked text. */ async ({ page }) => {
    await open(page);
    await page.evaluate(/** Hold relation reads to test delayed result invalidation. */ () => window.__delayRelationReads = true);
    await page.getByRole('button', { name: 'Refresh text relations', exact: true }).click();

    await expect.poll(/** Poll until at least one protected relation request is pending. */ () => page.evaluate(/** Read the pending protected-read count in the fixture. */ () => window.__pendingRelationReads.length)).toBeGreaterThan(0);

    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');
    await page.evaluate(/** Stop delaying and release each retained reply after source changes. */ () => {
        window.__delayRelationReads = false;
        window.__pendingRelationReads.splice(0).forEach(/** Resolve one pending fixture request without inventing a newer response. */ resolve => resolve());
    });

    await expect(labels(page)).toHaveCount(0);

    await page.keyboard.press('ControlOrMeta+z');

    await expect(labels(page)).toHaveCount(3);

    await page.evaluate(/** Deny protected reads so previously visible labels must disappear. */ () => window.__denyRelations = true);
    await page.getByRole('button', { name: 'Refresh text relations', exact: true }).click();

    await expect(labels(page)).toHaveCount(0);
    await expect(page.locator('.text-relation-scope')).toContainText('unavailable');

    await page.evaluate(/** Restore reads while delaying lock completion to test immediate concealment. */ () => {
        window.__denyRelations = false;
        window.__holdRelationLock = true;
    });
    await page.getByRole('button', { name: 'Refresh text relations', exact: true }).click();

    await expect(labels(page)).toHaveCount(3);

    await page.getByRole('button', { name: 'Lock', exact: true }).click();

    await expect(labels(page)).toHaveCount(0);
    await expect(editor).toHaveAttribute('contenteditable', 'false');
});

test('additional protected pages extend the exact label projection without claiming unloaded relations are absent', /** Verify additional protected pages extend the exact label projection without claiming unloaded relations are absent. */ async ({ page }) => {
    await page.addInitScript(/** Seed extra retained assertions so protected pagination remains explicit. */ () => window.__manyRelations = true);
    await open(page, 7);

    await expect(page.locator('.text-relation-scope')).toContainText('8 of 12 loaded');

    await page.getByRole('button', { name: 'More assertions', exact: true }).click();

    await expect(labels(page)).toHaveCount(11);
    await expect(page.locator('.text-relation-scope')).toContainText('12 of 12 loaded');
    expect(await source(page)).toBe(raw);
});

test('an unchanged explicit Commit cannot carry old-snapshot labels into a newer head while another pane is open', /** Verify an unchanged explicit Commit cannot carry old-snapshot labels into a newer head while another pane is open. */ async ({ page }) => {
    await open(page);
    await page.getByRole('tab', { name: 'Concepts', exact: true }).click();
    await page.getByRole('button', { name: 'Commit', exact: true }).click();

    await expect(labels(page)).toHaveCount(0);
    await expect(page.locator('.text-relation-scope')).toContainText('0 in text');
    expect(await source(page)).toBe(raw);
});

test('review updates word status and hides rejected controls without rewriting source or deleting retained claims', /** Verify review updates word status and hides rejected controls without rewriting source or deleting retained claims. */ async ({ page }) => {
    await open(page);
    await labels(page).first().click();
    await page.getByRole('button', { name: 'Accept assertion', exact: true }).click();

    await expect(labels(page).filter({ hasText: '{determines}' })).toHaveAttribute('data-status', 'accepted');
    await expect(page.locator('.assertion-card.inspected')).toContainText('Accepted');

    await page.getByRole('button', { name: 'Reject assertion', exact: true }).click();

    await expect(labels(page)).toHaveCount(2);
    await expect(page.locator('.assertion-card.inspected')).toContainText('Rejected');
    expect(await source(page)).toBe(raw);
    expect(await page.evaluate(/** Count content-save/publication commands separately from review operations. */ () => window.__relationCalls.filter(/** Select only content Save/Commit calls when verifying review is source-read-only. */ c => c.path === 'commands' && ['save', 'commit'].includes(c.body.request.command)).length)).toBe(0);
});

test('multiple paragraph word controls float together at the centered source gap', /** Verify multiple paragraph word controls float together at the centered source gap. */ async ({ page }) => {
    await page.addInitScript(/** Seed two paragraph controls at the same source gap. */ () => window.__twoParagraphRelations = true);
    await open(page, 4);

    const group = page.locator('#editorHost .relationship-paragraph');
    await expect(group.locator('button')).toHaveText(['{contrasts}', '{justifies}']);

    const delta = await group.evaluate(/** Measure relationship-control centering against its source line. */ marker => {
        const a = marker.getBoundingClientRect(), b = marker.closest('.cm-line').getBoundingClientRect();
        return (a.left + a.right - b.left - b.right) / 2;
    });
    expect(Math.abs(delta)).toBeLessThan(2);
    expect(await source(page)).toBe(raw);
});
