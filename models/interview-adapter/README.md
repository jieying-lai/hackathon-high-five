# CareerLens interview-question LoRA adapter

This directory contains the actual trained adapter and its tokenizer, ready to be
distributed with the repository. It contains no API keys or candidate CVs.

- Base model: `Qwen/Qwen2.5-1.5B-Instruct` (Apache 2.0).
- Adapter: LoRA, rank 8, q/k/v/o projection layers.
- Source material: the supplied SE and HR interview-question datasets.
- Unique source questions: 174 technical + 40 behavioural; no resume training data.
- Training examples: 364; validation examples: 32, grouped by question wording family.
- Training: approximately 2 epochs on RTX 4000 Ada; validation loss approximately 0.9498.
- Actual metrics are in `training_result.json`; interview quality remains unapproved.
- Training language: English. Other output languages depend on the base model and require review.

The adapter weights are about 8.7 MB. The approximately 3 GB public base model is
not stored in Git. Start.cmd / start.sh automatically downloads and caches it on
each user's computer on first startup. No separate manual model download is needed.

Load this adapter using `scripts/serve_interview_model.py --adapter models/interview-adapter`.
Dataset source licenses were not supplied in the original ZIPs. Keep provenance
and verify source terms before distributing trained derivatives externally.
