import sys
import subprocess
import importlib.util
from pathlib import Path


# Step 1: Automatically install missing packages
def install_if_missing(package):
    if importlib.util.find_spec(package) is None:
        print(f"Installing {package}...")

        subprocess.check_call([
            sys.executable,
            "-m",
            "pip",
            "install",
            package
        ])

        print(f"{package} installed successfully!")
    else:
        print(f"{package} is already installed.")


install_if_missing("pandas")
install_if_missing("pyarrow")


# Step 2: Import pandas after installation
import pandas as pd


# Step 3: Define file locations
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "data" / "parquet"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# Step 4: Automatically find all CSV files
csv_files = sorted(BASE_DIR.rglob("*.csv"))

if not csv_files:
    print("ERROR: No CSV files found!")
else:
    print(f"Found {len(csv_files)} CSV file(s).\n")


# Step 5: Convert CSV to Parquet
success_count = 0
skipped_count = 0
failed_count = 0

for csv_file in csv_files:

    # Preserve folder structure to avoid duplicate filenames
    relative_path = csv_file.relative_to(BASE_DIR)
    parquet_file = OUTPUT_DIR / relative_path.with_suffix(".parquet")

    parquet_file.parent.mkdir(parents=True, exist_ok=True)

    print(f"\nProcessing: {relative_path}")

    # Skip if Parquet is already up to date
    if parquet_file.exists():
        if parquet_file.stat().st_mtime >= csv_file.stat().st_mtime:
            print(f"Skipping {parquet_file.name} (already up to date)")
            skipped_count += 1
            continue

    print(f"Converting {csv_file.name}...")

    try:
        df = pd.read_csv(csv_file, low_memory=False)

        df.to_parquet(parquet_file, index=False)

        print(f"Saved: {parquet_file.relative_to(BASE_DIR)}")
        print(f"Total rows: {len(df)}")
        print(f"Total columns: {len(df.columns)}")

        print("\nColumns:")
        print(df.columns.tolist())

        print("\nMissing Values:")
        print(df.isnull().sum().to_string())

        print("\nDuplicate Rows:", df.duplicated().sum())

        success_count += 1

        del df

    except Exception as e:
        print(f"ERROR converting {csv_file.name}: {e}")
        failed_count += 1


# Step 6: Conversion Summary
print("\n" + "=" * 50)
print("CONVERSION SUMMARY")
print("=" * 50)

print(f"Converted: {success_count}")
print(f"Skipped: {skipped_count}")
print(f"Failed: {failed_count}")

print("\nConversion process completed!")