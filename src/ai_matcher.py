"""Member 1 Module: Explainable Future-Role Matching, Skills Gap & Personalized Quiz Generator."""

import json
import os
import re

from trend_signals import get_role_market_signal, load_skill_demand
from skills_taxonomy import expand_for_matching, extract_skills

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def load_json(filename: str):
    with open(os.path.join(DATA_DIR, filename), encoding="utf-8") as f:
        return json.load(f)


def generate_verification_questions(user_skills: list[str], industry: str) -> list[dict]:
    """Generate 3 personalized skill-verification questions based on the user's CV skills."""
    questions = []
    for sk in user_skills[:2]:
        questions.append({
            "skill_tested": sk,
            "question": f"Your profile lists '{sk}'. Can you describe a real project or workflow where you applied {sk} independently to solve a bottleneck?",
            "purpose": "Verifies practical depth vs. surface keyword mention (Rule 02 & 03)"
        })
    questions.append({
        "skill_tested": "Adaptability & AI Readiness",
        "question": f"In {industry}, repetitive tasks are shifting to AI co-pilots. Which part of your current workflow would you automate first, and what human judgment must remain under your control?",
        "purpose": "Assesses human-in-the-loop readiness & reskilling motivation"
    })
    return questions


def _skill_aliases(skill: str, profile_evidence: bool = False) -> set[str]:
    """Return exact, curated taxonomy aliases for one skill (no fuzzy guessing)."""
    expanded = expand_for_matching([skill])
    if profile_evidence:
        expanded.extend(extract_skills(skill))
    return {_skill_key(value) for value in expanded if value}


def _skill_key(value: str) -> str:
    value = re.sub(r"[^\w+#]+", " ", str(value or "").casefold(), flags=re.UNICODE)
    value = re.sub(r"\s+", " ", value).strip()
    return value[:-7].strip() if value.endswith(" basics") else value


def _match_skills(profile_skills: list[str], target_skills: list[str]) -> list[dict]:
    """Match by case-insensitive exact names or curated taxonomy aliases."""
    profile = [str(skill).strip() for skill in profile_skills if str(skill).strip()]
    profile_aliases = [(skill, _skill_aliases(skill, profile_evidence=True) | {_skill_key(skill)}) for skill in profile]
    matches = []
    for required in target_skills:
        required_aliases = _skill_aliases(required) | {_skill_key(required)}
        evidence = next((skill for skill, aliases in profile_aliases if aliases & required_aliases), None)
        if evidence is not None:
            matches.append({"required_skill": required, "profile_skill": evidence})
    return matches


