// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Bounded same-node Merge over supplied changes
//!
//! Validate exact base-aligned edits for two retained versions and construct
//! a complete merged result only when overlap evidence determines a choice.
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
//! Used by: Domain Merge/lineage/origin tests; experimental storage adapters consume
//! the shared base/limit/origin types and focused submodules.
//!
//! Specification:
//! - [Parent-Merge responsibilities][domain]
//! - [Same-node Merge algorithm contract][merge]
//! - [Publication and recovery boundary][publication]
//!
//! Boundary: The caller supplies authenticated maps and a verified common base. Logical
//! work is not a measured time guarantee. This planner has no production Merge
//! publication caller in the current slice and cannot infer origin from equal text.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/parent_merge.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [merge]: ../../../../docs/07-implementation/algorithms/parent-merge.md
//! [publication]: ../../../../docs/07-implementation/protocols/draft-publication.md
use crate::records::{NodeId, RangeError, RevisionId, validate_byte_range};
use std::collections::BTreeMap;

/// Choose a unique maximal common base from supplied same-node DAG metadata.
pub mod ancestry;

/// Track immediate-base exact working splices without historical diff inference.
pub mod lineage;

/// Carry supplied historical passage origins through validated lineage.
pub mod origins;

/// A retained passage-change identity and optional supplied per-node order.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Origin {
    /// Exact revision responsible for this change, not a current branch head.
    pub revision: RevisionId,

    /// Known positive order or None for unknown age; unknown never becomes zero.
    pub order: Option<u64>,
}

/// Whether an edit has exact positional correspondence to the common base.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Mapping {
    /// Supplied edit location is exact; the planner still verifies reconstruction.
    Exact,
    /// Source location correspondence is uncertain; distinct competition cannot auto-resolve.
    Unknown,
}

/// One exact replacement in common-base UTF8 coordinates with origin evidence.
#[derive(Debug)]
pub struct Edit<'a> {
    /// Inclusive byte cut in the full common-base source.
    pub start: usize,

    /// Exclusive base cut; equality denotes insertion at that position.
    pub end: usize,

    /// Exact base bytes that must occupy this range, including empty insertion text.
    pub expected: &'a str,

    /// Original UTF8 replacement bytes; deletion is the empty string.
    pub replacement: &'a str,

    /// Validated historical origins; unknown order still has exact identity.
    /// All retained passage origins asserted for this replacement.
    pub origins: &'a [Origin],

    /// Whether supplied correspondence is exact enough for competing-byte selection.
    pub mapping: Mapping,
}

/// One verified common-base node/revision and its full original text.
pub struct Base<'a> {
    /// Logical identity shared by both versions being merged.
    pub node: NodeId,

    /// Retained common-base revision chosen outside this planner.
    pub revision: RevisionId,

    /// Exact full base source used for all expected quotes and byte ranges.
    pub text: &'a str,
}

/// A supplied side version plus edits that must exactly reconstruct it from base.
pub struct Side<'a> {
    /// Must equal the base node; this is not cross-identity synthesis.
    pub node: NodeId,

    /// Retained version whose supplied text must reconstruct exactly.
    pub revision: RevisionId,

    /// Exact full side text, checked against its ordered base-relative edits.
    pub text: &'a str,

    /// Ordered nonoverlapping edits; touching insertions need coalesced evidence.
    pub edits: &'a [Edit<'a>],
}

/// Independent text-size and logical work allowances for one planning attempt.
#[derive(Clone, Copy, Debug)]
pub struct Limits {
    /// Maximum full input and complete output size in UTF8 bytes.
    pub text_bytes: usize,

    /// Logical bytes/records/pair steps, not a measured time guarantee.
    /// Remaining logical budget is debited before the corresponding operation.
    pub work: usize,
}

/// Which supplied side contributes a selected replacement.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Selection {
    /// Use source-side replacement and origins.
    Source,
    /// Use target-side replacement and origins.
    Target,
    /// Equal bytes at equal cuts retain origin evidence from both sides.
    Both,
}

