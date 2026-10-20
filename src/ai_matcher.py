"""Member 1 Module: Explainable Future-Role Matching, Skills Gap & Personalized Quiz Generator."""

import json
import os

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


def match_user_to_roles(profile: dict, scenario: str = "moderate") -> dict:
    """Compute explainable match scores, transferable skills, skills gap, and ordered learning pathway."""
    roles = load_json("future_roles.json")
    courses_db = load_json("verified_courses.json")

    user_skills = set(s.strip() for s in profile.get("skills", []))
    user_industry = profile.get("industry", "")
    user_work_mode = profile.get("work_mode_preference", "Hybrid")

    ranked_roles = []
    for role in roles:
        core_set = set(role["core_skills"])
        trans_set = set(role["transferable_from"])

        matched_core = list(user_skills.intersection(core_set))
        matched_trans = list(user_skills.intersection(trans_set))
        missing_skills = [s for s in role["core_skills"] if s not in user_skills]

        # Explainable score components
        core_pts = round((len(matched_core) / max(1, len(core_set))) * 50)
        trans_pts = round((len(matched_trans) / max(1, len(trans_set))) * 25)
        industry_pts = 15 if role["industry"] == user_industry else 8
        mode_pts = 10 if user_work_mode in role["work_modes"] else 5

        scenario_delta = role["fast_ai_boost"] if scenario == "fast" else 0
        total_score = min(98, core_pts + trans_pts + industry_pts + mode_pts + (scenario_delta // 2))

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
            "demand_outlook": min(99, role["rising_demand_base"] + scenario_delta),
            "work_modes": role["work_modes"],
            "explainable_breakdown": {
                "core_skills_match_pct": core_pts,
                "transferable_skills_pct": trans_pts,
                "industry_alignment_pct": industry_pts,
                "work_mode_fit_pct": mode_pts,
                "gap_to_close_pct": max(0, 100 - total_score),
            },
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
        "fairness_audit": "Verified: Age, gender, ethnicity, and personal identifiers excluded from scoring.",
        "verification_questions": generate_verification_questions(list(user_skills), user_industry),
        "recommended_roles": ranked_roles,
    }
