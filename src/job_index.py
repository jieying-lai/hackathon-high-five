"""Geo-searchable JobStreet Malaysia job index (69k real postings) for the Talent Portal map.

Loads src/data/jobstreet_index.json.gz once, then answers radius queries
("jobs within N km of me"), with a lightweight, explainable CV match score.
Applying to a JobStreet posting lazily materialises it as a row in `vacancies`
so the existing consent-gated application flow (cv_engine.apply_to_vacancy) is reused.
"""

import gzip
import json
import math
import os
import re
import threading
from datetime import datetime, timezone

from auth_db import DATA_DIR, get_db_connection
from skills_taxonomy import expand_for_matching, skill_key

INDEX_PATH = os.path.join(DATA_DIR, "jobstreet_index.json.gz")
_LOCK = threading.Lock()
_INDEX = None

# JobStreet category -> CareerLens industry (used for the sector-fit part of the match score)
CATEGORY_TO_INDUSTRY = {
    "Information & Communication Technology": "IT & Software",
    "Science & Technology": "IT & Software",
    "Accounting": "Finance & Accounting",
    "Banking & Financial Services": "Finance & Accounting",
    "Insurance & Superannuation": "Finance & Accounting",
    "Marketing & Communications": "Marketing & PR",
    "Advertising, Arts & Media": "Marketing & PR",
    "Sales": "Marketing & PR",
    "Human Resources & Recruitment": "HR & Administration",
    "Administration & Office Support": "HR & Administration",
    "Engineering": "Engineering & Green Tech",
    "Construction": "Engineering & Green Tech",
    "Mining, Resources & Energy": "Engineering & Green Tech",
    "Manufacturing, Transport & Logistics": "Logistics & Supply Chain",
    "Healthcare & Medical": "Healthcare & Life Sciences",
    "Farming, Animals & Conservation": "Green Economy & ESG",
}

_STOP = {"and", "the", "of", "for", "in", "to", "a", "an", "with", "senior", "junior", "executive", "assistant",
         "officer", "manager", "staff", "intern", "internship", "trainee", "lead", "head", "specialist", "sr", "jr",
         "i", "ii", "iii", "cum", "&", "-", "/"}


def _tokens(text):
    return {t for t in re.findall(r"[a-z][a-z0-9+#.]{1,}", (text or "").lower()) if t not in _STOP}


def _disperse_coord(lat: float, lng: float, company_id: int) -> tuple[float, float]:
    """Deterministically disperse companies sharing the same district centroid into realistic street-level locations (within ~150-450m)."""
    h = ((company_id or 0) * 2654435761) & 0xFFFFFFFF
    angle = (h % 360) * (math.pi / 180.0)
    dist_m = 120.0 + ((h >> 8) % 360)
    dlat = (dist_m * math.cos(angle)) / 111000.0
    dlng = (dist_m * math.sin(angle)) / (111000.0 * max(0.2, math.cos(math.radians(lat or 3.15))))
    return round(lat + dlat, 5), round(lng + dlng, 5)

def haversine_km(lat1, lng1, lat2, lng2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2 - lat1), math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def load_index():
    global _INDEX
    if _INDEX is None:
        with _LOCK:
            if _INDEX is None:
                if not os.path.exists(INDEX_PATH):
                    _INDEX = {"jobs": [], "companies": [], "locations": [], "categories": [], "subcategories": [],
                              "types": [], "skills": [], "by_id": {}}
                    return _INDEX
                with gzip.open(INDEX_PATH, "rt", encoding="utf-8") as f:
                    data = json.load(f)
                skill_keys = [skill_key(s) for s in data["skills"]]
                title_tokens = []
                for j in data["jobs"]:
                    title_tokens.append(_tokens(j[1]))
                data["skill_keys"] = skill_keys
                data["title_tokens"] = title_tokens
                data["by_id"] = {j[0]: i for i, j in enumerate(data["jobs"])}
                _INDEX = data
    return _INDEX


def stats():
    idx = load_index()
    return {"jobs": len(idx["jobs"]), "companies": len(idx["companies"]), "source": idx.get("source", "")}


