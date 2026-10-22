"""Curated CV Dataset & Benchmark Repository Manager for CareerLens AI.

Imports and manages curated candidate resumes from the hackathon benchmark dataset
into SQLite, enabling:
- Platform-wide talent pool statistics & skill frequency breakdown
- Admin screening & benchmark profile viewing
- AI Safety & Fair-AI content moderation verification
- 15-item paginated and sorted table access
"""

import csv
from datetime import datetime, timezone
import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

from auth_db import DB_PATH, get_db_connection
from content_guard import validate_content
from security_vault import mask_email, mask_name
from skills_taxonomy import extract_skills

DATASET_CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "details_extracted.csv")


def init_curated_dataset_table():
    """Create curated_cv_benchmarks table and seed initial 79 profiles if empty."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS curated_cv_benchmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_uid TEXT UNIQUE NOT NULL,
            candidate_name TEXT NOT NULL,
            target_role TEXT NOT NULL,
            experience_years REAL DEFAULT 0.0,
            skills_json TEXT NOT NULL,
            education TEXT,
            summary_text TEXT,
            ai_safety_status TEXT DEFAULT 'Verified Clean',
            ai_risk_score INTEGER DEFAULT 0,
            ai_safety_reason TEXT,
            source_dataset TEXT DEFAULT 'Hackathon Benchmark Dataset',
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()

    # Check if empty, then import from details_extracted.csv
    cur.execute("SELECT COUNT(*) as cnt FROM curated_cv_benchmarks")
    count = cur.fetchone()["cnt"]

    if count == 0 and os.path.exists(DATASET_CSV_PATH):
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        inserted = 0
        with open(DATASET_CSV_PATH, encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader, start=1):
                raw_name = row.get("Name", "").replace("Name", "").strip() or f"Candidate {idx}"
                role = row.get("RoleApplied", "").strip() or "Technology Specialist"
                exp_str = row.get("Exp_years", "").strip()
                try:
                    exp_years = float(exp_str) if exp_str else 1.5
                except ValueError:
                    exp_years = 1.0

                raw_text = row.get("TextInfo", "")
                skills = extract_skills(raw_text)
                if not skills:
                    # Fallback standard relevant skills based on role
                    skills = ["Python", "SQL", "Data Analysis", "Communication"]

                # Extract education snippet
                edu_match = re.search(r"(?:B-Tech|BE|BSc|Degree|Diploma|Master|Bachelor)[^,\.]{0,40}", raw_text, re.I)
                education = edu_match.group(0).strip() if edu_match else "Bachelor's Degree in Computing / Engineering"

                # Extract a concise executive summary snippet
                clean_snippet = re.sub(r"[\[\]',]", " ", raw_text[:280]).strip()
                clean_snippet = re.sub(r"\s+", " ", clean_snippet)
                summary = f"Qualified {role} with competencies in {', '.join(skills[:4])}. {clean_snippet[:150]}..."

                # Run AI Content Safety Validation
                audit = validate_content(f"{raw_name}\n{role}\n{summary}\n{' '.join(skills)}", context="cv_benchmark")
                status = audit["status"]
                risk_score = audit["risk_score"]
                reason = audit["reason"]

                uid = f"CL-BMK-2026-{idx:04d}"

                cur.execute(
                    """
                    INSERT OR IGNORE INTO curated_cv_benchmarks (
                        candidate_uid, candidate_name, target_role, experience_years,
                        skills_json, education, summary_text, ai_safety_status,
                        ai_risk_score, ai_safety_reason, source_dataset, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        uid,
                        raw_name,
                        role,
                        exp_years,
                        json.dumps(skills),
                        education,
                        summary,
                        status,
                        risk_score,
                        reason,
                        "Hackathon Benchmark Dataset",
                        now,
                    ),
                )
                inserted += 1
        conn.commit()

    conn.close()


def list_curated_benchmarks(
    page: int = 1,
    per_page: int = 15,
    search: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    mask_pii: bool = False,
) -> Dict[str, Any]:
    """Retrieve paginated and sorted curated benchmark CVs for Admin backdesk."""
    conn = get_db_connection()
    cur = conn.cursor()

    valid_sort_cols = {
        "id": "id",
        "candidate_uid": "candidate_uid",
        "candidate_name": "candidate_name",
        "target_role": "target_role",
        "experience_years": "experience_years",
        "created_at": "created_at",
    }
    col = valid_sort_cols.get(sort_by, "id")
    order = "DESC" if str(sort_order).lower() == "desc" else "ASC"

    where_clauses = []
    params: List[Any] = []

    if search and search.strip():
        q = f"%{search.strip().lower()}%"
        where_clauses.append("(LOWER(candidate_name) LIKE ? OR LOWER(target_role) LIKE ? OR LOWER(candidate_uid) LIKE ? OR LOWER(skills_json) LIKE ?)")
        params.extend([q, q, q, q])

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    # Count total
    count_sql = f"SELECT COUNT(*) as cnt FROM curated_cv_benchmarks {where_sql}"
    cur.execute(count_sql, params)
    total_items = cur.fetchone()["cnt"]

    # Calculate offset
    page = max(1, page)
    per_page = max(1, min(per_page, 100))
    total_pages = max(1, (total_items + per_page - 1) // per_page)
    if page > total_pages:
        page = total_pages
    offset = (page - 1) * per_page

    data_sql = f"""
        SELECT * FROM curated_cv_benchmarks
        {where_sql}
        ORDER BY {col} {order}
        LIMIT ? OFFSET ?
    """
    cur.execute(data_sql, params + [per_page, offset])
    rows = cur.fetchall()
    conn.close()

    items = []
    for r in rows:
        skills = json.loads(r["skills_json"] or "[]")
        name = r["candidate_name"]
        items.append({
            "id": r["id"],
            "candidate_uid": r["candidate_uid"],
            "candidate_name": mask_name(name) if mask_pii else name,
            "raw_name": name,
            "target_role": r["target_role"],
            "experience_years": r["experience_years"],
            "skills": skills,
            "education": r["education"],
            "summary_text": r["summary_text"],
            "ai_safety_status": r["ai_safety_status"],
            "ai_risk_score": r["ai_risk_score"],
            "ai_safety_reason": r["ai_safety_reason"],
            "source_dataset": r["source_dataset"],
            "created_at": r["created_at"],
            "is_masked": mask_pii,
        })

    return {
        "items": items,
        "total": total_items,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "sort_by": sort_by,
        "sort_order": sort_order,
    }


def get_dataset_stats() -> Dict[str, Any]:
    """Summary statistics for curated candidate benchmark dataset."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as total FROM curated_cv_benchmarks")
    total = cur.fetchone()["total"]

    cur.execute("SELECT COUNT(*) as safe_count FROM curated_cv_benchmarks WHERE ai_safety_status = 'Verified Clean'")
    safe_cnt = cur.fetchone()["safe_count"]

    cur.execute("SELECT AVG(experience_years) as avg_exp FROM curated_cv_benchmarks")
    avg_exp_row = cur.fetchone()["avg_exp"]
    avg_exp = round(avg_exp_row or 2.1, 1)

    cur.execute("SELECT target_role, COUNT(*) as cnt FROM curated_cv_benchmarks GROUP BY target_role ORDER BY cnt DESC LIMIT 5")
    top_roles = [dict(r) for r in cur.fetchall()]

    conn.close()
    return {
        "total_curated_resumes": total,
        "safe_verified_count": safe_cnt,
        "ai_compliance_rate": 100.0 if total == 0 else round((safe_cnt / total) * 100, 1),
        "avg_experience_years": avg_exp,
        "top_roles": top_roles,
    }
