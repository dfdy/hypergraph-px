/**
 * Hypergraph PX — Generated API payload assertions
 *
 * Validate fixture payloads against the deliberately supported subset of the
 * generated runtime API schema and derive typed route bindings.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/assert-api-schema.mjs)
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
 * Used by: Browser/runtime contract tests and integration workflow fixtures.
 *
 * Specification:
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Evidence and isolated test workflow](../../docs/09-guides/reference/development-evidence.md)
 *
 * Boundary: This strict test interpreter rejects unknown schema keywords; it is
 * not application validation or a general JSON Schema implementation.
 */
import { readFile } from 'node:fs/promises';

const spec = JSON.parse(await readFile(new URL('../../shared/openapi.json', import.meta.url)));

const supported = new Set(['$ref', 'type', 'oneOf', 'properties', 'required', 'additionalProperties', 'items', 'minItems', 'maxItems', 'minimum', 'maximum', 'enum', 'format', 'description', 'writeOnly']);

/** Require a fixture payload to satisfy its named generated API component or fail the test. */
export function assertComponent(name, value) {

    /** Recursively evaluate only supported schema constraints, following component references without silently ignoring unknown keywords. */
    function matches(schema, value) {
        for (const key of Object.keys(schema))
            if (!supported.has(key))
                throw Error('Unsupported schema keyword: ' + key);

        if (schema.$ref) {
            let target = spec;

            for (const key of schema.$ref.slice(2).split('/'))
                target = target[key];

            return matches(target, value);
        }

        if (schema.oneOf)
            return schema.oneOf.filter(/** Count matching alternatives so oneOf accepts exactly one generated schema branch. */                                                                s => matches(s, value)).length === 1;
        const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;

        if (schema.type === 'integer' ? !Number.isSafeInteger(value) : schema.type && schema.type !== type)
            return false;

        if (schema.enum && !schema.enum.includes(value))
            return false;

        if (typeof value === 'number' && (value < (schema.minimum ?? -Infinity) || value > (schema.maximum ?? Infinity)))
            return false;

        if (Array.isArray(value)) {
            if (value.length < (schema.minItems ?? 0) || value.length > (schema.maxItems ?? Infinity))
                return false;

            if (schema.items && !value.every(/** Require every array element to satisfy the declared item schema. */                                                                item => matches(schema.items, item)))
                return false;
        }

        if (type === 'object') {
            if ((schema.required ?? []).some(/** Detect a missing required object property using own-property membership. */                                                                key => !Object.hasOwn(value, key)))
                return false;

            for (const [key, item] of Object.entries(value)) {
                if (schema.properties?.[key]) {
                    if (!matches(schema.properties[key], item))
                        return false;
                }
                else if (schema.additionalProperties === false)
                    return false;
            }
        }

        return true;
    }

    if (!spec.components.schemas[name] || !matches(spec.components.schemas[name], value))
        throw Error('Actual payload violates generated ' + name + ' schema');
}

// Derive actual-test bindings from the same generated contract. Route-only
// operations stay excluded; this does not infer conformance for unknown bodies.

/** Route/method payload bindings derived from generated operation metadata; route-only operations stay explicitly untyped. */
export const typedBindings = Object.entries(spec.paths).flatMap(/** Collect typed operations from every generated API path while leaving route-only coverage explicit. */ ([path, methods]) => Object.entries(methods).flatMap(/** Build request/response component metadata for one schema-covered operation, preserving explicitly ignored request bodies. */ ([method, operation]) => {
    const ignored = operation['x-hpx-schema-coverage'] === 'typed-response' && operation['x-hpx-request-body'] === 'ignored';

    if (operation['x-hpx-schema-coverage'] !== 'typed' && !ignored)
        return [];
    const component = /** Extract only local component references rather than guessing a component from arbitrary schemas. */                                                                reference => reference?.startsWith('#/components/schemas/') ? reference.slice('#/components/schemas/'.length) : null;
    const request = component(operation.requestBody?.content?.['application/json']?.schema?.$ref), response = component(operation.responses?.['200']?.content?.['application/json']?.schema?.$ref);

    if (!response || method === 'post' && !request && !ignored)
        throw Error('Typed operation lacks generated component binding: ' + path);

    return [{ path, method: method.toUpperCase(), request, response }];
}));

/** Validate one actual route payload against the generated request or response component binding. */
export function assertBoundPayload(path, method, direction, value) {
    const binding = typedBindings.find(/** Locate the exact route-and-method binding before selecting the requested payload direction. */                                                                b => b.path === path && b.method === method), component = binding?.[direction];

    if (!component)
        throw Error('No typed ' + direction + ' binding for ' + method + ' ' + path);
    assertComponent(component, value);
}
