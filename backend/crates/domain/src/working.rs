// SPDX-License-Identifier: AGPL-3.0-only
//! Exact private checkpoint capture; no persistence, serialization or publication.
use crate::records::{RangeError, validate_byte_range};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    StaleSource,
    Empty,
    WrongQuote,
    Range(RangeError),
}

pub fn capture<'a>(
    owned: &'a str,
    acknowledged: &str,
    start: usize,
    end: usize,
    quote: &str,
) -> Result<&'a str, Error> {
    if owned != acknowledged {
        return Err(Error::StaleSource);
    }
    validate_byte_range(owned, start, end).map_err(Error::Range)?;
    if start == end {
        return Err(Error::Empty);
    }
    let passage = &owned[start..end];
    if passage != quote {
        return Err(Error::WrongQuote);
    }
    Ok(passage)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn exact_repeated_passage_keeps_mixed_source_bytes() {
        let text = "A\r\n😀中\rA\r\n😀中";
        assert_eq!(
            capture(text, text, 3, 10, "😀中").unwrap().as_bytes(),
            &text.as_bytes()[3..10]
        );
        assert_eq!(capture(text, text, 14, 21, "😀中"), Ok("😀中"));
    }
    #[test]
    fn stale_source_wrong_quote_empty_and_split_scalar_are_rejected() {
        let text = "A😀\r\n";
        assert_eq!(
            capture(text, "B😀\r\n", 1, 5, "😀"),
            Err(Error::StaleSource)
        );
        assert_eq!(capture(text, text, 1, 5, "B"), Err(Error::WrongQuote));
        assert_eq!(capture(text, text, 1, 1, ""), Err(Error::Empty));
        assert!(matches!(
            capture(text, text, 2, 5, "😀"),
            Err(Error::Range(_))
        ));
        assert!(matches!(
            capture(text, text, 5, 1, ""),
            Err(Error::Range(_))
        ));
    }
}
