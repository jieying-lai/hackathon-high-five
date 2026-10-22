"""Member 2 Module: Updatable AI-Trend Signal Layer & What-If Scenario Engine.

Two signals feed the radar and the role matcher:
  1. Job-market demand: src/data/skill_demand.json, built by scripts/build_skill_demand.py from
     dated JobStreet Malaysia postings (share of postings per skill, baseline vs recent window).
     Re-running the script on newer postings changes the radar and the match scores.
  2. Research feed: the live arXiv API (shown as context only; it does not set any percentage).

Skills with too few postings are labelled "low_sample" and are never used for scoring.
Scenario multipliers are stated assumptions, not measurements.
"""

import json
import os
from datetime import datetime, timezone
import urllib.request
import xml.etree.ElementTree as ET

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DEMAND_PATH = os.path.join(DATA_DIR, "skill_demand.json")  # tests may point this elsewhere
ROLES_PATH = os.path.join(DATA_DIR, "future_roles.json")
FAST_MULTIPLIER = 1.25  # What-If assumption for "Fast AI Disruption"; not a measured value
MAX_MARKET_ADJUSTMENT = 3  # bounded so market data nudges, never dominates, a match score
_cache: dict = {}


def _load_cached(path: str) -> dict:
    stamp = os.path.getmtime(path)
    hit = _cache.get(path)
    if hit and hit[0] == stamp:
        return hit[1]
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    _cache[path] = (stamp, data)
    return data


def load_skill_demand() -> dict:
    """Return the built demand file, or an empty structure if it has not been built."""
    try:
        return _load_cached(DEMAND_PATH)
    except (OSError, ValueError):
        return {"metadata": {}, "skills": {}}


def _roles() -> list:
    return _load_cached(ROLES_PATH)


def tracked_skills() -> list:
    """Every skill the role model uses (core + transferable), in a stable order."""
    seen, out = set(), []
    for role in _roles():
        for skill in role["core_skills"] + role["transferable_from"]:
            if skill not in seen:
                seen.add(skill)
                out.append(skill)
    return out


def _sdg_for_skill(skill: str) -> tuple[str, str]:
    for role in _roles():
        if skill in role["core_skills"] or skill in role["transferable_from"]:
            if role.get("sdg_tags"):
                return role["sdg_tags"][0]["code"], "role_tag"
    return "SDG 8.5", "default_employment"


def get_role_market_signal(role: dict, demand: dict | None = None) -> dict:
    """Measured market evidence for one role, from the skills that have enough postings."""
    demand = demand if demand is not None else load_skill_demand()
    table = demand.get("skills", {})
    skills = role["core_skills"] + role["transferable_from"]
    measured, low = [], []
    for skill in skills:
        e = table.get(skill)
        if e and e.get("confidence") == "measured" and e.get("change_pct") is not None:
            measured.append({"skill": skill, "change_pct": e["change_pct"],
                             "baseline_count": e["baseline_count"], "recent_count": e["recent_count"]})
        else:
            low.append({"skill": skill, "baseline_count": e["baseline_count"] if e else 0,
                        "recent_count": e["recent_count"] if e else 0})
    mean = round(sum(m["change_pct"] for m in measured) / len(measured)) if measured else None
    adj = 0 if mean is None else max(-MAX_MARKET_ADJUSTMENT, min(MAX_MARKET_ADJUSTMENT, round(mean / 10)))
    meta = demand.get("metadata", {})
    return {
        "market_adjustment_pts": adj,
        "mean_change_pct": mean,
        "coverage": f"{len(measured)} of {len(skills)} skills measurable",
        "measured_skills": measured,
        "low_sample_skills": low,
        "baseline_window": meta.get("baseline_window"),
        "recent_window": meta.get("recent_window"),
        "data_through": meta.get("data_through"),
        "source": meta.get("source"),
        "note": ("No skill of this role has enough postings; no market adjustment applied."
                 if mean is None else
                 "Average change in posting share across measurable skills; bounded to +/-%d points." % MAX_MARKET_ADJUSTMENT),
    }




def fetch_live_arxiv_signal(query: str = "artificial+intelligence+workforce") -> dict:
    """Fetch latest AI papers from ArXiv API to demonstrate a live updatable signal source."""
    url = f"https://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results=3&sortBy=submittedDate&sortOrder=descending"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CareerLensAI/1.0"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            xml_data = resp.read()
        root = ET.fromstring(xml_data)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        papers = []
        for entry in root.findall("atom:entry", ns):
            title = (entry.find("atom:title", ns).text or "").strip().replace("\n", " ")
            published = (entry.find("atom:published", ns).text or "")[:10]
            papers.append({"title": title, "published": published})
        if papers:
            return {
                "live_status": "LIVE_CONNECTED",
                "source_name": "arXiv live paper feed (research context only)",
                "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
                "recent_signals": papers,
            }
    except Exception:
        pass

    return {
        "live_status": "CACHED_FALLBACK",
        "source_name": "arXiv feed unavailable (offline); cached placeholder titles, not real citations",
        "last_updated": "Undated demo fixture",
        "recent_signals": [
            {"title": "Autonomous LLM Agents in Financial & Enterprise Compliance", "published": "Demo"},
            {"title": "Human-AI Collaborative Workflows and Workforce Reskilling", "published": "Demo"},
        ],
    }


