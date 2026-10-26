# HPX-FIND-012 — Portable package and restore contracts are not ready for durable interchange

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Missing specification / data integrity risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed future format gap

## Affected components / scope

Portable import/export/backup/restore

## Affected processes

HPX-PROC-013.007, HPX-PROC-014

## Priority and dependency gate

P1 before portable real-data interchange

## Likelihood / evidence limit

High cost of format mistakes after distribution; no current import failure demonstrated.

## Problem

Names .hpxz/.hpx.json/.hpxe do not supply complete bytes/schema, closure, size/stream limits, identity collision rules, algorithm negotiation, signatures, key recovery or roundtrip guarantees. Current consistent SQLite backup is specific to native enrollment, not a delivered portable restore.

## Architectural consequences

Premature formats can permanently lose nested source bindings or import misleading identity/authority. Copying a live WAL DB is explicitly unsupported and must not substitute for backup.

## Reproduction / demonstration

Attempt a paper roundtrip of repeated occurrence paths, retrospective assertions, private checkpoints and unknown optional records. Current high-level contracts do not define all encodings or inclusion/disclosure rules.

## Alternative interpretations

Deferral is intentional; a native encrypted snapshot is useful within its documented scope and need not solve general interchange.

## Possible remedies

Design a minimal versioned interchange manifest with exact closure and unknown-record policy; bounded staged validation; create-only restore; corruption/roundtrip vectors and migration strategy.

## Trade-offs

Streaming reduces memory but complicates authenticated all-or-nothing import; packaging every private record may disclose more than a recipient is authorized to see.

## Recommended next action

Owner selects inclusion/privacy and identity policy before any real package acceptance.

## Human architectural approval

Yes for durable format acceptance and selective disclosure.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/06-subsystems/external-integrations.md:32](../../../docs/06-subsystems/external-integrations.md) | Source inputs propose workspace-centric .hpx, .hpxz portable packages, .hpx.json interchange and .hpxe encrypted backups. Only the .hpx local slice has accepted implementation design. The other byte formats, streaming encryption, compression, dependency/asset packaging and round-trip contracts remain TBD. Proposed GitHub backup is separate from Markdown publication: locally encrypt, create-only remote names with race-safe preconditions, verify be |
| [docs/06-subsystems/formats/hpx-workspace.md:55](../../../docs/06-subsystems/formats/hpx-workspace.md) | ## Compatibility and migration |
| [docs/08-assurance/recovery.md:40](../../../docs/08-assurance/recovery.md) | Durability assumes local filesystem, functioning SQLite VFS/fsync and storage hardware. No network filesystem support. Newly created file is create-only with restrictive permissions on Unix; reject symlink opens where supported. Parent directories must be user-controlled; no claim against a malicious same-user host. Consistent backup requires SQLite backup API; copying a live database or just ignoring WAL is unsupported. Portable &#96;.hpxz&#96;/&#96;.hpx.js |
