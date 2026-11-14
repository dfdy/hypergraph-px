# Future document export and compilation

## Common metadata

- **ID:** `HPX-SUB-008`
- **Title:** Import and Export
- **Purpose:** Define the owner-confirmed future export scope and conversion boundary without enabling a converter.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner
- **Applies to:** future trusted-server export; current exact Markdown download remains its implemented subset
- **Upstream authority:** [system requirements](../03-requirements/system-requirements.md), [user export needs](../03-requirements/user-needs.md), owner-confirmed future request recorded in the [development state](../09-guides/reference/DEVELOPMENT_STATE.md)
- **Downstream dependencies:** [component boundaries](../04-architecture/component-architecture.md), [data architecture](../04-architecture/data-architecture.md), future export adapter/profile/artifact contracts
- **Verification:** future format/citation/permission/reconstruction checks below; documentation inclusion is not implementation evidence
- **Decision/history:** materializes reserved HPX-SUB-008 for the bounded export topic confirmed by the owner on 2026-10-26; inherited import obligations remain in the [external integration contract](external-integrations.md)
- **Last reviewed:** 2026-10-26

## Authority and delivery status

The owner confirmed including the future bundled/embedded Pandoc export request in specifications and plans. That product scope is accepted as a future requirement; this document's mechanism details remain a proposed refinement until selected and verified. It does not install Pandoc, introduce a runtime dependency, choose an unreviewed library/version, enable export, authorize provider access or reprioritize current implementation. Existing import/Word-review, Markdown, PDF and portable-package obligations retain their separate scopes.

## Conversion and packaging boundary

Keep the pure domain independent of Pandoc, serialization and file formats. Application services freeze and authorize an exact export plan, then a bounded conversion adapter consumes a prepared document model and selected resources. Treat converter invocation, native bindings, templates, filters, citation processors and output serialization as adapter concerns. Keep export jobs and temporary/output artifacts subject to workspace confidentiality, policy, resource limits and explicit delivery authorization.

Plan for an embedded or bundled Pandoc integration without requiring the user to install Pandoc separately. The delivery mechanism must be reconciled with HPX's single-Rust-executable packaging requirement before implementation: an externally installed converter is not an acceptable silent fallback. An embedded library versus a packaged resource/helper and any controlled extraction/lifecycle mechanism remain an explicit design gate. Review dependencies, licenses, provenance, distribution obligations, supported platforms and every helper/runtime requirement before adoption. No Node/Lean/database server or system converter prerequisite is introduced by this plan.

The requested targets are `.docx`, `.odt`, `.rtf`, `.html`, `.tex`, `.typ`, `.xml` and `.json`. This is an HPX product target list, not a claim that an unspecified Pandoc version or binding directly supports every target. Verify each writer/profile separately. Unavailable targets report unsupported with an explicit alternative; never relabel another format as the requested extension or silently lose selected content.

## Frozen content selection and citations

Offer an explicit selected-document main-branch export and separately selectable additional branches, provenance, annotations and relationships between sentence, paragraph, section and other node scopes. Main-branch identification uses an actual designated branch identity once implemented, not a guessed label or current UI selection. Inclusion of an additional branch or overlay does not grant access to all its history. Review included/excluded scope before execution.

