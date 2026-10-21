# Browser-only judging deployment

## What judges need

Open https://lunch-cult-later-chairs.trycloudflare.com in a browser.
The seeded demo accounts are listed in README.md. No model or software is installed
on judges' computers.

## Current deployment

- Existing RunPod, using its RTX 4000 Ada GPU.
- Website: Gunicorn, 1 worker / 4 threads, localhost:5050.
- Model: real Qwen2.5-1.5B-Instruct + trained LoRA adapter, localhost:8766.
- Only the website is exposed through the temporary HTTPS tunnel.
- Existing unrelated Pod services were preserved.
- Model health confirmed adapter_loaded=true and device=cuda:0.
- Homepage returned HTTP 200 from the public URL.
- Generated-question quality has not been evaluated as part of this deployment.

## Files to keep in GitHub

- models/interview-adapter/ — trained safetensors adapter, config, tokenizer and metrics.
- scripts/serve_interview_model.py — inference service.
- scripts/start_judges_site.py — model/website process supervisor.
- runpod/requirements-judges.txt — deployment dependencies.
- src/hr_interview_ai.py and src/interview_runtime.py — protected website connector.

Keep .env, private CVs, SQLite databases, logs, virtual environments, server
credentials and the approximately 3 GB base-model weights out of Git.
The adapter/tokenizer directory is approximately 25 MB; each individual file is
below GitHub's ordinary per-file limit.

## Start on an existing Linux GPU server

Install compatible CUDA PyTorch first if the server does not already have it, then:

```bash
python -m pip install -r runpod/requirements-judges.txt
python scripts/start_judges_site.py --port 5050 --https
```

The supervisor downloads/caches the public base model on the server if required.
The --https option assumes a reverse proxy or HTTPS tunnel is serving the website;
it makes login cookies secure. Use the site through HTTPS.

Existing training and website Python environments can be selected separately:

```bash
python scripts/start_judges_site.py \
  --model-python /path/to/training-env/bin/python \
  --web-python /path/to/website-env/bin/python \
  --base-model /path/to/cached/Qwen/snapshot \
  --port 5050 --https
```

For a temporary demonstration, start the already-installed cloudflared in another
server terminal:

```bash
cloudflared tunnel --no-autoupdate --protocol http2 --url http://127.0.0.1:5050
```

Use its printed HTTPS URL. Do not share a Jupyter access-token URL with judges.
For a fixed judging URL, the team can configure its own hostname with a named
Cloudflare Tunnel or another HTTPS reverse proxy.

## Keep it available

The temporary tunnel has no uptime guarantee. Its address stops working if the
Pod or tunnel stops, and the address can change after restart. RunPod billing and
availability remain the responsibility of the Pod owner; no new Pod was created.

Logs for this deployment are under state/judges/ (ignored by Git): supervisor.log,
model.log, website.log and tunnel.log. The current URL is in public-url.txt.
The supervisor terminates the children it started when it exits normally.
Do not stop the Pod's unrelated services when managing the judging deployment.

## Model limitations

214 unique source questions; no resume training data. The 364 training and 32
validation examples include source-question combinations. Dataset source metadata
is unverified. Training was English-only. Generation is genuine model inference,
with no question-bank/template fallback, but relevance, multilingual quality and
variation must be reviewed before interviews.
