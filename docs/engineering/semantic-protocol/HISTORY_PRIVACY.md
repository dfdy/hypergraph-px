# Git email privacy cleanup — 2026-10-31

At the owner's explicit request, personal author/committer email metadata was replaced with the verified GitHub noreply alias in both repositories. This is repository maintenance, not a change to HPX application history semantics or adoption of protocol governance.

- HPX main: `5aa2ac0299d81a5f3612bd0605505952a7189a0a`.
- Protocol main: `49cc59820b23c863709263ab0e0741cc0a8ef09b`.
- Both remote main histories were rechecked; no old email detected. Their source trees, commit messages and parent topology are preserved. One historical signature was removed as part of rewriting.
- HPX's Protect Main ruleset25820941 had only its no-force-push rule temporarily removed under explicit owner approval;deletion protection stayed active. Exact original settings and active force-push protection were restored and verified immediately after publication.
- Local private branches/checkpoints were rewritten without publication.126 local HPX commit/tag objects and the protocol commit were checked;obsolete local reflogs/objects were pruned. All1089 original working files and the Git index were preserved before bookkeeping;future Git author identities use noreply.
- Commit IDs changed. Earlier as-run evidence retains its historical IDs;source hashes and original archived materials were not rewritten. Private commit maps and machine checks are retained in ignored local `artifacts/git-email-cleanup-2026-10-31/`.

## Remaining GitHub-side cleanup

This is **not complete erasure everywhere**. GitHub still serves the former main commits in both repositories by their old IDs,including email-bearing metadata. HPX also has GitHub-managed read-only `refs/pull/20/head` and `refs/pull/21/head`;the former tip retains the email and the latter may retain affected ancestors. Such refs cannot be replaced by an ordinary branch push. Other people's clones,forks and caches are outside this cleanup.

The owner can request GitHub Support to review removal of those read-only pull-request references,cached commit views and retained old objects for [HPX](https://github.com/dfdy/hypergraph-px) and the [protocol](https://github.com/dfdy/HPX-Semantic-Communication-Protocol). Provide the before/after main mapping from the private local audit;avoid pasting the personal address into a public issue. Support assistance is subject to GitHub policy and is not guaranteed for previously public email data. No support request or third-party message was sent.

The replacement main branches are verified;do not merge or push old clones back into them. Reclone or carefully reconcile any additional clone before using it. This task did not rewrite unrelated private repositories or remove the account's login/recovery email.
