from pathlib import Path
import pandas as pd

# Step 1: Define file locations
BASE_DIR = Path(__file__).resolve().parent

PARQUET_DIR = BASE_DIR / "data" / "parquet"
OUTPUT_DIR = BASE_DIR / "data" / "processed"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# Step 2: Load Parquet files
print("Loading LinkedIn datasets...")

jobs = pd.read_parquet(
    PARQUET_DIR / "linkedin_job_postings.parquet"
)

skills = pd.read_parquet(
    PARQUET_DIR / "job_skills.parquet"
)

summary = pd.read_parquet(
    PARQUET_DIR / "job_summary.parquet"
)

print("\nOriginal Dataset Shapes:")
print("Jobs:", jobs.shape)
print("Skills:", skills.shape)
print("Summary:", summary.shape)


# Step 3: Validate Primary Keys
print("\nChecking Primary Keys...")

for name, df in [
    ("Jobs", jobs),
    ("Skills", skills),
    ("Summary", summary)
]:
    missing = df["job_link"].isna().sum()
    duplicates = df["job_link"].duplicated().sum()

    print(f"{name}: Missing PK = {missing}, Duplicate PK = {duplicates}")

    if missing > 0 or duplicates > 0:
        raise ValueError(
            f"{name} has invalid job_link values. Merge stopped."
        )


# Step 4: Validate Foreign Keys
print("\nChecking Foreign Keys...")

invalid_skills_fk = (
    ~skills["job_link"].isin(jobs["job_link"])
).sum()

invalid_summary_fk = (
    ~summary["job_link"].isin(jobs["job_link"])
).sum()

print("Invalid Skills FK:", invalid_skills_fk)
print("Invalid Summary FK:", invalid_summary_fk)

if invalid_skills_fk > 0 or invalid_summary_fk > 0:
    raise ValueError("Invalid Foreign Keys detected. Merge stopped.")


# Step 5: Merge Jobs with Skills
print("\nMerging Jobs + Skills...")

combined = jobs.merge(
    skills,
    on="job_link",
    how="left",
    validate="one_to_one"
)

print("After Skills Merge:", combined.shape)


# Step 6: Merge with Summary
print("\nMerging Jobs + Summary...")

combined = combined.merge(
    summary,
    on="job_link",
    how="left",
    validate="one_to_one"
)

print("After Summary Merge:", combined.shape)


# Step 7: Validate Final Dataset
print("\nValidating Combined Dataset...")

original_rows = len(jobs)
combined_rows = len(combined)

print("Original Jobs:", original_rows)
print("Combined Jobs:", combined_rows)

if original_rows != combined_rows:
    raise ValueError("Row count mismatch after merging!")

if not combined["job_link"].is_unique:
    raise ValueError("Duplicate job_link detected after merging!")

print("Merge validation passed!")


# Step 8: Check Missing Values
missing_values = combined.isnull().sum()
duplicate_rows = combined.duplicated().sum()
duplicate_job_links = combined["job_link"].duplicated().sum()

missing_skills = combined["job_skills"].isnull().sum()
missing_summaries = combined["job_summary"].isnull().sum()

# Step 9: Save Combined Dataset
output_file = OUTPUT_DIR / "linkedin_jobs_combined.parquet"

combined.to_parquet(output_file, index=False)


# Step 10: Combination Summary
print("\n" + "=" * 60)
print("LINKEDIN DATASET COMBINATION SUMMARY")
print("=" * 60)

print("\nOriginal Datasets:")
print(f"Jobs:    {len(jobs):,} rows, {len(jobs.columns)} columns")
print(f"Skills:  {len(skills):,} rows, {len(skills.columns)} columns")
print(f"Summary: {len(summary):,} rows, {len(summary.columns)} columns")

print("\nMerge Information:")
print("Join Type: LEFT JOIN")
print("Join Key: job_link")
print("Merge Validation: PASSED")

print("\nCombined Dataset:")
print(f"Total Rows: {len(combined):,}")
print(f"Total Columns: {len(combined.columns)}")
print(f"Duplicate Rows: {duplicate_rows:,}")
print(f"Duplicate job_link: {duplicate_job_links:,}")

print("\nMissing Values:")
print(missing_values.to_string())

print("\nSkills and Summary Coverage:")
print(f"Jobs with Skills: {len(combined) - missing_skills:,}")
print(f"Jobs without Skills: {missing_skills:,}")
print(f"Jobs with Summary: {len(combined) - missing_summaries:,}")
print(f"Jobs without Summary: {missing_summaries:,}")

print("\nDataset Columns:")
print(combined.columns.tolist())

print("\nOutput File:")
print(output_file)

print("\n" + "=" * 60)
print("COMBINATION COMPLETED SUCCESSFULLY!")
print("=" * 60)