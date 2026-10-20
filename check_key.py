import pandas as pd

jobs = pd.read_csv("linkedin_job_postings.csv")
skills = pd.read_csv("job_skills.csv")
summary = pd.read_csv("job_summary.csv")

# Check whether job_link exists
for name, df in [
    ("Jobs", jobs),
    ("Skills", skills),
    ("Summary", summary)
]:
    print(name, df.columns.tolist())
    print("Missing job_link:", df["job_link"].isna().sum())
    print("Duplicate job_link:", df["job_link"].duplicated().sum())
    print()

# Check foreign key relationship
invalid_skills = skills[
    ~skills["job_link"].isin(jobs["job_link"])
]

invalid_summary = summary[
    ~summary["job_link"].isin(jobs["job_link"])
]

print("Invalid FK in job_skills:", len(invalid_skills))
print("Invalid FK in job_summary:", len(invalid_summary))


print("Jobs unique:", jobs["job_link"].is_unique)
print("Skills unique:", skills["job_link"].is_unique)
print("Summary unique:", summary["job_link"].is_unique)