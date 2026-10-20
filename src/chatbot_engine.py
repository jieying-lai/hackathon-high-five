"""Lumi AI — Domain-Scoped Mascot Chatbot & Agentic Copilot for CareerLens AI.

Key Capabilities:
  1. Concise, High-Impact Answers:
       - Short, structured bullet points (never walls of text) + direct navigation/action buttons.
  2. Strict In-Range Guardrail Layer:
       - Answers Career, CV, Reskilling, Job Discovery, Location/Nearby Jobs, Career Aspirations,
         and Employer/HR questions.
       - Politely refuses unrelated general chatter (cooking recipes, gaming, sports scores,
         weather, celebrity gossip, crypto gambling, politics).
  3. Broad Career Aspiration & Nearby GPS Job Intelligence:
       - Handles open-ended career dreams (e.g., "I want to become a doctor / lawyer / pilot / chef / data scientist")
         by comparing against the user's current CV and recommending realistic AI-era bridge roles
         (e.g., Health Informatics & Clinical Data Analyst) or required qualifications.
       - Handles location/proximity queries (e.g., "Any suitable jobs nearby me based on my resume?")
         using live GPS / selected city coordinates, nearby company categories, and CV match scores.
"""

import json
import os
import re
import urllib.request

from ai_matcher import load_json, match_user_to_roles
import cv_engine
import hr_engine
import job_index
import lumi_knowledge
from trend_signals import get_trend_radar

MASCOT_PROFILE = {
    "name": "Lumi",
    "title": "Career Advisor",
    "avatar": "/static/brand/lumi_mascot.svg",
    "scope_badge": "Personalised Career & Workforce Advisor",
}

# Out-of-range topic detector (strictly refuses general-purpose unrelated chatter unless paired with career intent)
_OUT_OF_RANGE_PATTERNS = [
    (re.compile(r"\b(?:recipe|cook(?:ing)?|bake|nasi lemak|chicken rice|pasta|pizza|burger|calories|diet)\b", re.I),
     "cooking or food recipes"),
    (re.compile(r"\b(?:weather|rain(?:ing)?|temperature|forecast|typhoon|earthquake)\b", re.I),
     "weather forecasts"),
    (re.compile(r"\b(?:movie|netflix|anime|k-?pop|taylor swift|celebrity|gossip|song lyrics|spotify|concert)\b", re.I),
     "entertainment or celebrity gossip"),
    (re.compile(r"\b(?:football|soccer|premier league|basketball|nba|badminton|world cup|fifa|valorant|genshin|dota|minecraft)\b", re.I),
     "sports scores or video games"),
    (re.compile(r"\b(?:bitcoin|ethereum|dogecoin|crypto(?:currency)?|forex|stock tip|gambl(?:e|ing)|lottery|4d)\b", re.I),
     "crypto trading or gambling"),
    (re.compile(r"\b(?:symptom|headache|fever|diabetes|prescri(?:be|ption)|medical advice|sick|illness)\b", re.I),
     "personal medical diagnosis"),
    (re.compile(r"\b(?:president|election|prime minister|parliament|political party|war|geopolitics)\b", re.I),
     "politics"),
    (re.compile(r"\b(?:tell me a joke|write a poem|love letter|horoscope|zodiac|astrology|boyfriend|girlfriend|dating)\b", re.I),
     "jokes, fiction, or dating advice"),
]

