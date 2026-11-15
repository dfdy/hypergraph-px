/**
 * Hypergraph PX — Isolated synthetic frontend preview
 *
 * Serve only generated static browser assets over a loopback HTTP listener for
 * synthetic tab-only checks.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/server.mjs)
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
 * Used by: Headless UI runner and explicit preview development command.
 *
 * Specification:
 * - [Repository development workflow](../docs/09-guides/developers/repository-development.md)
 * - [Evidence and isolated test workflow](../docs/09-guides/reference/development-evidence.md)
 * - [Security threat model](../docs/08-assurance/security-threat-model.md)
 *
 * Boundary: No backend API, authentication, runtime data or source files are
 * served; connected real-data workflows require authenticated HTTPS.
 */
import http from 'node:http';

import { readFile, stat } from 'node:fs/promises';

import { resolve, extname } from 'node:path';

const root = resolve(process.env.HPX_PREVIEW_ROOT || 'dist'), port = Number(process.env.HYPERGRAPH_PREVIEW_PORT ?? 5173);

if (!Number.isInteger(port) || port !== 0 && (port < 1024 || port > 65535))
    throw new Error('Invalid preview port');

const generatedCache = resolve(import.meta.dirname, '../.local/verification/frontend-assets');

if (root !== resolve(import.meta.dirname, 'dist') && !new RegExp('^' + generatedCache.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/[a-f0-9]{64}/assets$').test(root))
    throw new Error('Preview root must be generated frontend assets');

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };

const server = http.createServer(/** Reject invalid hosts/methods and traversal, then return only an existing generated asset with restrictive browser headers. */ async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    const bound = server.address().port;

    if (![`127.0.0.1:${bound}`, `localhost:${bound}`].includes(req.headers.host)) {
        res.writeHead(403);
        res.end('Invalid host');

        return;
    }

    if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405);
        res.end();

        return;
    }

    try {
        const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname), file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));

        if (!file.startsWith(root + '/') || !(await stat(file)).isFile())
            throw new Error();
        const bytes = await readFile(file);
        res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
        res.end(req.method === 'HEAD' ? undefined : bytes);
    }
    catch {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(port, '127.0.0.1', /** Print the actual OS-assigned loopback preview URL after the listener is ready. */ () => console.log(`Hypergraph frontend preview: http://127.0.0.1:${server.address().port} (synthetic, tab-only, no authentication)`));
