"""Download ESCAP's official SDG goal and indicator catalogue from its SDMX API."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen


API_URL = (
    "https://api-dataexplorer.unescap.org/rest/v2/structure/dataflow/"
    "ESCAP/SDG_Dataflow/2.10?references=all"
)
PORTAL_URL = "https://dataexplorer.unescap.org/"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=Path("model-artifacts/escap-sdg-reference.json"))
    args = parser.parse_args()
    request = Request(API_URL, headers={
        "Accept": "application/vnd.sdmx.structure+json;version=2.0",
        "User-Agent": "CareerLens-SDG-course-labeler/1.0",
    })
    with urlopen(request, timeout=60) as response:
        payload = json.load(response)

    data = payload.get("data", {})
    codelist = next((item for item in data.get("codelists", [])
                     if item.get("id") == "CL_INDICATORS_SDG"), None)
    if codelist is None:
        raise SystemExit("ESCAP response did not contain CL_INDICATORS_SDG; no file written.")

    goals = {}
    for code in codelist.get("codes", []):
        match = re.match(r"G(\d{2})(?:_|$)", code.get("id", ""))
        if not match:
            continue
        goal_id = int(match.group(1))
        name = code.get("names", {}).get("en") or code.get("name") or code["id"]
        entry = goals.setdefault(str(goal_id), {
            "goal": goal_id,
            "name": re.sub(r"^Goal\s+\d+\s*", "", name),
            "indicators": [],
        })
        if code["id"] != f"G{goal_id:02d}":
            indicator_name = code.get("names", {}).get("en") or code.get("name") or code["id"]
            entry["indicators"].append({
                "code": code["id"],
                "name": re.sub(r"^\d+(?:\.\w+)*\s*-\s*", "", indicator_name),
            })

    if len(goals) != 17 or sum(len(g["indicators"]) for g in goals.values()) < 100:
        raise SystemExit("ESCAP response looked incomplete; expected all 17 goals and indicator titles. No file written.")

    result = {
        "source": PORTAL_URL,
        "api_source": API_URL,
        "dataflow": "ESCAP SDG indicators dataset (version 2.10)",
        "fetched_at_utc": datetime.now(timezone.utc).isoformat(),
        "goal_count": len(goals),
        "indicator_count": sum(len(g["indicators"]) for g in goals.values()),
        "goals": [goals[str(i)] for i in range(1, 18)],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {result['goal_count']} goals and {result['indicator_count']} ESCAP indicator titles to {args.output}")
    print(f"Source: {PORTAL_URL} (official SDMX dataflow {result['dataflow']})")


if __name__ == "__main__":
    main()
