"""Seed realistic demo applications and candidate CVs for consistent HR & Admin views."""

from datetime import datetime, timezone
import json
import os
import sqlite3
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "careerlens.db")


def seed_demo_applications():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # 1. Ensure Kavin Raj and Jason Lim exist in users
    extra_users = [
        (
            "CL-JS-2026-1043",
            "Kavin Raj",
            "kavin.demo@careerlens.my",
            generate_password_hash("CareerLens@2026"),
            "job_seeker",
            json.dumps({
                "seeker_type": "Fresh Graduate",
                "industry": "IT & Software",
                "current_role": "Junior Full Stack Developer",
                "education_level": "Bachelor's Degree in Computer Science (USM)",
                "years_experience": "1 Year",
                "preferred_work_mode": "Hybrid",
                "location": "Kuala Lumpur",
            }),
            1,
            now,
            now,
        ),
        (
            "CL-JS-2026-1044",
            "Jason Lim",
            "jason.demo@careerlens.my",
            generate_password_hash("CareerLens@2026"),
            "job_seeker",
            json.dumps({
                "seeker_type": "Working Adult Upskilling",
                "industry": "Marketing & PR",
                "current_role": "Digital Copywriter & Content Executive",
                "education_level": "Bachelor of Mass Communication",
                "years_experience": "2 Years",
                "preferred_work_mode": "Remote",
                "location": "Petaling Jaya, Selangor",
            }),
            1,
            now,
            now,
        ),
    ]

    for u in extra_users:
        cur.execute("SELECT id FROM users WHERE unique_uid = ?", (u[0],))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO users (
                    unique_uid, full_name, email, password_hash, role,
                    role_details_json, pdpa_consent, consent_timestamp, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, u)

    # 2. Ensure user_cvs entries for Aisha, Kavin, Jason
    cv_entries = [
        (
            "CL-JS-2026-1042",
            "Aisha_Rahman_Auditor_CV.pdf",
            "src/static/sample_cvs/Aisha_Rahman_Auditor_CV.pdf",
            json.dumps({
                "full_name": "Aisha Rahman",
                "current_role": "Junior Financial Auditor",
                "seeker_type": "Career Switcher / At Risk of AI Displacement",
                "years_experience": 3,
                "education_level": "Bachelor of Accounting (B.Acc), University of Malaya",
                "location": "Kuala Lumpur, Malaysia",
                "work_mode_preference": "Hybrid",
                "skills": ["Financial Auditing", "Risk Assessment", "Python Data Analysis", "SQL Basics", "ESG & Carbon Reporting Standards", "Excel Pivot & Macros"],
                "projects": [
                    {"title": "Automated Statutory Audit Reconciliation", "description": "Engineered automated audit scripts reconciling RM 12M general ledger accounts."},
                    {"title": "ESG Compliance Carbon Disclosure", "description": "Reskilled in Bursa Malaysia ESG disclosure metrics and carbon footprint tracking."}
                ],
                "executive_summary": "Statutory auditor with 3 years experience seeking to bridge into AI financial compliance, AML risk assessment, and ESG audit controls.",
                "review_status": "reviewed"
            })
        ),
        (
            "CL-JS-2026-1043",
            "Kavin_Raj_Software_Grad_CV.pdf",
            "src/static/sample_cvs/Kavin_Raj_Software_Grad_CV.pdf",
            json.dumps({
                "full_name": "Kavin Raj",
                "current_role": "Junior Full Stack Developer",
                "seeker_type": "Fresh Graduate",
                "years_experience": 1,
                "education_level": "B.Sc Computer Science (USM 2026)",
                "location": "Kuala Lumpur",
                "work_mode_preference": "Hybrid",
                "skills": ["Python", "SQL", "React", "Docker", "REST APIs", "Git", "Data Structures"],
                "projects": [
                    {"title": "Microservices Job Portal Backend", "description": "Designed asynchronous job matching API handling 10,000+ benchmark entries."},
                    {"title": "Real-time Chatbot Integration", "description": "Integrated LLM streaming responses using WebSocket connections."}
                ],
                "executive_summary": "Driven computer science graduate with solid foundations in Python, React, and REST APIs, passionate about scalable software architecture.",
                "review_status": "reviewed"
            })
        ),
        (
            "CL-JS-2026-1044",
            "Jason_Lim_Copywriter_CV.pdf",
            "src/static/sample_cvs/Jason_Lim_Copywriter_CV.pdf",
            json.dumps({
                "full_name": "Jason Lim",
                "current_role": "Digital Copywriter & Content Executive",
                "seeker_type": "Working Adult Upskilling",
                "years_experience": 2,
                "education_level": "B.A. in Mass Communication",
                "location": "Petaling Jaya, Selangor",
                "work_mode_preference": "Remote",
                "skills": ["Copywriting", "SEO Content Strategy", "Prompt Engineering", "Google Analytics", "Social Media Campaigns", "Bilingual Communication"],
                "projects": [
                    {"title": "Omnichannel Brand Reskilling Campaign", "description": "Led viral digital content strategy increasing engagement by 140%."},
                    {"title": "Generative AI Content Governance", "description": "Formulated enterprise brand guidelines for human-in-the-loop AI copy generation."}
                ],
                "executive_summary": "Versatile digital copywriter with expertise in SEO strategy, bilingual prompt engineering, and audience conversion.",
                "review_status": "reviewed"
            })
        )
    ]

    for uid, fn, pdf_path, struct_json in cv_entries:
        cur.execute("SELECT id FROM user_cvs WHERE owner_uid = ?", (uid,))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO user_cvs (
                    owner_uid, original_filename, stored_pdf_path, file_sha256,
                    file_size_bytes, page_count, raw_text, structured_cv_json,
                    allow_anon_stats, uploaded_at, updated_at
                ) VALUES (?, ?, ?, 'demo_sha256_hash', 2420, 1, 'Sample CV Text', ?, 1, ?, ?)
            """, (uid, fn, pdf_path, struct_json, now, now))
        else:
            cur.execute("""
                UPDATE user_cvs SET structured_cv_json = ?, updated_at = ? WHERE owner_uid = ?
            """, (struct_json, now, uid))

    # 3. Seed applications if fewer than 4 applications exist
    cur.execute("SELECT COUNT(*) as c FROM job_applications")
    if cur.fetchone()[0] < 4:
        apps = [
            (
                "APP-2026-8801A",
                2,  # AI Financial Compliance Analyst
                "CL-JS-2026-1042",
                "Aisha Rahman",
                1, 1,
                "Experienced statutory auditor transitioning into AI financial risk and compliance controls.",
                5800,
                "Immediate",
                "Shortlisted",
                now
            ),
            (
                "APP-2026-8801B",
                1,  # Software Developer
                "CL-JS-2026-1043",
                "Kavin Raj",
                1, 1,
                "Full-stack developer with Python, React, and SQL competencies seeking entry-level engineering role.",
                4500,
                "2 weeks",
                "Invited for Interview",
                now
            ),
            (
                "APP-2026-8801C",
                4,  # AI Content Strategist & Copywriter
                "CL-JS-2026-1044",
                "Jason Lim",
                1, 0,
                "Bilingual copywriter skilled in SEO prompt engineering and AI workflow integration.",
                4200,
                "1 month",
                "Pending Review",
                now
            ),
            (
                "APP-2026-8801D",
                7,  # ESG & Carbon Compliance Specialist
                "CL-JS-2026-1042",
                "Aisha Rahman",
                1, 1,
                "Applying verified ESG audit and carbon accounting credentials to corporate sustainability.",
                6200,
                "1 month",
                "Pending Review",
                now
            )
        ]

        for a in apps:
            cur.execute("""
                INSERT OR IGNORE INTO job_applications (
                    application_uid, vacancy_id, candidate_uid, candidate_name,
                    share_organised_cv, share_original_pdf, cover_note,
                    salary_expectation, available_in, hr_decision, applied_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, a)

    conn.commit()
    conn.close()
    print("Demo applications and CV profiles successfully synchronized!")


if __name__ == "__main__":
    seed_demo_applications()
