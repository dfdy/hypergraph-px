# Relationship identity, browsing tags and assertion properties

## One definition, overlapping browsing tags

A relationship has stable identity, precise definition, participant roles and direction independently of its browsing categories. Categories are overlapping tags, not exclusive owners or graph predicates. A relationship can appear under several relevant tags without becoming another choice or another fact. Preserve distinct meanings that happen to share a label; do not merge those meanings through lexical matching.

The frontend exports a unique immutable relationshipTypes registry and relationshipCategories projections. Every projection refers to the same definition object by its stable ID. Existing preview IDs retain their legacy namespace as an opaque identifier; moving tags, changing a label or adding membership must not regenerate the identity. The legacy categoryId in a definition is only a preferred initial browsing tag. categoryIds is the current membership set. Neither controls predicate meaning or canonical participant roles.

There are 244 selectable wording choices over 210 normalized local predicate identities, with 34 reviewed inverse orientations, grouped under 13 overlapping browsing tags. An inverse wording remains a distinct selectable orientation of its normalized predicate. Tag membership totals exceed registry size and are not a count of distinct relationships. Keep the catalogue's ordinary display labels, individual definitions, alias routes and direction assessments.

Category and item dropdowns remain alphabetical. Changing tags preserves a selected relationship when it belongs to both. Searching without a selected category lists each stable choice once, and the compact suggestions likewise deduplicate across all matching tags. Count unique identities when deciding whether to auto-select a sole result or show the one-to-nine-result suggestion list. Display all relevant tags as metadata; do not silently reset a user-selected tag to the legacy preference when choosing a shared item.

Typed assertion records contain predicate identity/orientation, exact participants and assertion properties; they do not store the browsing category as part of the fact. Creating the same non-stale typed assertion with identical normalized predicate, participants and properties reuses its record and review state, even if reached through another tag. Different predicates or different assertion properties remain separate claims. Custom unregistered terms cannot be safely equated solely by their wording. Shared symmetric predicates normalize participant ordering for duplicate detection; directed converses normalize their roles explicitly.

## Properties belong to the assertion

Negation, uncertainty, attribution and contextual scope qualify a claim. They do not create new categories or relationship identities. For example, possibly causes and causes use the same predicate, with different assertion certainty.

The preview supports an optional collapsed Assertion properties section in the creation modal:

| Property | Preview values | Meaning |
|---|---|---|
| Negation | Negate assertion checkbox, default off | Negates this asserted relation between these participants. |
| Certainty | Unspecified, Possible, Probable, Certain | A declared epistemic qualification, not a computed probability or proof. Default Unspecified. |
| Attribution | Optional text, maximum 200 characters | Whose claim is being reported; not an authenticated creator/device identity or permission. |
| Scope | Optional text, maximum 500 characters | The contextual limits of the claim; not an authorization scope or executable query. |

Trim optional text; reject invalid types, unsupported fields/values and oversized content before creating a record. Show selected qualifications directly below the relationship name, between participant excerpts, in both the modal preview and Relations card. Keep them when mapping source anchors or reversing canonical predicate roles. Custom assertions support the same properties. Unmarked qualifiers have neutral defaults and do not imply certainty or attribution.

The existing explicit logical operators, unary negation marker and predicates such as does not entail retain their precise meanings. Negating an assertion is distinct from changing its underlying truth function or taking its converse. No new inference, double-negation reduction, confidence propagation or ontology equivalence follows automatically.

## Integration boundary

These are tab-only fixture semantics. A real domain implementation must bind assertions and their revisions, authenticated proposer/creator and review events, permission-scoped participants, structured scope/evidence and vocabulary versions through the shared Rust command path. Claim attribution must never overwrite authenticated authorship or operation provenance. Free-text context does not satisfy a future multi-participant or authorization contract. This UI work adds no Rust predicate persistence, real-data transport, external disclosure or Lean theorem.
