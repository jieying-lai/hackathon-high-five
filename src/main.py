"""Application entry point for CareerLens AI (SDC Hackathon 2026 - Domain 1).

Two fully separate portals, enforced server-side by account role:
  * job_seeker  -> /workspace renders candidate.html  (Talent Portal)
  * hr_company  -> /workspace renders hr.html         (Employer Portal)

Run locally in VS Code terminal:
    py src/main.py
"""

import os
from functools import wraps

from flask import Flask, jsonify, redirect, render_template, request, send_file, session

import cv_engine
import hr_engine
from ai_matcher import load_json, match_user_to_roles
from auth_db import authenticate_user, init_db, register_user
from trend_signals import get_trend_radar
from utils import format_greeting

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.getenv("FLASK_SECRET_KEY", "careerlens-sdc2026-dev-secret-key")

init_db()
hr_engine.init_hr_tables()
cv_engine.init_cv_tables()


def api_role(role):
    """Restrict an API route to one account role."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = session.get("user")
            if not user:
                return jsonify({"ok": False, "message": "Please sign in first."}), 401
            if user["role"] != role:
                portal = "Employer" if role == "hr_company" else "Talent"
                return jsonify({"ok": False, "message": f"This area is for {portal} Portal accounts only."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ------------------------------------------------------------------ pages
@app.route("/")
def index():
    if session.get("user"):
        return redirect("/workspace")
    return render_template("index.html")


@app.route("/workspace")
def workspace():
    user = session.get("user")
    if not user:
        return redirect("/")
    return render_template("hr.html" if user["role"] == "hr_company" else "candidate.html")


# ------------------------------------------------------------------ auth
@app.route("/api/auth/register", methods=["POST"])
def api_register():
    ok, msg, user_info = register_user(request.get_json(force=True) or {})
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    session["user"] = user_info
    return jsonify({"ok": True, "message": msg, "user": user_info})


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json(force=True) or {}
    ok, msg, user_info = authenticate_user(data.get("email", ""), data.get("password", ""))
    if not ok:
        return jsonify({"ok": False, "message": msg}), 401
    session["user"] = user_info
    return jsonify({"ok": True, "message": msg, "user": user_info})


@app.route("/api/auth/logout", methods=["POST"])
def api_logout():
    session.pop("user", None)
    return jsonify({"ok": True, "message": "Logged out successfully."})


@app.route("/api/auth/me", methods=["GET"])
def api_me():
    return jsonify({"user": session.get("user")})


# ------------------------------------------------------------------ Talent Portal APIs
def _owner():
    return session["user"]["unique_uid"]


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
    })


@app.route("/api/cv/upload", methods=["POST"])
@api_role("job_seeker")
def api_cv_upload():
    user = session["user"]
    # Support either direct multipart file upload OR quick-loading one of the synthetic sample PDFs
    if "file" in request.files and request.files["file"].filename:
        up = request.files["file"]
        filename = up.filename or ""
        pdf_bytes = up.read()
        allow_anon = request.form.get("allow_anon_stats", "1") != "0"
    else:
        body = request.get_json(silent=True) or {}
        sample_name = (body.get("sample_filename") or "").strip()
        sample_path = os.path.join(cv_engine.SAMPLE_PDF_DIR, os.path.basename(sample_name))
        if not sample_name or not os.path.exists(sample_path):
            return jsonify({"ok": False, "message": "Please select a valid .pdf CV file to upload."}), 400
        filename = os.path.basename(sample_name)
        with open(sample_path, "rb") as f:
            pdf_bytes = f.read()
        allow_anon = bool(body.get("allow_anon_stats", True))

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
    ok, msg, cv_data = cv_engine.update_user_structured_cv(_owner(), request.get_json(force=True) or {})
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    return jsonify({"ok": True, "message": msg, "cv": cv_data})


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
    return jsonify({
        "ok": True,
        "jobs": hr_engine.list_open_vacancies_for_seeker(_owner()),
        "has_cv": cv_engine.get_user_cv(_owner()) is not None,
    })


@app.route("/api/jobs/<int:vid>/apply", methods=["POST"])
@api_role("job_seeker")
def api_jobs_apply(vid):
    user = session["user"]
    ok, msg, app_info = cv_engine.apply_to_vacancy(
        candidate_uid=user["unique_uid"],
        candidate_name=user["full_name"],
        vacancy_id=vid,
        payload=request.get_json(force=True) or {},
    )
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    return jsonify({"ok": True, "message": msg, "application": app_info})


@app.route("/api/jobs/<int:vid>/apply", methods=["DELETE"])
@api_role("job_seeker")
def api_jobs_withdraw(vid):
    ok, msg = cv_engine.withdraw_application(_owner(), vid)
    return jsonify({"ok": ok, "message": msg}), (200 if ok else 404)


@app.route("/api/trends", methods=["GET"])
@api_role("job_seeker")
def api_trends():
    data = get_trend_radar(scenario=request.args.get("scenario", "moderate"))
    data["anonymized_talent_pool_stats"] = cv_engine.get_anonymized_cv_statistics()
    return jsonify(data)


@app.route("/api/analyze", methods=["POST"])
@api_role("job_seeker")
def api_analyze():
    payload = request.get_json(force=True) or {}
    return jsonify(match_user_to_roles(profile=payload.get("profile", {}), scenario=payload.get("scenario", "moderate")))


# ------------------------------------------------------------------ Employer Portal APIs
@app.route("/api/hr/vacancies", methods=["GET"])
@api_role("hr_company")
def api_hr_vacancies():
    return jsonify({"ok": True, "vacancies": hr_engine.list_vacancies(_owner())})


@app.route("/api/hr/vacancies", methods=["POST"])
@api_role("hr_company")
def api_hr_create_vacancy():
    ok, msg, vacancy = hr_engine.create_vacancy(_owner(), request.get_json(force=True) or {})
    return (jsonify({"ok": True, "message": msg, "vacancy": vacancy}) if ok
            else (jsonify({"ok": False, "message": msg}), 400))


@app.route("/api/hr/vacancies/<int:vid>/status", methods=["POST"])
@api_role("hr_company")
def api_hr_vacancy_status(vid):
    status = (request.get_json(force=True) or {}).get("status")
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


@app.route("/api/hr/heatmap", methods=["GET"])
@api_role("hr_company")
def api_hr_heatmap():
    return jsonify({"ok": True, **hr_engine.get_heatmap(), "assignments": hr_engine.list_assignments(_owner())})


@app.route("/api/hr/assignments", methods=["POST"])
@api_role("hr_company")
def api_hr_assign():
    data = request.get_json(force=True) or {}
    ok, msg = hr_engine.assign_training(_owner(), data.get("employee_id", ""), data.get("skill", ""))
    return jsonify({"ok": ok, "message": msg}), (200 if ok else 400)


@app.route("/api/hr/assignments", methods=["DELETE"])
@api_role("hr_company")
def api_hr_revoke():
    data = request.get_json(force=True) or {}
    ok = hr_engine.revoke_training(_owner(), data.get("employee_id", ""), data.get("skill", ""))
    return jsonify({"ok": ok}), (200 if ok else 404)


def main() -> None:
    project_name = os.getenv("PROJECT_NAME", "CareerLens AI")
    print(format_greeting(project_name))
    port = int(os.getenv("PORT", 5000))
    print(f"Starting CareerLens AI server at http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)


if __name__ == "__main__":
    main()
