#build a conservative role-to-course recommendation table for review and verification
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlparse, unquote
import pandas as pd

BASE = Path(__file__).resolve().parent
DEFAULT_INPUT = BASE / 'data/processed/course_matching/role_course_matches_top15_review.csv'
FALLBACK_INPUT = BASE / 'role_course_matches_top15_review.csv'
OUTPUT = BASE / 'data/course_recommendations.json'

# General transferable skills must be explicitly taught in the course title
# (or its URL topic), not merely mentioned among dataset skill tags.
GENERAL = {'communication','communications','teamwork','collaboration','leadership',
           'management','problem solving','critical thinking','creativity',
           'research','teaching','training','decision making','decisiveness',
           'customer service','time management','attention to detail','organization',
           'organizational skills','interpersonal skills','adaptability','sales',
           'presentation','presentations','negotiation','writing','planning'}

# Explicitly curated *topic equivalents*, not arbitrary skill-to-course assertions.
TOPICS = {
 'python': ['python'], 'r programming language':['r programming','r basics','r language'],
 'r (programming language)':['r programming','r basics','r language'],
 'sql':['sql','database queries'], 'power bi':['power bi','powerbi'],
 'microsoft excel':['excel','spreadsheets'], 'excel':['excel','spreadsheets'],
 'data analysis':['data analysis','analyzing data','analyse data','analytics','data science','data literacy','statistical learning'],
 'data visualization':['data visualization','visualizing data','dashboards','data science','power bi','tableau'],
 'machine learning':['machine learning','data science','statistical learning','artificial intelligence'],
 'data science':['data science','machine learning','statistical learning'],
 'cybersecurity':['cybersecurity','cyber security','information security'],
 'information security':['information security','cybersecurity','cyber security'],
 'project management':['project management','project planning','agile projects','agile project'],
 'accounting':['accounting','bookkeeping','financial statements'],
 'financial analysis':['financial analysis','corporate finance','financial modeling','finance'],
 'financial reporting':['financial reporting','financial statements','accounting'],
 'digital marketing':['digital marketing','social media marketing','seo','online marketing'],
 'marketing':['marketing'], 'social media':['social media'],
 'human resources':['human resources','human resource','hr management'],
 'recruitment':['recruitment','recruiting','talent acquisition'],
 'supply chain':['supply chain','logistics'], 'logistics':['logistics','supply chain'],
 'food safety':['food safety','food hygiene'],
 'patient care':['patient care','nursing care','clinical care'],
 'nursing':['nursing'], 'healthcare':['healthcare','health care'],
 'software engineering':['software engineering','software development','computer science'],
 'programming':['programming','computer science','coding'],
 'javascript':['javascript'], 'java':['java programming','java language'],
 'cloud computing':['cloud computing','cloud'],
 'business intelligence':['business intelligence','power bi','data analytics'],
 'statistics':['statistics','statistical learning','statistical analysis'],
 'communication':['communication','communicating'],
 'communications':['communication','communicating'],
 'teamwork':['teamwork','working in teams','team collaboration','collaborative teams'],
 'collaboration':['collaboration','collaborative','working in teams'],
 'leadership':['leadership','leading teams','lead teams'],
 'management':['management','managing'],
 'problem solving':['problem solving'],
 'critical thinking':['critical thinking'],
 'customer service':['customer service','customer experience'],
 'sales':['sales','selling','e commerce'],
 'teaching':['teaching','pedagogy','instructional design'],
 'training':['training','learning and development'],
 'research':['research methods','research methodology'],
 'time management':['time management','productivity'],
 'writing':['writing'], 'negotiation':['negotiation'],
 'presentation':['presentation','public speaking'],
}

def normalize(s):
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii','ignore').decode('ascii').lower()
    s = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', s)
    return re.sub(r'[^a-z0-9+#]+',' ',s).strip()

def phrase_in(text, phrase):
    return bool(re.search(r'(?<![a-z0-9])' + re.escape(normalize(phrase)) + r'(?![a-z0-9])', text))

def relevant_skills(row):
    title = normalize(row.course_title)
    path = unquote(urlparse(str(row.course_url)).path).replace('-', ' ')
    topic_text = normalize(title + ' ' + path)
    raw = [x.strip() for x in str(row.matched_skills).split(',') if x.strip()]
    hits=[]
    for skill in raw:
        s=normalize(skill)
        phrases=TOPICS.get(s, [s])
        # Keep matches explainable: a course must explicitly indicate the skill/topic.
        if any(phrase_in(topic_text, p) for p in phrases):
            hits.append(skill)
    return hits

