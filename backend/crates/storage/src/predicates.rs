// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Shared predicate meanings and canonical orientation
//!
//! Read the reviewed bundled predicate catalogue and resolve a selected wording
//! into its canonical captured definition. Inverse labels retain one definition
//! while explicit role reversal describes their chosen orientation.
//!
//! Source: [Latest source on GitHub][source]
//!
//! Agent provenance: Agent creation unverified; original creator not recorded.
//! Created: Unknown (not recorded).
//! Creation harness: Unknown (not recorded).
//! Creation model: Unknown (not recorded).
//!
//! Latest editing agent: Codex /root/storage_comments (OpenAI coding agent).
//! Latest editing harness: Codex; version/build unknown (not exposed).
//! Latest editing model: OpenAI; exact identifier/revision unknown (not exposed).
//! Last edited: 2026-11-15 (UTC).
//!
//! Used by: Assertion storage/validation and the frontend-shared
//! relationship catalogue workflow.
//!
//! Specification:
//! - [Relationship and predicate definitions][spec0]
//! - [Assertion identity and meaning][spec1]
//! - [Retrospective assertion record contract][spec2]
//!
//! Boundary: Catalogue versioning binds recorded meaning, not truth or
//! permission. This parser neither infers logical equivalence nor invents
//! new predicate mechanisms.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/predicates.rs
//! [spec0]: ../../../../docs/05-domain/diagrams/relationships.c4
//! [spec1]: ../../../../docs/05-domain/assertions-and-predicates.md
//! [spec2]: ../../../../docs/07-implementation/data-structures/sqlite-records.md

use super::*;
use std::collections::BTreeMap;
/// One captured endpoint-role identity and its human-readable label.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Role {
    /// Stable role key within the captured predicate definition.
    pub id: String,

    /// Human-readable catalogue label, not a separate logical identity.
    pub label: String,
}

/// Whether the predicate uses binary orientation or explicit role incidences.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ParticipantMode {
    /// Two ordered endpoints with canonical source/target roles.
    Binary,
    /// Participants identify their declared role rather than an inferred position.
    RoleLabelled,
}

/// Captured meaning whose exact serialized bytes produce its version fingerprint.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Definition {
    /// Canonical predicate identity shared by inverse display wordings.
    pub predicate_id: String,

    /// Existing bundled registry interpretation version.
    pub registry_version: u32,

    /// Human-readable catalogue label, not a separate logical identity.
    pub label: String,

    /// Captured definition text, not an implementation assertion of its truth.
    pub description: String,

    /// Declared role order/labels retained with this exact meaning.
    pub roles: Vec<Role>,

    /// Explicit endpoint/role interpretation required by this definition.
    pub participant_mode: ParticipantMode,

    /// Required contextual evidence fields declared by the catalogue.
    pub context_fields: Vec<String>,

    /// Whether reversing endpoints preserves this declared predicate meaning.
    pub symmetric: bool,

    /// Optional browsing/organizational grouping, distinct from predicate identity.
    pub family: Option<String>,
}

impl Definition {
    /// Hash the exact captured definition bytes so later meaning changes cannot reuse it.
    pub fn version(&self) -> Result<[u8; 32]> {
        // Hide serializer diagnostics behind the adapter format failure.
        Ok(Sha256::digest(serde_json::to_vec(self).map_err(|_| Error::Format)?).into())
    }
}

/// Display choice plus canonical meaning and explicit orientation to capture.
#[derive(Clone, Debug)]
pub struct Resolved {
    /// Exact catalogue choice selected, even when its meaning is canonicalized.
    pub choice: String,

    /// Whether selected display roles reverse the canonical endpoint orientation.
    pub reverse: bool,

