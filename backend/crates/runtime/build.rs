//! # Hypergraph PX — Embedded frontend assets and build identity
//!
//! Generate the runtime asset table and a build-version resource during Cargo
//! builds. Keep the append-only local build counter serialized and permit the
//! explicit release build number override without changing package SemVer.
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
//! Used by: Cargo runtime builds, embedded frontend delivery and
//! development-backend builds.
//!
//! Specification:
//! - [Runtime packaging responsibilities][spec0]
//! - [Build and release boundaries][spec1]
//! - [Developer build workflow][spec2]
//!
//! Boundary: This build script writes local generated artifacts. The
//! dev-backend feature embeds version metadata only; releases still require
//! a prepared frontend build and contain no Node runtime dependency.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/runtime/build.rs
//! [spec0]: ../../../docs/06-subsystems/diagrams/runtime-api.c4
//! [spec1]: ../../../docs/08-assurance/build-and-release.md
//! [spec2]: ../../../docs/09-guides/developers/repository-development.md

use std::{
    env, fs,
    io::{Read, Write},
    path::Path,
};
/// Enumerate sorted nonsymlink frontend files and emit stable route/include_bytes entries.
fn walk(root: &Path, dir: &Path, out: &mut String) {
    let mut entries: Vec<_> = fs::read_dir(dir)
        .expect("frontend assets readable")
        // Resolve each directory entry; a read failure must fail this build.
        .map(|e| e.unwrap().path())
        .collect();
    entries.sort();
    for path in entries {
        if fs::symlink_metadata(&path)
            .unwrap()
            .file_type()
            .is_symlink()
        {
            panic!("frontend asset symlinks are not supported");
        }
        if path.is_dir() {
            walk(root, &path, out);
        } else {
            let route = format!(
                "/{}",
                path.strip_prefix(root)
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .replace('\\', "/")
            );
            if route == "/build-version.json" {
                continue;
            }
            out.push_str(&format!(
                "({route:?},include_bytes!({:?}).as_slice()),\n",
                path.canonicalize().unwrap().to_str().unwrap()
            ));
        }
    }
}

/// Allocate the build identity and generate either development metadata or release assets.
fn main() {
    // A missing watched path deliberately reruns this build script for every
    // compile invocation, including otherwise unchanged local test builds.
    println!("cargo:rerun-if-changed=../../../.local/artifacts/.always-increment-test-build");
    let directory = Path::new("../../../.local/artifacts");
    fs::create_dir_all(directory).expect("build metadata directory writable");
    let mut counter = fs::OpenOptions::new()
        .create(true)
        .read(true)
        .append(true)
        .open(directory.join("test-build-counter.log"))
        .expect("build counter writable");
    counter.lock().expect("build counter lock available");
    let mut history = String::new();
    counter
        .read_to_string(&mut history)
        .expect("build counter readable");
    assert!(
        history.is_empty() || history.ends_with('\n'),
        "incomplete build counter; preserve and inspect it"
    );

    let previous = history
        .lines()
        .last()
        // Parse the latest complete durable counter line; malformed history is not reset.
        .map(|line| line.parse::<u64>().expect("valid build counter"))
        .unwrap_or(0);
    let next = previous.checked_add(1).expect("build counter exhausted");
    writeln!(counter, "{next}").expect("build counter append");
    counter.sync_all().expect("build counter durable");
    println!("cargo:rerun-if-env-changed=HPX_RELEASE_BUILD_NUMBER");
    // Only absence/error of the explicit override selects this freshly allocated counter.
    let build_number = env::var("HPX_RELEASE_BUILD_NUMBER").unwrap_or_else(|_| next.to_string());
    assert!(
        !build_number.is_empty()
            && build_number.len() <= 16
            && !build_number.starts_with('0')
            // Require every byte of the configured build number to be decimal.
            && build_number.bytes().all(|byte| byte.is_ascii_digit()),
        "release build number must be a positive integer with at most 16 digits"
    );

    let version = format!(
        "{}.{}",
        env::var("CARGO_PKG_VERSION").unwrap(),
        build_number
    );
    let version_file = Path::new(&env::var("OUT_DIR").unwrap()).join("build-version.json");
    fs::write(&version_file, format!("{{\"version\":\"{version}\"}}\n"))
        .expect("version asset writable");
    if env::var_os("CARGO_FEATURE_DEV_BACKEND").is_some() {
        fs::write(
                Path::new(&env::var("OUT_DIR").unwrap()).join("assets.rs"),
                format!(
                    "const ASSETS: &[(&str, &[u8])] = &[(\"/build-version.json\",include_bytes!({:?}).as_slice())];\n",
                    version_file.canonicalize().unwrap().to_str().unwrap()
                ),
            )
            .expect("development asset map writable");
        return;
    }

    let root = Path::new("../../../frontend/dist");
    println!("cargo:rerun-if-changed=../../../frontend/dist");
    if !root.join("index.html").is_file() {
        panic!(
            "Build frontend assets first: npm --prefix frontend ci --ignore-scripts && npm --prefix frontend run build"
        );
    }

    let mut out = String::from("const ASSETS: &[(&str, &[u8])] = &[\n");
    walk(root, root, &mut out);
    out.push_str(&format!(
        "(\"/build-version.json\",include_bytes!({:?}).as_slice()),\n",
        version_file.canonicalize().unwrap().to_str().unwrap()
    ));
    out.push_str("];\n");
    fs::write(
        Path::new(&env::var("OUT_DIR").unwrap()).join("assets.rs"),
        out,
    )
    .unwrap();
}
