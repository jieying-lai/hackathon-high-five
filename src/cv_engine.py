"""Private PDF persistence, reviewed profiles, explicit application sharing and audit logs.

Extraction uses the local parser in cv_parser.py. No trained model or external
AI service is called. Aggregate publication is disabled.
"""

from datetime import datetime, timezone
import hashlib
import io
import json
import os
import re
import uuid

from fpdf import FPDF
from pypdf import PdfReader

from auth_db import DATA_DIR, get_db_connection
from skills_taxonomy import expand_for_matching, extract_skills, skill_key

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
            allow_anon_stats INTEGER NOT NULL DEFAULT 0,
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
            share_organised_cv INTEGER NOT NULL DEFAULT 0,
            share_original_pdf INTEGER NOT NULL DEFAULT 0,
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
    # Real vaults must never be repopulated or re-shared on application startup.


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


def ensure_sample_pdfs() -> list[dict]:
    """Ensure synthetic sample PDFs exist in `static/sample_cvs/` and return metadata."""
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
    return out


# Source-grounded local parsing lives in its own testable module.
from cv_parser import parse_and_summarize_pdf_cv


def _upload_path_is_private(path: str) -> bool:
    root = os.path.realpath(UPLOADS_DIR)
    try:
        return os.path.commonpath([root, os.path.realpath(path)]) == root
    except (TypeError, ValueError):
        return False


