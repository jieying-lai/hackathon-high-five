"""Build Job -> full role skills -> matched courses and URLs.
Run from repository root: python build_full_job_skill_courses.py
Requires: pip install pandas pyarrow
"""
from pathlib import Path
from collections import defaultdict
import json
import re
import pandas as pd

ROOT = Path(__file__).resolve().parent
ROLE_FILE = ROOT / 'data/processed/v2/role_skill_filtered_v2.parquet'
COURSE_FILE = ROOT / 'course_recommendations.json'
OUTPUT = ROOT / 'job_role_skills_courses.json'

ALIASES = {
    '25b information technology specialist': 'IT Specialist',
    '15q air traffic control operator': 'Air Traffic Control Operator',
    '35f intelligence analyst': 'Intelligence Analyst',
    '35g imagery analyst': 'Imagery Analyst',
    '35n signals intelligence analyst': 'Signals Intelligence Analyst',
    '35p cryptologic linguist': 'Cryptologic Linguist',
    '88n transportation management coordinator': 'Transportation Management Coordinator',
    '89b ammunition specialist': 'Ammunition Specialist',
}
ACRONYMS = {'it':'IT','ai':'AI','ml':'ML','hr':'HR','sql':'SQL','ui':'UI','ux':'UX','qa':'QA','api':'API','aws':'AWS'}
SKILL_ALIASES = {'excel':'microsoft excel','ms excel':'microsoft excel','python programming':'python',
                 'sql programming':'sql','communication skills':'communication','problem-solving':'problem solving'}

def normalized_skill(value):
    s = re.sub(r'\s+', ' ', str(value)).strip().casefold()
    return SKILL_ALIASES.get(s, s)

def title_case(value):
    return ' '.join(ACRONYMS.get(w.casefold(), w.capitalize()) for w in str(value).split())

def clean_title(raw):
    raw = re.sub(r'\s+', ' ', str(raw)).strip()
    if raw.casefold() in ALIASES:
        return ALIASES[raw.casefold()]
    raw = re.sub(r'^\d{4}\s+', '', raw)
    raw = re.sub(r'^\d+[a-z]\s+', '', raw, flags=re.I)
    raw = re.sub(r'^\d+(?:st|nd|rd|th)(?:\s+\d+(?:st|nd|rd|th))?\s+shift\s+', '', raw, flags=re.I)
    return title_case(raw)

def clean_number(value):
    if pd.isna(value): return None
    return float(value)

def main():
    if not ROLE_FILE.exists():
        raise FileNotFoundError(f'Missing Role–Skill data: {ROLE_FILE}\nRun role_classification_v2.py first, or put the generated parquet at this path.')
    if not COURSE_FILE.exists():
        raise FileNotFoundError(f'Missing course JSON: {COURSE_FILE}')
    roles = pd.read_parquet(ROLE_FILE)
    required = {'role_family','specialization','skill','job_count','role_job_count','skill_frequency_percentage'}
    if required - set(roles.columns):
        raise ValueError(f'Role–Skill file missing columns: {sorted(required-set(roles.columns))}')
    with COURSE_FILE.open(encoding='utf-8') as f:
        source = json.load(f)
    courses = defaultdict(dict)
    for rec in source['recommendations']:
        key = (str(rec['role_family']).strip().casefold(), str(rec.get('specialization') or 'Unspecified').strip().casefold())
        for skill in rec.get('supported_matched_skills', []):
            skey = normalized_skill(skill)
            cid = rec.get('course_id') or rec.get('course_url')
            if not cid or not skey: continue
            courses[(key, skey)][cid] = {
                'course_title': rec['course_title'], 'provider': rec.get('provider'),
                'course_url': rec.get('course_url'), 'matching_score': rec.get('original_matching_score')
            }
    jobs = {}
    for row in roles.to_dict('records'):
        raw = str(row['role_family']).strip()
        specialization = str(row.get('specialization') or 'Unspecified').strip()
        key = (raw.casefold(), specialization.casefold())
        display = clean_title(raw)
        group_key = (display.casefold(), specialization.casefold())
        job = jobs.setdefault(group_key, {'job_title':display, 'specialization':specialization,
                                         'original_job_titles':set(), 'skills':{}})
        job['original_job_titles'].add(raw)
        skey = normalized_skill(row['skill'])
        if not skey: continue
        entry = job['skills'].setdefault(skey, {'skill':title_case(skey), 'job_count':None,
                                               'role_job_count':None, 'skill_frequency_percentage':None,
                                               'courses':{}})
        count = clean_number(row.get('job_count'))
        if entry['job_count'] is None or (count is not None and count > entry['job_count']):
            entry['job_count'] = count
            entry['role_job_count'] = clean_number(row.get('role_job_count'))
            entry['skill_frequency_percentage'] = clean_number(row.get('skill_frequency_percentage'))
        entry['courses'].update(courses.get((key,skey), {}))
    output_jobs = []
    for job in jobs.values():
        skills = []
        for entry in job['skills'].values():
            entry['courses'] = sorted(entry['courses'].values(), key=lambda c: -(c['matching_score'] or 0))
            skills.append(entry)
        skills.sort(key=lambda s: (-(s['skill_frequency_percentage'] or 0), s['skill']))
        output_jobs.append({'job_title':job['job_title'], 'specialization':job['specialization'],
                            'original_job_titles':sorted(job['original_job_titles']), 'skills':skills})
    output_jobs.sort(key=lambda j:(j['job_title'].casefold(),j['specialization'].casefold()))
    result = {'dataset':'CareerLens AI full Role-Skill + Course URLs',
              'note':'Skills originate from job posting role-skill data. Some have no matched courses. Frequency reflects observed postings, not a universal mandatory-skill requirement. Scores are not percentages.',
              'job_count':len(output_jobs), 'jobs':output_jobs}
    OUTPUT.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Saved {OUTPUT}: {len(output_jobs):,} jobs, {sum(len(j["skills"]) for j in output_jobs):,} job-skill links')

if __name__ == '__main__': main()