def match_user_to_roles(profile: dict, scenario: str = "moderate") -> dict:
    """Compute explainable match scores, transferable skills, skills gap, and ordered learning pathway."""
    roles = load_json("future_roles.json")
    courses_db = load_json("verified_courses.json")

    raw_skills = profile.get("skills", [])
    user_skills = [str(skill).strip() for skill in raw_skills if str(skill).strip()] if isinstance(raw_skills, list) else []
    user_industry = profile.get("industry", "")
    user_work_mode = profile.get("work_mode_preference", "")
    demand = load_skill_demand()  # measured posting-share changes; see scripts/build_skill_demand.py

    ranked_roles = []
    for role in roles:
        core_set = set(role["core_skills"])
        trans_set = set(role["transferable_from"])

        core_matches = _match_skills(user_skills, role["core_skills"])
        trans_matches = _match_skills(user_skills, role["transferable_from"])
        matched_core = [item["required_skill"] for item in core_matches]
        matched_trans = [item["required_skill"] for item in trans_matches]
        missing_skills = [s for s in role["core_skills"] if s not in matched_core]

        # The fit score reflects profile skills and stated preferences only.
        # Market demand and AI-adoption scenarios are shown separately.
        core_pts = round((len(core_matches) / max(1, len(core_set))) * 70)
        trans_pts = round((len(trans_matches) / max(1, len(trans_set))) * 20)
        industry_match = bool(user_industry) and role["industry"].strip().casefold() == str(user_industry).strip().casefold()
        industry_pts = 7 if industry_match else 0
        mode_match = bool(user_work_mode) and user_work_mode.strip().casefold() in {m.casefold() for m in role["work_modes"]}
        mode_pts = 3 if mode_match else 0

        market = get_role_market_signal(role, demand)
        market_pts = market["market_adjustment_pts"]  # shown as market context, not candidate fit
        scenario_delta = role["fast_ai_boost"] if scenario == "fast" else 0  # stated What-If assumption
        total_score = max(0, min(100, core_pts + trans_pts + industry_pts + mode_pts))

        score_components = [
            {"key": "core_skills", "points": core_pts, "max_points": 70,
             "matched": core_matches, "required": role["core_skills"]},
            {"key": "transferable_skills", "points": trans_pts, "max_points": 20,
             "matched": trans_matches, "required": role["transferable_from"]},
            {"key": "industry_alignment", "points": industry_pts, "max_points": 7,
             "matched": industry_match, "profile_value": user_industry or "", "role_value": role["industry"]},
            {"key": "work_mode_fit", "points": mode_pts, "max_points": 3,
             "matched": mode_match, "profile_value": user_work_mode or "", "role_value": role["work_modes"]},
        ]

        # Build ordered reskilling pathway strictly from verified courses (Never invent courses!)
        pathway = []
        total_hours = 0
        for idx, gap_skill in enumerate(missing_skills, start=1):
            course = courses_db.get(gap_skill)
            if course:
                total_hours += course["hours"]
                pathway.append({
                    "step": idx,
                    "phase": f"Phase {idx} (Week {idx * 2 - 1}–{idx * 2})",
                    "target_skill": gap_skill,
                    "difficulty": "Easy (1-2 wks)" if course["hours"] <= 6 else "Moderate (2-3 wks)",
                    "course_title": course["title"],
                    "provider": course["provider"],
                    "hours": course["hours"],
                    "cost_type": course["cost_type"],
                    "malaysia_badge": course["malaysia_badge"],
                    "sdg": course["sdg"],
                    "url": course["url"],
                })

        ranked_roles.append({
            "role_id": role["role_id"],
            "title": role["title"],
            "industry": role["industry"],
            "match_score": total_score,
            "demand_outlook": max(0, min(99, role["rising_demand_base"] + 2 * market_pts + scenario_delta)),
            "demand_signal": {
                "prior_outlook": role["rising_demand_base"],
                "prior_is": "expert starting point, not measured",
                "market_adjustment_pts": market_pts,
                "scenario_delta": scenario_delta,
                **{k: market[k] for k in ("mean_change_pct", "coverage", "measured_skills", "low_sample_skills",
                                          "baseline_window", "recent_window", "data_through", "source", "note")},
            },
            "work_modes": role["work_modes"],
            "explainable_breakdown": {
                "core_skills_match_pct": round((len(core_matches) / max(1, len(core_set))) * 100),
                "transferable_skills_pct": round((len(trans_matches) / max(1, len(trans_set))) * 100),
                "industry_alignment_pct": 100 if industry_match else 0,
                "work_mode_fit_pct": 100 if mode_match else 0,
                "market_demand_adjustment_pts": market_pts,
                "gap_to_close_pct": round((len(missing_skills) / max(1, len(core_set))) * 100),
                "scenario_adjustment_pct": 0,
            },
            "score_components": score_components,
            "score_method": "skills_first_v2",
            "score_note": "Fit score uses profile skill matches (70 points), transferable skills (20), industry (7), and work mode (3). Market demand and AI-adoption scenarios are separate from fit.",
            "matched_core_skills": matched_core,
            "matched_transferable_skills": matched_trans,
            "skills_gap": missing_skills,
            "ordered_pathway": pathway,
            "estimated_total_hours": total_hours,
            "sdg_tags": role["sdg_tags"],
        })

    ranked_roles.sort(key=lambda r: r["match_score"], reverse=True)
    return {
        "candidate_name": profile.get("name", "Anonymous User"),
        "scenario_applied": scenario,
        "fairness_audit": "Protected attributes excluded from scoring. Statistical parity has not been audited.",
        "verification_questions": generate_verification_questions(list(user_skills), user_industry),
        "recommended_roles": ranked_roles,
    }
