// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Guarded existing-workspace binary refresh
 *
 * Serialize an explicitly authorized exact-tested-binary handoff while
 * preserving the recorded manual workspace and private locked-session launch
 * shortcuts.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/refresh-manual-runtime.mjs)
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
 * Used by: Guarded integration milestone handoff adapter and explicit developer
 * refresh command.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Security threat model](../../docs/08-assurance/security-threat-model.md)
 *
 * Boundary: A missing or relocated recorded workspace is a blocker. Exact
 * process identity, approved TLS leaf and tested executable hash are required;
 * no trust installation, workspace recreation or force kill occurs.
 */
import { requireCurrentManualRecord } from '../../shared/tooling/manual-record.mjs';

import { cargoExecutable } from '../../shared/tooling/cargo-path.mjs';

// Explicitly authorized handoff of a successfully tested binary to the manual copy.
import { spawn, execFileSync } from 'node:child_process';

import { readFile, writeFile, access, mkdir, chmod, rename, open, unlink } from 'node:fs/promises';

import { resolve, join } from 'node:path';

import { createHash } from 'node:crypto';

import { createServer } from 'node:net';

import https from 'node:https';

const root = resolve(import.meta.dirname, '../..'), artifacts = join(root, '.local/manual-runtime');

const built = cargoExecutable(), cert = join(root, '.local/credentials/tls/localhost.pem'), key = join(root, '.local/credentials/tls/localhost-key.pem');

const record = join(artifacts, 'manual-runtime-session.json'), lockPath = join(artifacts, 'manual-runtime-update.lock');

const argument = /** Read one explicit updater option without inventing a tested fingerprint or verification label. */                name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; };

const digest = /** Hash executable or certificate bytes for exact tested-build and approved-leaf comparisons. */                bytes => createHash('sha256').update(bytes).digest('hex');

const sleep = /** Pause between bounded ownership/readiness probes without busy-waiting. */                ms => new Promise(/** Complete one requested delay through the timer promise. */                resolve => setTimeout(resolve, ms));

const approved = '05865badace97aad0cb8abf4460e12f6a1574b812759780052e8ffb486bf8428';

let lock, runtime;

/** Acquire the exclusive handoff lock with bounded waiting, leaving competing ownership intact on timeout. */
async function acquire() {
    for (let i = 0; i < 120; i++) {
        try {
            const file = await open(lockPath, 'wx', 0o600);

            await file.writeFile(JSON.stringify({ pid: process.pid }));

            return file;
        }
        catch (error) {
            if (error.code !== 'EEXIST')
                throw error;
            await sleep(250);
        }
    }
    throw Error('Another manual-runtime update still owns the handoff lock');
}

/** Probe verified HTTPS readiness without unlocking or establishing a browser session. */
async function alive(origin) {
    const leaf = await readFile(cert);

    return new Promise(/** Observe an authenticated runtime endpoint using the approved certificate and no authority credentials. */                resolve => {
        const request = https.get(origin + '/api/v1/runtime', { ca: leaf, allowPartialTrustChain: true, rejectUnauthorized: true }, /** Drain the probe response and accept only the expected unauthenticated runtime status. */                response => { response.resume(); resolve(response.statusCode === 401); });
        request.setTimeout(3000, /** Abort a readiness probe that exceeds its socket timeout. */ () => request.destroy());
        request.on('error', /** Report a failed HTTPS connection as unavailable rather than disabling verification. */ () => resolve(false));
    });
}

/** Reserve and release an available loopback port, falling back only when the preferred port is occupied. */
async function freePort(preferred) {
    const server = createServer();

    try {
        await new Promise(/** Wait for the candidate port probe to bind or report the listener error. */ (yes, no) => { server.once('error', no); server.listen(preferred ?? 0, '127.0.0.1', yes); });
        const port = server.address().port;

        await new Promise(/** Close the port probe before returning its selected port. */                resolve => server.close(resolve));

        return port;
    }
    catch (error) {
        if (error.code !== 'EADDRINUSE')
            throw error;

        return freePort();
    }
}

