// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Exact role-labelled assertions and review
//!
//! Check a proposed assertion’s exact source participants, orient binary roles
//! consistently and validate explicit review transitions without inferring truth.
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
//! Used by: Storage assertion adapter for participant validation, canonical orientation
//! and review transitions, together with its domain/adapter tests.
//!
//! Specification:
//! - [Annotation responsibilities][domain]
//! - [Assertion and predicate semantics][assertions]
//! - [Exact source anchors][text]
//!
//! Boundary: The caller authenticates sources and authority and persists attributable
//! review/history. Accepted review is a recorded judgement, not a proof. Supplied
//! role names and ordering keys do not establish a full predicate registry.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/assertion.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [assertions]: ../../../../docs/05-domain/assertions-and-predicates.md
//! [text]: ../../../../docs/05-domain/text-and-anchors.md
use crate::records::{Anchor, NodeId, OccurrenceId, RangeError, RevisionId, validate_byte_range};

/// Maximum incidences and declared roles accepted by this bounded implementation.
pub const MAX_PARTICIPANTS: usize = 8;

/// Limit on aggregate quoted UTF8 bytes; repeated incidences each consume budget.
pub const MAX_QUOTED_BYTES: usize = 2 * 1024 * 1024;

/// Current review judgement; persistence retains earlier attributable judgements.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ReviewState {
    /// Initial unreviewed state; an explicit review cannot transition back here.
    Proposed,
    /// A reviewer accepts the assertion, without proving its predicate true.
    Accepted,
    /// A reviewer rejects the assertion; later reconsideration remains possible.
    Rejected,
    /// A reviewer records that this assertion has been superseded.
    Superseded,
}

/// Why an assertion participant set or review request fails its supplied contract.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    /// Too few/many incidences or an invalid number of declared roles.
    Arity,
    /// A role is malformed, duplicated, missing from participants or undeclared.
    Role,
    /// An incidence points to the assertion node itself in this bounded slice.
    SelfReference,
    /// Participant revision/path disagrees with its retained anchor.
    Context,
    /// The quoted passage is empty or differs from the exact selected bytes.
    Quote,
    /// Aggregate quoted bytes overflow or exceed the bounded allowance.
    Limit,
    /// A participant has invalid or non-scalar-aligned UTF8 byte cuts.
    Range(RangeError),
    /// The next review state is unchanged or attempts to return to Proposed.
    Review,
}

/// A role incidence tied to one exact full source and retained occurrence/range.
pub struct Participant<'a> {
    /// Declared role label; repeated incidences with this role remain distinct.
    pub role: &'a str,

    /// Logical participant identity, distinct from the assertion being created.
    pub node: NodeId,

    /// Retained revision supplied for this exact source.
    pub revision: RevisionId,

    /// Full selected occurrence context; not inferred from equal quoted text.
    pub path: &'a [OccurrenceId],

    /// Full owned text used to validate byte cuts and quoted content.
    pub text: &'a str,

    /// Retained revision/path and scalar-aligned UTF8 selection bounds.
    pub anchor: &'a Anchor,

    /// Nonempty selected text that must equal the exact source slice.
    pub quote: &'a str,
}

