# Source publication 0.8.0

Date: 2026-10-25. Authority: explicit owner request, “push all files to github”. This authorizes the current source publication, not resuming application implementation, installing certificate trust or publishing private archives.

## Scope and history

MINOR increment from 0.7.0: backward-compatible storage/runtime source additions and documentation reorganization. Rust workspace/lockfile, frontend package/lockfile and Lean package metadata are synchronized. No schema, protocol or toolchain versions change. Integrated real-document editing remains unfinished; this is source publication, not a claim of runtime acceptance or a binary release. No release tag is requested.

The existing local `Spec refactor` commit includes a template ZIP and migration baselines intended to remain local. A new publication branch, `publish/nine-level-migration`, is based directly on GitHub main and contains the intended current tree without that local ancestor. Existing local history is preserved; no published history is rewritten. `.oldspecs`, private baselines, runtime workspaces and credentials remain excluded. Earlier published history is unchanged.

## Validation

Executed before publication: documentation metadata/link/register checks and all 132 local archive hash checks passed; dependency lockfile checksums match the recorded 71-package license/provenance inventory; 54 Node tests passed; static frontend build and `cargo +stable build --workspace --locked` passed; Rust formatting and Clippy with warnings denied passed; 17 Rust tests passed, with one crash-worker entry intentionally ignored and invoked by its fault-injection test. Rust tests ran serially. No browser tests or Lean/proof replay were run. Historical software/proof evidence retains its dated limits. No live TLS trust installation or real-data browser validation is authorized by this push.

GitHub publication is performed only after checking that the publication commit has GitHub main as its sole parent, its tree matches the intended current tree, and its outgoing history contains no docproject, archive, runtime or credential paths. The original local branch retains the private historical ancestor and must not be pushed.

The staged-tree whitespace check passed with `core.whitespace=cr-at-eol,-blank-at-eof`, preserving existing CSV CRLF bytes and source trailing blank lines. The default staged check flags those preserved conventions. Intended indexed paths and a bounded credential-pattern scan passed; this is not an exhaustive confidentiality audit.
