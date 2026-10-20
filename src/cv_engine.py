"""PDF-Only CV Upload, AI Extraction/Summarization, Privacy Storage & Application Engine.

Enforces CareerLens AI's core privacy and data-use architecture:
  1. Only valid `.pdf` files are accepted (`%PDF-` signature + `.pdf` extension + text extraction).
  2. AI Extraction Engine captures structured sections from the PDF CV:
       - Personal & Professional Header (Name, Email, Phone, Location, Industry, Current Role, Years Exp, Seeker Type)
       - Education & Qualifications
       - Work Experience Highlights
       - Key Projects & Achievements
       - Canonical Skills (matched via `skills_taxonomy.py`)
       - AI Executive Summary
  3. Strict Privacy Boundary:
       - Stored CVs are linked to the user's unique ID (`owner_uid`).
       - By default, CV data is used ONLY for:
           a) Anonymized, aggregated statistical skill & trend analysis (no PII), and
           b) Personalised future-role matching & reskilling pathways for that user.
       - Employers / HR CANNOT browse or view any user's personal CV unless the user
         explicitly applies to a vacancy posted by that company.
  4. Application-Gated Employer Viewing:
       - When a Job Seeker applies to a vacancy, they control whether to share their
         AI-Organised CV Summary and/or grant access to the Original PDF CV.
       - Every employer view of an Organised CV or Original PDF is recorded in `cv_access_logs`
         for full candidate transparency.
"""

from datetime import datetime, timezone
import hashlib
import io
import json
import os
import re

from fpdf import FPDF
from pypdf import PdfReader

from auth_db import DATA_DIR, get_db_connection
from skills_taxonomy import (
    analyze_resume_competencies_and_impact,
    expand_for_matching,
    extract_skills,
    skill_key,
)

UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
SAMPLE_PDF_DIR = os.path.join(os.path.dirname(__file__), "static", "sample_cvs")
MAX_PDF_BYTES = 8 * 1024 * 1024  # 8 MB

EMAIL_RX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RX = re.compile(r"(?:\+?6?01[0-9][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4}|\+?[0-9][0-9\-\s()]{7,15})")
YEARS_RX = re.compile(r"(\d{1,2})\+?\s*(?:years?|yrs?)\b", re.I)

SECTION_HEADERS = {
    "summary": re.compile(r"^(?:executive\s+summary|professional\s+summary|profile|summary|objective|about\s+me)\s*:?\s*$", re.I),
    "experience": re.compile(r"^(?:work\s+experience|professional\s+experience|employment\s+history|experience|career\s+history)\s*:?\s*$", re.I),
    "education": re.compile(r"^(?:education|academic\s+background|qualifications|academic\s+qualifications)\s*:?\s*$", re.I),
    "projects": re.compile(r"^(?:key\s+projects|projects|academic\s+projects|selected\s+projects|portfolio)\s*:?\s*$", re.I),
    "skills": re.compile(r"^(?:technical\s+skills|core\s+skills|skills|competencies|tools\s*&\s*technologies)\s*:?\s*$", re.I),
    "certifications": re.compile(r"^(?:certifications?|licenses?\s*&\s*certifications?|awards?|training)\s*:?\s*$", re.I),
}


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def init_cv_tables() -> None:
    """Create CV storage, job applications, and employer access audit tables, plus synthetic sample PDFs."""
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(SAMPLE_PDF_DIR, exist_ok=True)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS user_cvs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_uid TEXT UNIQUE NOT NULL,
            original_filename TEXT NOT NULL,
            stored_pdf_path TEXT NOT NULL,
            file_sha256 TEXT NOT NULL,
            file_size_bytes INTEGER NOT NULL,
            page_count INTEGER NOT NULL DEFAULT 1,
            raw_text TEXT NOT NULL,
            structured_cv_json TEXT NOT NULL,
            allow_anon_stats INTEGER NOT NULL DEFAULT 1,
            uploaded_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_uid TEXT UNIQUE NOT NULL,
            vacancy_id INTEGER NOT NULL,
            candidate_uid TEXT NOT NULL,
            candidate_name TEXT NOT NULL,
            share_organised_cv INTEGER NOT NULL DEFAULT 1,
            share_original_pdf INTEGER NOT NULL DEFAULT 1,
            cover_note TEXT,
            salary_expectation INTEGER NOT NULL DEFAULT 4500,
            available_in TEXT NOT NULL DEFAULT '1 month',
            hr_decision TEXT NOT NULL DEFAULT 'Pending',
            applied_at TEXT NOT NULL,
            UNIQUE(vacancy_id, candidate_uid)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS cv_access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_uid TEXT NOT NULL,
            hr_uid TEXT NOT NULL,
            company_name TEXT NOT NULL,
            vacancy_id INTEGER NOT NULL,
            vacancy_title TEXT NOT NULL,
            access_type TEXT NOT NULL,
            viewed_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()

    ensure_sample_pdfs()
    _seed_demo_cv_and_application()


