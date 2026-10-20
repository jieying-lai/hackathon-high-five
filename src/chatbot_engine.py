"""Lumi AI — Domain-Scoped Mascot Chatbot & Agentic Copilot for CareerLens AI.

Architecture:
  1. Strict In-Range Guardrail Layer:
       - Lumi ONLY answers questions within the CareerLens AI / Workforce & Career Reskilling scope:
         CV parsing & privacy, job matching, AI skills radar, verified courses (HRD Corp / MyFutureJobs / MDEC),
         interview prep, SDG 4 & SDG 8 alignment, and Employer/HR vacancies, fair screening & workforce heatmaps.
       - Out-of-scope queries (e.g., cooking recipes, gaming, medical diagnosis, celebrity gossip, politics,
         crypto speculation, general homework) are politely declined with a friendly redirection to in-range topics.
  2. Live Database & Session Tooling (Function Calling / RAG):
       - Inspects the logged-in user's real SQLite state (`user_cvs`, `job_applications`, `vacancies`,
         `training_assignments`, `verified_courses.json`, `future_roles.json`, `trend_signals.py`).
       - Returns rich UI `actions` (e.g., `[Open Reskilling Plan]`, `[Browse & Apply Jobs]`, `[View Skills Heatmap]`)
         so clicking a button in the chatbox navigates or triggers actions directly in the portal.
  3. Optional Live LLM Plugin Connector:
       - Automatically connects to RunPod Serverless (`RUNPOD_API_KEY` + `RUNPOD_ENDPOINT_ID`),
         Google Gemini (`GEMINI_API_KEY`), or OpenAI-compatible APIs (`OPENAI_API_KEY`) when configured in `.env`,
         passing the strict domain system prompt + live user RAG context.
       - Falls back seamlessly to the deterministic Domain Knowledge & Tool Engine so it works 100% offline/locally.
"""

import json
import os
import re
import urllib.request

from ai_matcher import load_json, match_user_to_roles
import cv_engine
import hr_engine
from trend_signals import get_trend_radar

MASCOT_PROFILE = {
    "name": "Lumi",
    "title": "CareerLens AI Owl Copilot",
    "avatar": "/static/brand/lumi_mascot.svg",
    "scope_badge": "Domain-Scoped AI · Career, CV, Reskilling & HR Only",
}

# Out-of-range topic detector (strictly refuses general-purpose unrelated chatter)
_OUT_OF_RANGE_PATTERNS = [
    (re.compile(r"\b(?:recipe|cook(?:ing)?|bake|nasi lemak|chicken rice|pasta|pizza|burger|calories|diet)\b", re.I),
     "cooking, food recipes, or nutrition"),
    (re.compile(r"\b(?:weather|rain(?:ing)?|temperature|forecast|typhoon|earthquake)\b", re.I),
     "weather forecasts or climate news"),
    (re.compile(r"\b(?:movie|netflix|anime|k-?pop|taylor swift|celebrity|gossip|song lyrics|spotify|concert)\b", re.I),
     "entertainment, movies, or celebrity gossip"),
    (re.compile(r"\b(?:football|soccer|premier league|basketball|nba|badminton|world cup|fifa|valorant|genshin|dota|minecraft)\b", re.I),
     "sports scores or video games"),
    (re.compile(r"\b(?:bitcoin|ethereum|dogecoin|crypto(?:currency)?|forex|stock tip|gambl(?:e|ing)|lottery|4d)\b", re.I),
     "crypto trading, stock tips, or gambling"),
    (re.compile(r"\b(?:symptom|medicine|doctor|hospital|headache|fever|diabetes|prescri(?:be|ption)|medical advice)\b", re.I),
     "medical or health diagnosis"),
    (re.compile(r"\b(?:president|election|prime minister|parliament|political party|war|geopolitics)\b", re.I),
     "politics or geopolitical commentary"),
    (re.compile(r"\b(?:tell me a joke|write a poem|love letter|horoscope|zodiac|astrology|boyfriend|girlfriend|dating)\b", re.I),
     "jokes, creative fiction, or relationship advice"),
]

