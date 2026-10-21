#!/bin/bash
set -e

echo "=== CareerLens AI Demo Launcher ==="

# 1. Kill any existing server on port 5000
echo "1. Checking port 5000..."
fuser -k 5000/tcp 2>/dev/null || true

# 2. Install basic requirements if missing
echo "2. Ensuring requirements..."
pip install flask flask-cors >/dev/null 2>&1 || true

# 3. Start CareerLens server
echo "3. Starting CareerLens server..."
export HOST="0.0.0.0"
export PORT="5000"
nohup python src/main.py > web.log 2>&1 &
SERVER_PID=$!
sleep 2

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✓ CareerLens backend running successfully (PID: $SERVER_PID)"
else
    echo "✗ Server failed to start. Last lines of web.log:"
    tail -n 20 web.log
    exit 1
fi

# 4. Download cloudflared if not present
if ! command -v cloudflared &> /dev/null; then
    echo "4. Downloading Cloudflare Tunnel..."
    curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
fi

# 5. Start tunnel
echo "5. Connecting Cloudflare Tunnel to port 5000..."
echo "--------------------------------------------------------"
echo "Your public demo URL will appear below (look for *.trycloudflare.com):"
echo "--------------------------------------------------------"
cloudflared tunnel --url http://127.0.0.1:5000
