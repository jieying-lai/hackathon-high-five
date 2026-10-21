#build a conservative skill-to-course matching table for review and verification
from pathlib import Path
from collections import defaultdict
import ast
import json
import re
from urllib.parse import urlparse
import pandas as pd

ROOT = Path(__file__).resolve().parent
PARQUET = ROOT / 'data' / 'parquet'
V2 = ROOT / 'data' / 'processed' / 'v2'
OUT = ROOT / 'data' / 'processed' / 'course_matching'
OUT.mkdir(parents=True, exist_ok=True)

ROLE_FILE = V2 / 'role_skill_filtered_v2.parquet'
COURSE_FILES = {'Coursera': PARQUET / 'Coursera.parquet', 'edX': PARQUET / 'edx.parquet'}
TOP_MATCHES_PER_ROLE = 15
MIN_MATCHED_SKILLS = 1

# Conservative, reviewable aliases only. Avoid collapsing broader/narrower skills.
ALIASES = {
    'communication skills': 'communication',
    'problem-solving': 'problem solving',
    'problemsolving': 'problem solving',
    'ms excel': 'microsoft excel',
    'excel': 'microsoft excel',
    'microsoft excel spreadsheet': 'microsoft excel',
    'microsoft office suite': 'microsoft office',
    'ms office': 'microsoft office',
    'powerbi': 'power bi',
    'python programming': 'python',
    'sql programming': 'sql',
}


def normalize_skill(value):
    s = str(value).casefold().strip()
    s = re.sub(r'\s+', ' ', s).strip(' .;:-')
    return ALIASES.get(s, s)


def split_skills(value):
    """Parse common comma/semicolon-separated or literal list formats.

    This is a heuristic: review long/unmatched strings before production.
    """
    if value is None:
        return []
    if isinstance(value, (list, tuple, set)):
        items = list(value)
    else:
        if pd.isna(value):
            return []
        raw = str(value).strip()
        if not raw:
            return []
        if raw.startswith('[') and raw.endswith(']'):
            try:
                parsed = ast.literal_eval(raw)
                items = list(parsed) if isinstance(parsed, (list, tuple, set)) else [raw]
            except (ValueError, SyntaxError):
                items = re.split(r'[,;]', raw)
        else:
            items = re.split(r'[,;]', raw)
    return sorted({s for item in items if (s := normalize_skill(item)) and len(s) <= 80})


def clean_text(value):
    if value is None or pd.isna(value):
        return ''
    return re.sub(r'\s+', ' ', str(value)).strip()


def valid_url(value):
    if not value:
        return False
    p = urlparse(value)
    return p.scheme in ('http', 'https') and bool(p.netloc)


def load_courses():
    records = []
    for provider, path in COURSE_FILES.items():
        if not path.exists():
            print(f'[WARNING] Missing {provider} file: {path}')
            continue
        df = pd.read_parquet(path)
        df.columns = [str(c).strip().lower() for c in df.columns]
        print(f'{provider}: {len(df):,} raw rows; columns={list(df.columns)}')
        title_col = 'course' if provider == 'Coursera' else 'title'
        skills_col = 'skills' if provider == 'Coursera' else 'associatedskills'
        if title_col not in df or skills_col not in df:
            print(f'[WARNING] Skipping {provider}: required columns absent')
            continue
        for rownum, row in enumerate(df.to_dict('records'), 1):
            title = clean_text(row.get(title_col))
            if not title:
                continue
            skills = split_skills(row.get(skills_col))
            if not skills:
                continue
            url = clean_text(row.get('link')) if provider == 'edX' else ''
            url_syntax_ok = valid_url(url)
            # Deduplication is performed below by provider/title/URL, not by skill alone.
            records.append({
                'provider': provider,
                'course_title': title,
                'institution': clean_text(row.get('institution') if provider == 'edX' else row.get('partner')),
                'level': clean_text(row.get('level')),
                'duration': clean_text(row.get('duration')),
                'rating': clean_text(row.get('rating')),
                'course_url': url if url_syntax_ok else '',
                'url_syntax_valid': url_syntax_ok,
                'url_verified': False,  # Must be checked against the actual course page later.
                'skills_taught_or_associated': skills,
                'source_dataset': path.name,
                'source_row': rownum,
            })
    # Merge duplicates with same provider + normalized title + URL; retain skill union.
    dedup = {}
    for r in records:
        key = (r['provider'].casefold(), r['course_title'].casefold(), r['course_url'])
        if key not in dedup:
            dedup[key] = r
        else:
            existing = dedup[key]
            existing['skills_taught_or_associated'] = sorted(set(existing['skills_taught_or_associated']) | set(r['skills_taught_or_associated']))
    result = list(dedup.values())
    for idx, r in enumerate(result, 1):
        r['course_id'] = f'candidate_course_{idx:05d}'
        r['verification_status'] = 'unverified_candidate'
    return result


