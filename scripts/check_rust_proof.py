#!/usr/bin/env python3
"""Re-extract and check the pinned real-Rust budget proof; no runtime tooling."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import tarfile
import tomllib


def digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def run(args: list[str], cwd: Path, env: dict[str, str]) -> str:
    result = subprocess.run(args, cwd=cwd, env=env, text=True, capture_output=True)
    print(result.stdout, end="", flush=True)
    print(result.stderr, end="", flush=True)
    result.check_returncode()
    return result.stdout + result.stderr


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    source = root / "proofs/rust"
    lock = json.loads((source / "extraction.json").read_text())
    cache = root / ".verification"
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tools", type=Path, default=cache / "aeneas")
    parser.add_argument("--download", action="store_true", help="fetch verified official bundle if missing")
    args = parser.parse_args()
    tools = args.tools.resolve()
    cache.mkdir(exist_ok=True)

    if not (tools / "aeneas").exists():
        if not args.download:
            parser.error("Aeneas bundle missing; pass --download or --tools PATH")
        key = f"{platform.system()}-{platform.machine()}"
        asset = lock["assets"].get(key)
        if asset is None:
            parser.error(f"no reviewed bundle for {key}")
        archive = cache / asset["name"]
        if not archive.exists():
            run(["gh", "release", "download", lock["release"], "--repo", "AeneasVerif/aeneas",
                 "--pattern", asset["name"], "--dir", str(cache)], root, dict(os.environ))
        if digest(archive) != asset["sha256"]:
            raise RuntimeError("official bundle SHA-256 mismatch")
        tools.mkdir(parents=True, exist_ok=True)
        with tarfile.open(archive) as bundle:
            bundle.extractall(tools, filter="data")

    env = dict(os.environ)
    env["RUSTUP_HOME"] = str(cache / "rustup")
    env["CARGO_HOME"] = str(cache / "cargo")
    env["CARGO_TARGET_DIR"] = str(cache / "target")
    env["MATHLIB_NO_CACHE_ON_UPDATE"] = "1"
    rustup = shutil.which("rustup")
    if rustup is None:
        raise RuntimeError("rustup required; normal user toolchains are not modified")
    bindir = cache / "cargo/bin"
    bindir.mkdir(parents=True, exist_ok=True)
    for name in ["rustup", "cargo", "rustc"]:
        destination = bindir / name
        if not destination.exists():
            destination.symlink_to(Path(rustup).resolve())
    version = run([str(tools / "aeneas"), "-version"], root, env).strip()
    if version != "aeneas " + lock["release"]:
        raise RuntimeError("wrong Aeneas translator version")
    charon_version = run([str(tools / "charon"), "version"], root, env)
    if lock["charon_revision"] not in charon_version:
        raise RuntimeError("wrong Charon compiler revision")
    for path, expected in [
        (root / lock["source"], lock["source_sha256"]),
        (source / "Spend.lean", lock["generated_sha256"]),
        (source / "SpendProof.lean", lock["proof_sha256"]),
    ]:
        if digest(path) != expected:
            raise RuntimeError(f"reviewed proof/source hash changed: {path.relative_to(root)}")

    generated = cache / "generated"
    generated.mkdir(exist_ok=True)
    (generated / "Spend.lean").unlink(missing_ok=True)
    llbc = cache / "spend.llbc"
    run([str(tools / "charon"), "cargo", "--preset=aeneas", "--start-from", lock["start_from"],
         "--dest-file", str(llbc), "--", "--lib", "--locked"], root / "crates/domain", env)
    run([str(tools / "aeneas"), "-backend", "lean", "-warnings-as-errors", "-no-progress-bar",
         "-dest", str(generated), str(llbc)], root, env)
    if (generated / "Spend.lean").read_bytes() != (source / "Spend.lean").read_bytes():
        raise RuntimeError("regenerated Lean differs; review translator/source changes")

    work = cache / "proof"
    work.mkdir(exist_ok=True)
    for name in ["Spend.lean", "SpendProof.lean"]:
        shutil.copyfile(source / name, work / name)
    version = tomllib.loads((root / "Cargo.toml").read_text())["workspace"]["package"]["version"]
    (work / "lean-toolchain").write_text(lock["lean_toolchain"] + "\n")
    (work / "lakefile.toml").write_text(
        f'name = "extractionPilot"\nversion = "{version}"\ndefaultTargets = ["SpendProof"]\n'
        'moreLeanArgs = ["-DwarningAsError=true"]\n\n[[require]]\nname = "aeneas"\n'
        f'path = {json.dumps(str(tools / "backends/lean"))}\n\n'
        '[[lean_lib]]\nname = "Spend"\n\n[[lean_lib]]\nname = "SpendProof"\n')
    run(["lake", "update"], work, env)
    actual = {p["name"]: p.get("rev") for p in json.loads((work / "lake-manifest.json").read_text())["packages"]}
    for dep in lock["dependencies"]:
        if actual.get(dep["name"]) != dep["revision"]:
            raise RuntimeError(f"dependency revision changed: {dep['name']}")
    run(["lake", "exe", "cache", "get"], work, env)
    run(["lake", "build"], work, env)
    audit = run(["lake", "env", "lean", "-DwarningAsError=true", "SpendProof.lean"], work, env)
    expected = "'spend_spec' depends on axioms: [propext, Classical.choice, Quot.sound]"
    if expected not in audit or "sorryAx" in audit or "Lean.ofReduceBool" in audit:
        raise RuntimeError("unexpected theorem axiom report")
    run(["lake", "env", "leanchecker", "SpendProof"], work, env)
    print("PASS: unchanged Rust helper re-extracted; exact generated source, locked dependencies, proof and environment checked")


if __name__ == "__main__":
    main()
