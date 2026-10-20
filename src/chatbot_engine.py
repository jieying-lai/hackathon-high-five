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
    "title": "CareerLens AI Owl Copilot",
    "avatar": "/static/brand/lumi_mascot.svg",
    "scope_badge": "Trained on 13 Career, O*NET, JobStreet MY, EdX & HR Datasets (210k+ Records)",
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
    r"nearby|near\s+me|location|gps|around\s+me|city|kuala\s+lumpur|selangor|penang|johor|cyberjaya|petaling|"
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
            {"label": "🦉 What can Lumi do?", "prompt": "What can you help me with?"},
            {"label": "🔒 PDF CV Privacy", "prompt": "How is my PDF CV protected?"},
            {"label": "📈 Rising AI Skills", "prompt": "What are the fastest rising AI skills?"},
        ]
    if user.get("role") == "hr_company":
        return [
            {"label": "🏆 Top candidates", "prompt": "Who are the top-matched candidates for my open vacancies?"},
            {"label": "📄 Applied PDF CVs", "prompt": "Which candidates applied and shared their PDF CV?"},
            {"label": "🔥 Biggest team gap", "prompt": "What is our biggest workforce skill gap on the heatmap?"},
        ]
    return [
        {"label": "📍 Nearby jobs for me", "prompt": "Are there any suitable jobs or companies nearby me based on my resume?"},
        {"label": "🎯 My #1 role match", "prompt": "What is my #1 matched future role and missing skills?"},
        {"label": "🧭 Reskilling courses", "prompt": "Recommend verified HRD Corp courses to close my skill gap."},
        {"label": "📄 My PDF CV summary", "prompt": "Summarize my uploaded PDF CV and extracted skills."},
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

    matched_key = None
    target_phrase = ""
    for k in regulated_map:
        if re.search(rf"\b{k}\b", low):
            matched_key = k
            target_phrase = k
            break

    if not matched_key and not aspiration_rx:
        return None

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


def generate_lumi_response(message: str, user: dict | None = None, history: list | None = None,
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
                f"🦉 **Outside my scope ({blocked_topic}).**\n"
                f"I'm **Lumi**, trained strictly for **CareerLens AI** (CV analysis, career paths, nearby jobs, reskilling & HR screening)."
            ),
            "actions": [
                {"label": "📍 Nearby Jobs for My CV", "prompt": "Are there any suitable jobs nearby me based on my resume?"},
                {"label": "🎯 My #1 Role Match", "prompt": "What is my #1 matched future role and missing skills?"},
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
                f"🦉 **HR Attrition & Retention Benchmarks (IBM HR + Factory + Pay Equity Datasets):**\n"
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

        # Intent T1: Nearby / Location / Radius Circle Jobs & Companies (68,447 JobStreet MY dataset)
        if any(k in low for k in ("nearby", "near me", "around me", "location", "gps", "close to me", "suitable job", "company near", "companies near", "km", "radius")):
            km_match = re.search(r"(\d{1,3})\s*km", low)
            req_km = float(km_match.group(1)) if km_match else 10.0
            live = job_index.search_nearby(
                candidate_uid=ctx.get("uid", ""),
                lat=loc_info.get("lat", 3.1579),
                lng=loc_info.get("lng", 101.7116),
                radius_km=req_km,
                mode="matched",
                limit=3,
            )
            summ = live["summary"]
            top_dots = live["dots"][:2]
            top_jobs = live["jobs"][:2]
            comp_lines = [
                f"• 🟢 **{c['name']}** (*{c['category']}*) — **{c['distance_km']} km** · {c['matched']} matched role(s) ({c['best_score']}% fit)"
                for c in top_dots
            ]
            job_lines = [
                f"• 💼 **{j['title']}** ({j['company_name']}) — **{j.get('match_score') or 0}% match** · {j.get('distance_km', 0)} km"
                for j in top_jobs
            ]
            reply = (
                f"🦉 **Within {int(req_km)} km of {loc_info['label']}:** **{summ['matched_in_range']:,} CV-matched roles** (out of {summ['jobs_in_range']:,} total jobs across {summ['companies_on_map']:,} companies)\n"
                + "\n".join(comp_lines + job_lines)
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": f"🗺️ View {int(req_km)}km Radius Map", "tab": "jobs"},
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
                f"• **Monthly Salary Range:** **RM {ins['salary_p25']:,} – RM {ins['salary_p75']:,}** (Median **RM {ins['salary_median']:,}** · {ins['salary_sample_size']:,} dataset records)\n"
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
        if any(k in low for k in ("my cv", "pdf", "summarize", "summarise", "extracted", "upload")):
            if not cv_rec:
                return {
                    "ok": True, "in_range": True,
                    "reply": "🦉 **No PDF CV uploaded yet.** Upload your `.pdf` CV in **PDF CV & Summary** for instant AI extraction.",
                    "actions": [{"label": "📄 Upload PDF CV", "tab": "profile"}],
                    "mascot": MASCOT_PROFILE,
                }
            st = cv_rec["structured_cv"]
            bench = lumi_knowledge.lookup_resume_category_benchmark(st.get("current_role") or st.get("industry") or "")
            bench_line = f"\n• **962-CV Dataset Benchmark ({bench['category']}):** Top peer skills include {', '.join(bench['top_skills'][:5])}" if bench else ""
            reply = (
                f"🦉 **PDF CV Summary (`{cv_rec['original_filename']}`):**\n"
                f"• **Role:** {st.get('current_role')} · {st.get('industry')} ({st.get('years_experience')} yr)\n"
                f"• **Top Skills ({len(st.get('skills', []))}):** {', '.join(st.get('skills', [])[:6])}"
                + bench_line +
                f"\n• **Privacy:** Viewed by **{len(cv_rec.get('access_logs', []))}** employer(s)."
            )
            return {
                "ok": True, "in_range": True, "reply": reply,
                "actions": [
                    {"label": "📄 Open PDF CV Vault", "tab": "profile"},
                    {"label": "💼 Apply to Jobs", "tab": "jobs"},
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
                roi_line = f"\n• 📈 **Upskilling ROI (3,000-worker dataset):** AI upskilling yields **{t_stat['hiring_success_rate_pct']}% hiring success** & **+{t_stat['avg_salary_hike_pct']}% avg salary hike**."
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
                reply = "🦉 **Trained Career & Interview Q&A Knowledge Base:**\n" + "\n".join(lines)
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
        reply = "🦉 **AI Workforce Impact & 2024–2030 Forecast (50,800-record dataset):**\n" + "\n".join(rising)
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
