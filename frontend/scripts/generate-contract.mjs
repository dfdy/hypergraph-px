// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Hypergraph PX — Rust-owned API contract generation
 *
 * Export the runtime schema from exact Rust inputs, enforce compatibility and
 * generate browser types/routes/constraints.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/generate-contract.mjs)
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
 * Used by: Frontend api:generate/api:check commands and API contract fixture
 * tests.
 *
 * Specification:
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 *
 * Boundary: Generation preserves the current wire contract; reviewed route-only
 * refinements must be explicit and check mode never grants acceptance.
 */
import { cargoTargetDirectory } from '../../shared/tooling/cargo-path.mjs';

import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { resolve } from 'node:path';

import { execFileSync } from 'node:child_process';

import { createHash } from 'node:crypto';

import { pathToFileURL } from 'node:url';

import openapiTS, { astToString } from 'openapi-typescript';

const root = resolve(import.meta.dirname, '../..'), output = resolve(root, 'frontend/src/generated');

/** Ensure every schema reference is local and resolves before generating browser artifacts. */
export function validateReferences(spec) {

    /** Traverse nested schema objects and resolve escaped JSON-pointer segments, rejecting external or missing references. */
    function visit(value) {
        if (!value || typeof value !== 'object')
            return;

        if ('$ref' in value) {
            if (!value.$ref.startsWith('#/'))
                throw Error('External schema reference forbidden');
            let target = spec;

            for (const key of value.$ref.slice(2).split('/'))
                target = target?.[key.replaceAll('~1', '/').replaceAll('~0', '~')];

            if (!target)
                throw Error('Unresolved schema reference: ' + value.$ref);
        }

        for (const child of Object.values(value))
            visit(child);
    }
    visit(spec);
}

// Conservative wire freeze: additions are allowed; any existing operation/schema
// change needs explicit compatibility review. This is not semantic-version inference.

/** Freeze existing schemas, operation behavior and security while permitting additions and explicitly reviewed typed refinements. */
export function assertCompatible(previous, next, { reviewedRefinements = [] } = {}) {
    for (const [name, schema] of Object.entries(previous.components?.schemas ?? {}))
        if (JSON.stringify(schema) !== JSON.stringify(next.components?.schemas?.[name]))
            throw Error('Existing API schema changed: ' + name);

    for (const [path, methods] of Object.entries(previous.paths ?? {}))
        for (const [method, operation] of Object.entries(methods)) {
            const replacement = next.paths?.[path]?.[method];

            if (JSON.stringify(operation) === JSON.stringify(replacement))
                continue;
            const ignored = replacement?.['x-hpx-schema-coverage'] === 'typed-response' && replacement?.['x-hpx-request-body'] === 'ignored';

            if (!reviewedRefinements.includes(path) || operation['x-hpx-schema-coverage'] !== 'route-only' || (replacement?.['x-hpx-schema-coverage'] !== 'typed' && !ignored))
                throw Error('Existing API operation changed: ' + method + ' ' + path);

            if (ignored && (method !== 'post' || replacement.requestBody?.required !== false || JSON.stringify(replacement.requestBody?.content?.['application/json']?.schema) !== '{}'))
                throw Error('Ignored-body refinement must preserve arbitrary optional bodies: ' + path);
            const strip = /** Remove only the permitted schema-coverage refinement fields before comparing operation behavior. */                value => {
                const copy = structuredClone(value);
                delete copy['x-hpx-schema-coverage'];

                if (ignored) {
                    delete copy['x-hpx-request-body'];
                    delete copy.requestBody?.required;
                }
                delete copy.requestBody?.content?.['application/json']?.schema;
                delete copy.responses?.['200']?.content?.['application/json']?.schema;

                return copy;
            };

            if (JSON.stringify(strip(operation)) !== JSON.stringify(strip(replacement)))
                throw Error('Reviewed refinement altered method/error/security behaviour: ' + path);

            if ((method !== 'get' && !ignored && !replacement.requestBody?.content?.['application/json']?.schema?.$ref) || !replacement.responses?.['200']?.content?.['application/json']?.schema?.$ref)
                throw Error('Reviewed refinement must use generated components: ' + path);
        }

    if (JSON.stringify(previous.security) !== JSON.stringify(next.security) || JSON.stringify(previous.components?.securitySchemes) !== JSON.stringify(next.components?.securitySchemes))
        throw Error('API security contract changed');
}

/** Validate cached schema identity and content digest before reusing exported runtime metadata. */
export function schemaCacheValid(record, identity) { return record?.identity === identity && record.sha256 === createHash('sha256').update(JSON.stringify(record.spec)).digest('hex'); }

