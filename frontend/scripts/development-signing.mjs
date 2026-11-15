// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Pinned local development code signing
 *
 * Validate public signing identity metadata and verify the exact certificate
 * used for dedicated local-development runtime signatures.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/development-signing.mjs)
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
 * Used by: Explicit signing command, keychain workflow checks and guarded
 * manual-runtime updater.
 *
 * Specification:
 * - [Dedicated development signing policy](../../docs/04-architecture/decisions/0016-local-development-signing.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Security threat model](../../docs/08-assurance/security-threat-model.md)
 *
 * Boundary: Signing keys remain in the login Keychain. Loading metadata is not
 * signing authorization; trust installation is separate.
 */
import { readFile, mkdtemp, rm } from 'node:fs/promises';

import { createHash } from 'node:crypto';

import { execFileSync } from 'node:child_process';

import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '../..'), folder = join(root, '.local/credentials/signing');

const identifier = 'org.hypergraph-px.runtime.local-development';

const hash = /** Compute a selected certificate digest for comparison with pinned public identity metadata. */ (algorithm, bytes) => createHash(algorithm).update(bytes).digest('hex');

/** Read the dedicated local signing identity only when platform, identifier and certificate hashes match. */
export async function developmentIdentity() {
    let config;

    try {
        config = JSON.parse(await readFile(join(folder, 'identity.json'), 'utf8'));
    }
    catch (error) {
        if (error.code === 'ENOENT')
            return null;
        throw error;
    }
    const certificate = await readFile(join(folder, 'certificate.der'));

    if (process.platform !== 'darwin' || config.identifier !== identifier || hash('sha1', certificate) !== config.certificate_sha1 || hash('sha256', certificate) !== config.certificate_sha256)
        throw Error('Development signing identity metadata failed validation');

    return { ...config, requirement: `identifier "${identifier}" and certificate leaf = H"${config.certificate_sha1}"` };
}

/** Verify the binary designated requirement and extracted signing certificate against the pinned identity. */
export async function verifyDevelopmentSignature(binary) {
    const identity = await developmentIdentity();

    if (!identity)
        return false;
    execFileSync('/usr/bin/codesign', ['--verify', '--strict', '--verbose=2', '-R', '=' + identity.requirement, binary], { stdio: ['ignore', 'ignore', 'pipe'] });
    const temp = await mkdtemp('/private/tmp/hpx-signature-');

    try {
        const prefix = join(temp, 'signer');
        execFileSync('/usr/bin/codesign', ['--display', '--extract-certificates=' + prefix, binary], { stdio: ['ignore', 'ignore', 'pipe'] });
        const actual = await readFile(prefix + '0');

        if (hash('sha256', actual) !== identity.certificate_sha256)
            throw Error('Signed runtime certificate differs from pinned identity');
    }
    finally {
        await rm(temp, { recursive: true, force: true });
    }

    return true;
}

/** Apply the configured dedicated development identity, then independently verify the resulting binary signature. */
export async function signDevelopmentBinary(binary) {
    const identity = await developmentIdentity();

    if (!identity)
        throw Error('No approved local development signing identity is configured');
    execFileSync('/usr/bin/codesign', ['--force', '--sign', identity.certificate_sha1, '--identifier', identifier, '--requirements', '=designated => ' + identity.requirement, '--timestamp=none', binary], { stdio: ['ignore', 'ignore', 'pipe'] });
    await verifyDevelopmentSignature(binary);

    return identity;
}
