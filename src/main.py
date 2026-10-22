"""Application entry point for CareerLens AI (SDC Hackathon 2026 - Domain 1).

Two fully separate portals, enforced server-side by account role:
  * job_seeker  -> /workspace renders candidate.html  (Talent Portal)
  * hr_company  -> /workspace renders hr.html         (Employer Portal)

Run locally in VS Code terminal:
    py src/main.py
"""

import os
import io
import json
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from functools import wraps
from urllib.parse import urlsplit

import sys
from pathlib import Path
_SRC_DIR = Path(__file__).resolve().parent
if str(_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(_SRC_DIR))
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

from flask import Flask, jsonify, redirect, render_template, request, send_file, session

import career_pathways
import course_recommender
import learning_impact
import chatbot_engine
import cv_engine
import cv_ai
import hr_engine
import vault_sharing
import job_index
import questionnaire_engine
import verification_ai
from ai_matcher import load_json, match_user_to_roles
import auth_db
import cv_dataset_manager
import predictions_engine
import totem_ai_engine
from auth_db import (authenticate_user, get_user_by_uid, init_db, register_user, update_user_password, update_user_profile)
from trend_signals import get_trend_radar
from utils import format_greeting

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.getenv("FLASK_SECRET_KEY") or secrets.token_hex(32)
app.config.update(
    # Pick up edited pages on refresh without enabling the debug server.
    TEMPLATES_AUTO_RELOAD=True,
    MAX_CONTENT_LENGTH=9 * 1024 * 1024,  # 8 MB PDF plus multipart overhead
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_REFRESH_EACH_REQUEST=False,
    SESSION_COOKIE_SECURE=os.getenv("COOKIE_SECURE", "0") == "1",
    PERMANENT_SESSION_LIFETIME=timedelta(hours=2),
)


@app.before_request
def protect_mutations():
    """Require a same-session CSRF token for all changes, including sign in."""
    if request.path.startswith("/static/sample_cvs/"):
        sample_name = request.path[len("/static/sample_cvs/"):]
        if sample_name not in {item["filename"] for item in cv_engine.SAMPLE_CV_SPECS}:
            return jsonify(ok=False, message="This file is not a public synthetic demo CV."), 404
    if request.method not in ("POST", "PUT", "PATCH", "DELETE"):
        return None
    expected = session.get("csrf_token", "")
    provided = request.headers.get("X-CSRF-Token", "")
    if not expected or not secrets.compare_digest(expected, provided):
        return jsonify(ok=False, message="Your session changed. Refresh this page and try again."), 403
    origin = request.headers.get("Origin")
    if origin and urlsplit(origin).netloc != request.host:
        return jsonify(ok=False, message="This request must come from CareerLens."), 403


@app.after_request
def private_response_headers(response):
    if request.path.startswith("/api/") or request.path == "/workspace" or request.path.startswith("/shared/"):
        response.headers["Cache-Control"] = "no-store, private"
        response.headers["Pragma"] = "no-cache"
        response.headers["Vary"] = "Cookie"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "same-origin"
    return response


@app.errorhandler(413)
def upload_too_large(_error):
    return jsonify(ok=False, message="Upload one PDF CV, no larger than 8 MB."), 413


@app.errorhandler(400)
def invalid_request(_error):
    return jsonify(ok=False, message="The request could not be read. Refresh and try again."), 400


@app.route("/api/auth/csrf", methods=["GET"])
def api_csrf():
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_urlsafe(32)
    return jsonify(csrf_token=session["csrf_token"])


def json_object():
    value = request.get_json(silent=True)
    return value if isinstance(value, dict) else {}

init_db()
hr_engine.init_hr_tables()
cv_engine.init_cv_tables()
vault_sharing.init_share_tables()


