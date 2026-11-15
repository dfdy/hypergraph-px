// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Progressively typed runtime transport contract
//!
//! Define transport-only request/result DTOs and the offline OpenAPI inventory.
//! Typed routes retain existing API1 bytes while remaining legacy routes are
//! explicitly reported as untyped rather than granted invented schemas.
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
//! Used by: Runtime HTTP adapters, offline schema exporter and frontend
//! typed-contract generator.
//!
//! Specification:
//! - [Runtime API implementation][spec0]
//! - [Current browser/runtime contract][spec1]
//! - [Adapter record boundary][spec2]
//!
//! Boundary: A generated schema establishes neither authority nor domain
//! validity or transaction guarantees. Domain types and encrypted receipt
//! codecs remain independent.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/runtime/src/api.rs
//! [spec0]: ../../../../docs/07-implementation/diagrams/api-implementation.c4
//! [spec1]: ../../../../docs/06-subsystems/interfaces/browser-runtime.md
//! [spec2]: ../../../../docs/04-architecture/decisions/0006-domain-serialization-boundary.md

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

pub use hypergraph_storage::encoding::Id;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Exact committed source selection; offsets are UTF8 bytes in the retained revision.
pub struct Source {
    pub document: Id,
    pub node: Id,
    pub snapshot: Id,
    pub revision: Id,
    #[schema(min_items = 1, max_items = 1)]
    pub occurrence_path: Vec<Id>,
    pub start_byte: usize,
    pub end_byte: usize,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Expected editor generation/acknowledged sequence, not a durable source identity.
pub struct DraftContext {
    pub generation: u64,
    pub sequence: u64,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Frozen independent-Fork intent; the storage adapter revalidates exact source and scope.
pub struct ForkPlan {
    pub title: String,
    pub source: Source,
    pub expected_draft: Option<DraftContext>,
    pub quote: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
// Preserve the existing snake_case command discriminator.
pub enum ForkTag {
    Fork,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Typed transport shape for committed-source Fork only.
pub struct ForkCommand {
    pub command: ForkTag,
    pub plan: ForkPlan,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
#[schema(as = ForkExecute)]
// Original operation identity plus captured command, used for exact retry reconciliation.
pub struct Execute<T> {
    pub operation: Id,
    pub request: T,
}

#[cfg(any(test, feature = "api-export"))]
#[allow(dead_code)] // Referenced by the feature-gated offline schema exporter.
pub type ForkExecute = Execute<ForkCommand>;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
// Preserve the existing Fork receipt outcome discriminator.
pub enum ForkResult {
    Forked,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// New independent output identities returned by the original successful publication.
pub struct ForkOutcome {
    pub result: ForkResult,
    pub document: Id,
    pub transformation: Id,
    pub revision: Id,
    pub snapshot: Id,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Exact operation/outcome pair; wire representation stays distinct from storage encoding.
pub struct ForkReceipt {
    pub operation: Id,
    pub outcome: ForkOutcome,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Stable existing HPX error representation retained for clients without problem details.
pub struct LegacyError {
    pub error: String,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Opt-in problem details extend, rather than replace, the stable HPX error code.
pub struct Problem {
    #[serde(rename = "type")]
    pub problem_type: String,
    pub title: String,
    pub status: u16,

