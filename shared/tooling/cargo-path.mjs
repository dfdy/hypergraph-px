/**
 * Hypergraph PX — Cargo output path resolution
 *
 * Resolve Cargo-selected target directories and executable locations rather than
 * guessing a fixed build-output folder.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/cargo-path.mjs)
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
 * Used by: Development launchers, manual/self-build helpers and build-path
 * fixtures.
 *
 * Specification:
 * - [Developer launch/build workflow](../../docs/09-guides/developers/repository-development.md)
 *
 * Boundary: Reads Cargo metadata only; resolving a path neither compiles nor
 * launches the executable.
 */
import { execFileSync } from 'node:child_process';

import { resolve, join, basename } from 'node:path';

import { fileURLToPath, pathToFileURL } from 'node:url';

/** Resolve subprocess paths from the repository rather than the caller working directory. */
export const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** Read authoritative offline Cargo metadata using the caller environment and reject a missing output directory. */
export function cargoTargetDirectory({ root = repositoryRoot, env = process.env, execute = execFileSync } = {}) {
    const data = JSON.parse(execute('cargo', ['metadata', '--format-version', '1', '--no-deps', '--locked', '--offline'], { cwd: root, env, encoding: 'utf8' }));

    if (typeof data.target_directory !== 'string' || !data.target_directory)
        throw Error('Cargo metadata lacks target_directory');

    return resolve(root, data.target_directory);
}

/** Build the requested binary path from Cargo output metadata, selected target/profile and platform suffix. */
export function cargoExecutable({ profile = 'debug', name = 'hypergraph', example = false, env = process.env, target = env.CARGO_BUILD_TARGET, ...options } = {}) {
    const directory = cargoTargetDirectory({ ...options, env });
    const targetFolder = target ? (target.endsWith('.json') ? basename(target, '.json') : target) : '';

    if (!/^[a-zA-Z0-9_-]+$/.test(profile) || !name || name.includes('/') || name.includes('\\'))
        throw Error('Invalid Cargo executable/profile');

    return join(directory, targetFolder, profile, example ? 'examples' : '', name + (process.platform === 'win32' ? '.exe' : ''));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const args = process.argv.slice(2), options = {};

    for (let i = 0; i < args.length; i++) {
        if (['--profile', '--name', '--target'].includes(args[i]) && args[i + 1])
            options[args[i].slice(2)] = args[++i];
        else
            throw Error('Usage: cargo-path.mjs [--profile debug|release] [--name hypergraph] [--target triple]');
    }
    console.log(cargoExecutable(options));
}
