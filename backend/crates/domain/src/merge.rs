// SPDX-License-Identifier: AGPL-3.0-only
//! Reviewed cross-identity synthesis. Source-copy authorship is deliberately unknown.
use crate::records::{Anchor, NodeId, OccurrenceId, RevisionId};
pub const MAX_INPUTS: usize = 8;
pub const MAX_BYTES: usize = 2 * 1024 * 1024;
pub struct Input<'a> {
    pub node: NodeId,
    pub revision: RevisionId,
    pub path: &'a [OccurrenceId],
    pub text: &'a str,
    pub anchor: &'a Anchor,
}
#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    Count,
    Size,
    Empty,
    Source(crate::fork::Error),
}
pub fn validate(inputs: &[Input<'_>], output_node: NodeId, output: &str) -> Result<(), Error> {
    if !(2..=MAX_INPUTS).contains(&inputs.len()) {
        return Err(Error::Count);
    }
    if output.is_empty() {
        return Err(Error::Empty);
    }
    if output.len() > MAX_BYTES {
        return Err(Error::Size);
    }
    let mut total = 0usize;
    for input in inputs {
        let fragment = crate::fork::plan(
            input.node,
            input.revision,
            input.path,
            input.text,
            input.anchor,
            output_node,
        )
        .map_err(Error::Source)?;
        total = total.checked_add(fragment.text.len()).ok_or(Error::Size)?;
        if total > MAX_BYTES {
            return Err(Error::Size);
        }
    }
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn independent_reviewed_output_does_not_require_equality_or_invent_copy_mapping() {
        let node = NodeId([1; 32]);
        let rev = RevisionId([2; 32]);
        let path = [OccurrenceId([3; 32])];
        let text = "😀\r\n中\rtail\n";
        let anchor = Anchor {
            revision: rev,
            occurrence_path: path.to_vec(),
            start_byte: 0,
            end_byte: text.len(),
        };
        let inputs = [
            Input {
                node,
                revision: rev,
                path: &path,
                text,
                anchor: &anchor,
            },
            Input {
                node,
                revision: rev,
                path: &path,
                text,
                anchor: &anchor,
            },
        ];
        assert_eq!(
            validate(
                &inputs,
                NodeId([4; 32]),
                "Reviewed synthesis 😀\r\nDifferent claim."
            ),
            Ok(())
        );
        assert_eq!(
            validate(&inputs, node, "Reviewed"),
            Err(Error::Source(crate::fork::Error::SameIdentity))
        );
        assert_eq!(validate(&inputs, NodeId([4; 32]), ""), Err(Error::Empty));
        assert_eq!(
            validate(&inputs[..1], NodeId([4; 32]), "Output"),
            Err(Error::Count)
        );
        assert_eq!(
            validate(&inputs, NodeId([4; 32]), &"a".repeat(MAX_BYTES + 1)),
            Err(Error::Size)
        );
    }
}
