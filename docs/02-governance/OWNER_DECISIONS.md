# Owner decisions and execution authority

Date: 2026-10-25. Source: explicit owner messages in this conversation, recorded by the development agent. This is an attribution record, not a cryptographic signature or a fabricated transcript.

| Record | Owner direction | Consequence |
|---|---|---|
| HPX-OWNER-001 | “Retain immutable history; defer exceptions (Recommended)” | Preserve committed history. Redaction/erasure exceptions need a separate approved design. |
| HPX-OWNER-002 | “Require explicit record versions (Recommended)” | Record-version discriminants are required before durable format acceptance for real-data testing; exact field/layout and migrations remain to be implemented. |
| HPX-OWNER-003 | “Keep serialization outside the domain” | Keep domain independent of serialization/storage/wire representations. Current Serde derives are a documented implementation discrepancy, not permission to alter code during documentation migration. |
| HPX-OWNER-004 | “Preliminary approval of phase C, subject to resolving unresolved decisions.” | Proceed with source-backed documentation migration after resolving the three decision questions; inherited requirements retain their acceptance, editorial assemblies remain reviewable. No commit/push or application work authorized. |
| HPX-OWNER-005 | “on completion of C, move all previous documentation to .oldspecs and exclude from git.” | Supersedes the prior leave-in-place procedure. Archive previous project prose, historical migration review and supplied pack byte-for-byte; preserve provenance; add .oldspecs/ to ignore rules. Create current root navigation/instructions. Do not move application HTML/code, proof source, tests, executable configuration or license texts. |

Publication remains held. Application development remains paused. Installing certificate trust is a separate approval. Keep the original review and its unresolved findings as historical input; do not rewrite it to imply these decisions had been made earlier.

The only substantive decisions newly accepted here concern retained history, serialization boundaries and explicit record versions. Future federation, cryptography, privacy exceptions and package schemas remain open/deferred. Archival movement changes documentation locations, not software behavior or licensing.

## Later specification-integration authority, 2026-10-26

The preceding table and pause/publication statements retain their original 2026-10-25 scope; later application resumptions and stops are recorded in the [development state](../09-guides/reference/DEVELOPMENT_STATE.md). Do not read this historical paragraph as revoking those separately recorded directions.

| Record | Owner direction (paraphrased from the supplied integration brief) | Consequence |
| --- | --- | --- |
| HPX-OWNER-006 | Archive current specifications byte-for-byte, then integrate supported architecture findings in the existing nine-level hierarchy. Preserve intended capability and essential semantics; make proportionate noncontroversial corrections; leave consequential choices for approval. | Specification-only work authorized. Application code/tests, accepted guarantees and data compatibility remain unchanged. No commit/push/release. The new public-intended snapshot remains INTENDED_FOR_PUBLIC_RELEASE — NOT_YET_APPROVED. |

The [snapshot and integration record](../09-guides/reference/implementation-resumption.md#architecture-review-integration-2026-10-26) preserve this task's provenance and limits. The owner requested plain-language/feasibility clarification of rollback detection; neither clarification request approves an exception, a witness design or real-data acceptance. HPX-GAP-023 remains unresolved.

## Documentation publication authority, 2026-10-26

The owner confirmed creation or redistribution rights for supplied HPX prose/design inputs, the documentation-template pack and logo, then instructed: “Redact what's needed and push to github.” This authorizes the reviewed documentation and redacted derivative publication described in the [publication record](../09-guides/reference/documentation-publication-2026-10-26.md). The unredacted immutable master and private originals remain local. Existing licences retain their scope; no new blanket licence, application resumption, runtime release or future publication authority is inferred.
