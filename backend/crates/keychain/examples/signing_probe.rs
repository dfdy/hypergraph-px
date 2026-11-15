// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Synthetic signing-continuity probe
//!
//! Offer an explicitly invoked diagnostic for create/read/remove continuity of
//! one synthetic keychain item across signed-binary variants, without printing
//! credential bytes. This is a developer example, not an application
//! startup action.
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
//! Used by: Developer signing/trust verification workflow, invoked as a
//! Cargo example.
//!
//! Specification:
//! - [Keychain responsibility boundaries][spec0]
//! - [Explicit enrollment and recovery policy][spec1]
//!
//! Boundary: Running create/remove changes a native credential item; do not
//! run this probe implicitly or against an owner workspace. OS consent is
//! retained.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/keychain/examples/signing_probe.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec1]: ../../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md

/// Parse an explicit synthetic action/workspace and report credential continuity without disclosure.
#[cfg(target_os = "macos")]
fn main() -> Result<(), Box<dyn std::error::Error>> {
    use hypergraph_keychain::{DeviceSecret, Native, Provider};
    use security_framework::os::macos::keychain::SecKeychain;
    let args: Vec<_> = std::env::args().collect();
    if args.len() != 3 || args[2].len() != 32 {
        return Err("Expected synthetic action and random workspace hex".into());
    }

    let mut workspace = [0u8; 16];
    for (i, b) in workspace.iter_mut().enumerate() {
        *b = u8::from_str_radix(&args[2][i * 2..i * 2 + 2], 16)?;
    }
    let _no_prompts = if args[1] == "load-consent" {
        None
    } else {
        Some(SecKeychain::disable_user_interaction()?)
    };

    let expected = DeviceSecret::from_bytes([0xa7; 32]);
    let mut native = Native;
    let result = match args[1].as_str() {
        "create" => native.create(workspace, &expected),
        // Confirm the loaded fixture matches this probe without exposing its bytes.
        "load" | "load-consent" => native.load(workspace).and_then(|value| {
            if value.bytes() == expected.bytes() {
                Ok(())
            } else {
                Err(hypergraph_keychain::Error::Invalid)
            }
        }),
        "remove" => native.remove(workspace, &expected),
        _ => return Err("Unknown synthetic action".into()),
    };
    // Describe the public provider failure while retaining credential secrecy.
    result.map_err(|e| {
        format!("Synthetic keychain action failed with interaction disabled: {e:?}")
    })?;

    println!(
        "PASS: synthetic {} ({})",
        args[1],
        option_env!("HPX_SIGNING_TEST_VARIANT").unwrap_or("default")
    );
    Ok(())
}

/// Report platform inapplicability rather than simulating a successful keychain operation.
#[cfg(not(target_os = "macos"))]
fn main() {
    eprintln!("Signing continuity probe requires macOS");
    std::process::exit(2);
}
