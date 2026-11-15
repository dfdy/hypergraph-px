/**
 * Hypergraph PX — Private development launch output
 *
 * Translate complete backend launch lines into the independent frontend origin
 * while retaining exact one-use tokens across arbitrary stdout chunks.
 *
 * Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/development-launch.mjs)
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
 * Used by: Independent development launchers and launch-output fixtures.
 *
 * Specification:
 * - [Developer launch/build workflow](../../docs/09-guides/developers/repository-development.md)
 * - [Authenticated browser/runtime boundary](../../docs/06-subsystems/interfaces/browser-runtime.md)
 *
 * Boundary: Formatting a private URL does not authenticate a peer, open a
 * browser or grant workspace authority. Never persist or publish launch tokens.
 */
import { StringDecoder } from 'node:string_decoder';

/** Return a clickable OSC8 terminal link, or the plain URL for redirected output.
 * This formats text only; it neither opens a browser nor validates URL authority.
 */

/** Format an OSC8 clickable link for terminals or retain the plain URL for redirected output. */
export function terminalLink(url, tty = process.stdout.isTTY) {
    return tty ? `\u001b]8;;${url}\u001b\\${url}\u001b]8;;\u001b\\` : url;
}

/**
 * Build stdout data/end callbacks that rewrite complete backend launch lines.
 * frontendPort is the already configured frontend listener. write receives all
 * unrelated output unchanged; the one recognised launch line becomes a frontend
 * link retaining the exact token. Flush the decoder and final partial line on end.
 */

/** Create stdout callbacks that preserve exact UTF8/token boundaries and rewrite only recognised complete launch lines. */
export function developmentOutput(frontendPort, write, tty = process.stdout.isTTY) {
    const decoder = new StringDecoder('utf8');
    let buffered = '';

    // Match complete lines, not chunks: a launch token can span stdout writes.

    /** Pass unrelated lines through and translate the one private backend launch URL to the configured frontend origin. */
    function emit(line) {
        const match = line.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=([a-f0-9]+)(?=\s|$)/);

        if (!match) {
            write(line);

            return;
        }
        const url = `https://127.0.0.1:${frontendPort}/#launch=${match[1]}`;
        write(`Development launch (private): ${terminalLink(url, tty)}\n`);
        write('Open this frontend URL once the frontend is ready; the backend serves API traffic only.\n');
    }

    return {

        /** Decode stream chunks and emit only complete lines, retaining an incomplete token until more bytes arrive. */
        data(chunk) { buffered += decoder.write(chunk); let end; while ((end = buffered.indexOf('\n')) !== -1) {
            emit(buffered.slice(0, end + 1));
            buffered = buffered.slice(end + 1);
        } },

        /** Flush decoder state and the final partial line when stdout ends. */
        end() { buffered += decoder.end(); if (buffered)
            emit(buffered); buffered = ''; },
    };
}
