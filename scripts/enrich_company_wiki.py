"""Cache a curated Wikipedia/Wikidata pilot. Only reviewed mappings are published.
Run: .venv\\Scripts\\python.exe scripts/enrich_company_wiki.py
No paid API or additional Python package is needed.
"""
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request
import urllib.error
import sys

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'work/company_wiki_cache'
MAPPING = ROOT / 'data/processed/company_wiki_pilot_mapping.json'
OUTPUT = ROOT / 'src/static/data/company-wiki-profiles.json'
RATE_LIMITED = False
OFFLINE = '--offline' in sys.argv
USER_AGENT = 'CareerLensCompanyPilot/1.0 (local educational company directory; offline cache)'


def request_json(endpoint, params):
    global RATE_LIMITED
    CACHE.mkdir(parents=True, exist_ok=True)
    url = endpoint + '?' + urllib.parse.urlencode({**params, 'format': 'json', 'formatversion': 2})
    cache_file = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.json')
    if cache_file.exists():
        cached = json.loads(cache_file.read_text(encoding='utf-8'))
        return cached['data'], cached['fetched_at']
    if OFFLINE or RATE_LIMITED:
        raise RuntimeError('Not cached; retry on a later run' if OFFLINE else 'Deferred after Wikimedia rate limit')
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT, 'Accept': 'application/json'})
            with urllib.request.urlopen(req, timeout=30) as response:
                data = json.load(response)
            if 'error' in data:
                raise RuntimeError(str(data['error']))
            fetched_at = dt.datetime.now(dt.timezone.utc).isoformat()
            cache_file.write_text(json.dumps({'data': data, 'fetched_at': fetched_at}, ensure_ascii=False), encoding='utf-8')
            time.sleep(1)
            return data, fetched_at
        except urllib.error.HTTPError as error:
            if error.code in (429, 403):
                RATE_LIMITED = True
                raise RuntimeError('Wikimedia access limited; no further uncached requests this run') from error
            if attempt == 2:
                raise
            time.sleep(2 ** (attempt + 1))
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 ** (attempt + 1))


def claim_values(entity, prop):
    claims = entity.get('claims', {}).get(prop, [])
    current = [c for c in claims if c.get('rank') != 'deprecated' and 'P582' not in c.get('qualifiers', {})]
    preferred = [c for c in current if c.get('rank') == 'preferred']
    return [c['mainsnak']['datavalue']['value'] for c in (preferred or current)
            if 'datavalue' in c.get('mainsnak', {})]


def safe_url(value):
    return value if isinstance(value, str) and urllib.parse.urlsplit(value).scheme in ('http', 'https') else ''


def main():
    mappings = json.loads(MAPPING.read_text(encoding='utf-8'))
    companies = json.loads((ROOT / 'data/processed/companies_base.json').read_text(encoding='utf-8'))
    by_name = {r['company_name']: r for r in companies}
    results, published = [], {}
    for entry in mappings:
        name = entry['company_name']
        assert name in by_name, name
        try:
            data, fetched_at = request_json('https://en.wikipedia.org/w/api.php', {
                'action': 'query', 'prop': 'extracts|pageprops|info', 'exintro': 1,
                'explaintext': 1, 'inprop': 'url', 'redirects': 1, 'titles': entry['wikipedia_title']})
            page = data['query']['pages'][0]
            if page.get('missing') or 'disambiguation' in page.get('pageprops', {}):
                raise ValueError('Missing or ambiguous Wikipedia page')
            qid = page.get('pageprops', {}).get('wikibase_item')
            entity, labels = {}, {}
            if qid:
                wd, _ = request_json('https://www.wikidata.org/w/api.php', {
                    'action': 'wbgetentities', 'ids': qid, 'props': 'claims|labels|descriptions', 'languages': 'en'})
                entity = wd['entities'][qid]
                ids = sorted({v['id'] for prop in ['P159','P452'] for v in claim_values(entity, prop) if isinstance(v, dict) and 'id' in v})
                if ids:
                    linked, _ = request_json('https://www.wikidata.org/w/api.php', {
                        'action':'wbgetentities','ids':'|'.join(ids),'props':'labels','languages':'en'})
                    labels = {key: value.get('labels',{}).get('en',{}).get('value',key) for key,value in linked['entities'].items()}
            extract = page.get('extract','').strip()
            # Keep the first paragraph without rewriting or inventing company claims.
            description = extract.split('\n')[0]
            websites = list(dict.fromkeys(filter(None, (safe_url(v) for v in claim_values(entity,'P856')))))
            profile = {
                'company_name':name, 'article_title':page['title'], 'scope':entry['scope'],
                'description':description, 'source_url':page['fullurl'],
                'revision_url':page['fullurl'] + '?oldid=' + str(page['lastrevid']),
                'history_url':page['fullurl'] + '?action=history',
                'checked_at':fetched_at[:10], 'fetched_at':fetched_at,
                'license':'CC BY-SA 4.0', 'license_url':'https://creativecommons.org/licenses/by-sa/4.0/',
                'attribution':'Wikipedia contributors', 'text_changes':'First paragraph excerpt; no rewriting.',
                'wikidata_url':f'https://www.wikidata.org/wiki/{qid}' if qid else '',
                'facts_license':'CC0', 'website_url':websites[0] if len(websites)==1 else '',
                'website_candidates':websites,
                'headquarters':[labels.get(v['id'],v['id']) for v in claim_values(entity,'P159') if isinstance(v,dict) and 'id' in v],
                'industries':[labels.get(v['id'],v['id']) for v in claim_values(entity,'P452') if isinstance(v,dict) and 'id' in v],
                'inception_years':sorted(set(v['time'][1:5] for v in claim_values(entity,'P571') if isinstance(v,dict) and v.get('precision',0)>=9 and re.match(r'^\+\d{4}-',v.get('time','')))),
            }
            results.append({**entry, 'status':'fetched', 'profile':profile})
            if entry.get('approved') and description:
                published[by_name[name]['company_id']] = profile
            print(name, '->', page['title'], '|', qid, '|', entity.get('descriptions',{}).get('en',{}).get('value',''), '|', websites, flush=True)
        except Exception as error:
            results.append({**entry,'status':'unavailable','error':str(error)})
            print(name, 'UNAVAILABLE:',error,flush=True)
    (ROOT / 'data/processed/company_wiki_pilot_report.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    # A network failure must not erase already published reviewed profiles.
    existing = json.loads(OUTPUT.read_text(encoding='utf-8')) if OUTPUT.exists() else {}
    for entry in mappings:
        if not entry.get('approved'):
            existing.pop(by_name[entry['company_name']]['company_id'],None)
    existing.update(published)
    OUTPUT.write_text(json.dumps(existing,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Published profiles:',len(existing))

if __name__ == '__main__':
    main()
