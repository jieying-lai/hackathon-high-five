"""Public, refreshable market evidence. Scenario weights are never observations."""
from collections import Counter
from datetime import datetime, timezone
import html
import json
from pathlib import Path
import re
import threading
import time
from urllib.parse import urlsplit
import urllib.request

from trend_signals import load_skill_demand, tracked_skills

FEED_URL = "https://remotive.com/api/remote-jobs?limit=100"
CACHE_PATH = Path(__file__).resolve().parents[1] / ".runtime" / "market-signals.json"
REFRESH_SECONDS = 6 * 60 * 60  # Remotive recommends no more than four checks daily.
MAX_BYTES = 5 * 1024 * 1024
_lock = threading.Lock()
_loaded = False
_snapshot = None
_last_attempt = 0
_last_error = None

# Explicit keyword matching, not an AI judgment of a person's competence.
VOCABULARY = [
    ("AI & machine learning", "ai", r"\b(?:artificial intelligence|machine learning|generative ai|llm|ai)\b"),
    ("Python", "technical", r"\bpython\b"),
    ("SQL", "technical", r"\bsql\b"),
    ("Data analysis", "technical", r"\b(?:data analy[st]|analytics|power bi|tableau)\w*\b"),
    ("Cloud platforms", "technical", r"\b(?:aws|azure|google cloud|gcp)\b"),
    ("Cybersecurity", "technical", r"\b(?:cybersecurity|information security|security engineer)\b"),
    ("JavaScript", "technical", r"\b(?:javascript|typescript|react|node\.?js)\b"),
    ("Design", "human", r"\b(?:ux|ui|figma|product design|user research)\b"),
    ("Communication", "human", r"\b(?:communication|stakeholder|presentation|communicate)\w*\b"),
    ("Project delivery", "human", r"\b(?:project management|project manager|agile|scrum)\b"),
    ("Sales", "human", r"\b(?:sales|business development)\b"),
    ("Marketing", "human", r"\b(?:marketing|seo|content strategy)\b"),
    ("Finance & accounting", "routine", r"\b(?:accounting|bookkeeping|financial reporting|reconciliation)\b"),
    ("Customer support", "routine", r"\b(?:customer support|customer service|support specialist)\b"),
]

SCENARIOS = [
    {"id": "steady", "name": "Steady change", "subtitle": "Strengthen the fundamentals",
     "weights": {"ai": 0.8, "technical": 1.0, "human": 1.2, "routine": 1.0},
     "assumption": "Adoption is gradual; collaboration and reliable delivery stay central.",
     "watch_for": "Employers keep asking for core skills alongside new tools.",
     "action": "Practise one core skill on a small project and ask someone to review it."},
    {"id": "copilot", "name": "AI co-pilot", "subtitle": "Learn to work with the tools",
     "weights": {"ai": 1.2, "technical": 1.1, "human": 1.1, "routine": 0.9},
     "assumption": "AI supports existing roles; checking its output matters as much as using it.",
     "watch_for": "Job descriptions pair AI tools with domain expertise and human review.",
     "action": "Try an AI-assisted task. Compare its output with your own checks."},
    {"id": "accelerated", "name": "Faster adoption", "subtitle": "Test how your role could change",
     "weights": {"ai": 1.5, "technical": 1.2, "human": 1.1, "routine": 0.7},
     "assumption": "AI tools spread faster; automation skills receive more planning emphasis.",
     "watch_for": "Employers explicitly ask for automation, AI workflows and oversight.",
     "action": "Map a routine workflow, automate one safe step, and document what still needs judgment."},
]


def _iso(timestamp):
    return datetime.fromtimestamp(timestamp, timezone.utc).isoformat(timespec="seconds")


def _normalize_jobs(payload):
    jobs = payload.get("jobs")
    if not isinstance(jobs, list) or not jobs:
        raise ValueError("The source did not return a usable job sample.")
    counts, examples = Counter(), {}
    dates, sample = [], 0
    seen = set()
    for job in jobs[:100]:
        if not isinstance(job, dict):
            continue
        key = str(job.get("id") or job.get("url") or "")
        if not key or key in seen:
            continue
        seen.add(key)
        url = str(job.get("url", ""))
        parts = urlsplit(url)
        if parts.scheme != "https" or parts.hostname not in {"remotive.com", "www.remotive.com"}:
            continue
        sample += 1
        date = str(job.get("publication_date", ""))[:10]
        try:
            datetime.strptime(date, "%Y-%m-%d")
            dates.append(date)
        except ValueError:
            date = None
        tags = job.get("tags", [])
        tags = " ".join(str(t) for t in tags) if isinstance(tags, list) else ""
        text = html.unescape(re.sub("<[^>]+>", " ", (
            str(job.get("title", "")) + " " + tags + " " + str(job.get("description", ""))[:100000]
        )))
        for label, kind, pattern in VOCABULARY:
            if not re.search(pattern, text, re.IGNORECASE):
                continue
            counts[label] += 1
            examples.setdefault(label, [])
            if len(examples[label]) < 3:
                examples[label].append({
                    "title": str(job.get("title", "View job"))[:160],
                    "company": str(job.get("company_name", ""))[:100],
                    "location": str(job.get("candidate_required_location", "Check listing"))[:150],
                    "published": date, "url": url,
                })
    if not sample:
        raise ValueError("No valid source listings were returned.")
    kinds = {name: kind for name, kind, _ in VOCABULARY}
    return {
        "sample_size": sample,
        "earliest_posted": min(dates) if dates else None,
        "latest_posted": max(dates) if dates else None,
        "rows": [{"skill": name, "kind": kinds[name], "count": count,
                  "share_pct": round(100 * count / sample, 1), "examples": examples[name],
                  "evidence": "small_sample" if count < 5 else "sample_observed"}
                 for name, count in counts.most_common()],
    }


