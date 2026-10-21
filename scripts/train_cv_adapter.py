"""Run on an authorised RunPod GPU Pod after curating train/validation annotations."""
import argparse
import json
from pathlib import Path
from cv_dataset import fingerprint, load_dataset, require_disjoint
from cv_model_contract import CONTRACT_VERSION, MODEL_ID, messages_for


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', required=True)
    parser.add_argument('--validation', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--model', default=MODEL_ID)
    parser.add_argument('--revision', required=True, help='Pinned Hugging Face model commit SHA')
    args = parser.parse_args()
    train, validation = load_dataset(args.train), load_dataset(args.validation)
    require_disjoint(train, validation)
    if len(train) < 200 or len(validation) < 50:
        raise ValueError('Curate at least 200 training and 50 validation CVs. Smoke fixtures are not a training dataset.')
    if len(args.revision) != 40 or any(c not in '0123456789abcdef' for c in args.revision):
        raise ValueError('Use an immutable 40-character model commit SHA.')
    output = Path(args.output)
    if output.exists():
        raise ValueError('Choose a new output folder; existing adapters are not overwritten.')
    import torch
    from datasets import Dataset
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from transformers import (AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig,
                              DataCollatorForSeq2Seq, Trainer, TrainingArguments)
    if not torch.cuda.is_available():
        raise RuntimeError('A CUDA GPU is required. This command has not trained a model on CPU.')
    dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
    tokenizer = AutoTokenizer.from_pretrained(args.model, revision=args.revision, trust_remote_code=False)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = 'right'

    def encode(row):
        messages = messages_for(row['pages'])
        prefix = tokenizer.apply_chat_template(messages, add_generation_prompt=True, tokenize=True)
        full = tokenizer.apply_chat_template(messages + [{'role': 'assistant', 'content': json.dumps(row['expected'], ensure_ascii=False)}], tokenize=True)
        if len(full) > 12000 or full[:len(prefix)] != prefix:
            raise ValueError('Annotation exceeds the token budget or chat template differs; fix the example without truncating labels.')
        return {'input_ids': full, 'attention_mask': [1] * len(full),
                'labels': [-100] * len(prefix) + full[len(prefix):]}

    train_data = Dataset.from_list([encode(row) for row in train])
    valid_data = Dataset.from_list([encode(row) for row in validation])
    model = AutoModelForCausalLM.from_pretrained(args.model, revision=args.revision,
        trust_remote_code=False, device_map={'': torch.cuda.current_device()}, torch_dtype=dtype,
        quantization_config=BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4',
            bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=dtype))
    model = prepare_model_for_kbit_training(model)
    model.config.use_cache = False
    model = get_peft_model(model, LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
        target_modules='all-linear', bias='none', task_type='CAUSAL_LM'))
    trainer = Trainer(model=model, train_dataset=train_data, eval_dataset=valid_data,
        data_collator=DataCollatorForSeq2Seq(tokenizer, padding=True, label_pad_token_id=-100),
        args=TrainingArguments(output_dir=str(output), num_train_epochs=3,
            per_device_train_batch_size=1, per_device_eval_batch_size=1,
            gradient_accumulation_steps=16, learning_rate=2e-4, gradient_checkpointing=True,
            bf16=dtype == torch.bfloat16, fp16=dtype == torch.float16, optim='paged_adamw_8bit',
            eval_strategy='epoch', save_strategy='epoch', save_total_limit=2,
            logging_steps=25, report_to='none', seed=42))
    trainer.train()
    trainer.save_model(str(output / 'adapter'))
    tokenizer.save_pretrained(str(output / 'adapter'))
    manifest = {'contract': CONTRACT_VERSION, 'model_id': args.model, 'model_revision': args.revision,
        'training_count': len(train), 'validation_count': len(validation),
        'seen_ids': [r['id'] for r in train + validation],
        'seen_fingerprints': [fingerprint(r['pages']) for r in train + validation],
        'quality_status': 'Training completed; independent held-out evaluation is still required.'}
    (output / 'training-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print('Adapter saved. Do not deploy until held-out evaluation passes.')


if __name__ == '__main__':
    main()
