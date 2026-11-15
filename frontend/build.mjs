/**
 * Hypergraph PX — Immutable browser asset builds
 *
 * Bundle browser code and copy pinned styles, fonts and licence notices into a
 * verified content-addressed asset snapshot.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/build.mjs)
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
 * Used by: Frontend development/watch server, UI runner, embedded release builds
 * and build-cache fixtures.
 *
 * Specification:
 * - [Repository development workflow](../docs/09-guides/developers/repository-development.md)
 * - [Build and release contract](../docs/08-assurance/build-and-release.md)
 *
 * Boundary: Asset build identity is verified by the cache helper; building
 * assets does not establish runtime integration acceptance.
 */
import { build } from 'esbuild';

import { mkdir, copyFile, cp, readFile, writeFile, readdir } from 'node:fs/promises';

import { resolve } from 'node:path';

import { pathToFileURL } from 'node:url';

import { cachedBuild, installDist, frontend } from './scripts/build-cache.mjs';

/** Build or reuse the exact frontend snapshot, optionally installing it as the current dist only after validation. */
export async function buildFrontend({ snapshotOnly = false } = {}) {
    const file = /** Resolve each asset or package input relative to the frontend source tree. */                                                                path => resolve(frontend, path);
    const snapshot = await cachedBuild(/** Populate a fresh output directory with bundled code, vendor assets, version metadata and required licence notices. */ async (output) => {
        await mkdir(resolve(output, 'vendor/katex'), { recursive: true });
        await mkdir(resolve(output, 'vendor/dockview'), { recursive: true });
        await mkdir(resolve(output, 'vendor/webawesome'), { recursive: true });
        await mkdir(resolve(output, 'assets'), { recursive: true });
        await copyFile(file('../docs/01-purpose/assets/logo.png'), resolve(output, 'assets/logo.png'));
        await build({ absWorkingDir: frontend, entryPoints: ['src/app.js'], bundle: true, format: 'esm', minify: true, outfile: resolve(output, 'app.js'), legalComments: 'linked' });
        const version = JSON.parse(await readFile(file('package.json'), 'utf8')).version + '.0';

        await writeFile(resolve(output, 'index.html'), (await readFile(file('index.html'), 'utf8')).replace('Version pending', 'v' + version));
        await writeFile(resolve(output, 'build-version.json'), JSON.stringify({ version }) + '\n');
        await copyFile(file('styles.css'), resolve(output, 'styles.css'));
        await copyFile(file('node_modules/dockview/dist/styles/dockview.css'), resolve(output, 'vendor/dockview/dockview.css'));
        await cp(file('node_modules/@awesome.me/webawesome/dist/styles'), resolve(output, 'vendor/webawesome/styles'), { recursive: true });
        await copyFile(file('node_modules/katex/dist/katex.min.css'), resolve(output, 'vendor/katex/katex.min.css'));
        await cp(file('node_modules/katex/dist/fonts'), resolve(output, 'vendor/katex/fonts'), { recursive: true });
        const lock = JSON.parse(await readFile(file('package-lock.json'), 'utf8')), notices = ['Hypergraph PX frontend: AGPL-3.0-only. See LICENSE.'];

        for (const [name, entry] of Object.entries(lock.packages)) {
            if (!name)
                continue;
            let files = [];

            try {
                files = await readdir(file(name));
            }
            catch {
                continue;
            }

            for (const license of files.filter(/** Include package files whose names identify licence or copying notices in the generated attribution bundle. */                                                                f => /^(licen[cs]e|copying)(\.|$)/i.test(f)))
                notices.push(`\n${name} ${entry.version} (${entry.license})\n${await readFile(file(`${name}/${license}`), 'utf8')}`);
        }

        for (const name of (await readdir(file('../shared/legal/upstream-notices'))).filter(/** Include retained upstream licence files in stable order alongside dependency notices. */                                                                n => n.endsWith('-LICENSE')).sort())
            notices.push('\n' + name + '\n' + await readFile(file('../shared/legal/upstream-notices/' + name), 'utf8'));
        await writeFile(resolve(output, 'THIRD_PARTY_NOTICES.txt'), notices.join('\n'));
        await copyFile(file('../LICENSE'), resolve(output, 'LICENSE'));
    });

    return { ...snapshot, installed: snapshotOnly ? false : await installDist(snapshot) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const result = await buildFrontend();
    console.log((result.cached ? 'Reused verified' : 'Built') + ' static frontend in frontend/dist (source ' + result.source.slice(0, 12) + ', ' + result.seconds.toFixed(3) + 's)');
}
