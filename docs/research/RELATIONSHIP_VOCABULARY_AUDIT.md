# Relationship vocabulary audit — 2026-10-25

Status: local research and implementation review, not a claim of universal vocabulary completeness. No publication is authorized. Source: frontend/src/relationship-catalog.js. The [inventory appendix](RELATIONSHIP_CATALOGUE_INVENTORY.md) records every current choice, stable preview identity and inverse metadata. The owner subsequently authorized implementation of the full audit. All named candidate choices and aliases below are now implemented in the synthetic frontend; the tables retain the baseline findings that motivated them. They do not describe missing current UI choices. There is no finite, discipline-independent list of every relevant philosophical relationship.

## Method and actual coverage

Inspected all 125 initial scoped choices: the owner's 104 entries in eight categories plus 21 operator/reasoning/linguistic choices. Compared directional labels, prepositions, aliases, supplied inverse labels, participant roles and category overlaps; checked concept, discourse, citation, provenance, temporal and policy vocabularies against their publishers' references below. This is a coverage review, not an assertion of equivalence to those ontologies or an automated inference audit.

The first correction pass yielded 129 scoped choices: ontological 13, dialectical/process 15, logical/argumentative 15, epistemological 14, ethical/political 15, conceptual/semantic 12, genealogical/historical 12, methodological/practical 12, logical operators 21. At that baseline there were 16 explanatory inverse labels and most converse directions were not selectable. The full implementation below supersedes that limitation. Same display wording in different categories is not necessarily a duplicate meaning.

## Adopted organization: overlapping browsing tags and assertion properties

The owner approved categories as overlapping browsing tags. The implementation now has one immutable registry of 244 wording choices (210 normalized local predicate identities), with shared-reference projections under 13 tags. Tag membership changes neither identity nor definition. Existing namespace-bearing preview IDs are retained as opaque stable values; the legacy primary category is a browsing preference only. There are now 425 tag memberships, not 425 predicates. Current membership counts are documented in the regenerated inventory.

Search and native choices deduplicate shared entries by stable ID; unique-result auto-selection uses the deduplicated set. Reclassification does not duplicate facts. Re-adding an identical typed predicate/participant/property assertion through another tag returns its existing record; different qualifications remain different claims. Distinct senses sharing words remain separate by definition.

Negation, declared certainty, claim attribution and contextual scope are validated assertion properties. They are available in an optional modal disclosure and shown with the claim, without creating categories such as possibly causes. Attribution text is not authenticated authorship; scope text grants no permissions. See the [canonical contract](../../Specifications/ASSERTIONS_AND_TAGS.md). The original audit tables below remain the historical findings; their exclusive group counts are superseded by these tag projections.

## Full implementation outcome

The catalogue now contains **244 selectable choices in 13 categories**, preserving the original preview identities. Initial exclusive counts, before overlapping tags, were 30 ontological, 23 dialectical/process, 23 logical/argumentative, 21 epistemological, 24 ethical/political, 21 conceptual/semantic, 23 genealogical/historical, 23 methodological/practical, 26 logical operators/markers, 6 rhetorical/discourse, 13 temporal, 5 source/provenance and 6 causal/empirical.

All candidate-table entries and listed missing-role wordings are available. Existing has part and already-present developments are reused across the audit rather than copied into another category. Suffices for is a search alias of is sufficient for; is a subtype of aliases is a, and is an instance of aliases instantiates. Practical requires remains distinct from formal necessary-condition claims. Original category-specific undermines senses remain separate.

Every choice now has an individual definition/example, participant-role guidance, contextual qualifiers and explicit direction/symmetry assessment. Thirty-four reviewed converse pairs normalize onto one local predicate identity by reversing canonical source/target roles; selecting a converse creates one assertion, not an extra mirrored edge. Nineteen choices explicitly assess contextual symmetry. Missing converse metadata is explicitly not an inference license. The inherited embodies and realises examples now use their forward wording. Supports the existence of is a separate selectable gloss, not silently treated as the inverse of depends on; that converse is is depended on by.

The picker and Relations cards expose Roles and context in a collapsed disclosure. Bounds, exact source, marker positions, current-caret filtering and custom terms retain their prior behavior. Validators and regressions check all audit candidate names/aliases, reciprocal metadata, shifted inverse anchors, source/target distinctions and temporal boundary meanings. See the [interface contract](../../Specifications/RELATIONSHIP_UI.md) and [implementation record](../work/local-full-relations-audit.md).

These are source-neutral tab-only annotations. Natural-language type matching, mandatory qualifier capture, multi-participant canonical facts, Rust predicate persistence/migrations, automatic logical inference and authoritative provenance writes are not implemented. The full audit vocabulary is implemented; those backend capabilities are separate integration gates. No new Lean theorem or Rust correspondence claim is made.

