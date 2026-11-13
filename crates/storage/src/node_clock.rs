// SPDX-License-Identifier: AGPL-3.0-only
//! Inactive committed-change clock codec and immutable next-value planning.
//! No SQL writes, clock initialization on read, receipt recovery or authorization.
use crate::{Error, Result, encoding};
use hypergraph_domain::records::*;
use serde::{Deserialize, Serialize};

pub const CANDIDATE_KIND: i32 = 35;
pub const MAX_BYTES: usize = 4096;
pub const MAX_ORDER: u64 = (1u64 << 53) - 1;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Change {
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Clock {
    document: DocumentId,
    node: NodeId,
    order: u64,
    change: Option<Change>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Payload {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    node: NodeId,
    last_order: u64,
    last_change: Option<Change>,
}
impl Clock {
    /// Only an authorized new-node/verified upgrade transaction may persist a seed.
    pub fn initial(document: DocumentId, node: NodeId) -> Self {
        Self {
            document,
            node,
            order: 0,
            change: None,
        }
    }
    pub fn order(&self) -> u64 {
        self.order
    }
    pub fn change(&self) -> Option<&Change> {
        self.change.as_ref()
    }
    /// Caller must recover original receipts and prove changed text before this step.
    pub fn plan_change(&self, expected_order: u64, change: Change) -> Result<Self> {
        if expected_order != self.order {
            return Err(Error::Conflict);
        }
        if self.change.as_ref().is_some_and(|old| {
            old.operation == change.operation
                || old.revision == change.revision
                || old.snapshot == change.snapshot
        }) {
            return Err(Error::Conflict);
        }
        if self.order == MAX_ORDER {
            return Err(Error::Limit);
        }
        Ok(Self {
            document: self.document,
            node: self.node,
            order: self.order + 1,
            change: Some(change),
        })
    }
    pub fn encode(&self) -> Result<Vec<u8>> {
        encoding::encode_record_limited(
            CANDIDATE_KIND,
            &Payload {
                document: self.document,
                node: self.node,
                last_order: self.order,
                last_change: self.change.clone(),
            },
            MAX_BYTES,
        )
    }
}
pub fn decode(bytes: &[u8], document: DocumentId, node: NodeId) -> Result<Clock> {
    if bytes.len() > MAX_BYTES {
        return Err(Error::Limit);
    }
    let value: Payload = encoding::decode_record(CANDIDATE_KIND, bytes)?;
    if value.document != document || value.node != node {
        return Err(Error::Conflict);
    }
    if value.last_order > MAX_ORDER {
        return Err(Error::Format);
    }
    if (value.last_order == 0) != value.last_change.is_none() {
        return Err(Error::Integrity);
    }
    Ok(Clock {
        document,
        node,
        order: value.last_order,
        change: value.last_change,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    const DOC: DocumentId = DocumentId([1; 32]);
    const NODE: NodeId = NodeId([2; 32]);
    fn change(n: u8) -> Change {
        Change {
            revision: RevisionId([n; 32]),
            snapshot: SnapshotId([n + 1; 32]),
            operation: OperationId([n + 2; 32]),
        }
    }
    #[test]
    fn golden_seed_and_successive_change_plans_preserve_the_original_state() {
        let seed = Clock::initial(DOC, NODE);
        let array = |n: u8| {
            std::iter::repeat_n(n.to_string(), 32)
                .collect::<Vec<_>>()
                .join(",")
        };
        let golden = format!(
            "{{\"record_version\":1,\"record_kind\":35,\"payload\":{{\"document\":[{}],\"node\":[{}],\"last_order\":0,\"last_change\":null}}}}",
            array(1),
            array(2)
        );
        assert_eq!(seed.encode().unwrap(), golden.as_bytes());
        assert_eq!(decode(golden.as_bytes(), DOC, NODE).unwrap(), seed);
        let first = seed.plan_change(0, change(3)).unwrap();
        let second = first.plan_change(1, change(6)).unwrap();
        assert_eq!(seed.order(), 0);
        assert_eq!(first.order(), 1);
        assert_eq!(second.order(), 2);
        assert_eq!(second.change(), Some(&change(6)));
        let encoded = second.encode().unwrap();
        assert_eq!(decode(&encoded, DOC, NODE).unwrap(), second);
        let text = String::from_utf8(encoded).unwrap();
        assert!(text.contains("\"last_order\":2,\"last_change\":{\"revision\":"));
        assert!(text.contains("\"snapshot\":"));
        assert!(text.contains("\"operation\":"));
    }
    #[test]
    fn stale_order_duplicate_publication_and_exhaustion_never_advance_a_clock() {
        let first = Clock::initial(DOC, NODE).plan_change(0, change(3)).unwrap();
        let saved = first.clone();
        assert!(matches!(
            first.plan_change(0, change(6)),
            Err(Error::Conflict)
        ));
        for which in 0..3 {
            let mut same = change(6);
            match which {
                0 => same.revision = change(3).revision,
                1 => same.snapshot = change(3).snapshot,
                _ => same.operation = change(3).operation,
            }
            assert!(matches!(first.plan_change(1, same), Err(Error::Conflict)));
        }
        assert_eq!(first, saved);
        let mut raw =
            serde_json::from_slice::<serde_json::Value>(&first.encode().unwrap()).unwrap();
        raw["payload"]["last_order"] = serde_json::json!(MAX_ORDER);
        let maximum = decode(&serde_json::to_vec(&raw).unwrap(), DOC, NODE).unwrap();
        assert!(matches!(
            maximum.plan_change(MAX_ORDER, change(6)),
            Err(Error::Limit)
        ));
        assert_eq!(maximum.order(), MAX_ORDER);
        assert_eq!(maximum.change(), Some(&change(3)));
    }
    #[test]
    fn context_version_shape_counter_and_byte_failures_cannot_become_zero_seeds() {
        let first = Clock::initial(DOC, NODE).plan_change(0, change(3)).unwrap();
        let bytes = first.encode().unwrap();
        assert!(matches!(
            decode(&bytes, DocumentId([99; 32]), NODE),
            Err(Error::Conflict)
        ));
        assert!(matches!(
            decode(&bytes, DOC, NodeId([99; 32])),
            Err(Error::Conflict)
        ));
        let good = serde_json::from_slice::<serde_json::Value>(&bytes).unwrap();
        for location in ["wrapper", "payload", "change"] {
            let mut raw = good.clone();
            let object = match location {
                "wrapper" => &mut raw,
                "payload" => &mut raw["payload"],
                _ => &mut raw["payload"]["last_change"],
            };
            object["extra"] = serde_json::json!(true);
            assert!(matches!(
                decode(&serde_json::to_vec(&raw).unwrap(), DOC, NODE),
                Err(Error::Format)
            ));
        }
        for key in ["record_version", "record_kind"] {
            let mut raw = good.clone();
            raw[key] = serde_json::json!(999);
            assert!(matches!(
                decode(&serde_json::to_vec(&raw).unwrap(), DOC, NODE),
                Err(Error::Format)
            ));
        }
        for order in [
            serde_json::json!(-1),
            serde_json::json!(1.5),
            serde_json::json!(MAX_ORDER + 1),
        ] {
            let mut raw = good.clone();
            raw["payload"]["last_order"] = order;
            assert!(matches!(
                decode(&serde_json::to_vec(&raw).unwrap(), DOC, NODE),
                Err(Error::Format)
            ));
        }
        let duplicate = String::from_utf8(bytes.clone())
            .unwrap()
            .replace("\"last_order\":1", "\"last_order\":1,\"last_order\":1");
        assert!(matches!(
            decode(duplicate.as_bytes(), DOC, NODE),
            Err(Error::Format)
        ));
        let mut raw = good.clone();
        raw["payload"]["last_change"] = serde_json::Value::Null;
        assert!(matches!(
            decode(&serde_json::to_vec(&raw).unwrap(), DOC, NODE),
            Err(Error::Integrity)
        ));
        raw = good;
        raw["payload"]["last_order"] = serde_json::json!(0);
        assert!(matches!(
            decode(&serde_json::to_vec(&raw).unwrap(), DOC, NODE),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            decode(&vec![b' '; MAX_BYTES + 1], DOC, NODE),
            Err(Error::Limit)
        ));
        assert!(matches!(decode(&[], DOC, NODE), Err(Error::Format)));
    }
}
