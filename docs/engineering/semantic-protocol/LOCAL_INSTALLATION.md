> Current installation: **v0.6.0**, activated by explicit owner instruction; see [upgrade and use](UPGRADE_0.6.0.md). The v0.5.0 account below is historical.

# Local HPX-SCP v0.5.0 installation

Installed at the owner's request on 2026-10-31 and subsequently **adopted explicitly under HPX-OWNER-042**. [Local adoption](LOCAL_ADOPTION.md) records the accepted version and scope. Installation/verification alone did not adopt it; the supplied package and installation evidence retain their original proposed/as-run status. Existing HPX instructions and owner decisions remain authoritative; adoption approves no product design or additional tool permission.

The package's root README/changelog and installation guidance were installed here, leaving HPX's root documents unchanged. [INSTALLATION.json](INSTALLATION.json) records archive identity, exact original bytes and destination paths; it is historical provenance, not a promise that every owner-maintained documentation fork remains byte-identical forever. The owner subsequently requested publishing the expanded/adoption-corrected README; [publication evidence](records/HPX-VER-20261031-scp-readme-links.json) records that intentional derivative. The [original README](https://github.com/dfdy/HPX-Semantic-Communication-Protocol/blob/49cc59820b23c863709263ab0e0741cc0a8ef09b/README.md) remains in upstream parent history. Canonical policy, verifier, schema, registries, examples and the other original package files are unchanged. [DEPENDENCIES.json](DEPENDENCIES.json) records reviewed dependency versions, MIT license declarations, wheel hashes and bundled license locations. No existing semantic records were overwritten or upgraded.

Use the isolated, Git-ignored `.verification/semantic-protocol-venv` environment from the repository root. No system Python packages are modified:

```sh
.verification/semantic-protocol-venv/bin/python scripts/bootstrap_semantic_protocol.py
.verification/semantic-protocol-venv/bin/python scripts/protocol_context.py --for implement
.verification/semantic-protocol-venv/bin/python scripts/validate_semantic_records.py
.verification/semantic-protocol-venv/bin/python -m unittest discover -s tests -p 'test_*.py'
```

To recreate the environment, use `python3 -m venv .verification/semantic-protocol-venv`, then install [requirements.txt](requirements.txt) with its Python interpreter after dependency review. The supplied CI workflow uses its own Python environment; CI was not run by local installation. Do not load the canonical policy or complete machine appendix into an ordinary agent prompt. Use the verified scoped loader output only, and retain existing project constraints. Human-readable [README](README.md), [installation prompt](INSTALL_PROMPT.md) and [original guidance fragment](AGENTS.md.fragment) retain the supplied usage and adoption instructions.

Recovery is optional local task state, not authority. Pass `--state-dir artifacts/semantic-protocol-recovery` when keeping recovery state inside this workspace; the supplied default uses the user's state directory and may need separate filesystem permission. Never store credentials, raw private workspace text or provider secrets in checkpoints.

The source/verifier pair checks integrity and deterministic correspondence. An independent trusted digest is not configured by this installation; neither matching local hashes nor passing tests proves author authenticity.

## Standalone upstream

Published at the owner's explicit request on 2026-10-31 to the initially private, now public [dfdy/HPX-Semantic-Communication-Protocol](https://github.com/dfdy/HPX-Semantic-Communication-Protocol) repository, main commit `fe740bdc66c55bfbd1fd55a5c4d19f0920b1ebd1`. The standalone export preserves all26 original package files and adds dependency requirements,Git ignores and source provenance. Its bootstrap,record checks and52 supplied tests pass;remote identity and clean synchronization were verified. No HPX application changes or Git history were published. That one-time publication did not itself adopt governance and does not authorise future pushes; subsequent local adoption is separately recorded under HPX-OWNER-042.

The owner authorised public visibility after a private-information audit. All29 tracked files and the single commit were checked;no private information was detected. Git author/committer identifiers were already public in existing GitHub history. Visibility was changed and anonymous API access confirmed on2026-10-31;see [audit evidence](PUBLICATION_PRIVACY_AUDIT.json). No source changes or further commit were pushed.
