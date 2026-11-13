// SPDX-License-Identifier: AGPL-3.0-only
//! Compact immediate-base working lineage from supplied exact UTF8 splices.
//! No serialization, clocks, historical diff inference or persistent mutation.
use super::{Base, Budget, Limits};
use crate::records::{NodeId, RangeError, RevisionId, validate_byte_range};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Change {
    pub start: usize,
    pub end: usize,
    pub replacement: String,
}
pub struct Splice<'a> {
    pub start: usize,
    pub end: usize,
    pub expected: &'a str,
    pub replacement: &'a str,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Trace<'a> {
    node: NodeId,
    revision: RevisionId,
    base: &'a str,
    text: String,
    changes: Vec<Change>,
}
#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    Stale,
    Range(RangeError),
    Quote,
    Reconstruction,
    NonCanonical,
    Limit,
}
#[derive(Clone, Copy)]
enum Piece<'a> {
    Base { start: usize, end: usize },
    Added(&'a str),
}
impl Piece<'_> {
    fn len(self) -> usize {
        match self {
            Self::Base { start, end } => end - start,
            Self::Added(text) => text.len(),
        }
    }
}
fn spend(budget: &mut Budget, amount: usize) -> Result<(), Error> {
    budget.spend(amount).map_err(|_| Error::Limit)
}
fn render(
    base: &str,
    pieces: &[Piece<'_>],
    limits: Limits,
    budget: &mut Budget,
) -> Result<String, Error> {
    let mut length = 0usize;
    for piece in pieces {
        spend(budget, 1)?;
        length = length.checked_add(piece.len()).ok_or(Error::Limit)?;
    }
    if length > limits.text_bytes {
        return Err(Error::Limit);
    }
    spend(budget, length)?;
    let mut text = String::with_capacity(length);
    for &piece in pieces {
        match piece {
            Piece::Base { start, end } => text.push_str(&base[start..end]),
            Piece::Added(value) => text.push_str(value),
        }
    }
    Ok(text)
}
fn pieces<'a>(
    base: &str,
    changes: &'a [Change],
    budget: &mut Budget,
) -> Result<Vec<Piece<'a>>, Error> {
    let mut result = Vec::new();
    let mut cursor = 0;
    for change in changes {
        spend(budget, 1)?;
        validate_byte_range(base, change.start, change.end).map_err(Error::Range)?;
        if change.start < cursor {
            return Err(Error::NonCanonical);
        }
        if cursor < change.start {
            spend(budget, 1)?;
            result.push(Piece::Base {
                start: cursor,
                end: change.start,
            });
        }
        if !change.replacement.is_empty() {
            spend(budget, 1)?;
            result.push(Piece::Added(&change.replacement));
        }
        cursor = change.end;
    }
    if cursor < base.len() {
        spend(budget, 1)?;
        result.push(Piece::Base {
            start: cursor,
            end: base.len(),
        });
    }
    Ok(result)
}
fn slice<'a>(
    input: &[Piece<'a>],
    start: usize,
    end: usize,
    budget: &mut Budget,
) -> Result<Vec<Piece<'a>>, Error> {
    let mut result = Vec::new();
    let mut offset = 0usize;
    for &piece in input {
        spend(budget, 1)?;
        let next = offset.checked_add(piece.len()).ok_or(Error::Limit)?;
        let from = start.max(offset);
        let to = end.min(next);
        if from < to {
            spend(budget, 1)?;
            let low = from - offset;
            let high = to - offset;
            result.push(match piece {
                Piece::Base { start, .. } => Piece::Base {
                    start: start + low,
                    end: start + high,
                },
                Piece::Added(text) => Piece::Added(&text[low..high]),
            });
        }
        offset = next;
    }
    Ok(result)
}
fn flush(
    base: &str,
    start: usize,
    end: usize,
    pending: &mut String,
    changes: &mut Vec<Change>,
    budget: &mut Budget,
) -> Result<(), Error> {
    spend(budget, end - start)?;
    // Exact immediate-base restoration cancels uncommitted work, not history.
    if *pending == base[start..end] {
        pending.clear();
        return Ok(());
    }
    spend(budget, 1)?;
    changes.push(Change {
        start,
        end,
        replacement: std::mem::take(pending),
    });
    Ok(())
}
fn normalize(base: &str, input: &[Piece<'_>], budget: &mut Budget) -> Result<Vec<Change>, Error> {
    let mut changes = Vec::new();
    let mut pending = String::new();
    let mut cursor = 0;
    for &piece in input {
        spend(budget, 1)?;
        match piece {
            Piece::Added(text) => {
                spend(budget, text.len())?;
                pending.push_str(text);
            }
            Piece::Base { start, end } => {
                if start < cursor {
                    return Err(Error::NonCanonical);
                }
                if cursor < start || !pending.is_empty() {
                    flush(base, cursor, start, &mut pending, &mut changes, budget)?;
                }
                cursor = end;
            }
        }
    }
    if cursor < base.len() || !pending.is_empty() {
        flush(base, cursor, base.len(), &mut pending, &mut changes, budget)?;
    }
    Ok(changes)
}
impl<'a> Trace<'a> {
    pub fn new(base: &Base<'a>, limits: Limits) -> Result<Self, Error> {
        if base.text.len() > limits.text_bytes || limits.work == 0 {
            return Err(Error::Limit);
        }
        let mut budget = Budget(limits.work);
        spend(&mut budget, base.text.len())?;
        Ok(Self {
            node: base.node,
            revision: base.revision,
            base: base.text,
            text: base.text.to_owned(),
            changes: Vec::new(),
        })
    }
    pub fn node(&self) -> NodeId {
        self.node
    }
    pub fn base_revision(&self) -> RevisionId {
        self.revision
    }
    pub fn base_text(&self) -> &str {
        self.base
    }
    pub fn text(&self) -> &str {
        &self.text
    }
    pub fn changes(&self) -> &[Change] {
        &self.changes
    }
    /// Adapter restores a compact trace only after record/context authentication.
    pub fn restore(
        base: &Base<'a>,
        text: &str,
        changes: &[Change],
        limits: Limits,
    ) -> Result<Self, Error> {
        if base.text.len() > limits.text_bytes || text.len() > limits.text_bytes || limits.work == 0
        {
            return Err(Error::Limit);
        }
        let mut budget = Budget(limits.work);
        spend(&mut budget, text.len())?;
        let input = pieces(base.text, changes, &mut budget)?;
        let reconstructed = render(base.text, &input, limits, &mut budget)?;
        if reconstructed != text {
            return Err(Error::Reconstruction);
        }
        let canonical = normalize(base.text, &input, &mut budget)?;
        if canonical != changes {
            return Err(Error::NonCanonical);
        }
        Ok(Self {
            node: base.node,
            revision: base.revision,
            base: base.text,
            text: reconstructed,
            changes: canonical,
        })
    }
    /// Each splice addresses the preceding intermediate text, not the original
    /// batch buffer. A failure returns no new trace and leaves self untouched.
    pub fn apply(
        &self,
        expected_current: &str,
        splices: &[Splice<'_>],
        expected_after: &str,
        limits: Limits,
    ) -> Result<Self, Error> {
        if [
            self.base.len(),
            self.text.len(),
            expected_current.len(),
            expected_after.len(),
        ]
        .iter()
        .any(|&size| size > limits.text_bytes)
            || limits.work == 0
        {
            return Err(Error::Limit);
        }
        let mut budget = Budget(limits.work);
        spend(&mut budget, expected_current.len())?;
        if expected_current != self.text {
            return Err(Error::Stale);
        }
        let mut current = pieces(self.base, &self.changes, &mut budget)?;
        for edit in splices {
            spend(&mut budget, 1)?;
            let text = render(self.base, &current, limits, &mut budget)?;
            validate_byte_range(&text, edit.start, edit.end).map_err(Error::Range)?;
            spend(&mut budget, edit.expected.len())?;
            if text[edit.start..edit.end] != *edit.expected {
                return Err(Error::Quote);
            }
            if edit.expected == edit.replacement {
                continue;
            }
            let size = text
                .len()
                .checked_sub(edit.end - edit.start)
                .and_then(|n| n.checked_add(edit.replacement.len()))
                .ok_or(Error::Limit)?;
            if size > limits.text_bytes {
                return Err(Error::Limit);
            }
            let mut next = slice(&current, 0, edit.start, &mut budget)?;
            if !edit.replacement.is_empty() {
                spend(&mut budget, 1)?;
                next.push(Piece::Added(edit.replacement));
            }
            next.extend(slice(&current, edit.end, text.len(), &mut budget)?);
            current = next;
        }
        let text = render(self.base, &current, limits, &mut budget)?;
        spend(&mut budget, expected_after.len())?;
        if text != expected_after {
            return Err(Error::Reconstruction);
        }
        let changes = normalize(self.base, &current, &mut budget)?;
        Ok(Self {
            node: self.node,
            revision: self.revision,
            base: self.base,
            text,
            changes,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parent_merge::{Edit, Mapping, Origin, Outcome, Side, plan};
    fn base(text: &str) -> Base<'_> {
        Base {
            node: NodeId([1; 32]),
            revision: RevisionId([2; 32]),
            text,
        }
    }
    fn limits() -> Limits {
        Limits {
            text_bytes: 4096,
            work: 100_000,
        }
    }
    #[test]
    fn repeated_passages_keep_exact_owned_base_offsets_and_mixed_bytes() {
        let b = base("A😀\r\n中\rA😀");
        let trace = Trace::new(&b, limits()).unwrap();
        let start = b.text.rfind('😀').unwrap();
        let next = trace
            .apply(
                b.text,
                &[Splice {
                    start,
                    end: start + 4,
                    expected: "😀",
                    replacement: "e\u{301}",
                }],
                "A😀\r\n中\rAe\u{301}",
                limits(),
            )
            .unwrap();
        assert_eq!(
            next.changes(),
            &[Change {
                start,
                end: start + 4,
                replacement: "e\u{301}".into()
            }]
        );
        assert_eq!(next.node(), b.node);
        assert_eq!(next.base_revision(), b.revision);
        assert_eq!(trace.text(), b.text);
        assert_eq!(
            Trace::restore(&b, next.text(), next.changes(), limits()).unwrap(),
            next
        );
    }
    #[test]
    fn sequential_splices_compose_across_inserted_and_copied_fragments() {
        let b = base("ABCDE");
        let original = Trace::new(&b, limits()).unwrap();
        let first = original
            .apply(
                "ABCDE",
                &[Splice {
                    start: 1,
                    end: 4,
                    expected: "BCD",
                    replacement: "xy",
                }],
                "AxyE",
                limits(),
            )
            .unwrap();
        let final_trace = first
            .apply(
                "AxyE",
                &[Splice {
                    start: 2,
                    end: 4,
                    expected: "yE",
                    replacement: "Z",
                }],
                "AxZ",
                limits(),
            )
            .unwrap();
        assert_eq!(
            final_trace.changes(),
            &[Change {
                start: 1,
                end: 5,
                replacement: "xZ".into()
            }]
        );
        // Undo restores the matching prior trace, not inferred character origin.
        let undo = Trace::restore(&b, first.text(), first.changes(), limits()).unwrap();
        assert_eq!(undo, first);
        let batch = original
            .apply(
                "ABCDE",
                &[
                    Splice {
                        start: 1,
                        end: 4,
                        expected: "BCD",
                        replacement: "xy",
                    },
                    Splice {
                        start: 2,
                        end: 4,
                        expected: "yE",
                        replacement: "Z",
                    },
                ],
                "AxZ",
                limits(),
            )
            .unwrap();
        assert_eq!(batch, final_trace);
    }
    #[test]
    fn deletion_and_adjacent_splices_are_compact_and_immediate_base_restore_cancels() {
        let b = base("ABCD");
        let trace = Trace::new(&b, limits()).unwrap();
        let next = trace
            .apply(
                "ABCD",
                &[
                    Splice {
                        start: 1,
                        end: 2,
                        expected: "B",
                        replacement: "",
                    },
                    Splice {
                        start: 1,
                        end: 2,
                        expected: "C",
                        replacement: "X",
                    },
                ],
                "AXD",
                limits(),
            )
            .unwrap();
        assert_eq!(
            next.changes(),
            &[Change {
                start: 1,
                end: 3,
                replacement: "X".into()
            }]
        );
        let reverted = next
            .apply(
                "AXD",
                &[Splice {
                    start: 1,
                    end: 2,
                    expected: "X",
                    replacement: "BC",
                }],
                "ABCD",
                limits(),
            )
            .unwrap();
        assert_eq!(reverted.changes(), &[]);
        assert_eq!(reverted, trace);
        let no_op = trace
            .apply(
                "ABCD",
                &[Splice {
                    start: 1,
                    end: 3,
                    expected: "BC",
                    replacement: "BC",
                }],
                "ABCD",
                limits(),
            )
            .unwrap();
        assert_eq!(no_op, trace);
    }
    #[test]
    fn a_reversion_after_a_commit_is_a_new_immediate_base_change() {
        let b = base("Tuesday");
        let trace = Trace::new(&b, limits()).unwrap();
        let reverted = trace
            .apply(
                "Tuesday",
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
        assert_eq!(reverted.changes().len(), 1);
        assert_eq!(reverted.changes()[0].replacement, "Monday");
        // Known trace offsets feed the selector; it still receives its origins
        // from a future authenticated Commit adapter, never from this trace.
        let origins = [Origin {
            revision: RevisionId([3; 32]),
            order: Some(4),
        }];
        let edits: Vec<_> = reverted
            .changes()
            .iter()
            .map(|change| Edit {
                start: change.start,
                end: change.end,
                expected: &b.text[change.start..change.end],
                replacement: &change.replacement,
                origins: &origins,
                mapping: Mapping::Exact,
            })
            .collect();
        let source = Side {
            node: b.node,
            revision: RevisionId([3; 32]),
            text: reverted.text(),
            edits: &edits,
        };
        let target = Side {
            node: b.node,
            revision: b.revision,
            text: b.text,
            edits: &[],
        };
        let Outcome::Merged(result) = plan(&b, &source, &target, limits()).unwrap() else {
            panic!()
        };
        assert_eq!(result.text, "Monday");
        assert_eq!(result.edits[0].origins, origins);
    }
    #[test]
    fn stale_quotes_split_scalars_final_mismatch_and_limits_leave_original_untouched() {
        let b = base("😀B");
        let trace = Trace::new(&b, limits()).unwrap();
        assert_eq!(
            trace.apply("other", &[], "other", limits()),
            Err(Error::Stale)
        );
        assert_eq!(
            trace.apply(
                b.text,
                &[Splice {
                    start: 0,
                    end: 4,
                    expected: "wrong",
                    replacement: "X"
                }],
                "XB",
                limits()
            ),
            Err(Error::Quote)
        );
        assert_eq!(
            trace.apply(
                b.text,
                &[Splice {
                    start: 1,
                    end: 4,
                    expected: "",
                    replacement: "X"
                }],
                "XB",
                limits()
            ),
            Err(Error::Range(RangeError::SplitScalar))
        );
        assert_eq!(
            trace.apply(b.text, &[], "wrong", limits()),
            Err(Error::Reconstruction)
        );
        assert_eq!(
            trace.apply(
                b.text,
                &[],
                b.text,
                Limits {
                    work: 1,
                    ..limits()
                }
            ),
            Err(Error::Limit)
        );
        assert_eq!(
            trace.apply(
                b.text,
                &[Splice {
                    start: 0,
                    end: 4,
                    expected: "😀",
                    replacement: "lengthy"
                }],
                "lengthyB",
                Limits {
                    text_bytes: 5,
                    ..limits()
                }
            ),
            Err(Error::Limit)
        );
        let batch = [
            Splice {
                start: 4,
                end: 5,
                expected: "B",
                replacement: "X",
            },
            Splice {
                start: 4,
                end: 5,
                expected: "B",
                replacement: "Y",
            },
        ];
        assert_eq!(
            trace.apply(b.text, &batch, "😀Y", limits()),
            Err(Error::Quote)
        );
        assert_eq!(trace.text(), b.text);
        assert!(trace.changes().is_empty());
    }
    #[test]
    fn restore_rejects_noncanonical_or_inconsistent_state_instead_of_rewriting_it() {
        let b = base("AB");
        let same = [Change {
            start: 0,
            end: 1,
            replacement: "A".into(),
        }];
        assert_eq!(
            Trace::restore(&b, "AB", &same, limits()),
            Err(Error::NonCanonical)
        );
        let adjacent = [
            Change {
                start: 0,
                end: 1,
                replacement: "X".into(),
            },
            Change {
                start: 1,
                end: 2,
                replacement: "Y".into(),
            },
        ];
        assert_eq!(
            Trace::restore(&b, "XY", &adjacent, limits()),
            Err(Error::NonCanonical)
        );
        let reversed = [
            Change {
                start: 1,
                end: 2,
                replacement: "Y".into(),
            },
            Change {
                start: 0,
                end: 1,
                replacement: "X".into(),
            },
        ];
        assert_eq!(
            Trace::restore(&b, "XY", &reversed, limits()),
            Err(Error::NonCanonical)
        );
        assert_eq!(
            Trace::restore(&b, "wrong", &[], limits()),
            Err(Error::Reconstruction)
        );
    }
    #[test]
    fn exhaustive_single_splice_and_exact_inverse_preserve_the_original_trace() {
        let b = base("ABA");
        for start in 0..=b.text.len() {
            for end in start..=b.text.len() {
                for replacement in ["", "A", "x", "😀", "\r\n"] {
                    let trace = Trace::new(&b, limits()).unwrap();
                    let expected = format!("{}{}{}", &b.text[..start], replacement, &b.text[end..]);
                    let changed = trace
                        .apply(
                            b.text,
                            &[Splice {
                                start,
                                end,
                                expected: &b.text[start..end],
                                replacement,
                            }],
                            &expected,
                            limits(),
                        )
                        .unwrap();
                    assert_eq!(changed.text(), expected);
                    assert_eq!(
                        Trace::restore(&b, changed.text(), changed.changes(), limits()).unwrap(),
                        changed
                    );
                    let inverse = changed
                        .apply(
                            &expected,
                            &[Splice {
                                start,
                                end: start + replacement.len(),
                                expected: replacement,
                                replacement: &b.text[start..end],
                            }],
                            b.text,
                            limits(),
                        )
                        .unwrap();
                    assert_eq!(inverse, trace, "{start}..{end} -> {replacement:?}");
                }
            }
        }
    }
}
