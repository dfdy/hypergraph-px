# HPX-FIND-011 — Bundled academic compiler must reconcile packaging and determinism

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Missing specification / architectural trade-off

## Severity

Medium

## Confidence

High

## Confirmed versus hypothetical

Confirmed future design choice

## Affected components / scope

Future Pandoc/academic export

## Affected processes

HPX-PROC-001, HPX-PROC-013

## Priority and dependency gate

P2 before academic export implementation

## Likelihood / evidence limit

Future contradiction possible, not a confirmed impossible requirement.

## Problem

Owner-confirmed bundled/embedded Pandoc removes a separate installation step but does not select a binding/helper distribution. The one-executable runtime constraint, writer versions, XML/JSON schemas, templates/styles/locale and external resource behavior are not yet reconciled in an executable format profile.

## Architectural consequences

A later exporter could silently depend on another installed process, fetch mutable resources or generate non-reconstructible citations/relationships. This is an unresolved design constraint, not proof that the requirements are impossible together.

## Reproduction / demonstration

Compare release packaging and future compiler clauses. Enumerate embedded library versus bundled/extracted helper versus narrower compatible writer; no package or compiler was installed for this review.

## Alternative interpretations

A bundled helper may satisfy user experience while requiring an explicit interpretation of one executable. An embedded implementation may satisfy packaging but increase build/licensing complexity.

## Possible remedies

Write a compiler ADR with licence/provenance, packaging, sandbox/resource limits and exact reproducibility profile; separately select XML/JSON semantics and PDF route.

## Trade-offs

More formats increase maintenance and loss mappings. Avoid general compiler abstractions beyond the owner-confirmed targets.

## Recommended next action

Owner decides packaging interpretation after a concrete alternatives study; freeze a minimal MD/HTML academic profile first.

## Human architectural approval

Yes — packaging/format scope; no decision inferred here.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/06-subsystems/import-export.md:26](../../../docs/06-subsystems/import-export.md) | Plan for an embedded or bundled Pandoc integration without requiring the user to install Pandoc separately. The delivery mechanism must be reconciled with HPX&#x27;s single-Rust-executable packaging requirement before implementation: an externally installed converter is not an acceptable silent fallback. An embedded library versus a packaged resource/helper and any controlled extraction/lifecycle mechanism remain an explicit design gate. Review depend |
| [docs/registers/requirements.csv:2](../../../docs/registers/requirements.csv) | HPX-RQ-001,HPX-REQ-002,One Rust release executable embeds frontend assets; no Node/Lean/database server at runtime,HPX-SRC-0032; Specifications/SPECIFICATION.md:L1; # Hypergraph PX MU-F — product specification,preserve source priority; no new ranking,existing source scope; no invented date,HPX-ARCH-001,crates/runtime/build.rs,Pending embedded/browser parity,local code builds; delivery unverified,source-reported evidence; not rerun in documentatio |
| [docs/06-subsystems/import-export.md:50](../../../docs/06-subsystems/import-export.md) |  /  &#96;.xml&#96;  /  A specifically named, versioned export schema/profile containing text, occurrence/range IDs and typed reference/incidence/provenance structures; retain readable labels and explicit unsupported-field diagnostics. Generic XML is not itself a sufficiently specified format.  /  |