def query_market_insights(query_text: str = "", category: str = "") -> dict:
    """Mine real salary benchmarks, top demanded skills, and top hiring companies from the 68.4k JobStreet dataset."""
    idx = load_index()
    jobs = idx["jobs"]
    q_toks = _tokens(query_text)
    cat_low = (category or "").strip().lower()

    matched_jobs = []
    for i, j in enumerate(jobs):
        if cat_low and cat_low not in idx["categories"][j[4]].lower():
            continue
        if q_toks:
            tt = idx["title_tokens"][i]
            if not (q_toks & tt) and query_text.lower() not in j[1].lower() and query_text.lower() not in idx["categories"][j[4]].lower():
                continue
        matched_jobs.append(j)

    if not matched_jobs:
        matched_jobs = jobs

    salaries = []
    skill_counts = {}
    comp_counts = {}
    loc_counts = {}
    for j in matched_jobs:
        smin, smax = j[7], j[8]
        if smin >= 1000 and smax >= smin:
            salaries.append((smin + smax) // 2)
        for s_id in j[12]:
            sk_name = idx["skills"][s_id]
            skill_counts[sk_name] = skill_counts.get(sk_name, 0) + 1
        c_name = idx["companies"][j[2]]
        if c_name != "Confidential Employer":
            comp_counts[c_name] = comp_counts.get(c_name, 0) + 1
        l_name = idx["locations"][j[3]]
        loc_counts[l_name] = loc_counts.get(l_name, 0) + 1

    salaries.sort()
    if salaries:
        n = len(salaries)
        p25 = salaries[max(0, int(n * 0.25))]
        median = salaries[n // 2]
        p75 = salaries[min(n - 1, int(n * 0.75))]
    else:
        p25, median, p75 = 3500, 4800, 6800

    top_skills = [k for k, _ in sorted(skill_counts.items(), key=lambda kv: -kv[1])[:6]]
    top_companies = [k for k, _ in sorted(comp_counts.items(), key=lambda kv: -kv[1])[:5]]
    top_locations = [k for k, _ in sorted(loc_counts.items(), key=lambda kv: -kv[1])[:4]]

    return {
        "matching_openings": len(matched_jobs),
        "salary_sample_size": len(salaries),
        "salary_p25": int(round(p25, -1)),
        "salary_median": int(round(median, -1)),
        "salary_p75": int(round(p75, -1)),
        "top_skills": top_skills,
        "top_companies": top_companies,
        "top_locations": top_locations,
    }


INDUSTRY_ROLE_KEYWORDS = {
    "Finance & Accounting": {"account", "accountant", "accounting", "audit", "auditor", "finance", "financial", "tax", "credit", "treasury", "accounts", "compliance", "risk", "analyst"},
    "IT & Software": {"software", "developer", "engineer", "programmer", "python", "java", "data", "it", "system", "web", "frontend", "backend", "fullstack", "cloud", "devops", "security", "network", "ai", "analyst"},
    "Marketing & PR": {"marketing", "digital", "content", "copywriter", "brand", "social", "media", "seo", "communications", "pr", "campaign", "creative", "advertising"},
    "HR & Administration": {"hr", "human", "resource", "resources", "recruitment", "recruiter", "talent", "payroll", "people", "admin", "administrative", "training"},
    "Engineering & Green Tech": {"engineer", "engineering", "mechanical", "electrical", "process", "quality", "qa", "qc", "production", "manufacturing", "project", "esg", "environmental"},
    "Logistics & Supply Chain": {"logistics", "supply", "chain", "procurement", "purchasing", "warehouse", "inventory", "shipping", "planner", "buyer"},
    "Healthcare & Life Sciences": {"clinical", "medical", "health", "healthcare", "nurse", "pharmacist", "laboratory", "hospital", "patient"},
}

LOCATION_ALIASES = [
    # Johor
    (["iskandar puteri", "gelang patah", "nusajaya"], "Johor Bahru (Iskandar Puteri)", 1.4236, 103.6575, "Johor Bahru (Iskandar Puteri)", 20),
    (["kulai", "senai"], "Kulai / Senai (Johor)", 1.6300, 103.6200, "Johor Bahru (Iskandar Puteri)", 20),
    (["pasir gudang", "masai"], "Pasir Gudang (Johor)", 1.4726, 103.9022, "Johor Bahru (Iskandar Puteri)", 20),
    (["muar"], "Muar (Johor)", 2.0442, 102.5689, "", 25),
    (["batu pahat"], "Batu Pahat (Johor)", 1.8548, 102.9325, "", 25),
    (["kluang"], "Kluang (Johor)", 2.0305, 103.3189, "", 25),
    (["johor bahru", "johor", "jb", "skudai", "tebrau", "柔佛", "新山"], "Johor Bahru (Johor)", 1.4927, 103.7414, "Johor Bahru (Iskandar Puteri)", 20),
    # Penang & North
    (["bayan lepas", "bayan baru"], "Bayan Lepas (Penang)", 5.2945, 100.2655, "Penang (Bayan Lepas / George Town)", 15),
    (["george town", "georgetown"], "George Town (Penang)", 5.4141, 100.3288, "Penang (Bayan Lepas / George Town)", 15),
    (["butterworth", "seberang perai", "perai", "bukit mertajam", "batu kawan"], "Seberang Perai / Butterworth (Penang)", 5.3630, 100.4300, "Penang (Bayan Lepas / George Town)", 20),
    (["penang", "pulau pinang", "槟城"], "Penang", 5.3600, 100.3100, "Penang (Bayan Lepas / George Town)", 20),
    (["kulim"], "Kulim (Kedah)", 5.3649, 100.5618, "", 20),
    (["sungai petani", "alor setar", "kedah", "langkawi", "吉打"], "Kedah", 5.6470, 100.4877, "", 30),
    # Perak
    (["ipoh", "kinta", "perak", "taiping", "kampar", "怡保", "霹雳"], "Ipoh (Perak)", 4.5975, 101.0901, "Ipoh (Perak)", 20),
    # Negeri Sembilan & Melaka
    (["seremban", "negeri sembilan", "senawang", "nilai", "sendayan", "芙蓉", "森美兰"], "Seremban (Negeri Sembilan)", 2.7258, 101.9424, "Seremban (Negeri Sembilan)", 20),
    (["melaka", "malacca", "ayer keroh", "马六甲"], "Melaka", 2.1896, 102.2501, "", 20),
    # East Coast & East Malaysia
    (["kuantan", "pahang", "gebeng", "关丹", "彭亨"], "Kuantan (Pahang)", 3.8126, 103.3256, "", 25),
    (["kota kinabalu", "sabah", "sandakan", "tawau", "沙巴", "亚庇"], "Kota Kinabalu (Sabah)", 5.9804, 116.0735, "", 25),
    (["kuching", "sarawak", "miri", "bintulu", "sibu", "砂拉越", "古晋"], "Kuching (Sarawak)", 1.5533, 110.3592, "", 25),
    # Klang Valley / Selangor / KL
    (["cyberjaya", "putrajaya", "sepang", "赛城", "布城"], "Cyberjaya / Putrajaya", 2.9213, 101.6559, "Cyberjaya / Putrajaya", 15),
    (["subang jaya", "subang", "sunway", "bandar sunway", "usj", "梳邦", "双威"], "Subang Jaya / Sunway", 3.0674, 101.6067, "Subang Jaya / Sunway", 12),
    (["shah alam", "glenmarie", "setia alam", "kota kemuning", "莎阿南"], "Shah Alam (Selangor)", 3.0833, 101.5581, "Shah Alam (Selangor)", 15),
    (["klang", "port klang", "bukit raja", "巴生"], "Klang (Selangor)", 3.0449, 101.4456, "Klang (Selangor)", 15),
    (["petaling jaya", "pj", "damansara", "kota damansara", "bandar utama", "kelana jaya", "八打灵"], "Petaling Jaya (Selangor)", 3.1347, 101.6226, "Petaling Jaya (Selangor)", 12),
    (["puchong", "蒲种"], "Puchong (Selangor)", 3.0245, 101.6175, "", 12),
    (["kajang", "bangi", "serdang", "seri kembangan", "加影"], "Kajang / Bangi (Selangor)", 2.9800, 101.7600, "", 15),
    (["cheras", "蕉赖"], "Cheras (KL)", 3.1068, 101.7259, "", 12),
    (["kuala lumpur", "klcc", "kl", "bangsar", "bukit jalil", "mont kiara", "kepong", "吉隆坡"], "Kuala Lumpur (KLCC)", 3.1579, 101.7116, "Kuala Lumpur (KLCC)", 12),
]


def resolve_location_from_text(text: str) -> dict | None:
    """Detect if the user mentioned a specific Malaysian state, city, or district in their prompt."""
    low = (text or "").lower()
    for aliases, label, lat, lng, preset, default_km in LOCATION_ALIASES:
        for a in aliases:
            if len(a) <= 2:
                if re.search(rf"\b{re.escape(a)}\b", low):
                    return {"label": label, "lat": lat, "lng": lng, "city": preset, "default_km": default_km}
            elif a in low:
                return {"label": label, "lat": lat, "lng": lng, "city": preset, "default_km": default_km}
    return None


def _cv_profile(candidate_uid):
    conn = get_db_connection()
    row = conn.execute("SELECT structured_cv_json FROM user_cvs WHERE owner_uid = ?", (candidate_uid,)).fetchone()
    user_row = conn.execute("SELECT role_details_json FROM users WHERE unique_uid = ?", (candidate_uid,)).fetchone()
    conn.close()
    st = {}
    if row:
        try:
            st = json.loads(row["structured_cv_json"]) or {}
        except Exception:
            st = {}
    rd = {}
    if user_row:
        try:
            rd = json.loads(user_row["role_details_json"] or "{}") or {}
        except Exception:
            rd = {}
    skills = st.get("skills") or rd.get("skills") or ["Excel Pivot & Macros", "Financial Reporting", "SQL", "Python"]
    industry = st.get("industry") or rd.get("industry") or "Finance & Accounting"
    keys = {skill_key(s) for s in expand_for_matching(skills)}
    role_text = " ".join(filter(None, [
        st.get("current_role") or rd.get("current_role"),
        st.get("target_role") or rd.get("target_role"),
        " ".join(st.get("experience") or []),
    ]))
    role_toks = _tokens(role_text) | INDUSTRY_ROLE_KEYWORDS.get(industry, set())
    return {
        "has_cv": bool(row),
        "skill_keys": keys,
        "industry": industry,
        "role_tokens": role_toks,
    }


def _score(idx, i, prof):
    """Explainable 0-100 fit: skills overlap (55) + sector fit (25) + role-title relevance (20)."""
    j = idx["jobs"][i]
    sk_ids = j[12]
    sk_keys = idx["skill_keys"]
    matched = [idx["skills"][s] for s in sk_ids if sk_keys[s] in prof["skill_keys"]]
    # Require at least 3 skills in denominator so 1-skill noise postings never get full 55 pts
    denom = max(3, min(len(sk_ids), 5))
    skill_pts = min(55, round(55 * len(matched) / denom))
    industry = CATEGORY_TO_INDUSTRY.get(idx["categories"][j[4]], "")
    sector_pts = 25 if industry and industry == prof["industry"] else 0
    tt = idx["title_tokens"][i]
    overlap = len(tt & prof["role_tokens"])
    title_pts = min(20, overlap * 10)
    score = skill_pts + sector_pts + title_pts
    # True CV match requires either >=2 matched skills, or >=1 matched skill + title/sector alignment
    is_match = (len(matched) >= 2 and (sector_pts > 0 or title_pts > 0)) or (len(matched) >= 3) or (score >= 55)
    return score, matched, is_match


def _applied_js_map(candidate_uid):
    """JobStreet postings this candidate already applied to -> (vacancy row id, application info)."""
    conn = get_db_connection()
    rows = conn.execute(
        """SELECT v.id AS vid, v.vacancy_uid, a.application_uid, a.applied_at, a.share_organised_cv,
                  a.share_original_pdf, a.hr_decision, a.cover_note
             FROM job_applications a JOIN vacancies v ON v.id = a.vacancy_id
            WHERE a.candidate_uid = ? AND v.vacancy_uid LIKE 'JS-%'""",
        (candidate_uid,),
    ).fetchall()
    conn.close()
    return {r["vacancy_uid"]: dict(r) for r in rows}


def _job_payload(idx, i, dist, score, matched, is_match, applied=None):
    j = idx["jobs"][i]
    js_uid = f"JS-{j[0]}"
    sk = [idx["skills"][s] for s in j[12]]
    category = idx["categories"][j[4]]
    return {
        "key": js_uid,
        "id": applied["vid"] if applied else None,
        "source": "jobstreet",
        "can_apply_in_app": False,
        "application_channel": "external",
        "external_apply_url": f"https://my.jobstreet.com/job/{j[0]}",
        "application_notice": "",
        "jobstreet_id": js_uid,
        "vacancy_uid": js_uid,
        "title": j[1],
        "company_name": idx["companies"][j[2]],
        "location": idx["locations"][j[3]],
        "company_category": category,
        "department": category,
        "subcategory": idx["subcategories"][j[5]],
        "employment_type": idx["types"][j[6]],
        "work_mode": idx["types"][j[6]],
        "salary_min": j[7],
        "salary_max": j[8],
        "listing_date": j[9],
        "lat": j[10],
        "lng": j[11],
        "distance_km": round(dist, 1),
        "required_skills": sk[:8],
        "matched_required": matched,
        "match_score": score,
        "is_relevant_to_cv": is_match,
        "description_snippet": j[13],
        "application": {
            "applied": bool(applied),
            "application_uid": applied["application_uid"] if applied else None,
            "applied_at": applied["applied_at"] if applied else None,
            "share_organised_cv": bool(applied["share_organised_cv"]) if applied else False,
            "share_original_pdf": bool(applied["share_original_pdf"]) if applied else False,
            "hr_decision": applied["hr_decision"] if applied else None,
            "cover_note": applied["cover_note"] if applied else "",
        },
    }


def search_nearby(candidate_uid, lat, lng, radius_km=10.0, mode="matched", category="", query="",
                  company="", sort_by="match", offset=0, limit=40, max_dots=1200, employer_vacancies=None):
    """Radius search around (lat, lng).

    mode="matched": only CV-matched jobs in range; mode="all": every job in range.
    Returns map dots aggregated per company location + a paged, sorted job list.
    """
    idx = load_index()
    prof = _cv_profile(candidate_uid)
    applied = _applied_js_map(candidate_uid)
    radius_km = max(1.0, min(float(radius_km or 10), 300.0))
    cat = (category or "").strip()
    cat = "" if cat.lower() in ("", "all") else cat
    q = (query or "").strip().lower()
    company_f = (company or "").strip()

    dlat = radius_km / 111.0
    dlng = radius_km / (111.0 * max(0.2, math.cos(math.radians(lat))))
    jobs = idx["jobs"]
    hits = []
    all_in_range_hits = []
    total_in_range = matched_in_range = 0
    cat_counts = {}

    for i, j in enumerate(jobs):
        jl, jg = j[10], j[11]
        if abs(jl - lat) > dlat or abs(jg - lng) > dlng:
            continue
        d = haversine_km(lat, lng, jl, jg)
        if d > radius_km:
            continue
        score, matched, is_match = _score(idx, i, prof)
        total_in_range += 1
        if is_match:
            matched_in_range += 1
        category_name = idx["categories"][j[4]]
        if not cat or category_name == cat:
            all_in_range_hits.append((i, d, score, matched, is_match))
        if mode != "all" and not is_match and f"JS-{j[0]}" not in applied:
            continue
        cat_counts[category_name] = cat_counts.get(category_name, 0) + 1
        if cat and category_name != cat:
            continue
        if q:
            hay = f"{j[1]} {idx['companies'][j[2]]} {category_name} {idx['subcategories'][j[5]]} " \
                  f"{idx['locations'][j[3]]} {' '.join(idx['skills'][s] for s in j[12])}".lower()
            if q not in hay:
                continue
        hits.append((i, d, score, matched, is_match))

    # Map dots: one per company location; filtered by CV match when mode is matched
    dots = {}
    dot_source = hits if mode != "all" else all_in_range_hits
    for i, d, score, matched, is_match in dot_source:
        j = jobs[i]
        cid = j[2]
        d_lat, d_lng = _disperse_coord(j[10], j[11], cid)
        key = (cid, j[10], j[11])
        dot = dots.get(key)
        if not dot:
            dot = dots[key] = {
                "id": f"c{cid}_{j[10]}_{j[11]}", "name": idx["companies"][cid],
                "lat": d_lat, "lng": d_lng, "distance_km": round(d, 1), "location": idx["locations"][j[3]],
                "category": idx["categories"][j[4]], "jobs": 0, "matched": 0, "best_score": 0, "roles": [],
            }
        dot["jobs"] += 1
        dot["matched"] += 1 if is_match else 0
        dot["best_score"] = max(dot["best_score"], score)
        if len(dot["roles"]) < 5 and j[1] not in dot["roles"]:
            dot["roles"].append(j[1])

    # Employer-portal vacancies (posted directly by HR users) are merged in too
    emp_out = []
    for v in employer_vacancies or []:
        vd = haversine_km(lat, lng, v.get("lat", lat), v.get("lng", lng))
        if vd > radius_km and not (v.get("application") or {}).get("applied"):
            continue

        # Add employer vacancy map dot in range
        if (mode == "all" or v.get("is_relevant_to_cv")) and (not cat or v.get("company_category") == cat or v.get("department") == cat):
            key = ("emp", v.get("company_name"), v.get("lat"), v.get("lng"))
            dot = dots.get(key)
            if not dot:
                dot = dots[key] = {
                    "id": f"e_{v['id']}", "name": v.get("company_name") or "Employer", "lat": v.get("lat"),
                    "lng": v.get("lng"), "distance_km": round(vd, 1), "location": v.get("location") or "",
                    "category": v.get("company_category") or v.get("department") or "", "jobs": 0, "matched": 0,
                    "best_score": 0, "roles": [], "verified_employer": True,
                }
            dot["jobs"] += 1
            dot["matched"] += 1 if v.get("is_relevant_to_cv") else 0
            dot["best_score"] = max(dot["best_score"], v.get("match_score") or 0)
            if len(dot["roles"]) < 5 and v["title"] not in dot["roles"]:
                dot["roles"].append(v["title"])

        if mode != "all" and not v.get("is_relevant_to_cv") and not (v.get("application") or {}).get("applied"):
            continue
        if cat and v.get("company_category") != cat and v.get("department") != cat:
            continue
        if q and q not in f"{v['title']} {v.get('company_name','')} {v.get('department','')} {' '.join(v.get('required_skills') or [])}".lower():
            continue
        v = {**v, "distance_km": round(vd, 1), "source": "employer", "key": f"V-{v['id']}"}
        emp_out.append(v)

    raw_dots = list(dots.values())
    if mode != "all":
        raw_dots = [d for d in raw_dots if d.get("matched", 0) > 0 or d.get("best_score", 0) >= 50]
    if sort_by == "distance":
        dot_list = sorted(raw_dots, key=lambda x: (x["distance_km"], -x["best_score"], -x["matched"]))
    else:
        dot_list = sorted(raw_dots, key=lambda x: (-x["best_score"], -x["matched"], x["distance_km"]))
    cap = 400 if mode != "all" else max_dots
    dots_truncated = len(dot_list) > cap
    dot_list = dot_list[:cap]

    # Job list (optionally narrowed to a single company dot)
    if company_f:
        hits = [h for h in hits if idx["companies"][jobs[h[0]][2]] == company_f]
        emp_out = [v for v in emp_out if v.get("company_name") == company_f]
    if sort_by == "distance":
        hits.sort(key=lambda h: (h[1], -(h[2])))
    elif sort_by == "salary":
        hits.sort(key=lambda h: (-(jobs[h[0]][8] or jobs[h[0]][7] or 0), -(h[2]), h[1]))
    else:
        hits.sort(key=lambda h: (-(h[2]), h[1]))
    js_items = [_job_payload(idx, i, d, s, m, im, applied.get(f"JS-{jobs[i][0]}")) for i, d, s, m, im in hits]
    if sort_by == "distance":
        combined = sorted(emp_out + js_items,
                          key=lambda x: (not x["application"]["applied"], x["distance_km"], -(x.get("match_score") or 0)))
    elif sort_by == "salary":
        combined = sorted(emp_out + js_items,
                          key=lambda x: (not x["application"]["applied"], -(x.get("salary_max") or x.get("salary_min") or 0), -(x.get("match_score") or 0)))
    else:
        combined = sorted(emp_out + js_items,
                          key=lambda x: (not x["application"]["applied"], -(x.get("match_score") or 0), x["distance_km"]))
    total = len(combined)
    page = combined[offset:offset + limit]

    return {
        "radius_km": radius_km,
        "mode": "all" if mode == "all" else "matched",
        "has_cv": prof["has_cv"],
        "summary": {
            "jobs_in_range": total_in_range,
            "matched_in_range": matched_in_range,
            "shown_jobs": total,
            "companies_on_map": len(dot_list),
            "dots_truncated": dots_truncated,
        },
        "categories": [c for c, _ in sorted(cat_counts.items(), key=lambda kv: -kv[1])],
        "dots": dot_list,
        "jobs": page,
        "offset": offset,
        "has_more": offset + limit < total,
        "dataset": stats(),
    }


def external_application_url(js_uid):
    match = re.fullmatch(r"(?:JS-)?([0-9]+)", str(js_uid))
    if not match:
        return None
    job_id = int(match.group(1))
    if job_id not in load_index()["by_id"]:
        return None
    return f"https://my.jobstreet.com/job/{job_id}"


def materialize_vacancy(js_uid):
    """Ensure a JobStreet posting exists in `vacancies` (owner_uid = JS id) and return its row id."""
    try:
        job_id = int(str(js_uid).replace("JS-", ""))
    except ValueError:
        return None
    idx = load_index()
    pos = idx["by_id"].get(job_id)
    if pos is None:
        return None
    j = idx["jobs"][pos]
    uid = f"JS-{job_id}"
    conn = get_db_connection()
    row = conn.execute("SELECT id FROM vacancies WHERE vacancy_uid = ?", (uid,)).fetchone()
    if row:
        conn.close()
        return row["id"]
    skills = [idx["skills"][s] for s in j[12]]
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO vacancies (vacancy_uid, owner_uid, title, department, work_mode, location, salary_min,
           salary_max, min_years, education_level, required_skills_json, preferred_skills_json, status, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (uid, uid, j[1], idx["categories"][j[4]], "On-site", idx["locations"][j[3]], j[7] or 0,
         j[8] or j[7] or 0, 0, "Diploma / TVET", json.dumps(skills[:6]), json.dumps(skills[6:12]), "Open",
         datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")),
    )
    conn.commit()
    vid = cur.lastrowid
    conn.close()
    return vid


import urllib.parse
import urllib.request


def search_map_places(query: str, limit: int = 6) -> list[dict]:
    """Search real Malaysian buildings, condos, streets, suburbs, or cities via local geo index + cloud-safe search."""
    q = (query or "").strip()
    if len(q) < 2:
        return []
    results = []
    seen = set()

    # 1. Local fast offline search (RunPod & Local safe, 0ms latency)
    loc_hit = resolve_location_from_text(q)
    if loc_hit:
        key = (round(loc_hit["lat"], 3), round(loc_hit["lng"], 3), loc_hit["label"].lower())
        if key not in seen:
            seen.add(key)
            results.append({
                "label": loc_hit["label"],
                "address": f"{loc_hit['label']}, Malaysia",
                "short_label": loc_hit["label"],
                "full_address": f"{loc_hit['label']}, Malaysia",
                "lat": loc_hit["lat"],
                "lng": loc_hit["lng"],
                "place_type": "city / district",
                "source": "Malaysia Geo Index",
            })

    geo_path = os.path.join(DATA_DIR, "jobstreet_geocache.json")
    if os.path.exists(geo_path):
        try:
            gcache = json.load(open(geo_path, encoding="utf-8"))
            low_q = q.lower()
            for loc_name, coords in gcache.items():
                if coords and low_q in loc_name.lower():
                    lat, lng = round(float(coords[0]), 5), round(float(coords[1]), 5)
                    key = (round(lat, 3), round(lng, 3), loc_name.lower())
                    if key not in seen:
                        seen.add(key)
                        results.append({
                            "label": loc_name,
                            "address": f"{loc_name}, Malaysia",
                            "short_label": loc_name,
                            "full_address": f"{loc_name}, Malaysia",
                            "lat": lat,
                            "lng": lng,
                            "place_type": "district / area",
                            "source": "Malaysia Geo Index",
                        })
                    if len(results) >= limit:
                        break
        except Exception:
            pass

    # 2. If results < limit, supplement with live Nominatim (short timeout, won't hang RunPod)
    if len(results) < limit:
        search_q = q if "malaysia" in q.lower() else f"{q}, Malaysia"
        url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
            "q": search_q,
            "format": "json",
            "addressdetails": 1,
            "limit": limit,
            "countrycodes": "my",
        })
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "CareerLensAI-Malaysia-Production/2.0 (contact@careerlens.my)"})
            with urllib.request.urlopen(req, timeout=1.8) as resp:
                items = json.loads(resp.read().decode("utf-8"))
                for it in items:
                    lat = round(float(it["lat"]), 5)
                    lng = round(float(it["lon"]), 5)
                    disp = it.get("display_name") or q
                    parts = [p.strip() for p in disp.split(",") if p.strip() and p.strip().lower() != "malaysia"]
                    short_label = ", ".join(parts[:2]) if len(parts) >= 2 else (parts[0] if parts else q)
                    full_addr = ", ".join(parts[:5])
                    key = (round(lat, 3), round(lng, 3), short_label.lower())
                    if key not in seen:
                        seen.add(key)
                        results.append({
                            "label": short_label,
                            "address": full_addr,
                            "short_label": short_label,
                            "full_address": full_addr,
                            "lat": lat,
                            "lng": lng,
                            "place_type": (it.get("type") or it.get("class") or "place").replace("_", " "),
                            "source": "Malaysia Verified Places",
                        })
                    if len(results) >= limit:
                        break
        except Exception:
            pass
    if len(results) < limit:
        loc_hit = resolve_location_from_text(q)
        if loc_hit:
            key = (round(loc_hit["lat"], 3), round(loc_hit["lng"], 3), loc_hit["label"].lower())
            if key not in seen:
                seen.add(key)
                results.append({
                    "label": loc_hit["label"],
                    "address": f"{loc_hit['label']}, Malaysia",
                    "short_label": loc_hit["label"],
                    "full_address": f"{loc_hit['label']}, Malaysia",
                    "lat": loc_hit["lat"],
                    "lng": loc_hit["lng"],
                    "place_type": "district / city",
                    "source": "Malaysia Geo Index",
                })
        geo_path = os.path.join(DATA_DIR, "jobstreet_geocache.json")
        if os.path.exists(geo_path):
            try:
                gcache = json.load(open(geo_path, encoding="utf-8"))
                low_q = q.lower()
                for loc_name, coords in gcache.items():
                    if coords and low_q in loc_name.lower():
                        lat, lng = round(float(coords[0]), 5), round(float(coords[1]), 5)
                        key = (round(lat, 3), round(lng, 3), loc_name.lower())
                        if key not in seen:
                            seen.add(key)
                            results.append({
                                "label": loc_name,
                                "address": f"{loc_name}, Malaysia",
                                "short_label": loc_name,
                                "full_address": f"{loc_name}, Malaysia",
                                "lat": lat,
                                "lng": lng,
                                "place_type": "district",
                                "source": "Malaysia Geo Index",
                            })
                        if len(results) >= limit:
                            break
            except Exception:
                pass

    return results[:limit]


