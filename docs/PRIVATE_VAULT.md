# Function 01 — Private Vault: PDF CV intake and reviewed career profile

CareerLens turns a CV into a structured profile that the person can check, correct, use for career exploration and selectively share. Privacy belongs to the whole journey: upload, extraction, review, recommendation, recipient access, replacement and deletion.

## What is implemented

1. **Safe, useful intake.** Text-based PDF only; maximum 8 MB, 20 pages and 100,000 extracted characters. Clear errors for empty, malformed, encrypted and scanned PDFs. Bounded decoded page streams, with a production parsing-isolation caveat below. Three synthetic sample PDFs allow an immediate demonstration. Custom uploads require a synthetic-data declaration.
2. **An honest structured draft.** Name, contact details, headline, location, explicitly supported industry/work preference, qualifications, experience, education, projects, certifications and skills. Missing facts stay empty. Zero years stays zero. Dates and study durations are not silently converted into work experience. Clear learning goals and negated skill mentions are excluded conservatively.
3. **Evidence and correction.** Field/skill source quotes, page references, source labels and review warnings. Account-supplied values are distinguished from PDF evidence. Every major section is editable. Skills are mentions, not proof of proficiency. The owner confirms review before sharing. Source evidence remains evidence of the original extraction; owner edits are recorded separately.
4. **Career exploration.** The structured fields feed the existing personal role-matching and reskilling flow. Matching is exploratory guidance. The wider project's trend source, course verification and scoring quality remain separate modules to validate.
5. **Application permissions.** Explicit, separate permission for the organised summary and the complete original PDF. The authenticated account owning that vacancy can access only the selected resources. PDF-only applicants receive no score or leaked summary through the screening endpoint. Permissions can be narrowed and applications withdrawn even after the vacancy closes.
6. **Named people.** Share with an existing CareerLens account by email; choose summary, PDF or both; expire after 1, 7 or 30 days. The recipient must sign in to that exact account. Possessing or forwarding the URL does not grant access. No email or invitation is sent automatically. The current account-email identity is a demo mechanism, not verified real-world identity.
7. **Control centre.** View application and named-recipient access, revoke grants, export the saved profile as JSON, and delete the current vault. Deletion removes the current PDF, extracted text, profile, application shares and associated access history. It does not delete the user's login account or promise erasure of backups or recipient copies.
8. **Explicit replacement behaviour.** Replacing a PDF withdraws existing applications and invalidates recipient grants. Editing profile content also ends previous sharing. The user must review and share the new content again. This conservative MVP rule avoids silently delivering a later CV to an old recipient. It is disclosed before replacement and edits.
9. **Accurate access history.** Successful employer summary/PDF reads, screening disclosures and named-recipient reads are recorded. Rejected access does not appear as a successful view. Logs reflect server requests, not proof that a human read the document.
10. **Session and response protections.** Random fallback session signing key for local runs; configurable persistent secret for deployment; HTTP-only, SameSite cookies; two-hour sessions; session-bound CSRF on changes; upload request cap; private no-store responses; no password hash snippets in client data; debug disabled and localhost binding by default.

## What the AI currently is — and is not

The default CV engine uses local PDF text extraction, section rules and a skill taxonomy. PDF extraction itself sends no CV content to an outside AI service. The optional **Organise my CV with AI** flow now connects to a real Qwen2.5-7B-Instruct worker on RunPod, replacing the old echo placeholder. It requires explicit consent, validates returned excerpts against PDF pages, and saves an unreviewed draft. Deployment, GPU execution and CV-specific quality evaluation remain pending until performed on an authorised RunPod endpoint. See [CV model and RunPod setup](CV_MODEL_RUNPOD.md) for the implementation, training and evaluation workflow.

The latest project separately supports optional Google Gemini questionnaire generation and Lumi answer rewriting. Local processing remains the default. Both external paths require a separate unchecked consent control and a reviewed profile. The questionnaire discloses that work/project details and basic answers are sent; Lumi discloses the message and reviewed CV profile. Recruiter chat cannot send candidate data to Gemini. Consent to share with an employer does not authorize an external AI processor. Do not mistake optional Gemini calls for a custom-trained CV model.

