# CareerLens AI: conservative cross-industry role-family and skill pipeline.
from pathlib import Path
from collections import Counter, defaultdict
import json
import re
import pandas as pd

BASE = Path(__file__).resolve().parent
INPUT = BASE / 'data' / 'processed' / 'linkedin_jobs_combined.parquet'
OUT = BASE / 'data' / 'processed' / 'v2'
OUT.mkdir(parents=True, exist_ok=True)
MIN_ROLE_JOBS, MIN_SKILL_JOBS, MIN_SKILL_SHARE = 20, 5, 0.05
MAX_SKILL_LENGTH, MAX_SKILLS_PER_JOB, TOP_SKILLS = 80, 100, 25
SPACES = re.compile(r'\s+')
ALIASES = {'communication skills':'communication','problemsolving':'problem solving',
           'problem-solving':'problem solving','ms excel':'microsoft excel',
           'excel':'microsoft excel','ms office':'microsoft office',
           'microsoft office suite':'microsoft office','powerbi':'power bi',
           'python programming':'python','sql programming':'sql'}
BAD_SKILL = re.compile(r'(?:https?://|www\.|@|\b(?:equal opportunity employer|apply now|job description|benefits package|salary range|high school diploma|bachelor.s degree|master.s degree)\b)', re.I)

# Priority matters: more specific families before broader ones.
ROLE_RULES = [
 ('nurse practitioner',r'\bnurse practitioner\b'),
 ('registered nurse',r'\b(?:registered nurse|rn)\b'),
 ('pharmacist',r'\bpharmacist\b'),
 ('physical therapist',r'\bphysical therapist\b'),
 ('medical assistant',r'\bmedical assistant\b'),
 ('machine learning engineer',r'\bmachine learning engineer\b'),
 ('data scientist',r'\bdata scientist\b'),
 ('data engineer',r'\bdata engineer\b'),
 ('data analyst',r'\bdata analyst\b'),
 ('business analyst',r'\bbusiness analyst\b'),
 ('cybersecurity analyst',r'\b(?:cybersecurity analyst|cyber security analyst|security operations analyst|information security analyst)\b'),
 ('software engineer',r'\b(?:software engineer|software developer)\b'),
 ('web developer',r'\b(?:web developer|frontend developer|front end developer|backend developer|back end developer|full stack developer)\b'),
 ('network engineer',r'\bnetwork engineer\b'),
 ('systems administrator',r'\b(?:systems? administrator|sysadmin)\b'),
 ('financial analyst',r'\bfinancial analyst\b'),
 ('accountant',r'\baccountant\b'),
 ('auditor',r'\bauditor\b'),
 ('tax professional',r'\b(?:tax professional|tax preparer)\b'),
 ('digital marketing specialist',r'\b(?:digital marketing specialist|digital marketing executive|digital marketing coordinator|digital marketer)\b'),
 ('marketing specialist',r'\b(?:marketing specialist|marketing coordinator|marketing executive)\b'),
 ('marketing manager',r'\bmarketing manager\b'),
 ('human resources specialist',r'\b(?:human resources specialist|hr specialist|human resource specialist|human resources generalist|hr generalist)\b'),
 ('recruiter',r'\b(?:recruiter|talent acquisition specialist)\b'),
 ('supply chain analyst',r'\bsupply chain analyst\b'),
 ('logistics coordinator',r'\blogistics coordinator\b'),
 ('warehouse associate',r'\bwarehouse associate\b'),
 ('mechanical engineer',r'\bmechanical engineer\b'),
 ('electrical engineer',r'\belectrical engineer\b'),
 ('civil engineer',r'\bcivil engineer\b'),
 ('quality assurance analyst',r'\b(?:quality assurance analyst|qa analyst)\b'),
 ('project manager',r'\bproject manager\b'),
 ('product manager',r'\bproduct manager\b'),
 ('operations manager',r'\boperations manager\b'),
 ('restaurant manager',r'\brestaurant manager\b'),
 ('store manager',r'\bstore manager\b'),
 ('sales representative',r'\b(?:sales representative|sales associate)\b'),
 ('account executive',r'\baccount executive\b'),
 ('customer service representative',r'\bcustomer service representative\b'),
 ('administrative assistant',r'\badministrative assistant\b'),
 ('executive assistant',r'\bexecutive assistant\b'),
 ('graphic designer',r'\bgraphic designer\b'),
 ('ux designer',r'\b(?:ux designer|user experience designer)\b'),
 ('teacher',r'\bteacher\b'),
]
COMPILED = [(name,re.compile(p)) for name,p in ROLE_RULES]
# Domain evidence is checked on title only. Unknown remains unknown.
DOMAIN_RULES = [
 ('Digital Marketing',r'\b(?:digital marketing|seo|sem|paid search|social media marketing|performance marketing|ppc)\b'),
 ('Advertising Operations',r'\b(?:ad operations|advertising operations|ad ops)\b'),
 ('Construction',r'\b(?:construction|building construction|general contractor)\b'),
 ('Information Technology',r'\b(?:information technology|it project|software|cloud|cybersecurity|network infrastructure|devops)\b'),
 ('Healthcare',r'\b(?:healthcare|hospital|clinical|medical|nursing)\b'),
 ('Finance',r'\b(?:finance|financial|banking|investment|underwriting)\b'),
 ('Retail',r'\b(?:retail|store|shop|merchandising)\b'),
 ('Supply Chain & Logistics',r'\b(?:supply chain|logistics|warehouse|distribution center|transportation)\b'),
 ('Manufacturing',r'\b(?:manufacturing|production|factory|plant operations)\b'),
 ('Education',r'\b(?:school|classroom|curriculum|kindergarten|elementary|secondary|preschool|tuition)\b'),
 ('Fitness & Wellness',r'\b(?:pilates|yoga|fitness|gym|personal training)\b'),
 ('Mechanical Design',r'\b(?:mechanical design|cad design|solidworks)\b'),
 ('Human Resources',r'\b(?:human resources|hr specialist|hr generalist|people operations)\b'),
]
DOMAINS = [(name,re.compile(p)) for name,p in DOMAIN_RULES]
SENIORITY = re.compile(r'\b(?:junior|jr|senior|sr|lead|principal|staff|entry level|intern|trainee|i|ii|iii|iv|v)\b')