/** Generate or check schema, browser types, routes and authoritative constraints from exact runtime export inputs. */
export async function generate({ check = false, reviewedRefinements = [] } = {}) {
    if (check && reviewedRefinements.length)
        throw Error("Check mode cannot accept refinements");
    const inputs = ['backend/crates/storage/Cargo.toml', 'backend/crates/storage/src/lib.rs', 'backend/crates/storage/src/encoding.rs', 'backend/crates/storage/src/audit.rs', 'backend/crates/runtime/src/api.rs', 'backend/crates/runtime/src/export_api.rs', 'backend/crates/runtime/src/main.rs', 'backend/crates/runtime/Cargo.toml', 'backend/crates/runtime/build.rs', 'Cargo.toml', 'Cargo.lock', 'frontend/scripts/generate-contract.mjs', '.cargo/config.toml', 'shared/tooling/cargo-path.mjs'];
    const toolchain = execFileSync('rustc', ['--version'], { cwd: root, encoding: 'utf8' });
    const effectiveTarget = cargoTargetDirectory();
    const sourceIdentity = /** Fingerprint runtime/export/build-path inputs together with effective target and toolchain before and after export. */ async () => {
        const hash = createHash('sha256').update(effectiveTarget + '\0' + toolchain + '\0' + process.platform + '\0' + process.arch + '\0' + (process.env.RUSTUP_TOOLCHAIN ?? '') + '\0' + (process.env.CARGO_BUILD_TARGET ?? ''));

        for (const path of inputs) {
            hash.update(path + '\0');
            hash.update(await readFile(resolve(root, path)));
        }

        return hash.digest('hex');
    };
    const identity = await sourceIdentity(), cache = resolve(root, '.local/verification/api-contract');

    await mkdir(cache, { recursive: true });
    const cached = resolve(cache, identity + '.json');
    let spec;

    try {
        const record = JSON.parse(await readFile(cached, 'utf8'));

        if (!schemaCacheValid(record, identity))
            throw Error('Invalid schema cache');
        spec = record.spec;
    }
    catch {
        spec = JSON.parse(execFileSync('cargo', ['run', '-p', 'hypergraph-runtime', '--features', 'api-export,dev-backend', '--bin', 'hypergraph-api', '--offline', '--locked'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }));

        if (await sourceIdentity() !== identity)
            throw Error('Rust API inputs changed during export');
        await writeFile(cached, JSON.stringify({ identity, sha256: createHash('sha256').update(JSON.stringify(spec)).digest('hex'), spec }) + '\n');
    }
    validateReferences(spec);
    const schema = JSON.stringify(spec, null, 2) + '\n', types = '// Generated from Rust API DTOs. Do not edit.\n' + astToString(await openapiTS(spec, { alphabetize: true, arrayLength: true }));

    if (await sourceIdentity() !== identity)
        throw Error('API inputs changed during generation');
    const auditMaximum = spec.components.schemas.AuditRequest.properties.max_bytes.maximum, auditScope = spec.components.schemas.DocumentAuditReport.properties.scope.enum?.[0];

    if (!Number.isSafeInteger(auditMaximum) || auditMaximum < 1 || typeof auditScope !== 'string')
        throw Error('Missing authoritative audit constraints');
    const routes = Object.fromEntries(Object.entries(spec.paths).map(/** Derive one route method and content type from the Rust-defined operation rather than duplicating browser routing policy. */ ([path, methods]) => { const [method, operation] = Object.entries(methods)[0]; return [path, { method: method.toUpperCase(), ...(operation.requestBody?.content ? { contentType: Object.keys(operation.requestBody.content)[0] } : {}) }]; }));
    const routeSource = '// Generated from the Rust-defined OpenAPI contract. Do not edit.\nexport const runtimeRoutes=' + JSON.stringify(routes) + ';\n';
    const constraints = '// Generated from the Rust-defined OpenAPI contract. Do not edit.\nexport const auditMaxBytes=' + JSON.stringify(auditMaximum) + ';\nexport const auditScope=' + JSON.stringify(auditScope) + ';\n';

    await mkdir(output, { recursive: true });
    const files = { '../../../shared/openapi.json': schema, 'api.d.ts': types, 'api-constraints.js': constraints, 'api-routes.js': routeSource, 'api-routes.d.ts': '// Generated from the Rust-defined OpenAPI contract. Do not edit.\nexport declare const runtimeRoutes: ' + JSON.stringify(routes) + ';\n' };
    let previous;

    try {
        previous = JSON.parse(await readFile(resolve(root, 'shared/openapi.json'), 'utf8'));
    }
    catch (error) {
        if (error.code !== 'ENOENT')
            throw error;

        if (check)
            throw Error('Missing generated contract');
    }

    if (previous)
        assertCompatible(previous, spec, { reviewedRefinements });

    for (const [name, value] of Object.entries(files)) {
        let old;

        try {
            old = await readFile(resolve(output, name), 'utf8');
        }
        catch { }

        if (check && old !== value)
            throw Error('Generated API drift: ' + name);

        if (!check && old !== value)
            await writeFile(resolve(output, name), value);
    }
    console.log('Rust API contract ' + (check ? 'matches' : 'generated') + '; ' + Object.keys(spec.paths).length + ' inventoried paths; typed coverage recorded per operation');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
    await generate({ check: process.argv.includes('--check'), reviewedRefinements: process.argv.flatMap(/** Collect explicitly named refinement paths from command arguments; check mode rejects them. */ (value, index, args) => value === '--reviewed-refinement' ? [args[index + 1]] : []) });
