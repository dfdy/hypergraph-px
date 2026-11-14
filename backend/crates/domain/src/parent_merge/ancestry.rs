// SPDX-License-Identifier: AGPL-3.0-only
//! Bounded same-node DAG common base from supplied authenticated metadata.
//! No storage reads, source text, timestamps, inferred ancestry or publication.
use super::Budget;
use crate::records::{NodeId, RevisionId};
use std::collections::{BTreeMap, BTreeSet};

pub struct Record<'a> {
    pub revision: RevisionId,
    pub node: NodeId,
    pub parents: &'a [RevisionId],
}
#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    Limit,
    WrongNode(RevisionId),
    Duplicate(RevisionId),
    Parents(RevisionId),
    Missing(RevisionId),
    Cycle(RevisionId),
    Unrelated,
    Ambiguous(Vec<RevisionId>),
}
#[derive(Debug, PartialEq, Eq)]
pub struct CommonBase {
    pub revision: RevisionId,
    pub source_in_target: bool,
    pub target_in_source: bool,
}
fn spend(budget: &mut Budget) -> Result<(), Error> {
    budget.spend(1).map_err(|_| Error::Limit)
}
/// Input records must be authenticated and captured under application scope.
/// A work-limited/missing graph is not evidence that no further parent exists.
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
    fn id(n: u64) -> RevisionId {
        let mut bytes = [0; 32];
        bytes[..8].copy_from_slice(&n.to_le_bytes());
        RevisionId(bytes)
    }
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
    #[test]
    fn long_reversed_input_history_uses_bounded_iterative_traversal() {
        let parents: Vec<_> = (0..8192)
            .map(|n| if n == 0 { vec![] } else { vec![id(n - 1)] })
            .collect();
        let graph: Vec<_> = parents
            .iter()
            .enumerate()
            .rev()
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
