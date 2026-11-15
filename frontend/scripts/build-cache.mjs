/**
 * Hypergraph PX — Verified immutable asset caching
 *
 * Identify all browser build inputs, validate cached snapshot contents and
 * serialize installation of generated distribution assets.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/build-cache.mjs)
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
 * Used by: Frontend builds/watchers, isolated UI runner and cache fixtures.
 *
 * Specification:
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Build and release contract](../../docs/08-assurance/build-and-release.md)
 *
 * Boundary: Content hashes establish cache identity and integrity only, not test
 * acceptance or permission to deploy.
 */
import { createHash, randomUUID } from 'node:crypto';

import { readdir, readFile, writeFile, mkdir, mkdtemp, rename, rm, cp } from 'node:fs/promises';

import { resolve, relative, join } from 'node:path';

/** Repository anchor for stable input names and owned local build artifacts. */
export const root = resolve(import.meta.dirname, '../..');

/** Browser source/dependency root shared by asset builders and isolated verification runners. */
export const frontend = join(root, 'frontend');

/** List regular files beneath a build input/output tree in stable order, rejecting symbolic links. */
export async function filesUnder(directory) {
    const result = [];

    /** Recursively collect regular descendants without following symlinks or package command shims. */
    async function walk(path) {
        for (const entry of (await readdir(path, { withFileTypes: true })).sort(/** Sort directory entries by name so filesystem enumeration cannot affect asset identity. */ (a, b) => a.name.localeCompare(b.name))) {
            if (entry.name === '.bin')
                continue;
            const file = join(path, entry.name);

            if (entry.isSymbolicLink())
                throw Error('Build inputs/outputs must not contain symlinks: ' + relative(root, file));

            if (entry.isDirectory())
                await walk(file);
            else if (entry.isFile())
                result.push(file);
        }
    }
    await walk(directory);

    return result;
}

/** Hash each sorted repository-relative file name and its exact content digest. */
export async function hashFiles(files) {
    const hash = createHash('sha256');

    for (const file of [...files].sort()) {
        hash.update(relative(root, file));
        hash.update('\0');
        hash.update(createHash('sha256').update(await readFile(file)).digest());
    }

    return hash.digest('hex');
}

/** Hash generated assets relative to their snapshot root so installation paths do not affect identity. */
export async function assetDigest(directory) {
    const hash = createHash('sha256');

    for (const file of await filesUnder(directory)) {
        hash.update(relative(directory, file));
        hash.update('\0');
        hash.update(createHash('sha256').update(await readFile(file)).digest());
    }

    return hash.digest('hex');
}

/** Identify shared contracts and retained licence notices that participate in browser rebuild identity. */
export function isSharedBrowserInput(name) { return typeof name === 'string' && /^(openapi\.json|predicate-catalog-v1\.json|legal\/upstream-notices\/[^/]+-LICENSE)$/.test(name.replaceAll('\\', '/')); }

/** Collect the generated browser contracts and only regular retained upstream licence inputs. */
export async function sharedBrowserInputFiles(repository = root) {
    const notices = join(repository, 'shared/legal/upstream-notices'), files = ['shared/openapi.json', 'shared/predicate-catalog-v1.json'].map(/** Resolve each shared contract path against the selected repository root. */                p => join(repository, p));

    for (const entry of await readdir(notices, { withFileTypes: true })) {
        if (!entry.name.endsWith('-LICENSE'))
            continue;

        if (!entry.isFile())
            throw Error('Legal notice input must be a regular file: ' + entry.name);
        files.push(join(notices, entry.name));
    }

    return files.sort();
}

/** Hash browser sources, dependencies, entry assets, legal inputs and execution platform into a build identity. */
export async function inputIdentity() {
    const files = [...await filesUnder(join(frontend, 'src')), ...await sharedBrowserInputFiles(), ...await filesUnder(join(frontend, 'node_modules')), ...['frontend/index.html', 'frontend/styles.css', 'frontend/package.json', 'frontend/package-lock.json', 'frontend/build.mjs', 'frontend/scripts/build-cache.mjs', 'docs/01-purpose/assets/logo.png', 'LICENSE'].map(/** Resolve fixed browser build inputs against this checkout before hashing. */                p => join(root, p))];

    return createHash('sha256').update(process.version + '\0' + process.platform + '\0' + process.arch + '\0' + await hashFiles(files)).digest('hex');
}

/** Accept a cache entry only when its recorded source identity and actual asset digest agree. */
export async function validEntry(directory, source) {
    try {
        const record = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));

        return record.source === source && record.assets === await assetDigest(join(directory, 'assets')) ? record : null;
    }
    catch {
        return null;
    }
}

/** Build missing snapshots in isolation, verify unchanged inputs and publish a validated cache entry with race handling. */
export async function cachedBuild(build) {
    const start = performance.now(), source = await inputIdentity(), cache = join(root, '.local/verification/frontend-assets');

    await mkdir(cache, { recursive: true });
    const entry = join(cache, source);
    let record = await validEntry(entry, source), cached = !!record;

    if (!record) {
        const temporary = await mkdtemp(join(cache, '.building-'));

        try {
            await build(join(temporary, 'assets'));

            if (await inputIdentity() !== source)
                throw Error('Frontend inputs changed during build; no valid snapshot published');
            record = { source, assets: await assetDigest(join(temporary, 'assets')), node: process.version };
            await writeFile(join(temporary, 'manifest.json'), JSON.stringify(record) + '\n');

            try {
                await rename(temporary, entry);
            }
            catch (error) {
                if (!['EEXIST', 'ENOTEMPTY'].includes(error.code))
                    throw error;

                if (!await validEntry(entry, source)) {
                    const quarantine = join(cache, '.invalid-' + randomUUID());

                    await rename(entry, quarantine);
                    await rename(temporary, entry);
                    await rm(quarantine, { recursive: true, force: true });
                }
            }
        }
        finally {
            await rm(temporary, { recursive: true, force: true });
        }
    }

    return { ...record, directory: join(entry, 'assets'), cached, seconds: (performance.now() - start) / 1000 };
}

/** Install a verified snapshot into shared dist under an exclusive local lock and verify copied bytes. */
export async function installDist(snapshot) {
    const dist = join(frontend, 'dist');

    try {
        if (await assetDigest(dist) === snapshot.assets)
            return false;
    }
    catch { }
    const lock = join(root, '.local/verification/frontend-dist.lock');

    await mkdir(lock).catch(/** Report an existing dist update lock explicitly rather than racing a second installation. */                error => {
        if (error.code === 'EEXIST')
            throw Error('Another frontend dist update is active; serialize shared-output builds');
        throw error;
    });

    try {
        await rm(dist, { recursive: true, force: true });
        await cp(snapshot.directory, dist, { recursive: true });

        if (await assetDigest(dist) !== snapshot.assets)
            throw Error('Installed frontend assets failed content verification');
    }
    finally {
        await rm(lock, { recursive: true, force: true });
    }

    return true;
}
