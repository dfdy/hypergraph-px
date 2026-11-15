// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Locked runtime browser TLS preflight
 *
 * Start a fresh synthetic runtime and require browser-default certificate
 * verification to reach the authenticated locked-workspace UI.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/check-runtime-tls.mjs)
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
 * Used by: Explicit TLS preflight command and change-sensitive runtime
 * assurance.
 *
 * Specification:
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Security threat model](../../docs/08-assurance/security-threat-model.md)
 *
 * Boundary: Never bypasses certificate warnings, installs trust or unlocks data.
 * Optional handoff remains behind the exact-binary adapter and explicit flag.
 */
import { cargoExecutable } from '../../shared/tooling/cargo-path.mjs';

import { binaryFingerprint, refreshManualRuntime } from './manual-runtime-update.mjs';

import { testBrowser } from './browser-session.mjs';

// TLS preflight only: no trust installation, warning bypass, unlock or real data.
import { spawn } from 'node:child_process';

import { mkdtemp, rm } from 'node:fs/promises';

import { tmpdir } from 'node:os';

import { resolve, join } from 'node:path';

import { createServer } from 'node:net';

import { chromium, webkit } from '@playwright/test';

const engine = process.argv[2] ?? 'chromium';

if (!['chromium', 'webkit'].includes(engine))
    throw Error('Expected browser: chromium or webkit');

const root = resolve(import.meta.dirname, '../..'), temporary = await mkdtemp(join(tmpdir(), 'hpx-tls-preflight-'));

let runtime, browser, passed = false;

const testedSha = await binaryFingerprint();

try {
    const probe = createServer();

    await new Promise(/** Wait for an ephemeral loopback probe listener to reserve a candidate runtime port. */ (yes, no) => { probe.once('error', no); probe.listen(0, '127.0.0.1', yes); });
    const port = probe.address().port;

    await new Promise(/** Close the probe before launching the runtime, propagating listener close failure. */ (yes, no) => probe.close(/** Reject port probe close errors rather than assuming the candidate listener was released. */                error => error ? no(error) : yes()));
    runtime = spawn(cargoExecutable(), ['--workspace', join(temporary, 'synthetic.hpx'), '--create', '--cert', resolve(root, '.local/credentials/tls/localhost.pem'), '--key', resolve(root, '.local/credentials/tls/localhost-key.pem'), '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
    const url = await new Promise(/** Wait for a complete private runtime launch URL while bounding startup and rejecting process failure. */ (yes, no) => {
        let output = '';
        const timer = setTimeout(/** Reject a runtime that never announces TLS readiness before the preflight deadline. */ () => no(Error('Runtime TLS preflight startup timed out')), 10000);
        runtime.once('error', /** Report runtime spawn failure without printing private launch material. */ () => { clearTimeout(timer); no(Error('Runtime binary could not start')); });
        runtime.once('exit', /** Reject an early runtime exit before authenticated browser navigation can begin. */ () => { clearTimeout(timer); no(Error('Runtime TLS preflight exited')); });
        runtime.stdout.on('data', /** Accumulate stdout chunks until the complete private HTTPS launch URL is available. */                bytes => {
            output += bytes.toString();
            const match = output.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=[a-f0-9]+/);

            if (match) {
                clearTimeout(timer);
                yes(match[0]);
            }
        });
    });
    browser = engine === 'chromium' ? await testBrowser() : await webkit.launch({ headless: true });
    const context = browser.contexts()[0] ?? await browser.newContext();
    const page = await context.newPage();

    // Explicitly retain default certificate verification. Never log the launch URL.
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
    }
    catch (error) {
        const code = String(error.message).match(/net::ERR_[A-Z_]+/)?.[0] ?? 'navigation_failed';
        throw Error(`Browser TLS verification did not succeed (${code}). No workspace was unlocked and no trust settings were changed by this preflight.`);
    }

    if (!await page.getByRole('button', { name: 'Create workspace', exact: true }).isVisible())
        throw Error('TLS connected but runtime initialization did not reach the locked workspace');
    passed = true;
    console.log('PASS: ' + engine + ' verified runtime TLS and reached authenticated locked-workspace UI without trust changes or unlock');
}
finally {
    await browser?.close();

    if (runtime?.pid && runtime.exitCode === null) {
        const exited = new Promise(/** Wait for the owned runtime exit before deleting its isolated synthetic workspace. */                resolve => runtime.once('exit', resolve));
        runtime.kill();
        await exited;
    }
    await rm(temporary, { recursive: true, force: true });
}

if (passed && !process.exitCode)
    await refreshManualRuntime(testedSha, 'check-runtime-tls.mjs');
