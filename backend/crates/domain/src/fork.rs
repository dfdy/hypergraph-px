// SPDX-License-Identifier: AGPL-3.0-only
//! Pure fragment planning; authorization and immutable-source verification stay in adapters.
use crate::records::{Anchor, NodeId, OccurrenceId, RangeError, RevisionId, validate_byte_range};
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    SameIdentity,
    WrongRevision,
    WrongOccurrence,
    Empty,
    Range(RangeError),
}
#[derive(Debug, PartialEq, Eq)]
pub struct Plan<'a> {
    pub source_node: NodeId,
    pub output_node: NodeId,
    pub text: &'a str,
}
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
    #[test]
    fn all_nonempty_scalar_ranges_preserve_exact_unicode_and_mixed_newline_bytes() {
        let text = "A😀e\u{301}\r\n中\rtail\n";
        let revision = RevisionId([1; 32]);
        let path = [OccurrenceId([2; 32])];
        let boundaries: Vec<_> = text
            .char_indices()
            .map(|(n, _)| n)
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
