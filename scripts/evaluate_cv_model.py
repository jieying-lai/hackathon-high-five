"""Generate or score predictions on independent synthetic CVs. No invented accuracy."""
import argparse
import json
from pathlib import Path
import sys
from cv_dataset import fingerprint, load_dataset
from cv_model_contract import CONTRACT_VERSION, normalise, validate_output


def facts(draft):
    found = {(key, normalise(value['value']), value['page'])
             for key, value in draft['fields'].items() if value}
    found.update((key, normalise(item['text']), item['page'])
                 for key, items in draft['sections'].items() for item in items)
    return found


def score(rows, predictions):
    valid = matches = predicted = expected = 0
    for row in rows:
        gold = facts(row['expected'])
        expected += len(gold)
        try:
            draft = validate_output(predictions[row['id']]['draft'], row['pages'])
        except (ValueError, TypeError, KeyError):
            continue
        valid += 1
        actual = facts(draft)
        matches += len(gold & actual)
        predicted += len(actual)
    precision = matches / predicted if predicted else 0
    recall = matches / expected if expected else 0
    schema_rate = valid / len(rows)
    passed = len(rows) >= 50 and schema_rate == 1 and precision >= .98 and recall >= .90
    return {'contract': CONTRACT_VERSION, 'examples': len(rows), 'valid_evidence_schema_rate': schema_rate,
        'exact_annotation_precision': precision, 'exact_annotation_recall': recall,
        'automated_gate_passed': passed, 'release_approved': False,
        'note': 'Exact annotation agreement is strict, not semantic accuracy. Human review of omissions, negations, sensitive fields and layout/language slices is required.'}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', required=True)
    parser.add_argument('--predictions', required=True)
    parser.add_argument('--report', required=True)
    parser.add_argument('--generate', action='store_true', help='Run actual GPU inference; consumes resources on a paid Pod')
    parser.add_argument('--training-manifest', help='Required for a fine-tuned adapter evaluation')
    args = parser.parse_args()
    rows = load_dataset(args.dataset)
    if args.training_manifest:
        manifest = json.loads(Path(args.training_manifest).read_text())
        if any(r['id'] in manifest['seen_ids'] or fingerprint(r['pages']) in manifest['seen_fingerprints'] for r in rows):
            raise ValueError('Evaluation leaks training/validation examples. Use an independent test set.')
    if args.generate:
        import os
        if os.environ.get('CV_ADAPTER_PATH') and not args.training_manifest:
            raise ValueError('Supply the training manifest when evaluating an adapter.')
        sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'runpod'))
        from cv_worker import generate
        with Path(args.predictions).open('x', encoding='utf-8') as stream:
            for row in rows:
                try:
                    result = generate(row['pages'])
                except Exception:
                    result = {'error': 'Inference or evidence validation failed'}
                stream.write(json.dumps({'id': row['id'], **result}, ensure_ascii=False) + '\n')
    predictions = {}
    for line in Path(args.predictions).read_text(encoding='utf-8').splitlines():
        item = json.loads(line)
        if item['id'] in predictions:
            raise ValueError('Duplicate prediction id.')
        predictions[item['id']] = item
    report = score(rows, predictions)
    Path(args.report).write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
