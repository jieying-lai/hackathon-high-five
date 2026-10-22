"""Fit a portable course-content model from the supplied catalogue and usage ZIPs."""
import argparse
from collections import Counter, defaultdict
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
import math
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src'))
from course_recommender import terms, vectorise
from auto_label_course_sdgs import courses_from_zip


def fit(args):
    rows = courses_from_zip(args.courses)
    documents = [f'{c["title"]} {c["title"]} {c["category"]} {c["description"]} {c["skills"]} {c["learning_outcomes"]}' for c in rows]
    df = Counter()
    for text in documents:
        df.update(set(terms(text)))
    vocabulary = sorted((k for k in df if df[k] >= 2), key=lambda k: (-df[k], k))[:40000]
    idf = {k: round(math.log((1 + len(rows))/(1 + df[k])) + 1, 6) for k in vocabulary}
    prior_rows = defaultdict(list)
    usage_count = 0
    if args.usage:
        with zipfile.ZipFile(args.usage) as archive:
            names = [n for n in archive.namelist() if n.lower().endswith('.csv')]
            if len(names) != 1:
                raise ValueError('Usage ZIP must contain one CSV')
            reader = csv.DictReader(io.StringIO(archive.read(names[0]).decode('utf-8-sig')))
            for row in reader:
                usage_count += 1
                try:
                    satisfaction = max(0, min(1, float(row['satisfaction_score'])/10))
                    completion = max(0, min(1, float(row['completion_rate_percent'])/100))
                    prior_rows[row['primary_platform'].strip().lower()].append((satisfaction + completion)/2)
                except (ValueError, KeyError, TypeError):
                    continue
    courses = []
    for row, text in zip(rows, documents):
        courses.append({'id': row['course_id'], 'url': row['url'], 'course_title': row['title'],
            'target_skill': row['title'], 'provider': row['provider'], 'category': row['category'],
            'description': row['description'][:1200], 'source': 'discovery',
            'vector': {k: round(v, 6) for k, v in vectorise(text, idf, cap=160).items()}})
    model = {'version': 1, 'kind': 'fitted-tfidf-content-v1', 'course_count': len(courses), 'idf': idf,
        'platform_prior': {p: round((sum(v) + 5)/(len(v) + 10), 5) for p, v in prior_rows.items()}}
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / 'model-meta.json').write_text(json.dumps(model, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    with (args.output / 'courses.jsonl').open('w', encoding='utf-8', newline='\n') as output:
        for course in courses:
            output.write(json.dumps(course, ensure_ascii=False, separators=(',', ':')) + '\n')
    legacy_model = args.output / 'model.json'
    if legacy_model.exists():
        legacy_model.unlink()
    manifest = {'kind': model['kind'], 'trained_at_utc': datetime.now(timezone.utc).isoformat(),
        'course_count': len(courses), 'vocabulary_size': len(idf), 'usage_rows': usage_count,
        'catalogue_sha256': hashlib.sha256(args.courses.read_bytes()).hexdigest(),
        'usage_sha256': hashlib.sha256(args.usage.read_bytes()).hexdigest() if args.usage else None,
        'objective': 'Corpus TF-IDF fit; cosine retrieval and feedback reranking',
        'sdg_labels_used': False, 'cv_used': False, 'neural_finetuning': False,
        'preference_accuracy_evaluated': False,
        'satisfaction_scale': '1-10 in the supplied usage dataset',
        'usage_limit': 'Aggregate platform prior only. No user-to-course preference ground truth.'}
    (args.output / 'training-summary.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--courses', type=Path, required=True)
    parser.add_argument('--usage', type=Path)
    parser.add_argument('--output', type=Path, default=ROOT / 'models/course-recommender')
    fit(parser.parse_args())
