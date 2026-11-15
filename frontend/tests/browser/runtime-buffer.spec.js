/**
 * Hypergraph PX — Exact owned-buffer synthetic runtime browser checks
 *
 * Replace only the runtime connection entry with an in-memory adapter to isolate
 * exact text, departure acknowledgement and heading-link UI behavior.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/runtime-buffer.spec.js)
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

import { build } from 'esbuild';

import { readFile } from 'node:fs/promises';

import { fileURLToPath } from 'node:url';

const frontend = fileURLToPath(new URL('../../', import.meta.url));

const original = 'A😀e\u0301\r\nB\nC\rD';

let mockBundle;

test.beforeAll(/** Build an in-memory application bundle with a controlled runtime adapter fixture and no real network/runtime authority. */ async () => {
    // Embedded fixture identity(n) creates deterministic protected record IDs.
    // states.map(n) seeds two independent owned document buffers.
    // snapshots.map(s) pins exact source under each immutable snapshot identity.
    // request(path, body) records exact calls and reconciles mutation receipts by operation.
    // The held-runtime promise exposes its release callback for Lock transition tests.
    // states.find(s) chooses only the document named by the incoming command.
    // The held-departure promise exposes its release callback after Commit succeeds.
    // documents.map(d) projects adapter-owned identity/title/source into initial UI documents.
    // The generated fixture now carries its own function comments; its parsed executable tokens stay exact.
    const fixture = `
 const original=${JSON.stringify(original)},identity=/* Create deterministic 32-byte synthetic protected record identities. */ n=>Array(32).fill(n);
 const states=[1,2].map(/* Seed independent owned document states with exact fixture source. */ n=>({document:identity(n),base:identity(n+10),snapshot:identity(n+20),title:'Owned document '+n,text:original,generation:0,acknowledged_sequence:0}));
 const snapshots=new Map(states.map(/* Retain initial exact text under each immutable snapshot identity. */ s=>[JSON.stringify(s.snapshot),s.text])),receipts=new Map();let next=80;
 window.__runtimeCalls=[];
 const request=/* Record calls, reconcile receipts and simulate explicit transport/publication failure boundaries. */ async(path,body)=>{window.__runtimeCalls.push({path,body:structuredClone(body)});if(window.__holdRuntime)await new Promise(/* Expose release of the held runtime request for Lock transition checks. */ resolve=>{window.__releaseRuntime=resolve;});
 if(path==='lock')return {locked:true};if(path==='snapshot')return {text:snapshots.get(JSON.stringify(body.snapshot))};
 const command=body.request,state=states.find(/* Select only the owned document named by the incoming command. */ s=>s.document[0]===command.document[0]);
 if(window.__denyDeparture&&command.command==='commit')throw Object.assign(Error('Synthetic publication denied'),{status:409});
 let receipt=receipts.get(JSON.stringify(body.operation));
 if(!receipt){state.generation++;state.acknowledged_sequence=command.sequence;if(command.command==='save')state.text=command.text;else{state.base=identity(next++);state.snapshot=identity(next++);snapshots.set(JSON.stringify(state.snapshot),state.text);}
 receipt={operation:body.operation,outcome:{result:command.command==='save'?'saved':'committed',document:state.document,generation:state.generation,sequence:command.sequence,revision:state.base,snapshot:state.snapshot}};receipts.set(JSON.stringify(body.operation),receipt);}
 if(command.command==='commit'&&window.__holdDeparture)await new Promise(/* Expose release after Commit succeeds to test delayed acknowledgement. */ resolve=>window.__releaseDeparture=resolve);
 if(command.command==='commit'&&window.__dropDeparture)throw Error('Synthetic lost departure reply');return structuredClone(receipt);};
 window.__snapshots=snapshots;
 const adapter=new RuntimeAdapter(states,request);window.__runtimeAdapter=adapter;
 return {adapter,documents:[...adapter.docs.values()].map(/* Project adapter-owned document identity, title and source into initial UI data. */ d=>({id:d.id,title:d.title,source:d.source}))};`;
    const result = await build({ absWorkingDir: frontend, entryPoints: ['src/app.js'], bundle: true, format: 'esm', write: false, plugins: [{ name: 'synthetic-runtime-only', /** Install the esbuild loader hook that changes only the runtime connection branch for this synthetic browser bundle. */
                setup(builder) {
                    builder.onLoad({ filter: /runtime-adapter\.js$/ }, /** Load the maintained adapter module and substitute the exact synthetic connection fixture in memory. */ async (args) => {
                        const source = await readFile(args.path, 'utf8');

                        return { contents: source.replace("if(location.protocol!=='https:')return null;", fixture), loader: 'js' };
                    });
                } }] });
    mockBundle = result.outputFiles[0].text;
});

