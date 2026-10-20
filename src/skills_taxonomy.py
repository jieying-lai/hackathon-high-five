"""Skill taxonomy and NLP Resume Parser Lexicon engine.

Combines CareerLens AI's canonical skill taxonomy with the 1,237-skill dictionary,
174 academic majors catalog, 5 behavioral competency pillars, and measurable-impact
action-verb analyzer adapted from `MoinDalvs/Resume_Screening_and_Parser`.
"""

import json
import os
import re

# (canonical name, [regex alternatives], [extra names emitted for matching])
_TAXONOMY = [
    # --- software & data ---
    ("Python", [r"python"], []),
    ("SQL", [r"sql", r"mysql", r"postgres(?:ql)?", r"sqlite", r"t-sql", r"pl/sql", r"ms-sql"], ["SQL Basics"]),
    ("REST APIs", [r"rest(?:ful)?\s+apis?", r"restful", r"web apis?", r"api development", r"api integration"], []),
    ("Git", [r"git(?:hub|lab)?"], []),
    ("React", [r"react(?:\.?js)?", r"reactjs"], []),
    ("Docker", [r"docker"], []),
    ("Data Structures", [r"data structures?(?:\s+and\s+algorithms)?", r"dsa", r"algorithms"], []),
    ("HTML/CSS/JS", [r"html5?", r"css3?", r"javascript", r"es6"], []),
    ("PHP", [r"php"], []),
    ("Java", [r"java(?!script)"], []),
    ("C++", [r"c\+\+"], []),
    ("Node.js", [r"node\.?js"], []),
    ("Flask", [r"flask"], []),
    ("Django", [r"django"], []),
    ("FastAPI", [r"fastapi"], []),
    ("Pandas", [r"pandas"], []),
    ("NumPy", [r"numpy"], []),
    ("Machine Learning", [r"machine learning", r"scikit-learn", r"sklearn"], []),
    ("Power BI", [r"power\s?bi", r"ssrs", r"ssis", r"ssas"], []),
    ("Tableau", [r"tableau"], []),
    ("AWS", [r"aws", r"amazon web services", r"ec2"], []),
    ("Azure", [r"azure"], []),
    ("Google Cloud", [r"gcp", r"google cloud"], []),
    ("Linux", [r"linux", r"unix", r"rhel"], []),
    # --- AI ---
    ("LLM Orchestration (LangChain/LlamaIndex)", [r"langchain", r"llamaindex", r"llm orchestration", r"large language models?", r"llms?"], []),
    ("Vector Databases & RAG", [r"rag", r"vector (?:database|db|store)s?", r"retrieval[- ]augmented(?: generation)?", r"pinecone", r"chroma(?:db)?", r"faiss"], []),
    ("Prompt Engineering", [r"prompt engineering", r"prompt design", r"prompting"], []),
    ("AI Workflow Automation (Make/Zapier)", [r"zapier", r"make\.com", r"n8n", r"workflow automation", r"process automation", r"rpa"], []),
    ("AI Guardrails & Evaluation", [r"guardrails?", r"llm evaluation", r"model evaluation"], []),
    # --- finance ---
    ("Financial Auditing", [r"audit(?:ing|ed|or|s)?", r"statutory audit", r"internal audit"], []),
    ("Risk Assessment", [r"risk assessments?", r"risk management", r"risk analysis", r"risk register", r"risk control"], []),
    ("Tax Compliance", [r"tax compliance", r"taxation", r"tax (?:filing|returns?|updates?)", r"gst", r"sst"], []),
    ("Financial Reporting", [r"financial reporting", r"financial statements?", r"management accounts?", r"month[- ]end", r"general ledger"], []),
    ("Excel Pivot & Macros", [r"excel", r"pivot tables?", r"macros?", r"vba", r"vlookups?"], []),
    ("ESG & Carbon Reporting Standards", [r"esg", r"sustainability reporting", r"carbon (?:footprint|reporting|accounting)", r"ghg"], []),
    # --- marketing ---
    ("Copywriting", [r"copywriting", r"copywriter", r"content writing"], []),
    ("SEO Content Strategy", [r"seo", r"search engine optimi[sz]ation"], []),
    ("Google Analytics", [r"google analytics", r"ga4"], []),
    ("Social Media Campaigns", [r"social media"], []),
    ("Canva & Basic Design", [r"canva", r"figma", r"adobe (?:photoshop|illustrator)"], []),
    ("Bilingual Communication", [r"bilingual", r"multilingual", r"mandarin", r"bahasa"], []),
    # --- people & operations ---
    ("Skills Architecture Mapping", [r"skills? (?:architecture|mapping|framework)"], []),
    ("AI Bias & Fairness Auditing", [r"bias audit", r"fairness audit", r"ai fairness", r"algorithmic bias"], []),
    ("Change Management", [r"change management"], []),
    ("People Data Analytics", [r"people analytics", r"hr analytics", r"workforce analytics", r"workday", r"peoplesoft", r"hrms", r"hcm"], []),
    ("Recruitment", [r"recruit(?:ment|ing|er)", r"talent acquisition"], []),
    ("Data Privacy (PDPA)", [r"pdpa", r"data privacy", r"personal data protection", r"gdpr"], []),
    ("Project Management", [r"project management", r"scrum", r"agile", r"jira", r"sdlc"], []),
    ("Leadership", [r"leadership", r"team lead"], []),
]

