// SPDX-License-Identifier: AGPL-3.0-only
//! Encrypted SQLite local writer. Unlock grants the sole local workspace owner's
//! authority, not a network session. No client-held mode or multi-owner edits.
use hypergraph_crypto::{Context, Purpose, SecretKey};
use hypergraph_domain::records::*;
use rusqlite::{Connection, OpenFlags, OptionalExtension, TransactionBehavior, params};
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use sha2::{Digest, Sha256};
use std::{path::Path, time::Duration};
use zeroize::Zeroizing;

pub const APPLICATION_ID: i32 = 0x48505831;
pub const SCHEMA_VERSION: i32 = 1;
pub const MAX_TEXT_BYTES: usize = 2 * 1024 * 1024;
const ROOT: [u8; 32] = [0; 32];
const CATALOG: i32 = 1;
const DOCUMENT: i32 = 2;
const MANIFEST: i32 = 3;
const REVISION: i32 = 4;
const SNAPSHOT: i32 = 5;
const HEAD: i32 = 6;
const DRAFT: i32 = 7;
const RECEIPT: i32 = 8;
const EVENT: i32 = 9;

/// Deliberately contains no SQL text, document source, passphrase or crypto key.
#[derive(Debug)]
pub enum Error {
    Io,
    Database,
    Crypto,
    Format,
    Integrity,
    NotFound,
    Conflict,
    Limit,
    Invalid,
}
pub type Result<T> = std::result::Result<T, Error>;
impl From<rusqlite::Error> for Error {
    fn from(error: rusqlite::Error) -> Self {
        #[cfg(test)]
        eprintln!("SQLite diagnostic: {error:?}");
        #[cfg(not(test))]
        let _ = error;
        Self::Database
    }
}
impl From<hypergraph_crypto::Error> for Error {
    fn from(_: hypergraph_crypto::Error) -> Self {
        Self::Crypto
    }
}
impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{self:?}")
    }
}
impl std::error::Error for Error {}

