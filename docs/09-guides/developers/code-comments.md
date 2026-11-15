# Human-readable code comments

## Common metadata

- **ID:** `HPX-GUIDE-008`
- **Title:** Human-readable code comments
- **Purpose:** Apply and verify the owner-approved teaching-oriented commenting programme.
- **Level:** `09-guides`
- **Status:** `accepted`
- **Maintainer:** project owner; development agents
- **Applies to:** maintained authored application, test, proof and developer source; third-party code excluded
- **Upstream authority:** Owner-approved commenting plan in the current conversation; existing product contracts retain authority
- **Downstream dependencies:** [source review inventory](../../../shared/tooling/code-comment-inventory.json), comment checkers and CI
- **Verification:** TEST204 whole-source review and exact-byte closeout; TEST194–203 preserve earlier incremental scopes
- **Decision/history:** Direct owner approval of the programme and readable project/consumer/specification headers; no publication authority
- **Last reviewed:** 2026-11-15

This programme makes maintained code understandable to a competent developer who
knows the language and is new to HPX. It covers application code, tests, handwritten
proofs, developer scripts and authored HTML/CSS. Generated output and third-party
sources remain inventoried but excluded with an explicit origin. The unadopted frontend intake is outside maintained-source scope; the discovered baseline excludes it without reading its contents. Historical
archives, dependencies and build output are not programme inputs.

## Teaching standard

Explain purpose, decisions and substantial control flow, not merely symbol names.
A file is complete only after reading its implementation and reviewing its comments
against the relevant current contracts and tests. A scanner passing is insufficient.

- Start each module/file with its responsibility, important collaborators and
  boundaries. Use the required readable header below and state what its current implementation actually supports.
- Every function must have its own human-readable purpose comment, as defined below.
  Public visibility, descriptive names and short bodies do not remove this requirement.
- Explain public interfaces: inputs and coordinate units, result meaning, mutation,
  side effects, ownership/lifetime, failures and any important preconditions.
- Explain internal functions and substantial blocks sufficiently to follow the
  algorithm: why validation order matters, how state advances, why an early return
  is safe, and what must remain invariant. Do not annotate every obvious assignment.
- Document non-obvious type/field meanings, especially identity versus occurrence,
  historical versus mutable evidence, bytes versus UTF16, and acknowledgement versus
  Commit. Qualify one-owner implementation limits separately from multi-user scope.
- Explain security/permission boundaries, failure atomicity, uncertain outcomes,
  resource accounting, ordering and concurrency assumptions where they apply.
  Never put credentials, launch tokens, private examples or workspace data in comments.
- In tests, explain the scenario and the defect/invariant an assertion detects.
  In proofs, explain premises and strategy, distinguishing mathematical models,
  extracted-source correspondence and application acceptance.
- Link a precise current contract where it helps a reader; comments describe code
  and do not replace canonical specifications. Do not invent requirement IDs or
  imply that an adopted candidate design is implemented.

Use English and familiar language. Keep existing licence notices, source encodings
and line endings. Remove stale or misleading explanations; record actual code versus
contract discrepancies separately without silently changing behaviour.

### Blank lines and visual grouping

**Use more open (blank) lines between distinct parts to improve human readability.**
Source and comments should present clear visual groups, with space for the reader
to distinguish purpose, preparation, validation, processing and results.

- Use at least one blank line between distinct logical stages within a function,
  where the language and formatter permit it. Keep closely related statements
  together so each group expresses one coherent step.
- Separate functions/methods and distinct declaration groups with blank lines.
  Put the separator before the next function's purpose comment; keep that comment,
  its attributes/decorators and its function declaration attached.
- Separate the file header from the following code or declarations at the earliest
  legal position. Within headers, leave blank comment lines between the title,
  purpose, Source, creation provenance, latest edit, Used by, Specification and Boundary parts. Use blank comment
  lines between paragraphs or separate topics in longer explanations as well.
- In tests, visually separate preparation, the operation under test and verification
  when these are distinct stages. Apply the same grouping to fixtures and scripts.
- Prefer one blank line for ordinary separation; use a larger gap only for a major
  section when consistent with the language's normal style. Required formatter
  conventions, such as Python's separation of top-level definitions, take precedence.

Spacing is part of the teaching-quality review. Preserve significant indentation,
comment attachment, source line endings, literal text and runtime/proof behaviour.
Existing reviews do not establish compliance with this added requirement; review
and update dense sections as the commenting programme reaches them. Current presence
and fingerprint checks are not an automatic readability or blank-line audit.

