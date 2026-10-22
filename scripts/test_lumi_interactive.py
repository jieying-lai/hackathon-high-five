"""Interactive CLI test tool to chat directly with your fine-tuned Lumi AI (Qwen2.5-7B LoRA).
Run in RunPod terminal:
  python scripts/test_lumi_interactive.py
"""

import os
import torch
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

BASE_MODEL = "Qwen/Qwen2.5-7B-Instruct"
LORA_PATH = "models/careerlens_lumi_lora"

SYSTEM_PROMPT = (
    "You are Lumi 🦉, the encouraging, expert AI Career Advisor for CareerLens AI in Malaysia. "
    "You give concise, actionable, Malaysian-market aware career advice with specific skills, "
    "salaries in MYR (RM), and HRD Corp claimable upskilling pathways."
)

def main():
    print("=" * 65)
    print("🦉 CareerLens AI - Lumi Copilot (Qwen2.5-7B LoRA) Interactive Test")
    print("=" * 65)
    
    if not os.path.exists(LORA_PATH):
        print(f"[!] Warning: {LORA_PATH} not found. Run training first!")
        return

    print(f"[*] Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(LORA_PATH if os.path.exists(os.path.join(LORA_PATH, "tokenizer.json")) else BASE_MODEL)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print(f"[*] Loading base model {BASE_MODEL} in 4-bit...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.float16 if not torch.cuda.is_bf16_supported() else torch.bfloat16
    )
    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        device_map="auto",
        quantization_config=bnb_config
    )

    print(f"[*] Attaching fine-tuned LoRA weights from {LORA_PATH}...")
    model = PeftModel.from_pretrained(base_model, LORA_PATH)
    model.eval()

    print("\n[✓] Lumi AI is ready! You can now ask questions about career advice, salaries in Malaysia, reskilling, etc.")
    print("Type 'exit' or 'quit' to stop.\n" + "-" * 65)

    default_questions = [
        "Hi Lumi! I am currently a Junior Financial Auditor in KL earning RM 3,500. How can I transition into a Data Analyst or Financial Analyst role?",
        "What are the most in-demand tech skills in Malaysia for 2026?",
        "Can you recommend courses claimable under HRD Corp in Malaysia?"
    ]

    print("Quick-test questions you can try:")
    for idx, q in enumerate(default_questions, 1):
        print(f"  {idx}. {q}")
    print("-" * 65)

    while True:
        try:
            user_input = input("\n👤 You: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print("🦉 Lumi: Bye! All the best with your career growth!")
                break
            
            # If user types 1, 2, or 3, pick from defaults
            if user_input in ("1", "2", "3"):
                user_input = default_questions[int(user_input) - 1]
                print(f"👤 Selected: {user_input}")

            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input}
            ]

            prompt_text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = tokenizer([prompt_text], return_tensors="pt").to(model.device)

            print("🦉 Lumi is typing...", end="\r", flush=True)

            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=400,
                    temperature=0.7,
                    top_p=0.9,
                    pad_token_id=tokenizer.eos_token_id,
                    do_sample=True
                )

            reply = tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True).strip()
            print(f"🦉 Lumi:\n{reply}\n")
            print("-" * 65)
        except (KeyboardInterrupt, EOFError):
            print("\nExiting...")
            break

if __name__ == "__main__":
    main()
