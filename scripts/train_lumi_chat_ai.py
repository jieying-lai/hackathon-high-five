"""Fine-tunes Qwen2.5-7B-Instruct with Unsloth QLoRA on RunPod GPU for Lumi AI Chatbox.
Designed for RTX 4000 Ada / A40 / RTX 3090 / A100.
Run in RunPod terminal:
  python scripts/train_lumi_chat_ai.py
"""

import os
import json
import torch

def train():
    try:
        from unsloth import FastLanguageModel
        from trl import SFTTrainer
        from transformers import TrainingArguments
        from datasets import Dataset
    except ImportError:
        print("[!] Installing unsloth & training dependencies...")
        os.system("pip install --no-deps \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"")
        os.system("pip install trl peft accelerate bitsandbytes")
        from unsloth import FastLanguageModel
        from trl import SFTTrainer
        from transformers import TrainingArguments
        from datasets import Dataset

    model_name = "Qwen/Qwen2.5-7B-Instruct"
    max_seq_length = 2048
    output_dir = "models/careerlens_lumi_lora"

    print(f"[*] Loading {model_name} in 4-bit...")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=model_name,
        max_seq_length=max_seq_length,
        dtype=None,
        load_in_4bit=True,
    )

    print("[*] Adding LoRA adapters...")
    model = FastLanguageModel.get_peft_model(
        model,
        r=16,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_alpha=16,
        lora_dropout=0,
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=42,
    )

    # Load and format dataset
    train_data_path = "data/lumi_chat_train.jsonl"
    if not os.path.exists(train_data_path):
        os.system("python scripts/generate_lumi_instruct_data.py")

    rows = []
    with open(train_data_path, "r", encoding="utf8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))

    formatted_texts = []
    for r in rows:
        messages = [
            {"role": "system", "content": r["system"]},
            {"role": "user", "content": r["user"]},
            {"role": "assistant", "content": r["assistant"]}
        ]
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        formatted_texts.append({"text": text})

    dataset = Dataset.from_list(formatted_texts)
    print(f"[*] Prepared {len(formatted_texts)} training conversation samples.")

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=max_seq_length,
        dataset_num_proc=2,
        packing=False,
        args=TrainingArguments(
            per_device_train_batch_size=2,
            gradient_accumulation_steps=4,
            warmup_steps=3,
            max_steps=30,
            learning_rate=2e-4,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=1,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="linear",
            seed=42,
            output_dir="outputs_lumi",
            report_to="none"
        ),
    )

    print("[*] Starting Lumi Chatbot fine-tuning...")
    trainer.train()

    print(f"[*] Saving Lumi LoRA adapter to {output_dir}...")
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"✓ Training Complete! Adapter saved to {output_dir}")

if __name__ == "__main__":
    train()
