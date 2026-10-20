"""Employer / HR portal engine for CareerLens AI.

Covers: job vacancies, explainable candidate screening (job-relevant criteria only),
candidate insights with HR-editable follow-up questions, workforce skills-gap heatmap,
and HR-approved reskilling assignments (human stays in control).
"""

import json
import math
import os
import secrets
import hashlib
from contextlib import closing
from datetime import datetime, timezone

from auth_db import DATA_DIR, get_db_connection
from skills_taxonomy import expand_for_matching, skill_key

CITY_COORDS = {
    "Kuala Lumpur (KLCC)": {"city": "Kuala Lumpur", "lat": 3.1579, "lng": 101.7116},
    "Petaling Jaya (Selangor)": {"city": "Petaling Jaya", "lat": 3.1347, "lng": 101.6226},
    "Cyberjaya / Putrajaya": {"city": "Cyberjaya", "lat": 2.9213, "lng": 101.6559},
    "Subang Jaya / Sunway": {"city": "Subang Jaya", "lat": 3.0674, "lng": 101.6067},
    "Shah Alam (Selangor)": {"city": "Shah Alam", "lat": 3.0833, "lng": 101.5581},
    "Klang (Selangor)": {"city": "Klang", "lat": 3.0449, "lng": 101.4456},
    "Penang (Bayan Lepas / George Town)": {"city": "Bayan Lepas", "lat": 5.2945, "lng": 100.2655},
    "Johor Bahru (Iskandar Puteri)": {"city": "Johor Bahru", "lat": 1.4236, "lng": 103.6575},
    "Ipoh (Perak)": {"city": "Ipoh", "lat": 4.5975, "lng": 101.0901},
    "Seremban (Negeri Sembilan)": {"city": "Seremban", "lat": 2.7258, "lng": 101.9424},
}


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate great-circle distance in km between two GPS coordinates."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)

EDU_RANK = {"Diploma / TVET": 1, "Bachelor's Degree": 2, "Master's / Postgraduate": 3}
WORK_MODES = ("On-site", "Hybrid", "Remote")

# Heatmap skill -> key in verified_courses.json. Skills without a verified course get no
# recommendation (the system must never invent courses).
SKILL_COURSE_MAP = {
    "Prompt Engineering": "Prompt Engineering",
    "Python Data Analysis": "Python Data Analysis",
    "Workflow Automation": "AI Workflow Automation (Make/Zapier)",
    "AI Risk & Compliance": "AI Risk Model Auditing",
    "ESG Reporting": "ESG & Carbon Reporting Standards",
}


