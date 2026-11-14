"""Isolated stdlib-only tests; no application data, Git index or browser access."""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "shared/tooling"))
import verify_archive as archive


class ArchiveTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.ref = "retention-evidence.md"
        self.put(self.ref, b"retention reference")
        self.data = b"historical bytes\r\nUTF8: \xc3\xa9\n"
        self.original = "docproject/architecture-review/history.md"
        self.path = ".provenance/architecture-review/history.md"
        self.put(self.path, self.data)
        self.entry = {
            "original_path": self.original,
            "current_path": self.path,
            "sha256": hashlib.sha256(self.data).hexdigest(),
            "bytes": len(self.data),
            "status": "retained-history",
            "classification": "historical-review",
            "obligation_status": "preserved-not-reassessed",
            "recovery_refs": [self.ref],
        }
        self.manifest = {"manifest_version": 1, "entries": [self.entry]}

    def put(self, path, data):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    def check(self, local=False):
        return archive.verify(self.root, self.manifest, local)

    def make_archived(self):
        self.put("recovery/history.md", self.data)
        self.put(".provenance/archive/history.md", self.data)
        self.entry.update(
            current_path=".provenance/archive/history.md", status="archived-duplicate",
            classification="superseded-duplicate", obligation_status="superseded",
            supersession_ref=self.ref, recovery_path="recovery/history.md",
        )

    def test_retained_exact_bytes_and_no_mutation(self):
        before = (self.root / self.path).read_bytes()
        self.assertEqual(self.check()["checked"], 1)
        self.assertEqual((self.root / self.path).read_bytes(), before)

    def test_normalization_is_corruption(self):
        self.put(self.path, self.data.replace(b"\r\n", b"\n"))
        with self.assertRaisesRegex(ValueError, "hash/size mismatch"):
            self.check()

    def test_missing_retained_file_fails_in_complete_local_mode(self):
        (self.root / self.path).unlink()
        self.assertEqual(self.check()["local_skipped"], 1)
        with self.assertRaises(FileNotFoundError):
            self.check(local=True)

    def test_unknown_status_and_classification_fail(self):
        for field in ("status", "classification", "obligation_status"):
            with self.subTest(field=field):
                old = self.entry[field]
                self.entry[field] = "proposed"
                with self.assertRaises(ValueError):
                    self.check()
                self.entry[field] = old

    def test_duplicate_and_unregistered_files_fail(self):
        self.manifest["entries"].append(copy.deepcopy(self.entry))
        with self.assertRaisesRegex(ValueError, "duplicate current_path"):
            self.check()
        self.manifest["entries"].pop()
        self.put(".provenance/architecture-review/new.md", b"unknown")
        with self.assertRaisesRegex(ValueError, "unregistered assessed"):
            self.check()

    def test_path_escape_and_absolute_paths_fail(self):
        for path in ("../outside", "/tmp/outside", "docproject/../outside", "./outside", "a\\b"):
            with self.subTest(path=path), self.assertRaises(ValueError):
                archive.owned_path(self.root, path)

    def test_symlink_escape_fails(self):
        (self.root / "outside").symlink_to(self.root.parent, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "escapes"):
            archive.owned_path(self.root, "outside/something")

    def test_missing_recovery_reference_fails(self):
        self.entry["recovery_refs"] = []
        with self.assertRaisesRegex(ValueError, "missing recovery"):
            self.check()

    def make_local_metadata(self):
        (self.root / self.path).unlink()
        self.path = ".provenance/architecture-review/.DS_Store"
        self.entry.update(current_path=self.path, original_path="docproject/architecture-review/.DS_Store", local_only=True)

    def test_explicit_missing_local_metadata_skips_default_but_is_required_locally(self):
        self.make_local_metadata()
        self.assertEqual(self.check(), {"checked": 0, "local_skipped": 1, "archived": 0})
        with self.assertRaises(FileNotFoundError):
            self.check(local=True)

    def test_local_metadata_exact_bytes_required_in_local_mode(self):
        self.make_local_metadata()
        self.put(self.path, self.data)
        self.assertEqual(self.check(local=True), {"checked": 1, "local_skipped": 0, "archived": 0})
        self.put(self.path, b"corrupt metadata")
        self.assertEqual(self.check()["local_skipped"], 1)
        with self.assertRaisesRegex(ValueError, "hash/size mismatch"):
            self.check(local=True)

    def test_metadata_basename_alone_does_not_implicitly_skip_bytes(self):
        self.make_local_metadata()
        del self.entry["local_only"]
        with self.assertRaises(FileNotFoundError):
            self.check(local=True)

    def test_local_only_requires_exact_true_not_false_or_nonboolean_flags(self):
        self.make_local_metadata()
        for flag in (False, None, 0, 1, "true", "false", [], {}):
            for local in (False, True):
                with self.subTest(flag=flag, local=local), self.assertRaisesRegex(ValueError, "local_only requires exactly true"):
                    self.entry["local_only"] = flag
                    self.check(local=local)

    def test_local_only_cannot_hide_history_or_rename_source_to_metadata(self):
        self.entry["local_only"] = True
        for local in (False, True):
            with self.subTest(local=local), self.assertRaisesRegex(ValueError, "local_only requires exactly true"):
                self.check(local=local)
        self.entry["current_path"] = ".provenance/architecture-review/.DS_Store"
        with self.assertRaisesRegex(ValueError, "local_only requires exactly true"):
            self.check()

    def test_explicit_local_metadata_does_not_allow_extra_unregistered_payloads(self):
        self.make_local_metadata()
        for extra in ("nested/.DS_Store", "extra.md"):
            path = ".provenance/architecture-review/" + extra
            self.put(path, b"unregistered")
            with self.subTest(extra=extra), self.assertRaisesRegex(ValueError, "unregistered assessed file"):
                self.check()
            (self.root / path).unlink()

    def test_private_bytes_are_explicitly_skipped_or_required(self):
        (self.root / self.path).unlink()
        self.entry.update(current_path=".provenance/oldspecs/history.md", status="retained-source", classification="registered-source")
        self.assertEqual(self.check()["local_skipped"], 1)
        with self.assertRaises(FileNotFoundError):
            self.check(local=True)

    def test_archived_duplicate_requires_original_compatibility(self):
        self.make_archived()
        # Original bytes remain accessible through a local pointer; no stale links.
        (self.root / self.path).unlink()
        (self.root / self.path).symlink_to(self.root / "recovery/history.md")
        self.assertEqual(self.check(local=True)["archived"], 1)
        (self.root / self.path).unlink()
        with self.assertRaises(FileNotFoundError):
            self.check(local=True)

    def test_archive_requires_exact_independent_recovery(self):
        self.make_archived()
        for recovery in (self.path, ".provenance/archive/history.md"):
            self.entry["recovery_path"] = recovery
            with self.assertRaisesRegex(ValueError, "independent"):
                self.check(local=True)
        self.entry["recovery_path"] = "recovery/history.md"
        self.put("recovery/history.md", b"different")
        with self.assertRaisesRegex(ValueError, "hash/size"):
            self.check(local=True)

    def test_active_proposed_unresolved_and_protected_archival_fail(self):
        self.make_archived()
        for status in ("active", "proposed", "unresolved"):
            self.entry["obligation_status"] = status
            with self.assertRaisesRegex(ValueError, "forbidden"):
                self.check(local=True)
        self.entry["obligation_status"] = "superseded"
        for original in ("docs/active.md", "docs/architecture/proposals/design.md", ".oldspecs/source.md", ".provenance/oldspecs/source.md", "backend/proofs/model.lean", "PROTOCOL.md", "shared/tooling/protocol/PROTOCOL.md", "docproject/public-record/specification-snapshots/master.md", ".provenance/public-record/specification-snapshots/master.md"):
            self.entry["original_path"] = original
            with self.assertRaisesRegex(ValueError, "protected archival"):
                self.check(local=True)

    def test_unregistered_archive_payload_fails(self):
        for path in (".provenance/archive/unregistered.bin", ".provenance/archive/nested/README.md"):
            with self.subTest(path=path):
                self.put(path, b"unknown")
                with self.assertRaisesRegex(ValueError, "unregistered archive"):
                    self.check()
                (self.root / path).unlink()

    def test_archived_hash_and_supersession_are_required(self):
        self.make_archived()
        self.entry["supersession_ref"] = "missing.md"
        with self.assertRaisesRegex(ValueError, "missing supersession"):
            self.check(local=True)
        self.entry["supersession_ref"] = self.ref
        self.put(".provenance/archive/history.md", b"corrupt")
        with self.assertRaisesRegex(ValueError, "hash/size"):
            self.check(local=True)

    def test_recovery_symlink_into_archive_is_not_independent(self):
        self.make_archived()
        recovery = self.root / "recovery/history.md"
        recovery.unlink()
        recovery.symlink_to(self.root / ".provenance/archive/history.md")
        with self.assertRaisesRegex(ValueError, "independent"):
            self.check(local=True)

    def test_summary_cannot_misreport_retention(self):
        self.manifest["summary"] = {"entries": 1, "archived": 0,
                                    "retained_by_class": {"historical-review": 1}}
        self.check()
        self.manifest["summary"]["archived"] = 1
        with self.assertRaisesRegex(ValueError, "summary"):
            self.check()

    def test_git_guard_does_not_untrack_or_mutate_index(self):
        for prefix in (*archive.PRIVATE_ROOTS, *archive.DEFENSIVE_PRIVATE_ROOTS):
            with self.subTest(prefix=prefix), patch.object(archive.subprocess, "check_output", return_value=(prefix + "tracked\0").encode()) as read:
                with self.assertRaisesRegex(ValueError, "indexed paths"):
                    archive.verify_git(self.root)
                self.assertEqual(read.call_args.args[0][:5], ["git", "ls-files", "-z", "--", archive.PRIVATE_ROOTS[0].rstrip("/")])
                self.assertIn(prefix.rstrip("/"), read.call_args.args[0])
        with patch.object(archive.subprocess, "check_output", return_value=b""), patch.object(archive.subprocess, "run") as run:
            run.return_value.returncode = 1
            run.return_value.stdout = b""
            with self.assertRaisesRegex(ValueError, "ignore boundary absent"):
                archive.verify_git(self.root)
            self.assertIn("--no-index", run.call_args.args[0])

    def test_old_current_locations_are_rejected_even_if_bytes_exist(self):
        for path in (".oldspecs/source.md", ".archive/source.md", "docproject/architecture-review/history.md", "docproject/public-record/reviews/review.md"):
            with self.subTest(path=path):
                self.put(path, self.data)
                self.entry["current_path"] = path
                with self.assertRaisesRegex(ValueError, "old provenance location"):
                    self.check()
        self.assertEqual(self.entry["original_path"], self.original)

    def test_old_recovery_references_are_rejected(self):
        path = "docproject/architecture-review/reference.md"
        self.put(path, b"reference")
        self.entry["recovery_refs"] = [path]
        with self.assertRaisesRegex(ValueError, "old provenance location"):
            self.check()

    def test_new_current_path_cannot_symlink_to_old_physical_location(self):
        old = ".oldspecs/history.md"
        self.put(old, self.data)
        (self.root / self.path).unlink()
        (self.root / self.path).symlink_to(self.root / old)
        with self.assertRaisesRegex(ValueError, "old provenance location"):
            self.check()

    def test_archival_accepts_canonical_review_origin_without_changing_guards(self):
        self.make_archived()
        self.entry["original_path"] = self.path
        self.assertEqual(self.check(local=True)["archived"], 1)

    def test_archival_historical_identity_uses_relocated_compatibility_route(self):
        self.make_archived()
        self.assertFalse((self.root / self.original).exists())
        self.assertEqual(self.entry["original_path"], self.original)
        self.assertEqual(self.check(local=True)["archived"], 1)

    def test_archival_rejects_old_payload_recovery_and_supersession_locations(self):
        self.make_archived()
        old = "docproject/architecture-review/old.md"
        self.put(old, self.data)
        for key, value in (("current_path", ".archive/history.md"), ("recovery_path", old), ("supersession_ref", old)):
            previous = self.entry[key]
            with self.subTest(key=key):
                self.entry[key] = value
                with self.assertRaisesRegex(ValueError, "old provenance location"):
                    self.check(local=True)
                self.entry[key] = previous

    def test_all_retention_classes_use_new_root_and_preserve_status(self):
        (self.root / self.path).unlink()
        for classification, (prefix, status, private) in archive.CLASSES.items():
            with self.subTest(classification=classification):
                self.entry.update(current_path=prefix + "history.md", classification=classification, status=status)
                self.put(self.entry["current_path"], self.data)
                self.assertEqual(self.check(local=True)["checked"], 1)
                self.assertEqual(self.check()["local_skipped"], int(private))
                (self.root / self.entry["current_path"]).unlink()

    def private_probes(self):
        roots = (*archive.PRIVATE_ROOTS, *archive.DEFENSIVE_PRIVATE_ROOTS, *(p for p, _, _ in archive.CLASSES.values()))
        return {p + "archival-boundary-probe" for p in roots}

    def check_git_with_ignored(self, ignored, code=0):
        with patch.object(archive.subprocess, "check_output", return_value=b""), patch.object(archive.subprocess, "run") as run:
            run.return_value.returncode = code
            run.return_value.stdout = ("\0".join(sorted(ignored)) + "\0").encode()
            archive.verify_git(self.root)
            return run.call_args

    def test_all_provenance_ignore_boundaries_pass_without_git_mutation(self):
        call = self.check_git_with_ignored(self.private_probes())
        self.assertEqual(call.args[0], ["git", "check-ignore", "--no-index", "--stdin", "-z"])
        self.assertIn(b".provenance/archival-boundary-probe\0", call.kwargs["input"])

    def test_each_private_and_defensive_root_requires_ignore(self):
        private = self.private_probes()
        for missing in private:
            with self.subTest(missing=missing), self.assertRaisesRegex(ValueError, "private provenance ignore boundary absent"):
                self.check_git_with_ignored(private - {missing})

    def test_selective_ignore_is_insufficient(self):
        selective = {p + "archival-boundary-probe" for p, _, private in archive.CLASSES.values() if private}
        selective.update(p + "archival-boundary-probe" for p in archive.DEFENSIVE_PRIVATE_ROOTS)
        with self.assertRaisesRegex(ValueError, "ignore boundary absent"):
            self.check_git_with_ignored(selective)

    def test_clean_clone_missing_archives_and_archive_references_is_explicit_skip(self):
        (self.root / self.path).unlink()
        self.entry["recovery_refs"] = [".provenance/architecture-review/evidence.md"]
        self.assertEqual(self.check(), {"checked": 0, "local_skipped": 1, "archived": 0})
        with self.assertRaisesRegex(ValueError, "missing recovery reference"):
            self.check(local=True)

    def test_missing_repository_recovery_reference_still_fails_by_default(self):
        self.entry["recovery_refs"] = ["docs/missing.md"]
        with self.assertRaisesRegex(ValueError, "missing recovery reference"):
            self.check()

    def test_absent_archive_does_not_hide_invalid_metadata(self):
        (self.root / self.path).unlink()
        self.entry["sha256"] = "invalid"
        with self.assertRaisesRegex(ValueError, "invalid SHA256"):
            self.check()

    def test_dangling_archive_symlink_does_not_count_as_absent(self):
        (self.root / self.path).unlink()
        (self.root / self.path).symlink_to(self.root / "missing.md")
        with self.assertRaises(FileNotFoundError):
            self.check()

    def test_git_ignore_command_failure_is_not_a_pass(self):
        with self.assertRaisesRegex(ValueError, "Git ignore boundary check failed"):
            self.check_git_with_ignored(self.private_probes(), code=128)

    def test_old_source_and_archive_register_locations_are_rejected(self):
        self.put("docs/registers/documentation-archive.json", b"[]\n")
        for path in (".oldspecs/source.md", "docproject/architecture-review/source.md"):
            self.put("docs/registers/source-manifest.csv", ("source_id,current_path,archive_member,sha256\nSRC," + path + ",," + self.entry["sha256"] + "\n").encode())
            with self.subTest(path=path), self.assertRaisesRegex(ValueError, "old provenance location"):
                archive.verify_sources(self.root, self.manifest, False)
        self.put("docs/registers/documentation-archive.json", json.dumps([{"archive_path": ".oldspecs/source.md"}]).encode())
        with self.assertRaisesRegex(ValueError, "old provenance location"):
            archive.verify_sources(self.root, self.manifest, False)

    def test_relocated_registers_preserve_original_identity_and_exact_bytes(self):
        current = ".provenance/oldspecs/Specifications/source.md"
        original = "Specifications/source.md"
        self.put(current, self.data)
        self.entry.update(current_path=current, original_path=original,
                          classification="registered-source", status="retained-source")
        self.put("docs/registers/documentation-archive.json", json.dumps([{
            "original_path": original, "archive_path": current,
            "sha256": self.entry["sha256"], "bytes": len(self.data),
        }]).encode())
        self.put("docs/registers/source-manifest.csv", ("source_id,current_path,archive_member,sha256\nSRC," + current + ",," + self.entry["sha256"] + "\n").encode())
        self.assertEqual(archive.verify_sources(self.root, self.manifest, True), 1)
        self.entry["original_path"] = current
        with self.assertRaisesRegex(ValueError, "existing archive register drift"):
            archive.verify_sources(self.root, self.manifest, True)

    def test_relocated_registered_source_cannot_be_excluded_from_manifest(self):
        self.put("docs/registers/documentation-archive.json", b"[]\n")
        self.put("docs/registers/source-manifest.csv", ("source_id,current_path,archive_member,sha256\nSRC,.provenance/oldspecs/source.md,," + self.entry["sha256"] + "\n").encode())
        with self.assertRaisesRegex(ValueError, "registered source excluded"):
            archive.verify_sources(self.root, self.manifest, False)

    def test_existing_source_register_zip_members_and_hashes(self):
        self.put("docs/registers/documentation-archive.json", b"[]\n")
        path = "sources.zip"
        with zipfile.ZipFile(self.root / path, "w") as zipped:
            zipped.writestr("original.txt", self.data)
        digest = self.entry["sha256"]
        self.put("docs/registers/source-manifest.csv", ("source_id,current_path,archive_member,sha256\nSRC,sources.zip,original.txt," + digest + "\n").encode())
        self.assertEqual(archive.verify_sources(self.root, self.manifest, True), 1)
        self.put("docs/registers/source-manifest.csv", ("source_id,current_path,archive_member,sha256\nSRC,sources.zip,original.txt," + "0" * 64 + "\n").encode())
        with self.assertRaisesRegex(ValueError, "source register byte mismatch"):
            archive.verify_sources(self.root, self.manifest, True)

    def test_existing_archive_register_cannot_be_rewritten_by_new_manifest(self):
        self.put("docs/registers/documentation-archive.json", json.dumps([{
            "original_path": self.path, "archive_path": self.path,
            "sha256": "0" * 64, "bytes": len(self.data),
        }]).encode())
        with self.assertRaisesRegex(ValueError, "existing archive register drift"):
            archive.verify_sources(self.root, self.manifest, False)


if __name__ == "__main__":
    unittest.main()
