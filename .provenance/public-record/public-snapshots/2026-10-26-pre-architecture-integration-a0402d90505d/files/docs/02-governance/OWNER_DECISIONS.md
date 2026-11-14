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
