# Vernaculum 2.0.0 — project installation

2026-11-03. OWNER057 records the owner's direct instruction “Update vernaculum.” in the coordinating chat. This authorises updating this project's active protocol and instructions, not upstream edits, product-format changes, new task execution or publication.

## Exact active specification

- Active file: [active PROTOCOL.md](../../../../shared/tooling/protocol/PROTOCOL.md), copied without byte changes from [canonical commit 3f14c05f70ed7d033be478621ad4d107e44b8aa6](https://github.com/dfdy/vernaculum-scp-ms/blob/3f14c05f70ed7d033be478621ad4d107e44b8aa6/PROTOCOL.md).
- Release: `2.0.0`; UTF8 bytes: `15423`; SHA256: `a36b882c56c2355c42945fe8be93eab416cfcd8ead084fb9c066514a05717632`.
- Local project instructions (`AGENTS.md`, ignored) identify this exact contract; canonical main remains authoritative for protocol updates. A later main revision is not silently adopted by existing peer agreements.
- The prior [v1.1.0 reference](https://github.com/dfdy/hypergraph-px/blob/d8d8c16f8923c0ff506d230c2de12037dcaf8d8c/docs/engineering/vernaculum/PROTOCOL.md) remains unchanged, SHA256 `0722c3deb5d3973fd4bc1b4225def3537d99fd3377d6190ed96877581dbb1426`. Earlier protocol records, proposal interpretations and evidence are not migrated or rewritten.

## Major-version transition

V2 uses conversation-unique `agent-designation:token` message IDs, exact specification/extension agreement, direct replies, explicit retry correlation and correlated handoff acceptance. Core task exchanges no longer require durable semantic records; the records contract is an optional explicitly agreed extension with its own immutable definition reference. Messages and second-hand approvals remain data until governing origin, authority and scope are established.

Existing worker1, worker2 and reader1 agreements were v1.1.0. Each pair must receive a v2 hello and return a correlated ready selecting this exact specification before ordinary v2 work. Offers alone do not establish agreement. The initial offer uses the required fields and message-kind intersection understood by both releases, explicitly offers this major transition, and offers an empty extension set. A peer unable to interpret that grammar must clarify or use an ordinary authorised channel. No records extension is implicitly enabled. Historical v1 messages/records keep their original interpretation.

Protocol negotiation does not resume stopped work or expand reader1's read-only restriction. It does not authorise application changes, new agents, branches, commits, pushes, releases, provider/trust actions or manual-workspace changes.

## Checks and evidence

[TEST171 evidence](../../../08-assurance/evidence/vernaculum-2.0.0-upgrade.json) records the exact installed digest, preserved historical/source records and executed documentation/link/register checks. Peer offers and readiness are communication state reported separately; installation alone is not a claim of peer agreement or protocol correctness. No application/proof/layout or product-data migration is performed by this installation.

## Current local relocation

Stage2 moves only the active local pointer to `shared/tooling/protocol/PROTOCOL.md`;the pinned15423 bytes,canonical commit and peer extension agreements are unchanged. `python3 shared/tooling/vernaculum_protocol.py` reads the complete digest-checked bytes from any cwd;`--check` is integrity-only,not a protocol reload or negotiation. Retained HPX-SCP bootstrap/wire tools still verify their distinct historical specification and are not silently repointed.