# In-range domain keywords (includes broad career aspirations, professions, and location/nearby job search)
_IN_RANGE_KEYWORDS = re.compile(
    r"\b(?:cv|resume|pdf|skill|reskill|upskill|course|training|hrd\s*corp|mdec|myfuturejobs|"
    r"job|vacanc(?:y|ies)|role|career|work|working|profession|occupation|become|switch|transition|dream|"
    r"doctor|physician|nurse|healthcare|medical|lawyer|legal|engineer|developer|programmer|scientist|"
    r"teacher|educator|designer|accountant|auditor|marketer|copywriter|analyst|manager|pilot|architect|"
    r"nearby|near\s+me|location|gps|around\s+me|city|kuala\s+lumpur|kl|selangor|penang|johor|jb|cyberjaya|putrajaya|petaling|pj|subang|sunway|shah\s+alam|klang|ipoh|perak|melaka|malacca|seremban|sabah|sarawak|kuching|kuantan|kulim|kedah|puchong|kajang|bangi|cheras|"
    r"match|score|interview|question(?:naire)?|salary|rm|sdg|passport|trend|radar|ai|automation|"
    r"hr|employer|company|companies|category|sector|industry|candidate|screen(?:ing)?|heatmap|workforce|privacy|pdpa|apply|application|lumi|help|"+
    r"attrition|turnover|retention|overtime|edx|university|mit|harvard|onet|o\*net|displacement|2030|forecast|equity|fairness|gender\s+pay|upskilling|dataset|trained|"+
    r"compile|compilation|interpretation|algorithm|database|sql|python|java|api|oop|recursion|thread|deadlock|agile|scrum|devops|cloud|testing)\b",
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


def _build_live_context(user: dict | None, user_location: dict | None = None) -> dict:
    """Gather live database context for the current user (Job Seeker, Employer/HR, or Guest)."""
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

    loc = user_location or {}
    u_lat = loc.get("lat") or 3.1579
    u_lng = loc.get("lng") or 101.7116
    u_label = loc.get("label") or loc.get("city") or "Kuala Lumpur (KLCC)"
    if loc.get("city") and loc["city"] in hr_engine.CITY_COORDS:
        u_label = loc["city"]
        u_lat = hr_engine.CITY_COORDS[loc["city"]]["lat"]
        u_lng = hr_engine.CITY_COORDS[loc["city"]]["lng"]

    emp_vacs = hr_engine.list_open_vacancies_for_seeker(uid)
    js_nearby = job_index.search_nearby(
        candidate_uid=uid,
        lat=float(u_lat),
        lng=float(u_lng),
        radius_km=float(loc.get("radius") or 10.0),
        mode="matched",
        limit=10,
        employer_vacancies=emp_vacs,
    )
    return {
        "portal": "job_seeker",
        "user_name": user.get("full_name", "Talent"),
        "uid": uid,
        "cv_record": cv_rec,
        "profile": profile,
        "recommended_roles": match_res.get("recommended_roles", []),
        "verification_questions": match_res.get("verification_questions", []),
        "open_jobs": js_nearby["jobs"],
        "nearby_companies": js_nearby["dots"],
        "nearby_summary": js_nearby["summary"],
        "user_location": {"label": u_label, "lat": float(u_lat), "lng": float(u_lng)},
        "courses": courses,
    }


def get_quick_prompts(user: dict | None) -> list[dict]:
    """Return concise contextual quick-action chips for the chat widget."""
    if not user:
        return [
            {"label": "✨ How Lumi Helps", "prompt": "What can you help me with?"},
            {"label": "🔒 CV Privacy", "prompt": "How is my PDF CV protected?"},
            {"label": "📈 Emerging Skills", "prompt": "What are the fastest rising AI skills?"},
            {"label": "💼 Explore Careers", "prompt": "How do I find matching roles?"},
        ]
    if user.get("role") == "hr_company":
        return [
            {"label": "🏆 Top Candidates", "prompt": "Who are the top-matched candidates for my open vacancies?"},
            {"label": "📄 Submitted CVs", "prompt": "Which candidates applied and shared their PDF CV?"},
            {"label": "🔥 Team Skill Gaps", "prompt": "What is our biggest workforce skill gap on the heatmap?"},
            {"label": "📊 Retention Insights", "prompt": "What are the key workforce retention and attrition insights?"},
        ]
    return [
        {"label": "📍 Nearby Jobs", "prompt": "Are there any suitable jobs or companies nearby me based on my resume?"},
        {"label": "🎯 Role Matches", "prompt": "What is my #1 matched future role and missing skills?"},
        {"label": "🧭 Reskilling Plan", "prompt": "Recommend verified HRD Corp courses to close my skill gap."},
        {"label": "📄 CV Summary", "prompt": "Summarize my uploaded PDF CV and extracted skills."},
    ]


def _handle_career_aspiration(low: str, ctx: dict) -> dict | None:
    """Handle broad or cross-domain career goal questions (e.g., 'I want to become a doctor / lawyer / software engineer')."""
    aspiration_rx = re.search(
        r"(?:want\s+to\s+be(?:come)?|become\s+a|how\s+to\s+be(?:come)?|switch\s+to|interested\s+in\s+being\s+a|dream\s+job\s+is|career\s+as\s+a)\s+([a-zA-Z\s/&-]{3,35})",
        low,
    )
    # Also catch direct profession inquiries if user mentions regulated/broad careers
    regulated_map = {
        "doctor": ("Healthcare & Life Sciences", "Medical Doctor / Physician (MMC Regulated)", "Health Informatics & PDPA Analyst", "Requires an accredited MBBS/MD degree & clinical housemanship, **but** your current analytical/compliance skills transfer directly into **Digital Health & Medical Data Analytics** right now!"),
        "physician": ("Healthcare & Life Sciences", "Medical Doctor / Physician", "Health Informatics & PDPA Analyst", "Clinical practice requires an MBBS/MD degree, or you can pivot immediately into **Healthcare Informatics & Clinical Governance** using your existing data/risk skills."),
        "nurse": ("Healthcare & Life Sciences", "Registered Nurse / Clinical Care", "Health Informatics & PDPA Analyst", "Nursing requires a Nursing Diploma/Degree & Malaysian Nursing Board registration, or you can enter healthcare immediately via **Health Operations & PDPA Compliance**."),
        "lawyer": ("Finance & Accounting", "Advocate & Solicitor (Legal)", "AI Financial Compliance Analyst", "Practising law requires an LLB & CLP/Bar admission, **or** you can leverage your regulatory skills immediately in **AI Governance, PDPA & Financial Compliance**."),
        "pilot": ("Engineering & Manufacturing", "Commercial Airline Pilot (CAAM)", "Industrial AI Automation Engineer", "Requires a CAAM CPL/ATPL flight license, or you can explore **Aviation & Industrial Automation Engineering** roles."),
        "teacher": ("Education & EdTech", "Educator / AI Learning Designer", "AI Learning Experience Designer", "You can combine your domain expertise with **Prompt Engineering** to become an **AI Learning Experience Designer** in Malaysia's EdTech sector."),
        "lecturer": ("Education & EdTech", "Academic Lecturer / Corporate Trainer", "AI Learning Experience Designer", "Requires a Master's/PhD or HRD Corp TTT certification—your industry skills fit **EdTech & Corporate Upskilling**."),
        "data scientist": ("IT & Software", "Data Scientist / AI Analyst", "Full-Stack AI & RAG Developer", "Build **Python Data Analysis, SQL, and LLM/RAG** to transition from your current domain into applied Data & AI roles."),
        "software": ("IT & Software", "Software & AI Developer", "Software Developer", "Focus on **Python, SQL, REST APIs, and Git** to qualify for open Software & AI engineering roles."),
    }

    has_aspiration_verb = bool(aspiration_rx) or any(
        p in low for p in ("become", "want to be", "how to be", "switch to", "transition to", "career as", "dream job", "想当", "想成为", "转行")
    )
    if not has_aspiration_verb:
        return None

    matched_key = None
    for k in regulated_map:
        if re.search(rf"\b{k}\b", low):
            matched_key = k
            break

    prof = ctx.get("profile") or {}
    cur_role = prof.get("current_role", "your current role")
    cur_skills = ", ".join((prof.get("skills") or [])[:3]) or "your transferable skills"

    if matched_key:
        cat, formal_title, bridge_role, advice = regulated_map[matched_key]
        qa_m = lumi_knowledge.search_career_or_interview_qa(low, limit=1)
        qa_line = f"\n• **{qa_m[0]['source']}:** {qa_m[0]['a'][:200]}" if qa_m else ""
        reply = (
            f"🦉 **Career Path Check: {formal_title}**\n"
            f"• **Your Current Base:** {cur_role} ({cur_skills})\n"
            f"• **Pathway Advice:** {advice}\n"
            f"• **Recommended Bridge Role:** **{bridge_role}** ({cat})"
            + qa_line
        )
        return {
            "ok": True,
            "in_range": True,
            "reply": reply,
            "actions": [
                {"label": f"🏢 Explore {cat} Companies", "tab": "jobs", "category": cat},
                {"label": "🧭 View Reskilling Plan", "tab": "plan"},
            ],
            "mascot": MASCOT_PROFILE,
        }

    # Generic career aspiration extracted from regex + O*NET 29.0 + JobStreet 68.4k + AI Impact 2030
    goal = aspiration_rx.group(1).strip().title()
    insights = job_index.query_market_insights(query_text=goal)
    onet = lumi_knowledge.lookup_onet_occupation(goal)
    ai_imp = lumi_knowledge.lookup_ai_impact_and_displacement(goal).get("role_forecast")
    top_role = (ctx.get("recommended_roles") or [{}])[0]
    bridge = top_role.get("title", "AI Workflow & Compliance Specialist")
    top_sk = ", ".join((onet["hot_tech"][:3] if onet and onet.get("hot_tech") else []) + insights["top_skills"][:3]) or "Domain Analytics, SQL, Project Management"
    onet_line = f"\n• **O*NET ({onet['code']} — {onet['title']}):** Related paths: {', '.join(onet['related_careers'][:3])}" if onet and onet.get("related_careers") else ""
    ai_line = f" · 2030 Growth: **{ai_imp['growth_2024_2030_pct']:+.1f}%** (Auto Risk: {ai_imp['automation_risk_pct']}%)" if ai_imp else ""
    reply = (
        f"🦉 **Career Goal: {goal}** *(JobStreet MY: {insights['matching_openings']:,} openings{ai_line})*\n"
        f"• **Your Base:** {cur_role} ({cur_skills}) → Bridge Role: **{bridge}**\n"
        f"• **In-Demand Tech & Skills:** {top_sk}\n"
        f"• **MY Salary Benchmark:** **RM {insights['salary_p25']:,} – RM {insights['salary_p75']:,}/mo** (Median RM {insights['salary_median']:,})"
        + onet_line
    )
    return {
        "ok": True,
        "in_range": True,
        "reply": reply,
        "actions": [
            {"label": "💼 Search Jobs & Companies", "tab": "jobs"},
            {"label": "🧭 Open Reskilling Plan", "tab": "plan"},
        ],
        "mascot": MASCOT_PROFILE,
    }



def _get_gemini_key() -> tuple[str, str]:
    """Read GEMINI_API_KEY or GOOGLE_API_KEY from environment or .env file."""
    key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
    model = (os.getenv("LUMI_GEMINI_MODEL") or "gemini-2.5-flash").strip()
    if not key:
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        if os.path.exists(env_path):
            try:
                for line in open(env_path, encoding="utf-8").read().splitlines():
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip().strip('"').strip("'")
                        if k in ("GEMINI_API_KEY", "GOOGLE_API_KEY") and v:
                            key = v
                        elif k == "LUMI_GEMINI_MODEL" and v:
                            model = v
            except Exception:
                pass
    return key, model


def _enhance_with_gemini(user_msg: str, grounded_reply: str, ctx: dict) -> str:
    """If GEMINI_API_KEY is configured, use Gemini 2.5 Flash to polish/answer naturally using the 13-dataset facts."""
    api_key, model = _get_gemini_key()
    if not api_key:
        return grounded_reply
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    prof = ctx.get("profile") or {}
    prompt = (
        "You are Lumi 🦉, the cute, smart AI Owl Copilot for CareerLens AI Malaysia.\n"
        "Rules:\n"
        "1. Reply in the SAME language as the user (English, Chinese, or Bahasa/Manglish).\n"
        "2. Keep it concise (max 3-4 short bullet points, start with 🦉).\n"
        "3. Strictly preserve the exact numbers, company names, salaries, and facts from the GROUNDED DATASET FACTS below.\n\n"
        f"User Profile: {prof.get('current_role', '')} in {prof.get('industry', '')}, Skills: {', '.join((prof.get('skills') or [])[:6])}\n"
        f"User Message: {user_msg}\n"
        f"GROUNDED DATASET FACTS:\n{grounded_reply}"
    )
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.25, "maxOutputTokens": 280},
    }).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=4.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            cand_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            if cand_text:
                return cand_text
    except Exception:
        pass
    return grounded_reply


