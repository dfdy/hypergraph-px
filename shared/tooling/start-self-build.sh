#!/bin/bash
# Rebuild and reopen only the existing self-build workspace; no creation or handoff.
set -Eeuo pipefail
umask 077

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

project_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$project_dir"
if [[ ! -f .local/workspaces/self-build/synthetic.hpx ]]; then
  printf 'Existing workspace not found: .local/workspaces/self-build/synthetic.hpx\n' >&2
  exit 1
fi

printf '\nBuilding embedded frontend…\n'
npm --prefix frontend run build
printf '\nCompiling the current app source…\n'
cargo +stable build --workspace --locked
printf '\nStarting your existing self-build workspace.\nKeep this Terminal open and use the complete HTTPS launch URL printed below.\nPress Control-C to stop the app.\n'
binary="$(node shared/tooling/cargo-path.mjs --profile debug)"
exec "$binary" \
  --workspace .local/workspaces/self-build/synthetic.hpx \
  --cert .local/credentials/tls/localhost.pem \
  --key .local/credentials/tls/localhost-key.pem \
  --port 8388
