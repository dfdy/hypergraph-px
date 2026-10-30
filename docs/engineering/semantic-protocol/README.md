**In short:** HPX-SCP keeps people responsible for what the rules mean, tools responsible for checking their integrity, and agents focused on the minimum verified instructions they need.

# Hypergraph PX Semantic Communication Protocol (HPX-SCP) — Minimum Sufficient Protocol

**Clearer coordination between development agents, with less context to carry.**

**Status:** v0.5.0 proposal — requires owner approval before adoption.  
**Scope:** Coordination between agents developing Hypergraph PX (HPX), not HPX's runtime data model.

## Why it exists

HPX is being developed by agents that plan, implement, review and hand work to one another. Passing entire specifications or long conversations between them consumes context, repeats information and leaves room for different interpretations. When an agent's context is compacted, important instructions may also be lost or distorted.

The **Hypergraph PX Semantic Communication Protocol (HPX-SCP)** gives agents a shared way to describe requirements, decisions, implementation evidence, verification, issues and handoffs. The goal is **minimum sufficient context**: use as little context as possible *without losing the instructions needed to do the work correctly*.

## The idea in one minute

**People maintain the canonical Markdown specification. Tools verify it. Agents receive only relevant, verified YAML.**

```text
PROTOCOL.md
  canonical human-readable rules   <- people can inspect and amend them
  appended semantic YAML           <- agents can consume them consistently
  integrity manifest               <- detects unsynchronised changes
         |
         v
independent bootstrap verifier     <- checks before agents trust the YAML
  validates both SHA-256 hashes
  checks deterministic YAML correspondence
         |
         v
minimum sufficient YAML packet     <- only the rules needed for this task
         |
         v
agent
```

**Why keep Markdown canonical?** The protocol governs how agents work, so its meaning must remain understandable and controllable by a person. YAML is a machine-oriented representation of those rules, not a competing authority.

**Why bootstrap?** An agent should not have to read the whole specification—or trust a potentially stale YAML appendix—just to begin work. A small verifier checks the two complete portions outside the model's context: one SHA-256 digest for the human-readable text, one for the YAML. It also checks that the YAML corresponds to the prose through deterministic regeneration. If verification fails, **no protocol packet is loaded**. The hashes themselves stay out of routine agent prompts.

**Why a tiny kernel?** The protocol needs enough fixed rules to know *who* an instruction belongs to, *which version* applies, *what has authority*, *whether it is valid*, and *how it may be amended*. Keeping these five concerns—identity, versioning, authority, validation and amendments—small avoids a circular dependency on the very protocol being checked.

The hashes detect accidental divergence; they do not prove who authorised an edit. Repository permissions and review procedures still provide that protection.

## Try it

From the repository root, after installing the kit's dependencies:

```bash
# Check both representations before trusting either one
python3 scripts/bootstrap_semantic_protocol.py

# Load only the verified rules relevant to implementation
python3 scripts/protocol_context.py --for implement

# Add a specific record contract when the task needs it
python3 scripts/protocol_context.py --for implement --for records \
  --record-type implementation_evidence
```

The repository's `AGENTS.md` should point to these commands rather than reproduce the specification. **Why?** Duplicated instructions waste tokens and can become outdated. An agent can request more verified scopes when needed; smaller context must never mean omitting an applicable constraint.

## What agents exchange

Durable records describe `requirement`, `proposal`, `decision`, `implementation_evidence`, `verification_result`, `issue`, `handoff` and `protocol_change`. Each has a stable identity, declared authority and typed relationships. **Why?** Agents can refer to the same decision or test evidence without repeatedly summarising it, and they can distinguish an approved requirement from a suggestion or an observation.

**YAML is the standard format for semantic instructions and agent packets** because it is structured and easy to inspect. Existing durable records remain supported as schema-validated JSON for compatibility; JSON is not an alternative protocol-instruction format.

## Keeping the protocol current

Agents may introduce **small, backward-compatible extensions** when the existing vocabulary is insufficient. They must first amend the canonical prose, regenerate the YAML and integrity manifest, run checks, record the amendment and publish it to the shared amendment registry.

**Why allow this?** Agents encounter communication needs that the original designers may not anticipate. **Why require a shared registry?** Without it, different agents could silently develop incompatible local conventions. Changes to established meanings, security, approval rules, the bootstrap kernel or human-readable canonicality still require **explicit owner approval**; the protocol never grants additional tool or repository permissions.

## Surviving context compaction

After context compaction or session recovery, agents reverify the protocol, reload the relevant YAML packet and reconcile their task state with persistent evidence. A compact handoff helps recover progress but does not replace authoritative records.

**Why?** Conversation summaries are useful working memory, not a reliable source of governing instructions. Recovery must work even when the agent cannot remember the previous session accurately.

## Where to look

- [`docs/engineering/semantic-protocol/PROTOCOL.md`](docs/engineering/semantic-protocol/PROTOCOL.md) — the source of authority: Markdown rules, YAML appendix and integrity manifest.
- [`AGENTS.md.fragment`](AGENTS.md.fragment) — the short entry point for repository agents, avoiding pasted protocol text.
- [`scripts/`](scripts/) — verification, scoped loading, recovery, amendments and validation outside model context.
- [`tests/`](tests/) — checks that changes do not silently break integrity or compatibility.
- [`CHANGELOG.md`](CHANGELOG.md) — why and how the protocol has evolved.