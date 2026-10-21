# CV model: what works now and what still needs a GPU run

The app first reads selectable text from a PDF locally. With the owner's explicit consent, **Organise my CV with AI** sends that text to a dedicated RunPod worker running **Qwen/Qwen2.5-7B-Instruct**, an instruction-tuned pretrained model. The model selects and groups source excerpts into a professional summary, experience, education, projects and certifications. The app checks every returned value against the cited PDF page before saving an unreviewed draft. Skills proposed by the model require manual addition before they affect matching.

This is a real model implementation, replacing the old echo handler. **Code and mocked integration tests are not evidence that GPU inference, Docker building, CV-specific fine-tuning or model-quality evaluation has run.** This repository makes no claim that a custom CV model is already trained or production mature. Local extraction remains available when RunPod is not connected.

## Pod, GitHub and endpoint in plain language

- **GitHub repository:** stores your app and model code. Connecting it does not itself train or start a model.
- **GPU Pod:** a rented computer with a GPU. Useful for training, evaluation and experimenting.
- **Serverless endpoint:** the private address your website calls to run inference. Its workers are created from a Docker image. The app needs the endpoint ID and a RunPod API key, stored only on the server.

If the RunPod screen says **Pods**, you have a computer, not yet the Serverless endpoint used by this integration. Keep model training on a Pod and serve the evaluated model through Serverless. Avoid leaving unused Pods running. These steps require paid GPU resources; decide your budget before starting workers or training.

## Deploy the pretrained baseline first

1. Review `runpod/Dockerfile.cv`. From the repository root, build and push a private container image to your chosen registry:

   ```sh
   docker build --platform linux/amd64 -f runpod/Dockerfile.cv -t YOUR_REGISTRY/careerlens-cv:baseline .
   docker push YOUR_REGISTRY/careerlens-cv:baseline
   ```

2. In RunPod **Serverless**, create a queue-based endpoint from this image. Start with zero active workers and at most one worker. A CUDA-compatible GPU with 24 GB VRAM is a starting configuration to measure, not a verified memory requirement; the worker uses 4-bit weights and bounded context. Check available disk space for model downloads. Optional persistent storage at `/runpod-volume` avoids repeated model downloads; without it the cache is ephemeral. Set:

   ```text
   CV_MODEL_ID=Qwen/Qwen2.5-7B-Instruct
   CV_MODEL_REVISION=<immutable model commit SHA copied from the model repository>
   ```

   The worker defaults to the model's `main` revision for initial setup only. Pin the actual revision before evaluation and release. Do not enable request/prompt logging. Provider infrastructure may retain job inputs and outputs; review account settings and current retention policies before any real-data deployment.

3. Send a **fictional** test request in the RunPod endpoint console using the contract shown below. A successful result includes `contract`, `draft`, `model_id` and `model_revision`; an echo response is the wrong worker. First startup downloads and loads the model and may exceed the app's wait budget. Check readiness with a fictional request before connecting the website.

   ```json
   {"input":{"task":"cv-evidence-v1","pages":["Mira Example\nGraduate analyst\nBuilt a SQL dashboard for a fictional classroom project.\nSkills: SQL"]}}
   ```

4. Copy the endpoint ID from Serverless. Set these in your local `.env` or server secrets, never in Git or chat:

   ```text
   CV_AI_PROVIDER=runpod
   CV_RUNPOD_ENDPOINT_ID=<your dedicated CV endpoint ID>
   RUNPOD_API_KEY=<your private API key>
   CV_MODEL_ID=Qwen/Qwen2.5-7B-Instruct
   ```

   `RUNPOD_ENDPOINT_ID` from the old scaffold is deliberately not reused: it may point to another task such as interviews. This CV worker does not implement that interview service.

5. Refresh the Account & Profile page, upload a fictional text PDF, select the RunPod consent box and press **Organise my CV with AI**. Review all changes and save. Existing grants and applications are revoked when a new AI draft is saved. The PDF remains intact. A timeout, invalid output, wrong worker, or concurrent owner edit leaves the saved draft intact.

## Train a CV adapter only after measuring the baseline

Qwen is already pretrained and instruction-tuned. CV-specific training should address measured extraction errors; it is not needed merely to call the model. QLoRA adapts a small set of weights rather than training a language model from scratch.

