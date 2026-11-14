# HPX-DOM-001 checklist

Temporary personal checklist. Track progress in the [DOM001 coverage record](../../architecture/audits/dom001-current-coverage.md).

The approved source-backed conceptual migration is complete; the overall specification remains partial. Unchecked items below still need design or verification.

## Closure work — dependency order

- [x] **1. Define trustworthy reconstruction inputs.** Definition complete (TEST165): [supplier-result contract](../../architecture/proposals/reconstruction-input-preparation.md#completed-supplier-result-contract) and [coverage/discharge table](../../architecture/proposals/reconstruction-input-preparation.md#item1-coverage-and-remaining-work-allocation) specify exact sources/slices,ordered structure,occurrence-specific selected versions,acknowledged working recovery,missing/inaccessible outcomes,and no-notation/partial-selection meaning under OWNER048–053. [Revision9](../../architecture/proposals/trustworthy-reconstruction-inputs.md#revision9--item1-input-definition-completed) retains proposed realisations and downstream implementation/format/resource/proof obligations;this is no integrated-delivery claim.
- [x] **2. Specify operational limits.** Definition/design complete (OWNER054 / TEST168): [operational accounting contract](../../architecture/proposals/reconstruction-operational-limits.md) covers pre-work acquisition/decode/comparison/expansion/path/emission/metadata/browser admission, checked arithmetic, physical/aggregate safeguards, explicit failure/recovery and bounded exact-target navigation under L1A/L2A. No silent clipping or resource-as-cycle stop. Numeric safe defaults require item3 representation costs and concrete measurements; OL1–OL13, enforcement and implementation/proof correspondence remain unperformed. This completes specification, not measured capacity or integrated delivery.
- [x] **3. Design the concrete closure and source map.** Specification/format design complete (OWNER055 / TEST169): [concrete contract](../../architecture/proposals/exact-closure-source-map.md) fixes authoritative bundles,tagged committed/checkpoint/working states,local parent/occurrence uses,typed copied/structural maps,zero-byte/partial/discontiguous cases,exact full-source UTF8 and identified-buffer UTF16 conversion,interpretation/cache evidence and candidate schema4/kinds38–44/catalog2 backed-up compatibility gate. C1–C12,numeric/older-reader/upgrade tests,codecs and implementation/proof correspondence remain unperformed;no actual migration or real-data format acceptance.
- [x] **4. Finish conflict-state semantics.** Specification/design complete (OWNER056 / TEST170): [conflict-state contract](../../architecture/proposals/conflict-state.md) defines millisecond HPX Commit comparison and Ask fallback,per-issue anchors/outcomes,explicit batches,current shared historical status,review history,verified/uncertain carry,concurrent/idempotent recovery and candidate45–54/feature38-version2 layouts. Ask default,per-user automatic opt-in,private drafts and separate warning/hint meanings retained. F1–F12,clock/codec/profile-upgrade/application/proof execution remain unperformed;item5 stays separate.
- [ ] **5. Specify and verify implementation correspondence.** Connect the model to Rust and read-only reconstruction, then navigation, permissions, historical recovery and UI behaviour. Establish the implementation scope separately.

## Further DOM001 gaps

- [ ] Define general relationship and provenance representations.
- [ ] Define workspace-user permission mechanisms.
- [ ] Define chat/MCP interaction representations.
