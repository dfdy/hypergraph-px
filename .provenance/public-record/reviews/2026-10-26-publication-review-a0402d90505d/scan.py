"""Read-only bounded snapshot scan; emit locations, never candidate secret values."""
import collections
import hashlib
import json
from pathlib import Path
import re
import struct

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
SNAPSHOT = ROOT / "docproject/public-record/specification-snapshots/2026-10-26-pre-architecture-integration-a0402d90505d"
manifest = json.loads((SNAPSHOT / "manifest.json").read_text())
patterns = {
    "private_key": r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----",
    "provider_token": r"\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[A-Z0-9]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{32,})\b",
    "url_credentials": r"https?://[^\s/<>\"']+:[^\s/<>\"']+@",
    "local_path": r"/(?:Users/|(?:private/)?var/folders/)[^\s\"'<>]+",
    "email": r"\b[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+\b",
    "ipv4": r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
    "secret_assignment": r"(?i)\b(?:password|passphrase|api[_-]?key|access[_-]?token|client[_-]?secret)\b\s*[:=]\s*[\"'][^\"'\n]{8,}[\"']",
}
compiled = {k: re.compile(v) for k, v in patterns.items()}
hits, images, resources, redactions = [], [], [], []
counts = collections.Counter()
payload_bytes = 0
paths = []
for entry in manifest["files"]:
    path = SNAPSHOT / entry["archived_path"]
    data = path.read_bytes()
    assert len(data) == entry["bytes"]
    assert hashlib.sha256(data).hexdigest() == entry["sha256"], entry["source_path"]
    payload_bytes += len(data)
    paths.append(path)
    counts[path.suffix or "<none>"] += 1
    if path.suffix == ".png":
        assert data[:8] == b"\x89PNG\r\n\x1a\n"
        offset, chunks = 8, []
        while offset < len(data):
            size = struct.unpack(">I", data[offset:offset + 4])[0]
            kind = data[offset + 4:offset + 8].decode("ascii")
            chunks.append({"kind": kind, "bytes": size})
            offset += size + 12
        assert offset == len(data)
        images.append({"path": entry["archived_path"], "chunks": chunks})
for name, digest in json.loads((SNAPSHOT / "control-checksums.json").read_text()).items():
    path = SNAPSHOT / name
    assert hashlib.sha256(path.read_bytes()).hexdigest() == digest, name
    paths.append(path)
paths.append(SNAPSHOT / "control-checksums.json")
for path in paths:
    if path.suffix == ".png":
        continue
    content = path.read_text(encoding="utf-8")
    rel = path.relative_to(SNAPSHOT).as_posix()
    for category, regex in compiled.items():
        for match in regex.finditer(content):
            hits.append({"path": rel, "line": content.count("\n", 0, match.start()) + 1,
                         "category": category})
    if path.suffix in {".html", ".svg"}:
        for match in re.finditer(r'''(?:src|href|xlink:href)\s*=\s*["']([^"']+)["']''', content):
            value = match.group(1)
            if re.match(r"(?:https?:|data:|file:|//)", value):
                resources.append({"path": rel, "scheme": value.split(":", 1)[0], "line": content.count("\n", 0, match.start()) + 1})
    if path.suffix == ".json":
        def walk(value, pointer=""):
            if isinstance(value, dict):
                for key, item in value.items():
                    walk(item, pointer + "/" + key.replace("~", "~0").replace("/", "~1"))
            elif isinstance(value, list):
                for index, item in enumerate(value):
                    walk(item, pointer + "/" + str(index))
            elif isinstance(value, str) and compiled["local_path"].search(value):
                redactions.append({"path": rel, "json_pointer": pointer,
                                   "action": "replace local home/cache prefix with <LOCAL_BROWSER> or <RENDERER_CACHE>; preserve stack suffix and other evidence"})
        walk(json.loads(content))
result = {
    "review_date": "2026-10-26", "snapshot": SNAPSHOT.relative_to(ROOT).as_posix(),
    "payload_files_verified": len(manifest["files"]), "payload_bytes": payload_bytes,
    "control_files_scanned": 9, "control_files_matching_recorded_hashes": 8,
    "control_checksum_file_sha256": hashlib.sha256((SNAPSHOT / "control-checksums.json").read_bytes()).hexdigest(),
    "extensions": dict(sorted(counts.items())),
    "candidate_counts": dict(collections.Counter(h["category"] for h in hits)),
    "candidates": hits, "png_chunks": images, "html_svg_nonlocal_resource_attributes": resources,
    "proposed_derivative_redactions": redactions,
    "limits": "Pattern scan is bounded, not arbitrary secret detection, semantic OCR, legal clearance, or an application security audit. Candidate locations require human triage. No snapshot writes."
}
(HERE / "scan-results.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({key: result[key] for key in ["payload_files_verified", "payload_bytes", "control_files_scanned", "candidate_counts"]}))
