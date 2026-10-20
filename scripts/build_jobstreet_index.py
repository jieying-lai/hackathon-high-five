"""Build the compact, geo-tagged JobStreet Malaysia job index used by the Jobs & Map tab.

Source : Kaggle "JobStreet Malaysia All Job Dataset" (azraimohamad/jobstreet-all-job-dataset)
         -> data_raw/jobstreet_all_job_dataset.csv  (69,024 postings, ~166 MB)
Output : src/data/jobstreet_index.json.gz  (columnar, ~6-8 MB, committed)

Run:  py scripts/build_jobstreet_index.py
"""
import csv
import gzip
import hashlib
import html
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "src"))
from skills_taxonomy import load_parser_lexicon  # noqa: E402

CSV_PATH = os.path.join(ROOT, "data_raw", "jobstreet_all_job_dataset.csv")
GEO_PATH = os.path.join(ROOT, "src", "data", "jobstreet_geocache.json")
OUT_PATH = os.path.join(ROOT, "src", "data", "jobstreet_index.json.gz")
csv.field_size_limit(10**9)

# Comprehensive Malaysian district, suburb, town, and state coordinates
MY_COORDS = {
    # Kuala Lumpur districts & suburbs
    "kuala lumpur": (3.1390, 101.6869, 4.5),
    "kuala lumpur city centre": (3.1579, 101.7116, 1.5),
    "bangsar south": (3.1110, 101.6626, 1.2),
    "bangsar": (3.1292, 101.6704, 1.3),
    "bukit jalil": (3.0587, 101.6917, 1.5),
    "cheras": (3.1068, 101.7259, 2.2),
    "kepong": (3.2140, 101.6356, 2.0),
    "kuala lumpur sentral": (3.1342, 101.6861, 1.0),
    "kl eco city": (3.1175, 101.6741, 0.9),
    "mid valley city": (3.1177, 101.6774, 0.9),
    "mont kiara": (3.1698, 101.6525, 1.2),
    "bandar malaysia": (3.1180, 101.7050, 1.5),
    "bukit damansara": (3.1502, 101.6529, 1.2),
    "taman tun dr ismail": (3.1419, 101.6295, 1.2),
    "setapak": (3.2036, 101.7209, 1.8),
    "bukit bintang": (3.1466, 101.7115, 1.0),
    "sri petaling": (3.0700, 101.6939, 1.3),
    "kuchai lama": (3.0897, 101.6873, 1.2),
    "jalan ipoh": (3.1890, 101.6808, 1.5),
    "ampang": (3.1491, 101.7625, 2.0),
    "taman desa": (3.1023, 101.6847, 1.0),
    "sungai besi": (3.0637, 101.7077, 1.5),
    "sentul": (3.1870, 101.6916, 1.5),
    "tun razak exchange": (3.1424, 101.7188, 0.8),
    "brickfields": (3.1311, 101.6860, 0.9),
    "segambut": (3.1859, 101.6644, 1.5),
    "maluri": (3.1265, 101.7279, 1.1),
    "sri hartamas": (3.1623, 101.6502, 1.1),
    "bandar tasik selatan": (3.0763, 101.7115, 1.2),
    "desa parkcity": (3.1868, 101.6299, 1.1),
    "wangsa maju": (3.2038, 101.7370, 1.5),
    "bandar menjalara": (3.1939, 101.6305, 1.0),
    "pudu": (3.1345, 101.7128, 1.0),
    "taman connaught": (3.0819, 101.7367, 1.1),
    "setiawangsa": (3.1778, 101.7495, 1.2),
    "bandar tun razak": (3.0875, 101.7224, 1.3),
    "pandan perdana": (3.1169, 101.7405, 1.1),
    "pandan indah": (3.1319, 101.7524, 1.2),
    "titiwangsa": (3.1764, 101.7049, 1.1),
    "chow kit": (3.1645, 101.6980, 0.9),
    # Selangor & Putrajaya
    "petaling": (3.1073, 101.6067, 3.8),
    "petaling jaya": (3.1073, 101.6067, 2.5),
    "selangor": (3.0738, 101.5183, 6.5),
    "shah alam/subang": (3.0750, 101.5850, 3.5),
    "shah alam": (3.0733, 101.5185, 2.8),
    "subang jaya": (3.0565, 101.5851, 2.2),
    "bandar sunway": (3.0722, 101.6070, 1.2),
    "klang": (3.0449, 101.4456, 3.2),
    "port klang": (3.0006, 101.3929, 2.2),
    "hulu langat": (3.1121, 101.8165, 3.5),
    "kajang/bangi/serdang": (2.9800, 101.7600, 3.5),
    "kajang": (2.9927, 101.7909, 2.2),
    "bangi": (2.9225, 101.7755, 2.2),
    "bandar baru bangi": (2.9571, 101.7556, 1.8),
    "serdang": (3.0220, 101.7150, 1.8),
    "seri kembangan": (3.0268, 101.7069, 1.8),
    "sepang": (2.7445, 101.7010, 3.5),
    "cyberjaya": (2.9213, 101.6559, 1.8),
    "putrajaya": (2.9264, 101.6964, 2.0),
    "gombak": (3.2535, 101.6533, 3.2),
    "selayang": (3.2494, 101.6553, 1.8),
    "batu caves": (3.2379, 101.6840, 1.6),
    "kuala langat": (2.8136, 101.5018, 3.5),
    "banting": (2.8136, 101.5018, 2.2),
    "puchong": (3.0245, 101.6175, 2.2),
    "bandar puteri puchong": (3.0211, 101.6169, 1.2),
    "kuala selangor": (3.3402, 101.2498, 3.5),
    "kota damansara": (3.1518, 101.5916, 1.4),
    "ara damansara": (3.1200, 101.5769, 1.2),
    "mutiara damansara": (3.1558, 101.6130, 1.0),
    "damansara": (3.1422, 101.6119, 1.6),
    "damansara utama": (3.1353, 101.6223, 1.0),
    "bandar utama": (3.1481, 101.6156, 1.1),
    "bandar sri damansara": (3.1920, 101.6085, 1.2),
    "kelana jaya": (3.1038, 101.5964, 1.3),
    "glenmarie": (3.0888, 101.5646, 1.3),
    "bukit jelutong": (3.1066, 101.5313, 1.3),
    "kota kemuning": (2.9990, 101.5349, 1.4),
    "setia alam": (3.1044, 101.4601, 1.5),
    "bukit raja": (3.0772, 101.4545, 1.4),
    "kapar": (3.1381, 101.3768, 2.0),
    "pulau indah": (2.9437, 101.3267, 2.0),
    "sungai buloh": (3.2089, 101.5801, 2.0),
    "rawang": (3.3213, 101.5767, 2.5),
    "semenyih": (2.9516, 101.8432, 2.0),
    "balakong": (3.0298, 101.7456, 1.5),
    "hulu selangor": (3.5540, 101.6463, 4.0),
    "sabak bernam": (3.7698, 100.9879, 3.5),
    # Penang & Northern
    "penang": (5.3800, 100.3000, 3.8),
    "penang island": (5.3942, 100.2896, 3.0),
    "george town": (5.4141, 100.3288, 2.0),
    "bayan lepas": (5.2945, 100.2655, 1.8),
    "bayan baru": (5.3292, 100.2881, 1.3),
    "jelutong": (5.3894, 100.3125, 1.3),
    "tanjung tokong": (5.4538, 100.3075, 1.2),
    "seberang perai": (5.3845, 100.4150, 3.5),
    "perai": (5.3831, 100.3839, 1.8),
    "butterworth": (5.4011, 100.3694, 1.8),
    "bukit mertajam": (5.3630, 100.4667, 2.2),
    "seberang jaya": (5.3944, 100.4061, 1.4),
    "batu kawan": (5.2602, 100.4362, 1.8),
    "simpang ampat": (5.2844, 100.4758, 1.8),
    "bukit minyak": (5.3118, 100.4494, 1.5),
    "nibong tebal": (5.1659, 100.4779, 2.0),
    "kepala batas": (5.5171, 100.4265, 2.0),
    # Johor
    "johor bahru": (1.4927, 103.7414, 3.5),
    "johor": (1.5500, 103.7200, 6.0),
    "kulai": (1.6561, 103.6032, 2.5),
    "senai": (1.6019, 103.6496, 1.8),
    "iskandar puteri": (1.4236, 103.6575, 2.2),
    "gelang patah": (1.4486, 103.5900, 2.0),
    "pasir gudang": (1.4726, 103.9022, 2.2),
    "masai": (1.4889, 103.8828, 1.8),
    "skudai": (1.5374, 103.6578, 1.8),
    "tebrau": (1.5494, 103.7966, 1.8),
    "ulu tiram": (1.5986, 103.8169, 1.8),
    "permas jaya": (1.4962, 103.8159, 1.4),
    "taman melodies": (1.4882, 103.7603, 1.2),
    "muar": (2.0442, 102.5689, 2.8),
    "batu pahat": (1.8548, 102.9325, 2.8),
    "kluang": (2.0305, 103.3189, 2.8),
    "pontian": (1.4866, 103.3896, 2.5),
    "kota tinggi": (1.7381, 103.8999, 3.0),
    "segamat": (2.5148, 102.8158, 2.8),
    "tangkak": (2.2672, 102.5453, 2.5),
    "mersing": (2.4312, 103.8405, 2.5),
    # Perak
    "kinta": (4.5975, 101.0901, 3.5),
    "ipoh": (4.5975, 101.0901, 2.8),
    "perak": (4.5975, 101.0901, 5.5),
    "larut, matang and selama": (4.8500, 100.7333, 3.0),
    "taiping": (4.8500, 100.7333, 2.2),
    "manjung": (4.2023, 100.6632, 2.8),
    "sitiawan": (4.2167, 100.7000, 2.0),
    "lumut": (4.2323, 100.6298, 1.8),
    "perak tengah": (4.3592, 100.9797, 3.0),
    "kampar": (4.3000, 101.1500, 2.2),
    "muallim": (3.7333, 101.4833, 2.5),
    "tanjung malim": (3.6833, 101.5167, 2.0),
    "hilir perak": (4.0259, 101.0213, 2.8),
    "teluk intan": (4.0259, 101.0213, 2.0),
    "batang padang": (4.1977, 101.2615, 3.0),
    "kerian": (5.0167, 100.5333, 2.8),
    "kuala kangsar": (4.7667, 100.9333, 2.5),
    # Negeri Sembilan & Melaka
    "seremban": (2.7258, 101.9424, 2.8),
    "seremban 2": (2.6914, 101.9089, 1.6),
    "senawang": (2.6956, 101.9848, 1.8),
    "nilai": (2.8180, 101.7972, 2.0),
    "bandar sri sendayan": (2.6713, 101.8559, 1.8),
    "port dickson": (2.5225, 101.7963, 2.5),
    "tampin": (2.4701, 102.2302, 2.5),
    "jempol": (2.8056, 102.4042, 2.8),
    "negeri sembilan": (2.7258, 101.9424, 4.5),
    "melaka": (2.1896, 102.2501, 3.2),
    "melaka tengah": (2.2064, 102.2465, 2.5),
    "ayer keroh": (2.2699, 102.2907, 1.8),
    "alor gajah": (2.3804, 102.2089, 2.5),
    "jasin": (2.3097, 102.4301, 2.5),
    # Kedah & Perlis
    "kulim": (5.3649, 100.5618, 2.5),
    "kulim hi-tech park": (5.4170, 100.5830, 1.6),
    "kuala muda": (5.6470, 100.4877, 2.8),
    "sungai petani": (5.6470, 100.4877, 2.2),
    "kota setar": (6.1248, 100.3678, 2.5),
    "alor setar": (6.1248, 100.3678, 2.2),
    "langkawi": (6.3500, 99.8000, 2.8),
    "kubang pasu": (6.2692, 100.4217, 2.5),
    "jitra": (6.2692, 100.4217, 1.8),
    "baling": (5.6760, 100.9162, 2.5),
    "kedah": (6.1184, 100.3685, 5.0),
    "perlis": (6.4449, 100.2048, 2.8),
    "kangar": (6.4414, 100.1986, 2.0),
    # East Coast (Pahang, Terengganu, Kelantan)
    "kuantan": (3.8126, 103.3256, 2.8),
    "gebeng": (3.9722, 103.3853, 1.8),
    "bentong": (3.5227, 101.9087, 2.5),
    "genting highlands": (3.4237, 101.7932, 1.5),
    "temerloh": (3.4506, 102.4176, 2.5),
    "pekan": (3.4836, 103.3996, 2.5),
    "cameron highlands": (4.4721, 101.3801, 2.2),
    "raub": (3.7899, 101.8570, 2.5),
    "jerantut": (3.9360, 102.3626, 2.5),
    "pahang": (3.8126, 103.3256, 5.5),
    "kemaman": (4.2333, 103.4167, 2.5),
    "chukai": (4.2500, 103.4167, 2.0),
    "kerteh": (4.5167, 103.4500, 1.8),
    "kuala terengganu": (5.3117, 103.1324, 2.5),
    "dungun": (4.7567, 103.4178, 2.5),
    "besut": (5.8333, 102.5500, 2.5),
    "terengganu": (5.3117, 103.1324, 4.5),
    "kota bharu": (6.1254, 102.2381, 2.5),
    "gua musang": (4.8844, 101.9686, 2.8),
    "kelantan": (6.1254, 102.2381, 4.5),
    # Sabah, Sarawak & Labuan
    "kota kinabalu": (5.9804, 116.0735, 2.8),
    "penampang": (5.9261, 116.1066, 2.0),
    "tawau": (4.2448, 117.8912, 2.5),
    "sandakan": (5.8402, 118.1179, 2.5),
    "lahad datu": (5.0268, 118.3270, 2.5),
    "keningau": (5.3378, 116.1602, 2.5),
    "sabah": (5.9804, 116.0735, 5.5),
    "kuching": (1.5533, 110.3592, 2.8),
    "samarahan": (1.4586, 110.4969, 2.2),
    "miri": (4.3995, 113.9914, 2.5),
    "bintulu": (3.1667, 113.0333, 2.5),
    "sibu": (2.2873, 111.8305, 2.5),
    "limbang": (4.7500, 115.0000, 2.5),
    "sarikei": (2.1167, 111.5167, 2.5),
    "sri aman": (1.2376, 111.4621, 2.5),
    "sarawak": (1.5533, 110.3592, 5.5),
    "labuan": (5.2831, 115.2308, 2.0),
}

