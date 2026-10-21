"""Fetch public, pinned base weights automatically, with resumable Hub downloads."""
import hashlib
import json
from pathlib import Path

REPOSITORY = 'Qwen/Qwen2.5-1.5B-Instruct'
REVISION = '989aa7980e4cf806f80c7fef2b1adb7bc71aa306'
WEIGHT_BYTES = 3087467144
WEIGHT_SHA256 = 'dd924a11b4c220f385b51ffa522daea7c9f3d850e31b162bb5661df483c6d3ee'
ROOT = Path(__file__).resolve().parents[1] / 'state/interview-model/base-model'


def ensure_base_model():
    ROOT.mkdir(parents=True, exist_ok=True)
    weights = ROOT / 'model.safetensors'
    marker = ROOT / 'verified-local.json'
    stat = weights.stat() if weights.exists() else None
    stamp = {'revision': REVISION, 'bytes': stat.st_size if stat else 0,
             'mtime_ns': stat.st_mtime_ns if stat else 0}
    try:
        if (json.loads(marker.read_text()) == stamp and stat.st_size == WEIGHT_BYTES
                and json.loads((ROOT / 'config.json').read_text()).get('model_type') == 'qwen2'
                and (ROOT / 'generation_config.json').exists()):
            print('Using the cached base model.', flush=True)
            return ROOT
    except (OSError, ValueError, AttributeError):
        pass
    valid_weights = False
    if stat and stat.st_size == WEIGHT_BYTES:
        print('Verifying cached model weights...', flush=True)
        with weights.open('rb') as stream:
            valid_weights = hashlib.file_digest(stream, 'sha256').hexdigest() == WEIGHT_SHA256
    from huggingface_hub import hf_hub_download
    names = ['config.json', 'generation_config.json']
    if not valid_weights:
        print('First startup: downloading ~3.1 GB of public model weights. Keep this window open.', flush=True)
        names.append('model.safetensors')
    for name in names:
        if valid_weights and (ROOT/name).exists():
            try:
                json.loads((ROOT/name).read_text())
                continue
            except (ValueError,OSError):
                pass
        hf_hub_download(REPOSITORY, name, revision=REVISION, local_dir=ROOT,
                        force_download=name == 'model.safetensors' and weights.exists())
    if not valid_weights:
        with weights.open('rb') as stream:
            valid_weights = hashlib.file_digest(stream, 'sha256').hexdigest() == WEIGHT_SHA256
    if not valid_weights or weights.stat().st_size != WEIGHT_BYTES:
        raise RuntimeError('Base-model checksum failed. Restart to download a clean copy.')
    if json.loads((ROOT / 'config.json').read_text()).get('model_type') != 'qwen2':
        raise RuntimeError('Unexpected base model configuration.')
    stat = weights.stat()
    marker.write_text(json.dumps({'revision': REVISION, 'bytes': stat.st_size,
                                 'mtime_ns': stat.st_mtime_ns}), encoding='utf-8')
    return ROOT


if __name__ == '__main__':
    print('Base model ready:', ensure_base_model())
