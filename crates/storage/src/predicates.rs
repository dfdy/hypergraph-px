// SPDX-License-Identifier: AGPL-3.0-only
//! One reviewed catalogue shared with the frontend; versions bind captured meaning.
use super::*;
use std::collections::BTreeMap;
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Role {
    pub id: String,
    pub label: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ParticipantMode {
    Binary,
    RoleLabelled,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Definition {
    pub predicate_id: String,
    pub registry_version: u32,
    pub label: String,
    pub description: String,
    pub roles: Vec<Role>,
    pub participant_mode: ParticipantMode,
    pub context_fields: Vec<String>,
    pub symmetric: bool,
    pub family: Option<String>,
}
impl Definition {
    pub fn version(&self) -> Result<[u8; 32]> {
        Ok(Sha256::digest(serde_json::to_vec(self).map_err(|_| Error::Format)?).into())
    }
}
#[derive(Clone, Debug)]
pub struct Resolved {
    pub choice: String,
    pub reverse: bool,
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
fn parse() -> std::result::Result<BTreeMap<String, Resolved>, String> {
    let catalog: Catalogue = serde_json::from_str(include_str!("predicate-catalog-v1.json"))
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
            || c.category_ids.iter().any(|id| !categories.contains(id))
            || !matches!(c.orientation.as_str(), "forward" | "reverse")
            || !matches!(c.symmetry.as_str(), "symmetric" | "not asserted")
            || c.aliases.iter().any(|a| a.is_empty())
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
pub fn resolve(choice: &str) -> Result<Resolved> {
    static CATALOGUE: std::sync::OnceLock<std::result::Result<BTreeMap<String, Resolved>, String>> =
        std::sync::OnceLock::new();
    let catalogue = CATALOGUE
        .get_or_init(parse)
        .as_ref()
        .map_err(|_| Error::Format)?;
    catalogue.get(choice).cloned().ok_or(Error::Invalid)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn shared_registry_preserves_all_choices_and_normalized_identity_including_equivalence() {
        let catalog = parse().unwrap();
        assert_eq!(catalog.len(), 244);
        let canonical: std::collections::BTreeSet<_> = catalog
            .values()
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
