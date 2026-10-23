"""Multi-Dataset Knowledge & Retrieval Engine for Lumi AI (`lumi_trained_brain.json.gz`).

Trained on all 13 datasets from C:\\Users\\April\\Downloads\\dataset:
  1. Entry Level Career QA Dataset
  2. Software Engineering Interview Questions Dataset
  3. EdX University Courses Dataset 2021
  4. AI Impact on Job Market (2024–2030)
  5. AI Workforce Displacement Global (2020–2026)
  6. Employee Upskilling & Hiring Success Dataset
  7. IBM HR Analytics Employee Attrition & Performance
  8. Factory Workers' Daily Performance & Attrition
  9. Gender Pay Gap & Wage Equity Dataset (CPS/PSID)
  10. O*NET 29.0 Database & Occupation Data (1,016 occupations, hot tech, emerging tasks, career changers)
  11. Updated Resume Dataset (962 resumes across 25 categories)
  12. JobStreet Malaysia All Job Dataset (68,447 jobs, 20,514 companies via job_index.py)
  13. MoinDalvs Resume Screening & Parser Lexicon (1,237 skills, 174 majors, 5 competency pillars)
"""

import gzip
import json
import os
import re
import threading

from auth_db import DATA_DIR

BRAIN_PATH = os.path.join(DATA_DIR, "lumi_trained_brain.json.gz")
_LOCK = threading.Lock()
_BRAIN = None

_STOP = {
    "what", "is", "are", "the", "a", "an", "in", "of", "for", "to", "and", "or", "how", "do", "does",
    "can", "i", "my", "me", "you", "tell", "about", "explain", "difference", "between", "why", "when",
    "should", "would", "could", "with", "on", "at", "by", "from", "as", "be", "become", "job", "role",
    "career", "work", "working", "need", "skills", "skill", "question", "questions", "interview",
    "recommend", "course", "courses", "edx", "university", "upskilling", "reskilling", "roi", "certificate",
}


def _tokens(text: str) -> set[str]:
    return {t for t in re.findall(r"[a-z][a-z0-9+#.]{1,}", (text or "").lower()) if t not in _STOP}


def load_brain() -> dict:
    global _BRAIN
    if _BRAIN is None:
        with _LOCK:
            if _BRAIN is None:
                if not os.path.exists(BRAIN_PATH):
                    _BRAIN = {"datasets_trained": [], "stats": {}}
                    return _BRAIN
                with gzip.open(BRAIN_PATH, "rt", encoding="utf-8") as f:
                    data = json.load(f)
                # Pre-tokenize Q&A and O*NET titles for instant retrieval
                for item in data.get("career_qa", []):
                    item["_toks"] = _tokens(f"{item['role']} {item['q']}")
                for item in data.get("se_interview_qa", []):
                    item["_toks"] = _tokens(f"{item['category']} {item['q']}")
                for occ in data.get("onet_occupations", []):
                    occ["_toks"] = _tokens(f"{occ['title']} {' '.join(occ.get('hot_tech', []))} {' '.join(occ.get('core_skills', []))}")
                for c in data.get("edx_courses", []):
                    c["_toks"] = _tokens(f"{c['title']} {c['about']} {' '.join(c.get('skills', []))}")
                _BRAIN = data
    return _BRAIN


def brain_summary() -> dict:
    b = load_brain()
    return {
        "datasets_count": len(b.get("datasets_trained", [])),
        "datasets_trained": b.get("datasets_trained", []),
        "stats": b.get("stats", {}),
    }


def search_career_or_interview_qa(query: str, limit: int = 2) -> list[dict]:
    """Retrieve best-matching Q&A pairs from Career QA Dataset + Software Engineering Interview Dataset."""
    b = load_brain()
    q_toks = _tokens(query)
    if not q_toks:
        return []
    low = query.lower()
    scored = []
    for item in b.get("career_qa", []):
        overlap = len(q_toks & item["_toks"])
        if item["role"].lower() in low:
            overlap += 3
        if overlap >= 2:
            scored.append((overlap, {"source": f"Career Q&A ({item['role']})", "q": item["q"], "a": item["a"]}))
    for item in b.get("se_interview_qa", []):
        overlap = len(q_toks & item["_toks"])
        if item["category"].lower() in low:
            overlap += 2
        if overlap >= 2:
            scored.append((overlap, {
                "source": f"Tech Interview Q&A ({item['category']} · {item['difficulty']})",
                "q": item["q"],
                "a": item["a"],
            }))
    scored.sort(key=lambda x: -x[0])
    return [x[1] for x in scored[:limit]]


