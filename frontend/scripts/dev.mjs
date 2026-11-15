/**
 * Hypergraph PX — Deliberate frontend rebuild supervision
 *
 * Watch browser/shared inputs and atomically replace built snapshots while
 * leaving reload under developer control to preserve owned buffers.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/dev.mjs)
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
 * Used by: Independent frontend development launcher and local package commands.
 *
 * Specification:
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 *
 * Boundary: Mock mode stays tab-only; connected mode delegates HTTPS and
 * authority boundaries to the development server. Rebuild failure retains
 * previous assets.
 */
import { watch } from 'node:fs';

import { resolve } from 'node:path';

import { buildFrontend } from '../build.mjs';

import { createDevelopmentServer } from './dev-server.mjs';

import { frontend, root, isSharedBrowserInput } from './build-cache.mjs';

/** Parse only supported frontend options and reject missing values before starting watchers or listeners. */
export function options(args) {
    const result = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--mock')
            result.mock = true;
        else if (['--port', '--backend', '--cert', '--key', '--ca'].includes(arg)) {
            if (!args[i + 1] || args[i + 1].startsWith('--'))
                throw Error('Missing value for ' + arg);
            result[arg.slice(2)] = args[++i];
        }
        else
            throw Error('Unknown frontend option: ' + arg);
    }

    return result;
}

const opts = options(process.argv.slice(2));

let snapshot = await buildFrontend({ snapshotOnly: true });

const service = await createDevelopmentServer({ ...opts, port: Number(opts.port ?? process.env.HPX_FRONTEND_PORT ?? 3000), assets: /** Return the latest successful asset snapshot for each static request. */ () => snapshot.directory });

console.log(`HPX frontend: ${service.url} (${opts.mock ? 'synthetic tab-only mock; no backend' : 'verified HTTPS API proxy'})`);

console.log('Source changes rebuild assets; reload deliberately to avoid discarding an owned editing buffer.');

let timer, pending = false, rebuilding = false;

/** Serialize builds, coalesce changes during a build and preserve prior assets when rebuilding fails. */
async function rebuild() {
    if (rebuilding) {
        pending = true;

        return;
    }
    rebuilding = true;

    try {
        snapshot = await buildFrontend({ snapshotOnly: true });
        console.log('Frontend rebuilt; reload when ready.');
    }
    catch (error) {
        console.error('Frontend rebuild failed; previous assets retained:', error.message);
    }
    finally {
        rebuilding = false;

        if (pending) {
            pending = false;
            void rebuild();
        }
    }
}

const watcher = watch(frontend, { recursive: true }, /** Debounce changes to browser source or entry assets while ignoring unrelated frontend files. */ (_event, name) => {
    if (!name || !(/^(src\/|index\.html$|styles\.css$|build\.mjs$)/.test(name)))
        return;
    clearTimeout(timer);
    timer = setTimeout(/** Rebuild after the frontend file-change debounce interval expires. */ () => void rebuild(), 100);
});

const changed = /** Debounce shared contract/licence changes through the same rebuild scheduler. */ () => {
    clearTimeout(timer);
    timer = setTimeout(/** Rebuild after the shared-input debounce interval expires. */ () => void rebuild(), 100);
};

const sharedWatcher = watch(resolve(root, 'shared'), { recursive: true }, /** Rebuild only when a changed shared path participates in browser input identity. */ (_event, name) => {
    if (isSharedBrowserInput(name))
        changed();
});

const legalWatcher = watch(resolve(root, 'shared/legal/upstream-notices'), /** Rebuild when a retained upstream licence file changes so notices cannot become stale. */ (_event, name) => {
    if (typeof name === 'string' && /^[^/]+-LICENSE$/.test(name))
        changed();
});

for (const signal of ['SIGINT', 'SIGTERM'])
    process.once(signal, /** On termination, cancel pending work, close every owned watcher and close the development listener. */ async () => { clearTimeout(timer); watcher.close(); sharedWatcher.close(); legalWatcher.close(); await service.close(); });