_PATTERNS = [
    (name, re.compile(r"(?<![A-Za-z0-9+#])(?:" + "|".join(alts) + r")(?![A-Za-z0-9+#])", re.I), extra)
    for name, alts, extra in _TAXONOMY
]
_EXTRA_BY_NAME = {name: extra for name, _, extra in _PATTERNS}
CANONICAL_SKILLS = [name for name, _, _ in _TAXONOMY]

_PY_DATA = re.compile(r"pandas|numpy|data analysis|data analytics|matplotlib|seaborn", re.I)

_LEXICON_CACHE = None


def load_parser_lexicon() -> dict:
    """Load the MoinDalvs-derived resume parser lexicon (1,237 skills, competencies, majors)."""
    global _LEXICON_CACHE
    if _LEXICON_CACHE is None:
        path = os.path.join(os.path.dirname(__file__), "data", "resume_parser_lexicon.json")
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                _LEXICON_CACHE = json.load(f)
        else:
            _LEXICON_CACHE = {
                "skills_dictionary": [],
                "competencies": {},
                "measurable_results": {},
                "majors_catalog": [],
                "dataset_role_benchmarks": {},
            }
    return _LEXICON_CACHE


def skill_key(skill: str) -> str:
    """Normalised comparison key: case-insensitive, 'SQL Basics' == 'SQL'."""
    s = (skill or "").strip().lower()
    return s[:-7].strip() if s.endswith(" basics") else s


def extract_skills(text: str) -> list:
    """Return canonical skills evidenced anywhere in the text (taxonomy order)."""
    found = [name for name, rx, _ in _PATTERNS if rx.search(text)]
    if "Python" in found and _PY_DATA.search(text):
        found.append("Python Data Analysis")
    return found


def extract_extended_lexicon_skills(text: str, limit: int = 18) -> list[str]:
    """Extract granular technical & domain skills using the 1,237-skill dictionary from skills.csv."""
    lex = load_parser_lexicon()
    low = (text or "").lower()
    tokens = set(re.findall(r"[a-z0-9+#./\-]+", low))
    matched = []
    # Curated high-signal technical & business terms from skills.csv
    for sk in lex.get("skills_dictionary", []):
        if len(sk) < 3:
            continue
        if " " in sk:
            if sk in low:
                matched.append(sk.title() if len(sk) > 4 else sk.upper())
        else:
            if sk in tokens:
                matched.append(sk.upper() if sk in {"sql", "aws", "erp", "sap", "api", "seo", "kpi", "etl", "crm", "cms", "xml", "css", "html", "gaap", "pmp"} else sk.title())
        if len(matched) >= limit:
            break
    return matched


def expand_for_matching(skills) -> list:
    """Add alias names used by the role/vacancy datasets, de-duplicated."""
    out, seen = [], set()
    for s in skills:
        for name in [s, *_EXTRA_BY_NAME.get(s, [])]:
            if name.lower() not in seen:
                seen.add(name.lower())
                out.append(name)
    return out


_PILLAR_LABELS = {
    "teamwork": "Teamwork & Collaboration",
    "communication": "Stakeholder Communication",
    "analytical": "Analytical & Problem Solving",
    "result_driven": "Result-Driven Execution",
    "leadership": "Leadership & Ownership",
}

_DOMAIN_CLASSIFIERS = [
    ("Financial & ESG Audit", ["audit", "statutory", "financial reporting", "tax", "internal control", "ledger", "accountancy", "risk assessment", "esg"]),
    ("Full-Stack / React JS Developer", ["react", "reactjs", "redux", "javascript", "html", "css", "frontend", "dom", "node", "rest api"]),
    ("SQL & Database Engineer", ["sql", "t-sql", "stored procedure", "ssrs", "ssis", "postgresql", "mysql", "database", "etl", "query", "warehouse"]),
    ("Workday / HRIS Consultant", ["workday", "hcm", "eib", "calculated fields", "core connector", "staffing", "compensation", "hris", "business process"]),
    ("PeopleSoft / ERP Administrator", ["peoplesoft", "peopletools", "weblogic", "tuxedo", "pum", "fscm", "hrms", "integration broker"]),
    ("Software & AI Engineer", ["python", "flask", "django", "docker", "machine learning", "langchain", "rag", "llm", "fastapi", "git"]),
    ("QA & Software Testing Analyst", ["testing", "test cases", "selenium", "regression", "agile", "scrum", "bug", "defect", "stlc", "sdlc"]),
    ("Digital Marketing & SEO Strategist", ["copywriting", "seo", "google analytics", "ga4", "social media", "campaign", "content strategy", "brand"]),
]