def reverse_geocode_coords(lat: float, lng: float) -> dict:
    """Identify the real street, condo/building, suburb, and city for GPS or map-clicked coordinates."""
    lat, lng = round(float(lat), 5), round(float(lng), 5)
    url = "https://nominatim.openstreetmap.org/reverse?" + urllib.parse.urlencode({
        "lat": lat,
        "lon": lng,
        "format": "json",
        "zoom": 18,
        "addressdetails": 1,
    })
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CareerLensAI-Malaysia/1.0"})
        with urllib.request.urlopen(req, timeout=4.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            addr = data.get("address") or {}
            building = addr.get("building") or addr.get("amenity") or addr.get("residential") or addr.get("shop") or ""
            road = addr.get("road") or addr.get("pedestrian") or ""
            suburb = addr.get("suburb") or addr.get("neighbourhood") or addr.get("quarter") or addr.get("village") or ""
            city = addr.get("city") or addr.get("town") or addr.get("municipality") or addr.get("district") or addr.get("state") or "Malaysia"
            postcode = addr.get("postcode") or ""

            short_parts = [p for p in [building or road, suburb or city] if p]
            short_label = ", ".join(dict.fromkeys(short_parts)) or city
            full_parts = [p for p in [building, road, suburb, postcode, city] if p]
            full_address = ", ".join(dict.fromkeys(full_parts)) or data.get("display_name") or f"GPS ({lat:.4f}, {lng:.4f})"
            return {
                "ok": True,
                "label": short_label[:65],
                "address": full_address[:140],
                "short_label": short_label[:65],
                "full_address": full_address[:140],
                "lat": lat,
                "lng": lng,
                "source": "OpenStreetMap Reverse Geocode",
            }
    except Exception:
        pass

    # Fallback to nearest known Malaysian district
    best_label = "Kuala Lumpur"
    best_dist = 999999.0
    for _, label, al_lat, al_lng, _, _ in LOCATION_ALIASES:
        d = haversine_km(lat, lng, al_lat, al_lng)
        if d < best_dist:
            best_dist = d
            best_label = label
    return {
        "ok": True,
        "label": f"Near {best_label}",
        "address": f"GPS ({lat:.4f}, {lng:.4f}) · near {best_label}",
        "short_label": f"Near {best_label}",
        "full_address": f"GPS ({lat:.4f}, {lng:.4f}) · near {best_label}",
        "lat": lat,
        "lng": lng,
        "source": "Malaysia Geo Fallback",
    }
