"""Create a project-local Python environment, then run the desktop website."""
import argparse
import hashlib
import os
from pathlib import Path
import platform
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--uv', required=True)
    args = parser.parse_args()
    if platform.machine().lower() not in ('amd64', 'x86_64', 'arm64', 'aarch64'):
        raise RuntimeError('This launcher needs a 64-bit Windows, macOS or Linux computer.')
    runtime = ROOT / '.runtime'
    temporary = runtime / 'temp'
    temporary.mkdir(parents=True, exist_ok=True)
    os.environ.update(TEMP=str(temporary), TMP=str(temporary), TMPDIR=str(temporary),
                      UV_CACHE_DIR=str(runtime / 'cache'), UV_LINK_MODE='copy', PYTHONUTF8='1')
    environment = runtime / 'venv'
    python = environment / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    created = not python.exists()
    if created:
        subprocess.run([args.uv, 'venv', '--python', sys.executable, str(environment)], check=True, cwd=ROOT)
    full_model = os.getenv('CAREERLENS_LOCAL_MODEL') == '1'
    requirements = ROOT / ('requirements-local.txt' if full_model else 'requirements-web.txt')
    signature = hashlib.sha256(b'local-runtime-v2' + platform.platform().encode() +
        (ROOT / 'requirements-base.txt').read_bytes() + requirements.read_bytes()).hexdigest()
    marker = runtime / 'installed.txt'
    if created or not marker.exists() or marker.read_text().strip() != signature:
        print('Installing ' + ('website and AI' if full_model else 'lightweight website') + ' dependencies.', flush=True)
        if full_model and platform.system() != 'Darwin' and platform.machine().lower() in ('amd64', 'x86_64'):
            subprocess.run([args.uv, 'pip', 'install', '--python', str(python), 'torch==2.6.0',
                '--index-url', 'https://download.pytorch.org/whl/cpu'], check=True, cwd=ROOT)
        subprocess.run([args.uv, 'pip', 'install', '--python', str(python),
            '-r', str(requirements)], check=True, cwd=ROOT)
        marker.write_text(signature, encoding='utf-8')
    launcher = 'run_local.py' if full_model else 'run_web.py'
    result = subprocess.run([str(python), '-u', str(ROOT / 'scripts' / launcher)], cwd=ROOT)
    return result.returncode


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as exc:
        print(f'Cannot start CareerLens: {exc}', file=sys.stderr)
        sys.exit(1)