### Purpose comments for every function

**Every maintained authored function must have a comment explaining its purpose.**
This is mandatory for public and private functions, methods, constructors,
accessors, nested/local helpers, test functions and fixtures, asynchronous functions,
anonymous functions, closures, lambdas and callbacks. Function declarations without
bodies, such as interface or trait methods, also need their purpose documented.
Existing generated/third-party exclusions remain; there is no exemption merely
because a function is short, obvious to its author or descriptively named.

Place the explanation directly above the function/declaration, or use the language's
normal documentation position, such as the first Python docstring. For an anonymous
function or lambda that cannot carry a docstring, put a clearly associated comment
immediately before its expression or on the same line. Make each function's purpose
unambiguous; a file header, section introduction or comment on an enclosing function
does not substitute for the individual explanation.

State what the function accomplishes in this component and why it is needed. A
short, specific sentence is sufficient for a simple helper; retain fuller contracts
and reasoning for complex operations. Do not merely repeat the name, signature or
“helper function”. For a test, state the behaviour or invariant it checks; for a
callback, explain what its event/argument handling achieves. For example, “Reject
coordinates from a stale editor buffer before mapping them to owned source” explains
purpose; “process range” does not.

Use Rust `///` for named functions/methods and ordinary comments for closures;
JavaScript/TypeScript JSDoc for exported functions and JSDoc or adjacent comments for
internal functions/callbacks; Python docstrings for named functions/methods and
adjacent comments for lambdas; Lean documentation comments for named definitions and
adjacent explanations for anonymous functions. Shell functions and functions in
embedded scripts follow the same purpose requirement using native comment syntax.
A valid, meaningful existing purpose comment satisfies the rule without duplication.

During review, enumerate all function declarations and expressions in the file,
including private/nested/test functions and callbacks. Check that each has its own
associated purpose explanation and that it matches the actual implementation. The
current scanner checks selected public Python and exported JS/TS declarations, not
all function forms; Rust's public documentation lint also does not establish this
universal coverage. Universal purpose compliance is a review obligation until those
checks are extended, and must not be claimed from a current scanner pass.

Earlier source reviews retain their original scope. Audit and record this additional
requirement before describing a previously reviewed file as compliant with the
all-functions rule; the specification change does not add comments to existing code.

### Readable file headers — standard revision 2

Every maintained authored file must begin with a readable project header at the
first language- and tooling-safe location. Preserve licence notices, shebangs,
encoding declarations and required import/directive ordering. For example, Lean's
module documentation belongs after imports; Python's module docstring precedes
`__future__` imports. Generated and third-party exclusions retain their origin rules.

Use this order and wording, adapted to the language's comment delimiters:

1. **Title:** `Hypergraph PX — <plain-language responsibility>`. Use the full project
   name, not just HPX, and a meaningful title rather than repeating the filename.
2. **Purpose:** one short paragraph explaining what this file does and why the
   responsibility exists. Expand unfamiliar HPX terminology on first use.
3. **Source:** a descriptive Markdown link labelled `Latest source on GitHub`,
   pointing to this exact file on the repository’s default branch. Use the format
   and publication distinction below.
4. **Agent provenance:** state `Created by an agent.` when the file’s creation
   provenance supports it, followed by the creation harness and model details below.
   Include the creation date, preserving it through later edits. Use the explicit
   unverified-origin/unknown-date wording when creation cannot be established.
5. **Latest edit:** list the latest editing agent by name, its harness/model details
   and the last-edited date, separately from original creation attribution.
6. **Used by:** the human-readable names of the components that actually use this
   file. Use established architecture names and verify them against call/import
   sites or current model relationships. Briefly name the interaction where useful.
7. **Specification:** Markdown links with descriptive labels to the current
   documentation defining the file's behaviour, invariants or workflow. Start with
   the owning LikeC4 definition when the scope is diagram-owned, followed by the
   precise supporting contracts needed to understand this file.
8. **Boundary:** a short paragraph when needed to explain a material limitation,
   caller responsibility or distinction from future capability. Retain existing
   security, authority, coordinate and proof-scope qualifications.

