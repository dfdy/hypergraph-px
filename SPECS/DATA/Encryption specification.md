Question:
What would be needed to include a) efficient strong local file encryption and b) encrypted federation to other instances of the same software (possibly over the signal protocol). 

This would be for the purpose of distributed and collaborative document editing.

Would it benefit to write some parts of Hypergraph PX in Lean instead of Rust?

Answer:
# Encryption, encrypted federation, and formal verification for Hypergraph PX

Both encryption at rest and end-to-end encrypted federation are feasible without abandoning Hypergraph PX's single-binary Rust architecture. They would, however, require some important changes to its storage model, identity system, and version-control architecture.

My recommendation is to use Rust for the production application, authenticated encryption for local storage, Messaging Layer Security (MLS) for collaborative group key management, and Lean 4 for formally specifying and verifying selected graph and security invariants.

I would not implement a new cryptographic protocol, nor would I rewrite major parts of Hypergraph PX in Lean.

There are three distinct problems to solve:

1. Encryption at rest: Protecting documents, their histories, indexes, and metadata when the application is not authorised to access them.
2. Encrypted federation: Allowing independently operated instances to exchange changes without exposing document contents to intermediary servers.
3. Correctness: Ensuring that encryption, concurrent editing, provenance, and permissions cannot violate the mathematical rules of the document graph.

The third problem is where Lean could offer substantial value.

## 1. The proposed architecture

Hypergraph PX — Instance A

Rust server, graph engine, encrypted local storage

Authenticated, encrypted synchronisation

Instance B

Independent storage, authorised participants

Instance C

Offline editing, eventual synchronisation

Shared protocol guarantees

Signed changes · Immutable history · Key rotation · Membership control · Conflict resolution · Deterministic graph validation

One distinction must be made early: encrypted transport between servers is not necessarily end-to-end encryption. If each server decrypts documents to serve them, that server's administrator or a compromise of that server may expose the content.

For stronger confidentiality, document keys must remain with authorised client devices, and servers must primarily store and relay ciphertext. This affects browser editing, MCP access, search, and Zotero integration.

## 2. A. Efficient, strong encryption of local files

I recommend encrypted storage as a native capability, with encryption operating below the graph and document APIs.

### A layered encryption model

| Storage component                 | Recommended protection                                               |
| --------------------------------- | -------------------------------------------------------------------- |
| Immutable document revisions      | Per-object authenticated encryption                                  |
| Document manifests and snapshots  | Authenticated encryption with revision binding                       |
| Graph and full-text indexes       | Encrypted SQLite or an encrypted derived-index store                 |
| User credentials and private keys | Password-based key protection or operating-system keystore           |
| Backups                           | Separately encrypted, authenticated archives                         |
| Temporary files and logs          | Avoid plaintext materialisation; restrict and sanitise residual data |

The key design principle is to encrypt the complete historical graph, not just the currently visible Markdown files.

Otherwise, a paragraph might be encrypted in its current form but remain readable from revision history, cached exports, search indexes, or an earlier snapshot.

### Encryption algorithms

For individual content objects, I would favour a standard authenticated-encryption algorithm such as XChaCha20-Poly1305.

Authenticated encryption provides both confidentiality and integrity. Modifying encrypted data without the appropriate key causes authentication to fail.

XChaCha20-Poly1305 is suitable for application-managed object storage because its extended nonce reduces the risk of accidental nonce reuse when used correctly.

AES-256-GCM is also an established alternative, particularly on processors with AES hardware acceleration.

For the embedded database, SQLCipher is a practical candidate. It encrypts SQLite database pages and includes tamper detection and key derivation. Its maintainers describe relatively modest performance overhead for many operations, although Hypergraph PX would need its own benchmarks.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

signalapp/sqlcipher · GitHub



### Envelope encryption and key hierarchy

Do not encrypt every file directly with the user's password.

Instead, generate random cryptographic keys and protect them through a hierarchy:

User passphrase or device keystore

Key-encryption key (KEK)

Workspace master key

Revision objects

Separate derived or wrapped key

Graph indexes

Separate derived or wrapped key

Backups

Separate derived or wrapped key

A memory-hard password KDF such as Argon2id can derive the key-encryption key from a user passphrase. A randomly generated workspace key then encrypts the actual stored data.

