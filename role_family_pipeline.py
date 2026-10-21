#create a role-family and skill pipeline from LinkedIn job postings and skills data
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

BASE = Path(__file__).resolve().parent
INPUT = BASE / 'data' / 'processed' / 'linkedin_jobs_combined.parquet'
OUT = BASE / 'data' / 'processed'
OUT.mkdir(parents=True, exist_ok=True)
MIN_ROLE_JOBS = 20
MIN_SKILL_JOBS = 5
MIN_SKILL_SHARE = 0.05
MAX_SKILL_LENGTH = 80
MAX_SKILLS_PER_JOB = 100
TOP_SKILLS = 25

ALIASES = {
    'communication skills': 'communication',
    'problemsolving': 'problem solving',
    'problem-solving': 'problem solving',
    'ms excel': 'microsoft excel',
    'excel': 'microsoft excel',
    'ms office': 'microsoft office',
    'microsoft office suite': 'microsoft office',
    'powerbi': 'power bi',
    'python programming': 'python',
    'sql programming': 'sql',
}

# Ordered, conservative role-family rules. Extend after reviewing audit files.
ROLE_RULES = [
    ('data analyst', r'\bdata analyst\b'),
    ('data scientist', r'\bdata scientist\b'),
    ('data engineer', r'\bdata engineer\b'),
    ('business analyst', r'\bbusiness analyst\b'),
    ('software engineer', r'\bsoftware (?:engineer|developer)\b'),
    ('web developer', r'\b(?:web developer|frontend developer|front end developer|backend developer|back end developer|full stack developer)\b'),
    ('machine learning engineer', r'\bmachine learning engineer\b'),
    ('cybersecurity analyst', r'\b(?:cybersecurity analyst|cyber security analyst|security operations analyst)\b'),
    ('network engineer', r'\bnetwork engineer\b'),
    ('systems administrator', r'\b(?:systems? administrator|sysadmin)\b'),
    ('accountant', r'\baccountant\b'),
    ('financial analyst', r'\bfinancial analyst\b'),
    ('auditor', r'\bauditor\b'),
    ('tax professional', r'\b(?:tax professional|tax preparer)\b'),
    ('marketing specialist', r'\b(?:marketing specialist|digital marketing specialist)\b'),
    ('marketing manager', r'\bmarketing manager\b'),
    ('sales representative', r'\b(?:sales representative|sales associate)\b'),
    ('account executive', r'\baccount executive\b'),
    ('customer service representative', r'\bcustomer service representative\b'),
    ('human resources specialist', r'\b(?:human resources specialist|hr specialist)\b'),
    ('recruiter', r'\b(?:recruiter|talent acquisition specialist)\b'),
    ('project manager', r'\bproject manager\b'),
    ('product manager', r'\bproduct manager\b'),
    ('operations manager', r'\boperations manager\b'),
    ('supply chain analyst', r'\bsupply chain analyst\b'),
    ('logistics coordinator', r'\blogistics coordinator\b'),
    ('warehouse associate', r'\bwarehouse associate\b'),
    ('registered nurse', r'\b(?:registered nurse|\brn\b)\b'),
    ('nurse practitioner', r'\bnurse practitioner\b'),
    ('medical assistant', r'\bmedical assistant\b'),
    ('pharmacist', r'\bpharmacist\b'),
    ('physical therapist', r'\bphysical therapist\b'),
    ('teacher', r'\bteacher\b'),
    ('administrative assistant', r'\badministrative assistant\b'),
    ('executive assistant', r'\bexecutive assistant\b'),
    ('graphic designer', r'\bgraphic designer\b'),
    ('ux designer', r'\b(?:ux designer|user experience designer)\b'),
    ('mechanical engineer', r'\bmechanical engineer\b'),
    ('electrical engineer', r'\belectrical engineer\b'),
    ('civil engineer', r'\bcivil engineer\b'),
    ('quality assurance analyst', r'\b(?:quality assurance analyst|qa analyst)\b'),
    ('restaurant manager', r'\brestaurant manager\b'),
    ('store manager', r'\bstore manager\b'),
]
COMPILED_RULES = [(name, re.compile(pattern)) for name, pattern in ROLE_RULES]
SENIORITY = re.compile(r'\b(?:junior|jr|senior|sr|lead|principal|staff|associate|entry level|entry-level|intern|internship|graduate|trainee|i|ii|iii|iv|v)\b', re.I)
SPACES = re.compile(r'\s+')
BAD_SKILL = re.compile(r'(?:https?://|www\.|@|\b(?:equal opportunity employer|apply now|job description|benefits package|salary range|high school diploma|bachelor.s degree|master.s degree)\b)', re.I)


