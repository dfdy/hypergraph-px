# Licensing and Intellectual Property

## Common metadata

- **ID:** `HPX-GOV-002`
- **Title:** Licensing and Intellectual Property
- **Purpose:** Application licensing, dependency/source provenance and user-content rights.
- **Level:** `02-governance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-002](<../01-purpose/principles.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Keep root/upstream licenses unchanged. This document does not relicense supplied prose, private manuscripts or user content.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Application licensing, dependency/source provenance and user-content rights. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Application licensing, dependency/source provenance and user-content rights. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content



### Verification tooling and provenance

Source `HPX-SRC-0114`, original lines 1–20. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Reviewed 2026-10-24. Development/CI tools are not linked into the application. Runtime crypto dependencies are now listed with exact versions, registry checksums and reviewed license alternatives in [RUST_DEPENDENCIES.json](<../../legal/RUST_DEPENDENCIES.json>); the domain crate remains dependency-free. No upstream application or proof example was copied; the graph model/proofs are original code.

| Item | Version / origin | License / use |
|---|---|---|
| Lean and Lake | leanprover/lean4 v4.35.0; official Darwin arm64 release; compiler reports commit eb6cafb7290e8bd5f2937522d8d804f58f02bafc | Apache-2.0; project model checking, temporary local install and CI only |
| Lean CI action | leanprover/lean-action commit 24581d74d674803a25a81b10b059c5c0cdd344c6 | Apache-2.0; pinned CI action, with its upstream notices retained by use of the action |
| Aeneas | AeneasVerif/aeneas commit 74aabd52f77001cf9eaad51b4f4b867a7dc6b111 | Apache-2.0; official matching prerelease checksum-verified and executed; development only, not runtime |
| Charon compatibility | Aeneas charon-pin selects 260ba2c82588291b1f9efaf4f42d7100adc9c6c2 | Apache-2.0; matching bundled Charon 0.1.294 executed with isolated Rust nightly-2026-09-17; development only |

Primary sources: [Lean release](https://github.com/leanprover/lean4/releases/tag/v4.35.0), [Lean license](https://github.com/leanprover/lean4/blob/v4.35.0/LICENSE), [pinned action](https://github.com/leanprover/lean-action/tree/24581d74d674803a25a81b10b059c5c0cdd344c6), [Aeneas source](https://github.com/AeneasVerif/aeneas/tree/74aabd52f77001cf9eaad51b4f4b867a7dc6b111). The Aeneas backend's lean-toolchain agrees with the chosen Lean version. Pin the extraction environment and record actual execution before claiming Rust correspondence.

The original verification-tooling increment selected no crypto library; the later adapter selection is recorded below. Old-project dependency inventories do not apply. Complete packaged-dependency/copied-source/SBOM accounting as those categories become nonempty.


Actual extraction continuation: official prerelease `nightly-2026.10.24-74aabd5` contains compatible Charon/Aeneas and the precompiled Lean backend. Asset SHA-256 pins are in `proofs/rust/extraction.json`. Aeneas returned exit 2 for the unchanged whole-validator translation (nested-loop returns and missing Iterator::filter_map modelling); strict helper translation succeeded. A diagnostic-only unknown-external printer additionally hit a tuple-name error; removing that printer did not remove warnings-as-errors or proof checks.

The extracted proof backend adds nine development-only Lean packages, with exact revisions/licenses recorded in extraction.json: Mathlib, plausible, LeanSearchClient, importGraph, proofwidgets, aesop, Qq and batteries are Apache-2.0; Cli is MIT. At that extracted-proof milestone runtime Cargo remained dependency-free. The generated Spend.lean derives from this project's own AGPL Rust source via the pinned translator; its generator boilerplate is not an imported upstream application. The original hand proof is AGPL-3.0-only. Future package/tool changes require license/revision review again.

### Runtime crypto adapter dependency review

Source `HPX-SRC-0114`, original lines 21–26. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Reviewed all 28 resolved external package manifests before compilation. Each offers MIT; select that license, including the target-specific r-efi package (also offers Apache-2.0/LGPL alternatives). Exact source/checksum/license/repository data is in [RUST_DEPENDENCIES.json](<../../legal/RUST_DEPENDENCIES.json>). Dependencies are registry-linked packages, not copied application/proof code. Future release packaging must include required third-party license notices; this source-only milestone does not claim a completed binary distribution/SBOM.

Direct packages: [chacha20poly1305 0.11.0](https://docs.rs/chacha20poly1305/0.11.0/chacha20poly1305/), [argon2 0.6.0](https://docs.rs/argon2/0.6.0/argon2/), [getrandom 0.4.3](https://docs.rs/getrandom/0.4.3/getrandom/), [sha2 0.11.1](https://docs.rs/sha2/0.11.1/sha2/), [zeroize 1.9.1](https://docs.rs/zeroize/1.9.1/zeroize/). Selection uses their primary API/license documentation and actual fetched source review. The convenience Argon2 allocation does not clear its work memory; our adapter explicitly owns a zeroizing Block vector and uses hash_password_into_with_memory. This is not an audit or proof of cryptographic primitives.

### Frontend preview

Source `HPX-SRC-0114`, original lines 27–29. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

CodeMirror 6, KaTeX and esbuild dependencies are pinned with their resolved versions, integrity and reviewed SPDX metadata in [FRONTEND_DEPENDENCIES.json](<../../legal/FRONTEND_DEPENDENCIES.json>). Runtime/editor/renderer packages use MIT; Playwright browser tooling uses Apache-2.0. Node/Chromium/esbuild/Playwright are development tools, not Rust release runtime services. Browser binaries are installed by Playwright for testing and are not redistributed with app assets. The frontend build generates installed dependency license notices and includes the application license. Selected owner-provided AGPL source helpers/widgets have individual input digests and adaptation notes in [frontend provenance](<../../frontend/SOURCE_PROVENANCE.json>); manuscript/private fixtures and original built bundles were not adopted. No new Rust dependency or theorem is introduced by the frontend. Frontend CI reuses checkout and adds actions/setup-node (MIT) as build tooling.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Application licensing, dependency/source provenance and user-content rights. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0114` — `legal/TOOLING.md`, lines 1–20; SHA-256 `931174282e3b973d5b9e68ab19a89574d3f5dac435e2828d994871bf5b8772c3`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0114` — `legal/TOOLING.md`, lines 21–26; SHA-256 `931174282e3b973d5b9e68ab19a89574d3f5dac435e2828d994871bf5b8772c3`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0114` — `legal/TOOLING.md`, lines 27–29; SHA-256 `931174282e3b973d5b9e68ab19a89574d3f5dac435e2828d994871bf5b8772c3`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
