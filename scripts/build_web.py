"""Install web dependencies explicitly, without relying on Python user sites."""
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def dependency_install_command(root: Path = ROOT) -> list[str]:
    version = f'{sys.version_info.major}.{sys.version_info.minor}'
    destination = root / '.pythonlibs' / 'lib' / f'python{version}' / 'site-packages'
    return [
        sys.executable, '-m', 'pip', 'install',
        '--no-user', '--upgrade', '--target', str(destination),
        '-r', str(root / 'requirements-web.txt'),
    ]


def main() -> None:
    # CLI flags take precedence even when the bootstrap sets PIP_USER=true.
    # Preserve the configured package registry and its security protections.
    subprocess.run(dependency_install_command(), cwd=ROOT, check=True)


if __name__ == '__main__':
    main()
