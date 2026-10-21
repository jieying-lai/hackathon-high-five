"""CareerLens AI - RunPod GPU Fine-Tuning Pipeline.

Fine-tunes Qwen 2.5 7B Instruct using QLoRA (4-bit) for zero-hallucination
structured resume entity extraction, skill mapping, and STAR impact quantification.
Optimized for NVIDIA RTX 4000 Ada (20GB VRAM) on RunPod.
"""

import json
import os
import sys
import torch
from datasets import Dataset

# 1. Check GPU environment
if not torch.cuda.is_available():
    print("⚠️ Warning: CUDA GPU not detected. Make sure you are running on RunPod with GPU enabled.")
else:
    gpu_name = torch.cuda.get_device_name(0)
    vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    print(f"🔥 Detected GPU: {gpu_name} ({vram_gb:.1f} GB VRAM)")

# 2. Training Data - Ground Truth Resume Extraction Pairs
# Includes real Malaysian tech/business roles, certifications, and SDG-aligned competencies
TRAINING_SAMPLES = [
    {
        "cv": (
            "Jason Lim\n"
            "Email: jason.lim@example.com | Phone: +60 16-509 7732 | Location: Penang, Malaysia\n"
            "Senior Digital Copywriter with 4 years of agency experience.\n"
            "Work Experience:\n"
            "- Senior Digital Copywriter at Lumina Creative Lab (2024 - Present): Directed SEO content strategy and GA4 campaign reporting for 12 regional brands, increasing organic search leads by 45%.\n"
            "- Content Writer at PulseMedia Digital (2022 - 2024): Produced bilingual English/Mandarin social media campaigns and brand storytelling assets.\n"
            "Education: Bachelor of Communication (Hons), Taylor's University (2018 - 2021)\n"
            "Skills: SEO Content Strategy, Google Analytics GA4, Bilingual Copywriting (English/Mandarin), Creative Direction, Social Media Marketing, Prompt Engineering."
        ),
        "target": {
            "full_name": "Jason Lim",
            "current_role": "Senior Digital Copywriter",
            "years_experience": 4,
            "location": "Penang, Malaysia",
            "industry": "Marketing & PR",
            "education": ["Bachelor of Communication (Hons) | Taylor's University (2018 - 2021)"],
            "skills": ["SEO Content Strategy", "Google Analytics GA4", "Bilingual Copywriting", "Creative Direction", "Social Media Marketing", "Prompt Engineering"],
            "measurable_impact": [
                "Directed SEO content strategy and GA4 campaign reporting for 12 regional brands",
                "Increased organic search leads by 45%",
                "Produced bilingual English/Mandarin social media campaigns"
            ],
            "inferred_job_zone": 4
        }
    },
    {
        "cv": (
            "Nur Aisyah binti Razak\n"
            "Email: aisyah.razak@example.my | Location: Kuala Lumpur, Malaysia\n"
            "Junior Financial Auditor with 2 years of audit and compliance experience.\n"
            "Experience:\n"
            "- Audit Associate at PwC Malaysia (2024 - Present): Conducted statutory financial audits for 14 SME and commercial clients across retail and manufacturing. Verified balance sheet reconciliations and tested internal controls.\n"
            "- Accounting Intern at BDO Malaysia (2023 - 2024): Assisted senior auditors in drafting management letters and IFRS audit workpapers.\n"
            "Education: Bachelor of Accounting (Hons), Universiti Malaya (2020 - 2024)\n"
            "Skills: Financial Auditing, IFRS Standards, MFRS Compliance, Internal Controls, Advanced Excel, Statutory Reporting, SAP ERP."
        ),
        "target": {
            "full_name": "Nur Aisyah binti Razak",
            "current_role": "Junior Financial Auditor",
            "years_experience": 2,
            "location": "Kuala Lumpur, Malaysia",
            "industry": "Accounting & Finance",
            "education": ["Bachelor of Accounting (Hons) | Universiti Malaya (2020 - 2024)"],
            "skills": ["Financial Auditing", "IFRS Standards", "MFRS Compliance", "Internal Controls", "Advanced Excel", "Statutory Reporting", "SAP ERP"],
            "measurable_impact": [
                "Conducted statutory financial audits for 14 SME and commercial clients",
                "Verified balance sheet reconciliations and tested internal controls",
                "Drafted management letters and IFRS audit workpapers"
            ],
            "inferred_job_zone": 4
        }
    },
    {
        "cv": (
            "Kevin Tan Wei Lun\n"
            "Location: Petaling Jaya, Selangor | Email: kevin.tan@dev.my\n"
            "Full Stack Software Engineer with 3+ years building cloud-native web applications.\n"
            "Professional Experience:\n"
            "- Software Engineer at Grab Malaysia (2023 - Present): Engineered microservices in Golang and Python FastAPI, handling 150,000+ daily orders. Automated CI/CD pipelines via GitHub Actions and Docker on AWS EKS.\n"
            "- Junior Frontend Developer at Carsome (2022 - 2023): Built customer quotation portals using React, TypeScript, and Tailwind CSS. Reduced page load times by 35%.\n"
            "Education: Bachelor of Computer Science, Universiti Teknologi Malaysia (UTM, 2018 - 2022)\n"
            "Core Technologies: Python, Golang, React, TypeScript, PostgreSQL, Docker, Kubernetes, AWS, REST APIs, Git."
        ),
        "target": {
            "full_name": "Kevin Tan Wei Lun",
            "current_role": "Full Stack Software Engineer",
            "years_experience": 3,
            "location": "Petaling Jaya, Selangor",
            "industry": "Information Technology",
            "education": ["Bachelor of Computer Science | Universiti Teknologi Malaysia (UTM, 2018 - 2022)"],
            "skills": ["Python", "Golang", "React", "TypeScript", "PostgreSQL", "Docker", "Kubernetes", "AWS", "REST APIs", "Git", "FastAPI"],
            "measurable_impact": [
                "Engineered microservices in Golang and Python handling 150,000+ daily orders",
                "Automated CI/CD pipelines via GitHub Actions and Docker on AWS EKS",
                "Reduced customer portal page load times by 35%"
            ],
            "inferred_job_zone": 4
        }
    },
    {
        "cv": (
            "Siti Sarah Amin\n"
            "Location: Cyberjaya, Malaysia | Email: sarah.amin@data.ai\n"
            "Data Analyst with 2 years analyzing consumer trends and operational metrics.\n"
            "Experience:\n"
            "- Data Analyst at Shopee Malaysia (2024 - Present): Designed automated Power BI and Tableau dashboards tracking RM 2.4M monthly campaign ROI. Wrote complex SQL queries optimizing query performance by 40%.\n"
            "- Business Intelligence Intern at AirAsia (2023): Analyzed route occupancy and fuel efficiency data using Python Pandas and Scikit-learn.\n"
            "Education: Bachelor of Science in Data Analytics, Asia Pacific University (APU, 2020 - 2023)\n"
            "Skills: SQL, Python, Power BI, Tableau, Pandas, Data Modeling, Exploratory Data Analysis, Predictive Analytics, Excel."
        ),
        "target": {
            "full_name": "Siti Sarah Amin",
            "current_role": "Data Analyst",
            "years_experience": 2,
            "location": "Cyberjaya, Malaysia",
            "industry": "Data & Analytics",
            "education": ["Bachelor of Science in Data Analytics | Asia Pacific University (APU, 2020 - 2023)"],
            "skills": ["SQL", "Python", "Power BI", "Tableau", "Pandas", "Data Modeling", "Exploratory Data Analysis", "Predictive Analytics", "Excel"],
            "measurable_impact": [
                "Designed automated Power BI dashboards tracking RM 2.4M monthly campaign ROI",
                "Optimized SQL query performance by 40%",
                "Analyzed flight route occupancy and fuel efficiency data"
            ],
            "inferred_job_zone": 4
        }
    }
]

