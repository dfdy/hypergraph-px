// SPDX-License-Identifier: AGPL-3.0-only
//! Read-only immediate-record audit. No repair, closure scan, receipt or freshness claim.
use super::*;

pub const MAX_READ_BYTES: usize = 16 * 1024 * 1024;
pub const SCOPE: &str = "original_branch_immediate_editor_and_publication_records";

#[cfg_attr(feature = "api-schema", derive(utoipa::ToSchema))]
#[cfg_attr(feature="api-schema", schema(as=AuditRecordRole))]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum RecordRole {
    Catalog,
    Document,
    Head,
    Draft,
    Manifest,
    Snapshot,
    Revision,
    Publication,
}
#[cfg_attr(feature = "api-schema", derive(utoipa::ToSchema))]
#[cfg_attr(feature="api-schema", schema(as=AuditProblem))]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Problem {
    Missing,
    UnreadableEncryptedRecord,
    UnsupportedOrMalformed,
    Inconsistent,
    Budget,
}
#[cfg_attr(feature = "api-schema", derive(utoipa::ToSchema))]
#[cfg_attr(feature="api-schema", schema(as=AuditFinding))]
#[derive(Debug, PartialEq, Eq, Serialize)]
pub struct Finding {
    pub record: RecordRole,
    pub problem: Problem,
}
/// Contains no source, title, annotation body, credentials or unrequested identifiers.
#[cfg_attr(feature = "api-schema", derive(utoipa::ToSchema))]
#[cfg_attr(feature="api-schema", schema(as=DocumentAuditReport))]
#[derive(Debug, Serialize)]
pub struct Report {
    #[serde(with = "encoding::identity")]
    #[cfg_attr(feature="api-schema", schema(value_type=encoding::Id))]
    pub document: DocumentId,
    #[cfg_attr(feature="api-schema", schema(schema_with=audit_scope_schema))]
    pub scope: &'static str,
    pub authenticated_records: usize,
    pub encrypted_bytes: usize,
    /// None means this bounded slice completed, not that the entire workspace is sound.
    pub finding: Option<Finding>,
}

#[cfg(feature = "api-schema")]
fn audit_scope_schema() -> utoipa::openapi::RefOr<utoipa::openapi::schema::Schema> {
    use utoipa::openapi::schema::{ObjectBuilder, Type};
    ObjectBuilder::new()
        .schema_type(Type::String)
        .enum_values(Some([SCOPE]))
        .into()
}

struct Reader<'a, 'key> {
    cipher: &'a Cipher<'key>,
    db: &'a Connection,
    role: RecordRole,
    remaining: usize,
    authenticated: usize,
}
impl Reader<'_, '_> {
    fn charge(&mut self, slot: bool, kind: i32, id: [u8; 32]) -> Result<()> {
        let sql = if slot {
            "SELECT length(envelope) FROM slots WHERE kind=?1 AND id=?2"
        } else {
            "SELECT length(envelope) FROM objects WHERE kind=?1 AND id=?2"
        };
        let length: i64 = self
            .db
            .query_row(sql, params![kind, id.as_slice()], |row| row.get(0))
            .optional()?
            .ok_or(Error::NotFound)?;
        let length = usize::try_from(length).map_err(|_| Error::Integrity)?;
        if length > self.remaining {
            return Err(Error::Limit);
        }
        self.remaining -= length;
        Ok(())
    }
    fn object<T: DeserializeOwned>(
        &mut self,
        role: RecordRole,
        kind: i32,
        id: [u8; 32],
    ) -> Result<T> {
        self.role = role;
        self.charge(false, kind, id)?;
        let value = self.cipher.object(self.db, kind, id)?;
        self.authenticated += 1;
        Ok(value)
    }
    fn slot<T: DeserializeOwned>(
        &mut self,
        role: RecordRole,
        kind: i32,
        id: [u8; 32],
    ) -> Result<T> {
        self.role = role;
        self.charge(true, kind, id)?;
        let (_, value) = self.cipher.slot(self.db, kind, id)?;
        self.authenticated += 1;
        Ok(value)
    }
}

