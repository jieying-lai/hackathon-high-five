"""SQLite Authentication & User Management Module for CareerLens AI.

Handles user registration, unique ID generation, email uniqueness check,
PBKDF2-SHA256 password hashing, role-specific profile metadata (Job Seeker vs HR/Company),
and PDPA privacy consent logging.
"""

from datetime import datetime, timezone
import json
import os
import random
import re
import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DATA_DIR, "careerlens.db")

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def get_db_connection():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize SQLite tables and seed demo accounts if not present."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unique_uid TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            role_details_json TEXT NOT NULL,
            pdpa_consent INTEGER NOT NULL DEFAULT 1,
            consent_timestamp TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()

    # Seed 2 default demo users (1 Job Seeker, 1 HR Manager) so demo login works out of the box
    cur.execute("SELECT COUNT(*) as cnt FROM users")
    if cur.fetchone()["cnt"] == 0:
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        demo_users = [
            (
                "CL-JS-2026-1042",
                "Aisha Rahman",
                "aisha.demo@careerlens.my",
                generate_password_hash("CareerLens@2026"),
                "job_seeker",
                json.dumps({
                    "seeker_type": "Career Switcher / At Risk of AI Displacement",
                    "industry": "Finance & Accounting",
                    "current_role": "Junior Financial Auditor",
                    "education_level": "Bachelor's Degree (B.Acc)",
                    "years_experience": "3 Years",
                    "preferred_work_mode": "Hybrid",
                    "location": "Kuala Lumpur",
                }),
                1,
                now,
                now,
            ),
            (
                "CL-HR-2026-8801",
                "Daniel Tan (HR Lead)",
                "hr.demo@nexussme.my",
                generate_password_hash("CareerLens@2026"),
                "hr_company",
                json.dumps({
                    "company_name": "Nexus Digital & Finance Sdn Bhd",
                    "company_size": "51–250 Employees (Medium Enterprise)",
                    "company_industry": "Finance & Accounting",
                    "hr_job_title": "Head of People & Workforce Reskilling",
                    "department": "Human Resources & L&D",
                    "company_location": "Kuala Lumpur, Malaysia",
                    "reskilling_focus": "Internal Workforce Reskilling & Talent Mobility",
                }),
                1,
                now,
                now,
            ),
        ]
        cur.executemany(
            """
            INSERT INTO users (
                unique_uid, full_name, email, password_hash, role,
                role_details_json, pdpa_consent, consent_timestamp, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            demo_users,
        )
        conn.commit()
    conn.close()


def generate_unique_uid(role: str) -> str:
    prefix = "CL-HR" if role == "hr_company" else "CL-JS"
    conn = get_db_connection()
    cur = conn.cursor()
    while True:
        candidate = f"{prefix}-2026-{random.randint(1000, 9999)}"
        cur.execute("SELECT 1 FROM users WHERE unique_uid = ?", (candidate,))
        if not cur.fetchone():
            conn.close()
            return candidate


def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter (A-Z)."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter (a-z)."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number (0-9)."
    if not re.search(r"[^A-Za-z0-9]", password):
        return False, "Password must contain at least one special character (!@#$%^&*)."
    return True, "Strong password."


def register_user(data: dict) -> tuple[bool, str, dict | None]:
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""
    role = (data.get("role") or "job_seeker").strip()
    pdpa_consent = bool(data.get("pdpa_consent"))
    role_details = data.get("role_details") or {}

    if len(full_name) < 2:
        return False, "Please enter your full name (at least 2 characters).", None

    if not EMAIL_REGEX.match(email):
        return False, "Please enter a valid email address (e.g., name@domain.com).", None

    if password != confirm_password:
        return False, "Passwords do not match. Please enter the same password twice.", None

    ok_pw, pw_msg = validate_password_strength(password)
    if not ok_pw:
        return False, pw_msg, None

    if role not in ("job_seeker", "hr_company"):
        return False, "Please select a valid account role (Job Seeker or HR/Company).", None

    if role == "hr_company":
        company_name = (role_details.get("company_name") or "").strip()
        hr_job_title = (role_details.get("hr_job_title") or "").strip()
        if len(company_name) < 2:
            return False, "HR / Company accounts must provide a valid Company Name.", None
        if len(hr_job_title) < 2:
            return False, "Please enter your HR / Management job title.", None

    if not pdpa_consent:
        return False, "You must agree to the Privacy Data & PDPA Terms & Conditions to register.", None

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM users WHERE email = ?", (email,))
    if cur.fetchone():
        conn.close()
        return False, "This email address is already registered. Please sign in or use a different email.", None

    unique_uid = generate_unique_uid(role)
    pw_hash = generate_password_hash(password)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    cur.execute(
        """
        INSERT INTO users (
            unique_uid, full_name, email, password_hash, role,
            role_details_json, pdpa_consent, consent_timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            unique_uid,
            full_name,
            email,
            pw_hash,
            role,
            json.dumps(role_details),
            1,
            now,
            now,
        ),
    )
    conn.commit()
    conn.close()

    user_info = {
        "unique_uid": unique_uid,
        "full_name": full_name,
        "email": email,
        "role": role,
        "role_details": role_details,
        "password_hash_preview": pw_hash[:28] + "...",
        "consent_timestamp": now,
    }
    return True, "Account registered successfully!", user_info