/// One selected edit with retained origins and the strongest justified mapping.
#[derive(Debug, PartialEq, Eq)]
pub struct Applied<'a> {
    /// Inclusive common-base cut for this chosen region.
    pub start: usize,

    /// Exclusive base cut; empty ranges retain insertion semantics.
    pub end: usize,

    /// Borrowed exact bytes from the selected side.
    pub replacement: &'a str,

    /// Sorted/deduplicated origins retained from the selected side(s).
    pub origins: Vec<Origin>,

    /// Source, target or equal-byte contribution from both sides.
    pub selection: Selection,

    /// Exact only when every contributing selected edit has exact mapping.
    pub mapping: Mapping,
}

/// Complete merged text and its exact base/source/target context; not publication.
#[derive(Debug, PartialEq, Eq)]
pub struct Plan<'a> {
    /// Shared logical identity; no new node is created.
    pub node: NodeId,

    /// Exact common-base revision supplied to the plan.
    pub base: RevisionId,

    /// Exact source-side input version.
    pub source: RevisionId,

    /// Exact target-side input version.
    pub target: RevisionId,

    /// Complete reconstructed merged bytes; no partial result is returned.
    pub text: String,

    /// Selected base-relative regions and their preserved origin evidence.
    pub edits: Vec<Applied<'a>>,
}

/// Why a competing region needs explicit resolution instead of guessed ordering.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Reason {
    /// At least one origin lacks order, or competing known orders are equal.
    UnknownOrder,
    /// Distinct competing bytes lack exact mapping on one or both sides.
    UnknownMapping,
    /// Overlap boundaries differ, including an insertion touching a replacement.
    ComplexOverlap,
}

/// Either a complete plan or one unresolved input pair with no partial text.
#[derive(Debug, PartialEq, Eq)]
pub enum Outcome<'a> {
    /// A validated complete plan; callers separately authorize and publish it.
    Merged(Plan<'a>),
    /// No partial merged text is returned. Indices bind exact supplied inputs.
    Unresolved {
        /// Index of the first unresolved source-side edit.
        source: usize,
        /// Index of its competing target-side edit.
        target: usize,
        /// Exact missing/ambiguous evidence that prevents automatic selection.
        reason: Reason,
    },
}

/// Invalid supplied evidence or exhausted limits, distinct from unresolved choice.
#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    /// The side/base identities differ.
    WrongNode,
    /// A base-relative UTF8 range is invalid or splits a scalar.
    Range(RangeError),
    /// Expected bytes do not equal the exact common-base slice.
    Quote,
    /// A side has reversed order or self-overlap.
    UnorderedEdits,
    /// Empty, inconsistent, zero-valued or colliding origin claims.
    Origin,
    /// Applying a side map does not reproduce its exact supplied text.
    Reconstruction,
    /// Checked size/work accounting exceeds its allowance or overflows.
    Limit,
}

struct Budget(usize);
impl Budget {
    /// Debit logical work before proceeding; checked subtraction returns Limit
    /// rather than allowing budget wraparound or an apparently complete partial plan.
    fn spend(&mut self, amount: usize) -> Result<(), Error> {
        self.0 = self.0.checked_sub(amount).ok_or(Error::Limit)?;
        Ok(())
    }
}
// Insertions touching either edge of a replacement need a coalesced exact map
// or explicit review. Adjacent nonempty replacements do not overlap.
/// Detect competing base regions; insertion cuts touch both neighbouring
/// boundaries while adjacent nonempty replacements remain independent.
fn overlaps(a: &Edit<'_>, b: &Edit<'_>) -> bool {
    match (a.start == a.end, b.start == b.end) {
        (true, _) => b.start <= a.start && a.start <= b.end,
        (_, true) => a.start <= b.start && b.start <= a.end,
        _ => a.start < b.end && b.start < a.end,
    }
}

struct Origins {
    revisions: BTreeMap<RevisionId, Option<u64>>,
    orders: BTreeMap<u64, RevisionId>,
}

impl Origins {
    /// Keep origin revision/order claims consistent across both sides: one known
    /// order belongs to one revision, and one revision cannot change its known age.
    fn validate(&mut self, origin: Origin) -> Result<(), Error> {
        if origin.order == Some(0) {
            return Err(Error::Origin);
        }
        if self
            .revisions
            .get(&origin.revision)
            // Detect another age claim for this same retained revision.
            .is_some_and(|old| *old != origin.order)
        {
            return Err(Error::Origin);
        }
        if let Some(order) = origin.order {
            if self
                .orders
                .get(&order)
                // Reject two different revisions claiming one known order.
                .is_some_and(|old| *old != origin.revision)
            {
                return Err(Error::Origin);
            }
            self.orders.insert(order, origin.revision);
        }
        self.revisions.insert(origin.revision, origin.order);
        Ok(())
    }
}