SYSTEM_PROMPT = """You are CareerLens AI Resume Extraction Engine.
Extract the resume into a strict, validated JSON object with keys:
full_name (str), current_role (str), years_experience (int), location (str), industry (str),
education (list of str), skills (list of str), measurable_impact (list of str), inferred_job_zone (int 1-5).
Do not output conversational markdown outside the JSON."""


def main():
    print("=" * 60)
    print("🚀 CareerLens AI - Fine-tuning Resume Extraction Model")
    print("=" * 60)

    try:
        from unsloth import FastLanguageModel
        from trl import SFTTrainer
        from transformers import TrainingArguments

        print("📦 Using Unsloth FastLanguageModel (Optimized QLoRA)...")
        max_seq_length = 2048
        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name="Qwen/Qwen2.5-7B-Instruct",
            max_seq_length=max_seq_length,
            dtype=None,
            load_in_4bit=True,
        )

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

        def format_chat(sample):
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Parse this resume:\n{sample['cv']}"},
                {"role": "assistant", "content": json.dumps(sample['target'], indent=2)},
            ]
            return {"text": tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)}

        dataset = Dataset.from_list(TRAINING_SAMPLES).map(format_chat)

        output_dir = "models/careerlens_cv_lora"
        os.makedirs(output_dir, exist_ok=True)

        trainer = SFTTrainer(
            model=model,
            tokenizer=tokenizer,
            train_dataset=dataset,
            dataset_text_field="text",
            max_seq_length=max_seq_length,
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
                output_dir=output_dir,
                seed=42,
            ),
        )

        print("🔥 Starting training epochs...")
        trainer.train()

        print(f"💾 Saving trained LoRA weights to {output_dir}...")
        model.save_pretrained(output_dir)
        tokenizer.save_pretrained(output_dir)
        print("✅ Fine-tuning completed successfully!")

    except ImportError:
        print("\n⚠️ Unsloth not installed yet. To install Unsloth on RunPod, run:")
        print("pip install --no-deps 'xformers<0.0.28' 'trl<0.9.0' peft accelerate bitsandbytes")
        print("pip install 'unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git'")
        print("pip install datasets\n")
        print("Running sample validation check instead:")
        print(f"Loaded {len(TRAINING_SAMPLES)} annotated resume pairs ready for training.")


if __name__ == "__main__":
    main()
