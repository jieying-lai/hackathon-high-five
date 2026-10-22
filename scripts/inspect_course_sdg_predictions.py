"""Summarise one SDG labeling batch and show details for failed generations."""
import argparse
from collections import Counter
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--errors", type=int, default=3, help="Number of generation failures to show")
    parser.add_argument("--reviews", type=int, default=3, help="Number of unassigned review examples to show")
    parser.add_argument("--fallbacks", type=int, default=3, help="Number of SDG 4 fallback examples to show")
    args = parser.parse_args()
    rows = []
    with args.input.open(encoding="utf-8") as stream:
        for line in stream:
            try:
                rows.append(json.loads(line))
            except ValueError:
                continue
    latest = {}
    for index, row in enumerate(rows):
        latest[row.get("fingerprint") or f"line-{index}"] = row
    rows = list(latest.values())
    counts = Counter(row.get("status", "unknown") for row in rows)
    print(f"Rows: {len(rows)} | Statuses: {dict(counts)}")
    for row in (r for r in rows if r.get("status") in ("generation_error", "fallback_generation_error")):
        course = row.get("course", {})
        print(f"\nCourse: {course.get('title', '(unknown title)')} [{course.get('course_id', '?')}]")
        print(f"Error: {row.get('error', '')}: {row.get('error_message', '')}")
        excerpt = row.get("raw_response", "")
        if excerpt:
            print(f"Model response: {excerpt[:1000]}")
        args.errors -= 1
        if args.errors <= 0:
            break
    for row in (r for r in rows if r.get("status") == "needs_review"):
        course = row.get("course", {})
        print(f"\nNeeds review: {course.get('title', '(unknown title)')} [{course.get('course_id', '?')}]")
        print(f"Labels: {[x.get('label') for x in row.get('labels', [])]}")
        print(f"Reason: {row.get('unassigned_reason', '(model gave no reason)')}")
        args.reviews -= 1
        if args.reviews <= 0:
            break
    for row in (r for r in rows if any(x.get("label_source") == "policy_fallback" for x in r.get("labels", []))):
        course = row.get("course", {})
        print(f"\nSDG 4 baseline: {course.get('title', '(unknown title)')} [{course.get('course_id', '?')}]")
        args.fallbacks -= 1
        if args.fallbacks <= 0:
            break


if __name__ == "__main__":
    main()