def _load(name):
    with open(os.path.join(DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def _norm(s):
    return (s or "").strip().lower()


def init_hr_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS vacancies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vacancy_uid TEXT,
            owner_uid TEXT NOT NULL,
            title TEXT NOT NULL,
            department TEXT,
            work_mode TEXT NOT NULL,
            location TEXT,
            salary_min INTEGER NOT NULL,
            salary_max INTEGER NOT NULL,
            min_years INTEGER NOT NULL,
            education_level TEXT NOT NULL,
            required_skills_json TEXT NOT NULL,
            preferred_skills_json TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Open',
            created_at TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS training_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_uid TEXT NOT NULL,
            employee_id TEXT NOT NULL,
            skill TEXT NOT NULL,
            course_title TEXT NOT NULL,
            sdg TEXT,
            hours INTEGER,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(owner_uid, employee_id, skill)
        )
        """
    )
    cur.execute("""CREATE TABLE IF NOT EXISTS interview_invites (
        id INTEGER PRIMARY KEY AUTOINCREMENT, owner_uid TEXT NOT NULL,
        candidate_id TEXT NOT NULL, candidate_name TEXT NOT NULL, recipient_uid TEXT,
        company TEXT NOT NULL, role TEXT NOT NULL, interview_time TEXT NOT NULL,
        location TEXT NOT NULL, message TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending', created_at TEXT NOT NULL,
        UNIQUE(owner_uid, candidate_id, role, interview_time))""")
    # Cancelled invitations are removed from both inboxes under the delete-on-cancel policy.
    cur.execute("DELETE FROM interview_invites WHERE status='Cancelled'")
    conn.commit()

    demo_owner = "CL-HR-2026-8801"
    cur.execute("SELECT COUNT(*) AS c FROM vacancies WHERE owner_uid = ?", (demo_owner,))
    if cur.fetchone()["c"] < 4:
        existing_titles = {
            r["title"] for r in cur.execute("SELECT title FROM vacancies WHERE owner_uid = ?", (demo_owner,)).fetchall()
        }
        seeds = [
            ("Software Developer", "IT & Software", "Hybrid", "Kuala Lumpur", 4000, 6000, 1, "Bachelor's Degree",
             ["Python", "SQL", "REST APIs", "Git"], ["React", "Docker", "Data Structures"]),
            ("AI Financial Compliance Analyst", "Finance & Accounting", "Hybrid", "Kuala Lumpur", 5000, 7500, 2,
             "Bachelor's Degree", ["Financial Auditing", "Risk Assessment", "Python Data Analysis", "SQL Basics"],
             ["ESG & Carbon Reporting Standards", "Excel Pivot & Macros"]),
            ("AI Content Strategist & Copywriter", "Marketing & PR", "Remote", "Petaling Jaya", 3800, 5800, 1,
             "Bachelor's Degree", ["Copywriting", "SEO Content Strategy", "Prompt Engineering", "Google Analytics"],
             ["Social Media Campaigns", "Canva & Basic Design", "Bilingual Communication"]),
            ("Health Informatics & PDPA Analyst", "Healthcare & Life Sciences", "Hybrid", "Subang Jaya", 4500, 6800, 1,
             "Bachelor's Degree", ["Data Privacy (PDPA)", "Risk Assessment", "SQL", "Project Management"],
             ["Python Data Analysis", "Excel Pivot & Macros"]),
            ("People Data & Reskilling Partner", "HR & Administration", "Hybrid", "Kuala Lumpur", 4200, 6500, 2,
             "Bachelor's Degree", ["Recruitment", "People Data Analytics", "Change Management"],
             ["Skills Architecture Mapping", "Data Privacy (PDPA)"]),
            ("ESG & Carbon Compliance Specialist", "Green Economy & ESG", "Hybrid", "Johor Bahru", 4800, 7200, 2,
             "Bachelor's Degree", ["ESG & Carbon Reporting Standards", "Financial Reporting", "Risk Assessment"],
             ["Excel Pivot & Macros", "Tax Compliance"]),
        ]
        for s in seeds:
            if s[0] in existing_titles:
                continue
            cur.execute(
                """INSERT INTO vacancies (owner_uid, title, department, work_mode, location, salary_min, salary_max,
                   min_years, education_level, required_skills_json, preferred_skills_json, status, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (demo_owner, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7],
                 json.dumps(s[8]), json.dumps(s[9]), "Open", _now()),
            )
            cur.execute("UPDATE vacancies SET vacancy_uid = ? WHERE id = ?",
                        (f"VAC-2026-{cur.lastrowid:03d}", cur.lastrowid))
        conn.commit()

    # Seed real Malaysian job postings from Kaggle JobStreet Malaysia All Job Dataset (azraimohamad/jobstreet-all-job-dataset)
    try:
        js_postings = _load("jobstreet_malaysia_postings.json")
        existing_js_uids = {
            r["owner_uid"]
            for r in cur.execute("SELECT owner_uid FROM vacancies WHERE owner_uid LIKE 'JS-%'").fetchall()
        }
        inserted_js = False
        for jp in js_postings:
            js_id = jp["jobstreet_id"]
            if js_id in existing_js_uids:
                continue
            cur.execute(
                """INSERT INTO vacancies (vacancy_uid, owner_uid, title, department, work_mode, location,
                   salary_min, salary_max, min_years, education_level, required_skills_json, preferred_skills_json,
                   status, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    js_id,
                    js_id,
                    jp["title"],
                    jp["department"],
                    jp["work_mode"],
                    jp["location"],
                    jp["salary_min"],
                    jp["salary_max"],
                    jp["min_years"],
                    jp["education_level"],
                    json.dumps(jp["required_skills"]),
                    json.dumps(jp["preferred_skills"]),
                    "Open",
                    _now(),
                ),
            )
            inserted_js = True
        if inserted_js:
            conn.commit()
    except Exception:
        pass

    conn.close()


# ---------------------------------------------------------------- vacancies
def _vacancy_from_row(r):
    return {
        "id": r["id"], "vacancy_uid": r["vacancy_uid"], "title": r["title"], "department": r["department"],
        "work_mode": r["work_mode"], "location": r["location"], "salary_min": r["salary_min"],
        "salary_max": r["salary_max"], "min_years": r["min_years"], "education_level": r["education_level"],
        "required_skills": json.loads(r["required_skills_json"]),
        "preferred_skills": json.loads(r["preferred_skills_json"]),
        "status": r["status"], "created_at": r["created_at"],
    }


def list_vacancies(owner_uid):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM vacancies WHERE owner_uid = ? ORDER BY id DESC", (owner_uid,)).fetchall()
    conn.close()
    return [_vacancy_from_row(r) for r in rows]


def get_vacancy(owner_uid, vacancy_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM vacancies WHERE id = ? AND owner_uid = ?", (vacancy_id, owner_uid)).fetchone()
    conn.close()
    return _vacancy_from_row(row) if row else None


def _clean_skills(values, limit=12):
    seen, out = set(), []
    for v in values or []:
        s = str(v).strip()
        if s and len(s) <= 60 and _norm(s) not in seen:
            seen.add(_norm(s))
            out.append(s)
    return out[:limit]


def create_vacancy(owner_uid, d):
    title = (d.get("title") or "").strip()
    if len(title) < 2 or len(title) > 80:
        return False, "Position title must be 2–80 characters.", None
    try:
        salary_min, salary_max = int(d.get("salary_min")), int(d.get("salary_max"))
        min_years = int(d.get("min_years") or 0)
    except (TypeError, ValueError):
        return False, "Salary budget and years of experience must be numbers.", None
    if salary_min < 0 or salary_max < salary_min:
        return False, "Salary maximum must be greater than or equal to the minimum.", None
    if min_years < 0 or min_years > 40:
        return False, "Years of relevant experience must be between 0 and 40.", None
    work_mode = d.get("work_mode")
    if work_mode not in WORK_MODES:
        return False, "Please choose a valid work mode.", None
    education = d.get("education_level")
    if education not in EDU_RANK:
        return False, "Please choose a valid minimum education level.", None
    required = _clean_skills(d.get("required_skills"))
    if not required:
        return False, "Add at least one required skill directly related to the role.", None
    preferred = [s for s in _clean_skills(d.get("preferred_skills")) if _norm(s) not in {_norm(r) for r in required}]

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO vacancies (owner_uid, title, department, work_mode, location, salary_min, salary_max,
           min_years, education_level, required_skills_json, preferred_skills_json, status, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (owner_uid, title, (d.get("department") or "").strip()[:60], work_mode,
         (d.get("location") or "").strip()[:60], salary_min, salary_max, min_years, education,
         json.dumps(required), json.dumps(preferred), "Open", _now()),
    )
    vid = cur.lastrowid
    cur.execute("UPDATE vacancies SET vacancy_uid = ? WHERE id = ?", (f"VAC-2026-{vid:03d}", vid))
    conn.commit()
    conn.close()
    return True, "Vacancy created.", get_vacancy(owner_uid, vid)


def set_vacancy_status(owner_uid, vacancy_id, status):
    if status not in ("Open", "Closed"):
        return False
    conn = get_db_connection()
    cur = conn.execute("UPDATE vacancies SET status = ? WHERE id = ? AND owner_uid = ?",
                       (status, vacancy_id, owner_uid))
    conn.commit()
    conn.close()
    return cur.rowcount > 0


def delete_vacancy(owner_uid, vacancy_id):
    conn = get_db_connection()
    cur = conn.execute("DELETE FROM vacancies WHERE id = ? AND owner_uid = ?", (vacancy_id, owner_uid))
    conn.commit()
    conn.close()
    return cur.rowcount > 0


# ---------------------------------------------------------------- screening
def _action_for(score):
    if score >= 85:
        return "Priority human review", "emerald"
    if score >= 70:
        return "Confirm skills with follow-up", "indigo"
    if score >= 55:
        return "Consider for junior / adjacent role", "amber"
    return "Keep in talent pool", "slate"


def _follow_up_questions(c, to_confirm):
    qs = [f"Your CV does not mention {s}. Have you used it in a project or at work? Please describe your role."
          for s in to_confirm[:3]]
    if c.get("projects"):
        qs.append(f"In \"{c['projects'][0]}\", which part did you personally own and what was the hardest problem?")
    if c["type"] == "Fresh Graduate":
        qs.append("If this role needed a tool you have never used, how would you get productive in the first month?")
    elif c["type"] == "Career Changer":
        qs.append("Which parts of your previous experience transfer most directly to this role?")
    else:
        qs.append("Describe a problem you solved that was blocking your team's delivery.")
    return qs[:5]


def score_candidate(v, c):
    req = {skill_key(s): s for s in v["required_skills"]}
    pref = {skill_key(s): s for s in v["preferred_skills"]}
    have = {skill_key(s): s for s in expand_for_matching(c["skills"])}

    matched_req = [req[k] for k in req if k in have]
    to_confirm = [req[k] for k in req if k not in have]  # absent from CV != "cannot do"
    matched_pref = [pref[k] for k in pref if k in have]

    skills_pts = round(45 * len(matched_req) / max(1, len(req)))
    pref_pts = round(10 * len(matched_pref) / len(pref)) if pref else 10
    exp_pts = 20 if c["years"] >= v["min_years"] else round(20 * c["years"] / max(1, v["min_years"]))
    edu_pts = 10 if EDU_RANK.get(c["education"], 1) >= EDU_RANK.get(v["education_level"], 1) else 5
    mode_pts = 5 if v["work_mode"] in c["work_modes"] else 2
    sal = c["salary_expectation"]
    if v["salary_min"] <= sal <= v["salary_max"]:
        sal_pts, sal_fit = 10, "Within budget"
    elif sal < v["salary_min"]:
        sal_pts, sal_fit = 7, "Below budget range"
    else:
        sal_pts, sal_fit = 3, "Above budget — confirm flexibility"

    score = skills_pts + pref_pts + exp_pts + edu_pts + mode_pts + sal_pts
    action, tone = _action_for(score)
    return {
        "candidate_id": c["id"], "name": c["name"], "type": c["type"], "years": c["years"],
        "education": c["education"], "location": c["location"], "available_in": c["available_in"],
        "score": score, "action": action, "tone": tone,
        "breakdown": [
            {"label": "Required skills", "pts": skills_pts, "max": 45},
            {"label": "Preferred skills", "pts": pref_pts, "max": 10},
            {"label": "Relevant experience", "pts": exp_pts, "max": 20},
            {"label": "Education", "pts": edu_pts, "max": 10},
            {"label": "Work mode fit", "pts": mode_pts, "max": 5},
            {"label": "Salary fit", "pts": sal_pts, "max": 10},
        ],
        "matched_required": matched_req, "matched_preferred": matched_pref, "to_confirm": to_confirm,
        "salary_expectation": sal, "salary_fit": sal_fit, "work_modes": c["work_modes"],
        "projects": c.get("projects", []), "motivation": c.get("motivation", ""),
        "follow_up_questions": _follow_up_questions(c, to_confirm),
        "is_applied_user": bool(c.get("is_applied_user", False)),
        "application_id": c.get("application_id"),
        "application_uid": c.get("application_uid"),
        "applied_at": c.get("applied_at"),
        "share_organised_cv": bool(c.get("share_organised_cv", False)),
        "share_original_pdf": bool(c.get("share_original_pdf", False)),
        "executive_summary": c.get("executive_summary", ""),
    }


def _applied_candidates_for_vacancy(vacancy_id: int) -> list[dict]:
    """Load real Job Seeker applications for this vacancy (privacy-gated: only applicants appear)."""
    conn = get_db_connection()
    rows = conn.execute(
        """
        SELECT a.*, u.structured_cv_json
          FROM job_applications a
          JOIN user_cvs u ON u.owner_uid = a.candidate_uid
         WHERE a.vacancy_id = ?
         ORDER BY a.id DESC
        """,
        (vacancy_id,),
    ).fetchall()
    conn.close()
    out = []
    for r in rows:
        try:
            st = json.loads(r["structured_cv_json"])
        except Exception:
            continue
        pref_mode = st.get("work_mode_preference") or "Hybrid"
        work_modes = list({pref_mode, "Hybrid"})
        out.append({
            "id": r["candidate_uid"],
            "name": st.get("full_name") or r["candidate_name"],
            "type": st.get("seeker_type") or "Career Changer",
            "years": int(st.get("years_experience") or 1),
            "education": st.get("education_level") or "Bachelor's Degree",
            "location": st.get("location") or "Kuala Lumpur",
            "available_in": r["available_in"] or "1 month",
            "salary_expectation": int(r["salary_expectation"] or 5000),
            "work_modes": work_modes,
            "skills": st.get("skills") or [],
            "projects": st.get("projects") or [],
            "motivation": r["cover_note"] or st.get("executive_summary") or "Applied with AI-organised PDF CV.",
            "executive_summary": st.get("executive_summary") or "",
            "is_applied_user": True,
            "application_id": r["id"],
            "application_uid": r["application_uid"],
            "applied_at": r["applied_at"],
            "share_organised_cv": bool(r["share_organised_cv"]),
            "share_original_pdf": bool(r["share_original_pdf"]),
        })
    return out


def list_open_vacancies_for_seeker(candidate_uid: str) -> list[dict]:
    """List all Open company vacancies with live match score against the candidate's stored PDF CV."""
    conn = get_db_connection()
    vac_rows = conn.execute(
        """
        SELECT v.*, u.role_details_json, u.full_name AS hr_name
          FROM vacancies v
          LEFT JOIN users u ON u.unique_uid = v.owner_uid
         WHERE v.status = 'Open'
         ORDER BY v.id DESC
        """
    ).fetchall()
    app_rows = conn.execute(
        "SELECT * FROM job_applications WHERE candidate_uid = ?",
        (candidate_uid,),
    ).fetchall()
    cv_row = conn.execute(
        "SELECT structured_cv_json FROM user_cvs WHERE owner_uid = ?",
        (candidate_uid,),
    ).fetchone()
    conn.close()

    apps_by_vid = {r["vacancy_id"]: dict(r) for r in app_rows}
    st = json.loads(cv_row["structured_cv_json"]) if cv_row else None

    cand_obj = None
    if st:
        cand_obj = {
            "id": candidate_uid,
            "name": st.get("full_name") or "Candidate",
            "type": st.get("seeker_type") or "Experienced Worker",
            "years": int(st.get("years_experience") or 1),
            "education": st.get("education_level") or "Bachelor's Degree",
            "location": st.get("location") or "Kuala Lumpur",
            "available_in": "1 month",
            "salary_expectation": 5000,
            "work_modes": [st.get("work_mode_preference") or "Hybrid"],
            "skills": st.get("skills") or [],
            "projects": st.get("projects") or [],
            "motivation": st.get("executive_summary") or "",
        }

    companies = _load("companies_directory.json")
    comp_by_cat = {c["category"].lower(): c for c in companies}
    comp_by_city = {c["city"].lower(): c for c in companies}
    try:
        js_postings = _load("jobstreet_malaysia_postings.json")
        js_by_id = {p["jobstreet_id"]: p for p in js_postings}
    except Exception:
        js_by_id = {}

    out = []
    for vr in vac_rows:
        v = _vacancy_from_row(vr)
        js_meta = js_by_id.get(vr["owner_uid"]) or js_by_id.get(v.get("vacancy_uid") or "")
        if js_meta:
            v["company_name"] = js_meta["company_name"]
            v["company_category"] = js_meta["department"]
            v["company_industry"] = js_meta.get("subcategory") or js_meta["department"]
            v["company_district"] = js_meta["location"]
            v["lat"] = js_meta["lat"]
            v["lng"] = js_meta["lng"]
            v["jobstreet_id"] = js_meta["jobstreet_id"]
            v["employment_type"] = js_meta.get("employment_type", "Full time")
            v["subcategory"] = js_meta.get("subcategory", "")
            v["description_snippet"] = js_meta.get("description_snippet", "")
            v["dataset_source"] = "JobStreet Malaysia Dataset"
        else:
            try:
                rd = json.loads(vr["role_details_json"] or "{}")
            except Exception:
                rd = {}
            matched_comp = (
                comp_by_cat.get((v.get("department") or "").lower())
                or comp_by_city.get((v.get("location") or "").lower())
                or companies[0]
            )
            v["company_name"] = matched_comp["name"] if v.get("department") in {c["category"] for c in companies} else (rd.get("company_name") or matched_comp["name"])
            v["company_category"] = matched_comp["category"]
            v["company_industry"] = matched_comp["sub_sector"]
            v["company_district"] = matched_comp["district"]
            v["lat"] = matched_comp["lat"]
            v["lng"] = matched_comp["lng"]
            v["jobstreet_id"] = None
            v["employment_type"] = "Full time"
            v["subcategory"] = matched_comp["sub_sector"]
            v["description_snippet"] = ""
            v["dataset_source"] = "Direct Employer Portal"

        if cand_obj:
            scored = score_candidate(v, cand_obj)
            v["match_score"] = scored["score"]
            v["matched_required"] = scored["matched_required"]
            v["to_confirm"] = scored["to_confirm"]
            v["is_relevant_to_cv"] = (
                len(scored["matched_required"]) > 0
                or scored["score"] >= 58
                or (st.get("industry") or "").lower() == v["company_category"].lower()
            )
        else:
            v["match_score"] = None
            v["matched_required"] = []
            v["to_confirm"] = v["required_skills"]
            v["is_relevant_to_cv"] = True

        app_info = apps_by_vid.get(v["id"])
        v["application"] = {
            "applied": bool(app_info),
            "application_uid": app_info["application_uid"] if app_info else None,
            "applied_at": app_info["applied_at"] if app_info else None,
            "share_organised_cv": bool(app_info["share_organised_cv"]) if app_info else True,
            "share_original_pdf": bool(app_info["share_original_pdf"]) if app_info else True,
            "hr_decision": app_info["hr_decision"] if app_info else None,
            "cover_note": app_info["cover_note"] if app_info else "",
        }
        out.append(v)

    return sorted(out, key=lambda x: (x["match_score"] is not None, x["match_score"] or 0), reverse=True)


def list_nearby_companies_and_jobs(candidate_uid: str, lat: float | None = None, lng: float | None = None,
                                   city_preset: str | None = None, category: str = "", query: str = "") -> dict:
    """Return nearby companies grouped by category + open job vacancies with distance & CV match."""
    # Resolve coordinates
    resolved_label = "Kuala Lumpur (KLCC)"
    u_lat, u_lng = 3.1579, 101.7116

    if city_preset and city_preset in CITY_COORDS:
        resolved_label = city_preset
        u_lat = CITY_COORDS[city_preset]["lat"]
        u_lng = CITY_COORDS[city_preset]["lng"]
    elif lat is not None and lng is not None:
        u_lat, u_lng = float(lat), float(lng)
        # Find nearest preset city name for friendly display
        nearest_name = min(
            CITY_COORDS.keys(),
            key=lambda k: haversine_km(u_lat, u_lng, CITY_COORDS[k]["lat"], CITY_COORDS[k]["lng"]),
        )
        dist_to_preset = haversine_km(u_lat, u_lng, CITY_COORDS[nearest_name]["lat"], CITY_COORDS[nearest_name]["lng"])
        resolved_label = f"GPS ({u_lat:.3f}, {u_lng:.3f}) · near {CITY_COORDS[nearest_name]['city']}" if dist_to_preset < 80 else f"GPS ({u_lat:.3f}, {u_lng:.3f})"

    conn = get_db_connection()
    cv_row = conn.execute("SELECT structured_cv_json FROM user_cvs WHERE owner_uid = ?", (candidate_uid,)).fetchone()
    conn.close()
    st = json.loads(cv_row["structured_cv_json"]) if cv_row else {}
    user_skills = {skill_key(s) for s in expand_for_matching(st.get("skills") or [])}
    user_industry = (st.get("industry") or "").lower()

    companies = _load("companies_directory.json")
    all_categories = sorted({c["category"] for c in companies})

    cat_filter = (category or "").strip().lower()
    q_filter = (query or "").strip().lower()

    enriched_companies = []
    for c in companies:
        dist_km = haversine_km(u_lat, u_lng, c["lat"], c["lng"])
        sought = c.get("core_skills_sought") or []
        matched_skills = [s for s in sought if skill_key(s) in user_skills]
        skill_ratio = len(matched_skills) / max(1, len(sought))
        sector_bonus = 20 if c["category"].lower() == user_industry else 0
        cv_relevance = min(98, round(50 + skill_ratio * 35 + sector_bonus))

        if cat_filter and cat_filter != "all" and c["category"].lower() != cat_filter:
            continue
        if q_filter:
            haystack = " ".join([
                c["name"], c["category"], c["sub_sector"], c["city"], c["district"],
                " ".join(c.get("featured_roles") or []), " ".join(sought),
            ]).lower()
            if q_filter not in haystack:
                continue

        enriched_companies.append({
            **c,
            "distance_km": dist_km,
            "proximity_badge": "📍 Nearby (<15 km)" if dist_km <= 15 else ("🚗 Commutable (<35 km)" if dist_km <= 35 else f"✈️ {dist_km} km away"),
            "matched_skills": matched_skills,
            "cv_relevance_pct": cv_relevance,
            "is_cv_matched": len(matched_skills) > 0 or c["category"].lower() == user_industry,
        })

    enriched_companies.sort(key=lambda x: (x["distance_km"], -x["cv_relevance_pct"]))

    # Also attach distance to open vacancies
    vacancies = list_open_vacancies_for_seeker(candidate_uid)
    for v in vacancies:
        v["distance_km"] = haversine_km(u_lat, u_lng, v.get("lat", 3.1579), v.get("lng", 101.7116))

    return {
        "user_location": {
            "label": resolved_label,
            "lat": u_lat,
            "lng": u_lng,
            "presets": list(CITY_COORDS.keys()),
        },
        "categories": all_categories,
        "companies": enriched_companies,
        "vacancies": vacancies,
    }


def screen_candidates(owner_uid, vacancy_id):
    v = get_vacancy(owner_uid, vacancy_id)
    if not v:
        return None
    applied = _applied_candidates_for_vacancy(vacancy_id)
    synthetic_pool = _load("candidates_pool.json")
    all_candidates = applied + synthetic_pool
    results = sorted((score_candidate(v, c) for c in all_candidates),
                     key=lambda r: (r.get("is_applied_user", False), r["score"]), reverse=True)
    summary = {}
    for r in results:
        summary[r["action"]] = summary.get(r["action"], 0) + 1
    return {
        "vacancy": v, "results": results,
        "summary": {
            "by_action": summary,
            "total": len(results),
            "applied_count": len(applied),
            "average_score": round(sum(r["score"] for r in results) / max(1, len(results))),
        },
        "fairness_note": "Scored on job-relevant criteria only. Personal PDF CVs are strictly private and only "
                         "visible here when a candidate explicitly applies to this vacancy. Missing CV items are "
                         "marked 'To confirm', never auto-rejected. HR makes the final decision.",
    }


# ---------------------------------------------------------------- workforce
def get_heatmap():
    candidates = _load("candidates_pool.json")
    skills = sorted({skill for c in candidates for skill in c["skills"]})
    target = 1
    emps = [{**c, "department": "Finance" if any(s in c["skills"] for s in ["Financial Auditing", "Financial Reporting"]) else "Engineering",
             "role": c["type"], "levels": {s: 1 for s in c["skills"]}} for c in candidates]
    courses = _load("verified_courses.json")

    employees = []
    for e in emps:
        total = sum(e["levels"].get(s, 0) for s in skills)
        gaps = sorted(((s, target - e["levels"].get(s, 0)) for s in skills if e["levels"].get(s, 0) < target),
                      key=lambda x: x[1], reverse=True)
        recs = []
        for s, g in gaps:
            course = courses.get(SKILL_COURSE_MAP.get(s, ""))
            if course:
                recs.append({"skill": s, "gap": g, "course_title": course["title"], "provider": course["provider"],
                             "hours": course["hours"], "cost_type": course["cost_type"],
                             "badge": course["malaysia_badge"], "sdg": course["sdg"], "url": course["url"]})
        employees.append({**e, "readiness": round(100 * total / (len(skills))), "recommendations": recs[:3]})

    skill_summary = []
    for s in skills:
        lv = [e["levels"].get(s, 0) for e in emps]
        skill_summary.append({"skill": s, "avg": round(sum(lv) / len(lv), 1),
                              "coverage": round(100 * sum(1 for x in lv if x >= target) / len(lv)),
                              "below_target": sum(1 for x in lv if x < target)})
    return {
        "skills": skills, "target_level": target, "employees": employees, "skill_summary": skill_summary,
        "team_readiness": round(sum(e["readiness"] for e in employees) / len(employees)),
        "departments": sorted({e["department"] for e in emps}),
    }


def list_assignments(owner_uid):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM training_assignments WHERE owner_uid = ? ORDER BY id DESC",
                        (owner_uid,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def assign_training(owner_uid, employee_id, skill):
    courses = _load("verified_courses.json")
    course = courses.get(SKILL_COURSE_MAP.get(skill, ""))
    if not course or employee_id not in {e["id"] for e in _load("candidates_pool.json")}:
        return False, "No verified course is available for this skill."
    conn = get_db_connection()
    conn.execute(
        """INSERT OR IGNORE INTO training_assignments
           (owner_uid, employee_id, skill, course_title, sdg, hours, status, created_at)
           VALUES (?,?,?,?,?,?,?,?)""",
        (owner_uid, employee_id, skill, course["title"], course["sdg"], course["hours"], "Approved by HR", _now()),
    )
    conn.commit()
    conn.close()
    return True, "Training approved."


def revoke_training(owner_uid, employee_id, skill):
    conn = get_db_connection()
    cur = conn.execute("DELETE FROM training_assignments WHERE owner_uid = ? AND employee_id = ? AND skill = ?",
                       (owner_uid, employee_id, skill))
    conn.commit()
    conn.close()
    return cur.rowcount > 0


def create_interview(owner, data):
    candidate = next((c for c in _load("candidates_pool.json") if c["id"] == data.get("candidate_id")), None)
    if not candidate:
        return None, "Candidate not found."
    values = [str(data.get(k, "")).strip() for k in ("role", "time", "location", "message")]
    if not all(values[:3]) or any(len(v) > 1500 for v in values):
        return None, "Please complete the interview details."
    try:
        datetime.strptime(values[1], "%Y-%m-%dT%H:%M")
    except ValueError:
        return None, "Please complete the interview details."
    token = secrets.token_urlsafe(24)
    with closing(get_db_connection()) as conn, conn:
        existing = conn.execute("SELECT id FROM interview_invites WHERE owner_uid=? AND candidate_id=? AND role=? AND interview_time=?", (owner["unique_uid"], candidate["id"], values[0], values[1])).fetchone()
        if existing:
            return None, "This invitation already exists."
        recipient = conn.execute("SELECT unique_uid FROM users WHERE unique_uid=? AND role='job_seeker'", (candidate["id"],)).fetchone()
        if not recipient:
            return None, "This demo candidate has no account. Use Aisha Rahman to test invitations."
        conn.execute("""INSERT INTO interview_invites (owner_uid,candidate_id,candidate_name,recipient_uid,company,role,interview_time,location,message,token_hash,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)""", (owner["unique_uid"],candidate["id"],candidate["name"],recipient[0] if recipient else None,
          owner.get("role_details",{}).get("company_name",owner.get("full_name","HR")),*values,hashlib.sha256(token.encode()).hexdigest(),_now()))
    return {"delivered": True}, None


def interview_list(uid, hr=False):
    with closing(get_db_connection()) as conn, conn:
        rows = conn.execute("SELECT id,candidate_name,company,role,interview_time,location,message,status,recipient_uid FROM interview_invites WHERE " + ("owner_uid" if hr else "recipient_uid") + "=? ORDER BY id DESC", (uid,)).fetchall()
    return [dict(r) for r in rows]


def cancel_interview(uid, invite_id):
    with closing(get_db_connection()) as conn, conn:
        result = conn.execute("DELETE FROM interview_invites WHERE id=? AND owner_uid=?", (invite_id,uid))
        return result.rowcount > 0


def respond_interview(uid, invite_id, status):
    if status not in ("Accepted", "Declined"):
        return False
    with closing(get_db_connection()) as conn, conn:
        result = conn.execute("UPDATE interview_invites SET status=? WHERE id=? AND recipient_uid=? AND status='Pending'", (status,invite_id,uid))
        return result.rowcount > 0
