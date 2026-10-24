# Developer README installation — issue 7

Tracking: https://github.com/dfdy/hypergraph-px/issues/7. Date: 2026-10-24. Scope/invariants: shorten status, remove Initial verification, describe actual developer clone/build/test prerequisites, retain proof reproduction in dedicated docs, and make no runtime/proof changes. Feature development remains paused. Recovery is a documentation revert, with no data/format impact.

Instructions use Git, repository access, rustup stable with rustfmt/Clippy, a platform compiler/linker and locked workspace commands. Rustup syntax checked against local CLI help; official installation documentation linked. Existing stable toolchain used to execute documented build/test/lint/format commands without changing the personal default toolchain. No clean-machine installer execution or OS-specific installation guarantee is claimed.

Before publication validate package/version consistency, published Markdown links/code fences, absence of Initial verification, brief status outline and unchanged runtime/proof source. Synchronize patch 0.1.4 and observe GitHub checks after push. Record only executed results.

Executed successfully: documented stable locked workspace build, all eight Rust tests, strict all-target Clippy and formatting. Validated 77 published Markdown links/code fences, brief status, removed Initial verification, synchronized 0.1.4 metadata and unchanged runtime/proof source/hash. Diff whitespace passed. No new proof or clean-machine installer run is claimed.