Separate these parts with blank comment lines. Use sentence case, ordinary prose
and a short bulleted link list; aim for about80 characters per line without breaking
URLs. Avoid decorative ASCII boxes, dense metadata banners, symbol dumps and repeated
filename labels. Agent-creation attribution and its harness/model versions are
required provenance fields, together with the latest editing agent, creation date
and last-edited date. Keep separate validation/review dates, source hashes and other
review metadata in the inventory; they are not the file’s editing dates.

The following example is written for `frontend/src/owned-source.js`. Its relative
links resolve from that source directory; other files must calculate their own links.
The example links to the [browser editor definition](../../06-subsystems/diagrams/browser/interface.c4)
and [text/anchor contract](../../05-domain/text-and-anchors.md). Its unknown
provenance markers demonstrate honest reporting, not a historical attribution.

```javascript
/**
 * # Hypergraph PX — Exact owned-source editing
 *
 * Keeps the original text intact while the browser editor displays an
 * LF-only projection. Copy, paste and undo preserve the owned source.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Unknown (not recorded).
 * Latest editing harness: Unknown (not recorded).
 * Latest editing model: Unknown (not recorded).
 * Last edited: Unknown (not recorded).
 *
 * Used by: Browser editor — CodeMirror state, clipboard and undo handling.
 *
 * Specification:
 * - [Browser editor responsibilities][editor-spec]
 * - [Exact text and anchors][text-spec]
 *
 * Boundary: Display positions are UTF16 offsets, not persisted UTF8 bytes.
 * A stale source mapping is rejected rather than corrected by guessing.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/owned-source.js
 * [editor-spec]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [text-spec]: ../../docs/05-domain/text-and-anchors.md
 */
```

Rust uses the same title and sections through `//!`; Python uses a module docstring
with a plain title line; Lean uses `/-! ... -/` after imports. JavaScript/TypeScript
uses a leading `/** ... */` block. Shell, CSS and HTML use their native comment forms
at the earliest safe location. The content and spacing are consistent across
languages; an identical decorative border or delimiter is not required.

**Agent creation and harness/model details:** every authored file header must carry
an agent-provenance statement and the following creation details, separated as a
readable group from the Source and Used by sections:

```text
Agent provenance: Created by an agent.
Created: <YYYY-MM-DD (UTC) or unknown>.
Creation harness: <name>; version/build: <recorded value or unknown>.
Creation model: <provider and model name/identifier>; revision: <recorded value or unknown>.
```

Use the exact harness name and version/build, and the model provider, model name,
exact identifier and revision where these are available in the creation record or
host-supplied metadata. Keep known details and explicitly mark each unavailable part
as `unknown` or `not recorded`. Do not guess a model from a product name, available
model menu, current session or Git commit author. For example, knowing the family
name alone does not establish an exact model identifier or dated revision.

The creation statement records origin, not the latest editor. An agent adding
comments to a pre-existing file must not claim to have created it or overwrite
verified creator/harness/model details with its own. Preserve established human,
agent or mixed creation provenance accurately. For legacy files with no established
creator, use `Agent creation unverified; original creator not recorded.` and mark
unavailable creation harness/model details `Unknown (not recorded).` Record the
attribution gap for follow-up; an unknown marker is not evidence of agent creation.
The separate latest-edit group below is mandatory and supersedes an optional
`Updated by an agent` note. It never replaces or establishes creation provenance.

For a newly created agent-authored file, record `Created by an agent.` immediately
and fill in the creation harness/model using the actual metadata exposed to that
agent. Missing version or model-revision information does not justify inventing it.
Retain this provenance through later edits and moves; it neither changes licensing
nor establishes authorship of quoted or imported source material.

**Latest editing agent and dates:** every header must also contain this separate
latest-edit group:

```text
Latest editing agent: <agent name/designation or unknown>.
Latest editing harness: <name>; version/build: <recorded value or unknown>.
Latest editing model: <provider and model name/identifier>; revision: <recorded value or unknown>.
Last edited: <YYYY-MM-DD (UTC) or unknown>.
```

Record the agent that actually edits this file; for the current Codex editing agent,
use `Codex (OpenAI coding agent)`. Keep known harness/model details and mark unexposed
versions or exact model identifiers/revisions unknown, using the same evidence rules
as creation metadata. Do not apply one coordinating agent's identity to files edited
by a different subagent; record that agent's known designation and metadata instead.

`Created` is the original file-creation date, not the date an agent first adds its
header. Preserve an established creation date when updating or moving the file. For
legacy files without reliable original-creation evidence, use `Unknown (not recorded)`;
a migration commit, checkout or filesystem timestamp alone does not establish it.

