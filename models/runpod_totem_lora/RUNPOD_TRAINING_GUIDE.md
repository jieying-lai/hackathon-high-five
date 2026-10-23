# 🚀 CareerLens-Totem-Agent: RunPod LoRA Fine-Tuning Guide

This guide walks you through fine-tuning **Qwen2.5-7B-Instruct** on RunPod using **Unsloth** with our extracted **O*NET 30.3 & Big Five** dataset.

---

## 💰 Cost & Hardware
* **Recommended GPU**: 1x RTX 4090 (24GB VRAM) or 1x A100 (40GB)
* **Estimated Cost**: **~$0.34/hr** on Community Cloud (Total cost: **<$0.50**)
* **Estimated Time**: **~30 to 45 minutes**

---

## 🛠️ Step-by-Step Instructions

### Step 1: Deploy a Pod on RunPod
1. Log in to [RunPod.io](https://runpod.io) and go to **Pods** -> **+ Deploy**.
2. Select **RTX 4090** (or A100).
3. Under Template, choose **`RunPod PyTorch 2.4`** (or `Unsloth Official Template`).
4. Set disk size to **30 GB**.
5. Click **Deploy**.

---

### Step 2: Open Web Terminal
Once the Pod is running:
1. Click **Connect** -> **Start Web Terminal** (or connect via SSH).
2. Install the necessary ultra-fast dependencies:
   ```bash
   pip install unsloth trl datasets transformers accelerate
   ```

---

### Step 3: Run Fine-Tuning
1. Clone your branch or copy the files:
   ```bash
   git clone -b jie-ying https://github.com/jieying-lai/hackathon-high-five.git
   cd hackathon-high-five/models/runpod_totem_lora
   ```
2. Start training:
   ```bash
   python train_unsloth_lora.py
   ```

---

### Step 4: Download Weights
When training finishes, your fine-tuned adapter weights will be saved in:
`models/runpod_totem_lora/careerlens_totem_lora_weights/`

You can download this folder directly via RunPod's file manager or push it to Hugging Face!
