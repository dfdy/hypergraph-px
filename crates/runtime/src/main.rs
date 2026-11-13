// SPDX-License-Identifier: AGPL-3.0-only
//! Loopback HTTPS single-executable writer. See ADR0004 for trust/bootstrap limits.
mod api;
mod api_transport;
use hypergraph_domain::records::{
    Anchor, BranchId, DocumentId, OccurrenceId, OperationId, RevisionId, SnapshotId,
};
use hypergraph_keychain::{Native, Provider};
use hypergraph_storage::{Command, Workspace, encoding};
use rustls::{ServerConfig, ServerConnection, StreamOwned};
use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    io::{Read, Write},
    net::{TcpListener, TcpStream},
    path::PathBuf,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
    time::{Duration, Instant},
};
use zeroize::Zeroizing;
include!(concat!(env!("OUT_DIR"), "/assets.rs"));
const BODY_LIMIT: usize = 14 * 1024 * 1024;
const HEADER_LIMIT: usize = 16 * 1024;
const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);

/// The deadline applies to every underlying TLS socket operation, including
/// fragmented handshakes/records. An inactivity timeout alone is not a deadline.
struct DeadlineSocket {
    socket: TcpStream,
    deadline: Instant,
}
impl DeadlineSocket {
    fn remaining(&self) -> std::io::Result<Duration> {
        self.deadline
            .checked_duration_since(Instant::now())
            .filter(|remaining| !remaining.is_zero())
            .ok_or_else(|| std::io::Error::from(std::io::ErrorKind::TimedOut))
    }
}
impl Read for DeadlineSocket {
    fn read(&mut self, buffer: &mut [u8]) -> std::io::Result<usize> {
        self.socket.set_read_timeout(Some(self.remaining()?))?;
        self.socket.read(buffer)
    }
}
impl Write for DeadlineSocket {
    fn write(&mut self, buffer: &[u8]) -> std::io::Result<usize> {
        self.socket.set_write_timeout(Some(self.remaining()?))?;
        self.socket.write(buffer)
    }
    fn flush(&mut self) -> std::io::Result<()> {
        self.remaining()?;
        self.socket.flush()
    }
}
struct State<P = Native> {
    workspace: Option<Workspace>,
    path: PathBuf,
    create: bool,
    launch: String,
    cookie: String,
    last_unlock: Option<Instant>,
    provider: P,
}
struct Request {
    method: String,
    path: String,
    headers: BTreeMap<String, String>,
    body: Zeroizing<Vec<u8>>,
}
struct Response {
    status: u16,
    mime: &'static str,
    bytes: Vec<u8>,
    cookie: Option<String>,
}
fn json<T: Serialize>(value: &T) -> Response {
    Response {
        status: 200,
        mime: "application/json; charset=utf-8",
        bytes: serde_json::to_vec(value).unwrap(),
        cookie: None,
    }
}
fn error(status: u16, code: &str) -> Response {
    let mut r = json(&serde_json::json!({"error":code}));
    r.status = status;
    r
}
fn decode<T: serde::de::DeserializeOwned>(r: &Request) -> Result<T, Response> {
    serde_json::from_slice(&r.body).map_err(|_| error(400, "invalid_request"))
}
fn storage_error(e: hypergraph_storage::Error) -> Response {
    use hypergraph_storage::Error::*;
    match e {
        Conflict => error(409, "conflict"),
        NotFound => error(404, "not_found"),
        Limit => error(413, "limit"),
        Invalid => error(400, "invalid_request"),
        Keychain(hypergraph_keychain::Error::Unavailable) => error(503, "keychain_unavailable"),
        Keychain(hypergraph_keychain::Error::Denied) => error(403, "keychain_denied"),
        Keychain(hypergraph_keychain::Error::NotFound) => error(404, "keychain_missing"),
        Keychain(hypergraph_keychain::Error::Exists) => error(409, "keychain_item_exists"),
        Keychain(_) => error(500, "keychain_failure"),
        CleanupPending => error(409, "keychain_cleanup_pending"),
        Backup => error(500, "backup_failed"),
        _ => error(500, "storage_failure"),
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct WorkingReferenceRequest {
    #[serde(with = "encoding::identity")]
    entry: hypergraph_storage::clipboard::EntryId,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct BranchListRequest {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::optional_identity")]
    next: Option<BranchId>,
    limit: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct BranchHistoryPageRequest {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    branch: BranchId,
    #[serde(with = "encoding::identity")]
    snapshot: SnapshotId,
    cursor: Option<Vec<u8>>,
    limit: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct BranchHistoryRequest {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    branch: BranchId,
    #[serde(with = "encoding::optional_identity")]
    next: Option<RevisionId>,
    limit: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct OverlayGraphRequest {
    nodes: Vec<hypergraph_storage::overlay_graph::Selection>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct GraphRequest {
    #[serde(with = "encoding::identities")]
    documents: Vec<DocumentId>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ContributorsRequest {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    snapshot: SnapshotId,
    cursor: Option<Vec<u8>>,
    limit: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct HistoryRequest {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::optional_identity")]
    next: Option<RevisionId>,
    limit: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct CommentsRequest {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    snapshot: SnapshotId,
    #[serde(with = "encoding::optional_identity")]
    next: Option<hypergraph_domain::records::RevisionId>,
    limit: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct AssertionRevisionRequest {
    #[serde(with = "encoding::identity")]
    node: hypergraph_domain::records::NodeId,
    #[serde(with = "encoding::identity")]
    revision: RevisionId,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct AssertionRequest {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    snapshot: SnapshotId,
    generation: Option<u64>,
    offset: usize,
    limit: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ClipboardRequest {
    generation: Option<u64>,
    offset: usize,
    limit: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct AnchorRequest {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    revision: RevisionId,
    #[serde(with = "encoding::identities")]
    occurrence_path: Vec<OccurrenceId>,
    start_byte: usize,
    end_byte: usize,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ReceiptRequest {
    #[serde(with = "encoding::identity")]
    operation: OperationId,
}
fn token() -> String {
    hypergraph_storage::new_id()
        .expect("OS entropy unavailable")
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}
fn secure_equal(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.bytes().zip(b.bytes()).fold(0u8, |n, (a, b)| n | (a ^ b)) == 0
}
fn route(r: Request, state: &mut State<impl Provider>, host: &str) -> Response {
    let problem = r.headers.get("accept").is_some_and(|accept| {
        accept.split(',').any(|range| {
            let mut parts = range.split(';');
            if !parts
                .next()
                .unwrap_or("")
                .trim()
                .eq_ignore_ascii_case("application/problem+json")
            {
                return false;
            }
            parts
                .filter_map(|part| part.trim().split_once('='))
                .filter(|(name, _)| name.eq_ignore_ascii_case("q"))
                .all(|(_, value)| value.parse::<f32>().is_ok_and(|q| q > 0.0 && q <= 1.0))
        })
    });
    let mut response = route_inner(r, state, host);
    if problem
        && response.status >= 400
        && let Ok(legacy) = serde_json::from_slice::<api::LegacyError>(&response.bytes)
    {
        let title = match response.status {
            400 => "Bad Request",
            401 => "Unauthorized",
            403 => "Forbidden",
            404 => "Not Found",
            405 => "Method Not Allowed",
            409 => "Conflict",
            413 => "Content Too Large",
            415 => "Unsupported Media Type",
            423 => "Locked",
            429 => "Too Many Requests",
            503 => "Service Unavailable",
            _ => "Internal Server Error",
        };
        response.bytes = serde_json::to_vec(&api::Problem {
            problem_type: "about:blank".into(),
            title: title.into(),
            status: response.status,
            error: legacy.error,
        })
        .unwrap();
        response.mime = "application/problem+json";
    }
    response
}
fn route_inner(r: Request, state: &mut State<impl Provider>, host: &str) -> Response {
    if r.headers.get("host").map(String::as_str) != Some(host) {
        return error(403, "host_rejected");
    }
    if r.headers
        .get("sec-fetch-site")
        .is_some_and(|v| v == "cross-site")
    {
        return error(403, "origin_rejected");
    }
    if r.method == "POST" {
        if r.headers.get("origin").map(String::as_str) != Some(format!("https://{host}").as_str()) {
            return error(403, "origin_rejected");
        }
        if r.headers.get("content-type").map(String::as_str) != Some("application/json") {
            return error(415, "json_required");
        }
    }
    if r.method == "GET" && !r.path.starts_with("/api/") {
        let path = if r.path == "/" {
            "/index.html"
        } else {
            &r.path
        };
        if let Some((_, bytes)) = ASSETS.iter().find(|(key, _)| *key == path) {
            let mime = if path.ends_with(".html") {
                "text/html; charset=utf-8"
            } else if path.ends_with(".js") {
                "text/javascript; charset=utf-8"
            } else if path.ends_with(".css") {
                "text/css; charset=utf-8"
            } else if path.ends_with(".png") {
                "image/png"
            } else if path.ends_with(".woff2") {
                "font/woff2"
            } else if path.ends_with(".woff") {
                "font/woff"
            } else if path.ends_with(".ttf") {
                "font/ttf"
            } else {
                "text/plain; charset=utf-8"
            };
            return Response {
                status: 200,
                mime,
                bytes: bytes.to_vec(),
                cookie: None,
            };
        }
        return error(404, "not_found");
    }
    if r.method == "POST" && r.path == "/api/v1/bootstrap" {
        let request: api::BootstrapRequest = match decode(&r) {
            Ok(v) => v,
            Err(e) => return e,
        };
        if !secure_equal(&request.token, &state.launch) {
            return error(403, "unauthorized");
        }
        let mut result = json(&api::BootstrapResponse {
            authenticated: true,
        });
        result.cookie = Some(format!(
            "__Host-hpx={}; Path=/; Secure; HttpOnly; SameSite=Strict",
            state.cookie
        ));
        return result;
    }
    let authorized = r.headers.get("cookie").is_some_and(|cookie| {
        let mut sessions = cookie
            .split(';')
            .map(|value| value.trim_matches([' ', '\t']))
            .filter(|value| value.split('=').next() == Some("__Host-hpx"));
        let Some(session) = sessions.next() else {
            return false;
        };
        sessions.next().is_none() && secure_equal(session, &format!("__Host-hpx={}", state.cookie))
    });
    if !authorized {
        return error(401, "unauthorized");
    }
    if r.method == "GET" && r.path == "/api/v1/runtime" {
        return json(&api::RuntimeResponse::new(
            state.workspace.is_none(),
            state.create,
            state.provider.supported(),
        ));
    }
    if r.method != "POST" {
        return error(405, "method_rejected");
    }
    if r.path == "/api/v1/keychain/status" {
        if let Err(e) = decode::<api::EmptyRequest>(&r) {
            return e;
        }
        let status = if let Some(workspace) = &state.workspace {
            workspace.current_keychain_status()
        } else if state.create {
            Ok(hypergraph_storage::keychain::Status {
                schema: 1,
                enrolled: false,
                cleanup_pending: false,
            })
        } else {
            Workspace::keychain_status(&state.path)
        };
        return match status {
            Ok(status) => json(&api::KeychainStatusResponse::new(
                status,
                state.provider.supported(),
            )),
            Err(e) => storage_error(e),
        };
    }
    if r.path == "/api/v1/unlock/keychain" {
        if let Err(e) = decode::<api::EmptyRequest>(&r) {
            return e;
        }
        if state.workspace.is_some() {
            return error(409, "already_unlocked");
        }
        if state.create {
            return error(409, "workspace_not_created");
        }
        if state
            .last_unlock
            .is_some_and(|t| t.elapsed() < Duration::from_secs(1))
        {
            return error(429, "retry_later");
        }
        state.last_unlock = Some(Instant::now());
        return match Workspace::open_keychain(&state.path, &mut state.provider) {
            Ok(workspace) => {
                state.workspace = Some(workspace);
                json(&api::LockStateResponse { locked: false })
            }
            Err(e) => storage_error(e),
        };
    }
    if r.path == "/api/v1/unlock" {
        if state.workspace.is_some() {
            return error(409, "already_unlocked");
        }
        if state
            .last_unlock
            .is_some_and(|t| t.elapsed() < Duration::from_secs(1))
        {
            return error(429, "retry_later");
        }
        state.last_unlock = Some(Instant::now());
        let mut unlock: api::UnlockRequest = match decode(&r) {
            Ok(v) => v,
            Err(e) => return e,
        };
        let passphrase = Zeroizing::new(std::mem::take(&mut unlock.passphrase));
        let result = if state.create {
            Workspace::create(&state.path, passphrase.as_bytes(), "Local owner")
        } else {
            Workspace::open(&state.path, passphrase.as_bytes())
        };
        return match result {
            Ok(workspace) => {
                state.workspace = Some(workspace);
                state.create = false;
                json(&api::LockStateResponse { locked: false })
            }
            Err(_) => error(403, "unlock_failed"),
        };
    }
    if r.path == "/api/v1/lock" {
        state.workspace = None;
        return json(&api::LockStateResponse { locked: true });
    }
    let Some(workspace) = state.workspace.as_mut() else {
        return error(423, "locked");
    };
    match r.path.as_str() {
        "/api/v1/branches/merge-base" => {
            let input: api::BranchRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.parent_merge_base(input.document, input.branch, Default::default()) {
                Ok(view) => json(&view),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/branches/comparison" => {
            let input: api::BranchRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.branch_comparison(input.document, input.branch) {
                Ok(comparison) => json(&comparison),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/audit/document" => {
            let input: api::AuditRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.audit_document(input.document, input.max_bytes) {
                Ok(report) => json(&report),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/assertion/revision" => {
            let input: AssertionRevisionRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.assertion_revision(input.node, input.revision) {
                Ok(entry) => json(
                    &serde_json::json!({"text_snapshot_scope":"semantic_assertions_excluded","entry":entry}),
                ),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/graph/overlay" => {
            let input: OverlayGraphRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.overlay_graph(&input.nodes) {
                Ok(graph) => json(&graph),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/assertions" => {
            let input: AssertionRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.assertion_page(
                input.document,
                input.snapshot,
                input.generation,
                input.offset,
                input.limit,
            ) {
                Ok(page) => json(&page),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/graph/transformations" => {
            let input: OverlayGraphRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.transformation_graph(&input.nodes) {
                Ok(graph) => json(&graph),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/graph" => {
            let input: GraphRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.document_fork_graph(&input.documents) {
                Ok(graph) => json(&graph),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/merge" => {
            let input: api::DocumentRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.document_merge(input.document) {
                Ok(event) => json(&event),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/derivation" => {
            let input: api::DocumentRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.document_derivation(input.document) {
                Ok(event) => json(&event),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/clipboard" => {
            let input: ClipboardRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.clipboard_page(input.generation, input.offset, input.limit) {
                Ok(page) => json(&page),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/anchor/resolve" => {
            let input: AnchorRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            let anchor = Anchor {
                revision: input.revision,
                occurrence_path: input.occurrence_path,
                start_byte: input.start_byte,
                end_byte: input.end_byte,
            };
            match workspace.resolve_anchor(input.document, input.snapshot, &anchor) {
                Ok(text) => json(&serde_json::json!({"text":text})),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/comments" => {
            let input: CommentsRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.comments_page(input.document, input.snapshot, input.next, input.limit) {
                Ok(page) => json(&page),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/contributors/publications" => {
            let input: ContributorsRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.publication_contributors(
                input.document,
                input.snapshot,
                input.cursor.as_deref(),
                input.limit,
            ) {
                Ok(page) => json(&page),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/working/derivation" => {
            let input: api::DocumentRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.working_derivation(input.document) {
                Ok(event) => json(&event),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/working/reference" => {
            let input: WorkingReferenceRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.working_reference(input.entry) {
                Ok(entry) => json(&entry),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/working/clipboard" => {
            let input: ClipboardRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.working_clipboard_page(input.generation, input.offset, input.limit) {
                Ok(page) => json(&page),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/working/source" => {
            let input: hypergraph_storage::working::Source = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.working_source(input) {
                Ok(view) => json(&view),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/branches" => {
            let input: BranchListRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.branch_page(input.document, input.next, input.limit) {
                Ok(page) => json(&page),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/branches/editor" => {
            let input: api::BranchRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.open_branch(input.document, input.branch) {
                Ok(editor) => json(&editor),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/branches/history/page" => {
            let input: BranchHistoryPageRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.branch_history_page(
                input.document,
                input.branch,
                input.snapshot,
                input.cursor.as_deref(),
                input.limit,
            ) {
                Ok(page) => json(&page),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/branches/history" => {
            let input: BranchHistoryRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.branch_history(input.document, input.branch, input.next, input.limit) {
                Ok(page) => json(&serde_json::json!({"branch":input.branch.0,"page":page})),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/history" => {
            let input: HistoryRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.history_page(input.document, input.next, input.limit) {
                Ok(v) => json(&v),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/keychain/enroll" => {
            if let Err(e) = decode::<api::EmptyRequest>(&r) {
                return e;
            }
            match workspace.enroll_keychain(&mut state.provider) {
                Ok(enrollment) => json(&api::KeychainEnrollmentResponse {
                    backup_created: enrollment.backup.is_some(),
                    enrolled: true,
                }),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/keychain/remove" => {
            if let Err(e) = decode::<api::EmptyRequest>(&r) {
                return e;
            }
            match workspace.remove_keychain(&mut state.provider) {
                Ok(()) => json(&api::KeychainRemovalResponse {
                    cleanup_pending: false,
                    enrolled: false,
                }),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/documents" => match workspace.list_documents() {
            Ok(v) => json(&api::DocumentsResponse(v)),
            Err(e) => storage_error(e),
        },
        "/api/v1/editor" => {
            let input: api::DocumentRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.open_document(input.document) {
                Ok(v) => json(&v),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/commands" => {
            // Borrow raw command bytes until dispatch so duplicate fields and
            // exact source survive; do not round-trip requests through Value.
            let input: api::Execute<&serde_json::value::RawValue> =
                match serde_json::from_slice(&r.body) {
                    Ok(v) => v,
                    Err(_) => return error(400, "invalid_request"),
                };
            let command = match api_transport::decode_command(input.request) {
                Ok(command) => command,
                Err(_) => return error(400, "invalid_request"),
            };
            let fork = matches!(&command, Command::Fork { .. });
            match workspace.execute(OperationId(input.operation.0), command) {
                Ok(v) if fork => match api_transport::fork_receipt(v) {
                    Ok(receipt) => json(&receipt),
                    Err(e) => storage_error(e),
                },
                Ok(v) => json(&v),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/receipt" => {
            let input: ReceiptRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.receipt(input.operation) {
                Ok(v) => json(&v),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/snapshot" => {
            let input: api::SnapshotRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.reconstruct_snapshot(input.document, input.snapshot) {
                Ok(text) => json(&api::SnapshotResponse { text }),
                Err(e) => storage_error(e),
            }
        }
        _ => error(404, "not_found"),
    }
}
fn read_request(stream: &mut impl Read) -> Result<Request, ()> {
    let mut bytes = Zeroizing::new(Vec::new());
    let end;
    loop {
        if bytes.len() >= HEADER_LIMIT {
            return Err(());
        }
        let mut chunk = [0; 1024];
        let count = stream.read(&mut chunk).map_err(|_| ())?;
        if count == 0 {
            return Err(());
        }
        let scan_from = bytes.len().saturating_sub(3);
        bytes.extend_from_slice(&chunk[..count]);
        if let Some(at) = bytes[scan_from..].windows(4).position(|w| w == b"\r\n\r\n") {
            end = scan_from + at + 4;
            if end > HEADER_LIMIT {
                return Err(());
            }
            break;
        }
    }
    let mut headers = [httparse::EMPTY_HEADER; 48];
    let mut parsed = httparse::Request::new(&mut headers);
    if !parsed.parse(&bytes[..end]).map_err(|_| ())?.is_complete() || parsed.version != Some(1) {
        return Err(());
    }
    let method = parsed.method.ok_or(())?.to_owned();
    let path = parsed.path.ok_or(())?.to_owned();
    if !["GET", "POST"].contains(&method.as_str())
        || !path.starts_with('/')
        || path.contains(['?', '#', '\\', '\r', '\n'])
    {
        return Err(());
    }
    let mut headers = BTreeMap::new();
    for header in parsed.headers {
        let name = header.name.to_ascii_lowercase();
        let value = std::str::from_utf8(header.value)
            .map_err(|_| ())?
            .trim_matches([' ', '\t'])
            .to_owned();
        if headers.insert(name, value).is_some() {
            return Err(());
        }
    }
    if headers.contains_key("transfer-encoding") || headers.contains_key("expect") {
        return Err(());
    }
    let length = match headers.get("content-length") {
        Some(v) => {
            if !v.bytes().all(|b| b.is_ascii_digit()) || v.is_empty() {
                return Err(());
            }
            v.parse::<usize>().map_err(|_| ())?
        }
        None => 0,
    };
    if length > BODY_LIMIT || bytes.len() - end > length || method == "GET" && length != 0 {
        return Err(());
    }
    let mut body = Zeroizing::new(Vec::with_capacity(length));
    body.extend_from_slice(&bytes[end..]);
    let mut chunk = Zeroizing::new([0; 8192]);
    while body.len() < length {
        let remaining = length - body.len();
        let count = stream
            .read(&mut chunk[..remaining.min(8192)])
            .map_err(|_| ())?;
        if count == 0 {
            return Err(());
        }
        body.extend_from_slice(&chunk[..count]);
    }
    Ok(Request {
        method,
        path,
        headers,
        body,
    })
}
fn write_response(stream: &mut impl Write, response: Response) -> std::io::Result<()> {
    let cookie = response
        .cookie
        .map(|v| format!("Set-Cookie: {v}\r\n"))
        .unwrap_or_default();
    let header = format!(
        "HTTP/1.1 {} Result\r\nContent-Type: {}\r\nContent-Length: {}\r\nConnection: close\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nReferrer-Policy: no-referrer\r\nContent-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\r\n{}\r\n",
        response.status,
        response.mime,
        response.bytes.len(),
        cookie
    );
    stream.write_all(header.as_bytes())?;
    stream.write_all(&response.bytes)?;
    stream.flush()
}
fn serve_socket(socket: TcpStream, tls: Arc<ServerConfig>, state: Arc<Mutex<State>>, host: String) {
    let deadline = Instant::now() + REQUEST_TIMEOUT;
    let Ok(connection) = ServerConnection::new(tls) else {
        return;
    };
    let mut stream = StreamOwned::new(connection, DeadlineSocket { socket, deadline });
    let response = match read_request(&mut stream) {
        Ok(r) => match state.lock() {
            Ok(mut state) if Instant::now() < deadline => route(r, &mut state, &host),
            Ok(_) => error(408, "request_timeout"),
            Err(_) => error(503, "unavailable"),
        },
        Err(_) => error(400, "invalid_http"),
    };
    let _ = write_response(&mut stream, response);
}
fn run() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = std::env::args().skip(1);
    let mut path = None;
    let mut cert = None;
    let mut key = None;
    let mut port = 8388u16;
    let mut create = false;
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--workspace" => path = args.next().map(PathBuf::from),
            "--cert" => cert = args.next().map(PathBuf::from),
            "--key" => key = args.next().map(PathBuf::from),
            "--port" => port = args.next().ok_or("missing port")?.parse()?,
            "--create" => create = true,
            "--help" => {
                println!(
                    "hypergraph --workspace PATH --cert CERT.pem --key KEY.pem [--create] [--port 8388]\nHTTPS only; certificate must be trusted for 127.0.0.1. Workspace unlock occurs in the browser."
                );
                return Ok(());
            }
            _ => return Err("unknown option; use --help".into()),
        }
    }
    let path = path.ok_or("--workspace required")?;
    let cert = cert.ok_or("--cert required")?;
    let key = key.ok_or("--key required")?;
    if port < 1024 {
        return Err("port must be >=1024".into());
    }
    if create == path.exists() {
        return Err(
            "--create requires a new workspace path; reopening requires an existing workspace"
                .into(),
        );
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if std::fs::metadata(&key)?.permissions().mode() & 0o077 != 0 {
            return Err("TLS private key must have mode 0600 or more restrictive".into());
        }
    }
    let certs = rustls_pemfile::certs(&mut std::io::BufReader::new(std::fs::File::open(cert)?))
        .collect::<Result<Vec<_>, _>>()?;
    let key_bytes = Zeroizing::new(std::fs::read(key)?);
    let key = rustls_pemfile::private_key(&mut &key_bytes[..])?.ok_or("missing TLS private key")?;
    let tls = Arc::new(
        ServerConfig::builder()
            .with_no_client_auth()
            .with_single_cert(certs, key)?,
    );
    let launch = token();
    let state = Arc::new(Mutex::new(State {
        workspace: None,
        path,
        create,
        launch: launch.clone(),
        cookie: token(),
        last_unlock: None,
        provider: Native,
    }));
    let host = format!("127.0.0.1:{port}");
    let listener = TcpListener::bind(&host)?;
    println!(
        "Open https://{host}/#launch={launch}\nLocal trusted-server runtime; workspace locked. Keep this launch URL private."
    );
    let slots = Arc::new(AtomicUsize::new(0));
    for socket in listener.incoming() {
        let socket = socket?;
        if slots.fetch_add(1, Ordering::AcqRel) >= 16 {
            slots.fetch_sub(1, Ordering::AcqRel);
            continue;
        }
        let slots = slots.clone();
        let state = state.clone();
        let tls = tls.clone();
        let host = host.clone();
        std::thread::spawn(move || {
            struct Slot(Arc<AtomicUsize>);
            impl Drop for Slot {
                fn drop(&mut self) {
                    self.0.fetch_sub(1, Ordering::AcqRel);
                }
            }
            let _slot = Slot(slots);
            serve_socket(socket, tls, state, host);
        });
    }
    Ok(())
}
fn main() {
    if let Err(error) = run() {
        eprintln!("Runtime startup failed: {error}");
        std::process::exit(1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn history_route_enforces_session_lock_schema_and_page_limits() {
        let directory = std::env::temp_dir().join(format!("hpx-history-route-{}", token()));
        std::fs::create_dir(&directory).unwrap();
        let mut workspace = Workspace::create(
            &directory.join("test.hpx"),
            b"synthetic-history-passphrase",
            "Synthetic",
        )
        .unwrap();
        let document = match workspace
            .execute(
                OperationId([1; 32]),
                Command::Create {
                    title: "Synthetic".into(),
                    text: "Exact😀\r\n".into(),
                },
            )
            .unwrap()
            .outcome
        {
            hypergraph_storage::Outcome::Created { document } => document,
            _ => panic!(),
        };
        let mut state = State {
            workspace: Some(workspace),
            path: directory.join("test.hpx"),
            create: false,
            launch: "launch".into(),
            cookie: "session".into(),
            last_unlock: None,
            provider: Native,
        };
        let request = |body: serde_json::Value| Request {
            method: "POST".into(),
            path: "/api/v1/history".into(),
            headers: BTreeMap::from([
                ("host".into(), "127.0.0.1:8388".into()),
                ("origin".into(), "https://127.0.0.1:8388".into()),
                ("content-type".into(), "application/json".into()),
                ("cookie".into(), "__Host-hpx=session".into()),
            ]),
            body: Zeroizing::new(serde_json::to_vec(&body).unwrap()),
        };
        let input = serde_json::json!({"document":document.0,"next":null,"limit":1});
        let mut unauthenticated = request(input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        let page = route(request(input.clone()), &mut state, "127.0.0.1:8388");
        assert_eq!(page.status, 200);
        let page: hypergraph_storage::history::Page = serde_json::from_slice(&page.bytes).unwrap();
        assert_eq!(page.entries.len(), 1);
        assert!(page.next.is_none());
        for invalid in [
            serde_json::json!({"document":document.0,"next":null,"limit":0}),
            serde_json::json!({"document":document.0,"next":null,"limit":33}),
            serde_json::json!({"document":document.0,"next":[1],"limit":1}),
            serde_json::json!({"document":document.0,"next":null,"limit":1,"unexpected":true}),
        ] {
            assert_eq!(
                route(request(invalid), &mut state, "127.0.0.1:8388").status,
                400
            );
        }
        let editor = state
            .workspace
            .as_mut()
            .unwrap()
            .open_document(document)
            .unwrap();
        let branch_request = |path: &str, body| {
            let mut r = request(body);
            r.path = format!("/api/v1/{path}");
            r
        };
        let audit_input = serde_json::json!({"document":document.0,"max_bytes":16777216});
        let mut denied = branch_request("audit/document", audit_input.clone());
        denied.headers.remove("cookie");
        assert_eq!(route(denied, &mut state, "127.0.0.1:8388").status, 401);
        let response = route(
            branch_request("audit/document", audit_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let report: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        assert_eq!(report["document"], serde_json::json!(document.0));
        assert_eq!(report["scope"], hypergraph_storage::audit::SCOPE);
        assert_eq!(report["authenticated_records"], 8);
        assert!(report["finding"].is_null());
        assert!(!String::from_utf8_lossy(&response.bytes).contains("Exact"));
        for invalid in [
            serde_json::json!({"document":document.0,"max_bytes":0}),
            serde_json::json!({"document":document.0,"max_bytes":16777217}),
            serde_json::json!({"document":document.0,"max_bytes":-1}),
            serde_json::json!({"document":document.0,"max_bytes":1.5}),
            serde_json::json!({"document":[1],"max_bytes":16777216}),
            serde_json::json!({"document":document.0,"max_bytes":16777216,"repair":true}),
        ] {
            assert_eq!(
                route(
                    branch_request("audit/document", invalid),
                    &mut state,
                    "127.0.0.1:8388"
                )
                .status,
                400
            );
        }
        assert_eq!(
            route(
                branch_request(
                    "audit/document",
                    serde_json::json!({"document":vec![99;32],"max_bytes":16777216})
                ),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            404
        );
        assert_eq!(
            route(
                branch_request(
                    "audit/document",
                    serde_json::json!({"document":document.0,"max_bytes":1})
                ),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            413
        );
        let branch_list = serde_json::json!({"document":document.0,"next":null,"limit":16});
        let mut denied = branch_request("branches", branch_list.clone());
        denied.headers.remove("cookie");
        assert_eq!(route(denied, &mut state, "127.0.0.1:8388").status, 401);
        for invalid in [
            serde_json::json!({"document":document.0,"next":null,"limit":0}),
            serde_json::json!({"document":document.0,"next":null,"limit":17}),
            serde_json::json!({"document":document.0,"next":[1],"limit":16}),
            serde_json::json!({"document":document.0,"next":null,"limit":16,"owner":"forbidden"}),
        ] {
            assert_eq!(
                route(
                    branch_request("branches", invalid),
                    &mut state,
                    "127.0.0.1:8388"
                )
                .status,
                400
            );
        }
        let creation = serde_json::json!({"operation":vec![201;32],"request":{"command":"branch","mutation":{"action":"create","document":document.0,"parent":editor.branch.0,"revision":editor.base.0,"snapshot":editor.snapshot.0,"name":"Alternative"}}});
        let response = route(
            branch_request("commands", creation),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let receipt: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        let branch = receipt["outcome"]["state"]["branch"].clone();
        let comparison_input = serde_json::json!({"document":document.0,"branch":branch});
        let mut denied = branch_request("branches/comparison", comparison_input.clone());
        denied.headers.remove("cookie");
        assert_eq!(route(denied, &mut state, "127.0.0.1:8388").status, 401);
        let response = route(
            branch_request("branches/comparison", comparison_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let comparison: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        assert_eq!(comparison["branch"], branch);
        assert_eq!(comparison["parent"], serde_json::json!(editor.branch.0));
        assert_eq!(
            comparison["source_snapshot"],
            serde_json::json!(editor.snapshot.0)
        );
        assert_eq!(
            comparison["parent_snapshot"],
            serde_json::json!(editor.snapshot.0)
        );
        for invalid in [
            serde_json::json!({"document":document.0,"branch":editor.branch.0}),
            serde_json::json!({"document":document.0,"branch":[1]}),
            serde_json::json!({"document":document.0,"branch":branch,"merge":true}),
        ] {
            assert_eq!(
                route(
                    branch_request("branches/comparison", invalid),
                    &mut state,
                    "127.0.0.1:8388"
                )
                .status,
                400
            );
        }
        let response = route(
            branch_request("branches", branch_list),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let page: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        assert_eq!(page["entries"].as_array().unwrap().len(), 1);
        assert_eq!(page["original_branch"], serde_json::json!(editor.branch.0));
        assert_eq!(page["entries"][0]["branch"], branch);
        let response = route(
            branch_request(
                "branches/editor",
                serde_json::json!({"document":document.0,"branch":branch}),
            ),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let child: hypergraph_storage::EditorState =
            serde_json::from_slice(&response.bytes).unwrap();
        assert_eq!(child.node, editor.node);
        assert_eq!(child.base, editor.base);
        assert_eq!(child.text, editor.text);
        let response = route(
            branch_request(
                "branches/history",
                serde_json::json!({"document":document.0,"branch":branch,"next":null,"limit":1}),
            ),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let page: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        assert_eq!(page["branch"], branch);
        assert_eq!(
            page["page"]["entries"][0]["revision"],
            serde_json::json!(editor.base.0)
        );
        for (path, body) in [
            (
                "branches/editor",
                serde_json::json!({"document":document.0,"branch":[1]}),
            ),
            (
                "branches/editor",
                serde_json::json!({"document":document.0,"branch":branch,"owner":"forbidden"}),
            ),
            (
                "branches/history",
                serde_json::json!({"document":document.0,"branch":branch,"next":null,"limit":0}),
            ),
        ] {
            assert_eq!(
                route(branch_request(path, body), &mut state, "127.0.0.1:8388").status,
                400
            );
        }
        let capture = serde_json::json!({"operation":vec![202;32],"request":{"command":"checkpoint","plan":{"document":document.0,"branch":editor.branch.0,"generation":editor.generation,"base":editor.base.0,"sequence":editor.acknowledged_sequence,"text":editor.text,"start_byte":5,"end_byte":11,"quote":"😀\r\n"}}});
        let response = route(
            branch_request("commands", capture),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let receipt: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        let checkpoint = receipt["outcome"]["state"]["checkpoint"].clone();
        let working = receipt["outcome"]["state"]["working_branch"].clone();
        let source = serde_json::json!({"kind":"working_checkpoint","document":document.0,"node":editor.node.0,"branch":editor.branch.0,"working_branch":working,"checkpoint":checkpoint,"occurrence_path":[editor.occurrence.0],"start_byte":5,"end_byte":11});
        let mut denied = branch_request("working/source", source.clone());
        denied.headers.remove("cookie");
        assert_eq!(route(denied, &mut state, "127.0.0.1:8388").status, 401);
        let response = route(
            branch_request("working/source", source.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let view: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        assert_eq!(view["text"], editor.text);
        assert_eq!(view["publication"], "private_working_checkpoint");
        assert!(view["promotion"].is_null());
        for field in ["kind", "checkpoint", "extra"] {
            let mut invalid = source.clone();
            invalid[field] = match field {
                "kind" => serde_json::json!("committed"),
                "checkpoint" => serde_json::json!([1]),
                _ => serde_json::json!(true),
            };
            assert_eq!(
                route(
                    branch_request("working/source", invalid),
                    &mut state,
                    "127.0.0.1:8388"
                )
                .status,
                400
            );
        }
        let copy = serde_json::json!({"operation":vec![203;32],"request":{"command":"working_copy","generation":0,"plan":{"document":document.0,"branch":editor.branch.0,"generation":editor.generation,"base":editor.base.0,"sequence":editor.acknowledged_sequence,"text":editor.text,"start_byte":5,"end_byte":11,"quote":"😀\r\n"}}});
        let response = route(
            branch_request("commands", copy),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let copied: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        let working_list = serde_json::json!({"generation":null,"offset":0,"limit":16});
        let mut denied = branch_request("working/clipboard", working_list.clone());
        denied.headers.remove("cookie");
        assert_eq!(route(denied, &mut state, "127.0.0.1:8388").status, 401);
        let response = route(
            branch_request("working/clipboard", working_list),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        let page: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
        assert_eq!(page["total"], 1);
        assert_eq!(
            page["entries"][0]["id"],
            copied["outcome"]["state"]["entry"]
        );
        assert_eq!(page["entries"][0]["target"]["kind"], "working");
        let response = route(
            branch_request(
                "working/reference",
                serde_json::json!({"entry":page["entries"][0]["id"]}),
            ),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        for invalid in [
            serde_json::json!({"generation":null,"offset":0,"limit":17}),
            serde_json::json!({"generation":null,"offset":0,"limit":1,"extra":true}),
        ] {
            assert_eq!(
                route(
                    branch_request("working/clipboard", invalid),
                    &mut state,
                    "127.0.0.1:8388"
                )
                .status,
                400
            );
        }
        let anchor = serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"revision":editor.base.0,"occurrence_path":[editor.occurrence.0],"start_byte":5,"end_byte":11});
        let comments_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/comments".into();
            r
        };
        let comments_input = serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"next":null,"limit":8});
        let mut denied = comments_request(comments_input.clone());
        denied.headers.remove("cookie");
        assert_eq!(route(denied, &mut state, "127.0.0.1:8388").status, 401);
        for invalid in [
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"next":null,"limit":9}),
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"next":[1],"limit":8}),
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"next":null,"limit":8,"owner":"forbidden"}),
        ] {
            assert_eq!(
                route(comments_request(invalid), &mut state, "127.0.0.1:8388").status,
                400
            );
        }
        let mut comment = request(
            serde_json::json!({"operation":vec![95;32],"request":{"command":"comment","plan":{"source":{"document":document.0,"node":editor.node.0,"snapshot":editor.snapshot.0,"revision":editor.base.0,"occurrence_path":[editor.occurrence.0],"start_byte":5,"end_byte":11},"expected_draft":null,"quote":"😀\r\n","body":"Exact comment\r\n😀"}}}),
        );
        comment.path = "/api/v1/commands".into();
        assert_eq!(route(comment, &mut state, "127.0.0.1:8388").status, 200);
        let comment_page = route(
            comments_request(comments_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(comment_page.status, 200);
        let comment_page: serde_json::Value = serde_json::from_slice(&comment_page.bytes).unwrap();
        assert_eq!(comment_page["entries"][0]["body"], "Exact comment\r\n😀");
        assert_eq!(comment_page["text_snapshot_scope"], "comments_excluded");
        let workspace = state.workspace.take();
        assert_eq!(
            route(
                comments_request(comments_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        state.workspace = workspace;
        let anchor_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/anchor/resolve".into();
            r
        };
        let resolved = route(anchor_request(anchor.clone()), &mut state, "127.0.0.1:8388");
        assert_eq!(resolved.status, 200);
        assert_eq!(
            serde_json::from_slice::<serde_json::Value>(&resolved.bytes).unwrap(),
            serde_json::json!({"text":"😀\r\n"})
        );
        let mut invalid = anchor.clone();
        invalid["start_byte"] = serde_json::json!(6);
        assert_eq!(
            route(anchor_request(invalid), &mut state, "127.0.0.1:8388").status,
            400
        );
        let mut invalid = anchor.clone();
        invalid["revision"] = serde_json::json!(vec![9; 32]);
        assert_eq!(
            route(anchor_request(invalid), &mut state, "127.0.0.1:8388").status,
            409
        );
        let contributor_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/contributors/publications".into();
            r
        };
        let contributor_input = serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"cursor":null,"limit":1});
        let mut unauthenticated = contributor_request(contributor_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        let page = route(
            contributor_request(contributor_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(page.status, 200);
        let page: serde_json::Value = serde_json::from_slice(&page.bytes).unwrap();
        assert_eq!(page["projection"], "text_publication_contributors");
        assert_eq!(page["current_agent"], serde_json::Value::Null);
        assert_eq!(page["complete_contributors"], false);
        assert_eq!(page["publications"][0]["role"], "publisher");
        for invalid in [
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"cursor":null,"limit":33}),
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"cursor":[],"limit":1}),
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"cursor":null,"limit":1,"owner":"forbidden"}),
        ] {
            assert_eq!(
                route(contributor_request(invalid), &mut state, "127.0.0.1:8388").status,
                400
            );
        }
        let clipboard_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/clipboard".into();
            r
        };
        let clipboard_input = serde_json::json!({"generation":null,"offset":0,"limit":16});
        let mut unauthenticated = clipboard_request(clipboard_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        let empty = route(
            clipboard_request(clipboard_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(empty.status, 200);
        assert_eq!(
            serde_json::from_slice::<serde_json::Value>(&empty.bytes).unwrap()["total"],
            0
        );
        for invalid in [
            serde_json::json!({"generation":null,"offset":1,"limit":16}),
            serde_json::json!({"generation":null,"offset":0,"limit":17}),
            serde_json::json!({"generation":null,"offset":0,"limit":16,"owner":"forbidden"}),
        ] {
            assert_eq!(
                route(clipboard_request(invalid), &mut state, "127.0.0.1:8388").status,
                400
            );
        }
        let mut capture = request(
            serde_json::json!({"operation":vec![3;32],"request":{"command":"clipboard","mutation":{"action":"capture","generation":0,"source":{"document":document.0,"node":editor.node.0,"snapshot":editor.snapshot.0,"revision":editor.base.0,"occurrence_path":[editor.occurrence.0],"start_byte":5,"end_byte":11},"expected_draft":{"generation":editor.generation,"sequence":editor.acknowledged_sequence},"quote":"😀\r\n"}}}),
        );
        capture.path = "/api/v1/commands".into();
        assert_eq!(route(capture, &mut state, "127.0.0.1:8388").status, 200);
        let captured = route(
            clipboard_request(clipboard_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        let captured: serde_json::Value = serde_json::from_slice(&captured.bytes).unwrap();
        assert_eq!(captured["generation"], 1);
        assert_eq!(captured["entries"][0]["preview"], "😀\r\n");
        assert_eq!(captured["entries"][0]["available"], true);
        let derivation_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/derivation".into();
            r
        };
        let mut fork = request(
            serde_json::json!({"operation":vec![4;32],"request":{"command":"fork","plan":{"title":"Synthetic fork","source":{"document":document.0,"node":editor.node.0,"snapshot":editor.snapshot.0,"revision":editor.base.0,"occurrence_path":[editor.occurrence.0],"start_byte":5,"end_byte":11},"expected_draft":{"generation":editor.generation,"sequence":editor.acknowledged_sequence},"quote":"😀\r\n"}}}),
        );
        fork.path = "/api/v1/commands".into();
        let fork = route(fork, &mut state, "127.0.0.1:8388");
        assert_eq!(fork.status, 200);
        let fork: serde_json::Value = serde_json::from_slice(&fork.bytes).unwrap();
        let fork_input = serde_json::json!({"document":fork["outcome"]["document"]});
        let mut unauthenticated = derivation_request(fork_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        let derived = route(
            derivation_request(fork_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(derived.status, 200);
        let derived: serde_json::Value = serde_json::from_slice(&derived.bytes).unwrap();
        assert_eq!(derived["kind"], "fork");
        assert_eq!(
            derived["inputs"][0]["snapshot"],
            serde_json::json!(editor.snapshot.0)
        );
        assert_eq!(
            route(
                derivation_request(serde_json::json!({"document":document.0})),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            404
        );
        assert_eq!(
            route(
                derivation_request(serde_json::json!({"document":document.0,"owner":"forbidden"})),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            400
        );
        let merge_input = serde_json::json!({"source":{"document":document.0,"node":editor.node.0,"snapshot":editor.snapshot.0,"revision":editor.base.0,"occurrence_path":[editor.occurrence.0],"start_byte":0,"end_byte":editor.text.len()},"expected_draft":null,"quote":editor.text});
        let mut merge_command = request(
            serde_json::json!({"operation":vec![180;32],"request":{"command":"merge","plan":{"title":"Reviewed merge","text":"Reviewed synthesis 😀\r\n","inputs":[merge_input.clone(),merge_input]}}}),
        );
        merge_command.path = "/api/v1/commands".into();
        let merged = route(merge_command, &mut state, "127.0.0.1:8388");
        assert_eq!(merged.status, 200);
        let merged: serde_json::Value = serde_json::from_slice(&merged.bytes).unwrap();
        let merge_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/merge".into();
            r
        };
        let merged_input = serde_json::json!({"document":merged["outcome"]["document"]});
        let mut unauthenticated = merge_request(merged_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        let viewed = route(
            merge_request(merged_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(viewed.status, 200);
        let viewed: serde_json::Value = serde_json::from_slice(&viewed.bytes).unwrap();
        assert_eq!(viewed["kind"], "reviewed_synthesis");
        assert_eq!(viewed["source_authorship"], "unknown");
        assert_eq!(viewed["inputs"].as_array().unwrap().len(), 2);
        assert_eq!(
            route(
                merge_request(serde_json::json!({"document":document.0,"owner":"forbidden"})),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            400
        );
        let graph_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/graph".into();
            r
        };
        let graph_input =
            serde_json::json!({"documents":[document.0, fork["outcome"]["document"]]});
        let graph = route(
            graph_request(graph_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(graph.status, 200);
        let graph: serde_json::Value = serde_json::from_slice(&graph.bytes).unwrap();
        assert_eq!(graph["nodes"].as_array().unwrap().len(), 2);
        assert_eq!(graph["edges"].as_array().unwrap().len(), 1);
        let mut unauthenticated = graph_request(graph_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        for invalid in [
            serde_json::json!({"documents":[]}),
            serde_json::json!({"documents":[document.0,document.0]}),
            serde_json::json!({"documents":[[1]]}),
            serde_json::json!({"documents":[document.0],"all":true}),
        ] {
            assert_eq!(
                route(graph_request(invalid), &mut state, "127.0.0.1:8388").status,
                400
            );
        }
        let assertion_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/assertions".into();
            r
        };
        let assertion_input = serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"generation":null,"offset":0,"limit":8});
        let mut unauthenticated = assertion_request(assertion_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        let participant = |role: &str, start, end, quote: &str| serde_json::json!({"role":role,"source":{"document":document.0,"node":editor.node.0,"snapshot":editor.snapshot.0,"revision":editor.base.0,"occurrence_path":[editor.occurrence.0],"start_byte":start,"end_byte":end},"expected_draft":{"generation":editor.generation,"sequence":editor.acknowledged_sequence},"quote":quote});
        let mut assertion = request(
            serde_json::json!({"operation":vec![5;32],"request":{"command":"assertion","mutation":{"action":"create","predicate":{"kind":"registered","choice":"preview:logical-argumentative:is_equivalent_to"},"participants":[participant("source",0,5,"Exact"),participant("target",5,11,"😀\r\n")],"properties":{"negated":false,"certainty":"unspecified","attribution":"","scope":""}}}}),
        );
        assertion.path = "/api/v1/commands".into();
        assert_eq!(route(assertion, &mut state, "127.0.0.1:8388").status, 200);
        let overlay = route(
            assertion_request(assertion_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(overlay.status, 200);
        let overlay: serde_json::Value = serde_json::from_slice(&overlay.bytes).unwrap();
        assert_eq!(
            overlay["text_snapshot_scope"],
            "semantic_assertions_excluded"
        );
        assert_eq!(overlay["total"], 1);
        assert_eq!(overlay["entries"][0]["record"]["status"], "proposed");
        for invalid in [
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"generation":null,"offset":1,"limit":8}),
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"generation":null,"offset":0,"limit":9}),
            serde_json::json!({"document":document.0,"snapshot":editor.snapshot.0,"generation":null,"offset":0,"limit":8,"include_in_snapshot":true}),
        ] {
            assert_eq!(
                route(assertion_request(invalid), &mut state, "127.0.0.1:8388").status,
                400
            );
        }
        let transformations_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/graph/transformations".into();
            r
        };
        let transformations_input = serde_json::json!({"nodes":[{"kind":"document","document":document.0},{"kind":"document","document":merged_input["document"]}]});
        let mut unauthenticated = transformations_request(transformations_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        let projected = route(
            transformations_request(transformations_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(projected.status, 200);
        let projected: serde_json::Value = serde_json::from_slice(&projected.bytes).unwrap();
        assert_eq!(projected["projection"], "transformation_incidence");
        assert_eq!(projected["edges"][0]["kind"], "merge");
        assert_eq!(
            route(
                transformations_request(serde_json::json!({"nodes":[],"owner":"forbidden"})),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            400
        );
        let overlay_graph_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/graph/overlay".into();
            r
        };
        let assertion_node = overlay["entries"][0]["record"]["node"].clone();
        let overlay_graph_input = serde_json::json!({"nodes":[{"kind":"document","document":document.0},{"kind":"assertion","node":assertion_node}]});
        let projected = route(
            overlay_graph_request(overlay_graph_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(projected.status, 200);
        let projected: serde_json::Value = serde_json::from_slice(&projected.bytes).unwrap();
        assert_eq!(projected["projection"], "retrospective_incidence");
        assert_eq!(projected["edges"].as_array().unwrap().len(), 2);
        let mut unauthenticated = overlay_graph_request(overlay_graph_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        for invalid in [
            serde_json::json!({"nodes":[]}),
            serde_json::json!({"nodes":[{"kind":"arbitrary","node":assertion_node}]}),
            serde_json::json!({"nodes":[{"kind":"assertion","node":[1]}]}),
            serde_json::json!({"nodes":[{"kind":"document","document":document.0}],"include_unselected":true}),
        ] {
            assert_eq!(
                route(overlay_graph_request(invalid), &mut state, "127.0.0.1:8388").status,
                400
            );
        }
        let review_history_request = |body| {
            let mut r = request(body);
            r.path = "/api/v1/assertion/revision".into();
            r
        };
        let review_history_input =
            serde_json::json!({"node":assertion_node,"revision":overlay["entries"][0]["revision"]});
        let history_entry = route(
            review_history_request(review_history_input.clone()),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(history_entry.status, 200);
        let history_entry: serde_json::Value =
            serde_json::from_slice(&history_entry.bytes).unwrap();
        assert_eq!(history_entry["entry"]["record"]["status"], "proposed");
        assert_eq!(
            history_entry["text_snapshot_scope"],
            "semantic_assertions_excluded"
        );
        let mut unauthenticated = review_history_request(review_history_input.clone());
        unauthenticated.headers.remove("cookie");
        assert_eq!(
            route(unauthenticated, &mut state, "127.0.0.1:8388").status,
            401
        );
        assert_eq!(
            route(
                review_history_request(serde_json::json!({"node":assertion_node,"revision":[1]})),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            400
        );
        assert_eq!(route(review_history_request(serde_json::json!({"node":assertion_node,"revision":overlay["entries"][0]["revision"],"use_current_if_missing":true})),&mut state,"127.0.0.1:8388").status,400);
        state.workspace = None;
        assert_eq!(
            route(
                branch_request("audit/document", audit_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(
                branch_request("branches/comparison", comparison_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(
                review_history_request(review_history_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(
                overlay_graph_request(overlay_graph_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(
                assertion_request(assertion_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(graph_request(graph_input), &mut state, "127.0.0.1:8388").status,
            423
        );
        assert_eq!(
            route(merge_request(merged_input), &mut state, "127.0.0.1:8388").status,
            423
        );
        assert_eq!(
            route(
                transformations_request(transformations_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(
                contributor_request(contributor_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(derivation_request(fork_input), &mut state, "127.0.0.1:8388").status,
            423
        );
        assert_eq!(
            route(
                clipboard_request(clipboard_input),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(anchor_request(anchor), &mut state, "127.0.0.1:8388").status,
            423
        );
        assert_eq!(
            route(request(input), &mut state, "127.0.0.1:8388").status,
            423
        );
        drop(state);
        std::fs::remove_dir_all(directory).unwrap();
    }
    #[test]
    fn keychain_routes_are_explicit_authenticated_and_restart_locked() {
        use hypergraph_keychain::{DeviceSecret, Error as KeyError};
        #[derive(Default)]
        struct Fake {
            secret: Option<([u8; 16], DeviceSecret)>,
            calls: usize,
        }
        impl Provider for Fake {
            fn supported(&self) -> bool {
                true
            }
            fn create(
                &mut self,
                id: [u8; 16],
                secret: &DeviceSecret,
            ) -> hypergraph_keychain::Result<()> {
                self.calls += 1;
                if self.secret.is_some() {
                    return Err(KeyError::Exists);
                }
                self.secret = Some((id, DeviceSecret::from_slice(secret.bytes())?));
                Ok(())
            }
            fn load(&mut self, id: [u8; 16]) -> hypergraph_keychain::Result<DeviceSecret> {
                self.calls += 1;
                let (expected, secret) = self.secret.as_ref().ok_or(KeyError::NotFound)?;
                if *expected != id {
                    return Err(KeyError::NotFound);
                }
                DeviceSecret::from_slice(secret.bytes())
            }
            fn remove(
                &mut self,
                id: [u8; 16],
                secret: &DeviceSecret,
            ) -> hypergraph_keychain::Result<()> {
                let stored = self.load(id)?;
                if stored.bytes() != secret.bytes() {
                    return Err(KeyError::Invalid);
                }
                self.secret = None;
                Ok(())
            }
        }
        let directory = std::env::temp_dir().join(format!("hpx-keychain-route-{}", token()));
        std::fs::create_dir(&directory).unwrap();
        let mut state = State {
            workspace: None,
            path: directory.join("test.hpx"),
            create: true,
            launch: "launch".into(),
            cookie: "session".into(),
            last_unlock: None,
            provider: Fake::default(),
        };
        let request = |path: &str, body: &str| Request {
            method: "POST".into(),
            path: format!("/api/v1/{path}"),
            headers: BTreeMap::from([
                ("host".into(), "127.0.0.1:8388".into()),
                ("origin".into(), "https://127.0.0.1:8388".into()),
                ("content-type".into(), "application/json".into()),
                ("cookie".into(), "__Host-hpx=session".into()),
            ]),
            body: Zeroizing::new(body.as_bytes().to_vec()),
        };
        for path in [
            "keychain/enroll",
            "keychain/remove",
            "unlock/keychain",
            "keychain/status",
        ] {
            let mut denied = request(path, "{}");
            denied.headers.remove("cookie");
            assert_eq!(route(denied, &mut state, "127.0.0.1:8388").status, 401);
            let mut denied = request(path, "{}");
            denied
                .headers
                .insert("origin".into(), "https://evil".into());
            assert_eq!(route(denied, &mut state, "127.0.0.1:8388").status, 403);
        }
        assert_eq!(
            route(
                request("keychain/enroll", "{}"),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
        assert_eq!(
            route(
                request("keychain/status", "{}"),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            200
        );
        assert_eq!(state.provider.calls, 0);
        assert_eq!(
            route(
                request("unlock", r#"{"passphrase":"synthetic-test-passphrase"}"#),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            200
        );
        assert_eq!(state.provider.calls, 0);
        assert_eq!(
            route(
                request("keychain/enroll", r#"{"secret":"forbidden"}"#),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            400
        );
        let response = route(
            request("keychain/enroll", "{}"),
            &mut state,
            "127.0.0.1:8388",
        );
        assert_eq!(response.status, 200);
        assert_eq!(
            serde_json::from_slice::<serde_json::Value>(&response.bytes).unwrap(),
            serde_json::json!({"enrolled":true,"backup_created":true})
        );
        assert_eq!(state.provider.calls, 1);
        assert_eq!(
            route(request("lock", "{}"), &mut state, "127.0.0.1:8388").status,
            200
        );
        // Reconstruct startup state with the same credential store, never autoload it.
        state = State {
            workspace: None,
            last_unlock: None,
            ..state
        };
        assert!(state.workspace.is_none());
        assert_eq!(
            route(
                request("keychain/status", "{}"),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            200
        );
        assert_eq!(state.provider.calls, 1);
        assert_eq!(
            route(
                request("unlock/keychain", "{}"),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            200
        );
        assert_eq!(state.provider.calls, 2);
        assert_eq!(
            route(
                request("keychain/remove", "{}"),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            200
        );
        drop(state);
        std::fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn security_headers_do_not_normalize_unicode_whitespace_into_authority() {
        let mut state = State {
            workspace: None,
            path: PathBuf::new(),
            create: false,
            launch: "launch".into(),
            cookie: "session".into(),
            last_unlock: None,
            provider: Native,
        };
        for (host, origin, cookie, expected) in [
            (
                "127.0.0.1:8388",
                "https://127.0.0.1:8388",
                "__Host-hpx=invalid; __Host-hpx=session",
                401,
            ),
            (
                "127.0.0.1:8388",
                "https://127.0.0.1:8388",
                "__Host-hpx=session; __Host-hpx=session",
                401,
            ),
            (
                "127.0.0.1:8388",
                "https://127.0.0.1:8388",
                "theme=dark; __Host-hpx=session",
                423,
            ),
            (
                "127.0.0.1:8388",
                "https://127.0.0.1:8388",
                "\t__Host-hpx=session \t",
                423,
            ),
            (
                "127.0.0.1:8388\u{a0}",
                "https://127.0.0.1:8388",
                "__Host-hpx=session",
                403,
            ),
            (
                "127.0.0.1:8388",
                "https://127.0.0.1:8388\u{2000}",
                "__Host-hpx=session",
                403,
            ),
            (
                "127.0.0.1:8388",
                "https://127.0.0.1:8388",
                "__Host-hpx=session\u{a0}",
                401,
            ),
            (
                "127.0.0.1:8388",
                "https://127.0.0.1:8388",
                "\u{2000}__Host-hpx=session",
                401,
            ),
        ] {
            let wire = format!(
                "POST /api/v1/documents HTTP/1.1\r\nHost: {host}\r\nOrigin: {origin}\r\nCookie: {cookie}\r\nContent-Type: application/json\r\nContent-Length: 2\r\n\r\n{{}}"
            );
            let request = read_request(&mut wire.as_bytes()).unwrap();
            assert_eq!(
                route(request, &mut state, "127.0.0.1:8388").status,
                expected
            );
        }
    }

    #[test]
    fn fragmented_headers_obey_the_exact_limit_independently_of_read_sizes() {
        struct Fragmented<'a> {
            bytes: &'a [u8],
            maximum: usize,
        }
        impl Read for Fragmented<'_> {
            fn read(&mut self, output: &mut [u8]) -> std::io::Result<usize> {
                let count = output.len().min(self.maximum).min(self.bytes.len());
                output[..count].copy_from_slice(&self.bytes[..count]);
                self.bytes = &self.bytes[count..];
                Ok(count)
            }
        }
        let prefix = "GET / HTTP/1.1\r\nHost: 127.0.0.1:8388\r\nX-Padding: ";
        for header_length in [HEADER_LIMIT - 1, HEADER_LIMIT, HEADER_LIMIT + 1] {
            let header = format!(
                "{prefix}{}\r\n\r\n",
                "a".repeat(header_length - prefix.len() - 4)
            );
            for maximum in [1, 41, 997, 1024] {
                let mut stream = Fragmented {
                    bytes: header.as_bytes(),
                    maximum,
                };
                assert_eq!(
                    read_request(&mut stream).is_ok(),
                    header_length <= HEADER_LIMIT,
                    "header={header_length}, fragment={maximum}"
                );
            }
        }
        // Body bytes read alongside a smaller header do not consume header budget.
        let request = b"POST / HTTP/1.1\r\nHost: 127.0.0.1:8388\r\nContent-Length: 1024\r\n\r\n";
        let mut bytes = request.to_vec();
        bytes.extend_from_slice(&[b'x'; 1024]);
        assert_eq!(
            read_request(&mut bytes.as_slice()).unwrap().body.len(),
            1024
        );
    }

    #[test]
    fn parser_rejects_request_smuggling_and_oversized_bodies() {
        for request in [
            "POST /api/v1/unlock HTTP/1.1\r\nHost: a\r\nContent-Length: 1\r\nContent-Length: 2\r\n\r\nx",
            "POST / HTTP/1.1\r\nTransfer-Encoding: chunked\r\n\r\n0\r\n\r\n",
            "POST / HTTP/1.1\r\nContent-Length: 999999999\r\n\r\n",
            "GET / HTTP/1.1\r\n\r\nGET / HTTP/1.1\r\n\r\n",
        ] {
            assert!(read_request(&mut request.as_bytes()).is_err());
        }
        let r=read_request(&mut b"POST /api/v1/commands HTTP/1.1\r\nHost: 127.0.0.1:8388\r\nContent-Length: 2\r\n\r\n{}".as_slice()).unwrap();
        assert_eq!(&r.body[..], b"{}");
    }
    #[test]
    fn problem_details_are_opt_in_and_preserve_status_and_stable_codes() {
        let mut state = State {
            workspace: None,
            path: PathBuf::new(),
            create: false,
            launch: "launch".into(),
            cookie: "session".into(),
            last_unlock: None,
            provider: Native,
        };
        for (host, cookie, status, code) in [
            ("evil", "__Host-hpx=session", 403, "host_rejected"),
            ("127.0.0.1:8388", "", 401, "unauthorized"),
            ("127.0.0.1:8388", "__Host-hpx=session", 423, "locked"),
        ] {
            for accept in [
                "application/json",
                "application/problem+json;q=0",
                "application/problem+json",
            ] {
                let request = Request {
                    method: "POST".into(),
                    path: "/api/v1/documents".into(),
                    headers: BTreeMap::from([
                        ("host".into(), host.into()),
                        ("origin".into(), "https://127.0.0.1:8388".into()),
                        ("content-type".into(), "application/json".into()),
                        ("cookie".into(), cookie.into()),
                        ("accept".into(), accept.into()),
                    ]),
                    body: Zeroizing::new(b"{}".to_vec()),
                };
                let response = route(request, &mut state, "127.0.0.1:8388");
                assert_eq!(response.status, status);
                let value: serde_json::Value = serde_json::from_slice(&response.bytes).unwrap();
                assert_eq!(value["error"], code);
                if accept == "application/problem+json" {
                    assert_eq!(response.mime, "application/problem+json");
                    assert_eq!(value["status"], status);
                    assert_eq!(value["type"], "about:blank");
                } else {
                    assert_eq!(response.mime, "application/json; charset=utf-8");
                    assert_eq!(
                        response.bytes,
                        serde_json::to_vec(&serde_json::json!({"error":code})).unwrap()
                    );
                }
            }
        }
    }
    #[test]
    fn host_origin_cookie_and_locked_gates_are_independent() {
        let mut state = State {
            workspace: None,
            path: PathBuf::new(),
            create: false,
            launch: "launch".into(),
            cookie: "session".into(),
            last_unlock: None,
            provider: Native,
        };
        let request = |method: &str, path: &str, host: &str, origin: &str, cookie: &str| Request {
            method: method.into(),
            path: path.into(),
            headers: BTreeMap::from([
                ("host".into(), host.into()),
                ("origin".into(), origin.into()),
                ("content-type".into(), "application/json".into()),
                ("cookie".into(), cookie.into()),
            ]),
            body: Zeroizing::new(b"{}".to_vec()),
        };
        assert_eq!(
            route(
                request("GET", "/api/v1/runtime", "evil", "", ""),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            403
        );
        assert_eq!(
            route(
                request(
                    "POST",
                    "/api/v1/commands",
                    "127.0.0.1:8388",
                    "https://evil",
                    "__Host-hpx=session"
                ),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            403
        );
        assert_eq!(
            route(
                request("GET", "/api/v1/runtime", "127.0.0.1:8388", "", ""),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            401
        );
        assert_eq!(
            route(
                request(
                    "POST",
                    "/api/v1/documents",
                    "127.0.0.1:8388",
                    "https://127.0.0.1:8388",
                    "__Host-hpx=session"
                ),
                &mut state,
                "127.0.0.1:8388"
            )
            .status,
            423
        );
    }
}