`Last edited` is the date of the latest actual content change, including comments,
header metadata and formatting. Obtain the date from the editing environment's
current clock and write `YYYY-MM-DD (UTC)`; an exact time, if recorded, uses ISO8601
UTC with `Z`. Do not substitute a validation date or last published Git commit for a
newer local edit, and do not change this field merely because a file was read or
checked. If a legacy last-edit date cannot be established, mark it unknown until an
actual edit supplies the current date.

Update the latest editing agent/harness/model and last-edited date together when an
agent changes the file, leaving creation attribution/date intact. If a human edits
later, record that latest edit/date accurately; preserve the last known editing-agent
entry with an explicit note that it predates the human edit, rather than attributing
the human's change to the agent. These entries describe file editing, not source
claim authorship, proof acceptance, publication or Git commit authority.

**Latest GitHub location:** the required Source URL is
`https://github.com/dfdy/hypergraph-px/blob/main/<repository-relative-file-path>`.
The configured repository is `dfdy/hypergraph-px`, and its default branch is `main`
(as confirmed by `origin/HEAD`). Use that moving branch, not a commit SHA, release
or tag, a literal `latest` path, or a developer's feature branch. Omit line-number
fragments so the link continues to identify the whole file after edits. Preserve
path case, use forward slashes and URL-encode individual path segments when needed.
Update the header in the same change as any file move or rename; each file links
to itself, not to its containing folder or an example file.

“Latest” means the latest **published default-branch version**, which can differ
from the local checkout. For a new or moved file not yet on `main`, retain its
intended Source URL and state `publication pending` next to the link; do not claim
remote availability until it is actually published. A Source link grants no
permission to commit, push or publish and does not replace exact-source verification.
If the repository's default branch changes, update the convention and affected
headers as a separate maintenance change.

**Consumer accuracy:** “Used by” describes logical users of this source, not a new
process, executable or module requirement. Distinguish current from planned users;
put planned consumers in a separately labelled sentence only when a current design
specifies them. For standalone tooling, name the developer workflow or CI runner.
For test/proof files, name the relevant test runner or assurance workflow and the
component whose contract is checked; do not imply production calls test code. If
there is no current caller, say so rather than inventing one. Component IDs may
supplement a friendly name when needed for precision; IDs alone are insufficient.

**Link accuracy:** use source-relative Markdown links to current numbered docs,
including a stable section anchor when it narrows the contract appropriately. Check
both the file and any anchor. Use governing definitions, not an implementation file,
old execution receipt or historical archive as a substitute for specification. Link
to all material governing contracts without copying their requirements into the
header. A link establishes definition location, not implementation completeness.
If no adequate specification exists, state that gap accurately and record a finding;
do not invent a contract or mark the file fully compliant with this header standard.

**Review and rollout:** update headers when callers, responsibility or governing
contracts change. Review purpose, the exact-file/default-branch Source URL, creation attribution
and harness/model evidence, latest editing-agent/date metadata, consumer evidence,
link targets and boundary
claims together. The existing scanner checks module-comment presence and reviewed
bytes; it does not yet enforce these header fields or verify their links. Those are
explicit review obligations, not claimed automated checks. Prior source reviews
remain evidence of the earlier standard; revision2 header compliance requires an
additional recorded review. Adding this specification does not retrofit existing
headers or complete the outstanding whole-file commenting programme.

### Language conventions

Rust uses `//!` for modules and `///` for interfaces, variants and meaningful fields.
Include `# Errors`, `# Panics` or examples when applicable; do not invent a panic or
repeat a signature mechanically. Reviewed Rust modules enable `missing_docs` locally
until whole-crate coverage permits a crate-level gate. Doc links must resolve.

JavaScript/TypeScript uses `/** ... */` for exports and ordinary `//` explanations for
internal logic. State coordinate units and asynchronous/mutation contracts in prose;
JSDoc types are useful when they disambiguate, not as compulsory signature copies.

Python uses actual module/class/function docstrings and `#` for algorithm reasoning.
Lean uses `/-! ... -/` for model scope, `/-- ... -/` for declarations and `--` for proof
steps; comments must not overstate the checked theorem. Shell uses `#` below the
shebang, CSS uses `/* ... */`, and authored HTML uses `<!-- ... -->`.

