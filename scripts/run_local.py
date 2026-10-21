"""Own both local services; no cloud credentials or preinstalled Python needed."""
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import time
import webbrowser

import psutil
import requests
from filelock import FileLock, Timeout

from download_interview_base import ensure_base_model

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'state/local'


def free_port(preferred):
    with socket.socket() as sock:
        try:
            sock.bind(('127.0.0.1', preferred))
        except OSError:
            sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def wait_ready(process, url, seconds, model=False):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError('Service stopped during startup. See state/local/logs.')
        try:
            response = requests.get(url, timeout=2)
            if response.ok and (not model or response.json().get('adapter_loaded') is True):
                return
        except (requests.RequestException, ValueError):
            pass
        time.sleep(1)
    raise RuntimeError('Service startup timed out. See state/local/logs.')


def main():
    STATE.mkdir(parents=True, exist_ok=True)
    logs = STATE / 'logs'
    logs.mkdir(exist_ok=True)
    instance = STATE / 'running.json'
    lock = FileLock(str(STATE / 'launcher.lock'))
    try:
        lock.acquire(timeout=0)
    except Timeout:
        if instance.exists():
            info = json.loads(instance.read_text())
            url = f"http://127.0.0.1:{int(info['port'])}"
            print('This project is already running at ' + url)
            webbrowser.open(url)
        else:
            print('This project is already starting. Keep the first startup window open.')
        return 0
    children = []
    streams = []
    try:
        adapter = ROOT / 'models/interview-adapter'
        if not (adapter / 'adapter_model.safetensors').exists():
            raise RuntimeError('The trained adapter is missing. Download the complete GitHub project, including models/.')
        memory = psutil.virtual_memory()
        if memory.total < 12 * 1024**3:
            print('WARNING: 16 GB RAM is recommended. AI generation can be slow or run out of memory.', flush=True)
        if memory.available < 5 * 1024**3:
            print('Please close memory-heavy applications. CPU AI needs several GB of available RAM.', flush=True)
        if memory.available < 4 * 1024**3:
            raise RuntimeError('Not enough free memory to start local AI. Close unused apps to free at least 4 GB of RAM, then restart Start.cmd.')
        base = ensure_base_model()
        model_port = free_port(8766)
        web_port = free_port(5000)
        secret_path = STATE / 'session-secret.txt'
        if not secret_path.exists():
            secret_path.write_text(secrets.token_hex(32), encoding='utf-8')
        env = {**os.environ, 'PYTHONUTF8': '1', 'PYTHONUNBUFFERED': '1',
            'HF_HUB_ENABLE_HF_TRANSFER': '0', 'HF_HUB_OFFLINE': '1',
            'HF_HUB_DISABLE_SYMLINKS_WARNING': '1', 'TOKENIZERS_PARALLELISM': 'false',
            'HOST': '127.0.0.1', 'PORT': str(web_port), 'COOKIE_SECURE': '0',
            'FLASK_SECRET_KEY': secret_path.read_text().strip(),
            'CAREERLENS_DB_PATH': str(STATE / 'careerlens.db'), 'CAREERLENS_DEMO': '1',
            'HR_INTERVIEW_PROVIDER': 'local',
            'HR_INTERVIEW_MODEL_URL': f'http://127.0.0.1:{model_port}/generate',
            'CAREERLENS_MANAGED_MODEL': '1', 'QUESTIONNAIRE_PROVIDER': 'local',
            'CV_AI_PROVIDER': 'desktop', 'CV_MODEL_ID': 'Qwen/Qwen2.5-1.5B-Instruct',
            'CV_LOCAL_MODEL_URL': f'http://127.0.0.1:{model_port}/organise-cv'}

        def start(name, command):
            stream = (logs / (name + '.log')).open('a', encoding='utf-8')
            streams.append(stream)
            process = subprocess.Popen(command, cwd=ROOT, env=env, stdout=stream, stderr=stream,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
            children.append(process)
            return process

        print('Loading your trained AI on this computer (CPU; no GPU or API key required)...', flush=True)
        model = start('model', [sys.executable, '-u', str(ROOT / 'scripts/serve_interview_model.py'),
            '--adapter', str(adapter), '--model', str(base), '--port', str(model_port)])
        wait_ready(model, f'http://127.0.0.1:{model_port}/health', 300, model=True)
        site = start('website', [sys.executable, '-u', str(ROOT / 'scripts/serve_local_site.py')])
        url = f'http://127.0.0.1:{web_port}'
        wait_ready(site, url + '/', 120)
        instance.write_text(json.dumps({'port': web_port, 'pid': os.getpid(), 'model_url':f'http://127.0.0.1:{model_port}/generate',
                                       'model_pid':model.pid, 'website_pid':site.pid}))
        print('\nCareerLens is ready: ' + url + '\nKeep this window open. Press Ctrl+C to stop both services.', flush=True)
        print('Demo login: hr.demo@nexussme.my / CareerLens@2026', flush=True)
        webbrowser.open(url)
        while True:
            if any(child.poll() is not None for child in children):
                raise RuntimeError('A service exited. See state/local/logs, then restart Start.cmd.')
            time.sleep(1)
    finally:
        for child in reversed(children):
            if child.poll() is None:
                child.terminate()
        for child in children:
            try:
                child.wait(timeout=10)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()
        for stream in streams:
            stream.close()
        instance.unlink(missing_ok=True)
        lock.release()


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print('\nCareerLens stopped.')
    except Exception as exc:
        print(f'Startup failed: {exc}', file=sys.stderr)
        sys.exit(1)
