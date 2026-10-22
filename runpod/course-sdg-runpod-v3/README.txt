CareerLens course SDG labeling bundle (v3)

This bundle contains the 5,014-course catalogue and an official ESCAP SDG indicator reference snapshot. The included fetch script can refresh it from ESCAP's SDMX API. The model only makes weak-label suggestions from course text; these are not human-validated labels and do not train or change the recommender.

Run these commands in the RunPod terminal from /workspace after uploading this ZIP:

  unzip -o course-sdg-runpod-v3.zip
  cd /workspace/course-sdg-runpod-v3
  python scripts/fetch_escap_sdg_reference.py
  python scripts/auto_label_course_sdgs.py --input models/course-recommender/courses.jsonl --limit 20 --output model-artifacts/course-sdg-predictions-v3.jsonl
  python scripts/inspect_course_sdg_predictions.py --input model-artifacts/course-sdg-predictions-v3.jsonl

The ZIP already includes the ESCAP catalogue snapshot, so if the refresh command cannot reach ESCAP, the labeling script can still use that snapshot. Keep using the GPU/system Python where torch and CUDA are available, as in the successful CUDA check. Do not activate the old /workspace/venv if it does not contain torch.

Review the 20-course batch and any generation_error details before processing the next batches. To continue, rerun the labeling command with --limit 20 and the same --output path: completed fingerprints are skipped, and failed attempts are retried. To label everything in one run only after the sample looks good, use --limit 0.

Compile accepted predicted labels only after review:
  python scripts/compile_course_sdg_labels.py --input model-artifacts/course-sdg-predictions-v3.jsonl --output models/course-recommender/sdg-labels.jsonl

Official reference: https://dataexplorer.unescap.org/
SDMX structure endpoint: https://api-dataexplorer.unescap.org/rest/v2/structure/dataflow/ESCAP/SDG_Dataflow/2.10?references=all
