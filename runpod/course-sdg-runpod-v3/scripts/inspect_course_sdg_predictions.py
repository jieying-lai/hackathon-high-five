"""Summarise one SDG labeling batch and show details for failed generations."""
import argparse
from collections import Counter
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--errors", type=int, default=3, help="Number of failure examples to show")
    args = parser.parse_args()
    rows = []
    with args.input.open(encoding="utf-8") as stream:
        for line in stream:
            try:
                rows.append(json.loads(line))
            except ValueError:
                continue
    counts = Counter(row.get("status", "unknown") for row in rows)
    print(f"Rows: {len(rows)} | Statuses: {dict(counts)}")
    for row in (r for r in rows if r.get("status") == "generation_error"):
        course = row.get("course", {})
        print(f"\nCourse: {course.get('title', '(unknown title)')} [{course.get('course_id', '?')}]")
        print(f"Error: {row.get('error', '')}: {row.get('error_message', '')}")
        excerpt = row.get("raw_response", "")
        if excerpt:
            print(f"Model response: {excerpt[:1000]}")
        args.errors -= 1
        if args.errors <= 0:
            break


if __name__ == "__main__":
    main()
