# HPX-SCP change history

## 0.6.1 — Inline YAML prompting (proposed)

- Corrects v0.6.0's reference implementation, which encouraged exchanging `.yaml` paths instead of the actual message contents.
- Requires **complete inline YAML envelopes and bodies** in both directions, including discovery control messages; pointer-only prompts are not conforming.
- Changes the CLI default to stdin/stdout for message exchange and outputs the validated message itself from `receive`; local files remain optional I/O adapters.
- Retains out-of-band files only for protocol installation bundles and external supporting material.
- Adds live-text exchange tests alongside file-adapter compatibility tests; retains the canonical-prose/two-hash bootstrap.


## 0.6.0 — Inter-agent prompting correction (proposed)

- Reorients HPX-SCP around **discovery, propagation, readiness negotiation and bidirectional YAML prompting**. Prior framing primarily concerned scoped instructions and durable records; those mechanisms now support inter-agent exchange.
- Adds canonical, projected `negotiation` and `exchange` rule scopes, a typed YAML message envelope, and ten message kinds: `hello`, `ready`, `need`, `offer`, `request`, `response`, `clarification`, `error`, `handoff`, `amendment_notice`.
- Adds `scripts/scp_wire.py`, a tested reference **file-transport** workflow with per-peer session state, version/content-fingerprint checking, no normal task exchange before verified readiness, replay/reply checks, and transfer/staging of complete protocol bundles.
- Extends scoped context output to provide requested message envelope and message contracts, while retaining minimum sufficient agent context.
- Preserves canonical human-readable authority, appended deterministic YAML, exactly two external integrity hashes, history JSON records, context recovery, extension registry and owner-controlled governance.
- This user-directed architectural revision is intentionally non-additive in purpose. Prepared for repository review; no live HPX repository was modified.

## Earlier versions

v0.5.0 established YAML semantic packets, dual-digest integrity, compaction recovery, and shared autonomous amendments. Older durable records remain valid and are not rewritten by this upgrade.
