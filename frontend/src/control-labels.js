/**
 * # Hypergraph PX — Descriptive control-label recognition
 *
 * Distinguish self-describing text controls from abbreviations and glyphs that
 * still need an explanatory tooltip.
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
 * Used by: Shared controls and status, through tooltip installation.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: Normalization applies only to a UI label for classification; it never
 * changes authored document source.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/control-labels.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

/** Recognize labels with descriptive words while leaving terse formatting abbreviations eligible for explanation. */
export function isDescriptiveControlLabel(text){
 const label=String(text??'').normalize('NFKC').replace(/\s+/g,' ').trim();


 if(!label||/^(?:[BIP]|H[1-6]|Aa)$/u.test(label))return false;


 return /\p{L}{2,}/u.test(label);
}
