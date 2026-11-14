// SPDX-License-Identifier: AGPL-3.0-only
//! Lossless transport-to-application adapter. Does not duplicate command semantics.
use crate::api;
use hypergraph_domain::records::*;
use hypergraph_storage::{Command, Outcome, Receipt, clipboard, forks};
use serde::Deserialize;
use serde_json::value::RawValue;

pub fn decode_command(raw: &RawValue) -> serde_json::Result<Command> {
    #[derive(Deserialize)]
    struct Tag {
        command: String,
    }
    let tag: Tag = serde_json::from_str(raw.get())?;
    if tag.command != "fork" {
        return serde_json::from_str(raw.get());
    }
    let api::ForkCommand { plan, .. } = serde_json::from_str(raw.get())?;
    Ok(Command::Fork {
        plan: forks::Request {
            title: plan.title,
            source: clipboard::Source {
                document: DocumentId(plan.source.document.0),
                node: NodeId(plan.source.node.0),
                snapshot: SnapshotId(plan.source.snapshot.0),
                revision: RevisionId(plan.source.revision.0),
                occurrence_path: plan
                    .source
                    .occurrence_path
                    .into_iter()
                    .map(|id| OccurrenceId(id.0))
                    .collect(),
                start_byte: plan.source.start_byte,
                end_byte: plan.source.end_byte,
            },
            expected_draft: plan.expected_draft.map(|draft| clipboard::DraftContext {
                generation: draft.generation,
                sequence: draft.sequence,
            }),
            quote: plan.quote,
        },
    })
}
pub fn fork_receipt(receipt: Receipt) -> hypergraph_storage::Result<api::ForkReceipt> {
    let Outcome::Forked {
        document,
        transformation,
        revision,
        snapshot,
    } = receipt.outcome
    else {
        return Err(hypergraph_storage::Error::Integrity);
    };
    Ok(api::ForkReceipt {
        operation: api::Id(receipt.operation.0),
        outcome: api::ForkOutcome {
            result: api::ForkResult::Forked,
            document: api::Id(document.0),
            transformation: api::Id(transformation.0),
            revision: api::Id(revision.0),
            snapshot: api::Id(snapshot.0),
        },
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    fn request() -> serde_json::Value {
        serde_json::json!({"operation":vec![1;32],"request":{"command":"fork","plan":{"title":"Exact fork","source":{"document":vec![2;32],"node":vec![3;32],"snapshot":vec![4;32],"revision":vec![5;32],"occurrence_path":[vec![6;32]],"start_byte":0,"end_byte":10},"expected_draft":null,"quote":"😀\r\n中\r"}}})
    }
    fn decode(bytes: &[u8]) -> serde_json::Result<Command> {
        let envelope: api::Execute<&RawValue> = serde_json::from_slice(bytes)?;
        decode_command(envelope.request)
    }
    #[test]
    fn fork_wire_and_receipt_remain_byte_identical_to_existing_application_codecs() {
        let value = request();
        let bytes = serde_json::to_vec(&value).unwrap();
        let envelope: api::Execute<&RawValue> = serde_json::from_slice(&bytes).unwrap();
        let pointer = envelope.request.get().as_ptr() as usize;
        assert!(
            (bytes.as_ptr() as usize..bytes.as_ptr() as usize + bytes.len()).contains(&pointer)
        );
        let old: Command = serde_json::from_value(value["request"].clone()).unwrap();
        let new = decode(&bytes).unwrap();
        assert_eq!(
            serde_json::to_vec(&old).unwrap(),
            serde_json::to_vec(&new).unwrap()
        );
        let result = Receipt {
            operation: OperationId([1; 32]),
            outcome: Outcome::Forked {
                document: DocumentId([7; 32]),
                transformation: TransformationId([8; 32]),
                revision: RevisionId([9; 32]),
                snapshot: SnapshotId([10; 32]),
            },
        };
        let bytes = serde_json::to_vec(&result).unwrap();
        assert_eq!(
            serde_json::to_vec(&fork_receipt(result).unwrap()).unwrap(),
            bytes
        );
        let mut missing = value;
        missing["request"]["plan"]
            .as_object_mut()
            .unwrap()
            .remove("expected_draft");
        assert!(decode(&serde_json::to_vec(&missing).unwrap()).is_ok());
    }
    #[test]
    fn exact_width_duplicates_unknowns_and_malformed_scalars_fail_without_lossy_value_roundtrip() {
        let good = request();
        let raw = serde_json::to_string(&good).unwrap();
        for which in 0..8 {
            let mut bad = good.clone();
            match which {
                0 => bad["operation"] = serde_json::json!([1]),
                1 => {
                    bad["request"]["plan"]["source"]["document"] = serde_json::json!(vec![256; 32])
                }
                2 => bad["request"]["plan"]["extra"] = serde_json::json!(true),
                3 => bad["request"]["unexpected"] = serde_json::json!(true),
                4 => bad["extra"] = serde_json::json!(true),
                5 => bad["request"]["plan"]["source"]["extra"] = serde_json::json!(true),
                6 => bad["request"]["plan"]["source"]["start_byte"] = serde_json::json!(-1),
                _ => {
                    bad["request"]["plan"]["source"]["document"] = serde_json::json!(vec![1.5; 32])
                }
            };
            assert!(
                decode(&serde_json::to_vec(&bad).unwrap()).is_err(),
                "{which}"
            );
        }
        for malformed in [
            raw.replace(
                "\"command\":\"fork\"",
                "\"command\":\"fork\",\"command\":\"fork\"",
            ),
            raw.replace(
                "\"title\":\"Exact fork\"",
                "\"title\":\"Exact fork\",\"title\":\"changed\"",
            ),
            raw.replace("\"quote\":", "\"quote\":\"\\ud800\",\"quote\":"),
        ] {
            assert!(decode(malformed.as_bytes()).is_err());
        }
    }
    #[test]
    fn snapshot_transport_reuses_exact_identity_codec_and_preserves_text_bytes() {
        let bytes =
            serde_json::to_vec(&serde_json::json!({"document":vec![1;32],"snapshot":vec![2;32]}))
                .unwrap();
        let request: api::SnapshotRequest = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(request.document, DocumentId([1; 32]));
        assert_eq!(request.snapshot, SnapshotId([2; 32]));
        assert_eq!(serde_json::to_vec(&request).unwrap(), bytes);
        for bad in [
            bytes[..bytes.len() - 1]
                .iter()
                .copied()
                .chain(b",\"extra\":0}".iter().copied())
                .collect::<Vec<_>>(),
            b"{\"document\":[],\"snapshot\":[]}".to_vec(),
        ] {
            assert!(serde_json::from_slice::<api::SnapshotRequest>(&bad).is_err());
        }
        let text = "Exact 😀\r\né中\rtail\n";
        let response = api::SnapshotResponse { text: text.into() };
        assert_eq!(
            serde_json::to_vec(&response).unwrap(),
            serde_json::to_vec(&serde_json::json!({"text":text})).unwrap()
        );
        assert_eq!(
            serde_json::from_slice::<api::SnapshotResponse>(
                &serde_json::to_vec(&response).unwrap()
            )
            .unwrap()
            .text
            .as_bytes(),
            text.as_bytes()
        );
    }
    #[test]
    fn runtime_metadata_keeps_exact_api1_bytes_and_open_capability_strings() {
        for (locked, create, supported) in [
            (true, true, false),
            (true, false, true),
            (false, false, true),
        ] {
            let legacy = serde_json::json!({"version":env!("CARGO_PKG_VERSION"),"contract":1,"locked":locked,"create":create,"mode":"trusted_server","ownership":"whole_document","max_text_bytes":hypergraph_storage::MAX_TEXT_BYTES,"keychain_supported":supported,"capabilities":["documents","durable_drafts","commit","snapshot","history","historical_anchor","private_clipboard","fork","reviewed_merge","document_fork_graph","semantic_assertion_overlay","semantic_overlay_graph","transformation_graph","assertion_review_history","publication_contributors","committed_passage_comments","local_branches","working_copy","document_integrity_audit","branch_parent_comparison","branch_parent_base","keychain"],"unavailable":["general_relationship_queries","provenance_mutation","agents","federation","client_held"]});
            let response = api::RuntimeResponse::new(locked, create, supported);
            assert_eq!(
                serde_json::to_vec(&response).unwrap(),
                serde_json::to_vec(&legacy).unwrap()
            );
            let mut wire = serde_json::to_value(&response).unwrap();
            wire["capabilities"]
                .as_array_mut()
                .unwrap()
                .push(serde_json::json!("future_additive_capability"));
            assert!(serde_json::from_value::<api::RuntimeResponse>(wire).is_ok());
        }
    }
    #[test]
    fn bootstrap_remains_strict_and_keeps_legacy_body_bytes() {
        let request = api::BootstrapRequest {
            token: "SYNTHETIC-only-token".into(),
        };
        let bytes = serde_json::to_vec(&request).unwrap();
        assert_eq!(bytes, b"{\"token\":\"SYNTHETIC-only-token\"}");
        assert_eq!(
            serde_json::from_slice::<api::BootstrapRequest>(&bytes)
                .unwrap()
                .token,
            request.token
        );
        for bad in [
            r#"{"token":"x","extra":0}"#,
            r#"{"token":"x","token":"y"}"#,
            r#"{"token":null}"#,
            r#"{}"#,
        ] {
            assert!(serde_json::from_str::<api::BootstrapRequest>(bad).is_err());
        }
        assert_eq!(
            serde_json::to_vec(&api::BootstrapResponse {
                authenticated: true
            })
            .unwrap(),
            b"{\"authenticated\":true}"
        );
        assert_eq!(
            api::document()["components"]["schemas"]["BootstrapRequest"]["properties"]["token"]["writeOnly"],
            true
        );
    }
    #[test]
    fn unlock_and_status_preserve_strict_bodies_and_existing_public_bytes() {
        assert!(serde_json::from_str::<api::EmptyRequest>("{}").is_ok());
        assert!(serde_json::from_str::<api::EmptyRequest>("[]").is_ok());
        for bad in ["null", r#"{"extra":0}"#] {
            assert!(serde_json::from_str::<api::EmptyRequest>(bad).is_err());
        }
        let unlock = api::UnlockRequest {
            passphrase: "SYNTHETIC-only-unlock".into(),
        };
        assert_eq!(
            serde_json::to_vec(&unlock).unwrap(),
            b"{\"passphrase\":\"SYNTHETIC-only-unlock\"}"
        );
        for bad in [
            r#"{"passphrase":null}"#,
            r#"{"passphrase":"x","passphrase":"y"}"#,
            r#"{"passphrase":"x","extra":0}"#,
        ] {
            assert!(serde_json::from_str::<api::UnlockRequest>(bad).is_err());
        }
        assert_eq!(
            serde_json::to_vec(&api::LockStateResponse { locked: false }).unwrap(),
            b"{\"locked\":false}"
        );
        for (schema, enrolled, cleanup_pending, supported) in [
            (1, false, false, false),
            (2, true, false, true),
            (2, false, true, true),
        ] {
            let result = api::KeychainStatusResponse::new(
                hypergraph_storage::keychain::Status {
                    schema,
                    enrolled,
                    cleanup_pending,
                },
                supported,
            );
            assert_eq!(serde_json::to_vec(&result).unwrap(),serde_json::to_vec(&serde_json::json!({"supported":supported,"schema":schema,"enrolled":enrolled,"cleanup_pending":cleanup_pending})).unwrap());
        }
    }
    #[test]
    fn keychain_enrollment_and_removal_acknowledgements_keep_existing_bytes() {
        for backup_created in [false, true] {
            assert_eq!(
                serde_json::to_vec(&api::KeychainEnrollmentResponse {
                    backup_created,
                    enrolled: true
                })
                .unwrap(),
                serde_json::to_vec(
                    &serde_json::json!({"enrolled":true,"backup_created":backup_created})
                )
                .unwrap()
            );
        }
        assert_eq!(
            serde_json::to_vec(&api::KeychainRemovalResponse {
                cleanup_pending: false,
                enrolled: false
            })
            .unwrap(),
            b"{\"cleanup_pending\":false,\"enrolled\":false}"
        );
    }
    #[test]
    fn audit_schema_reuses_authoritative_limits_scope_and_separate_problem_names() {
        let spec = api::document();
        assert_eq!(
            spec["components"]["schemas"]["AuditRequest"]["properties"]["max_bytes"]["maximum"],
            hypergraph_storage::audit::MAX_READ_BYTES
        );
        assert_eq!(
            spec["components"]["schemas"]["DocumentAuditReport"]["properties"]["scope"]["enum"][0],
            hypergraph_storage::audit::SCOPE
        );
        assert!(spec["components"]["schemas"]["Problem"]["properties"]["status"].is_object());
        assert!(spec["components"]["schemas"]["AuditProblem"]["enum"].is_array());
        let bytes = serde_json::to_vec(&api::AuditRequest {
            document: DocumentId([1; 32]),
            max_bytes: 1024,
        })
        .unwrap();
        assert_eq!(
            bytes,
            serde_json::to_vec(&serde_json::json!({"document":vec![1;32],"max_bytes":1024}))
                .unwrap()
        );
        assert!(
            serde_json::from_str::<api::AuditRequest>(r#"{"document":[],"max_bytes":1024}"#)
                .is_err()
        );
    }
    #[test]
    fn generated_schema_has_complete_local_references_and_exact_identity_bounds() {
        let spec = api::document();
        let id = &spec["components"]["schemas"]["Id"];
        assert_eq!(id["minItems"], 32);
        assert_eq!(id["maxItems"], 32);
        assert_eq!(id["items"]["maximum"], 255);
        assert_eq!(
            spec["components"]["schemas"]["ForkPlan"]["additionalProperties"],
            false
        );
        fn refs(value: &serde_json::Value, root: &serde_json::Value) {
            match value {
                serde_json::Value::Object(map) => {
                    if let Some(reference) = map.get("$ref").and_then(|v| v.as_str()) {
                        assert!(reference.starts_with("#/"));
                        assert!(root.pointer(&reference[1..]).is_some(), "{reference}");
                    }
                    for value in map.values() {
                        refs(value, root)
                    }
                }
                serde_json::Value::Array(values) => {
                    for value in values {
                        refs(value, root)
                    }
                }
                _ => {}
            }
        }
        refs(&spec, &spec);
        assert!(spec["paths"].as_object().unwrap().len() >= 36);
        assert!(spec["paths"]["/api/v1/runtime"]["get"].is_object());
        assert!(spec["paths"]["/api/v1/commands"]["post"].is_object());
    }
}
