"""Application entry point for CareerLens AI (SDC Hackathon 2026 - Domain 1).

Two fully separate portals, enforced server-side by account role:
  * job_seeker  -> /workspace renders candidate.html  (Talent Portal)
  * hr_company  -> /workspace renders hr.html         (Employer Portal)

Run locally in VS Code terminal:
    py src/main.py
"""

import os
from functools import wraps

from flask import Flask, jsonify, redirect, render_template, request, session

import hr_engine
from ai_matcher import load_json, match_user_to_roles
from auth_db import authenticate_user, init_db, register_user
from trend_signals import get_trend_radar
from utils import format_greeting

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.getenv("FLASK_SECRET_KEY", "careerlens-sdc2026-dev-secret-key")

init_db()
hr_engine.init_hr_tables()


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
@app.route("/api/personas", methods=["GET"])
@api_role("job_seeker")
def api_personas():
    return jsonify(load_json("sample_cvs.json"))


@app.route("/api/trends", methods=["GET"])
@api_role("job_seeker")
def api_trends():
    return jsonify(get_trend_radar(scenario=request.args.get("scenario", "moderate")))


@app.route("/api/analyze", methods=["POST"])
@api_role("job_seeker")
def api_analyze():
    payload = request.get_json(force=True) or {}
    return jsonify(match_user_to_roles(profile=payload.get("profile", {}), scenario=payload.get("scenario", "moderate")))


# ------------------------------------------------------------------ Employer Portal APIs
def _owner():
    return session["user"]["unique_uid"]


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
