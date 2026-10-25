# Developer setup and runtime/fixture modes

## Common metadata

- **ID:** `HPX-GUIDE-002`
- **Title:** Developer setup and runtime/fixture modes
- **Purpose:** Developer setup for fixture preview and the unfinished integrated Rust writer.
- **Level:** `09-guides`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../../04-architecture/system-architecture.md>); [HPX-ASSUR-005](<../../08-assurance/build-and-release.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Do not use certificate-warning bypasses. No trusted live runtime was launched by this migration.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Audience and prerequisites

Developer setup for fixture preview and the unfinished integrated Rust writer. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Task and expected result

Developer setup for fixture preview and the unfinished integrated Rust writer. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Procedure

Use Git, a native compiler/linker, Rust stable with rustfmt/Clippy and Node26/npm for the frontend build. For the synthetic preview:

```sh
npm --prefix frontend ci --ignore-scripts
npm --prefix frontend run dev
```

The preview is http://127.0.0.1:5173 and resets tab-local content on reload. For a full embedded build, first prepare assets:

```sh
npm --prefix frontend run build
cargo +stable build --workspace --locked
cargo +stable fmt --all -- --check
cargo +stable clippy --workspace --all-targets --locked -- -D warnings
cargo +stable test --workspace --locked -- --test-threads=1
```

The incomplete runtime binary is `target/debug/hypergraph`; `--help` describes required workspace/certificate/key options. It is not yet accepted for real documents. Certificate trust installation, final adapter testing, explicit record versions and removing domain serialization dependencies remain pending. Do not bypass certificate warnings or enable real-data testing from these instructions. No Node, Lean or separate database server is intended at release runtime.

Proof sources/pins remain under proofs; the replay command is `python3 scripts/check_rust_proof.py` with reviewed toolchains installed. New workspace/serialization changes still need replay compatibility checks. No proof replay was performed by this migration.

### 11. Local frontend intake and runtime transition

Source `HPX-SRC-0028`, original lines 290–296. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Frontend development takes place in this IDE/workspace. Receive exported source/assets in the local [frontend inbox](<../reference/development-evidence.md>), preserving raw input and reviewing it against this specification and the integration evaluation before adoption. An export is reference code/design, not an accepted data/storage/application architecture. Refactor or replace its internals where needed.

The initial accepted frontend runs as a separate local development server with synthetic mock document data and a typed fixture adapter. Configure browser automation/screenshots and interactive checks against the actual local page. Do not claim a working frontend, screenshots or behavior tests before an implementation runs. The eventual Rust release embeds the built static frontend and assets in one executable; the development server and browser-test tools do not become production runtime dependencies. See [frontend development](<getting-started.md>) for intake state and workflow.


## Examples

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Troubleshooting and limitations

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Related references

Developer setup for fixture preview and the unfinished integrated Rust writer. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Source provenance

- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 290–296; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
