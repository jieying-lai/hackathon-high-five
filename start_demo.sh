#!/bin/bash
set -e

echo "=== CareerLens AI Demo Launcher ==="

# 1. Kill any existing servers on ports 5000 and 8001
echo "1. Freeing ports 5000 and 8001..."
pkill -9 -f "src/main" 2>/dev/null || true
pkill -9 -f "flask" 2>/dev/null || true
pkill -9 -f "serve_lumi_chat_ai" 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 8001/tcp 2>/dev/null || true
sleep 1

# 2. Install basic requirements if missing
echo "2. Ensuring requirements..."
pip install flask flask-cors >/dev/null 2>&1 || true

# 3. Optional: Launch Lumi AI Model on GPU if present
if command -v nvidia-smi &> /dev/null; then
    echo "3. GPU detected! Starting Lumi AI Chatbot on port 8001..."
    export LUMI_AI_URL="http://127.0.0.1:8001/chat"
    nohup python scripts/serve_lumi_chat_ai.py > lumi_serve.log 2>&1 &
    sleep 2
fi

# 4. Start CareerLens server
echo "4. Starting CareerLens Web App..."
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

# 5. Download cloudflared if not present
if ! command -v cloudflared &> /dev/null; then
    echo "5. Downloading Cloudflare Tunnel..."
    curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
fi

# 6. Start tunnel
echo "6. Connecting Cloudflare Tunnel to port 5000..."
echo "--------------------------------------------------------"
echo "Your public demo URL will appear below (look for *.trycloudflare.com):"
echo "--------------------------------------------------------"
cloudflared tunnel --url http://127.0.0.1:5000
