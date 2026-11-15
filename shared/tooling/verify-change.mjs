/**
 * Hypergraph PX — Change-sensitive verification advisor
 *
 * Classify an explicitly named increment and offer proportionate checks, with
 * deliberate optional Tier A execution and scoped machine evidence.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/verify-change.mjs)
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
 * Latest editing harness: Codex; version/build: Unknown (not exposed).
 * Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Developer verification commands and process-tooling planning
 * fixtures.
 *
 * Specification:
 * - [Change-sensitive checks and acceptance boundaries](../../docs/09-guides/reference/development-evidence.md)
 *
 * Boundary: This conservative file-level advisor cannot waive required
 * acceptance checks. Tier A success does not authorize integration, deployment
 * or publication.
 */
import { spawn } from 'node:child_process';

import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';

import { resolve, join } from 'node:path';

import { pathToFileURL } from 'node:url';

/** Classify only explicitly declared files and return scoped check suggestions without implying delivery. */
export function planChanges(files) {
    if (!files.length)
        throw Error('Supply the exact increment with --files; the dirty tree includes unrelated retained work.');

    if (files.some(/** Reject absolute or traversing paths before deciding the increment scope. */  file => file.startsWith('/') || file.split('/').includes('..')))
        throw Error('Paths must be repository-relative.');
    const model = files.some(/** Identify diagram sources and routing/configuration changes that require model-aware review. */  p => p.endsWith('.c4') || ['docs/likec4.config.json', 'docs/package.json', 'docs/package-lock.json', 'docs/02-governance/registers/specification-ownership.csv', 'docs/02-governance/registers/contract-bindings.json'].includes(p));
    const docs = !model && files.every(/** Recognise an increment entirely within current documentation/control records. */  p => p.startsWith('docs/') || ['AGENTS.md', 'README.md'].includes(p));
    const toolingPaths = new Set(['frontend/build.mjs', 'frontend/server.mjs', 'frontend/playwright.config.js', 'frontend/package.json', 'frontend/scripts/build-cache.mjs', 'frontend/scripts/run-ui.mjs', 'shared/tooling/verify-change.mjs']);
    const tooling = files.every(/** Recognise the bounded known tooling/test subset for development feedback. */  p => toolingPaths.has(p) || p.includes('/tests/'));
    const rust = files.some(/** Detect Rust/backend inputs whose effects may extend beyond frontend feedback. */  p => p.startsWith('backend/') || p.startsWith('crates/'));
    const proof = files.some(/** Detect proof, lockfile or Rust-toolchain assumptions requiring separate replay review. */  p => p.startsWith('backend/proofs/') || p.includes('Cargo.lock') || p.endsWith('rust-toolchain.toml'));
    const frontend = files.some(/** Detect frontend participation for appropriate browser/Node check suggestions. */  p => p.startsWith('frontend/'));
    const unknown = files.some(/** Keep unknown paths conservative rather than silently granting a narrow check waiver. */  p => !toolingPaths.has(p) && !p.startsWith('docs/') && !p.startsWith('frontend/') && !p.startsWith('backend/') && !p.startsWith('crates/') && !['AGENTS.md', 'README.md'].includes(p));
    const sensitiveTools = files.some(/** Escalate manual-runtime, signing and trust helpers to sensitive review. */  p => /(manual-runtime|check-runtime|check-keychain|signing|trust)/.test(p));
    const critical = model || rust || proof || unknown || sensitiveTools || files.some(/** Detect dependency/package/legal changes whose implications exceed simple file-level presentation checks. */  p => /package(?:-lock)?\.json$|Cargo\.(?:lock|toml)$|legal\//.test(p));
    const node = { label: 'Node contracts/tooling', command: ['npm', '--prefix', 'frontend', 'test'] };
    const browser = { label: 'Isolated full headless frontend regression', command: ['npm', '--prefix', 'frontend', 'run', 'test:ui'] };
    const documentation = { label: 'Documentation and local archive integrity', command: ['python3', 'shared/tooling/verify_documentation.py', '--check-local-sources'] };
    const focused = { label: 'Changed presentation interaction (development feedback only)', command: ['npm', '--prefix', 'frontend', 'run', 'test:ui', '--', 'tests/browser/markdown-presentation.spec.js'] };

    return { files, classification: docs ? 'documentation' : critical ? 'broad-or-sensitive' : tooling ? 'tooling' : 'frontend', tiers: {
            A: docs ? [documentation] : rust ? [{ label: 'Affected Rust formatting', command: ['cargo', 'fmt', '--all', '--', '--check'] }] : [node, ...(frontend && !tooling ? [focused] : [])],
            B: docs ? [] : frontend ? [browser] : [],
            C: [...(!docs ? [node] : []), ...(critical ? [{ label: 'Full Rust regression', command: ['cargo', 'test', '--workspace', '--offline', '--locked'] }, { label: 'Warnings-denied Rust analysis', command: ['cargo', 'clippy', '--workspace', '--all-targets', '--offline', '--locked', '--', '-D', 'warnings'] }] : []), ...(frontend ? [browser] : []), documentation]
        }, requiredReview: docs ? [] : tooling && !critical ? ['Validate cache invalidation, failed runs, concurrent isolation and input mutation handling; compare protected app/runtime bytes.'] : ['Before integrated delivery: relevant actual HTTPS/SQLite, exact-source/recovery/authority, visual/selection/Undo and compatibility acceptance. Every actual run verifies exact binary identity; guarded handoff occurs at a completed verified milestone or explicit owner request (OWNER020).', 'Sensitive changes require applicable crash, old-reader, encrypted-storage/plaintext and format checks; no required acceptance check may be omitted.'],
        omittedBroadEvidence: docs ? 'Application checks omitted because this declared increment changes documentation only; no new application acceptance.' : !critical ? 'Rust/proof reruns omitted for this declared frontend/tooling increment: backend/proof source, toolchain and dependency inputs must remain unchanged. Prior evidence retains its original scope.' : 'No broad waiver: unclassified, persistent, authority, crypto, history, dependency or proof changes require broader review.',
        proofReplay: proof ? 'Required for changed proof/toolchain/dependency assumptions.' : 'Retain prior bounded proof evidence only if its exact sources, toolchains and assumptions remain unchanged.',
        status: 'plan only; Tier A success is not integration, acceptance or deployment' };
}

/** Print a deliberate verification plan and execute only explicitly requested Tier A steps with local evidence. */
async function main() {
    const args = process.argv.slice(2), at = args.indexOf('--files'), runAt = args.indexOf('--run');

    if (at < 0)
        throw Error('Usage: node shared/tooling/verify-change.mjs --files path ... [--run A]');
    const files = args.slice(at + 1).filter(/** Keep declared file operands before the first option rather than treating CLI flags as source paths. */ (p, i, list) => {
        const firstOption = list.findIndex(/** Locate the first option boundary in the declared file list. */  value => value.startsWith('--'));

        return firstOption < 0 || i < firstOption;
    });
    const plan = planChanges(files);
    console.log(JSON.stringify(plan, null, 2));

    if (runAt < 0)
        return;

    if (args[runAt + 1] !== 'A')
        throw Error('Only --run A is automatic; integration/deployment requires deliberate milestone orchestration.');
    const root = resolve(import.meta.dirname, '../..'), base = join(root, '.local/artifacts/verification');

    await mkdir(base, { recursive: true });
    const directory = await mkdtemp(join(base, 'run-')), results = [];

    for (const task of plan.tiers.A) {
        const start = performance.now();
        const child = spawn(task.command[0], task.command.slice(1), { cwd: root, stdio: 'inherit' });
        const code = await new Promise(/** Wait for a selected Tier A child command and preserve spawn or exit failure. */ (yes, no) => {
            child.once('error', no);
            child.once('exit', /** Record the observed child exit status, using failure when no numeric status exists. */  code => yes(code ?? 1));
        });
        results.push({ label: task.label, command: task.command, seconds: (performance.now() - start) / 1000, exit_code: code });

        if (code) {
            process.exitCode = code;
            break;
        }
    }
    await writeFile(join(directory, 'run.json'), JSON.stringify({ plan, results, status: process.exitCode ? 'failed' : 'Tier A passed only', deployment: 'none' }, null, 2) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
    main().catch(/** Report CLI planning/execution failure without claiming a passed verification tier. */  error => { console.error(error.message); process.exitCode = 1; });