    /// Complete captured canonical meaning, not a mutable catalogue pointer.
    pub definition: Definition,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Catalogue {
    catalogue_version: u32,
    categories: Vec<Category>,
    relationships: Vec<Choice>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Category {
    id: String,
    label: String,
    description: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct Choice {
    #[serde(rename = "type")]
    name: String,
    example: String,
    definition: String,
    source_role: String,
    target_role: String,
    context_fields: Vec<String>,
    symmetry: String,
    canonical_id: String,
    orientation: String,
    inverse_assessment: String,
    id: String,
    category_id: String,
    category_ids: Vec<String>,
    #[serde(default)]
    aliases: Vec<String>,
    label: Option<String>,
    symbol: Option<String>,
    family: Option<String>,
    inverse: Option<String>,
    inverse_id: Option<String>,
}

/// Strictly validate bundled categories, choices, canonical/inverse identities and role relations.
fn parse() -> std::result::Result<BTreeMap<String, Resolved>, String> {
    let catalog: Catalogue =
        serde_json::from_str(include_str!("../../../../shared/predicate-catalog-v1.json"))
            // Retain parse diagnostics only inside the non-secret static catalogue result.
            .map_err(|e| e.to_string())?;
    if catalog.catalogue_version != 1 {
        return Err("Unsupported predicate catalogue".into());
    }
    let mut categories = std::collections::BTreeSet::new();
    for c in catalog.categories {
        if c.label.is_empty() || c.description.is_empty() || !categories.insert(c.id) {
            return Err("Invalid catalogue category".into());
        }
    }
    let mut choices = BTreeMap::new();
    for c in &catalog.relationships {
        if c.id.is_empty()
            || c.definition.is_empty()
            || c.example.is_empty()
            || c.source_role.is_empty()
            || c.target_role.is_empty()
            || c.context_fields.is_empty()
            || c.inverse_assessment.is_empty()
            || !c.category_ids.contains(&c.category_id)
            // Every browsing-category reference must name an established category.
            || c.category_ids.iter().any(|id| !categories.contains(id))
            || !matches!(c.orientation.as_str(), "forward" | "reverse")
            || !matches!(c.symmetry.as_str(), "symmetric" | "not asserted")
            // Empty alias text is invalid catalogue data, not an alternate identity.
            || c.aliases.iter().any(|a| a.is_empty())
            // A present symbol must contain actual text.
            || c.symbol.as_ref().is_some_and(|s| s.is_empty())
            || choices.insert(c.id.clone(), c).is_some()
        {
            return Err("Invalid predicate choice".into());
        }
    }

    let mut result = BTreeMap::new();
    for choice in &catalog.relationships {
        let canonical = choices
            .get(&choice.canonical_id)
            .ok_or("Missing canonical predicate")?;
        if canonical.orientation != "forward" || canonical.canonical_id != canonical.id {
            return Err("Invalid canonical predicate".into());
        }
        if choice.orientation == "reverse"
            && (choice.source_role != canonical.target_role
                || choice.target_role != canonical.source_role)
        {
            return Err("Invalid inverse roles".into());
        }
        if let Some(inverse) = &choice.inverse_id {
            let inverse = choices.get(inverse).ok_or("Missing inverse")?;
            let inverse_label = inverse
                .label
                .clone()
                // A missing presentation label falls back to readable catalogue wording.
                .unwrap_or_else(|| inverse.name.replace('_', " "));
            if inverse.inverse_id.as_ref() != Some(&choice.id)
                || choice.inverse.as_ref() != Some(&inverse_label)
            {
                return Err("Invalid inverse identity".into());
            }
        }
        if choice.symmetry == "symmetric" && choice.inverse_id.as_ref() != Some(&choice.id) {
            return Err("Invalid symmetry".into());
        }
        result.insert(
            choice.id.clone(),
            Resolved {
                choice: choice.id.clone(),
                reverse: choice.orientation == "reverse",
                definition: Definition {
                    predicate_id: canonical.id.clone(),
                    registry_version: 1,
                    label: canonical
                        .label
                        .clone()
                        // Choose presentation text without altering canonical identity.
                        .unwrap_or_else(|| canonical.name.replace('_', " ")),
                    description: canonical.definition.clone(),
                    participant_mode: ParticipantMode::Binary,
                    roles: vec![
                        Role {
                            id: "source".into(),
                            label: canonical.source_role.clone(),
                        },
                        Role {
                            id: "target".into(),
                            label: canonical.target_role.clone(),
                        },
                    ],
                    context_fields: canonical.context_fields.clone(),
                    symmetric: canonical.symmetry == "symmetric",
                    family: canonical.family.clone(),
                },
            },
        );
    }

    Ok(result)
}

/// Resolve one exact choice through a lazily validated catalogue, never a fuzzy text match.
pub fn resolve(choice: &str) -> Result<Resolved> {
    static CATALOGUE: std::sync::OnceLock<std::result::Result<BTreeMap<String, Resolved>, String>> =
        std::sync::OnceLock::new();
    let catalogue = CATALOGUE
        .get_or_init(parse)
        .as_ref()
        // Public callers receive format failure, not internal catalogue diagnostics.
        .map_err(|_| Error::Format)?;
    catalogue.get(choice).cloned().ok_or(Error::Invalid)
}

#[cfg(test)]
mod tests {
    use super::*;
    /// Guard all reviewed choices/canonical identities and explicit logical-equivalence context.
    #[test]
    fn shared_registry_preserves_all_choices_and_normalized_identity_including_equivalence() {
        let catalog = parse().unwrap();
        assert_eq!(catalog.len(), 244);
        let canonical: std::collections::BTreeSet<_> = catalog
            .values()
            // Count canonical meanings rather than the larger display-choice set.
            .map(|r| r.definition.predicate_id.clone())
            .collect();
        assert_eq!(canonical.len(), 210);
        let equivalence = resolve("preview:logical-argumentative:is_equivalent_to").unwrap();
        assert!(equivalence.definition.symmetric);
        assert_eq!(
            equivalence.definition.context_fields,
            vec!["interpretation and premises"]
        );
        assert_eq!(
            equivalence.definition.version().unwrap(),
            equivalence.definition.clone().version().unwrap()
        );
        assert!(resolve("logically equivalent").is_err());
    }

    /// Guard one captured meaning across inverse labels and a new hash after meaning edits.
    #[test]
    fn inverse_wording_uses_identical_captured_definition_while_marking_role_reversal() {
        let forward = resolve("preview:ontological:constitutes").unwrap();
        let inverse = resolve("preview:ontological:is_constituted_by").unwrap();
        assert!(!forward.reverse);
        assert!(inverse.reverse);
        assert_eq!(forward.definition, inverse.definition);
        assert_eq!(
            forward.definition.version().unwrap(),
            inverse.definition.version().unwrap()
        );
        let mut changed = forward.definition.clone();
        changed.description.push_str(" Changed meaning.");
        assert_ne!(
            changed.version().unwrap(),
            forward.definition.version().unwrap()
        );
    }
}
