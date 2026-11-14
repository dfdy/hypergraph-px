// SPDX-License-Identifier: AGPL-3.0-only
//! Exact role-labelled assertion planning, without storage, inference or authority.
use crate::records::{Anchor, NodeId, OccurrenceId, RangeError, RevisionId, validate_byte_range};
pub const MAX_PARTICIPANTS: usize = 8;
pub const MAX_QUOTED_BYTES: usize = 2 * 1024 * 1024;
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ReviewState {
    Proposed,
    Accepted,
    Rejected,
    Superseded,
}
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    Arity,
    Role,
    SelfReference,
    Context,
    Quote,
    Limit,
    Range(RangeError),
    Review,
}
pub struct Participant<'a> {
    pub role: &'a str,
    pub node: NodeId,
    pub revision: RevisionId,
    pub path: &'a [OccurrenceId],
    pub text: &'a str,
    pub anchor: &'a Anchor,
    pub quote: &'a str,
}
/// Every declared role is present; repeated participants in one role stay explicit incidences.
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
    for (index, role) in roles.iter().enumerate() {
        if role.is_empty()
            || role.len() > 64
            || role.trim() != *role
            || roles[..index].contains(role)
            || !participants.iter().any(|p| p.role == *role)
        {
            return Err(Error::Role);
        }
    }
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

/// Review records a new attributable judgement; it never proves the predicate.
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
    #[test]
    fn canonical_orientation_separates_inverse_roles_from_symmetric_ordering() {
        assert_eq!(binary_order(false, false, b"B", b"A"), [0, 1]);
        assert_eq!(binary_order(true, false, b"B", b"A"), [1, 0]);
        assert_eq!(binary_order(false, true, b"B", b"A"), [1, 0]);
        assert_eq!(binary_order(true, true, b"B", b"A"), [1, 0]);
        assert_eq!(binary_order(true, true, b"same", b"same"), [1, 0]);
    }
}