/** Compare the complete recorded command line before treating a PID as the owned manual process. */
function ownedProcess(session) {
    const expected = [session.binary ?? built, '--workspace', session.workspace, '--cert', cert, '--key', key, '--port', String(new URL(session.origin).port)].join(' ');
    let command;

    try {
        command = execFileSync('/bin/ps', ['-p', String(session.pid), '-o', 'command='], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    }
    catch {
        return false;
    }

    return command === expected;
}

/** Stop only the exactly identified recorded runtime and wait boundedly without force-killing uncertain ownership. */
async function stopRecorded(session) {
    if (!ownedProcess(session))
        throw Error('Recorded PID does not exactly match the manual runtime; no process was stopped');
    process.kill(session.pid, 'SIGTERM');

    for (let i = 0; i < 100; i++) {
        if (!ownedProcess(session))
            return;
        await sleep(50);
    }
    throw Error('Manual runtime did not exit after SIGTERM; no force kill was used');
}

/** Start the selected immutable executable against the existing workspace and require verified locked HTTPS readiness. */
async function start(binary, workspace, port) {
    const child = spawn(binary, ['--workspace', workspace, '--cert', cert, '--key', key, '--port', String(port)], { detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    runtime = child;
    const launch = await new Promise(/** Wait for the replacement process to emit a complete private launch URL or fail startup. */ (yes, no) => {
        let output = '';
        const timer = setTimeout(/** Reject replacement startup that exceeds its readiness deadline. */ () => no(Error('Manual runtime startup timed out')), 10000);
        child.once('error', /** Cancel readiness timeout and report replacement spawn failure without leaking private tokens. */ () => { clearTimeout(timer); no(Error('Manual runtime failed to start')); });
        child.once('exit', /** Reject a replacement that exits during startup. */ () => { clearTimeout(timer); no(Error('Manual runtime exited during startup')); });
        child.stdout.on('data', /** Accumulate replacement stdout until its complete private HTTPS launch link is available. */                bytes => {
            output += bytes.toString();
            const match = output.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+/);

            if (match) {
                clearTimeout(timer);
                yes(match[0]);
            }
        });
    });

    if (!await alive(new URL(launch).origin))
        throw Error('Replacement manual runtime failed verified HTTPS readiness');

    return { child, launch };
}

/** Atomically replace one private session/shortcut file with owner-only permissions. */
async function privateWrite(path, bytes) {
    const temporary = path + '.pending-' + process.pid;

    await writeFile(temporary, bytes, { mode: 0o600, flag: 'wx' });
    await rename(temporary, path);
    await chmod(path, 0o600);
}

try {
    lock = await acquire();
    const manual = JSON.parse(await readFile(record, 'utf8')), origin = new URL(manual.origin);
    requireCurrentManualRecord(root, manual);
    await access(manual.workspace);
    const expected = argument('--tested-sha');

    if (!/^[a-f0-9]{64}$/.test(expected ?? ''))
        throw Error('Updating requires the successful synthetic test binary SHA-256');
    const bytes = await readFile(built);

    if (digest(bytes) !== expected)
        throw Error('Built binary changed after the successful test; manual runtime was not updated');

    if (digest(execFileSync('/usr/bin/openssl', ['x509', '-in', cert, '-outform', 'DER'])) !== approved)
        throw Error('Local certificate differs from the approved leaf');
    const reachable = await alive(origin.origin);

    if (manual.binary_sha256 === expected && reachable && ownedProcess(manual)) {
        await privateWrite(record, JSON.stringify({ ...manual, verified_by: argument('--verified-by') ?? 'explicit synthetic test', verified_at: new Date().toISOString() }, null, 2));
        console.log('Manual HTTPS runtime already runs the tested build at ' + origin.origin);
    }
    else {
        const folder = join(artifacts, 'manual-runtime-binaries');

        await mkdir(folder, { recursive: true, mode: 0o700 });
        const binary = join(folder, expected);

        try {
            await writeFile(binary, bytes, { flag: 'wx', mode: 0o700 });
        }
        catch (error) {
            if (error.code !== 'EEXIST')
                throw error;
        }

        if (digest(await readFile(binary)) !== expected)
            throw Error('Immutable manual binary snapshot failed verification');

        if (reachable)
            await stopRecorded(manual);
        else if (ownedProcess(manual))
            throw Error('Recorded process is alive but HTTPS is unavailable; it was left untouched');
        const port = await freePort(Number(origin.port)), replacement = await start(binary, manual.workspace, port), launch = replacement.launch;

        await privateWrite(join(artifacts, 'manual-runtime-launch.webloc'), `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>${launch}</string></dict></plist>\n`);
        await privateWrite(join(artifacts, 'manual-runtime-launch.html'), `<!doctype html><meta charset="utf-8"><title>Hypergraph PX private launch</title><h1>Hypergraph PX</h1><p><a rel="noreferrer" href="${launch}">Open the updated local HTTPS workspace</a></p><p>This private link establishes your browser session. Use synthetic documents only.</p>`);
        await privateWrite(record, JSON.stringify({ ...manual, pid: replacement.child.pid, origin: new URL(launch).origin, binary, binary_sha256: expected, verified_by: argument('--verified-by') ?? 'explicit synthetic test', updated: new Date().toISOString(), verified_at: new Date().toISOString() }, null, 2));
        replacement.child.stdout.destroy();
        replacement.child.stderr.destroy();
        replacement.child.unref();
        runtime = null;
        console.log('Manual HTTPS runtime updated to the tested build at ' + new URL(launch).origin);
        console.log('Same workspace preserved; runtime starts locked.');
    }
    console.log('Private launch shortcut: .local/manual-runtime/manual-runtime-launch.webloc');
}
finally {
    if (runtime && runtime.exitCode === null)
        runtime.kill('SIGTERM');

    if (lock) {
        await lock.close();
        await unlink(lockPath);
    }
}