Freeze exact document/branch/revision/snapshot or acknowledged-draft inputs under the [existing export source choices](external-integrations.md#84-current-branch-markdown-export). Bind occurrence-specific source ranges, ordered transformation inputs, relation definitions/roles, explicit annotation overlay revisions, citation metadata, style/locale resources, assets, renderer/writer version and options. Later typing, source heads or retrospective annotations must not change the captured export. Retain logical identity versus occurrence, same-node ancestry versus derivation and declared/accepted claims versus checked proof. Do not infer original authorship or pairwise facts from n-ary incidence.

Support selectable academic citation styles including APA, Harvard, Chicago and IEEE, with consistent in-text citations and bibliographies. Bind the exact style variant/version, locale and captured bibliographic records; style names alone are not reproducible compiler inputs. Define missing/ambiguous citation diagnostics and style-resource licensing before delivery. Do not require a network lookup, mutate Zotero or invent missing bibliographic facts during conversion.

## Planned relationship representations and fallbacks

Each format profile must make included relationships inspectable with stable human-readable labels and enough exact identifiers/context to distinguish repeated passages and equal-labelled nodes. Use native linking where verified; retain a readable labelled appendix when native structure cannot represent the selected semantics. These are planned output requirements, not adopted writer APIs or already frozen XML/JSON schemas.

| Output | Planned representation of selected extra content and relationships |
| --- | --- |
| `.docx` | Native headings/bookmarks and internal references where supported; labelled branch/annotation sections and a relationship/provenance appendix retaining endpoint context and n-ary roles. No reliance on hidden custom data as the sole readable representation. |
| `.odt` | Native document sections/bookmarks and internal links where supported; readable branch/comment/provenance sections and role-labelled relationship tables as fallback. |
| `.rtf` | Human-readable section/passage labels and references; append branch variants, annotations and relation/provenance tables when reliable native linking or annotations cannot carry the semantics. |
| `.html` | Named sections and fragment links for exact exported occurrences, plus accessible role-labelled relationship/provenance tables and annotation sections. External scripts, remote assets or active source markup are not prerequisites. |
| `.tex` | Escaped document text, labels/cross-references and explicit appendix sections/tables for branches, annotations, roles and lineage. Preserve mathematical source under the selected profile; exporting TeX does not imply executing an external TeX engine. |
| `.typ` | Verified writer-specific named labels/links and readable supplementary sections/tables. If the selected writer cannot express a relationship natively, preserve its endpoint labels, roles and evidence status textually. Exporting Typst source does not imply installing or running a system compiler. |
| `.xml` | A specifically named, versioned export schema/profile containing text, occurrence/range IDs and typed reference/incidence/provenance structures; retain readable labels and explicit unsupported-field diagnostics. Generic XML is not itself a sufficiently specified format. |
| `.json` | A specifically versioned export document model with exact identities, occurrences/ranges, ordered inputs, roles and selected overlays, with readable labels. Keep this document export distinct from deferred workspace-package or encrypted-backup formats. |

For every profile, disclose lossy conversion, omitted selected features and fallback representation. Keep direction, repeated roles, review state and disputed premises visible. Conversion does not establish semantic equivalence or proof. XML/JSON fields, native annotation mapping, appendix ordering and resource/streaming budgets require exact contracts and acceptance fixtures before enabling the writer.

## Rights and confidentiality

Unresolved attribution/licensing conflicts must not by themselves prevent an otherwise authorized export. Append an in-document unresolved-rights report identifying the permitted affected content, evidence/uncertainty and unresolved claims; do not invent a clearance or ownership resolution. Its detail is permission-scoped and must not leak withheld identities or content. Where no native appendix structure exists, retain a clearly labelled report section in the format's defined export model.

This reporting policy does not override access restrictions, protected-source restrictions or the existing [core egress policy](security-cryptography.md). Future client-held/non-trusted plaintext export remains denied, including local downloads; possession of keys or an approval click cannot bypass that rule. Recheck applicable policy before conversion and artifact delivery, including frozen jobs after a mode change. Do not scrape the browser DOM or silently export private runtime data, credentials or unrelated workspace content.

## Future sequencing and verification

Schedule this after the exact authorized export model, branch/closure selection and citation capture interfaces can support it. Begin with bounded adapter/profile and packaging feasibility, license/provenance review and deterministic fixtures before enabling a user-facing converter. Branch extras depend on actual branch support; annotation/provenance exports bind their own exact overlay/event contexts. This does not make those foundations immediate priorities.

For each target, test citations/bibliography, Unicode/newlines, mathematics, repeated occurrences, alternate branches, n-ary role/direction preservation, competing/retrospective annotations, readable fallback/loss diagnostics and the appended rights report. Verify current permission/egress denial, stale plans, hostile markup/filter/resource inputs, missing assets/citations, bounded work, cancellation, private temporary cleanup and reproducibility against pinned resources. Round-trip claims apply only to explicitly designed profiles; a readable conventional document is not automatically an exact restorable workspace.