SKIP_LOCATIONS = {"", "others", "malaysia", "overseas"}

FIRST_HOUR = re.compile(r"per\s*hour|/\s*hr|hourly", re.I)
YEARLY = re.compile(r"per\s*(?:year|annum)|annual", re.I)
NUM = re.compile(r"(\d[\d,]*(?:\.\d+)?)\s*(k)?", re.I)
TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
TOK_RE = re.compile(r"[a-z0-9+#./\-]{2,}")

# Fast token-to-canonical-skill lookup
CANONICAL_TOKEN_MAP = {
    "python": "Python", "sql": "SQL", "mysql": "SQL", "postgresql": "SQL", "postgres": "SQL",
    "sqlite": "SQL", "t-sql": "SQL", "pl/sql": "SQL", "restful": "REST APIs", "api": "REST APIs",
    "git": "Git", "github": "Git", "gitlab": "Git", "react": "React", "reactjs": "React",
    "docker": "Docker", "algorithms": "Data Structures", "html": "HTML/CSS/JS", "html5": "HTML/CSS/JS",
    "css": "HTML/CSS/JS", "javascript": "HTML/CSS/JS", "php": "PHP", "java": "Java", "c++": "C++",
    "nodejs": "Node.js", "node.js": "Node.js", "flask": "Flask", "django": "Django", "fastapi": "FastAPI",
    "pandas": "Pandas", "numpy": "NumPy", "sklearn": "Machine Learning", "powerbi": "Power BI",
    "ssrs": "Power BI", "ssis": "Power BI", "tableau": "Tableau", "aws": "AWS", "ec2": "AWS",
    "azure": "Azure", "gcp": "Google Cloud", "linux": "Linux", "unix": "Linux",
    "langchain": "LLM Orchestration (LangChain/LlamaIndex)", "llm": "LLM Orchestration (LangChain/LlamaIndex)",
    "rag": "Vector Databases & RAG", "zapier": "AI Workflow Automation (Make/Zapier)",
    "rpa": "AI Workflow Automation (Make/Zapier)", "audit": "Financial Auditing",
    "auditing": "Financial Auditing", "auditor": "Financial Auditing", "tax": "Tax Compliance",
    "taxation": "Tax Compliance", "sst": "Tax Compliance", "gst": "Tax Compliance",
    "excel": "Excel Pivot & Macros", "vba": "Excel Pivot & Macros", "macros": "Excel Pivot & Macros",
    "esg": "ESG & Carbon Reporting Standards", "copywriting": "Copywriting", "copywriter": "Copywriting",
    "seo": "SEO Content Strategy", "ga4": "Google Analytics", "canva": "Canva & Basic Design",
    "figma": "Canva & Basic Design", "photoshop": "Canva & Basic Design", "illustrator": "Canva & Basic Design",
    "bilingual": "Bilingual Communication", "mandarin": "Bilingual Communication", "bahasa": "Bilingual Communication",
    "workday": "People Data Analytics", "hrms": "People Data Analytics", "peoplesoft": "People Data Analytics",
    "recruitment": "Recruitment", "recruiting": "Recruitment", "recruiter": "Recruitment",
    "pdpa": "Data Privacy (PDPA)", "gdpr": "Data Privacy (PDPA)", "scrum": "Project Management",
    "agile": "Project Management", "jira": "Project Management", "sdlc": "Project Management",
    "leadership": "Leadership",
}
CANONICAL_PHRASES = [
    ("data analysis", "Python Data Analysis"),
    ("data analytics", "Python Data Analysis"),
    ("machine learning", "Machine Learning"),
    ("power bi", "Power BI"),
    ("google cloud", "Google Cloud"),
    ("prompt engineering", "Prompt Engineering"),
    ("workflow automation", "AI Workflow Automation (Make/Zapier)"),
    ("process automation", "AI Workflow Automation (Make/Zapier)"),
    ("risk assessment", "Risk Assessment"),
    ("risk management", "Risk Assessment"),
    ("financial reporting", "Financial Reporting"),
    ("financial statement", "Financial Reporting"),
    ("general ledger", "Financial Reporting"),
    ("full set of accounts", "Financial Reporting"),
    ("accounts payable", "Financial Reporting"),
    ("accounts receivable", "Financial Reporting"),
    ("content writing", "Copywriting"),
    ("google analytics", "Google Analytics"),
    ("social media", "Social Media Campaigns"),
    ("change management", "Change Management"),
    ("talent acquisition", "Recruitment"),
    ("project management", "Project Management"),
    ("customer service", "Customer Service"),
    ("supply chain", "Supply Chain Management"),
    ("quality assurance", "Quality Assurance"),
    ("quality control", "Quality Control"),
    ("autocad", "AutoCAD"),
    ("solidworks", "SolidWorks"),
    ("plc", "PLC Programming"),
    ("sap", "SAP"),
]


