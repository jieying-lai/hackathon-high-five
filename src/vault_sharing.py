"""Recipient-bound, expiring CV grants. A copied URL is not an authorization."""
from datetime import datetime, timedelta, timezone
from contextlib import contextmanager
import hashlib
import json
import secrets

from auth_db import get_db_connection


@contextmanager
def _database():
    conn = get_db_connection()
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def init_share_tables():
    with _database() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS cv_shares (
            grant_id TEXT PRIMARY KEY, owner_uid TEXT NOT NULL,
            recipient_uid TEXT NOT NULL, file_sha256 TEXT NOT NULL,
            summary_revision TEXT NOT NULL, share_summary INTEGER NOT NULL,
            share_pdf INTEGER NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL
        )""")
        conn.execute("""CREATE TABLE IF NOT EXISTS cv_share_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT, owner_uid TEXT NOT NULL,
            recipient_uid TEXT NOT NULL, recipient_name TEXT NOT NULL,
            resource TEXT NOT NULL, viewed_at TEXT NOT NULL
        )""")


def _now():
    return datetime.now(timezone.utc)


def _revision(raw):
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _active(row, now=None):
    return (row["expires_at"] > (now or _now().isoformat())
            and row["file_sha256"] == row["current_file_sha256"]
            and row["summary_revision"] == _revision(row["structured_cv_json"]))


def _public(row):
    return {"grant_id": row["grant_id"], "recipient_email": row["recipient_email"],
            "recipient_name": row["recipient_name"], "owner_name": row["owner_name"],
            "share_summary": bool(row["share_summary"]), "share_pdf": bool(row["share_pdf"]),
            "expires_at": row["expires_at"], "url": "/shared/" + row["grant_id"]}


SELECT_GRANTS = """SELECT s.*, c.file_sha256 AS current_file_sha256, c.structured_cv_json,
 c.stored_pdf_path, c.original_filename, r.email AS recipient_email,
 r.full_name AS recipient_name, o.full_name AS owner_name
 FROM cv_shares s JOIN user_cvs c ON c.owner_uid=s.owner_uid
 JOIN users r ON r.unique_uid=s.recipient_uid JOIN users o ON o.unique_uid=s.owner_uid """


def list_shares(uid):
    with _database() as conn:
        rows = conn.execute(SELECT_GRANTS + "WHERE s.owner_uid=? OR s.recipient_uid=?",
                            (uid, uid)).fetchall()
        events = conn.execute("""SELECT recipient_name,resource,viewed_at FROM cv_share_events
            WHERE owner_uid=? ORDER BY id DESC LIMIT 50""", (uid,)).fetchall()
    active = [row for row in rows if _active(row)]
    return {"shares": [_public(r) for r in active if r["owner_uid"] == uid],
            "received": [_public(r) for r in active if r["recipient_uid"] == uid],
            "events": [dict(e) for e in events]}


def create_share(uid, data):
    email = data.get("recipient_email")
    if not isinstance(email, str) or not email.strip():
        return False, "Enter the recipient's registered CareerLens email.", None
    summary, pdf = data.get("share_summary", False), data.get("share_pdf", False)
    if type(summary) is not bool or type(pdf) is not bool or not (summary or pdf):
        return False, "Choose the summary, original PDF, or both to share.", None
    days = data.get("expires_in_days", 7)
    if type(days) is not int or days not in (1, 7, 30):
        return False, "Choose an expiry of 1, 7, or 30 days.", None
    with _database() as conn:
        cv = conn.execute("SELECT * FROM user_cvs WHERE owner_uid=?", (uid,)).fetchone()
        if not cv:
            return False, "Upload and review your CV first.", None
        if data.get("expected_file_sha256") != cv["file_sha256"]:
            return False, "Your CV changed. Refresh and review it before sharing.", None
        if json.loads(cv["structured_cv_json"]).get("review_status") != "reviewed":
            return False, "Review and save your profile before sharing.", None
        recipient = conn.execute("SELECT unique_uid FROM users WHERE lower(email)=?",
                                 (email.strip().lower(),)).fetchone()
        if not recipient:
            return False, "No matching recipient account. Ask them to register with this email first.", None
        if recipient["unique_uid"] == uid:
            return False, "Your own CV is already available in your vault.", None
        # One active grant per owner/recipient. Updating does not leave old broad grants behind.
        conn.execute("DELETE FROM cv_shares WHERE owner_uid=? AND recipient_uid=?",
                     (uid, recipient["unique_uid"]))
        gid = secrets.token_urlsafe(24)
        now = _now()
        conn.execute("INSERT INTO cv_shares VALUES (?,?,?,?,?,?,?,?,?)", (
            gid, uid, recipient["unique_uid"], cv["file_sha256"], _revision(cv["structured_cv_json"]),
            int(summary), int(pdf), (now + timedelta(days=days)).isoformat(), now.isoformat()))
        row = conn.execute(SELECT_GRANTS + "WHERE s.grant_id=?", (gid,)).fetchone()
    return True, "Access granted to this account. Copy the link to share it; no email was sent.", _public(row)


def revoke_share(uid, grant_id):
    with _database() as conn:
        result = conn.execute("DELETE FROM cv_shares WHERE owner_uid=? AND grant_id=?", (uid, grant_id))
        return result.rowcount == 1


def get_shared_cv(uid, grant_id, resource=None):
    """Check identity, expiry and content version on every read, then audit successful disclosures."""
    with _database() as conn:
        row = conn.execute(SELECT_GRANTS + "WHERE s.grant_id=? AND s.recipient_uid=?",
                           (grant_id, uid)).fetchone()
        if not row or not _active(row):
            return None
        result = _public(row)
        if resource is None:  # Metadata does not disclose CV content.
            return result
        if resource == "summary" and row["share_summary"]:
            # Exclude extraction evidence, internal state and owner-only review notes.
            st = json.loads(row["structured_cv_json"])
            allowed = ("full_name", "email", "phone", "location", "industry", "current_role",
                       "years_experience", "seeker_type", "education_level", "work_mode_preference",
                       "executive_summary", "skills", "work_experience", "education_history",
                       "projects", "certifications")
            result["structured_cv"] = {k: st[k] for k in allowed if k in st}
        elif resource == "pdf" and row["share_pdf"]:
            import os
            if not os.path.isfile(row["stored_pdf_path"]):
                return None
            result["stored_pdf_path"] = row["stored_pdf_path"]
            result["original_filename"] = row["original_filename"]
        else:
            return None
        conn.execute("""INSERT INTO cv_share_events
            (owner_uid,recipient_uid,recipient_name,resource,viewed_at) VALUES (?,?,?,?,?)""",
                     (row["owner_uid"], uid, row["recipient_name"], resource, _now().isoformat()))
        return result


def remove_owner_shares(uid):
    with _database() as conn:
        conn.execute("DELETE FROM cv_shares WHERE owner_uid=?", (uid,))
        conn.execute("DELETE FROM cv_share_events WHERE owner_uid=?", (uid,))
