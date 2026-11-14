#!/usr/bin/env python3
"""Read-only archival boundary checks (stdlib only).

Run from any directory. Default checks public retained files and metadata without
requiring private archives. --check-local additionally requires every local byte.
This checker never moves files, changes the index, or establishes supersession
approval: reviewers must establish that before adding archived-duplicate entries.
"""
from __future__ import annotations

import argparse
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = "docs/registers/archive-manifest.json"
ARCHIVE_ROOT = ".provenance/archive/"
OLD_ROOTS = (".oldspecs/", ".archive/", "docproject/architecture-review/", "docproject/public-record/")
REVIEW_ORIGINS = ("docproject/architecture-review/", ".provenance/architecture-review/")
CLASSES = {
    "registered-source": (".provenance/oldspecs/", "retained-source", True),
    "historical-review": (".provenance/architecture-review/", "retained-history", False),
    "private-immutable-master": (".provenance/public-record/specification-snapshots/", "retained-immutable", True),
    "public-historical-snapshot": (".provenance/public-record/public-snapshots/", "retained-immutable", False),
    "publication-review": (".provenance/public-record/reviews/", "retained-history", False),
}
PRIVATE_ROOTS = (CLASSES["registered-source"][0], ARCHIVE_ROOT, CLASSES["private-immutable-master"][0])
DEFENSIVE_PRIVATE_ROOTS = (".oldspecs/", ".archive/", "docproject/public-record/specification-snapshots/")


def owned_path(root: Path, value: str) -> Path:
    if not isinstance(value, str) or not value:
        raise ValueError("empty/non-string path")
    pure = PurePosixPath(value)
    if pure.is_absolute() or ".." in pure.parts or "\\" in value or str(pure) != value:
        raise ValueError("non-canonical repository path: " + value)
    path = root / value
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError("path escapes repository: " + value)
    return path


def current_location(root: Path, value: str) -> Path:
    """Historical original_path is exempt; physical/current references are not."""
    path = owned_path(root, value)
    resolved = path.resolve().relative_to(root.resolve()).as_posix()
    if any(candidate == prefix.rstrip("/") or candidate.startswith(prefix)
           for candidate in (value, resolved) for prefix in OLD_ROOTS):
        raise ValueError("old provenance location: " + value)
    return path


def exact(root: Path, value: str, entry: dict) -> None:
    path = owned_path(root, value)
    data = path.read_bytes()
    if len(data) != entry["bytes"] or hashlib.sha256(data).hexdigest() != entry["sha256"]:
        raise ValueError("byte hash/size mismatch: " + value)


def verify(root: Path, manifest: dict, check_local: bool = False) -> dict:
    if manifest["manifest_version"] != 1:
        raise ValueError("unsupported manifest version")
    seen = set()
    compatibility_paths = set()
    counts = {"checked": 0, "local_skipped": 0, "archived": 0}
    for entry in manifest["entries"]:
        current = entry["current_path"]
        current_location(root, current)
        owned_path(root, entry["original_path"])
        if current in seen:
            raise ValueError("duplicate current_path: " + current)
        seen.add(current)
        if not re.fullmatch(r"[0-9a-f]{64}", entry["sha256"]):
            raise ValueError("invalid SHA256: " + current)
        if type(entry["bytes"]) is not int or entry["bytes"] < 0:
            raise ValueError("invalid byte count: " + current)
        status = entry["status"]
        classification = entry["classification"]
        local_only = "local_only" in entry
        if local_only and (entry["local_only"] is not True
                           or PurePosixPath(current).name != ".DS_Store"
                           or PurePosixPath(entry["original_path"]).name != ".DS_Store"):
            raise ValueError("local_only requires exactly true and .DS_Store identity: " + current)
        refs = entry["recovery_refs"]
        if not isinstance(refs, list) or not refs:
            raise ValueError("missing recovery references: " + current)
        for ref in refs:
            if not current_location(root, ref).is_file():
                raise ValueError("missing recovery reference: " + ref)
        if status == "archived-duplicate":
            original = entry["original_path"]
            # Frozen sources/snapshots and current definitions cannot be reclassified
            # merely because their bytes also occur elsewhere.
            if classification != "superseded-duplicate" or not original.startswith(REVIEW_ORIGINS):
                raise ValueError("protected archival target: " + original)
            if not current.startswith(ARCHIVE_ROOT):
                raise ValueError("archived payload outside " + ARCHIVE_ROOT + ": " + current)
            if entry["obligation_status"] != "superseded":
                raise ValueError("active/proposed/unresolved archival is forbidden: " + original)
            supersession = entry["supersession_ref"]
            if not current_location(root, supersession).is_file():
                raise ValueError("missing supersession reference: " + original)
            compatibility = (CLASSES["historical-review"][0] + original[len(REVIEW_ORIGINS[0]):]
                             if original.startswith(REVIEW_ORIGINS[0]) else original)
            recovery = entry["recovery_path"]
            recovery_file = current_location(root, recovery)
            if (recovery.startswith(ARCHIVE_ROOT) or recovery in (current, original, compatibility)
                    or recovery_file.resolve().is_relative_to((root / ARCHIVE_ROOT).resolve())):
                raise ValueError("recovery must be an independent retained copy: " + original)
            exact(root, recovery, entry)
            # original_path remains provenance. Preserve its relocated canonical
            # access route, not a requirement to recreate obsolete root paths.
            exact(root, compatibility, entry)
            compatibility_paths.add(compatibility)
            counts["archived"] += 1
            if check_local:
                exact(root, current, entry)
                counts["checked"] += 1
            else:
                counts["local_skipped"] += 1
        else:
            if classification not in CLASSES:
                raise ValueError("unknown retention classification: " + classification)
            prefix, required_status, local = CLASSES[classification]
            if status != required_status or not current.startswith(prefix):
                raise ValueError("retention classification/path mismatch: " + current)
            if entry["obligation_status"] != "preserved-not-reassessed":
                raise ValueError("retention must not change obligation status: " + current)
            if (local or local_only) and not check_local:
                counts["local_skipped"] += 1
            else:
                exact(root, current, entry)
                counts["checked"] += 1
    # A deleted row must not silently remove a retained item from assessment.
    for prefix, _, local in CLASSES.values():
        if local and not check_local:
            continue
        for path in (root / prefix).rglob("*"):
            if path.is_file() and path.relative_to(root).as_posix() not in seen | compatibility_paths:
                raise ValueError("unregistered assessed file: " + path.relative_to(root).as_posix())
    for path in (root / ARCHIVE_ROOT).rglob("*"):
        if path.is_file() and path.relative_to(root).as_posix() != ARCHIVE_ROOT + "README.md" and path.relative_to(root).as_posix() not in seen:
            raise ValueError("unregistered archive payload: " + path.relative_to(root).as_posix())
    if "summary" in manifest:
        summary = manifest["summary"]
        retained = dict(Counter(e["classification"] for e in manifest["entries"]
                                if e["status"] != "archived-duplicate"))
        if (summary["entries"] != len(seen) or summary["archived"] != counts["archived"]
                or summary["retained_by_class"] != retained):
            raise ValueError("manifest summary/classification counts differ")
    return counts


