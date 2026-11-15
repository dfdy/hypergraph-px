#!/usr/bin/env node
/**
 * Hypergraph PX — Independent frontend and backend development
 *
 * Supervise separately restartable development process groups and print the
 * fresh private frontend launch URL after verified HTTPS readiness.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/develop.mjs)
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
 * Used by: Developers running the root command in combined or separate
 * frontend/backend terminals.
 *
 * Specification:
 * - [Developer launch/build workflow](docs/09-guides/developers/repository-development.md)
 * - [Browser/runtime authority boundary](docs/06-subsystems/interfaces/browser-runtime.md)
 *
 * Boundary: Existing approved TLS material is required; there is no trust
 * installation, keychain enrollment or guarded manual-workspace handoff. Backend
 * restarts invalidate old launch tokens.
 */
import { spawn } from 'node:child_process';

import { existsSync } from 'node:fs';

import { mkdir, readFile } from 'node:fs/promises';

import path from 'node:path';

import { fileURLToPath } from 'node:url';

import readline from 'node:readline';

import https from 'node:https';

import { StringDecoder } from 'node:string_decoder';

import { terminalLink } from './shared/tooling/development-launch.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));

const opts = { mode: 'both', 'frontend-port': process.env.HPX_FRONTEND_PORT ?? '3000', 'backend-port': process.env.HPX_BACKEND_PORT ?? '8000', workspace: '.local/workspaces/development-script/synthetic.hpx', cert: '.local/credentials/tls/localhost.pem', key: '.local/credentials/tls/localhost-key.pem' };

const args = process.argv.slice(2);

if (args[0] && !args[0].startsWith('-'))
    opts.mode = args.shift();

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help') {
        console.log(`Usage: ./develop.mjs [both|frontend|backend] [options]
  --workspace PATH       Default: .local/workspaces/development-script/synthetic.hpx
  --cert PATH            Existing approved frontend/backend TLS certificate
  --key PATH             Existing private TLS key
  --ca PATH              Backend/frontend CA material; default: --cert
  --frontend-port PORT   Default: 3000 (or HPX_FRONTEND_PORT)
  --backend-port PORT    Default: 8000 (or HPX_BACKEND_PORT)

Default starts two independent process groups and prints the complete private HTTPS
browser launch link once both are ready. Creation/unlock is performed in the browser.

Interactive commands: restart frontend (or f), restart backend (or b), restart both,
stop frontend, stop backend, start frontend, start backend, status, url (or u), quit.
Stopping/restarting one component leaves the other running. No automatic browser reload.
Use frontend/backend modes in separate terminals if preferred; backend mode prints
the private frontend URL. No trust installation, keychain enrollment or manual handoff.`);
        process.exit(0);
    }
    const key = args[i].replace(/^--/, '');

    if (!['workspace', 'cert', 'key', 'ca', 'frontend-port', 'backend-port'].includes(key) || !args[i + 1] || args[i + 1].startsWith('--'))
        throw Error('Unknown/missing option: ' + args[i]);
    opts[key] = args[++i];
}

if (!['both', 'frontend', 'backend'].includes(opts.mode))
    throw Error('Expected both, frontend or backend');

for (const key of ['frontend-port', 'backend-port']) {
    const n = Number(opts[key]);

    if (!Number.isInteger(n) || n < 1024 || n > 65535)
        throw Error(key + ' must be an integer from 1024 through 65535');
    opts[key] = String(n);
}

if (opts['frontend-port'] === opts['backend-port'])
    throw Error('Frontend/backend ports must differ');

if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0')
    throw Error('TLS verification must not be disabled');

for (const key of ['workspace', 'cert', 'key'])
    opts[key] = path.resolve(root, opts[key]);

opts.ca = path.resolve(root, opts.ca ?? opts.cert);

for (const key of ['cert', 'key', 'ca'])
    if (!existsSync(opts[key]))
        throw Error('Missing ' + key + ' file: ' + opts[key] + '. Supply existing approved TLS material; this script does not create or install trust.');

if (opts.workspace.startsWith(path.join(root, '.local/manual-runtime') + path.sep))
    throw Error('Use a separate development workspace, not the guarded manual-runtime directory');

