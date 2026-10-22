CareerLens course SDG labeling bundle (v3.1 validation fix)

This bundle contains the 5,014-course catalogue and official ESCAP SDG indicator reference data. Labels are model suggestions, not human-validated labels. The classifier does not train or alter the recommender.

Upload this ZIP to /workspace in RunPod. It overwrites scripts under the same course-sdg-runpod-v3 folder and keeps the existing v3 output file:

  cd /workspace
  unzip -o course-sdg-runpod-v3.1.zip
  cd /workspace/course-sdg-runpod-v3
  python scripts/fetch_escap_sdg_reference.py
  python scripts/auto_label_course_sdgs.py --input models/course-recommender/courses.jsonl --limit 20 --output model-artifacts/course-sdg-predictions-v3.jsonl
  python scripts/inspect_course_sdg_predictions.py --input model-artifacts/course-sdg-predictions-v3.jsonl --errors 5 --reviews 5

The previous run's successful/needs_review records will be skipped. Only generation_error rows are retried with more forgiving case/Unicode evidence matching and clearer error messages. If ESCAP cannot be reached, the included reference snapshot is still used. Keep using the GPU/system Python where torch and CUDA are available; do not activate /workspace/venv if it lacks torch.

Do not run all courses yet. Review unassigned courses separately; an empty label is a conservative abstention, not a crash. If the platform requires every course to have at least one SDG, decide whether SDG 4 should be used as an explicit baseline after this review.

Official reference: https://dataexplorer.unescap.org/
SDMX endpoint: https://api-dataexplorer.unescap.org/rest/v2/structure/dataflow/ESCAP/SDG_Dataflow/2.10?references=all