/// Generate an opaque ID at the I/O boundary, never in the pure domain model.
pub fn new_id() -> Result<[u8; 32]> {
    let mut id = [0; 32];
    getrandom::fill(&mut id).map_err(|_| Error::Crypto)?;
    Ok(id)
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Catalog {
    owner: PrincipalId,
    device: DeviceId,
    owner_label: String,
    documents: Vec<DocumentId>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Document {
    id: DocumentId,
    node: NodeId,
    branch: BranchId,
    manifest: ManifestId,
    occurrence: OccurrenceId,
    draft: DraftId,
    title: String,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Manifest {
    document: DocumentId,
    occurrence: OccurrenceId,
    node: NodeId,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Revision {
    node: NodeId,
    parent: Option<RevisionId>,
    text: String,
    operation: OperationId,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Snapshot {
    document: DocumentId,
    manifest: ManifestId,
    bindings: Vec<SnapshotBinding>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Head {
    document: DocumentId,
    revision: RevisionId,
    snapshot: SnapshotId,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Draft {
    document: DocumentId,
    branch: BranchId,
    base: RevisionId,
    actor: PrincipalId,
    device: DeviceId,
    sequence: u64,
    text: String,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Event {
    operation: OperationId,
    actor: PrincipalId,
    device: DeviceId,
    document: DocumentId,
    parent: Option<RevisionId>,
    revision: RevisionId,
    snapshot: SnapshotId,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "command", rename_all = "snake_case", deny_unknown_fields)]
pub enum Command {
    Create {
        title: String,
        text: String,
    },
    Save {
        document: DocumentId,
        generation: u64,
        base: RevisionId,
        previous_sequence: u64,
        sequence: u64,
        text: String,
    },
    Commit {
        document: DocumentId,
        generation: u64,
        base: RevisionId,
        sequence: u64,
    },
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "result", rename_all = "snake_case", deny_unknown_fields)]
pub enum Outcome {
    Created {
        document: DocumentId,
    },
    Saved {
        document: DocumentId,
        generation: u64,
        sequence: u64,
    },
    Committed {
        document: DocumentId,
        generation: u64,
        sequence: u64,
        revision: RevisionId,
        snapshot: SnapshotId,
    },
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Receipt {
    pub operation: OperationId,
    pub outcome: Outcome,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct StoredReceipt {
    digest: [u8; 32],
    receipt: Receipt,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DocumentSummary {
    pub document: DocumentId,
    pub title: String,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EditorState {
    pub document: DocumentId,
    pub node: NodeId,
    pub branch: BranchId,
    pub manifest: ManifestId,
    pub occurrence: OccurrenceId,
    pub draft: DraftId,
    pub title: String,
    pub generation: u64,
    pub acknowledged_sequence: u64,
    pub base: RevisionId,
    pub snapshot: SnapshotId,
    pub text: String,
}

struct Cipher<'a> {
    key: &'a SecretKey,
    workspace: [u8; 16],
}
impl Cipher<'_> {
    fn context(&self, kind: i32, id: [u8; 32], generation: u64) -> Context {
        let mut hash = Sha256::new();
        hash.update(b"hpx/sqlite/record/v1\0");
        hash.update(kind.to_be_bytes());
        hash.update(id);
        hash.update(generation.to_be_bytes());
        let purpose = match kind {
            REVISION => Purpose::Revision,
            MANIFEST => Purpose::Manifest,
            SNAPSHOT => Purpose::Snapshot,
            DRAFT => Purpose::Draft,
            _ => Purpose::Index,
        };
        Context {
            workspace: self.workspace,
            binding: hash.finalize().into(),
            purpose,
            epoch: 1,
        }
    }
    fn seal<T: Serialize>(
        &self,
        kind: i32,
        id: [u8; 32],
        generation: u64,
        value: &T,
    ) -> Result<Vec<u8>> {
        let bytes = Zeroizing::new(serde_json::to_vec(value).map_err(|_| Error::Format)?);
        Ok(self.key.seal(self.context(kind, id, generation), &bytes)?)
    }
    fn open<T: DeserializeOwned>(
        &self,
        kind: i32,
        id: [u8; 32],
        generation: u64,
        envelope: &[u8],
    ) -> Result<T> {
        let bytes = self
            .key
            .open(self.context(kind, id, generation), envelope)?;
        serde_json::from_slice(&bytes).map_err(|_| Error::Integrity)
    }
    fn object<T: DeserializeOwned>(&self, db: &Connection, kind: i32, id: [u8; 32]) -> Result<T> {
        let bytes: Vec<u8> = db
            .query_row(
                "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
                params![kind, id.as_slice()],
                |r| r.get(0),
            )
            .optional()?
            .ok_or(Error::NotFound)?;
        self.open(kind, id, 0, &bytes)
    }
    fn insert<T: Serialize>(
        &self,
        db: &Connection,
        kind: i32,
        id: [u8; 32],
        value: &T,
    ) -> Result<()> {
        let bytes = self.seal(kind, id, 0, value)?;
        db.execute(
            "INSERT INTO objects(kind,id,envelope) VALUES (?1,?2,?3)",
            params![kind, id.as_slice(), bytes],
        )?;
        Ok(())
    }
    fn slot<T: DeserializeOwned>(
        &self,
        db: &Connection,
        kind: i32,
        id: [u8; 32],
    ) -> Result<(u64, T)> {
        let (generation, bytes): (i64, Vec<u8>) = db
            .query_row(
                "SELECT generation,envelope FROM slots WHERE kind=?1 AND id=?2",
                params![kind, id.as_slice()],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .optional()?
            .ok_or(Error::NotFound)?;
        let generation = u64::try_from(generation).map_err(|_| Error::Integrity)?;
        Ok((generation, self.open(kind, id, generation, &bytes)?))
    }
    fn new_slot<T: Serialize>(
        &self,
        db: &Connection,
        kind: i32,
        id: [u8; 32],
        value: &T,
    ) -> Result<()> {
        let bytes = self.seal(kind, id, 0, value)?;
        db.execute(
            "INSERT INTO slots(kind,id,generation,envelope) VALUES (?1,?2,0,?3)",
            params![kind, id.as_slice(), bytes],
        )?;
        Ok(())
    }
    fn update<T: Serialize>(
        &self,
        db: &Connection,
        kind: i32,
        id: [u8; 32],
        expected: u64,
        value: &T,
    ) -> Result<u64> {
        let next = expected
            .checked_add(1)
            .filter(|n| *n <= i64::MAX as u64)
            .ok_or(Error::Limit)?;
        let bytes = self.seal(kind, id, next, value)?;
        let count = db.execute(
            "UPDATE slots SET generation=?1,envelope=?2 WHERE kind=?3 AND id=?4 AND generation=?5",
            params![next as i64, bytes, kind, id.as_slice(), expected as i64],
        )?;
        if count != 1 {
            return Err(Error::Conflict);
        }
        Ok(next)
    }
}

pub struct Workspace {
    db: Connection,
    key: SecretKey,
    workspace: [u8; 16],
    owner: PrincipalId,
    device: DeviceId,
}
impl Workspace {
    /// Create only; never overwrite an existing file. Initial keys are passphrase-held.
    pub fn create(path: &Path, passphrase: &[u8], owner_label: &str) -> Result<Self> {
        if owner_label.is_empty() || owner_label.len() > 200 {
            return Err(Error::Invalid);
        }
        let mut workspace = [0; 16];
        getrandom::fill(&mut workspace).map_err(|_| Error::Crypto)?;
        let key = SecretKey::generate()?;
        let wrapper = key.wrap(passphrase, workspace, 1)?;
        let mut options = std::fs::OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let file = options.open(path).map_err(|_| Error::Io)?;
        file.sync_all().map_err(|_| Error::Io)?;
        let mut db = connect(path)?;
        let tx = db.transaction_with_behavior(TransactionBehavior::Immediate)?;
        tx.execute_batch("CREATE TABLE bootstrap(singleton INTEGER PRIMARY KEY CHECK(singleton=1),workspace BLOB NOT NULL CHECK(length(workspace)=16),epoch INTEGER NOT NULL CHECK(epoch=1),wrapper BLOB NOT NULL CHECK(length(wrapper)=106));
        CREATE TABLE objects(kind INTEGER NOT NULL,id BLOB NOT NULL CHECK(length(id)=32),envelope BLOB NOT NULL,PRIMARY KEY(kind,id)) STRICT;
        CREATE TABLE slots(kind INTEGER NOT NULL,id BLOB NOT NULL CHECK(length(id)=32),generation INTEGER NOT NULL CHECK(generation>=0),envelope BLOB NOT NULL,PRIMARY KEY(kind,id)) STRICT;
        PRAGMA application_id=1213225009; PRAGMA user_version=1;")?;
        tx.execute(
            "INSERT INTO bootstrap VALUES (1,?1,1,?2)",
            params![workspace.as_slice(), wrapper],
        )?;
        let owner = PrincipalId(new_id()?);
        let device = DeviceId(new_id()?);
        Cipher {
            key: &key,
            workspace,
        }
        .new_slot(
            &tx,
            CATALOG,
            ROOT,
            &Catalog {
                owner,
                device,
                owner_label: owner_label.into(),
                documents: Vec::new(),
            },
        )?;
        tx.commit()?;
        #[cfg(unix)]
        {
            std::fs::File::open(
                path.parent()
                    .filter(|p| !p.as_os_str().is_empty())
                    .unwrap_or(Path::new(".")),
            )
            .and_then(|f| f.sync_all())
            .map_err(|_| Error::Io)?;
        }
        Ok(Self {
            db,
            key,
            workspace,
            owner,
            device,
        })
    }
    /// Open existing workspace only. No migration/downgrade or implicit creation.
    pub fn open(path: &Path, passphrase: &[u8]) -> Result<Self> {
        // Read version before changing journal configuration or schema.
        let mut db = open_existing(path)?;
        if db.query_row("PRAGMA application_id", [], |r| r.get::<_, i32>(0))? != APPLICATION_ID
            || db.query_row("PRAGMA user_version", [], |r| r.get::<_, i32>(0))? != SCHEMA_VERSION
        {
            return Err(Error::Format);
        }
        let (workspace, epoch, wrapper): (Vec<u8>, i64, Vec<u8>) = db.query_row(
            "SELECT workspace,epoch,wrapper FROM bootstrap WHERE singleton=1",
            [],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )?;
        let workspace: [u8; 16] = workspace.try_into().map_err(|_| Error::Integrity)?;
        if epoch != 1 {
            return Err(Error::Format);
        }
        let key = SecretKey::unlock(passphrase, workspace, 1, &wrapper)?;
        configure(&db)?;
        let tx = db.transaction()?;
        let (_, catalog): (_, Catalog) = Cipher {
            key: &key,
            workspace,
        }
        .slot(&tx, CATALOG, ROOT)?;
        tx.commit()?;
        Ok(Self {
            db,
            key,
            workspace,
            owner: catalog.owner,
            device: catalog.device,
        })
    }
    pub fn list_documents(&mut self) -> Result<Vec<DocumentSummary>> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        let mut result = Vec::new();
        for id in catalog.documents {
            let doc: Document = cipher.object(&tx, DOCUMENT, id.0)?;
            if doc.id != id {
                return Err(Error::Integrity);
            }
            result.push(DocumentSummary {
                document: id,
                title: doc.title,
            });
        }
        tx.commit()?;
        Ok(result)
    }
    pub fn open_document(&mut self, id: DocumentId) -> Result<EditorState> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let doc: Document = cipher.object(&tx, DOCUMENT, id.0)?;
        let (_, head): (_, Head) = cipher.slot(&tx, HEAD, doc.branch.0)?;
        let (generation, draft): (_, Draft) = cipher.slot(&tx, DRAFT, doc.draft.0)?;
        check_draft(&doc, &head, &draft, self.owner, self.device)?;
        let revision: Revision = cipher.object(&tx, REVISION, head.revision.0)?;
        if revision.node != doc.node
            || reconstruct(&cipher, &tx, &doc, head.snapshot)? != revision.text
        {
            return Err(Error::Integrity);
        }
        let result = EditorState {
            document: id,
            node: doc.node,
            branch: doc.branch,
            manifest: doc.manifest,
            occurrence: doc.occurrence,
            draft: doc.draft,
            title: doc.title,
            generation,
            acknowledged_sequence: draft.sequence,
            base: draft.base,
            snapshot: head.snapshot,
            text: draft.text,
        };
        tx.commit()?;
        Ok(result)
    }
    pub fn reconstruct_snapshot(
        &mut self,
        document: DocumentId,
        snapshot: SnapshotId,
    ) -> Result<String> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let doc: Document = cipher.object(&tx, DOCUMENT, document.0)?;
        let text = reconstruct(&cipher, &tx, &doc, snapshot)?;
        tx.commit()?;
        Ok(text)
    }
    /// Original receipt for reconciliation after an uncertain acknowledgement.
    pub fn receipt(&self, id: OperationId) -> Result<Receipt> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let stored: StoredReceipt = cipher.object(&self.db, RECEIPT, id.0)?;
        if stored.receipt.operation != id {
            return Err(Error::Integrity);
        }
        Ok(stored.receipt)
    }
    pub fn execute(&mut self, operation: OperationId, command: Command) -> Result<Receipt> {
        self.execute_inner(operation, command, |_| Ok(()))
    }

    fn execute_inner(
        &mut self,
        operation: OperationId,
        command: Command,
        mut checkpoint: impl FnMut(&str) -> Result<()>,
    ) -> Result<Receipt> {
        validate_command(&command)?;
        let bytes = Zeroizing::new(serde_json::to_vec(&command).map_err(|_| Error::Format)?);
        let digest: [u8; 32] = Sha256::digest(&*bytes).into();
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self
            .db
            .transaction_with_behavior(TransactionBehavior::Immediate)?;
        match cipher.object::<StoredReceipt>(&tx, RECEIPT, operation.0) {
            Ok(stored) => {
                if stored.digest != digest || stored.receipt.operation != operation {
                    return Err(Error::Conflict);
                }
                return Ok(stored.receipt);
            }
            Err(Error::NotFound) => {}
            Err(error) => return Err(error),
        }
        let outcome = match command {
            Command::Create { title, text } => {
                let (generation, mut catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
                if catalog.owner != self.owner || catalog.device != self.device {
                    return Err(Error::Integrity);
                }
                let doc = Document {
                    id: DocumentId(new_id()?),
                    node: NodeId(new_id()?),
                    branch: BranchId(new_id()?),
                    manifest: ManifestId(new_id()?),
                    occurrence: OccurrenceId(new_id()?),
                    draft: DraftId(new_id()?),
                    title,
                };
                let revision = RevisionId(new_id()?);
                let snapshot = SnapshotId(new_id()?);
                cipher.insert(&tx, DOCUMENT, doc.id.0, &doc)?;
                cipher.insert(
                    &tx,
                    MANIFEST,
                    doc.manifest.0,
                    &Manifest {
                        document: doc.id,
                        occurrence: doc.occurrence,
                        node: doc.node,
                    },
                )?;
                publish_revision(
                    &cipher,
                    &tx,
                    &doc,
                    operation,
                    self.owner,
                    self.device,
                    None,
                    revision,
                    snapshot,
                    text.clone(),
                )?;
                checkpoint("objects")?;
                cipher.new_slot(
                    &tx,
                    HEAD,
                    doc.branch.0,
                    &Head {
                        document: doc.id,
                        revision,
                        snapshot,
                    },
                )?;
                cipher.new_slot(
                    &tx,
                    DRAFT,
                    doc.draft.0,
                    &Draft {
                        document: doc.id,
                        branch: doc.branch,
                        base: revision,
                        actor: self.owner,
                        device: self.device,
                        sequence: 0,
                        text,
                    },
                )?;
                catalog.documents.push(doc.id);
                cipher.update(&tx, CATALOG, ROOT, generation, &catalog)?;
                Outcome::Created { document: doc.id }
            }
            Command::Save {
                document,
                generation,
                base,
                previous_sequence,
                sequence,
                text,
            } => {
                let doc: Document = cipher.object(&tx, DOCUMENT, document.0)?;
                let (_, head): (_, Head) = cipher.slot(&tx, HEAD, doc.branch.0)?;
                let (actual, mut draft): (_, Draft) = cipher.slot(&tx, DRAFT, doc.draft.0)?;
                check_draft(&doc, &head, &draft, self.owner, self.device)?;
                if actual != generation
                    || draft.base != base
                    || draft.sequence != previous_sequence
                    || sequence <= previous_sequence
                {
                    return Err(Error::Conflict);
                }
                draft.sequence = sequence;
                draft.text = text;
                let generation = cipher.update(&tx, DRAFT, doc.draft.0, generation, &draft)?;
                checkpoint("objects")?;
                Outcome::Saved {
                    document,
                    generation,
                    sequence,
                }
            }
            Command::Commit {
                document,
                generation,
                base,
                sequence,
            } => {
                let doc: Document = cipher.object(&tx, DOCUMENT, document.0)?;
                let (head_generation, head): (_, Head) = cipher.slot(&tx, HEAD, doc.branch.0)?;
                let (actual, mut draft): (_, Draft) = cipher.slot(&tx, DRAFT, doc.draft.0)?;
                check_draft(&doc, &head, &draft, self.owner, self.device)?;
                if actual != generation || draft.base != base || draft.sequence != sequence {
                    return Err(Error::Conflict);
                }
                let revision = RevisionId(new_id()?);
                let snapshot = SnapshotId(new_id()?);
                publish_revision(
                    &cipher,
                    &tx,
                    &doc,
                    operation,
                    self.owner,
                    self.device,
                    Some(base),
                    revision,
                    snapshot,
                    draft.text.clone(),
                )?;
                checkpoint("objects")?;
                cipher.update(
                    &tx,
                    HEAD,
                    doc.branch.0,
                    head_generation,
                    &Head {
                        document,
                        revision,
                        snapshot,
                    },
                )?;
                draft.base = revision;
                let generation = cipher.update(&tx, DRAFT, doc.draft.0, generation, &draft)?;
                Outcome::Committed {
                    document,
                    generation,
                    sequence,
                    revision,
                    snapshot,
                }
            }
        };
        checkpoint("heads")?;
        let receipt = Receipt { operation, outcome };
        cipher.insert(
            &tx,
            RECEIPT,
            operation.0,
            &StoredReceipt {
                digest,
                receipt: receipt.clone(),
            },
        )?;
        checkpoint("receipt")?;
        tx.commit()?;
        checkpoint("committed")?;
        Ok(receipt)
    }
}
fn check_draft(
    doc: &Document,
    head: &Head,
    draft: &Draft,
    owner: PrincipalId,
    device: DeviceId,
) -> Result<()> {
    if head.document != doc.id
        || draft.document != doc.id
        || draft.branch != doc.branch
        || draft.base != head.revision
        || draft.actor != owner
        || draft.device != device
    {
        return Err(Error::Integrity);
    }
    Ok(())
}
#[allow(clippy::too_many_arguments)]
fn publish_revision(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    operation: OperationId,
    actor: PrincipalId,
    device: DeviceId,
    parent: Option<RevisionId>,
    revision: RevisionId,
    snapshot: SnapshotId,
    text: String,
) -> Result<()> {
    if let Some(parent) = parent {
        let prior: Revision = cipher.object(db, REVISION, parent.0)?;
        if prior.node != doc.node {
            return Err(Error::Integrity);
        }
    }
    cipher.insert(
        db,
        REVISION,
        revision.0,
        &Revision {
            node: doc.node,
            parent,
            text,
            operation,
        },
    )?;
    cipher.insert(
        db,
        SNAPSHOT,
        snapshot.0,
        &Snapshot {
            document: doc.id,
            manifest: doc.manifest,
            bindings: vec![SnapshotBinding {
                path: vec![doc.occurrence],
                node: doc.node,
                revision,
            }],
        },
    )?;
    cipher.insert(
        db,
        EVENT,
        operation.0,
        &Event {
            operation,
            actor,
            device,
            document: doc.id,
            parent,
            revision,
            snapshot,
        },
    )
}
fn reconstruct(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    id: SnapshotId,
) -> Result<String> {
    let snapshot: Snapshot = cipher.object(db, SNAPSHOT, id.0)?;
    let manifest: Manifest = cipher.object(db, MANIFEST, snapshot.manifest.0)?;
    if snapshot.document != doc.id
        || snapshot.manifest != doc.manifest
        || manifest.document != doc.id
        || manifest.node != doc.node
        || manifest.occurrence != doc.occurrence
        || snapshot.bindings.len() != 1
    {
        return Err(Error::Integrity);
    }
    let binding = &snapshot.bindings[0];
    if binding.path != [doc.occurrence] || binding.node != doc.node {
        return Err(Error::Integrity);
    }
    let revision: Revision = cipher.object(db, REVISION, binding.revision.0)?;
    if revision.node != doc.node {
        return Err(Error::Integrity);
    }
    Ok(revision.text)
}
fn validate_command(command: &Command) -> Result<()> {
    match command {
        Command::Create { title, text } => {
            if title.trim().is_empty() || title.len() > 512 {
                return Err(Error::Invalid);
            }
            if text.len() > MAX_TEXT_BYTES {
                return Err(Error::Limit);
            }
        }
        Command::Save {
            text,
            generation,
            sequence,
            ..
        } => {
            if text.len() > MAX_TEXT_BYTES
                || *generation >= i64::MAX as u64
                || *sequence > 9_007_199_254_740_991
            {
                return Err(Error::Limit);
            }
        }
        Command::Commit {
            generation,
            sequence,
            ..
        } => {
            if *generation >= i64::MAX as u64 || *sequence > 9_007_199_254_740_991 {
                return Err(Error::Limit);
            }
        }
    }
    Ok(())
}
fn open_existing(path: &Path) -> Result<Connection> {
    if std::fs::symlink_metadata(path)
        .map_err(|_| Error::Io)?
        .file_type()
        .is_symlink()
    {
        return Err(Error::Invalid);
    }
    // Resolve trusted parent aliases (macOS /var -> /private/var), while
    // SQLite NOFOLLOW still rejects a symlink in the final file component.
    let parent = path
        .parent()
        .filter(|p| !p.as_os_str().is_empty())
        .unwrap_or(Path::new("."));
    let resolved = parent
        .canonicalize()
        .map_err(|_| Error::Io)?
        .join(path.file_name().ok_or(Error::Invalid)?);
    let db = Connection::open_with_flags(
        resolved,
        OpenFlags::SQLITE_OPEN_READ_WRITE
            | OpenFlags::SQLITE_OPEN_NO_MUTEX
            | OpenFlags::SQLITE_OPEN_NOFOLLOW,
    )?;
    db.busy_timeout(Duration::from_secs(2))?;
    db.set_limit(
        rusqlite::limits::Limit::SQLITE_LIMIT_LENGTH,
        20 * 1024 * 1024,
    )?;
    Ok(db)
}
fn connect(path: &Path) -> Result<Connection> {
    let db = open_existing(path)?;
    configure(&db)?;
    Ok(db)
}
fn configure(db: &Connection) -> Result<()> {
    db.execute_batch("PRAGMA trusted_schema=OFF; PRAGMA foreign_keys=ON; PRAGMA temp_store=MEMORY; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;")?;
    let mode: String = db.query_row("PRAGMA journal_mode", [], |r| r.get(0))?;
    let sync: i32 = db.query_row("PRAGMA synchronous", [], |r| r.get(0))?;
    if mode != "wal" || sync != 2 {
        return Err(Error::Format);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    struct Temp(std::path::PathBuf);
    impl Temp {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "hpx-storage-{:x}",
                u128::from_be_bytes(new_id().unwrap()[..16].try_into().unwrap())
            ));
            std::fs::create_dir(&path).unwrap();
            Self(path)
        }
        fn db(&self) -> std::path::PathBuf {
            self.0.join("test.hpx")
        }
    }
    impl Drop for Temp {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }
    const PASS: &[u8] = b"synthetic-test-passphrase";
    fn op(byte: u8) -> OperationId {
        OperationId([byte; 32])
    }
    fn create(ws: &mut Workspace) -> DocumentId {
        match ws
            .execute(
                op(1),
                Command::Create {
                    title: "Research 中".into(),
                    text: "# Initial\r\n\r\nA😀 e\u{301}.".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        }
    }
    fn save(state: &EditorState, text: &str) -> Command {
        Command::Save {
            document: state.document,
            generation: state.generation,
            base: state.base,
            previous_sequence: state.acknowledged_sequence,
            sequence: state.acknowledged_sequence + 3,
            text: text.into(),
        }
    }
    fn commit(state: &EditorState) -> Command {
        Command::Commit {
            document: state.document,
            generation: state.generation,
            base: state.base,
            sequence: state.acknowledged_sequence,
        }
    }

    #[test]
    fn restart_recovers_draft_explicit_commit_reconstructs_immutable_history_and_retry() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Human").unwrap();
        let id = create(&mut ws);
        let original = ws.open_document(id).unwrap();
        let before = original.snapshot;
        let request = save(&original, "# Edited\r\n\r\n😀 Unicode e\u{301} and 中文.\n");
        let ack = ws.execute(op(2), request.clone()).unwrap();
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        let recovered = ws.open_document(id).unwrap();
        assert_eq!(
            recovered.text,
            "# Edited\r\n\r\n😀 Unicode e\u{301} and 中文.\n"
        );
        assert_eq!(recovered.generation, 1);
        assert_eq!(recovered.acknowledged_sequence, 3);
        assert_eq!(ws.execute(op(2), request.clone()).unwrap(), ack);
        assert!(matches!(
            ws.execute(op(2), save(&recovered, "changed retry")),
            Err(Error::Conflict)
        ));
        assert_eq!(ws.reconstruct_snapshot(id, before).unwrap(), original.text);
        let command = commit(&recovered);
        let receipt = ws.execute(op(3), command.clone()).unwrap();
        let after = match receipt.outcome {
            Outcome::Committed { snapshot, .. } => snapshot,
            _ => panic!(),
        };
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(ws.execute(op(3), command).unwrap(), receipt);
        assert_eq!(ws.receipt(op(3)).unwrap(), receipt);
        assert_eq!(ws.reconstruct_snapshot(id, after).unwrap(), recovered.text);
        assert_eq!(ws.reconstruct_snapshot(id, before).unwrap(), original.text);
        assert_eq!(ws.list_documents().unwrap().len(), 1);
        assert_eq!(ws.open_document(id).unwrap().generation, 2);
        assert!(matches!(ws.execute(op(4), request), Err(Error::Conflict)));
        assert_eq!(ws.open_document(id).unwrap().text, recovered.text);
    }
    #[test]
    fn encrypted_disk_records_no_plaintext_source_or_labels_and_tamper_fails() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "PRIVATE OWNER SENTINEL").unwrap();
        let id = create(&mut ws);
        let state = ws.open_document(id).unwrap();
        ws.execute(op(2), save(&state, "PRIVATE SOURCE SENTINEL 😀"))
            .unwrap();
        for entry in std::fs::read_dir(&temp.0).unwrap() {
            let bytes = std::fs::read(entry.unwrap().path()).unwrap();
            for needle in [
                b"PRIVATE SOURCE SENTINEL".as_slice(),
                b"PRIVATE OWNER SENTINEL",
                b"Research",
            ] {
                assert!(!bytes.windows(needle.len()).any(|w| w == needle));
            }
        }
        // Swap a ciphertext between mutable domains: authenticated binding rejects it.
        ws.db
            .execute(
                "UPDATE slots SET envelope=(SELECT envelope FROM slots WHERE kind=1) WHERE kind=7",
                [],
            )
            .unwrap();
        assert!(matches!(ws.open_document(id), Err(Error::Crypto)));
    }
    #[test]
    fn wrong_password_unrelated_future_schema_and_missing_file_fail_closed() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Human").unwrap();
        create(&mut ws);
        drop(ws);
        assert!(matches!(
            Workspace::open(&temp.db(), b"wrong"),
            Err(Error::Crypto)
        ));
        assert!(matches!(
            Workspace::create(&temp.db(), PASS, "Human"),
            Err(Error::Io)
        ));
        let missing = temp.0.join("missing.hpx");
        assert!(matches!(Workspace::open(&missing, PASS), Err(Error::Io)));
        assert!(!missing.exists());
        let db = Connection::open(temp.db()).unwrap();
        db.execute_batch("PRAGMA user_version=999;").unwrap();
        drop(db);
        assert!(matches!(
            Workspace::open(&temp.db(), PASS),
            Err(Error::Format)
        ));
        assert_eq!(
            Connection::open(temp.db())
                .unwrap()
                .query_row("PRAGMA user_version", [], |r| r.get::<_, i32>(0))
                .unwrap(),
            999
        );
    }
    #[test]
    fn stale_second_writer_and_failure_after_heads_publish_nothing() {
        let temp = Temp::new();
        let mut first = Workspace::create(&temp.db(), PASS, "Human").unwrap();
        let id = create(&mut first);
        let initial = first.open_document(id).unwrap();
        let mut second = Workspace::open(&temp.db(), PASS).unwrap();
        let stale = second.open_document(id).unwrap();
        let request = save(&initial, "first writer");
        first.execute(op(2), request).unwrap();
        assert!(matches!(
            second.execute(op(3), save(&stale, "lost writer")),
            Err(Error::Conflict)
        ));
        let current = first.open_document(id).unwrap();
        let count: i64 = first
            .db
            .query_row("SELECT count(*) FROM objects", [], |r| r.get(0))
            .unwrap();
        assert!(matches!(
            first.execute_inner(op(4), commit(&current), |phase| if phase == "heads" {
                Err(Error::Io)
            } else {
                Ok(())
            }),
            Err(Error::Io)
        ));
        assert_eq!(
            first
                .db
                .query_row("SELECT count(*) FROM objects", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            count
        );
        assert_eq!(
            first.open_document(id).unwrap().generation,
            current.generation
        );
        assert!(matches!(first.receipt(op(4)), Err(Error::NotFound)));
    }
    #[test]
    fn process_exit_on_each_side_of_commit_is_atomic_and_retryable() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Human").unwrap();
        let id = create(&mut ws);
        let state = ws.open_document(id).unwrap();
        ws.execute(op(2), save(&state, "crash-recovered exact text 😀"))
            .unwrap();
        drop(ws);
        let baseline = std::fs::read(temp.db()).unwrap();
        for phase in ["objects", "heads", "receipt", "committed"] {
            let path = temp.0.join(format!("{phase}.hpx"));
            std::fs::write(&path, &baseline).unwrap();
            let status = std::process::Command::new(std::env::current_exe().unwrap())
                .args(["--exact", "tests::crash_worker", "--ignored", "--nocapture"])
                .env("HPX_TEST_DB", &path)
                .env("HPX_TEST_PHASE", phase)
                .status()
                .unwrap();
            assert_eq!(status.code(), Some(86));
            let mut ws = Workspace::open(&path, PASS).unwrap();
            let recovered = ws.open_document(id).unwrap();
            assert_eq!(recovered.text, "crash-recovered exact text 😀");
            assert_eq!(
                recovered.generation,
                if phase == "committed" { 2 } else { 1 }
            );
            if phase == "committed" {
                assert!(ws.receipt(op(9)).is_ok());
            } else {
                assert!(matches!(ws.receipt(op(9)), Err(Error::NotFound)));
            }
            let original = Command::Commit {
                document: id,
                generation: 1,
                base: state.base,
                sequence: 3,
            };
            let receipt = ws.execute(op(9), original.clone()).unwrap();
            assert_eq!(ws.execute(op(9), original).unwrap(), receipt);
        }
    }
    #[test]
    #[ignore = "subprocess fault-injection worker, launched by process_exit test"]
    fn crash_worker() {
        let path = std::path::PathBuf::from(std::env::var_os("HPX_TEST_DB").unwrap());
        let phase = std::env::var("HPX_TEST_PHASE").unwrap();
        let mut ws = Workspace::open(&path, PASS).unwrap();
        let id = ws.list_documents().unwrap()[0].document;
        let state = ws.open_document(id).unwrap();
        ws.execute_inner(op(9), commit(&state), |at| {
            if at == phase {
                std::process::exit(86);
            }
            Ok(())
        })
        .unwrap();
        panic!("fault checkpoint was not reached");
    }
}