/** Open the synthetic runtime-mode application by serving the in-memory bundle at its normal browser script route. */
async function open(page) {
    page.on('dialog', /** Accept ordinary synthetic application dialogs. */  dialog => dialog.accept());
    await page.route('**/app.js', /** Return the fixture bundle for the application script without writing generated source to disk. */  route => route.fulfill({ contentType: 'text/javascript', body: mockBundle }));
    await page.goto('/');
    await expect(page.locator('.demo-badge')).toHaveText('Encrypted local workspace');
    await expect(page.locator('.cm-content')).toBeVisible();
}

const source = /** Read the first owned document source from the in-memory runtime adapter. */  page => page.evaluate(/** Return the current exact source from the browser adapter fixture. */ () => window.__runtimeAdapter.get([...window.__runtimeAdapter.docs.keys()][0]).source);

test('synthetic runtime UI preserves exact mixed newlines through typing, copy, download and undo', /** Check mixed-newline source through typing, copy, download, Undo/Redo and explicit Save. */ async ({ page }) => {
    const errors = [];
    page.on('pageerror', /** Collect page exceptions during exact source editing. */  error => errors.push(error.message));
    await open(page);
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');
    await expect.poll(/** Poll the exact adapter source after typing. */ () => source(page)).toBe(original + '!');
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(/** Poll the exact adapter source after Undo. */ () => source(page)).toBe(original);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect.poll(/** Poll the exact adapter source after Redo. */ () => source(page)).toBe(original + '!');
    await page.keyboard.press('ControlOrMeta+A');
    const copied = await editor.evaluate(/** Copy exact selected editor source through the clipboard event path. */  element => { const data = new DataTransfer(); element.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data })); return data.getData('text/plain'); });
    expect(copied).toBe(original + '!');
    const downloadPromise = page.waitForEvent('download');

    await page.locator('#download').click();
    const download = await downloadPromise;
    expect((await readFile(await download.path())).toString('utf8')).toBe(original + '!');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect.poll(/** Poll the last Save request text after explicit draft acknowledgement. */ () => page.evaluate(/** Read the last recorded runtime request source text. */ () => window.__runtimeCalls.at(-1)?.body?.request?.text)).toBe(original + '!');
    expect(errors).toEqual([]);
});

test('synthetic runtime paste retains exact newlines, and locking blocks edits across document switches', /** Check exact pasted source and read-only locking across independent document switches. */ async ({ page }) => {
    const errors = [];
    page.on('pageerror', /** Collect page exceptions during locking and document switching. */  error => errors.push(error.message));
    await open(page);
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' }), pasted = 'P😀\rQ\r\nR\n';

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await editor.evaluate(/** Paste mixed-newline text through the normal clipboard event path. */ (element, text) => { const data = new DataTransfer(); data.setData('text/plain', text); element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })); }, pasted);
    await expect.poll(/** Poll adapter source after exact paste. */ () => source(page)).toBe(pasted);
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(/** Poll adapter source after paste Undo. */ () => source(page)).toBe(original);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect.poll(/** Poll adapter source after paste Redo. */ () => source(page)).toBe(pasted);
    await page.evaluate(/** Hold the synthetic lock request so the UI locking transition can be inspected. */ () => { window.__holdRuntime = true; });
    await page.getByRole('button', { name: 'Lock', exact: true }).click();
    await expect(editor).toHaveAttribute('contenteditable', 'false');
    await page.getByRole('button', { name: 'Owned document 2', exact: true }).click();
    await expect(editor).toHaveAttribute('contenteditable', 'false');
    await page.getByRole('button', { name: 'Owned document 1', exact: true }).click();
    await expect(editor).toHaveAttribute('contenteditable', 'false');
    await editor.focus();
    await page.keyboard.type('Must not be inserted');
    expect(await source(page)).toBe(pasted);
    expect(errors).toEqual([]);
});

