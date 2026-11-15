// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Verified binary handoff adapter
 *
 * Require exact tested binary identity before optionally invoking the guarded
 * existing manual-workspace refresh.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/manual-runtime-update.mjs)
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
 * Used by: Actual runtime integration checks at an explicitly requested
 * completed milestone.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 *
 * Boundary: Without --handoff this records only deferred handoff. Missing
 * session metadata is not recreated, and approval for testing alone never
 * enables refresh.
 */
import { cargoExecutable } from '../../shared/tooling/cargo-path.mjs';

// Local integration checks hand off only the exact binary they exercised.
import { readFile, access } from 'node:fs/promises';

import { createHash } from 'node:crypto';

import { spawn } from 'node:child_process';

import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');

/** Detect the explicit milestone handoff flag without treating successful tests as implicit deployment authorization. */
export function handoffRequested(args = process.argv.slice(2)) { return args.includes('--handoff'); }

/** Reject malformed or changed runtime fingerprints so only the exact tested executable can be handed off. */
export function verifyTestedFingerprint(expected, actual) {
    if (!/^[a-f0-9]{64}$/.test(expected) || expected !== actual)
        throw Error('Runtime binary changed during tests; successful verification requires the exact tested binary');
}

/** Hash the selected executable bytes for before/after integration identity checks. */
export async function binaryFingerprint(executable = cargoExecutable()) { return createHash('sha256').update(await readFile(executable)).digest('hex'); }

/** Confirm the exact tested binary and explicit handoff request before delegating to the existing-session refresh guard. */
export async function refreshManualRuntime(testedSha, name) {
    verifyTestedFingerprint(testedSha, await binaryFingerprint());

    if (!handoffRequested()) {
        console.log('Verified exact binary; manual handoff deferred to a completed milestone or explicit request (--handoff).');

        return;
    }

    try {
        await access(resolve(root, '.local/manual-runtime/manual-runtime-session.json'));
    }
    catch (error) {
        if (error.code === 'ENOENT')
            return;
        throw error;
    }
    await new Promise(/** Spawn the guarded updater and wait for its actual outcome without claiming uncertain delivery. */ (yes, no) => {
        const child = spawn(process.execPath, [resolve(import.meta.dirname, 'refresh-manual-runtime.mjs'), '--tested-sha', testedSha, '--verified-by', name], { stdio: ['ignore', 'pipe', 'pipe'] });
        child.stdout.on('data', /** Forward safe updater status output to the calling integration terminal. */                bytes => process.stdout.write(bytes));
        child.stderr.on('data', /** Discard updater stderr from normal output because failures are summarized without leaking private launch details. */ () => { });
        child.once('error', /** Reject a failed updater spawn with a stable diagnostic. */ () => no(Error('Manual runtime updater could not start')));
        child.once('exit', /** Reject unsuccessful or uncertain updater completion and direct recovery to its durable lock/record. */                code => code === 0 ? yes() : no(Error('Manual runtime update failed; inspect its recorded process and handoff lock before retrying')));
    });
}
