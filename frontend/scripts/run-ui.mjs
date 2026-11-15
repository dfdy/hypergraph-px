/**
 * Hypergraph PX — Owned headless UI verification runs
 *
 * Build immutable assets, own an isolated preview/browser test process and
 * retain exact source/tooling/evidence identities for each run.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/run-ui.mjs)
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
 * Used by: Frontend test:ui command and change-sensitive assurance workflow.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 *
 * Boundary: Runs use fresh artifacts and loopback preview only; passing browser
 * checks never authorize executable deployment or workspace handoff.
 */
import { spawn } from 'node:child_process';

import { mkdir, mkdtemp, writeFile, readFile } from 'node:fs/promises';

import { join, relative } from 'node:path';

import { buildFrontend } from '../build.mjs';

import { root, frontend, filesUnder, hashFiles, inputIdentity, assetDigest } from './build-cache.mjs';

const start = performance.now(), runs = join(root, '.local/artifacts/ui-runs');

await mkdir(runs, { recursive: true });

const directory = await mkdtemp(join(runs, 'run-'));

let server, child, signalReceived = false;

const evidence = { kind: 'headless-preview', started: new Date().toISOString(), arguments: process.argv.slice(2), status: 'incomplete', deployment: 'none; preview checks never authorize executable handoff' };

/** Terminate one still-running owned process, waiting for exit with a bounded forced-kill fallback. */
async function stop(process) {
    if (process && process.exitCode === null && process.signalCode === null) {
        await new Promise(/** Coordinate graceful child shutdown and finish only when its exit is observed. */                                                                resolve => {
            const timer = setTimeout(/** Force-kill an owned process that remains alive after the shutdown grace period. */ () => process.kill('SIGKILL'), 3000);
            timer.unref();
            process.once('exit', /** Cancel the kill timer and complete cleanup after the owned child exits. */ () => { clearTimeout(timer); resolve(); });
            process.kill('SIGTERM');
        });
    }
}

for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, /** Record interruption and forward the received signal to both owned preview and test processes. */ () => { signalReceived = true; child?.kill(signal); server?.kill(signal); });

try {
    const snapshot = await buildFrontend({ snapshotOnly: true });
    evidence.source = snapshot.source;
    evidence.asset_sha256 = snapshot.assets;
    evidence.build = { cached: snapshot.cached, seconds: snapshot.seconds };
    const tooling = /** Hash exact test runner/config/source inputs so a later change invalidates this run. */ async () => hashFiles([...['frontend/playwright.config.js', 'frontend/package.json', 'frontend/package-lock.json', 'frontend/server.mjs', 'frontend/scripts/run-ui.mjs', 'frontend/scripts/browser-session.mjs'].map(/** Resolve each runner/config input from the repository root before hashing. */                                                                p => join(root, p)), ...await filesUnder(join(frontend, 'tests'))]);
    const testSource = await tooling();
    evidence.test_source_sha256 = testSource;
    const previewStart = performance.now();
    server = spawn(process.execPath, ['server.mjs'], { cwd: frontend, env: { ...process.env, HPX_PREVIEW_ROOT: snapshot.directory, HYPERGRAPH_PREVIEW_PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    const url = await new Promise(/** Wait for the owned preview to announce its loopback URL, rejecting startup failure or timeout. */ (yes, no) => {
        let output = '';
        const timeout = setTimeout(/** Reject a preview that has not announced readiness before the startup deadline. */ () => no(Error('Isolated preview startup timed out')), 15000);
        server.once('error', /** Cancel readiness timeout and propagate a preview spawn error. */                                                                error => { clearTimeout(timeout); no(error); });
        server.once('exit', /** Reject a preview that exits before readiness instead of treating partial output as success. */ () => { clearTimeout(timeout); no(Error('Isolated preview exited during startup')); });
        server.stdout.on('data', /** Accumulate preview output until the complete assigned loopback URL can be extracted. */                                                                bytes => {
            output += bytes;
            const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);

            if (match) {
                clearTimeout(timeout);
                yes(match[0]);
            }
        });
    });
    evidence.preview_seconds = (performance.now() - previewStart) / 1000;
    evidence.preview = url;
    const testStart = performance.now();
    child = spawn(process.execPath, [join(frontend, 'node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)], { cwd: frontend, env: { ...process.env, HPX_UI_BASE_URL: url, HPX_UI_ARTIFACTS: directory }, stdio: 'inherit' });
    const code = await new Promise(/** Wait for Playwright completion while preserving spawn failure and process exit status. */ (yes, no) => {
        child.once('error', no);
        child.once('exit', /** Return the test exit status, treating a missing status as failure. */ (code) => yes(code ?? 1));
    });
    evidence.test_seconds = (performance.now() - testStart) / 1000;
    evidence.exit_code = code;

    try {
        const report = JSON.parse(await readFile(join(directory, 'playwright.json'), 'utf8'));
        evidence.test_stats = report.stats;
        evidence.failure_category = code ? (report.stats?.unexpected ? 'test-or-fixture; inspect retained report/trace' : 'runner-or-configuration') : 'none';

        if (code === 0 && !((report.stats?.expected ?? 0) + (report.stats?.unexpected ?? 0) + (report.stats?.flaky ?? 0)))
            throw Error('No tests executed; verification cannot pass');
    }
    catch (error) {
        if (code === 0)
            throw error;
        evidence.failure_category = 'runner-or-configuration';
    }

    if (await inputIdentity() !== snapshot.source || await tooling() !== testSource || await assetDigest(snapshot.directory) !== snapshot.assets)
        throw Error('Inputs/assets changed during verification; passing output is not valid evidence');
    evidence.status = code === 0 && !signalReceived ? 'passed' : 'failed';
    process.exitCode = code || Number(signalReceived);
}
catch (error) {
    evidence.status = 'invalid';
    evidence.error = error.message;
    process.exitCode = 1;
    console.error('UI verification invalid: ' + error.message);
}
finally {
    await stop(child);
    await stop(server);
    evidence.total_seconds = (performance.now() - start) / 1000;
    await writeFile(join(directory, 'run.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log('UI run evidence: ' + relative(root, join(directory, 'run.json')));
}
