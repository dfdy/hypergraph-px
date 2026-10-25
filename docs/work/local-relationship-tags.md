# Overlapping relationship tags and assertion properties

2026-10-25. Owner explicitly approved overlapping browsing categories, stable relationship identities/definitions and assertion-level negation, uncertainty, attribution and scope. Local work only; publication hold remains active.

Plan/invariants: preserve all existing preview IDs and reviewed inverse identities; publish a unique registry with shared-reference tag projections; deduplicate cross-tag search/picker choices and unique-match selection. Browsing tag must never change the stored assertion. Preserve distinct meanings sharing a label. Add validated assertion properties with neutral defaults, expose optional controls and show qualified assertions without changing predicate identity. Distinguish claim attribution from authenticated authorship, and scope text from permissions. Keep source/export/caret/anchor behavior and backend boundaries unchanged. Execute semantic and browser regressions, then update current specs/audit/inventory/handoff.


## Completed outcome

The catalogue now separates the 244 stable wording definitions (210 normalized local predicates) from 13 tag projections. Reviewed memberships total 425: [39,67,45,41,28,38,35,44,26,26,13,15,8] in catalogue tag order. Every shared membership references the same immutable definition object. Existing IDs are preserved as opaque legacy values; categoryId is only a preferred browsing tag. New exports relationshipTypes, relationshipTags and uniqueRelationshipMatches support shared definitions and deduplicated results. Validation allows shared references while rejecting conflicting definitions, duplicate memberships and missing tags.

Picker category/item sorting remains alphabetical. Tags can overlap without duplicated options/suggestions or inflated one-result selection counts; a selected shared predicate survives switching to another of its tags. Typed records no longer store category membership as a fact. Identical non-stale typed assertions normalize predicate/participants/properties and reuse the same record (including review state), while distinct qualifiers or meanings remain separate claims. The field reports lastAddedId for successful additions/reuse so the dialog opens the correct card. Custom unregistered wording is not silently equated with a preset.

New assertion-properties.js validates negated:boolean, certainty:unspecified/possible/probable/certain, trimmed attribution (200 max) and scope (500 max), with neutral defaults. The optional collapsed Assertion properties section exposes them. Preview/card qualifications appear immediately after the relation name, between participant excerpts; hover names include them. Properties survive inverse normalization and source mapping. Attribution is a reported claim, not authenticated identity; scope is not a permission grant. Existing formal operators retain their definitions. No new category, graph primitive, Rust integration or inference engine.

## Accumulated owner steering

Removed redundant hover tooltips from self-explanatory text controls, including labelled fields, tabs/buttons, placeholders and Explorer labels. Icon-only controls and ambiguous formatting abbreviations retain 3.1-second explanations and accessible names. New control-labels.js supplies a small pure label classifier; the tooltip system rechecks dynamic labels before showing. Associated accessible labels and native-title suppression remain.

Recorded spell checking as a medium-term priority in README and Specifications/SPELL_CHECKING.md: local prose checking, dictionaries/language, protected Markdown/code/maths, explicit undoable corrections, stale-result handling and privacy/egress constraints. No spelling engine, dictionary dependency or browser-spellcheck behavior was implemented. The editor still sets spellcheck=false.

## Executed verification

48 Node tests passed, including shared identity, unique results, direction/qualifier semantics, exact typed-assertion reuse and invalid property rejection. Static build passed. All 52 sequential Chromium scenarios passed (about 1.3 minutes), including tag switching, exactly one search result/arrow/record across tags, stored properties, source export, tooltip omission on tabs/buttons/fields and retained icon names. After moving card qualifiers directly beneath the relationship name, rebuild and all nine picker browser scenarios passed (5.6s), with an explicit placement assertion. Screenshot artifacts/ui/relationship-tags-properties.png visually inspected. git diff --check passed.

Updated Specifications/ASSERTIONS_AND_TAGS.md, RELATIONSHIP_UI.md, WORKSPACE_INTERFACE.md, FRONTEND_INTEGRATION.md, index, frontend README, Unreleased changelog and the research audit/inventory (unique definitions plus tags and current source hash). No dependencies, Rust or Lean evidence changed. The four suggested additional subject families from the earlier assessment were not added by this request; existing categories now act as tags.

Live preview rebuilt at http://127.0.0.1:5173/. No publication/version bump/commit/GitHub mutation. Publication hold remains active.