def clean_title(value):
    if pd.isna(value): return ''
    s = str(value).casefold().replace('&',' and ')
    s = re.sub(r'[^\w\s+#./-]',' ',s)
    s = re.sub(r'[_/.-]+',' ',s)
    return SPACES.sub(' ',s).strip()


def classify(title):
    if not title: return ('','Unknown','missing',False)
    matches = [name for name,rx in COMPILED if rx.search(title)]
    if not matches:
        family, method = title, 'exact_title_fallback'
    elif len(matches) == 1:
        family, method = matches[0], 'rule'
    else:
        # Don't force ambiguous titles into one occupation.
        family, method = title, 'ambiguous_fallback'
    domains = [name for name,rx in DOMAINS if rx.search(title)]
    if len(domains) == 1:
        domain = domains[0]
    elif len(domains) > 1:
        domain = 'Multiple Domains'
    else:
        domain = 'Unspecified'
    if family == 'digital marketing specialist' and domain == 'Unspecified':
        domain = 'Digital Marketing'
    if family == 'human resources specialist' and domain == 'Unspecified':
        domain = 'Human Resources'
    return (family,domain,method,bool(SENIORITY.search(title)))


def clean_skill(raw):
    s = SPACES.sub(' ',raw.casefold().strip()).strip(' .;:-')
    return ALIASES.get(s,s)


def valid_skill(s):
    return bool(s) and len(s) <= MAX_SKILL_LENGTH and bool(re.search('[a-zA-Z]',s)) and not BAD_SKILL.search(s)