Create independently reviewed synthetic JSONL annotations with `id`, `synthetic: true`, `provenance`, `pages` and `expected`. `expected` follows `src/cv_model_contract.py`. The six examples in `tests/fixtures/cv_model_smoke.jsonl` demonstrate the format only. They are far too small for training or claims of accuracy.

Curate at least 200 training and 50 validation CVs, plus a separate test set of at least 50 CVs. These are starter gates, not proof of maturity. Include missing fields, zero experience, overlapping roles, varied headings, multi-column PDFs, long entries, page breaks, English/Malay/Chinese, reference contacts, negated skills, learning goals and embedded malicious instructions. Split by fictional person and template family; changing a name is not an independent test example. Annotators must label what the PDF actually says, not what they think a good CV should say. Use public/open/synthetic data in accordance with the hackathon brief; never export the vault database into training.

On your authorised GPU Pod, clone this repository, install its CV worker requirements (and compatible PyTorch), then run:

```sh
python scripts/train_cv_adapter.py --train training-data/private/train.jsonl --validation training-data/private/validation.jsonl --revision MODEL_COMMIT_SHA --output model-artifacts/cv-run-01
```

The script rejects overlapping splits and undersized datasets, trains on assistant answers only, and saves an adapter plus a manifest. Model weights and private annotation files are Git-ignored. Do not publish them inadvertently. A completed training run does **not** imply successful evaluation.

## Evaluate before calling the system mature

First run the pretrained baseline on the independent test set:

```sh
python scripts/evaluate_cv_model.py --dataset training-data/private/test.jsonl --generate --predictions model-artifacts/baseline-predictions.jsonl --report model-artifacts/baseline-report.json
```

Then set `CV_ADAPTER_PATH=model-artifacts/cv-run-01/adapter` and a descriptive `CV_ADAPTER_VERSION`; run the same evaluation with `--training-manifest model-artifacts/cv-run-01/training-manifest.json` and new output filenames. Use the same pinned base model revision. The scorer checks exact annotated facts, schema/evidence validity, and missing outputs. It rejects reused training/validation CVs when supplied the manifest.

The proposed automated gate is 100% valid source-backed outputs, at least 98% exact annotation precision and 90% recall on at least 50 unseen CVs. This is a **target**, not a measured result. Exact matching can penalise valid alternative grouping, so humans must review disagreements and report results by language and layout. Add tests on actual rendered PDFs: text-only fixtures cannot prove PDF reading quality. Measure latency, cold starts, failures, VRAM and cost, and compare base versus adapter. Do not release an adapter that regresses contact attribution, omissions or negation handling even if the overall score improves. Only a reviewed evaluation report plus successful live smoke tests can justify a release decision; the scoring script never automatically marks a release approved.

## Current limits and privacy

- No OCR yet: scanned/image-only PDFs need OCR before upload. Password-protected, malformed or oversized PDFs are rejected. Model input is limited to 20 pages/24,000 characters and 10,000 input tokens; output is limited to 4,096 tokens. Oversized or truncated output fails validation rather than silently dropping data.
- Summaries select and organise excerpts. They do not creatively rewrite achievements or invent jobs, qualifications, proficiency, personality or hiring scores. Matching a quote proves its presence in the PDF, not the truth of the statement or correct classification; owner review remains mandatory.
- Local parsing never sends text externally. The optional AI request sends extracted page text, including contact details if present, to your configured RunPod endpoint. It does not send account passwords, the entire database, employer records or other users' CVs. The worker performs inference, not online training. It does not intentionally log CV text, but provider infrastructure retention is outside the app's guarantees.
- The web app allows one in-flight CV model request per process; use one web worker for the prototype or add a shared queue/rate limiter before scaling. Submission is not automatically retried. Jobs are time bounded and unfinished known jobs receive a best-effort cancellation; a network failure before an ID is returned cannot guarantee cancellation.
- This does not provide encrypted storage, verified organisations or production privacy certification. See `docs/PRIVATE_VAULT.md` for the remaining deployment requirements.

Primary references: [Qwen model card](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct), [RunPod requests and retention](https://docs.runpod.io/serverless/endpoints/send-requests), [RunPod worker setup](https://docs.runpod.io/serverless/workers/overview), [Hugging Face quantized adapter training](https://huggingface.co/docs/peft/en/developer_guides/quantization).
