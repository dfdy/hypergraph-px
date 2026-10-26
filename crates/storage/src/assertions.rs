// SPDX-License-Identifier: AGPL-3.0-only
//! Versioned retrospective assertion overlays. Text snapshots are never modified.
use super::*;
use hypergraph_domain::assertion as domain;
use std::collections::BTreeSet;
pub const DEFINITION: i32 = 12;
pub const REVISION_KIND: i32 = 13;
pub const HEAD_KIND: i32 = 14;
pub const OVERLAY: i32 = 15;
pub const DEFINITIONS: i32 = 16;
pub const MAX_ASSERTIONS: usize = 1024;
pub const MAX_PAGE: usize = 8;
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Status {
    Proposed,
    Accepted,
    Rejected,
    Superseded,
}
impl Status {
    fn domain(&self) -> domain::ReviewState {
        match self {
            Self::Proposed => domain::ReviewState::Proposed,
            Self::Accepted => domain::ReviewState::Accepted,
            Self::Rejected => domain::ReviewState::Rejected,
            Self::Superseded => domain::ReviewState::Superseded,
        }
    }
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Certainty {
    Unspecified,
    Possible,
    Probable,
    Certain,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Properties {
    pub negated: bool,
    pub certainty: Certainty,
    pub attribution: String,
    pub scope: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum Predicate {
    Registered {
        choice: String,
    },
    Declared {
        label: String,
        description: String,
        roles: Vec<predicates::Role>,
    },
    Pinned {
        object: [u8; 32],
    },
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Input {
    pub role: String,
    pub source: clipboard::Source,
    pub expected_draft: Option<clipboard::DraftContext>,
    pub quote: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Participant {
    pub role: String,
    pub source: clipboard::Source,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case", deny_unknown_fields)]
pub enum Mutation {
    Create {
        predicate: Predicate,
        participants: Vec<Input>,
        properties: Properties,
    },
    Review {
        #[serde(with = "encoding::identity")]
        node: NodeId,
        #[serde(with = "encoding::identity")]
        revision: RevisionId,
        generation: u64,
        status: Status,
    },
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DefinitionRecord {
    pub version: [u8; 32],
    pub definition: predicates::Definition,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AssertionRevision {
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::optional_identity")]
    pub parent: Option<RevisionId>,
    pub definition: [u8; 32],
    pub participants: Vec<Participant>,
    pub properties: Properties,
    pub status: Status,
    #[serde(with = "encoding::identity")]
    pub proposer: PrincipalId,
    #[serde(with = "encoding::identity")]
    pub actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    pub device: DeviceId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Head {
    #[serde(with = "encoding::identity")]
    owner: PrincipalId,
    #[serde(with = "encoding::identity")]
    node: NodeId,
    #[serde(with = "encoding::identity")]
    revision: RevisionId,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Indexed {
    #[serde(with = "encoding::identity")]
    node: NodeId,
    identity: [u8; 32],
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Index {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    assertions: Vec<Indexed>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct DefinitionEntry {
    version: [u8; 32],
    object: [u8; 32],
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct DefinitionIndex {
    #[serde(with = "encoding::identity")]
    owner: PrincipalId,
    entries: Vec<DefinitionEntry>,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Change {
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    pub generation: u64,
    pub status: Status,
    pub deduplicated: bool,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Entry {
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    pub generation: u64,
    pub record: AssertionRevision,
    pub definition: DefinitionRecord,
}
#[derive(Serialize)]
pub struct Page {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    pub text_snapshot_scope: &'static str,
    pub generation: u64,
    pub total: usize,
    pub entries: Vec<Entry>,
    pub next: Option<usize>,
}
fn valid_properties(p: &Properties) -> Result<()> {
    if p.attribution.encode_utf16().count() > 200
        || p.scope.encode_utf16().count() > 500
        || p.attribution.trim() != p.attribution
        || p.scope.trim() != p.scope
    {
        return Err(Error::Invalid);
    }
    Ok(())
}
fn valid_definition(d: &predicates::Definition) -> Result<()> {
    if d.registry_version != 1
        || d.predicate_id.is_empty()
        || d.predicate_id.len() > 256
        || d.label.trim().is_empty()
        || d.label.chars().count() > 80
        || d.description.trim().is_empty()
        || d.description.len() > 8192
        || d.roles.is_empty()
        || d.roles.len() > domain::MAX_PARTICIPANTS
        || d.context_fields.len() > 16
    {
        return Err(Error::Invalid);
    }
    let mut roles = BTreeSet::new();
    for r in &d.roles {
        if r.id.is_empty()
            || r.id.len() > 64
            || r.id.trim() != r.id
            || r.label.is_empty()
            || r.label.len() > 512
            || !roles.insert(&r.id)
        {
            return Err(Error::Invalid);
        }
    }
    if d.participant_mode == predicates::ParticipantMode::Binary
        && (d.roles.len() != 2 || d.roles[0].id != "source" || d.roles[1].id != "target")
    {
        return Err(Error::Invalid);
    }
    Ok(())
}
pub(super) fn validate(m: &Mutation) -> Result<()> {
    match m {
        Mutation::Create {
            predicate,
            participants,
            properties,
        } => {
            valid_properties(properties)?;
            if !(2..=domain::MAX_PARTICIPANTS).contains(&participants.len()) {
                return Err(Error::Invalid);
            }
            let mut bytes = 0usize;
            for p in participants {
                clipboard::validate_capture(&p.source, p.expected_draft.as_ref(), &p.quote)?;
                bytes = bytes.checked_add(p.quote.len()).ok_or(Error::Limit)?;
                if bytes > domain::MAX_QUOTED_BYTES {
                    return Err(Error::Limit);
                }
            }
            match predicate {
                Predicate::Registered { choice } => {
                    predicates::resolve(choice)?;
                }
                Predicate::Declared {
                    label,
                    description,
                    roles,
                } => {
                    valid_definition(&predicates::Definition {
                        predicate_id: "local:declared:validation".into(),
                        registry_version: 1,
                        label: label.clone(),
                        description: description.clone(),
                        roles: roles.clone(),
                        participant_mode: predicates::ParticipantMode::RoleLabelled,
                        context_fields: vec![],
                        symmetric: false,
                        family: None,
                    })?;
                }
                Predicate::Pinned { .. } => {}
            }
        }
        Mutation::Review {
            generation, status, ..
        } => {
            if *generation > i64::MAX as u64 || *status == Status::Proposed {
                return Err(Error::Invalid);
            }
        }
    }
    Ok(())
}
fn read_definition(cipher: &Cipher<'_>, db: &Connection, id: [u8; 32]) -> Result<DefinitionRecord> {
    let record: DefinitionRecord = cipher.object(db, DEFINITION, id)?;
    valid_definition(&record.definition).map_err(|_| Error::Integrity)?;
    if record.version != record.definition.version()? {
        return Err(Error::Integrity);
    }
    Ok(record)
}
fn capture_definition(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
    definition: predicates::Definition,
) -> Result<[u8; 32]> {
    valid_definition(&definition)?;
    let version = definition.version()?;
    let loaded = cipher.slot::<DefinitionIndex>(db, DEFINITIONS, ROOT);
    let (exists, generation, mut index) = match loaded {
        Ok((g, index)) => (true, g, index),
        Err(Error::NotFound) => (
            false,
            0,
            DefinitionIndex {
                owner,
                entries: vec![],
            },
        ),
        Err(e) => return Err(e),
    };
    if index.owner != owner || index.entries.len() > MAX_ASSERTIONS {
        return Err(Error::Integrity);
    }
    let mut versions = BTreeSet::new();
    let mut objects = BTreeSet::new();
    if index
        .entries
        .iter()
        .any(|entry| !versions.insert(entry.version) || !objects.insert(entry.object))
    {
        return Err(Error::Integrity);
    }
    if let Some(entry) = index.entries.iter().find(|e| e.version == version) {
        if read_definition(cipher, db, entry.object)?.definition != definition {
            return Err(Error::Integrity);
        }
        return Ok(entry.object);
    }
    if index.entries.len() == MAX_ASSERTIONS {
        return Err(Error::Limit);
    }
    let object = new_id()?;
    cipher.insert(
        db,
        DEFINITION,
        object,
        &DefinitionRecord {
            version,
            definition,
        },
    )?;
    index.entries.push(DefinitionEntry { version, object });
    if exists {
        cipher.update(db, DEFINITIONS, ROOT, generation, &index)?;
    } else {
        cipher.new_slot(db, DEFINITIONS, ROOT, &index)?;
    }
    Ok(object)
}
fn index(cipher: &Cipher<'_>, db: &Connection, document: DocumentId) -> Result<(bool, u64, Index)> {
    let (exists, generation, index) = match cipher.slot::<Index>(db, OVERLAY, document.0) {
        Ok((g, index)) => (true, g, index),
        Err(Error::NotFound) => (
            false,
            0,
            Index {
                document,
                assertions: vec![],
            },
        ),
        Err(e) => return Err(e),
    };
    let mut nodes = BTreeSet::new();
    if index.document != document
        || index.assertions.len() > MAX_ASSERTIONS
        || index
            .assertions
            .iter()
            .any(|entry| !nodes.insert(entry.node.0))
    {
        return Err(Error::Integrity);
    }
    Ok((exists, generation, index))
}
fn update_index(
    cipher: &Cipher<'_>,
    db: &Connection,
    exists: bool,
    generation: u64,
    index: &Index,
) -> Result<()> {
    if !exists {
        cipher.new_slot(
            db,
            OVERLAY,
            index.document.0,
            &Index {
                document: index.document,
                assertions: vec![],
            },
        )?;
    }
    cipher.update(db, OVERLAY, index.document.0, generation, index)?;
    Ok(())
}
pub(super) fn read_entry(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
    node: NodeId,
) -> Result<Entry> {
    let (generation, head): (_, Head) = cipher.slot(db, HEAD_KIND, node.0)?;
    if head.owner != owner || head.node != node {
        return Err(Error::Integrity);
    }
    let entry = revision_entry(cipher, db, owner, node, head.revision)?;
    if entry.generation != generation {
        return Err(Error::Integrity);
    }
    Ok(entry)
}
fn revision_entry(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
    node: NodeId,
    revision: RevisionId,
) -> Result<Entry> {
    let record: AssertionRevision = cipher.object(db, REVISION_KIND, revision.0)?;
    if record.node != node
        || record.actor != owner
        || record.proposer != owner
        || record.parent == Some(revision)
    {
        return Err(Error::Integrity);
    }
    valid_properties(&record.properties).map_err(|_| Error::Integrity)?;
    let definition = read_definition(cipher, db, record.definition)?;
    if !(2..=domain::MAX_PARTICIPANTS).contains(&record.participants.len())
        || definition
            .definition
            .roles
            .iter()
            .any(|r| !record.participants.iter().any(|p| p.role == r.id))
        || record.participants.iter().any(|p| {
            !definition.definition.roles.iter().any(|r| r.id == p.role)
                || p.source.start_byte >= p.source.end_byte
        })
    {
        return Err(Error::Integrity);
    }
    let mut quoted = 0usize;
    for participant in &record.participants {
        quoted = quoted
            .checked_add(participant.source.end_byte - participant.source.start_byte)
            .ok_or(Error::Integrity)?;
    }
    if quoted > domain::MAX_QUOTED_BYTES {
        return Err(Error::Integrity);
    }
    if definition.definition.participant_mode == predicates::ParticipantMode::Binary
        && (record.participants.len() != 2
            || record.participants[0].role != "source"
            || record.participants[1].role != "target")
    {
        return Err(Error::Integrity);
    }
    let receipt: StoredReceipt = cipher.object(db, RECEIPT, record.operation.0)?;
    let generation = match receipt.receipt.outcome {
        Outcome::Assertion { state }
            if receipt.receipt.operation == record.operation
                && state.node == node
                && state.revision == revision
                && state.status == record.status
                && !state.deduplicated =>
        {
            state.generation
        }
        _ => return Err(Error::Integrity),
    };
    if let Some(parent) = record.parent {
        let previous: AssertionRevision = cipher.object(db, REVISION_KIND, parent.0)?;
        let previous_receipt: StoredReceipt = cipher.object(db, RECEIPT, previous.operation.0)?;
        let previous_generation = match previous_receipt.receipt.outcome {
            Outcome::Assertion { state }
                if previous_receipt.receipt.operation == previous.operation
                    && state.node == node
                    && state.revision == parent
                    && state.status == previous.status
                    && !state.deduplicated =>
            {
                state.generation
            }
            _ => return Err(Error::Integrity),
        };
        if generation != previous_generation.checked_add(1).ok_or(Error::Integrity)?
            || previous.node != node
            || previous.actor != owner
            || previous.definition != record.definition
            || previous.participants != record.participants
            || previous.properties != record.properties
            || previous.proposer != record.proposer
            || domain::review(previous.status.domain(), record.status.domain()).is_err()
        {
            return Err(Error::Integrity);
        }
    } else if generation != 0
        || record.status != Status::Proposed
        || record.proposer != record.actor
    {
        return Err(Error::Integrity);
    }
    Ok(Entry {
        revision,
        generation,
        record,
        definition,
    })
}
pub(super) fn check_indices(cipher: &Cipher<'_>, db: &Connection, entry: &Entry) -> Result<()> {
    let fingerprint = identity(
        &entry.definition,
        &entry.record.participants,
        &entry.record.properties,
    )?;
    for document in documents(&entry.record.participants) {
        let (exists, _, index) = index(cipher, db, document)?;
        if !exists
            || !index
                .assertions
                .iter()
                .any(|item| item.node == entry.record.node && item.identity == fingerprint)
        {
            return Err(Error::Integrity);
        }
    }
    Ok(())
}
fn identity(
    definition: &DefinitionRecord,
    participants: &[Participant],
    properties: &Properties,
) -> Result<[u8; 32]> {
    Ok(Sha256::digest(
        serde_json::to_vec(&(definition.version, participants, properties))
            .map_err(|_| Error::Format)?,
    )
    .into())
}
fn documents(participants: &[Participant]) -> BTreeSet<DocumentId> {
    participants.iter().map(|p| p.source.document).collect()
}
#[allow(clippy::too_many_arguments)]
pub(super) fn apply(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
    device: DeviceId,
    operation: OperationId,
    mutation: Mutation,
    checkpoint: &mut impl FnMut(&str) -> Result<()>,
) -> Result<Change> {
    let (_, catalog): (_, Catalog) = cipher.slot(db, CATALOG, ROOT)?;
    if catalog.owner != owner || catalog.device != device {
        return Err(Error::Integrity);
    }
    match mutation {
        Mutation::Create {
            predicate,
            mut participants,
            properties,
        } => {
            let (definition, reverse) = match predicate {
                Predicate::Registered { choice } => {
                    let resolved = predicates::resolve(&choice)?;
                    (resolved.definition, resolved.reverse)
                }
                Predicate::Declared {
                    label,
                    description,
                    roles,
                } => (
                    predicates::Definition {
                        predicate_id: format!("local:declared:{}", hex_id(new_id()?)),
                        registry_version: 1,
                        label,
                        description,
                        roles,
                        participant_mode: predicates::ParticipantMode::RoleLabelled,
                        context_fields: vec![],
                        symmetric: false,
                        family: None,
                    },
                    false,
                ),
                Predicate::Pinned { object } => {
                    (read_definition(cipher, db, object)?.definition, false)
                }
            };
            if definition.participant_mode == predicates::ParticipantMode::Binary {
                if participants.len() != 2
                    || participants.iter().filter(|p| p.role == "source").count() != 1
                    || participants.iter().filter(|p| p.role == "target").count() != 1
                {
                    return Err(Error::Invalid);
                }
                participants.sort_by_key(|p| if p.role == "source" { 0 } else { 1 });
                let source_key =
                    serde_json::to_vec(&participants[0].source).map_err(|_| Error::Format)?;
                let target_key =
                    serde_json::to_vec(&participants[1].source).map_err(|_| Error::Format)?;
                let order =
                    domain::binary_order(reverse, definition.symmetric, &source_key, &target_key);
                if order[0] == 1 {
                    participants.swap(0, 1);
                }
                participants[0].role = "source".into();
                participants[1].role = "target".into();
            }
            let node = NodeId(new_id()?);
            let mut revisions = Vec::new();
            let mut anchors = Vec::new();
            for p in &participants {
                let (_, revision) = clipboard::capture_source(
                    cipher,
                    db,
                    &catalog,
                    owner,
                    device,
                    &p.source,
                    p.expected_draft.as_ref(),
                    &p.quote,
                )?;
                revisions.push(revision);
                anchors.push(Anchor {
                    revision: p.source.revision,
                    occurrence_path: p.source.occurrence_path.clone(),
                    start_byte: p.source.start_byte,
                    end_byte: p.source.end_byte,
                });
            }
            let planned: Vec<_> = participants
                .iter()
                .zip(&revisions)
                .zip(&anchors)
                .map(|((p, r), a)| domain::Participant {
                    role: &p.role,
                    node: r.node,
                    revision: p.source.revision,
                    path: &p.source.occurrence_path,
                    text: &r.text,
                    anchor: a,
                    quote: &p.quote,
                })
                .collect();
            domain::validate(
                node,
                &definition
                    .roles
                    .iter()
                    .map(|r| r.id.as_str())
                    .collect::<Vec<_>>(),
                &planned,
            )
            .map_err(|_| Error::Invalid)?;
            let definition = capture_definition(cipher, db, owner, definition)?;
            let captured = read_definition(cipher, db, definition)?;
            let participants: Vec<_> = participants
                .into_iter()
                .map(|p| Participant {
                    role: p.role,
                    source: p.source,
                })
                .collect();
            let fingerprint = identity(&captured, &participants, &properties)?;
            let docs = documents(&participants);
            let first = *docs.first().ok_or(Error::Invalid)?;
            let (_, _, initial) = index(cipher, db, first)?;
            if let Some(prior) = initial
                .assertions
                .iter()
                .find(|e| e.identity == fingerprint)
            {
                let entry = read_entry(cipher, db, owner, prior.node)?;
                if entry.record.participants != participants
                    || entry.record.properties != properties
                    || entry.definition.version != captured.version
                {
                    return Err(Error::Integrity);
                }
                check_indices(cipher, db, &entry)?;
                return Ok(Change {
                    node: prior.node,
                    revision: entry.revision,
                    generation: entry.generation,
                    status: entry.record.status,
                    deduplicated: true,
                });
            }
            let revision = RevisionId(new_id()?);
            let record = AssertionRevision {
                node,
                parent: None,
                definition,
                participants,
                properties,
                status: Status::Proposed,
                proposer: owner,
                actor: owner,
                device,
                operation,
            };
            cipher.insert(db, REVISION_KIND, revision.0, &record)?;
            checkpoint("objects")?;
            cipher.new_slot(
                db,
                HEAD_KIND,
                node.0,
                &Head {
                    owner,
                    node,
                    revision,
                },
            )?;
            for doc in docs {
                let (exists, generation, mut idx) = index(cipher, db, doc)?;
                if idx.assertions.len() == MAX_ASSERTIONS {
                    return Err(Error::Limit);
                }
                idx.assertions.push(Indexed {
                    node,
                    identity: fingerprint,
                });
                update_index(cipher, db, exists, generation, &idx)?;
            }
            checkpoint("assertions")?;
            Ok(Change {
                node,
                revision,
                generation: 0,
                status: Status::Proposed,
                deduplicated: false,
            })
        }
        Mutation::Review {
            node,
            revision,
            generation,
            status,
        } => {
            let entry = read_entry(cipher, db, owner, node)?;
            if entry.revision != revision || entry.generation != generation {
                return Err(Error::Conflict);
            }
            domain::review(entry.record.status.domain(), status.domain())
                .map_err(|_| Error::Conflict)?;
            check_indices(cipher, db, &entry)?;
            let docs = documents(&entry.record.participants);
            for p in &entry.record.participants {
                clipboard::resolve_source(cipher, db, &catalog, &p.source)?;
            }
            let next = RevisionId(new_id()?);
            let record = AssertionRevision {
                parent: Some(revision),
                status: status.clone(),
                actor: owner,
                device,
                operation,
                ..entry.record
            };
            cipher.insert(db, REVISION_KIND, next.0, &record)?;
            checkpoint("objects")?;
            let next_generation = cipher.update(
                db,
                HEAD_KIND,
                node.0,
                generation,
                &Head {
                    owner,
                    node,
                    revision: next,
                },
            )?;
            for doc in docs {
                let (exists, g, idx) = index(cipher, db, doc)?;
                if !exists || !idx.assertions.iter().any(|e| e.node == node) {
                    return Err(Error::Integrity);
                }
                update_index(cipher, db, true, g, &idx)?;
            }
            checkpoint("assertions")?;
            Ok(Change {
                node,
                revision: next,
                generation: next_generation,
                status,
                deduplicated: false,
            })
        }
    }
}
fn hex_id(id: [u8; 32]) -> String {
    id.iter().map(|b| format!("{b:02x}")).collect()
}
impl Workspace {
    pub fn assertion_revision(&mut self, node: NodeId, revision: RevisionId) -> Result<Entry> {
        let tx = self.db.transaction()?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        let (current_generation, head): (_, Head) = cipher.slot(&tx, HEAD_KIND, node.0)?;
        if head.owner != self.owner || head.node != node {
            return Err(Error::Integrity);
        }
        let entry = revision_entry(&cipher, &tx, self.owner, node, revision)?;
        if entry.generation > current_generation {
            return Err(Error::Integrity);
        }
        check_indices(&cipher, &tx, &entry)?;
        for participant in &entry.record.participants {
            clipboard::resolve_source(&cipher, &tx, &catalog, &participant.source)?;
        }
        tx.commit()?;
        Ok(entry)
    }
    pub fn assertion_page(
        &mut self,
        document: DocumentId,
        snapshot: SnapshotId,
        generation: Option<u64>,
        offset: usize,
        limit: usize,
    ) -> Result<Page> {
        if !(1..=MAX_PAGE).contains(&limit)
            || offset > MAX_ASSERTIONS
            || offset > 0 && generation.is_none()
        {
            return Err(Error::Invalid);
        }
        let tx = self.db.transaction()?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        if !catalog.documents.contains(&document) {
            return Err(Error::NotFound);
        }
        let doc: Document = cipher.object(&tx, DOCUMENT, document.0)?;
        if doc.id != document {
            return Err(Error::Integrity);
        }
        snapshot_revision(&cipher, &tx, &doc, snapshot)?;
        let (_, actual, index) = index(&cipher, &tx, document)?;
        if generation.is_some_and(|g| g != actual) {
            return Err(Error::Conflict);
        }
        if offset > index.assertions.len() {
            return Err(Error::Invalid);
        }
        let mut entries = Vec::new();
        for indexed in index.assertions.iter().skip(offset).take(limit) {
            let entry = read_entry(&cipher, &tx, self.owner, indexed.node)?;
            check_indices(&cipher, &tx, &entry)?;
            if identity(
                &entry.definition,
                &entry.record.participants,
                &entry.record.properties,
            )? != indexed.identity
                || !entry
                    .record
                    .participants
                    .iter()
                    .any(|p| p.source.document == document)
            {
                return Err(Error::Integrity);
            }
            if !(2..=domain::MAX_PARTICIPANTS).contains(&entry.record.participants.len()) {
                return Err(Error::Integrity);
            }
            for p in &entry.record.participants {
                clipboard::resolve_source(&cipher, &tx, &catalog, &p.source)?;
            }
            entries.push(entry);
        }
        let next = offset + entries.len();
        let total = index.assertions.len();
        tx.commit()?;
        Ok(Page {
            document,
            snapshot,
            text_snapshot_scope: "semantic_assertions_excluded",
            generation: actual,
            total,
            entries,
            next: (next < total).then_some(next),
        })
    }
}

#[cfg(test)]
pub(super) mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, op, save};
    pub(crate) fn create(editor: &EditorState) -> Mutation {
        let source = |start, end| clipboard::Source {
            document: editor.document,
            node: editor.node,
            snapshot: editor.snapshot,
            revision: editor.base,
            occurrence_path: vec![editor.occurrence],
            start_byte: start,
            end_byte: end,
        };
        let split = editor
            .text
            .char_indices()
            .nth(1)
            .map(|(i, _)| i)
            .unwrap_or(editor.text.len());
        Mutation::Create {
            predicate: Predicate::Registered {
                choice: "preview:logical-argumentative:is_equivalent_to".into(),
            },
            participants: vec![
                Input {
                    role: "source".into(),
                    source: source(0, split),
                    expected_draft: Some(clipboard::DraftContext {
                        generation: editor.generation,
                        sequence: editor.acknowledged_sequence,
                    }),
                    quote: editor.text[..split].into(),
                },
                Input {
                    role: "target".into(),
                    source: source(split, editor.text.len()),
                    expected_draft: Some(clipboard::DraftContext {
                        generation: editor.generation,
                        sequence: editor.acknowledged_sequence,
                    }),
                    quote: editor.text[split..].into(),
                },
            ],
            properties: Properties {
                negated: false,
                certainty: Certainty::Unspecified,
                attribution: String::new(),
                scope: String::new(),
            },
        }
    }
    fn setup() -> (Temp, Workspace, EditorState) {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = match ws
            .execute(
                op(1),
                Command::Create {
                    title: "Synthetic source".into(),
                    text: "One😀\r\nTwo e\u{301}.\rThree\n".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let editor = ws.open_document(doc).unwrap();
        (temp, ws, editor)
    }
    fn change(receipt: Receipt) -> Change {
        match receipt.outcome {
            Outcome::Assertion { state } => state,
            _ => panic!(),
        }
    }
    fn execute(ws: &mut Workspace, operation: u8, mutation: Mutation) -> Change {
        change(
            ws.execute(op(operation), Command::Assertion { mutation })
                .unwrap(),
        )
    }
    #[test]
    fn overlays_review_and_restart_preserve_text_snapshots_and_all_previous_judgements() {
        let (temp, mut ws, editor) = setup();
        let first = execute(&mut ws, 2, create(&editor));
        assert_eq!(first.status, Status::Proposed);
        let page = ws
            .assertion_page(editor.document, editor.snapshot, None, 0, 8)
            .unwrap();
        assert_eq!(page.text_snapshot_scope, "semantic_assertions_excluded");
        assert_eq!(page.generation, 1);
        assert_eq!(page.entries[0].record.participants.len(), 2);
        let accepted = execute(
            &mut ws,
            3,
            Mutation::Review {
                node: first.node,
                revision: first.revision,
                generation: 0,
                status: Status::Accepted,
            },
        );
        assert_eq!(accepted.generation, 1);
        let retry = execute(
            &mut ws,
            3,
            Mutation::Review {
                node: first.node,
                revision: first.revision,
                generation: 0,
                status: Status::Accepted,
            },
        );
        assert_eq!(retry, accepted);
        assert!(matches!(
            ws.assertion_page(editor.document, editor.snapshot, Some(1), 0, 8),
            Err(Error::Conflict)
        ));
        let rejected = execute(
            &mut ws,
            4,
            Mutation::Review {
                node: first.node,
                revision: accepted.revision,
                generation: 1,
                status: Status::Rejected,
            },
        );
        assert_eq!(rejected.generation, 2);
        let original: AssertionRevision = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        }
        .object(&ws.db, REVISION_KIND, first.revision.0)
        .unwrap();
        assert_eq!(original.status, Status::Proposed);
        assert!(original.parent.is_none());
        assert_eq!(
            ws.open_document(editor.document).unwrap().generation,
            editor.generation
        );
        assert_eq!(
            ws.reconstruct_snapshot(editor.document, editor.snapshot)
                .unwrap(),
            editor.text
        );
        assert_eq!(
            ws.history_page(editor.document, None, 8)
                .unwrap()
                .entries
                .len(),
            1
        );
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        let page = ws
            .assertion_page(editor.document, editor.snapshot, None, 0, 8)
            .unwrap();
        assert_eq!(page.generation, 3);
        assert_eq!(page.entries[0].record.status, Status::Rejected);
        assert_eq!(page.entries[0].record.parent, Some(accepted.revision));
        assert_eq!(page.entries[0].revision, rejected.revision);
    }
    #[test]
    fn inverse_and_symmetric_wordings_deduplicate_without_resetting_review_but_qualifiers_stay_distinct()
     {
        let (_temp, mut ws, editor) = setup();
        let mut forward = create(&editor);
        if let Mutation::Create { predicate, .. } = &mut forward {
            *predicate = Predicate::Registered {
                choice: "preview:ontological:constitutes".into(),
            };
        }
        let a = execute(&mut ws, 2, forward.clone());
        let reviewed = execute(
            &mut ws,
            3,
            Mutation::Review {
                node: a.node,
                revision: a.revision,
                generation: 0,
                status: Status::Accepted,
            },
        );
        let mut inverse = forward;
        if let Mutation::Create {
            predicate,
            participants,
            ..
        } = &mut inverse
        {
            *predicate = Predicate::Registered {
                choice: "preview:ontological:is_constituted_by".into(),
            };
            participants.swap(0, 1);
            participants[0].role = "source".into();
            participants[1].role = "target".into();
        }
        let b = execute(&mut ws, 4, inverse);
        assert_eq!(a.node, b.node);
        assert_eq!(b.revision, reviewed.revision);
        assert_eq!(b.status, Status::Accepted);
        assert!(b.deduplicated);
        let symmetric = create(&editor);
        let c = execute(&mut ws, 5, symmetric.clone());
        let mut reverse = symmetric.clone();
        if let Mutation::Create { participants, .. } = &mut reverse {
            participants.swap(0, 1);
            participants[0].role = "source".into();
            participants[1].role = "target".into();
        }
        assert_eq!(execute(&mut ws, 6, reverse).node, c.node);
        let mut qualified = symmetric;
        if let Mutation::Create { properties, .. } = &mut qualified {
            properties.certainty = Certainty::Possible;
        }
        assert_ne!(execute(&mut ws, 7, qualified).node, c.node);
    }
    #[test]
    fn declared_nary_roles_remain_one_entity_and_same_words_do_not_unify_new_declarations() {
        let (_temp, mut ws, editor) = setup();
        let mut request = create(&editor);
        if let Mutation::Create {
            predicate,
            participants,
            ..
        } = &mut request
        {
            *predicate = Predicate::Declared {
                label: "Supports under assumptions".into(),
                description: "An owner-declared contextual three-participant claim; no proof."
                    .into(),
                roles: vec![
                    predicates::Role {
                        id: "premise".into(),
                        label: "Premise".into(),
                    },
                    predicates::Role {
                        id: "conclusion".into(),
                        label: "Conclusion".into(),
                    },
                ],
            };
            participants[0].role = "premise".into();
            participants[1].role = "conclusion".into();
            let extra = participants[0].clone();
            participants.insert(1, extra);
        }
        let first = execute(&mut ws, 2, request.clone());
        let second = execute(&mut ws, 3, request);
        assert_ne!(first.node, second.node);
        let page = ws
            .assertion_page(editor.document, editor.snapshot, None, 0, 8)
            .unwrap();
        assert_eq!(page.entries[0].record.participants.len(), 3);
        assert_ne!(
            page.entries[0].definition.definition.predicate_id,
            page.entries[1].definition.definition.predicate_id
        );
        assert_ne!(
            page.entries[0].record.definition,
            page.entries[0].definition.version
        );
        assert_eq!(ws.list_documents().unwrap().len(), 1);
    }
    #[test]
    fn uncommitted_stale_and_wrong_quotes_reject_while_historical_overlay_pins_exact_old_source() {
        let (_temp, mut ws, editor) = setup();
        let mut wrong = create(&editor);
        if let Mutation::Create { participants, .. } = &mut wrong {
            participants[0].quote = "X".into();
        }
        assert!(matches!(
            ws.execute(op(9), Command::Assertion { mutation: wrong }),
            Err(Error::Conflict)
        ));
        ws.execute(op(2), save(&editor, "Changed😀\r\n")).unwrap();
        let draft = ws.open_document(editor.document).unwrap();
        assert!(matches!(
            ws.execute(
                op(3),
                Command::Assertion {
                    mutation: create(&draft)
                }
            ),
            Err(Error::Conflict)
        ));
        assert!(matches!(
            ws.execute(
                op(4),
                Command::Assertion {
                    mutation: create(&editor)
                }
            ),
            Err(Error::Conflict)
        ));
        assert_eq!(
            ws.db
                .query_row("SELECT count(*) FROM objects WHERE kind>=12", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            0
        );
        ws.execute(op(5), commit(&draft)).unwrap();
        let current = ws.open_document(editor.document).unwrap();
        let mut historical = create(&editor);
        if let Mutation::Create { participants, .. } = &mut historical {
            for p in participants {
                p.expected_draft = None;
            }
        }
        execute(&mut ws, 6, historical);
        let page = ws
            .assertion_page(editor.document, current.snapshot, None, 0, 8)
            .unwrap();
        assert_eq!(page.snapshot, current.snapshot);
        assert_eq!(
            page.entries[0].record.participants[0].source.snapshot,
            editor.snapshot
        );
        assert_eq!(
            ws.reconstruct_snapshot(editor.document, editor.snapshot)
                .unwrap(),
            editor.text
        );
    }
    #[test]
    fn creation_faults_are_atomic_and_unknown_commit_reply_replays_one_assertion() {
        for phase in ["objects", "assertions", "heads", "receipt", "committed"] {
            let (temp, mut ws, editor) = setup();
            let command = Command::Assertion {
                mutation: create(&editor),
            };
            assert!(matches!(
                ws.execute_inner(op(2), command.clone(), |p| if p == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                }),
                Err(Error::Io)
            ));
            assert_eq!(
                ws.assertion_page(editor.document, editor.snapshot, None, 0, 8)
                    .unwrap()
                    .total,
                if phase == "committed" { 1 } else { 0 }
            );
            drop(ws);
            let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
            let first = ws.execute(op(2), command.clone()).unwrap();
            assert_eq!(ws.execute(op(2), command).unwrap(), first);
            assert_eq!(
                ws.assertion_page(editor.document, editor.snapshot, None, 0, 8)
                    .unwrap()
                    .total,
                1
            );
        }
    }
    #[test]
    fn pagination_review_cursors_missing_source_and_future_records_fail_closed() {
        let (_temp, mut ws, editor) = setup();
        let first = execute(&mut ws, 2, create(&editor));
        let mut other = create(&editor);
        if let Mutation::Create { properties, .. } = &mut other {
            properties.negated = true;
        }
        execute(&mut ws, 3, other);
        let page = ws
            .assertion_page(editor.document, editor.snapshot, None, 0, 1)
            .unwrap();
        assert_eq!(page.next, Some(1));
        execute(
            &mut ws,
            4,
            Mutation::Review {
                node: first.node,
                revision: first.revision,
                generation: 0,
                status: Status::Accepted,
            },
        );
        assert!(matches!(
            ws.assertion_page(
                editor.document,
                editor.snapshot,
                Some(page.generation),
                1,
                1
            ),
            Err(Error::Conflict)
        ));
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let (g, idx): (_, Index) = cipher.slot(&ws.db, OVERLAY, editor.document.0).unwrap();
        let original_envelope = cipher.seal(OVERLAY, editor.document.0, g, &idx).unwrap();
        let raw = serde_json::to_vec(
            &serde_json::json!({"record_version":2,"record_kind":OVERLAY,"payload":idx}),
        )
        .unwrap();
        let sealed = ws
            .key
            .seal(cipher.context(OVERLAY, editor.document.0, g), &raw)
            .unwrap();
        ws.db
            .execute(
                "UPDATE slots SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![sealed, OVERLAY, editor.document.0.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.assertion_page(editor.document, editor.snapshot, None, 0, 8),
            Err(Error::Format)
        ));
        ws.db
            .execute(
                "UPDATE slots SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![original_envelope, OVERLAY, editor.document.0.as_slice()],
            )
            .unwrap();
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![REVISION, editor.base.0.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.assertion_page(editor.document, editor.snapshot, None, 0, 8),
            Err(Error::NotFound)
        ));
    }

    #[test]
    fn current_authority_and_changed_operation_reuse_guard_assertion_replay() {
        let (_temp, mut ws, editor) = setup();
        let mutation = create(&editor);
        execute(&mut ws, 2, mutation.clone());
        let owner = ws.owner;
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.execute(
                op(2),
                Command::Assertion {
                    mutation: mutation.clone()
                }
            ),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            ws.assertion_page(editor.document, editor.snapshot, None, 0, 8),
            Err(Error::Integrity)
        ));
        ws.owner = owner;
        let mut changed = mutation;
        if let Mutation::Create { properties, .. } = &mut changed {
            properties.negated = true;
        }
        assert!(matches!(
            ws.execute(op(2), Command::Assertion { mutation: changed }),
            Err(Error::Conflict)
        ));
    }
    #[test]
    fn cross_document_overlay_membership_is_consistent_for_reads_deduplication_and_review() {
        let (_temp, mut ws, first) = setup();
        let second_id = match ws
            .execute(
                op(2),
                Command::Create {
                    title: "Second".into(),
                    text: "Second exact source 😀".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let second = ws.open_document(second_id).unwrap();
        let mut mutation = create(&first);
        if let Mutation::Create { participants, .. } = &mut mutation {
            participants[1] = Input {
                role: "target".into(),
                source: clipboard::Source {
                    document: second.document,
                    node: second.node,
                    snapshot: second.snapshot,
                    revision: second.base,
                    occurrence_path: vec![second.occurrence],
                    start_byte: 0,
                    end_byte: second.text.len(),
                },
                expected_draft: Some(clipboard::DraftContext {
                    generation: second.generation,
                    sequence: second.acknowledged_sequence,
                }),
                quote: second.text.clone(),
            };
        }
        let created = execute(&mut ws, 3, mutation.clone());
        assert_eq!(
            ws.assertion_page(first.document, first.snapshot, None, 0, 8)
                .unwrap()
                .total,
            1
        );
        assert_eq!(
            ws.assertion_page(second.document, second.snapshot, None, 0, 8)
                .unwrap()
                .entries[0]
                .record
                .node,
            created.node
        );
        let secondary = first.document.max(second.document);
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let (g, mut idx): (_, Index) = cipher.slot(&ws.db, OVERLAY, secondary.0).unwrap();
        idx.assertions[0].identity = [0; 32];
        cipher
            .update(&ws.db, OVERLAY, secondary.0, g, &idx)
            .unwrap();
        assert!(matches!(
            ws.execute(op(4), Command::Assertion { mutation }),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            ws.execute(
                op(5),
                Command::Assertion {
                    mutation: Mutation::Review {
                        node: created.node,
                        revision: created.revision,
                        generation: 0,
                        status: Status::Accepted
                    }
                }
            ),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            ws.assertion_page(first.document, first.snapshot, None, 0, 8),
            Err(Error::Integrity)
        ));
    }
    #[test]
    fn exact_old_review_revisions_reconstruct_after_later_judgements_source_changes_and_restart() {
        let (temp, mut ws, source) = setup();
        let first = execute(&mut ws, 2, create(&source));
        let accepted = execute(
            &mut ws,
            3,
            Mutation::Review {
                node: first.node,
                revision: first.revision,
                generation: 0,
                status: Status::Accepted,
            },
        );
        execute(
            &mut ws,
            4,
            Mutation::Review {
                node: first.node,
                revision: accepted.revision,
                generation: 1,
                status: Status::Rejected,
            },
        );
        let proposed = ws.assertion_revision(first.node, first.revision).unwrap();
        assert_eq!(proposed.generation, 0);
        assert_eq!(proposed.record.status, Status::Proposed);
        assert!(proposed.record.parent.is_none());
        ws.execute(op(5), save(&source, "New unrelated source"))
            .unwrap();
        let draft = ws.open_document(source.document).unwrap();
        ws.execute(op(6), commit(&draft)).unwrap();
        let historical = ws
            .assertion_revision(first.node, accepted.revision)
            .unwrap();
        assert_eq!(historical.record.status, Status::Accepted);
        assert_eq!(historical.record.parent, Some(first.revision));
        assert_eq!(historical.record.participants, proposed.record.participants);
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(
            ws.assertion_revision(first.node, accepted.revision)
                .unwrap()
                .record,
            historical.record
        );
        assert_eq!(
            ws.open_document(source.document).unwrap().text,
            "New unrelated source"
        );
    }
    #[test]
    fn history_ids_do_not_grant_current_scope_or_allow_a_revision_from_another_assertion() {
        let (_temp, mut ws, source) = setup();
        let first = execute(&mut ws, 2, create(&source));
        let mut other = create(&source);
        if let Mutation::Create { properties, .. } = &mut other {
            properties.negated = true;
        }
        let second = execute(&mut ws, 3, other);
        assert!(matches!(
            ws.assertion_revision(first.node, second.revision),
            Err(Error::Integrity)
        ));
        let owner = ws.owner;
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.assertion_revision(first.node, first.revision),
            Err(Error::Integrity)
        ));
        ws.owner = owner;
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let (g, mut catalog): (_, Catalog) = cipher.slot(&ws.db, CATALOG, ROOT).unwrap();
        catalog.documents.clear();
        cipher.update(&ws.db, CATALOG, ROOT, g, &catalog).unwrap();
        assert!(matches!(
            ws.assertion_revision(first.node, first.revision),
            Err(Error::NotFound)
        ));
    }
    #[test]
    fn missing_historical_publication_receipts_never_fall_back_to_the_current_judgement() {
        let (_temp, mut ws, source) = setup();
        let first = execute(&mut ws, 2, create(&source));
        execute(
            &mut ws,
            3,
            Mutation::Review {
                node: first.node,
                revision: first.revision,
                generation: 0,
                status: Status::Accepted,
            },
        );
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![RECEIPT, op(2).0.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.assertion_revision(first.node, first.revision),
            Err(Error::NotFound)
        ));
    }
}