def api_role(role):
    """Restrict an API route to one account role."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = session.get("user")
            if not user:
                return jsonify({"ok": False, "message": "Please sign in first."}), 401
            if user["role"] != role:
                portal = "Admin" if role == "admin" else ("Employer" if role == "hr_company" else "Talent")
                return jsonify({"ok": False, "message": f"This area is for {portal} Portal accounts only."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ------------------------------------------------------------------ pages
@app.route("/")
def index():
    if session.get("user"):
        return redirect("/workspace")
    return render_template(
        "index.html",
        registration_industries=list(questionnaire_engine.CATALOG["roles"]),
        registration_regions=questionnaire_engine.CATALOG["regions"],
    )


@app.route("/workspace")
def workspace():
    user = session.get("user")
    if not user:
        return redirect("/")
    if user.get("role") == "admin":
        return redirect("/admin")
    return render_template("hr.html" if user["role"] == "hr_company" else "candidate.html")


@app.route("/admin")
def admin_portal():
    user = session.get("user")
    if not user or user.get("role") != "admin":
        return redirect("/?admin=1#auth")
    return render_template("admin.html")


# ------------------------------------------------------------------ auth

@app.route("/api/totem/match", methods=["GET"])
def api_totem_match():
    totem = request.args.get("totem", "hawk")
    domain = request.args.get("domain", "tech")
    matches = totem_ai_engine.get_top_onet_matches(totem, domain, limit=4)
    return jsonify({"ok": True, "totem": totem, "domain": domain, "matches": matches})


@app.route("/api/totem/user", methods=["GET", "POST"])
def api_totem_user():
    user = session.get("user")
    if not user:
        return jsonify({"ok": False, "message": "Login required"}), 401
    uid = user.get("unique_uid")
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        totem_data = data.get("totem")
        if totem_data:
            session["user_totem"] = totem_data
            try:
                db = auth_db.get_db_connection()
                cur = db.cursor()
                cur.execute("SELECT role_details_json FROM users WHERE unique_uid=?", (uid,))
                row = cur.fetchone()
                details = json.loads(row[0] or "{}") if row and row[0] else {}
                details["totem"] = totem_data
                cur.execute("UPDATE users SET role_details_json=? WHERE unique_uid=?", (json.dumps(details), uid))
                db.commit()
                db.close()
            except Exception:
                pass
            return jsonify({"ok": True, "totem": totem_data})
        return jsonify({"ok": False, "message": "No totem data"}), 400

    totem = session.get("user_totem")
    if not totem:
        try:
            db = auth_db.get_db_connection()
            cur = db.cursor()
            cur.execute("SELECT role_details_json FROM users WHERE unique_uid=?", (uid,))
            row = cur.fetchone()
            if row and row[0]:
                details = json.loads(row[0])
                totem = details.get("totem")
                if totem:
                    session["user_totem"] = totem
            db.close()
        except Exception:
            pass
    return jsonify({"ok": True, "totem": totem})

@app.route("/api/auth/register", methods=["POST"])
def api_register():
    ok, msg, user_info = register_user(json_object())
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    session.clear()
    session["user"] = user_info
    session["csrf_token"] = secrets.token_urlsafe(32)
    session.permanent = True
    redir = "/admin" if user_info.get("role") == "admin" else "/workspace"
    return jsonify({"ok": True, "message": msg, "user": user_info, "redirect": redir})


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = json_object()
    ok, msg, user_info = authenticate_user(data.get("email", ""), data.get("password", ""))
    if not ok:
        return jsonify({"ok": False, "message": msg}), 401
    session.clear()
    session["user"] = user_info
    session["csrf_token"] = secrets.token_urlsafe(32)
    session.permanent = True
    redir = "/admin" if user_info.get("role") == "admin" else "/workspace"
    return jsonify({"ok": True, "message": msg, "user": user_info, "redirect": redir})


@app.route("/api/auth/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"ok": True, "message": "Logged out successfully."})


@app.route("/api/auth/forgot-password/request", methods=["POST"])
def api_forgot_password_request():
    data = json_object()
    email = data.get("email", "")
    ok, msg, code = auth_db.generate_reset_code(email)
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    return jsonify({
        "ok": True,
        "message": "Verification code has been generated. For your convenience in this hackathon demo, your code is displayed below.",
        "code": code
    })


@app.route("/api/auth/forgot-password/verify", methods=["POST"])
def api_forgot_password_verify():
    data = json_object()
    email = data.get("email", "")
    code = data.get("code", "")
    new_pw = data.get("new_password", "")
    confirm_pw = data.get("confirm_password", "")
    ok, msg = auth_db.verify_and_reset_password(email, code, new_pw, confirm_pw)
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    return jsonify({"ok": True, "message": msg})


@app.route("/api/helpdesk/feedback", methods=["POST"])
def api_submit_feedback():
    data = json_object()
    user = session.get("user") or {}
    uid = user.get("unique_uid") or data.get("user_uid", "Guest")
    uname = user.get("full_name") or data.get("user_name", "Anonymous Talent")
    uemail = user.get("email") or data.get("user_email", "guest@careerlens.my")
    cat = data.get("category", "General Inquiry")
    subject = data.get("subject", "")
    msg = data.get("message", "")
    priority = data.get("priority", "Normal")
    ok, out_msg, fid = auth_db.create_feedback(uid, uname, uemail, cat, subject, msg, priority)
    if not ok:
        return jsonify({"ok": False, "message": out_msg}), 400
    return jsonify({"ok": True, "message": out_msg, "ticket_id": fid})


@app.route("/api/admin/stats", methods=["GET"])
@api_role("admin")
def api_admin_stats():
    stats = auth_db.get_admin_stats()
    stats["total_jobs"] = 69345
    stats["total_employer_vacancies"] = len(hr_engine.list_open_vacancies_for_seeker(session.get("user", {}).get("unique_uid", "CL-ADM-2026-0001")))
    stats["active_ai_nodes"] = 2
    return jsonify({"ok": True, "stats": stats})


@app.route("/api/admin/feedbacks", methods=["GET"])
@api_role("admin")
def api_admin_feedbacks():
    status = request.args.get("status")
    feedbacks = auth_db.list_feedbacks(status)
    return jsonify({"ok": True, "feedbacks": feedbacks})


@app.route("/api/admin/feedbacks/<int:fid>", methods=["PUT"])
@api_role("admin")
def api_admin_update_feedback(fid):
    data = json_object()
    status = data.get("status", "Resolved")
    notes = data.get("admin_notes")
    ok, msg = auth_db.update_feedback_status(fid, status, notes)
    if not ok:
        return jsonify({"ok": False, "message": msg}), 404
    return jsonify({"ok": True, "message": msg})


@app.route("/api/admin/users", methods=["GET"])
@api_role("admin")
def api_admin_users():
    page = request.args.get("page", type=int)
    per_page = request.args.get("per_page", default=15, type=int)
    search = request.args.get("search", type=str)
    sort_by = request.args.get("sort_by", default="id", type=str)
    sort_order = request.args.get("sort_order", default="asc", type=str)
    reveal = request.args.get("reveal", default="1") in ("1", "true")

    if page is None:
        users = auth_db.list_all_users(mask_pii=not reveal)
        return jsonify({"ok": True, "users": users, "total": len(users), "page": 1, "per_page": len(users), "total_pages": 1})

    data = auth_db.list_users_paginated(page=page, per_page=per_page, search=search, sort_by=sort_by, sort_order=sort_order, mask_pii=not reveal)
    return jsonify({"ok": True, "users": data["users"], "pagination": data})


@app.route("/api/admin/applications", methods=["GET"])
@api_role("admin")
def api_admin_applications():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=15, type=int)
    search = request.args.get("search", type=str)
    sort_by = request.args.get("sort_by", default="id", type=str)
    sort_order = request.args.get("sort_order", default="desc", type=str)
    reveal = request.args.get("reveal", default="1") in ("1", "true")

    data = auth_db.list_all_applications(page=page, per_page=per_page, search=search, sort_by=sort_by, sort_order=sort_order, mask_pii=not reveal)
    return jsonify({"ok": True, "applications": data["applications"], "pagination": data})


@app.route("/api/admin/curated-cvs", methods=["GET"])
@api_role("admin")
def api_admin_curated_cvs():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=15, type=int)
    search = request.args.get("search", type=str)
    sort_by = request.args.get("sort_by", default="id", type=str)
    sort_order = request.args.get("sort_order", default="asc", type=str)
    reveal = request.args.get("reveal", default="1") in ("1", "true")

    data = cv_dataset_manager.list_curated_benchmarks(page=page, per_page=per_page, search=search, sort_by=sort_by, sort_order=sort_order, mask_pii=not reveal)
    return jsonify({"ok": True, "curated_cvs": data["items"], "pagination": data})


@app.route("/api/admin/audit/reveal", methods=["POST"])
@api_role("admin")
def api_admin_audit_reveal():
    data = json_object()
    target_uid = data.get("target_uid")
    reason = data.get("reason", "Administrative verification under PDPA compliance")
    admin_uid = session.get("user", {}).get("unique_uid", "CL-ADM-2026-0001")
    ip_addr = request.remote_addr or "127.0.0.1"

    auth_db.log_admin_audit(admin_uid, "REVEAL_SENSITIVE_PII", target_uid=target_uid, details=reason, ip_address=ip_addr)
    return jsonify({"ok": True, "message": "Sensitive data reveal audit logged.", "audit_logged": True})


@app.route("/api/admin/predictions/workforce-2030", methods=["GET"])
@api_role("admin")
def api_admin_predictions_workforce():
    year = request.args.get("year", default=2030, type=int)
    pace = request.args.get("pace", default=1.0, type=float)
    data = predictions_engine.forecast_workforce_demand_2030(target_year=year, pace_multiplier=pace)
    return jsonify({"ok": True, "forecast": data})


@app.route("/api/admin/predictions/personality", methods=["POST"])
@api_role("admin")
def api_admin_predictions_personality():
    data = json_object()
    cv_text = data.get("cv_text", "")
    name = data.get("candidate_name", "Candidate")
    result = predictions_engine.predict_cv_personality(cv_text, candidate_name=name)
    return jsonify({"ok": True, "personality": result})


@app.route("/api/admin/report/export", methods=["GET"])
@api_role("admin")
def api_admin_report_export():
    stats = auth_db.get_admin_stats()
    report = predictions_engine.generate_executive_report(stats)
    return jsonify({"ok": True, "report": report})


@app.route("/api/auth/me", methods=["GET"])
def api_me():
    user = session.get("user")
    if user and user.get("unique_uid"):
        fresh = get_user_by_uid(user["unique_uid"])
        if fresh:
            return jsonify({"user": fresh})
    return jsonify({"user": user})


@app.route("/api/auth/profile", methods=["PUT"])
def api_update_profile():
    user = session.get("user")
    if not user:
        return jsonify({"ok": False, "message": "Please sign in first."}), 401
    data = json_object()
    ok, msg, updated_user = update_user_profile(
        unique_uid=user["unique_uid"],
        full_name=data.get("full_name"),
        email=data.get("email"),
        role_details=data.get("role_details"),
    )
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    session["user"] = updated_user
    return jsonify({"ok": True, "message": msg, "user": updated_user})


@app.route("/api/auth/password", methods=["PUT"])
def api_update_password():
    user = session.get("user")
    if not user:
        return jsonify({"ok": False, "message": "Please sign in first."}), 401
    data = json_object()
    ok, msg = update_user_password(
        unique_uid=user["unique_uid"],
        current_password=data.get("current_password", ""),
        new_password=data.get("new_password", ""),
        confirm_password=data.get("confirm_password", ""),
    )
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    return jsonify({"ok": True, "message": msg})


# ------------------------------------------------------------------ Talent Portal APIs
def _owner():
    return session["user"]["unique_uid"]


@app.route('/api/questionnaire/catalog')
@api_role('job_seeker')
def questionnaire_catalog():
    return jsonify(**questionnaire_engine.CATALOG, provider=questionnaire_engine.questionnaire_provider())


@app.route('/api/questionnaire/<action>', methods=['POST'])
@api_role('job_seeker')
def questionnaire_generate(action):
    if action not in ('questions', 'recommendations'):
        return jsonify(ok=False, message='Unknown questionnaire action.'), 404
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify(ok=False, message='Invalid questionnaire request.'), 400
    try:
        result = questionnaire_engine.generate(
            cv_engine.get_user_cv(_owner()), payload.get('field'),
            payload.get('answers'), payload.get('language', 'en'), action,
            external_ai_consent=payload.get('external_ai_consent') is True)
        return jsonify(ok=True, **result)
    except questionnaire_engine.QuestionnaireError as exc:
        return jsonify(ok=False, message=str(exc)), exc.status



@app.route("/api/career-pathways", methods=["GET"])
@api_role("job_seeker")
def api_career_pathways():
    role = request.args.get("role", "").strip()
    if not role:
        user = session.get("user")
        if user and user.get("role_details"):
            role = user["role_details"].get("current_role", "")
    summary = career_pathways.get_pathways_summary(role or "Junior Financial Auditor")
    return jsonify({"ok": True, "pathways": summary})

@app.route("/api/personas", methods=["GET"])
@api_role("job_seeker")
def api_personas():
    return jsonify(load_json("sample_cvs.json"))


@app.route("/api/cv/samples", methods=["GET"])
@api_role("job_seeker")
def api_cv_samples():
    return jsonify({"ok": True, "samples": cv_engine.ensure_sample_pdfs()})


@app.route("/api/cv/me", methods=["GET"])
@api_role("job_seeker")
def api_cv_me():
    return jsonify({
        "ok": True,
        "cv": cv_engine.get_user_cv(_owner()),
        "samples": cv_engine.ensure_sample_pdfs(),
        "ai": cv_ai.status(),
    })


@app.route("/api/cv/me/organise", methods=["POST"])
@api_role("job_seeker")
def api_cv_organise():
    try:
        cv = cv_ai.organise(_owner(), json_object())
        return jsonify(ok=True, cv=cv, message="AI draft saved privately. Review it before sharing; previous sharing has ended.")
    except cv_ai.CVAIError as exc:
        return jsonify(ok=False, message=str(exc)), exc.status


@app.route("/api/cv/upload", methods=["POST"])
@api_role("job_seeker")
def api_cv_upload():
    user = session["user"]
    # Support either direct multipart file upload OR quick-loading one of the synthetic sample PDFs
    if "file" in request.files and request.files["file"].filename:
        if request.form.get("synthetic_confirmed") != "1":
            return jsonify(ok=False, message="For this hackathon demo, confirm this is a synthetic CV with no real personal data."), 400
        up = request.files["file"]
        filename = up.filename or ""
        pdf_bytes = up.read(cv_engine.MAX_PDF_BYTES + 1)
        allow_anon = request.form.get("allow_anon_stats", "0") == "1"
    else:
        body = json_object()
        sample_name = (body.get("sample_filename") or "").strip()
        sample_path = os.path.join(cv_engine.SAMPLE_PDF_DIR, os.path.basename(sample_name))
        valid_samples = {item["filename"] for item in cv_engine.SAMPLE_CV_SPECS}
        if sample_name not in valid_samples or not os.path.isfile(sample_path):
            return jsonify({"ok": False, "message": "Please select a valid .pdf CV file to upload."}), 400
        filename = os.path.basename(sample_name)
        with open(sample_path, "rb") as f:
            pdf_bytes = f.read()
        if "allow_anon_stats" in body and not isinstance(body["allow_anon_stats"], bool):
            return jsonify(ok=False, message="Analytics consent must be true or false."), 400
        allow_anon = body.get("allow_anon_stats", False)

    ok, msg, cv_data = cv_engine.save_user_pdf_cv(
        owner_uid=user["unique_uid"],
        filename=filename,
        pdf_bytes=pdf_bytes,
        user_context=user,
        allow_anon_stats=allow_anon,
    )
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    return jsonify({"ok": True, "message": msg, "cv": cv_data})


@app.route("/api/cv/me", methods=["PUT"])
@api_role("job_seeker")
def api_cv_update():
    ok, msg, cv_data = cv_engine.update_user_structured_cv(_owner(), json_object())
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    return jsonify({"ok": True, "message": msg, "cv": cv_data})


@app.route("/api/cv/me", methods=["DELETE"])
@api_role("job_seeker")
def api_cv_delete():
    ok, msg = cv_engine.delete_user_cv(_owner())
    if ok:
        vault_sharing.remove_owner_shares(_owner())
    return jsonify(ok=ok, message=msg), (200 if ok else 404)


@app.route("/api/cv/me/export", methods=["GET"])
@api_role("job_seeker")
def api_cv_export():
    data = cv_engine.export_user_cv(_owner())
    if data is None:
        return jsonify(ok=False, message="No CV found to export."), 404
    data["recipient_sharing"] = vault_sharing.list_shares(_owner())
    content = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
    return send_file(io.BytesIO(content), mimetype="application/json", as_attachment=True,
                     download_name="careerlens-private-profile.json")


@app.route("/api/cv/shares", methods=["GET", "POST"])
@api_role("job_seeker")
def api_cv_shares():
    if request.method == "GET":
        return jsonify(ok=True, **vault_sharing.list_shares(_owner()))
    ok, msg, share = vault_sharing.create_share(_owner(), json_object())
    return jsonify(ok=ok, message=msg, share=share), (200 if ok else 400)


@app.route("/api/cv/shares/<grant_id>", methods=["DELETE"])
@api_role("job_seeker")
def api_cv_revoke_share(grant_id):
    ok = vault_sharing.revoke_share(_owner(), grant_id)
    return jsonify(ok=ok, message="Access revoked." if ok else "Share not found."), (200 if ok else 404)


@app.route("/shared/<grant_id>", methods=["GET"])
def shared_cv_page(grant_id):
    user = session.get("user")
    if not user:
        return render_template("shared_cv.html", share=None,
                               error="Sign in to the recipient account, then reopen this link."), 401
    share = vault_sharing.get_shared_cv(user["unique_uid"], grant_id)
    if not share:
        return render_template("shared_cv.html", share=None,
                               error="This share is unavailable, expired, or belongs to another account."), 404
    if share["share_summary"]:
        share = vault_sharing.get_shared_cv(user["unique_uid"], grant_id, "summary")
    return render_template("shared_cv.html", share=share, error=None)


@app.route("/shared/<grant_id>/pdf", methods=["GET"])
def shared_cv_pdf(grant_id):
    user = session.get("user")
    data = vault_sharing.get_shared_cv(user["unique_uid"], grant_id, "pdf") if user else None
    if not data:
        return jsonify(ok=False, message="This shared PDF is unavailable for your account."), 404
    return send_file(data["stored_pdf_path"], mimetype="application/pdf", as_attachment=True,
                     download_name=data["original_filename"])


@app.route("/api/cv/me/pdf", methods=["GET"])
@api_role("job_seeker")
def api_cv_me_pdf():
    path, orig_name = cv_engine.get_user_pdf_path(_owner())
    if not path:
        return jsonify({"ok": False, "message": "No uploaded PDF CV found."}), 404
    return send_file(path, mimetype="application/pdf", as_attachment=False, download_name=orig_name)


@app.route("/api/jobs", methods=["GET"])
@api_role("job_seeker")
def api_jobs_list():
    """Radius search over 69k real JobStreet Malaysia postings + employer-portal vacancies."""
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    city = request.args.get("city", "")
    custom_label = (request.args.get("label") or "").strip()
    resolved_label = "Kuala Lumpur (KLCC)"
    u_lat, u_lng = 3.1579, 101.7116
    if city and city in hr_engine.CITY_COORDS and (lat is None or lng is None):
        resolved_label = custom_label or city
        u_lat, u_lng = hr_engine.CITY_COORDS[city]["lat"], hr_engine.CITY_COORDS[city]["lng"]
    elif lat is not None and lng is not None:
        u_lat, u_lng = lat, lng
        if custom_label:
            resolved_label = custom_label
        else:
            nearest = min(hr_engine.CITY_COORDS, key=lambda k: hr_engine.haversine_km(
                u_lat, u_lng, hr_engine.CITY_COORDS[k]["lat"], hr_engine.CITY_COORDS[k]["lng"]))
            resolved_label = f"Near {hr_engine.CITY_COORDS[nearest]['city']}"
    elif city and city in hr_engine.CITY_COORDS:
        resolved_label = custom_label or city
        u_lat, u_lng = hr_engine.CITY_COORDS[city]["lat"], hr_engine.CITY_COORDS[city]["lng"]

    employer_vacancies = hr_engine.list_open_vacancies_for_seeker(_owner())
    res = job_index.search_nearby(
        candidate_uid=_owner(),
        lat=u_lat,
        lng=u_lng,
        radius_km=request.args.get("radius", 10, type=float),
        mode=request.args.get("mode", "matched"),
        category=request.args.get("category", ""),
        query=request.args.get("q", ""),
        company=request.args.get("company", ""),
        sort_by=request.args.get("sort", "match"),
        offset=max(0, request.args.get("offset", 0, type=int)),
        limit=min(100, max(1, request.args.get("limit", 40, type=int))),
        employer_vacancies=employer_vacancies,
    )
    res.update({
        "ok": True,
        "user_location": {"label": resolved_label, "lat": u_lat, "lng": u_lng,
                          "city": city if city in hr_engine.CITY_COORDS else "",
                          "presets": list(hr_engine.CITY_COORDS.keys())},
    })
    return jsonify(res)


@app.route("/api/geocode/search", methods=["GET"])
@api_role("job_seeker")
def api_geocode_search():
    """Search OpenStreetMap Malaysia + local index for condos, buildings, streets, or areas."""
    q = (request.args.get("q") or "").strip()
    places = job_index.search_map_places(q, limit=6)
    return jsonify({"ok": True, "places": places})


@app.route("/api/geocode/reverse", methods=["GET"])
@api_role("job_seeker")
def api_geocode_reverse():
    """Reverse-geocode GPS or map-clicked coordinates into a street/condo/area address."""
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    if lat is None or lng is None:
        return jsonify({"ok": False, "message": "lat and lng required"}), 400
    info = job_index.reverse_geocode_coords(lat, lng)
    return jsonify(info)


@app.route("/api/jobs/js/<js_uid>/apply", methods=["POST"])
@api_role("job_seeker")
def api_jobs_apply_jobstreet(js_uid):
    """Apply to JobStreet dataset vacancy by ensuring it exists in vacancies and recording application."""
    vid = job_index.materialize_vacancy(js_uid)
    if not vid:
        return jsonify(ok=False, message="Vacancy not found."), 404
    user = session["user"]
    candidate_uid = user["unique_uid"]
    candidate_name = user["full_name"]

    payload = json_object()
    cover_note = payload.get("cover_note") or ""
    available_in = payload.get("available_in") or "1 month"
    salary = payload.get("salary_expectation") or 0
    share_org = bool(payload.get("share_organised_cv", True))
    share_pdf = bool(payload.get("share_original_pdf", False))

    conn = auth_db.get_db_connection()
    try:
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        existing = conn.execute(
            "SELECT id, application_uid FROM job_applications WHERE vacancy_id = ? AND candidate_uid = ?",
            (vid, candidate_uid),
        ).fetchone()
        if existing:
            app_uid = existing["application_uid"]
            conn.execute(
                """UPDATE job_applications SET candidate_name = ?, share_organised_cv = ?, share_original_pdf = ?,
                   cover_note = ?, salary_expectation = ?, available_in = ? WHERE id = ?""",
                (candidate_name, int(share_org), int(share_pdf), str(cover_note).strip(), int(salary), str(available_in).strip(), existing["id"]),
            )
        else:
            app_uid = f"APP-{uuid.uuid4().hex[:16].upper()}"
            conn.execute(
                """INSERT INTO job_applications (
                    application_uid, vacancy_id, candidate_uid, candidate_name, share_organised_cv,
                    share_original_pdf, cover_note, salary_expectation, available_in, hr_decision, applied_at
                   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)""",
                (app_uid, vid, candidate_uid, candidate_name, int(share_org), int(share_pdf),
                 str(cover_note).strip(), int(salary), str(available_in).strip(), now),
            )
        conn.commit()
    finally:
        conn.close()

    return jsonify(
        ok=True,
        message="Application submitted successfully! Your CV profile has been recorded for this vacancy.",
        application={"application_uid": app_uid, "vacancy_id": vid, "applied_at": now}
    )


@app.route("/api/jobs/<int:vid>/apply", methods=["POST"])
@api_role("job_seeker")
def api_jobs_apply(vid):
    user = session["user"]
    ok, msg, app_info = cv_engine.apply_to_vacancy(
        candidate_uid=user["unique_uid"],
        candidate_name=user["full_name"],
        vacancy_id=vid,
        payload=json_object(),
    )
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    return jsonify({"ok": True, "message": msg, "application": app_info})


@app.route("/api/jobs/<int:vid>/apply", methods=["DELETE"])
@api_role("job_seeker")
def api_jobs_withdraw(vid):
    ok, msg = cv_engine.withdraw_application(_owner(), vid)
    return jsonify({"ok": ok, "message": msg}), (200 if ok else 404)



@app.route("/api/radar/ai-insights", methods=["POST"])
@api_role("job_seeker")
def api_radar_ai_insights():
    payload = json_object()
    industry = payload.get("industry") or "Finance & Accounting"
    target_role = payload.get("role") or "Junior Financial Auditor"
    scenario = payload.get("scenario") or "moderate"
    user_skills = payload.get("skills") or []

    insights = chatbot_engine.generate_ai_radar_insights(
        industry=industry,
        role=target_role,
        scenario=scenario,
        skills=user_skills
    )
    return jsonify({"ok": True, "insights": insights})

@app.route("/api/trends", methods=["GET"])
@api_role("job_seeker")
def api_trends():
    data = get_trend_radar(scenario=request.args.get("scenario", "moderate"))
    data["anonymized_talent_pool_stats"] = cv_engine.get_anonymized_cv_statistics()
    if request.args.get("bounds") == "1":
        moderate = dict(data) if data["scenario"] == "moderate" else get_trend_radar("moderate", data["signal_metadata"])
        fast = dict(data) if data["scenario"] == "fast" else get_trend_radar("fast", data["signal_metadata"])
        data["scenario_endpoints"] = {"moderate": moderate, "fast": fast}
    return jsonify(data)

@app.route("/api/analyze", methods=["POST"])
@api_role("job_seeker")
def api_analyze():
    payload = json_object()
    if payload.get("scenario_bounds") is True:
        endpoints = {mode: match_user_to_roles(profile=payload.get("profile", {}), scenario=mode)
                     for mode in ("moderate", "fast")}
        data = dict(endpoints["fast" if payload.get("scenario") == "fast" else "moderate"])
        data["scenario_endpoints"] = endpoints
        return jsonify(data)
    return jsonify(match_user_to_roles(profile=payload.get("profile", {}), scenario=payload.get("scenario", "moderate")))


# ------------------------------------------------------------------ Employer Portal APIs
@app.route("/api/hr/vacancies", methods=["GET"])
@api_role("hr_company")
def api_hr_vacancies():
    return jsonify({"ok": True, "vacancies": hr_engine.list_vacancies(_owner())})


@app.route("/api/hr/vacancies", methods=["POST"])
@api_role("hr_company")
def api_hr_create_vacancy():
    ok, msg, vacancy = hr_engine.create_vacancy(_owner(), json_object())
    return (jsonify({"ok": True, "message": msg, "vacancy": vacancy}) if ok
            else (jsonify({"ok": False, "message": msg}), 400))


@app.route("/api/hr/vacancies/<int:vid>/status", methods=["POST"])
@api_role("hr_company")
def api_hr_vacancy_status(vid):
    status = (json_object()).get("status")
    if hr_engine.set_vacancy_status(_owner(), vid, status):
        return jsonify({"ok": True})
    return jsonify({"ok": False, "message": "Vacancy not found."}), 404


@app.route("/api/hr/vacancies/<int:vid>", methods=["DELETE"])
@api_role("hr_company")
def api_hr_delete_vacancy(vid):
    if hr_engine.delete_vacancy(_owner(), vid):
        return jsonify({"ok": True})
    return jsonify({"ok": False, "message": "Vacancy not found."}), 404


@app.route("/api/hr/vacancies/<int:vid>/screen", methods=["GET"])
@api_role("hr_company")
def api_hr_screen(vid):
    result = hr_engine.screen_candidates(_owner(), vid)
    if not result:
        return jsonify({"ok": False, "message": "Vacancy not found."}), 404
    return jsonify({"ok": True, **result})


@app.route("/api/hr/applications/<int:app_id>/cv", methods=["GET"])
@api_role("hr_company")
def api_hr_application_cv(app_id):
    ok, msg, data = cv_engine.get_application_cv_for_hr(
        session["user"], app_id, access_type="Viewed AI-Organised CV Summary"
    )
    if not ok:
        return jsonify({"ok": False, "message": msg}), 403
    if not data["share_organised_cv"]:
        return jsonify({"ok": False, "message": "Candidate did not grant access to their organised CV summary."}), 403
    # Do not leak internal filesystem path in JSON
    data.pop("stored_pdf_path", None)
    return jsonify({"ok": True, "message": msg, "application_cv": data})


@app.route("/api/hr/applications/<int:app_id>/pdf", methods=["GET"])
@api_role("hr_company")
def api_hr_application_pdf(app_id):
    ok, msg, data = cv_engine.get_application_cv_for_hr(
        session["user"], app_id, access_type="Opened Original Uploaded PDF CV"
    )
    if not ok or not data:
        return jsonify({"ok": False, "message": msg}), 403
    if not data["share_original_pdf"] or not data.get("stored_pdf_path") or not os.path.exists(data["stored_pdf_path"]):
        return jsonify({"ok": False, "message": "Candidate did not share the original PDF CV for this application."}), 403
    return send_file(
        data["stored_pdf_path"],
        mimetype="application/pdf",
        as_attachment=False,
        download_name=data["original_filename"],
    )


@app.route("/api/hr/candidate-comparison", methods=["GET"])
@api_role("hr_company")
def api_candidate_comparison():
    from candidate_comparison import comparison
    return jsonify(ok=True, **comparison(_owner(), request.args.get("demo") == "1"))


@app.route("/api/hr/heatmap", methods=["GET"])
@api_role("hr_company")
def api_hr_heatmap():
    return jsonify({"ok": True, **hr_engine.get_heatmap(_owner()), "assignments": hr_engine.list_assignments(_owner())})


@app.route('/api/hr/interview-questions', methods=['POST'])
@api_role('hr_company')
def api_hr_interview_questions():
    from hr_interview_ai import generate
    try:
        result = generate(_owner(), json_object())
        return jsonify(ok=True, **result)
    except questionnaire_engine.QuestionnaireError as exc:
        return jsonify(ok=False, message=str(exc)), exc.status


@app.route("/api/hr/assignments", methods=["POST"])
@api_role("hr_company")
def api_hr_assign():
    data = json_object()
    ok, msg = hr_engine.assign_training(_owner(), data.get("employee_id", ""), data.get("skill", ""))
    return jsonify({"ok": ok, "message": msg}), (200 if ok else 400)


@app.route("/api/hr/assignments", methods=["DELETE"])
@api_role("hr_company")
def api_hr_revoke():
    data = json_object()
    ok = hr_engine.revoke_training(_owner(), data.get("employee_id", ""), data.get("skill", ""))
    return jsonify({"ok": ok}), (200 if ok else 404)


@app.route("/api/chat/context", methods=["GET"])
def api_chat_context():
    user = session.get("user")
    return jsonify({
        "ok": True,
        "mascot": chatbot_engine.MASCOT_PROFILE,
        "quick_prompts": chatbot_engine.get_quick_prompts(user),
        "portal": user["role"] if user else "guest",
    })


@app.route("/api/chat", methods=["POST"])
def api_chat():
    payload = json_object()
    user = session.get("user")
    message = payload.get("message", "")
    location = payload.get("user_location")
    if not isinstance(message, str) or len(message) > 4000 or (location is not None and not isinstance(location, dict)):
        return jsonify(ok=False, message="Send a text message up to 4,000 characters and a valid location."), 400
    try:
        result = chatbot_engine.generate_lumi_response(
            message=message, user=user, user_location=location,
            external_ai_consent=payload.get("external_ai_consent") is True,
        )
    except (TypeError, ValueError):
        return jsonify(ok=False, message="Choose a city or provide valid latitude and longitude."), 400
    return jsonify(result), (200 if result.get("ok") else 400)


@app.route("/api/hr/interviews", methods=["GET", "POST"])
@api_role("hr_company")
def hr_interviews():
    if request.method == "GET":
        return jsonify(ok=True, invitations=hr_engine.interview_list(_owner(), True))
    result, error = hr_engine.create_interview(session["user"], json_object())
    return (jsonify(ok=True, **result) if result else (jsonify(ok=False, message=error), 400))


@app.route("/api/talent/interviews", methods=["GET"])
@api_role("job_seeker")
def talent_interviews():
    return jsonify(ok=True, invitations=hr_engine.interview_list(_owner()))


@app.route("/api/hr/interviews/<int:invite_id>/cancel", methods=["POST"])
@api_role("hr_company")
def cancel_interview(invite_id):
    ok = hr_engine.cancel_interview(_owner(), invite_id)
    return jsonify(ok=ok), (200 if ok else 404)


@app.route("/api/talent/interviews/<int:invite_id>/reply", methods=["POST"])
@api_role("job_seeker")
def reply_interview(invite_id):
    ok = hr_engine.respond_interview(_owner(), invite_id, (json_object()).get("status"))
    return jsonify(ok=ok), (200 if ok else 400)



def main() -> None:
    project_name = os.getenv("PROJECT_NAME", "CareerLens AI")
    print(format_greeting(project_name))
    port = int(os.getenv("PORT", 5000))
    print(f"Starting CareerLens AI server at http://127.0.0.1:{port}")
    app.run(host=os.getenv("HOST", "127.0.0.1"), port=port, debug=False)

@app.route('/api/questionnaire/generate-3-verification-questions', methods=['POST'])
@api_role('job_seeker')
def api_generate_3_verification_questions():
    try:
        data = request.get_json(force=True) or {}
        role = (data.get("target_role") or "").strip() or "Professional"
        skills = data.get("skills", [])

        user_cv = None
        try:
            user_cv = cv_engine.get_user_cv(_owner())
        except Exception:
            pass

        questions, provider = verification_ai.generate_verification_questions(role, skills, user_cv)
        return jsonify({"ok": True, "questions": questions, "provider": provider}), 200
    except Exception as e:
        app.logger.exception("Verification questions generation failed")
        return jsonify({"ok": False, "message": str(e)}), 500


@app.route('/api/questionnaire/submit-3-verification-answers', methods=['POST'])
@api_role('job_seeker')
def api_submit_3_verification_answers():
    try:
        data = request.get_json(force=True) or {}
        answers = data.get("answers", [])
        role = data.get("target_role", "")
        skills = data.get("skills", [])

        eval_result = verification_ai.evaluate_verification_answers(answers, role, skills)
        return jsonify({
            "ok": True,
            "message": "Answers successfully evaluated!",
            **eval_result
        }), 200
    except Exception as e:
        return jsonify({"ok": False, "message": str(e)}), 500


if __name__ == "__main__":
    main()
