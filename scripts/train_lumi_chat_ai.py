"""Fine-tunes Qwen2.5-7B-Instruct with QLoRA on RunPod GPU for Lumi AI Chatbox.
Immune to TRL/AutoProcessor version conflicts by using standard Transformers Trainer.
"""

import os
import json
import torch
from pathlib import Path

def train():
    from transformers import (
        AutoTokenizer,
        AutoModelForCausalLM,
        BitsAndBytesConfig,
        Trainer,
        TrainingArguments,
        DataCollatorForSeq2Seq,
        set_seed
    )
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from datasets import load_dataset

    set_seed(42)
    model_name = "Qwen/Qwen2.5-7B-Instruct"
    output_dir = Path("models/careerlens_lumi_lora")
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"[*] Loading tokenizer for {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    print(f"[*] Loading {model_name} in 4-bit NF4...")
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
    model.config.use_cache = False

    print("[*] Attaching LoRA adapter...")
    peft_config = LoraConfig(
        r=16,
        lora_alpha=16,
        lora_dropout=0.05,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        bias="none",
        task_type="CAUSAL_LM"
    )
    model = get_peft_model(model, peft_config)

    train_data_path = Path("data/lumi_chat_train.jsonl")
    val_data_path = Path("data/lumi_chat_val.jsonl")
    if not train_data_path.exists():
        os.system("python scripts/generate_lumi_instruct_data.py")

    dataset = load_dataset(
        "json",
        data_files={
            "train": str(train_data_path),
            "validation": str(val_data_path if val_data_path.exists() else train_data_path)
        }
    )

    def tokenize_fn(row):
        messages = [
            {"role": "system", "content": row["system"]},
            {"role": "user", "content": row["user"]},
        ]
        prefix = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        full = prefix + row["assistant"] + tokenizer.eos_token
        
        prefix_ids = tokenizer(prefix, add_special_tokens=False)["input_ids"]
        ids = tokenizer(full, add_special_tokens=False)["input_ids"]
        if len(ids) > 1536:
            ids = ids[:1536]
        
        labels = [-100] * len(prefix_ids) + ids[len(prefix_ids):]
        if len(labels) > len(ids):
            labels = labels[:len(ids)]
            
        return {
            "input_ids": ids,
            "attention_mask": [1] * len(ids),
            "labels": labels
        }

    tokenized = dataset.map(tokenize_fn, remove_columns=dataset["train"].column_names)
    print(f"[*] Prepared {len(tokenized['train'])} tokenized training samples.")

    training_args = TrainingArguments(
        output_dir="outputs_lumi",
        num_train_epochs=3,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        warmup_steps=2,
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=1,
        save_strategy="no",
        optim="adamw_torch",
        report_to="none",
        seed=42
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
        processing_class=tokenizer,
        data_collator=DataCollatorForSeq2Seq(tokenizer=tokenizer, padding=True, label_pad_token_id=-100)
    )

    print("[*] Starting Lumi Chatbot fine-tuning...")
    trainer.train()

    print(f"[*] Saving Lumi LoRA adapter to {output_dir}...")
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    print(f"✓ Training Complete! Adapter saved to {output_dir}")

if __name__ == "__main__":
    train()
