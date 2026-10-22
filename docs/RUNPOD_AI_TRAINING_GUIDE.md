# RunPod AI 模型微调与训练保姆级指南 (CareerLens AI)

本项目现已全面打通 **面试题生成与能力验证模型（Interview AI）** 的训练与推理全流程。

---

## 一、目前项目的 AI 架构解析

当求职者在 Talent Portal -> My Profile 点击 **"⚡ Generate / Regenerate 3 Questions"** 时，系统采用 **3-Tier 多级架构** 动态生成题目：

1. **Tier 1 (Gemini 2.5 Flash)**：若配置了 `GEMINI_API_KEY`，根据候选人的实际简历、项目经历及目标岗位，动态生成 3 道实战场景验证题（每次点击均全新生成）。
2. **Tier 2 (本地 LoRA 微调模型)**：通过 `scripts/serve_interview_model.py` 启动本地或 RunPod 训练出的 LoRA 适配器（Adapter）。
3. **Tier 3 (领域场景动态智能题库)**：离线/无网络情况下的智能兜底，按行业（财会金融、软件工程、数据AI、通用综合等）结合真实技能随机抽取变量场景，告别以往千篇一律的固定模板。

---

## 二、训练文件与权重在哪里？

在项目中已包含完整的微调与部署工具：
- **底座模型 (Base Model)**：`Qwen/Qwen2.5-1.5B-Instruct`
- **训练好权重**：[`models/interview-adapter/`](../models/interview-adapter/)
  - `adapter_model.safetensors`（8.7MB 针对面试场景微调的 LoRA 权重）
  - `training_result.json`（在 NVIDIA RTX 4000 Ada 上微调记录）
- **数据清洗脚本**：[`scripts/prepare_interview_training.py`](../scripts/prepare_interview_training.py)
- **微调执行脚本**：[`scripts/finetune_interview_model.py`](../scripts/finetune_interview_model.py)
- **RunPod 自动化脚本**：[`scripts/run_interview_training.sh`](../scripts/run_interview_training.sh)
- **本地/远程服务化脚本**：[`scripts/serve_interview_model.py`](../scripts/serve_interview_model.py)

---

## 三、推荐用于训练的顶尖开源大模型 (2025/2026)

| 开源模型 | 显存需求 (QLoRA 4-bit) | 训练耗时 (RunPod) | 特点与适用场景 |
| :--- | :--- | :--- | :--- |
| **Qwen/Qwen2.5-7B-Instruct** ⭐ **(最推荐)** | 16GB - 24GB (RTX 4090 / A5000) | ~15 - 20 分钟 | 中英双语能力极强，指令遵循高，面试题场景逼真且硬核。每小时只需 ~$0.34。 |
| **Qwen/Qwen2.5-1.5B-Instruct** (轻量版) | 8GB - 12GB (RTX 3090 / 4000) | ~5 - 8 分钟 | 轻量极速，显存占用极小，单卡甚至 CPU 都能轻松跑推理。 |
| **DeepSeek-R1-Distill-Qwen-7B / 8B** ⭐ | 16GB - 24GB (RTX 4090) | ~20 分钟 | 深度推理能力拔尖，生成的技术面试题极具批判性与架构深度。 |
| **meta-llama/Llama-3.3-70B-Instruct** | 48GB - 80GB (A100 / H100) | ~40 分钟 | 行业天花板级别的面试表达，成本稍高（约 $1.5/h）。 |

---

## 四、在 RunPod 上训练模型的实操步骤

### 步骤 1：在 RunPod 租用一台 GPU Pod
1. 登录 [RunPod.io](https://runpod.io) -> **Pods** -> **Deploy**。
2. 选择 GPU：推荐 **RTX 4090 (24GB)** 或 **A5000 (24GB)**（性价比最高，约 $0.34/小时）。
3. 选择 Template：**RunPod PyTorch 2.4 / 2.6**（自带 CUDA 和 Python 3.11）。
4. 容器磁盘空间（Container Disk）建议设为 **30GB**，Volume 设为 **20GB**。
5. 点击 **Deploy On-Demand**，等待 30 秒 Pod 变为 Running 状态。

### 步骤 2：连接终端并拉取代码
点击 Pod 上的 **Connect** -> **Connect to Web Terminal** 或使用 SSH：

```bash
# 1. 进入工作目录
cd /workspace

# 2. 克隆仓库
git clone https://github.com/jieying-lai/hackathon-high-five.git careerlens-ai
cd careerlens-ai

# 3. 运行微调训练脚本
chmod +x scripts/run_interview_training.sh
./scripts/run_interview_training.sh
```

如果想训练更高级的 `Qwen/Qwen2.5-7B-Instruct`，只需在运行时指定模型参数：
```bash
python -u scripts/finetune_interview_model.py \
    --model "Qwen/Qwen2.5-7B-Instruct" \
    --data data \
    --output model-output-7b \
    --epochs 2
```

### 步骤 3：下载训练好的 Adapter 权重
训练完成后，脚本会自动将权重打包为 `trained-interview-adapter.zip`。
1. 在 RunPod 网页端左侧的 JupyterLab 文件浏览器中，右键点击 `trained-interview-adapter.zip` -> **Download**。
2. 将解压出来的文件放入本地项目的 `models/interview-adapter/` 目录替换即可！

---

## 五、在本地或远程启动微调模型推理

想要让本地网站直接调用微调好的 Adapter，在终端中运行：
```bash
py scripts/serve_interview_model.py
```
服务将在 `http://127.0.0.1:8766` 启动，网站后台的 `/api/questionnaire/generate-3-verification-questions` 会自动优先调用该微调模型！
