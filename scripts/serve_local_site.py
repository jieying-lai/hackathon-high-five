"""Serve the local website with a Windows/macOS/Linux compatible WSGI server."""
import os
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from main import app
from waitress import serve

serve(app, host='127.0.0.1', port=int(os.environ['PORT']), threads=6,
      channel_timeout=1200, clear_untrusted_proxy_headers=True)
