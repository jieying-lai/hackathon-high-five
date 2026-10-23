"""Private, self-reported career actions, separate from CV facts and hiring scores."""
from datetime import datetime, timezone
import uuid

import auth_db

KINDS = {"role_test", "skill_practice", "application_review"}
GOALS = {"explore", "learn", "apply"}
MINUTES = {10, 20, 30}
ACTIVE_LIMIT = 20


class ActionLimit(ValueError):
    pass


def init_tables():
    conn = auth_db.get_db_connection()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS career_actions (
                id TEXT PRIMARY KEY,
                owner_uid TEXT NOT NULL,
                kind TEXT NOT NULL,
                role_title TEXT NOT NULL,
                skill TEXT NOT NULL DEFAULT '',
                title TEXT NOT NULL,
                dedup_key TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'planned'
                    CHECK(status IN ('planned', 'done')),
                note TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                completed_at TEXT
            );
            CREATE INDEX IF NOT EXISTS career_actions_owner
                ON career_actions(owner_uid, status, created_at);
            CREATE UNIQUE INDEX IF NOT EXISTS career_actions_active_unique
                ON career_actions(owner_uid, dedup_key) WHERE status = 'planned';
            CREATE TABLE IF NOT EXISTS career_action_preferences (
                owner_uid TEXT PRIMARY KEY,
                goal TEXT NOT NULL DEFAULT 'explore',
                minutes INTEGER NOT NULL DEFAULT 20
            );
        """)
        conn.commit()
    finally:
        conn.close()


def _text(value, field, maximum, required=False):
    if not isinstance(value, str):
        raise ValueError(f"{field} must be text.")
    text = value.strip()
    if len(text) > maximum or (required and not text):
        raise ValueError(f"{field} must be {'1' if required else '0'}–{maximum} characters.")
    if any(ord(char) < 32 and char not in "\n\t" for char in text):
        raise ValueError(f"{field} contains unsupported characters.")
    return text


def _payload(payload, allowed):
    if not isinstance(payload, dict) or not payload or set(payload) - allowed:
        raise ValueError("Please send only the supported action fields.")


def _public(row):
    return {key: row[key] for key in (
        "id", "kind", "role_title", "skill", "title", "status",
        "note", "created_at", "updated_at", "completed_at",
    )}


def _now():
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")


def snapshot(owner):
    conn = auth_db.get_db_connection()
    try:
        rows = conn.execute(
            """SELECT * FROM career_actions WHERE owner_uid=?
               ORDER BY CASE status WHEN 'planned' THEN 0 ELSE 1 END,
                        updated_at DESC, id DESC LIMIT 100""", (owner,),
        ).fetchall()
        preferences = conn.execute(
            "SELECT goal, minutes FROM career_action_preferences WHERE owner_uid=?", (owner,),
        ).fetchone()
        return {
            "ok": True,
            "actions": [_public(row) for row in rows],
            "preferences": dict(preferences) if preferences else {"goal": "explore", "minutes": 20},
        }
    finally:
        conn.close()


def preferences(owner, payload):
    _payload(payload, {"goal", "minutes"})
    goal, minutes = payload.get("goal"), payload.get("minutes")
    if not isinstance(goal, str) or goal not in GOALS:
        raise ValueError("Choose Explore, Learn or Apply.")
    if type(minutes) is not int or minutes not in MINUTES:
        raise ValueError("Choose 10, 20 or 30 minutes.")
    conn = auth_db.get_db_connection()
    try:
        with conn:
            conn.execute(
                """INSERT INTO career_action_preferences(owner_uid,goal,minutes) VALUES (?,?,?)
                   ON CONFLICT(owner_uid) DO UPDATE SET goal=excluded.goal, minutes=excluded.minutes""",
                (owner, goal, minutes),
            )
    finally:
        conn.close()
    return snapshot(owner)


def create(owner, payload):
    _payload(payload, {"kind", "role_title", "skill"})
    kind = payload.get("kind")
    if not isinstance(kind, str) or kind not in KINDS:
        raise ValueError("Choose a supported career action.")
    role = _text(payload.get("role_title"), "Role", 150, required=True)
    skill = _text(payload.get("skill", ""), "Skill", 100, required=kind == "skill_practice")
    if kind != "skill_practice":
        skill = ""
    title = {
        "role_test": f"Explore a day in {role}",
        "skill_practice": f"Try a small {skill} exercise",
        "application_review": f"Review one {role} application",
    }[kind]
    key = f"{kind}|{role.casefold()}|{skill.casefold()}"
    now, identifier = _now(), uuid.uuid4().hex
    conn = auth_db.get_db_connection()
    try:
        # Serialize the check and insert; a double click cannot create two active copies.
        with conn:
            conn.execute("BEGIN IMMEDIATE")
            existing = conn.execute(
                "SELECT * FROM career_actions WHERE owner_uid=? AND dedup_key=? AND status='planned'",
                (owner, key),
            ).fetchone()
            if existing:
                return _public(existing)
            count = conn.execute(
                "SELECT COUNT(*) FROM career_actions WHERE owner_uid=? AND status='planned'", (owner,),
            ).fetchone()[0]
            if count >= ACTIVE_LIMIT:
                raise ActionLimit("Finish an existing action before adding more (20 active maximum).")
            conn.execute(
                """INSERT INTO career_actions
                   (id,owner_uid,kind,role_title,skill,title,dedup_key,created_at,updated_at)
                   VALUES (?,?,?,?,?,?,?,?,?)""",
                (identifier, owner, kind, role, skill, title, key, now, now),
            )
            return _public(conn.execute("SELECT * FROM career_actions WHERE id=?", (identifier,)).fetchone())
    finally:
        conn.close()


def update(owner, identifier, payload):
    _payload(payload, {"status", "note"})
    status = payload.get("status")
    if "status" in payload and (not isinstance(status, str) or status not in {"planned", "done"}):
        raise ValueError("Choose planned or done.")
    note = _text(payload["note"], "Reflection", 800) if "note" in payload else None
    conn = auth_db.get_db_connection()
    try:
        with conn:
            conn.execute("BEGIN IMMEDIATE")
            row = conn.execute(
                "SELECT * FROM career_actions WHERE owner_uid=? AND id=?", (owner, identifier),
            ).fetchone()
            if not row:
                return None
            next_status = status or row["status"]
            if next_status == "planned" and row["status"] == "done":
                duplicate = conn.execute(
                    "SELECT id FROM career_actions WHERE owner_uid=? AND dedup_key=? AND status='planned'",
                    (owner, row["dedup_key"]),
                ).fetchone()
                count = conn.execute(
                    "SELECT COUNT(*) FROM career_actions WHERE owner_uid=? AND status='planned'", (owner,),
                ).fetchone()[0]
                if duplicate or count >= ACTIVE_LIMIT:
                    raise ActionLimit("This action is already active, or your active list is full.")
            now = _now()
            completed_at = (row["completed_at"] or now) if next_status == "done" else None
            conn.execute(
                """UPDATE career_actions SET status=?, note=?, updated_at=?, completed_at=?
                   WHERE owner_uid=? AND id=?""",
                (next_status, row["note"] if note is None else note, now, completed_at, owner, identifier),
            )
            return _public(conn.execute(
                "SELECT * FROM career_actions WHERE owner_uid=? AND id=?", (owner, identifier),
            ).fetchone())
    finally:
        conn.close()


def remove(owner, identifier):
    conn = auth_db.get_db_connection()
    try:
        with conn:
            result = conn.execute(
                "DELETE FROM career_actions WHERE owner_uid=? AND id=?", (owner, identifier),
            )
            return result.rowcount == 1
    finally:
        conn.close()
