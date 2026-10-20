from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "processed"

role_file = DATA_DIR / "linkedin_role_family_summary.parquet"
skill_file = DATA_DIR / "linkedin_role_skill_filtered.parquet"

roles = pd.read_parquet(role_file)
skills = pd.read_parquet(skill_file)

# Diverse examples for inspection only, not industry restrictions
sample_roles = [
    "software engineer",
    "cybersecurity analyst",
    "accountant",
    "financial analyst",
    "registered nurse",
    "pharmacist",
    "digital marketing specialist",
    "logistics coordinator",
    "hr specialist",
    "mechanical engineer",
    "teacher",
    "store manager",
    "restaurant manager",
    "project manager"
]

print("=" * 75)
print("CROSS-INDUSTRY ROLE-SKILL INSPECTION")
print("=" * 75)

for role in sample_roles:

    print(f"\n{'=' * 75}")
    print(f"ROLE: {role.upper()}")
    print("=" * 75)

    role_info = roles[
        roles["role_family"].str.lower() == role
    ]

    if role_info.empty:
        print("Role family not found.")
        continue

    print("\nRole Information:")
    print(role_info.to_string(index=False))

    role_skills = skills[
        skills["role_family"].str.lower() == role
    ].sort_values(
        "job_count",
        ascending=False
    ).head(10)

    print("\nTop 10 Skills:")

    if role_skills.empty:
        print("No filtered skills available.")
    else:
        print(
            role_skills[
                [
                    "skill",
                    "job_count",
                    "role_job_count",
                    "skill_frequency_percentage"
                ]
            ].to_string(index=False)
        )

print("\n" + "=" * 75)
print("INSPECTION COMPLETED")
print("=" * 75)