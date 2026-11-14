// SPDX-License-Identifier: AGPL-3.0-only
//! Retained passage age from supplied immediate-base mapping evidence.
//! No clock allocation, diff inference, authorship, serialization or persistence.
use super::{
    Base, Budget, Limits, Mapping, Origin,
    lineage::{Change, Trace},
};
use crate::records::{NodeId, RangeError, RevisionId, validate_byte_range};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Run {
    pub start: usize,
    pub end: usize,
    pub origins: Vec<Origin>,
    pub mapping: Mapping,
    /// Exact immediate-parent coordinate, not inferred from equal text.
    pub parent_start: Option<usize>,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Deletion {
    pub base: RevisionId,
    pub start: usize,
    pub end: usize,
    pub origin: Origin,
    pub mapping: Mapping,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Map {
    node: NodeId,
    revision: RevisionId,
    parent: Option<RevisionId>,
    publication_order: Option<u64>,
    text: String,
    runs: Vec<Run>,
    deletions: Vec<Deletion>,
    changes: Vec<Change>,
}
#[derive(Clone, Copy, Debug)]
pub enum Source {
    /// Supplied evidence establishes an actual newly changed passage.
    Fresh,
    /// Explicit same-locus unchanged bytes inside this changed base interval.
    Copy { base_start: usize },
    /// Publication is known; its passage mapping is not established.
    Unknown,
}
pub struct Piece {
    pub start: usize,
    pub end: usize,
    pub source: Source,
}
pub struct Evidence<'a> {
    pub pieces: &'a [Piece],
    /// Confidence in mapping the removed interval, including tombstones.
    pub deletion_mapping: Mapping,
}
#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    Scope,
    NoChange,
    Order,
    Range(RangeError),
    Evidence,
    Limit,
}
fn spend(budget: &mut Budget, n: usize) -> Result<(), Error> {
    budget.spend(n).map_err(|_| Error::Limit)
}
fn emit(
    runs: &mut Vec<Run>,
    start: usize,
    end: usize,
    origins: &[Origin],
    mapping: Mapping,
    parent_start: Option<usize>,
    budget: &mut Budget,
) -> Result<(), Error> {
    if start == end {
        return Ok(());
    }
    spend(budget, 1)?;
    spend(budget, origins.len())?;
    if let Some(last) = runs.last_mut() {
        let contiguous_parent = match (last.parent_start, parent_start) {
            (None, None) => true,
            (Some(old), Some(new)) => old.checked_add(last.end - last.start) == Some(new),
            _ => false,
        };
        if last.end == start
            && last.origins == origins
            && last.mapping == mapping
            && contiguous_parent
        {
            last.end = end;
            return Ok(());
        }
    }
    runs.push(Run {
        start,
        end,
        origins: origins.to_vec(),
        mapping,
        parent_start,
    });
    Ok(())
}
impl Map {
    pub fn root(base: &Base<'_>, order: Option<u64>, limits: Limits) -> Result<Self, Error> {
        if order == Some(0) {
            return Err(Error::Order);
        }
        if limits.work == 0 || base.text.len() > limits.text_bytes {
            return Err(Error::Limit);
        }
        let mut budget = Budget(limits.work);
        spend(&mut budget, base.text.len())?;
        let mut runs = Vec::new();
        emit(
            &mut runs,
            0,
            base.text.len(),
            &[Origin {
                revision: base.revision,
                order,
            }],
            Mapping::Exact,
            None,
            &mut budget,
        )?;
        Ok(Self {
            node: base.node,
            revision: base.revision,
            parent: None,
            publication_order: order,
            text: base.text.to_owned(),
            runs,
            deletions: Vec::new(),
            changes: Vec::new(),
        })
    }
    pub fn node(&self) -> NodeId {
        self.node
    }
    pub fn revision(&self) -> RevisionId {
        self.revision
    }
    pub fn parent(&self) -> Option<RevisionId> {
        self.parent
    }
    pub fn publication_order(&self) -> Option<u64> {
        self.publication_order
    }
    pub fn text(&self) -> &str {
        &self.text
    }
    pub fn runs(&self) -> &[Run] {
        &self.runs
    }
    pub fn changes(&self) -> &[Change] {
        &self.changes
    }
    pub fn deletions(&self) -> &[Deletion] {
        &self.deletions
    }
    fn copy(
        &self,
        start: usize,
        end: usize,
        output: usize,
        runs: &mut Vec<Run>,
        budget: &mut Budget,
    ) -> Result<(), Error> {
        if start == end {
            return Ok(());
        }
        spend(budget, 1)?;
        let first = self.runs.partition_point(|run| run.end <= start);
        for run in &self.runs[first..] {
            spend(budget, 1)?;
            if run.start >= end {
                break;
            }
            let low = run.start.max(start);
            let high = run.end.min(end);
            emit(
                runs,
                output + low - start,
                output + high - start,
                &run.origins,
                run.mapping,
                Some(low),
                budget,
            )?;
        }
        Ok(())
    }
    /// The new order must come from an authorized atomic node allocator.
    /// Evidence is explicit; equal bytes alone never establish a Copy.
    pub fn publish(
        &self,
        trace: &Trace<'_>,
        revision: RevisionId,
        order: u64,
        evidence: &[Evidence<'_>],
        limits: Limits,
    ) -> Result<Self, Error> {
        if trace.node() != self.node || trace.base_revision() != self.revision {
            return Err(Error::Scope);
        }
        if limits.work == 0
            || self.text.len() > limits.text_bytes
            || trace.base_text().len() > limits.text_bytes
            || trace.text().len() > limits.text_bytes
        {
            return Err(Error::Limit);
        }
        let mut budget = Budget(limits.work);
        spend(&mut budget, self.text.len())?;
        spend(&mut budget, trace.text().len())?;
        if trace.base_text() != self.text {
            return Err(Error::Scope);
        }
        if trace.changes().is_empty() {
            return Err(Error::NoChange);
        }
        if order == 0
            || self.publication_order.is_some_and(|old| old >= order)
            || revision == self.revision
        {
            return Err(Error::Order);
        }
        if trace.changes().len() != evidence.len() {
            return Err(Error::Evidence);
        }
        for run in &self.runs {
            spend(&mut budget, 1)?;
            for origin in &run.origins {
                spend(&mut budget, 1)?;
                if origin.revision == revision || origin.order.is_some_and(|old| old >= order) {
                    return Err(Error::Order);
                }
            }
        }
        let origin = Origin {
            revision,
            order: Some(order),
        };
        let mut runs = Vec::new();
        let mut deletions = Vec::new();
        let (mut cursor, mut output) = (0, 0);
        for (change, proof) in trace.changes().iter().zip(evidence) {
            spend(&mut budget, 1)?;
            spend(&mut budget, change.replacement.len())?;
            self.copy(cursor, change.start, output, &mut runs, &mut budget)?;
            output += change.start - cursor;
            let mut part_cursor = 0;
            let mut copy_cursor = change.start;
            for piece in proof.pieces {
                spend(&mut budget, 1)?;
                validate_byte_range(&change.replacement, piece.start, piece.end)
                    .map_err(Error::Range)?;
                if piece.start != part_cursor || piece.start == piece.end {
                    return Err(Error::Evidence);
                }
                let length = piece.end - piece.start;
                match piece.source {
                    Source::Fresh => emit(
                        &mut runs,
                        output + piece.start,
                        output + piece.end,
                        &[origin],
                        Mapping::Exact,
                        None,
                        &mut budget,
                    )?,
                    Source::Unknown => emit(
                        &mut runs,
                        output + piece.start,
                        output + piece.end,
                        &[origin],
                        Mapping::Unknown,
                        None,
                        &mut budget,
                    )?,
                    Source::Copy { base_start } => {
                        let base_end = base_start.checked_add(length).ok_or(Error::Limit)?;
                        validate_byte_range(&self.text, base_start, base_end)
                            .map_err(Error::Range)?;
                        if base_start < copy_cursor || base_end > change.end {
                            return Err(Error::Evidence);
                        }
                        spend(&mut budget, length)?;
                        if self.text[base_start..base_end]
                            != change.replacement[piece.start..piece.end]
                        {
                            return Err(Error::Evidence);
                        }
                        if copy_cursor < base_start {
                            spend(&mut budget, 1)?;
                            deletions.push(Deletion {
                                base: self.revision,
                                start: copy_cursor,
                                end: base_start,
                                origin,
                                mapping: proof.deletion_mapping,
                            });
                        }
                        self.copy(
                            base_start,
                            base_end,
                            output + piece.start,
                            &mut runs,
                            &mut budget,
                        )?;
                        copy_cursor = base_end;
                    }
                }
                part_cursor = piece.end;
            }
            if part_cursor != change.replacement.len() {
                return Err(Error::Evidence);
            }
            if copy_cursor < change.end {
                spend(&mut budget, 1)?;
                deletions.push(Deletion {
                    base: self.revision,
                    start: copy_cursor,
                    end: change.end,
                    origin,
                    mapping: proof.deletion_mapping,
                });
            }
            output += change.replacement.len();
            cursor = change.end;
        }
        self.copy(cursor, self.text.len(), output, &mut runs, &mut budget)?;
        Ok(Self {
            node: self.node,
            revision,
            parent: Some(self.revision),
            publication_order: Some(order),
            text: trace.text().to_owned(),
            runs,
            deletions,
            changes: trace.changes().to_vec(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parent_merge::{Edit, Outcome, Reason, Side, lineage::Splice, plan};
    fn id(n: u8) -> RevisionId {
        RevisionId([n; 32])
    }
    fn base(text: &str) -> Base<'_> {
        Base {
            node: NodeId([9; 32]),
            revision: id(1),
            text,
        }
    }
    fn limits() -> Limits {
        Limits {
            text_bytes: 4096,
            work: 100_000,
        }
    }
    fn fresh(end: usize) -> [Piece; 1] {
        [Piece {
            start: 0,
            end,
            source: Source::Fresh,
        }]
    }
    #[test]
    fn unrelated_later_publication_keeps_the_date_age_and_selects_the_real_later_date() {
        let b = base("Monday\r\nOriginal");
        let root = Map::root(&b, None, limits()).unwrap();
        let trace = Trace::new(&b, limits())
            .unwrap()
            .apply(
                b.text,
                &[Splice {
                    start: 0,
                    end: 6,
                    expected: "Monday",
                    replacement: "Tuesday",
                }],
                "Tuesday\r\nOriginal",
                limits(),
            )
            .unwrap();
        let first = root
            .publish(
                &trace,
                id(2),
                1,
                &[Evidence {
                    pieces: &fresh(7),
                    deletion_mapping: Mapping::Exact,
                }],
                limits(),
            )
            .unwrap();
        let current = Base {
            node: first.node(),
            revision: first.revision(),
            text: first.text(),
        };
        let trace = Trace::new(&current, limits())
            .unwrap()
            .apply(
                current.text,
                &[Splice {
                    start: 9,
                    end: 17,
                    expected: "Original",
                    replacement: "Later",
                }],
                "Tuesday\r\nLater",
                limits(),
            )
            .unwrap();
        let latest = first
            .publish(
                &trace,
                id(3),
                10,
                &[Evidence {
                    pieces: &fresh(5),
                    deletion_mapping: Mapping::Exact,
                }],
                limits(),
            )
            .unwrap();
        assert_eq!(
            latest.runs()[0].origins,
            [Origin {
                revision: id(2),
                order: Some(1)
            }]
        );
        assert_eq!(latest.publication_order(), Some(10));
        assert_eq!(latest.parent(), Some(id(2)));
        assert_eq!(latest.deletions()[0].base, id(2));
        assert_eq!(
            (latest.deletions()[0].start, latest.deletions()[0].end),
            (9, 17)
        );
        let target_origin = [Origin {
            revision: id(4),
            order: Some(2),
        }];
        let source_edits = [
            Edit {
                start: 0,
                end: 6,
                expected: "Monday",
                replacement: "Tuesday",
                origins: &latest.runs()[0].origins,
                mapping: latest.runs()[0].mapping,
            },
            Edit {
                start: 8,
                end: 16,
                expected: "Original",
                replacement: "Later",
                origins: &latest.runs()[2].origins,
                mapping: latest.runs()[2].mapping,
            },
        ];
        let target_edits = [Edit {
            start: 0,
            end: 6,
            expected: "Monday",
            replacement: "Wednesday",
            origins: &target_origin,
            mapping: Mapping::Exact,
        }];
        let Outcome::Merged(result) = plan(
            &b,
            &Side {
                node: b.node,
                revision: latest.revision(),
                text: latest.text(),
                edits: &source_edits,
            },
            &Side {
                node: b.node,
                revision: id(4),
                text: "Wednesday\r\nOriginal",
                edits: &target_edits,
            },
            limits(),
        )
        .unwrap() else {
            panic!()
        };
        assert_eq!(result.text, "Wednesday\r\nLater");
        assert_eq!(root.text(), b.text);
    }
    #[test]
    fn explicit_inherited_pieces_keep_age_and_are_not_recorded_as_deleted() {
        let b = base("ABCD");
        let root = Map::root(&b, Some(1), limits()).unwrap();
        let trace = Trace::new(&b, limits())
            .unwrap()
            .apply(
                b.text,
                &[Splice {
                    start: 0,
                    end: 4,
                    expected: "ABCD",
                    replacement: "ABXD",
                }],
                "ABXD",
                limits(),
            )
            .unwrap();
        let proof = [
            Piece {
                start: 0,
                end: 2,
                source: Source::Copy { base_start: 0 },
            },
            Piece {
                start: 2,
                end: 3,
                source: Source::Fresh,
            },
            Piece {
                start: 3,
                end: 4,
                source: Source::Copy { base_start: 3 },
            },
        ];
        let map = root
            .publish(
                &trace,
                id(2),
                2,
                &[Evidence {
                    pieces: &proof,
                    deletion_mapping: Mapping::Exact,
                }],
                limits(),
            )
            .unwrap();
        assert_eq!(map.runs().len(), 3);
        assert_eq!(map.runs()[0].parent_start, Some(0));
        assert_eq!(map.runs()[1].parent_start, None);
        assert_eq!(map.runs()[2].parent_start, Some(3));
        assert_eq!(map.changes(), trace.changes());
        assert_eq!(map.runs()[0].origins[0].order, Some(1));
        assert_eq!(map.runs()[1].origins[0].order, Some(2));
        assert_eq!(map.runs()[2].origins[0].order, Some(1));
        assert_eq!((map.deletions()[0].start, map.deletions()[0].end), (2, 3));
    }
    #[test]
    fn unknown_mapping_does_not_win_even_when_publication_order_is_known() {
        let b = base("A");
        let root = Map::root(&b, Some(1), limits()).unwrap();
        let trace = Trace::new(&b, limits())
            .unwrap()
            .apply(
                "A",
                &[Splice {
                    start: 0,
                    end: 1,
                    expected: "A",
                    replacement: "B",
                }],
                "B",
                limits(),
            )
            .unwrap();
        let proof = [Piece {
            start: 0,
            end: 1,
            source: Source::Unknown,
        }];
        let map = root
            .publish(
                &trace,
                id(2),
                20,
                &[Evidence {
                    pieces: &proof,
                    deletion_mapping: Mapping::Unknown,
                }],
                limits(),
            )
            .unwrap();
        assert_eq!(map.runs()[0].origins[0].order, Some(20));
        assert_eq!(map.runs()[0].mapping, Mapping::Unknown);
        let target = [Origin {
            revision: id(3),
            order: Some(10),
        }];
        let source_edit = [Edit {
            start: 0,
            end: 1,
            expected: "A",
            replacement: "B",
            origins: &map.runs()[0].origins,
            mapping: map.runs()[0].mapping,
        }];
        let target_edit = [Edit {
            start: 0,
            end: 1,
            expected: "A",
            replacement: "C",
            origins: &target,
            mapping: Mapping::Exact,
        }];
        assert_eq!(
            plan(
                &b,
                &Side {
                    node: b.node,
                    revision: id(2),
                    text: "B",
                    edits: &source_edit
                },
                &Side {
                    node: b.node,
                    revision: id(3),
                    text: "C",
                    edits: &target_edit
                },
                limits()
            )
            .unwrap(),
            Outcome::Unresolved {
                source: 0,
                target: 0,
                reason: Reason::UnknownMapping
            }
        );
        let equal = [Edit {
            replacement: "B",
            ..target_edit[0]
        }];
        let Outcome::Merged(result) = plan(
            &b,
            &Side {
                node: b.node,
                revision: id(2),
                text: "B",
                edits: &source_edit,
            },
            &Side {
                node: b.node,
                revision: id(3),
                text: "B",
                edits: &equal,
            },
            limits(),
        )
        .unwrap() else {
            panic!()
        };
        assert_eq!(result.edits[0].mapping, Mapping::Unknown);
    }
    #[test]
    fn deletion_and_genuine_reversion_keep_new_edge_evidence_and_old_history() {
        let b = base("Tuesday");
        let root = Map::root(&b, Some(2), limits()).unwrap();
        let trace = Trace::new(&b, limits())
            .unwrap()
            .apply(
                b.text,
                &[Splice {
                    start: 0,
                    end: 7,
                    expected: "Tuesday",
                    replacement: "Monday",
                }],
                "Monday",
                limits(),
            )
            .unwrap();
        let reverted = root
            .publish(
                &trace,
                id(3),
                3,
                &[Evidence {
                    pieces: &fresh(6),
                    deletion_mapping: Mapping::Exact,
                }],
                limits(),
            )
            .unwrap();
        assert_eq!(reverted.runs()[0].origins[0].order, Some(3));
        let base = Base {
            node: reverted.node(),
            revision: id(3),
            text: reverted.text(),
        };
        let trace = Trace::new(&base, limits())
            .unwrap()
            .apply(
                "Monday",
                &[Splice {
                    start: 0,
                    end: 6,
                    expected: "Monday",
                    replacement: "",
                }],
                "",
                limits(),
            )
            .unwrap();
        let deleted = reverted
            .publish(
                &trace,
                id(4),
                4,
                &[Evidence {
                    pieces: &[],
                    deletion_mapping: Mapping::Exact,
                }],
                limits(),
            )
            .unwrap();
        assert_eq!(deleted.text(), "");
        assert!(deleted.runs().is_empty());
        assert_eq!(
            deleted.deletions()[0].origin,
            Origin {
                revision: id(4),
                order: Some(4)
            }
        );
        assert_eq!(root.text(), "Tuesday");
        assert_eq!(reverted.text(), "Monday");
    }
    #[test]
    fn malformed_evidence_scope_orders_and_limits_fail_without_changing_the_map() {
        let b = base("A😀B");
        let root = Map::root(&b, Some(1), limits()).unwrap();
        let trace = Trace::new(&b, limits())
            .unwrap()
            .apply(
                b.text,
                &[Splice {
                    start: 1,
                    end: 5,
                    expected: "😀",
                    replacement: "中",
                }],
                "A中B",
                limits(),
            )
            .unwrap();
        let proof = [Evidence {
            pieces: &fresh(3),
            deletion_mapping: Mapping::Exact,
        }];
        assert_eq!(
            root.publish(&trace, id(2), 1, &proof, limits()),
            Err(Error::Order)
        );
        assert_eq!(
            root.publish(&trace, id(1), 2, &proof, limits()),
            Err(Error::Order)
        );
        assert_eq!(
            root.publish(&trace, id(2), 2, &[], limits()),
            Err(Error::Evidence)
        );
        assert_eq!(
            root.publish(
                &trace,
                id(2),
                2,
                &proof,
                Limits {
                    work: 1,
                    ..limits()
                }
            ),
            Err(Error::Limit)
        );
        let broken = [Piece {
            start: 1,
            end: 3,
            source: Source::Fresh,
        }];
        assert!(matches!(
            root.publish(
                &trace,
                id(2),
                2,
                &[Evidence {
                    pieces: &broken,
                    deletion_mapping: Mapping::Exact
                }],
                limits()
            ),
            Err(Error::Range(_))
        ));
        let wrong = Base {
            node: NodeId([8; 32]),
            ..b
        };
        let trace_wrong = Trace::new(&wrong, limits()).unwrap();
        assert_eq!(
            root.publish(&trace_wrong, id(2), 2, &[], limits()),
            Err(Error::Scope)
        );
        assert_eq!(root.text(), "A😀B");
        assert_eq!(
            root.publish(&Trace::new(&b, limits()).unwrap(), id(2), 2, &[], limits()),
            Err(Error::NoChange)
        );
    }
    #[test]
    fn copying_equal_bytes_from_another_locus_cannot_forge_inheritance() {
        let b = base("AA");
        let root = Map::root(&b, Some(1), limits()).unwrap();
        let trace = Trace::new(&b, limits())
            .unwrap()
            .apply(
                "AA",
                &[Splice {
                    start: 1,
                    end: 2,
                    expected: "A",
                    replacement: "AB",
                }],
                "AAB",
                limits(),
            )
            .unwrap();
        let forged = [
            Piece {
                start: 0,
                end: 1,
                source: Source::Copy { base_start: 0 },
            },
            Piece {
                start: 1,
                end: 2,
                source: Source::Fresh,
            },
        ];
        assert_eq!(
            root.publish(
                &trace,
                id(2),
                2,
                &[Evidence {
                    pieces: &forged,
                    deletion_mapping: Mapping::Exact
                }],
                limits()
            ),
            Err(Error::Evidence)
        );
    }
}