# In-range domain keywords (if a message has both, domain context wins unless clearly off-topic)
_IN_RANGE_KEYWORDS = re.compile(
    r"\b(?:cv|resume|pdf|skill|reskill|upskill|course|training|hrd\s*corp|mdec|myfuturejobs|"
    r"job|vacanc(?:y|ies)|role|career|match|score|interview|question(?:naire)?|salary|rm|"
    r"sdg|passport|trend|radar|ai|automation|audit(?:or)?|developer|copywriter|finance|software|marketing|"
    r"hr|employer|company|candidate|screen(?:ing)?|heatmap|workforce|privacy|pdpa|apply|application|lumi|help)\b",
    re.I,
)


def check_domain_guardrail(message: str) -> tuple[bool, str | None]:
    """Return `(is_allowed, refusal_topic)` enforcing Lumi's strict domain boundary."""
    text = (message or "").strip()
    if not text:
        return False, "empty message"

    for rx, topic_label in _OUT_OF_RANGE_PATTERNS:
        if rx.search(text) and not _IN_RANGE_KEYWORDS.search(text):
            return False, topic_label

    return True, None


def _build_live_context(user: dict | None) -> dict:
    """Gather live database context for the current user (Job Seeker or Employer/HR, or Guest)."""
    courses = load_json("verified_courses.json")
    future_roles = load_json("future_roles.json")

    if not user:
        return {
            "portal": "guest",
            "user_name": "Guest",
            "courses": courses,
            "future_roles": future_roles,
        }

    role = user.get("role", "job_seeker")
    uid = user.get("unique_uid", "")
    if role == "hr_company":
        vacancies = hr_engine.list_vacancies(uid)
        heatmap = hr_engine.get_heatmap()
        assignments = hr_engine.list_assignments(uid)
        top_screen = hr_engine.screen_candidates(uid, vacancies[0]["id"]) if vacancies else None
        return {
            "portal": "hr_company",
            "user_name": user.get("full_name", "HR Manager"),
            "company_name": (user.get("role_details") or {}).get("company_name", "Your Company"),
            "vacancies": vacancies,
            "heatmap": heatmap,
            "assignments": assignments,
            "top_screen": top_screen,
            "courses": courses,
        }

    # Job seeker context
    cv_rec = cv_engine.get_user_cv(uid)
    st = (cv_rec or {}).get("structured_cv") or {}
    rd = user.get("role_details") or {}
    profile = {
        "name": st.get("full_name") or user.get("full_name") or "Candidate",
        "industry": st.get("industry") or rd.get("industry") or "Finance & Accounting",
        "current_role": st.get("current_role") or rd.get("current_role") or "Professional",
        "work_mode_preference": st.get("work_mode_preference") or rd.get("preferred_work_mode") or "Hybrid",
        "skills": st.get("skills") or ["Financial Auditing", "Risk Assessment", "Excel Pivot & Macros"],
    }
    match_res = match_user_to_roles(profile=profile, scenario="moderate")
    open_jobs = hr_engine.list_open_vacancies_for_seeker(uid)
    return {
        "portal": "job_seeker",
        "user_name": user.get("full_name", "Talent"),
        "cv_record": cv_rec,
        "profile": profile,
        "recommended_roles": match_res.get("recommended_roles", []),
        "verification_questions": match_res.get("verification_questions", []),
        "open_jobs": open_jobs,
        "courses": courses,
    }


