# CareerLens AI

## Share the website with friends — no visitor setup

Deploy the website once and share its HTTPS URL. Visitors only need a browser;
they do not download this repository, run Start.cmd, install Python or load a model.
The HR **Auto generate** button now defaults to a lightweight CV-based question
builder (`HR_INTERVIEW_PROVIDER=rules`). It builds four interview prompts from the
authorised candidate skills/projects and vacancy requirements, supports English,
Bahasa Malaysia and Chinese, and avoids the previous batch when regenerating.
This is rules-based generation, not inference from the trained LoRA model. No API
key, GPU, Torch or multi-GB model is required for this feature. HR reviews the
questions before use; they do not score or decide candidate suitability.

The existing Replit run/deployment commands now install `requirements-web.txt`
and run `scripts/serve_web.py` with the lightweight provider. **Republish the
updated project** to update an already published site. This repository edit does
not publish a live site automatically. For other hosts and persistent data see
[shared website deployment](docs/SHARED_WEBSITE.zh-CN.md).

## Optional local preview for the maintainer

On Windows double-click `Start.cmd`; on macOS/Linux run `bash start.sh`.
The default launcher installs only website dependencies and opens the browser.
It does not download the Qwen base model or start model inference. Existing local
accounts in `state/local/careerlens.db` are preserved. First-time preview still
needs internet to install Python and website packages; ordinary website visitors
do not run this launcher.

| Portal | Demo email | Demo password |
| --- | --- | --- |
| Talent | aisha.demo@careerlens.my | CareerLens@2026 |
| HR | hr.demo@nexussme.my | CareerLens@2026 |

Optional advanced mode: set `CAREERLENS_LOCAL_MODEL=1` before launching to install
and run the original trained local model. That opt-in mode still requires the
large model download and substantial RAM. `HR_INTERVIEW_PROVIDER=local` explicitly
selects that model on a provisioned server; `gemini` selects the existing cloud
connector. The default never sends CV content to a cloud AI provider. Optional
CV AI organisation is a separate feature with its own provider requirements.

## Member 3 frontend update (2026-10-20)

The app uses Flask, Jinja HTML, vanilla JavaScript, Tailwind CDN, and SQLite.
Run on Windows with `.\.venv\Scripts\python.exe src/main.py`, then open
`http://127.0.0.1:5000`. No frontend build is required.

The existing profile/chips, explainable role cards, ordered pathways, and HR heatmap
now include a two-position What-If slider, an SVG benchmark radar, core EN/BM/Chinese
UI localization, analysis error states, and qualified fairness disclosures.
Trend percentages are illustrative benchmarks, and RunPod is not wired into the
current Flask matching flow. Full content translation and browser visual acceptance
remain pending. Eleven Python tests passed; UI screenshots have not yet been captured.

- [中文运行、功能边界与验收说明](docs/MEMBER3_GUIDE.zh-CN.md)
- [Pitch video 现场演示流程](docs/PITCH_DEMO.zh-CN.md)
- [System architecture](docs/system-architecture.svg)
- [High-resolution architecture PNG](docs/system-architecture.png)
- UI screenshot/check script: `scripts/capture-ui.cjs` (requires Playwright + Microsoft Edge)

The remaining sections below retain the original hackathon submission template;
example links and placeholder stack descriptions are not deployment evidence.

<p align="center">
  <img src="src/static/brand/careerlens_logo_horizontal.svg" alt="CareerLens AI × Team High Five Logo" width="560" />
</p>

> An AI-powered workforce future-readiness platform that tracks live AI & job-market signals, matches talent to emerging roles with explainable scores and skills-gap breakdowns, and generates verified reskilling pathways mapped to the UN Sustainable Development Goals (SDGs).

---

## Team Information

| Field                  | Details                                     |
| ---------------------- | ------------------------------------------- |
| **Team Name**          | High Five                                   |
| **Team Domain**        | Domain 1 — The Aiversecity Future-Ready Workforce Domain |
| **SDG Track (1–17)**   | SDG 8 (Decent Work & Economic Growth) & SDG 4 (Quality Education) |
| **Team Leader**        | Leader Name                                 |
| **University**         | University Name(s)                          |
| **Number of Members**  | 4                                           |

## Links

| Resource          | Link                                           |
| ----------------- | ---------------------------------------------- |
| GitHub Repository | https://github.com/jieying-lai/hackathon-high-five |
| Replit Project    | https://replit.com/@your-username/hackathon-high-five |
| Live Demo         | https://hackathon-high-five.replit.app         |
| RunPod Endpoint   | https://api.runpod.ai/v2/your-endpoint-id      |
| Slide Deck        | https://example.com/slides                     |
| Demo Video        | https://example.com/demo-video                 |

---

## Overview

### Problem

Describe the real-world problem you are solving in 2–4 sentences. Who is affected, and why does it matter?

### Solution

Explain how your project uses AI to solve the problem and what makes it valuable.

### Key Features

- **Feature 1** — Short description.
- **Feature 2** — Short description.
- **Feature 3** — Short description.

