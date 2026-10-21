import sys, unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'src'))
from main import app
from ai_matcher import match_user_to_roles
from trend_signals import get_trend_radar
META={'source_name':'Test source','last_updated':'Test date','live_status':'CACHED_FALLBACK','recent_signals':[]}
class ScenarioBoundsTests(unittest.TestCase):
 def setUp(self):
  self.client=app.test_client()
  with self.client.session_transaction() as session:
   session['user']={'role':'job_seeker','unique_uid':'SCENARIO-TEST'}
   session['csrf_token']='scenario-test'
 @patch('cv_engine.get_anonymized_cv_statistics',return_value={})
 @patch('trend_signals.fetch_live_arxiv_signal',return_value=META)
 def test_paired_trends_share_one_signal_fetch(self,fetch,stats):
  response=self.client.get('/api/trends?scenario=moderate&bounds=1')
  self.assertEqual(response.status_code,200)
  endpoints=response.get_json()['scenario_endpoints']
  for mode in ['moderate','fast']:
   self.assertEqual(endpoints[mode]['emerging_skills'],get_trend_radar(mode,META)['emerging_skills'])
   self.assertEqual(endpoints[mode]['signal_metadata'],META)
  fetch.assert_called_once()
 def test_matching_endpoints_equal_existing_models(self):
  profile={'industry':'Finance & Accounting','skills':['Financial Auditing'],'work_mode_preference':'Hybrid'}
  response=self.client.post('/api/analyze',headers={'X-CSRF-Token':'scenario-test'},json={'profile':profile,'scenario_bounds':True})
  self.assertEqual(response.status_code,200)
  data=response.get_json()
  for mode in ['moderate','fast']:self.assertEqual(data['scenario_endpoints'][mode],match_user_to_roles(profile,mode))
  legacy=self.client.post('/api/analyze',headers={'X-CSRF-Token':'scenario-test'},json={'profile':profile,'scenario':'fast'}).get_json()
  self.assertNotIn('scenario_endpoints',legacy)
  self.assertEqual(legacy,data['scenario_endpoints']['fast'])
if __name__=='__main__':unittest.main()