def search_edx_courses(query_or_skills: str | list[str], fallback_skills: list[str] | None = None, limit: int = 3) -> list[dict]:
    """Recommend real university courses from the EdX Dataset (MIT, Harvard, IBM, Berkeley, etc.)."""
    b = load_brain()
    if isinstance(query_or_skills, list):
        q_text = " ".join(query_or_skills)
    else:
        q_text = str(query_or_skills or "")
    q_toks = _tokens(q_text)
    if not q_toks and fallback_skills:
        q_toks = _tokens(" ".join(fallback_skills))
    if not q_toks:
        q_toks = {"python", "data", "analytics"}
    scored = []
    for c in b.get("edx_courses", []):
        overlap = len(q_toks & c["_toks"])
        if overlap > 0:
            scored.append((overlap, c))
    scored.sort(key=lambda x: -x[0])
    return [
        {
            "title": c["title"],
            "provider": c["provider"],
            "level": c["level"],
            "url": c["url"],
            "about": c["about"],
            "skills": c["skills"],
        }
        for _, c in scored[:limit]
    ]


def lookup_onet_occupation(query: str) -> dict | None:
    """Match a role or career query against the 1,016 O*NET 29.0 occupations."""
    b = load_brain()
    q_toks = _tokens(query)
    if not q_toks:
        return None
    low = query.lower()
    best_score, best_occ = 0, None
    for occ in b.get("onet_occupations", []):
        t_low = occ["title"].lower()
        score = len(q_toks & occ["_toks"])
        if t_low in low or any(w in t_low for w in q_toks if len(w) >= 4):
            score += 3
        if score > best_score:
            best_score, best_occ = score, occ
    if best_score < 2 or not best_occ:
        return None
    return {
        "code": best_occ["code"],
        "title": best_occ["title"],
        "description": best_occ["description"],
        "hot_tech": best_occ["hot_tech"][:6],
        "core_skills": best_occ["core_skills"][:5],
        "emerging_tasks": best_occ["emerging_tasks"][:2],
        "related_careers": best_occ["related_careers"][:4],
    }


def lookup_ai_impact_and_displacement(query: str = "") -> dict:
    """Retrieve 2024-2030 AI job market forecast + 2020-2026 sector displacement metrics."""
    b = load_brain()
    forecasts = b.get("ai_job_forecasts_2030") or {}
    ind_forecasts = b.get("ai_industry_forecasts_2030") or {}
    disp = b.get("ai_displacement_sectors") or {}
    q_toks = _tokens(query)
    low = (query or "").lower()

    matched_role = None
    best_s = 0
    for jt, info in forecasts.items():
        jt_toks = _tokens(jt)
        s = len(q_toks & jt_toks)
        if jt.lower() in low:
            s += 4
        if s > best_s:
            best_s, matched_role = s, (jt, info)

    matched_sector = None
    for sec, sinfo in disp.items():
        if any(t in sec.lower() for t in q_toks) or sec.lower() in low:
            matched_sector = (sec, sinfo)
            break
    if not matched_sector and disp:
        first_k = next(iter(disp))
        matched_sector = (first_k, disp[first_k])

    return {
        "role_forecast": {"title": matched_role[0], **matched_role[1]} if matched_role else None,
        "sector_displacement": {"sector": matched_sector[0], **matched_sector[1]} if matched_sector else None,
        "industry_forecasts": ind_forecasts,
    }


def lookup_upskilling_roi() -> dict:
    """Return empirical ROI of AI upskilling (hiring success rate & salary hike %)."""
    b = load_brain()
    return b.get("upskilling_roi") or {}


def lookup_hr_and_workforce_analytics() -> dict:
    """Return IBM HR Attrition, Factory Workforce Efficacy, and Pay Equity benchmarks."""
    b = load_brain()
    return {
        "ibm_hr": b.get("ibm_hr_attrition") or {},
        "factory_metrics": b.get("factory_workforce_metrics") or {},
        "pay_equity": b.get("pay_equity_benchmarks") or {},
    }