# ------------------------------------------------------------------ Synthetic Sample PDF Generator
SAMPLE_CV_SPECS = [
    {
        "filename": "Aisha_Rahman_Auditor_CV.pdf",
        "label": "Aisha Rahman · Junior Financial Auditor (Finance)",
        "name": "Aisha Rahman",
        "role": "Junior Financial Auditor",
        "email": "aisha.demo@careerlens.my",
        "phone": "+60 12-348 9921",
        "location": "Kuala Lumpur, Malaysia",
        "work_mode": "Hybrid",
        "years": "3 Years",
        "education_level": "Bachelor's Degree",
        "industry": "Finance & Accounting",
        "summary": (
            "Detail-oriented Junior Financial Auditor with 3 years of experience in statutory audit, "
            "internal risk assessment, and SST/tax compliance across Malaysian SMEs. Transitioning toward "
            "AI-assisted financial compliance, Python data analytics, and ESG sustainability reporting."
        ),
        "experience": [
            "Junior Financial Auditor | SeriWawasan Audit PLT, Kuala Lumpur (2023 - Present): Executed statutory audits and risk control testing for 18 corporate clients; automated monthly ledger sampling using Excel Pivot Tables & VBA macros.",
            "Audit Associate | Amanah Tax & Advisory Sdn Bhd (2022 - 2023): Prepared financial statements, tax compliance schedules, and internal control risk registers.",
        ],
        "education": [
            "Bachelor of Accountancy (Hons) | University of Malaya (2018 - 2022) - CGPA 3.72",
            "MIA Qualifying Examination Candidate | Malaysian Institute of Accountants",
        ],
        "projects": [
            "Automated Month-End Audit Sampling Workbook: Built an Excel macro & SQL query pipeline that cut manual invoice sampling time by 38%.",
            "SME ESG Readiness Checklist: Drafted carbon & sustainability disclosure templates aligned with Bursa Malaysia guidelines.",
        ],
        "skills": [
            "Financial Auditing", "Risk Assessment", "Tax Compliance",
            "Financial Reporting", "Excel Pivot & Macros", "SQL",
        ],
    },
    {
        "filename": "Kavin_Raj_Software_Grad_CV.pdf",
        "label": "Kavin Raj · Fresh CS Graduate (Software & AI)",
        "name": "Kavin Raj",
        "role": "Junior Software & AI Developer",
        "email": "kavin.raj.demo@careerlens.my",
        "phone": "+60 17-882 4105",
        "location": "Petaling Jaya, Selangor",
        "work_mode": "Hybrid",
        "years": "1 Year",
        "education_level": "Bachelor's Degree",
        "industry": "IT & Software",
        "summary": (
            "Computer Science graduate with 1 year of internship and capstone project experience building "
            "Python backend services, RESTful APIs, SQL databases, and React web interfaces. Passionate about "
            "applied LLM orchestration and clean software engineering."
        ),
        "experience": [
            "Software Engineering Intern | CloudBridge Tech Sdn Bhd (2025 - 2026): Built Flask REST APIs and PostgreSQL data pipelines; containerized microservices with Docker and Git CI workflows.",
        ],
        "education": [
            "Bachelor of Computer Science (Hons) in Software Engineering | Universiti Sains Malaysia (2022 - 2026)",
        ],
        "projects": [
            "Campus Helpdesk RAG Chatbot: Developed a Python & Flask API with vector search to answer student FAQ queries.",
            "Inventory & Order REST API: Built a full-stack React + SQL web tracker with role-based authentication.",
        ],
        "skills": [
            "Python", "SQL", "REST APIs", "Git", "React", "Docker", "Data Structures", "HTML/CSS/JS",
        ],
    },
    {
        "filename": "Jason_Lim_Copywriter_CV.pdf",
        "label": "Jason Lim · Digital Copywriter (Marketing & Content)",
        "name": "Jason Lim",
        "role": "Senior Digital Copywriter",
        "email": "jason.lim.demo@careerlens.my",
        "phone": "+60 16-509 7732",
        "location": "Penang / Remote, Malaysia",
        "work_mode": "Remote",
        "years": "4 Years",
        "education_level": "Bachelor's Degree",
        "industry": "Marketing & PR",
        "summary": (
            "Bilingual Digital Copywriter and SEO Content Strategist with 4 years of agency experience "
            "driving organic growth and multi-channel social campaigns. Actively upskilling in Prompt Engineering "
            "and AI workflow automation to lead human-in-the-loop content operations."
        ),
        "experience": [
            "Senior Digital Copywriter | Lumina Creative Lab, Penang (2024 - Present): Directed SEO content strategy and Google Analytics GA4 campaign reporting for 12 regional brands.",
            "Content Writer | PulseMedia Digital (2022 - 2024): Produced bilingual English/Mandarin social media campaigns and brand storytelling assets.",
        ],
        "education": [
            "Bachelor of Communication (Hons) | Taylor's University (2018 - 2021)",
        ],
        "projects": [
            "AI-Assisted Editorial Prompt Playbook: Standardized brand-voice prompt templates that doubled article draft throughput.",
            "Regional E-Commerce SEO Revamp: Grew organic search traffic by 62% over 6 months using GA4 cohort insights.",
        ],
        "skills": [
            "Copywriting", "SEO Content Strategy", "Google Analytics",
            "Social Media Campaigns", "Canva & Basic Design", "Bilingual Communication", "Prompt Engineering",
        ],
    },
]