def resolve_coords(loc, geo):
    low = loc.lower().strip()
    if low in SKIP_LOCATIONS or low.startswith("others"):
        return None
    if loc in geo and geo[loc]:
        return float(geo[loc][0]), float(geo[loc][1]), 1.8
    # Strip trailing ", State" or " District" / " Division"
    cleaned = low.replace(" district", "").replace(" division", "").strip()
    if cleaned in MY_COORDS:
        return MY_COORDS[cleaned]
    first_part = cleaned.split(",")[0].strip()
    if first_part in MY_COORDS:
        return MY_COORDS[first_part]
    slash_part = first_part.split("/")[0].strip()
    if slash_part in MY_COORDS:
        return MY_COORDS[slash_part]
    if "," in cleaned:
        state_part = cleaned.split(",")[-1].strip()
        if state_part in MY_COORDS:
            return MY_COORDS[state_part]
    for k, v in MY_COORDS.items():
        if k in cleaned:
            return v
    return None


def parse_salary(s):
    s = (s or "").strip()
    if not s or FIRST_HOUR.search(s):
        return 0, 0
    nums = []
    for n, k in NUM.findall(s.replace("RM", " ")):
        try:
            v = float(n.replace(",", ""))
        except ValueError:
            continue
        if k:
            v *= 1000
        nums.append(v)
    nums = [n for n in nums if n >= 300]
    if not nums:
        return 0, 0
    lo, hi = min(nums), max(nums)
    if YEARLY.search(s) or lo > 60000:
        lo, hi = lo / 12, hi / 12
    if hi > 100000:
        return 0, 0
    return int(round(lo, -1)), int(round(hi, -1))


