// SPDX-License-Identifier: AGPL-3.0-only
//! No-prompt synthetic signing-continuity probe. Never prints credential bytes.
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
#[cfg(not(target_os = "macos"))]
fn main() {
    eprintln!("Signing continuity probe requires macOS");
    std::process::exit(2);
}
