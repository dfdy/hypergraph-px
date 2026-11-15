// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Exact fragments for independent Fork planning
//!
//! Select an exact nonempty retained-source fragment for a distinct output node,
//! without changing source text or treating cross-node derivation as ancestry.
//!
//! Source: [Latest source on GitHub][source]
//!
//! Agent provenance: Agent creation unverified; original creator not recorded.
//! Created: Unknown (not recorded).
//! Creation harness: Unknown (not recorded).
//! Creation model: Unknown (not recorded).
//!
//! Latest editing agent: Codex /root (OpenAI coding agent).
//! Latest editing harness: Codex; version/build: unknown (not exposed).
//! Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
//! Last edited: 2026-11-15 (UTC).
//!
//! Used by: Storage Fork adapter and independent-synthesis planner, with domain tests.
//!
//! Specification:
//! - [Pure-domain responsibilities][domain]
//! - [Exact text and anchors][text]
//! - [Revision and derivation meanings][provenance]
//!
//! Boundary: The caller authenticates retained sources and permissions. This module only
//! validates supplied identity/context/ranges and returns a borrowed fragment.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/fork.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [text]: ../../../../docs/05-domain/text-and-anchors.md
//! [provenance]: ../../../../docs/05-domain/provenance-model.md
#![deny(missing_docs)]

use crate::records::{Anchor, NodeId, OccurrenceId, RangeError, RevisionId, validate_byte_range};

/// Why a fragment cannot be planned without guessing identity or coordinates.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    /// A Fork must create another logical node, rather than revise its source.
    SameIdentity,
    /// The anchor names a different immutable revision from the supplied text.
    WrongRevision,
    /// Equal text or revision is insufficient when its occurrence context differs.
    WrongOccurrence,
    /// This operation requires a nonempty fragment; empty node creation is separate.
    Empty,
    /// The byte range is reversed, out of bounds or splits a UTF8 scalar.
    Range(RangeError),
}

/// Validated input/output identities and the exact borrowed fragment to copy.
/// Persistence and derivation publication are subsequent adapter responsibilities.
#[derive(Debug, PartialEq, Eq)]
pub struct Plan<'a> {
    /// Logical identity of the retained source, not its occurrence identity.
    pub source_node: NodeId,

    /// Distinct logical identity chosen by the caller for the independent output.
    pub output_node: NodeId,

    /// Exact source bytes, including original newline and Unicode forms.
    pub text: &'a str,
}

/// Select an exact fragment without modifying or normalizing the source.
///
/// `revision` and `path` describe the supplied `text`; both must equal the anchor's
/// retained binding. `output_node` must differ from `source_node`. The caller is
/// responsible for authenticating those inputs and authorizing publication.
///
/// # Errors
/// Returns the first identity/context mismatch, invalid UTF8 byte boundary/range,
/// or empty selection. Validation precedes slicing so malformed bounds cannot
/// panic. The returned plan borrows `text` and creates no immutable history.
pub fn plan<'a>(
    source_node: NodeId,
    revision: RevisionId,
    path: &[OccurrenceId],
    text: &'a str,
    anchor: &Anchor,
    output_node: NodeId,
) -> Result<Plan<'a>, Error> {
    if source_node == output_node {
        return Err(Error::SameIdentity);
    }
    if revision != anchor.revision {
        return Err(Error::WrongRevision);
    }
    if path != anchor.occurrence_path {
        return Err(Error::WrongOccurrence);
    }
    // Check scalar-aligned bounds before Rust indexes the string. No quote search
    // or offset correction may silently choose a different fragment.
    validate_byte_range(text, anchor.start_byte, anchor.end_byte).map_err(Error::Range)?;
    if anchor.start_byte == anchor.end_byte {
        return Err(Error::Empty);
    }

    Ok(Plan {
        source_node,
        output_node,
        text: &text[anchor.start_byte..anchor.end_byte],
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Enumerate legal scalar cuts to verify exact mixed-newline and Unicode
    /// fragments are preserved and empty/reversed ranges fail.
    #[test]
    fn all_nonempty_scalar_ranges_preserve_exact_unicode_and_mixed_newline_bytes() {
        let text = "A😀e\u{301}\r\n中\rtail\n";
        let revision = RevisionId([1; 32]);
        let path = [OccurrenceId([2; 32])];
        // Enumerate every scalar boundary, including EOF, so valid mixed-newline
        // and supplementary-character slices are checked without normalizing.
        let boundaries: Vec<_> = text
            .char_indices()
            .map(|(n, _)| n) // Keep each scalar’s exact starting byte offset.
            .chain([text.len()])
            .collect();
        for &start in &boundaries {
            for &end in &boundaries {
                let anchor = Anchor {
                    revision,
                    occurrence_path: path.to_vec(),
                    start_byte: start,
                    end_byte: end,
                };
                let result = plan(
                    NodeId([3; 32]),
                    revision,
                    &path,
                    text,
                    &anchor,
                    NodeId([4; 32]),
                );
                if start < end {
                    assert_eq!(
                        result.unwrap().text.as_bytes(),
                        &text.as_bytes()[start..end]
                    );
                } else {
                    assert!(result.is_err());
                }
            }
        }
    }

    /// Verify independent identity, exact revision/path and scalar-aligned ranges
    /// are required rather than repaired or inferred.
    #[test]
    fn identity_revision_context_and_scalar_errors_are_never_guessed_or_normalized() {
        let text = "A😀B";
        let revision = RevisionId([1; 32]);
        let path = [OccurrenceId([2; 32])];
        let mut anchor = Anchor {
            revision,
            occurrence_path: path.to_vec(),
            start_byte: 1,
            end_byte: 5,
        };
        assert_eq!(
            plan(
                NodeId([3; 32]),
                revision,
                &path,
                text,
                &anchor,
                NodeId([3; 32])
            ),
            Err(Error::SameIdentity)
        );
        assert_eq!(
            plan(
                NodeId([3; 32]),
                RevisionId([9; 32]),
                &path,
                text,
                &anchor,
                NodeId([4; 32])
            ),
            Err(Error::WrongRevision)
        );
        assert_eq!(
            plan(
                NodeId([3; 32]),
                revision,
                &[],
                text,
                &anchor,
                NodeId([4; 32])
            ),
            Err(Error::WrongOccurrence)
        );
        // Byte 2 is inside the emoji, not a valid UTF8 boundary.
        anchor.start_byte = 2;
        assert_eq!(
            plan(
                NodeId([3; 32]),
                revision,
                &path,
                text,
                &anchor,
                NodeId([4; 32])
            ),
            Err(Error::Range(RangeError::SplitScalar))
        );
    }
}