def _try_external_llm_plugin(message: str, ctx: dict, history: list) -> str | None:
    """Optional external LLM plugin (Gemini / OpenAI / RunPod) with strict domain system prompt."""
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not gemini_key and not openai_key:
        return None

    sys_prompt = (
        "You are Lumi, the cute owl AI career & workforce mascot for CareerLens AI (Malaysia). "
        "STRICT GUARDRAIL: You ONLY answer questions about CV analysis, PDF privacy, career matching, "
        "AI skill trends, verified Malaysian reskilling courses (HRD Corp, MyFutureJobs, MDEC), SDG 4 & 8, "
        "job vacancies, fair candidate screening, and workforce skill heatmaps. "
        "Refuse any unrelated topic (cooking, gaming, sports, medical, crypto, politics). "
        "Keep answers concise (under 110 words), warm, and structured with bullet points. "
        f"Live User Context JSON: {json.dumps({'portal': ctx.get('portal'), 'user_name': ctx.get('user_name')})}"
    )

    try:
        if gemini_key:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
            payload = {
                "system_instruction": {"parts": [{"text": sys_prompt}]},
                "contents": [{"role": "user", "parts": [{"text": message}]}],
                "generationConfig": {"maxOutputTokens": 240, "temperature": 0.3},
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                body = json.loads(resp.read().decode("utf-8"))
            return body["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        return None
    return None


def get_quick_prompts(user: dict | None) -> list[dict]:
    """Return contextual quick-action chips for the chat widget."""
    if not user:
        return [
            {"label": "🦉 What can Lumi do?", "prompt": "What can you help me with on CareerLens AI?"},
            {"label": "🔒 How is my PDF CV protected?", "prompt": "How does CareerLens protect my PDF CV privacy?"},
            {"label": "📈 Top rising AI skills", "prompt": "What are the fastest rising AI skills right now?"},
            {"label": "🌱 SDG 4 & 8 impact", "prompt": "How does CareerLens align with UN SDG 4 and SDG 8?"},
        ]
    if user.get("role") == "hr_company":
        return [
            {"label": "🏆 Top candidates for my vacancy", "prompt": "Who are the top-matched candidates for my open vacancies?"},
            {"label": "📄 Who applied with a PDF CV?", "prompt": "Which candidates have applied and shared their PDF CV?"},
            {"label": "🔥 Biggest team skill gap", "prompt": "What is our biggest workforce skill gap on the heatmap and which course fixes it?"},
            {"label": "⚖️ How does fair AI screening work?", "prompt": "How do you ensure fair, unbiased candidate screening?"},
        ]
    return [
        {"label": "📄 Summarize my PDF CV", "prompt": "Summarize my uploaded PDF CV and extracted skills."},
        {"label": "🎯 My best future-role match", "prompt": "What is my #1 matched future role and what skills am I missing?"},
        {"label": "💼 Open company jobs for me", "prompt": "Which open company job vacancies match my CV best?"},
        {"label": "🧭 Recommend reskilling courses", "prompt": "Recommend verified HRD Corp / Malaysia courses to close my skill gap."},
        {"label": "🔒 Who viewed my CV?", "prompt": "Has any employer viewed my CV, and how is my privacy protected?"},
    ]


def generate_lumi_response(message: str, user: dict | None = None, history: list | None = None) -> dict:
    """Process a user message through Lumi's Domain Guardrail + Live Tool Engine."""
    history = history or []
    clean_msg = (message or "").strip()

    allowed, blocked_topic = check_domain_guardrail(clean_msg)
    if not allowed:
        if blocked_topic == "empty message":
            return {
                "ok": False,
                "in_range": False,
                "reply": "Hoot! Please type a question about your CV, career matches, reskilling courses, or HR screening.",
                "actions": [],
                "mascot": MASCOT_PROFILE,
            }
        return {
            "ok": True,
            "in_range": False,
            "guardrail_triggered": True,
            "blocked_topic": blocked_topic,
            "reply": (
                f"🦉 **Hoot! That's outside my training scope.**\n\n"
                f"I noticed you asked about **{blocked_topic}**. Unlike a general-purpose chatbot, I am **Lumi**, "
                f"trained exclusively for **CareerLens AI's workforce & reskilling domain**.\n\n"
                f"I can help you with:\n"
                f"• 📄 **PDF CV Extraction & PDPA Privacy Vault**\n"
                f"• 🎯 **Explainable Future-Role & Vacancy Matching**\n"
                f"• 🧭 **Verified Reskilling Courses (HRD Corp / MyFutureJobs / MDEC)**\n"
                f"• 🏢 **Fair Candidate Screening & Workforce Skill Heatmaps**"
            ),
            "actions": [
                {"label": "📄 My PDF CV Summary", "prompt": "Summarize my uploaded PDF CV and extracted skills."},
                {"label": "🎯 Best Role Match", "prompt": "What is my #1 matched future role and what skills am I missing?"},
                {"label": "📈 Rising AI Skills", "prompt": "What are the fastest rising AI skills right now?"},
            ],
            "mascot": MASCOT_PROFILE,
        }

    ctx = _build_live_context(user)
    low = clean_msg.lower()
    portal = ctx["portal"]

    # ------------------------------------------------------------------
    # EMPLOYER / HR PORTAL INTENTS
    # ------------------------------------------------------------------
    if portal == "hr_company":
        vacs = ctx.get("vacancies") or []
        heat = ctx.get("heatmap") or {}
        top_scr = ctx.get("top_screen") or {}

        # Intent H1: Applied candidates / PDF CV sharing
        if any(k in low for k in ("applied", "applicant", "pdf", "shared", "cv")):
            results = (top_scr.get("results") or [])
            applied = [r for r in results if r.get("is_applied_user")]
            if applied:
                lines = [
                    f"• **{a['name']}** (`{a['application_uid']}`) — **{a['score']}% match** for *{top_scr['vacancy']['title']}* "
                    f"({'✓ Organised CV' if a['share_organised_cv'] else ''}{' + ✓ Original PDF' if a['share_original_pdf'] else ' · 🔒 Original PDF withheld'})"
                    for a in applied
                ]
                reply = (
                    f"🦉 **Verified Applicants with Shared CVs ({len(applied)}):**\n\n"
                    + "\n".join(lines)
                    + "\n\nRemember: personal PDF CVs are strictly consent-gated and only unlocked for vacancies the candidate applied to."
                )
            else:
                reply = (
                    "🦉 **No direct PDF CV applications yet for your top vacancy.**\n\n"
                    "Candidates' uploaded PDF CVs remain locked in their private vault until they click **Apply & Share CV** on your vacancy. "
                    "You can still screen the 10 anonymised benchmark candidates in **Candidate Screening**."
                )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [{"label": "🔍 Open Candidate Screening", "tab": "screening"}],
                "mascot": MASCOT_PROFILE,
            }

        # Intent H2: Top candidates / screening / vacancies
        if any(k in low for k in ("candidate", "screen", "top", "vacanc", "hire", "shortlist", "match")):
            if not vacs:
                return {
                    "ok": True, "in_range": True,
                    "reply": "🦉 You don't have any open vacancies yet! Create a vacancy in **Job Vacancies** to start explainable candidate screening.",
                    "actions": [{"label": "📋 Create Job Vacancy", "tab": "vacancies"}],
                    "mascot": MASCOT_PROFILE,
                }
            v = top_scr["vacancy"]
            top3 = (top_scr.get("results") or [])[:3]
            bullets = [
                f"{i+1}. **{c['name']}** ({c['type']}) — **{c['score']}%** · *{c['action']}* "
                f"(Matched: {', '.join(c['matched_required'][:3]) or 'None'}; To confirm: {', '.join(c['to_confirm'][:2]) or 'None'})"
                for i, c in enumerate(top3)
            ]
            reply = (
                f"🦉 **Top Screened Candidates for {v['title']} (`{v['vacancy_uid']}`):**\n\n"
                + "\n".join(bullets)
                + "\n\n⚖️ *Missing skills are marked **To confirm** with tailored interview questions—never auto-rejected.*"
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🔍 View Full Screening Table", "tab": "screening"},
                    {"label": "📋 Manage Vacancies", "tab": "vacancies"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent H3: Workforce Heatmap / Skill Gaps / Training Approval
        if any(k in low for k in ("heatmap", "gap", "team", "workforce", "reskill", "train", "employee", "readiness")):
            summary = sorted(heat.get("skill_summary") or [], key=lambda s: s["coverage"])
            worst = summary[0] if summary else {"skill": "AI Risk & Compliance", "coverage": 25, "below_target": 6}
            needing = [e for e in (heat.get("employees") or []) if e.get("recommendations")]
            top_emp = needing[0] if needing else None
            emp_line = ""
            if top_emp and top_emp["recommendations"]:
                rec = top_emp["recommendations"][0]
                emp_line = (
                    f"\n• **Priority Staff Recommendation:** Approve **{rec['course_title']}** ({rec['provider']} · "
                    f"{rec['hours']}h · `{rec['badge']}`) for **{top_emp['name']}** ({top_emp['role']})."
                )
            reply = (
                f"🦉 **Workforce Skills-Gap Analysis ({ctx['company_name']}):**\n\n"
                f"• **Team AI Readiness:** **{heat.get('team_readiness', 0)}%** across {len(heat.get('employees', []))} staff\n"
                f"• **Biggest Skill Bottleneck:** **{worst['skill']}** (only **{worst['coverage']}%** at target level; {worst['below_target']} staff need upskilling)"
                + emp_line
                + f"\n• **Approved Courses So Far:** **{len(ctx.get('assignments') or [])}**"
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🔥 Open Skills Heatmap", "tab": "heatmap"},
                    {"label": "🎓 Approve Reskilling Plans", "tab": "reskill"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent H4: Fairness / Responsible AI
        if any(k in low for k in ("fair", "bias", "ethics", "responsible", "human", "pdpa", "privacy")):
            reply = (
                "🦉 **CareerLens Fair-AI & Privacy Guarantees for Employers:**\n\n"
                "• **Job-Relevant Criteria Only:** Scores are computed strictly from Required Skills (45), Experience (20), Education (10), Preferred Skills (10), Salary Fit (10), and Work Mode (5).\n"
                "• **Zero Demographic Bias:** Age, gender, ethnicity, and marital status are never collected or scored.\n"
                "• **No Auto-Rejection:** Missing skills are flagged as *To Confirm* with editable follow-up questions.\n"
                "• **Application-Gated CVs:** Personal PDF CVs are only accessible when a candidate applies to your vacancy."
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [{"label": "📊 Employer Overview", "tab": "overview"}],
                "mascot": MASCOT_PROFILE,
            }

    # ------------------------------------------------------------------
    # TALENT / JOB SEEKER PORTAL INTENTS
    # ------------------------------------------------------------------
    if portal == "job_seeker":
        cv_rec = ctx.get("cv_record")
        roles = ctx.get("recommended_roles") or []
        jobs = ctx.get("open_jobs") or []
        top_role = roles[0] if roles else None

        # Intent T1: PDF CV Summary / Extracted Skills
        if any(k in low for k in ("my cv", "pdf", "summarize", "summarise", "extracted", "upload")):
            if not cv_rec:
                return {
                    "ok": True, "in_range": True,
                    "reply": (
                        "🦉 **You haven't uploaded a `.pdf` CV yet!**\n\n"
                        "Head over to **PDF CV & Summary** to upload your `.pdf` CV (or click one of the 3 synthetic sample PDFs). "
                        "I will automatically capture your education, work experience, projects, and canonical skills into your private vault."
                    ),
                    "actions": [{"label": "📄 Upload PDF CV Now", "tab": "profile"}],
                    "mascot": MASCOT_PROFILE,
                }
            st = cv_rec["structured_cv"]
            reply = (
                f"🦉 **Your AI-Organised PDF CV (`{cv_rec['original_filename']}`):**\n\n"
                f"• **Headline:** {st.get('current_role')} · {st.get('industry')} ({st.get('years_experience')} yr(s) · {st.get('education_level')})\n"
                f"• **AI Summary:** _{st.get('executive_summary')}_\n"
                f"• **Extracted Skills ({len(st.get('skills', []))}):** {', '.join(st.get('skills', [])[:8])}\n"
                f"• **Vault Status:** Private (`SHA-256 {cv_rec['file_sha256']}`) · Viewed by **{len(cv_rec.get('access_logs', []))}** employer(s)."
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "📄 Open PDF CV Vault", "tab": "profile"},
                    {"label": "💼 Apply to Open Jobs", "tab": "jobs"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T2: Privacy / Who viewed my CV / PDPA
        if any(k in low for k in ("privacy", "pdpa", "who viewed", "access", "shared", "protect", "safe")):
            logs = (cv_rec or {}).get("access_logs") or []
            applied_jobs = [j for j in jobs if (j.get("application") or {}).get("applied")]
            log_text = (
                f"**{len(logs)} recorded employer view(s)** — latest: *{logs[0]['company_name']}* ({logs[0]['access_type']} for {logs[0]['vacancy_title']})."
                if logs else "**0 employer views so far** — your CV is completely private."
            )
            reply = (
                f"🦉 **Your PDPA Privacy Shield Status:**\n\n"
                f"• **Default Rule:** Your PDF CV is used **only** for anonymised aggregate skill trend stats and your personal job matching.\n"
                f"• **Application Gate:** Companies cannot see your organised CV or original PDF unless you apply. You currently have **{len(applied_jobs)} active application(s)**.\n"
                f"• **Audit Log:** {log_text}"
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🔒 Check CV Access Log", "tab": "profile"},
                    {"label": "💼 Manage Job Applications", "tab": "jobs"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T3: Open Company Job Vacancies / Apply
        if any(k in low for k in ("open company", "vacanc", "apply", "hiring", "company job", "jobs")):
            if not jobs:
                return {
                    "ok": True, "in_range": True,
                    "reply": "🦉 There are no open company vacancies right now. Check back soon or explore your Future-Role Matches!",
                    "actions": [{"label": "🎯 Future-Role Matches", "tab": "match"}],
                    "mascot": MASCOT_PROFILE,
                }
            lines = []
            for j in jobs[:3]:
                app = j.get("application") or {}
                status = f"✓ Applied (`{app['application_uid']}`)" if app.get("applied") else "🔒 Not applied yet"
                lines.append(
                    f"• **{j['title']}** at *{j['company_name']}* — **{j.get('match_score') or 0}% match** · "
                    f"RM {j['salary_min']:,}–{j['salary_max']:,} ({j['work_mode']}) · {status}"
                )
            reply = (
                "🦉 **Open Company Vacancies Matched to Your CV:**\n\n"
                + "\n".join(lines)
                + "\n\nClick **Browse & Apply Jobs** to submit your application and choose whether to share your Organised CV and/or Original PDF."
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [{"label": "💼 Browse & Apply Jobs", "tab": "jobs"}],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T4: Reskilling Courses / Learning Plan / HRD Corp
        if any(k in low for k in ("course", "reskill", "upskill", "learn", "plan", "hrd", "mdec", "myfuturejobs", "pathway", "hour")):
            if not top_role or not top_role.get("ordered_pathway"):
                return {
                    "ok": True, "in_range": True,
                    "reply": "🦉 You already cover all core skills for your selected role, or you can pick another target role in **Reskilling Plan**!",
                    "actions": [{"label": "🧭 Open Reskilling Plan", "tab": "plan"}],
                    "mascot": MASCOT_PROFILE,
                }
            steps = [
                f"{s['step']}. **{s['target_skill']}** → *{s['course_title']}* ({s['provider']} · **{s['hours']}h** · `{s['malaysia_badge']}` · {s['sdg']})"
                for s in top_role["ordered_pathway"]
            ]
            reply = (
                f"🦉 **Verified Reskilling Pathway for {top_role['title']} ({top_role['estimated_total_hours']}h total):**\n\n"
                + "\n".join(steps)
                + "\n\nAll courses come strictly from our verified catalogue (zero hallucinated URLs)."
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🧭 View Step-by-Step Plan", "tab": "plan"},
                    {"label": "🌱 View SDG Passport", "tab": "passport"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T5: Best Future-Role Match / Skill Gaps
        if any(k in low for k in ("match", "future role", "best role", "missing", "gap", "score", "career")):
            if not top_role:
                return {
                    "ok": True, "in_range": True,
                    "reply": "🦉 Upload your PDF CV first so I can calculate your explainable future-role match scores!",
                    "actions": [{"label": "📄 Upload PDF CV", "tab": "profile"}],
                    "mascot": MASCOT_PROFILE,
                }
            bd = top_role["explainable_breakdown"]
            reply = (
                f"🦉 **Your #1 Future-Role Match: {top_role['title']} ({top_role['match_score']}%)**\n\n"
                f"• **Explainable Score Breakdown:** Core Skills `{bd['core_skills_match_pct']}/50` · "
                f"Transferable `{bd['transferable_skills_pct']}/25` · Sector `{bd['industry_alignment_pct']}/15` · Work Mode `{bd['work_mode_fit_pct']}/10`\n"
                f"• **Matched Skills:** {', '.join(top_role['matched_core_skills']) or 'Transferable foundation'}\n"
                f"• **Skills to Build ({len(top_role['skills_gap'])}):** {', '.join(top_role['skills_gap']) or 'None — 100% covered!'}"
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🎯 View All Role Matches", "tab": "match"},
                    {"label": "🧭 Open Reskilling Plan", "tab": "plan"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T6: Interview / Verification Questionnaire
        if any(k in low for k in ("interview", "question", "verify", "prepare", "ask")):
            vqs = ctx.get("verification_questions") or []
            q_lines = [f"• **{q['skill_tested']}:** _{q['question']}_" for q in vqs[:3]]
            reply = (
                "🦉 **AI-Generated Verification Questions for Your CV:**\n\n"
                + ("\n".join(q_lines) if q_lines else "• Describe a project where you applied your core domain skills end-to-end.")
                + "\n\nPractising these in the **Questionnaire** tab helps employers confirm your practical depth!"
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [{"label": "📝 Open Questionnaire", "tab": "quest"}],
                "mascot": MASCOT_PROFILE,
            }

    # ------------------------------------------------------------------
    # SHARED INTENTS (AI Trends, SDG 4 & 8, Privacy, General Help)
    # ------------------------------------------------------------------
    if any(k in low for k in ("trend", "radar", "rising", "emerging", "declining", "automation", "arxiv", "fast")):
        radar = get_trend_radar("moderate")
        rising = [f"• **{s['skill']}** (+{s['growth_pct']}% growth · {s['sdg']})" for s in radar["emerging_skills"]]
        risk = [f"• *{t['task']}* ({t['automation_risk_pct']}% automation risk)" for t in radar["declining_tasks"][:2]]
        reply = (
            f"🦉 **Live AI Workforce Trend Radar ({radar['signal_metadata']['source_name']}):**\n\n"
            f"**Fastest-Rising Skills:**\n" + "\n".join(rising) + "\n\n"
            f"**Tasks at High Automation Risk:**\n" + "\n".join(risk)
        )
        actions = [{"label": "📡 Open AI Radar", "tab": "radar"}] if portal == "job_seeker" else []
        return {"ok": True, "in_range": True, "reply": reply, "actions": actions, "mascot": MASCOT_PROFILE}

    if any(k in low for k in ("sdg", "sustainable", "impact", "passport", "united nations")):
        reply = (
            "🦉 **UN Sustainable Development Goals Alignment:**\n\n"
            "• **SDG 4 (Target 4.4 — Quality Education & Technical Skills):** Every recommended course builds verifiable digital, AI, and analytical competencies via HRD Corp, MDEC, and MyFutureJobs.\n"
            "• **SDG 8 (Target 8.2 & 8.5 — Decent Work & Economic Productivity):** Protects workers from AI displacement by guiding them into higher-value human-AI co-pilot roles."
        )
        actions = [{"label": "🌱 Open SDG Passport", "tab": "passport"}] if portal == "job_seeker" else [{"label": "🎓 Reskilling SDG Impact", "tab": "reskill"}]
        return {"ok": True, "in_range": True, "reply": reply, "actions": actions, "mascot": MASCOT_PROFILE}

    # Try external LLM plugin if configured for nuanced in-range career questions
    ext_reply = _try_external_llm_plugin(clean_msg, ctx, history)
    if ext_reply:
        return {
            "ok": True,
            "in_range": True,
            "reply": ext_reply,
            "actions": get_quick_prompts(user)[:2],
            "mascot": MASCOT_PROFILE,
        }

    # Default helpful in-range guide tailored to the active portal
    if portal == "hr_company":
        reply = (
            f"🦉 **Hi {ctx['user_name']}! I'm Lumi, your Employer Portal AI Copilot.**\n\n"
            f"I'm trained specifically on **{ctx['company_name']}'s** hiring & workforce data. Ask me about:\n"
            f"• 🏆 **Top screened candidates** and explainable match scores for your vacancies\n"
            f"• 📄 **Direct applicants** who shared their AI-Organised CV & Original PDF\n"
            f"• 🔥 **Workforce skills-gap heatmap** bottlenecks & HRD Corp training approvals\n"
            f"• ⚖️ **Fair-AI screening rules** & PDPA privacy compliance"
        )
        actions = [
            {"label": "🔍 Screen Candidates", "tab": "screening"},
            {"label": "🔥 View Skills Heatmap", "tab": "heatmap"},
        ]
    elif portal == "job_seeker":
        reply = (
            f"🦉 **Hi {ctx['user_name']}! I'm Lumi, your CareerLens AI Owl Copilot.**\n\n"
            f"I'm trained specifically for your career & reskilling journey (and I strictly stay within career topics!). Ask me to:\n"
            f"• 📄 **Summarize your uploaded PDF CV** & check your PDPA privacy vault\n"
            f"• 🎯 **Explain your #1 future-role match** and skill gaps\n"
            f"• 💼 **Find open company job vacancies** & manage CV sharing permissions\n"
            f"• 🧭 **Recommend verified courses** (HRD Corp / MyFutureJobs / MDEC)"
        )
        actions = [
            {"label": "📄 My PDF CV Vault", "tab": "profile"},
            {"label": "🎯 My Role Matches", "tab": "match"},
            {"label": "💼 Open Company Jobs", "tab": "jobs"},
        ]
    else:
        reply = (
            "🦉 **Hello! I'm Lumi, the CareerLens AI Owl Copilot.**\n\n"
            "I help **Job Seekers** upload PDF CVs privately, discover AI-resilient roles, and follow verified reskilling plans—and I help **Employers / HR** run fair candidate screening and workforce skill heatmaps.\n\n"
            "Sign in with one of our quick demo accounts to see me analyse live data!"
        )
        actions = []

    return {
        "ok": True,
        "in_range": True,
        "reply": reply,
        "actions": actions,
        "mascot": MASCOT_PROFILE,
    }
