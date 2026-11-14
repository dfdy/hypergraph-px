# Backend

The root Cargo workspace owns the existing crates in `backend/crates/`: dependency-free domain planning, application/storage adapters, crypto, optional native Keychain, and the HTTPS runtime. The physical move does not change crate names, domain records, persistent formats or authorization.

From the repository root:

```sh
npm run build:backend
npm run test:backend -- -- --test-threads=4
```

These use `dev-backend`, which requires neither frontend assets nor Node during Rust compilation/testing. Cached locked Rust dependencies and a native toolchain are still required. `cargo build --workspace --locked` without that feature embeds prepared frontend assets instead. The production wrapper deliberately excludes `dev-backend`.

See the [development guide](../docs/09-guides/developers/repository-development.md) for independent HTTPS execution, debugging and the one-command production build. [Relocation manifest](relocation-manifest.json) retains pre-move hashes and original/current paths; later build/adapter edits are separately identified in migration evidence.
