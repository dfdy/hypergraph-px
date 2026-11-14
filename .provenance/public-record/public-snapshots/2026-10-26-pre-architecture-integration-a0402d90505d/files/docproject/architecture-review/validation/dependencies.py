"""Static dependency observations; no build or application import."""
from pathlib import Path
import json, re, tomllib
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'docproject/architecture-review'

def components(nodes,edges):
    graph={x:[] for x in nodes}
    for a,b in edges:
        graph.setdefault(a,[]).append(b); graph.setdefault(b,[])
    index={}; low={}; stack=[]; active=set(); result=[]
    def visit(v):
        index[v]=low[v]=len(index); stack.append(v); active.add(v)
        for w in graph[v]:
            if w not in index: visit(w); low[v]=min(low[v],low[w])
            elif w in active: low[v]=min(low[v],index[w])
        if low[v]==index[v]:
            comp=[]
            while True:
                w=stack.pop(); active.remove(w); comp.append(w)
                if w==v: break
            result.append(sorted(comp))
    for n in sorted(graph):
        if n not in index: visit(n)
    return sorted([x for x in result if len(x)>1 or (x[0],x[0]) in edges])

crates={}; cedges=[]
for p in sorted((ROOT/'crates').glob('*/Cargo.toml')):
    data=tomllib.loads(p.read_text()); name=data['package']['name']; crates[name]=str(p.relative_to(ROOT))
    for dep,spec in data.get('dependencies',{}).items():
        if isinstance(spec,dict) and 'path' in spec: cedges.append((name,dep))
jsfiles=sorted((ROOT/'frontend/src').glob('*.js')); jnodes=[str(x.relative_to(ROOT)) for x in jsfiles]; jedges=[]
unresolved=[]
for p in jsfiles:
    text=p.read_text()
    for ref in re.findall(r'(?:from\s*|import\s*)[\'\"](\.[^\'\"]+)[\'\"]',text):
        target=(p.parent/ref).resolve()
        if target.is_file(): jedges.append((str(p.relative_to(ROOT)),str(target.relative_to(ROOT))))
        else: unresolved.append([str(p.relative_to(ROOT)),ref])
rsfiles=sorted((ROOT/'crates/storage/src').glob('*.rs'))
imports=[]
for p in rsfiles:
    for n,line in enumerate(p.read_text().splitlines(),1):
        if 'use super::*' in line: imports.append({'path':str(p.relative_to(ROOT)),'line':n,'test_section_included':True})
result={'local_crates':crates,'crate_edges':cedges,'crate_cycles':components(crates,cedges),'frontend_modules':jnodes,'frontend_static_import_edges':sorted(set(jedges)),'frontend_cycles':components(jnodes,jedges),'unresolved_relative_imports':unresolved,'storage_super_glob_imports':imports,'limits':['Cargo normal local path dependencies only; no build/dev/target-conditional external graph.','Frontend static relative imports via conservative regex; dynamic imports/runtime calls/global shared state may be absent.','Storage super::* observations include test modules; they show shared namespace dependence, not precise call cycles.','Crate-level DAG does not prove runtime, semantic, callback or store-access acyclicity.']}
(OUT/'traceability/dependencies.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'local_crates':len(crates),'crate_edges':len(cedges),'crate_cycles':result['crate_cycles'],'frontend_modules':len(jnodes),'frontend_import_edges':len(set(jedges)),'frontend_cycles':result['frontend_cycles'],'unresolved':unresolved,'storage_glob_occurrences':len(imports)}))
