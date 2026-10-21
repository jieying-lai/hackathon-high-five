"""Career Pathways Engine for CareerLens AI.

Powered by O*NET 29.0 Career Changers & Starters Matrix,
providing Malaysian jobseekers with interactive career progression ladders,
lateral transition pathways, and skill gap bridging recommendations.
"""

import json
import os
import re

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "career_pathways.json")

_PATHWAYS_CACHE = None


def load_pathways_data():
    global _PATHWAYS_CACHE
    if _PATHWAYS_CACHE is None:
        if os.path.exists(DATA_PATH):
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                _PATHWAYS_CACHE = json.load(f)
        else:
            _PATHWAYS_CACHE = {"occupations": {}, "title_index": {}}
    return _PATHWAYS_CACHE


def find_occupation_pathways(title_query):
    """Fuzzy lookup for career pathways for a given occupation title."""
    data = load_pathways_data()
    occupations = data.get("occupations", {})
    title_index = data.get("title_index", {})

    if not title_query or not occupations:
        return None

    clean_query = title_query.strip().lower()

    # 1. Exact match
    if clean_query in title_index:
        code = title_index[clean_query]
        return occupations.get(code)

    # 2. Token overlap search
    query_tokens = set(re.findall(r"\w+", clean_query))
    best_match = None
    best_score = 0

    for norm_title, code in title_index.items():
        title_tokens = set(re.findall(r"\w+", norm_title))
        overlap = len(query_tokens & title_tokens)
        if overlap > best_score:
            best_score = overlap
            best_match = code

    if best_match and best_score >= 1:
        return occupations.get(best_match)

    # 3. Fallback to first available occupation
    first_code = next(iter(occupations.keys()), None)
    return occupations.get(first_code) if first_code else None


def get_pathways_summary(role_title):
    """Returns a structured summary of vertical and lateral career routes."""
    occ = find_occupation_pathways(role_title)
    if not occ:
        return {
            "current_role": role_title or "Professional",
            "job_zone": 3,
            "advancements": [],
            "lateral_transitions": [],
        }

    return {
        "current_role": occ["title"],
        "job_zone": occ.get("zone", 3),
        "code": occ["code"],
        "advancements": occ.get("advancement_pathways", [])[:5],
        "lateral_transitions": occ.get("lateral_transitions", [])[:5],
    }
