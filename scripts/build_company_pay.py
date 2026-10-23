"""Build advertised pay summaries, preserving original currency and pay period."""
import csv,io,json,re,unicodedata,zipfile,argparse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def key(s):return ' '.join(unicodedata.normalize('NFKC',s).casefold().split())
def build(path):
 rows=json.loads((ROOT/'data/processed/companies_base.json').read_text(encoding='utf-8'))
 lookup={key(r['company_name']):r['company_id'] for r in rows}
 companies={};seen=set();monthly=re.compile(r'^RM\s*([\d,]+(?:\.\d+)?)\s*[–—-]\s*RM\s*([\d,]+(?:\.\d+)?)\s+per month$',re.I)
 with zipfile.ZipFile(path) as z:
  with io.TextIOWrapper(z.open('jobstreet_all_job_dataset.csv'),encoding='utf-8-sig',newline='') as f:
   for row in csv.DictReader(f):
    company_id=lookup.get(key(row['company']))
    if not company_id:continue
    jid=row['job_id'].strip()
    if jid and jid in seen:continue
    if jid:seen.add(jid)
    company=companies.setdefault(company_id,{'total_roles':0,'salary_rows':[],'monthly_range':None})
    company['total_roles']+=1
    pay=' '.join(row['salary'].split())
    if not pay:continue
    company['salary_rows'].append({'title':row['job_title'],'salary':pay,'location':row['location'],'date':row['listingDate'][:10]})
    match=monthly.fullmatch(pay)
    if match:
     low,high=[float(v.replace(',','')) for v in match.groups()]
     if 0<=low<=high:
      summary=company['monthly_range']
      company['monthly_range']={'min':min(low,summary['min']) if summary else low,'max':max(high,summary['max']) if summary else high,'count':(summary['count'] if summary else 0)+1}
 for c in companies.values():c['salary_rows'].sort(key=lambda r:r['date'],reverse=True)
 out=ROOT/'src/static/data/company-pay.json';out.write_text(json.dumps(companies,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 print('Companies:',len(companies),'Advertised salaries:',sum(len(c['salary_rows']) for c in companies.values()),'Bytes:',out.stat().st_size)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);build(p.parse_args().source)
