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

STOPWORDS = {
    "and", "or", "of", "in", "the", "for", "with", "junior", "senior",
    "lead", "principal", "staff", "associate", "intern", "executive"
}

SYNONYMS = {
    "copywriter": "copy writer",
    "copywriters": "copy writers",
    "hr": "human resources",
    "dev": "developer",
    "swe": "software developer",
    "software engineer": "software developer",
    "frontend developer": "software developer",
    "backend developer": "software developer",
    "fullstack developer": "software developer",
    "qa": "quality assurance",
}


def _stem(word):
    """Normalize common plural and derivational endings for reliable occupational token matching."""
    w = word.lower()
    for suff in ("ing", "ers", "er", "ors", "or", "s", "es", "ists", "ist", "ed"):
        if len(w) > len(suff) + 2 and w.endswith(suff):
            return w[:-len(suff)]
    return w


def load_pathways_data():
    global _PATHWAYS_CACHE
    if _PATHWAYS_CACHE is None:
        if os.path.exists(DATA_PATH):
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                _PATHWAYS_CACHE = json.load(f)
        else:
            _PATHWAYS_CACHE = {"occupations": {}, "title_index": {}}
    return _PATHWAYS_CACHE


def _score_title_match(query, target_title):
    q_norm = query.lower()
    for k, v in SYNONYMS.items():
        q_norm = re.sub(r"\b" + re.escape(k) + r"\b", v, q_norm)
    t_norm = target_title.lower()

    if q_norm == t_norm:
        return 1000

    q_tokens = [w for w in re.findall(r"\w+", q_norm) if len(w) > 1 and w not in STOPWORDS]
    t_tokens = [w for w in re.findall(r"\w+", t_norm) if len(w) > 1 and w not in STOPWORDS]

    if not q_tokens or not t_tokens:
        return 0

    q_stems = [_stem(w) for w in q_tokens]
    t_stems = [_stem(w) for w in t_tokens]

    score = 0
    # Exact full match of token set
    if set(q_tokens) == set(t_tokens):
        score += 300
    if set(q_stems) == set(t_stems):
        score += 200

    # Substring phrase match
    if q_norm in t_norm:
        score += 60

    # Subset matching bonus: target occupation terms are completely inside the user query
    if set(t_stems).issubset(set(q_stems)):
        score += 45

    # Token stem matches
    for qs in q_stems:
        if qs in t_stems:
            score += 30
        elif any(qs in ts or ts in qs for ts in t_stems):
            score += 15
        elif qs in t_norm:
            score += 10

    # Prefer closer length to avoid picking broad umbrella titles when specific matches exist
    score -= abs(len(q_tokens) - len(t_tokens)) * 1.5
    return score


def find_occupation_pathways(title_query):
    """Semantic fuzzy lookup for career pathways for a given occupation title."""
    data = load_pathways_data()
    occupations = data.get("occupations", {})
    title_index = data.get("title_index", {})

    if not title_query or not occupations:
        return None

    clean_query = title_query.strip().lower()

    # 1. Exact match in index
    if clean_query in title_index:
        code = title_index[clean_query]
        return occupations.get(code)

    # 2. Scored semantic and token match
    best_code = None
    best_score = 0

    for code, occ in occupations.items():
        s = _score_title_match(clean_query, occ["title"])
        if s > best_score:
            best_score = s
            best_code = code

    if best_code and best_score >= 10:
        return occupations.get(best_code)

    # 3. Fallback to reasonable default if no match
    default_code = title_index.get("software developers, applications") or next(iter(occupations.keys()), None)
    return occupations.get(default_code) if default_code else None


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