def analyze_resume_competencies_and_impact(text: str) -> dict:
    """Run MoinDalvs-inspired NLP competency extraction, measurable impact scoring, major detection, and domain classification."""
    lex = load_parser_lexicon()
    raw = text or ""
    low = raw.lower()
    sentences = [s.strip() for s in re.split(r"[.\n•]+", raw) if len(s.strip()) >= 12]

    # 1. 5-Pillar Behavioral Competencies (from constants.py COMPETENCIES)
    comp_defs = lex.get("competencies") or {}
    pillars = []
    total_pillar_pts = 0
    for key, triggers in comp_defs.items():
        matched_verbs = []
        evidence_snippet = ""
        for trig in triggers:
            t_clean = trig.strip().lower()
            if not t_clean:
                continue
            if re.search(r"\b" + re.escape(t_clean) + r"\b", low):
                matched_verbs.append(t_clean)
                if not evidence_snippet:
                    for sent in sentences:
                        if re.search(r"\b" + re.escape(t_clean) + r"\b", sent.lower()):
                            evidence_snippet = sent[:140]
                            break
        count = len(matched_verbs)
        # MoinDalvs scoring curve scaled to 0-100 per pillar
        if count >= 5:
            p_score = 95
        elif count >= 3:
            p_score = 80
        elif count == 2:
            p_score = 65
        elif count == 1:
            p_score = 45
        else:
            p_score = 20
        total_pillar_pts += p_score
        pillars.append({
            "key": key,
            "label": _PILLAR_LABELS.get(key, key.title()),
            "score_pct": p_score,
            "matched_verbs": matched_verbs[:6],
            "evidence": evidence_snippet or "Confirm practical examples during structured interview.",
        })

    competency_score = round(total_pillar_pts / max(1, len(pillars)))

    # 2. Measurable Results & Action Verbs (from constants.py MEASURABLE_RESULTS)
    mr = lex.get("measurable_results") or {}
    metrics_triggers = mr.get("metrics") or []
    action_triggers = mr.get("action_words") or []
    weak_triggers = mr.get("weak_words") or []

    quant_matches = re.findall(r"\b\d+(?:\.\d+)?\s*(?:%|percent|x|hrs?|hours?|days?|months?|years?|clients?|projects?|users?|rm|usd|\$)\b", low)
    metric_words = [m for m in metrics_triggers if len(m) >= 3 and re.search(r"\b" + re.escape(m.lower()) + r"\b", low)]
    metrics_found = list(dict.fromkeys([*quant_matches[:5], *metric_words[:5]]))

    strong_verbs = [w for w in action_triggers if re.search(r"\b" + re.escape(w.lower()) + r"\b", low)]
    weak_words = [w for w in weak_triggers if w.lower() not in {"i", "he", "she", "me", "our", "her", "him", "worked", "managed", "create", "created"} and re.search(r"\b" + re.escape(w.lower()) + r"\b", low)]

    impact_score = min(98, 40 + min(30, len(strong_verbs) * 5) + min(28, len(metrics_found) * 7) - min(15, len(weak_words) * 5))

    # 3. Academic Major Detection (from Files/majors-list.csv)
    detected_major = {"major": "General Studies / Professional Qualification", "category": " Interdisciplinary"}
    for item in lex.get("majors_catalog") or []:
        m_name = item["major"].lower()
        if len(m_name) >= 5 and m_name in low:
            detected_major = {"major": item["major"], "category": item["category"]}
            break
    if detected_major["major"].startswith("General"):
        if "account" in low:
            detected_major = {"major": "Accounting", "category": "Business"}
        elif "computer science" in low or "software" in low:
            detected_major = {"major": "Computer Science", "category": "Computers & Mathematics"}
        elif "communication" in low or "marketing" in low:
            detected_major = {"major": "Communications", "category": "Communications & Journalism"}

    # 4. Domain Profile Classification (inspired by Resume Classification TF-IDF model)
    domain_scores = []
    for label, kw_list in _DOMAIN_CLASSIFIERS:
        hits = sum(1 for kw in kw_list if kw in low)
        domain_scores.append((hits, label))
    domain_scores.sort(reverse=True)
    best_hits, best_domain = domain_scores[0]
    total_hits = sum(h for h, _ in domain_scores) or 1
    confidence_pct = min(96, max(58, round(55 + 40 * (best_hits / max(3, total_hits)))))

    # 5. Text Telemetry (matching Counts_extracted.csv)
    words = re.findall(r"[A-Za-z]+", raw)
    numerics = re.findall(r"\b\d+(?:\.\d+)?\b", raw)
    word_count = len(words)
    avg_word_len = round(sum(len(w) for w in words) / max(1, word_count), 1)

    return {
        "competency_score": competency_score,
        "competencies": pillars,
        "measurable_impact": {
            "impact_score": impact_score,
            "metrics_found": metrics_found[:8],
            "strong_action_verbs": strong_verbs[:10],
            "weak_words_flagged": weak_words[:5],
        },
        "academic_major": detected_major,
        "predicted_profile": {
            "domain": best_domain,
            "confidence_pct": confidence_pct,
        },
        "text_telemetry": {
            "word_count": word_count,
            "char_count": len(raw),
            "avg_word_length": avg_word_len,
            "numeric_tokens": len(numerics),
        },
        "lexicon_skills_extracted": extract_extended_lexicon_skills(raw, limit=16),
    }