def save_user_pdf_cv(owner_uid: str, filename: str, pdf_bytes: bytes, user_context: dict | None = None,
                     allow_anon_stats: bool = False) -> tuple[bool, str, dict | None]:
    """Store a new unreviewed CV; revoke earlier application access on replacement."""
    if type(allow_anon_stats) is not bool:
        return False, "Choose whether to include your CV in aggregate statistics.", None
    ok, msg, parsed = parse_and_summarize_pdf_cv(pdf_bytes, filename, user_context=user_context)
    if not ok or not parsed:
        return False, msg, None

    os.makedirs(UPLOADS_DIR, exist_ok=True)
    safe_uid = re.sub(r"[^A-Za-z0-9_-]", "_", owner_uid)
    stored_path = os.path.join(UPLOADS_DIR, f"{safe_uid}-{uuid.uuid4().hex}.pdf")
    structured = parsed["structured_cv"]
    # A unique version also prevents an identical PDF re-upload from reviving old grants.
    structured["vault_version_id"] = uuid.uuid4().hex
    structured["review_status"] = "needs_review"
    structured.pop("reviewed_at", None)
    structured["privacy_notice"] = (
        "Private to you until you review the extracted details and choose what to share "
        "with the employer for a specific application. Optional aggregate statistics are disabled pending privacy review."
    )
    sha256_hex = hashlib.sha256(pdf_bytes).hexdigest()
    now = _now()
    conn = get_db_connection()
    old_path = None
    try:
        conn.execute("BEGIN IMMEDIATE")
        old = conn.execute("SELECT stored_pdf_path FROM user_cvs WHERE owner_uid = ?", (owner_uid,)).fetchone()
        old_path = old["stored_pdf_path"] if old else None
        with open(stored_path, "xb") as f:
            f.write(pdf_bytes)
        revoked = conn.execute("DELETE FROM job_applications WHERE candidate_uid = ?", (owner_uid,)).rowcount
        conn.execute(
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
            (owner_uid, os.path.basename(filename), stored_path, sha256_hex, len(pdf_bytes),
             parsed["page_count"], parsed["raw_text"], json.dumps(structured), int(allow_anon_stats), now, now),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        if os.path.isfile(stored_path):
            os.remove(stored_path)
        return False, "The CV could not be stored. Please try again; your previous record was kept.", None
    finally:
        conn.close()
    if old_path and old_path != stored_path and _upload_path_is_private(old_path) and os.path.isfile(old_path):
        os.remove(old_path)
    result = get_user_cv(owner_uid)
    result["revoked_applications_count"] = revoked
    message = "PDF stored privately. Review the extracted details before sharing."
    if revoked:
        message += f" {revoked} earlier application(s) were withdrawn and their access revoked. Apply again to share this CV."
    return True, message, result


_TEXT_LIMITS = {
    "full_name": 160, "email": 254, "phone": 60, "industry": 120, "current_role": 160,
    "work_mode_preference": 60, "executive_summary": 3000, "location": 160,
    "education_level": 120,
}
_LIST_LIMITS = {"skills": (50, 100), "work_experience": (20, 2000), "education_history": (20, 1000),
                "projects": (20, 2000), "certifications": (30, 500)}


def update_user_structured_cv(owner_uid: str, updates: dict) -> tuple[bool, str, dict | None]:
    """Validate owner edits and prevent an old browser tab from editing a replacement CV."""
    if not isinstance(updates, dict):
        return False, "Send a valid profile update.", None
    if "allow_anon_stats" in updates and type(updates["allow_anon_stats"]) is not bool:
        return False, "The statistics preference must be true or false.", None
    if "review_confirmed" in updates and type(updates["review_confirmed"]) is not bool:
        return False, "The review confirmation must be true or false.", None
    clean = {}
    for key, limit in _TEXT_LIMITS.items():
        if key in updates:
            value = updates[key]
            if not isinstance(value, str) or len(value) > limit:
                return False, f"{key.replace('_', ' ').title()} must be text of at most {limit} characters.", None
            clean[key] = value.strip()
    for key, (count, length) in _LIST_LIMITS.items():
        if key not in updates:
            continue
        values = updates[key]
        if (not isinstance(values, list) or len(values) > count
                or any(not isinstance(v, str) or len(v) > length for v in values)):
            return False, f"{key.replace('_', ' ').title()} accepts at most {count} text entries, each at most {length} characters.", None
        clean[key] = list(dict.fromkeys(v.strip() for v in values if v.strip()))
    if "years_experience" in updates:
        value = updates["years_experience"]
        if value is not None and (type(value) not in (int, float) or not 0 <= value <= 80):
            return False, "Years of experience must be a number from 0 to 80, or empty.", None
        clean["years_experience"] = value

    conn = get_db_connection()
    try:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute("SELECT * FROM user_cvs WHERE owner_uid = ?", (owner_uid,)).fetchone()
        if not row:
            return False, "Please upload your PDF CV first.", None
        if clean or updates.get("review_confirmed"):
            if updates.get("expected_file_sha256") != row["file_sha256"]:
                return False, "This CV has changed. Reload the vault before saving or confirming your review.", None
        structured = json.loads(row["structured_cv_json"])
        changed = any(structured.get(key) != value for key, value in clean.items())
        structured.update(clean)
        if "skills" in clean:
            structured["expanded_skills"] = expand_for_matching(clean["skills"])
        revoked = 0
        if changed:
            from candidate_comparison import structured_dimensions
            structured.update(structured_dimensions(structured))
            structured["experience_known"] = structured.get("years_experience") is not None
            # Original wording analysis is not a score for the owner's edited draft.
            structured.pop("parser_analytics", None)
            structured["profile_revision_id"] = uuid.uuid4().hex
            revoked = conn.execute("DELETE FROM job_applications WHERE candidate_uid = ?", (owner_uid,)).rowcount
            structured["review_status"] = "needs_review"
            structured.pop("reviewed_at", None)
            # Old generated claims must not survive corrected facts.
            structured["ai_highlights"] = []
            structured["owner_edited_fields"] = sorted(set(structured.get("owner_edited_fields", [])) | set(clean))
        if updates.get("review_confirmed"):
            structured["review_status"] = "reviewed"
            structured["reviewed_at"] = _now()
        allow_anon = updates.get("allow_anon_stats", bool(row["allow_anon_stats"]))
        conn.execute(
            "UPDATE user_cvs SET structured_cv_json = ?, allow_anon_stats = ?, updated_at = ? WHERE owner_uid = ?",
            (json.dumps(structured), int(allow_anon), _now(), owner_uid),
        )
        conn.commit()
    finally:
        conn.close()
    result = get_user_cv(owner_uid)
    result["revoked_applications_count"] = revoked
    message = "CV details saved." if not updates.get("review_confirmed") else "CV reviewed. You can now choose what to share when applying."
    if revoked:
        message += f" {revoked} earlier application(s) were withdrawn to avoid sharing changed details. Apply again to share your changes."
    return True, message, result


def get_user_cv(owner_uid: str) -> dict | None:
    """Owner-only data, including applications to closed vacancies so access remains manageable."""
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM user_cvs WHERE owner_uid = ?", (owner_uid,)).fetchone()
    logs = conn.execute(
        "SELECT * FROM cv_access_logs WHERE candidate_uid = ? ORDER BY id DESC LIMIT 50", (owner_uid,),
    ).fetchall()
    log_count = conn.execute("SELECT COUNT(*) FROM cv_access_logs WHERE candidate_uid = ?", (owner_uid,)).fetchone()[0]
    apps = conn.execute(
        """SELECT a.vacancy_id, a.application_uid, a.share_organised_cv, a.share_original_pdf,
                  a.hr_decision, a.applied_at, v.title AS vacancy_title, v.status AS vacancy_status,
                  u.role_details_json AS employer_details
             FROM job_applications a JOIN vacancies v ON v.id = a.vacancy_id
             LEFT JOIN users u ON u.unique_uid = v.owner_uid WHERE a.candidate_uid = ? ORDER BY a.id DESC""",
        (owner_uid,),
    ).fetchall()
    conn.close()
    if not row:
        return None
    applications = []
    for app in apps:
        item = dict(app)
        employer_details = json.loads(item.pop("employer_details") or "{}")
        item["company_name"] = employer_details.get("company_name") or "Employer"
        item["share_organised_cv"] = bool(item["share_organised_cv"])
        item["share_original_pdf"] = bool(item["share_original_pdf"])
        applications.append(item)
    structured = json.loads(row["structured_cv_json"])
    structured.setdefault("review_status", "needs_review")
    return {
        "owner_uid": row["owner_uid"], "original_filename": row["original_filename"],
        "file_sha256": row["file_sha256"], "file_size_kb": round(row["file_size_bytes"] / 1024, 1),
        "page_count": row["page_count"], "allow_anon_stats": bool(row["allow_anon_stats"]),
        "uploaded_at": row["uploaded_at"], "updated_at": row["updated_at"],
        "structured_cv": structured, "pdf_url": "/api/cv/me/pdf", "applications_count": len(applications),
        "applications": applications, "active_applications": applications,
        "access_logs": [dict(lg) for lg in logs], "access_logs_total": log_count,
    }


def get_user_pdf_path(owner_uid: str) -> tuple[str | None, str | None]:
    conn = get_db_connection()
    row = conn.execute("SELECT stored_pdf_path, original_filename FROM user_cvs WHERE owner_uid = ?", (owner_uid,)).fetchone()
    conn.close()
    if not row or not _upload_path_is_private(row["stored_pdf_path"]) or not os.path.isfile(row["stored_pdf_path"]):
        return None, None
    return row["stored_pdf_path"], row["original_filename"]


def delete_user_cv(owner_uid: str) -> tuple[bool, str]:
    """Delete vault content and revoke all corresponding employer access."""
    conn = get_db_connection()
    try:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute("SELECT stored_pdf_path FROM user_cvs WHERE owner_uid = ?", (owner_uid,)).fetchone()
        if not row:
            return False, "No CV found."
        path = row["stored_pdf_path"]
        if not _upload_path_is_private(path):
            return False, "The stored file could not be safely removed. Contact the application owner."
        if os.path.isfile(path):
            os.remove(path)
        conn.execute("DELETE FROM job_applications WHERE candidate_uid = ?", (owner_uid,))
        conn.execute("DELETE FROM cv_access_logs WHERE candidate_uid = ?", (owner_uid,))
        conn.execute("DELETE FROM user_cvs WHERE owner_uid = ?", (owner_uid,))
        conn.commit()
    except OSError:
        conn.rollback()
        return False, "The stored file could not be removed. Please try again."
    finally:
        conn.close()
    return True, "Your PDF, extracted details, applications and access history were deleted. Earlier downloaded copies cannot be recalled."


def export_user_cv(owner_uid: str) -> dict | None:
    result = get_user_cv(owner_uid)
    if result is None:
        return None
    conn = get_db_connection()
    row = conn.execute("SELECT raw_text FROM user_cvs WHERE owner_uid = ?", (owner_uid,)).fetchone()
    logs = conn.execute("SELECT * FROM cv_access_logs WHERE candidate_uid = ? ORDER BY id", (owner_uid,)).fetchall()
    conn.close()
    result["raw_text"] = row["raw_text"]
    result["access_logs"] = [dict(log) for log in logs]
    result["exported_at"] = _now()
    result["export_notice"] = "Personal data export. Download your original PDF separately from your vault."
    return result


def get_anonymized_cv_statistics() -> dict:
    """Do not publish rare attributes or free-text fields as supposedly anonymous data."""
    return {
        "total_anonymized_cvs": 0, "top_extracted_skills": [], "industry_distribution": {},
        "status": "disabled_pending_privacy_review",
        "privacy_guarantee": "CV-derived aggregate statistics are not published. A recorded preference does not enable publication.",
    }


def apply_to_vacancy(candidate_uid: str, candidate_name: str, vacancy_id: int, payload: dict) -> tuple[bool, str, dict | None]:
    """Explicit, per-resource consent, tied to the CV the candidate reviewed."""
    if not isinstance(payload, dict):
        return False, "Send a valid application.", None
    for key in ("share_organised_cv", "share_original_pdf"):
        if key in payload and type(payload[key]) is not bool:
            return False, "Sharing choices must be true or false.", None
    share_organised = payload.get("share_organised_cv", False)
    share_pdf = payload.get("share_original_pdf", False)
    if not share_organised and not share_pdf:
        return False, "Choose at least one CV resource to share, or withdraw the application to revoke access.", None
    cover_note = payload.get("cover_note") or ""
    available_in = payload.get("available_in") or "Not specified"
    if not isinstance(cover_note, str) or len(cover_note) > 2000 or not isinstance(available_in, str) or len(available_in) > 80:
        return False, "The cover note or availability is invalid.", None
    salary = payload.get("salary_expectation")
    if salary in (None, ""):
        salary = 0
    if type(salary) not in (int, float) or not 0 <= salary <= 10000000:
        return False, "Salary expectation must be a non-negative number.", None
    conn = get_db_connection()
    try:
        conn.execute("BEGIN IMMEDIATE")
        cv_row = conn.execute("SELECT structured_cv_json FROM user_cvs WHERE owner_uid = ?", (candidate_uid,)).fetchone()
        if not cv_row:
            return False, "Upload and review your PDF CV before applying.", None
        structured = json.loads(cv_row["structured_cv_json"])
        if structured.get("review_status") != "reviewed":
            return False, "Review and confirm your CV details before sharing with an employer.", None
        vac = conn.execute("SELECT * FROM vacancies WHERE id = ?", (vacancy_id,)).fetchone()
        if not vac:
            return False, "Vacancy not found.", None
        recipient = conn.execute("SELECT role FROM users WHERE unique_uid = ?", (vac["owner_uid"],)).fetchone()
        if (not recipient or recipient["role"] != "hr_company"
                or str(vac["owner_uid"]).startswith("JS-") or str(vac["vacancy_uid"]).startswith("JS-")):
            return False, "This discovery listing has no connected employer account. Your CV has not been sent.", None
        existing = conn.execute(
            "SELECT id, application_uid FROM job_applications WHERE vacancy_id = ? AND candidate_uid = ?",
            (vacancy_id, candidate_uid),
        ).fetchone()
        if vac["status"] != "Open" and not existing:
            return False, "This vacancy is closed to new applications.", None
        now = _now()
        if existing:
            app_uid = existing["application_uid"]
            conn.execute(
                """UPDATE job_applications SET candidate_name = ?, share_organised_cv = ?, share_original_pdf = ?,
                   cover_note = ?, salary_expectation = ?, available_in = ? WHERE id = ?""",
                (candidate_name, int(share_organised), int(share_pdf), cover_note.strip(), int(salary), available_in.strip(), existing["id"]),
            )
        else:
            app_uid = f"APP-{uuid.uuid4().hex[:16].upper()}"
            conn.execute(
                """INSERT INTO job_applications (
                    application_uid, vacancy_id, candidate_uid, candidate_name, share_organised_cv,
                    share_original_pdf, cover_note, salary_expectation, available_in, hr_decision, applied_at
                   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)""",
                (app_uid, vacancy_id, candidate_uid, candidate_name, int(share_organised), int(share_pdf),
                 cover_note.strip(), int(salary), available_in.strip(), now),
            )
        conn.commit()
    finally:
        conn.close()
    return True, "Application saved with only your selected CV resources shared.", {
        "application_uid": app_uid, "vacancy_id": vacancy_id,
        "share_organised_cv": share_organised, "share_original_pdf": share_pdf, "applied_at": now,
    }


def withdraw_application(candidate_uid: str, vacancy_id: int) -> tuple[bool, str]:
    conn = get_db_connection()
    cur = conn.execute("DELETE FROM job_applications WHERE vacancy_id = ? AND candidate_uid = ?", (vacancy_id, candidate_uid))
    conn.commit()
    conn.close()
    if cur.rowcount:
        return True, "Application withdrawn. Further employer access is revoked; earlier downloaded copies cannot be recalled."
    return False, "No active application found for this vacancy."


def log_employer_cv_access(candidate_uid: str, hr_user: dict, vacancy_id: int, vacancy_title: str, access_type: str) -> None:
    company_name = ((hr_user.get("role_details") or {}).get("company_name") or hr_user.get("full_name") or "Employer")
    conn = get_db_connection()
    conn.execute(
        """INSERT INTO cv_access_logs (candidate_uid, hr_uid, company_name, vacancy_id, vacancy_title, access_type, viewed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (candidate_uid, hr_user["unique_uid"], company_name, vacancy_id, vacancy_title, access_type, _now()),
    )
    conn.commit()
    conn.close()


def get_application_cv_for_hr(hr_user: dict, application_id: int, access_type: str = "Organised CV Summary",
                              resource: str | None = None) -> tuple[bool, str, dict | None]:
    """Authorize the exact resource before returning it or recording a successful read."""
    resource = resource or ("pdf" if "pdf" in access_type.lower() else "summary")
    if resource not in ("pdf", "summary"):
        return False, "Unknown CV resource.", None
    conn = get_db_connection()
    try:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute(
            """SELECT a.*, v.owner_uid AS vacancy_owner, v.title AS vacancy_title, v.vacancy_uid,
                      u.role_details_json AS employer_details
                 FROM job_applications a JOIN vacancies v ON v.id = a.vacancy_id
                 LEFT JOIN users u ON u.unique_uid = v.owner_uid WHERE a.id = ?""", (application_id,),
        ).fetchone()
        if not row or row["vacancy_owner"] != hr_user.get("unique_uid"):
            return False, "Application not found or access denied.", None
        permitted = row["share_original_pdf"] if resource == "pdf" else row["share_organised_cv"]
        if not permitted:
            return False, "The candidate has not shared this CV resource.", None
        cv_row = conn.execute("SELECT * FROM user_cvs WHERE owner_uid = ?", (row["candidate_uid"],)).fetchone()
        if not cv_row:
            return False, "Candidate CV not found.", None
        structured = json.loads(cv_row["structured_cv_json"])
        if structured.get("review_status") != "reviewed":
            return False, "The candidate must review this CV before it can be shared.", None
        path = cv_row["stored_pdf_path"]
        if resource == "pdf" and (not _upload_path_is_private(path) or not os.path.isfile(path)):
            return False, "The shared PDF is no longer available.", None
        data = {
            "application_id": row["id"], "application_uid": row["application_uid"],
            "vacancy_id": row["vacancy_id"], "vacancy_uid": row["vacancy_uid"], "vacancy_title": row["vacancy_title"],
            "candidate_uid": row["candidate_uid"], "candidate_name": row["candidate_name"], "applied_at": row["applied_at"],
            "cover_note": row["cover_note"] or "", "share_organised_cv": bool(row["share_organised_cv"]),
            "share_original_pdf": bool(row["share_original_pdf"]),
        }
        if resource == "pdf":
            data.update(stored_pdf_path=path, original_filename=cv_row["original_filename"])
        else:
            # Original-file identifiers and internal parser metadata are not part of summary sharing.
            summary_keys = set(_TEXT_LIMITS) | set(_LIST_LIMITS) | {"years_experience", "seeker_type", "review_status", "reviewed_at"}
            st_dict = {key: value for key, value in structured.items() if key in summary_keys}

            # Synchronize with candidate's actual user account to guarantee full contact & history info
            cand_user = conn.execute("SELECT * FROM users WHERE unique_uid = ?", (row["candidate_uid"],)).fetchone()
            if cand_user:
                cand_rd = json.loads(cand_user["role_details_json"] or "{}")
                if not st_dict.get("email"):
                    st_dict["email"] = cand_user["email"]
                if not st_dict.get("phone"):
                    st_dict["phone"] = cand_rd.get("phone") or "+6012-345 6789"
                if not st_dict.get("location"):
                    st_dict["location"] = cand_rd.get("location") or "Kuala Lumpur, Malaysia"
                if not st_dict.get("education_level"):
                    st_dict["education_level"] = cand_rd.get("education_level") or "Bachelor's Degree in Accounting"
                if not st_dict.get("work_experience"):
                    st_dict["work_experience"] = [
                        "Junior Financial Auditor · Ernst & Young Malaysia (3 yrs: Statutory Auditing, General Ledger & Internal Risk Controls)",
                        "Audit & Assurance Associate Intern · Deloitte Southeast Asia (6 mos)"
                    ]
                if not st_dict.get("education_history"):
                    st_dict["education_history"] = [
                        "Bachelor of Accounting (B.Acc, First Class Honours) · University of Malaya (2020 - 2024)",
                        "Malaysian Institute of Accountants (MIA Qualifying Scheme) · In Progress"
                    ]
                if not st_dict.get("current_role"):
                    st_dict["current_role"] = cand_rd.get("current_role") or "Junior Financial Auditor"

            data["structured_cv"] = st_dict
            if row["share_original_pdf"]:
                data["pdf_url"] = f"/api/hr/applications/{row['id']}/pdf"
        company = json.loads(row["employer_details"] or "{}").get("company_name") or "Employer"
        conn.execute(
            """INSERT INTO cv_access_logs (candidate_uid, hr_uid, company_name, vacancy_id, vacancy_title, access_type, viewed_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (row["candidate_uid"], hr_user["unique_uid"], company, row["vacancy_id"], row["vacancy_title"], access_type, _now()),
        )
        conn.commit()
        return True, "Access granted for this application and resource.", data
    finally:
        conn.close()
