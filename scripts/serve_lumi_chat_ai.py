"""Lightweight High-Speed Inference Server for Fine-Tuned Lumi AI Chatbot.
Runs on RunPod GPU alongside the Web application (port 8001).
Endpoints:
  POST /chat -> {"response": "..."}
  GET /health -> {"status": "ok"}
"""

import os
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = None
tokenizer = None

def load_lumi_model():
    global model, tokenizer
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from peft import PeftModel
        lora_dir = "models/careerlens_lumi_lora"
        base_model = "Qwen/Qwen2.5-7B-Instruct"

        print("[*] Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(lora_dir if os.path.exists(os.path.join(lora_dir, "tokenizer.json")) else base_model)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.float16 if not torch.cuda.is_bf16_supported() else torch.bfloat16
        )

        print(f"[*] Loading base model {base_model}...")
        base = AutoModelForCausalLM.from_pretrained(
            base_model,
            device_map="auto",
            quantization_config=bnb_config
        )

        if os.path.exists(lora_dir):
            print(f"[*] Loading fine-tuned Lumi LoRA from {lora_dir}...")
            model = PeftModel.from_pretrained(base, lora_dir)
        else:
            model = base

        model.eval()
        print("[✓] Lumi AI Chatbot loaded and ready for inference!")
    except Exception as e:
        print(f"[!] Warning: Could not load GPU model: {e}")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model": "Qwen2.5-7B-Lumi", "gpu": torch.cuda.is_available()})

@app.route("/chat", methods=["POST"])
def chat():
    global model, tokenizer
    data = request.get_json(silent=True) or {}
    user_prompt = data.get("prompt", "").strip()
    system_prompt = data.get("system", (
        "You are Lumi, the proactive, encouraging AI Career Advisor for CareerLens AI in Malaysia. "
        "You provide structured, concise, and highly practical career advice tailored to the Malaysian job market. "
        "Keep responses professional, bulleted where appropriate, and encourage user upskilling."
    ))

    if not user_prompt:
        return jsonify({"ok": False, "error": "No prompt provided"}), 400

    if model is None or tokenizer is None:
        return jsonify({
            "ok": True,
            "response": "Lumi AI is initializing on the GPU. Please try again in a few moments!",
            "engine": "fallback"
        })

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    prompt_text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer([prompt_text], return_tensors="pt").to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            use_cache=True,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True
        )

    response_text = tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True).strip()
    return jsonify({"ok": True, "response": response_text, "engine": "qwen-7b-lumi-gpu"})

if __name__ == "__main__":
    load_lumi_model()
    app.run(host="0.0.0.0", port=8001, threaded=True)
