"""Turnkey Unsloth LoRA Fine-Tuning Script for CareerLens Totem AI on RunPod.

Hardware: 1x RTX 4090 (24GB VRAM) or 1x A100 (40GB/80GB)
Base Model: Qwen/Qwen2.5-7B-Instruct (4-bit quantized via Unsloth)
Training Time: ~35-45 minutes on RTX 4090 ($0.35/hour on RunPod)
"""

import os
import torch

def train():
    try:
        from unsloth import FastLanguageModel
        from trl import SFTTrainer
        from transformers import TrainingArguments
        from datasets import load_dataset
    except ImportError:
        print("Please install requirements on RunPod:")
        print("pip install unsloth trl datasets transformers accelerate")
        return

    max_seq_length = 2048
    dtype = None # Auto detection
    load_in_4bit = True # 4bit quantization for 4x faster training & 70% VRAM savings

    print("1. Loading Qwen2.5-7B-Instruct with Unsloth...")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name="Qwen/Qwen2.5-7B-Instruct",
        max_seq_length=max_seq_length,
        dtype=dtype,
        load_in_4bit=load_in_4bit,
    )

    print("2. Setting up LoRA Adapters...")
    model = FastLanguageModel.get_peft_model(
        model,
        r=16, # LoRA rank
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                        "gate_proj", "up_proj", "down_proj"],
        lora_alpha=16,
        lora_dropout=0,
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=3407,
    )

    print("3. Loading CareerLens Totem Instructions Dataset...")
    dataset_file = os.path.join(os.path.dirname(__file__), "totem_instructions.jsonl")
    dataset = load_dataset("json", data_files=dataset_file, split="train")

    def format_chatml(batch):
        formatted_texts = []
        for msgs in batch["messages"]:
            text = tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=False)
            formatted_texts.append(text)
        return {"text": formatted_texts}

    dataset = dataset.map(format_chatml, batched=True)

    print("4. Initializing SFT Trainer...")
    output_dir = os.path.join(os.path.dirname(__file__), "careerlens_totem_lora_weights")
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
            warmup_steps=10,
            max_steps=150,
            learning_rate=2e-4,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=10,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="linear",
            seed=3407,
            output_dir=output_dir,
            report_to="none",
        ),
    )

    print("5. Starting Fine-Tuning on GPU...")
    trainer.train()

    print(f"6. Saving Trained LoRA Weights to: {output_dir}")
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    print("Training Complete! You can now load these weights into CareerLens AI.")

if __name__ == "__main__":
    train()
