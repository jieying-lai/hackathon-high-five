"""Dashboard contracts: authorization, explainability, and benchmark semantics."""
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from ai_matcher import load_json, match_user_to_roles
from trend_signals import get_trend_radar


class DashboardContracts(unittest.TestCase):
    def test_score_components_reconcile_in_both_scenarios(self):
        for profile in load_json('sample_cvs.json'):
            for scenario in ('moderate', 'fast'):
                result = match_user_to_roles(profile, scenario)
                for role in result['recommended_roles']:
                    b = role['explainable_breakdown']
                    self.assertEqual(role['match_score'], sum(b[k] for k in (
                        'core_skills_match_pct', 'transferable_skills_pct',
                        'industry_alignment_pct', 'work_mode_fit_pct', 'scenario_adjustment_pct')))

    def test_protected_attributes_do_not_change_scores(self):
        profile = load_json('sample_cvs.json')[0]
        other = {**profile, 'name': 'Other', 'age': 99, 'gender': 'other', 'ethnicity': 'other'}
        self.assertEqual(match_user_to_roles(profile)['recommended_roles'],
                         match_user_to_roles(other)['recommended_roles'])

    def test_scenario_changes_trend(self):
        with patch('trend_signals.fetch_live_arxiv_signal', return_value={'live_status':'TEST'}):
            moderate, fast = get_trend_radar('moderate'), get_trend_radar('fast')
        self.assertGreater(fast['emerging_skills'][0]['growth_pct'], moderate['emerging_skills'][0]['growth_pct'])

    def test_pathways_only_use_catalog(self):
        catalog = load_json('verified_courses.json')
        for role in match_user_to_roles(load_json('sample_cvs.json')[0])['recommended_roles']:
            self.assertEqual(role['estimated_total_hours'], sum(s['hours'] for s in role['ordered_pathway']))
            for step in role['ordered_pathway']:
                self.assertEqual(step['url'], catalog[step['target_skill']]['url'])


class PortalAuthorization(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import auth_db
        cls.temp = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[1] / 'work')
        cls.previous_path = auth_db.DB_PATH
        auth_db.DB_PATH = str(Path(cls.temp.name) / 'test.db')
        import main
        auth_db.init_db()
        main.hr_engine.init_hr_tables()
        cls.app = main.app

    @classmethod
    def tearDownClass(cls):
        import auth_db
        auth_db.DB_PATH = cls.previous_path
        cls.temp.cleanup()

    def test_anonymous_cannot_read_heatmap(self):
        self.assertEqual(self.app.test_client().get('/api/hr/heatmap').status_code, 401)

    def test_talent_cannot_read_hr_data(self):
        client = self.app.test_client()
        with client.session_transaction() as session:
            session['user'] = {'role':'job_seeker', 'unique_uid':'test'}
        self.assertEqual(client.get('/api/hr/heatmap').status_code, 403)

    def test_hr_cannot_read_talent_data(self):
        client = self.app.test_client()
        with client.session_transaction() as session:
            session['user'] = {'role':'hr_company', 'unique_uid':'test'}
        self.assertEqual(client.get('/api/personas').status_code, 403)

    def test_interview_claim_reply_and_owner_isolation(self):
        hr = self.app.test_client()
        with hr.session_transaction() as session:
            session['user'] = {'role':'hr_company','unique_uid':'hr-invite','full_name':'HR'}
        payload = {'candidate_id':'CL-JS-2026-1042','role':'Auditor','time':'2026-12-01T10:00','location':'Office','message':'Hello'}
        sent = hr.post('/api/hr/interviews',json=payload)
        self.assertEqual(sent.status_code,200)
        self.assertEqual(hr.post('/api/hr/interviews',json=payload).status_code,400)
        self.assertNotIn('claim_code',sent.json)
        talent = self.app.test_client()
        with talent.session_transaction() as session:
            session['user'] = {'role':'job_seeker','unique_uid':'CL-JS-2026-1042'}
        invite = talent.get('/api/talent/interviews').json['invitations'][0]
        other = self.app.test_client()
        with other.session_transaction() as session:
            session['user'] = {'role':'job_seeker','unique_uid':'other-person'}
        self.assertEqual(other.post(f"/api/talent/interviews/{invite['id']}/reply",json={'status':'Accepted'}).status_code,400)
        self.assertEqual(talent.post(f"/api/talent/interviews/{invite['id']}/reply",json={'status':'Accepted'}).status_code,200)
        self.assertEqual(hr.get('/api/hr/interviews').json['invitations'][0]['status'],'Accepted')
        intruder = self.app.test_client()
        with intruder.session_transaction() as session:
            session['user'] = {'role':'hr_company','unique_uid':'intruder'}
        self.assertEqual(intruder.post(f"/api/hr/interviews/{invite['id']}/cancel",json={}).status_code,404)
        self.assertEqual(hr.post(f"/api/hr/interviews/{invite['id']}/cancel",json={}).status_code,200)
        self.assertEqual(talent.get('/api/talent/interviews').json['invitations'],[])
        self.assertEqual(hr.get('/api/hr/interviews').json['invitations'],[])
        self.assertEqual(hr.post('/api/hr/interviews',json=payload).status_code,200)
        self.assertEqual(talent.post(f"/api/talent/interviews/{invite['id']}/reply",json={'status':'Accepted'}).status_code,400)

        with hr.session_transaction() as session:
            session['user']['unique_uid']='other-hr'
            session.modified=True
        self.assertEqual(hr.get('/api/hr/interviews').json['invitations'],[])
        self.assertEqual(hr.post(f"/api/hr/interviews/{invite['id']}/cancel",json={}).status_code,404)

    def test_heatmap_contract(self):
        client = self.app.test_client()
        with client.session_transaction() as session:
            session['user'] = {'role':'hr_company', 'unique_uid':'test'}
        response = client.get('/api/hr/heatmap')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json['employees'], list)
        self.assertTrue(response.json['skills'])


if __name__ == '__main__':
    unittest.main()

