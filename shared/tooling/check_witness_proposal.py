#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Hypergraph PX — Historical local-witness thought experiment

Exercise a bounded symbolic database/witness recovery model under explicitly supplied survival, receipt and authority assumptions.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/check_witness_proposal.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Developers reviewing the historical freshness investigation; not the application storage path.

Specification:
- [Current freshness limits](../../docs/08-assurance/security-threat-model.md)
- [Current finding dispositions](../../docs/08-assurance/development-findings.md)

Boundary: OWNER009 supersedes the external-witness direction. This retained model creates no witness, authenticates no real database and proves no fsync/crypto/application guarantee.
"""
from dataclasses import dataclass, replace
import hashlib
import json
from pathlib import Path
import platform


@dataclass(frozen=True)
class Witness:
    """Represent supplied stable/prepared witness labels and authentication assumptions in the historical symbolic model."""

    mode: str
    old: str
    new: str | None = None
    operation: str | None = None
    digest: str | None = None
    authenticated: bool = True


@dataclass(frozen=True)
class State:
    """Pair a symbolic database label with witness, receipt and current-authority predicates for recovery classification."""

    database: str
    witness: Witness | None
    receipt_matches: bool = True
    authorized: bool = True


def classify(state: State) -> str:
    """Classify supplied database/witness labels without treating missing or unauthenticated witness evidence as success."""

    witness = state.witness
    if witness is None or not witness.authenticated:
        return "unknown"
    if witness.mode == "stable":
        return "matched" if state.database == witness.old else "mismatch"
    if witness.mode != "prepared" or witness.new is None or witness.operation != "operation_B" or witness.digest != "command_B":
        return "unknown"
    if state.database == witness.old:
        return "interrupted_or_restored"
    if state.database == witness.new and state.receipt_matches and state.authorized:
        return "finish_witness"
    return "unknown"


def may_edit(state: State) -> bool:
    """Permit model editing only when current authority and the exact stable witness label both hold."""

    return state.authorized and classify(state) == "matched"


def acknowledge_b(state: State) -> bool:
    """Require an editable stable B state and matching receipt before modelling acknowledgement of operation B."""

    return may_edit(state) and state.database == "B" and state.receipt_matches


def finish(state: State) -> State:
    """Advance only a validated prepared-new state to its stable witness label; refuse speculative resets."""

    if classify(state) != "finish_witness":
        raise ValueError("cannot advance or reset the witness from this evidence")
    return replace(state, witness=Witness("stable", state.witness.new))


def run() -> dict:
    """Enumerate model crash/restoration/authority cases and return bounded evidence with its supplied assumptions."""

    checks: list[str] = []

    def check(condition: bool, description: str) -> None:
        """Record a model assertion only after its condition holds, aborting on the first counterexample."""

        if not condition:
            raise AssertionError(description)
        checks.append(description)

    initial = State("A", Witness("stable", "A"))
    prepared = State("A", Witness("prepared", "A", "B", "operation_B", "command_B"))
    committed = replace(prepared, database="B")
    finalized = finish(committed)
    check(may_edit(initial) and not acknowledge_b(initial), "prior stable state is usable but cannot acknowledge a new operation")
    check(classify(prepared) == "interrupted_or_restored" and not may_edit(prepared), "prepared witness plus old database blocks rather than auto-cancelling")
    check(classify(committed) == "finish_witness" and not acknowledge_b(committed), "SQLite commit alone cannot acknowledge the operation")
    check(may_edit(finalized) and acknowledge_b(finalized), "new stable witness permits the original acknowledged result")
    check(finish(committed) == finalized, "recovery finalization is deterministic and publishes no second database state")

    # At each I/O boundary, enumerate both settled write outcomes after a crash.
    boundaries = {
        "prepare uncertain": [initial, prepared],
        "database commit uncertain": [prepared, committed],
        "witness finalize uncertain": [committed, finalized],
        "reply lost after finalize": [finalized],
    }

    for boundary, states in boundaries.items():
        for state in states:
            check(not acknowledge_b(state) or (state.database == "B" and state.witness.mode == "stable" and state.witness.old == "B"), f"{boundary}: acknowledgement requires both durable new labels ({state.database}/{state.witness.mode})")

    examined = 0

    for state in [initial, prepared, committed, finalized]:
        for restored in ["A", "B", "unrelated"]:
            candidate = replace(state, database=restored)
            examined += 1
            witness = candidate.witness
            if witness.mode == "stable" and restored != witness.old:
                check(classify(candidate) == "mismatch" and not may_edit(candidate), f"stable {witness.old} rejects restored database {restored}")
            if witness.mode == "prepared" and restored == "A":
                check(not may_edit(candidate) and not acknowledge_b(candidate), "old-root prepared recovery never silently trusts an interrupted or restored state")
            if may_edit(candidate):
                check(witness.mode == "stable" and restored == witness.old, "editable state is exactly matched to the surviving stable witness")

    for witness in [None, Witness("unsupported", "B"), Witness("stable", "B", authenticated=False)]:
        for database in ["A", "B"]:
            candidate = State(database, witness)
            check(classify(candidate) == "unknown" and not may_edit(candidate), "missing/unsupported/unauthenticated witness never triggers automatic enrollment or reset")

    for candidate in [replace(committed, receipt_matches=False), replace(committed, authorized=False), replace(committed, witness=replace(committed.witness, operation="different")), replace(committed, witness=replace(committed.witness, digest="changed"))]:
        check(classify(candidate) == "unknown" and not acknowledge_b(candidate), "prepared recovery requires matching operation, digest, original receipt and current authority")

    for state in [initial, finalized]:
        check(not may_edit(replace(state, authorized=False)), "freshness evidence does not grant current authorization")

    # This is the explicitly excluded threat: restoring both stores can match.
    check(classify(initial) == "matched", "restoring both stores to A is indistinguishable here and is outside workspace-only protection")
    return {
        "proposal_only": True,
        "python": platform.python_version(),
        "model_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "checks_passed": len(checks),
        "restoration_pairs_examined": examined,
        "checks": checks,
        "assumptions": "Symbolic collision-free roots; authenticated durable witness survives workspace restoration; prepared receipt binding and current authorization are supplied predicates.",
        "limits": "Not production code or a Lean/extracted-Rust proof. Does not implement or verify canonical/Merkle hashing, encryption, SQLite views, real fsync/atomic replacement, locking, file replacement, enrollment, backup/restore, loss of actual data or an application integration.",
    }


if __name__ == "__main__":
    result = run()
    output = Path(__file__).resolve().parents[2] / ".local/artifacts" / "witness-proposal-model.json"
    output.parent.mkdir(exist_ok=True)
    output.write_text(json.dumps(result, indent=2) + "\n")
    print(f"PASS: {result['checks_passed']} abstract proposal checks; {result['restoration_pairs_examined']} database/witness restoration pairs; no production witness or workspace writes")
