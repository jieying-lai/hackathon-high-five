"""GPU LoRA pilot. No API key, CV training data, or paid service is required."""
import argparse
import json
import os
from pathlib import Path


def main(args):
    import torch
    from datasets import load_dataset
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from transformers import (AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig,
                              DataCollatorForSeq2Seq, Trainer, TrainingArguments, set_seed)
    if not torch.cuda.is_available():
        raise SystemExit('CUDA GPU required for this training script. Use a GPU notebook; no training was started.')
    set_seed(42)
    output=Path(args.output); output.mkdir(parents=True,exist_ok=True)
    tokenizer=AutoTokenizer.from_pretrained(args.model)
    tokenizer.pad_token=tokenizer.eos_token
    tokenizer.padding_side='right'
    model=AutoModelForCausalLM.from_pretrained(args.model,device_map={'':0},
        quantization_config=BitsAndBytesConfig(load_in_4bit=True,bnb_4bit_quant_type='nf4',
            bnb_4bit_use_double_quant=True,bnb_4bit_compute_dtype=torch.float16))
    model=prepare_model_for_kbit_training(model)
    model=get_peft_model(model,LoraConfig(r=8,lora_alpha=16,lora_dropout=.05,
        target_modules=['q_proj','k_proj','v_proj','o_proj'],task_type='CAUSAL_LM'))
    model.config.use_cache=False
    dataset=load_dataset('json',data_files={s:str(Path(args.data)/(s+'.jsonl')) for s in ['train','validation']})
    def tokenize(row):
        prefix=tokenizer.apply_chat_template(row['prompt'],tokenize=False,add_generation_prompt=True)
        full=prefix+row['completion']+tokenizer.eos_token
        prefix_ids=tokenizer(prefix,add_special_tokens=False)['input_ids']
        ids=tokenizer(full,add_special_tokens=False)['input_ids']
        if len(ids)>1536:
            raise ValueError('Training example exceeds 1536 tokens; shorten it before training.')
        # Learn the generated questions only, not the user prompt.
        return {'input_ids':ids,'attention_mask':[1]*len(ids),
                'labels':[-100]*len(prefix_ids)+ids[len(prefix_ids):]}
    tokenized=dataset.map(tokenize,remove_columns=dataset['train'].column_names)
    config=TrainingArguments(output_dir=str(output/'checkpoints'),num_train_epochs=args.epochs,
        per_device_train_batch_size=1,per_device_eval_batch_size=1,gradient_accumulation_steps=8,
        learning_rate=1e-4,warmup_ratio=.1,weight_decay=.01,fp16=True,
        logging_steps=5,eval_strategy='epoch',save_strategy='epoch',save_total_limit=2,
        load_best_model_at_end=True,metric_for_best_model='eval_loss',greater_is_better=False,
        gradient_checkpointing=True,optim='adamw_torch',report_to='none',seed=42)
    trainer=Trainer(model=model,args=config,train_dataset=tokenized['train'],
        eval_dataset=tokenized['validation'],processing_class=tokenizer,
        data_collator=DataCollatorForSeq2Seq(tokenizer=tokenizer,padding=True,label_pad_token_id=-100))
    result=trainer.train()
    trainer.save_model(str(output/'adapter'))
    tokenizer.save_pretrained(str(output/'adapter'))
    metrics={'train':result.metrics,'validation':trainer.evaluate(),
             'base_model':args.model,'gpu':torch.cuda.get_device_name(0),
             'cv_training_data':False,'quality_approved':False,
             'note':'Validation loss is not proof of interview quality. Review generated samples before deployment.'}
    (output/'training_result.json').write_text(json.dumps(metrics,indent=2),encoding='utf-8')
    (output/'training_log.json').write_text(json.dumps(trainer.state.log_history,indent=2),encoding='utf-8')
    print(json.dumps(metrics,indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--data',default='data')
    parser.add_argument('--output',default='model-output')
    parser.add_argument('--model',default='Qwen/Qwen2.5-1.5B-Instruct')
    parser.add_argument('--epochs',type=int,default=2)
    main(parser.parse_args())
