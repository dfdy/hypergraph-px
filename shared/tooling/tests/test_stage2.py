"""Hypergraph PX — Protocol reader and foreground launcher fixtures

Test the pinned protocol reader from another working directory and run the self-build launcher against synthetic stand-in tools to inspect exact process intent.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/tests/test_stage2.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Python unittest discovery for protocol/root relocation and developer launcher contracts.

Specification:
- [Repository development and isolated launchers](../../../docs/09-guides/developers/repository-development.md)
- [Pinned protocol installation](../../../docs/09-guides/developers/vernaculum/UPGRADE_2.0.0.md)

Boundary: Fake executables record arguments, permissions and signals. They do not build, launch or modify the actual owner workspace.
"""
from pathlib import Path
import hashlib
import json
import os
import signal
import shlex
import subprocess
import sys
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'shared/tooling'))
import vernaculum_protocol as protocol


class ProtocolRelocationTests(unittest.TestCase):
    """Check exact pinned protocol reads, tamper refusal and current repository pointers independently of the caller directory."""

    def test_exact_full_protocol_reader_from_alternate_cwd(self):
        """Require the reader to emit exactly the pinned bytes independently of its caller working directory."""

        with tempfile.TemporaryDirectory(prefix='hpx-protocol-') as directory:
            result = subprocess.run([sys.executable, str(ROOT / 'shared/tooling/vernaculum_protocol.py')], cwd=directory, capture_output=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(result.stdout, protocol.read_protocol())
            self.assertEqual(hashlib.sha256(result.stdout).hexdigest(), protocol.SHA256)

    def test_tampered_or_missing_protocol_is_not_fallback(self):
        """Refuse absent or altered protocol bytes rather than substituting an older contract."""

        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'PROTOCOL.md'

            with self.assertRaises(FileNotFoundError):
                protocol.read_protocol(path)
            path.write_bytes(protocol.read_protocol() + b'\n')

            with self.assertRaisesRegex(ValueError, 'SHA256'):
                protocol.read_protocol(path)

    def test_current_agents_pointer_and_workspace_root(self):
        """Keep active agent instructions and the editor workspace pointed at current repository locations."""

        self.assertIn('(shared/tooling/protocol/PROTOCOL.md)', (ROOT / 'AGENTS.md').read_text())
        config = ROOT / '.vscode/Hypergraph PX.code-workspace'
        folders = json.loads(config.read_text())['folders']
        self.assertEqual((config.parent / folders[0]['path']).resolve(), ROOT)
        self.assertEqual(folders[0]['path'], '..')


class SelfBuildLauncherTests(unittest.TestCase):
    """Exercise launcher build/failure/signal handling with isolated fake tools and synthetic existing-workspace paths."""

    def setUp(self):
        """Build an isolated launcher tree with stand-in npm/cargo/runtime executables that log intent and simulate failures/signals."""

        self.temp = tempfile.TemporaryDirectory(prefix='hpx launcher spaces ')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.bin = self.root / 'fake tools'
        self.bin.mkdir()
        self.log = self.root / 'calls.jsonl'
        self.new = self.root / 'shared/tooling/start-self-build.sh'
        self.new.parent.mkdir(parents=True)
        self.new.write_bytes((ROOT / 'shared/tooling/start-self-build.sh').read_bytes())
        (self.new.parent / 'cargo-path.mjs').write_bytes((ROOT / 'shared/tooling/cargo-path.mjs').read_bytes())
        self.env = dict(os.environ, PATH=str(self.bin) + os.pathsep + os.environ.get('PATH', ''), HPX_FIXTURE_LOG=str(self.log))
        # Embedded stop(sig, frame) logs termination before returning the signal-derived exit status.
        # Its function comment is checked through the separately parsed subprocess AST.
        body = '''import json,os,pathlib,signal,sys,time
sys.argv.pop(0)
name=pathlib.Path(sys.argv[0]).name
if name=='cargo' and sys.argv[1:2]==['metadata']:
 print(json.dumps({'target_directory':str(pathlib.Path.cwd()/'.local/target')}));sys.exit(0)
mask=os.umask(0);os.umask(mask)
with open(os.environ['HPX_FIXTURE_LOG'],'a') as f:f.write(json.dumps({'tool':name,'cwd':os.getcwd(),'args':sys.argv[1:],'umask':mask,'pid':os.getpid()})+'\\n')
if name=='hypergraph' and os.environ.get('HPX_FIXTURE_WAIT'):
 # Record termination before exiting with the signal-derived synthetic process status.
 def stop(sig,frame):
  with open(os.environ['HPX_FIXTURE_LOG'],'a') as f:f.write(json.dumps({'signal':sig,'pid':os.getpid()})+'\\n')
  sys.exit(128+sig)
 for s in (signal.SIGINT,signal.SIGTERM):signal.signal(s,stop)
 while True:time.sleep(.02)
if os.environ.get('HPX_FIXTURE_FAIL')==name:sys.exit(23)
'''
        # A shebang cannot quote an interpreter path containing spaces.
        fake = '#!/bin/sh\nexec ' + shlex.quote(sys.executable) + ' -c ' + shlex.quote(body) + ' "$0" "$@"\n'

        for name in ('npm', 'cargo'):
            path = self.bin / name
            path.write_text(fake)
            path.chmod(0o700)
        binary = self.root / '.local/target/debug/hypergraph'
        binary.parent.mkdir(parents=True)
        binary.write_text(fake)
        binary.chmod(0o700)
        (self.root / 'elsewhere').mkdir()

    def workspace(self):
        """Create one unmistakably synthetic pre-existing workspace whose bytes must survive launcher execution."""

        path = self.root / '.local/workspaces/self-build/synthetic.hpx'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b'fixture workspace must not change')
        return path

    def calls(self):
        """Decode the synthetic executable log, treating no calls as an empty list."""

        return [json.loads(line) for line in self.log.read_text().splitlines()] if self.log.exists() else []

    def run_launcher(self, args=(), **env):
        """Execute the copied launcher from another directory with explicit fixture environment overrides."""

        return subprocess.run(['/bin/bash', str(self.new), *args], cwd=self.root / 'elsewhere', env={**self.env, **env}, capture_output=True, text=True, timeout=10)

    def test_missing_existing_workspace_refuses_before_any_build(self):
        """Require a missing pre-existing workspace to stop before invoking tools or creating replacement state."""

        result = self.run_launcher()
        self.assertEqual(result.returncode, 1)
        self.assertIn('Existing workspace not found', result.stderr)
        self.assertFalse(self.log.exists())
        self.assertFalse((self.root / 'runtime').exists())

    def test_help_and_unknown_or_extra_arguments_have_no_side_effects(self):
        """Require usage and invalid-argument exits to invoke no build/runtime command."""

        for args, code in ((['--help'], 0), (['-h'], 0), (['--create'], 2), (['bad'], 2), (['', 'extra'], 2)):
            with self.subTest(args=args):
                self.assertEqual(self.run_launcher(args).returncode, code)
                self.assertFalse(self.log.exists())

    def test_stable_locked_build_root_quoting_umask_and_exact_runtime_intent(self):
        """Require exact build/runtime arguments, root quoting, private umask and unchanged fixture workspace bytes."""

        workspace = self.workspace()
        before = workspace.read_bytes()
        result = self.run_launcher()
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.calls()
        self.assertEqual([c['tool'] for c in calls], ['npm', 'cargo', 'hypergraph'])
        self.assertEqual(calls[0]['args'], ['--prefix', 'frontend', 'run', 'build'])
        self.assertEqual(calls[1]['args'], ['+stable', 'build', '--workspace', '--locked'])
        self.assertEqual(calls[2]['args'], ['--workspace', '.local/workspaces/self-build/synthetic.hpx', '--cert', '.local/credentials/tls/localhost.pem', '--key', '.local/credentials/tls/localhost-key.pem', '--port', '8388'])
        self.assertTrue(all(c['cwd'] == str(self.root.resolve()) and c['umask'] == 0o77 for c in calls))
        self.assertEqual(workspace.read_bytes(), before)
        self.assertNotIn('--create', calls[2]['args'])

    def test_build_failures_propagate_and_stop_later_commands(self):
        """Require every staged tool failure to propagate its status and prevent later build/launch stages."""

        self.workspace()

        for tool, expected in (('npm', ['npm']), ('cargo', ['npm', 'cargo']), ('hypergraph', ['npm', 'cargo', 'hypergraph'])):
            with self.subTest(tool=tool):
                self.log.unlink(missing_ok=True)
                result = self.run_launcher(HPX_FIXTURE_FAIL=tool)
                self.assertEqual(result.returncode, 23)
                self.assertEqual([c['tool'] for c in self.calls()], expected)

    def test_foreground_exec_preserves_pid_and_signal_ownership(self):
        """Require foreground exec to preserve launcher PID and deliver signals directly to the synthetic runtime."""

        self.workspace()

        for sig in (signal.SIGTERM, signal.SIGINT):
            with self.subTest(signal=sig):
                self.log.unlink(missing_ok=True)

                with subprocess.Popen(['/bin/bash', str(self.new)], cwd=self.root / 'elsewhere', env={**self.env, 'HPX_FIXTURE_WAIT': '1'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, start_new_session=True) as process:
                    try:
                        deadline = time.monotonic() + 8

                        while time.monotonic() < deadline:
                            calls = self.calls()
                            if len(calls) == 3:
                                break
                            time.sleep(.02)
                        self.assertEqual(len(calls), 3)
                        self.assertEqual(calls[-1]['pid'], process.pid)
                        time.sleep(.05)
                        process.send_signal(sig)
                        process.communicate(timeout=5)
                        self.assertEqual(process.returncode, 128 + sig)
                        self.assertEqual(self.calls()[-1], {'signal': sig, 'pid': process.pid})
                    finally:
                        if process.poll() is None:
                            os.killpg(process.pid, signal.SIGKILL)
                            process.communicate(timeout=5)


if __name__ == '__main__':
    unittest.main()