def clean_title(value: object) -> str:
    if pd.isna(value):
        return ''
    s = str(value).casefold().replace('&', ' and ')
    s = re.sub(r'[^\w\s+#./-]', ' ', s)
    s = re.sub(r'[_/.-]+', ' ', s)
    return SPACES.sub(' ', s).strip()


def family_for_title(title: str) -> tuple[str, str]:
    matches = [name for name, rx in COMPILED_RULES if rx.search(title)]
    if len(matches) == 1:
        return matches[0], 'rule'
    if len(matches) > 1:
        return '', 'ambiguous'
    # Fallback is deliberately exact normalized title, not a fabricated occupation family.
    return title, 'exact_title_fallback' if title else 'missing'


def clean_skill(value: str) -> str:
    s = SPACES.sub(' ', value.casefold().strip())
    s = s.strip(' .;:-')
    return ALIASES.get(s, s)


def valid_skill(s: str) -> bool:
    return bool(s) and len(s) <= MAX_SKILL_LENGTH and bool(re.search(r'[a-zA-Z]', s)) and not BAD_SKILL.search(s)


def main() -> None:
    if not INPUT.exists():
        raise FileNotFoundError(f'Cannot find {INPUT}')
    print('Loading job_link, job_title, job_skills...')
    df = pd.read_parquet(INPUT, columns=['job_link', 'job_title', 'job_skills'])
    if df['job_link'].isna().any() or df['job_link'].duplicated().any():
        raise ValueError('job_link must be unique and non-null')

    df['normalized_title'] = df['job_title'].map(clean_title)
    title_counts = df['normalized_title'].value_counts(dropna=False)
    print(f'Postings: {len(df):,} | Normalized titles: {len(title_counts):,}')
    # Compute role classification only once per unique title.
    role_lookup = {t: family_for_title(t) for t in title_counts.index}
    df['role_family'] = df['normalized_title'].map(lambda t: role_lookup[t][0])
    df['mapping_method'] = df['normalized_title'].map(lambda t: role_lookup[t][1])
    df['seniority_mentioned'] = df['normalized_title'].map(lambda t: bool(SENIORITY.search(t)))

    role_postings = Counter()
    skill_postings = Counter()
    stats = Counter()
    suspicious = Counter()
    examples = defaultdict(list)
    print('Aggregating job-to-skill pairs (this may take several minutes)...')
    for i, row in enumerate(df.itertuples(index=False), 1):
        if i % 200000 == 0:
            print(f'  Processed {i:,}/{len(df):,}')
        role = row.role_family
        if not role or row.mapping_method == 'ambiguous':
            stats['ambiguous_or_missing_role'] += 1
            continue
        if pd.isna(row.job_skills) or not str(row.job_skills).strip():
            stats['missing_skills'] += 1
            continue
        pieces = str(row.job_skills).split(',')
        if len(pieces) > MAX_SKILLS_PER_JOB:
            stats['too_many_skill_segments'] += 1
            continue
        cleaned = set()
        for raw in pieces:
            skill = clean_skill(raw)
            if valid_skill(skill):
                cleaned.add(skill)
            elif skill:
                stats['rejected_skill_mentions'] += 1
                suspicious[skill] += 1
        if not cleaned:
            stats['no_usable_skills'] += 1
            continue
        role_postings[role] += 1
        for skill in cleaned:
            skill_postings[(role, skill)] += 1
        if len(examples[role]) < 3 and row.normalized_title not in examples[role]:
            examples[role].append(row.normalized_title)

    role_rows = []
    for role, n in role_postings.items():
        role_rows.append({'role_family': role, 'usable_job_postings': n,
                          'eligible_for_recommendations': n >= MIN_ROLE_JOBS,
                          'sample_titles': ' | '.join(examples[role])})
    roles = pd.DataFrame(role_rows).sort_values('usable_job_postings', ascending=False)
    roles.to_parquet(OUT / 'linkedin_role_family_summary.parquet', index=False)
    roles.head(300).to_csv(OUT / 'linkedin_role_family_review.csv', index=False)

    pair_rows = []
    for (role, skill), count in skill_postings.items():
        n = role_postings[role]
        share = count / n
        pair_rows.append({'role_family': role, 'skill': skill, 'job_count': count,
                          'role_job_count': n, 'skill_frequency_percentage': round(100 * share, 2),
                          'passes_threshold': n >= MIN_ROLE_JOBS and count >= MIN_SKILL_JOBS and share >= MIN_SKILL_SHARE})
    pairs = pd.DataFrame(pair_rows)
    pairs.sort_values(['role_family', 'job_count', 'skill'], ascending=[True, False, True], inplace=True)
    pairs.to_parquet(OUT / 'linkedin_role_skill_all.parquet', index=False)
    reliable = pairs.loc[pairs['passes_threshold']].copy()
    reliable.to_parquet(OUT / 'linkedin_role_skill_filtered.parquet', index=False)

    # Export candidate JSON only; never overwrite verified future_roles.json.
    json_roles = []
    for role, group in reliable.groupby('role_family', sort=True):
        n = int(role_postings[role])
        json_roles.append({
            'role_id': 'linkedin_' + re.sub(r'[^a-z0-9]+', '_', role).strip('_'),
            'role_title': role.title(),
            'role_family': role,
            'job_posting_sample_size': n,
            'required_skills': [
                {'skill': r.skill, 'job_count': int(r.job_count),
                 'frequency_pct': float(r.skill_frequency_percentage)}
                for r in group.head(TOP_SKILLS).itertuples(index=False)
            ],
            'source': {'name': 'LinkedIn Jobs & Skills (2024)',
                       'basis': 'historical job-posting sample',
                       'date_note': 'first_seen observed between 2024-01-12 and 2024-01-17'},
            'status': 'candidate_requires_review',
        })
    json_path = OUT / 'future_roles_candidates.json'
    json_path.write_text(json.dumps(json_roles, ensure_ascii=False, indent=2), encoding='utf-8')

    audit = (df.groupby('mapping_method', dropna=False).size()
             .rename('job_postings').reset_index().sort_values('job_postings', ascending=False))
    audit.to_csv(OUT / 'linkedin_role_mapping_methods.csv', index=False)
    pd.DataFrame(suspicious.most_common(200), columns=['rejected_skill', 'mentions']).to_csv(
        OUT / 'linkedin_rejected_skill_samples.csv', index=False)

    print('\n' + '=' * 62)
    print('CROSS-INDUSTRY ROLE & SKILL PIPELINE SUMMARY')
    print('=' * 62)
    print(f'Original postings: {len(df):,}')
    print(f'Role families / fallback titles with usable skills: {len(role_postings):,}')
    print(f'Role-skill pairs (unfiltered): {len(pairs):,}')
    print(f'Role-skill pairs (filtered): {len(reliable):,}')
    print(f'JSON candidate roles: {len(json_roles):,}')
    print('\nMapping method distribution:')
    print(audit.to_string(index=False))
    print('\nSkill quality audit:')
    for k, v in stats.most_common():
        print(f'  {k}: {v:,}')
    print('\nTop 15 roles by usable job postings:')
    print(roles.head(15).to_string(index=False))
    da = reliable.loc[reliable['role_family'] == 'data analyst'].head(10)
    print('\nData Analyst top 10 filtered skills:')
    print(da.to_string(index=False) if not da.empty else 'No eligible records')
    print('\nFiles saved in:', OUT)
    print('IMPORTANT: Candidate JSON is NOT verified future_roles.json.')
    print('COMPLETED!')


if __name__ == '__main__':
    main()
