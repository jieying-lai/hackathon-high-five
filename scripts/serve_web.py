"""Shared website entry point; no model runtime or browser-side installation."""
import os
from pathlib import Path
import sys


def main():
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
    from main import app
    from waitress import serve
    serve(app, host=os.getenv('HOST', '127.0.0.1'), port=int(os.getenv('PORT', '5000')),
          threads=6, channel_timeout=120, clear_untrusted_proxy_headers=True)


if __name__ == '__main__':
    main()
