**In short:** HPX-SCP keeps people responsible for what the rules mean, tools responsible for checking their integrity, and agents focused on the minimum verified instructions they need.

# Hypergraph PX Semantic Communication Protocol (HPX-SCP)

**A shared YAML language for agents to prompt each other clearly, with minimal context.**

**Version:** 0.6.1 · **Status:** proposed integration package; not installed in HPX.

## Why it exists

Development agents often pass one another long prompts, recreate context, or interpret the same instruction differently. HPX-SCP gives them a compact, shared way to **ask, answer, clarify, report and hand work off**. Once they have established the protocol, both agents send and receive **the YAML itself, inline in their messages**. A link to a YAML file is not a prompt.

The point is *inter-agent prompting*. Hash verification, record keeping, context recovery and agent-maintained amendments support that exchange; they are not substitutes for it.

## The idea in one minute

1. **Discover:** An agent instructed to use HPX-SCP sends the other agent a small YAML `hello`. Why? It must not assume its partner already knows the protocol.
2. **Propagate if needed:** If the recipient replies `need`, send the complete protocol as a separate bundle—not as a long language-model prompt. Why? A new partner needs the same definitions before receiving an SCP task.
3. **Verify and agree:** The recipient uses independently trusted tools to check the human-canonical Markdown, its appended semantic YAML, two hashes and version. It replies `ready` only for a matching verified protocol. Why? Agreement about meaning matters more than matching syntax.
4. **Prompt in both directions:** Agents exchange validated YAML `request`, `response`, `clarification`, `error`, `handoff` and `amendment_notice` messages **as message text, never as file references**. Why? Shared structures reduce interpretive and context overhead.
5. **Recover and evolve:** Reload verified scopes after compaction; register compatible extensions in the shared protocol. Why? Collaboration must survive sessions and improve without creating private dialects.

```text
Agent A           permitted transport          Agent B
  |-- hello ------------------------------->|
  |<---------------------- ready / need ----|
  |-- verified bundle (if needed) -------->|
  |               [verify / install via trusted tooling]
  |<------------------------------ ready ---|
  |-- YAML request ------------------------>|
  |<------------------------ YAML response -|
```

## What a message looks like

```yaml
scp: HPX-SCP
version: 0.6.1
kind: request
id: m-001
sender: architect
recipient: implementer
conversation: dissertation-editor
body:
  action: implement
  target: ClosedComposition
  requirements: [REQ-031, REQ-042]
  constraints: [preserve_revision_history]
```

The reply is another YAML message with `kind: response`, a `reply_to: m-001` reference, and an outcome such as `status: completed`. The sender must not invent evidence or claim tests passed without running them.

**Why YAML?** It retains the readable, indented form of a semantic sketch while allowing strict validation. YAML is the *required* inter-agent message format; historical durable records remain schema-validated JSON for backward compatibility.

## Send YAML directly between agents

**Why inline?** If Agent A sends a path such as `request.yaml`, Agent B has only received a pointer. It has not received the actual task in the shared language. A conforming SCP message contains the full YAML envelope and the task-specific body in the agent-to-agent message itself.

The reference CLI reads YAML from stdin and writes **validated message YAML to stdout by default**. For example, once the two agents have completed the readiness handshake:

```bash
# Agent A: prepare an inline YAML request (no request.yaml file).
printf 'action: implement\ntarget: ClosedComposition\n' | \
  python3 scripts/scp_wire.py send --kind request \
    --sender architect --recipient implementer \
    --conversation demo --state-dir state-a
```

Agent A sends the resulting YAML text itself through its permitted communication channel. Agent B must receive that text, not a path. The receiving agent can validate the received text:

```bash
# Agent B: paste/pipeline the actual received YAML into stdin;
# the validated complete message is emitted on stdout.
python3 scripts/scp_wire.py receive --local implementer --state-dir state-b
```

