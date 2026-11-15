// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Common base from supplied same-node history
//!
//! Find a unique maximal common ancestor of two retained versions using only
//! explicit parent metadata, rejecting incomplete or ambiguous evidence.
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
//! Used by: Storage branch common-base inspection and domain ancestry/Merge tests.
//!
//! Specification:
//! - [Same-node planning responsibilities][domain]
//! - [Parent-Merge algorithm][merge]
//! - [Authenticated common-base boundary][inspection]
//!
//! Boundary: The caller authenticates/scopes records before pure planning. Traversal
//! checks the two reachable histories, not every unrelated subgraph. Missing data
//! or spent work is not proof of unrelatedness; inclusion cycles are a separate relation.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/parent_merge/ancestry.rs
//! [domain]: ../../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [merge]: ../../../../../docs/07-implementation/algorithms/parent-merge.md
//! [inspection]: ../../../../../docs/06-subsystems/interfaces/domain-navigation.md#authenticated-bounded-common-base-inspection
use super::Budget;
use crate::records::{NodeId, RevisionId};
use std::collections::{BTreeMap, BTreeSet};

/// Supplied metadata for one exact same-node revision; no source text is loaded.
pub struct Record<'a> {
    /// Exact retained revision identity, not a timestamp or moving head.
    pub revision: RevisionId,

    /// Logical node shared by every supplied record.
    pub node: NodeId,

    /// Zero, one or two distinct same-node parent revision identities.
    pub parents: &'a [RevisionId],
}

/// Why the supplied history cannot establish a unique bounded common base.
#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    /// Logical work allowance is exhausted before a complete conclusion.
    Limit,
    /// A supplied record belongs to another logical node.
    WrongNode(RevisionId),
    /// More than one input record claims the same revision identity.
    Duplicate(RevisionId),
    /// Invalid parent shape: more than two parents or a repeated pair.
    Parents(RevisionId),
    /// A required tip or reachable parent has no supplied record.
    Missing(RevisionId),
    /// Reachable same-node revision ancestry closes a cycle.
    Cycle(RevisionId),
    /// Complete bounded traversal establishes no common ancestor.
    Unrelated,
    /// Several incomparable maximal common ancestors remain; no root fallback.
    Ambiguous(Vec<RevisionId>),
}

/// Unique maximal common revision plus inclusive reachability of the input tips.
#[derive(Debug, PartialEq, Eq)]
pub struct CommonBase {
    /// Exact retained revision identity, not a timestamp or moving head.
    pub revision: RevisionId,

    /// Source is an ancestor of target, including equality of both tips.
    pub source_in_target: bool,

    /// Target is an ancestor of source, including equality of both tips.
    pub target_in_source: bool,
}

/// Charge one logical ancestry operation; report explicit exhaustion rather
/// than interpreting a truncated history as complete.
fn spend(budget: &mut Budget) -> Result<(), Error> {
    // Translate the shared accounting failure into this module’s explicit limit.
    budget.spend(1).map_err(|_| Error::Limit)
}

