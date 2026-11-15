/**
 * Hypergraph PX — Synthetic desktop documentation screenshot
 *
 * Build and serve the static synthetic frontend in an owned headless browser,
 * then capture the desktop documentation preview.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/capture-readme.mjs)
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
 * Used by: Explicit README screenshot maintenance command.
 *
 * Specification:
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 *
 * Boundary: Never attaches to a personal browser or captures workspace data.
 * Screenshot refresh changes a documentation asset and is not executed during
 * comment review.
 */
import { spawn, execFileSync } from 'node:child_process';

import { fileURLToPath } from 'node:url';

import { testBrowser } from './browser-session.mjs';

const frontend = fileURLToPath(new URL('../', import.meta.url));

const output = fileURLToPath(new URL('../../docs/09-guides/assets/desktop-preview.png', import.meta.url));

execFileSync(process.execPath, ['build.mjs'], { cwd: frontend, stdio: 'inherit' });

const server = spawn(process.execPath, ['server.mjs'], {
    cwd: frontend, env: { ...process.env, HYPERGRAPH_PREVIEW_PORT: '5193' }, stdio: ['ignore', 'pipe', 'pipe']
});

let browser;

try {
    await new Promise(/** Wait for the owned screenshot preview to announce readiness, retaining startup diagnostics on failure. */ (resolve, reject) => {
        let diagnostic = '';
        const timeout = setTimeout(/** Reject screenshot preview startup that exceeds the readiness deadline. */ () => reject(new Error('Screenshot preview startup timed out')), 15000);
        const finish = /** Cancel readiness timeout and resolve success or propagate the supplied startup error. */                error => { clearTimeout(timeout); error ? reject(error) : resolve(); };
        server.once('error', finish);
        server.once('exit', /** Report a preview that exits before readiness with its captured diagnostic. */                code => finish(new Error(`Screenshot preview exited (${code}): ${diagnostic}`)));
        server.stderr.on('data', /** Accumulate preview stderr for a startup failure explanation. */                chunk => { diagnostic += chunk; });
        server.stdout.on('data', /** Recognize the configured loopback readiness announcement before opening the browser. */                chunk => {
            if (String(chunk).includes('http://127.0.0.1:5193'))
                finish();
        });
    });
    browser = await testBrowser();
    const page = await browser.contexts()[0].newPage();

    await page.bringToFront();
    await page.setViewportSize({ width: 1600, height: 1000 });
    const errors = [];
    page.on('pageerror', /** Retain browser page errors so a broken render cannot silently replace the screenshot. */                error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5193/', { waitUntil: 'networkidle' });
    await page.getByRole('textbox', { name: 'Markdown document editor' }).waitFor();
    await page.evaluate(/** Wait for fonts and two animation frames before checking capture geometry. */ async () => {
        await document.fonts.ready;
        await new Promise(/** Wait across two animation frames so layout and paint can settle before capture. */                resolve => requestAnimationFrame(/** Advance the second animation-frame wait before resolving capture readiness. */ () => requestAnimationFrame(resolve)));
    });

    if (errors.length)
        throw new Error(errors.join('\n'));

    if (await page.evaluate(/** Detect horizontal document overflow at the target desktop screenshot width. */ () => document.documentElement.scrollWidth > innerWidth))
        throw new Error('Preview overflows screenshot viewport');
    await page.screenshot({ path: output, animations: 'disabled' });
    console.log(`Updated ${output} (1600 × 1000, synthetic data).`);
}
finally {
    await browser?.close();
    server.kill();
}
