#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$PWD"
export UV_UNMANAGED_INSTALL="$ROOT/.runtime/uv"
export UV_PYTHON_INSTALL_DIR="$ROOT/.runtime/python"
export UV_CACHE_DIR="$ROOT/.runtime/cache"
export UV_DATA_DIR="$ROOT/.runtime/data"
export UV_PYTHON_BIN_DIR="$ROOT/.runtime/bin"
export PYTHONUTF8=1
mkdir -p "$ROOT/.runtime"
if [ ! -x "$UV_UNMANAGED_INSTALL/uv" ]; then
  curl --fail --location --retry 3 https://astral.sh/uv/0.12.19/install.sh -o "$ROOT/.runtime/install-uv.sh"
  sh "$ROOT/.runtime/install-uv.sh"
fi
UV="$UV_UNMANAGED_INSTALL/uv"
"$UV" python install 3.12.14 --no-bin
PYTHON="$("$UV" python find --managed-python 3.12.14)"
exec "$PYTHON" -u scripts/bootstrap_local.py --uv "$UV"
