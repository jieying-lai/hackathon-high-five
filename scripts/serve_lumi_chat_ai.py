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
        from unsloth import FastLanguageModel
        lora_dir = "models/careerlens_lumi_lora"
        base_model = "Qwen/Qwen2.5-7B-Instruct"

        if os.path.exists(lora_dir):
            print(f"[*] Loading fine-tuned Lumi LoRA from {lora_dir}...")
            model, tokenizer = FastLanguageModel.from_pretrained(
                model_name=lora_dir,
                max_seq_length=2048,
                dtype=None,
                load_in_4bit=True,
            )
        else:
            print(f"[*] Loading base model {base_model}...")
            model, tokenizer = FastLanguageModel.from_pretrained(
                model_name=base_model,
                max_seq_length=2048,
                dtype=None,
                load_in_4bit=True,
            )
        FastLanguageModel.for_inference(model)
        print("[✓] Lumi AI Chatbot loaded and ready for inference!")
    except Exception as e:
        print(f"[!] Warning: Could not load Unsloth/GPU model: {e}")

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
        # Fallback response if model is loading
        return jsonify({
            "ok": True,
            "response": "Lumi AI is initializing on the GPU. Please try again in a few moments!",
            "engine": "fallback"
        })

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    inputs = tokenizer.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to("cuda")

    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            use_cache=True,
            pad_token_id=tokenizer.eos_token_id
        )

    response_text = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True).strip()
    return jsonify({"ok": True, "response": response_text, "engine": "qwen-7b-lumi-gpu"})

if __name__ == "__main__":
    load_lumi_model()
    app.run(host="0.0.0.0", port=8001, threaded=True)
