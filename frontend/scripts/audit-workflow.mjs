// SPDX-License-Identifier: AGPL-3.0-only
import {expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

export async function exerciseDocumentAudit({page,ok,api,root,checks,database,unlock}){
 const check=(value,message)=>{if(!value)throw Error(message);};
 check((await ok('runtime')).capabilities.includes('document_integrity_audit'),'Audit capability is not advertised');
 const title=await page.locator('#documentTitle').textContent(),document=(await ok('documents',{})).find(d=>d.title===title)?.document;
 check(document,'Current audit document is unknown');
 const state=await ok('editor',{document});
 const persisted=()=>execFileSync('python3',['-c','import sqlite3,sys,hashlib; d=sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True); h=hashlib.sha256(); rows=d.execute("SELECT kind,id,generation,envelope FROM slots UNION ALL SELECT kind,id,0,envelope FROM objects ORDER BY kind,id").fetchall(); [(h.update(str(k).encode()),h.update(i),h.update(str(g).encode()),h.update(e)) for k,i,g,e in rows]; print(h.hexdigest())',database],{encoding:'utf8'}).trim();
 const before=persisted(),max_bytes=16*1024*1024,report=await ok('audit/document',{document,max_bytes});
 check(report.scope==='original_branch_immediate_editor_and_publication_records'&&report.authenticated_records===8&&report.finding===null,'Audit did not complete its exact original-branch scope');
 check(!Object.hasOwn(report,'text')&&!Object.hasOwn(report,'title'),'Audit exposed source or title');
 const partial=await ok('audit/document',{document,max_bytes:report.encrypted_bytes-1});check(partial.finding?.record==='publication'&&partial.finding.problem==='budget'&&partial.authenticated_records===7,'Budget-limited audit claimed completion');
 check((await api('audit/document',{document,max_bytes,repair:true})).status===400,'Audit accepted repair/unknown fields');
 check((await api('audit/document',{document,max_bytes:0})).status===400,'Audit accepted zero budget');
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});
 const selection=async()=>editor.evaluate(e=>{const data=new DataTransfer();e.dispatchEvent(new ClipboardEvent('copy',{bubbles:true,cancelable:true,clipboardData:data}));return data.getData('text/plain');});
 await editor.focus();await page.keyboard.press('ControlOrMeta+A');const selected=await selection();
 let commands=0;const observe=request=>{if(request.url().endsWith('/api/v1/commands'))commands++;};page.on('request',observe);
 await page.getByRole('button',{name:'Check integrity',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Original branch integrity'});await expect(dialog).toContainText(title);await expect(dialog).toContainText('Named branches');await expect(dialog.getByRole('status')).toHaveText('Ready to check saved data.');
 await dialog.getByRole('button',{name:'Run integrity check'}).click();await expect(dialog.getByRole('status')).toHaveText('All 8 selected records passed this check.');
 for(const theme of ['dark','light'])for(const width of [1280,1600,2000]){
  await page.setViewportSize({width,height:1000});await page.evaluate(t=>document.body.classList.toggle('light',t==='light'),theme);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  check(await dialog.evaluate(d=>{const r=d.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}),'Audit dialog exceeds desktop viewport');
  await page.screenshot({path:resolve(root,`artifacts/runtime-audit-${theme}-${width}.png`),animations:'disabled'});
 }
 await dialog.getByRole('button',{name:'Close',exact:true}).click();await expect(dialog).toHaveCount(0);check(await selection()===selected,'Audit changed exact editor selection');check(commands===0,'Audit emitted a mutation command');check(persisted()===before,'Audit changed protected persisted records');check(JSON.stringify(await ok('editor',{document}))===JSON.stringify(state),'Audit changed acknowledged editor state');
 // Explicit pending typing is not saved by Run; Undo remains the editor's own history.
 await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type('!');await page.getByRole('button',{name:'Check integrity',exact:true}).click();await dialog.getByRole('button',{name:'Run integrity check'}).click();await expect(dialog.getByRole('status')).toHaveText('All 8 selected records passed this check.');await page.keyboard.press('Escape');check(commands===0,'Audit saved pending typing');await editor.focus();await page.keyboard.press('ControlOrMeta+z');await page.keyboard.press('ControlOrMeta+A');check(await selection()===selected,'Audit changed source or Undo history');page.off('request',observe);
 await page.getByRole('button',{name:'Save draft',exact:true}).click();
 await page.evaluate(()=>document.body.classList.remove('light'));await page.setViewportSize({width:1600,height:1000});
 await page.getByRole('button',{name:'Lock',exact:true}).click();await expect(page.getByRole('button',{name:'Unlock workspace',exact:true})).toBeVisible();check((await api('audit/document',{document,max_bytes})).status===423,'Locked runtime returned audit diagnostics');check((await api('branches/comparison',{document,branch:state.branch})).status===423,'Locked runtime returned branch comparison context');await unlock();await expect(editor).toBeVisible();
 checks.push('protected original-branch audit reports bounded success/incomplete budget, preserves all ciphertext/source/selection/Undo, never saves typing, rejects repair and locked access, and fits desktop themes/widths');
}
