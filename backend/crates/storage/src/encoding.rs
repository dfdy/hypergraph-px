// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Strict adapter-owned record serialization
//!
//! Convert dependency-free domain identities and snapshot bindings into strict
//! wire/persistent DTO shapes. Enforce the existing record wrapper version and
//! kind without changing domain records or accepting unknown historical formats.
//!
//! Source: [Latest source on GitHub][source]
//!
//! Agent provenance: Agent creation unverified; original creator not recorded.
//! Created: Unknown (not recorded).
//! Creation harness: Unknown (not recorded).
//! Creation model: Unknown (not recorded).
//!
//! Latest editing agent: Codex /root/storage_comments (OpenAI coding agent).
//! Latest editing harness: Codex; version/build unknown (not exposed).
//! Latest editing model: OpenAI; exact identifier/revision unknown (not exposed).
//! Last edited: 2026-11-15 (UTC).
//!
//! Used by: Encrypted workspace record readers/writers and runtime API
//! schema generation.
//!
//! Specification:
//! - [Adapter/domain boundary][spec0]
//! - [Serialization boundary decision][spec1]
//! - [Persistent record version decision][spec2]
//! - [Workspace record formats][spec3]
//!
//! Boundary: Decoding checks shape/version/kind, not authority or semantic
//! correctness of a source binding. No record migration or format
//! activation occurs here.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/encoding.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [spec1]: ../../../../docs/04-architecture/decisions/0006-domain-serialization-boundary.md
//! [spec2]: ../../../../docs/04-architecture/decisions/0007-explicit-record-versions.md
//! [spec3]: ../../../../docs/07-implementation/data-structures/sqlite-records.md

use hypergraph_domain::records::*;
use serde::{Deserialize, Deserializer, Serialize, Serializer, de::DeserializeOwned};

use crate::{Error, Result};

/// Existing persistent wrapper version; independent of SQL/envelope/API versions.
pub const RECORD_VERSION: u32 = 1;

// Wire-schema primitives belong to adapters, never the pure domain. The optional
// feature documents existing transport DTOs without changing persistence codecs.
#[cfg(feature = "api-schema")]
mod wire_schema {
    use super::*;
    /// Fixed opaque identity width shared by DTO representation and its API schema.
    pub const ID_BYTES: usize = 32;
    #[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
    #[serde(transparent)]
    /// Adapter DTO for an exact 32-byte domain identity; not an authorization token.
    pub struct Id(pub [u8; ID_BYTES]);
    // Utoipa's default array schema omits fixed length and the u8 upper bound.
    // Derive these primitive constraints from the same Rust representation.
    impl utoipa::PartialSchema for Id {
        /// Emit exact array length and byte bounds missing from the default schema derive.
        fn schema() -> utoipa::openapi::RefOr<utoipa::openapi::schema::Schema> {
            use utoipa::openapi::schema::{ArrayBuilder, ObjectBuilder, Type};
            ArrayBuilder::new()
                .items(
                    ObjectBuilder::new()
                        .schema_type(Type::Integer)
                        .minimum(Some(u8::MIN))
                        .maximum(Some(u8::MAX)),
                )
                .min_items(Some(ID_BYTES))
                .max_items(Some(ID_BYTES))
                .into()
        }
    }
    impl utoipa::ToSchema for Id {}
}

#[cfg(feature = "api-schema")]
pub use wire_schema::{ID_BYTES, Id};

/// Conversion is lossless; JSON decoding checks the exact array length and byte range.
pub trait Identity: Sized {
    /// Copy the opaque 32-byte representation without changing its logical identity.
    fn bytes(&self) -> [u8; 32];
    /// Reconstruct the typed identity from already width-checked bytes.
    fn from_bytes(bytes: [u8; 32]) -> Self;
}

