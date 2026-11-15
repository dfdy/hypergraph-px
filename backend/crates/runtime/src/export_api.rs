// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Runtime OpenAPI document exporter
//!
//! Print the API description assembled by the runtime schema module for the
//! existing frontend contract generator. This build-time executable exports JSON;
//! it does not start a backend server or read workspace data.
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
//! Used by: Frontend transport-contract generator and API schema
//! compatibility checks.
//!
//! Specification:
//! - [Runtime API implementation responsibilities][spec0]
//! - [Generated transport contract][spec1]
//!
//! Boundary: This exporter describes the current bounded API; producing a
//! schema does not implement general multi-user permission designs or
//! accept real-data formats.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/runtime/src/export_api.rs
//! [spec0]: ../../../../docs/07-implementation/diagrams/api-implementation.c4
//! [spec1]: ../../../../docs/06-subsystems/interfaces/browser-runtime.md#generated-transport-contract-owner021-2026-10-27

#[allow(dead_code)]
mod api;
/// Serialize the current Rust-derived API document as readable JSON on stdout.
fn main() {
    println!(
        "{}",
        serde_json::to_string_pretty(&api::document()).unwrap()
    );
}
