"""Hypergraph PX — Isolated durable build-counter fixtures

Compile the existing runtime build script into a temporary probe and verify serialized allocation, durable high-water retention and incomplete-write refusal.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/tests/test_local_layout.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Python unittest discovery for build-counter integration and source guard checks.

Specification:
- [Repository development and isolated launchers](../../../docs/09-guides/developers/repository-development.md)
- [Development acceptance/evidence boundaries](../../../docs/09-guides/reference/development-evidence.md)

Boundary: The tests isolate build output and counter bytes; they do not touch the owner counter or manual workspace. No Rust probe is executed by this documentation edit.
"""
from pathlib import Path
import os
import subprocess
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[3]

class DurableCounterTests(unittest.TestCase):
    """Exercise the real build counter in isolated processes to check concurrent allocation, durable high-water handling and failure behavior."""

    def test_actual_build_script_serializes_concurrent_appends_and_preserves_high_water(self):
        """Run eight isolated concurrent allocations and require exact contiguous counters while preserving an incomplete final append on failure."""

        with tempfile.TemporaryDirectory(prefix='hpx-counter-') as temporary:
            root=Path(temporary)
            binary=root/'counter-probe'
            result=subprocess.run(['rustc','--edition=2024',str(ROOT/'backend/crates/runtime/build.rs'),'-o',str(binary)],capture_output=True,text=True,timeout=60)
            self.assertEqual(result.returncode,0,result.stderr)
            cwd=root/'backend/crates/runtime'
            cwd.mkdir(parents=True)
            counter=root/'.local/artifacts/test-build-counter.log'
            counter.parent.mkdir(parents=True)
            counter.write_bytes(b'41\n42\n')
            children=[]

            for n in range(8):
                out=root/str(n)
                out.mkdir()
                env={**os.environ,'OUT_DIR':str(out),'CARGO_PKG_VERSION':'1.0.0','CARGO_FEATURE_DEV_BACKEND':'1'}
                env.pop('HPX_RELEASE_BUILD_NUMBER',None)
                children.append(subprocess.Popen([str(binary)],cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True))

            for child in children:
                _,error=child.communicate(timeout=15)
                self.assertEqual(child.returncode,0,error)
            self.assertEqual(counter.read_bytes(),b'41\n42\n'+b''.join(str(n).encode()+b'\n' for n in range(43,51)))
            versions=sorted(int((root/str(n)/'build-version.json').read_text().split('1.0.0.')[1].split('"')[0]) for n in range(8))
            self.assertEqual(versions,list(range(43,51)))
            # An incomplete append is evidence to inspect,not permission to reset/truncate.
            counter.write_bytes(counter.read_bytes()+b'51')
            before=counter.read_bytes()
            env['OUT_DIR']=str(root/'0')
            failed=subprocess.run([str(binary)],cwd=cwd,env=env,capture_output=True,timeout=10)
            self.assertNotEqual(failed.returncode,0)
            self.assertEqual(counter.read_bytes(),before)

    def test_build_counter_retains_explicit_lock_and_durable_sync(self):
        """Keep the actual build source bound to locking, durable sync, checked increment and local artifact placement."""

        source=(ROOT/'backend/crates/runtime/build.rs').read_text()
        self.assertIn('counter.lock()',source)
        self.assertIn('counter.sync_all()',source)
        self.assertIn('previous.checked_add(1)',source)
        self.assertIn('../../../.local/artifacts',source)

if __name__=='__main__':
    unittest.main()