def _generate_lumi_core(message: str, user: dict | None = None, history: list | None = None,
                           user_location: dict | None = None) -> dict:
    """Process a user message through Lumi's Concise Domain Guardrail + Live Tool Engine."""
    history = history or []
    clean_msg = (message or "").strip()

    allowed, blocked_topic = check_domain_guardrail(clean_msg)
    if not allowed:
        if blocked_topic == "empty message":
            return {
                "ok": False, "in_range": False,
                "reply": "🦉 Hoot! Ask me about your CV, nearby jobs, career goals, courses, or HR screening.",
                "actions": [], "mascot": MASCOT_PROFILE,
            }
        return {
            "ok": True,
            "in_range": False,
            "guardrail_triggered": True,
            "blocked_topic": blocked_topic,
            "reply": (
                f"I specialize in career advisory, job matching, skill development, and workforce planning, so I am unable to assist with **{blocked_topic}**.\n\n"
                f"How may I help you with your career goals, CV profile, or nearby job opportunities today?"
            ),
            "actions": [
                {"label": "📍 Nearby Jobs", "prompt": "Are there any suitable jobs nearby me based on my resume?"},
                {"label": "🎯 Role Matches", "prompt": "What is my #1 matched future role and missing skills?"},
            ],
            "mascot": MASCOT_PROFILE,
        }

    ctx = _build_live_context(user, user_location=user_location)
    low = clean_msg.lower()
    portal = ctx["portal"]

    # ------------------------------------------------------------------
    # EMPLOYER / HR PORTAL INTENTS (Concise + Direct Action Buttons)
    # ------------------------------------------------------------------
    if portal == "hr_company":
        vacs = ctx.get("vacancies") or []
        heat = ctx.get("heatmap") or {}
        top_scr = ctx.get("top_screen") or {}

        if any(k in low for k in ("applied", "applicant", "pdf", "shared", "cv")):
            results = (top_scr.get("results") or [])
            applied = [r for r in results if r.get("is_applied_user")]
            if applied:
                lines = [
                    f"• **{a['name']}** (`{a['application_uid']}`) — **{a['score']}% match** "
                    f"({'✓ Organised CV' if a['share_organised_cv'] else ''}{' + ✓ PDF' if a['share_original_pdf'] else ' · 🔒 No PDF'})"
                    for a in applied
                ]
                reply = f"🦉 **Applicants who shared their CV ({len(applied)}):**\n" + "\n".join(lines)
            else:
                reply = "🦉 **No direct PDF CV applicants yet.** CVs stay private until a candidate applies to your vacancy."
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [{"label": "🔍 Open Candidate Screening", "tab": "screening"}],
                "mascot": MASCOT_PROFILE,
            }

        if any(k in low for k in ("candidate", "screen", "top", "vacanc", "hire", "shortlist", "match")):
            if not vacs:
                return {
                    "ok": True, "in_range": True,
                    "reply": "🦉 No open vacancies yet. Create one to start fair candidate screening!",
                    "actions": [{"label": "📋 Create Job Vacancy", "tab": "vacancies"}],
                    "mascot": MASCOT_PROFILE,
                }
            v = top_scr["vacancy"]
            top3 = (top_scr.get("results") or [])[:3]
            bullets = [f"{i+1}. **{c['name']}** — **{c['score']}%** (*{c['action']}*)" for i, c in enumerate(top3)]
            reply = f"🦉 **Top Matches for {v['title']} (`{v['vacancy_uid']}`):**\n" + "\n".join(bullets)
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🔍 Screen Candidates", "tab": "screening"},
                    {"label": "📋 Job Vacancies", "tab": "vacancies"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        if any(k in low for k in ("attrition", "turnover", "retention", "overtime", "leave", "quit", "factory", "pay gap", "equity", "fairness")):
            hr_data = lumi_knowledge.lookup_hr_and_workforce_analytics()
            ibm = hr_data.get("ibm_hr") or {}
            depts = ibm.get("by_department") or {}
            dept_lines = [
                f"• **{d}:** {v['attrition_rate_pct']}% attrition (Overtime attrition: **{v['overtime_attrition_rate_pct']}%** · Avg training: {v['avg_training_sessions_yr']}/yr)"
                for d, v in list(depts.items())[:3]
            ]
            reply = (
                f"🦉 **HR Attrition & Retention Benchmarks :**\n"
                f"• **Overall Baseline Attrition:** **{ibm.get('overall_attrition_rate_pct', 16.1)}%** across {ibm.get('total_employees_analyzed', 1470):,} employees\n"
                + "\n".join(dept_lines)
                + "\n• **Fairness Guardrail:** Gender, age & race are stripped from screening to eliminate historical wage/hiring bias."
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🔥 Skills Heatmap", "tab": "heatmap"},
                    {"label": "🎓 Approve Reskilling", "tab": "reskill"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        if any(k in low for k in ("heatmap", "gap", "team", "workforce", "reskill", "train", "employee", "readiness")):
            summary = sorted(heat.get("skill_summary") or [], key=lambda s: s["coverage"])
            worst = summary[0] if summary else {"skill": "AI Risk & Compliance", "coverage": 25, "below_target": 6}
            reply = (
                f"🦉 **Workforce Heatmap ({ctx['company_name']}):**\n"
                f"• **Team Readiness:** **{heat.get('team_readiness', 0)}%**\n"
                f"• **Biggest Gap:** **{worst['skill']}** ({worst['coverage']}% coverage · {worst['below_target']} staff below target)\n"
                f"• **Approved Courses:** {len(ctx.get('assignments') or [])}"
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🔥 Skills Heatmap", "tab": "heatmap"},
                    {"label": "🎓 Approve Reskilling", "tab": "reskill"},
                ],
                "mascot": MASCOT_PROFILE,
            }

    # ------------------------------------------------------------------
    # TALENT / JOB SEEKER PORTAL INTENTS (Concise + Direct Action Buttons)
    # ------------------------------------------------------------------
    if portal == "job_seeker":
        cv_rec = ctx.get("cv_record")
        roles = ctx.get("recommended_roles") or []
        jobs = ctx.get("open_jobs") or []
        companies = ctx.get("nearby_companies") or []
        loc_info = ctx.get("user_location") or {"label": "Kuala Lumpur"}
        top_role = roles[0] if roles else None

        # Intent T0: Broad / Cross-Field Career Aspirations ("I want to become a doctor / lawyer / etc.")
        asp_res = _handle_career_aspiration(low, ctx)
        if asp_res:
            return asp_res

        # Intent T1: Smart Location / City / Radius Circle Job Search (understands Johor, Penang, Ipoh, PJ, KL, etc.)
        explicit_loc = job_index.resolve_location_from_text(clean_msg)
        is_loc_intent = bool(explicit_loc) or any(
            k in low for k in ("nearby", "near me", "around me", "near ", "location", "gps", "close to", "suitable job", "company near", "companies near", "km", "radius", "附近")
        )
        if is_loc_intent and not any(k in low for k in ("salary", "pay", "course", "edx", "interview", "attrition", "2030", "replace")):
            target_loc = explicit_loc or {
                "label": loc_info.get("label", "Kuala Lumpur (KLCC)"),
                "lat": loc_info.get("lat", 3.1579),
                "lng": loc_info.get("lng", 101.7116),
                "city": loc_info.get("city", ""),
                "default_km": 10,
            }
            km_match = re.search(r"(\d{1,3})\s*km", low)
            req_km = float(km_match.group(1)) if km_match else float(target_loc.get("default_km") or 15)

            # Extract optional role/skill filter if user asked e.g. "software jobs nearby johor"
            role_filter = re.sub(
                r"\b(the|jobs?|vacanc(?:y|ies)|roles?|openings?|work|company|companies|hiring|nearby|near|around|in|at|to|me|my|resume|cv|based|on|suitable|any|find|show|within|radius|\d+\s*km|johor|bahru|jb|penang|george\s*town|bayan\s*lepas|ipoh|perak|melaka|malacca|seremban|sabah|sarawak|kuching|kuantan|kulim|kedah|cyberjaya|putrajaya|subang|sunway|shah\s*alam|klang|petaling\s*jaya|pj|puchong|kajang|bangi|cheras|kuala\s*lumpur|klcc|kl|selangor)\b",
                " ",
                low,
            )
            role_filter = re.sub(r"[^a-z0-9+#\s]", " ", role_filter)
            role_filter = re.sub(r"\s+", " ", role_filter).strip()
            search_mode = "all" if role_filter else "matched"

            live = job_index.search_nearby(
                candidate_uid=ctx.get("uid", ""),
                lat=target_loc["lat"],
                lng=target_loc["lng"],
                radius_km=req_km,
                mode=search_mode,
                query=role_filter,
                limit=4,
            )
            # If matched mode had 0 hits in a smaller town, fall back to all roles in range
            if not live["jobs"] and search_mode == "matched":
                live = job_index.search_nearby(
                    candidate_uid=ctx.get("uid", ""),
                    lat=target_loc["lat"],
                    lng=target_loc["lng"],
                    radius_km=req_km,
                    mode="all",
                    query=role_filter,
                    limit=4,
                )
            summ = live["summary"]
            top_dots = live["dots"][:2]
            top_jobs = []
            seen_tc = set()
            for j in live["jobs"]:
                tc = (j["title"].lower(), j["company_name"].lower())
                if tc not in seen_tc:
                    seen_tc.add(tc)
                    top_jobs.append(j)
                if len(top_jobs) >= 3:
                    break
            comp_lines = [
                f"• 🟢 **{c['name']}** (*{c['category']}*) — **{c['distance_km']} km** · {c['jobs']} open role(s)"
                for c in top_dots
            ]
            job_lines = [
                f"• 💼 **{j['title']}** ({j['company_name']}) — **{j.get('match_score') or 0}% CV fit** · {j.get('distance_km', 0)} km"
                + (f" · RM {j['salary_min']:,}–{j['salary_max']:,}" if j.get("salary_min") else "")
                for j in top_jobs
            ]
            filter_tag = f" matching **'{role_filter}'**" if role_filter else ""
            reply = (
                f"🦉 **Jobs within {int(req_km)} km of {target_loc['label']}{filter_tag}:** "
                f"**{summ['matched_in_range']:,} CV-matched roles** (out of **{summ['jobs_in_range']:,}** total openings across **{summ['companies_on_map']:,}** companies)\n"
                + ("\n".join(comp_lines + job_lines) if (comp_lines or job_lines) else "• Try expanding the radius slider to 35–50 km on the map.")
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {
                        "label": f"🗺️ Fly Map to {target_loc['label']} ({int(req_km)}km)",
                        "tab": "jobs",
                        "lat": target_loc["lat"],
                        "lng": target_loc["lng"],
                        "label_loc": target_loc["label"],
                        "city": target_loc.get("city", ""),
                        "radius": int(req_km),
                        "query": role_filter,
                    },
                    {"label": "📄 My PDF CV", "tab": "profile"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T1b: Malaysian Salary & Market Demand Benchmarks (trained on 68.4k JobStreet postings)
        if any(k in low for k in ("salary", "pay", "compensation", "wage", "how much", "market demand")):
            role_q = re.sub(r"\b(what|is|the|salary|pay|for|a|an|in|malaysia|average|monthly|how|much|does|earn|make)\b", " ", low)
            role_q = re.sub(r"\s+", " ", role_q).strip() or (ctx.get("profile") or {}).get("current_role", "")
            ins = job_index.query_market_insights(query_text=role_q)
            reply = (
                f"🦉 **Malaysia Market Benchmark ({role_q.title() or 'All Sectors'}):**\n"
                f"• **Monthly Salary Range:** **RM {ins['salary_p25']:,} – RM {ins['salary_p75']:,}** (Median **RM {ins['salary_median']:,}** )\n"
                f"• **Active Openings:** **{ins['matching_openings']:,} jobs** · Top Skills: {', '.join(ins['top_skills'][:4])}"
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "💼 Browse Matching Jobs", "tab": "jobs"},
                    {"label": "🧭 Upskill for Higher Pay", "tab": "plan"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T2: PDF CV Summary / Extracted Skills
        if any(k in low for k in ("my cv", "pdf", "summarize", "summarise", "extracted", "upload", "cv summary")):
            if not cv_rec:
                return {
                    "ok": True, "in_range": True,
                    "reply": "**No CV Uploaded Yet**\nPlease upload your PDF CV under **Profile & Skills** so I can summarize your experience and match you with relevant roles.",
                    "actions": [{"label": "📄 Upload CV", "tab": "profile"}],
                    "mascot": MASCOT_PROFILE,
                }
            st = cv_rec["structured_cv"]
            top_match_line = f"\n• **Top Recommended Path:** {top_role['title']} ({top_role['match_score']}% alignment)" if top_role else ""
            reply = (
                f"**CV Profile Summary (`{cv_rec['original_filename']}`)**\n"
                f"• **Current Role:** {st.get('current_role')} · {st.get('industry')} ({st.get('years_experience')} yrs experience)\n"
                f"• **Key Skills ({len(st.get('skills', []))}):** {', '.join(st.get('skills', [])[:6])}"
                + top_match_line +
                f"\n• **Application Privacy:** Shared with **{len(cv_rec.get('access_logs', []))}** employer(s)."
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "📄 View CV Profile", "tab": "profile"},
                    {"label": "💼 Explore Nearby Jobs", "tab": "jobs"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T3: Privacy / PDPA / Who viewed my CV
        if any(k in low for k in ("privacy", "pdpa", "who viewed", "access", "shared", "protect", "safe")):
            logs = (cv_rec or {}).get("access_logs") or []
            applied_jobs = [j for j in jobs if (j.get("application") or {}).get("applied")]
            reply = (
                f"🦉 **PDPA Privacy Status:**\n"
                f"• **Default:** Used *only* for anonymised trend stats & personal matching.\n"
                f"• **Employer Access:** Unlocked for **{len(applied_jobs)}** applied job(s) · **{len(logs)}** audited HR view(s)."
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🔒 View Access Audit Log", "tab": "profile"},
                    {"label": "💼 Manage Applications", "tab": "jobs"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T4: Reskilling Courses / EdX University Catalog / Upskilling ROI
        if any(k in low for k in ("course", "reskill", "upskill", "learn", "plan", "hrd", "mdec", "myfuturejobs", "pathway", "hour", "edx", "university", "certificate")):
            edx_list = lumi_knowledge.search_edx_courses(
                clean_msg,
                fallback_skills=((top_role or {}).get("skills_gap") or ["Python", "Data Analysis"]),
                limit=2,
            )
            roi = lumi_knowledge.lookup_upskilling_roi()
            roi_types = list((roi.get("by_upskilling_type") or {}).items())
            roi_line = ""
            if roi_types:
                t_name, t_stat = roi_types[0]
                roi_line = f"\n• 📈 **Upskilling ROI :** AI upskilling yields **{t_stat['hiring_success_rate_pct']}% hiring success** & **+{t_stat['avg_salary_hike_pct']}% avg salary hike**."
            steps = []
            if top_role and top_role.get("ordered_pathway"):
                steps = [
                    f"• 🇲🇾 **{s['target_skill']}** → *{s['course_title']}* ({s['hours']}h · `{s['malaysia_badge']}`)"
                    for s in top_role["ordered_pathway"][:2]
                ]
            edx_lines = [
                f"• 🎓 **EdX ({c['provider']}):** *{c['title']}* ({c['level']})"
                for c in edx_list
            ]
            reply = (
                f"🦉 **Recommended Reskilling & University Courses:**\n"
                + "\n".join(steps + edx_lines)
                + roi_line
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🧭 Open Reskilling Plan", "tab": "plan"},
                    {"label": "🌱 SDG Passport", "tab": "passport"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T5: Best Future-Role Match / Skill Gaps
        if any(k in low for k in ("match", "future role", "best role", "missing", "gap", "score", "#1")):
            if not top_role:
                return {
                    "ok": True, "in_range": True,
                    "reply": "🦉 Upload your PDF CV first to calculate your explainable match scores!",
                    "actions": [{"label": "📄 Upload PDF CV", "tab": "profile"}],
                    "mascot": MASCOT_PROFILE,
                }
            reply = (
                f"🦉 **#1 Future-Role Match: {top_role['title']} ({top_role['match_score']}%)**\n"
                f"• **Matched:** {', '.join(top_role['matched_core_skills'][:4]) or 'Transferable base'}\n"
                f"• **Skills Gap ({len(top_role['skills_gap'])}):** {', '.join(top_role['skills_gap']) or 'None!'}"
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "🎯 View Role Matches", "tab": "match"},
                    {"label": "🧭 Open Reskilling Plan", "tab": "plan"},
                ],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T6: Open Company Job Vacancies / Apply
        if any(k in low for k in ("open company", "vacanc", "apply", "hiring", "company job", "jobs", "work")):
            rel_jobs = [j for j in jobs if j.get("is_relevant_to_cv")][:3] or jobs[:3]
            lines = [
                f"• **{j['title']}** (*{j['company_name']}*) — **{j.get('match_score') or 0}% match** · RM {j['salary_min']:,}–{j['salary_max']:,}"
                for j in rel_jobs
            ]
            reply = "🦉 **Top Open Jobs Relevant to Your CV:**\n" + "\n".join(lines)
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [{"label": "💼 Browse & Apply Jobs", "tab": "jobs"}],
                "mascot": MASCOT_PROFILE,
            }

        # Intent T7: Interview Q&A + Career QA Dataset (1,620 Career Q&A + 200 Software Engineering Q&A)
        qa_hits = lumi_knowledge.search_career_or_interview_qa(clean_msg, limit=2)
        if qa_hits or any(k in low for k in ("interview", "question", "verify", "prepare", "quiz")):
            if qa_hits:
                lines = [
                    f"• **{h['source']}:** *{h['q']}*\n  → {h['a']}"
                    for h in qa_hits
                ]
                reply = "🦉 **Career & Interview Preparation Guidance:**\n" + "\n".join(lines)
            else:
                vqs = ctx.get("verification_questions") or []
                se_sample = (lumi_knowledge.load_brain().get("se_interview_qa") or [{}])[0]
                q_lines = [f"• **{q['skill_tested']}:** _{q['question']}_" for q in vqs[:2]]
                if se_sample.get("q"):
                    q_lines.append(f"• **Tech Q&A ({se_sample.get('category')}):** _{se_sample['q']}_ → {se_sample['a'][:140]}...")
                reply = "🦉 **Practice Interview & Verification Questions:**\n" + "\n".join(q_lines)
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [{"label": "📝 Open Questionnaire", "tab": "quest"}],
                "mascot": MASCOT_PROFILE,
            }

    # ------------------------------------------------------------------
    # SHARED INTENTS (13-Dataset Brain, AI Trends 2024-2030, O*NET, SDG 4 & 8)
    # ------------------------------------------------------------------
    if any(k in low for k in ("dataset", "trained", "knowledge base", "what can you do", "what can lumi do")):
        bs = lumi_knowledge.brain_summary()
        st = bs.get("stats") or {}
        reply = (
            f"🦉 **Lumi AI is trained on {bs['datasets_count']} real-world datasets (210,000+ records):**\n"
            f"• 🇲🇾 **JobStreet MY:** {st.get('jobstreet_malaysia_jobs', 68447):,} jobs & {st.get('jobstreet_malaysia_companies', 20514):,} companies\n"
            f"• 🌐 **O*NET 29.0 & Resumes:** {st.get('onet_occupations', 1016):,} occupations, {st.get('onet_tech_skills_rows', 32470):,} tech skills & {st.get('updated_resumes_count', 962)} CVs\n"
            f"• 🎓 **Courses & Q&A:** {st.get('edx_courses_total', 720)} EdX university courses, {st.get('career_qa_pairs', 1620):,} Career Q&A & {st.get('se_interview_questions', 200)} SE Interview Q&A\n"
            f"• 📊 **AI 2030 & HR Analytics:** {st.get('ai_job_trends_rows', 30000):,} AI 2030 forecasts, {st.get('ai_displacement_rows', 20800):,} displacement records, IBM HR, Factory & Pay Equity"
        )
        actions = [{"label": "📍 Explore 68.4k Jobs Map", "tab": "jobs"}, {"label": "📡 Open AI Radar", "tab": "radar"}] if portal == "job_seeker" else [{"label": "🔥 Skills Heatmap", "tab": "heatmap"}]
        return {"ok": True, "in_range": True, "reply": reply, "actions": actions, "mascot": MASCOT_PROFILE}

    if any(k in low for k in ("trend", "radar", "rising", "emerging", "declining", "automation", "displacement", "2030", "replace", "ai impact")):
        radar = get_trend_radar("moderate")
        imp = lumi_knowledge.lookup_ai_impact_and_displacement(clean_msg)
        rf = imp.get("role_forecast")
        sd = imp.get("sector_displacement")
        rising = [f"• **{s['skill']}** (+{s['growth_pct']}% · {s['sdg']})" for s in radar["emerging_skills"][:2]]
        if rf:
            rising.append(f"• **2024–2030 Forecast ({rf['title']}):** Openings **{rf['growth_2024_2030_pct']:+.1f}%** · Automation Risk **{rf['automation_risk_pct']}%** · Remote **{rf['remote_ratio_pct']}%**")
        if sd:
            rising.append(f"• **Sector Shift ({sd['sector']}):** **{sd['workforce_displaced_pct']}%** displaced vs **+{sd['new_roles_created_pct']}%** new AI roles created")
        reply = "🦉 **AI Workforce Impact & 2024–2030 Forecast :**\n" + "\n".join(rising)
        actions = [{"label": "📡 Open AI Radar", "tab": "radar"}, {"label": "🧭 Reskilling Plan", "tab": "plan"}] if portal == "job_seeker" else []
        return {"ok": True, "in_range": True, "reply": reply, "actions": actions, "mascot": MASCOT_PROFILE}

    onet_hit = lumi_knowledge.lookup_onet_occupation(clean_msg)
    if onet_hit:
        reply = (
            f"🦉 **O*NET Occupation Profile: {onet_hit['title']} (`{onet_hit['code']}`)**\n"
            f"• **Summary:** {onet_hit['description']}\n"
            f"• **Hot Technology Skills:** {', '.join(onet_hit['hot_tech']) or 'Domain tools'}\n"
            f"• **Related Career Paths:** {', '.join(onet_hit['related_careers']) or 'Adjacent specialist roles'}"
        )
        actions = [{"label": "💼 Find Matching Jobs", "tab": "jobs"}] if portal == "job_seeker" else []
        return {"ok": True, "in_range": True, "reply": reply, "actions": actions, "mascot": MASCOT_PROFILE}

    if any(k in low for k in ("sdg", "sustainable", "impact", "passport")):
        reply = (
            "🦉 **SDG Impact Alignment:**\n"
            "• **SDG 4.4:** Verifiable technical & AI reskilling (HRD Corp / MDEC).\n"
            "• **SDG 8.2 & 8.5:** Protects workers from AI displacement into higher-value roles."
        )
        actions = [{"label": "🌱 Open SDG Passport", "tab": "passport"}] if portal == "job_seeker" else [{"label": "🎓 Reskilling SDG Impact", "tab": "reskill"}]
        return {"ok": True, "in_range": True, "reply": reply, "actions": actions, "mascot": MASCOT_PROFILE}

    # Default short, action-oriented response
    if portal == "hr_company":
        return {
            "ok": True, "in_range": True,
            "reply": (
                f"🦉 **Hi {ctx['user_name']}!** Ask me about **top screened candidates**, **applied PDF CVs**, or **team skill gaps**—or jump straight to a section below:"
            ),
            "actions": [
                {"label": "🔍 Screen Candidates", "tab": "screening"},
                {"label": "🔥 Skills Heatmap", "tab": "heatmap"},
                {"label": "📋 Job Vacancies", "tab": "vacancies"},
            ],
            "mascot": MASCOT_PROFILE,
        }
    if portal == "job_seeker":
        return {
            "ok": True, "in_range": True,
            "reply": (
                f"🦉 **Hi {ctx['user_name']}!** Ask me about **nearby jobs for your CV**, **career goals**, **role matches**, or **courses**:"
            ),
            "actions": [
                {"label": "📍 Nearby Jobs & Companies", "tab": "jobs"},
                {"label": "🎯 Role Matches", "tab": "match"},
                {"label": "🧭 Reskilling Plan", "tab": "plan"},
                {"label": "📄 PDF CV Vault", "tab": "profile"},
            ],
            "mascot": MASCOT_PROFILE,
        }

    return {
        "ok": True, "in_range": True,
        "reply": "🦉 **Hi! I'm Lumi.** I help Job Seekers with **private PDF CVs, nearby job matching & reskilling**, and Employers with **fair screening & skill heatmaps**.",
        "actions": [],
        "mascot": MASCOT_PROFILE,
    }


def generate_lumi_response(message: str, user: dict | None = None, history: list | None = None,
                           user_location: dict | None = None) -> dict:
    """Run Lumi's 13-dataset NLU + RAG engine and optionally polish with Gemini 2.5 Flash if GEMINI_API_KEY is set."""
    res = _generate_lumi_core(message, user=user, history=history, user_location=user_location)
    if res.get("ok") and res.get("in_range") and res.get("reply"):
        ctx = _build_live_context(user, user_location=user_location)
        res["reply"] = _enhance_with_gemini(message, res["reply"], ctx)
    return res
