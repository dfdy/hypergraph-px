# HPX LikeC4 specification

Start with [canonical scopes and editing rules](SPECIFICATION.md), then open **C1 / System context** in VS Code. [Specification ownership](specification-ownership.csv) identifies 24 diagram-owned scopes; [navigation](navigation.md) lists the architectural entry points among 45 views and visual entry points. Only affected supplemental contracts need to be read.

## Files

C1 sources are at the root; `C2/`, `C3/`, `C4/` and `Sequence/` hold the remaining levels. LikeC4 discovers the project recursively. Model elements are shared across files; saved layouts are in `.likec4/`. Audits/evidence are historical review records, not default specification reading.

## Visual conventions

Follow C1 → C2 → C3 overview → C3 expansions → C4. Put subject internals inside one named boundary and input/output neighbours outside; label flows consistently. Preserve IDs, owner layouts, blue/grey blocks, green/amber/grey implementation tags and simple smooth curves. Sequences use lifelines. See [layout conventions](layout-convention.md).

## Tooling

The local package pins LikeC4. Validate with `npm --prefix docs/architecture run validate` from the repository root. Use the VS Code diagram integration; do not open a browser unless requested. Do not build or launch HPX merely to edit the specification.

Follow the [change-sensitive validation cadence](../09-guides/reference/development-evidence.md#likec4-validation-cadence): no-layout feedback during edits, affected served-layout checks per stage, and full layout regression at coherent milestones or when global impact requires it. Reuse existing model services and serialize expensive layout checks.
