"""Fine-tunes Qwen2.5-7B-Instruct with QLoRA on RunPod GPU for Lumi AI Chatbox.
Designed for RTX 4000 Ada / A40 / RTX 3090 / RTX 4090 / A100.
Run in RunPod terminal:
  python scripts/train_lumi_chat_ai.py
"""

import os
import json
import torch
from pathlib import Path

def train():
    model_name = "Qwen/Qwen2.5-7B-Instruct"
    max_seq_length = 2048
    output_dir = "models/careerlens_lumi_lora"
    os.makedirs(output_dir, exist_ok=True)

    use_unsloth = False
    try:
        import unsloth
        try:
            from unsloth import FastLanguageModel
            use_unsloth = True
        except (ImportError, Exception):
            os.system("pip install unsloth_zoo")
            from unsloth import FastLanguageModel
            use_unsloth = True
    except Exception:
        use_unsloth = False

    print(f"[*] Training framework: {'Unsloth FastLanguageModel' if use_unsloth else 'HuggingFace Transformers + PEFT'}")

    from trl import SFTTrainer
    from transformers import TrainingArguments, AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
    from datasets import Dataset
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

    if use_unsloth:
        print(f"[*] Loading {model_name} with Unsloth in 4-bit...")
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
    else:
        print(f"[*] Loading {model_name} with Transformers 4-bit QLoRA...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.float16 if not torch.cuda.is_bf16_supported() else torch.bfloat16
        )
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            device_map="auto",
            quantization_config=bnb_config
        )
        model = prepare_model_for_kbit_training(model)
        peft_config = LoraConfig(
            r=16,
            lora_alpha=16,
            lora_dropout=0.05,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
            bias="none",
            task_type="CAUSAL_LM"
        )
        model = get_peft_model(model, peft_config)

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
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=max_seq_length,
        dataset_num_proc=1,
        packing=False,
        args=TrainingArguments(
            per_device_train_batch_size=1,
            gradient_accumulation_steps=4,
            warmup_steps=2,
            max_steps=25,
            learning_rate=2e-4,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=1,
            optim="adamw_torch",
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
