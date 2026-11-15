/**
 * Hypergraph PX — Independent development lifecycle checks
 *
 * Exercise mock, connected and combined CLI lifecycles with isolated synthetic
 * data and owned headless browsers/processes.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/check-development.mjs)
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
 * Used by: Development CLI regression command and assurance workflow.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 *
 * Boundary: Uses existing TLS credentials without installing trust; synthetic
 * workspaces stay isolated and the manual workspace is never accessed.
 */
import { spawn } from 'node:child_process';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';

import { createServer, connect } from 'node:net';

import { resolve, join } from 'node:path';

import { expect } from '@playwright/test';

import { testBrowser } from './browser-session.mjs';

const root = resolve(import.meta.dirname, '../..'), directory = await mkdtemp(join(root, '.local/artifacts/development-cli-'));

const children = new Set(), checks = [];

let browser;

/** Obtain an ephemeral loopback port and release its probe listener before launching the tested command. */
async function freePort() {
    const server = createServer();

    await new Promise(/** Wait for the ephemeral listener to bind or reject a port allocation error. */ (yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
    const port = server.address().port;

    await new Promise(/** Wait until the port probe closes before returning the selected port. */                yes => server.close(yes));

    return String(port);
}

/** Spawn one root development command and capture both output streams for readiness assertions. */
function start(mode, args = []) {
    const child = spawn(process.execPath, ['shared/tooling/hpx.mjs', mode, ...args], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    children.add(child);
    child.output = '';

    for (const stream of [child.stdout, child.stderr])
        stream.on('data', /** Append each child output chunk to the readiness buffer without interpreting private capabilities. */                data => { child.output += data; });

    return child;
}

/** Wait for the requested readiness line and reject early child exit. */
async function ready(child, pattern) {
    await expect.poll(/** Check both process liveness and the readiness pattern during bounded polling. */ () => {
        if (child.exitCode !== null || child.signalCode !== null)
            throw Error('Development child exited before ready');

        return pattern.test(child.output);
    }, { timeout: 120000 }).toBe(true);

    return child.output.match(pattern)[1];
}

/** Terminate an owned supervisor, require bounded exit and remove it from cleanup tracking. */
async function stop(child) {
    if (child.exitCode === null && child.signalCode === null) {
        const ended = new Promise(/** Resolve only once the supervisor exit is observed. */                yes => child.once('exit', yes));
        child.kill('SIGTERM');
        await Promise.race([ended, new Promise(/** Create the bounded stop failure path without holding the process open solely for its timer. */ (_, no) => {
                const timer = setTimeout(/** Reject a supervisor that survives its termination deadline. */ () => no(Error('Development supervisor did not stop')), 10000);
                timer.unref();
            })]);
    }
    children.delete(child);
}

/** Require the previously owned loopback port to stop accepting connections after shutdown. */
async function closed(port) {
    await expect.poll(/** Retry a fresh connection probe until the former listener is unavailable. */ () => new Promise(/** Observe whether the probed port accepts a connection or refuses it. */                yes => {
        const socket = connect({ host: '127.0.0.1', port: Number(port) });
        socket.once('connect', /** Close a successfully connected probe and report that the listener is still alive. */ () => { socket.destroy(); yes(false); });
        socket.once('error', /** Report a failed connection probe as evidence the listener has closed. */ () => yes(true));
    })).toBe(true);
}

const cert = resolve(root, '.local/credentials/tls/localhost.pem'), key = resolve(root, '.local/credentials/tls/localhost-key.pem');

const tls = ['--cert', cert, '--key', key], trust = [...tls, '--ca', cert];

try {
    browser = await testBrowser();
    const page = await browser.contexts()[0].newPage();
    const frontendPort = await freePort(), backendPort = await freePort();

    for (let i = 0; i < 2; i++) {
        const mock = start('frontend', ['--mock', '--frontend-port', frontendPort]);
        const url = await ready(mock, /HPX frontend: (http:\/\/127\.0\.0\.1:\d+)/);

        await page.goto(url);
        await expect(page.locator('.cm-editor')).toBeVisible();
        expect(await page.evaluate(/** Ask the mock browser origin for runtime API availability without adding authority. */ () => fetch('/api/v1/runtime').then(/** Extract the HTTP status so the fixture can assert mock API denial. */                r => r.status))).toBe(503);
        await stop(mock);
        await closed(frontendPort);
    }
    checks.push('root mock command starts/restarts independently, renders editor, denies persistent API and closes its port');
    const workspace = join(directory, 'independent.hpx');
    let backend = start('backend', ['--workspace', workspace, '--create', '--backend-port', backendPort, ...tls]);
    let launch = await ready(backend, /(https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+)/);
    let frontend = start('frontend', ['--frontend-port', frontendPort, '--backend', 'https://127.0.0.1:' + backendPort, ...trust]);
    const url = await ready(frontend, /HPX frontend: (https:\/\/127\.0\.0\.1:\d+)/);

    await page.goto(url + '/' + new URL(launch).hash);
    await expect(page.getByRole('button', { name: 'Create workspace', exact: true })).toBeVisible();
    await page.getByLabel('Workspace passphrase', { exact: true }).fill('SYNTHETIC-CLI-lifecycle-only-2026');
    await page.getByRole('button', { name: 'Create workspace', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Create document', exact: true })).toBeVisible({ timeout: 15000 });
    await stop(frontend);
    await closed(frontendPort);
    expect(backend.exitCode).toBe(null);
    frontend = start('frontend', ['--frontend-port', frontendPort, '--backend', 'https://127.0.0.1:' + backendPort, ...trust]);
    await ready(frontend, /HPX frontend: (https:\/\/127\.0\.0\.1:\d+)/);
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Create document', exact: true })).toBeVisible();
    checks.push('connected frontend independently restarts while authenticated backend and synthetic workspace stay alive');
    await stop(backend);
    backend = start('backend', ['--workspace', workspace, '--backend-port', backendPort, ...tls]);
    launch = await ready(backend, /(https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+)/);
    await page.goto('about:blank');
    await page.goto(url + '/' + new URL(launch).hash);
    await expect(page.getByRole('button', { name: 'Unlock workspace', exact: true })).toBeVisible();
    expect(frontend.exitCode).toBe(null);
    checks.push('backend independently restarts locked while frontend remains alive; launch/session and unlock remain separate');
    await stop(frontend);
    await stop(backend);
    await closed(frontendPort);
    await closed(backendPort);
    const combined = start('dev', ['--workspace', join(directory, 'combined.hpx'), '--create', '--frontend-port', frontendPort, '--backend-port', backendPort, ...trust]);
    launch = await ready(combined, /(?:Development launch \(private\): )(https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+)/);
    await ready(combined, /HPX frontend: (https:\/\/127\.0\.0\.1:\d+)/);
    await page.goto('about:blank');
    await page.goto(launch);
    await expect(page.getByRole('button', { name: 'Create workspace', exact: true })).toBeVisible();
    await stop(combined);
    await closed(frontendPort);
    await closed(backendPort);
    checks.push('combined command starts two configured origins, translates launch capability and terminates both children');
    await writeFile(join(root, '.local/artifacts/reorganisation-development-cli.json'), JSON.stringify({ status: 'passed', checks, synthetic: true }, null, 2) + '\n');
    console.log('PASS: ' + checks.length + ' development CLI lifecycle checks');
}
finally {
    await browser?.close();

    for (const child of children)
        await stop(child);
    await rm(directory, { recursive: true, force: true });
}