impl Workspace {
    /// Audit only the selected authorized document's original branch, in one read view.
    pub fn audit_document(&mut self, document: DocumentId, max_bytes: usize) -> Result<Report> {
        if !(1..=MAX_READ_BYTES).contains(&max_bytes) {
            return Err(Error::Invalid);
        }
        let tx = self.db.transaction()?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let mut reader = Reader {
            cipher: &cipher,
            db: &tx,
            role: RecordRole::Catalog,
            remaining: max_bytes,
            authenticated: 0,
        };
        // Never return an existence/integrity diagnostic before current authorization.
        let catalog: Catalog = reader.slot(RecordRole::Catalog, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        authority::document(&catalog, document)?;
        let result = (|| {
            let doc: Document = reader.object(RecordRole::Document, DOCUMENT, document.0)?;
            if doc.id != document {
                return Err(Error::Integrity);
            }
            let head: Head = reader.slot(RecordRole::Head, HEAD, doc.branch.0)?;
            if head.document != document {
                return Err(Error::Integrity);
            }
            let draft: Draft = reader.slot(RecordRole::Draft, DRAFT, doc.draft.0)?;
            check_draft(&doc, &head, &draft, catalog.owner, catalog.device)?;
            if draft.text.len() > MAX_TEXT_BYTES {
                return Err(Error::Integrity);
            }
            let manifest: Manifest =
                reader.object(RecordRole::Manifest, MANIFEST, doc.manifest.0)?;
            if manifest.document != document
                || manifest.node != doc.node
                || manifest.occurrence != doc.occurrence
            {
                return Err(Error::Integrity);
            }
            let snapshot: Snapshot =
                reader.object(RecordRole::Snapshot, SNAPSHOT, head.snapshot.0)?;
            if snapshot.document != document
                || snapshot.manifest != doc.manifest
                || snapshot.bindings.len() != 1
            {
                return Err(Error::Integrity);
            }
            let binding = &snapshot.bindings[0];
            if binding.node != doc.node
                || binding.path != [doc.occurrence]
                || binding.revision != head.revision
            {
                return Err(Error::Integrity);
            }
            let revision: Revision =
                reader.object(RecordRole::Revision, REVISION, head.revision.0)?;
            if revision.node != doc.node
                || revision.parent == Some(head.revision)
                || revision.text.len() > MAX_TEXT_BYTES
            {
                return Err(Error::Integrity);
            }
            let event: Event =
                reader.object(RecordRole::Publication, EVENT, revision.operation.0)?;
            if event.operation != revision.operation
                || event.document != document
                || event.revision != head.revision
                || event.snapshot != head.snapshot
                || event.parent != revision.parent
                || event.actor != catalog.owner
                || event.device != catalog.device
            {
                return Err(Error::Integrity);
            }
            Ok(())
        })();
        let finding = match result {
            Ok(()) => None,
            Err(error) => Some(Finding {
                record: reader.role,
                problem: match error {
                    Error::NotFound => Problem::Missing,
                    Error::Crypto => Problem::UnreadableEncryptedRecord,
                    Error::Format => Problem::UnsupportedOrMalformed,
                    Error::Integrity => Problem::Inconsistent,
                    Error::Limit => Problem::Budget,
                    other => return Err(other),
                },
            }),
        };
        let report = Report {
            document,
            scope: SCOPE,
            authenticated_records: reader.authenticated,
            encrypted_bytes: max_bytes - reader.remaining,
            finding,
        };
        tx.commit()?;
        Ok(report)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, create, op, save};

    #[test]
    fn bounded_audit_checks_immediate_publication_without_saving_or_disclosing_pending_text() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let initial = ws.open_document(id).unwrap();
        ws.execute(
            op(2),
            save(&initial, "PRIVATE-AUDIT-SENTINEL 😀\r\nPending\r"),
        )
        .unwrap();
        let before = ws.open_document(id).unwrap();
        let changes = ws.db.total_changes();
        let report = ws.audit_document(id, MAX_READ_BYTES).unwrap();
        assert_eq!(report.finding, None);
        assert_eq!(report.authenticated_records, 8);
        assert_eq!(report.scope, SCOPE);
        assert!(!format!("{report:?}").contains("PRIVATE-AUDIT-SENTINEL"));
        let after = ws.open_document(id).unwrap();
        assert_eq!(after.text, before.text);
        assert_eq!(after.generation, before.generation);
        assert_eq!(after.snapshot, initial.snapshot);
        assert_eq!(ws.db.total_changes(), changes);
    }

