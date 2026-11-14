# Process inventory — Stage B

18 parent responsibilities and 114 leaf processes. IDs are review identifiers, not new HPX object IDs. L = documented local behavior, G = gated local code, F = future incomplete mechanism, D = explicitly deferred. A leaf marked F/D is a reconstruction boundary, not an invented executable contract. Shared calls do not create second parents.

| Parent | Responsibility | Leaves | Catalogue |
| --- | --- | --- | --- |
| HPX-PROC-001 | Application and runtime lifecycle | 6 | [Details](process-catalogue/HPX-PROC-001.md) |
| HPX-PROC-002 | Workspace access and enrollment | 7 | [Details](process-catalogue/HPX-PROC-002.md) |
| HPX-PROC-003 | Durable editing and publication | 7 | [Details](process-catalogue/HPX-PROC-003.md) |
| HPX-PROC-004 | Owned editing and presentation | 7 | [Details](process-catalogue/HPX-PROC-004.md) |
| HPX-PROC-005 | Document composition and exact closure | 7 | [Details](process-catalogue/HPX-PROC-005.md) |
| HPX-PROC-006 | Graph validation and read projections | 8 | [Details](process-catalogue/HPX-PROC-006.md) |
| HPX-PROC-007 | Intellectual transformations | 7 | [Details](process-catalogue/HPX-PROC-007.md) |
| HPX-PROC-008 | Named and private working branches | 8 | [Details](process-catalogue/HPX-PROC-008.md) |
| HPX-PROC-009 | Comments and semantic assertions | 5 | [Details](process-catalogue/HPX-PROC-009.md) |
| HPX-PROC-010 | Identity, attribution and provenance | 6 | [Details](process-catalogue/HPX-PROC-010.md) |
| HPX-PROC-011 | Rights, permissions and reporting | 4 | [Details](process-catalogue/HPX-PROC-011.md) |
| HPX-PROC-012 | Human–agent collaboration | 6 | [Details](process-catalogue/HPX-PROC-012.md) |
| HPX-PROC-013 | Export, compilation and publication artifacts | 7 | [Details](process-catalogue/HPX-PROC-013.md) |
| HPX-PROC-014 | Import, backup and restore | 5 | [Details](process-catalogue/HPX-PROC-014.md) |
| HPX-PROC-015 | External integrations and shared interfaces | 6 | [Details](process-catalogue/HPX-PROC-015.md) |
| HPX-PROC-016 | Security, crypto and trust lifecycle | 7 | [Details](process-catalogue/HPX-PROC-016.md) |
| HPX-PROC-017 | Future collaboration and federation | 5 | [Details](process-catalogue/HPX-PROC-017.md) |
| HPX-PROC-018 | Assurance, build and governance | 6 | [Details](process-catalogue/HPX-PROC-018.md) |

## HPX-PROC-001 — Application and runtime lifecycle

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-001.001 | Start configured runtime | L |
| HPX-PROC-001.002 | Serve embedded frontend | L |
| HPX-PROC-001.003 | Shut down and reopen | L |
| HPX-PROC-001.004 | Discover an update | F |
| HPX-PROC-001.005 | Install an approved update | F |
| HPX-PROC-001.006 | Refresh manual development runtime | L |

## HPX-PROC-002 — Workspace access and enrollment

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-002.001 | Create encrypted workspace | L |
| HPX-PROC-002.002 | Bootstrap browser session | L |
| HPX-PROC-002.003 | Unlock with passphrase | L |
| HPX-PROC-002.004 | Lock workspace | L |
| HPX-PROC-002.005 | Enroll native keychain alternative | L |
| HPX-PROC-002.006 | Unlock explicitly through keychain | L |
| HPX-PROC-002.007 | Remove enrollment and recover orphan | L |