/// Validate declared role coverage and every exact participant without relocating text.
/// Repeated incidences remain explicit. Roles must be nonempty, trimmed, unique
/// and at most 64 UTF8 bytes. Each source binding must match its anchor; each
/// nonempty quote must match the selected slice. Authentication is a caller duty.
pub fn validate(
    node: NodeId,
    roles: &[&str],
    participants: &[Participant<'_>],
) -> Result<(), Error> {
    if !(2..=MAX_PARTICIPANTS).contains(&participants.len())
        || roles.is_empty()
        || roles.len() > MAX_PARTICIPANTS
    {
        return Err(Error::Arity);
    }

    // Check the vocabulary and its actual coverage before validating each incidence.
    for (index, role) in roles.iter().enumerate() {
        if role.is_empty()
            || role.len() > 64
            || role.trim() != *role
            || roles[..index].contains(role)
            // Establish that this declared role is represented by an incidence.
            || !participants.iter().any(|p| p.role == *role)
        {
            return Err(Error::Role);
        }
    }

    // A repeated participant consumes quote budget again; roles do not deduplicate
    // source incidences or grant authority to the referenced content.
    let mut total = 0usize;
    for p in participants {
        if !roles.contains(&p.role) {
            return Err(Error::Role);
        }
        if p.node == node {
            return Err(Error::SelfReference);
        }
        if p.revision != p.anchor.revision || p.path != p.anchor.occurrence_path {
            return Err(Error::Context);
        }
        validate_byte_range(p.text, p.anchor.start_byte, p.anchor.end_byte)
            .map_err(Error::Range)?;
        if p.anchor.start_byte == p.anchor.end_byte
            || p.text[p.anchor.start_byte..p.anchor.end_byte] != *p.quote
        {
            return Err(Error::Quote);
        }
        total = total.checked_add(p.quote.len()).ok_or(Error::Limit)?;
        if total > MAX_QUOTED_BYTES {
            return Err(Error::Limit);
        }
    }

    Ok(())
}

/// The adapter supplies stable opaque ordering keys; their encoding stays outside domain.
/// Return the original source/target indices in canonical predicate orientation.
/// Reverse first applies inverse role orientation. Symmetric predicates then sort
/// by the opaque keys; equal keys retain that prior orientation. No source moves.
pub fn binary_order(
    reverse: bool,
    symmetric: bool,
    source_key: &[u8],
    target_key: &[u8],
) -> [usize; 2] {
    let mut order = if reverse { [1, 0] } else { [0, 1] };
    let comparison = if reverse {
        target_key.cmp(source_key)
    } else {
        source_key.cmp(target_key)
    };
    if symmetric && comparison.is_gt() {
        order.swap(0, 1);
    }
    order
}

/// Validate a new explicit review judgement without modifying the prior input.
/// Any different non-Proposed state is allowed, including reconsideration of an
/// accepted/rejected/superseded judgement. Persistence/attribution belong to adapters.
pub fn review(current: ReviewState, next: ReviewState) -> Result<(), Error> {
    if next == ReviewState::Proposed || current == next {
        Err(Error::Review)
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Verify repeated role incidences retain exact Unicode/newline source and
    /// validate without collapsing multiple premises.
    #[test]
    fn nary_roles_keep_multiple_premises_and_exact_unicode_mixed_newline_bindings() {
        let text = "A😀\r\ne\u{301}中\r";
        let path = [OccurrenceId([2; 32])];
        let revision = RevisionId([3; 32]);
        let anchor = Anchor {
            revision,
            occurrence_path: path.to_vec(),
            start_byte: 1,
            end_byte: text.len(),
        };
        // Build an incidence in the requested role while holding its source fixed.
        let participant = |role| Participant {
            role,
            node: NodeId([4; 32]),
            revision,
            path: &path,
            text,
            anchor: &anchor,
            quote: &text[1..],
        };
        assert_eq!(
            validate(
                NodeId([5; 32]),
                &["premise", "conclusion"],
                &[
                    participant("premise"),
                    participant("premise"),
                    participant("conclusion")
                ]
            ),
            Ok(())
        );
        assert_eq!(text, "A😀\r\ne\u{301}中\r");
    }

    /// Verify malformed role coverage and assertion self-reference fail instead
    /// of creating a differently interpreted participant set.
    #[test]
    fn missing_unknown_and_duplicate_roles_or_self_reference_never_become_assertions() {
        let path = [OccurrenceId([2; 32])];
        let revision = RevisionId([3; 32]);
        let anchor = Anchor {
            revision,
            occurrence_path: path.to_vec(),
            start_byte: 0,
            end_byte: 1,
        };
        // Build an incidence in the requested role while holding its source fixed.
        let participant = |role| Participant {
            role,
            node: NodeId([4; 32]),
            revision,
            path: &path,
            text: "A",
            anchor: &anchor,
            quote: "A",
        };
        for roles in [
            vec!["premise", "conclusion"],
            vec!["premise", "premise"],
            vec![" premise"],
        ] {
            assert!(
                validate(
                    NodeId([5; 32]),
                    &roles,
                    &[participant("premise"), participant("premise")]
                )
                .is_err()
            );
        }
        assert_eq!(
            validate(
                NodeId([4; 32]),
                &["premise"],
                &[participant("premise"), participant("premise")]
            ),
            Err(Error::SelfReference)
        );
    }

    /// Verify each source-binding/range/quote error is returned against its exact
    /// input, without searching or repairing the selected passage.
    #[test]
    fn split_scalar_wrong_context_and_wrong_quote_fail_without_relocation() {
        let revision = RevisionId([3; 32]);
        let path = [OccurrenceId([2; 32])];
        let mut anchor = Anchor {
            revision,
            occurrence_path: path.to_vec(),
            start_byte: 1,
            end_byte: 5,
        };
        for (start, quote, rev, expected) in [
            (2, "😀", revision, Error::Range(RangeError::SplitScalar)),
            (1, "Different", revision, Error::Quote),
            (1, "😀", RevisionId([8; 32]), Error::Context),
        ] {
            anchor.start_byte = start;
            // Reuse this deliberately malformed participant to isolate the expected error.
            let participant = || Participant {
                role: "participant",
                node: NodeId([4; 32]),
                revision: rev,
                path: &path,
                text: "A😀B",
                anchor: &anchor,
                quote,
            };
            assert_eq!(
                validate(
                    NodeId([5; 32]),
                    &["participant"],
                    &[participant(), participant()]
                ),
                Err(expected)
            );
        }
    }

    /// Enumerate review-state transitions to check reconsideration is allowed
    /// but no-op reviews or return to Proposed are rejected.
    #[test]
    fn review_is_explicit_reconsiderable_and_preserves_prior_state_as_an_input() {
        use ReviewState::*;
        for current in [Proposed, Accepted, Rejected, Superseded] {
            for next in [Accepted, Rejected, Superseded] {
                assert_eq!(review(current, next).is_ok(), current != next);
            }
            assert_eq!(review(current, Proposed), Err(Error::Review));
        }
    }

    /// Check inverse-role orientation and symmetric key ordering separately,
    /// including equal-key behaviour.
    #[test]
    fn canonical_orientation_separates_inverse_roles_from_symmetric_ordering() {
        assert_eq!(binary_order(false, false, b"B", b"A"), [0, 1]);
        assert_eq!(binary_order(true, false, b"B", b"A"), [1, 0]);
        assert_eq!(binary_order(false, true, b"B", b"A"), [1, 0]);
        assert_eq!(binary_order(true, true, b"B", b"A"), [1, 0]);
        assert_eq!(binary_order(true, true, b"same", b"same"), [1, 0]);
    }
}
