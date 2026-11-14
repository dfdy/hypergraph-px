# Provenance archives

All retained source and historical archive payloads are consolidated here by the owner's instruction of 2026-11-13. This directory is **provenance, not active agent instructions or a competing specification**. Start current work at [the canonical specification](../docs/architecture/SPECIFICATION.md) and [current documentation](../docs/README.md).

| Location | Role | Git boundary |
| --- | --- | --- |
| `oldspecs/` | Original documentation, source inputs, template ZIPs and migration execution records | Ignored/private; available only where local originals are retained |
| [architecture-review/](architecture-review/README.md) | Historical architecture review and supporting evidence | Existing public-history scope remains trackable |
| [public-record/public-snapshots/](public-record/public-snapshots/2026-10-26-pre-architecture-integration-a0402d90505d/README.md) | Permanent owner-authorized public historical derivative | Existing public-history scope remains trackable |
| `public-record/specification-snapshots/` | Unredacted immutable masters | Ignored/private; never inferred publishable from a public derivative |
| [public-record/reviews/](public-record/reviews/2026-10-26-publication-review-a0402d90505d/README.md) | Publication, redaction and rights-review provenance | Existing public-history scope remains trackable |
| `archive/` | Local archival boundary; its original README is retained as historical bytes | Ignored/private |
| `local-reorganisation-checkpoints/` | Authorized source-relocation preimages, per-file hashes/modes and inverse-operation ledger; not a specification or evictable build cache | Selectively ignored/private; never publish checkpoint contents |

## Location and byte identity

The [archive manifest](../docs/registers/archive-manifest.json) records each source's `original_path`, pre-consolidation `previous_path`, new `current_path`, unchanged SHA256/size and retention classification. The [documentation archive ledger](../docs/registers/documentation-archive.json) additionally retains `previous_archive_path`; source/mapping registers retain original identities and update only current locations. [Relocation evidence](../docs/registers/provenance-relocation.json) records verification and limits.

Former roots map as follows:

- `.oldspecs/` → `.provenance/oldspecs/`
- `docproject/architecture-review/` → `.provenance/architecture-review/`
- `docproject/public-record/` → `.provenance/public-record/`
- `.archive/` → `.provenance/archive/`

All 1,019 registered payload files and the auxiliary archive README were moved without changing their bytes, including frozen manifests, original license texts and historical links. Links in **current** documents are updated. Links and path strings inside frozen historical snapshots retain their original context; use this root mapping and the registers when interpreting them. Historical `original_path`, source quotations and as-run evidence are not rewritten to pretend the new layout existed earlier. Old root directories are not compatibility aliases.

## Verification

From the repository root:

```sh
python3 shared/tooling/verify_archive.py
python3 shared/tooling/verify_archive.py --check-local
python3 shared/tooling/verify_documentation.py
python3 -m unittest discover -s shared/tooling/tests -p test_archive.py -v
```

Default archive verification checks public retained files and explicitly skips private bytes and the one explicitly registered local-only `.DS_Store`. That existing OS metadata file remains ignored and byte-preserved, not force-added or reclassified. `--check-local` requires all private originals and checks their hashes, including registered ZIP members. Neither checker mutates files or the Git index. Only private subtrees are ignored; do not ignore `.provenance/` wholesale or publish private payloads by force-adding them.

The relocation grants no new publication rights, changes no requirement/proposal status and makes no application or formal-proof claim. Previously tracked archival files remain recoverable at their prior paths through Git history; this work creates no commit, branch, push or release.
