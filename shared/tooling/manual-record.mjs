/**
 * Hypergraph PX — Existing manual-workspace guard
 *
 * Reject malformed, relocated or missing manual-runtime records before a caller
 * attempts maintenance.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/manual-record.mjs)
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
 * Used by: Guarded manual-runtime maintenance helpers and their isolated process
 * fixtures.
 *
 * Specification:
 * - [Developer launch/build workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Change-sensitive checks and acceptance boundaries](../../docs/09-guides/reference/development-evidence.md)
 *
 * Boundary: Validation never creates, repairs, enrolls or redirects a workspace;
 * a missing recorded workspace remains blocked.
 */
import { resolve, sep } from 'node:path';

import { existsSync } from 'node:fs';

/** Require the recorded synthetic HTTPS loopback process and exact existing workspace path before maintenance. */
export function requireCurrentManualRecord(root, record, { exists = existsSync } = {}) {
    const origin = new URL(record.origin);

    if (record.synthetic !== true || origin.protocol !== 'https:' || origin.hostname !== '127.0.0.1' || !Number.isSafeInteger(record.pid) || record.pid <= 0)
        throw Error('Unexpected manual runtime record');
    const boundary = resolve(root, '.local/workspaces') + sep;

    if (typeof record.workspace !== 'string' || resolve(record.workspace) !== record.workspace || !record.workspace.startsWith(boundary))
        throw Error('Legacy manual workspace identity requires explicit stopped-record migration;no recreation or redirection permitted');

    if (!exists(record.workspace))
        throw Error('Recorded manual workspace is missing;no recreation or redirection permitted');

    return record;
}
