#!/bin/bash
# Hypergraph PX — Rebuild the existing self-build workspace
#
# Build the embedded frontend and Rust executable, then replace this launcher with the existing self-build workspace process.
#
# Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/start-self-build.sh)
#
# Agent provenance: Agent creation unverified; original creator not recorded.
# Created: Unknown (not recorded).
# Creation harness: Unknown (not recorded).
# Creation model: Unknown (not recorded).
#
# Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
# Latest editing harness: Codex; version/build: Unknown (not exposed).
# Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
# Last edited: 2026-11-15 (UTC).
#
# Used by: Developer self-build launcher; npm self-build workflow.
#
# Specification:
# - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
# - [Build and release contract](../../docs/08-assurance/build-and-release.md)
#
# Boundary: The workspace must already exist. This script does not create it, install certificate trust, validate integration or perform a guarded manual-workspace handoff.
set -Eeuo pipefail
umask 077

# Reject arguments before invoking build commands.
case "${1:-}" in
  '') ;;
  --help|-h)
    printf 'Usage: %s\nBuild current source and reopen the existing self-build workspace in this Terminal.\n' "$0"
    exit 0 ;;
  *) printf 'Unknown option: %s\n' "$1" >&2; exit 2 ;;
esac

if (( $# > 0 )); then
  printf 'This launcher takes no arguments; use --help for usage.\n' >&2
  exit 2
fi

# Resolve this checkout independently of the caller working directory.
project_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$project_dir"

# Require the existing workspace; rebuilding must never silently create another.
if [[ ! -f .local/workspaces/self-build/synthetic.hpx ]]; then
  printf 'Existing workspace not found: .local/workspaces/self-build/synthetic.hpx\n' >&2
  exit 1
fi

# Build assets before compiling the executable that embeds them.
printf '\nBuilding embedded frontend…\n'
npm --prefix frontend run build
printf '\nCompiling the current app source…\n'
cargo +stable build --workspace --locked

# Transfer this terminal directly to the selected debug binary.
printf '\nStarting your existing self-build workspace.\nKeep this Terminal open and use the complete HTTPS launch URL printed below.\nPress Control-C to stop the app.\n'
binary="$(node shared/tooling/cargo-path.mjs --profile debug)"
exec "$binary" \
  --workspace .local/workspaces/self-build/synthetic.hpx \
  --cert .local/credentials/tls/localhost.pem \
  --key .local/credentials/tls/localhost-key.pem \
  --port 8388