This implementation preserves account settings, job discovery, interviews, questionnaires, comparison and language features. It includes an optional pretrained model integration and scripts for later CV-specific adapter training. It does not claim an executed training run, measured model accuracy or legal certification. The default remains local until a dedicated CV endpoint is configured.

### Contract for connecting your trained model

Keep document reading and permissions outside the model. The server should extract bounded text first, remove unnecessary contact identifiers, and send page-labelled content only after clearly explaining the configured processor and processing purpose to the user. Do not send the entire vault or unrelated applications.

The model should return a strict structured result with:

- A short professional summary based only on the supplied text.
- Experience, education, projects, certifications and skills, each linked to source page and quotation.
- `null` or an empty list for unknown values; separate candidate statements from model inferences.
- Three useful follow-up questions for missing career-relevant information, not sensitive personal traits.
- Model name/version, processing timestamp and extraction method for disclosure.

Treat PDF text as untrusted data. Instructions inside a CV must not alter the model's rules, access other documents, execute tools or change sharing. Validate response types and lengths, verify every quoted passage against the extracted source, and reject unsupported claims. Never accept model-created URLs as verified job/course sources. On timeout, invalid output or missing evidence, show a clear local-parser fallback rather than fake AI output. The owner still reviews the result.

Evaluate on synthetic CVs held out from training: simple and two-column layouts, career changers, gaps, overlapping dates, multilingual examples, scans, skill negation, conflicting totals and malicious instructions. Report measured field accuracy, unsupported-claim rate, evidence coverage, latency and fallback rate. Do not label a keyword detector or the model's own confidence as measured accuracy.

## Privacy model

| Viewer | Original PDF | Reviewed profile | Access condition |
| --- | --- | --- | --- |
| Owner | Yes | Yes | Authenticated owner account |
| Another ordinary account | No | No | Denied by default |
| Named recipient | Only if chosen | Only if chosen | Exact recipient account, active unexpired grant and unchanged content |
| Vacancy owner | Only if chosen | Only if chosen | Active application to that owner's vacancy and explicit scope |
| Other employer | No | No | A company name or guessed application ID is insufficient |

The current employer permission belongs to the specific recruiter account owning the vacancy, not every person who types the same company name. Real company teams require verified organisation membership and role-based access before wider rollout.

Imported JobStreet dataset listings support career discovery. They have no authenticated employer recipient in CareerLens and cannot receive an in-app CV application. A nearby company displayed on the map must not replace the actual vacancy owner's identity at the sharing step. The chatbot follows the same summary/PDF permission checks and must not use PDF-only applicants for scoring.

Summary sharing includes the contact details displayed in that summary. The original PDF includes everything the user uploaded. A production redaction feature must generate a genuinely redacted file, not hide text with a visual overlay. Revocation blocks subsequent server access; it cannot erase an already downloaded file, screenshot or printed copy.

Aggregate publication is disabled in this iteration. The optional preference defaults off. The old one-person skill/industry statistics were not a defensible anonymity guarantee; free-text skills could themselves contain identifiers. A future aggregate implementation needs normalized categories, cohort thresholds, suppression and re-identification review.

## User journey and screen behaviour

1. Open **PDF CV & Summary** and choose a synthetic sample or confirm a custom file is fictional.
2. See checks and extraction status. Failed uploads preserve the old vault.
3. Compare the draft to the original. Expand evidence; correct misread values and section entries. Leave unknown values blank.
4. Confirm review and save. Unsaved edits are visibly marked and protected against accidental page exit. A stale file fingerprint cannot edit a replacement PDF.
5. Explore role matches and learning gaps. Continue using the profile privately if sharing is unnecessary.
6. Choose either a named account with expiry or a demo application with explicit summary/PDF choices. Both choices begin unchecked.
7. Review access history; revoke any share. Export or delete from the same vault screen.

A useful quality checklist is: Does the summary describe the person accurately? Are the top skills backed by evidence? Are projects separate from employment? Are qualification claims appropriately qualified? Are preferences the person's own choices? Are unknowns visible? Does the recipient see exactly what the owner selected?

