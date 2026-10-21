#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export HF_HOME="${HF_HOME:-/workspace/hf-cache}"
export CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-0}"
export TOKENIZERS_PARALLELISM=false
python3 - <<'PY'
import sys
if not (3,10) <= sys.version_info[:2] <= (3,12):
    raise SystemExit('Use a Python 3.10–3.12 RunPod PyTorch container, preferably Python 3.11.')
PY
nvidia-smi
python3 -m venv .venv-training
.venv-training/bin/python -m pip install --upgrade pip
.venv-training/bin/python -m pip install torch==2.6.0 --index-url https://download.pytorch.org/whl/cu124
.venv-training/bin/python -m pip install -r training-requirements.txt
mkdir -p model-output
.venv-training/bin/python -u finetune_interview_model.py --data data --output model-output --epochs 2 2>&1 | tee model-output/console.log
.venv-training/bin/python - <<'PY'
from pathlib import Path
import shutil
root=Path('model-output')
export=root/'download'
export.mkdir(exist_ok=True)
shutil.copytree(root/'adapter',export/'adapter',dirs_exist_ok=True)
for name in ['training_result.json','training_log.json','console.log']:
    if (root/name).exists():shutil.copy2(root/name,export/name)
shutil.make_archive('trained-interview-adapter','zip',export)
print('Training finished. Download trained-interview-adapter.zip before deleting the Pod.')
PY