/// Validate ordered scalar-aligned expected quotes and origin claims, then
/// reconstruct the entire supplied side exactly before Merge decisions use it.
fn validate_side(
    base: &Base<'_>,
    side: &Side<'_>,
    budget: &mut Budget,
    origins: &mut Origins,
) -> Result<(), Error> {
    let mut cursor = 0;
    let mut size = base.text.len();
    for (index, edit) in side.edits.iter().enumerate() {
        budget.spend(1)?;
        validate_byte_range(base.text, edit.start, edit.end).map_err(Error::Range)?;
        if edit.start < cursor || index > 0 && overlaps(&side.edits[index - 1], edit) {
            return Err(Error::UnorderedEdits);
        }
        budget.spend(edit.expected.len())?;
        budget.spend(edit.replacement.len())?;
        if base.text[edit.start..edit.end] != *edit.expected {
            return Err(Error::Quote);
        }
        // A zero-width empty edit carries no deletion or replacement meaning.
        if edit.origins.is_empty() || edit.start == edit.end && edit.replacement.is_empty() {
            return Err(Error::Origin);
        }
        for &origin in edit.origins {
            budget.spend(1)?;
            origins.validate(origin)?;
        }
        size = size
            .checked_sub(edit.end - edit.start)
            // Add replacement bytes only after checked removal of the base range.
            .and_then(|n| n.checked_add(edit.replacement.len()))
            .ok_or(Error::Limit)?;
        cursor = edit.end;
    }
    if size != side.text.len() {
        return Err(Error::Reconstruction);
    }
    budget.spend(size)?;
    let mut reconstructed = String::with_capacity(size);
    cursor = 0;
    for edit in side.edits {
        reconstructed.push_str(&base.text[cursor..edit.start]);
        reconstructed.push_str(edit.replacement);
        cursor = edit.end;
    }
    reconstructed.push_str(&base.text[cursor..]);
    if reconstructed != side.text {
        return Err(Error::Reconstruction);
    }
    Ok(())
}

/// Return the greatest supplied origin order only if every origin is known;
/// one unknown origin keeps the whole competing edit’s age unknown.
fn order(edit: &Edit<'_>) -> Option<u64> {
    // Equal-byte deduplication must not turn any unknown origin into known age.
    // Accumulate the maximum, short-circuiting the fold on an unknown origin.
    edit.origins.iter().try_fold(0, |latest, origin| {
        // Extend the maximum only when this origin actually has known order.
        origin.order.map(|value| latest.max(value))
    })
}

/// Select one edit and optionally retain equal-byte evidence from both sides;
/// merge origin lists without upgrading an unknown mapping to Exact.
fn apply<'a>(
    edit: &Edit<'a>,
    selection: Selection,
    other: Option<&Edit<'a>>,
    budget: &mut Budget,
) -> Result<Applied<'a>, Error> {
    budget.spend(1)?;
    budget.spend(edit.origins.len())?;
    let mut origins = edit.origins.to_vec();
    if let Some(other) = other {
        budget.spend(other.origins.len())?;
        origins.extend_from_slice(other.origins);
    }
    origins.sort_unstable();
    origins.dedup();
    Ok(Applied {
        start: edit.start,
        end: edit.end,
        replacement: edit.replacement,
        origins,
        selection,
        mapping: if edit.mapping == Mapping::Exact
            // Equal-byte sharing is exact only if the other supplied map is exact.
            && other.is_none_or(|value| value.mapping == Mapping::Exact)
        {
            Mapping::Exact
        } else {
            Mapping::Unknown
        },
    })
}

