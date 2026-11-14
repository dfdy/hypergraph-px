/**
 * Format local developer launch URLs without changing backend authentication.
 * The backend emits a private one-use launch token for its own origin; split
 * development needs the equivalent frontend URL. Never persist or publish it.
 * Streaming stdout may split a UTF8 character or token across arbitrary chunks.
 */
import {StringDecoder} from 'node:string_decoder';

/** Return a clickable OSC8 terminal link, or the plain URL for redirected output.
 * This formats text only; it neither opens a browser nor validates URL authority.
 */
export function terminalLink(url,tty=process.stdout.isTTY){
 return tty?`\u001b]8;;${url}\u001b\\${url}\u001b]8;;\u001b\\`:url;
}

/**
 * Build stdout data/end callbacks that rewrite complete backend launch lines.
 * frontendPort is the already configured frontend listener. write receives all
 * unrelated output unchanged; the one recognised launch line becomes a frontend
 * link retaining the exact token. Flush the decoder and final partial line on end.
 */
export function developmentOutput(frontendPort,write,tty=process.stdout.isTTY){
 const decoder=new StringDecoder('utf8');let buffered='';
 // Match complete lines, not chunks: a launch token can span stdout writes.
 function emit(line){
  const match=line.match(/https:\/\/127\.0\.0\.1:\d+\/#launch=([a-f0-9]+)(?=\s|$)/);
  if(!match){write(line);return;}
  const url=`https://127.0.0.1:${frontendPort}/#launch=${match[1]}`;
  write(`Development launch (private): ${terminalLink(url,tty)}\n`);
  write('Open this frontend URL once the frontend is ready; the backend serves API traffic only.\n');
 }
 return {
  data(chunk){buffered+=decoder.write(chunk);let end;while((end=buffered.indexOf('\n'))!==-1){emit(buffered.slice(0,end+1));buffered=buffered.slice(end+1);}},
  end(){buffered+=decoder.end();if(buffered)emit(buffered);buffered='';},
 };
}
