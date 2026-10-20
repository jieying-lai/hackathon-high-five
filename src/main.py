"""Application entry point for CareerLens AI (SDC Hackathon 2026 - Domain 1).

Run locally in VS Code terminal:
    py src/main.py
"""

import os
from flask import Flask, jsonify, render_template, request, session

from utils import format_greeting, summarize
from trend_signals import get_trend_radar
from ai_matcher import load_json, match_user_to_roles
from auth_db import authenticate_user, init_db, register_user

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.getenv("FLASK_SECRET_KEY", "careerlens-sdc2026-dev-secret-key")

init_db()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/auth/register", methods=["POST"])
def api_register():
    data = request.get_json(force=True) or {}
    ok, msg, user_info = register_user(data)
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


@app.route("/api/personas", methods=["GET"])
def api_personas():
    return jsonify(load_json("sample_cvs.json"))


@app.route("/api/trends", methods=["GET"])
def api_trends():
    scenario = request.args.get("scenario", "moderate")
    return jsonify(get_trend_radar(scenario=scenario))


@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    payload = request.get_json(force=True) or {}
    profile = payload.get("profile", {})
    scenario = payload.get("scenario", "moderate")
    result = match_user_to_roles(profile=profile, scenario=scenario)
    return jsonify(result)


def main() -> None:
    project_name = os.getenv("PROJECT_NAME", "CareerLens AI")
    print(format_greeting(project_name))
    port = int(os.getenv("PORT", 5000))
    print(f"Starting CareerLens AI server at http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)


if __name__ == "__main__":
    main()
