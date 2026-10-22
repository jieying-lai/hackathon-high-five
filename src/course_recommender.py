"""Portable fitted TF-IDF recommender with SDG labels and a learning-support fallback."""
from collections import Counter
from functools import lru_cache
import hashlib
import heapq
import json
import math
from pathlib import Path
import re
from urllib.parse import urlsplit, urlunsplit

MODEL_PATH = Path(__file__).resolve().parents[1] / 'models/course-recommender/model.json'
MODEL_META_PATH = Path(__file__).resolve().parents[1] / 'models/course-recommender/model-meta.json'
COURSES_PATH = Path(__file__).resolve().parents[1] / 'models/course-recommender/courses.jsonl'
SDG_LABELS_PATH = Path(__file__).resolve().parents[1] / 'models/course-recommender/sdg-labels.jsonl'
RECOMMENDATION_BATCH_SIZE = 10
SDG_GOALS = {
    1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health and Well-Being',
    4: 'Quality Education', 5: 'Gender Equality', 6: 'Clean Water and Sanitation',
    7: 'Affordable and Clean Energy', 8: 'Decent Work and Economic Growth',
    9: 'Industry, Innovation and Infrastructure', 10: 'Reduced Inequalities',
    11: 'Sustainable Cities and Communities', 12: 'Responsible Consumption and Production',
    13: 'Climate Action', 14: 'Life Below Water', 15: 'Life on Land',
    16: 'Peace, Justice and Strong Institutions', 17: 'Partnerships for the Goals',
}
SDG4_FALLBACK = {
    'goal': 4, 'code': 'SDG 4', 'name': SDG_GOALS[4], 'alignment_type': 'learning_support',
    'confidence': 'fallback', 'label_source': 'platform_rule', 'human_validated': False,
    'reason': 'This course supports learning and lifelong education. This is a general learning contribution, not a topic-specific impact claim.',
}
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
    'health': 'health wellness wellbeing nutrition public health mental health mindfulness medical',
    'languages': 'language languages communication speaking writing literacy translation linguistics',
    'science': 'science physics chemistry astronomy space biology research experiment',
    'food': 'food cooking culinary cuisine baking recipes kitchen nutrition',
    'sports': 'sports fitness exercise athletics yoga movement training physical activity',
    'travel': 'travel culture geography tourism countries intercultural heritage customs',
    'history': 'history philosophy ethics civilization ancient society critical thinking',
    'animals': 'animals wildlife pets zoology veterinary nature conservation',
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
    # Keep only the vocabulary and small aggregate priors resident. Course rows
    # live in JSONL and are streamed per request to avoid expanding the entire
    # catalogue into Python dictionaries.
    if MODEL_META_PATH.exists():
        return json.loads(MODEL_META_PATH.read_text(encoding='utf-8'))
    # Backwards compatibility for older model bundles.
    return json.loads(MODEL_PATH.read_text(encoding='utf-8'))


def iter_courses(model):
    if COURSES_PATH.exists():
        with COURSES_PATH.open('r', encoding='utf-8') as source:
            for line in source:
                if line.strip():
                    yield json.loads(line)
        return
    yield from model.get('courses', [])


def normalise_course_url(value):
    try:
        parts = urlsplit(str(value or '').strip())
        if parts.scheme.lower() not in ('http', 'https') or not parts.hostname or parts.username or parts.password:
            return None
        return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path.rstrip('/'), '', ''))
    except ValueError:
        return None


