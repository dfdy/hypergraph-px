#!/usr/bin/env node
/**
 * Hypergraph PX — Shared LikeC4 command entry point
 *
 * Route validation, serving, model access and static generation through one
 * pinned project configuration while keeping installed/generated state outside
 * active docs.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/likec4.mjs)
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
 * Used by: Documentation package scripts, model clients and explicit
 * browser-site builds.
 *
 * Specification:
 * - [Diagram project workflow](../../docs/04-architecture/SPECIFICATION.md#numbered-documentation-project)
 * - [Change-sensitive checks and acceptance boundaries](../../docs/09-guides/reference/development-evidence.md)
 *
 * Boundary: Setup intentionally installs locked tooling; validation is no-layout
 * by default. Model parsing/layout is not product verification.
 */
import { spawnSync } from 'node:child_process';

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

import { fileURLToPath } from 'node:url';

import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const docs = path.join(root, 'docs');

const local = path.join(root, '.provenance/docs-reorganisation/likec4');

const dependencies = path.join(local, 'dependencies');

const binary = path.join(dependencies, 'node_modules/.bin/likec4');

const action = process.argv[2] ?? 'validate';

let args;

if (action === 'setup') {
    mkdirSync(dependencies, { recursive: true });

    for (const name of ['package.json', 'package-lock.json'])
        writeFileSync(path.join(dependencies, name), readFileSync(path.join(docs, name)));
    const run = spawnSync('npm', ['ci', '--ignore-scripts', '--prefix', dependencies], { cwd: root, stdio: 'inherit' });

    if (run.error)
        throw run.error;
    process.exit(run.status ?? 1);
}

if (!existsSync(binary)) {
    console.error('LikeC4 dependencies are unavailable. Run npm --prefix docs run setup.');
    process.exit(1);
}

if (action === 'validate')
    args = ['validate', '--json', '--no-layout', docs];
else if (action === 'dev')
    args = ['start', '--listen', '127.0.0.1', '--port', '5175', docs];
else if (action === 'mcp')
    args = ['mcp', '--stdio', docs];
else if (action === 'build') {
    const output = path.join(local, 'generated/site');
    mkdirSync(path.dirname(output), { recursive: true });
    args = ['build', '--use-hash-history', '-o', output, docs];
}
else {
    console.error('Expected setup, validate, dev, mcp or build.');
    process.exit(2);
}

// macOS sandboxed file watching can exhaust native watcher handles. Poll only
// the documentation project by default there; retain explicit caller settings.
const env = { ...process.env };

if (process.platform === 'darwin') {
    env.CHOKIDAR_USEPOLLING ??= '1';
    env.CHOKIDAR_INTERVAL ??= '1000';
}

const run = spawnSync(binary, [...args, ...process.argv.slice(3)], { cwd: root, stdio: 'inherit', env });

if (run.error)
    throw run.error;

process.exit(run.status ?? 1);