    #[test]
    fn encrypted_budget_is_charged_before_read_and_never_claims_a_complete_partial_audit() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let bytes = ws
            .audit_document(id, MAX_READ_BYTES)
            .unwrap()
            .encrypted_bytes;
        assert!(ws.audit_document(id, bytes).unwrap().finding.is_none());
        let partial = ws.audit_document(id, bytes - 1).unwrap();
        assert_eq!(partial.authenticated_records, 7);
        assert_eq!(
            partial.finding,
            Some(Finding {
                record: RecordRole::Publication,
                problem: Problem::Budget
            })
        );
        assert!(partial.encrypted_bytes < bytes);
        assert!(matches!(ws.audit_document(id, 1), Err(Error::Limit)));
        assert!(matches!(ws.audit_document(id, 0), Err(Error::Invalid)));
        assert!(matches!(
            ws.audit_document(id, MAX_READ_BYTES + 1),
            Err(Error::Invalid)
        ));
    }

    #[test]
    fn missing_authentication_format_and_context_failures_are_separate_nonmutating_findings() {
        for problem in [
            Problem::Missing,
            Problem::UnreadableEncryptedRecord,
            Problem::UnsupportedOrMalformed,
            Problem::Inconsistent,
        ] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let id = create(&mut ws);
            let state = ws.open_document(id).unwrap();
            let cipher = Cipher {
                key: &ws.key,
                workspace: ws.workspace,
            };
            let (generation, mut draft): (_, Draft) =
                cipher.slot(&ws.db, DRAFT, state.draft.0).unwrap();
            if problem == Problem::Missing {
                ws.db
                    .execute(
                        "DELETE FROM slots WHERE kind=?1 AND id=?2",
                        params![DRAFT, state.draft.0.as_slice()],
                    )
                    .unwrap();
            } else {
                let envelope = match problem {
                    Problem::UnreadableEncryptedRecord => vec![0; 100],
                    Problem::UnsupportedOrMalformed => ws
                        .key
                        .seal(
                            cipher.context(DRAFT, state.draft.0, generation),
                            br#"{"record_version":999,"record_kind":7,"payload":{}}"#,
                        )
                        .unwrap(),
                    Problem::Inconsistent => {
                        draft.base = RevisionId([99; 32]);
                        cipher
                            .seal(DRAFT, state.draft.0, generation, &draft)
                            .unwrap()
                    }
                    _ => unreachable!(),
                };
                ws.db
                    .execute(
                        "UPDATE slots SET envelope=?1 WHERE kind=?2 AND id=?3",
                        params![envelope, DRAFT, state.draft.0.as_slice()],
                    )
                    .unwrap();
            }
            let changes = ws.db.total_changes();
            let report = ws.audit_document(id, MAX_READ_BYTES).unwrap();
            assert_eq!(
                report.finding,
                Some(Finding {
                    record: RecordRole::Draft,
                    problem
                })
            );
            assert_eq!(ws.db.total_changes(), changes);
        }
    }

    #[test]
    fn current_authority_precedes_diagnostics_for_even_a_known_missing_document() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let (generation, mut catalog): (_, Catalog) = cipher.slot(&ws.db, CATALOG, ROOT).unwrap();
        catalog.documents.clear();
        cipher
            .update(&ws.db, CATALOG, ROOT, generation, &catalog)
            .unwrap();
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![DOCUMENT, id.0.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.audit_document(id, MAX_READ_BYTES),
            Err(Error::NotFound)
        ));
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.audit_document(id, MAX_READ_BYTES),
            Err(Error::Integrity)
        ));
    }

    #[test]
    fn authenticated_closed_snapshot_and_publication_context_cannot_be_substituted() {
        for role in [RecordRole::Snapshot, RecordRole::Publication] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let id = create(&mut ws);
            let state = ws.open_document(id).unwrap();
            let cipher = Cipher {
                key: &ws.key,
                workspace: ws.workspace,
            };
            let (kind, address, envelope) = if role == RecordRole::Snapshot {
                let mut value: Snapshot =
                    cipher.object(&ws.db, SNAPSHOT, state.snapshot.0).unwrap();
                value.bindings[0].path = vec![OccurrenceId([99; 32])];
                (
                    SNAPSHOT,
                    state.snapshot.0,
                    cipher.seal(SNAPSHOT, state.snapshot.0, 0, &value).unwrap(),
                )
            } else {
                let mut value: Event = cipher.object(&ws.db, EVENT, op(1).0).unwrap();
                value.snapshot = SnapshotId([99; 32]);
                (
                    EVENT,
                    op(1).0,
                    cipher.seal(EVENT, op(1).0, 0, &value).unwrap(),
                )
            };
            ws.db
                .execute(
                    "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                    params![envelope, kind, address.as_slice()],
                )
                .unwrap();
            let changes = ws.db.total_changes();
            assert_eq!(
                ws.audit_document(id, MAX_READ_BYTES).unwrap().finding,
                Some(Finding {
                    record: role,
                    problem: Problem::Inconsistent
                })
            );
            assert_eq!(ws.db.total_changes(), changes);
        }
    }
}
