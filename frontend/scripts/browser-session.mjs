// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Headless test browser ownership
 *
 * Create an isolated headless Chromium instance for test workflows without
 * touching the owner browser profile.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/browser-session.mjs)
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
 * Used by: Frontend workflow tests and screenshot/evidence tools.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 *
 * Boundary: Callers own browser cleanup; launch neither attaches to a personal
 * browser nor installs certificate trust.
 */
import { chromium } from '@playwright/test';

/** Launch a fresh headless Chromium process and initial context for the calling isolated test workflow. */
export async function testBrowser() {
    const browser = await chromium.launch({ headless: true });

    await browser.newContext();

    return browser;
}
