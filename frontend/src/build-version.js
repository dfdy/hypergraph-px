// SPDX-License-Identifier: AGPL-3.0-only
// Public executable identity; never a workspace/schema/receipt version.
export async function showBuildVersion(){
 const label=document.getElementById('buildVersion');if(!label)return;
 try{const response=await fetch('/build-version.json',{cache:'no-store',credentials:'same-origin'});if(!response.ok)return;const value=await response.json();if(typeof value?.version==='string'&&/^\d+\.\d+\.\d+\.\d+$/.test(value.version))label.textContent='v'+value.version;}catch{/* The static preview label remains available if the request fails. */}
}
