CareerLens course SDG labeling bundle (v5 — required tag policy)

Every course record gets at least one SDG label:
- If the model finds a specific SDG supported by the course text at medium/high confidence, keep that specific label.
- If it finds no such SDG, append SDG 4 as a platform baseline for structured learning courses. This is explicitly marked label_source=policy_fallback and confidence=baseline. It is not a model prediction, human validation, or a claim that the course advances a particular SDG 4 indicator.
- Low-confidence topic labels remain for review; the SDG 4 baseline is still included so the course is not left untagged.

References
- ESCAP SDMX catalogue: official goal/indicator structure (17 goals, 251 indicator titles).
- World Bank SDGSeries metadata: 375 indicator definitions, compact 357 KB. The script retrieves up to five textually relevant entries per course. Country/year observations were excluded to save RAM. The file has no goal/target mapping and the World Bank notes its indicators may not all be official SDG monitoring indicators; therefore it is supplemental topical context only, not a course-label training set.

Upload this ZIP to /workspace in RunPod, then run:

  cd /workspace
  unzip -o course-sdg-runpod-v5.zip
  cd /workspace/course-sdg-runpod-v5
  python scripts/fetch_escap_sdg_reference.py
  python scripts/auto_label_course_sdgs.py --input models/course-recommender/courses.jsonl --limit 20 --output model-artifacts/course-sdg-predictions-v5.jsonl
  python scripts/inspect_course_sdg_predictions.py --input model-artifacts/course-sdg-predictions-v5.jsonl --errors 5 --reviews 5 --fallbacks 5

Inspect the 20-course sample before starting a larger run. Use the GPU/system Python where torch and CUDA are available. Do not activate /workspace/venv if it lacks torch. The existing Hugging Face model cache should be reusable.

To process the next batches, rerun the same labeling command with the same --output path; already completed records are skipped. Once ready, use --limit 0 to process the rest. Then compile:

  python scripts/compile_course_sdg_labels.py --input model-artifacts/course-sdg-predictions-v5.jsonl --output models/course-recommender/sdg-labels.jsonl

World Bank attribution: World Bank, Sustainable Development Goals, Bulk Download File (CSV), SDGSeries.csv. CC BY 4.0. https://datacatalog.worldbank.org/search/dataset/0037918/sustainable-development-goals
ESCAP reference: https://dataexplorer.unescap.org/
ESCAP SDMX endpoint: https://api-dataexplorer.unescap.org/rest/v2/structure/dataflow/ESCAP/SDG_Dataflow/2.10?references=all