test('logical node departure commits exact source once while formatting and ordinary blur do not publish', /** Check logical departure publishes once while formatting/blur remain unpublished and Undo survives return navigation. */ async ({ page }) => {
    await open(page);
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');
    await page.getByRole('button', { name: 'Bold', exact: true }).click();
    await page.locator('#undo').click();
    await page.locator('#documentTitle').click();
    const commits = /** Count recorded Commit commands through the browser fixture. */ () => page.evaluate(/** Read the total recorded Commit count. */ () => window.__runtimeCalls.filter(/** Select only recorded command bodies that publish Commit. */  c => c.body?.request?.command === 'commit').length);
    expect(await commits()).toBe(0);
    const outgoing = await source(page);

    await page.getByRole('button', { name: 'Owned document 2', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('Owned document 2');
    expect(await commits()).toBe(1);
    expect(await page.evaluate(/** Read the immutable snapshot selected by the outgoing document runtime head. */ () => { const d = window.__runtimeAdapter.get([...window.__runtimeAdapter.docs.keys()][0]); return window.__snapshots.get(JSON.stringify(d.runtime.snapshot)); })).toBe(outgoing);
    await page.getByRole('button', { name: 'Owned document 1', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('Owned document 1');
    expect(await source(page)).toBe(outgoing);
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+z');
    expect(await source(page)).toBe(original);
});

test('node departure waits for publication and retains source on denied or unknown acknowledgement', /** Check denied or unknown departure acknowledgement retains source and retries the same frozen operation. */ async ({ page }) => {
    await open(page);
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');
    await page.evaluate(/** Enable explicit synthetic Commit rejection before document navigation. */ () => window.__denyDeparture = true);
    await page.getByRole('button', { name: 'Owned document 2', exact: true }).click();
    await expect(page.locator('#toast')).toContainText('Could not leave this node');
    await expect(page.locator('#documentTitle')).toHaveText('Owned document 1');
    await expect(editor).toHaveAttribute('contenteditable', 'true');
    expect(await source(page)).toBe(original + '!');
    await page.evaluate(/** Switch from explicit rejection to a lost completed Commit acknowledgement. */ () => { window.__denyDeparture = false; window.__dropDeparture = true; });
    await page.getByRole('button', { name: 'Owned document 2', exact: true }).click();
    await expect.poll(/** Poll the outgoing adapter error until the lost acknowledgement is exposed. */ () => page.evaluate(/** Read the outgoing adapter error without changing its pending operation. */ () => window.__runtimeAdapter.get([...window.__runtimeAdapter.docs.keys()][0]).error)).toContain('lost departure');
    await expect(page.locator('#documentTitle')).toHaveText('Owned document 1');
    const operation = await page.evaluate(/** Read the retained pending departure operation identity. */ () => window.__runtimeAdapter.get([...window.__runtimeAdapter.docs.keys()][0]).pending.operation);

    await page.evaluate(/** Restore completed Commit acknowledgements before retry. */ () => window.__dropDeparture = false);
    await page.getByRole('button', { name: 'Owned document 2', exact: true }).click();
    await expect(page.locator('#documentTitle')).toHaveText('Owned document 2');
    const operations = await page.evaluate(/** Collect all attempted departure Commit operation identities. */ () => window.__runtimeCalls.filter(/** Select recorded Commit attempts after failed departure. */  c => c.body?.request?.command === 'commit').map(/** Extract one recorded Commit operation identity. */  c => c.body.operation));
    expect(operations.every(/** Require every departure attempt to preserve the original pending operation identity. */  op => JSON.stringify(op) === JSON.stringify(operation))).toBe(true);
});

test('delayed automatic publication suspends outgoing edits and competing navigation until acknowledged', /** Check delayed automatic Commit suspends outgoing edits and destination activation until acknowledgement. */ async ({ page }) => {
    await open(page);
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');
    await page.evaluate(/** Hold the completed Commit response before attempting document navigation. */ () => window.__holdDeparture = true);
    await page.getByRole('button', { name: 'Owned document 2', exact: true }).click();
    await expect(editor).toHaveAttribute('contenteditable', 'false');
    await expect(page.locator('#documentTitle')).toHaveText('Owned document 1');
    await expect.poll(/** Poll for the delayed departure response release callback. */ () => page.evaluate(/** Read whether the delayed departure acknowledgement has been captured. */ () => !!window.__releaseDeparture)).toBe(true);
    await page.evaluate(/** Release the held Commit acknowledgement so destination editing may resume. */ () => { window.__holdDeparture = false; window.__releaseDeparture(); });
    await expect(page.locator('#documentTitle')).toHaveText('Owned document 2');
    await expect(editor).toHaveAttribute('contenteditable', 'true');
});

test('Lock remains available while a departure Commit acknowledgement is delayed', /** Check Lock remains usable while a departure Commit response is delayed. */ async ({ page }) => {
    await open(page);
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' });

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('!');
    await page.evaluate(/** Hold departure acknowledgement before initiating the Lock-during-departure scenario. */ () => window.__holdDeparture = true);
    await page.getByRole('button', { name: 'Owned document 2', exact: true }).click();
    await expect.poll(/** Poll until the delayed departure response is available for the Lock race. */ () => page.evaluate(/** Read controlled departure delay readiness. */ () => !!window.__releaseDeparture)).toBe(true);
    await page.getByRole('button', { name: 'Lock', exact: true }).click();
    await expect.poll(/** Poll adapter lifecycle until Lock has entered its non-editable transition. */ () => page.evaluate(/** Read current adapter lifecycle from the synthetic browser fixture. */ () => window.__runtimeAdapter.lifecycle)).toBe('locking');
    await expect(editor).toHaveAttribute('contenteditable', 'false');
    const reloaded = page.waitForEvent('load');

    await page.evaluate(/** Release the delayed Commit while Lock is pending so the existing reload boundary can complete. */ () => { window.__holdDeparture = false; window.__releaseDeparture(); });
    await reloaded;
    await expect(editor).toBeVisible();
});

test('Link accepts partial words, punctuation and emoji below widgets, with cancellation and one-step Undo', /** Check exact partial-word/emoji heading links below widgets, cancellation and one-step Undo without Commit. */ async ({ page }) => {
    await open(page);
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' }), text = '# Target\r\n\r\n| A | B |\r\n| --- | --- |\r\n| a | b |\r\n\r\n$$\r\nx=1\r\n$$\r\n\r\nx partial 😀, [text]! y';

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await editor.evaluate(/** Paste widget-rich CRLF source through the normal editor paste event. */ (e, text) => { const d = new DataTransfer(); d.setData('text/plain', text); e.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: d })); }, text);
    await page.keyboard.press('ControlOrMeta+End');
    await expect(page.getByRole('button', { name: 'Link', exact: true })).toBeDisabled();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Shift+Home');

    for (let i = 0; i < 3; i++)
        await page.keyboard.press('Shift+ArrowRight');
    const link = page.getByRole('button', { name: 'Link', exact: true });

    await expect(link).toBeEnabled();
    await link.click();
    await expect(page.getByLabel('Link text')).toHaveValue('artial 😀, [text]!');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    expect(await source(page)).toBe(text);
    await link.click();
    await expect(page.getByLabel('Link text')).toHaveValue('artial 😀, [text]!');
    await page.getByLabel('Target heading').selectOption({ label: 'Target' });
    await page.getByRole('button', { name: 'Insert Markdown link' }).click();
    expect(await source(page)).toBe(text.replace('artial 😀, [text]!', '[artial 😀, \\[text\\]!](#target)'));
    await page.keyboard.press('ControlOrMeta+z');
    expect(await source(page)).toBe(text);
    expect(await page.evaluate(/** Count unexpected Commit commands after Link/Undo interaction. */ () => window.__runtimeCalls.filter(/** Select runtime commands that would publish Commit. */  c => c.path === 'commands' && c.body.request.command === 'commit').length)).toBe(0);
});

test('Link preserves selected multiline source bytes and stays unavailable without a target heading', /** Check multiline selected source preserves original CRLF/CR bytes despite LF-normalized dialog display. */ async ({ page }) => {
    await open(page);
    const editor = page.getByRole('textbox', { name: 'Markdown document editor' }), link = page.getByRole('button', { name: 'Link', exact: true });

    await expect(link).toBeDisabled();
    const text = '# Target\r\n\r\nalpha 😀\r\nbeta\rgamma';

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await editor.evaluate(/** Paste exact multiline source before heading-link selection and review. */ (e, text) => { const d = new DataTransfer(); d.setData('text/plain', text); e.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: d })); }, text);
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ControlOrMeta+Shift+End');
    await link.click();
    await expect(page.getByLabel('Link text')).toHaveValue('alpha 😀\nbeta\ngamma');
    await page.getByRole('button', { name: 'Insert Markdown link' }).click();
    expect(await source(page)).toBe('# Target\r\n\r\n[alpha 😀\r\nbeta\rgamma](#target)');
    await page.keyboard.press('ControlOrMeta+z');
    expect(await source(page)).toBe(text);
});