def main():
    if not ROLE_FILE.exists():
        raise FileNotFoundError(f'Missing {ROLE_FILE}. Run role_classification_v2.py first.')
    roles = pd.read_parquet(ROLE_FILE)
    needed = {'role_family', 'specialization', 'skill', 'job_count', 'role_job_count', 'skill_frequency_percentage'}
    missing = needed - set(roles.columns)
    if missing:
        raise ValueError(f'Missing columns in V2 role skills: {sorted(missing)}')
    roles = roles.dropna(subset=['role_family', 'skill']).copy()
    roles['canonical_skill'] = roles['skill'].map(normalize_skill)
    # Consolidate alias collisions so the same canonical skill is not double-counted.
    roles = (roles.sort_values('job_count', ascending=False)
             .drop_duplicates(['role_family', 'specialization', 'canonical_skill']))
    courses = load_courses()
    if not courses:
        raise RuntimeError('No usable course rows found. Check Coursera/edX parquet paths and columns.')

    next_course = {c['course_id']: c for c in courses}
    skill_to_courses = defaultdict(list)
    for course in courses:
        for skill in course['skills_taught_or_associated']:
            skill_to_courses[skill].append(course)

    matched = []
    unmatched_skills = defaultdict(lambda: {'roles': 0, 'total_job_mentions': 0})
    role_skill_sets = defaultdict(list)
    for r in roles.itertuples(index=False):
        key = (str(r.role_family), str(r.specialization))
        role_skill_sets[key].append(r)
        if r.canonical_skill not in skill_to_courses:
            unmatched_skills[r.canonical_skill]['roles'] += 1
            unmatched_skills[r.canonical_skill]['total_job_mentions'] += int(r.job_count)

    for (family, specialization), rows in role_skill_sets.items():
        course_scores = defaultdict(lambda: {'skills': set(), 'weighted_score': 0.0})
        for r in rows:
            for course in skill_to_courses.get(r.canonical_skill, []):
                entry = course_scores[course['course_id']]
                if r.canonical_skill not in entry['skills']:
                    entry['skills'].add(r.canonical_skill)
                    entry['weighted_score'] += float(r.skill_frequency_percentage)
        for course_id, stats in course_scores.items():
            if len(stats['skills']) < MIN_MATCHED_SKILLS:
                continue
            course = next_course[course_id]
            matched.append({
                'role_family': family,
                'specialization': specialization,
                'course_id': course_id,
                'course_title': course['course_title'],
                'provider': course['provider'],
                'matched_skills': ', '.join(sorted(stats['skills'])),
                'matched_skill_count': len(stats['skills']),
                'matching_score': round(stats['weighted_score'], 2),
                'course_url': course['course_url'],
                'url_syntax_valid': course['url_syntax_valid'],
                'url_verified': False,
            })

    matches_df = pd.DataFrame(matched, columns=[
        'role_family', 'specialization', 'course_id', 'course_title', 'provider',
        'matched_skills', 'matched_skill_count', 'matching_score',
        'course_url', 'url_syntax_valid', 'url_verified'
    ])
    if not matches_df.empty:
        matches_df.sort_values(['role_family', 'specialization', 'matching_score', 'matched_skill_count'],
                               ascending=[True, True, False, False], inplace=True)
        matches_df['rank_within_role'] = matches_df.groupby(['role_family', 'specialization']).cumcount() + 1
    else:
        matches_df['rank_within_role'] = pd.Series(dtype='int64')
    matches_df.to_parquet(OUT / 'role_course_matches_all.parquet', index=False)
    top = matches_df[matches_df['rank_within_role'] <= TOP_MATCHES_PER_ROLE].copy()
    top.to_csv(OUT / 'role_course_matches_top15_review.csv', index=False, encoding='utf-8-sig')

    course_df = pd.DataFrame([{**c, 'skills_taught_or_associated': ', '.join(c['skills_taught_or_associated'])} for c in courses])
    course_df.to_csv(OUT / 'course_candidates_review.csv', index=False, encoding='utf-8-sig')
    (OUT / 'course_candidates_unverified.json').write_text(
        json.dumps(courses, ensure_ascii=False, indent=2), encoding='utf-8')
    missing_df = pd.DataFrame([
        {'skill': skill, **data} for skill, data in unmatched_skills.items()
    ]).sort_values('total_job_mentions', ascending=False)
    missing_df.to_csv(OUT / 'unmatched_job_skills.csv', index=False, encoding='utf-8-sig')

    job_vocab = set(roles['canonical_skill'])
    course_vocab = set(skill_to_courses)
    vocab = pd.DataFrame([
        {'skill': s, 'in_job_data': s in job_vocab, 'in_course_data': s in course_vocab,
         'shared_between_sources': s in job_vocab and s in course_vocab}
        for s in sorted(job_vocab | course_vocab)
    ])
    vocab.to_csv(OUT / 'unified_skill_vocabulary.csv', index=False, encoding='utf-8-sig')

    print('\n' + '=' * 68)
    print('CAREERLENS AI — SKILL-TO-COURSE MATCHING SUMMARY')
    print('=' * 68)
    print(f'Filtered V2 role-skill rows: {len(roles):,}')
    print(f'Role-specialization groups: {len(role_skill_sets):,}')
    print(f'Course candidates with skills: {len(courses):,}')
    print(f'Course candidates with syntactically valid URLs: {sum(c["url_syntax_valid"] for c in courses):,}')
    print(f'Verified URLs: 0 (not checked online)')
    print(f'Unique job skills: {len(job_vocab):,}')
    print(f'Unique course skills: {len(course_vocab):,}')
    print(f'Exact/alias shared skills: {len(job_vocab & course_vocab):,}')
    print(f'Role-course matches: {len(matches_df):,}')
    print(f'Roles with at least one course match: {matches_df[["role_family", "specialization"]].drop_duplicates().shape[0]:,}')
    print('\nSample matches for Data Analyst:')
    sample = top[top['role_family'] == 'data analyst'].head(10)
    if sample.empty:
        print('No matches found.')
    else:
        print(sample[['specialization', 'course_title', 'provider', 'matched_skills', 'matching_score', 'url_syntax_valid']].to_string(index=False))
    print('\nTop 15 unmatched job skills:')
    print(missing_df.head(15).to_string(index=False))
    print(f'\nSaved outputs to: {OUT}')
    print('Final future_roles.json and verified_courses.json were NOT changed.')
    print('COMPLETED!')


if __name__ == '__main__':
    # Built once for efficient lookup during matching.
    # Populated in main immediately after loading courses.
    main()
