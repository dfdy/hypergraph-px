// SPDX-License-Identifier: AGPL-3.0-only
//! Typed identities and exact historical coordinates. No entropy, I/O or authority.
use serde::{Deserialize, Serialize};

macro_rules! ids {
    ($($name:ident),+ $(,)?) => {$(
        #[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
        #[serde(transparent)]
        pub struct $name(pub [u8; 32]);
    )+};
}
ids!(
    DocumentId,
    NodeId,
    RevisionId,
    BranchId,
    ManifestId,
    OccurrenceId,
    SnapshotId,
    OperationId,
    DraftId,
    PrincipalId,
    DeviceId,
    GroupId,
    RelationshipId,
    TransformationId
);

/// Historical anchor; not an automatic promise of relocation after an edit.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Anchor {
    pub revision: RevisionId,
    pub occurrence_path: Vec<OccurrenceId>,
    pub start_byte: usize,
    pub end_byte: usize,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RangeError {
    Outside,
    SplitScalar,
    Reversed,
}

/// Convert an exact browser UTF-16 offset to a Rust UTF-8 byte boundary.
/// Does not normalize source or snap a split surrogate to a nearby boundary.
pub fn utf16_to_byte(text: &str, offset: usize) -> Result<usize, RangeError> {
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
    if units == offset {
        Ok(text.len())
    } else {
        Err(RangeError::Outside)
    }
}

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

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SnapshotBinding {
    pub path: Vec<OccurrenceId>,
    pub node: NodeId,
    pub revision: RevisionId,
}

#[cfg(test)]
mod tests {
    use super::*;
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
    #[test]
    fn all_scalar_boundaries_round_trip_for_representative_text() {
        for text in ["", "\r\n", "👩‍🔬 🇿🇦", "é e\u{301}", "中文 العربية"] {
            for byte in text.char_indices().map(|(i, _)| i).chain([text.len()]) {
                let units = text[..byte].encode_utf16().count();
                assert_eq!(utf16_to_byte(text, units), Ok(byte));
            }
        }
    }
}
