from pathlib import Path
from collections import Counter, defaultdict
import pandas as pd
import re

# ============================================================
# Step 1: File Locations
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

INPUT_FILE = (
    BASE_DIR / "data" / "processed"
    / "linkedin_jobs_combined.parquet"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# Step 2: Skill Standardization Rules
# ============================================================

SKILL_ALIASES = {
    "communication skills": "communication",
    "verbal communication": "verbal communication",
    "written communication": "written communication",
    "problemsolving": "problem solving",
    "problem-solving": "problem solving",
    "microsoft office suite": "microsoft office",
    "ms office": "microsoft office",
    "ms excel": "microsoft excel",
    "excel": "microsoft excel",
    "ms word": "microsoft word",
    "powerbi": "power bi",
    "power bi desktop": "power bi",
    "sql programming": "sql",
    "python programming": "python"
}


def normalize_skill(skill):
    skill = str(skill).strip().lower()
    skill = re.sub(r"\s+", " ", skill)
    skill = SKILL_ALIASES.get(skill, skill)
    return skill


def normalize_job_title(title):
    title = str(title).strip().lower()
    title = re.sub(r"\s+", " ", title)
    return title


# ============================================================
# Step 3: Load Required Columns Only
# ============================================================

print("Loading LinkedIn Job-Skill Data...")

if not INPUT_FILE.exists():
    raise FileNotFoundError(
        f"File not found: {INPUT_FILE}"
    )

df = pd.read_parquet(
    INPUT_FILE,
    columns=["job_link", "job_title", "job_skills"]
)

print(f"Loaded {len(df):,} job postings.")


# ============================================================
# Step 4: Clean Missing Values
# ============================================================

original_rows = len(df)

df = df.dropna(
    subset=["job_title", "job_skills"]
).copy()

df["job_title"] = df["job_title"].map(
    normalize_job_title
)

df = df[
    (df["job_title"] != "") &
    (df["job_skills"].astype(str).str.strip() != "")
]

print(f"Jobs with usable skills: {len(df):,}")


# ============================================================
# Step 5: Extract and Normalize Skills
# ============================================================

print("Extracting and standardizing skills...")

job_skill_counter = Counter()
job_posting_counter = Counter()

total_skill_mentions = 0
jobs_without_extracted_skills = 0

for row in df.itertuples(index=False):

    job_title = row.job_title

    raw_skills = str(row.job_skills).split(",")

    # Remove repeated skills within one posting
    unique_skills = set()

    for raw_skill in raw_skills:

        skill = normalize_skill(raw_skill)

        if not skill:
            continue

        unique_skills.add(skill)

    if not unique_skills:
        jobs_without_extracted_skills += 1
        continue

    job_posting_counter[job_title] += 1

    for skill in unique_skills:
        job_skill_counter[(job_title, skill)] += 1
        total_skill_mentions += 1


# ============================================================
# Step 6: Build Job-Skill Mapping
# ============================================================

print("Building Job-Skill Mapping...")

records = []

for (job_title, skill), count in job_skill_counter.items():

    total_jobs = job_posting_counter[job_title]

    records.append({
        "job_title": job_title,
        "skill": skill,
        "job_count": count,
        "total_job_postings": total_jobs,
        "skill_frequency_percentage": round(
            count / total_jobs * 100, 2
        )
    })

mapping = pd.DataFrame(
    records,
    columns=[
        "job_title",
        "skill",
        "job_count",
        "total_job_postings",
        "skill_frequency_percentage"
    ]
)

mapping = mapping.sort_values(
    ["job_title", "job_count", "skill"],
    ascending=[True, False, True]
)


# ============================================================
# Step 7: Save Job-Skill Mapping
# ============================================================

output_file = (
    OUTPUT_DIR / "linkedin_job_skill_mapping.parquet"
)

mapping.to_parquet(
    output_file,
    index=False
)


# ============================================================
# Step 8: Create Top Skills per Job Title
# ============================================================

print("Creating Top Skills per Job Title...")

top_skills = (
    mapping.groupby("job_title", sort=False)
    .head(10)
    .copy()
)

top_skills_file = (
    OUTPUT_DIR / "linkedin_top_skills_by_job.parquet"
)

top_skills.to_parquet(
    top_skills_file,
    index=False
)


# ============================================================
# Step 9: Job-Skill Mapping Summary
# ============================================================

print("\n" + "=" * 60)
print("LINKEDIN JOB-SKILL MAPPING SUMMARY")
print("=" * 60)

print(f"\nOriginal Job Postings: {original_rows:,}")
print(f"Jobs with Usable Skills: {len(df):,}")
print(
    f"Jobs Excluded: {original_rows - len(df):,}"
)

print(f"\nUnique Job Titles: {len(job_posting_counter):,}")
print(f"Unique Job-Skill Pairs: {len(mapping):,}")
print(f"Total Job-Skill Mentions: {total_skill_mentions:,}")

print("\nOutput Files:")
print(output_file)
print(top_skills_file)

print("\nSample: Top 10 Skills for Data Analyst")

sample = top_skills[
    top_skills["job_title"] == "data analyst"
]

if sample.empty:
    print("No exact 'data analyst' job title found.")
else:
    print(sample.to_string(index=False))

print("\n" + "=" * 60)
print("JOB-SKILL MAPPING COMPLETED SUCCESSFULLY!")
print("=" * 60)