For example, “convert the range” is insufficient. Explain that browser positions are
UTF16 cuts tied to the exact owned buffer, that persisted offsets are UTF8 bytes,
and that a stale or split-scalar range fails instead of being corrected by guessing.
For an early acknowledgement return, explain whether it reconciles the original
operation or admits a new write, and what happens to newer local typing.

## Inventory and rollout

TEST204 records the completed whole-file review of 258 authored maintained files,
with five generator-origin exclusions. The [current rollout evidence](../../08-assurance/evidence/code-comment-rollout.json)
binds every review to exact source bytes. This is a maintained baseline: later edits
require renewed review, and passing presence checks alone never establishes quality.
Third-party components merely used by HPX are outside this authored-source programme.
Intentional missing-comment test inputs remain negative fixture data; authored
executable code embedded in source strings carries native purpose comments and
separate executable-syntax preservation evidence.


The current machine-readable inventory is
[code-comment-inventory.json](../../../shared/tooling/code-comment-inventory.json).
Every discovered source has a responsibility, risk, batch and disposition:

- `pending`: teaching-quality review is outstanding, even if useful comments exist.
- `reviewed`: explanations have been inspected and are bound to exact source bytes,
  a review date, reviewer and specific notes. This is review evidence, not approval.
- `excluded`: generated or third-party source with its generator/origin and reason.
  Improve the generator or surrounding handwritten integration instead.

Complete work in these batches, including related tests/proofs where practical:

1. Pilot: Rust fragment planning, browser exact-owned source, launch-output handling,
   Python checker and historical rank/path proof; calibrate the shared standard.
2. Domain: identities, coordinates, selections, closure and pure validators.
3. Persistence/security: crypto, keychain, storage, transactions, compatibility,
   authority and recovery.
4. Runtime/adapters: shared API, acknowledgement/retry and browser runtime boundaries.
5. Presentation: editor, history, graph, selection and interaction behaviour.
6. Remaining tooling, tests, handwritten proofs and authored presentation assets.

Review the whole file, not only exported declarations. For each completed batch,
record remaining deficiencies and discrepancies, update current execution/test
records, and preserve the exact review notes. Never mechanically fill comments from
symbol names or promote a file based on comment density.

## Checks and review workflow

Run `python3 shared/tooling/check_code_comments.py --json` for the incremental gate.
It inventories untracked source too, excludes hidden/local/dependency trees without
opening them, checks reviewed hashes and module documentation, inspects public Python
definitions through its AST and exported JS/TS declarations through the locked
TypeScript parser. Install existing locked frontend tooling if absent; no new parser
or runtime dependency is introduced. Rust compiler lints check documented Rust
modules. Lean explanation quality and internal block coverage remain review duties.

The CI workflow runs scanner fixtures and the incremental gate against the previous/base commit. `--base-ref COMMIT` prevents reviewed dispositions from being downgraded, requires a reason for retired reviewed files, and requires updated review notes when reviewed bytes change. It reads Git objects without fetching or switching branches. Pending baseline
work remains visible, never counted complete. Use
`python3 shared/tooling/check_code_comments.py --require-complete --json` at programme
closeout: any pending file makes this fail. A newly discovered source without a record,
a removed source with a stale record or modified reviewed bytes also fails. Normal
checks never rewrite records or approve reviews automatically.

When changing a reviewed file:

1. Inspect the code, relevant current contracts and meaningful tests. Enumerate every
   function/declaration/callback and verify its individual purpose comment. Update module,
   interface and internal explanations together; record actual discrepancies.
2. Check executable tokens/AST against the pre-edit source, preserving strings and
   template/regex literals. Compiler/lint attributes and documentation infrastructure
   are explicit exceptions, not hidden behaviour changes. Report unsupported
   equivalence comparisons rather than claiming a universal proof.
3. Run change-sensitive syntax, doc examples and Tier A/B/C checks. Recheck proof
   fingerprints and assumptions if hashed proof inputs change. Preserve frozen as-run
   reports; new evidence records the new source instead of rewriting old checks.
4. Explicitly renew the hash/reviewer/date/notes after review; do not run a blanket
   “refresh hashes” command as a substitute. Reviewers must explain the rationale,
   error paths and scope boundaries they checked.

At release milestones, reconcile the complete inventory, exclusions and outstanding
findings. Do not add a time-based review timer or comment quota. Full completion means
all maintained files reviewed, every exclusion justified, no unresolved misleading
comments and all applicable checks passing. The inventory is authoritative for
progress; establishing CI and completing the pilot does not complete the rollout.