def official_url(url):
    try:
        p=urlparse(str(url))
        return p.scheme=='https' and p.hostname in {'www.edx.org','edx.org'} and p.path.startswith('/learn/')
    except ValueError:
        return False

def check_url(url):
    try:
        import requests
        r=requests.get(url,timeout=12,allow_redirects=True,headers={'User-Agent':'Mozilla/5.0 CareerLensCourseCheck/1.0'},stream=True)
        status=r.status_code
        final=urlparse(r.url)
        r.close()
        if status in (404,410): return 'not_found'
        if 200<=status<400 and final.hostname in {'edx.org','www.edx.org'} and final.path.startswith('/learn/'):
            return 'reachable_course_path'
        if status in (401,403,429) or status>=500: return 'inconclusive'
        return 'inconclusive'
    except Exception:
        return 'inconclusive'

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--input',type=Path,default=DEFAULT_INPUT if DEFAULT_INPUT.exists() else FALLBACK_INPUT)
    parser.add_argument('--output',type=Path,default=OUTPUT)
    parser.add_argument('--check-live',action='store_true',help='Test each distinct URL over network (can be slow or blocked)')
    args=parser.parse_args()
    df=pd.read_csv(args.input).fillna({'matched_skills':'','course_url':''})
    needed={'role_family','specialization','course_id','course_title','provider','matched_skills','matching_score','course_url'}
    missing=needed-set(df.columns)
    if missing: raise ValueError(f'Missing columns: {sorted(missing)}')
    df=df[df.course_url.map(official_url)].copy()
    df['supported_skills']=df.apply(relevant_skills,axis=1)
    df=df[df.supported_skills.map(bool)].copy()
    df['supported_skill_count']=df.supported_skills.map(len)
    df['original_score']=pd.to_numeric(df.matching_score,errors='coerce').fillna(0)
    df=df.sort_values(['role_family','specialization','supported_skill_count','original_score'],ascending=[True,True,False,False])
    df=df.drop_duplicates(['role_family','specialization','course_url'])
    # Existing CSV is already top-15 per role; do not add arbitrary global course limit.
    statuses={u:'not_live_checked' for u in df.course_url.unique()}
    if args.check_live:
        print(f'Checking {len(statuses):,} distinct course URLs (network may be blocked)...',flush=True)
        with ThreadPoolExecutor(max_workers=6) as pool:
            futures={pool.submit(check_url,u):u for u in statuses}
            for f in as_completed(futures): statuses[futures[f]]=f.result()
        df=df[df.course_url.map(lambda u:statuses[u]!='not_found')].copy()
    recommendations=[]
    for r in df.itertuples(index=False):
        recommendations.append({
            'role_family':str(r.role_family),
            'specialization':str(r.specialization),
            'course_id':str(r.course_id),
            'course_title':str(r.course_title),
            'provider':str(r.provider),
            'course_url':str(r.course_url),
            'supported_matched_skills':r.supported_skills,
            'supported_skill_count':int(r.supported_skill_count),
            'original_matching_score':round(float(r.original_score),2),
            'official_domain_and_path_valid':True,
            'live_url_status':statuses[r.course_url],
            'relevance_method':'conservative_course_title_or_url_topic_match',
        })
    payload={
        'dataset':'CareerLens AI role-to-course recommendations',
        'source_file':args.input.name,
        'method_note':'Course topics are screened against matched skills using explicit keyword/alias rules. This is heuristic relevance, not full syllabus verification. Original scores are NOT percentages. Live checks test reachability only.',
        'record_count':len(recommendations),
        'unique_course_count':len({r['course_url'] for r in recommendations}),
        'live_check_performed':args.check_live,
        'recommendations':recommendations,
    }
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Original matches: {len(pd.read_csv(args.input)):,}')
    print(f'Relevance-filtered matches: {len(recommendations):,}')
    print(f'Unique courses retained: {payload["unique_course_count"]:,}')
    print(f'Live link checks performed: {args.check_live}')
    print(f'Saved: {args.output}')

if __name__=='__main__': main()