This has several advantages: changing a password need not require re-encrypting every historical object; different workspaces can have different keys; and keys can be rotated without changing every document identity.

Passwords for login and passphrases used for storage decryption should also be treated as separate security functions, even if an interface makes their use convenient.

### A complication: content-addressed storage

Previously, we discussed using hashes to identify immutable revisions.

Encryption complicates this.

If objects are identified by:

\\[ h=H(\text{plaintext}) \\]

the hash can reveal when two encrypted objects contain identical data. It may also permit guessing attacks against predictable short passages if hashes are exposed.

Conversely, hashing ciphertext hides plaintext equality when encryption uses fresh random nonces, but identical plaintext may produce different object identifiers.

I would therefore separate:

- A logical revision identity, stable across authorised replicas.
- A private content digest, used internally for integrity and deduplication.
- An encrypted storage-object identifier, used to retrieve ciphertext.

The precise mapping would depend on the federation threat model.

Deduplication should be confined to an authorised encryption domain. Cross-user plaintext-based deduplication is not worth the potential information leakage.

This also means that Merkle graph integrity and content confidentiality must be designed together, rather than adding encryption to an already-finalised object-addressing scheme.

## 3. B. Encrypted federation: Signal Protocol or MLS?

The Signal Protocol is a credible option, but I would favour Messaging Layer Security (MLS) for Hypergraph PX.

Signal's Double Ratchet is particularly well suited to secure communication between two devices. MLS is designed for asynchronous encrypted communication among groups, with efficient membership changes and cryptographic key updates.

The IETF standardised MLS in RFC 9420, with its architecture described in RFC 9750.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.rfc-editor.org\&sz=32)

RFC Editor

+1



### Comparing the approaches

| Property                      | Signal-style sessions                                 | MLS                                 |
| ----------------------------- | ----------------------------------------------------- | ----------------------------------- |
| Two-party encryption          | Excellent fit                                         | Supported                           |
| Multi-user groups             | Requires group mechanisms beyond basic Double Ratchet | Designed for groups                 |
| Asynchronous messages         | Supported                                             | Supported                           |
| Group membership changes      | Application-specific group management                 | Integrated group key evolution      |
| Forward secrecy               | Supported                                             | Supported                           |
| Post-compromise recovery      | Supported under protocol conditions                   | Supported under protocol conditions |
| Rust implementation           | `libsignal`                                           | `OpenMLS`                           |
| Integration for Hypergraph PX | More application-specific group logic                 | Better initial fit                  |

