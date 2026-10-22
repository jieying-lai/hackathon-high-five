"""Compile confident predictions plus explicit SDG 4 policy fallbacks."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

DEFAULT_INPUT = Path('model-artifacts/course-sdg-predictions-v5.jsonl')
DEFAULT_OUTPUT = Path('models/course-recommender/sdg-labels.jsonl')


def normalise_url(value):
    try:
        parts = urlsplit(value.strip())
        if parts.scheme.lower() not in ('http', 'https') or not parts.hostname or parts.username or parts.password:
            return None
        return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path.rstrip('/'), '', ''))
    except ValueError:
        return None


def compile_labels(input_path, output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    latest = {}
    with input_path.open('r', encoding='utf-8') as source:
        for line in source:
            try:
                record = json.loads(line)
                url = (record.get('course') or {}).get('url')
                key = normalise_url(url) if isinstance(url, str) else None
                if key:
                    latest[key] = record
            except (ValueError, AttributeError):
                continue

    written = 0
    with output_path.open('w', encoding='utf-8', newline='\n') as target:
        for key, record in latest.items():
            human_validated = record.get('human_validated') is True
            labels = []
            for label in record.get('labels', []):
                if not isinstance(label, dict):
                    continue
                goal = label.get('goal')
                if type(goal) is not int or not 1 <= goal <= 17:
                    continue
                validated = human_validated or label.get('human_validated') is True
                fallback = label.get('label_source') == 'policy_fallback' and goal == 4
                if not validated and not fallback and (
                    record.get('status') != 'predicted' or label.get('confidence') not in ('high', 'medium')
                ):
                    continue
                labels.append({
                    'goal': goal,
                    'confidence': label.get('confidence', 'human_validated' if validated else 'medium'),
                    'label_source': 'human_validated' if validated else ('policy_fallback' if fallback else 'model_predicted'),
                    'human_validated': validated,
                    'reason': str(label.get('reason') or '')[:500],
                    'evidence_field': label.get('evidence_field'),
                    'evidence_quote': str(label.get('evidence_quote') or '')[:500],
                })
            if not labels:
                continue
            target.write(json.dumps({'url': record['course']['url'], 'labels': labels[:3]}, ensure_ascii=False) + '\n')
            written += 1
    return written


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, default=DEFAULT_INPUT, help='Raw predictions from auto_label_course_sdgs.py')
    parser.add_argument('--output', type=Path, default=DEFAULT_OUTPUT, help='Compact labels file used by course_recommender.py')
    args = parser.parse_args()
    count = compile_labels(args.input, args.output)
    print(f'Compiled SDG labels for {count} courses: {args.output}')
    print('Unassigned learning courses keep the SDG 4 policy fallback; it is not marked human-validated.')


if __name__ == '__main__':
    main()