## Corrections implemented locally

| Choice | Category | Meaning and reason |
|---|---|---|
| adapts (retained, definition added) | Genealogical/historical | A reworks B for a purpose. |
| adapts to (added) | Dialectical/process | A adjusts itself to B's conditions. This is not the inverse of adapts. |
| determines (added) | Ontological | A fixes a feature/state of B in the stated account, without automatically asserting temporal causation. |
| is determined by (added) | Ontological | Reverse wording of that determination. |
| underdetermines (added) | Epistemological | Evidence A leaves multiple accounts B compatible. |
| is underdetermined by (retained, definition added) | Epistemological | Account A is not uniquely settled by evidence B. The catalogue did not previously contain is determined by. |

Cambridge's [adapt entry](https://dictionary.cambridge.org/dictionary/english/adapt) distinguishes modifying something from adjusting to conditions. Our definitions specialize those roles for this application. Evidence underdetermination is a separate epistemological issue; see [Stanford's commissioned survey](https://plato.stanford.edu/entries/scientific-underdetermination/). No causal determinism or epistemic inference is inferred from selecting these labels.

## Baseline omissions and their implemented treatment

| Current wording | Missing direction or different role | Assessment |
|---|---|---|
| adapts | adapts to; is adapted by; adapts for | All three now selectable; adapts for documents its additional adapted-material role. |
| depends on | is depended on by | Inverse direction. Existing “supports the existence of” is a supplied gloss, not a generally established logical equivalent. |
| constitutes / embodies / constrains / enables | is constituted by / is embodied in / is constrained by / is enabled by | Previously metadata-only; now reviewed selectable converses. |
| presupposes / instantiates / conditions | is presupposed by / is instantiated by / is conditioned by | Now reviewed selectable converses. |
| emerges from / realises | gives rise to / is realised through | Supplied inverse glosses; precise roles must be reviewed before declaring strict inverse equivalence. |
| is part of | has part | Useful missing inverse. Concept-part, document-part and physical-part senses should be distinguished. |
| draws on / develops from | supplies a basis for / develops into | A source role and an outcome role can be different assertions, not mere spelling variants. develops into already exists in process. |
| responds to | responds with | A stimulus versus response-content role; not inverse relations. |
| implements / tests / evaluates | is implemented by / is tested by / is evaluated by | Missing passive orientations, not new underlying facts. |
| causes / results in / results from | causal origin, consequence and inverse wording | All absent as selectable choices; causation must remain distinct from temporal order and correlation. |
| supports / is inferred from | is supported by / infers | Missing converse wording. Infers normally introduces a reasoning agent and may need more roles. |
| is necessary for / is sufficient for | requires / suffices for | Potential aliases under a specified interpretation; do not add duplicates merely to lengthen the catalogue. |
| is broader than / is narrower than | existing pair | Already both present. Do not add again. |
| transforms / is transformed by | existing pair | Both retained and now paired by local normalized orientation. |
| undermines in two categories | social process versus argument attack | Distinct senses, distinct IDs. A label-only deduplication would lose meaning. |

## Implemented candidates by existing category

Every label below was absent at the baseline audit and is now implemented as a selectable application term, not necessarily an exact standard identifier. References support the indicated conceptual distinctions, not automatic equivalence of our proposed names.

| Category | Additional candidates | Required distinctions |
|---|---|---|
| Ontological | grounds; is grounded in; has part; has property; is a property of | Grounding, constitution, parthood and causation are different. Separate instance-of from subtype-of rather than treating all “is a” statements alike. |
| Dialectical/process | sustains; disrupts; stabilises; destabilises; replaces; is replaced by; results in; results from | Outcome and origin roles must be explicit. Document replacement in DCMI is narrower than general process replacement. |
| Logical/argumentative | rebuts; undercuts; argues for; argues against; concedes; is an exception to; reformulates | Attacking a conclusion differs from attacking an inference; a premise set can require more than two participants. |
| Epistemological | corroborates; disconfirms; predicts; explains; is explained by; estimates | Evidence, explanation, prediction and inference are not synonyms. Corroboration does not establish truth. |
| Ethical/political | authorises; delegates to; represents; is accountable to; protects; harms; benefits; exploits; resists | Norms need agent, action, object and context. A binary sentence annotation alone cannot implement an access-control rule. |
| Conceptual/semantic | denotes; is denoted by; defines; abbreviates; is coextensive with; is disjoint from; closely matches; exactly matches | Distinguish a term from a concept, synonymy from identity, and cross-scheme mappings from logical equivalence. |
| Genealogical/historical | cites; quotes; paraphrases; translates; is a translation of; corrects; extends; supersedes | Citation, intellectual influence, revision lineage and exact-source quotation have different evidence requirements. |
| Methodological/practical | uses a method from; uses data from; replicates; reproduces results from; applies to; measures; is measured by; conforms to | Reproducing results is distinct from the existing social-process “reproduces.” A method's use does not validate its correctness. |
| Logical operators / discourse markers | unless; even if; otherwise; although; provided that | Candidate ordinary-language markers need their own definitions. Do not silently treat them as classical implication or add duplicate formal operators. |

[SKOS](https://www.w3.org/TR/skos-reference/) supplies the reference distinctions for concept hierarchy and close/exact cross-scheme mappings; these do not establish object identity. [CiTO](https://sparontologies.github.io/cito/current/cito.html) supplies scholarly citation distinctions including correction, extension, confirmation, data and method reuse. [DCMI terms](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/) distinguish document parts, formats, versions, references and replacement. Our broader philosophical proposals remain application analysis rather than a claim that those standards define every term above.

[ODRL](https://www.w3.org/TR/odrl-model/) is a reference for structured permission/prohibition/duty expressions, parties, actions, assets and constraints. It is not a complete political or ethical ontology. [RST definitions](https://www.sfu.ca/rst/01intro/definitions.html) distinguish concession, contrast, condition, cause/result, elaboration and purpose in discourse. Importing those names would not import RST tree constraints or prove that a given pair satisfies a relation.

## Implemented additional families

| Family | Candidate labels | Scope |
|---|---|---|
| Rhetorical/discourse | elaborates; summarises; restates; contrasts; gives background to; gives a purpose for | Highly relevant to adjacent sentences/paragraphs; current fixture cards already demonstrate some labels, but they are not catalogue presets. RST is the reference above. |
| Temporal | precedes; follows; meets; is met by; occurs during; temporally contains; starts with; finishes with | Time entities/intervals, not arbitrary concepts. [OWL-Time](https://www.w3.org/TR/owl-time/) defines precise interval relations including their converses. Generic overlap differs from its asymmetric Allen interval-overlap relation. |
| Source/provenance | is derived from; is quoted from; is a revision of; is attributed to; is generated by | [PROV-O](https://www.w3.org/TR/prov-o/) distinguishes entities, activities and agents. Annotation of a philosophical claim about provenance must not alter authoritative application audit history. |
| Causal/empirical | causes; prevents; increases; decreases; correlates with; moderates | Implemented application-specific annotation definitions. Correlation is not causation; statistical mediation differs from philosophical “mediates.” Confidence, population, time and evidence may be essential qualifiers. |

## Operator and core-design audit

The ten implemented proper two-input classical truth functions use both arguments essentially. The other six possible two-input truth tables are constants or projections/negated projections; adding them as relationships between two independently relevant statements would be misleading. Current consequence/derivability entries are explicitly separate from those truth functions; ordinary not/if/then/neither/but are annotation markers. [forall x, chapter 10](https://forallx.openlogicproject.org/html/Ch10.html) provides the truth-functional background. No Lean proof validates a user-created natural-language relationship, and this UI work adds no new Lean evidence.

Implemented locally: normalized predicate identity is separate metadata from selected wording, aliases, category and assertion identity. Durable Rust registry design must preserve this separation. An inverse UI choice should swap participant roles of one canonical assertion where equivalence is established, not create a second fact. PROV-O's [inverse-name appendix](https://www.w3.org/TR/prov-o/#description-inverse-names) illustrates a preferred orientation with named converses. Local converse normalization is implemented; canonical Rust graph migrations and inference remain outside this frontend work.

Before expanding presets, require a short definition, example, forward roles, inverse/symmetry assessment, participant kinds and any extra context; check existing aliases globally, then check category senses. Avoid mechanical passive generation: not all predicates are binary, symmetric, invertible in the intended wording, or meaningful for every source/target pair. Optional future audit tooling can flag missing metadata; it cannot decide philosophical completeness.

## Validation and limits

The catalogue regression verifies all category counts, unique scoped IDs, preserved category senses, spaces in display labels, split marker words, operator families, searchable corrected directions and adaptation meanings. Browser checks exercise actual category dropdowns, source preservation and record creation. Executed final results are recorded in docs/DEVELOPMENT_STATE.md and docs/work/local-relation-picker.md. Inventory is a snapshot of source, not a claim that the Rust domain already implements these predicates. All listed candidates now have definitions and are implemented in the picker or deliberate aliases. Backend integration remains gated as described above.