## HPX-PROC-003 — Durable editing and publication

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-003.001 | Authorize and freeze command | L |
| HPX-PROC-003.002 | Acknowledge mutable autosave | L |
| HPX-PROC-003.003 | Publish explicit Commit | L |
| HPX-PROC-003.004 | Reconcile uncertain result | L |
| HPX-PROC-003.005 | Recover acknowledged draft on restart | L |
| HPX-PROC-003.006 | Audit and rebuild recoverable indexes | F |
| HPX-PROC-003.007 | Decode and negotiate persistent versions | L |

## HPX-PROC-004 — Owned editing and presentation

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-004.001 | Map source and browser coordinates | L |
| HPX-PROC-004.002 | Apply formatting and table edits | L |
| HPX-PROC-004.003 | Navigate outline and structural selection | L |
| HPX-PROC-004.004 | Render math, tables and source guides | L |
| HPX-PROC-004.005 | Undo, redo and switch buffer state | G |
| HPX-PROC-004.006 | Persist display preferences and tooltips | L |
| HPX-PROC-004.007 | Check spelling locally | F |

## HPX-PROC-005 — Document composition and exact closure

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-005.001 | Create and open local document | L |
| HPX-PROC-005.002 | Arrange, move or reuse occurrences | F |
| HPX-PROC-005.003 | Resolve and reconstruct exact snapshot | L |
| HPX-PROC-005.004 | Include pinned content | F |
| HPX-PROC-005.005 | Resolve live includes safely | F |
| HPX-PROC-005.006 | Freeze query or selected composite closure | F |
| HPX-PROC-005.007 | Rename, archive or restore document | F |

## HPX-PROC-006 — Graph validation and read projections

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-006.001 | Validate expansion DAG | L |
| HPX-PROC-006.002 | Validate exact source anchors | L |
| HPX-PROC-006.003 | Page and compare immutable history | L |
| HPX-PROC-006.004 | Project selected hypergraph | L |
| HPX-PROC-006.005 | Read contributor publication evidence | L |
| HPX-PROC-006.006 | Browse predicate definitions and roles | L |
| HPX-PROC-006.007 | Query general concepts and backlinks | F |
| HPX-PROC-006.008 | Discover contextual logical equivalence | F |

## HPX-PROC-007 — Intellectual transformations

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-007.001 | Capture committed source reference | L |
| HPX-PROC-007.002 | Fork committed passage independently | L |
| HPX-PROC-007.003 | Review and publish Synthesis | L |
| HPX-PROC-007.004 | Link a retained passage | F |
| HPX-PROC-007.005 | Embed retained content | F |
| HPX-PROC-007.006 | Paste all, split or extract source | F |
| HPX-PROC-007.007 | Remove or clear private captured references | L |

## HPX-PROC-008 — Named and private working branches

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-008.001 | Create named child from committed snapshot | G |
| HPX-PROC-008.002 | Select and recover branch context | G |
| HPX-PROC-008.003 | Checkpoint unpublished working source | G |
| HPX-PROC-008.004 | Capture working source reference atomically | G |
| HPX-PROC-008.005 | Record exact promotion with Commit | G |
| HPX-PROC-008.006 | Replace eligible private references after Commit | G |
| HPX-PROC-008.007 | Fork unpublished checkpoint | G |
| HPX-PROC-008.008 | Merge same-identity branches | F |

## HPX-PROC-009 — Comments and semantic assertions

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-009.001 | Publish immutable passage comment | L |
| HPX-PROC-009.002 | Inspect comments against historical text | L |
| HPX-PROC-009.003 | Publish typed n-ary assertion | L |
| HPX-PROC-009.004 | Review assertion and retain ancestry | L |
| HPX-PROC-009.005 | Extend comment lifecycle | F |

## HPX-PROC-010 — Identity, attribution and provenance

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-010.001 | Resolve principal and device identity | L |
| HPX-PROC-010.002 | Represent group and delegated identity | F |
| HPX-PROC-010.003 | Track authored spans and attribution | F |
| HPX-PROC-010.004 | Retain exact transformation evidence | L |
| HPX-PROC-010.005 | Record consequential observable interactions | F |
| HPX-PROC-010.006 | Represent contested attribution | F |

