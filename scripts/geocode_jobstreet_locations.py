"""One-off: geocode every unique JobStreet location string via OpenStreetMap Nominatim (1 req/s).
Writes src/data/jobstreet_geocache.json  {location_string: [lat, lng] | null}
"""
import csv, json, os, time, urllib.parse, urllib.request

ROOT = r"C:\Users\April\.gemini\antigravity\scratch\careerlens-ai"
CSV = os.path.join(ROOT, "data_raw", "jobstreet_all_job_dataset.csv")
OUT = os.path.join(ROOT, "src", "data", "jobstreet_geocache.json")
csv.field_size_limit(10**9)

locs = set()
with open(CSV, encoding="utf-8", errors="replace", newline="") as f:
    for r in csv.DictReader(f):
        locs.add((r.get("location") or "").strip())

cache = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}

def q(text):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": text, "format": "json", "limit": 1, "countrycodes": "my"})
    req = urllib.request.Request(url, headers={"User-Agent": "CareerLensAI-Hackathon/1.0 (education demo)"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    time.sleep(1.1)
    if data:
        return [round(float(data[0]["lat"]), 5), round(float(data[0]["lon"]), 5)]
    return None

todo = sorted(l for l in locs if l and l not in cache)
print("unique", len(locs), "todo", len(todo), flush=True)
for i, loc in enumerate(todo):
    variants = [loc + ", Malaysia"]
    clean = loc.replace(" District", "").replace(" Division", "").replace("/", " ")
    if clean != loc:
        variants.append(clean + ", Malaysia")
    if "/" in loc:
        variants.append(loc.split("/")[0] + ", Malaysia")
    if "," in loc:
        variants.append(loc.split(",")[0].replace(" District", "").replace(" Division", "") + ", " + loc.split(",")[-1].strip() + ", Malaysia")
    res = None
    for v in variants:
        try:
            res = q(v)
        except Exception as e:
            print("err", v, e, flush=True)
            time.sleep(3)
        if res:
            break
    cache[loc] = res
    if i % 20 == 0:
        json.dump(cache, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
        print(i, loc, res, flush=True)
json.dump(cache, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("done; null:", [k for k, v in cache.items() if not v])
