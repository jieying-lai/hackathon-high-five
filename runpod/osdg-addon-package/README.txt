OSDG Community Dataset course pilot (CPU only)

This is a separate experimental review report. It does not update production SDG labels.
It streams and shuffles a bounded OSDG CSV/TSV buffer, trains one compact scikit-learn
classifier per SDG, and scores only the first 20 courses by default. Scores are not
calibrated across SDGs. The source annotations are votes on suggested SDGs for report
paragraphs, so course suggestions must be human-reviewed.

Upload this add-on ZIP to /workspace in RunPod, then run:

  unzip -o /workspace/course-sdg-osdg-pilot-addon-v2.zip -d /workspace/course-sdg-runpod-v4
  cd /workspace/course-sdg-runpod-v4
  python -c "import sklearn; print(sklearn.__version__)"

If the import above says scikit-learn is missing, install it with:

  python -m pip install scikit-learn

Then run the 20-course pilot:

  python scripts/osdg_course_pilot.py --data /workspace/osdg-community-data-v2023-10-01.csv --courses models/course-recommender/courses.jsonl --limit 20 --output model-artifacts/osdg-course-pilot.jsonl

The output is model-artifacts/osdg-course-pilot.jsonl. Treat it as candidate suggestions
for review only. Do not compile it into the app's production labels without reviewing
the course and the SDG evidence first.