/// Input records must be authenticated and captured under application scope.
/// A work-limited/missing graph is not evidence that no further parent exists.
/// Validate supplied same-node metadata, traverse both tips iteratively and
/// return their unique maximal common ancestor or explicit failure/ambiguity.
pub fn common_base(
    node: NodeId,
    source: RevisionId,
    target: RevisionId,
    records: &[Record<'_>],
    work: usize,
) -> Result<CommonBase, Error> {
    if work == 0 {
        return Err(Error::Limit);
    }
    let mut budget = Budget(work);
    let mut index = BTreeMap::new();
    for record in records {
        spend(&mut budget)?;
        if record.node != node {
            return Err(Error::WrongNode(record.revision));
        }
        if record.parents.len() > 2
            || record.parents.len() == 2 && record.parents[0] == record.parents[1]
        {
            return Err(Error::Parents(record.revision));
        }
        if index.insert(record.revision, record).is_some() {
            return Err(Error::Duplicate(record.revision));
        }
    }
    // false = entered but not completed; true = completed. The explicit stack
    // keeps a long linear history independent of the native call-stack depth.
    let mut state = BTreeMap::new();
    let mut order = Vec::new();
    let mut stack = vec![(target, false), (source, false)];
    while let Some((revision, exiting)) = stack.pop() {
        spend(&mut budget)?;
        if exiting {
            state.insert(revision, true);
            order.push(revision);
            continue;
        }
        match state.get(&revision) {
            Some(true) => continue,
            Some(false) => return Err(Error::Cycle(revision)),
            None => {}
        }
        let record = index.get(&revision).ok_or(Error::Missing(revision))?;
        state.insert(revision, false);
        stack.push((revision, true));
        for parent in record.parents.iter().rev() {
            spend(&mut budget)?;
            stack.push((*parent, false));
        }
    }

    // Propagate one bit per input tip in child-before-parent order. Both bits
    // mean the revision is reachable from both, independent of input row order.
    let mut marks = BTreeMap::new();
    marks.insert(source, 1u8);
    *marks.entry(target).or_insert(0) |= 2;
    for revision in order.iter().rev() {
        spend(&mut budget)?;
        let mark = marks[revision];
        for parent in index[revision].parents {
            spend(&mut budget)?;
            *marks.entry(*parent).or_insert(0) |= mark;
        }
    }
    let source_in_target = marks[&source] & 2 != 0;
    let target_in_source = marks[&target] & 1 != 0;
    let mut common = BTreeSet::new();
    for (&revision, &mark) in &marks {
        spend(&mut budget)?;
        if mark == 3 {
            common.insert(revision);
        }
    }

    // Common ancestry is parent-closed: remove common parents of a common
    // revision, leaving only maximal (nearest incomparable) common candidates.
    let mut nonmaximal = BTreeSet::new();
    for revision in &common {
        spend(&mut budget)?;
        for parent in index[revision].parents {
            spend(&mut budget)?;
            nonmaximal.insert(*parent);
        }
    }
    let mut maximal = Vec::new();
    for revision in common {
        spend(&mut budget)?;
        if !nonmaximal.contains(&revision) {
            maximal.push(revision);
        }
    }

    // A timestamp or opaque revision ID cannot choose among incomparable bases.
    match maximal.len() {
        0 => Err(Error::Unrelated),
        1 => Ok(CommonBase {
            revision: maximal[0],
            source_in_target,
            target_in_source,
        }),
        _ => Err(Error::Ambiguous(maximal)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const NODE: NodeId = NodeId([8; 32]);
    /// Construct distinct deterministic revision fixtures without treating their
    /// byte order as historical recency.
    fn id(n: u64) -> RevisionId {
        let mut bytes = [0; 32];
        bytes[..8].copy_from_slice(&n.to_le_bytes());
        RevisionId(bytes)
    }

    /// Verify actual DAG reachability selects the retained common base through
    /// divergence, repeated merge and equal-tip cases.
    #[test]
    fn divergent_and_repeated_merge_use_the_actual_dag_base() {
        let root = Record {
            revision: id(1),
            node: NODE,
            parents: &[],
        };
        let s = [id(1)];
        let p = [id(1)];
        let m = [id(3), id(2)];
        let s2 = [id(2)];
        let graph = [
            root,
            Record {
                revision: id(2),
                node: NODE,
                parents: &s,
            },
            Record {
                revision: id(3),
                node: NODE,
                parents: &p,
            },
            Record {
                revision: id(4),
                node: NODE,
                parents: &m,
            },
            Record {
                revision: id(5),
                node: NODE,
                parents: &s2,
            },
        ];
        assert_eq!(
            common_base(NODE, id(2), id(3), &graph, 200).unwrap(),
            CommonBase {
                revision: id(1),
                source_in_target: false,
                target_in_source: false
            }
        );
        assert_eq!(
            common_base(NODE, id(2), id(4), &graph, 200).unwrap(),
            CommonBase {
                revision: id(2),
                source_in_target: true,
                target_in_source: false
            }
        );
        assert_eq!(
            common_base(NODE, id(5), id(4), &graph, 200)
                .unwrap()
                .revision,
            id(2)
        );
        assert_eq!(
            common_base(NODE, id(4), id(4), &graph, 200).unwrap(),
            CommonBase {
                revision: id(4),
                source_in_target: true,
                target_in_source: true
            }
        );
    }

    /// Verify criss-cross histories report all incomparable maximal candidates
    /// instead of silently selecting an older creation root.
    #[test]
    fn incomparable_maximal_bases_are_not_replaced_with_the_creation_root() {
        let p = [id(1)];
        let x = [id(2), id(3)];
        let y = [id(3), id(2)];
        let graph = [
            Record {
                revision: id(1),
                node: NODE,
                parents: &[],
            },
            Record {
                revision: id(2),
                node: NODE,
                parents: &p,
            },
            Record {
                revision: id(3),
                node: NODE,
                parents: &p,
            },
            Record {
                revision: id(4),
                node: NODE,
                parents: &x,
            },
            Record {
                revision: id(5),
                node: NODE,
                parents: &y,
            },
        ];
        assert_eq!(
            common_base(NODE, id(4), id(5), &graph, 200),
            Err(Error::Ambiguous(vec![id(2), id(3)]))
        );
    }

    /// Verify missing parents, reachable cycles, wrong-node records, duplicate
    /// identities and invalid parent lists fail explicitly.
    #[test]
    fn missing_records_cycles_scope_and_invalid_parent_shapes_fail_closed() {
        let missing = [id(9)];
        let graph = [Record {
            revision: id(1),
            node: NODE,
            parents: &missing,
        }];
        assert_eq!(
            common_base(NODE, id(1), id(1), &graph, 100),
            Err(Error::Missing(id(9)))
        );
        let cycle = [id(1)];
        let graph = [Record {
            revision: id(1),
            node: NODE,
            parents: &cycle,
        }];
        assert_eq!(
            common_base(NODE, id(1), id(1), &graph, 100),
            Err(Error::Cycle(id(1)))
        );
        let graph = [Record {
            revision: id(1),
            node: NodeId([9; 32]),
            parents: &[],
        }];
        assert_eq!(
            common_base(NODE, id(1), id(1), &graph, 100),
            Err(Error::WrongNode(id(1)))
        );
        let duplicate = [id(2), id(2)];
        let graph = [Record {
            revision: id(1),
            node: NODE,
            parents: &duplicate,
        }];
        assert_eq!(
            common_base(NODE, id(1), id(1), &graph, 100),
            Err(Error::Parents(id(1)))
        );
        let too_many = [id(2), id(3), id(4)];
        let graph = [Record {
            revision: id(1),
            node: NODE,
            parents: &too_many,
        }];
        assert_eq!(
            common_base(NODE, id(1), id(1), &graph, 100),
            Err(Error::Parents(id(1)))
        );
        let graph = [
            Record {
                revision: id(1),
                node: NODE,
                parents: &[],
            },
            Record {
                revision: id(1),
                node: NODE,
                parents: &[],
            },
        ];
        assert_eq!(
            common_base(NODE, id(1), id(1), &graph, 100),
            Err(Error::Duplicate(id(1)))
        );
    }

    /// Distinguish exhausted traversal from a complete proof of unrelated tips.
    #[test]
    fn insufficient_work_does_not_claim_unrelated_or_complete_ancestry() {
        let graph = [
            Record {
                revision: id(1),
                node: NODE,
                parents: &[],
            },
            Record {
                revision: id(2),
                node: NODE,
                parents: &[],
            },
        ];
        assert_eq!(
            common_base(NODE, id(1), id(2), &graph, 0),
            Err(Error::Limit)
        );
        assert_eq!(
            common_base(NODE, id(1), id(2), &graph, 1),
            Err(Error::Limit)
        );
        assert_eq!(
            common_base(NODE, id(1), id(2), &graph, 100),
            Err(Error::Unrelated)
        );
    }

    /// Check a long reverse-ordered linear history without native recursion,
    /// and verify an insufficient logical allowance remains a limit error.
    #[test]
    fn long_reversed_input_history_uses_bounded_iterative_traversal() {
        let parents: Vec<_> = (0..8192)
            // Build a linear parent chain without recursive native calls.
            .map(|n| if n == 0 { vec![] } else { vec![id(n - 1)] })
            .collect();
        let graph: Vec<_> = parents
            .iter()
            .enumerate()
            .rev()
            // Supply records in reverse order to test order-independent lookup.
            .map(|(n, parents)| Record {
                revision: id(n as u64),
                node: NODE,
                parents,
            })
            .collect();
        assert_eq!(
            common_base(NODE, id(8191), id(4095), &graph, 200_000).unwrap(),
            CommonBase {
                revision: id(4095),
                source_in_target: false,
                target_in_source: true
            }
        );
        assert_eq!(
            common_base(NODE, id(8191), id(4095), &graph, 8192),
            Err(Error::Limit)
        );
    }
}