def jitter(key, lat, lng, km):
    h = hashlib.md5(key.encode("utf-8")).digest()
    ang = (h[0] * 256 + h[1]) / 65535 * 2 * math.pi
    dist = math.sqrt((h[2] * 256 + h[3]) / 65535) * km
    dlat = dist / 111.0 * math.cos(ang)
    dlng = dist / (111.0 * math.cos(math.radians(lat))) * math.sin(ang)
    return round(lat + dlat, 5), round(lng + dlng, 5)


def clean_text(t):
    t = html.unescape(t or "")
    t = TAG_RE.sub(" ", t)
    return WS_RE.sub(" ", t).strip()


def norm_type(t):
    t = (t or "").strip().strip("[]").replace("'", "")
    return t.split(",")[0].strip() or "Full time"


def main():
    geo = json.load(open(GEO_PATH, encoding="utf-8")) if os.path.exists(GEO_PATH) else {}
    lex = load_parser_lexicon()
    lex_single = {
        s: (s.upper() if s in {"sql", "aws", "erp", "sap", "api", "seo", "kpi", "etl", "crm", "cms", "xml", "css", "html", "gaap", "pmp"} else s.title())
        for s in lex.get("skills_dictionary", [])
        if len(s) >= 4 and " " not in s and s not in CANONICAL_TOKEN_MAP
    }

    pools = {k: {} for k in ("company", "location", "category", "subcategory", "type", "skill")}

    def idx(pool, value):
        p = pools[pool]
        if value not in p:
            p[value] = len(p)
        return p[value]

    loc_cache = {}
    seen, jobs, skipped_geo = set(), [], 0
    with open(CSV_PATH, encoding="utf-8", errors="replace", newline="") as f:
        for n, r in enumerate(csv.DictReader(f)):
            jid = (r.get("job_id") or "").split(".")[0].strip()
            if not jid or jid in seen:
                continue
            seen.add(jid)
            loc = (r.get("location") or "").strip()
            if loc not in loc_cache:
                loc_cache[loc] = resolve_coords(loc, geo)
            resolved = loc_cache[loc]
            if not resolved:
                skipped_geo += 1
                continue
            base_lat, base_lng, scatter = resolved
            company = (r.get("company") or "Confidential Employer").strip() or "Confidential Employer"
            lat, lng = jitter(company + "|" + loc, base_lat, base_lng, scatter)

            title = clean_text(r.get("job_title"))[:110]
            desc = clean_text(r.get("descriptions"))
            low = f"{title}. {desc[:1200]}".lower()
            toks = set(TOK_RE.findall(low))

            sk, seen_s = [], set()
            for tok in toks:
                c_sk = CANONICAL_TOKEN_MAP.get(tok)
                if c_sk and c_sk not in seen_s:
                    seen_s.add(c_sk)
                    sk.append(c_sk)
            for phrase, c_sk in CANONICAL_PHRASES:
                if c_sk not in seen_s and phrase in low:
                    seen_s.add(c_sk)
                    sk.append(c_sk)
            if len(sk) < 10:
                for tok in toks:
                    l_sk = lex_single.get(tok)
                    if l_sk and l_sk not in seen_s:
                        seen_s.add(l_sk)
                        sk.append(l_sk)
                        if len(sk) >= 10:
                            break

            smin, smax = parse_salary(r.get("salary"))
            jobs.append([
                int(jid), title, idx("company", company), idx("location", loc),
                idx("category", (r.get("category") or "Others").strip()),
                idx("subcategory", (r.get("subcategory") or "").strip()),
                idx("type", norm_type(r.get("type"))), smin, smax,
                (r.get("listingDate") or "")[:10], lat, lng,
                [idx("skill", s) for s in sk[:10]], desc[:140],
            ])
            if n % 15000 == 0:
                print(f"processed={n} indexed={len(jobs)}", flush=True)

    def as_list(pool):
        return [k for k, _ in sorted(pools[pool].items(), key=lambda kv: kv[1])]

    out = {
        "source": "Kaggle JobStreet Malaysia All Job Dataset (azraimohamad/jobstreet-all-job-dataset)",
        "fields": ["job_id", "title", "company", "location", "category", "subcategory", "type",
                   "salary_min", "salary_max", "listing_date", "lat", "lng", "skills", "snippet"],
        "companies": as_list("company"), "locations": as_list("location"), "categories": as_list("category"),
        "subcategories": as_list("subcategory"), "types": as_list("type"), "skills": as_list("skill"),
        "jobs": jobs,
    }
    with gzip.open(OUT_PATH, "wt", encoding="utf-8", compresslevel=6) as g:
        json.dump(out, g, ensure_ascii=False, separators=(",", ":"))
    print(f"DONE: jobs={len(jobs)} companies={len(out['companies'])} locations={len(out['locations'])} "
          f"skipped_no_geo={skipped_geo} size={os.path.getsize(OUT_PATH)/1e6:.2f} MB", flush=True)


if __name__ == "__main__":
    main()
