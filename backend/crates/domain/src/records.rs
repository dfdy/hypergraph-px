// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Typed identities and exact source coordinates
//!
//! Keep logical identities distinct in the type system and validate historical
//! source ranges without changing source text or choosing another occurrence.
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
//! Used by: Pure Fork, synthesis, working-source and annotation planners; parent-Merge
//! planning; storage codecs and adapters that carry these domain identities.
//!
//! Specification:
//! - [Exact domain responsibilities][domain]
//! - [Identity meanings][identity]
//! - [Source and coordinate contract][text]
//!
//! Boundary: Identity bytes are supplied by adapters, not generated or authenticated here.
//! The UTF16 conversion helper has tests but no production caller in this slice.
//! Scalar-aligned cuts do not establish grapheme boundaries or relocation after edits.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/records.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [identity]: ../../../../docs/05-domain/core-object-model.md
//! [text]: ../../../../docs/05-domain/text-and-anchors.md

// Emit distinct opaque 32-byte wrappers with identical comparison behaviour.
// Different wrapper types cannot be substituted merely because bytes are equal;
// entropy, wire encoding and validation remain adapter responsibilities.
macro_rules! ids {
    ($($name:ident),+ $(,)?) => {$(
        #[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
        pub struct $name(pub [u8; 32]);
    )+};
}
ids!(
    // A document identity, distinct from the contained node and its revisions.
    DocumentId,
    // Logical content identity; multiple occurrences can refer to the same node.
    NodeId,
    // One retained immutable version, not a mutable head pointer.
    RevisionId,
    // A named branch identity; naming does not select the latest revision.
    BranchId,
    // A composition/selection manifest identity, not proof of complete closure.
    ManifestId,
    // A placement occurrence within a contextual path, not the content identity.
    OccurrenceId,
    // One retained closed-selection context, independent of later heads.
    SnapshotId,
    // A caller operation identity used by adapters for outcome reconciliation.
    OperationId,
    // A mutable working-source record identity, not a committed revision.
    DraftId,
    // A retained private working checkpoint, not automatic public Commit.
    CheckpointId,
    // An acting principal identity; identity itself grants no permission.
    PrincipalId,
    // A recorded device identity, not proof of device authentication.
    DeviceId,
    // A group identity; permission interpretation remains outside the domain.
    GroupId,
    // An independently identified relationship, not an endpoint pair shortcut.
    RelationshipId,
    // A cross-identity derivation event, distinct from same-node ancestry.
    TransformationId
);

/// Historical anchor; not an automatic promise of relocation after an edit.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Anchor {
    /// Exact retained revision against which the anchor is interpreted.
    pub revision: RevisionId,

    /// Full placement context; repeated equal source text does not identify it.
    pub occurrence_path: Vec<OccurrenceId>,

    /// Inclusive UTF8 byte offset in the exact full revision source.
    pub start_byte: usize,

    /// Exclusive UTF8 byte offset; equal endpoints are a valid empty byte range.
    pub end_byte: usize,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
/// A coordinate cannot be used safely against the supplied exact text.
pub enum RangeError {
    /// The requested UTF16 offset or UTF8 end exceeds this buffer.
    Outside,
    /// A UTF16 cut splits a surrogate pair, or a byte cut splits a UTF8 scalar.
    SplitScalar,
    /// The start byte is greater than the end byte.
    Reversed,
}

/// Convert an exact browser UTF-16 offset to a Rust UTF-8 byte boundary.
/// Does not normalize source or snap a split surrogate to a nearby boundary.
pub fn utf16_to_byte(text: &str, offset: usize) -> Result<usize, RangeError> {
    // Walk original Unicode scalars: byte indices and accumulated UTF16 units
    // refer to this exact source, including every CR and LF code unit.
    let mut units = 0;
    for (byte, ch) in text.char_indices() {
        if units == offset {
            return Ok(byte);
        }
        units += ch.len_utf16();
        if units > offset {
            return Err(RangeError::SplitScalar);
        }
    }

    // EOF is a valid cut, including offset zero in an empty buffer.
    if units == offset {
        Ok(text.len())
    } else {
        Err(RangeError::Outside)
    }
}

/// Validate ordered, bounded, scalar-aligned UTF8 cuts without slicing or repair.
/// Empty ranges are allowed; callers requiring content must reject them separately.
/// Returns Reversed before Outside, then SplitScalar. No text is normalized.
pub fn validate_byte_range(text: &str, start: usize, end: usize) -> Result<(), RangeError> {
    if start > end {
        return Err(RangeError::Reversed);
    }
    if end > text.len() {
        return Err(RangeError::Outside);
    }
    if !text.is_char_boundary(start) || !text.is_char_boundary(end) {
        return Err(RangeError::SplitScalar);
    }
    Ok(())
}

#[derive(Clone, Debug, PartialEq, Eq)]
/// One occurrence-to-node/revision selection; this record alone does not prove
/// that all dependencies of an entire snapshot were supplied or authenticated.
pub struct SnapshotBinding {
    /// Root-relative occurrence context for this selected use.
    pub path: Vec<OccurrenceId>,

    /// Logical identity selected at that contextual occurrence.
    pub node: NodeId,

    /// Exact retained revision selected for this node at this occurrence.
    pub revision: RevisionId,
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Check exact UTF16/UTF8 mapping across supplementary scalars, combining marks
    /// and mixed newline bytes, including rejection of illegal cuts.
    #[test]
    fn exact_unicode_and_crlf_coordinates() {
        let text = "A😀e\u{301}\r\n中";
        assert_eq!(utf16_to_byte(text, 1), Ok(1));
        assert_eq!(utf16_to_byte(text, 2), Err(RangeError::SplitScalar));
        assert_eq!(utf16_to_byte(text, 3), Ok(5));
        assert_eq!(utf16_to_byte(text, 8), Ok(text.len()));
        assert_eq!(utf16_to_byte(text, 9), Err(RangeError::Outside));

        assert_eq!(validate_byte_range(text, 1, 5), Ok(()));
        assert_eq!(
            validate_byte_range(text, 2, 5),
            Err(RangeError::SplitScalar)
        );
        assert_eq!(validate_byte_range(text, 5, 1), Err(RangeError::Reversed));
        // Combining-mark boundary is a scalar boundary, not a grapheme claim.
        assert_eq!(validate_byte_range(text, 6, 8), Ok(()));
    }

    /// Check that every legal scalar boundary round-trips through its UTF16 count
    /// for empty, mixed-newline and multilingual representative sources.
    #[test]
    fn all_scalar_boundaries_round_trip_for_representative_text() {
        for text in ["", "\r\n", "👩‍🔬 🇿🇦", "é e\u{301}", "中文 العربية"] {
            // Project each scalar to its byte index, then include the EOF cut.
            for byte in text.char_indices().map(|(i, _)| i).chain([text.len()]) {
                let units = text[..byte].encode_utf16().count();
                assert_eq!(utf16_to_byte(text, units), Ok(byte));
            }
        }
    }
}
