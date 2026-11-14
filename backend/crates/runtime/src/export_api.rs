// SPDX-License-Identifier: AGPL-3.0-only
#[allow(dead_code)]
mod api;
fn main() {
    println!(
        "{}",
        serde_json::to_string_pretty(&api::document()).unwrap()
    );
}