### Tech Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Frontend      | e.g. HTML, React             |
| Backend       | e.g. Python, Flask / FastAPI |
| Database      | e.g. PostgreSQL, SQLite      |
| AI / Compute  | RunPod (GPU)                 |
| Hosting / Dev | Replit                       |

---

## Project Structure

```
.
├── docs/                    # Screenshots, diagrams
├── runpod/
│   └── handler.py           # RunPod serverless handler (GPU workload)
├── src/
│   ├── main.py              # Application entry point
│   └── utils.py             # Helper functions
├── submission/              # Required submission documents
│   ├── REPLIT PROOF OF USE.pdf
│   ├── RUNPOD PROOF OF USE.pdf
│   └── Submission Template SDC Hackathon.pdf
├── tests/
│   └── test_utils.py        # Unit tests
├── .env.example             # Example environment variables
├── .gitignore
├── .replit                  # Replit run configuration
├── LICENSE
├── requirements.txt         # Python dependencies
└── README.md
```

### Architecture

```
User ──► Replit (App / API) ──► RunPod Endpoint (GPU model)
                │
                └──► Response returned to user
```

---

## How to Run

### Option 1 — Run on Replit (Recommended)

1. Open the [Replit Project](https://replit.com/@your-username/your-project), or import this repository via **Create Repl → Import from GitHub**.
2. Open the **Secrets** tab (🔒) and add the variables listed in `.env.example`:
   - `RUNPOD_API_KEY`
   - `RUNPOD_ENDPOINT_ID`
3. Click **Run**. Replit uses the `.replit` file to start `python src/main.py`.

### Option 2 — Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/your-username/your-project.git
cd your-project

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env            # then fill in your values

# 5. Run the app
python src/main.py
```

### Run Tests

```bash
python -m unittest discover tests
```

---

## How We Use Replit *(Required)*

Describe how your team used Replit. For example:

- **Development:** Collaborative coding in a shared Repl using Multiplayer.
- **Hosting:** The app is deployed with Replit Deployments at the Live Demo link above.
- **Secrets:** API keys are stored in Replit Secrets, never in the code.

📄 Proof of use: [`submission/REPLIT PROOF OF USE.pdf`](submission/REPLIT%20PROOF%20OF%20USE.pdf)

## How We Use RunPod *(Required)*

Describe how your team used RunPod. For example:

- **Workload:** Model inference (e.g. text generation, image processing) runs on a RunPod GPU.
- **Setup:** `runpod/handler.py` is deployed as a **RunPod Serverless Endpoint**.
- **Integration:** The Replit app sends requests to the endpoint using `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID`.

Example request:

```bash
curl -X POST https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/runsync \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "Hello"}}'
```

📄 Proof of use: [`submission/RUNPOD PROOF OF USE.pdf`](submission/RUNPOD%20PROOF%20OF%20USE.pdf)

---

## Challenges & Learnings

- What challenges did you face, and how did you overcome them?
- What did your team learn?

## Future Improvements

- [ ] Improvement 1
- [ ] Improvement 2

## Team

| Name        | Role                | GitHub                                   |
| ----------- | ------------------- | ---------------------------------------- |
| Member Name | Team Lead / Backend | [@username](https://github.com/username) |
| Member Name | Frontend            | [@username](https://github.com/username) |
| Member Name | AI / RunPod         | [@username](https://github.com/username) |

---

## Submission Checklist

- [ ] Team name, domain (Domain 1 / Domain 2) and SDG track filled in
- [ ] Slide deck link added
- [ ] Demo video link added
- [ ] Replit used, with proof of use in `submission/`
- [ ] RunPod used, with proof of use in `submission/`
- [ ] Submission template completed in `submission/`
- [ ] "How to Run" steps verified
- [ ] No API keys or secrets committed to the repository

## License

This project is licensed under the [Apache License 2.0](LICENSE).


### CV questionnaire: ready after cloning

The questionnaire works without an API key or model download. Install `requirements.txt`, start `python src/main.py`, use the Talent demo login and upload one of the supplied sample PDF CVs. Both role suggestions and the second-step CV questions run on the server locally. Answers remain saved per user in the browser.

The default `QUESTIONNAIRE_PROVIDER=local` matches CV evidence against the role competency catalog and builds four questions from the CV, skill gaps, chosen role and basic answers. The UI labels this as rules-based local CV analysis, not generative AI. Suggestions explain matched skills and skills to confirm; they are not hiring decisions or proof of professional eligibility.

To enable optional Gemini AI, set `QUESTIONNAIRE_PROVIDER=gemini` and `GEMINI_API_KEY` in the server environment or project-root `.env`. `QUESTIONNAIRE_GEMINI_MODEL` defaults to `gemini-2.5-flash`. The questionnaire rereads `.env` on every request; environment variables take precedence. The key stays on the server. Run `.venv/Scripts/python.exe scripts/check_questionnaire_ai.py` to test the optional live Gemini integration with a synthetic CV.

The location catalog covers all 13 Malaysian states and 3 federal territories, with a curated selection of districts / areas and an Other area field.
