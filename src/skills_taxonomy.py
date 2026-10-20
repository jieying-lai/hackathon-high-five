"""Skill taxonomy used by the CV extractor and the matching engines.

Each entry: canonical name -> regex alternatives found in free text, plus optional
aliases that should ALSO be emitted when matching against role/vacancy data
(the demo datasets use both "SQL" and "SQL Basics", for example).
"""

import re

# (canonical name, [regex alternatives], [extra names emitted for matching])
_TAXONOMY = [
    # --- software & data ---
    ("Python", [r"python"], []),
    ("SQL", [r"sql", r"mysql", r"postgres(?:ql)?", r"sqlite"], ["SQL Basics"]),
    ("REST APIs", [r"rest(?:ful)?\s+apis?", r"restful", r"web apis?", r"api development", r"api integration"], []),
    ("Git", [r"git(?:hub|lab)?"], []),
    ("React", [r"react(?:\.?js)?"], []),
    ("Docker", [r"docker"], []),
    ("Data Structures", [r"data structures?(?:\s+and\s+algorithms)?", r"dsa"], []),
    ("HTML/CSS/JS", [r"html5?", r"css3?", r"javascript"], []),
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
    ("Power BI", [r"power\s?bi"], []),
    ("Tableau", [r"tableau"], []),
    ("AWS", [r"aws", r"amazon web services"], []),
    ("Azure", [r"azure"], []),
    ("Google Cloud", [r"gcp", r"google cloud"], []),
    ("Linux", [r"linux"], []),
    # --- AI ---
    ("LLM Orchestration (LangChain/LlamaIndex)", [r"langchain", r"llamaindex", r"llm orchestration", r"large language models?", r"llms?"], []),
    ("Vector Databases & RAG", [r"rag", r"vector (?:database|db|store)s?", r"retrieval[- ]augmented(?: generation)?", r"pinecone", r"chroma(?:db)?", r"faiss"], []),
    ("Prompt Engineering", [r"prompt engineering", r"prompt design", r"prompting"], []),
    ("AI Workflow Automation (Make/Zapier)", [r"zapier", r"make\.com", r"n8n", r"workflow automation", r"process automation", r"rpa"], []),
    ("AI Guardrails & Evaluation", [r"guardrails?", r"llm evaluation", r"model evaluation"], []),
    # --- finance ---
    ("Financial Auditing", [r"audit(?:ing|ed|or|s)?", r"statutory audit", r"internal audit"], []),
    ("Risk Assessment", [r"risk assessments?", r"risk management", r"risk analysis", r"risk register", r"risk control"], []),
    ("Tax Compliance", [r"tax compliance", r"taxation", r"tax (?:filing|returns?)", r"gst", r"sst"], []),
    ("Financial Reporting", [r"financial reporting", r"financial statements?", r"management accounts?", r"month[- ]end"], []),
    ("Excel Pivot & Macros", [r"excel", r"pivot tables?", r"macros?", r"vba"], []),
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
    ("People Data Analytics", [r"people analytics", r"hr analytics", r"workforce analytics"], []),
    ("Recruitment", [r"recruit(?:ment|ing|er)", r"talent acquisition"], []),
    ("Data Privacy (PDPA)", [r"pdpa", r"data privacy", r"personal data protection", r"gdpr"], []),
    ("Project Management", [r"project management", r"scrum", r"agile", r"jira"], []),
    ("Leadership", [r"leadership", r"team lead"], []),
]

_PATTERNS = [
    (name, re.compile(r"(?<![A-Za-z0-9+#])(?:" + "|".join(alts) + r")(?![A-Za-z0-9+#])", re.I), extra)
    for name, alts, extra in _TAXONOMY
]
_EXTRA_BY_NAME = {name: extra for name, _, extra in _PATTERNS}
CANONICAL_SKILLS = [name for name, _, _ in _TAXONOMY]

_PY_DATA = re.compile(r"pandas|numpy|data analysis|data analytics|matplotlib|seaborn", re.I)


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


def expand_for_matching(skills) -> list:
    """Add alias names used by the role/vacancy datasets, de-duplicated."""
    out, seen = [], set()
    for s in skills:
        for name in [s, *_EXTRA_BY_NAME.get(s, [])]:
            if name.lower() not in seen:
                seen.add(name.lower())
                out.append(name)
    return out
