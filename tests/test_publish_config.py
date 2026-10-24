"""Publishing contracts; these checks do not contact or start a deployment."""
from pathlib import Path
import os
import shlex
import subprocess
import sys
import tempfile
import tomllib
import unittest
from unittest.mock import patch

from scripts import build_web


ROOT = Path(__file__).resolve().parents[1]


class PublishConfigurationTests(unittest.TestCase):
    def test_dependencies_are_installed_during_build_not_startup(self):
        config = tomllib.loads((ROOT / '.replit').read_text())
        deployment = config['deployment']
        self.assertEqual(deployment['build'], ['python', 'scripts/build_web.py'])
        install = build_web.dependency_install_command()
        self.assertIn(str(ROOT / 'requirements-web.txt'), install)
        command = shlex.join(deployment['run'])
        self.assertIn('scripts/serve_web.py', command)
        self.assertNotIn('pip install', command)

    def test_explicit_build_avoids_root_requirements_autodetection(self):
        self.assertFalse((ROOT / 'requirements.txt').exists())
        self.assertIn('-r requirements-base.txt',
                      (ROOT / 'requirements-web.txt').read_text())
        config = tomllib.loads((ROOT / '.replit').read_text())
        self.assertIs(config['packager']['features']['enabledForHosting'], False)
        install = build_web.dependency_install_command()
        self.assertIn('--no-user', install)
        destination = Path(install[install.index('--target') + 1])
        self.assertEqual(destination.parent.name,
                         f'python{sys.version_info.major}.{sys.version_info.minor}')
        self.assertTrue(destination.is_relative_to(ROOT / '.pythonlibs'))
        self.assertNotIn('--trusted-host', install)
        self.assertNotIn('--no-index', install)

    def test_install_failure_is_not_silently_ignored(self):
        failure = subprocess.CalledProcessError(1, ['pip'])
        with patch.object(build_web.subprocess, 'run', side_effect=failure) as run:
            with self.assertRaises(subprocess.CalledProcessError):
                build_web.main()
            self.assertTrue(run.call_args.kwargs['check'])

    def test_explicit_install_works_when_user_site_is_disabled(self):
        # Resolve an empty fixture only: this exercises real pip without
        # installing packages, changing the application, or downloading files.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            requirements = root / 'requirements-web.txt'
            requirements.write_text('# Empty dependency fixture\n')
            baseline = [
                sys.executable, '-s', '-m', 'pip', 'install',
                '--dry-run', '--disable-pip-version-check', '-r', str(requirements),
            ]
            fixed = build_web.dependency_install_command(root)
            fixed.insert(1, '-s')
            fixed.extend(['--dry-run', '--disable-pip-version-check'])
            with patch.dict(os.environ, {
                'PIP_USER': 'true', 'PIP_TARGET': '', 'PYTHONNOUSERSITE': '1',
            }):
                broken = subprocess.run(baseline, cwd=root, capture_output=True,
                                        text=True, timeout=30)
                working = subprocess.run(fixed, cwd=root, capture_output=True,
                                         text=True, timeout=30)
            # Nix/Linux may reject the destination before reaching pip's user-site
            # check. The explicit project target must avoid either failure.
            if broken.returncode != 0:
                self.assertRegex(
                    broken.stderr,
                    'User site-packages are disabled|externally-managed-environment',
                )
            self.assertEqual(working.returncode, 0, working.stdout + working.stderr)

    def test_shared_constraints_are_reachable_from_each_environment(self):
        requirements = (
            'requirements-base.txt', 'requirements-local.txt', 'requirements-web.txt',
            'runpod/requirements-cv.txt', 'runpod/requirements-judges.txt',
            'scripts/training-requirements.txt',
        )

        def collect(path, seen):
            path = path.resolve()
            if path in seen:
                return
            seen.add(path)
            self.assertTrue(path.is_file(), str(path))
            for line in path.read_text().splitlines():
                if line.startswith(('-r ', '-c ')):
                    collect(path.parent / line.split(maxsplit=1)[1], seen)

        for name in requirements:
            with self.subTest(environment=name):
                seen = set()
                collect(ROOT / name, seen)
                self.assertIn(ROOT / 'requirements-security.txt', seen)

    def test_gpu_image_copies_its_shared_constraints(self):
        image = (ROOT / 'runpod/Dockerfile.cv').read_text()
        allowlist = (ROOT / 'runpod/Dockerfile.cv.dockerignore').read_text().splitlines()
        self.assertIn('COPY requirements-security.txt /app/requirements-security.txt', image)
        self.assertIn('!requirements-security.txt', allowlist)
        self.assertIn('-r runpod/requirements-cv.txt', image)

    def test_web_does_not_install_the_local_model_stack(self):
        dependencies = (ROOT / 'requirements-base.txt').read_text().splitlines()
        for line in dependencies:
            if line.startswith('#'):
                continue
            self.assertFalse(line.startswith(('transformers', 'torch', 'peft', 'runpod')))


if __name__ == '__main__':
    unittest.main()