def verify_sources(root: Path, manifest: dict, check_local: bool) -> int:
    """Retain the existing registers unchanged, including ZIP member identity."""
    by_path = {e["current_path"]: e for e in manifest["entries"]}
    moves = json.loads((root / "docs/registers/documentation-archive.json").read_text())
    for row in moves:
        current_location(root, row["archive_path"])
        entry = by_path[row["archive_path"]]
        for key in ("original_path", "sha256", "bytes"):
            if entry[key] != row[key]:
                raise ValueError("existing archive register drift: " + row["archive_path"])
    with (root / "docs/registers/source-manifest.csv").open(newline="") as handle:
        sources = list(csv.DictReader(handle))
    for row in sources:
        current = row["current_path"]
        current_location(root, current)
        if current.startswith(CLASSES["registered-source"][0]) and current not in by_path:
            raise ValueError("registered source excluded: " + row["source_id"])
        if not check_local:
            continue
        path = owned_path(root, current)
        if row["archive_member"]:
            with zipfile.ZipFile(path) as archive:
                data = archive.read(row["archive_member"])
        else:
            data = path.read_bytes()
        if hashlib.sha256(data).hexdigest() != row["sha256"]:
            raise ValueError("source register byte mismatch: " + row["source_id"])
    return len(sources)


def verify_git(root: Path) -> None:
    private_roots = (*PRIVATE_ROOTS, *DEFENSIVE_PRIVATE_ROOTS)
    tracked = subprocess.check_output(
        ["git", "ls-files", "-z", "--", *(p.rstrip("/") for p in private_roots)], cwd=root
    )
    if tracked:
        raise ValueError("private provenance contains indexed paths; coordinator must handle exact paths without resetting staged work")
    private_probes = {prefix + "archival-boundary-probe" for prefix in private_roots}
    public_probes = {prefix + "archival-boundary-probe" for prefix, _, local in CLASSES.values() if not local}
    public_probes.add(".provenance/archival-boundary-probe")
    probes = sorted(private_probes | public_probes)
    result = subprocess.run(
        ["git", "check-ignore", "--no-index", "--stdin", "-z"],
        cwd=root, input=("\0".join(probes) + "\0").encode(),
        capture_output=True, check=False,
    )
    if result.returncode not in (0, 1):
        raise ValueError("Git ignore boundary check failed")
    ignored = set(result.stdout.decode().split("\0")) - {""}
    if private_probes - ignored:
        raise ValueError("private provenance ignore boundary absent: " + ", ".join(sorted(private_probes - ignored)))
    if ignored & public_probes:
        raise ValueError("public provenance unexpectedly ignored (blanket .provenance ignore forbidden): " + ", ".join(sorted(ignored & public_probes)))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-local", action="store_true", help="Require private/local retained and archived bytes")
    args = parser.parse_args()
    try:
        manifest = json.loads((ROOT / MANIFEST).read_text())
        counts = verify(ROOT, manifest, args.check_local)
        sources = verify_sources(ROOT, manifest, args.check_local)
        verify_git(ROOT)
    except (OSError, ValueError, KeyError, TypeError, zipfile.BadZipFile, subprocess.CalledProcessError) as error:
        parser.exit(1, "FAIL: " + str(error) + "\n")
    print(json.dumps({"status": "pass", **counts, "source_register_rows": sources,
                      "source_bytes_checked": args.check_local,
                      "limits": "Mechanical retention/byte checks only; no semantic approval or product assurance."}, indent=2))


if __name__ == "__main__":
    main()
