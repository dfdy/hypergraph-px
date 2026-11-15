/**
 * Hypergraph PX — Verified browser development bridge
 *
 * Serve generated frontend snapshots and forward allowlisted API requests to the
 * exact verified HTTPS loopback backend.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/frontend/scripts/dev-server.mjs)
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
 * Used by: Frontend watcher launcher, development server fixtures and isolated
 * connected browser workflows.
 *
 * Specification:
 * - [Repository development workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Browser runtime interface](../../docs/06-subsystems/interfaces/browser-runtime.md)
 * - [Security threat model](../../docs/08-assurance/security-threat-model.md)
 *
 * Boundary: This development adapter never creates workspace authority or adds
 * cookies/tokens; mock mode has no backend and connected mode requires TLS
 * verification.
 */
import http from 'node:http';

import https from 'node:https';

import { readFile, stat } from 'node:fs/promises';

import { resolve, extname } from 'node:path';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };

/** Accept only a credential-free HTTPS 127.0.0.1 backend origin, rejecting paths or query material. */
export function backendURL(value) {
    const url = new URL(value);

    if (url.protocol !== 'https:' || url.hostname !== '127.0.0.1' || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
        throw Error('Backend must be an HTTPS 127.0.0.1 origin without credentials or path');

    return url;
}

/** Create an owned development listener with explicit mock/connected modes, verified upstream trust and bounded request handling. */
export async function createDevelopmentServer({ assets, port = 3000, backend, cert, key, ca, mock = false }) {
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0')
        throw Error('TLS verification cannot be disabled');

    if (!Number.isInteger(port) || port !== 0 && (port < 1024 || port > 65535))
        throw Error('Invalid frontend port');

    if (!mock && (!backend || !cert || !key))
        throw Error('Connected development requires --backend, --cert and --key; use --mock for tab-only fixtures');
    const upstream = backend ? backendURL(backend) : null;
    const apiPaths = new Set(Object.keys(JSON.parse(await readFile(new URL('../../shared/openapi.json', import.meta.url), 'utf8')).paths));

    if (mock && upstream)
        throw Error('Mock mode cannot connect a backend');
    const secure = !!(cert && key);

    if (!!cert !== !!key)
        throw Error('Both certificate and key are required');
    const tls = secure ? { cert: await readFile(cert), key: await readFile(key) } : null;
    const trust = ca ? await readFile(ca) : undefined;
    const requests = new Set();
    const handler = /** Enforce exact incoming host/origin and method/path constraints before proxying API traffic or serving generated assets. */ async (req, res) => {
        const origin = `${secure ? 'https' : 'http'}://127.0.0.1:${server.address().port}`;
        const reply = /** Finish a rejected request with a plain-text error without attempting a second header write. */ (code, text) => {
            if (!res.headersSent)
                res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(text);
        };
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");

        if (req.headers.host !== new URL(origin).host)
            return reply(403, 'Invalid host');

        if (req.headers['sec-fetch-site'] === 'cross-site' || req.headers.origin !== undefined && req.headers.origin !== origin)
            return reply(403, 'Invalid origin');

        if (!req.url?.startsWith('/') || req.url.startsWith('//') || req.url.includes('\\'))
            return reply(400, 'Invalid path');

        if (req.url.startsWith('/api/') || !mock && req.url === '/build-version.json') {
            if (mock)
                return reply(503, 'Mock mode has no backend or persistent authority');

            if (!['GET', 'POST'].includes(req.method))
                return reply(405, 'Method not allowed');

            if (req.method === 'POST' && req.headers.origin !== origin)
                return reply(403, 'Origin required');

            if (!apiPaths.has(req.url) && !(req.url === '/build-version.json' && req.method === 'GET'))
                return reply(400, 'Invalid API path');

            try {
                let size = 0;
                const chunks = [];

                for await (const chunk of req) {
                    size += chunk.length;

                    if (size > 16 * 1024 * 1024)
                        return reply(413, 'Request too large');
                    chunks.push(chunk);
                }

                if (res.destroyed)
                    return;
                const body = Buffer.concat(chunks), headers = { host: upstream.host };

                for (const name of ['accept', 'content-type', 'cookie', 'sec-fetch-site'])
                    if (req.headers[name] !== undefined)
                        headers[name] = req.headers[name];

                // Translate only after the incoming browser origin has been checked. Never add a cookie/token.
                if (req.headers.origin)
                    headers.origin = upstream.origin;

                if (req.method === 'POST')
                    headers['content-length'] = String(body.length);
                const proxy = https.request(upstream, { method: req.method, path: req.url, headers, ca: trust, allowPartialTrustChain: true, rejectUnauthorized: true, timeout: 15000 }, /** Forward upstream status and allowlisted response headers, piping only the verified backend response body. */                                                                response => {
                    res.writeHead(response.statusCode, Object.fromEntries(['content-type', 'set-cookie'].filter(/** Keep only response headers explicitly allowed across the development bridge. */                                                                name => response.headers[name] !== undefined).map(/** Convert each allowed upstream header into the outgoing header tuple. */                                                                name => [name, response.headers[name]])));
                    response.on('error', /** Destroy the browser response when the upstream body stream fails. */ () => res.destroy());
                    response.pipe(res);
                });
                requests.add(proxy);
                proxy.once('close', /** Remove a finished proxy request from the owned shutdown set. */ () => requests.delete(proxy));
                proxy.on('timeout', /** Destroy an upstream request that exceeds the connection deadline. */ () => proxy.destroy(Error('Backend timeout')));
                proxy.on('error', /** Report verified backend unavailability without falling back to an insecure transport. */ () => reply(502, 'Verified backend connection unavailable'));
                res.once('close', /** Cancel the upstream request if the browser response closes. */ () => proxy.destroy());
                proxy.end(body);
            }
            catch {
                reply(400, 'Invalid request');
            }

            return;
        }

        if (!['GET', 'HEAD'].includes(req.method))
            return reply(405, 'Method not allowed');

        try {
            const root = resolve(typeof assets === 'function' ? assets() : assets), path = decodeURIComponent(new URL(req.url, origin).pathname);
            const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));

            if (!file.startsWith(root + '/') || !(await stat(file)).isFile())
                return reply(404, 'Not found');
            let bytes = await readFile(file);

            if (file.endsWith('/index.html') && mock)
                bytes = Buffer.from(bytes.toString().replace('<head>', '<head><meta name="hpx-development-mode" content="mock">'));
            res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
            res.end(req.method === 'HEAD' ? undefined : bytes);
        }
        catch {
            reply(404, 'Not found');
        }
    };
    const server = tls ? https.createServer(tls, handler) : http.createServer(handler);
    server.requestTimeout = 20000;
    server.headersTimeout = 10000;
    server.maxHeadersCount = 64;
    server.on('upgrade', /** Reject protocol upgrades because this bridge exposes no WebSocket authority. */ (_req, socket) => socket.destroy());
    await new Promise(/** Wait for the loopback listener to bind or fail before returning its usable URL. */ (yes, no) => { server.once('error', no); server.listen(port, '127.0.0.1', yes); });

    return { server, url: `${secure ? 'https' : 'http'}://127.0.0.1:${server.address().port}`, /** Destroy owned upstream requests and listener connections before resolving explicit service shutdown. */
        async close() {
            for (const request of requests)
                request.destroy();
            server.closeAllConnections();
            await new Promise(/** Wait for the development listener close callback instead of assuming synchronous shutdown. */ (yes, no) => server.close(/** Propagate listener-close errors or resolve only a successful close. */                                                                error => error ? no(error) : yes()));
        } };
}
