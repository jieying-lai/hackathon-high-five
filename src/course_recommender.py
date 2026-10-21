"""Portable fitted TF-IDF content recommender; no SDG labels or CV required."""
from collections import Counter
from functools import lru_cache
import hashlib
import json
import math
from pathlib import Path
import re

MODEL_PATH = Path(__file__).resolve().parents[1] / 'models/course-recommender/model.json'
STOP = set('the a an and or for to of in on with is are by from this that your you our course courses learn learning introduction specialization skills will can as at be it into about using through how what have develop gain'.split())
TOPICS = {
    'psychology': 'psychology cognitive cognition behaviour behavior emotions mental wellbeing',
    'money': 'personal finance financial literacy budgeting savings investment money economics',
    'nature': 'ecology biodiversity ecosystems wildlife nature conservation biology',
    'people': 'diversity inclusion equality communication empathy communities sociology',
    'sustainability': 'sustainability sustainable environment climate recycling renewable energy waste',
    'creative': 'creative creativity art design music photography writing',
    'technology': 'technology programming computer software data artificial intelligence',
    'business': 'business entrepreneurship marketing management leadership strategy',
}


def terms(text):
    words = [w for w in re.findall(r'[a-z][a-z0-9]+', str(text).lower()) if w not in STOP and len(w) > 2]
    return words + [a + ' ' + b for a, b in zip(words, words[1:])]


def normalise(vector):
    norm = math.sqrt(sum(v*v for v in vector.values())) or 1
    return {k: v/norm for k, v in vector.items()}


def vectorise(text, idf, cap=None):
    vector = {k: (1 + math.log(n))*idf[k] for k, n in Counter(terms(text)).items() if k in idf}
    if cap:
        vector = dict(sorted(vector.items(), key=lambda kv: (-kv[1], kv[0]))[:cap])
    return normalise(vector)


def dot(a, b):
    if len(a) > len(b):
        a, b = b, a
    return sum(v*b.get(k, 0) for k, v in a.items())


@lru_cache(maxsize=1)
def load_model():
    return json.loads(MODEL_PATH.read_text(encoding='utf-8'))


def string_list(value, limit=200):
    return [s[:200] for s in value[:limit] if isinstance(s, str)] if isinstance(value, list) else []


def recommend(payload, identity):
    model = load_model()
    courses, idf = model['courses'], model['idf']
    by_id = {c['id']: c for c in courses}
    interests = [t for t in string_list(payload.get('interests'), 8) if t in TOPICS]
    query = payload.get('query', '')
    query = query[:500] if isinstance(query, str) else ''
    liked = string_list(payload.get('liked'))
    dislike_order = string_list(payload.get('disliked'), 2000)
    disliked = set(dislike_order)
    excluded = set(string_list(payload.get('exclude'), 2000)) | disliked
    positive = [by_id[k]['vector'] for k in liked if k in by_id and k not in disliked]
    profile = vectorise(' '.join(TOPICS[t] for t in interests) + ' ' + query, idf)
    for vector in positive:
        for term, value in vector.items():
            profile[term] = profile.get(term, 0) + .65*value/max(1, len(positive))
    profile = normalise(profile)
    negative = [by_id[k]['vector'] for k in dislike_order[-40:] if k in by_id]
    try:
        round_number = min(100000, max(0, int(payload.get('round', 0))))
    except (ValueError, TypeError, OverflowError):
        round_number = 0
    if (interests or query.strip()) and not profile:
        return {'ok': True, 'courses': [], 'model': model['kind'], 'catalogue_size': len(courses),
                'feedback_applied': bool(liked or disliked), 'sdg_labelling_enabled': False}
    pool = []
    for course in courses:
        if course['id'] in excluded:
            continue
        similarity = dot(profile, course['vector']) if profile else 0
        if profile and similarity <= .005:
            continue
        penalty = max((dot(course['vector'], v) for v in negative), default=0)
        seed = hashlib.sha256(f'{identity}:{round_number}:{course["id"]}'.encode()).hexdigest()
        jitter = int(seed[:8], 16)/0xffffffff
        # Small aggregate platform prior, never a user-to-course preference label.
        prior = model.get('platform_prior', {}).get(course['provider'].lower(), .5)
        pool.append((similarity - .22*penalty + .015*jitter + .005*prior, course, similarity))
    pool.sort(key=lambda item: (-item[0], item[1]['id']))
    selected = []
    pool = pool[:150]
    while pool and len(selected) < 3:
        def utility(item):
            redundancy = max((dot(item[1]['vector'], c['vector']) for c, _ in selected), default=0)
            return item[0] - .18*redundancy
        best = max(pool, key=utility)
        pool.remove(best)
        selected.append((best[1], best[2]))
    results = []
    for course, _ in selected:
        item = {k: v for k, v in course.items() if k != 'vector'}
        matched = sorted(set(profile) & set(course['vector']), key=lambda k: profile[k]*course['vector'][k], reverse=True)[:4]
        item['reason'] = ('Matches your interests and saved learning: ' + ', '.join(matched) + '.') if matched else 'A topic to explore beyond your current career path.'
        item['sdg'] = ''
        results.append(item)
    return {'ok': True, 'courses': results, 'model': model['kind'], 'catalogue_size': len(courses),
            'feedback_applied': bool(liked or disliked), 'sdg_labelling_enabled': False}
