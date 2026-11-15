// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Independent branch and retained working-source scenario
 *
 * Verify exact parent/child drafts, protected working captures, independent
 * forks, promotion reconciliation and pinned branch history through retries and
 * restart.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/working-branches-workflow.mjs)
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
 * Used by: Owned synthetic runtime integration harness and optional immutable
 * older-reader compatibility run.
 *
 * Specification:
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Exact text and anchors](../../docs/05-domain/text-and-anchors.md)
 *
 * Boundary: Working capture evidence is required retained history, not an
 * evictable cache. Older-reader coverage is conditional and never inferred when
 * no reader is supplied.
 */
import { expect } from '@playwright/test';

import { randomBytes, createHash } from 'node:crypto';

import { readFile } from 'node:fs/promises';

import { execFileSync } from 'node:child_process';

import { resolve } from 'node:path';

import { exerciseParentComparison } from './branch-comparison-workflow.mjs';

/** Check independent branch editing, exact retained checkpoints/forks, promotion reconciliation and scoped history/compatibility behavior. */
export async function exerciseWorkingBranches({ page, root, checks, ok, api, paste, dropReplies, restoreReplies, restart, compatReader, database }) {
    const same = /** Compare structured identities or retained evidence by their exact JSON representation. */ (a, b) => JSON.stringify(a) === JSON.stringify(b), check = /** Fail when branch/source/history scope differs from the expected invariant. */ (v, m) => {
        if (!v)
            throw Error(m);
    }, operation = /** Create a fresh mutation operation identity for each independent setup command. */ () => [...randomBytes(32)];
    const capabilities = (await ok('runtime')).capabilities;
    check(capabilities.includes('local_branches') && capabilities.includes('working_copy'), 'Branch/working capabilities are not advertised');
    const created = await ok('commands', { operation: operation(), request: { command: 'create', title: 'Synthetic working branches', text: 'Committed seed 😀\r\n' } }), document = created.outcome.document;

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Synthetic working branches', exact: true }).click();
    const original = await ok('editor', { document }), parent = 'Private parent 😀\r\nIndependent\r';

    await paste(parent);
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect.poll(/** Wait for the exact parent draft acknowledgement before creating the child. */ async () => (await ok('editor', { document })).text).toBe(parent);
    const branches = page.locator('#runtimeBranches'), dialog = /** Locate the current branch dialog without retaining stale DOM elements. */ () => page.getByRole('dialog', { name: 'Document branches' });

    await page.getByRole('textbox', { name: 'Markdown document editor' }).focus();
    await page.keyboard.press('ControlOrMeta+A');
    await branches.click();
    await expect.poll(/** Read the committed-source branch preview while awaiting dialog readiness. */ () => dialog().locator('pre').textContent()).toBe('Committed seed 😀\r\n');
    await dialog().getByLabel('New branch name').fill('Alternative');
    await dialog().getByRole('button', { name: 'Create child branch', exact: true }).click();
    await expect(dialog()).toHaveCount(0);
    const child = (await ok('branches', { document, next: null, limit: 16 })).entries[0].branch, childState = /** Read the exact child branch editor state for independent draft/history assertions. */ () => ok('branches/editor', { document, branch: child });
    check((await childState()).text === 'Committed seed 😀\r\n', 'Child did not start from committed snapshot');
    check((await ok('editor', { document })).text === parent, 'Child creation overwrote parent draft');
    const choose = /** Choose a branch or close its already-current entry while awaiting completion of the branch switch. */ async (name) => {
        await branches.click();
        await expect(dialog().getByRole('button', { name: 'Create child branch', exact: true })).toBeEnabled();
        const current = dialog().getByRole('button', { name: name + ' · current', exact: true });

        if (await current.count())
            await dialog().getByRole('button', { name: 'Close', exact: true }).click();
        else
            await dialog().getByRole('button', { name, exact: true }).click();
        await expect(dialog()).toHaveCount(0);
    };
    const copySelection = /** Select all exact editor source and invoke protected source-reference capture. */ async () => { const editor = page.getByRole('textbox', { name: 'Markdown document editor' }); await editor.focus(); await page.keyboard.press('ControlOrMeta+A'); await page.getByRole('button', { name: 'Copy source reference', exact: true }).click(); };
    const childText = '# Working evidence\r\n\r\n| Claim | Value |\r\n| --- | --- |\r\n| 😀 | e\u0301 |\r\n\r\n$$\r\nE=mc^2\r\n$$\r\n\r\n## After working widgets\r\n\r\nExact unpublished 中\rfinal';

    await paste(childText);
    await dropReplies('branch', 2);
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page.locator('#draftStatus')).toContainText('Save needs attention');
    await restoreReplies();
    await choose('Original branch');
    check((await childState()).text === childText, 'Frozen child retry changed source');
    const selected = await page.getByRole('textbox', { name: 'Markdown document editor' }).evaluate(/** Copy the restored parent selection after switching from the child. */    e => { const d = new DataTransfer(); e.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: d })); return d.getData('text/plain'); });
    check(selected === parent, 'Parent selection was lost across branch switch');
    await choose('Alternative');
    await page.getByRole('textbox', { name: 'Markdown document editor' }).focus();
    await page.keyboard.press('ControlOrMeta+z');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect.poll(/** Wait for child Undo to acknowledge the original committed seed. */ async () => (await childState()).text).toBe('Committed seed 😀\r\n');
    await page.getByRole('textbox', { name: 'Markdown document editor' }).focus();
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect.poll(/** Wait for child Redo to acknowledge the exact working fixture source. */ async () => (await childState()).text).toBe(childText);
    checks.push('actual child creation excludes parent draft; branch switch preserves selection and independent undo/redo; lost child Save retries exact source');
    await page.evaluate(/** Install one delayed child Save acknowledgement to test newer typing during a branch switch. */ () => {
        const actual = window.fetch.bind(window);
        let once = true;
        window.__restoreBranchDelay = /** Restore original browser fetch after the delayed child Save experiment. */
            () => window.fetch = actual;
        window.fetch = /** Delay one actual child Save response while retaining its original result. */
            async (...args) => {
                const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;
                const response = await actual(...args);
                const command = inputUrl.endsWith('/api/v1/commands') ? JSON.parse(inputBody).request : null;

                if (once && command?.command === 'branch' && command.mutation.action === 'save') {
                    once = false;
                    window.__branchDelayStarted = true;
                    await new Promise(/** Expose the delayed branch Save response release callback. */    resolve => window.__releaseBranchDelay = resolve);
                }

                return response;
            };
    });

    try {
        await paste(childText + ' delayed');
        await page.getByRole('button', { name: 'Save draft', exact: true }).click();
        await expect.poll(/** Poll browser state until the child Save reaches controlled acknowledgement delay. */ () => page.evaluate(/** Read whether the delayed child Save response has been captured. */ () => !!window.__branchDelayStarted)).toBe(true);
        await paste(childText + ' newer');
        await branches.click();
        await dialog().getByRole('button', { name: 'Original branch', exact: true }).click();
        await page.evaluate(/** Release the captured Save acknowledgement during branch switching. */ () => window.__releaseBranchDelay());
        await expect(dialog()).toHaveCount(0);
        await choose('Alternative');
        await expect.poll(/** Wait for the newer child source to survive frozen acknowledgement handling. */ async () => (await childState()).text).toBe(childText + ' newer');
    }
    finally {
        await page.evaluate(/** Release any pending delayed response and clean interception state even when checks fail. */ () => { window.__releaseBranchDelay?.(); window.__restoreBranchDelay?.(); delete window.__branchDelayStarted; delete window.__releaseBranchDelay; delete window.__restoreBranchDelay; });
    }
    await paste(childText);
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect.poll(/** Wait for the restored exact working source before creating a retained working capture. */ async () => (await childState()).text).toBe(childText);
    checks.push('actual delayed child Save acknowledges frozen source before newer typing and branch switch without cross-buffer overwrite');
    await dropReplies('working_copy', 2);
    await copySelection();
    await expect(page.getByRole('button', { name: 'Retry working-reference operation', exact: true })).toBeVisible();
    await restoreReplies();
    await page.getByRole('button', { name: 'Retry working-reference operation', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry working-reference operation', exact: true })).toHaveCount(0);
    const refs = await ok('working/clipboard', { generation: null, offset: 0, limit: 16 });
    check(refs.total === 1, 'Working copy retry duplicated reference');
    const source = refs.entries[0].target.source;
    check(same((await ok('branches', { document, next: null, limit: 16 })).entries[0].snapshot, original.snapshot), 'Child creation did not pin reviewed parent snapshot');
    const beforeFork = await childState();

    await page.locator('.working-references .clip-chip > button').first().click();
    let popup = page.getByRole('dialog', { name: 'Retained working source' });
    check(await popup.locator('pre').textContent() === childText, 'Working capture normalized source');
    await popup.getByLabel('Fork name').fill('Synthetic unpublished fork');
    await popup.getByRole('button', { name: 'Fork captured source', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('Synthetic unpublished fork');
    const fork = (await ok('documents', {})).find(/** Find the newly created unpublished-source fork by its unique fixture title. */    d => d.title === 'Synthetic unpublished fork').document, event = await ok('working/derivation', { document: fork });
    check(same(event.input, source), 'Working Fork changed retained source');
    const afterFork = await childState();
    check(afterFork.text === beforeFork.text, 'Departure changed working Fork source bytes');
    check((await ok('snapshot', { document, snapshot: afterFork.snapshot })).text === childText, 'Leaving the source for its Fork did not auto-commit exact text');
    check((await ok('working/source', source)).text === childText, 'Departure lost original captured working source');
    await page.locator('[data-investigation="Provenance"]').click();
    await page.getByRole('button', { name: 'Inspect exact working fork source', exact: true }).click();
    check(await page.getByRole('dialog').locator('pre').textContent() === childText, 'Working Fork Provenance lost source');
    await page.keyboard.press('Escape');
    checks.push('lost WorkingCopy replies retain one exact checkpoint/reference; independent WorkingFork and Provenance inspect captured unpublished source; departure automatically publishes exact source while retaining checkpoint evidence');
    await page.getByRole('button', { name: 'Synthetic working branches', exact: true }).click();
    await paste(childText + '\r\nLater typing');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await page.getByRole('button', { name: 'Lock', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Unlock workspace', exact: true })).toBeVisible();
    check((await api('working/source', source)).status === 423, 'Locked source disclosed checkpoint');
    await restart();
    await page.getByRole('button', { name: 'Synthetic working branches', exact: true }).click();
    check((await ok('editor', { document })).text === parent, 'Restart lost parent draft');
    await choose('Alternative');
    check((await childState()).text === childText + '\r\nLater typing', 'Restart lost child draft');
    const retained = await ok('working/source', source);
    check(retained.text === childText, 'Checkpoint followed newer draft after restart');
    check(same(await ok('working/derivation', { document: fork }), event), 'Restart changed original working Fork receipt/evidence');
    checks.push('locked checkpoint denial and actual restart retain separate parent/child drafts, immutable checkpoint and original WorkingFork evidence');
    await paste(childText);
    await dropReplies('working_clipboard', 2);
    await page.getByRole('button', { name: 'Commit', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Update promoted references', exact: true })).toBeVisible();
    await restoreReplies();
    const committed = await childState();
    check((await ok('snapshot', { document, snapshot: committed.snapshot })).text === childText, 'Text Commit lost exact source');
    await page.getByRole('button', { name: 'Update promoted references', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Update promoted references', exact: true })).toHaveCount(0);
    const replaced = await ok('working/clipboard', { generation: null, offset: 0, limit: 16 });
    check(replaced.entries[0].target.kind === 'committed', 'Replacement batch did not reconcile');
    check(same(replaced.entries[0].target.previous, refs.entries[0].id), 'Replacement lost original reference');
    await page.locator('.working-references .clip-chip > button').first().click();
    popup = page.getByRole('dialog', { name: 'Retained working source' });
    await popup.getByRole('button', { name: 'Inspect original working reference', exact: true }).click();
    await expect(popup).toContainText('Original working checkpoint');
    check(await popup.locator('pre').textContent() === childText, 'Replacement lost original checkpoint bytes');
    await page.keyboard.press('Escape');
    checks.push('exact child Commit survives uncertain separate replacement batch; bounded retry retains original private reference and exact checkpoint');
    const restartText = childText + '\r\nRestart replacement';

    await paste(restartText);
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await copySelection();
    await expect.poll(/** Wait for the second protected working reference to be acknowledged. */ async () => (await ok('working/clipboard', { generation: null, offset: 0, limit: 16 })).total).toBe(2);
    await page.evaluate(/** Install a failure before sending promotion replacement to test independent startup reconciliation. */ () => {
        const actual = window.fetch.bind(window);
        window.__restoreUnsentReplacement = /** Restore original browser fetch after the unsent replacement experiment. */
            () => window.fetch = actual;
        window.fetch = /** Reject only the private-reference replacement send while allowing text Commit to complete normally. */
            async (...args) => {
                const inputUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
                const inputBody = args[0] instanceof Request ? await args[0].clone().text() : args[1]?.body;

                if (inputUrl.endsWith('/api/v1/commands') && JSON.parse(inputBody).request.command === 'working_clipboard')
                    throw new TypeError('Synthetic unsent replacement');

                return actual(...args);
            };
    });
    await page.getByRole('button', { name: 'Commit', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Update promoted references', exact: true })).toBeVisible();
    const beforeRestart = await childState();
    check((await ok('snapshot', { document, snapshot: beforeRestart.snapshot })).text === restartText, 'Unsent replacement rolled back published text');
    await page.evaluate(/** Restore normal requests before restarting the runtime for reconciliation. */ () => window.__restoreUnsentReplacement());
    await restart();
    const recovered = await ok('working/clipboard', { generation: null, offset: 0, limit: 16 });
    check(recovered.entries.every(/** Require every recovered working reference to have reconciled its exact committed target. */    e => e.target.kind === 'committed'), 'Startup did not reconcile retained exact promotion');
    check((await childState()).text === restartText, 'Replacement reconciliation changed committed text');
    await page.getByRole('button', { name: 'Synthetic unpublished fork', exact: true }).click();
    await page.locator('[data-investigation="Provenance"]').click();
    await page.getByRole('button', { name: 'Inspect exact working fork source', exact: true }).click();
    check(await page.getByRole('dialog').locator('pre').textContent() === childText, 'Restarted Provenance followed newer source');

    for (const theme of ['dark', 'light'])
        for (const width of [1280, 1600, 2000]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(/** Apply the requested desktop theme for retained working-fork provenance capture. */    t => document.body.classList.toggle('light', t === 'light'), theme);
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-working-provenance-${theme}-${width}.png`), animations: 'disabled' });
        }
    await page.evaluate(/** Restore dark theme after provenance screenshots. */ () => document.body.classList.remove('light'));
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Synthetic working branches', exact: true }).click();
    await choose('Alternative');
    await paste(childText);
    await page.getByRole('button', { name: 'Commit', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Commit', exact: true })).toBeEnabled();
    await expect.poll(/** Wait for the child Commit to retain exact source before history-scope queries. */ async () => (await childState()).text).toBe(childText);
    const historyHead = await childState(), historyInput = { document, branch: child, snapshot: historyHead.snapshot, cursor: null, limit: 1 }, historyPage = await ok('branches/history/page', historyInput);
    check(historyPage.next !== null, 'Missing retained branch history continuation');
    await ok('commands', { operation: operation(), request: { command: 'branch', mutation: { action: 'commit', document, branch: child, generation: historyHead.generation, base: historyHead.base, sequence: historyHead.acknowledged_sequence } } });
    check((await api('branches/history/page', historyInput)).status === 409, 'Stale first-page branch history silently advanced');
    check((await api('branches/history/page', { ...historyInput, branch: original.branch, cursor: historyPage.next })).status === 400, 'History token crossed branch scope');
    const retainedPage = await ok('branches/history/page', { ...historyInput, cursor: historyPage.next });
    check(same(retainedPage.snapshot, historyInput.snapshot), 'Retained continuation followed a newer commit');
    checks.push('startup independently reconciles an unsent replacement from retained promotion; restarted Provenance stays exact; scoped history stays pinned after newer Commit and rejects cross-branch tokens');

    if (compatReader) {
        check(createHash('sha256').update(await readFile(compatReader)).digest('hex') === compatReader.split('/').at(-1), 'Older-reader binary hash mismatch');
        const hash = /** Fingerprint optional encrypted kinds 20–27 read-only for immutable older-reader preservation checks. */ () => execFileSync('python3', ['-c', 'import sqlite3,sys,hashlib; d=sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True); rows=d.execute("SELECT kind,id,generation,envelope FROM slots WHERE kind>=20 UNION ALL SELECT kind,id,0,envelope FROM objects WHERE kind>=20 ORDER BY kind,id").fetchall(); h=hashlib.sha256(); [(h.update(str(k).encode()),h.update(i),h.update(str(g).encode()),h.update(e)) for k,i,g,e in rows]; print(h.hexdigest()); print(",".join(map(str,sorted(set(r[0] for r in rows)))))', database], { encoding: 'utf8' }).trim();
        const before = hash();
        check(before.split('\n')[1] === '20,21,22,23,24,25,26,27', 'Compatibility fixture does not contain every optional kind20–27');
        const stale = await ok('editor', { document });

        await restart(compatReader);
        const old = await ok('editor', { document }), text = 'Older-reader ordinary write 😀\r\n';
        const save = await ok('commands', { operation: operation(), request: { command: 'save', document, generation: old.generation, base: old.base, previous_sequence: old.acknowledged_sequence, sequence: old.acknowledged_sequence + 1, text } });

        await ok('commands', { operation: operation(), request: { command: 'commit', document, generation: save.outcome.generation, base: old.base, sequence: save.outcome.sequence } });
        check(hash() === before, 'Older reader changed optional20–27 ciphertext');
        await restart();
        check((await ok('editor', { document })).text === text, 'New reader lost old-reader write');
        check((await childState()).text === childText, 'Old-reader write changed child');
        check((await ok('working/source', source)).text === childText, 'Old reader damaged checkpoint');
        check(same(await ok('working/derivation', { document: fork }), event), 'Old reader damaged working Fork');
        const result = await api('commands', { operation: operation(), request: { command: 'checkpoint', plan: { document, branch: stale.branch, generation: stale.generation, base: stale.base, sequence: stale.acknowledged_sequence, text: stale.text, start_byte: 0, end_byte: 1, quote: stale.text.slice(0, 1) } } });
        check(result.status === 409, 'Old write did not invalidate stale working-base capture');
        checks.push('actual immutable older reader preserves every optional encrypted kind20–27 byte-for-byte across ordinary Save/Commit; stale working-base capture rejects after restart');
    }
    // Reload after direct backend history writes even when no old-reader restart ran.
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Synthetic working branches', exact: true }).click();
    await choose('Alternative');
    await exerciseParentComparison({ page, root, ok, checks, document, branch: child, choose, database });
    await page.getByLabel('Maths display', { exact: true }).selectOption('rendered');
    await page.getByRole('button', { name: 'After working widgets', exact: true }).click();

    for (const theme of ['dark', 'light'])
        for (const width of [1280, 1600, 2000]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(/** Apply the requested desktop theme below table/math branch widgets. */    t => document.body.classList.toggle('light', t === 'light'), theme);
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-working-widgets-${theme}-${width}.png`), animations: 'disabled' });
            await branches.click();
            await expect(dialog().getByRole('button', { name: 'Create child branch', exact: true })).toBeEnabled();
            await expect.poll(/** Read the committed child-source preview while awaiting branch dialog readiness. */ () => dialog().locator('pre').textContent()).toBe(childText);
            await page.screenshot({ path: resolve(root, `.local/artifacts/runtime-working-branches-${theme}-${width}.png`), animations: 'disabled' });
            await dialog().getByRole('button', { name: 'Close', exact: true }).click();
        }
    check((await childState()).text === childText, 'Rendered widgets changed exact child source');
    checks.push('actual gated branch/source controls and source below table/math widgets captured at all three desktop widths in both themes');
}
