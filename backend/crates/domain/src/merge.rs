// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Independent reviewed synthesis validation
//!
//! Check exact retained input fragments and bound an independently supplied
//! synthesis output without inferring copied words or source authorship.
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
//! Used by: Storage reviewed-synthesis adapter and its domain/adapter tests.
//!
//! Specification:
//! - [Pure-domain responsibilities][domain]
//! - [Exact text and anchors][text]
//! - [Revision and derivation meanings][provenance]
//!
//! Boundary: This is cross-identity synthesis, not same-node parent-branch Merge.
//! Authentication, authority and durable derivation records remain adapter duties.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/merge.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [text]: ../../../../docs/05-domain/text-and-anchors.md
//! [provenance]: ../../../../docs/05-domain/provenance-model.md
#![deny(missing_docs)]

use crate::records::{Anchor, NodeId, OccurrenceId, RevisionId};

/// Maximum selected input fragments in this bounded synthesis operation.
pub const MAX_INPUTS: usize = 8;
/// Independent limit on output bytes and aggregate selected input bytes.
pub const MAX_BYTES: usize = 2 * 1024 * 1024;
/// One supplied retained-source fragment; its full source is needed for bounds.
pub struct Input<'a> {
    /// Logical source identity, which must differ from the independent output.
    pub node: NodeId,

    /// Retained revision asserted for this exact source text.
    pub revision: RevisionId,

    /// Full selected occurrence context; equal source text is not a substitute.
    pub path: &'a [OccurrenceId],

    /// Full source, preserving original UTF8/newline content for anchor validation.
    pub text: &'a str,

    /// Nonempty scalar-aligned range and matching retained revision/path binding.
    pub anchor: &'a Anchor,
}

/// Why the independently reviewed synthesis cannot use these supplied inputs.
#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    /// Synthesis requires at least two and no more than the bounded input count.
    Count,
    /// Output or summed selected input bytes exceed the limit, or overflow.
    Size,
    /// Output is empty; whitespace is not trimmed or normalized by this check.
    Empty,
    /// One exact fragment fails identity, context or scalar-range validation.
    Source(crate::fork::Error),
}

/// Validate exact input fragments and an independently supplied output string.
/// Each input is checked through the Fork planner against `output_node`; the
/// aggregate allowance counts selected bytes, not the full containing sources.
/// Repeated inputs remain explicit. No equality/copy relation to output is required.
///
/// # Errors
/// Reject invalid count, empty/oversized output, invalid fragments or checked-sum
/// overflow/limit exhaustion. Return no partial plan or durable mutation.
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
        // Repeated uses still consume the allowance; saturating arithmetic
        // would disguise overflow as an apparently valid bounded total.
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

    /// Verify distinct output identity and limits while allowing independent
    /// reviewed wording without attributing it as copied source.
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
        // Reusing the same retained source twice is legal. The output remains
        // an independent reviewed statement, not an inferred copy attribution.
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