The official [libsignal repository](https://github.com/signalapp/libsignal?utm_source=chatgpt.com) is written primarily in Rust internally, but explicitly states that use outside Signal is unsupported and that its APIs may change. It is licensed under AGPLv3.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



By contrast, OpenMLS provides a Rust implementation of MLS under the MIT licence. It is a library intended for integration into other applications.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



For a standalone FOSS Rust application with a careful licence-provenance register, OpenMLS is the more straightforward starting point.

### What MLS does not solve

MLS handles group key establishment and encrypted messaging. It does not, by itself, define:

- How users discover other Hypergraph PX instances.
- Which documents are shared with which groups.
- How historical revisions are transferred.
- How concurrent changes are merged.
- How attachments are encrypted.
- How revoked members lose access to future material.
- How devices verify each other's identities.
- How offline replicas catch up.
- How forks move between independently controlled workspaces.

Those remain Hypergraph PX responsibilities.

The result should be a federation protocol built on top of MLS, rather than a custom replacement for MLS.

## 4. Federation should be based on collaboration groups, not merely servers

An important architectural distinction is the relationship between a server instance and the people authorised to edit a document.

Suppose Instance A belongs to Alice and Instance B belongs to Bob, but each server serves multiple users.

The secure collaboration group should consist of authorised participants or their devices, rather than automatically trusting every user on both servers.

I would define:

\\[ \mathcal C=(M,K,P,G) \\]

where:

- \\(M\\) is the set of authorised member devices.
- \\(K\\) is the group's evolving cryptographic key state.
- \\(P\\) is the collaboration permission policy.
- \\(G\\) is the shared document-graph scope.

The group itself has a persistent identity, separate from the identities of its hosting instances.

An MLS group can distribute and update shared key material. The application must then enforce which encrypted document objects and operations are associated with that collaboration group.

### Encrypted synchronization

A document edit could produce an immutable operation:

```
Operation:
  id: op-184
  author: device-A
  logical_node: paragraph-P7
  parent_revision: revision-91
  new_revision: revision-92
  dependency_heads: [...]
  operation_kind: replace_content
  transaction_id: tx-144
```

This is then encoded, authenticated, encrypted, and transmitted to authorised replicas.

The receiver must verify the sender, group membership, operation format, causal dependencies, authorisation, and graph invariants before committing it.

Encryption authenticates communication but does not mean that a participating editor is trustworthy. A malicious authorised member could still attempt invalid transformations or inject hostile content.

## 5. Concurrency: encryption and collaboration are separate problems

Suppose Alice and Bob both edit paragraph P7 while disconnected.

Paragraph P7 — Revision 12

Alice

Revision 13A

Offline edit

Bob

Revision 13B

Offline edit

Reconciled revision 14

Preserves both parent revisions

MLS ensures Alice and Bob can exchange protected messages. It does not decide whether the edits are compatible.

For this, I recommend a hybrid approach:

At the text level: A CRDT could support concurrent character-level or span-level editing.

At the structural level: Graph operations should be validated against invariants such as acyclic containment, valid node identities, permitted transformations, and consistent historical references.

At the provenance level: Every merge should produce an explicit revision with all relevant parents preserved.

This is preferable to treating every type of graph modification as a generic CRDT operation.

A useful invariant is:

\\[ \forall r,\quad \operatorname{Parents}(r) \subseteq \operatorname{KnownRevisions} \\]

Another is:

\\[ \operatorname{Acyclic}(G\_{\text{containment}}) \\]

However, distributed systems add an important complication: two independently valid structural operations may become invalid when combined.

For instance, Alice moves section A under B while Bob simultaneously moves B under A. Each operation may be locally valid, but applying both creates a cycle.

Therefore, structural conflict resolution must be deterministic, preserve both operations in history, and either choose a canonical valid outcome or flag the conflict for human resolution.

A conventional text CRDT alone cannot guarantee this.

## 6. Encryption and unlimited version histories introduce a special problem

Hypergraph PX's immutable histories are useful for auditing and scholarly reconstruction, but they create a difficult security question.

If a participant is removed from a collaboration group, what happens to historical revisions?

Revoking access to future messages does not erase copies or keys the participant already possesses.

The system needs an explicit historical access policy.

For example, when someone joins a group, you might permit access to:

- Only documents and revisions shared after joining.
- The current document state and subsequent history.
- The complete historical graph, including previous revisions and provenance.

These policies have different key-distribution requirements.

I would not make access to all historical material automatic.

A separate historical archive key, or keys scoped by document and epoch, may be useful. Group membership changes should rotate future encryption keys, but they cannot retroactively make previously downloaded content inaccessible.

Likewise, a forked document might leave its original group. Its historical references may point to material that its new collaborators are not authorised to decrypt.

The graph needs to support opaque references: the existence of a relationship may be represented without exposing the content at its destination.

For more private workspaces, even the existence of the relationship may need to be hidden.

## 7. End-to-end encryption changes MCP and server-side editing

This is a particularly important consequence for your earlier architectural decisions.

You want Hypergraph PX to run as a Rust service, exposing a browser interface and an MCP server capable of educating models about its internal structure.

If encryption is handled by the Rust server, that server necessarily has access to plaintext while editing or compiling documents.

If encryption is handled exclusively by clients, the server may be unable to:

- Search encrypted document content.
- Compile documents from their Markdown fragments.
- Retrieve Zotero references embedded in encrypted content.
- Provide plaintext graph context to an MCP model.
- Perform server-side conflict resolution that requires reading the content.

I would therefore define two clearly distinguished modes.

|                                            | Trusted-server mode        | Client-side E2EE mode                           |
| ------------------------------------------ | -------------------------- | ----------------------------------------------- |
| Local data encrypted at rest               | Yes                        | Yes                                             |
| Server can decrypt authorised documents    | Yes                        | No, except where explicitly delegated           |
| Server-side full-text search               | Supported                  | Generally unavailable without additional design |
| Server-side MCP reading                    | Supported with permissions | Requires authorised client mediation            |
| Encrypted federation                       | Yes                        | Yes                                             |
| Protection from compromised hosting server | Limited                    | Stronger for content confidentiality            |
| Initial implementation complexity          | Lower                      | Higher                                          |

Both modes can share the same underlying graph schema, immutable revision semantics, and encrypted federation protocol.

A sensible implementation sequence is to begin with trusted-server mode and design the key-management abstractions so client-side E2EE can be introduced later without changing document identities or history formats.

Importantly, disabling user login by default for local deployments should not imply that federation permits unauthenticated access. Federation requires authenticated device identities and group authorisation regardless of the browser-login setting.

# 8. Would Lean be beneficial?

Yes, but primarily for formal verification, rather than replacing Rust as an implementation language.

Lean 4 is both a programming language and a proof assistant based on dependent type theory. Its small proof-checking kernel allows mathematical claims about programs to be checked mechanically.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://lean-lang.org\&sz=32)

Lean Language



For Hypergraph PX, this matters because many of the system's most important requirements are mathematical invariants.

Examples include the impossibility of introducing a cycle into the containment graph, preserving revision ancestry, and ensuring that merging concurrent operations cannot silently destroy recorded history.

### Where Lean would be useful

| Component             | Lean's potential value                                        | Recommendation            |
| --------------------- | ------------------------------------------------------------- | ------------------------- |
| Graph invariants      | Prove properties of containment and inclusion graphs          | High                      |
| Revision history      | Prove append-only ancestry and historical reachability        | High                      |
| Forking and merging   | Prove that transformations preserve provenance                | High                      |
| Concurrent operations | Verify selected conflict-resolution rules                     | High                      |
| Access control        | Specify and check permission invariants                       | High                      |
| Encryption primitives | Cryptographic implementation verification is specialised      | Use established libraries |
| HTTP server           | Limited advantage relative to engineering cost                | Rust                      |
| Markdown parsing      | Limited advantage                                             | Rust                      |
| Web UI                | Limited advantage                                             | Rust                      |
| Zotero integration    | Limited advantage                                             | Rust                      |
| MCP implementation    | Useful for selected permission rules, not the entire protocol | Mostly Rust               |

## 9. How Lean and Rust could work together

There are two principal approaches.

### Approach A: Formal specification in Lean, production code in Rust

This is my preferred starting point.

Write mathematical definitions and prove the desired properties in Lean.

For example, describe a graph transformation:

\\[ \operatorname{Move}(G,n,p)\rightarrow G' \\]

Then prove the invariant:

\\[ \operatorname{Acyclic}(G) \land \operatorname{ValidMove}(G,n,p) \Rightarrow \operatorname{Acyclic}(G') \\]

Similarly, define a revision commit operation and prove:

\\[ \operatorname{History}(G) \subseteq \operatorname{History}(G') \\]

under the assumption that the operation succeeds.

This would establish that a valid commit never destroys earlier historical revisions.

The Rust implementation would then be tested against the formally specified behaviour.

A limitation is that a proof of the Lean model is not automatically a proof that the Rust implementation matches it. That connection requires additional verification, refinement proofs, or testing.

### Approach B: Verify selected Rust code through Lean

This is more ambitious, but potentially valuable.

The Aeneas project translates supported Rust programs into functional representations that can be reasoned about in Lean and other proof assistants.

Aeneas already has a Lean backend, although its scope is limited, notably around unsafe Rust and concurrency.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub

+1



This suggests a useful development strategy: keep critical graph algorithms in small, pure, deterministic Rust functions that are suitable for formal verification.

For example:

```
Rust implementation
    │
    ├── Graph operation validator
    ├── Revision ancestry operations
    ├── Deterministic merge rules
    └── Permission decision functions
              │
              ▼
        Aeneas translation
              │
              ▼
         Lean 4 proofs
```

Such an architecture also improves ordinary testability, even before formal verification is introduced.

I would not make the production application dependent on launching Lean or running proofs during normal operation. Formal verification should be a development and CI concern, not a runtime dependency.

## 10. Which mathematical properties are worth proving?

I would initially select six properties.

1\. Acyclic containment

No sequence of valid structural operations can create a containment cycle.

\\[ \operatorname{Valid}(G)\land\operatorname{Apply}(G,o)=G' \Rightarrow\operatorname{Acyclic}(G'\_C) \\]

2\. Immutable historical preservation

Committing a new revision cannot modify or delete previously committed revision objects.

\\[ R(G)\subseteq R(G') \\]

This assumes the ordinary append-only operation model, excluding separately specified administrative retention or deletion procedures.

3\. Provenance preservation

Every newly derived revision retains valid references to its source revisions, including splits and multi-source merges.

4\. Deterministic reconstruction

The same immutable snapshot and compiler inputs produce the same output.

\\[ \operatorname{Compile}(S,C)=\operatorname{Compile}(S,C) \\]

More meaningfully, compilation must be a pure function of explicitly specified inputs, without hidden dependence on mutable live state.

5\. Convergent conflict resolution

If two replicas possess the same valid operations, their conflict-resolution procedure yields the same canonical graph state, regardless of delivery order.

\\[ \operatorname{Resolve}(O\_{\pi_1}) = \operatorname{Resolve}(O\_{\pi_2}) \\]

for permitted operation permutations after causal dependencies have been satisfied.

6\. Authorisation safety

No protected operation is accepted unless it has valid authorisation under the applicable collaboration policy and membership state.

These properties would not establish that the entire application is secure, but they would protect foundational assumptions on which many other features depend.

# 11. Recommended Rust and Lean architecture

I would introduce separate internal modules or workspace crates with clear responsibilities.

```
hypergraph-px/
├── crates/
│   ├── graph-core/
│   ├── revision-engine/
│   ├── composition-engine/
│   ├── provenance/
│   ├── crypto-storage/
│   ├── identity/
│   ├── collaboration/
│   ├── federation/
│   ├── mls-transport/
│   ├── policy-engine/
│   ├── zotero/
│   ├── mcp/
│   └── server/
├── proofs/
│   └── lean/
│       ├── Graph.lean
│       ├── Revisions.lean
│       ├── Provenance.lean
│       ├── Composition.lean
│       ├── Convergence.lean
│       └── Permissions.lean
├── tests/
│   ├── security/
│   ├── federation/
│   ├── crash-recovery/
│   └── property-based/
└── config.toml

```

This remains compatible with a single distributed executable. A Rust workspace with multiple crates does not require multiple runtime processes.

A release build can link the application into one binary, although dynamic system libraries may still be required depending on target and build configuration. Fully static builds would need deliberate target-specific support.

## 12. Configuration implications

The existing TOML configuration should be extended in its established security, storage, and federation sections, rather than introducing a second configuration system.

Conceptually:

```
[storage.encryption]
enabled = true
provider = "application"
algorithm = "xchacha20poly1305"
key_provider = "os_keychain"

[federation]
enabled = false
transport = "https"
e2ee_protocol = "mls"
allow_untrusted_peers = false

[collaboration]
enabled = false
conflict_strategy = "preserve_and_resolve"
history_sharing = "current_and_future"

[security]
require_signed_mutations = true
verify_remote_operations = true

```

These are proposed configuration keys, not a final interoperable schema. They would need corresponding definitions for key recovery, device enrolment, key rotation, remote identity verification, and migration between encryption modes.

For local at-rest encryption, a password-protected key file should be available as an alternative to an operating-system keystore, particularly for headless Linux deployments.

For unattended startup, a key must be provided by some available secret-management mechanism. That convenience reduces protection against certain kinds of host compromise and should be documented explicitly.

## 13. FOSS technologies worth considering

| Technology | Purpose                                           | Initial assessment                       |
| ---------- | ------------------------------------------------- | ---------------------------------------- |
| OpenMLS    | Encrypted collaboration groups                    | Preferred                                |
| SQLCipher  | Encrypted local database                          | Strong candidate                         |
| age        | Backup encryption and portable encrypted archives | Strong candidate                         |
| Lean 4     | Mathematical specifications and proofs            | Recommended                              |
| Aeneas     | Verification of supported Rust code               | Investigate                              |
| Loro       | Concurrent text and structured edits              | Evaluate against custom graph invariants |

The `age` Rust crate supports streaming file encryption compatible with the age file format, making it useful for backups and exports rather than necessarily as the application’s random-access object store.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.rs\&sz=32)

Rust



All actual dependencies, adapted source code, and conceptual influences should be entered into Hypergraph PX's existing FOSS attribution register with their versions, upstream licences, and provenance.

## 14. Suggested implementation order

Encryption should influence the core storage architecture from the beginning, even if federation is implemented much later.

| Stage | Work                                                                    | Why                                                     |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| 1     | Threat model, stable identities, key hierarchy, encrypted object format | Avoid storage-format redesign                           |
| 2     | Encrypted local objects, database, backup, and recovery                 | Establish secure local operation                        |
| 3     | Formal graph specification and initial Lean proofs                      | Stabilise invariants                                    |
| 4     | Signed mutation records and device identities                           | Prepare for independently operated replicas             |
| 5     | Offline operation exchange and deterministic merging                    | Prove collaboration works without encryption complexity |
| 6     | MLS integration and encrypted federation                                | Protect synchronised operations                         |
| 7     | Group membership, key rotation, revocation, historical access           | Complete collaboration security                         |
| 8     | Client-side E2EE mode and mediated MCP access                           | Extend protection to untrusted hosts                    |
| 9     | Adversarial testing, interoperability testing, and security review      | Verify integrated behaviour                             |

One particularly important milestone is Stage 5. I would first demonstrate that two disconnected instances can independently edit the same graph, reconnect, converge on a valid state, and preserve all historical branches.

Only then would I introduce the full MLS layer.

Otherwise, cryptographic protocol errors and distributed graph-consistency errors become extremely difficult to distinguish.

## Conclusion

Three decisions seem especially important for the future architecture of Hypergraph PX.

First, treat encryption as part of the storage and identity architecture. Immutable version histories, graph relationships, deduplication, and encrypted snapshots must be designed together. Encrypting a folder after the fact is insufficient.

Second, build federation around authenticated collaboration groups, not merely encrypted server-to-server connections. MLS, using an implementation such as OpenMLS, is better suited to this than directly adopting the Signal Protocol. Keep the encrypted messaging protocol separate from graph synchronisation and conflict resolution.

Third, use Lean to establish the correctness of a small, mathematically defined core, while implementing the application in Rust. This preserves performance and deployability while introducing much stronger assurances around histories, graph invariants, and distributed editing.

The most significant unresolved architectural choice is whether the eventual federation system should trust participating servers with plaintext or support genuinely client-held end-to-end encryption. That choice determines where editing, indexing, compilation, MCP access, and conflict resolution can safely occur.

I would design for both, but implement trusted-server encryption first, with explicit cryptographic boundaries that allow a later client-side E2EE mode.


Question:
In this scenario, would servers using two different federation approaches be able to share a document?

Answer:
Yes, provided Hypergraph PX is designed to support interoperability between federation approaches. However, two servers using different federation protocols would not automatically be able to exchange documents.

The crucial distinction is between the document format, the synchronisation protocol, and the encryption protocol. These should be separate layers.

For example, one server might use MLS for end-to-end encrypted collaboration, while another uses mutually authenticated HTTPS for server-to-server federation.

Both could share the same document graph format, version histories, and provenance model, even though their transport and encryption mechanisms differ.

## Three interoperability scenarios

| Scenario                                                   | Can they share documents? | Conditions                                                   |
| ---------------------------------------------------------- | ------------------------- | ------------------------------------------------------------ |
| Both use the same federation and encryption protocol       | Yes                       | Compatible protocol versions, identities, and permissions    |
| Different transports, same document synchronisation format | Yes                       | A compatible transport adapter is available                  |
| Different encryption protocols or trust models             | Conditionally             | An authorised party must translate or re-encrypt the content |

The third scenario is the important one.

A server using MLS cannot ordinarily forward encrypted document content directly into a different cryptographic system without some entity having the authority and keys necessary to decrypt and re-encrypt it.

This creates a trust boundary.

## How I would design this for Hypergraph PX

I would establish a common federation document protocol, with independently negotiable transport and encryption methods.

Instance A

MLS encryption

Instance B

HTTPS federation

Negotiated federation capabilities

Protocol versions · Cryptography · Identity · Permissions

Common document graph protocol

Nodes · Revisions · Forks · Snapshots · Provenance · Operations

Two servers would exchange their capabilities before establishing a collaboration.

For example:

```
{
  "protocol": "hypergraph-federation/1",
  "transports": ["https"],
  "encryption": ["mls-1.0", "tls-1.3"],
  "document_format": "hypergraph/1",
  "synchronisation": ["immutable-operations/1"],
  "history": ["full", "current-only"]
}
```

This is illustrative rather than an established protocol.

If both instances support MLS, they can establish a compatible MLS collaboration group, subject to compatible identity systems, cryptographic suites, and application message formats. MLS does not by itself guarantee complete application interoperability.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.rfc-editor.org\&sz=32)

rfc-editor.org



If only one supports MLS, they could still share documents through a deliberately authorised bridge or export operation, but not transparently retain the original end-to-end security guarantees.

### Three distinct sharing operations

I would distinguish:

- Direct federation: Both parties support a compatible secure collaboration protocol. They can synchronise the same evolving document graph.
- Bridged federation: An authorised bridge decrypts material in one security domain and re-encrypts it in another. This changes the trust boundary and must be made explicit to participants.
- Document transfer: A document, selected revision, or complete history is exported into a portable format and imported elsewhere. This preserves whichever history and provenance records the export contains, but does not necessarily establish ongoing collaboration.

The third option is especially important because it guarantees a practical interoperability path even where the federation implementations are incompatible.

## One architectural requirement I would add

I would define a mandatory interoperability baseline for Hypergraph PX instances:

1. A shared, versioned document graph and operation format.
2. A standard representation of immutable revisions, snapshots, and provenance.
3. Cryptographic identity and operation-signature verification.
4. Capability negotiation before collaboration.
5. A compatible minimum secure transport profile.
6. An explicit import/export mechanism preserving document identity and provenance where permitted.

Additional federation and encryption protocols could be supported through adapters.

However, I would not permit automatic security downgrades. If a document requires end-to-end encryption, the application should refuse to synchronise it through a weaker connection merely because that is the only protocol both instances support.

The user could explicitly authorise a separate export or bridge, subject to the document's collaboration policy.

The governing principle is that document identity, history, and provenance should be independent of the federation mechanism. Two instances should not need identical internal storage systems or identical encryption-at-rest implementations to collaborate. They need a compatible shared protocol and a security arrangement that all authorised participants accept.

This would make Hypergraph PX extensible without making its document format dependent on MLS, Signal, HTTPS, or any particular future federation technology.

Question:
Yes, potentially. This is a critical security vulnerability that Hypergraph PX must be designed to prevent.

If an attacker compromises a server and can modify its configuration file, they might attempt to change its operating mode from end-to-end encrypted (E2EE) storage to trusted-server operation, where the server has access to plaintext documents.

However, changing a configuration setting should never be sufficient to grant access to encrypted content.

The fundamental distinction is between:

- Configuration-based security: The application behaves securely because a setting instructs it to.
- Cryptographically enforced security: The application cannot decrypt protected content without the necessary cryptographic keys, regardless of its configuration.

Hypergraph PX should rely on the second.

## 1. What happens when a server is compromised?

Consider three possible architectures.

| Architecture                                                     | Can an attacker with server control decrypt content?                         |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Encryption key is stored on the server                           | Generally yes, if the attacker can obtain or use the key                     |
| Encryption key is derived from a password supplied to the server | Potentially, if the server is unlocked or the attacker captures the password |
| Keys remain exclusively on authorised client devices             | Not merely by changing server configuration                                  |

The third architecture provides the strongest protection against a compromised server, but even here there are qualifications.

If the server delivers the browser application's JavaScript or WebAssembly code, an attacker controlling that server could modify the client software to steal encryption keys or plaintext when an authorised user next opens the application.

Therefore, client-side encryption alone does not guarantee protection against a malicious server if that server also controls the code executing on the client.

## 2. How to prevent configuration-based security downgrades

For Hypergraph PX, I would make the security model a cryptographic property of each workspace, not merely a server setting.

### A. Bind encryption policy to the workspace

Each encrypted workspace should contain an authenticated security manifest recording its security requirements.

For example:

```
workspace_id: 8f4c...
encryption:
  mode: end_to_end
  minimum_protocol: mls-1.0
  server_decryption: forbidden
  key_custody: client_only
```

This is illustrative. In production, the manifest would use a canonical representation authenticated by authorised signing keys.

An attacker could modify a local copy of the manifest, but clients would reject an unauthorised change. They would also need protection against an attacker replaying an older, legitimately signed but less restrictive manifest.

Changing `server_decryption = true` in a TOML file would not create the missing decryption key.

### B. Prevent silent security downgrades

Moving from E2EE to trusted-server operation should be treated as a security-sensitive migration, not a normal configuration change.

I recommend requiring:

- Explicit approval from authorised workspace members according to the workspace's governance policy.
- Cryptographically authenticated approval records.
- Verification by clients independently of the hosting server.
- A new encryption-key distribution arrangement.
- Visible notification of the change before affected clients release any plaintext or keys.

For particularly sensitive workspaces, the policy could prohibit such migration entirely.

### C. Keep decryption keys outside the server's control

For genuine E2EE workspaces, the server should never receive the necessary plaintext keys.

Encrypted document content would be decrypted on authorised client devices.

This makes the difference between trusted-server and E2EE operation a question of who possesses cryptographic capabilities, not which options are enabled.

OWASP's cryptographic storage guidance similarly emphasises key separation and selecting protection mechanisms according to the threat model.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://cheatsheetseries.owasp.org\&sz=32)

OWASP Cheat Sheet Series



### D. Authenticate the client software

This is the less obvious but equally important requirement.

If the application is accessed through a website delivered by the compromised server, the attacker may be able to replace its JavaScript or WebAssembly and steal content when users decrypt documents.

To resist that, high-security deployments could use:

- A separately installed, signed desktop client.
- Independently verified client updates.
- Client-side checks of authenticated workspace security policies.
- Device-held keys that cannot be silently exported through ordinary application APIs.

Hardware-backed non-exportable keys can help, but they do not automatically prevent malicious client code from requesting decryption or reading the resulting plaintext.

This is one reason encrypted browser applications have a more difficult malicious-server threat model than independently distributed clients.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



## 3. What remains possible after a server compromise?

Even with these protections, an attacker controlling the server may still be able to:

| Attack                                      | E2EE protection                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Change `config.toml` to trusted-server mode | Does not grant decryption capability                                                            |
| Read stored document ciphertext             | Plaintext remains protected if keys are uncompromised                                           |
| Replace or delete encrypted documents       | Integrity checks can detect tampering, but cannot guarantee availability                        |
| Withhold synchronisation updates            | May be detectable through signed state comparison; cannot always be prevented                   |
| Replay older encrypted state                | Requires rollback-resistant client state or externally witnessed checkpoints to detect reliably |
| Impersonate another editor                  | Prevented only if editor signing keys and identity verification remain uncompromised            |
| Replace browser-delivered application code  | Potentially compromises plaintext and keys when users connect                                   |
| Steal an unlocked server-held key           | Potentially exposes the data protected by that key                                              |

Encryption protects confidentiality, but it does not automatically guarantee availability, freshness, or correct synchronisation. A compromised server can still disrupt the collaboration process.

## 4. What I would require in the specification

I would establish the following security invariant:

\\[ \boxed{ \text{Server configuration changes} \not\Rightarrow \text{New decryption authority} } \\]

More formally, let \\(K_d\\) represent the keys needed to decrypt document \\(d\\), and let \\(A(x,K_d)\\) indicate whether principal \\(x\\) possesses the necessary decryption capability.

Changing the server configuration from \\(C_1\\) to \\(C_2\\) must not, by itself, change:

\\[ A(\text{server},K_d)=0 \\]

into:

\\[ A(\text{server},K_d)=1 \\]

For E2EE workspaces, acquiring that capability must require a separately authorised cryptographic operation involving existing key holders.

This invariant would be an excellent candidate for formal modelling in Lean, although the proofs would depend on explicit assumptions about key custody, client integrity, and cryptographic security.

## 5. My recommendation for Hypergraph PX

I would implement three protections together.

First, make each workspace's security classification cryptographically authenticated and independent of the server's configuration file.

Second, ensure that genuinely end-to-end encrypted workspaces keep their decryption keys entirely outside the server's authority. A configuration change must never be able to obtain those keys.

Third, establish a trustworthy client distribution and verification model. This is essential because a compromised server that distributes the browser application may be able to undermine otherwise sound E2EE.

The implications for the architecture are significant: I would distinguish between server-controlled operational configuration and cryptographically enforced workspace security policy, with the latter taking precedence in every client and federation operation.

That makes it possible for Hypergraph PX to support both trusted-server and end-to-end encrypted workspaces without allowing a compromised server to silently convert one into the other.