Both agents include their full YAML message envelopes when communicating. Similarly, the `hello` and `ready` handshake commands emit their YAML text by default:

```bash
# Agent A: output a YAML hello message and send those bytes/text to B.
python3 scripts/scp_wire.py hello --sender architect \
  --recipient implementer --conversation demo --state-dir state-a

# Agent B: supply the received hello text via stdin; send the YAML reply back.
python3 scripts/scp_wire.py answer-hello --local implementer --state-dir state-b

# Agent A: supply the received reply text via stdin and confirm readiness.
python3 scripts/scp_wire.py accept-ready --local architect --state-dir state-a
```

These commands do **not** directly connect the agents; their existing permitted messaging channel transports the YAML text. The recipient must not execute the task before a verified `ready` session is established. The CLI can still accept local files using `--input`, `--output` and `--body-file`, but **sending only those file paths to the other agent never constitutes an SCP message**.

### When a peer needs the protocol

A peer that replies `need` requires the verified **complete protocol bundle** via a permitted file-transfer mechanism. This is the exception to inline task messaging: a protocol installation bundle is not an ordinary prompt. An `offer` message is still sent as inline YAML, with `bundle_ref` naming the out-of-band bundle. The receiving side stages and verifies it with independently trusted tooling, and cannot respond `ready` until its own trust rules permit activation.

```bash
python3 scripts/scp_wire.py bundle --output scp-protocol.zip
python3 scripts/scp_wire.py inspect-bundle --input scp-protocol.zip \
  --stage-dir staged-protocol
```

The reference CLI validates the format and session state, not agent execution, transport identity or owner authorisation.

## Human oversight without wasting context

`docs/engineering/semantic-protocol/PROTOCOL.md` has three parts: **canonical human-readable Markdown**, an appended machine-readable YAML projection, and an integrity manifest containing exactly two SHA-256 digests. A standalone verifier checks them *outside* the agent's context and rejects a mismatch or semantic divergence. Why? Agents need dependable shared rules without carrying the entire policy or its hashes in each prompt.

```bash
# Emit only the verified YAML rules and message contract needed to communicate:
python3 scripts/protocol_context.py --for negotiation
python3 scripts/protocol_context.py --for exchange --message-kind request
python3 scripts/protocol_context.py --for exchange --message-kind response
```

The compact bootstrap kernel governs identity, version, authority, validation and amendment. Repository `AGENTS.md` should point to the commands above, not paste the full specification into every session.

## Continuity and improvement

Agents must reverify protocol state and reload scoped YAML after recognised compaction or session resumption. Saved handoffs are working notes, not authority. Why? Summaries can discard governing details.

Agents may add **compatible** message kinds, optional fields and relationships when real communication needs arise. They update the canonical Markdown first, regenerate the YAML and both hashes, test the change and register it for all peers. **Breaking changes and changes to authority, security, the bootstrap kernel or human canonicality require owner approval.** Why? The communication language should improve through use without splitting into incompatible private variants.

## Where to look

- `docs/engineering/semantic-protocol/PROTOCOL.md` — authoritative rules, generated YAML and two-hash integrity manifest.
- `scripts/scp_wire.py` — discovery, readiness, protocol-bundle transfer and bidirectional YAML message checks.
- `scripts/protocol_context.py` — minimal verified YAML instructions for a task or message kind.
- `scripts/bootstrap_semantic_protocol.py` — fail-closed verification performed outside model context.
- `scripts/protocol_recovery.py` and `scripts/protocol_amendments.py` — continuity and controlled evolution.
- `AGENTS.md.fragment` — short instructions to merge into the repo's agent guidance.
- `tests/` — old-record compatibility, integrity, handshake, negotiation and exchange tests.

**Adoption:** This is a proposed repository kit, not an alteration to a live HPX checkout. Review it, merge the agent guidance without replacing existing project authority, and run `python3 -m unittest discover -s tests -p 'test_*.py'` before adoption.
