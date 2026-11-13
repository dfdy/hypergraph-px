// SPDX-License-Identifier: AGPL-3.0-only
//! Exact immutable passage comments; persistence and authority belong to adapters.
use crate::records::{Anchor, OccurrenceId, RangeError, RevisionId, validate_byte_range};

pub const MAX_BODY_BYTES: usize = 16 * 1024;
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    WrongRevision,
    WrongOccurrence,
    EmptyPassage,
    WrongQuote,
    EmptyBody,
    Limit,
    Range(RangeError),
}
#[derive(Debug, PartialEq, Eq)]
pub struct Plan<'a> {
    pub passage: &'a str,
    pub body: &'a str,
}
pub fn plan<'a>(
    revision: RevisionId,
    path: &[OccurrenceId],
    text: &'a str,
    anchor: &Anchor,
    quote: &str,
    body: &'a str,
) -> Result<Plan<'a>, Error> {
    if revision != anchor.revision {
        return Err(Error::WrongRevision);
    }
    if path != anchor.occurrence_path {
        return Err(Error::WrongOccurrence);
    }
    validate_byte_range(text, anchor.start_byte, anchor.end_byte).map_err(Error::Range)?;
    if anchor.start_byte == anchor.end_byte {
        return Err(Error::EmptyPassage);
    }
    let passage = &text[anchor.start_byte..anchor.end_byte];
    if passage != quote {
        return Err(Error::WrongQuote);
    }
    if body.trim().is_empty() {
        return Err(Error::EmptyBody);
    }
    if body.len() > MAX_BODY_BYTES {
        return Err(Error::Limit);
    }
    Ok(Plan { passage, body })
}

#[cfg(test)]
mod tests {
    use super::*;
    fn anchor() -> Anchor {
        Anchor {
            revision: RevisionId([1; 32]),
            occurrence_path: vec![OccurrenceId([2; 32])],
            start_byte: 3,
            end_byte: 10,
        }
    }
    #[test]
    fn exact_repeated_passage_and_comment_bytes_are_preserved() {
        let a = anchor();
        let text = "A\r\n😀中\rA\r\n😀中";
        let body = "  Consider e\u{301}😀\r\nAnother thought\r\n  ";
        let p = plan(a.revision, &a.occurrence_path, text, &a, "😀中", body).unwrap();
        assert_eq!(p.passage.as_bytes(), &text.as_bytes()[3..10]);
        assert_eq!(p.body.as_bytes(), body.as_bytes());
    }
    #[test]
    fn stale_wrong_quote_split_scalar_and_empty_requests_fail() {
        let a = anchor();
        let text = "A\r\n😀中\rA\r\n😀中";
        assert_eq!(
            plan(
                RevisionId([9; 32]),
                &a.occurrence_path,
                text,
                &a,
                "😀中",
                "Comment"
            ),
            Err(Error::WrongRevision)
        );
        assert_eq!(
            plan(a.revision, &[], text, &a, "😀中", "Comment"),
            Err(Error::WrongOccurrence)
        );
        assert_eq!(
            plan(a.revision, &a.occurrence_path, text, &a, "Other", "Comment"),
            Err(Error::WrongQuote)
        );
        assert_eq!(
            plan(a.revision, &a.occurrence_path, text, &a, "😀中", " \r\n\t"),
            Err(Error::EmptyBody)
        );
        let mut split = a.clone();
        split.start_byte += 1;
        assert!(matches!(
            plan(
                a.revision,
                &a.occurrence_path,
                text,
                &split,
                "😀中",
                "Comment"
            ),
            Err(Error::Range(_))
        ));
        split.start_byte = split.end_byte;
        assert_eq!(
            plan(a.revision, &a.occurrence_path, text, &split, "", "Comment"),
            Err(Error::EmptyPassage)
        );
    }
    #[test]
    fn body_budget_counts_utf8_bytes_without_normalization() {
        let a = anchor();
        let text = "A\r\n😀中";
        let body = "😀".repeat(MAX_BODY_BYTES / 4);
        assert!(plan(a.revision, &a.occurrence_path, text, &a, "😀中", &body).is_ok());
        assert_eq!(
            plan(
                a.revision,
                &a.occurrence_path,
                text,
                &a,
                "😀中",
                &(body + "a")
            ),
            Err(Error::Limit)
        );
    }
}
