// Local maintenance guard only;never repairs or creates a recorded workspace.
import {resolve,sep} from 'node:path';
import {existsSync} from 'node:fs';
export function requireCurrentManualRecord(root,record,{exists=existsSync}={}){
 const origin=new URL(record.origin);
 if(record.synthetic!==true||origin.protocol!=='https:'||origin.hostname!=='127.0.0.1'||!Number.isSafeInteger(record.pid)||record.pid<=0)throw Error('Unexpected manual runtime record');
 const boundary=resolve(root,'.local/workspaces')+sep;
 if(typeof record.workspace!=='string'||resolve(record.workspace)!==record.workspace||!record.workspace.startsWith(boundary))throw Error('Legacy manual workspace identity requires explicit stopped-record migration;no recreation or redirection permitted');
 if(!exists(record.workspace))throw Error('Recorded manual workspace is missing;no recreation or redirection permitted');
 return record;
}