if (!existsSync(path.join(root, 'frontend/node_modules')) && opts.mode !== 'backend')
    throw Error('Frontend dependencies are missing: npm --prefix frontend ci --ignore-scripts');

await mkdir(path.dirname(opts.workspace), { recursive: true });

const ca = await readFile(opts.ca);

let token = null, stopping = false, queue = Promise.resolve(), checking = false;

const components = { frontend: { child: null, ready: false, generation: 0 }, backend: { child: null, ready: false, generation: 0 } };

const frontendOrigin = 'https://127.0.0.1:' + opts['frontend-port'];

/** Return a private frontend launch URL only when a fresh backend token is present. */
function url() { return token ? frontendOrigin + '/#launch=' + token : null; }

/** Display the current launch URL or explain that a fresh token/frontend is still needed. */
function showURL() { const value = url(); if (value) {
    console.log('\nDevelopment launch (private): ' + terminalLink(value));

    if (!components.frontend.ready)
        console.log('Start the independent frontend before opening this URL.');
}
else
    console.log('Waiting for a fresh backend launch token.'); }

/** Report each independently owned process state without changing either component. */
function status() { for (const [name, c] of Object.entries(components))
    console.log(name + ': ' + (c.child ? (c.ready ? 'ready' : 'starting') : 'stopped')); }

/** Publish the launch URL only after authenticated frontend readiness still matches the same process generation and token. */
async function publish() {
    if (checking || !token || !components.frontend.ready || !components.backend.ready)
        return;
    checking = true;
    const value = url(), generation = components.frontend.generation;

    try {
        await new Promise(/** Perform a bounded verified HTTPS request before declaring the frontend reachable. */ (yes, no) => {
            const req = https.get(frontendOrigin + '/', { ca, rejectUnauthorized: true, allowPartialTrustChain: true, timeout: 5000 }, /** Drain the readiness response and wait for complete delivery before assessing status. */  res => {
                res.resume();
                res.once('end', /** Accept readiness only for a completed HTTP200 response. */ () => res.statusCode === 200 ? yes() : no(Error('Frontend returned HTTP ' + res.statusCode)));
            });
            req.once('error', no);
            req.once('timeout', /** Abort a readiness request that exceeds its explicit timeout. */ () => req.destroy(Error('Frontend readiness timed out')));
        });

        if (!stopping && components.frontend.ready && components.backend.ready && value === url() && generation === components.frontend.generation)
            showURL();
    }
    catch (error) {
        console.error('Verified frontend readiness failed: ' + error.message);
    }
    finally {
        checking = false;

        if ((value !== url() || generation !== components.frontend.generation) && token && components.frontend.ready && components.backend.ready)
            void publish();
    }
}

/** Process one complete child line, recognising fresh launch tokens and frontend readiness separately. */
function line(name, text) {
    const c = components[name];

    if (name === 'backend') {
        const match = text.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=([a-f0-9]+)(?=\s|$)/);

        if (match) {
            token = match[1];
            c.ready = true;

            if (opts.mode === 'backend')
                showURL();
            else
                void publish();

            return;
        }

        if (text.startsWith('Open this frontend URL once'))
            return;
    }

    if (name === 'frontend' && text.includes('HPX frontend: ' + frontendOrigin)) {
        c.ready = true;
        void publish();
    }
    process.stdout.write('[' + name + '] ' + text + '\n');
}