def _build_pdf_bytes(spec: dict) -> bytes:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 9, spec["name"], new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(60, 70, 140)
    pdf.cell(
        0, 6,
        f"{spec['role']}  |  {spec['industry']}  |  {spec['years']} Experience",
        new_x="LMARGIN", new_y="NEXT",
    )

    pdf.set_font("Helvetica", "", 9.5)
    pdf.set_text_color(70, 70, 70)
    pdf.cell(
        0, 6,
        f"Email: {spec['email']}   |   Phone: {spec['phone']}   |   Location: {spec['location']} ({spec['work_mode']})",
        new_x="LMARGIN", new_y="NEXT",
    )
    pdf.ln(2)

    def section(title: str):
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(20, 30, 60)
        pdf.cell(0, 7, title.upper(), new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(30, 30, 30)
        pdf.set_font("Helvetica", "", 10)

    section("Executive Summary")
    pdf.multi_cell(0, 5.2, spec["summary"], new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    section("Work Experience")
    for item in spec["experience"]:
        pdf.multi_cell(0, 5.2, f"- {item}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    section("Education")
    for item in spec["education"]:
        pdf.multi_cell(0, 5.2, f"- {item}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    section("Key Projects")
    for item in spec["projects"]:
        pdf.multi_cell(0, 5.2, f"- {item}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    section("Core Skills")
    pdf.multi_cell(0, 5.2, ", ".join(spec["skills"]), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(
        0, 5,
        "Synthetic CV generated for CareerLens AI (SDC Hackathon 2026). Contains no real personal data.",
        new_x="LMARGIN", new_y="NEXT",
    )
    return bytes(pdf.output())


BENCHMARK_PDF_SPECS = [
    {
        "filename": "Benchmark_React_Developer_CV.pdf",
        "label": "Anjani Priyadarshini · React JS Developer (Benchmark Dataset)",
        "role": "React JS Developer",
        "industry": "IT & Software",
    },
    {
        "filename": "Benchmark_SQL_Developer_CV.pdf",
        "label": "Anil Kumar · SQL & MSBI Database Developer (Benchmark Dataset)",
        "role": "SQL Developer",
        "industry": "IT & Software",
    },
    {
        "filename": "Benchmark_Workday_HCM_CV.pdf",
        "label": "Chinna Subbarayudu · Workday HCM Consultant (Benchmark Dataset)",
        "role": "Workday HCM Consultant",
        "industry": "HR & Administration",
    },
    {
        "filename": "Benchmark_QA_Testing_Intern_CV.pdf",
        "label": "Ravali P · QA & Software Testing Intern (Benchmark Dataset)",
        "role": "QA Testing Intern",
        "industry": "IT & Software",
    },
]


def ensure_sample_pdfs() -> list[dict]:
    """Ensure synthetic and real benchmark sample PDFs exist in `static/sample_cvs/` and return metadata."""
    os.makedirs(SAMPLE_PDF_DIR, exist_ok=True)
    out = []
    for spec in SAMPLE_CV_SPECS:
        path = os.path.join(SAMPLE_PDF_DIR, spec["filename"])
        if not os.path.exists(path):
            with open(path, "wb") as f:
                f.write(_build_pdf_bytes(spec))
        out.append({
            "filename": spec["filename"],
            "label": spec["label"],
            "url": f"/static/sample_cvs/{spec['filename']}",
            "role": spec["role"],
            "industry": spec["industry"],
        })
    for bspec in BENCHMARK_PDF_SPECS:
        bpath = os.path.join(SAMPLE_PDF_DIR, bspec["filename"])
        if os.path.exists(bpath):
            out.append({
                "filename": bspec["filename"],
                "label": bspec["label"],
                "url": f"/static/sample_cvs/{bspec['filename']}",
                "role": bspec["role"],
                "industry": bspec["industry"],
            })
    return out


# ------------------------------------------------------------------ AI PDF CV Extraction & Summarization
def _detect_education_level(text: str) -> str:
    low = text.lower()
    if any(k in low for k in ("master", "mba", "msc", "postgraduate", "phd", "doctorate")):
        return "Master's / Postgraduate"
    if any(k in low for k in ("bachelor", "b.sc", "b.acc", "b.eng", "b.comm", "hons", "degree", "universiti", "university")):
        return "Bachelor's Degree"
    return "Diploma / TVET"


def _detect_industry(text: str, skills: list[str], fallback: str = "Finance & Accounting") -> str:
    low = text.lower()
    skill_set = {s.lower() for s in skills}
    if any(k in skill_set for k in ("financial auditing", "tax compliance", "financial reporting", "risk assessment")) or "account" in low or "audit" in low:
        return "Finance & Accounting"
    if any(k in skill_set for k in ("copywriting", "seo content strategy", "google analytics", "social media campaigns")) or "marketing" in low or "copywrit" in low:
        return "Marketing & PR"
    if any(k in skill_set for k in ("python", "rest apis", "react", "docker", "data structures", "sql")) or "software" in low or "developer" in low:
        return "IT & Software"
    if any(k in skill_set for k in ("recruitment", "people data analytics", "change management", "skills architecture mapping")) or "human resource" in low:
        return "HR & Administration"
    return fallback


def _detect_work_mode(text: str, fallback: str = "Hybrid") -> str:
    low = text.lower()
    if "remote" in low and "hybrid" not in low:
        return "Remote"
    if "on-site" in low or "onsite" in low:
        return "On-site"
    return fallback


def _detect_years_experience(text: str) -> int:
    matches = [int(m.group(1)) for m in YEARS_RX.finditer(text) if int(m.group(1)) <= 40]
    if matches:
        return max(matches)
    if "intern" in text.lower() or "fresh graduate" in text.lower():
        return 0
    return 1


def _detect_seeker_type(years: int, text: str) -> str:
    low = text.lower()
    if years <= 1 or "fresh graduate" in low or "intern" in low:
        return "Fresh Graduate"
    if "transition" in low or "career changer" in low or "switcher" in low or "upskilling" in low:
        return "Career Changer"
    return "Experienced Worker"


def parse_and_summarize_pdf_cv(pdf_bytes: bytes, filename: str, user_context: dict | None = None) -> tuple[bool, str, dict | None]:
    """Validate PDF bytes, extract raw text via pypdf, and produce an AI-structured CV summary."""
    user_context = user_context or {}
    if not filename or not filename.lower().endswith(".pdf"):
        return False, "Only PDF files (.pdf) are accepted. Please upload your CV in PDF format.", None
    if not pdf_bytes or len(pdf_bytes) < 64:
        return False, "The uploaded PDF file appears to be empty.", None
    if len(pdf_bytes) > MAX_PDF_BYTES:
        return False, "PDF file exceeds the 8 MB maximum size limit.", None
    if not pdf_bytes.lstrip().startswith(b"%PDF-"):
        return False, "Invalid file signature: file is not a genuine PDF document.", None

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        page_count = len(reader.pages)
        if page_count < 1:
            return False, "The PDF document contains no pages.", None
        page_texts = [(p.extract_text() or "") for p in reader.pages]
        raw_text = "\n".join(page_texts).strip()
    except Exception as exc:
        return False, f"Could not read PDF file: {exc}", None

    if len(raw_text) < 25:
        return False, "This PDF contains almost no selectable text (it may be a scanned image). Please upload a text-based PDF CV.", None

    lines = [ln.strip() for ln in raw_text.splitlines() if ln.strip()]

    # Sections bucket
    sections: dict[str, list[str]] = {
        "header": [],
        "summary": [],
        "experience": [],
        "education": [],
        "projects": [],
        "skills": [],
        "certifications": [],
    }
    current_sec = "header"
    for ln in lines:
        matched_header = None
        for sec_name, rx in SECTION_HEADERS.items():
            if rx.match(ln):
                matched_header = sec_name
                break
        if matched_header:
            current_sec = matched_header
            continue
        sections[current_sec].append(ln)

    # Extract contact & header info
    rd = user_context.get("role_details") or {}
    full_name = user_context.get("full_name") or (sections["header"][0] if sections["header"] else "Candidate")
    if sections["header"] and len(sections["header"][0]) <= 55 and not EMAIL_RX.search(sections["header"][0]):
        full_name = sections["header"][0].strip()

    email_match = EMAIL_RX.search(raw_text)
    email = email_match.group(0) if email_match else (user_context.get("email") or "")
    phone_match = PHONE_RX.search(raw_text)
    phone = phone_match.group(0).strip() if phone_match else "Not specified"

    location = rd.get("location") or "Kuala Lumpur, Malaysia"
    for city in ("Kuala Lumpur", "Petaling Jaya", "Selangor", "Penang", "Johor Bahru", "Cyberjaya", "Putrajaya", "Malaysia"):
        if city.lower() in raw_text.lower():
            location = city if "Malaysia" in city else f"{city}, Malaysia"
            break

    skills = extract_skills(raw_text)
    if not skills:
        # Fallback if a custom PDF lists comma-separated items under skills
        for s_line in sections["skills"]:
            for token in re.split(r"[,•|;/]", s_line):
                tok = token.strip(" -•\t")
                if 2 <= len(tok) <= 45 and len(skills) < 12:
                    skills.append(tok)

    years = _detect_years_experience(raw_text)
    education_level = _detect_education_level(raw_text)
    industry = _detect_industry(raw_text, skills, fallback=rd.get("industry") or "Finance & Accounting")
    work_mode = _detect_work_mode(raw_text, fallback=rd.get("preferred_work_mode") or "Hybrid")
    seeker_type = _detect_seeker_type(years, raw_text)

    # Current role detection
    current_role = rd.get("current_role") or "Professional"
    if len(sections["header"]) >= 2:
        second_line = sections["header"][1]
        role_cand = second_line.split("|")[0].strip()
        if 3 <= len(role_cand) <= 60 and "@" not in role_cand:
            current_role = role_cand

    def _clean_bullets(items: list[str], limit: int = 5) -> list[str]:
        out = []
        for it in items:
            cleaned = it.lstrip("-•*· ").strip()
            if len(cleaned) >= 6:
                out.append(cleaned)
        return out[:limit]

    experience_list = _clean_bullets(sections["experience"], 5)
    education_list = _clean_bullets(sections["education"], 4)
    projects_list = _clean_bullets(sections["projects"], 4)
    cert_list = _clean_bullets(sections["certifications"], 4)

    if not education_list:
        education_list = [f"{education_level} (extracted from CV document)"]
    if not experience_list:
        experience_list = [f"{current_role} ({years} yr{'s' if years != 1 else ''} relevant experience)"]
    if not projects_list:
        projects_list = [f"Portfolio & practical work in {', '.join(skills[:3]) or industry}"]

    exec_summary_raw = " ".join(sections["summary"]).strip()
    if not exec_summary_raw:
        top_sk = ", ".join(skills[:5]) if skills else "core domain skills"
        exec_summary_raw = (
            f"{full_name} is a {seeker_type.lower()} ({current_role}) in {industry} with "
            f"{years} year{'s' if years != 1 else ''} of experience, holding a {education_level}. "
            f"Key evidenced competencies include {top_sk}."
        )

    parser_analytics = analyze_resume_competencies_and_impact(raw_text)
    ai_highlights = [
        f"Role & Sector: {current_role} in {industry} ({years} yr{'s' if years != 1 else ''} experience · {seeker_type})",
        f"Predicted Profile: {parser_analytics['predicted_profile']['domain']} ({parser_analytics['predicted_profile']['confidence_pct']}% confidence) · Competency Score: {parser_analytics['competency_score']}/100",
        f"Verified Skill Signals ({len(skills)}): {', '.join(skills[:8]) if skills else 'General transferable skills'}",
    ]

    structured = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "location": location,
        "industry": industry,
        "current_role": current_role,
        "years_experience": years,
        "seeker_type": seeker_type,
        "education_level": education_level,
        "work_mode_preference": work_mode,
        "executive_summary": exec_summary_raw[:650],
        "ai_highlights": ai_highlights,
        "skills": skills,
        "expanded_skills": expand_for_matching(skills),
        "work_experience": experience_list,
        "education_history": education_list,
        "projects": projects_list,
        "certifications": cert_list,
        "page_count": page_count,
        "char_count": len(raw_text),
        "parser_analytics": parser_analytics,
        "privacy_notice": (
            "Protected under CareerLens PDPA Shield: Used exclusively for anonymised aggregate skill trend "
            "statistics and your personal job/reskilling recommendations. Employers cannot view this CV "
            "unless you explicitly apply to their vacancy."
        ),
    }
    return True, "PDF CV parsed and summarised by AI.", {
        "page_count": page_count,
        "raw_text": raw_text,
        "structured_cv": structured,
    }


def save_user_pdf_cv(owner_uid: str, filename: str, pdf_bytes: bytes, user_context: dict | None = None,
                     allow_anon_stats: bool = True) -> tuple[bool, str, dict | None]:
    """Validate, parse, and persist a user's PDF CV tied to `owner_uid`."""
    ok, msg, parsed = parse_and_summarize_pdf_cv(pdf_bytes, filename, user_context=user_context)
    if not ok or not parsed:
        return False, msg, None

    os.makedirs(UPLOADS_DIR, exist_ok=True)
    safe_uid = re.sub(r"[^A-Za-z0-9_-]", "_", owner_uid)
    stored_filename = f"{safe_uid}.pdf"
    stored_path = os.path.join(UPLOADS_DIR, stored_filename)
    with open(stored_path, "wb") as f:
        f.write(pdf_bytes)

    sha256_hex = hashlib.sha256(pdf_bytes).hexdigest()
    now = _now()
    structured = parsed["structured_cv"]

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO user_cvs (
            owner_uid, original_filename, stored_pdf_path, file_sha256,
            file_size_bytes, page_count, raw_text, structured_cv_json,
            allow_anon_stats, uploaded_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(owner_uid) DO UPDATE SET
            original_filename = excluded.original_filename,
            stored_pdf_path = excluded.stored_pdf_path,
            file_sha256 = excluded.file_sha256,
            file_size_bytes = excluded.file_size_bytes,
            page_count = excluded.page_count,
            raw_text = excluded.raw_text,
            structured_cv_json = excluded.structured_cv_json,
            allow_anon_stats = excluded.allow_anon_stats,
            updated_at = excluded.updated_at
        """,
        (
            owner_uid,
            os.path.basename(filename),
            stored_path,
            sha256_hex,
            len(pdf_bytes),
            parsed["page_count"],
            parsed["raw_text"],
            json.dumps(structured),
            1 if allow_anon_stats else 0,
            now,
            now,
        ),
    )
    conn.commit()
    conn.close()
    return True, "PDF CV uploaded, summarised, and stored in your private vault.", get_user_cv(owner_uid)


def update_user_structured_cv(owner_uid: str, updates: dict) -> tuple[bool, str, dict | None]:
    """Allow the CV owner to refine their AI-extracted summary/skills or privacy toggle."""
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM user_cvs WHERE owner_uid = ?", (owner_uid,)).fetchone()
    if not row:
        conn.close()
        return False, "Please upload your PDF CV first.", None

    structured = json.loads(row["structured_cv_json"])
    for key in ("full_name", "industry", "current_role", "work_mode_preference", "executive_summary", "location", "education_level"):
        if key in updates and updates[key] is not None:
            structured[key] = str(updates[key]).strip()
    if "years_experience" in updates:
        try:
            structured["years_experience"] = max(0, min(40, int(updates["years_experience"])))
        except (TypeError, ValueError):
            pass
    if "skills" in updates and isinstance(updates["skills"], list):
        clean_sk = [str(s).strip() for s in updates["skills"] if str(s).strip()]
        structured["skills"] = clean_sk
        structured["expanded_skills"] = expand_for_matching(clean_sk)

    allow_anon = row["allow_anon_stats"]
    if "allow_anon_stats" in updates:
        allow_anon = 1 if bool(updates["allow_anon_stats"]) else 0

    conn.execute(
        "UPDATE user_cvs SET structured_cv_json = ?, allow_anon_stats = ?, updated_at = ? WHERE owner_uid = ?",
        (json.dumps(structured), allow_anon, _now(), owner_uid),
    )
    conn.commit()
    conn.close()
    return True, "Organised CV summary updated.", get_user_cv(owner_uid)


def get_user_cv(owner_uid: str) -> dict | None:
    """Return the user's stored CV metadata, structured summary, and employer access audit logs."""
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM user_cvs WHERE owner_uid = ?", (owner_uid,)).fetchone()
    logs = conn.execute(
        "SELECT * FROM cv_access_logs WHERE candidate_uid = ? ORDER BY id DESC LIMIT 20",
        (owner_uid,),
    ).fetchall()
    apps = conn.execute(
        "SELECT vacancy_id, application_uid, share_organised_cv, share_original_pdf, hr_decision, applied_at FROM job_applications WHERE candidate_uid = ?",
        (owner_uid,),
    ).fetchall()
    conn.close()
    if not row:
        return None
    structured = json.loads(row["structured_cv_json"])
    if "parser_analytics" not in structured:
        structured["parser_analytics"] = analyze_resume_competencies_and_impact(row["raw_text"] or "")
    return {
        "owner_uid": row["owner_uid"],
        "original_filename": row["original_filename"],
        "file_sha256": row["file_sha256"][:16] + "...",
        "file_size_kb": round(row["file_size_bytes"] / 1024, 1),
        "page_count": row["page_count"],
        "allow_anon_stats": bool(row["allow_anon_stats"]),
        "uploaded_at": row["uploaded_at"],
        "updated_at": row["updated_at"],
        "structured_cv": structured,
        "pdf_url": "/api/cv/me/pdf",
        "applications_count": len(apps),
        "access_logs": [dict(lg) for lg in logs],
    }


def get_user_pdf_path(owner_uid: str) -> tuple[str | None, str | None]:
    conn = get_db_connection()
    row = conn.execute(
        "SELECT stored_pdf_path, original_filename FROM user_cvs WHERE owner_uid = ?",
        (owner_uid,),
    ).fetchone()
    conn.close()
    if not row or not os.path.exists(row["stored_pdf_path"]):
        return None, None
    return row["stored_pdf_path"], row["original_filename"]


# ------------------------------------------------------------------ Anonymized Statistical Trend Aggregation
def get_anonymized_cv_statistics() -> dict:
    """Aggregate skill & industry counts across consenting user CVs without exposing any PII."""
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT structured_cv_json FROM user_cvs WHERE allow_anon_stats = 1"
    ).fetchall()
    conn.close()

    skill_counts: dict[str, int] = {}
    industry_counts: dict[str, int] = {}
    total_profiles = len(rows)

    for r in rows:
        try:
            st = json.loads(r["structured_cv_json"])
        except Exception:
            continue
        ind = st.get("industry") or "General"
        industry_counts[ind] = industry_counts.get(ind, 0) + 1
        for sk in st.get("skills") or []:
            skill_counts[sk] = skill_counts.get(sk, 0) + 1

    top_skills = [
        {"skill": k, "count": v, "share_pct": round(100 * v / max(1, total_profiles))}
        for k, v in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:8]
    ]
    return {
        "total_anonymized_cvs": total_profiles,
        "top_extracted_skills": top_skills,
        "industry_distribution": industry_counts,
        "privacy_guarantee": "Aggregated from opt-in PDF CVs with zero personal identifiers (UID, name, email, and raw PDFs are stripped).",
    }


# ------------------------------------------------------------------ Job Applications & Privacy-Gated HR Access
def apply_to_vacancy(candidate_uid: str, candidate_name: str, vacancy_id: int, payload: dict) -> tuple[bool, str, dict | None]:
    """Submit or update a candidate's application to an open vacancy, unlocking CV access for that employer."""
    cv_record = get_user_cv(candidate_uid)
    if not cv_record:
        return False, "Please upload your PDF CV in the 'PDF CV & Summary' tab before applying for a job.", None

    conn = get_db_connection()
    vac = conn.execute("SELECT * FROM vacancies WHERE id = ?", (vacancy_id,)).fetchone()
    if not vac:
        conn.close()
        return False, "Vacancy not found.", None
    if vac["status"] != "Open":
        conn.close()
        return False, "This vacancy is currently closed to new applications.", None

    share_organised = 1 if payload.get("share_organised_cv", True) else 0
    share_pdf = 1 if payload.get("share_original_pdf", True) else 0
    if not share_organised and not share_pdf:
        conn.close()
        return False, "Please share at least your AI-Organised CV Summary when applying to a vacancy.", None

    cover_note = (payload.get("cover_note") or "").strip()[:400]
    try:
        salary_exp = int(payload.get("salary_expectation") or 4800)
    except (TypeError, ValueError):
        salary_exp = 4800
    available_in = (payload.get("available_in") or "1 month").strip()[:40]
    now = _now()

    existing = conn.execute(
        "SELECT id, application_uid FROM job_applications WHERE vacancy_id = ? AND candidate_uid = ?",
        (vacancy_id, candidate_uid),
    ).fetchone()

    if existing:
        app_uid = existing["application_uid"]
        conn.execute(
            """
            UPDATE job_applications
               SET candidate_name = ?, share_organised_cv = ?, share_original_pdf = ?,
                   cover_note = ?, salary_expectation = ?, available_in = ?, applied_at = ?
             WHERE id = ?
            """,
            (candidate_name, share_organised, share_pdf, cover_note, salary_exp, available_in, now, existing["id"]),
        )
    else:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO job_applications (
                application_uid, vacancy_id, candidate_uid, candidate_name,
                share_organised_cv, share_original_pdf, cover_note,
                salary_expectation, available_in, hr_decision, applied_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
            """,
            ("TEMP", vacancy_id, candidate_uid, candidate_name, share_organised, share_pdf, cover_note, salary_exp, available_in, now),
        )
        aid = cur.lastrowid
        app_uid = f"APP-2026-{aid:04d}"
        cur.execute("UPDATE job_applications SET application_uid = ? WHERE id = ?", (app_uid, aid))

    conn.commit()
    conn.close()
    return True, f"Application {app_uid} submitted! The employer can now view your shared CV for this role.", {
        "application_uid": app_uid,
        "vacancy_id": vacancy_id,
        "share_organised_cv": bool(share_organised),
        "share_original_pdf": bool(share_pdf),
        "applied_at": now,
    }


def withdraw_application(candidate_uid: str, vacancy_id: int) -> tuple[bool, str]:
    """Allow a candidate to withdraw their job application and immediately revoke employer CV access."""
    conn = get_db_connection()
    cur = conn.execute(
        "DELETE FROM job_applications WHERE vacancy_id = ? AND candidate_uid = ?",
        (vacancy_id, candidate_uid),
    )
    conn.commit()
    conn.close()
    if cur.rowcount > 0:
        return True, "Application withdrawn. Employer access to your CV has been revoked immediately."
    return False, "No active application found for this vacancy."


def log_employer_cv_access(candidate_uid: str, hr_user: dict, vacancy_id: int, vacancy_title: str, access_type: str) -> None:
    company_name = ((hr_user.get("role_details") or {}).get("company_name") or hr_user.get("full_name") or "Employer")
    conn = get_db_connection()
    conn.execute(
        """
        INSERT INTO cv_access_logs (
            candidate_uid, hr_uid, company_name, vacancy_id, vacancy_title, access_type, viewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (candidate_uid, hr_user.get("unique_uid", ""), company_name, vacancy_id, vacancy_title, access_type, _now()),
    )
    conn.commit()
    conn.close()


def get_application_cv_for_hr(hr_user: dict, application_id: int, access_type: str = "Organised CV Summary") -> tuple[bool, str, dict | None]:
    """Verify that `application_id` belongs to a vacancy owned by `hr_user`, log access, and return CV data."""
    hr_uid = hr_user["unique_uid"]
    conn = get_db_connection()
    row = conn.execute(
        """
        SELECT a.*, v.owner_uid AS vacancy_owner, v.title AS vacancy_title, v.vacancy_uid
          FROM job_applications a
          JOIN vacancies v ON v.id = a.vacancy_id
         WHERE a.id = ?
        """,
        (application_id,),
    ).fetchone()
    if not row:
        conn.close()
        return False, "Application not found.", None
    if row["vacancy_owner"] != hr_uid:
        conn.close()
        return False, "Access denied: candidates' CVs are private unless they applied to your company's vacancy.", None

    cv_row = conn.execute("SELECT * FROM user_cvs WHERE owner_uid = ?", (row["candidate_uid"],)).fetchone()
    conn.close()
    if not cv_row:
        return False, "Candidate CV record not found.", None

    log_employer_cv_access(row["candidate_uid"], hr_user, row["vacancy_id"], row["vacancy_title"], access_type)

    structured = json.loads(cv_row["structured_cv_json"])
    if "parser_analytics" not in structured:
        structured["parser_analytics"] = analyze_resume_competencies_and_impact(cv_row["raw_text"] or "")
    return True, "Authorised via candidate job application.", {
        "application_id": row["id"],
        "application_uid": row["application_uid"],
        "vacancy_id": row["vacancy_id"],
        "vacancy_uid": row["vacancy_uid"],
        "vacancy_title": row["vacancy_title"],
        "candidate_uid": row["candidate_uid"],
        "candidate_name": row["candidate_name"],
        "applied_at": row["applied_at"],
        "cover_note": row["cover_note"] or "",
        "share_organised_cv": bool(row["share_organised_cv"]),
        "share_original_pdf": bool(row["share_original_pdf"]),
        "original_filename": cv_row["original_filename"],
        "page_count": cv_row["page_count"],
        "file_sha256": cv_row["file_sha256"][:16] + "...",
        "structured_cv": structured if row["share_organised_cv"] else None,
        "stored_pdf_path": cv_row["stored_pdf_path"] if row["share_original_pdf"] else None,
        "pdf_url": f"/api/hr/applications/{row['id']}/pdf" if row["share_original_pdf"] else None,
    }


def _seed_demo_cv_and_application() -> None:
    """Seed Aisha Rahman's default PDF CV and 1 sample application so both portals showcase the pipeline out of the box."""
    demo_js_uid = "CL-JS-2026-1042"
    conn = get_db_connection()
    has_cv = conn.execute("SELECT 1 FROM user_cvs WHERE owner_uid = ?", (demo_js_uid,)).fetchone()
    conn.close()
    if not has_cv:
        sample_path = os.path.join(SAMPLE_PDF_DIR, "Aisha_Rahman_Auditor_CV.pdf")
        if os.path.exists(sample_path):
            with open(sample_path, "rb") as f:
                pdf_bytes = f.read()
            save_user_pdf_cv(
                owner_uid=demo_js_uid,
                filename="Aisha_Rahman_Auditor_CV.pdf",
                pdf_bytes=pdf_bytes,
                user_context={
                    "full_name": "Aisha Rahman",
                    "email": "aisha.demo@careerlens.my",
                    "role_details": {
                        "industry": "Finance & Accounting",
                        "current_role": "Junior Financial Auditor",
                        "preferred_work_mode": "Hybrid",
                        "location": "Kuala Lumpur",
                    },
                },
                allow_anon_stats=True,
            )

    # Seed an initial application from Aisha to the AI Financial Compliance Analyst vacancy (id=2)
    conn = get_db_connection()
    vac = conn.execute(
        "SELECT id FROM vacancies WHERE title LIKE '%Compliance%' ORDER BY id ASC LIMIT 1"
    ).fetchone()
    conn.close()
    if vac:
        conn2 = get_db_connection()
        already = conn2.execute(
            "SELECT 1 FROM job_applications WHERE vacancy_id = ? AND candidate_uid = ?",
            (vac["id"], demo_js_uid),
        ).fetchone()
        conn2.close()
        if not already:
            apply_to_vacancy(
                candidate_uid=demo_js_uid,
                candidate_name="Aisha Rahman",
                vacancy_id=vac["id"],
                payload={
                    "share_organised_cv": True,
                    "share_original_pdf": True,
                    "cover_note": "I have 3 years of statutory audit & risk assessment experience and am actively building Python data analysis skills for AI financial compliance.",
                    "salary_expectation": 5500,
                    "available_in": "1 month",
                },
            )