def lookup_resume_category_benchmark(query_or_industry: str) -> dict | None:
    """Return relevant peer skill benchmarks for a role or industry."""
    b = load_brain()
    cats = b.get("resume_category_benchmarks") or {}
    low = (query_or_industry or "").lower()
    q_toks = _tokens(low)
    best_cat, best_s = None, 0
    for cat, info in cats.items():
        c_toks = _tokens(cat)
        s = len(q_toks & c_toks)
        if cat.lower() in low:
            s += 4
        if s > best_s:
            best_s, best_cat = s, (cat, info)
    if not best_cat and cats:
        if any(w in q_toks for w in ("finance", "accounting", "audit", "banking", "tax")):
            best_cat = ("Business Analyst", cats.get("Business Analyst") or next(iter(cats.values())))
        elif any(w in q_toks for w in ("software", "developer", "data", "python", "ai", "cloud", "cybersecurity")):
            best_cat = ("Data Science", cats.get("Data Science") or next(iter(cats.values())))
        elif any(w in q_toks for w in ("hr", "human", "recruitment", "talent")):
            best_cat = ("HR", cats.get("HR") or next(iter(cats.values())))
        elif any(w in q_toks for w in ("marketing", "copywriter", "pr", "media", "brand", "digital", "content", "sales")):
            if "Sales" in cats:
                best_cat = ("Sales", cats["Sales"])
            elif "Arts" in cats:
                best_cat = ("Arts", cats["Arts"])
    return {"category": best_cat[0], **best_cat[1]} if best_cat else None


_DOSM_BENCHMARK = None


def load_dosm_wages() -> dict:
    """Load the official DOSM 2025 Salaries & Wages dataset."""
    global _DOSM_BENCHMARK
    if _DOSM_BENCHMARK is None:
        p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "data", "dosm_wages_2025.json")
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                _DOSM_BENCHMARK = json.load(f)
        else:
            b = load_brain()
            _DOSM_BENCHMARK = b.get("dosm_wages_2025") or {}
    return _DOSM_BENCHMARK or {}


def lookup_dosm_wages(query: str = "") -> dict:
    """Look up official government wage benchmarks from DOSM 2025 Salaries & Wages Report."""
    dosm = load_dosm_wages()
    if not dosm:
        return {}
    meta = dosm.get("metadata", {})
    states = dosm.get("states", {})
    occs = dosm.get("occupations", {})
    skills = dosm.get("skill_tiers", {})
    edus = dosm.get("education_levels", {})

    low = (query or "").lower()

    # Check for state match
    matched_state = None
    state_aliases = {
        "kl": "W.P.  Kuala Lumpur",
        "kuala lumpur": "W.P.  Kuala Lumpur",
        "putrajaya": "W.P. Putrajaya",
        "labuan": "W.P. Labuan",
        "penang": "Pulau Pinang",
        "pulau pinang": "Pulau Pinang",
        "selangor": "Selangor",
        "johor": "Johor",
        "perak": "Perak",
        "kedah": "Kedah",
        "melaka": "Melaka",
        "malacca": "Melaka",
        "negeri sembilan": "Negeri Sembilan",
        "pahang": "Pahang",
        "terengganu": "Terengganu",
        "kelantan": "Kelantan",
        "perlis": "Perlis",
        "sabah": "Sabah",
        "sarawak": "Sarawak",
    }
    for alias, formal in state_aliases.items():
        if re.search(r"\b" + re.escape(alias) + r"\b", low):
            matched_state = (formal, states.get(formal, {}))
            break

    # Check for occupation match
    matched_occ = None
    occ_keywords = {
        "Professionals & AI / Software Engineers": ["engineer", "developer", "software", "ai", "data", "analyst", "doctor", "lawyer", "architect", "scientist", "professional"],
        "Managers & Senior Executives": ["manager", "executive", "director", "head", "lead", "chief", "cto", "ceo", "cfo"],
        "Technicians & Associate Professionals": ["technician", "associate", "assistant", "technical support", "it support"],
        "Clerical Support Workers": ["clerk", "clerical", "admin", "receptionist", "secretary"],
        "Service & Sales Workers": ["sales", "service", "retail", "customer service", "cashier", "marketing"],
        "Craft & Related Trades Workers": ["craft", "artisan", "trades", "electrician", "plumber", "carpenter"],
        "Plant & Machine Operators": ["operator", "machinist", "factory operator", "driver"],
        "Elementary Occupations": ["cleaner", "helper", "laborer", "elementary"],
    }
    for occ_title, kws in occ_keywords.items():
        if any(re.search(r"\b" + re.escape(kw) + r"\b", low) for kw in kws):
            matched_occ = (occ_title, occs.get(occ_title, {}))
            break

    return {
        "metadata": meta,
        "matched_state": {"name": matched_state[0], **matched_state[1]} if matched_state else None,
        "matched_occupation": {"title": matched_occ[0], **matched_occ[1]} if matched_occ else None,
        "skill_tiers": skills,
        "education_levels": edus,
        "citation": "Department of Statistics Malaysia (DOSM) 2025 Salaries & Wages Survey",
    }

