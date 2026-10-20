"""Application entry point for CareerLens AI (SDC Hackathon 2026 - Domain 1).

Run locally in VS Code terminal:
    py src/main.py
"""

import os
from flask import Flask, jsonify, render_template, request

from utils import format_greeting, summarize
from trend_signals import get_trend_radar
from ai_matcher import load_json, match_user_to_roles

app = Flask(__name__, template_folder="templates", static_folder="static")


@app.route("/")
def index():
    return render_template("index.html")


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