def main():
    if not INPUT.exists(): raise FileNotFoundError(f'Missing {INPUT}')
    print('Loading original LinkedIn combined parquet...')
    df = pd.read_parquet(INPUT,columns=['job_link','job_title','job_skills'])
    if df.job_link.isna().any() or df.job_link.duplicated().any():
        raise ValueError('Invalid job_link primary key')
    df['normalized_title'] = df.job_title.map(clean_title)
    counts = df.normalized_title.value_counts()
    lookup = {t:classify(t) for t in counts.index}
    title_audit = pd.DataFrame([
        {'normalized_title':t,'postings':int(n),'role_family':lookup[t][0],
         'specialization':lookup[t][1],'mapping_method':lookup[t][2],
         'seniority_mentioned':lookup[t][3]} for t,n in counts.items()
    ])
    title_audit.to_parquet(OUT/'title_classification_audit_v2.parquet',index=False)
    title_audit.head(2000).to_csv(OUT/'top_titles_classification_v2.csv',index=False)
    # Targeted audit for missing marketing and HR families.
    target = title_audit[title_audit.normalized_title.str.contains(
        r'\b(?:marketing|human resources|hr specialist|hr generalist|talent acquisition)\b',regex=True)]
    target.head(1000).to_csv(OUT/'marketing_hr_title_audit_v2.csv',index=False)

    role_counts, pair_counts, samples, rejected = Counter(),Counter(),defaultdict(list),Counter()
    print(f'Classified {len(counts):,} unique titles. Aggregating {len(df):,} postings...')
    for i, row in enumerate(df.itertuples(index=False),1):
        if i % 200000 == 0: print(f'  Processed {i:,}/{len(df):,}')
        title = row.normalized_title
        family, domain, method, seniority = lookup[title]
        if not family or pd.isna(row.job_skills) or not str(row.job_skills).strip():
            continue
        parts = str(row.job_skills).split(',')
        if len(parts)>MAX_SKILLS_PER_JOB:
            rejected['too_many_segments'] += 1
            continue
        cleaned = set()
        for part in parts:
            skill = clean_skill(part)
            if valid_skill(skill): cleaned.add(skill)
            elif skill: rejected['invalid_skill_mentions'] += 1
        if not cleaned: continue
        key=(family,domain)
        role_counts[key]+=1
        if len(samples[key])<4 and title not in samples[key]: samples[key].append(title)
        for skill in cleaned: pair_counts[(family,domain,skill)]+=1
    print('Building outputs...')
    roles = pd.DataFrame([
        {'role_family':f,'specialization':d,'usable_job_postings':n,
         'eligible_for_recommendations':n>=MIN_ROLE_JOBS,'sample_titles':' | '.join(samples[(f,d)])}
        for (f,d),n in role_counts.items()])
    roles.sort_values('usable_job_postings',ascending=False,inplace=True)
    roles.to_parquet(OUT/'role_specialization_summary_v2.parquet',index=False)
    roles.head(500).to_csv(OUT/'top_role_specializations_v2.csv',index=False)
    pairs = pd.DataFrame([
        {'role_family':f,'specialization':d,'skill':s,'job_count':c,
         'role_job_count':role_counts[(f,d)],
         'skill_frequency_percentage':round(100*c/role_counts[(f,d)],2),
         'passes_threshold':role_counts[(f,d)]>=MIN_ROLE_JOBS and c>=MIN_SKILL_JOBS
             and c/role_counts[(f,d)]>=MIN_SKILL_SHARE}
        for (f,d,s),c in pair_counts.items()])
    pairs.sort_values(['role_family','specialization','job_count'],ascending=[True,True,False],inplace=True)
    pairs.to_parquet(OUT/'role_skill_all_v2.parquet',index=False)
    filtered=pairs[pairs.passes_threshold].copy()
    filtered.to_parquet(OUT/'role_skill_filtered_v2.parquet',index=False)
    method_summary=title_audit.groupby('mapping_method').postings.sum().sort_values(ascending=False)
    method_summary.rename('postings').to_csv(OUT/'mapping_method_summary_v2.csv')
    json_roles=[]
    for (family,domain),group in filtered.groupby(['role_family','specialization'],sort=True):
        n=role_counts[(family,domain)]
        json_roles.append({
            'role_id':'linkedin_v2_'+re.sub('[^a-z0-9]+','_',family+'_'+domain.casefold()).strip('_'),
            'role_title':family.title(), 'role_family':family,'specialization':domain,
            'job_posting_sample_size':n,
            'required_skills':[{'skill':r.skill,'job_count':int(r.job_count),
                                'frequency_pct':float(r.skill_frequency_percentage)}
                               for r in group.head(TOP_SKILLS).itertuples(index=False)],
            'source':{'name':'LinkedIn Jobs & Skills (2024)',
                      'basis':'historical sample; not a forecast',
                      'first_seen_range':'2024-01-12 to 2024-01-17'},
            'status':'candidate_requires_review'
        })
    (OUT/'future_roles_candidates_v2.json').write_text(
        json.dumps(json_roles,ensure_ascii=False,indent=2),encoding='utf-8')
    print('\n'+'='*65+'\nROLE FAMILY + SPECIALIZATION V2 SUMMARY\n'+'='*65)
    print(f'Original postings: {len(df):,}')
    print(f'Unique normalized titles: {len(counts):,}')
    print(f'Role-specialization groups with skills: {len(roles):,}')
    print(f'Filtered role-skill rows: {len(filtered):,}')
    print(f'JSON candidate entries: {len(json_roles):,}')
    print('\nMapping methods (all original postings):\n'+method_summary.to_string())
    print('\nSkill rejection audit:',dict(rejected))
    print('\nTop 15 role-specialization groups:\n'+roles.head(15).to_string(index=False))
    print('\nMarketing/HR titles in audit:',len(target))
    for name in ['digital marketing specialist','marketing specialist','human resources specialist','project manager','teacher']:
        subset=roles[roles.role_family==name].head(10)
        print(f'\n{name}:\n'+(subset.to_string(index=False) if len(subset) else 'Not found'))
    print('\nFiles saved:',OUT)
    print('Final future_roles.json and verified_courses.json were NOT changed.')
    print('COMPLETED!')

if __name__=='__main__': main()