/// The caller supplies authenticated maps and a verified common base. This
/// validates exact reconstruction, but cannot prove who changed a repeated span.
/// Validate both sides first; sweep ordered regions, resolve only equal-cut
/// competition with sufficient evidence, then bound and construct complete text.
pub fn plan<'a>(
    base: &Base<'a>,
    source: &Side<'a>,
    target: &Side<'a>,
    limits: Limits,
) -> Result<Outcome<'a>, Error> {
    if source.node != base.node || target.node != base.node {
        return Err(Error::WrongNode);
    }
    if limits.work == 0
        || [base.text.len(), source.text.len(), target.text.len()]
            .iter()
            // Bound every full input before doing reconstruction/allocation work.
            .any(|&size| size > limits.text_bytes)
    {
        return Err(Error::Limit);
    }
    let mut budget = Budget(limits.work);
    for text in [base.text, source.text, target.text] {
        budget.spend(text.len())?;
    }
    let mut origins = Origins {
        revisions: BTreeMap::new(),
        orders: BTreeMap::new(),
    };
    validate_side(base, source, &mut budget, &mut origins)?;
    validate_side(base, target, &mut budget, &mut origins)?;

    // Sweep only already validated ordered maps; do not infer omitted changes.
    let (mut i, mut j) = (0, 0);
    let mut edits = Vec::new();
    while i < source.edits.len() || j < target.edits.len() {
        budget.spend(1)?;
        let left = source.edits.get(i);
        let right = target.edits.get(j);
        match (left, right) {
            (Some(a), Some(b)) if overlaps(a, b) => {
                if a.start != b.start || a.end != b.end {
                    return Ok(Outcome::Unresolved {
                        source: i,
                        target: j,
                        reason: Reason::ComplexOverlap,
                    });
                }
                budget.spend(a.replacement.len())?;
                budget.spend(b.replacement.len())?;
                let selected = if a.replacement == b.replacement {
                    apply(a, Selection::Both, Some(b), &mut budget)?
                } else {
                    if a.mapping == Mapping::Unknown || b.mapping == Mapping::Unknown {
                        return Ok(Outcome::Unresolved {
                            source: i,
                            target: j,
                            reason: Reason::UnknownMapping,
                        });
                    }
                    budget.spend(a.origins.len())?;
                    budget.spend(b.origins.len())?;
                    match (order(a), order(b)) {
                        (Some(x), Some(y)) if x > y => {
                            apply(a, Selection::Source, None, &mut budget)?
                        }
                        (Some(x), Some(y)) if y > x => {
                            apply(b, Selection::Target, None, &mut budget)?
                        }
                        _ => {
                            return Ok(Outcome::Unresolved {
                                source: i,
                                target: j,
                                reason: Reason::UnknownOrder,
                            });
                        }
                    }
                };
                edits.push(selected);
                i += 1;
                j += 1;
            }
            (Some(a), Some(b)) if a.start < b.start => {
                edits.push(apply(a, Selection::Source, None, &mut budget)?);
                i += 1;
            }
            (_, Some(b)) => {
                edits.push(apply(b, Selection::Target, None, &mut budget)?);
                j += 1;
            }
            (Some(a), None) => {
                edits.push(apply(a, Selection::Source, None, &mut budget)?);
                i += 1;
            }
            (None, None) => break,
        }
    }
    // Bound the entire output before allocating or exposing any merged source.
    let mut size = base.text.len();
    for edit in &edits {
        budget.spend(1)?;
        size = size
            .checked_sub(edit.end - edit.start)
            // Add replacement bytes only after checked removal of the base range.
            .and_then(|n| n.checked_add(edit.replacement.len()))
            .ok_or(Error::Limit)?;
    }
    if size > limits.text_bytes {
        return Err(Error::Limit);
    }
    budget.spend(size)?;
    let mut text = String::with_capacity(size);
    let mut cursor = 0;
    for edit in &edits {
        text.push_str(&base.text[cursor..edit.start]);
        text.push_str(edit.replacement);
        cursor = edit.end;
    }
    text.push_str(&base.text[cursor..]);
    Ok(Outcome::Merged(Plan {
        node: base.node,
        base: base.revision,
        source: source.revision,
        target: target.revision,
        text,
        edits,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    const NODE: NodeId = NodeId([9; 32]);
    /// Construct a stable test origin with an explicitly known or unknown order.
    fn origin(n: u8, order: Option<u64>) -> Origin {
        Origin {
            revision: RevisionId([n; 32]),
            order,
        }
    }

    /// Bind synthetic base text to the common test node and retained revision.
    fn base(text: &str) -> Base<'_> {
        Base {
            node: NODE,
            revision: RevisionId([90; 32]),
            text,
        }
    }

    /// Build an exact supplied-side fixture without inferring any changes from text.
    fn side<'a>(text: &'a str, edits: &'a [Edit<'a>], revision: u8) -> Side<'a> {
        Side {
            node: NODE,
            revision: RevisionId([revision; 32]),
            text,
            edits,
        }
    }

    /// Supply generous logical allowances so semantic tests isolate their intended rule.
    fn limits() -> Limits {
        Limits {
            text_bytes: 4096,
            work: 100_000,
        }
    }

    /// Extract a complete result in tests, failing if a supposedly determined case
    /// was unresolved instead.
    fn merged<'a>(outcome: Outcome<'a>) -> Plan<'a> {
        match outcome {
            Outcome::Merged(plan) => plan,
            _ => panic!("expected merged text"),
        }
    }

    /// Verify competition uses each passage’s retained origin order, not unrelated
    /// newer changes, while independent regions preserve their own evidence.
    #[test]
    fn later_passage_wins_but_unrelated_newer_edit_and_merge_do_not_retag_it() {
        let b = base("Monday\r\nOriginal");
        let source_origin = [origin(1, Some(4))];
        let date_origin = [origin(2, Some(2))];
        let unrelated_origin = [origin(3, Some(10))];
        let a = [Edit {
            start: 0,
            end: 6,
            expected: "Monday",
            replacement: "Thursday",
            origins: &source_origin,
            mapping: Mapping::Exact,
        }];
        let z = [
            Edit {
                start: 0,
                end: 6,
                expected: "Monday",
                replacement: "Wednesday",
                origins: &date_origin,
                mapping: Mapping::Exact,
            },
            Edit {
                start: 8,
                end: 16,
                expected: "Original",
                replacement: "Later unrelated",
                origins: &unrelated_origin,
                mapping: Mapping::Exact,
            },
        ];
        let s = side("Thursday\r\nOriginal", &a, 91);
        let t = side("Wednesday\r\nLater unrelated", &z, 92);
        let result = merged(plan(&b, &s, &t, limits()).unwrap());
        assert_eq!(result.text, "Thursday\r\nLater unrelated");
        assert_eq!(result.edits[0].origins, source_origin);
        assert_eq!(result.edits[1].origins, unrelated_origin);
        assert_eq!(result.edits[0].selection, Selection::Source);
        assert_eq!(
            (result.base, result.source, result.target),
            (b.revision, s.revision, t.revision)
        );
        assert_eq!(t.text, "Wednesday\r\nLater unrelated");
        // Opposite actual passage order chooses the target, independently of role.
        let older_origin = [origin(4, Some(1))];
        let a = [Edit {
            origins: &older_origin,
            mapping: Mapping::Exact,
            ..a[0]
        }];
        assert_eq!(
            merged(plan(&b, &side(s.text, &a, 91), &t, limits()).unwrap()).text,
            t.text
        );
    }

    /// Verify an explicitly retained reversion remains a dated change even if its
    /// bytes equal the common base, so its actual origin order can win.
    #[test]
    fn supplied_reversion_is_a_real_change_even_when_equal_to_the_common_base() {
        let b = base("Monday");
        let x = [origin(1, Some(3))];
        let y = [origin(2, Some(2))];
        let a = [Edit {
            start: 0,
            end: 6,
            expected: "Monday",
            replacement: "Monday",
            origins: &x,
            mapping: Mapping::Exact,
        }];
        let z = [Edit {
            start: 0,
            end: 6,
            expected: "Monday",
            replacement: "Wednesday",
            origins: &y,
            mapping: Mapping::Exact,
        }];
        let result = merged(
            plan(
                &b,
                &side("Monday", &a, 91),
                &side("Wednesday", &z, 92),
                limits(),
            )
            .unwrap(),
        );
        assert_eq!(result.text, "Monday");
        assert_eq!(result.edits[0].origins, x);
    }

    /// Verify exact Unicode/newline edits and independent insertions/deletions,
    /// including order selection rather than concatenating competing insertions.
    #[test]
    fn exact_mixed_newlines_unicode_deletion_and_nonoverlapping_insertions_survive() {
        let b = base("A😀\r\n中\rZ");
        let x = [origin(1, Some(1))];
        let y = [origin(2, Some(2))];
        let a = [Edit {
            start: 1,
            end: 5,
            expected: "😀",
            replacement: "",
            origins: &x,
            mapping: Mapping::Exact,
        }];
        let z = [Edit {
            start: 10,
            end: 10,
            expected: "",
            replacement: "e\u{301}",
            origins: &y,
            mapping: Mapping::Exact,
        }];
        let result = merged(
            plan(
                &b,
                &side("A\r\n中\rZ", &a, 91),
                &side("A😀\r\n中e\u{301}\rZ", &z, 92),
                limits(),
            )
            .unwrap(),
        );
        assert_eq!(result.text.as_bytes(), "A\r\n中e\u{301}\rZ".as_bytes());
        assert_eq!(result.edits[0].replacement, "");
        assert_eq!((result.edits[1].start, result.edits[1].end), (10, 10));
        // Competing same-position insertions are chosen by order, not concatenated.
        let a = [Edit {
            start: 0,
            end: 0,
            expected: "",
            replacement: "😀",
            origins: &x,
            mapping: Mapping::Exact,
        }];
        let z = [Edit {
            start: 0,
            end: 0,
            expected: "",
            replacement: "中",
            origins: &y,
            mapping: Mapping::Exact,
        }];
        assert_eq!(
            merged(
                plan(
                    &base(""),
                    &side("😀", &a, 91),
                    &side("中", &z, 92),
                    limits()
                )
                .unwrap()
            )
            .text,
            "中"
        );
    }

    /// Verify equal-byte deduplication retains both origins and does not convert
    /// unknown age into known age for a later distinct competition.
    #[test]
    fn equal_bytes_keep_both_origins_and_unknown_competition_returns_no_partial_text() {
        let b = base("A B");
        let unknown = [origin(1, None)];
        let known = [origin(2, Some(2))];
        let fresh = [origin(3, Some(3))];
        let a = [Edit {
            start: 0,
            end: 1,
            expected: "A",
            replacement: "X",
            origins: &unknown,
            mapping: Mapping::Exact,
        }];
        let z = [Edit {
            start: 0,
            end: 1,
            expected: "A",
            replacement: "X",
            origins: &known,
            mapping: Mapping::Exact,
        }];
        let result =
            merged(plan(&b, &side("X B", &a, 91), &side("X B", &z, 92), limits()).unwrap());
        assert_eq!(result.edits[0].selection, Selection::Both);
        assert_eq!(result.edits[0].origins, [unknown[0], known[0]]);
        let imported = [Edit {
            start: 0,
            end: 1,
            expected: "A",
            replacement: "X",
            origins: &result.edits[0].origins,
            mapping: Mapping::Exact,
        }];
        let competing = [Edit {
            start: 0,
            end: 1,
            expected: "A",
            replacement: "Y",
            origins: &fresh,
            mapping: Mapping::Exact,
        }];
        assert_eq!(
            plan(
                &b,
                &side("X B", &imported, 91),
                &side("Y B", &competing, 92),
                limits()
            )
            .unwrap(),
            Outcome::Unresolved {
                source: 0,
                target: 0,
                reason: Reason::UnknownOrder
            }
        );
    }

    /// Verify uncoalesced overlap boundaries and touching insertions remain unresolved
    /// instead of dropping a region or guessing a text diff.
    #[test]
    fn ambiguous_overlap_and_touching_insertions_do_not_discard_independent_regions() {
        let b = base("abcd");
        let x = [origin(1, Some(1))];
        let y = [origin(2, Some(2))];
        let a = [Edit {
            start: 0,
            end: 3,
            expected: "abc",
            replacement: "X",
            origins: &x,
            mapping: Mapping::Exact,
        }];
        let z = [Edit {
            start: 1,
            end: 4,
            expected: "bcd",
            replacement: "Y",
            origins: &y,
            mapping: Mapping::Exact,
        }];
        assert_eq!(
            plan(&b, &side("Xd", &a, 91), &side("aY", &z, 92), limits()).unwrap(),
            Outcome::Unresolved {
                source: 0,
                target: 0,
                reason: Reason::ComplexOverlap
            }
        );
        let insert = [Edit {
            start: 3,
            end: 3,
            expected: "",
            replacement: "Y",
            origins: &y,
            mapping: Mapping::Exact,
        }];
        assert!(matches!(
            plan(
                &b,
                &side("Xd", &a, 91),
                &side("abcYd", &insert, 92),
                limits()
            )
            .unwrap(),
            Outcome::Unresolved {
                reason: Reason::ComplexOverlap,
                ..
            }
        ));
    }

    /// Exercise invalid text/maps/ranges/identity/origin evidence and checked
    /// work/input/output allowances without returning a success-labelled partial plan.
    #[test]
    fn malformed_mapping_origins_scope_and_work_or_output_limits_fail_closed() {
        let b = base("😀B");
        let x = [origin(1, Some(1))];
        let a = [Edit {
            start: 0,
            end: 4,
            expected: "😀",
            replacement: "X",
            origins: &x,
            mapping: Mapping::Exact,
        }];
        let unchanged = side(b.text, &[], 92);
        assert_eq!(
            plan(&b, &side("wrong", &a, 91), &unchanged, limits()),
            Err(Error::Reconstruction)
        );
        let broken = [Edit { start: 1, ..a[0] }];
        assert!(matches!(
            plan(&b, &side("XB", &broken, 91), &unchanged, limits()),
            Err(Error::Range(RangeError::SplitScalar))
        ));
        let broken = [Edit {
            expected: "other",
            ..a[0]
        }];
        assert_eq!(
            plan(&b, &side("XB", &broken, 91), &unchanged, limits()),
            Err(Error::Quote)
        );
        let wrong = Side {
            node: NodeId([8; 32]),
            ..unchanged
        };
        assert_eq!(
            plan(&b, &side("XB", &a, 91), &wrong, limits()),
            Err(Error::WrongNode)
        );
        assert_eq!(
            plan(
                &b,
                &side("XB", &a, 91),
                &unchanged,
                Limits {
                    work: 1,
                    ..limits()
                }
            ),
            Err(Error::Limit)
        );
        let no_origins = [Edit {
            origins: &[],
            mapping: Mapping::Exact,
            ..a[0]
        }];
        assert_eq!(
            plan(&b, &side("XB", &no_origins, 91), &unchanged, limits()),
            Err(Error::Origin)
        );
        let bad = [origin(1, Some(0))];
        let zero = [Edit {
            origins: &bad,
            mapping: Mapping::Exact,
            ..a[0]
        }];
        assert_eq!(
            plan(&b, &side("XB", &zero, 91), &unchanged, limits()),
            Err(Error::Origin)
        );
        let collision = [origin(2, Some(1))];
        let z = [Edit {
            start: 4,
            end: 5,
            expected: "B",
            replacement: "Y",
            origins: &collision,
            mapping: Mapping::Exact,
        }];
        assert_eq!(
            plan(&b, &side("XB", &a, 91), &side("😀Y", &z, 92), limits()),
            Err(Error::Origin)
        );
        let huge = [Edit {
            replacement: "longer",
            ..a[0]
        }];
        assert_eq!(
            plan(
                &b,
                &side("longerB", &huge, 91),
                &unchanged,
                Limits {
                    text_bytes: 5,
                    ..limits()
                }
            ),
            Err(Error::Limit)
        );
        let b = base("AB");
        let a = [Edit {
            start: 0,
            end: 1,
            expected: "A",
            replacement: "XXX",
            origins: &x,
            mapping: Mapping::Exact,
        }];
        let y = [origin(2, Some(2))];
        let z = [Edit {
            start: 1,
            end: 2,
            expected: "B",
            replacement: "YYY",
            origins: &y,
            mapping: Mapping::Exact,
        }];
        assert_eq!(
            plan(
                &b,
                &side("XXXB", &a, 91),
                &side("AYYY", &z, 92),
                Limits {
                    text_bytes: 4,
                    ..limits()
                }
            ),
            Err(Error::Limit)
        );
    }

    /// Enumerate independent three-position change masks and compare complete output
    /// with an independently constructed per-position selection oracle.
    #[test]
    fn exhaustive_independent_regions_match_the_simple_per_position_oracle() {
        let b = base("ABC");
        let source_origins = [
            [origin(1, Some(1))],
            [origin(2, Some(2))],
            [origin(3, Some(3))],
        ];
        let target_origins = [
            [origin(11, Some(11))],
            [origin(12, Some(12))],
            [origin(13, Some(13))],
        ];
        for source_mask in 0..8 {
            for target_mask in 0..8 {
                let mut a = Vec::new();
                let mut z = Vec::new();
                let mut source_text = String::new();
                let mut target_text = String::new();
                let mut expected = String::new();
                for index in 0..3 {
                    let from = &b.text[index..index + 1];
                    let source_change = source_mask & (1 << index) != 0;
                    let target_change = target_mask & (1 << index) != 0;
                    source_text.push_str(if source_change { "x" } else { from });
                    target_text.push_str(if target_change { "y" } else { from });
                    expected.push_str(if target_change {
                        "y"
                    } else if source_change {
                        "x"
                    } else {
                        from
                    });
                    if source_change {
                        a.push(Edit {
                            start: index,
                            end: index + 1,
                            expected: from,
                            replacement: "x",
                            origins: &source_origins[index],
                            mapping: Mapping::Exact,
                        });
                    }
                    if target_change {
                        z.push(Edit {
                            start: index,
                            end: index + 1,
                            expected: from,
                            replacement: "y",
                            origins: &target_origins[index],
                            mapping: Mapping::Exact,
                        });
                    }
                }
                let result = merged(
                    plan(
                        &b,
                        &side(&source_text, &a, 91),
                        &side(&target_text, &z, 92),
                        limits(),
                    )
                    .unwrap(),
                );
                assert_eq!(
                    result.text, expected,
                    "source={source_mask},target={target_mask}"
                );
                assert_eq!(result.source, RevisionId([91; 32]));
                assert_eq!(result.target, RevisionId([92; 32]));
            }
        }
    }

    /// Verify a later unresolved competing region discards earlier provisional
    /// selections from the public outcome and leaves the supplied base unchanged.
    #[test]
    fn a_late_unknown_region_returns_no_earlier_partial_merge() {
        let b = base("A B C");
        let x = [origin(1, Some(1))];
        let unknown = [origin(2, None)];
        let y = [origin(3, Some(3))];
        let a = [
            Edit {
                start: 0,
                end: 1,
                expected: "A",
                replacement: "X",
                origins: &x,
                mapping: Mapping::Exact,
            },
            Edit {
                start: 2,
                end: 3,
                expected: "B",
                replacement: "Y",
                origins: &unknown,
                mapping: Mapping::Exact,
            },
        ];
        let z = [Edit {
            start: 2,
            end: 3,
            expected: "B",
            replacement: "Z",
            origins: &y,
            mapping: Mapping::Exact,
        }];
        assert_eq!(
            plan(&b, &side("X Y C", &a, 91), &side("A Z C", &z, 92), limits()).unwrap(),
            Outcome::Unresolved {
                source: 1,
                target: 0,
                reason: Reason::UnknownOrder
            }
        );
        assert_eq!(b.text, "A B C");
    }

    /// Verify side maps must be ordered/nonoverlapping and origin age cannot change
    /// between known and unknown for the same retained revision.
    #[test]
    fn unordered_or_self_overlapping_maps_and_inconsistent_origin_claims_are_rejected() {
        let b = base("AB");
        let x = [origin(1, Some(1))];
        let a = [
            Edit {
                start: 1,
                end: 2,
                expected: "B",
                replacement: "Y",
                origins: &x,
                mapping: Mapping::Exact,
            },
            Edit {
                start: 0,
                end: 1,
                expected: "A",
                replacement: "X",
                origins: &x,
                mapping: Mapping::Exact,
            },
        ];
        assert_eq!(
            plan(&b, &side("XY", &a, 91), &side("AB", &[], 92), limits()),
            Err(Error::UnorderedEdits)
        );
        let a = [
            Edit {
                start: 0,
                end: 2,
                expected: "AB",
                replacement: "X",
                origins: &x,
                mapping: Mapping::Exact,
            },
            Edit {
                start: 1,
                end: 2,
                expected: "B",
                replacement: "Y",
                origins: &x,
                mapping: Mapping::Exact,
            },
        ];
        assert_eq!(
            plan(&b, &side("XY", &a, 91), &side("AB", &[], 92), limits()),
            Err(Error::UnorderedEdits)
        );
        let unknown_same_revision = [origin(1, None)];
        let a = [Edit {
            start: 0,
            end: 1,
            expected: "A",
            replacement: "X",
            origins: &x,
            mapping: Mapping::Exact,
        }];
        let z = [Edit {
            start: 1,
            end: 2,
            expected: "B",
            replacement: "Y",
            origins: &unknown_same_revision,
            mapping: Mapping::Exact,
        }];
        assert_eq!(
            plan(&b, &side("XB", &a, 91), &side("AY", &z, 92), limits()),
            Err(Error::Origin)
        );
    }
}
