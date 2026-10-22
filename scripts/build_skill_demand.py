"""Build src/data/skill_demand.json from the JobStreet Malaysia postings index.

For every skill it counts how many postings mention it in two dated windows
(a baseline window and a recent window), normalises by the number of postings in
each window, and records the relative change. The AI-trend signal layer
(src/trend_signals.py) and the role matcher (src/ai_matcher.py) read this file,
so re-running this script on newer postings changes the radar and the match
scores. Nothing in the output is typed in by hand.

Usage (from the repository root):
    python scripts/build_skill_demand.py
    python scripts/build_skill_demand.py --baseline 2024-02-01 2024-06-30 --recent 2025-03-01 2025-05-31

Limits, repeated in the output file: the two windows come from one Kaggle
snapshot, not a continuous time series; the extracted skill vocabulary is
coarse; a skill needs at least --min-count postings in BOTH windows before its
change is called "measured". Everything else is labelled "low_sample".
"""
import argparse
import gzip
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INDEX = ROOT / "src" / "data" / "jobstreet_index.json.gz"
DEFAULT_OUT = ROOT / "src" / "data" / "skill_demand.json"
DATE_IDX, SKILLS_IDX = 9, 12  # positions inside each job row of the index


def build(index_path, baseline, recent, min_count):
    with gzip.open(index_path, "rt", encoding="utf-8") as f:
        index = json.load(f)
    vocab, jobs = index["skills"], index["jobs"]

    windows = {"baseline": baseline, "recent": recent}
    n_postings = {"baseline": 0, "recent": 0}
    counts = {"baseline": {}, "recent": {}}
    all_dates = []
    for job in jobs:
        day = job[DATE_IDX]
        if not day:
            continue
        all_dates.append(day)
        for name, (start, end) in windows.items():
            if start <= day <= end:
                n_postings[name] += 1
                for sid in set(job[SKILLS_IDX]):
                    skill = vocab[sid]
                    counts[name][skill] = counts[name].get(skill, 0) + 1
                break
    if not n_postings["baseline"] or not n_postings["recent"]:
        raise SystemExit("A window contains no postings; check the date ranges.")

    skills = {}
    for skill in sorted(set(counts["baseline"]) | set(counts["recent"])):
        b, r = counts["baseline"].get(skill, 0), counts["recent"].get(skill, 0)
        b1k = b / n_postings["baseline"] * 1000
        r1k = r / n_postings["recent"] * 1000
        entry = {
            "baseline_count": b, "recent_count": r,
            "baseline_per_1k": round(b1k, 2), "recent_per_1k": round(r1k, 2),
            "change_pct": round((r1k / b1k - 1) * 100) if b1k else None,
            "confidence": "measured" if min(b, r) >= min_count else "low_sample",
        }
        skills[skill] = entry

    return {
        "metadata": {
            "source": index.get("source", "JobStreet Malaysia postings"),
            "method": "Share of postings mentioning a skill (per 1,000 postings) in a baseline window vs a recent window.",
            "baseline_window": {"start": baseline[0], "end": baseline[1], "postings": n_postings["baseline"]},
            "recent_window": {"start": recent[0], "end": recent[1], "postings": n_postings["recent"]},
            "data_through": max(all_dates),
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "min_count_for_measured": min_count,
            "caveats": [
                "Two windows from one public snapshot, not a continuous time series.",
                "Skills are extracted keywords; a posting can mention several.",
                "Skills with fewer than the minimum postings in either window are labelled low_sample and are not used for scoring.",
                "Changes describe past postings and are estimates, not forecasts.",
            ],
        },
        "skills": skills,
    }


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--index", default=str(DEFAULT_INDEX))
    p.add_argument("--output", default=str(DEFAULT_OUT))
    p.add_argument("--baseline", nargs=2, default=["2024-02-01", "2024-06-30"], metavar=("START", "END"))
    p.add_argument("--recent", nargs=2, default=["2025-03-01", "2025-05-31"], metavar=("START", "END"))
    p.add_argument("--min-count", type=int, default=30)
    a = p.parse_args()
    out = build(a.index, tuple(a.baseline), tuple(a.recent), a.min_count)
    Path(a.output).write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    m = out["metadata"]
    measured = sum(1 for s in out["skills"].values() if s["confidence"] == "measured")
    print(f"Wrote {a.output}: {len(out['skills'])} skills ({measured} measured), "
          f"{m['baseline_window']['postings']} baseline / {m['recent_window']['postings']} recent postings, data through {m['data_through']}.")


if __name__ == "__main__":
    main()
