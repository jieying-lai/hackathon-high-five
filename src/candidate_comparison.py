"""Company-scoped comparison of consented applications; explicit demo mode only."""
import json
import re
from contextlib import closing
from auth_db import get_db_connection
import hr_engine
from skills_taxonomy import skill_key, expand_for_matching

EDUCATION = ["SPM / UEC", "Undergraduate", "Master", "Doctor", "Intern / Trainee", "Other / To confirm"]
SOFT = {"communication", "bilingual communication", "teamwork", "leadership", "problem solving", "critical thinking", "adaptability", "time management", "change management"}

def education_category(value):
    low = (value or "").lower()
    if re.search(r"ph\.?d|doctor", low): return "Doctor"
    if re.search(r"master|mba|msc|postgraduate", low): return "Master"
    if re.search(r"bachelor|undergraduate|b\.acc|b\.sc|b\.eng", low): return "Undergraduate"
    if re.search(r"spm|uec", low): return "SPM / UEC"
    if re.search(r"intern|trainee", low): return "Intern / Trainee"
    return "Other / To confirm"

def qualifications(text, history=None):
    lines = history or text.splitlines()
    institutions = [line.strip() for line in lines if re.search(r"university|universiti|college|polytechnic|institute|学院|大学", line, re.I)]
    majors = [line.strip() for line in lines if re.search(r"(?:bachelor|master|doctor|degree|diploma).{0,35}(?: in | of )", line, re.I)]
    return {"institution": institutions[:3], "major": majors[:3]}

def structured_dimensions(st, raw_text=""):
    skills = list(st.get("skills", []))
    for phrase in sorted(SOFT):
        if re.search(r"\b" + re.escape(phrase) + r"\b", raw_text, re.I) and phrase.title() not in skills:
            skills.append(phrase.title())
    return {"hard_skills": [s for s in skills if s.lower() not in SOFT],
            "soft_skills": [s for s in skills if s.lower() in SOFT],
            **qualifications("", st.get("education_history", [])),
            "past_positions": st.get("work_experience", []),
            "industry_field": st.get("industry") or "To confirm"}

def comparison(owner_uid, demo=False):
    vacancies = hr_engine.list_vacancies(owner_uid)
    rows = []
    with closing(get_db_connection()) as conn:
        for v in vacancies:
            applications = conn.execute("""SELECT a.*, c.structured_cv_json FROM job_applications a
                JOIN vacancies v ON v.id=a.vacancy_id JOIN user_cvs c ON c.owner_uid=a.candidate_uid
                WHERE v.owner_uid=? AND a.vacancy_id=? AND a.share_organised_cv=1""", (owner_uid,v["id"])).fetchall()
            candidates = []
            for app in applications:
                st = json.loads(app["structured_cv_json"])
                c = {"id": app["candidate_uid"], "name": app["candidate_name"], "type": st.get("seeker_type", "To confirm"),
                     "years": (st.get("years_experience") or 0) if st.get("experience_known", True) else 0, "education": st.get("education_level", "To confirm"),
                     "skills": st.get("skills", []), "work_modes": [st.get("work_mode_preference", "")],
                     "salary_expectation": app["salary_expectation"], "location": st.get("location", ""),
                     "available_in": app["available_in"], "is_applied_user": True}
                dimensions = structured_dimensions(st)
                # Only explicit duration evidence is treated as known experience.
                dimensions["experience_known"] = st.get("experience_known", bool(st.get("work_experience")))
                candidates.append((c, dimensions, "Application"))
            if demo and owner_uid == "CL-HR-2026-8801":
                existing = {c[0]["id"] for c in candidates}
                for c in hr_engine._load("candidates_pool.json"):
                    if c["id"] not in existing:
                        candidates.append((c, {**structured_dimensions({"skills": c["skills"]}), "experience_known": True}, "Demo"))
            for c, dims, source in candidates:
                scored = hr_engine.score_candidate(v, c)
                # Skip unrelated synthetic examples for this vacancy.
                if source == "Demo" and not scored["matched_required"]: continue
                expanded = {skill_key(s) for s in expand_for_matching(c["skills"])}
                rows.append({**scored, **dims, "id": c["id"], "vacancy_id": v["id"], "position": v["title"],
                  "department": v.get("department") or "General",
                  "education_category": education_category(c["education"] if c["education"] != "To confirm" else c["type"]), "skills": c["skills"],
                  "skill_keys": sorted(expanded), "source": source})
    return {"vacancies": vacancies, "candidates": rows, "education_categories": EDUCATION}
