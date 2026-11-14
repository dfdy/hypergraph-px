// SPDX-License-Identifier: AGPL-3.0-only
//! Explicit keychain enrollment/upgrade. Opening never enrolls or migrates.
use super::*;
use hypergraph_keychain::{DeviceSecret, Provider};
use rusqlite::{
    backup::{Backup, StepResult},
    types::ValueRef,
};
use std::{fs, path::PathBuf};

pub const KEYCHAIN_SCHEMA_VERSION: i32 = 2;
#[derive(Debug, Serialize)]
pub struct Status {
    pub schema: i32,
    pub enrolled: bool,
    pub cleanup_pending: bool,
}
pub struct Enrollment {
    pub backup: Option<PathBuf>,
}
pub(crate) struct Bootstrap {
    pub workspace: [u8; 16],
    pub passphrase: Vec<u8>,
    schema: i32,
    device_wrapper: Option<Vec<u8>>,
}
pub(crate) fn bootstrap(db: &Connection) -> Result<Bootstrap> {
    let schema: i32 = db.query_row("PRAGMA user_version", [], |r| r.get(0))?;
    let app: i32 = db.query_row("PRAGMA application_id", [], |r| r.get(0))?;
    if app != APPLICATION_ID || ![SCHEMA_VERSION, KEYCHAIN_SCHEMA_VERSION].contains(&schema) {
        return Err(Error::Format);
    }
    let (workspace, epoch, passphrase): (Vec<u8>, i64, Vec<u8>) = db.query_row(
        "SELECT workspace,epoch,wrapper FROM bootstrap WHERE singleton=1",
        [],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
    )?;
    if epoch != 1 || passphrase.len() != 106 {
        return Err(Error::Format);
    }
    let device_wrapper = if schema == KEYCHAIN_SCHEMA_VERSION {
        let mut statement = db.prepare("SELECT singleton,wrapper FROM keychain_unlock")?;
        let mut rows = statement.query([])?;
        let wrapper = if let Some(row) = rows.next()? {
            let singleton: i64 = row.get(0)?;
            let bytes: Vec<u8> = row.get(1)?;
            if singleton != 1 || bytes.len() != 106 {
                return Err(Error::Format);
            }
            Some(bytes)
        } else {
            None
        };
        if rows.next()?.is_some() {
            return Err(Error::Format);
        }
        wrapper
    } else {
        None
    };
    Ok(Bootstrap {
        workspace: workspace.try_into().map_err(|_| Error::Format)?,
        passphrase,
        schema,
        device_wrapper,
    })
}
fn provider_error(error: hypergraph_keychain::Error) -> Error {
    Error::Keychain(error)
}
fn verify_secret(
    key: &SecretKey,
    workspace: [u8; 16],
    secret: &DeviceSecret,
    wrapper: &[u8],
) -> Result<()> {
    let recovered = SecretKey::unlock(secret.bytes(), workspace, 1, wrapper)?;
    let context = Context {
        workspace,
        binding: Sha256::digest(b"hpx/keychain/verification/v1").into(),
        purpose: Purpose::Index,
        epoch: 1,
    };
    let probe = key.seal(context, b"device secret verification")?;
    if recovered.open(context, &probe)?.as_slice() != b"device secret verification" {
        return Err(Error::Integrity);
    }
    Ok(())
}
fn fingerprint(db: &Connection) -> Result<[u8; 32]> {
    let schema: i32 = db.query_row("PRAGMA user_version", [], |r| r.get(0))?;
    let mut hash = Sha256::new();
    hash.update(schema.to_be_bytes());
    let mut queries = vec![
        "SELECT workspace,epoch,wrapper FROM bootstrap ORDER BY singleton",
        "SELECT kind,id,envelope FROM objects ORDER BY kind,id",
        "SELECT kind,id,generation,envelope FROM slots ORDER BY kind,id",
    ];
    if schema == KEYCHAIN_SCHEMA_VERSION {
        queries.push("SELECT singleton,wrapper FROM keychain_unlock ORDER BY singleton");
    }
    for query in queries {
        hash.update(query.as_bytes());
        let mut statement = db.prepare(query)?;
        let columns = statement.column_count();
        let mut rows = statement.query([])?;
        while let Some(row) = rows.next()? {
            hash.update([0xff]);
            for column in 0..columns {
                match row.get_ref(column)? {
                    ValueRef::Integer(n) => {
                        hash.update([1]);
                        hash.update(n.to_be_bytes());
                    }
                    ValueRef::Blob(bytes) => {
                        hash.update([2]);
                        hash.update((bytes.len() as u64).to_be_bytes());
                        hash.update(bytes);
                    }
                    _ => return Err(Error::Integrity),
                }
            }
        }
    }
    Ok(hash.finalize().into())
}
fn sync_parent(path: &Path) -> Result<()> {
    #[cfg(unix)]
    fs::File::open(path.parent().unwrap_or(Path::new(".")))
        .and_then(|f| f.sync_all())
        .map_err(|_| Error::Backup)?;
    Ok(())
}
struct VerifiedBackup {
    path: PathBuf,
    fingerprint: [u8; 32],
}
fn check_owner(
    db: &Connection,
    key: &SecretKey,
    workspace: [u8; 16],
    owner: PrincipalId,
    device: DeviceId,
) -> Result<()> {
    if bootstrap(db)?.workspace != workspace {
        return Err(Error::Integrity);
    }
    let (_, catalog): (_, Catalog) = Cipher { key, workspace }.slot(db, CATALOG, ROOT)?;
    if catalog.owner != owner || catalog.device != device {
        return Err(Error::Integrity);
    }
    Ok(())
}
impl Workspace {
    pub fn keychain_status(path: &Path) -> Result<Status> {
        let db = open_existing(path)?;
        let info = bootstrap(&db)?;
        Ok(Status {
            schema: info.schema,
            enrolled: info.device_wrapper.is_some(),
            cleanup_pending: false,
        })
    }
    pub fn current_keychain_status(&self) -> Result<Status> {
        let info = bootstrap(&self.db)?;
        Ok(Status {
            schema: info.schema,
            enrolled: info.device_wrapper.is_some(),
            cleanup_pending: self.keychain_cleanup.is_some(),
        })
    }
    pub fn open_keychain(path: &Path, provider: &mut impl Provider) -> Result<Self> {
        if !provider.supported() {
            return Err(provider_error(hypergraph_keychain::Error::Unavailable));
        }
        let db = open_existing(path)?;
        let info = bootstrap(&db)?;
        let wrapper = info
            .device_wrapper
            .ok_or(provider_error(hypergraph_keychain::Error::NotFound))?;
        let secret = provider.load(info.workspace).map_err(provider_error)?;
        let key = SecretKey::unlock(secret.bytes(), info.workspace, 1, &wrapper)?;
        Self::from_key(path, db, key, info.workspace)
    }
    fn owner_check(&self, db: &Connection) -> Result<()> {
        check_owner(db, &self.key, self.workspace, self.owner, self.device)
    }
    fn recovery_backup(&mut self) -> Result<Option<VerifiedBackup>> {
        let tx = self.db.transaction()?;
        let info = bootstrap(&tx)?;
        if info.schema != SCHEMA_VERSION {
            tx.commit()?;
            return Ok(None);
        }
        let expected = fingerprint(&tx)?;
        let directory = self
            .path
            .parent()
            .filter(|p| !p.as_os_str().is_empty())
            .unwrap_or(Path::new("."))
            .join(".hypergraph-backups");
        if !directory.exists() {
            let mut builder = fs::DirBuilder::new();
            #[cfg(unix)]
            {
                use std::os::unix::fs::DirBuilderExt;
                builder.mode(0o700);
            }
            builder.create(&directory).map_err(|_| Error::Backup)?;
        }
        let metadata = fs::symlink_metadata(&directory).map_err(|_| Error::Backup)?;
        if !metadata.is_dir() || metadata.file_type().is_symlink() {
            return Err(Error::Backup);
        }
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if metadata.permissions().mode() & 0o077 != 0 {
                return Err(Error::Backup);
            }
        }
        // Persist a newly created backup directory's entry as well as its files.
        sync_parent(&directory)?;
        let name: String = new_id()?.iter().map(|byte| format!("{byte:02x}")).collect();
        let path = directory.join(format!("pre-keychain-{name}.hpx"));
        let mut options = fs::OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let file = options.open(&path).map_err(|_| Error::Backup)?;
        let result = (|| {
            let mut destination = open_existing(&path)?;
            destination.execute_batch("PRAGMA trusted_schema=OFF; PRAGMA temp_store=MEMORY;")?;
            {
                let backup = Backup::new(&tx, &mut destination)?;
                loop {
                    match backup.step(256)? {
                        StepResult::Done => break,
                        StepResult::More => {}
                        StepResult::Busy | StepResult::Locked => return Err(Error::Backup),
                        _ => return Err(Error::Backup),
                    }
                }
            }
            let integrity: String =
                destination.query_row("PRAGMA quick_check", [], |r| r.get(0))?;
            if integrity != "ok"
                || fingerprint(&destination)? != expected
                || bootstrap(&destination)?.workspace != info.workspace
            {
                return Err(Error::Backup);
            }
            drop(destination);
            file.sync_all().map_err(|_| Error::Backup)?;
            sync_parent(&path)?;
            Ok(())
        })();
        if let Err(error) = result {
            let _ = fs::remove_file(&path);
            return Err(error);
        }
        tx.commit()?;
        Ok(Some(VerifiedBackup {
            path,
            fingerprint: expected,
        }))
    }
    pub fn enroll_keychain(&mut self, provider: &mut impl Provider) -> Result<Enrollment> {
        self.enroll_keychain_inner(provider, |_| Ok(()))
    }
    fn enroll_keychain_inner(
        &mut self,
        provider: &mut impl Provider,
        mut checkpoint: impl FnMut(&str) -> Result<()>,
    ) -> Result<Enrollment> {
        if !provider.supported() {
            return Err(provider_error(hypergraph_keychain::Error::Unavailable));
        }
        if self.keychain_cleanup.is_some() {
            return Err(Error::CleanupPending);
        }
        self.owner_check(&self.db)?;
        let backup = self.recovery_backup()?;
        checkpoint("backup_verified")?;
        let tx = self
            .db
            .transaction_with_behavior(TransactionBehavior::Immediate)?;
        check_owner(&tx, &self.key, self.workspace, self.owner, self.device)?;
        let info = bootstrap(&tx)?;
        if info.workspace != self.workspace {
            return Err(Error::Integrity);
        }
        if let Some(wrapper) = info.device_wrapper {
            let secret = provider.load(self.workspace).map_err(provider_error)?;
            verify_secret(&self.key, self.workspace, &secret, &wrapper)?;
            tx.commit()?;
            return Ok(Enrollment {
                backup: backup.map(|b| b.path),
            });
        }
        if info.schema == SCHEMA_VERSION {
            let now = fingerprint(&tx)?;
            if backup
                .as_ref()
                .is_none_or(|backup| now != backup.fingerprint)
            {
                return Err(Error::Conflict);
            }
        }
        let mut bytes = Zeroizing::new([0; 32]);
        getrandom::fill(&mut *bytes).map_err(|_| Error::Crypto)?;
        let secret = DeviceSecret::from_slice(&*bytes).map_err(provider_error)?;
        let wrapper = self.key.wrap(secret.bytes(), self.workspace, 1)?;
        provider
            .create(self.workspace, &secret)
            .map_err(provider_error)?;
        let result = (|| {
            checkpoint("provider_created")?;
            if info.schema == SCHEMA_VERSION {
                tx.execute_batch("CREATE TABLE keychain_unlock(singleton INTEGER PRIMARY KEY CHECK(singleton=1),wrapper BLOB NOT NULL CHECK(length(wrapper)=106)) STRICT; PRAGMA user_version=2;")?;
            }
            tx.execute(
                "INSERT INTO keychain_unlock(singleton,wrapper) VALUES(1,?1)",
                [wrapper],
            )?;
            checkpoint("before_commit")?;
            tx.commit()?;
            Ok(())
        })();
        if let Err(error) = result {
            if provider.remove(self.workspace, &secret).is_err() {
                self.keychain_cleanup = Some(secret);
                return Err(Error::CleanupPending);
            }
            return Err(error);
        }
        checkpoint("committed")?;
        Ok(Enrollment {
            backup: backup.map(|b| b.path),
        })
    }
    pub fn remove_keychain(&mut self, provider: &mut impl Provider) -> Result<()> {
        if !provider.supported() {
            return Err(provider_error(hypergraph_keychain::Error::Unavailable));
        }
        if let Some(secret) = self.keychain_cleanup.as_ref() {
            match provider.remove(self.workspace, secret) {
                Ok(()) | Err(hypergraph_keychain::Error::NotFound) => {
                    self.keychain_cleanup = None;
                    return Ok(());
                }
                Err(_) => return Err(Error::CleanupPending),
            }
        }
        self.owner_check(&self.db)?;
        let tx = self
            .db
            .transaction_with_behavior(TransactionBehavior::Immediate)?;
        check_owner(&tx, &self.key, self.workspace, self.owner, self.device)?;
        let info = bootstrap(&tx)?;
        let Some(wrapper) = info.device_wrapper else {
            tx.commit()?;
            return Ok(());
        };
        let secret = match provider.load(self.workspace) {
            Ok(secret) => Some(secret),
            Err(hypergraph_keychain::Error::NotFound) => None,
            Err(error) => return Err(provider_error(error)),
        };
        if let Some(secret) = &secret {
            verify_secret(&self.key, self.workspace, secret, &wrapper)?;
        }
        tx.execute("DELETE FROM keychain_unlock WHERE singleton=1", [])?;
        tx.commit()?;
        if let Some(secret) = secret
            && provider.remove(self.workspace, &secret).is_err()
        {
            self.keychain_cleanup = Some(secret);
            return Err(Error::CleanupPending);
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};
    use hypergraph_keychain::Error as ProviderError;
    use std::collections::BTreeMap;

    #[derive(Default)]
    struct Fake {
        items: BTreeMap<[u8; 16], DeviceSecret>,
        creates: usize,
        loads: usize,
        removes: usize,
        deny_create: bool,
        deny_load: bool,
        deny_remove: bool,
    }
    impl Provider for Fake {
        fn supported(&self) -> bool {
            true
        }
        fn create(
            &mut self,
            id: [u8; 16],
            secret: &DeviceSecret,
        ) -> hypergraph_keychain::Result<()> {
            self.creates += 1;
            if self.deny_create {
                return Err(ProviderError::Denied);
            }
            if self.items.contains_key(&id) {
                return Err(ProviderError::Exists);
            }
            self.items
                .insert(id, DeviceSecret::from_slice(secret.bytes())?);
            Ok(())
        }
        fn load(&mut self, id: [u8; 16]) -> hypergraph_keychain::Result<DeviceSecret> {
            self.loads += 1;
            if self.deny_load {
                return Err(ProviderError::Denied);
            }
            DeviceSecret::from_slice(self.items.get(&id).ok_or(ProviderError::NotFound)?.bytes())
        }
        fn remove(
            &mut self,
            id: [u8; 16],
            expected: &DeviceSecret,
        ) -> hypergraph_keychain::Result<()> {
            self.removes += 1;
            if self.deny_remove {
                return Err(ProviderError::Denied);
            }
            let stored = self.items.get(&id).ok_or(ProviderError::NotFound)?;
            if stored.bytes() != expected.bytes() {
                return Err(ProviderError::Invalid);
            }
            self.items.remove(&id);
            Ok(())
        }
    }
    fn schema(ws: &Workspace) -> i32 {
        bootstrap(&ws.db).unwrap().schema
    }

    #[test]
    fn explicit_upgrade_preserves_ciphertext_history_backup_and_passphrase() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let document = create(&mut ws);
        let editor = ws.open_document(document).unwrap();
        ws.execute(op(2), save(&editor, "Exact😀\r\n中\rfinal\n"))
            .unwrap();
        let editor = ws.open_document(document).unwrap();
        ws.execute(op(3), commit(&editor)).unwrap();
        let before = fingerprint(&ws.db).unwrap();
        let passphrase = bootstrap(&ws.db).unwrap().passphrase;
        let mut provider = Fake::default();
        assert_eq!(schema(&ws), 1);
        assert!(!Workspace::keychain_status(&temp.db()).unwrap().enrolled);
        let backup = ws.enroll_keychain(&mut provider).unwrap().backup.unwrap();
        assert_eq!(schema(&ws), 2);
        assert_eq!(bootstrap(&ws.db).unwrap().passphrase, passphrase);
        let backup_db = open_existing(&backup).unwrap();
        assert_eq!(fingerprint(&backup_db).unwrap(), before);
        for table in ["objects", "slots"] {
            let sql = format!("SELECT * FROM {table} ORDER BY kind,id");
            let rows = |db: &Connection| -> Vec<Vec<rusqlite::types::Value>> {
                let mut s = db.prepare(&sql).unwrap();
                let n = s.column_count();
                s.query_map([], |r| (0..n).map(|i| r.get(i)).collect())
                    .unwrap()
                    .map(|r| r.unwrap())
                    .collect()
            };
            assert_eq!(rows(&ws.db), rows(&backup_db));
        }
        drop(backup_db);
        assert_eq!(
            Workspace::open(&backup, PASS)
                .unwrap()
                .open_document(document)
                .unwrap()
                .text,
            "Exact😀\r\n中\rfinal\n"
        );
        assert!(ws.enroll_keychain(&mut provider).unwrap().backup.is_none());
        assert_eq!(provider.creates, 1);
        drop(ws);
        let mut ws = Workspace::open_keychain(&temp.db(), &mut provider).unwrap();
        assert_eq!(
            ws.open_document(document).unwrap().text,
            "Exact😀\r\n中\rfinal\n"
        );
        ws.remove_keychain(&mut provider).unwrap();
        assert_eq!(schema(&ws), 2);
        assert!(!ws.current_keychain_status().unwrap().enrolled);
        assert!(provider.items.is_empty());
        drop(ws);
        assert!(Workspace::open(&temp.db(), PASS).is_ok());
        assert!(matches!(
            Workspace::open_keychain(&temp.db(), &mut provider),
            Err(Error::Keychain(ProviderError::NotFound))
        ));
    }

    #[test]
    fn denied_or_existing_native_item_never_changes_custody() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let before = fingerprint(&ws.db).unwrap();
        let mut provider = Fake {
            deny_create: true,
            ..Fake::default()
        };
        assert!(matches!(
            ws.enroll_keychain(&mut provider),
            Err(Error::Keychain(ProviderError::Denied))
        ));
        assert_eq!(fingerprint(&ws.db).unwrap(), before);
        provider.deny_create = false;
        provider
            .items
            .insert(ws.workspace, DeviceSecret::from_bytes([9; 32]));
        assert!(matches!(
            ws.enroll_keychain(&mut provider),
            Err(Error::Keychain(ProviderError::Exists))
        ));
        assert_eq!(provider.items[&ws.workspace].bytes(), &[9; 32]);
        assert_eq!(provider.removes, 0);
        assert_eq!(fingerprint(&ws.db).unwrap(), before);
    }

    #[test]
    fn failed_upgrade_rolls_back_and_tracks_failed_orphan_cleanup() {
        for fail in ["provider_created", "before_commit"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let before = fingerprint(&ws.db).unwrap();
            let mut provider = Fake::default();
            assert!(matches!(
                ws.enroll_keychain_inner(&mut provider, |point| if point == fail {
                    Err(Error::Database)
                } else {
                    Ok(())
                }),
                Err(Error::Database)
            ));
            assert!(provider.items.is_empty());
            assert_eq!(fingerprint(&ws.db).unwrap(), before);
            provider.deny_remove = true;
            assert!(matches!(
                ws.enroll_keychain_inner(&mut provider, |point| if point == fail {
                    Err(Error::Database)
                } else {
                    Ok(())
                }),
                Err(Error::CleanupPending)
            ));
            assert_eq!(schema(&ws), 1);
            assert!(ws.current_keychain_status().unwrap().cleanup_pending);
            assert!(matches!(
                ws.enroll_keychain(&mut provider),
                Err(Error::CleanupPending)
            ));
            assert!(Workspace::open(&temp.db(), PASS).is_ok());
            provider.deny_remove = false;
            ws.remove_keychain(&mut provider).unwrap();
            assert!(provider.items.is_empty());
            assert!(!ws.current_keychain_status().unwrap().cleanup_pending);
        }
    }

    #[test]
    fn lost_commit_acknowledgement_reconciles_without_replacing_secret() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let mut provider = Fake::default();
        assert!(matches!(
            ws.enroll_keychain_inner(&mut provider, |point| if point == "committed" {
                Err(Error::Io)
            } else {
                Ok(())
            }),
            Err(Error::Io)
        ));
        assert!(ws.current_keychain_status().unwrap().enrolled);
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        ws.enroll_keychain(&mut provider).unwrap();
        assert_eq!(provider.creates, 1);
        assert_eq!(provider.removes, 0);
        assert!(Workspace::open_keychain(&temp.db(), &mut provider).is_ok());
    }

    #[test]
    fn backup_failure_and_intervening_writes_precede_native_creation() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let directory = temp.db().parent().unwrap().join(".hypergraph-backups");
        fs::write(&directory, b"block backup").unwrap();
        let mut provider = Fake::default();
        assert!(matches!(
            ws.enroll_keychain(&mut provider),
            Err(Error::Backup)
        ));
        assert_eq!(provider.creates, 0);
        fs::remove_file(directory).unwrap();
        let mut other = Workspace::open(&temp.db(), PASS).unwrap();
        assert!(matches!(
            ws.enroll_keychain_inner(&mut provider, |point| {
                if point == "backup_verified" {
                    create(&mut other);
                }
                Ok(())
            }),
            Err(Error::Conflict)
        ));
        assert_eq!(provider.creates, 0);
        assert_eq!(schema(&ws), 1);
        assert_eq!(ws.list_documents().unwrap().len(), 1);
    }

    #[test]
    fn provider_loss_denial_and_substitution_retain_passphrase_recovery() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let mut provider = Fake::default();
        ws.enroll_keychain(&mut provider).unwrap();
        provider.deny_load = true;
        assert!(matches!(
            Workspace::open_keychain(&temp.db(), &mut provider),
            Err(Error::Keychain(ProviderError::Denied))
        ));
        assert!(matches!(
            ws.remove_keychain(&mut provider),
            Err(Error::Keychain(ProviderError::Denied))
        ));
        assert!(ws.current_keychain_status().unwrap().enrolled);
        provider.deny_load = false;
        provider
            .items
            .insert(ws.workspace, DeviceSecret::from_bytes([7; 32]));
        assert!(matches!(
            Workspace::open_keychain(&temp.db(), &mut provider),
            Err(Error::Crypto)
        ));
        assert!(matches!(
            ws.enroll_keychain(&mut provider),
            Err(Error::Crypto)
        ));
        assert!(matches!(
            ws.remove_keychain(&mut provider),
            Err(Error::Crypto)
        ));
        assert_eq!(provider.creates, 1);
        assert!(Workspace::open(&temp.db(), PASS).is_ok());
        provider.items.clear();
        assert!(matches!(
            Workspace::open_keychain(&temp.db(), &mut provider),
            Err(Error::Keychain(ProviderError::NotFound))
        ));
        ws.remove_keychain(&mut provider).unwrap();
        assert!(!ws.current_keychain_status().unwrap().enrolled);
    }

    #[test]
    fn removal_commits_wrapper_first_and_retries_only_created_item() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let mut provider = Fake::default();
        ws.enroll_keychain(&mut provider).unwrap();
        provider.deny_remove = true;
        assert!(matches!(
            ws.remove_keychain(&mut provider),
            Err(Error::CleanupPending)
        ));
        let status = ws.current_keychain_status().unwrap();
        assert!(!status.enrolled);
        assert!(status.cleanup_pending);
        assert!(Workspace::open(&temp.db(), PASS).is_ok());
        provider.deny_remove = false;
        ws.remove_keychain(&mut provider).unwrap();
        assert!(provider.items.is_empty());
        assert!(!ws.current_keychain_status().unwrap().cleanup_pending);
        ws.remove_keychain(&mut provider).unwrap();
        assert_eq!(provider.removes, 2);
    }

    #[test]
    fn status_and_passphrase_do_not_read_provider_and_future_versions_fail_closed() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let mut provider = Fake::default();
        assert!(Workspace::open(&temp.db(), PASS).is_ok());
        assert_eq!(schema(&ws), 1);
        ws.enroll_keychain(&mut provider).unwrap();
        assert!(Workspace::keychain_status(&temp.db()).unwrap().enrolled);
        assert!(Workspace::open(&temp.db(), PASS).is_ok());
        assert_eq!(provider.loads, 0);
        ws.db.execute_batch("PRAGMA user_version=3").unwrap();
        assert!(matches!(
            Workspace::open_keychain(&temp.db(), &mut provider),
            Err(Error::Format)
        ));
        assert!(matches!(
            Workspace::open(&temp.db(), PASS),
            Err(Error::Format)
        ));
        assert!(matches!(
            Workspace::keychain_status(&temp.db()),
            Err(Error::Format)
        ));
        assert_eq!(provider.loads, 0);
    }

    #[test]
    fn independent_workspaces_reject_cross_scope_wrapper_and_secret_substitution() {
        let a = Temp::new();
        let b = Temp::new();
        let mut first = Workspace::create(&a.db(), PASS, "First").unwrap();
        let mut second = Workspace::create(&b.db(), PASS, "Second").unwrap();
        let mut provider = Fake::default();
        first.enroll_keychain(&mut provider).unwrap();
        second.enroll_keychain(&mut provider).unwrap();
        let first_wrapper = bootstrap(&first.db).unwrap().device_wrapper.unwrap();
        let original = bootstrap(&second.db).unwrap().device_wrapper.unwrap();
        second
            .db
            .execute("UPDATE keychain_unlock SET wrapper=?1", [&first_wrapper])
            .unwrap();
        assert!(matches!(
            Workspace::open_keychain(&b.db(), &mut provider),
            Err(Error::Crypto)
        ));
        assert!(matches!(
            second.remove_keychain(&mut provider),
            Err(Error::Crypto)
        ));
        assert_eq!(provider.items.len(), 2);
        assert!(Workspace::open(&b.db(), PASS).is_ok());
        second
            .db
            .execute("UPDATE keychain_unlock SET wrapper=?1", [&original])
            .unwrap();
        let first_secret = provider.load(first.workspace).unwrap();
        let second_secret = provider
            .items
            .insert(second.workspace, first_secret)
            .unwrap();
        assert!(matches!(
            Workspace::open_keychain(&b.db(), &mut provider),
            Err(Error::Crypto)
        ));
        provider.items.insert(second.workspace, second_secret);
        assert!(Workspace::open_keychain(&a.db(), &mut provider).is_ok());
        assert!(Workspace::open_keychain(&b.db(), &mut provider).is_ok());
        first.remove_keychain(&mut provider).unwrap();
        assert!(Workspace::open_keychain(&b.db(), &mut provider).is_ok());
        second.remove_keychain(&mut provider).unwrap();
        assert!(provider.items.is_empty());
    }

    #[test]
    fn concurrent_enrollment_reconciles_the_committed_winner() {
        let temp = Temp::new();
        let mut first = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let mut second = Workspace::open(&temp.db(), PASS).unwrap();
        let mut provider = Fake::default();
        // The intervening writer needs the same provider; move its result into
        // the shared fake before the first writer resumes its transaction.
        let mut winner = Fake::default();
        first
            .enroll_keychain_inner(&mut provider, |point| {
                if point == "backup_verified" {
                    second.enroll_keychain(&mut winner)?;
                }
                Ok(())
            })
            .err()
            .expect("losing provider lacks the winner's secret");
        assert_eq!(provider.creates, 0);
        assert_eq!(winner.creates, 1);
        first.enroll_keychain(&mut winner).unwrap();
        assert_eq!(winner.creates, 1);
        assert!(Workspace::open_keychain(&temp.db(), &mut winner).is_ok());
    }
}
