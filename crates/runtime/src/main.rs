// SPDX-License-Identifier: AGPL-3.0-only
//! Loopback HTTPS single-executable writer. See ADR0004 for trust/bootstrap limits.
use hypergraph_domain::records::{DocumentId, OperationId, SnapshotId};
use hypergraph_storage::{Command, Workspace};
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
struct State {
    workspace: Option<Workspace>,
    path: PathBuf,
    create: bool,
    launch: String,
    cookie: String,
    last_unlock: Option<Instant>,
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
        _ => error(500, "storage_failure"),
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Bootstrap {
    token: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Unlock {
    passphrase: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Execute {
    operation: OperationId,
    request: Command,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct DocumentRequest {
    document: DocumentId,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct SnapshotRequest {
    document: DocumentId,
    snapshot: SnapshotId,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ReceiptRequest {
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
fn route(r: Request, state: &mut State, host: &str) -> Response {
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
        let request: Bootstrap = match decode(&r) {
            Ok(v) => v,
            Err(e) => return e,
        };
        if !secure_equal(&request.token, &state.launch) {
            return error(403, "unauthorized");
        }
        let mut result = json(&serde_json::json!({"authenticated":true}));
        result.cookie = Some(format!(
            "__Host-hpx={}; Path=/; Secure; HttpOnly; SameSite=Strict",
            state.cookie
        ));
        return result;
    }
    let authorized = r.headers.get("cookie").is_some_and(|cookie| {
        cookie
            .split(';')
            .any(|v| secure_equal(v.trim(), &format!("__Host-hpx={}", state.cookie)))
    });
    if !authorized {
        return error(401, "unauthorized");
    }
    if r.method == "GET" && r.path == "/api/v1/runtime" {
        return json(
            &serde_json::json!({"version":env!("CARGO_PKG_VERSION"),"contract":1,"locked":state.workspace.is_none(),"create":state.create,"mode":"trusted_server","ownership":"whole_document","max_text_bytes":hypergraph_storage::MAX_TEXT_BYTES,"capabilities":["documents","durable_drafts","commit","snapshot"],"unavailable":["relationships","comments","provenance_mutation","agents","federation","client_held","keychain"]}),
        );
    }
    if r.method != "POST" {
        return error(405, "method_rejected");
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
        let mut unlock: Unlock = match decode(&r) {
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
                json(&serde_json::json!({"locked":false}))
            }
            Err(_) => error(403, "unlock_failed"),
        };
    }
    if r.path == "/api/v1/lock" {
        state.workspace = None;
        return json(&serde_json::json!({"locked":true}));
    }
    let Some(workspace) = state.workspace.as_mut() else {
        return error(423, "locked");
    };
    match r.path.as_str() {
        "/api/v1/documents" => match workspace.list_documents() {
            Ok(v) => json(&v),
            Err(e) => storage_error(e),
        },
        "/api/v1/editor" => {
            let input: DocumentRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.open_document(input.document) {
                Ok(v) => json(&v),
                Err(e) => storage_error(e),
            }
        }
        "/api/v1/commands" => {
            let input: Execute = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.execute(input.operation, input.request) {
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
            let input: SnapshotRequest = match decode(&r) {
                Ok(v) => v,
                Err(e) => return e,
            };
            match workspace.reconstruct_snapshot(input.document, input.snapshot) {
                Ok(text) => json(&serde_json::json!({"text":text})),
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
        if bytes.len() >= 16 * 1024 {
            return Err(());
        }
        let mut chunk = [0; 1024];
        let count = stream.read(&mut chunk).map_err(|_| ())?;
        if count == 0 {
            return Err(());
        }
        bytes.extend_from_slice(&chunk[..count]);
        if let Some(at) = bytes.windows(4).position(|w| w == b"\r\n\r\n") {
            end = at + 4;
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
            .trim()
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
    let _ = socket.set_read_timeout(Some(Duration::from_secs(10)));
    let _ = socket.set_write_timeout(Some(Duration::from_secs(10)));
    let Ok(connection) = ServerConnection::new(tls) else {
        return;
    };
    let mut stream = StreamOwned::new(connection, socket);
    let response = match read_request(&mut stream) {
        Ok(r) => match state.lock() {
            Ok(mut state) => route(r, &mut state, &host),
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
    fn host_origin_cookie_and_locked_gates_are_independent() {
        let mut state = State {
            workspace: None,
            path: PathBuf::new(),
            create: false,
            launch: "launch".into(),
            cookie: "session".into(),
            last_unlock: None,
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