def get_trend_radar(scenario: str = "moderate", signal_metadata: dict | None = None) -> dict:
    """Return emerging vs declining skills computed from dated postings, adjusted by the What-If scenario."""
    is_fast = scenario == "fast"
    mult = FAST_MULTIPLIER if is_fast else 1.0
    demand = load_skill_demand()
    table = demand.get("skills", {})
    dmeta = demand.get("metadata", {})

    rows = []
    for skill in tracked_skills():
        e = table.get(skill)
        if e and e.get("confidence") == "measured" and e.get("change_pct") is not None:
            sdg, basis = _sdg_for_skill(skill)
            rows.append({"skill": skill, "change": e["change_pct"], "baseline_count": e["baseline_count"],
                         "recent_count": e["recent_count"], "sdg": sdg, "sdg_basis": basis})

    risers = sorted((r for r in rows if r["change"] > 0), key=lambda r: -r["change"])[:4]
    fallers = sorted((r for r in rows if r["change"] < 0), key=lambda r: r["change"])[:3]
    emerging_skills = [{
        "skill": r["skill"], "growth_pct": round(r["change"] * mult), "measured_change_pct": r["change"],
        "scenario_multiplier": mult, "baseline_count": r["baseline_count"], "recent_count": r["recent_count"],
        "confidence": "measured", "sdg": r["sdg"], "sdg_basis": r["sdg_basis"]} for r in risers]
    declining_skills = [{
        "skill": r["skill"], "decline_pct": min(95, round(abs(r["change"]) * mult)), "measured_change_pct": r["change"],
        "scenario_multiplier": mult, "baseline_count": r["baseline_count"], "recent_count": r["recent_count"],
        "confidence": "measured", "sdg": r["sdg"], "sdg_basis": r["sdg_basis"]} for r in fallers]
    watchlist = []
    for skill in tracked_skills():
        e = table.get(skill)
        if not e or e.get("confidence") != "measured":
            watchlist.append({"skill": skill, "baseline_count": e["baseline_count"] if e else 0,
                              "recent_count": e["recent_count"] if e else 0, "confidence": "low_sample",
                              "note": "Too few postings in one or both windows to estimate a trend."})

    # Illustrative task-level risks are NOT measured; kept for the existing UI and labelled as such.
    declining_tasks = [
        {"task": "Manual Invoice & Ledger Reconciliation", "automation_risk_pct": min(95, round(68 * mult))},
        {"task": "Generic SEO & Basic Social Copywriting", "automation_risk_pct": min(92, round(64 * mult))},
        {"task": "Manual First-Round CV Keyword Screening", "automation_risk_pct": min(90, round(60 * mult))},
    ]

    signal_meta = dict(signal_metadata) if signal_metadata is not None else fetch_live_arxiv_signal()
    if "demand_source" not in signal_meta:
        bw, rw = dmeta.get("baseline_window"), dmeta.get("recent_window")
        if bw and rw:
            label = (f"JobStreet Malaysia postings: {bw['start']}..{bw['end']} vs {rw['start']}..{rw['end']} "
                     f"(data through {dmeta.get('data_through')}, computed {dmeta.get('generated_at')})")
        else:
            label = "Skill-demand file not built; run scripts/build_skill_demand.py"
        signal_meta["demand_source"] = dmeta
        signal_meta["source_name"] = f"{label} + {signal_meta.get('source_name', 'arXiv')}"
    return {
        "scenario": scenario,
        "scenario_label": "Fast AI Disruption (Aggressive Adoption)" if is_fast else "Moderate AI Adoption (Human-AI Co-Pilot)",
        "scenario_note": "Percentages are measured changes in posting share; the Fast scenario multiplies them by an assumed x%.2f. Estimates, not forecasts." % FAST_MULTIPLIER,
        "signal_metadata": signal_meta,
        "emerging_skills": emerging_skills,
        "declining_skills": declining_skills,
        "emerging_watchlist": watchlist,
        "declining_tasks": declining_tasks,
        "declining_tasks_basis": "illustrative_assumption_not_measured",
    }
