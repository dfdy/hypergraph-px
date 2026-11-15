// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Scoped synthetic runtime timing observations
 *
 * Measure exact large-source Save/read/Commit reconstruction and acknowledged
 * receipt growth through the existing browser/runtime test harness.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/measure-runtime-workload.mjs)
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
 * Used by: Actual synthetic runtime integration workflow.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 *
 * Boundary: One warm local run includes harness overhead and is neither a
 * benchmark target nor a performance or whole-product proof.
 */
import { performance } from 'node:perf_hooks';

import { randomBytes } from 'node:crypto';

import { execFileSync } from 'node:child_process';

import { writeFile } from 'node:fs/promises';

import { resolve } from 'node:path';

/** Collect bounded synthetic timing samples while verifying exact source reconstruction and six-operation receipt growth. */
export async function measureRuntimeWorkload({ ok, page, database, root, checks }) {
    const command = /** Submit one measured authorized command with a fresh operation identity. */                request => ok('commands', { operation: [...randomBytes(32)], request });
    const stats = /** Read only synthetic SQLite receipt count/encrypted-byte totals for before/after observation. */ () => JSON.parse(execFileSync('python3', ['-c', 'import sqlite3,json,sys; d=sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True); n,b=d.execute("SELECT count(*),coalesce(sum(length(envelope)),0) FROM objects WHERE kind=8").fetchone(); print(json.dumps({"count":n,"encrypted_bytes":b}))', database], { encoding: 'utf8' }));
    const source = ('Synthetic measurement 😀e\u0301\r\n').repeat(32768), textBytes = Buffer.byteLength(source);
    const before = stats(), created = await command({ command: 'create', title: 'Synthetic measured workload', text: source }), document = created.outcome.document, samples = [];
    let editor = await ok('editor', { document });

    for (let sample = 0; sample < 3; sample++) {
        const text = source + sample, request = { command: 'save', document, generation: editor.generation, base: editor.base, previous_sequence: editor.acknowledged_sequence, sequence: editor.acknowledged_sequence + 1, text };
        const serialization = await page.evaluate(/** Measure browser request serialization cost and UTF8 payload size independently of runtime round-trip time. */                request => { const start = performance.now(), encoded = JSON.stringify(request); return { milliseconds: performance.now() - start, bytes: new TextEncoder().encode(encoded).length }; }, request);
        const start = performance.now();

        await command(request);
        const saveMs = performance.now() - start;
        const readStart = performance.now();
        editor = await ok('editor', { document });
        const readMs = performance.now() - readStart;

        if (editor.text !== text)
            throw Error('Measured large-source Save/read lost exact bytes');
        samples.push({ serialization, save_ms: saveMs, editor_read_ms: readMs });
    }
    const text = editor.text + ' concurrent', save = { command: 'save', document, generation: editor.generation, base: editor.base, previous_sequence: editor.acknowledged_sequence, sequence: editor.acknowledged_sequence + 1, text };
    const contentionStart = performance.now();
    const [, history] = await Promise.all([command(save), ok('history', { document, next: null, limit: 1 })]);
    const concurrentMs = performance.now() - contentionStart;

    if (history.entries.length !== 1)
        throw Error('Concurrent measured history lost its exact immutable page');
    editor = await ok('editor', { document });

    if (editor.text !== text)
        throw Error('Concurrent measured Save lost exact bytes');
    const commitStart = performance.now(), receipt = await command({ command: 'commit', document, generation: editor.generation, base: editor.base, sequence: editor.acknowledged_sequence }), commitMs = performance.now() - commitStart;
    const snapshotStart = performance.now(), snapshot = await ok('snapshot', { document, snapshot: receipt.outcome.snapshot }), snapshotMs = performance.now() - snapshotStart;

    if (snapshot.text !== text)
        throw Error('Measured Commit/reconstruction lost exact bytes');
    const after = stats();

    if (after.count - before.count !== 6)
        throw Error('Measured workload receipt growth differs from six acknowledged operations');
    const report = { synthetic: true, acceptedTargets: false, scope: 'one create; three serial Saves/reads; one concurrent Save plus history read; one Commit/reconstruction', source_utf8_bytes: textBytes, samples, concurrent_save_history_ms: concurrentMs, commit_ms: commitMs, snapshot_ms: snapshotMs, receipts: { before, after, added_count: after.count - before.count, added_encrypted_bytes: after.encrypted_bytes - before.encrypted_bytes }, limits: 'Single local run with warm process and synthetic source. Timings include browser evaluation/transport/serialization/KDF-independent runtime/SQLite work and harness overhead; no percentile, benchmark target, hostile-host or accessibility-conformance claim. No pruning/cache/mutex redesign.' };

    await writeFile(resolve(root, '.local/artifacts/runtime-workload-observations.json'), JSON.stringify(report, null, 2));
    checks.push('measured synthetic large-source serialization/Save/read/Commit/reconstruction, concurrent Save/history and exact six-receipt growth without changing accepted targets');
}
