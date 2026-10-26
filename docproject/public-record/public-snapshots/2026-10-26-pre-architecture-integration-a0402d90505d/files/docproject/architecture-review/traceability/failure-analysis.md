# Failure and recovery matrix

This matrix separates local transaction guarantees, external compensation, explicit uncertainty and missing recovery. [Recovery view](../diagrams/recovery/029.svg) and [findings](../findings/README.md) explain scope.

| Failure | Process | Guarantee / observation | Recovery / remaining boundary | Evidence status |
| --- | --- | --- | --- | --- |
| Wrong credential/context | 002.003 / 016.001 | Authentication fails without protected disclosure or write | Passphrase recovery only under valid wrapper | Crypto/storage tests reported |
| Invalid origin/session/framing | 016.003 | Reject before protected route; no plaintext fallback | Correct caller/configuration; no warning bypass | Actual transport rejection evidence reported |
| Stale head/generation/source range | 003.001 / 006.002 | Conflict; no publication | Explicit recapture/review; never substitute newer text | Storage/domain frozen-operation tests reported |
| Changed operation ID reuse | 003.004 | Digest mismatch conflicts | Use original frozen intent or new reviewed operation | Receipt replay tests reported |
| Lost/delayed Save acknowledgement | 003.002 / 003.004 | Outcome unknown; preserve later source and original context | Reconcile original receipt; newer typing remains queued | Prior real workflow; latest branch integration pending |
| Crash before COMMIT | 003.003 | No partial published object/head/receipt state | Reopen old state, retry original command | Subprocess crash/fault tests reported |
| Crash after COMMIT, before reply | 003.003 / 003.004 | Full publication plus original receipt exists | Reopen/reconcile, never create duplicate revision | Subprocess crash/retry tests reported |
| Crash between text promotion and replacement | 008.005-.006 | Text remains committed; links may remain exact working-source references | Inspect pending candidates; retry bounded separate batch under current permission | Backend tests; actual cross-subsystem workflow pending |
| Native create succeeds, DB fails | 002.005 | Remove only just-created expected native item | Passphrase remains; orphan inspected explicitly after crash | Isolated keychain fault/native tests reported |
| DB wrapper removed, native delete fails | 002.007 | No native unlock through deleted wrapper; schema stays 2 | Retry exact cleanup before lock; scoped inspection after loss of memory state | Removal-order/pending cleanup evidence reported |
| Corrupt/missing authenticated source | 003.005 / 006.002 | Fail closed; legacy clipboard can expose removable opaque entry per contract | Preserve DB; exact valid backup or separately designed repair | No automatic newest/text-match fallback; repair protocol gap FIND-003 |
| Resource limit/quota exceeded | 006.001 / 006.004 / 007.001 | Atomic reject/budget/incomplete error; no silent history pruning | Narrow scope or explicit user action; quotas are not retention deletion | Bounds unit tests; workload/latency evidence incomplete |
| Unsupported schema/record version | 003.007 | Format error, preserve original bytes | Supported reader/approved backed-up migration only | Wrapper checks; actual older-reader 20–27 pending |
| Whole DB authentic old image | 016.005 | Current design may authenticate old state; no freshness witness | No promised detection; owner scope resolution needed | Documented residual limit, no actual rollback experiment |
| Disk-full/fsync/power loss/corrupt backup | 014 / 018.002 | Guarantee conditional on VFS/fsync/hardware; broader recovery unspecified | Select failure envelope and tested restore design | No power-loss/fsync fault acceptance claimed |
| Provider accepts write, reply lost | 015.004 | Explicit unknown remote result | Provider-specific state inspection under frozen job; no blind overwrite | Future only; mock/fault protocol to specify |
| Host compromise or malicious delivered client | 016 | Unlocked plaintext/keys accessible; TLS/at-rest crypto insufficient | Independent trusted client required for stronger hostile-host objective | Explicit environmental assumption; no whole-host protection claim |
| Concurrent replicas form expansion cycle | 017.002 | Naive union unsafe; do not accept recursive expansion | Future convergent structural conflict policy required | Review two-edge counterexample executed |