def authenticate_user(email: str, password: str) -> tuple[bool, str, dict | None]:
    email_clean = (email or "").strip().lower()
    if not email_clean or not password:
        return False, "Please enter both your email address and password.", None

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return False, "No account found with this email address. Please register first.", None

    if not check_password_hash(row["password_hash"], password):
        return False, "Incorrect password. Please try again.", None

    user_info = {
        "unique_uid": row["unique_uid"],
        "full_name": row["full_name"],
        "email": row["email"],
        "role": row["role"],
        "role_details": json.loads(row["role_details_json"] or "{}"),
        "password_hash_preview": row["password_hash"][:28] + "...",
        "consent_timestamp": row["consent_timestamp"],
    }
    return True, "Signed in successfully!", user_info


def get_user_by_uid(unique_uid: str) -> dict | None:
    """Fetch complete public user account info by unique_uid."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE unique_uid = ?", (unique_uid,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "unique_uid": row["unique_uid"],
        "full_name": row["full_name"],
        "email": row["email"],
        "role": row["role"],
        "role_details": json.loads(row["role_details_json"] or "{}"),
        "pdpa_consent": bool(row["pdpa_consent"]),
        "consent_timestamp": row["consent_timestamp"],
        "created_at": row["created_at"],
    }


def update_user_profile(unique_uid: str, full_name: str = None, email: str = None,
                        role_details: dict = None) -> tuple[bool, str, dict | None]:
    """Update profile details (name, email, and role_details) for a user account."""
    user = get_user_by_uid(unique_uid)
    if not user:
        return False, "Account not found.", None

    new_name = (full_name if full_name is not None else user["full_name"]).strip()
    new_email = (email if email is not None else user["email"]).strip().lower()

    if len(new_name) < 2:
        return False, "Full name must be at least 2 characters.", None

    if not EMAIL_REGEX.match(new_email):
        return False, "Please enter a valid email address.", None

    conn = get_db_connection()
    cur = conn.cursor()

    # Check email uniqueness if email is changed
    if new_email != user["email"].lower():
        cur.execute("SELECT id FROM users WHERE email = ? AND unique_uid != ?", (new_email, unique_uid))
        if cur.fetchone():
            conn.close()
            return False, "This email address is already in use by another account.", None

    # Merge role_details
    current_rd = user["role_details"] or {}
    if role_details is not None:
        current_rd.update(role_details)

    cur.execute(
        """
        UPDATE users
        SET full_name = ?, email = ?, role_details_json = ?
        WHERE unique_uid = ?
        """,
        (new_name, new_email, json.dumps(current_rd), unique_uid),
    )
    conn.commit()
    conn.close()

    updated_user = get_user_by_uid(unique_uid)
    return True, "Profile updated successfully!", updated_user


def update_user_password(unique_uid: str, current_password: str, new_password: str,
                         confirm_password: str) -> tuple[bool, str]:
    """Verify current password and set a new strong password."""
    if not current_password or not new_password:
        return False, "Please enter both your current password and a new password."

    if new_password != confirm_password:
        return False, "New passwords do not match. Please verify and re-type."

    ok_pw, pw_msg = validate_password_strength(new_password)
    if not ok_pw:
        return False, pw_msg

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT password_hash FROM users WHERE unique_uid = ?", (unique_uid,))
    row = cur.fetchone()

    if not row:
        conn.close()
        return False, "Account not found."

    if not check_password_hash(row["password_hash"], current_password):
        conn.close()
        return False, "Current password is incorrect. Please try again."

    new_hash = generate_password_hash(new_password)
    cur.execute("UPDATE users SET password_hash = ? WHERE unique_uid = ?", (new_hash, unique_uid))
    conn.commit()
    conn.close()

    return True, "Password updated successfully!"

