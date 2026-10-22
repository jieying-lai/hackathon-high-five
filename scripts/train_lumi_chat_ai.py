"""Fine-tunes Qwen2.5-7B-Instruct with QLoRA on RunPod GPU for Lumi AI Chatbox.
Features dual-engine: standard Transformers Trainer OR native zero-dependency PyTorch loop.
"""

import os
import json
import torch
from pathlib import Path

def train():
    import random
    random.seed(42)
    torch.manual_seed(42)
    from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
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
    if not train_data_path.exists():
        os.system("python scripts/generate_lumi_instruct_data.py")

    rows = []
    with open(train_data_path, "r", encoding="utf8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))

    print(f"[*] Formatting {len(rows)} training conversation samples...")
    training_samples = []
    for r in rows:
        messages = [
            {"role": "system", "content": r["system"]},
            {"role": "user", "content": r["user"]},
        ]
        prefix = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        full = prefix + r["assistant"] + tokenizer.eos_token
        
        prefix_ids = tokenizer(prefix, add_special_tokens=False)["input_ids"]
        ids = tokenizer(full, add_special_tokens=False)["input_ids"]
        if len(ids) > 1536:
            ids = ids[:1536]
        
        labels = [-100] * len(prefix_ids) + ids[len(prefix_ids):]
        if len(labels) > len(ids):
            labels = labels[:len(ids)]
            
        training_samples.append({
            "input_ids": ids,
            "labels": labels
        })

    # Try Transformers Trainer first; if broken in environment, use pure native PyTorch loop!
    trainer_available = False
    try:
        from transformers import Trainer, TrainingArguments, DataCollatorForSeq2Seq
        from datasets import Dataset
        trainer_available = True
    except Exception:
        trainer_available = False

    if trainer_available:
        print("[*] Running fine-tuning with Transformers Trainer...")
        dataset = Dataset.from_list(training_samples)
        training_args = TrainingArguments(
            output_dir="outputs_lumi",
            num_train_epochs=3,
            per_device_train_batch_size=1,
            gradient_accumulation_steps=4,
            warmup_steps=2,
            learning_rate=2e-4,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=2,
            save_strategy="no",
            optim="adamw_torch",
            report_to="none",
            seed=42
        )
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=dataset,
            processing_class=tokenizer,
            data_collator=DataCollatorForSeq2Seq(tokenizer=tokenizer, padding=True, label_pad_token_id=-100)
        )
        trainer.train()
    else:
        print("[*] Running fine-tuning with Native PyTorch Autograd Engine (Bypassing Trainer)...")
        trainable_params = [p for p in model.parameters() if p.requires_grad]
        optimizer = torch.optim.AdamW(trainable_params, lr=2e-4, weight_decay=0.01)
        epochs = 3
        device = next(model.parameters()).device
        
        model.train()
        for epoch in range(1, epochs + 1):
            epoch_loss = 0.0
            for step, sample in enumerate(training_samples, 1):
                input_ids = torch.tensor([sample["input_ids"]], dtype=torch.long, device=device)
                labels = torch.tensor([sample["labels"]], dtype=torch.long, device=device)
                
                outputs = model(input_ids=input_ids, labels=labels)
                loss = outputs.loss
                loss.backward()
                
                if step % 4 == 0 or step == len(training_samples):
                    optimizer.step()
                    optimizer.zero_grad()
                    
                epoch_loss += loss.item()
                if step % 4 == 0 or step == len(training_samples):
                    print(f"  [Epoch {epoch}/{epochs} | Step {step}/{len(training_samples)}] Current Loss: {loss.item():.4f}")
            print(f"[*] Epoch {epoch} Completed! Avg Loss: {epoch_loss / len(training_samples):.4f}")

    print(f"[*] Saving Lumi LoRA adapter to {output_dir}...")
    model.save_pretrained(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    print(f"✓ Training Complete! LoRA weights successfully saved to {output_dir}")

if __name__ == "__main__":
    train()
