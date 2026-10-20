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
    """Return top skills benchmarked from 962 real resumes in UpdatedResumeDataSet.csv."""
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
        # Map CareerLens industry names to closest resume category
        if "finance" in low or "account" in low:
            best_cat = ("Business Analyst", cats.get("Business Analyst") or next(iter(cats.values())))
        elif "it" in low or "software" in low or "data" in low:
            best_cat = ("Data Science", cats.get("Data Science") or next(iter(cats.values())))
        elif "hr" in low:
            best_cat = ("HR", cats.get("HR") or next(iter(cats.values())))
    return {"category": best_cat[0], **best_cat[1]} if best_cat else None
