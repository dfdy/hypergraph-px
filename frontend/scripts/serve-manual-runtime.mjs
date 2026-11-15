/**
 * Hypergraph PX — Guarded legacy manual launcher
 *
 * Require the exact tested fingerprint before delegating legacy startup to the
 * current guarded updater.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/serve-manual-runtime.mjs)
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
 * Used by: Legacy developer convenience entry point.
 *
 * Specification:
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 *
 * Boundary: Never creates or redirects legacy workspace records and never
 * bypasses the tested-binary guard.
 */
if (!process.argv.includes('--tested-sha'))
    throw Error('Use the guarded refresh with --tested-sha after actual verification;legacy workspace records are never recreated or redirected');

await import('./refresh-manual-runtime.mjs');
