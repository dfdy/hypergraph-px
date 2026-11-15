#!/usr/bin/env node
/**
 * Hypergraph PX — Exported JavaScript documentation presence
 *
 * Parse selected reviewed sources with the existing pinned TypeScript compiler
 * and check that exported declarations have explanatory JSDoc.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/check_code_comments.mjs) (publication pending)
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
 * Used by: The Python comment inventory gate and isolated export-syntax
 * fixtures.
 *
 * Specification:
 * - [Commenting standard](../../docs/09-guides/developers/code-comments.md)
 *
 * Boundary: Source is parsed, not imported or executed; presence checks do not
 * establish teaching quality or every-function coverage.
 */
import ts from '../../frontend/node_modules/typescript/lib/typescript.js';

import { readFile } from 'node:fs/promises';

import path from 'node:path';

const args = process.argv.slice(2);

if (args[0] !== '--root' || !args[1])
    throw Error('Usage: check_code_comments.mjs --root ROOT FILE...');

const root = path.resolve(args[1]);

let failed = false;

for (const name of args.slice(2)) {
    const file = path.resolve(root, name);

    if (!file.startsWith(root + path.sep))
        throw Error('Source path outside root');
    const text = await readFile(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

    // Re-exports with a module source forward that source's contract. Local
    // export lists instead expose declarations in this file and need their docs.
    // Resolve local destructuring to the declaration owning its documentation.

    /** Resolve names from local destructuring so export aliases point to the declaration that owns its documentation. */
    function bindingNames(binding) {
        if (ts.isIdentifier(binding))
            return [binding.text];

        return binding.elements.flatMap(/** Skip omitted array-binding positions and recursively collect each actual binding name. */  item => ts.isOmittedExpression(item) ? [] : bindingNames(item.name));
    }
    const targets = new Set();
    const localNames = new Set();

    for (const node of source.statements) {
        if (ts.isExportDeclaration(node) && !node.moduleSpecifier && node.exportClause && ts.isNamedExports(node.exportClause)) {
            for (const item of node.exportClause.elements)
                localNames.add((item.propertyName ?? item.name).text);
        }

        if (ts.isExportAssignment(node))
            targets.add(node);

        if (ts.canHaveModifiers(node) && ts.getModifiers(node)?.some(/** Detect an explicit export modifier rather than mistaking an unexported declaration for public API. */  m => m.kind === ts.SyntaxKind.ExportKeyword))
            targets.add(node);
    }

    for (const node of source.statements) {
        const names = ts.isVariableStatement(node) ? node.declarationList.declarations.map(/** Extract the variable binding patterns for local export-list resolution. */  d => d.name) : [node.name].filter(Boolean);

        if (names.flatMap(bindingNames).some(/** Check whether an exposed local name belongs to this declaration. */  n => localNames.has(n)))
            targets.add(node);
    }

    for (const node of targets) {
        if (ts.isExportDeclaration(node) || ts.isImportDeclaration(node))
            continue;

        if (!node.jsDoc?.some(/** Require descriptive JSDoc text, not an empty block or tags alone. */  doc => typeof doc.comment === 'string' && doc.comment.trim())) {
            const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
            console.log(`${name}:${line}: exported declaration needs explanatory JSDoc`);
            failed = true;
        }
    }

    if (source.parseDiagnostics.length) {
        console.log(`${name}: source has parser diagnostics`);
        failed = true;
    }
}

process.exitCode = failed ? 1 : 0;