## HPX-PROC-011 — Rights, permissions and reporting

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-011.001 | Capture rights-holder and licence claims | F |
| HPX-PROC-011.002 | Evaluate access and mandates | F |
| HPX-PROC-011.003 | Append permitted rights-conflict report | F |
| HPX-PROC-011.004 | Authorize historical selective disclosure | F |

## HPX-PROC-012 — Human–agent collaboration

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-012.001 | Connect an agent provider | F |
| HPX-PROC-012.002 | Approve and disclose context | F |
| HPX-PROC-012.003 | Receive suggestion or tool proposal | F |
| HPX-PROC-012.004 | Accept or reject reviewed change | F |
| HPX-PROC-012.005 | Cancel and inspect interaction history | F |
| HPX-PROC-012.006 | Convert selected formal material to Lean | D |

## HPX-PROC-013 — Export, compilation and publication artifacts

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-013.001 | Download current owned Markdown | L |
| HPX-PROC-013.002 | Freeze exact compilation closure | F |
| HPX-PROC-013.003 | Compile Markdown and HTML | F |
| HPX-PROC-013.004 | Provide bundled academic Pandoc formats | F |
| HPX-PROC-013.005 | Freeze citations and bibliography | F |
| HPX-PROC-013.006 | Deliver and expire artifacts safely | F |
| HPX-PROC-013.007 | Export provenance archive and relationship fallbacks | F |

## HPX-PROC-014 — Import, backup and restore

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-014.001 | Import portable workspace package | F |
| HPX-PROC-014.002 | Import Word review against exact base | F |
| HPX-PROC-014.003 | Create consistent encrypted SQLite backup | L |
| HPX-PROC-014.004 | Create portable encrypted backup | F |
| HPX-PROC-014.005 | Restore as a new workspace | F |

## HPX-PROC-015 — External integrations and shared interfaces

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-015.001 | Read Zotero desktop library | F |
| HPX-PROC-015.002 | Read Zotero cloud library | F |
| HPX-PROC-015.003 | Connect GitHub and select destination | F |
| HPX-PROC-015.004 | Publish reviewed Markdown to GitHub | F |
| HPX-PROC-015.005 | Store create-only encrypted remote backup | F |
| HPX-PROC-015.006 | Expose common REST and MCP commands | F |

## HPX-PROC-016 — Security, crypto and trust lifecycle

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-016.001 | Seal and open authenticated record | L |
| HPX-PROC-016.002 | Derive and rewrap passphrase key | L |
| HPX-PROC-016.003 | Enforce HTTPS/session/request guards | L |
| HPX-PROC-016.004 | Enforce future mode-based egress | F |
| HPX-PROC-016.005 | Rotate keys and recover freshness | F |
| HPX-PROC-016.006 | Install, renew and remove browser trust | F |
| HPX-PROC-016.007 | Revoke access and protect diagnostics | F |

## HPX-PROC-017 — Future collaboration and federation

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-017.001 | Exchange causal operations | F |
| HPX-PROC-017.002 | Reconcile concurrent text and structure | F |
| HPX-PROC-017.003 | Reconcile membership and historical keys | F |
| HPX-PROC-017.004 | Recover from partitions and retries | F |
| HPX-PROC-017.005 | Resolve cross-instance authority | F |

## HPX-PROC-018 — Assurance, build and governance

| ID | Process | Scope |
| --- | --- | --- |
| HPX-PROC-018.001 | Check mathematical models and extraction | L |
| HPX-PROC-018.002 | Validate complete edit/recovery workflows | L |
| HPX-PROC-018.003 | Assess performance, usability and accessibility | F |
| HPX-PROC-018.004 | Prepare explicitly authorized publication | L |
| HPX-PROC-018.005 | Record decisions and maintain traceability | L |
| HPX-PROC-018.006 | Review dependencies and build executable | L |
