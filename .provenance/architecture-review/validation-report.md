# Validation report

**Historical validation of the original review baseline.** The owner subsequently authorized active-specification refinement. These results are not a claim that current docs still match the original hashes. Current integration verification is in [HPX-TEST-039 and the integration record](../../docs/09-guides/reference/implementation-resumption.md#architecture-review-integration-2026-10-26); the [verified snapshot](../public-record/public-snapshots/2026-10-26-pre-architecture-integration-a0402d90505d/README.md) preserves the original report and source bytes. Diagram SVG/Mermaid semantics remain unchanged; current browser annotations explain the review's scope and interpretation corrections.

Only review tooling and an isolated headless diagram browser ran. No application build/test, Lean replay, provider connection, personal browser, credential enrollment, manual-runtime refresh, Git commit or push was performed. Historical application tests are cited at their original scope.

## Executed checks

| Check | Result | Evidence |
| --- | --- | --- |
| process_ids_unique | PASS | 18 parents and 114 leaves |
| process_fields | PASS | All requested fields, including explicit empty implementation/test evidence for future mechanisms |
| tree_and_calls | PASS | One responsibility parent per leaf; cross-family calls separately identified |
| write_responsibility | PASS | Structural check only: listed mechanism/authority; future unspecified protocols remain gaps, not passes of implementation |
| future_status_honest | PASS | No future/deferred leaf has an implementation claim |
| implementation_paths | PASS | {&#x27;code_supported_leaves&#x27;: 57, &#x27;missing&#x27;: &#91;&#93;} |
| authority_boundary_present | PASS | Contract presence only; not a proof of authorization enforcement |
| evidence_classes | PASS | All seven requested semantic classes |
| exact_source_locators | PASS | {&#x27;locators&#x27;: 129, &#x27;unmatched&#x27;: &#91;&#93;} |
| finding_schema | PASS | 20 fully attributed findings |
| requirements | PASS | 31 compound seeds, selected leaf/component/verification path and explicit atomic-coverage gap |
| document_paths | PASS | 60 materialized contracts; reserved IDs explicitly excluded |
| source_section_bytes | PASS | {&#x27;sections&#x27;: 1109, &#x27;mismatches&#x27;: &#91;&#93;, &#x27;encoding&#x27;: &#x27;Raw span hash plus separately labelled LF-joined locator text hash; original whole-file hashes retained&#x27;} |
| all_diagrams_parse_render_xml | PASS | {&#x27;count&#x27;: 51, &#x27;errors&#x27;: &#91;&#93;, &#x27;renderer&#x27;: &#x27;11.12.2&#x27;} |
| diagram_metadata_and_navigation | PASS | Viewpoints, scope, milestone, evidence, exceptions/legends, valid process and child links |
| all_leaves_diagrammed | PASS | All leaf responsibilities appear in a family decomposition view |
| dfd_named_channel_balance | PASS | Eight named external channels identical at levels 0/1; lower diagrams are explicitly scoped zooms, not exhaustive decomposition claims |
| bounded_model_and_mutants | PASS | {&#x27;states&#x27;: 8131, &#x27;transitions&#x27;: 18317, &#x27;mutants_detected&#x27;: 3, &#x27;scope&#x27;: &#x27;Depth 10 abstraction only, not HPX correspondence&#x27;} |
| dependency_graph | PASS | {&#x27;crate_cycles&#x27;: &#91;&#93;, &#x27;frontend_cycles&#x27;: &#91;&#93;, &#x27;limits&#x27;: &#91;&#x27;Cargo normal local path dependencies only; no build/dev/target-conditional external graph.&#x27;, &#x27;Frontend static relative imports via conservative regex; dynamic imports/runtime calls/global shared state may be absent.&#x27;, &#x27;Storage super::* observations include test modules; they show shared namespace dependence, not precise call cycles.&#x27;, &#x27;Crate-level DAG does not prove runtime, semantic, callback or store-access acyclicity.&#x27;&#93;} |
| offline_viewer | PASS | &#91;&#x27;51 selectable diagrams&#x27;, &#x27;exact selection&#x27;, &#x27;process search&#x27;, &#x27;linked child navigation&#x27;, &#x27;zoom control&#x27;, &#x27;no page JavaScript errors&#x27;&#93; |
| local_markdown_links | PASS | {&#x27;links&#x27;: 1372, &#x27;broken&#x27;: &#91;&#93;} |
| original_files_unchanged | PASS | {&#x27;baseline_files&#x27;: 312, &#x27;changed&#x27;: &#91;&#93;} |
| git_state_preserved | PASS | {&#x27;added_status_lines&#x27;: &#91;&#93;, &#x27;removed_status_lines&#x27;: &#91;&#93;, &#x27;commit_or_push&#x27;: &#x27;None performed&#x27;} |

Detailed machine output: [results.json](validation/results.json), [diagram parser/render results](validation/diagram-results.json), [offline viewer checks](validation/viewer-results.json), [model results](formal-analysis/model-results.json), [dependency graph](traceability/dependencies.json). Source hashes compare against the original dirty working tree, not HEAD alone.

The first diagram pass rendered 20/48 successfully: HTML labels needed namespace-aware SVG XML serialization, and Mermaid treated semicolons/extra note colons as syntax delimiters. Those initial failures are retained in [initial results](validation/diagram-results-initial.json), corrected in the source/renderer and revalidated. Visual inspection then prompted lighter note backgrounds; three focused identity/graph/source-mapping views were added. Final results validate all current diagram sources and serialized SVGs. The initial section checker also incorrectly compared raw bytes with LF-joined locator-text digests; the ledger now labels both encodings and carries independently checked raw span hashes. Quoted source locators are escaped so source-relative Markdown links are not accidentally interpreted as review-relative links. This records corrections rather than counting an unsuccessful pass as validation.

## Visual inspection and boundaries

Contact sheets show all views; detailed previews verify conceptual identity, separate publication/replacement ordering and plaintext trust boundaries. The final sheet includes publication actor bindings, role-labelled n-ary graph scope and the exact CRLF/emoji byte mapping example. The offline browser was checked for selection, process search, child navigation, zoom and JavaScript errors at desktop width. Standalone SVGs retain detail when contact-sheet text is small; the full-size source remains the reading artifact. Browser sessions were closed in finally blocks and no test server/profile was created.

The structural checker verifies required fields, source locators, hashes, IDs, navigation, named DFD channel balance, implementation file paths, requirement paths and render success. It does not establish that English contracts are complete or that code enforces them. The invariant/failure/threat matrices and evidence-linked findings carry the semantic analysis; future missing mechanisms remain explicit.

The valid abstract model checked 8,131 reachable states and 18,317 transitions through depth 10; three deliberately incorrect variants produced counterexamples. This is not extracted code, an unbounded/liveness proof, a cryptographic analysis or a hardware durability experiment. Static dependency SCC checks cover normal local Cargo edges and recognized frontend static relative imports only.

Baseline material is preserved. Any remaining semantic limitation is reported in [coverage](coverage-report.md), [findings](findings/README.md) and [owner questions](open-questions.md), rather than hidden by a passing artifact checker.
