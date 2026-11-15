// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Pure domain planning and validation
//!
//! Expose deterministic in-memory rules and typed identities for the current
//! source, annotation and Merge slices, without performing adapter work.
//!
//! Source: [Latest source on GitHub][source]
//!
//! Agent provenance: Agent creation unverified; original creator not recorded.
//! Created: Unknown (not recorded).
//! Creation harness: Unknown (not recorded).
//! Creation model: Unknown (not recorded).
//!
//! Latest editing agent: Codex /root (OpenAI coding agent).
//! Latest editing harness: Codex; version/build: unknown (not exposed).
//! Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
//! Last edited: 2026-11-15 (UTC).
//!
//! Used by: Storage feature adapters and their tests, plus runtime code that imports
//! domain identity/range types through the application boundary.
//!
//! Specification:
//! - [Pure domain responsibilities][domain]
//! - [Domain/adapter interface][interface]
//! - [Formal obligations and limits][proofs]
//!
//! Boundary: No dependency here supplies I/O, crypto, serialization or authority. Supplied
//! source/context is a premise, not authenticated by type construction. Legacy DAG
//! validation is one bounded helper, not a prohibition on accepted cyclic inclusion.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/lib.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [interface]: ../../../../docs/06-subsystems/interfaces/domain-navigation.md
//! [proofs]: ../../../../docs/07-implementation/formal-invariants.md

/// Role-labelled exact participant validation and explicit review/orientation rules.
pub mod assertion;

/// Exact retained-passage comment planning without persistence.
pub mod comment;

/// Bounded acyclicity checks over an explicitly supplied projection.
pub mod expansion;

/// Exact nonempty source fragments for independent output identities.
pub mod fork;

/// Bounded independent synthesis inputs/output, not same-node parent Merge.
pub mod merge;

/// Same-node Merge and lineage planning from supplied exact evidence.
pub mod parent_merge;

/// Opaque identity wrappers and exact source-coordinate records/helpers.
pub mod records;

/// Exact acknowledged working-source capture without durable publication.
pub mod working;