def _fetch_snapshot():
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "CareerLens/1.0 (market evidence)"})
    with urllib.request.urlopen(req, timeout=8) as response:
        raw = response.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise ValueError("Source response exceeded the safe size limit.")
    return _normalize_jobs(json.loads(raw))


def live_snapshot():
    global _loaded, _snapshot, _last_attempt, _last_error
    now = time.time()
    with _lock:
        if not _loaded:
            try:
                if CACHE_PATH.stat().st_size < 1024 * 1024:
                    saved = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
                    _snapshot = saved.get("snapshot")
                    _last_attempt = float(saved.get("last_attempt", 0))
                    _last_error = saved.get("last_error")
            except (OSError, ValueError, TypeError):
                pass
            _loaded = True
        if now - _last_attempt >= REFRESH_SECONDS:
            _last_attempt = now
            try:
                _snapshot = {**_fetch_snapshot(), "fetched_at": _iso(now)}
                _last_error = None
            except Exception:
                # Retain dated evidence, never invent replacement observations.
                _last_error = "The remote source could not be reached. No new observations were added."
            try:
                CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
                temporary = CACHE_PATH.with_suffix(".tmp")
                temporary.write_text(json.dumps({
                    "snapshot": _snapshot, "last_attempt": _last_attempt, "last_error": _last_error,
                }), encoding="utf-8")
                temporary.replace(CACHE_PATH)
            except OSError:
                pass  # In-memory throttling remains active on read-only deployments.
        return {
            **(_snapshot or {"sample_size": 0, "rows": [], "fetched_at": None}),
            "status": "stale" if _last_error and _snapshot else "unavailable" if _last_error else "cached",
            "error": _last_error, "checked_at": _iso(now),
            "next_refresh_at": _iso(_last_attempt + REFRESH_SECONDS),
            "source": "Remotive", "source_url": "https://remotive.com/",
            "scope": "Recent global remote listings, not the Malaysian job market.",
            "method": "Keyword mentions in up to 100 recent active postings. One count per skill per posting.",
            "caveats": [
                "A convenience sample, not a representative market survey.",
                "Mentions are not vacancy growth, skill proficiency or a hiring forecast.",
                "Several skills can occur in one posting; shares do not sum to 100%.",
                "Remotive delays its public feed by 24 hours. Eligibility varies by location.",
                "Source checks are limited to once every six hours.",
            ],
        }


def historical_snapshot():
    demand = load_skill_demand()
    metadata = demand.get("metadata", {})
    table = demand.get("skills", {})
    measured, insufficient = [], 0
    for skill in tracked_skills():
        row = table.get(skill, {})
        if row.get("confidence") != "measured" or row.get("change_pct") is None:
            insufficient += 1
            continue
        # Counts/normalised shares are evidence; change is NOT automation risk.
        name = skill.lower()
        kind = ("ai" if any(term in name for term in ("llm", "rag", " ai", "ai ", "machine learning", "automation"))
                else "human" if any(term in name for term in ("communication", "judgment", "leadership", "stakeholder", "management"))
                else "technical")
        measured.append({"skill": skill, "kind": kind, **{
            key: row.get(key) for key in ("baseline_count", "recent_count", "baseline_per_1k",
                                          "recent_per_1k", "change_pct")
        }})
    return {
        "metadata": metadata,
        "source_url": "https://www.kaggle.com/datasets/azraimohamad/jobstreet-all-job-dataset",
        "rows": sorted(measured, key=lambda x: -abs(x["change_pct"])),
        "low_sample_count": insufficient,
        "scope": "Historical Malaysia snapshot. Not a live vacancy feed.",
    }


def get_market_signals():
    return {"ok": True, "remote": live_snapshot(), "malaysia": historical_snapshot(),
            "scenarios": SCENARIOS,
            "scenario_method": "Learning priorities use observed mentions multiplied by the selected "
                               "planning weights. Observed values never change. The three narratives "
                               "have no assigned probabilities and are not forecasts."}
