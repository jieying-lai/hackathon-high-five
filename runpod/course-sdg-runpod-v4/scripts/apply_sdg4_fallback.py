"""Add an explicitly marked SDG 4 platform fallback to unassigned course rows."""
import argparse
import json
from pathlib import Path


def baseline(course):
    return {
        'goal': 4,
        'label': 'SDG 4',
        'confidence': 'baseline',
        'evidence_field': 'title',
        'evidence_quote': str(course.get('title') or '')[:500],
        'reason': ('Platform fallback for a structured learning course. This is not a model conclusion '
                   'that the course directly advances a specific SDG 4 indicator.'),
        'label_source': 'policy_fallback',
        'human_validated': False,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    rows = kept = added = 0
    with args.input.open(encoding='utf-8') as src, args.output.open('w', encoding='utf-8', newline='\n') as dst:
        for line in src:
            try:
                record = json.loads(line)
            except ValueError:
                continue
            rows += 1
            course = record.get('course') or {}
            labels = record.get('labels') or []
            record_added = False
            has_supported = any(isinstance(label, dict) and label.get('confidence') in ('high', 'medium')
                                and label.get('label_source') != 'policy_fallback' for label in labels)
            if not has_supported:
                labels = [label for label in labels if isinstance(label, dict)]
                if not any(label.get('label_source') == 'policy_fallback' for label in labels):
                    labels.append(baseline(course))
                    added += 1
                    record_added = True
                record['labels'] = labels
                if record.get('status') == 'generation_error':
                    record['status'] = 'fallback_generation_error'
                elif record.get('status') != 'needs_review':
                    record['status'] = 'fallback'
            if record_added:
                record['label_source'] = 'model_predicted_with_policy_fallback'
            record['human_validated'] = False
            record['fallback_policy'] = 'SDG 4 platform baseline; not a course-specific SDG conclusion'
            dst.write(json.dumps(record, ensure_ascii=False) + '\n')
            kept += 1
    print(f'Rows written: {kept}; SDG 4 policy fallbacks added: {added}; input rows: {rows}')
    print(f'Output: {args.output}')


if __name__ == '__main__':
    main()
