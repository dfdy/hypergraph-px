// SPDX-License-Identifier: AGPL-3.0-only
/**
 * # Hypergraph PX — Displayed executable build identity
 *
 * Read the public build-version resource and update the workspace footer when its
 * format is supported.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root/frontend_comments.
 * Latest editing harness: Codex; version/build: unknown.
 * Latest editing model: OpenAI; exact model identifier/revision: unknown.
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Shared controls and status in the application shell.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: This display value identifies the executable build, not a workspace
 * schema, receipt or authenticated data format. A failed request leaves the static
 * preview label intact.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/build-version.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

/** Display a supported four-part build version without allowing a failed resource request to interrupt the editor. */
export async function showBuildVersion(){
 const label=document.getElementById('buildVersion');

 if(!label)return;


 try{const response=await fetch('/build-version.json',{cache:'no-store',credentials:'same-origin'});

  if(!response.ok)return;

  const value=await response.json();

  if(typeof value?.version==='string'&&/^\d+\.\d+\.\d+\.\d+$/.test(value.version))label.textContent='v'+value.version;}catch{/* The static preview label remains available if the request fails. */}
}
