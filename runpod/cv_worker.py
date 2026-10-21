"""Real GPU inference; lazy imports permit contract/unit checks without CUDA."""
import os
from pathlib import Path
import sys
import threading

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from cv_model_contract import CONTRACT_VERSION, MODEL_ID, messages_for, validate_output, validate_pages

_model = _tokenizer = None
_lock = threading.Lock()


def generate(pages):
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
    global _model, _tokenizer
    model_id = os.environ.get('CV_MODEL_ID', MODEL_ID)
    revision = os.environ.get('CV_MODEL_REVISION', 'main')
    adapter = os.environ.get('CV_ADAPTER_PATH', '')
    with _lock:
        if _model is None:
            if not torch.cuda.is_available():
                raise RuntimeError('A CUDA GPU is required for this worker.')
            _tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision, trust_remote_code=False)
            _model = AutoModelForCausalLM.from_pretrained(model_id, revision=revision,
                trust_remote_code=False, device_map='auto', torch_dtype=torch.float16,
                quantization_config=BitsAndBytesConfig(load_in_4bit=True,
                    bnb_4bit_quant_type='nf4', bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.float16))
            if adapter:
                from peft import PeftModel
                _model = PeftModel.from_pretrained(_model, adapter)
            _model.eval()
        encoded = _tokenizer.apply_chat_template(messages_for(pages), add_generation_prompt=True,
            tokenize=True, return_dict=True, return_tensors='pt').to(_model.device)
        length = encoded['input_ids'].shape[-1]
        if length > 10000:
            raise ValueError('CV exceeds the worker token budget; shorten the text PDF.')
        with torch.inference_mode():
            output = _model.generate(**encoded, max_new_tokens=4096, do_sample=False,
                pad_token_id=_tokenizer.eos_token_id)
        text = _tokenizer.decode(output[0][length:], skip_special_tokens=True)
        return {'contract': CONTRACT_VERSION, 'draft': validate_output(text, pages),
            'model_id': model_id, 'model_revision': getattr(_model.config, '_commit_hash', None) or revision,
            'adapter_version': os.environ.get('CV_ADAPTER_VERSION', '') if adapter else ''}


def handler(job):
    try:
        payload = job.get('input', {})
        if not isinstance(payload, dict) or payload.get('task') != CONTRACT_VERSION:
            raise ValueError('Unsupported task')
        pages = validate_pages(payload.get('pages'))
        return generate(pages)
    except Exception:
        # Never echo CV content, prompt text, credentials, or raw model exceptions into logs/results.
        return {'error': 'CV_MODEL_FAILED', 'message': 'CV inference or evidence validation failed.'}
