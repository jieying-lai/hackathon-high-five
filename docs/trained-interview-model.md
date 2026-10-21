# Trained interview model

Use the repository-root Start.cmd (Windows) or `bash start.sh` (macOS/Linux).
See LOCAL_START.zh-CN.md for the complete first-run and troubleshooting instructions.

- Base: Qwen/Qwen2.5-1.5B-Instruct, pinned revision 989aa7980e4cf806f80c7fef2b1adb7bc71aa306.
- Trained LoRA + tokenizer: models/interview-adapter (included in Git).
- Base weights: automatically downloaded to state/interview-model/base-model (excluded from Git).
- Private Python/dependencies: .runtime/ (excluded from Git).
- Local site/model: supervised together; loopback only; automatically selected free ports.
- Interview questions use the LoRA. Optional local CV organisation disables that adapter and uses the pretrained base with source validation.

Training used English interview-question data, not resumes. About two epochs;
validation loss ~0.9498. This is not evidence of HR approval, multilingual quality,
or deployment quality. Review generated questions before interviews.

No cloud keys or paid GPU are needed for the portable launcher. CPU latency depends
on hardware. The optional hosted supervisor remains available separately in
scripts/start_judges_site.py for teams deliberately deploying to a server.