    /// HPX's existing stable error code, retained as a problem-details extension.
    pub error: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Private one-use bootstrap credential; write-only schema metadata prevents echo intent.
pub struct BootstrapRequest {
    #[schema(write_only = true)]
    pub token: String,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Session authentication acknowledgement; not proof that a workspace is unlocked.
pub struct BootstrapResponse {
    pub authenticated: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
// Existing empty-object/empty-sequence acceptance is reflected by the manual schema.
pub struct EmptyRequest {}
// Preserve the existing Serde empty-struct sequence acceptance without narrowing
// legacy clients. New clients continue to construct canonical object requests.
impl utoipa::PartialSchema for EmptyRequest {
    /// Describe both legacy accepted empty shapes without silently narrowing clients.
    fn schema() -> utoipa::openapi::RefOr<utoipa::openapi::schema::Schema> {
        use utoipa::openapi::schema::{
            AdditionalProperties, ArrayBuilder, ObjectBuilder, OneOfBuilder, Type,
        };
        OneOfBuilder::new()
            .item(
                ObjectBuilder::new()
                    .schema_type(Type::Object)
                    .additional_properties(Some(AdditionalProperties::FreeForm(false))),
            )
            .item(
                ArrayBuilder::new()
                    .items(ObjectBuilder::new())
                    .min_items(Some(0))
                    .max_items(Some(0)),
            )
            .into()
    }
}

impl ToSchema for EmptyRequest {}
#[derive(Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Explicit unlock input; never include this field in a response or diagnostic.
pub struct UnlockRequest {
    #[schema(write_only = true)]
    pub passphrase: String,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Current process lock status, independent of session authentication.
pub struct LockStateResponse {
    pub locked: bool,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Enrollment, pending cleanup and native support are separate status dimensions.
pub struct KeychainStatusResponse {
    pub cleanup_pending: bool,
    pub enrolled: bool,
    pub schema: i32,
    pub supported: bool,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Report both enrollment outcome and verified-backup creation.
pub struct KeychainEnrollmentResponse {
    pub backup_created: bool,
    pub enrolled: bool,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Removed enrollment may still need scoped native-item cleanup.
pub struct KeychainRemovalResponse {
    pub cleanup_pending: bool,
    pub enrolled: bool,
}

impl KeychainStatusResponse {
    /// Combine persisted enrollment/cleanup status with the independently queried provider capability.
    pub fn new(status: hypergraph_storage::keychain::Status, supported: bool) -> Self {
        Self {
            cleanup_pending: status.cleanup_pending,
            enrolled: status.enrolled,
            schema: status.schema,
            supported,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Document-scoped request reuses the adapter identity codec rather than domain Serde.
pub struct DocumentRequest {
    #[serde(with = "hypergraph_storage::encoding::identity")]
    #[schema(value_type=Id)]
    pub document: hypergraph_domain::records::DocumentId,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Explicit document/branch selection; a label or latest head is not an alternative binding.
pub struct BranchRequest {
    #[serde(with = "hypergraph_storage::encoding::identity")]
    #[schema(value_type=Id)]
    pub document: hypergraph_domain::records::DocumentId,
    #[serde(with = "hypergraph_storage::encoding::identity")]
    #[schema(value_type=Id)]
    pub branch: hypergraph_domain::records::BranchId,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Bounded read-only document audit intent; it grants no repair permission.
pub struct AuditRequest {
    #[serde(with = "hypergraph_storage::encoding::identity")]
    #[schema(value_type=Id)]
    pub document: hypergraph_domain::records::DocumentId,
    #[schema(schema_with=audit_budget_schema)]
    pub max_bytes: usize,
}

/// Bound the audit byte budget in generated schema using the actual adapter limit.
fn audit_budget_schema() -> utoipa::openapi::RefOr<utoipa::openapi::schema::Schema> {
    use utoipa::openapi::schema::{ObjectBuilder, Type};
    ObjectBuilder::new()
        .schema_type(Type::Integer)
        .minimum(Some(1))
        .maximum(Some(hypergraph_storage::audit::MAX_READ_BYTES))
        .into()
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(transparent)]
// Keep the existing list response bytes without adding a transport envelope.
pub struct DocumentsResponse(pub Vec<hypergraph_storage::DocumentSummary>);

// Reuse the existing adapter identity codec; domain types still have no Serde.
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Closed snapshot read intent; historical reconstruction does not follow current heads.
pub struct SnapshotRequest {
    #[serde(with = "hypergraph_storage::encoding::identity")]
    #[schema(value_type=Id)]
    pub document: hypergraph_domain::records::DocumentId,
    #[serde(with = "hypergraph_storage::encoding::identity")]
    #[schema(value_type=Id)]
    pub snapshot: hypergraph_domain::records::SnapshotId,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Exact retained source text; display normalization is outside this DTO.
pub struct SnapshotResponse {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
// Only the implemented trusted-server mode may be advertised.
pub enum RuntimeMode {
    TrustedServer,
}
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
// Current implementation edits one whole owned document, not arbitrary multi-owner buffers.
pub enum RuntimeOwnership {
    WholeDocument,
}
// Alphabetical fields retain the previous serde_json::Value response bytes.
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
// Current capability report; its unavailable list prevents planned features being advertised.
pub struct RuntimeResponse {
    pub capabilities: Vec<String>,
    #[schema(minimum = 1, maximum = 1)]
    pub contract: u8,
    pub create: bool,
    pub keychain_supported: bool,
    pub locked: bool,
    pub max_text_bytes: usize,
    pub mode: RuntimeMode,
    pub ownership: RuntimeOwnership,
    pub unavailable: Vec<String>,
    pub version: String,
}

impl RuntimeResponse {
    /// Build the current bounded capability response while retaining alphabetical field serialization.
    pub fn new(locked: bool, create: bool, keychain_supported: bool) -> Self {
        Self {
            capabilities: [
                "documents",
                "durable_drafts",
                "commit",
                "snapshot",
                "history",
                "historical_anchor",
                "private_clipboard",
                "fork",
                "reviewed_merge",
                "document_fork_graph",
                "semantic_assertion_overlay",
                "semantic_overlay_graph",
                "transformation_graph",
                "assertion_review_history",
                "publication_contributors",
                "committed_passage_comments",
                "local_branches",
                "working_copy",
                "document_integrity_audit",
                "branch_parent_comparison",
                "branch_parent_base",
                "keychain",
            ]
            .into_iter()
            .map(String::from)
            .collect(),
            contract: 1,
            create,
            keychain_supported,
            locked,
            max_text_bytes: hypergraph_storage::MAX_TEXT_BYTES,
            mode: RuntimeMode::TrustedServer,
            ownership: RuntimeOwnership::WholeDocument,
            unavailable: [
                "general_relationship_queries",
                "provenance_mutation",
                "agents",
                "federation",
                "client_held",
            ]
            .into_iter()
            .map(String::from)
            .collect(),
            version: env!("CARGO_PKG_VERSION").into(),
        }
    }
}

/// All currently routed endpoints are inventoried. Committed Fork has complete
/// typed request/result schemas, together with exact snapshot reads and runtime
/// metadata. Legacy paths
/// stay explicitly untyped until their own migration.
#[cfg(any(test, feature = "api-export"))]
#[allow(dead_code)] // Main does not serve schemas, even in all-features checks.
pub fn document() -> serde_json::Value {
    use std::collections::BTreeSet;
    use utoipa::OpenApi;
    #[derive(OpenApi)]
    #[openapi(components(schemas(
        ForkExecute,
        ForkCommand,
        ForkReceipt,
        LegacyError,
        Problem,
        SnapshotRequest,
        SnapshotResponse,
        RuntimeResponse,
        BootstrapRequest,
        BootstrapResponse,
        EmptyRequest,
        UnlockRequest,
        LockStateResponse,
        KeychainStatusResponse,
        KeychainEnrollmentResponse,
        KeychainRemovalResponse,
        DocumentRequest,
        BranchRequest,
        hypergraph_storage::EditorState,
        AuditRequest,
        hypergraph_storage::audit::Report,
        DocumentsResponse
    )))]
    struct Contract;
    let mut spec = serde_json::to_value(Contract::openapi()).unwrap();
    spec["openapi"] = serde_json::json!("3.1.0");
    spec["info"] = serde_json::json!({"title":"Hypergraph PX transport contract","version":"1","description":"API1; typed committed Fork, progressive legacy route coverage. Schema does not establish domain validity, authority or transaction guarantees."});
    let source = include_str!("main.rs")
        .split("#[cfg(test)]")
        .next()
        .unwrap();
    let routes: BTreeSet<_> = source
        .split('"')
        // Recognize only literal API route spellings, excluding test/source fragments.
        .filter(|s| {
            s.starts_with("/api/v1/")
                && s.len() > 8
                && s.bytes()
                    // Keep route characters within the literal inventory grammar.
                    .all(|b| b.is_ascii_lowercase() || b == b'/' || b == b'-' || b.is_ascii_digit())
        })
        .collect();

    // Attach typed schemas only where a current Rust DTO migration actually exists.
    let mut paths = serde_json::Map::new();
    for path in routes {
        let method = if path == "/api/v1/runtime" {
            "get"
        } else {
            "post"
        };
        let mut operation = serde_json::json!({"operationId":path.trim_start_matches("/api/v1/").replace('/',"_"),"x-hpx-schema-coverage":"route-only","responses":{"200":{"description":"Existing API1 result; type migration pending","content":{"application/json":{"schema":{}}}},"default":{"description":"Stable HPX error; problem details are opt-in through Accept","content":{"application/json":{"schema":{"$ref":"#/components/schemas/LegacyError"}},"application/problem+json":{"schema":{"$ref":"#/components/schemas/Problem"}}}}}});
        if method == "post" {
            operation["requestBody"] =
                serde_json::json!({"required":true,"content":{"application/json":{"schema":{}}}});
        }
        if path == "/api/v1/commands" {
            operation["x-hpx-schema-coverage"] =
                serde_json::json!("typed committed Fork; other commands remain legacy");
            operation["requestBody"]["content"]["application/json"]["schema"] = serde_json::json!({"oneOf":[{"$ref":"#/components/schemas/ForkExecute"},{"type":"object","required":["operation","request"],"additionalProperties":false,"properties":{"operation":{"$ref":"#/components/schemas/Id"},"request":{"type":"object","required":["command"],"properties":{"command":{"type":"string","not":{"const":"fork"}}}}}}]});
            operation["responses"]["200"]["content"]["application/json"]["schema"] = serde_json::json!({"oneOf":[{"$ref":"#/components/schemas/ForkReceipt"},{"type":"object","required":["operation","outcome"],"properties":{"operation":{"$ref":"#/components/schemas/Id"},"outcome":{"type":"object","required":["result"],"properties":{"result":{"type":"string","not":{"const":"forked"}}}}}}]});
        }
        if path == "/api/v1/snapshot" {
            operation["x-hpx-schema-coverage"] = serde_json::json!("typed");
            operation["requestBody"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":"#/components/schemas/SnapshotRequest"});
            operation["responses"]["200"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":"#/components/schemas/SnapshotResponse"});
        }
        if path == "/api/v1/runtime" {
            operation["x-hpx-schema-coverage"] = serde_json::json!("typed");
            operation["responses"]["200"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":"#/components/schemas/RuntimeResponse"});
        }
        if path == "/api/v1/bootstrap" {
            operation["x-hpx-schema-coverage"] = serde_json::json!("typed");
            operation["requestBody"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":"#/components/schemas/BootstrapRequest"});
            operation["responses"]["200"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":"#/components/schemas/BootstrapResponse"});
        }
        let auth_types = match path {
            "/api/v1/keychain/status" => Some(("EmptyRequest", "KeychainStatusResponse")),
            "/api/v1/keychain/enroll" => Some(("EmptyRequest", "KeychainEnrollmentResponse")),
            "/api/v1/keychain/remove" => Some(("EmptyRequest", "KeychainRemovalResponse")),
            "/api/v1/unlock" => Some(("UnlockRequest", "LockStateResponse")),
            "/api/v1/unlock/keychain" => Some(("EmptyRequest", "LockStateResponse")),
            _ => None,
        };
        if let Some((request, response)) = auth_types {
            operation["x-hpx-schema-coverage"] = serde_json::json!("typed");
            operation["requestBody"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":format!("#/components/schemas/{request}")});
            operation["responses"]["200"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":format!("#/components/schemas/{response}")});
        }
        if path == "/api/v1/editor" || path == "/api/v1/branches/editor" {
            let request = if path == "/api/v1/editor" {
                "DocumentRequest"
            } else {
                "BranchRequest"
            };
            operation["x-hpx-schema-coverage"] = serde_json::json!("typed");
            operation["requestBody"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":format!("#/components/schemas/{request}")});
            operation["responses"]["200"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":"#/components/schemas/EditorState"});
        }
        if path == "/api/v1/audit/document" {
            operation["x-hpx-schema-coverage"] = serde_json::json!("typed");
            operation["requestBody"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":"#/components/schemas/AuditRequest"});
            operation["responses"]["200"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":"#/components/schemas/DocumentAuditReport"});
        }
        if path == "/api/v1/documents" || path == "/api/v1/lock" {
            let response = if path == "/api/v1/documents" {
                "DocumentsResponse"
            } else {
                "LockStateResponse"
            };
            operation["x-hpx-schema-coverage"] = serde_json::json!("typed-response");
            operation["x-hpx-request-body"] = serde_json::json!("ignored");
            operation["requestBody"]["required"] = serde_json::json!(false);
            operation["responses"]["200"]["content"]["application/json"]["schema"] =
                serde_json::json!({"$ref":format!("#/components/schemas/{response}")});
        }
        paths.insert(path.to_owned(), serde_json::json!({method:operation}));
    }

    spec["paths"] = serde_json::Value::Object(paths);
    spec["components"]["securitySchemes"] = serde_json::json!({"session":{"type":"apiKey","in":"cookie","name":"__Host-hpx","description":"Current session plus existing Host/Origin/lock/current-authority checks. Bootstrap/unlock retain their existing gates."}});
    spec["security"] = serde_json::json!([{"session":[]}]);
    spec["paths"]["/api/v1/bootstrap"]["post"]["security"] = serde_json::json!([]);
    spec
}