macro_rules! identities {
    ($($name:ident),+ $(,)?) => {$(
        impl Identity for $name {
            /// Expose the fixed backing bytes for adapter serialization.
            fn bytes(&self) -> [u8; 32] { self.0 }
            /// Rewrap validated fixed-width bytes in this domain identity type.
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
    CheckpointId,
    PrincipalId,
    DeviceId,
    GroupId,
    RelationshipId,
    TransformationId
);

pub mod identity {
    use super::*;
    /// Serialize one identity as its exact fixed-width byte array.
    pub fn serialize<T: Identity, S: Serializer>(
        id: &T,
        s: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        id.bytes().serialize(s)
    }

    /// Decode one exact byte array before reconstructing its typed domain identity.
    pub fn deserialize<'de, T: Identity, D: Deserializer<'de>>(
        d: D,
    ) -> std::result::Result<T, D::Error> {
        <[u8; 32]>::deserialize(d).map(T::from_bytes)
    }
}

pub mod optional_identity {
    use super::*;
    /// Preserve optional identity absence while serializing any present fixed-width value.
    pub fn serialize<T: Identity, S: Serializer>(
        id: &Option<T>,
        s: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        id.as_ref().map(Identity::bytes).serialize(s)
    }

    /// Decode null or an exact-width value without inventing a missing identity.
    pub fn deserialize<'de, T: Identity, D: Deserializer<'de>>(
        d: D,
    ) -> std::result::Result<Option<T>, D::Error> {
        // Rewrap only the present validated array; retain None unchanged.
        Option::<[u8; 32]>::deserialize(d).map(|id| id.map(T::from_bytes))
    }
}

pub mod identities {
    use super::*;
    /// Serialize an ordered identity list without deduplication or reordering.
    pub fn serialize<T: Identity, S: Serializer>(
        ids: &[T],
        s: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        ids.iter()
            .map(Identity::bytes)
            .collect::<Vec<_>>()
            .serialize(s)
    }

    /// Decode ordered exact-width identity values without changing repetitions.
    pub fn deserialize<'de, T: Identity, D: Deserializer<'de>>(
        d: D,
    ) -> std::result::Result<Vec<T>, D::Error> {
        // Rewrap every validated array while preserving its original list position.
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

    /// Convert each snapshot path/node/revision binding to its strict adapter DTO.
    pub fn serialize<S: Serializer>(
        bindings: &[SnapshotBinding],
        s: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        bindings
            .iter()
            // Preserve each binding and occurrence order while removing domain wrappers.
            .map(|b| BindingRecord {
                path: b.path.iter().map(Identity::bytes).collect(),
                node: b.node.0,
                revision: b.revision.0,
            })
            .collect::<Vec<_>>()
            .serialize(s)
    }

    /// Restore typed snapshot bindings after strict DTO field/array decoding.
    pub fn deserialize<'de, D: Deserializer<'de>>(
        d: D,
    ) -> std::result::Result<Vec<SnapshotBinding>, D::Error> {
        // Convert the decoded list without inferring closure completeness or authority.
        Vec::<BindingRecord>::deserialize(d).map(|bindings| {
            bindings
                .into_iter()
                // Preserve this exact path and selected node/revision identity tuple.
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

/// Wrap a payload in the existing version/kind contract before JSON serialization.
pub(crate) fn encode_record<T: Serialize>(kind: i32, value: &T) -> Result<Vec<u8>> {
    serde_json::to_vec(&Record {
        record_version: RECORD_VERSION,
        record_kind: kind,
        payload: value,
    })
    // Collapse codec diagnostics to the stable record-format error.
    .map_err(|_| Error::Format)
}

/// Stream a strict wrapper without constructing an unbounded intermediate JSON value.
pub(crate) fn encode_record_limited<T: Serialize>(
    kind: i32,
    value: &T,
    limit: usize,
) -> Result<Vec<u8>> {
    use std::io::{self, Write};
    struct Output {
        bytes: Vec<u8>,
        left: usize,
    }
    impl Write for Output {
        /// Accept a whole serialized chunk only if its bytes fit the remaining allowance.
        fn write(&mut self, bytes: &[u8]) -> io::Result<usize> {
            self.left = self
                .left
                .checked_sub(bytes.len())
                // Make a bounded-writer error when this next chunk cannot fit.
                .ok_or_else(|| io::Error::other("record byte limit"))?;
            self.bytes.extend_from_slice(bytes);
            Ok(bytes.len())
        }

        /// Complete the in-memory writer contract; there is no file to flush.
        fn flush(&mut self) -> io::Result<()> {
            Ok(())
        }
    }
    let mut output = Output {
        bytes: Vec::new(),
        left: limit,
    };
    serde_json::to_writer(
        &mut output,
        &Record {
            record_version: RECORD_VERSION,
            record_kind: kind,
            payload: value,
        },
    )
    // Treat bounded-writer/serialization failure as the existing limit outcome.
    .map_err(|_| Error::Limit)?;
    Ok(output.bytes)
}

/// Strictly decode the expected version/kind and return its typed payload, never a fallback.
pub(crate) fn decode_record<T: DeserializeOwned>(kind: i32, bytes: &[u8]) -> Result<T> {
    let record: Record<T> = serde_json::from_slice(bytes).map_err(|_| Error::Format)?; // Reject invalid wrapper/payload JSON.
    if record.record_version != RECORD_VERSION || record.record_kind != kind {
        return Err(Error::Format);
    }
    Ok(record.payload)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Command;

    /// Guard exact command JSON and Unicode/newline compatibility across codec separation.
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

    /// Reject wrong-width/range identity shapes and unrecognized command fields.
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

    /// Guard golden wrapper bytes and fail closed on unsupported/malformed record shapes.
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