@lru_cache(maxsize=1)
def load_sdg_predictions():
    """Load only compact URL-to-label records; course text stays out of RAM."""
    labels_by_url = {}
    if not SDG_LABELS_PATH.exists():
        return labels_by_url
    with SDG_LABELS_PATH.open('r', encoding='utf-8') as source:
        for line in source:
            try:
                record = json.loads(line)
                course_url = normalise_course_url(record.get('url') or (record.get('course') or {}).get('url'))
                if not course_url or not isinstance(record.get('labels'), list):
                    continue
                labels = []
                for label in record['labels']:
                    goal = label.get('goal') if isinstance(label, dict) else None
                    confidence = label.get('confidence') if isinstance(label, dict) else None
                    if type(goal) is not int or goal not in SDG_GOALS:
                        continue
                    human_validated = label.get('human_validated') is True or record.get('human_validated') is True
                    if not human_validated and confidence not in ('high', 'medium'):
                        continue
                    labels.append({
                        'goal': goal, 'code': f'SDG {goal}', 'name': SDG_GOALS[goal],
                        'alignment_type': 'course_topic', 'confidence': confidence or 'human_validated',
                        'label_source': 'human_validated' if human_validated else 'model_predicted',
                        'human_validated': human_validated,
                        'reason': str(label.get('reason') or '')[:500],
                        'evidence_field': label.get('evidence_field'),
                        'evidence_quote': str(label.get('evidence_quote') or '')[:500],
                    })
                if labels:
                    labels_by_url[course_url] = labels[:3]
            except (ValueError, TypeError, AttributeError):
                continue
    return labels_by_url


def course_sdg_labels(course):
    url = normalise_course_url(course.get('url'))
    labels = load_sdg_predictions().get(url, []) if url else []
    return labels or [dict(SDG4_FALLBACK)]


def string_list(value, limit=200):
    return [s[:200] for s in value[:limit] if isinstance(s, str)] if isinstance(value, list) else []


def recommend(payload, identity):
    model = load_model()
    idf = model['idf']
    interests = [t for t in string_list(payload.get('interests'), len(TOPICS)) if t in TOPICS]
    query = payload.get('query', '')
    query = query[:500] if isinstance(query, str) else ''
    liked = string_list(payload.get('liked'))
    dislike_order = string_list(payload.get('disliked'), 2000)
    disliked = set(dislike_order)
    excluded = set(string_list(payload.get('exclude'), 2000)) | disliked
    positive_ids = {k for k in liked if k not in disliked}
    negative_ids = set(dislike_order[-40:])
    positive, negative = [], []
    if positive_ids or negative_ids:
        for course in iter_courses(model):
            course_id = course['id']
            if course_id in positive_ids:
                positive.append(course['vector'])
            if course_id in negative_ids:
                negative.append(course['vector'])
    try:
        batch_size = min(RECOMMENDATION_BATCH_SIZE, max(1, int(payload.get('limit', RECOMMENDATION_BATCH_SIZE))))
    except (ValueError, TypeError, OverflowError):
        batch_size = RECOMMENDATION_BATCH_SIZE
    profile = vectorise(' '.join(TOPICS[t] for t in interests) + ' ' + query, idf)
    for vector in positive:
        for term, value in vector.items():
            profile[term] = profile.get(term, 0) + .65*value/max(1, len(positive))
    profile = normalise(profile)
    try:
        round_number = min(100000, max(0, int(payload.get('round', 0))))
    except (ValueError, TypeError, OverflowError):
        round_number = 0
    if (interests or query.strip()) and not profile:
        return {'ok': True, 'courses': [], 'model': model['kind'], 'catalogue_size': model.get('course_count', len(model.get('courses', []))),
                'feedback_applied': bool(liked or disliked), 'sdg_labelling_enabled': True}
    def scored_courses():
        for course in iter_courses(model):
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
            yield (similarity - .22*penalty + .015*jitter + .005*prior, course, similarity)
    pool = heapq.nsmallest(batch_size, scored_courses(), key=lambda item: (-item[0], item[1]['id']))
    selected = []
    while pool and len(selected) < batch_size:
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
        item['sdgs'] = course_sdg_labels(item)
        item['sdg'] = ', '.join(label['code'] for label in item['sdgs'])
        results.append(item)
    return {'ok': True, 'courses': results, 'model': model['kind'], 'catalogue_size': model.get('course_count', len(model.get('courses', []))),
            'feedback_applied': bool(liked or disliked), 'sdg_labelling_enabled': True}
