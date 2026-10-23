"""Read the supplied E/S disclosure workbooks into website JSON; originals unchanged."""
import argparse
from collections import defaultdict
import io
import json
from pathlib import Path
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NS = {'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def read_rows(content):
    with zipfile.ZipFile(io.BytesIO(content)) as book:
        strings=[]
        if 'xl/sharedStrings.xml' in book.namelist():
            strings=[''.join(t.text or '' for t in si.findall('.//m:t',NS)) for si in ET.fromstring(book.read('xl/sharedStrings.xml')).findall('m:si',NS)]
        sheet=ET.fromstring(book.read('xl/worksheets/sheet1.xml'))
        result=[]
        for row in sheet.findall('m:sheetData/m:row',NS):
            values={}
            for cell in row.findall('m:c',NS):
                value=cell.find('m:v',NS)
                text=value.text if value is not None else None
                if cell.get('t')=='s' and text is not None: text=strings[int(text)]
                elif cell.get('t')=='inlineStr': text=''.join(t.text or '' for t in cell.findall('.//m:t',NS))
                values[re.sub(r'\d','',cell.get('r'))]=text
            result.append(values)
        return result


def name_key(value):
    value=unicodedata.normalize('NFKC',value).casefold()
    value=re.sub(r'[^\w]+',' ',value)
    value=re.sub(r'\bberhad\b','bhd',value)
    return ' '.join(value.split())


def number(value):
    if value is None or str(value).strip()=='': return None
    return float(value)


def build(source):
    with zipfile.ZipFile(source) as archive:
        a_name=next(n for n in archive.namelist() if '/Table A_' in n)
        c_name=next(n for n in archive.namelist() if '/Table C_' in n)
        formula=read_rows(archive.read(a_name))
        raw=read_rows(archive.read(c_name))
    maxima={}
    for row in formula:
        if 'Environmental' in (row.get('A') or '') and row.get('D'): maxima['environment']=number(row['D'])
        if 'Social' in (row.get('A') or '') and row.get('D'): maxima['social']=number(row['D'])
    assert maxima=={'environment':101.0,'social':90.0}, maxima
    firms=defaultdict(list)
    for row in raw:
        if not re.fullmatch(r'\d{4}',str(row.get('E') or '')) or not row.get('C'): continue
        e,s=number(row.get('G')),number(row.get('Q'))
        assert e is None or 0<=e<=maxima['environment']
        assert s is None or 0<=s<=maxima['social']
        firms[row['C'].strip()].append({'year':int(row['E']),'environment':e,'social':s})
    lookup=defaultdict(list)
    for name in firms:
        years=[r['year'] for r in firms[name]]
        assert len(years)==len(set(years)),name
        lookup[name_key(name)].append(name)
    companies=json.loads((ROOT/'data/processed/companies_base.json').read_text(encoding='utf-8'))
    profiles={}; audit=[]
    for company in companies:
        names=lookup.get(name_key(company['company_name']),[])
        if len(names)!=1: continue
        name=names[0]
        history=sorted(firms[name],key=lambda r:r['year'])
        profiles[company['company_id']]={'company_name':company['company_name'],'reported_company_name':name,'history':history,'latest':history[-1],'maxima':maxima,'match_method':'Name, punctuation and Berhad/Bhd normalization only'}
        audit.append({'company_name':company['company_name'],'reported_company_name':name})
    years=sorted({r['year'] for rows in firms.values() for r in rows})
    payload={'metadata':{'title':'Environmental and Social Disclosures of Public Listed Companies in Malaysia: A Dataset','source_files':[a_name.rsplit('/',1)[-1],c_name.rsplit('/',1)[-1]],'years':years,'firm_count':len(firms),'record_count':sum(map(len,firms.values())),'maxima':maxima,'definition':'Historical disclosure scores based on GRI 300 and GRI 400. Governance is not measured.'},'profiles':profiles}
    (ROOT/'src/static/data/company-sustainability.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2,allow_nan=False),encoding='utf-8')
    (ROOT/'data/processed/company_sustainability_match_report.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'source_firms':len(firms),'source_records':sum(map(len,firms.values())),'years':years,'matched_company_profiles':len(profiles),'examples':audit[:12]},ensure_ascii=False))

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('source',type=Path)
    build(parser.parse_args().source)
