// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Explicit development runtime signing command
 *
 * Select the requested or Cargo-resolved binary and delegate to pinned
 * local-development signing verification.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/sign-development-runtime.mjs)
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
 * Used by: Explicit developer signing package command.
 *
 * Specification:
 * - [Dedicated development signing policy](../../docs/04-architecture/decisions/0016-local-development-signing.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 *
 * Boundary: This command mutates a binary signature and must only run with
 * separate signing authorization; documentation review does not run it.
 */
import { cargoExecutable } from '../../shared/tooling/cargo-path.mjs';

import { resolve } from 'node:path';

import { signDevelopmentBinary } from './development-signing.mjs';

const binary = process.argv[2] ? resolve(process.argv[2]) : cargoExecutable();

await signDevelopmentBinary(binary);

console.log('Signed and verified the dedicated Hypergraph local-development identity.');
