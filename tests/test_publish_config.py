"""Publishing contracts; these checks do not contact or start a deployment."""
from pathlib import Path
import shlex
import tomllib
import unittest


ROOT = Path(__file__).resolve().parents[1]


class PublishConfigurationTests(unittest.TestCase):
    def test_dependencies_are_installed_during_build_not_startup(self):
        config = tomllib.loads((ROOT / '.replit').read_text())
        deployment = config['deployment']
        self.assertEqual(deployment['build'][:4], ['python', '-m', 'pip', 'install'])
        self.assertIn('requirements-web.txt', deployment['build'])
        command = shlex.join(deployment['run'])
        self.assertIn('scripts/serve_web.py', command)
        self.assertNotIn('pip install', command)

    def test_shared_constraints_are_reachable_from_each_environment(self):
        requirements = (
            'requirements.txt', 'requirements-local.txt', 'requirements-web.txt',
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
        dependencies = (ROOT / 'requirements.txt').read_text().splitlines()
        for line in dependencies:
            if line.startswith('#'):
                continue
            self.assertFalse(line.startswith(('transformers', 'torch', 'peft', 'runpod')))


if __name__ == '__main__':
    unittest.main()
