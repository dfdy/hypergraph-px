/**
 * Hypergraph PX — Isolated browser test configuration
 *
 * Bind Playwright to the headless UI runner-owned loopback URL and unique
 * evidence directory.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/playwright.config.js)
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
 * Used by: Playwright test runner invoked by the isolated UI wrapper.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../docs/09-guides/reference/development-evidence.md)
 * - [Repository development workflow](../docs/09-guides/developers/repository-development.md)
 *
 * Boundary: This configuration refuses an unowned URL/evidence location; preview
 * tests are synthetic and do not authorize runtime handoff.
 */
import { defineConfig } from '@playwright/test';

import { join } from 'node:path';

const directory = process.env.HPX_UI_ARTIFACTS, url = process.env.HPX_UI_BASE_URL;

if (!directory || !/^http:\/\/127\.0\.0\.1:\d+$/.test(url ?? ''))
    throw Error('Use npm run test:ui: it owns fresh assets, an isolated server and unique run artifacts.');

/** Bind headless tests and retained failure evidence to the isolated UI runner-owned origin and artifact directory. */
export default defineConfig({ testDir: 'tests/browser', fullyParallel: false, workers: 1, timeout: 30000, outputDir: join(directory, 'results'), use: { headless: true, baseURL: url, viewport: { width: 1600, height: 1000 }, trace: 'retain-on-failure' }, reporter: [['list'], ['json', { outputFile: join(directory, 'playwright.json') }]] });
