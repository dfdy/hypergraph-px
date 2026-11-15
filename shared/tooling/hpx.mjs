/**
 * Hypergraph PX — Build and development process orchestration
 *
 * Run explicitly selected frontend/backend development processes or one-shot
 * release preparation with the existing TLS and build contracts.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/hpx.mjs)
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
 * Used by: Developer package commands, the independent root launcher and
 * process-tooling fixtures.
 *
 * Specification:
 * - [Developer launch/build workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Embedded release delivery](../../docs/08-assurance/build-and-release.md)
 *
 * Boundary: No certificate trust installation or provider connection is implied.
 * Local build success is not integration acceptance or a manual-workspace
 * handoff.
 */
import { cargoExecutable } from './cargo-path.mjs';

import { developmentOutput } from './development-launch.mjs';

// One-shot builds and independently supervised development processes. No trust installation.
import { spawn } from 'node:child_process';

import { resolve } from 'node:path';

import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));

const [command, ...args] = process.argv.slice(2), opts = {};

const allowed = ['--workspace', '--cert', '--key', '--ca', '--frontend-port', '--backend-port', '--backend', '--build-number'];

for (let i = 0; i < args.length; i++) {
    if (['--mock', '--create'].includes(args[i]))
        opts[args[i].slice(2)] = true;
    else if (allowed.includes(args[i]) && args[i + 1] && !args[i + 1].startsWith('--'))
        opts[args[i].slice(2)] = args[++i];
    else
        throw Error('Unknown/missing option: ' + args[i]);
}

const run = /** Run one build command in the repository with inherited output and deliberate environment overrides. */ (program, arguments_, env = {}) => new Promise(/** Bind child spawn/error/exit completion to the one-shot build promise. */ (yes, no) => {
    const child = spawn(program, arguments_, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
    child.once('error', no);
    child.once('exit', /** Resolve only a zero child status; make a failed build stop later stages. */  code => code === 0 ? yes() : no(Error(program + ' exited ' + code)));
});

/** Validate explicit development ports before using them in listener or proxy arguments. */
function port(value, fallback) { const n = Number(value ?? fallback); if (!Number.isInteger(n) || n < 1024 || n > 65535)
    throw Error('Ports must be integers from 1024 to 65535'); return String(n); }

const frontendPort = port(opts['frontend-port'] ?? process.env.HPX_FRONTEND_PORT, 3000), backendPort = port(opts['backend-port'] ?? process.env.HPX_BACKEND_PORT, 8000);

const frontendArgs = /** Construct the frontend command from explicit mock/backend origin and existing TLS options. */ () => ['frontend/scripts/dev.mjs', '--port', frontendPort, ...(opts.mock ? ['--mock'] : ['--backend', opts.backend ?? 'https://127.0.0.1:' + backendPort]), ...['cert', 'key', 'ca'].flatMap(/** Forward only the TLS options actually supplied by the caller, resolving their paths. */  name => opts[name] ? ['--' + name, resolve(opts[name])] : [])];

if (command === 'build') {
    const number = String(opts['build-number'] ?? '1');

    if (!/^[1-9][0-9]{0,15}$/.test(number))
        throw Error('Build number must be a positive integer with at most 16 digits');
    await run('npm', ['--prefix', 'frontend', 'ci', '--ignore-scripts', '--no-audit', '--no-fund']);
    await run('cargo', ['fetch', '--locked']);
    await run('npm', ['--prefix', 'frontend', 'run', 'api:check']);
    await run('npm', ['--prefix', 'frontend', 'run', 'build']);
    await run('cargo', ['build', '--release', '--locked', '-p', 'hypergraph-runtime', '--bin', 'hypergraph'], { HPX_RELEASE_BUILD_NUMBER: number });
    console.log('Self-contained executable: ' + cargoExecutable({ profile: 'release' }) + ' (embedded frontend, no Node runtime).');
}
else if (['frontend', 'backend', 'dev'].includes(command)) {
    if (command === 'dev' && opts.mock)
        throw Error('Use dev:mock to run without a backend');

    if (command !== 'frontend' && (!opts.workspace || !opts.cert || !opts.key))
        throw Error('Backend requires --workspace, --cert and --key; workspace creation additionally requires --create');

    if (command !== 'frontend' && frontendPort === backendPort)
        throw Error('Development ports must differ');

    if (!opts.mock && command !== 'backend' && (!opts.cert || !opts.key))
        throw Error('Connected frontend requires --cert and --key (and --ca if backend trust is not in Node); use --mock for fixtures');
    const children = [];
    let stopping = false;

    /** Stop all owned children once, wait for their exits and escalate only remaining processes after the grace period. */
    async function stop(code = 0) {
        if (stopping)
            return;
        stopping = true;

        for (const child of children)
            if (child.exitCode === null && child.signalCode === null)
                child.kill('SIGTERM');
        const timer = setTimeout(/** Force-stop owned children still alive after graceful termination expires. */ () => { for (const child of children)
            if (child.exitCode === null && child.signalCode === null)
                child.kill('SIGKILL'); }, 3000);
        timer.unref();
        await Promise.all(children.map(/** Wait only for children whose exit has not already been observed. */  child => child.exitCode !== null || child.signalCode !== null ? Promise.resolve() : new Promise(/** Complete one pending child-exit wait without inventing a successful process status. */  resolve => child.once('exit', resolve))));
        clearTimeout(timer);
        process.exitCode = code;
    }

    /** Spawn and track one owned development child, optionally translating its launch output. */
    function start(program, arguments_, capture = false) {
        const child = spawn(program, arguments_, { cwd: root, env: process.env, stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit' });
        children.push(child);

        if (capture) {
            const output = developmentOutput(frontendPort, /** Write translated launch output to the parent terminal without persisting the private token. */  text => process.stdout.write(text));
            child.stdout.on('data', /** Feed captured backend stdout through the complete-line UTF8 launch decoder. */  data => output.data(data));
            child.stdout.once('end', /** Flush the launch decoder when the captured child output stream ends. */ () => output.end());
        }
        child.once('error', /** Report a spawn error and stop the coordinated development processes. */  error => { console.error(error.message); void stop(1); });
        child.once('exit', /** Propagate an unexpected child exit and stop the sibling process once. */  code => { if (!stopping)
            void stop(code ?? 1); });

        return child;
    }

    for (const signal of ['SIGINT', 'SIGTERM'])
        process.once(signal, /** Route an external termination signal through the same owned-child cleanup path. */ () => void stop());

    if (command !== 'frontend')
        start('cargo', ['run', '--locked', '-p', 'hypergraph-runtime', '--bin', 'hypergraph', '--features', 'dev-backend', '--', '--workspace', resolve(opts.workspace), '--cert', resolve(opts.cert), '--key', resolve(opts.key), '--port', backendPort, ...(opts.create ? ['--create'] : [])], true);

    if (command !== 'backend')
        start(process.execPath, frontendArgs());
}
else
    throw Error('Usage: node shared/tooling/hpx.mjs frontend|backend|dev|build [options]. See docs/09-guides/developers/repository-development.md');
