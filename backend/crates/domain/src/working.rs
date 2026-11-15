// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Exact acknowledged working-source capture
//!
//! Borrow a nonempty passage only from the exact acknowledged owned buffer,
//! with scalar-aligned cuts and an exact quote instead of text search.
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
//! Used by: Private working-checkpoint storage adapter and its capture/recovery tests.
//!
//! Specification:
//! - [Pure-domain responsibilities][domain]
//! - [Exact text and anchors][text]
//! - [Revision and derivation meanings][provenance]
//!
//! Boundary: Equal strings do not authenticate acknowledgement or authority. This helper
//! creates no records or cadence-driven immutable history and does no I/O.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/working.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [text]: ../../../../docs/05-domain/text-and-anchors.md
//! [provenance]: ../../../../docs/05-domain/provenance-model.md
#![deny(missing_docs)]

use crate::records::{RangeError, validate_byte_range};

/// A failed exact-working-source selection, never a guessed fallback.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    /// The owned buffer differs from the supplied acknowledged buffer.
    StaleSource,
    /// This capture requires a nonempty selected passage.
    Empty,
    /// The expected quote differs from this exact range, even if found elsewhere.
    WrongQuote,
    /// Reversed/out-of-bounds UTF8 range or a cut through a scalar.
    Range(RangeError),
}

/// Borrow `[start,end)` from `owned` after exact acknowledgement and quote checks.
/// Coordinates are UTF8 byte offsets in the full original source. Neither newline
/// forms nor Unicode normalization are changed. No operation is persisted here.
///
/// # Errors
/// Returns stale-source first, then invalid bounds, empty selection or wrong quote.
/// The caller must not treat string equality as proof of authority or durability.
pub fn capture<'a>(
    owned: &'a str,
    acknowledged: &str,
    start: usize,
    end: usize,
    quote: &str,
) -> Result<&'a str, Error> {
    // Reject the whole stale mapping before interpreting coordinates; matching
    // a local quote alone cannot establish the acknowledged composition.
    if owned != acknowledged {
        return Err(Error::StaleSource);
    }

    validate_byte_range(owned, start, end).map_err(Error::Range)?;
    if start == end {
        return Err(Error::Empty);
    }

    let passage = &owned[start..end];
    if passage != quote {
        return Err(Error::WrongQuote);
    }

    Ok(passage)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Verify repeated equal passages remain selected by their exact byte cuts
    /// and retain mixed newlines without searching another occurrence.
    #[test]
    fn exact_repeated_passage_keeps_mixed_source_bytes() {
        let text = "A\r\n😀中\rA\r\n😀中";
        assert_eq!(
            capture(text, text, 3, 10, "😀中").unwrap().as_bytes(),
            &text.as_bytes()[3..10]
        );
        // The repeated second passage has its own offsets, not a quote lookup.
        assert_eq!(capture(text, text, 14, 21, "😀中"), Ok("😀中"));
    }

    /// Verify stale full-buffer evidence, wrong quotes, empty selections and
    /// illegal UTF8 ranges are rejected without guessing a replacement.
    #[test]
    fn stale_source_wrong_quote_empty_and_split_scalar_are_rejected() {
        let text = "A😀\r\n";
        assert_eq!(
            capture(text, "B😀\r\n", 1, 5, "😀"),
            Err(Error::StaleSource)
        );
        assert_eq!(capture(text, text, 1, 5, "B"), Err(Error::WrongQuote));
        assert_eq!(capture(text, text, 1, 1, ""), Err(Error::Empty));
        assert!(matches!(
            capture(text, text, 2, 5, "😀"),
            Err(Error::Range(_))
        ));
        assert!(matches!(
            capture(text, text, 5, 1, ""),
            Err(Error::Range(_))
        ));
    }
}
