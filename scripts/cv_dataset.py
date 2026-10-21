"""Validate curated synthetic annotations; never import the application's uploads."""
import hashlib
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from cv_model_contract import normalise, validate_output, validate_pages


def fingerprint(pages):
    return hashlib.sha256(normalise('\n'.join(pages)).encode()).hexdigest()


def load_dataset(path):
    rows, ids, fingerprints = [], set(), set()
    for line in Path(path).read_text(encoding='utf-8').splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        if not isinstance(row.get('id'), str) or not row['id'] or row['id'] in ids:
            raise ValueError('Each annotation needs a unique non-empty id.')
        if row.get('synthetic') is not True or not row.get('provenance'):
            raise ValueError('Only documented synthetic CVs are allowed in this hackathon dataset.')
        validate_pages(row['pages'])
        row['expected'] = validate_output(row['expected'], row['pages'])
        digest = fingerprint(row['pages'])
        if digest in fingerprints:
            raise ValueError('Duplicate CV text in dataset.')
        ids.add(row['id']); fingerprints.add(digest); rows.append(row)
    if not rows:
        raise ValueError('Dataset is empty.')
    return rows


def require_disjoint(train, validation):
    if ({r['id'] for r in train} & {r['id'] for r in validation}
            or {fingerprint(r['pages']) for r in train} & {fingerprint(r['pages']) for r in validation}):
        raise ValueError('Training and validation CVs overlap. Split by person and template family.')
