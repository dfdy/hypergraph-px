> Current installation: **v0.6.0**, activated by explicit owner instruction; see [upgrade and use](UPGRADE_0.6.0.md). The v0.5.0 account below is historical.

# Local adoption of HPX-SCP v0.5.0

**Accepted by the project owner on 2026-10-31.** The explicit instruction was “accept the hpx-scp.” [HPX-OWNER-042](../../02-governance/OWNER_DECISIONS.md#hpx-scp-v050-local-adoption-2026-10-31) and [HPX-DEC-20261031-scp-adoption](records/HPX-DEC-20261031-scp-adoption.json) record that authority. The agent records the decision; passing verification is not its approval basis.

The accepted scope is the exact installed HPX-SCP **0.5.0** engineering-communication policy identified by [INSTALLATION.json](INSTALLATION.json). Its canonical human-readable policy remains the normative source, consumed by agents only through verified task-scoped packets. The original guidance fragment, examples and installation evidence preserve their earlier proposed/historical wording; this local adoption record supplies the subsequent HPX status without rewriting those original bytes. The later owner-authorised README documentation update and its original upstream version are distinguished in [local installation/provenance](LOCAL_INSTALLATION.md); that README update does not amend this adopted policy.

## Effective operation

- Before protocol-governed work at session start, resumption, compaction or uncertain state, use `.verification/semantic-protocol-venv/bin/python scripts/protocol_context.py --for <scope>`. Load only needed scopes, record contracts and references; retain existing HPX constraints. Do not insert canonical prose or the full appendix into prompts.
- Verification failure stops protocol-dependent loading/mutations pending authorised repair; use no unverified prose/summary fallback. Local integrity/correspondence checks are not independently authenticated authorship. No external trust anchor is configured by this adoption.
- Durable semantic records use the installed versioned schema and truthful source/approval/evidence attribution. Preserve historical records and their declared versions. Ordinary conversation and every routine log entry do not automatically need semantic records.
- Apply amendment delegation only within existing task permissions. Breaking, authority, kernel, security and governance changes need owner approval. Canonical-first amendment/regeneration/registry/verification requirements remain. This adoption changes local activation status, not the canonical policy, semantic vocabulary, appendix, schema or protocol version; it is not a protocol amendment or applied extension.
- HPX application specifications and narrower owner/repository restrictions remain. No tool permission, provider/trust action, credential access, runtime/schema migration, product-design acceptance, commit or publication authority is added. Protocol wording about commits or shared publication is conditional on the repository's actual authorization; existing publication holds remain.

## Verification and preservation

The verified scoped loader passed before recording adoption. [HPX-VER-20261031-scp-adoption](records/HPX-VER-20261031-scp-adoption.json), HPX-TEST-146, records checks actually executed, the unchanged installed package and the accepted decision's record validation. Installation-era tests remain historical evidence at their original scope; this adoption makes no new application or proof claim.

No changes were made to the standalone upstream repository, installed canonical policy/verifier/schema/registry/examples, application code, LikeC4 model/layouts or runtime. Future reconsideration requires a new explicit owner decision; do not edit this acceptance into a different policy version or silently rewrite prior records.
