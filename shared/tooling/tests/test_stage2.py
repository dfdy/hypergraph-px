"""Stage2 protocol/root routing and isolated foreground launcher contract fixtures."""
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
    def test_exact_full_protocol_reader_from_alternate_cwd(self):
        with tempfile.TemporaryDirectory(prefix='hpx-protocol-') as directory:
            result = subprocess.run([sys.executable, str(ROOT / 'shared/tooling/vernaculum_protocol.py')], cwd=directory, capture_output=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(result.stdout, protocol.read_protocol())
            self.assertEqual(hashlib.sha256(result.stdout).hexdigest(), protocol.SHA256)

    def test_tampered_or_missing_protocol_is_not_fallback(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'PROTOCOL.md'
            with self.assertRaises(FileNotFoundError):
                protocol.read_protocol(path)
            path.write_bytes(protocol.read_protocol() + b'\n')
            with self.assertRaisesRegex(ValueError, 'SHA256'):
                protocol.read_protocol(path)

    def test_current_agents_pointer_and_workspace_root(self):
        self.assertIn('(shared/tooling/protocol/PROTOCOL.md)', (ROOT / 'AGENTS.md').read_text())
        config = ROOT / '.vscode/Hypergraph PX.code-workspace'
        folders = json.loads(config.read_text())['folders']
        self.assertEqual((config.parent / folders[0]['path']).resolve(), ROOT)
        self.assertEqual(folders[0]['path'], '..')


class SelfBuildLauncherTests(unittest.TestCase):
    def setUp(self):
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
        body = '''import json,os,pathlib,signal,sys,time
sys.argv.pop(0)
name=pathlib.Path(sys.argv[0]).name
if name=='cargo' and sys.argv[1:2]==['metadata']:
 print(json.dumps({'target_directory':str(pathlib.Path.cwd()/'.local/target')}));sys.exit(0)
mask=os.umask(0);os.umask(mask)
with open(os.environ['HPX_FIXTURE_LOG'],'a') as f:f.write(json.dumps({'tool':name,'cwd':os.getcwd(),'args':sys.argv[1:],'umask':mask,'pid':os.getpid()})+'\\n')
if name=='hypergraph' and os.environ.get('HPX_FIXTURE_WAIT'):
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
        path = self.root / '.local/workspaces/self-build/synthetic.hpx'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b'fixture workspace must not change')
        return path

    def calls(self):
        return [json.loads(line) for line in self.log.read_text().splitlines()] if self.log.exists() else []

    def run_launcher(self, args=(), **env):
        return subprocess.run(['/bin/bash', str(self.new), *args], cwd=self.root / 'elsewhere', env={**self.env, **env}, capture_output=True, text=True, timeout=10)

    def test_missing_existing_workspace_refuses_before_any_build(self):
        result = self.run_launcher()
        self.assertEqual(result.returncode, 1)
        self.assertIn('Existing workspace not found', result.stderr)
        self.assertFalse(self.log.exists())
        self.assertFalse((self.root / 'runtime').exists())

    def test_help_and_unknown_or_extra_arguments_have_no_side_effects(self):
        for args, code in ((['--help'], 0), (['-h'], 0), (['--create'], 2), (['bad'], 2), (['', 'extra'], 2)):
            with self.subTest(args=args):
                self.assertEqual(self.run_launcher(args).returncode, code)
                self.assertFalse(self.log.exists())

    def test_stable_locked_build_root_quoting_umask_and_exact_runtime_intent(self):
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
        self.workspace()
        for tool, expected in (('npm', ['npm']), ('cargo', ['npm', 'cargo']), ('hypergraph', ['npm', 'cargo', 'hypergraph'])):
            with self.subTest(tool=tool):
                self.log.unlink(missing_ok=True)
                result = self.run_launcher(HPX_FIXTURE_FAIL=tool)
                self.assertEqual(result.returncode, 23)
                self.assertEqual([c['tool'] for c in self.calls()], expected)

    def test_foreground_exec_preserves_pid_and_signal_ownership(self):
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