## Hackathon alignment

The official Domain 1 brief requires skills intake, updatable AI/job-market signals, explainable future-role matching, ordered reskilling, SDG mapping and more than one future scenario. It specifies public/open/synthetic data, forbids real CVs for the demo and excludes real recruitment integrations. Use the application feature as a **synthetic permission demonstration**; centre the pitch on career readiness and reskilling.

Source: [Official Domain 1 problem statement and rubric](https://drive.google.com/file/d/1x6Nvjl_1Gc-v3SsTnf44HVEJZQsbWVRA/view). Team context: [CareerLens planning document](https://docs.google.com/document/d/1CmYiZNOiwhHVzvfPGyKIg8iWL56WJdDGZwPaDCZ55EY/edit?tab=t.zaemhhxwe2nj).

The latest repository also contains benchmark CV references labelled with real people's names. Those files are excluded from the selectable and publicly served demo samples; their files are not deleted. Use the fictional built-in CVs to demonstrate the parser and permissions.

### Suggested 90-second feature demonstration

- **0–20 seconds:** Load Kavin's fictional CV. Show the structured sections and an evidence quotation.
- **20–40 seconds:** Correct a field and confirm review. Explain that unknown facts are not invented and skills are not independently verified.
- **40–60 seconds:** Open personal role matches and discuss how the profile supports skill-gap and learning-pathway modules.
- **60–80 seconds:** Demonstrate summary-only access in a synthetic employer application. Original PDF access should be denied; an unrelated employer should also be denied.
- **80–90 seconds:** Revoke access and show that reopening it fails. Mention named-recipient expiry and the limits of recalling downloaded copies.

## Acceptance checks and run instructions

Tests use generated synthetic PDFs and disposable databases. They cover parsing, missing facts, malformed/encrypted/scanned files, permission combinations, wrong-owner access, screening leaks, expiry, revocation, replacement, deletion/export, input validation, CSRF, audit accuracy and no-store responses.

With Python and project dependencies installed:

```powershell
python -m pip install -r requirements-web.txt
python -m unittest discover tests -v
python src/main.py
```

Open `http://127.0.0.1:5000`. Demo accounts remain available when `CAREERLENS_DEMO=1` (the default). No CV is automatically restored or shared on startup after deletion. Set security/runtime settings through Replit Secrets or shell environment values; the latest optional questionnaire and chatbot modules also read their own AI settings from `.env`. Never commit that file. The `.env.example` documents the distinction.

For HTTPS deployment, configure a strong persistent `FLASK_SECRET_KEY` and `COOKIE_SECURE=1`; set `HOST=0.0.0.0` for hosted access (the Replit run configuration does this). Use a production WSGI server and persistent private storage. An unset secret is random per process: good for a local demo, unsuitable for multiple production workers or stable sessions across restarts.

## Before accepting real CVs

This is a synthetic-data prototype, not a production privacy certification. Current files and SQLite content are not encrypted by this application at rest. Server operators with filesystem access can read them. A public link to the app must not be described as a secure production vault.

Production work should include verified email/account recovery, verified organisations, rate limits, account takeover protections, private encrypted object storage and key management, retention/deletion policies including backups, isolated parsing with CPU/memory/time quotas and malware scanning, accessible multilingual OCR, and deployment monitoring that avoids logging CV content. Page-stream checks occur after decoding and do not replace sandbox resource isolation. Review third-party script/font dependencies and self-host assets for sensitive pages. Conduct applicable privacy/legal review before claiming compliance.

The next product additions are immutable CV versions and application snapshots, per-recipient redacted summaries, revocation without withdrawing an application, real model integration and evaluation, verified company team access, and an optional human career-adviser workflow. Authentication currently identifies demo accounts by registered email; it does not prove real-world email ownership. Do not use the shared demo credentials with real data.

Technical references: [Flask web security guidance](https://flask.palletsprojects.com/en/stable/web-security/) and [pypdf text extraction limitations](https://pypdf.readthedocs.io/en/stable/user/extract-text.html).
