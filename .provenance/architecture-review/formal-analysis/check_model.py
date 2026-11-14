"""Finite architectural transition model, NOT extracted application code or proof.

Exhaustively explores all reachable states up to 10 transitions under the bounds
below. Mutants are intentionally incorrect models, never assertions of HPX bugs.
"""
from collections import deque
from dataclasses import dataclass, replace
from pathlib import Path
import hashlib, json, platform

@dataclass(frozen=True)
class S:
    ui:tuple=(0,0)           # logical source sequences; at most two local edits each
    draft:tuple=(0,0)        # acknowledged exact source sequence per branch
    history:tuple=((0,),(0,))# immutable committed source sequences
    focus:int=0
    pending:tuple=()         # branch, sequence, kind, phase (0 frozen,1 persisted)
    receipts:frozenset=frozenset()
    checkpoints:tuple=(-1,-1)
    promoted:tuple=(-1,-1)
    replaced:tuple=(False,False)

def setat(t,b,x): return t[:b]+(x,)+t[b+1:]

def transitions(s,mutant=None):
    b=s.focus
    if s.ui[b]<2:
        yield 'type branch '+str(b),replace(s,ui=setat(s.ui,b,s.ui[b]+1))
    yield 'switch branch',replace(s,focus=1-b)
    if not s.pending:
        for kind in ['save','commit','capture']:
            if kind=='commit' and len(s.history[b])>=2: continue
            if s.ui[b]<s.draft[b]: continue
            yield 'freeze '+kind+' branch '+str(b),replace(s,pending=(b,s.ui[b],kind,0))
    else:
        pb,seq,kind,phase=s.pending
        op=(pb,seq,kind)
        if phase==0:
            # Replayed original requests return old outcome, never another publication.
            if op in s.receipts:
                yield 'replay original receipt',replace(s,pending=(pb,seq,kind,1))
            elif seq>=s.draft[pb]:
                h=s.history; cp=s.checkpoints; pr=s.promoted
                if kind=='commit':
                    if len(h[pb])>=2: return
                    h=setat(h,pb,h[pb]+(seq,))
                    if cp[pb]==seq: pr=setat(pr,pb,seq)
                if kind=='capture': cp=setat(cp,pb,seq)
                n=replace(s,draft=setat(s.draft,pb,seq),history=h,checkpoints=cp,promoted=pr,receipts=s.receipts|{op},pending=(pb,seq,kind,1))
                yield 'atomic persist '+kind+' branch '+str(pb),n
                if mutant=='partial_commit' and kind=='commit':
                    yield 'MUTANT publish without receipt',replace(n,receipts=s.receipts)
            # Failure before COMMIT leaves all durable state unchanged.
            yield 'precommit failure / abandon frozen request',replace(s,pending=())
        else:
            if mutant=='late_ack':
                yield 'MUTANT ack overwrites newer typing',replace(s,ui=setat(s.ui,pb,seq),pending=())
            elif mutant=='wrong_branch':
                yield 'MUTANT ack writes focused branch',replace(s,draft=setat(s.draft,s.focus,seq),pending=())
            else:
                yield 'ack original context preserving UI',replace(s,pending=())
            # Lost response remains in phase1; a retry may be issued without mutating data.
            yield 'lost reply and frozen replay',s
    for rb in (0,1):
        if s.promoted[rb]>=0 and not s.replaced[rb]:
            yield 'separate replacement batch branch '+str(rb),replace(s,replaced=setat(s.replaced,rb,True))
            yield 'replacement batch failure keeps publication',s

def violation(old,new,label):
    if label.startswith(('ack','MUTANT ack')):
        if new.ui!=old.ui: return 'acknowledgement changed newer UI source'
        if new.draft!=old.draft: return 'acknowledgement mutated durable state / wrong branch'
    if label.startswith('atomic persist'):
        kind=old.pending[2]
        if kind!='commit' and new.history!=old.history: return 'Save/capture published text'
    for b in (0,1):
        if new.history[b][:len(old.history[b])]!=old.history[b]: return 'immutable history rewritten'
        if len(new.history[b])>len(old.history[b]) and not any(x[0]==b and x[2]=='commit' for x in new.receipts): return 'publication missing atomic receipt'
        if new.replaced[b] and new.promoted[b]<0: return 'replacement has no exact promotion'
        if old.replaced[b] and not new.replaced[b]: return 'retained replacement history lost'
    if label.startswith('replacement batch failure') and new.history!=old.history: return 'batch failure undid text publication'
    return None

def explore(mutant=None):
    start=S(); queue=deque([(start,0)]); seen={start}; pred={}; edges=0; depth=10
    while queue:
        s,d=queue.popleft()
        if d==depth: continue
        for label,n in transitions(s,mutant):
            edges+=1
            problem=violation(s,n,label)
            if problem:
                trace=[label]; x=s
                while x in pred:
                    prev,act=pred[x]; trace.append(act); x=prev
                return {'mutant':mutant,'violation':problem,'counterexample':list(reversed(trace)),'states_before_violation':len(seen),'edges_before_violation':edges}
            if n not in seen:
                seen.add(n); pred[n]=(s,label); queue.append((n,d+1))
    return {'mutant':mutant,'violation':None,'states':len(seen),'edges':edges,'max_transition_depth':depth}

def acyclic(edges):
    return not (('X','Y') in edges and ('Y','X') in edges)

if __name__=='__main__':
    result={'python':platform.python_version(),'source_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
      'bounds':{'branches':2,'local_edit_sequences_per_branch':2,'new_commits_per_branch':1,'outstanding_frozen_operation':1,'transition_depth':10},
      'assumptions':['Source sequence is an abstract exact byte string; UTF8/range correctness is not modelled.','Fixed authenticated owner; revocation, generation CAS conflicts, keychain, crypto and fsync are outside this model.','At most one pending operation globally; this understates concurrent browser contexts.','Precommit failure is atomic by construction; implementation atomicity must still be tested.','Checkpoint has at most one retained sequence per branch in this model; real history is not pruned.'],
      'valid_model':explore(), 'mutants':[explore(x) for x in ('late_ack','wrong_branch','partial_commit')],
      'federation_counterexample':{'A':[ ['X','Y'] ],'B':[ ['Y','X'] ],'A_acyclic':acyclic({('X','Y')}),'B_acyclic':acyclic({('Y','X')}),'union_acyclic':acyclic({('X','Y'),('Y','X')})}}
    assert result['valid_model']['violation'] is None
    assert all(x.get('violation') for x in result['mutants'])
    Path(__file__).with_name('model-results.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result))