/** Start one independent component generation without restarting an already-running sibling. */
function start(name) {
    const c = components[name];

    if (c.child) {
        console.log(name + ' is already running.');

        return;
    }
    c.ready = false;
    c.generation++;

    if (name === 'backend')
        token = null;
    const params = ['shared/tooling/hpx.mjs', name, '--frontend-port', opts['frontend-port'], '--backend-port', opts['backend-port'], '--cert', opts.cert, '--key', opts.key];

    if (name === 'backend') {
        params.push('--workspace', opts.workspace);

        if (!existsSync(opts.workspace))
            params.push('--create');
    }
    else
        params.push('--backend', 'https://127.0.0.1:' + opts['backend-port'], '--ca', opts.ca);
    const child = spawn(process.execPath, params, { cwd: root, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    c.child = child;

    for (const stream of [child.stdout, child.stderr]) {
        const decoder = new StringDecoder('utf8');
        let pending = '';
        stream.on('data', /** Accumulate UTF8 child output into complete lines, ignoring output from an obsolete process generation. */  chunk => { if (c.child !== child)
            return; pending += decoder.write(chunk); let end; while ((end = pending.indexOf('\n')) >= 0) {
            line(name, pending.slice(0, end).replace(/\r$/, ''));
            pending = pending.slice(end + 1);
        } });
        stream.once('end', /** Flush the last partial line only if this child still owns the component generation. */ () => { if (c.child !== child)
            return; pending += decoder.end(); if (pending)
            line(name, pending); });
    }
    child.once('error', /** Clear failed child readiness/token state and report its spawn error. */  e => { if (c.child === child) {
        c.child = null;
        c.ready = false;

        if (name === 'backend')
            token = null;
    } console.error(name + ' failed: ' + e.message); });
    child.once('exit', /** Clear the exited child state while leaving the other component running. */ (code, signal) => { if (c.child !== child)
        return; c.child = null; c.ready = false; if (name === 'backend')
        token = null; if (!stopping)
        console.log(name + ' stopped (' + (signal ?? code) + '). The other component is unchanged. Use "start ' + name + '" or "restart ' + name + '".'); });
    console.log('Starting ' + name + '…');
}

/** Stop one owned process group, escalating only that component after its grace period. */
async function stop(name) {
    const c = components[name], child = c.child;

    if (!child)
        return;
    c.ready = false;

    if (name === 'backend')
        token = null;
    const kill = /** Deliver a signal to the owned process group while tolerating an already-exited group. */  signal => { try {
        if (process.platform === 'win32')
            child.kill(signal);
        else
            process.kill(-child.pid, signal);
    }
    catch (error) {
        if (error.code !== 'ESRCH')
            throw error;
    } };
    const exited = new Promise(/** Observe this component exit before completing its stop operation. */  resolve => child.once('exit', resolve));
    kill('SIGTERM');
    const timer = setTimeout(/** Force-stop only this component if graceful shutdown has not completed. */ () => kill('SIGKILL'), 5000);
    timer.unref();
    await exited;
    clearTimeout(timer);
}

const input = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY });

/** Shut down both owned components once and close the command interface. */
async function shutdown() { if (stopping)
    return; stopping = true; input.close(); await Promise.all(Object.keys(components).map(stop)); }

/** Handle one explicit developer command with serialized independent start/stop/restart semantics. */
async function command(text) {
    const parts = text.trim().toLowerCase().split(/\s+/);
    let action = parts[0], target = parts[1];

    if (!action)
        return;

    if (action === 'f') {
        action = 'restart';
        target = 'frontend';
    }

    if (action === 'b') {
        action = 'restart';
        target = 'backend';
    }

    if (action === 'u' || action === 'url') {
        showURL();

        return;
    }

    if (action === 'status') {
        status();

        return;
    }

    if (['q', 'quit', 'exit'].includes(action)) {
        await shutdown();

        return;
    }

    if (action === 'help') {
        console.log('restart frontend | restart backend | restart both | stop/start frontend/backend | status | url | quit');

        return;
    }

    if (!['start', 'stop', 'restart'].includes(action) || !['frontend', 'backend', 'both'].includes(target)) {
        console.log('Unknown command. Type help.');

        return;
    }

    for (const name of target === 'both' ? ['frontend', 'backend'] : [target]) {
        if (action !== 'start')
            await stop(name);

        if (action !== 'stop')
            start(name);
    }
}

input.on('line', /** Queue terminal commands so overlapping restarts cannot race one another. */  text => {
    queue = queue.then(/** Run the next parsed command only after the previous queued command settles. */ () => command(text)).catch(/** Report a failed interactive command without replacing process state with a success claim. */  e => console.error(e.message));
});

for (const signal of ['SIGINT', 'SIGTERM'])
    process.once(signal, /** Route terminal termination signals through owned-component shutdown. */ () => void shutdown());

console.log('Development workspace: ' + opts.workspace);

console.log('Create/unlock with a passphrase in the browser. Wait for saved acknowledgements and Lock before restarting the backend.');

console.log('Commands: f = restart frontend, b = restart backend, u = private URL, status, quit.');

if (opts.mode !== 'backend')
    start('frontend');

if (opts.mode !== 'frontend')
    start('backend');
