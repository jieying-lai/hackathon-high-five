"""Validate a self-reported career conversation without inventing credentials."""

EXPERIENCE_CHOICES = {"Still studying", "Just starting", "1–2 years", "3–5 years", "6+ years"}
WORK_MODES = {"Remote", "Hybrid", "On-site"}


def build_guided_spec(body: dict, user: dict) -> dict:
    def text(key, maximum, required=False):
        value = body.get(key, "")
        if not isinstance(value, str) or len(value) > maximum:
            raise ValueError(f"Please check your {key.replace('_', ' ')} answer.")
        value = value.strip()
        if required and len(value) < 2:
            raise ValueError(f"Please add your {key.replace('_', ' ')}.")
        return value

    role = text("role", 120, required=True)
    years = text("years", 40, required=True)
    work_mode = text("work_mode", 40, required=True)
    if years not in EXPERIENCE_CHOICES or work_mode not in WORK_MODES:
        raise ValueError("Please choose a valid experience level and preferred work setting.")
    raw_skills = body.get("skills")
    if not isinstance(raw_skills, list) or not 1 <= len(raw_skills) <= 20:
        raise ValueError("Please choose between 1 and 20 skills.")
    skills = []
    for skill in raw_skills:
        if not isinstance(skill, str) or not 1 <= len(skill.strip()) <= 80:
            raise ValueError("Each skill must contain between 1 and 80 characters.")
        if skill.strip() not in skills:
            skills.append(skill.strip())
    achievement = text("experience_highlight", 2000)
    education = text("education", 1000)
    return {
        "source_grounded": True,
        "name": user.get("display_name") or user.get("username") or "Candidate",
        "email": user.get("email", ""),
        "phone": "",
        "location": "",
        "role": role,
        "industry": "Career profile",
        "years": years,
        "work_mode": work_mode,
        "summary": f"Interested in opportunities as {role}. Self-reported skills include {', '.join(skills)}.",
        "experience": [],
        "projects": [achievement] if achievement else [],
        "education": [education] if education else [],
        "certifications": [],
        "skills": skills,
    }
