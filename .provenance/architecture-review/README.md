# HPX architecture process review

**Historical review baseline.** Active specifications were subsequently refined under the owner's integration brief; [finding dispositions, implementation impact and remaining decisions](../../docs/09-guides/reference/implementation-resumption.md#architecture-review-integration-2026-10-26) are now maintained in the existing documentation. The [verified pre-integration snapshot](../public-record/public-snapshots/2026-10-26-pre-architecture-integration-a0402d90505d/README.md) preserves this review and its exact original specification sources. Original tests/hash results below describe that baseline, not unchanged active specifications after integration. Do not regenerate the frozen review against revised docs; a fresh analysis needs a fresh baseline. The diagram browser points historical source evidence into the snapshot and labels interpretation corrections.

The review reconstructs HPX’s documented local architecture and separates accepted gated work from incomplete future mechanisms. It contains **18 parent responsibilities, 114 subprocesses, 51 coordinated diagram sources/renders and 20 evidence-linked findings**. All output is confined to this directory. Application code, authoritative specifications, accepted decisions and the pre-existing working tree are preserved; nothing is committed or pushed.

Start with the [architecture assessment](architecture-assessment.md), [prioritized recommendations](recommendations.md) and [findings register](findings/README.md). The main immediate concerns are rollback acceptance wording, stale current-status summaries, missing index repair semantics, and the required branch/working integration and older-reader gates. Performance concerns are analytical hypotheses, not measured failures or discovered cryptographic exploits.

## Navigate the reconstruction

- [Evidence and authority](evidence-register.md), [initial inventory/completeness assessment](evidence/preliminary-assessment.md), [source document inventory](evidence/document-inventory.csv)
- [Process hierarchy](process-inventory.md) and [detailed contracts](process-catalogue/HPX-PROC-001.md)
- [Diagram index](diagrams/README.md) and [offline interactive diagram browser](diagrams/viewer.html)
- [Requirement paths](traceability/requirements.md), [document dispositions](traceability/documents.md), [invariants](traceability/invariants.md), [failure analysis](traceability/failure-analysis.md), [threat analysis](traceability/threat-analysis.md)
- [Formal/complexity analysis](formal-analysis/README.md), [executed abstract-model results](formal-analysis/model-results.json), [static dependency graph](traceability/dependencies.json)
- [Coverage and missing mechanisms](coverage-report.md), [owner questions](open-questions.md), [validation and preservation evidence](validation-report.md)

## Scope and authority

Baseline: current dirty working tree, 2026-10-26, published 1.0.0 source plus unpublished local increments. [Baseline commit](evidence/baseline-commit.txt) alone does not identify the reviewed bytes; [312 file hashes](evidence/baseline-files.json) and [original status](evidence/baseline-git-status.txt) preserve that context. Current integrated comments/contributor behavior is distinct from gated branch/working wiring. No application test, compilation, proof replay, manual-runtime update or personal browser automation was performed for this review. Historical check counts retain their reported milestone scope.

Owner decisions and explicitly adopted ADRs govern scoped requirements. Inherited accepted passages retain authority inside proposed editorial assemblies; historical implementation prose is not current readiness merely because it appears in a current file. Code supports alignment observations and never silently replaces intended design. Seven evidence classifications distinguish specified, derived, code-only, hypothesized, contradictory, unspecified and future claims.

The complete current Markdown body is indexed; 60 materialized contracts and 31 compound requirement seeds have explicit dispositions. Reserved IDs and future missing mechanisms are exposed. This gives complete inventory coverage, not an invented percentage of all atomic requirements or a claim the entire future system is executable. Fifty leaf entries describe documented local responsibilities, eight gated ones, 55 future/incomplete areas and one explicitly deferred capability. Some local responsibilities are governance/development rather than product features.

## Method and limits

Stage A records evidence and completeness, Stage B establishes responsibility and leaf contracts, Stage C builds coordinated views, Stage D performs cross-view/quality/threat/failure/complexity checks, Stage E records alternatives and next actions. [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) informs stakeholder concerns, viewpoints and consistency; [29148:2018](https://www.iso.org/standard/72089.html) informs verifiability and traceability. Only public standard descriptions were consulted: no standards compliance audit or access to full paid texts is claimed.

[Official C4 guidance](https://c4model.com/diagrams) informs context/container/component levels. [UML 2.5.1](https://www.omg.org/spec/UML/2.5.1) informs activity/sequence/state distinctions. These Mermaid views are purpose-selected approximations, not executable UML. [BPMN 2.0.2](https://www.omg.org/spec/BPMN/2.0.2) was considered; no fully specified multi-party business protocol benefits from another notation here, so none is invented. DFD arrows describe information; workflow arrows describe control; state edges describe permitted lifecycle transitions. Conceptual and physical models stay separate.

Static SVGs are actually parsed/rendered using pinned [Mermaid 11.12.2](https://github.com/mermaid-js/mermaid/releases/tag/mermaid@11.12.2) in isolated headless Chromium. Renderer provenance, integrity and MIT licence review are recorded; no production dependency is added. [Mermaid usage](https://mermaid.js.org/config/usage.html) supplies parser/render conventions. The abstract model is bounded, handwritten and not extracted from HPX; existing Lean/extraction claims are not broadened.

The report intentionally preserves uncertainties: no real-data deployment/security attestation, no new performance measurement, no whole-host confidentiality, no rollback freshness witness, no portable package/compiler/federation/rights implementation and no whole-application proof. Findings challenge wording and scope where evidence supports it without changing adopted designs or initiating future implementation.

## Reproduce this review

Run from the repository root; all generators write only here. Python 3.11+ is required for `tomllib`. Existing Node/Playwright and Chromium are reused. The renderer requires the pinned temporary static bundle identified in its provenance file; if the cache is gone, fetch and integrity-verify that exact package through a reviewed tool setup before rendering. Do not execute unrelated repository scripts for this exercise.

```sh
python3 docproject/architecture-review/validation/build_diagrams.py
python3 docproject/architecture-review/validation/build_findings.py
python3 docproject/architecture-review/formal-analysis/check_model.py
python3 docproject/architecture-review/validation/dependencies.py
node docproject/architecture-review/validation/render_diagrams.cjs
python3 docproject/architecture-review/validation/build_reports.py
python3 docproject/architecture-review/validation/build_viewer.py
python3 docproject/architecture-review/validation/validate_review.py
```

Generators may replace their own generated review artifacts during an explicit refresh. They do not overwrite pre-existing repository material. If the documentation baseline changes, preserve this review as historical evidence and create a new baseline rather than silently passing different source hashes.
