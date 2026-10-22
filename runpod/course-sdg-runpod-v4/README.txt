CareerLens course SDG labeling bundle (v4)

What is included
- 5,014 course records.
- ESCAP's official SDG goal/indicator catalogue snapshot (17 goals, 251 indicator titles); fetch_escap_sdg_reference.py can refresh it from the official SDMX API.
- A compact World Bank SDG-series metadata extract (375 indicators, 357 KB). The large country-year observations, country table and footnotes from the supplied archive are excluded to save RAM.

How the World Bank reference is used
For each course, the script uses lightweight TF-IDF text matching to retrieve up to five relevant World Bank indicator metadata records. They are topical context only: the source file has no explicit goal/target columns and its indicators may not all be official SDG monitoring indicators. The classifier must still verify the goal using the ESCAP catalogue and the course's own text. The World Bank metadata is not course-label training data and does not fine-tune the model.

Run these commands in the RunPod terminal after uploading this ZIP to /workspace:

  cd /workspace
  unzip -o course-sdg-runpod-v4.zip
  cd /workspace/course-sdg-runpod-v4
  python scripts/fetch_escap_sdg_reference.py
  python scripts/auto_label_course_sdgs.py --input models/course-recommender/courses.jsonl --limit 20 --output model-artifacts/course-sdg-predictions-v4.jsonl
  python scripts/inspect_course_sdg_predictions.py --input model-artifacts/course-sdg-predictions-v4.jsonl --errors 5 --reviews 5

Use the GPU/system Python where torch and CUDA are available, as in the successful CUDA check. Do not activate /workspace/venv if it does not contain torch. Do not process all courses yet; inspect this sample first.

World Bank attribution: World Bank, Sustainable Development Goals, Bulk Download File (CSV), SDGSeries.csv. Dataset licensed under Creative Commons Attribution 4.0 (CC BY 4.0). https://datacatalog.worldbank.org/search/dataset/0037918/sustainable-development-goals
ESCAP reference: https://dataexplorer.unescap.org/
ESCAP SDMX endpoint: https://api-dataexplorer.unescap.org/rest/v2/structure/dataflow/ESCAP/SDG_Dataflow/2.10?references=all
