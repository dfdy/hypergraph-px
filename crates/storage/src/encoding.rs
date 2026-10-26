// SPDX-License-Identifier: AGPL-3.0-only
//! Serialization at the adapter boundary. Domain identities have no Serde dependency.
use hypergraph_domain::records::*;
use serde::{Deserialize, Deserializer, Serialize, Serializer, de::DeserializeOwned};

use crate::{Error, Result};

pub const RECORD_VERSION: u32 = 1;

/// Conversion is lossless; JSON decoding checks the exact array length and byte range.
pub trait Identity: Sized {
    fn bytes(&self) -> [u8; 32];
    fn from_bytes(bytes: [u8; 32]) -> Self;
}

macro_rules! identities {
    ($($name:ident),+ $(,)?) => {$(
        impl Identity for $name {
            fn bytes(&self) -> [u8; 32] { self.0 }
            fn from_bytes(bytes: [u8; 32]) -> Self { Self(bytes) }
        }
    )+};
}
identities!(
    DocumentId,
    NodeId,
    RevisionId,
    BranchId,
    ManifestId,
    OccurrenceId,
    SnapshotId,
    OperationId,
    DraftId,
    PrincipalId,
    DeviceId,
    GroupId,
    RelationshipId,
    TransformationId
);

pub mod identity {
    use super::*;
    pub fn serialize<T: Identity, S: Serializer>(
        id: &T,
        s: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        id.bytes().serialize(s)
    }
    pub fn deserialize<'de, T: Identity, D: Deserializer<'de>>(
        d: D,
    ) -> std::result::Result<T, D::Error> {
        <[u8; 32]>::deserialize(d).map(T::from_bytes)
    }
}

pub mod optional_identity {
    use super::*;
    pub fn serialize<T: Identity, S: Serializer>(
        id: &Option<T>,
        s: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        id.as_ref().map(Identity::bytes).serialize(s)
    }
    pub fn deserialize<'de, T: Identity, D: Deserializer<'de>>(
        d: D,
    ) -> std::result::Result<Option<T>, D::Error> {
        Option::<[u8; 32]>::deserialize(d).map(|id| id.map(T::from_bytes))
    }
}

pub mod identities {
    use super::*;
    pub fn serialize<T: Identity, S: Serializer>(
        ids: &[T],
        s: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        ids.iter()
            .map(Identity::bytes)
            .collect::<Vec<_>>()
            .serialize(s)
    }
    pub fn deserialize<'de, T: Identity, D: Deserializer<'de>>(
        d: D,
    ) -> std::result::Result<Vec<T>, D::Error> {
        Vec::<[u8; 32]>::deserialize(d).map(|ids| ids.into_iter().map(T::from_bytes).collect())
    }
}

pub mod bindings {
    use super::*;
    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields)]
    struct BindingRecord {
        path: Vec<[u8; 32]>,
        node: [u8; 32],
        revision: [u8; 32],
    }
    pub fn serialize<S: Serializer>(
        bindings: &[SnapshotBinding],
        s: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        bindings
            .iter()
            .map(|b| BindingRecord {
                path: b.path.iter().map(Identity::bytes).collect(),
                node: b.node.0,
                revision: b.revision.0,
            })
            .collect::<Vec<_>>()
            .serialize(s)
    }
    pub fn deserialize<'de, D: Deserializer<'de>>(
        d: D,
    ) -> std::result::Result<Vec<SnapshotBinding>, D::Error> {
        Vec::<BindingRecord>::deserialize(d).map(|bindings| {
            bindings
                .into_iter()
                .map(|b| SnapshotBinding {
                    path: b.path.into_iter().map(OccurrenceId).collect(),
                    node: NodeId(b.node),
                    revision: RevisionId(b.revision),
                })
                .collect()
        })
    }
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Record<T> {
    record_version: u32,
    record_kind: i32,
    payload: T,
}

pub(crate) fn encode_record<T: Serialize>(kind: i32, value: &T) -> Result<Vec<u8>> {
    serde_json::to_vec(&Record {
        record_version: RECORD_VERSION,
        record_kind: kind,
        payload: value,
    })
    .map_err(|_| Error::Format)
}

pub(crate) fn decode_record<T: DeserializeOwned>(kind: i32, bytes: &[u8]) -> Result<T> {
    let record: Record<T> = serde_json::from_slice(bytes).map_err(|_| Error::Format)?;
    if record.record_version != RECORD_VERSION || record.record_kind != kind {
        return Err(Error::Format);
    }
    Ok(record.payload)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Command;

    #[test]
    fn command_bytes_and_exact_source_remain_compatible() {
        let command = Command::Save {
            document: DocumentId([1; 32]),
            generation: 2,
            base: RevisionId([3; 32]),
            previous_sequence: 4,
            sequence: 5,
            text: "A😀e\u{301}\r\n中".into(),
        };
        let expected = concat!(
            "{\"command\":\"save\",\"document\":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],",
            "\"generation\":2,\"base\":[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],",
            "\"previous_sequence\":4,\"sequence\":5,\"text\":\"A😀é\\r\\n中\"}"
        );
        assert_eq!(serde_json::to_vec(&command).unwrap(), expected.as_bytes());
        assert_eq!(serde_json::from_str::<Command>(expected).unwrap(), command);
    }

    #[test]
    fn malformed_identifiers_and_unknown_command_fields_fail_closed() {
        let good = serde_json::to_value(Command::Commit {
            document: DocumentId([1; 32]),
            generation: 2,
            base: RevisionId([3; 32]),
            sequence: 4,
        })
        .unwrap();
        for bad in [
            serde_json::json!([1]),
            serde_json::json!(vec![1; 33]),
            serde_json::json!(vec![-1; 32]),
            serde_json::json!(vec![256; 32]),
            serde_json::json!("01"),
            serde_json::Value::Null,
        ] {
            let mut value = good.clone();
            value["document"] = bad;
            assert!(serde_json::from_value::<Command>(value).is_err());
        }
        let mut value = good;
        value["authorization"] = serde_json::json!(true);
        assert!(serde_json::from_value::<Command>(value).is_err());
    }

    #[test]
    fn record_wrapper_has_golden_bytes_and_rejects_unsupported_shapes() {
        assert_eq!(
            encode_record(4, &"A\r\n😀").unwrap(),
            "{\"record_version\":1,\"record_kind\":4,\"payload\":\"A\\r\\n😀\"}".as_bytes()
        );
        for bytes in [
            r#"{"record_version":0,"record_kind":4,"payload":"x"}"#,
            r#"{"record_version":2,"record_kind":4,"payload":"x"}"#,
            r#"{"record_version":1,"record_kind":5,"payload":"x"}"#,
            r#"{"record_kind":4,"payload":"x"}"#,
            r#"{"record_version":1,"record_kind":4,"payload":"x","extra":1}"#,
            r#"{"record_version":1,"record_version":1,"record_kind":4,"payload":"x"}"#,
            r#"{"record_version":1.0,"record_kind":4,"payload":"x"}"#,
            r#"{"record_version":1,"record_kind":4,"payload":{}}"#,
            r#""unversioned""#,
        ] {
            assert!(
                matches!(
                    decode_record::<String>(4, bytes.as_bytes()),
                    Err(Error::Format)
                ),
                "{bytes}"
            );
        }
        let bytes = encode_record(4, &"A\r\n😀").unwrap();
        assert_eq!(decode_record::<String>(4, &bytes).unwrap(), "A\r\n😀");
    }
}
