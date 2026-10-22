# RunPod GPU Training & AI Dataset Acquisition Guide
**CareerLens AI · SDC Hackathon 2026**

---

## 1. High-Value AI Dataset Keywords for HuggingFace & Kaggle

If you need more datasets to further train or benchmark CareerLens AI, search on [Hugging Face Datasets](https://huggingface.co/datasets) or [Kaggle](https://www.kaggle.com/datasets) using these exact keywords:

| Capability Domain | Recommended Search Keywords | Target Format / Notes |
| :--- | :--- | :--- |
| **CV / Resume Parsing & NER** | `resume-entities-ner`, `resume-dataset`, `resume-corpus`, `cv-parsing` | Contains annotated entities for `Skills`, `Degrees`, `Universities`, `Years of Experience`. |
| **Candidate-Job Matching** | `resume-job-matching`, `job-recommendation`, `applicant-scoring` | Paired candidate profiles with vacancy requirements & fit labels. |
| **Malaysian & SEA Job Market** | `malaysia-job-postings`, `jobstreet-dataset`, `sea-tech-salaries` | Localized Malaysian ringgit salary bands, state locations, and industry classifications. |
| **Content Safety & Moderation** | `toxic-comment-classification`, `guardrails-safety`, `openai/moderation-eval`, `illegal-content-detection` | Used by our Content Guard to auto-flag fraudulent, scam, or abusive submissions. |
| **Career Advising & Interview QA** | `career-counseling-qa`, `mock-interview-dialogues`, `qwen2.5-career-instruct` | Conversation turns for training Lumi Chat and verification question adapters. |

---

## 2. Recommended RunPod GPU Hardware Specifications

For fine-tuning and running inference on Qwen2.5-7B or Llama-3.1-8B:
- **Recommended Cloud GPU**: NVIDIA RTX 4000 Ada (20GB VRAM) or RTX A4000 (16GB VRAM)
- **Cost**: ~$0.20 – $0.32 / hour on RunPod Community Cloud
- **Template**: PyTorch 2.4+ / CUDA 12.1+ or Unsloth official template (`unsloth/unsloth-jupyter`)

---

## 3. Step-by-Step RunPod Training Workflow

### Step 1: Clone Repository & Setup Environment
```bash
git clone https://github.com/jieying-lai/hackathon-high-five.git careerlens-ai
cd careerlens-ai

# Install high-speed QLoRA dependencies
pip install --upgrade pip
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install -r scripts/training-requirements.txt
```

### Step 2: Prepare Training Data
The repository includes automated dataset preparation scripts in `data/`:
- `data/train.jsonl` (2,400+ career counseling pairs)
- `data/validation.jsonl`
- `scripts/generate_lumi_instruct_data.py`

### Step 3: Launch Training with Unsloth QLoRA
```bash
python scripts/train_lumi_chat_ai.py \
    --model_name "Qwen/Qwen2.5-7B-Instruct" \
    --max_seq_length 2048 \
    --load_in_4bit True \
    --r 16 \
    --lora_alpha 32 \
    --epochs 3 \
    --learning_rate 2e-4 \
    --output_dir "./models/lumi_qlora_adapter"
```

### Step 4: Run Inference Server on RunPod
```bash
python scripts/serve_lumi_chat_ai.py --port 8001
```

### Step 5: Connect CareerLens AI to RunPod
In your local `.env` file or environment variables:
```env
RUNPOD_AI_URL=https://<your-pod-id>-8001.proxy.runpod.net
CAREERLENS_CV_MODEL=qwen2.5
```
CareerLens AI will automatically route chat and deep resume processing to your live RunPod GPU!

---

## 4. Current Platform Data Summary

- **Curated Benchmark CVs**: 79 validated multi-domain candidate profiles (Workday, SQL, React, Peoplesoft, QA, Finance).
- **Job Postings Index**: 69,345 pre-indexed Malaysian postings from JobStreet.
- **Fair-AI & PDPA Compliance**: 100% clean safety audit score with automated illegal wording detection and encrypted PII masking.
