"""Lightweight local preview. Download no model and preserve the local database."""
import os
from pathlib import Path
import secrets
import socket
import threading
import time
import webbrowser

import requests


def main():
    state = Path(__file__).resolve().parents[1] / 'state/local'
    state.mkdir(parents=True, exist_ok=True)
    secret = state / 'session-secret.txt'
    if not secret.exists():
        secret.write_text(secrets.token_hex(32), encoding='utf-8')
    with socket.socket() as sock:
        try:
            sock.bind(('127.0.0.1', 5000))
        except OSError:
            sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    os.environ.update(HOST='127.0.0.1', PORT=str(port), COOKIE_SECURE='0',
                      FLASK_SECRET_KEY=secret.read_text().strip(),
                      CAREERLENS_DB_PATH=str(state / 'careerlens.db'),
                      HR_INTERVIEW_PROVIDER='rules', QUESTIONNAIRE_PROVIDER='local')
    url = f'http://127.0.0.1:{port}'
    def open_when_ready():
        for _ in range(60):
            try:
                if requests.get(url, timeout=2).ok:
                    webbrowser.open(url)
                    return
            except requests.RequestException:
                pass
            time.sleep(1)
    threading.Thread(target=open_when_ready, daemon=True).start()
    print(f'CareerLens lightweight preview: {url}\nKeep this window open. Ctrl+C stops the website.', flush=True)
    from serve_web import main as serve
    serve()


if __name__ == '__main__':
    main()
