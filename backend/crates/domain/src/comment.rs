// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Exact retained-passage comment planning
//!
//! Validate an exact retained passage and nonempty comment body so the storage
//! adapter can publish a comment without text search or source normalization.
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
//! Used by: Storage passage-comment adapter and its exact-source/domain test suite.
//!
//! Specification:
//! - [Pure-domain responsibilities][domain]
//! - [Exact text and anchors][text]
//! - [Revision and derivation meanings][provenance]
//!
//! Boundary: The caller authenticates retained source and authority. Body whitespace is
//! tested for emptiness but preserved; a comment is not proof of its contents.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/comment.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [text]: ../../../../docs/05-domain/text-and-anchors.md
//! [provenance]: ../../../../docs/05-domain/provenance-model.md
#![deny(missing_docs)]

use crate::records::{Anchor, OccurrenceId, RangeError, RevisionId, validate_byte_range};

/// Maximum UTF8 byte length for one comment body in this bounded implementation.
pub const MAX_BODY_BYTES: usize = 16 * 1024;
/// Why a passage/body cannot be accepted under the supplied exact binding.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    /// The anchor names a different retained revision.
    WrongRevision,
    /// The complete occurrence path differs, even if quoted text is identical.
    WrongOccurrence,
    /// The selected passage is empty; this operation requires retained text.
    EmptyPassage,
    /// The supplied quote does not equal the exact selected source bytes.
    WrongQuote,
    /// The body contains only whitespace; it cannot stand in for a comment.
    EmptyBody,
    /// The body exceeds the bounded UTF8 byte allowance.
    Limit,
    /// Invalid byte bounds or a range splitting a UTF8 scalar.
    Range(RangeError),
}

/// Borrowed, validated content for subsequent authorized adapter publication.
#[derive(Debug, PartialEq, Eq)]
pub struct Plan<'a> {
    /// Exact selected passage; repeated equal text elsewhere is not substituted.
    pub passage: &'a str,

    /// Original body, retaining leading/trailing spaces and mixed newline forms.
    pub body: &'a str,
}

/// Validate a comment against the exact supplied revision, path and full text.
/// `anchor` uses UTF8 bytes in `text`; `quote` must equal that range. Whitespace
/// trimming tests body emptiness only and never modifies the returned body.
///
/// # Errors
/// Reject mismatched historical context before reading a slice, then reject bad
/// scalar bounds, an empty passage, a wrong quote or an empty/oversized body.
/// Authentication and current disclosure/write authority remain caller duties.
pub fn plan<'a>(
    revision: RevisionId,
    path: &[OccurrenceId],
    text: &'a str,
    anchor: &Anchor,
    quote: &str,
    body: &'a str,
) -> Result<Plan<'a>, Error> {
    if revision != anchor.revision {
        return Err(Error::WrongRevision);
    }
    if path != anchor.occurrence_path {
        return Err(Error::WrongOccurrence);
    }
    validate_byte_range(text, anchor.start_byte, anchor.end_byte).map_err(Error::Range)?;
    if anchor.start_byte == anchor.end_byte {
        return Err(Error::EmptyPassage);
    }
    // Bounds were checked first: slicing cannot silently round a split scalar
    // or search for a similar quote in another occurrence.
    let passage = &text[anchor.start_byte..anchor.end_byte];
    if passage != quote {
        return Err(Error::WrongQuote);
    }
    if body.trim().is_empty() {
        return Err(Error::EmptyBody);
    }
    if body.len() > MAX_BODY_BYTES {
        return Err(Error::Limit);
    }

    Ok(Plan { passage, body })
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Build the exact retained revision/occurrence and byte cuts shared by
    /// comment tests, including the first repeated Unicode passage.
    fn anchor() -> Anchor {
        Anchor {
            revision: RevisionId([1; 32]),
            occurrence_path: vec![OccurrenceId([2; 32])],
            start_byte: 3,
            end_byte: 10,
        }
    }

    /// Verify repeated text uses exact occurrence/range and preserves passage
    /// and comment-body whitespace, Unicode and mixed newlines.
    #[test]
    fn exact_repeated_passage_and_comment_bytes_are_preserved() {
        let a = anchor();
        let text = "A\r\n😀中\rA\r\n😀中";
        // Preserve intentional spacing and mixed source newlines despite the
        // separate whitespace-only rejection rule.
        let body = "  Consider e\u{301}😀\r\nAnother thought\r\n  ";
        let p = plan(a.revision, &a.occurrence_path, text, &a, "😀中", body).unwrap();
        assert_eq!(p.passage.as_bytes(), &text.as_bytes()[3..10]);
        assert_eq!(p.body.as_bytes(), body.as_bytes());
    }

    /// Verify mismatched revision/path, incorrect quotes, invalid scalar cuts
    /// and empty/oversized bodies do not produce a valid comment plan.
    #[test]
    fn stale_wrong_quote_split_scalar_and_empty_requests_fail() {
        let a = anchor();
        let text = "A\r\n😀中\rA\r\n😀中";
        assert_eq!(
            plan(
                RevisionId([9; 32]),
                &a.occurrence_path,
                text,
                &a,
                "😀中",
                "Comment"
            ),
            Err(Error::WrongRevision)
        );
        assert_eq!(
            plan(a.revision, &[], text, &a, "😀中", "Comment"),
            Err(Error::WrongOccurrence)
        );
        assert_eq!(
            plan(a.revision, &a.occurrence_path, text, &a, "Other", "Comment"),
            Err(Error::WrongQuote)
        );
        assert_eq!(
            plan(a.revision, &a.occurrence_path, text, &a, "😀中", " \r\n\t"),
            Err(Error::EmptyBody)
        );
        let mut split = a.clone();
        split.start_byte += 1;
        assert!(matches!(
            plan(
                a.revision,
                &a.occurrence_path,
                text,
                &split,
                "😀中",
                "Comment"
            ),
            Err(Error::Range(_))
        ));
        split.start_byte = split.end_byte;
        assert_eq!(
            plan(a.revision, &a.occurrence_path, text, &split, "", "Comment"),
            Err(Error::EmptyPassage)
        );
    }

    /// Verify the body allowance counts UTF8 bytes, accepting the exact limit
    /// and rejecting one additional byte without changing source text.
    #[test]
    fn body_budget_counts_utf8_bytes_without_normalization() {
        let a = anchor();
        let text = "A\r\n😀中";
        let body = "😀".repeat(MAX_BODY_BYTES / 4);
        assert!(plan(a.revision, &a.occurrence_path, text, &a, "😀中", &body).is_ok());
        assert_eq!(
            plan(
                a.revision,
                &a.occurrence_path,
                text,
                &a,
                "😀中",
                &(body + "a")
            ),
            Err(Error::Limit)
        );
    }
}
