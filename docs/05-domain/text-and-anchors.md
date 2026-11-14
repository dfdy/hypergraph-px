# Text Anchors and Selection Semantics


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-012-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-012-02` [Current adopted design — OWNER059](#current-adopted-design--owner059) | Prose only: Routing summary to the detailed adopted design contracts; their section bindings carry ownership. |
| `HPX-BIND-012-03` [Entities and identities](#entities-and-identities) | [hpx.native.domain.annotation_rules.concept_anchor](diagrams/relationships.c4) · `HPX-CAN-019` · [concept_relationships](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-012-04` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
| `HPX-BIND-012-05` [Owned editor source implementation evidence, 2026-10-25](#owned-editor-source-implementation-evidence-2026-10-25) | Prose only: Scoped implementation or execution record; evidence does not define or adopt the product architecture. |
| `HPX-BIND-012-06` [Committed comment anchors](#committed-comment-anchors) | [hpx.native.domain.annotation_rules.concept_anchor](diagrams/relationships.c4) · `HPX-CAN-019` · [concept_relationships](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-012-07` [Structural membership and exact partial fragments — OWNER053](#structural-membership-and-exact-partial-fragments--owner053) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-012-08` [Concrete closure map representation — OWNER055](#concrete-closure-map-representation--owner055) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-DOM-006`
- **Title:** Text Anchors and Selection Semantics
- **Purpose:** Exact UTF8 text, UTF16 browser coordinates, historical anchors and ownership boundaries.
- **Level:** `05-domain`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-11-03

Formal meanings do not imply every type or operation is implemented. See implementation discrepancies and requirement evidence separately.



## Current adopted design — OWNER059

The directly selected D01–D22A briefs now have diagram-owned definitions and precise supplements: [CAN027 / Working state exact editing and graph policy](../06-subsystems/contracts/editing-and-graph.md). These govern the listed design questions; earlier open-mechanism statements below retain their historical checkpoint scope where superseded by this explicit decision. Candidate record/profile designs are not active formats or implemented capability. Exact retained source/byte/history and accepted obligations remain; actual code, measured capacity, genuine older-reader, recovery/security/UI acceptance and proofs are separately unperformed. No original source provenance or as-run evidence is rewritten.

## Entities and identities


### Text encoding contract

Source `HPX-SRC-0026`, original lines 7–12. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Document text and other textual payloads use UTF-8 in storage, transport and plain-text/Markdown export. Rust String/str already require valid UTF-8; byte-oriented adapters must validate incoming text and return an error for invalid sequences instead of replacement decoding. Encrypt the exact UTF-8 bytes where a payload is protected; ciphertext is not itself text. Importing a differently encoded external format requires an explicit format-specific decode/convert step before creating application text.

Do not equate encoding with indexing or normalization. Internal browser ranges remain UTF-16 code units. UTF-8 byte offsets, Unicode scalar positions and grapheme positions are different units; every range contract must name its unit and bind the exact source version. Validate conversions and boundaries without changing composed/decomposed forms, emoji sequences or CRLF. UTF-8 does not choose the future durable anchor scheme or canonical record serialization. Runtime enforcement and edge-case tests remain integration acceptance work, not claimed by this documentation update.

### 4. Editor projection and coordinate contract

Source `HPX-SRC-0028`, original lines 68–93. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Every editable projection provides the exact text and source bindings for all editable spans. Each binding must identify its owner kind (shared content or document-local prose), logical owner, exact revision/base, occurrence path/nested inclusion context, source range, editing permission and any generated/read-only boundary. A shared manifest used twice may require different descendant bindings. Neither heading position nor a map keyed only by content ID establishes ownership.

Inserted text may have a draft-local binding under its intended owner/base; it does not receive a fabricated immutable revision ID before commit. Insertion at an ownership boundary needs an explicit resolved owner/bias. Generated separators may be read-only. A historical projection is read-only unless an explicit authorized draft/branch/restore workflow creates a new state from that base.

Conceptual shape, **not an executable wire schema**:

```text
EditorProjection
  reference: workspace + document + branch OR exact snapshot
  projection_token + expected_state_token
  text + coordinate_encoding
  source_bindings[]: display span -> exact source/context/owner + allowed edits
  headings[]: hierarchy + display span + opaque target reference
  draft?: reference + generation + editing_context + acknowledged_sequence
```

Persisted/exchanged document text and plain-text/Markdown exports use UTF-8. Encoding is separate from coordinate units: browser-local text ranges use half-open UTF-16 code-unit offsets into the **exact identified buffer**. A target includes the projection token, draft generation where applicable, editing context/local sequence, occurrence context and range. JavaScript strings use UTF-16 code units; Rust `str` byte boundaries differ. In `A😀B`, the emoji is browser range `[1,3)` and UTF-8 byte range `[1,5)`; an endpoint at UTF-16 offset 2 splits a surrogate pair and must fail. See [ECMAScript strings](https://tc39.es/ecma262/multipage/text-processing.html#sec-string-objects) and [Rust string boundaries](https://doc.rust-lang.org/std/primitive.str.html#method.is_char_boundary).

These browser coordinates do not adopt a durable anchor encoding. Conversion must be checked against the exact text and source-map token, with no silent Unicode, CRLF or whitespace normalization. Reject invalid scalar boundaries, out-of-range, stale or ambiguous targets. Combining marks and emoji sequences require tests; scalar boundaries alone do not define grapheme or sentence boundaries. Do not invent a complete-sentence-only eligibility rule: backend action contracts must report eligible scope and reasons.

Typing changes offsets. A base source map is not automatically valid for the edited buffer. Track ordered local transactions and their source mapping; `saveDraft` validates them against the acknowledged base and returns updated mappings. Subsequent selections identify their exact local sequence. Never relabel a stale map with a newer sequence or trust a client-submitted ownership map without Rust validation. If mapping across owners is not supported, reject that edit explicitly. Full-buffer replacement is permitted only under an explicitly supported, verified ownership contract; it is not a generic multi-owner save or agent endpoint.

Selection/search responses apply only to their originating document, projection, generation and local sequence. Discard or explicitly remap stale picker/preview results. Headings are display/search labels; stable links use opaque target references and explicit pin/follow policy. Duplicate or renamed headings must not retarget stored relations.

### 4. Selection anchors and promotion

Source `HPX-SRC-0037`, original lines 38–47. Source-linked obligations with scoped retention, transformation or owner qualification; see the clause dispositions for `HPX-SRC-0037-S005`. Original dates and implementation observations remain historical evidence.

An anchor identifies an exact owner revision and range, including occurrence path/context for repeated or nested content. Canonical coordinate/encoding rules must agree with the frontend UTF-16/source mapping contract. Quote/context selectors assist recovery; text matching alone never proves identity or silently reassigns an ambiguous anchor. Revision-aware mappings report resolved, stale, ambiguous, inaccessible or missing outcomes.

Promote a fragment only when an operation needs persistent identity. Preserve bytes, formatting and reading order; do not allocate a node for every word. Overlapping ranges remain anchored references or ordered selection components, never overlapping children in a composition tree. Multi-node selections preserve ordered parts, individual owners/revisions and boundaries. Historical snapshots remain immutable.

**Copying does not Commit an unsaved buffer.** Under [ADR019](../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md), committed selections retain exact historical bindings and uncommitted provenance-bearing selections use private working checkpoints. Checkpoint capture is durable private workflow state, not canonical node publication, structural promotion or derivation. Later Commit and reference replacement remain distinct operations with their own exact-state and authority checks. Opening a menu or preview publishes nothing.

Before enabling durable promotion, specify its exact affected heads, whether it creates only a derived fragment or also restructures current source composition, attribution, undo and atomic receipt in an ADR. No source restructuring or unrelated draft commit may be hidden in Copy. Copy never creates destination forks in advance.


## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 7–12; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 68–93; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 38–47; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.

## Owned editor source implementation evidence, 2026-10-25

The runtime frontend retains exact source separately from the CodeMirror LF display projection in [owned-source.js](../../frontend/src/owned-source.js). It maps UTF-16 display changes against the exact owned text, rejects stale mappings and split scalar boundaries, and preserves unchanged mixed line endings and combining scalars. Exact paste and undo/redo effects retain raw source; copy and download use owned text. This is implementation/test evidence for the existing UTF-8/source-preservation requirement, not acceptance of generic multi-owner editing. See [test coverage](../02-governance/registers/tests.csv).

The local read-only runtime now resolves the existing `Anchor` against an exact historical snapshot, including revision/occurrence binding and scalar-safe UTF-8 byte bounds. This adds no persisted anchor encoding, relocation, source promotion or current-draft publication mechanism; see [actual navigation queries](../06-subsystems/interfaces/domain-navigation.md) and [test evidence](../02-governance/registers/tests.csv).

## Committed comment anchors

Accepted HPX-ADR-017 uses one exact committed passage per immutable comment. The dependency-free `comment::plan` validates revision/path, scalar-safe nonempty UTF-8 range, exact quote and nonblank bounded body, preserving source/comment newline bytes. Current authorization, draft preconditions and persisted versions remain adapters. Retained comments continue to reference their historical passage after source edits; no quote matching or current-head substitution relocates them. Document paging links between distinct comments are not same-node ancestry.

## Structural membership and exact partial fragments — OWNER053

[Canonical M1](diagrams/identity-closure.c4) owns the accepted composition-selection meanings; [decision provenance](../02-governance/OWNER_DECISIONS.md#structural-selection-membership-and-exact-partial-fragments--2026-11-02) records choices1A/2A together. Distinguish an exact owned-source text range from a graph-preserving composition selection. Composition membership follows the exact selected structural contribution order and full occurrence/source context; numeric parent-source or flattened byte offsets alone do not establish it.

| Selection/context | Accepted meaning; no UI/codec inferred |
| --- | --- |
| Before p→B to after p→B, with q→C at the same parent-source byte cut | Select p/B alone under that exact contribution order, not q/C; retain full occurrence context. |
| Across a zero-byte stopped inclusion p | Select its exact stopped relationship/target/ancestor and separate warning/navigation despite empty authored-byte contribution. No source placeholder is invented. |
| Identical structural start and end positions | Select nothing. Equal numeric byte offsets do not prove identical structural positions. |
| Only the emoji within one occurrence's `A😀B` | Preserve its exact selected bytes and full source/occurrence context; distinguish the partial fragment from the whole selected inclusion and every other reuse. Existing checked UTF16/source conversion still applies. |
| Part of the exact original including-source notation | Preserve the exact selected owned bytes/context; clipped notation does not become an executable whole inclusion. Do not silently expand selection or forbid arbitrary owned-source ranges. |

A fragment's necessary source/ancestor context is not a claim that its entire enclosing inclusion was selected. Missing/stale/ambiguous structural mapping must not be guessed from text or merged solely because byte cuts coincide. Exact endpoint representation, UI/wiring and physical source maps remain engineering designs; this approval supplies no model/implementation correspondence proof. Existing ownership, authority, newline/Unicode and immutable-history obligations remain.

## Concrete closure map representation — OWNER055

The [canonical item3 choices](diagrams/identity-closure.c4) are realised in the [typed source-map design](proposals/exact-closure-source-map.md#4-one-typed-ordered-map--choice4a). Copied spans use exact full-source UTF8 ranges; structural/site/stop entries preserve zero-byte distinctions and nesting without source characters. Before/after endpoints retain occurrence/contribution context at coincident byte cuts; partial notation stays a fragment. [UTF16/display conversion](proposals/exact-closure-source-map.md#exact-utf8--browser-utf16--display-relation) is checked against exact identified buffers with no normalization or nearest-owner inference. This completes representation design only; browser/source correspondence,composite mutation and new-format acceptance are not delivered.
