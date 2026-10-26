# Architecture assessment

HPX has a coherent local core: exact owned source, mutable acknowledged drafts, explicit immutable publication, stable logical identity, distinct occurrence context, closed historical snapshots and separate cross-identity derivation. One encrypted SQLite transaction combines publication objects, mutable pointers and retry evidence. The current code dependency direction supports a pure domain with adapter-owned serialization. These are useful boundaries worth preserving.

The main immediate problem is **acceptance and evidence clarity**, rather than a demonstrated failure of the core algorithms. The rollback gate has broader wording than the documented local freshness guarantee. Current architecture/status summaries retain superseded implementation descriptions. Index repair is required as a responsibility but lacks a complete authoritative/derived-state protocol. Gated branch/checkpoint/reference code still needs its actual runtime, older-reader, restart and undo workflow acceptance. See [FIND-001](findings/HPX-FIND-001.md), [FIND-002](findings/HPX-FIND-002.md), [FIND-003](findings/HPX-FIND-003.md), [FIND-004](findings/HPX-FIND-004.md) and [FIND-009](findings/HPX-FIND-009.md).

## Quality and integrity

| Quality concern | Assessment | Main evidence / limitation |
| --- | --- | --- |
| Correctness / history | Strong semantic separation and local atomic publication; exact sources retained | Complete branch/reference integration pending; general multi-owner/branch Merge unspecified |
| Reliability / recovery | Original receipts and bounded transactions give honest unknown outcomes | No complete index repair, portable restore or hardware/fsync failure acceptance |
| Security / privacy | Explicit trusted-host boundary, HTTPS/session guards, randomized context-bound encryption | No whole-DB freshness witness, hostile-host protection or complete multi-user rights/key policy |
| Performance / scalability | Bounded graph/input APIs; no whole-history rewrite per Save | Receipt growth, repeated source work and coarse mutex need workloads/measurements |
| Maintainability | Pure domain and dependency DAG; stable record/version boundaries | Application authority concentrated in storage and status repetition across documentation |
| Interoperability / evolvability | Independent version domains and optional-record preservation design | Actual older-reader 20–27 checks, packages, MCP/provider protocols and writer schemas incomplete |
| Usability / accessibility | Source-neutral view controls, desktop themes/widths and exact undo concerns explicit | Latest live branch-switch/below-widget acceptance and complete keyboard/screenreader criteria missing |
| Portability / distribution | One embedded executable; development tooling excluded from release runtime | Portable TLS/keychain/signing lifecycle and academic converter packaging unresolved |
| Formal assurance | Proof digest accurately distinguishes model and extracted-helper evidence | Neither tests nor review abstraction establish whole-application correctness |

## Complexity and alternatives

Private working branches are an adopted design with a concrete need: retaining exact unpublished source for provenance without forcing Commit. Treating them as merely another public branch would lose privacy/source-type distinctions. The corrected split between text publication and private replacement batches is also intentional: a failed navigation update cannot undo already published text. The review does **not** recommend reverting those decisions or mutating immutable links. It recommends clear transaction ownership, bounded recovery and measured costs.

Some complexity is potentially avoidable: repeated serialization/decryption within one authorized transaction, duplicated current-status tables, and broad shared module access. These are improvement hypotheses until measured or shown to cause defects. Immutable retry receipts intentionally trade storage for durable reconciliation. Any receipt expiry or history deletion needs explicit policy; silent pruning is not an optimization allowed by this architecture.

Future integrations have sensible high-level safety rules: exact preview and approval, retained resources, separate identities, scoped context, provider uncertainty, bounded untrusted inputs and non-trusted egress denial. They remain **design gates**, not an executable architecture. The absence of precise federation/rights/package/compiler mechanisms should prevent premature implementation claims, without blocking the bounded local editor.

## Independent cross-view conclusions

Every catalogue write has a listed storage/transaction responsibility or an explicit missing-protocol marker. Every implemented read/write leaf cites code; future leaves do not acquire implementation through diagrams. Security-sensitive families carry current authority/source constraints. Data stores resolve to encrypted canonical objects, mutable protected slots, bootstrap/wrappers, process/browser display state, or explicitly future artifacts/outboxes. Provenance effects retain earlier sources and identity distinctions. The invariant, threat and failure matrices link these conclusions across process, ordering, state and data views.

The review found no cycle in the recognized static local crate/import graphs; it did not establish absence of runtime/callback/semantic cycles. It demonstrated a future two-replica structural counterexample and bounded acknowledgement/publication model properties, without claiming code correspondence. Documented limits are carried into findings rather than silently “fixed” in the diagrams.
